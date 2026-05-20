import type {PortableTextInputCompositorContextValue} from '../../core/form/inputs/PortableText/contexts/PortableTextInputCompositorContextValue'
import {createContext} from 'sanity/_createContext'

/**
 * Context for the bundle of Compositor-level props that userland
 * `defineBlockObject({render})` implementations need to construct
 * a Studio block-object rendering.
 *
 * @beta
 */
export const PortableTextInputCompositorContext =
  createContext<PortableTextInputCompositorContextValue | null>(
    'sanity/_singletons/context/portable-text-input-compositor',
    null,
  )
