import '@lego/shared/icon/style.css'

import { computed, defineComponent, useAttrs, type HTMLAttributes, type PropType } from 'vue'
import {
  mergeIconStyle,
  quoteFontFamily,
  toCssSizeValue,
  useIconGlyph,
  type IconName,
  type IconProps,
  type IconStyleValue
} from '@lego/shared/icon'

export const Icon = defineComponent({
  name: 'Icon',
  inheritAttrs: false,
  props: {
    name: { type: String as PropType<IconName>, required: true },
    library: { type: String, default: '' },
    size: { type: [Number, String], default: 16 },
    color: { type: String, default: 'currentColor' },
    class: { type: [String, Array, Object] as PropType<unknown>, default: undefined },
    customClass: { type: [String, Array, Object] as PropType<unknown>, default: undefined },
    style: { type: [Object, String] as PropType<IconStyleValue>, default: undefined },
    ariaLabel: { type: String, default: '' },
    decorative: { type: Boolean, default: true }
  },
  setup(props: IconProps) {
    const attrs = useAttrs() as HTMLAttributes & { class?: unknown }
    const glyph = useIconGlyph(
      () => props.name,
      () => props.library
    )

    const rootStyle = computed(() =>
      mergeIconStyle(
        {
          width: toCssSizeValue(props.size),
          height: toCssSizeValue(props.size),
          color: props.color,
          fontSize: toCssSizeValue(props.size),
          fontFamily: glyph.ready.value ? quoteFontFamily(glyph.fontFamily.value) : undefined
        },
        props.style
      )
    )

    return () => {
      const { class: attrClass, ...rootAttrs } = attrs
      const ariaHidden = props.decorative && !props.ariaLabel ? 'true' : undefined

      return (
        <span
          {...rootAttrs}
          class={[
            'lego-icon',
            'lego-icon--font',
            'lego-icon--text',
            !glyph.ready.value && 'lego-icon--placeholder',
            props.class,
            props.customClass,
            attrClass
          ]}
          style={rootStyle.value}
          aria-hidden={ariaHidden}
          aria-label={props.ariaLabel || undefined}
        >
          {glyph.ready.value ? glyph.iconChar.value : ''}
        </span>
      )
    }
  }
})

export default Icon
export {
  ICON_LIBRARY_MAP,
  codeToChar,
  getLibraryMap,
  getLibraryMapRef,
  getLibraryUrl,
  parseIconName,
  registerLibraries,
  setIconConfigRequest,
  setIconFontFaceLoader,
  useDynamicIcons
} from '@lego/shared/icon'
export type {
  IconFontConfig,
  IconItem,
  IconLibraryInfo,
  IconLibraryMap,
  IconName,
  IconProps,
  UseDynamicIconsOptions,
  UseDynamicIconsReturn
} from '@lego/shared/icon'
