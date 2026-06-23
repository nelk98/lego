export { ICON_LIBRARY_MAP } from './config'
export { parseIconName } from './parseName'
export {
  codeToChar,
  cssIconContentVarFromCode,
  getCachedConfig,
  getLibraryMap,
  getLibraryMapRef,
  getLibraryUrl,
  loadLibraryConfig,
  normalizeIconCodeHex,
  registerLibraries,
  setIconConfigRequest,
  setIconFontFaceLoader
} from './registry'
export { mergeIconStyle, quoteFontFamily, toCssSizeValue, type IconInlineStyle } from './style'
export type {
  IconConfigRequest,
  IconFontConfig,
  IconFontFaceLoader,
  IconItem,
  IconLibraryInfo,
  IconLibraryMap,
  IconName,
  IconProps,
  IconSize,
  IconStyleValue,
  ParsedIconName
} from './types'
export {
  useDynamicIcons,
  type UseDynamicIconsOptions,
  type UseDynamicIconsReturn
} from './useDynamicIcons'
export { useFontLoader } from './useFontLoader'
export { useIconGlyph } from './useIconGlyph'
