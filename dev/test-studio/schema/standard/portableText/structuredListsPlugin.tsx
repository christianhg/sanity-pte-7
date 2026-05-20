import {defineBlockObject, defineContainer} from '@portabletext/editor'
import {NodePlugin} from '@portabletext/editor/plugins'
import {useStudioBlockObjectRender} from 'sanity'

/**
 * Structured lists plugin - rendering only for the v7 spike.
 *
 * Registers:
 *   - `list` container - renders as <ul>/<ol>, content lives in `items`
 *   - `list-item` container - renders as <li>, content lives in `content`
 *   - `image` block-object inside list-item - rendered through Studio's
 *     standard block-object affordance via `useStudioBlockObjectRender`,
 *     including click-to-open-dialog
 *
 * No keyboard behaviors here yet (Tab/Enter/Backspace etc) - that's M1.
 */
export function StructuredListsPlugin() {
  const renderStudioBlockObject = useStudioBlockObjectRender()

  const imageBlockObject = defineBlockObject({
    type: 'image',
    render: renderStudioBlockObject,
  })

  const listItemContainer = defineContainer({
    type: 'list-item',
    arrayField: 'content',
    render: ({attributes, children}) => (
      <li {...attributes} style={{margin: '0.25em 0'}}>
        {children}
      </li>
    ),
    of: [imageBlockObject],
  })

  const listContainer = defineContainer({
    type: 'list',
    arrayField: 'items',
    render: ({attributes, children, node}) => {
      const style = (node as {style?: string}).style ?? 'bullet'
      const Tag = style === 'number' ? 'ol' : 'ul'
      return (
        <Tag
          {...attributes}
          style={{paddingLeft: '1.5em', margin: '0.5em 0'}}
          data-style={style}
        >
          {children}
        </Tag>
      )
    },
    of: [listItemContainer],
  })

  return <NodePlugin nodes={[listContainer]} />
}
