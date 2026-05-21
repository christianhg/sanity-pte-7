import {defineBlockObject} from '@portabletext/editor'
import {type Path} from '@sanity/types'
import {useBoundaryElement} from '@sanity/ui'
import {type ReactElement, useCallback, useContext} from 'react'
import {PortableTextInputCompositorContext} from 'sanity/_singletons'

import {usePortableTextMemberSchemaTypes} from '../contexts/PortableTextMemberSchemaTypes'
import {BlockObject} from '../object/BlockObject'

/**
 * The shape of the `render` callback for `defineBlockObject`.
 * `@portabletext/editor@7` exposes `defineBlockObject` but not its render-props
 * type by name, so we derive it via `Parameters` inference.
 */
type BlockObjectRenderProps = Parameters<
  NonNullable<Parameters<typeof defineBlockObject>[0]['render']>
>[0]

/**
 * Returns a render function that produces a Studio-flavoured block-object
 * rendering for a PTE v7 `BlockObjectRenderProps`. Pass the returned function
 * to `defineBlockObject({render: ...})` to opt the registration into Studio's
 * preview + dialog editing affordances.
 *
 * Must be used inside a Sanity PortableText input (Compositor populates the
 * required context).
 *
 * @example
 * ```tsx
 * function MyContainerPlugin() {
 *   const renderStudioBlockObject = useStudioBlockObjectRender()
 *   return (
 *     <NodePlugin
 *       nodes={[
 *         defineContainer({
 *           type: 'list-item',
 *           arrayField: 'content',
 *           render: ({attributes, children}) => <li {...attributes}>{children}</li>,
 *           of: [defineBlockObject({type: 'image', render: renderStudioBlockObject})],
 *         }),
 *       ]}
 *     />
 *   )
 * }
 * ```
 *
 * @beta
 */
export function useStudioBlockObjectRender(): (props: BlockObjectRenderProps) => ReactElement {
  const ctx = useContext(PortableTextInputCompositorContext)
  if (!ctx) {
    throw new Error(
      'useStudioBlockObjectRender must be used inside a Sanity PortableText input',
    )
  }
  const schemaTypes = usePortableTextMemberSchemaTypes()
  const boundaryElement = useBoundaryElement().element

  return useCallback(
    (props: BlockObjectRenderProps): ReactElement => {
      const sanitySchemaType = schemaTypes.blockObjects.find(
        (type) => type.name === props.node._type,
      )
      if (!sanitySchemaType) {
        // Unknown type, defer to engine default.
        return props.renderDefault(props)
      }
      // PTE gives us the path INSIDE the input (relative to the input array).
      // Studio's BlockObject expects:
      //   `path`         = absolute path from the document root, AND
      //   `relativePath` = path relative to the PortableText input array.
      const relativePath: Path = props.path as Path
      const absolutePath: Path = ctx.basePath.concat(relativePath)

      return (
        <div {...(props.attributes as Record<string, unknown>)}>
          {/* Engine spacer (zero-width FEFF inside an absolutely-positioned
            * hidden node). Must live inside the editable DOM so slate can
            * map caret positions through the void object. The asymmetric
            * default-block-object renderer in PTE v7 puts this BEFORE the
            * visual; mirror that shape here. */}
          {props.children}
          <BlockObject
            floatingBoundary={boundaryElement}
            focused={props.focused}
            isFullscreen={ctx.isFullscreen}
            onItemClose={ctx.onItemClose}
            onItemOpen={ctx.onItemOpen}
            onItemRemove={ctx.onItemRemove}
            onPathFocus={ctx.onPathFocus}
            path={absolutePath}
            readOnly={props.readOnly || ctx.readOnly}
            referenceBoundary={ctx.scrollElement}
            relativePath={relativePath}
            renderAnnotation={ctx.renderAnnotation}
            renderBlock={ctx.renderBlock}
            renderBlockActions={ctx.renderBlockActions}
            renderCustomMarkers={ctx.renderCustomMarkers}
            renderField={ctx.renderField}
            renderInlineBlock={ctx.renderInlineBlock}
            renderInput={ctx.renderInput}
            renderItem={ctx.renderItem}
            renderPreview={ctx.renderPreview}
            schemaType={sanitySchemaType}
            selected={props.selected}
            setElementRef={() => {
              /* no-op: container-nested block objects don't participate in
               * Studio's element-ref tracking (used for scroll-into-view of
               * top-level blocks). Best-effort POC. */
            }}
            value={props.node}
          />
        </div>
      )
    },
    [boundaryElement, ctx, schemaTypes.blockObjects],
  )
}
