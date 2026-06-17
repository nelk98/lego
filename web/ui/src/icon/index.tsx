import { defineComponent, type PropType } from 'vue'

import type { IconName, IconProps } from '@lego/shared/icon/types'

const iconPaths: Record<IconName, string> = {
  search:
    'M10.5 3a7.5 7.5 0 1 1 4.95 13.2l3.35 3.35a1 1 0 0 1-1.42 1.42l-3.35-3.35A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5'
}

export const Icon = defineComponent({
  name: 'Icon',
  props: {
    name: { type: String as PropType<IconName>, required: true },
    size: { type: [Number, String], default: 16 },
    color: { type: String, default: 'currentColor' },
    class: { type: String, default: '' }
  },
  setup(props: IconProps) {
    return () => (
      <svg
        class={props.class}
        width={props.size}
        height={props.size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d={iconPaths[props.name]} />
      </svg>
    )
  }
})

export default Icon
export type { IconName, IconProps } from '@lego/shared/icon/types'
