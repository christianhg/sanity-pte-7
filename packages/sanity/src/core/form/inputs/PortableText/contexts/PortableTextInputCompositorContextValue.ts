import {type Path} from '@sanity/types'

import {
  type RenderAnnotationCallback,
  type RenderArrayOfObjectsItemCallback,
  type RenderBlockCallback,
  type RenderFieldCallback,
  type RenderInputCallback,
  type RenderPreviewCallback,
} from '../../../types'
import {
  type RenderBlockActionsCallback,
  type RenderCustomMarkers,
} from '../../../types/_transitional'

/**
 * Bundle of Compositor-level props that userland `defineBlockObject({render})`
 * implementations need to construct a Studio block-object rendering.
 *
 * Threaded through context so that `useStudioBlockObjectRender` (and
 * future sibling hooks) can read them without each call site needing
 * to manually plumb props.
 *
 * @beta
 */
export interface PortableTextInputCompositorContextValue {
  basePath: Path
  readOnly: boolean
  isFullscreen: boolean
  onItemClose: () => void
  onItemOpen: (path: Path) => void
  onItemRemove: (itemKey: string) => void
  onPathFocus: (path: Path) => void
  scrollElement: HTMLElement | null
  renderAnnotation?: RenderAnnotationCallback
  renderBlock?: RenderBlockCallback
  renderBlockActions?: RenderBlockActionsCallback
  renderCustomMarkers?: RenderCustomMarkers
  renderField: RenderFieldCallback
  renderInlineBlock?: RenderBlockCallback
  renderInput: RenderInputCallback
  renderItem: RenderArrayOfObjectsItemCallback
  renderPreview: RenderPreviewCallback
}
