export type IconName = 'search' | 'close' | 'check'

export interface IconProps {
  name: IconName
  size?: number | string
  color?: string
  class?: string
}
