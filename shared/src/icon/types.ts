export type IconName = string & {}

export type IconSize = number | string

export type IconStyleValue = string | Record<string, string | number | undefined>

export interface IconProps {
  name: IconName
  library?: string
  size?: IconSize
  color?: string
  class?: unknown
  customClass?: unknown
  style?: IconStyleValue
  ariaLabel?: string
  decorative?: boolean
}

export interface ParsedIconName {
  library: string
  iconId: string
}

export interface IconFontConfig {
  font: {
    family: string
    urls: {
      woff2?: string
      woff?: string
      ttf?: string
    }
  }
  icons: IconItem[]
}

export interface IconItem {
  id: string
  code: string
}

export type IconLibraryMap = Record<string, string>

export interface IconLibraryInfo {
  id: string
  url: string
  family?: string
  iconCount?: number
  loaded: boolean
}

export type IconConfigRequest = (url: string) => Promise<IconFontConfig | unknown>

export type IconFontFaceLoader = (
  config: IconFontConfig
) => boolean | void | Promise<boolean | void>
