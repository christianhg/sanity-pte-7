import {defineContainer} from '@portabletext/editor'
import {NodePlugin} from '@portabletext/editor/plugins'

/**
 * Structured lists plugin - rendering only for the v7 spike.
 *
 * Registers two containers:
 *   - 'list' renders as <ul>/<ol>, content array field 'items'
 *   - 'list-item' renders as <li>, content array field 'content'
 *
 * Images inside list-items render through Studio's default block-object
 * pipeline - clicking the image opens the standard Studio image dialog.
 *
 * No keyboard behaviors here yet (Tab/Enter/Backspace etc) - that's M1.
 */

const listItemContainer = defineContainer({
  type: 'list-item',
  arrayField: 'content',
  render: ({attributes, children}) => (
    <li {...attributes} style={{margin: '0.25em 0'}}>
      {children}
    </li>
  ),
})

const listContainer = defineContainer({
  type: 'list',
  arrayField: 'items',
  render: ({attributes, children, node}) => {
    const style = (node as {style?: string}).style ?? 'bullet'
    const Tag = style === 'number' ? 'ol' : 'ul'
    return (
      <Tag {...attributes} style={{paddingLeft: '1.5em', margin: '0.5em 0'}} data-style={style}>
        {children}
      </Tag>
    )
  },
  of: [listItemContainer],
})

export function StructuredListsPlugin() {
  return <NodePlugin nodes={[listContainer]} />
}
