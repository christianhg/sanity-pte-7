import {type EditorSelection} from '@portabletext/editor'
import {toPlainText} from '@portabletext/react'
import {
  isKeySegment,
  isPortableTextSpan,
  isPortableTextTextBlock,
  type PortableTextBlock,
} from '@sanity/types'

import {type CommentTextSelection} from '../../types'
import {COMMENT_INDICATORS} from './buildRangeDecorationSelectionsFromComments'

interface BuildSelectionFromFragmentProps {
  fragment: PortableTextBlock[]
  value: PortableTextBlock[]
  selection: EditorSelection
}

/**
 * Recursively find a text block by `_key` inside `value`, descending into
 * every array-valued field on each item (e.g. container fields like
 * `list.items`, `listItem.content`).
 */
function findTextBlockByKey(
  value: PortableTextBlock[],
  blockKey: string,
): PortableTextBlock | undefined {
  function visit(items: unknown[]): PortableTextBlock | undefined {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue
      const node = item as {_key?: string; [field: string]: unknown}
      if (typeof node._key !== 'string') continue
      if (node._key === blockKey && isPortableTextTextBlock(item)) {
        return item as PortableTextBlock
      }
      for (const fieldName of Object.keys(node)) {
        if (fieldName === '_key' || fieldName === '_type') continue
        const fieldValue = node[fieldName]
        if (!Array.isArray(fieldValue)) continue
        const found = visit(fieldValue)
        if (found) return found
      }
    }
    return undefined
  }
  return visit(value)
}

/**
 * Given a `EditorSelection` point path, return the `_key` of the enclosing
 * text block — i.e. the keyed segment immediately before the `'children'`
 * string segment. Returns `undefined` if no such segment exists (selection
 * not inside a text block's children).
 */
function getEnclosingTextBlockKey(path: ReadonlyArray<unknown>): string | undefined {
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i] === 'children' && i > 0) {
      const seg = path[i - 1]
      if (isKeySegment(seg)) return seg._key
    }
  }
  return undefined
}

/**
 * @internal
 */
export function buildTextSelectionFromFragment(
  props: BuildSelectionFromFragmentProps,
): CommentTextSelection {
  const {fragment, value, selection} = props
  if (!selection) {
    throw new Error('Selection is required')
  }
  const normalizedSelection: EditorSelection = selection.backward
    ? {backward: false, anchor: selection.focus, focus: selection.anchor}
    : selection
  const textSelection: CommentTextSelection = {
    type: 'text',
    value: fragment.map((fragmentBlock) => {
      const originalBlock = findTextBlockByKey(value, fragmentBlock._key)
      if (!isPortableTextTextBlock(originalBlock)) {
        return {
          _key: fragmentBlock._key,
          text: '',
        }
      }
      const anchorBlockKey = getEnclosingTextBlockKey(normalizedSelection.anchor.path)
      const focusBlockKey = getEnclosingTextBlockKey(normalizedSelection.focus.path)
      const fragmentBlockText = toPlainText([fragmentBlock])
      const fragmentStartSpan = isPortableTextTextBlock(fragmentBlock)
        ? fragmentBlock.children[0]
        : undefined
      const fragmentEndSpan = isPortableTextTextBlock(fragmentBlock)
        ? fragmentBlock.children[fragmentBlock.children.length - 1]
        : undefined
      let originalTextBeforeSelection = ''
      let startChildIndex = -1
      if (anchorBlockKey === originalBlock._key) {
        for (const child of originalBlock.children) {
          startChildIndex++
          if (child._key === fragmentStartSpan?._key) {
            originalTextBeforeSelection +=
              (isPortableTextSpan(child) &&
                child.text.slice(0, Math.max(0, normalizedSelection.anchor.offset))) ||
              ''
            break
          }
          originalTextBeforeSelection += child.text
        }
      }
      let originalTextAfterSelection = ''
      if (focusBlockKey === originalBlock._key) {
        for (const child of originalBlock.children.slice(startChildIndex).reverse()) {
          if (child._key === fragmentEndSpan?._key) {
            originalTextAfterSelection =
              ((isPortableTextSpan(child) &&
                child.text.slice(normalizedSelection.focus.offset, child.text.length)) ||
                '') + originalTextAfterSelection
            break
          }
          originalTextAfterSelection = child.text + originalTextAfterSelection
        }
      }
      return {
        _key: originalBlock._key,
        text: `${originalTextBeforeSelection}${COMMENT_INDICATORS[0]}${fragmentBlockText}${COMMENT_INDICATORS[1]}${originalTextAfterSelection}`,
      }
    }),
  }

  return textSelection
}
