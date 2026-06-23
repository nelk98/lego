import '@lego/shared/icon/style.css'

import { Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { computed, defineComponent, useAttrs, type PropType } from 'vue'
import {
  mergeIconStyle,
  quoteFontFamily,
  setIconConfigRequest,
  setIconFontFaceLoader,
  toCssSizeValue,
  useIconGlyph,
  type IconFontConfig,
  type IconName,
  type IconProps,
  type IconStyleValue
} from '@lego/shared/icon'

function getTaroEnv(): string {
  return (
    (globalThis as typeof globalThis & { process?: { env?: { TARO_ENV?: string } } }).process?.env
      ?.TARO_ENV ?? ''
  )
}

setIconConfigRequest(async (url) => {
  const taroEnv = getTaroEnv()
  if ((!taroEnv || taroEnv === 'h5') && typeof fetch === 'function') {
    const response = await fetch(url)
    return response.ok ? response.json() : null
  }

  return (await Taro.request({ url })).data
})
setIconFontFaceLoader(async (config: IconFontConfig) => {
  const taroEnv = getTaroEnv()
  if (!taroEnv || taroEnv === 'h5') return false

  const url = config.font.urls.ttf || config.font.urls.woff || config.font.urls.woff2
  if (!url) return false

  await Taro.loadFontFace({
    family: config.font.family,
    source: `url("${url}")`,
    global: true
  })
  return true
})

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
    const attrs = useAttrs() as { class?: unknown }
    const isH5 = getTaroEnv() === 'h5'
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
          fontFamily: glyph.ready.value ? quoteFontFamily(glyph.fontFamily.value) : undefined,
          '--lego-icon-content': !isH5 && glyph.ready.value ? glyph.iconContent.value : undefined
        },
        props.style
      )
    )

    return () => {
      const { class: attrClass, ...rootAttrs } = attrs
      const ariaHidden = props.decorative && !props.ariaLabel ? 'true' : undefined

      return (
        <Text
          {...rootAttrs}
          class={[
            'lego-icon',
            'lego-icon--font',
            isH5 && 'lego-icon--text',
            !glyph.ready.value && 'lego-icon--placeholder',
            props.class,
            props.customClass,
            attrClass
          ]}
          style={rootStyle.value}
          aria-hidden={ariaHidden}
          aria-label={props.ariaLabel || undefined}
        >
          {isH5 && glyph.ready.value ? glyph.iconChar.value : ''}
        </Text>
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
