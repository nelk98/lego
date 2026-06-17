import { Text, View } from '@tarojs/components'
import { defineComponent, type PropType } from 'vue'

import type { IconName, IconProps } from '@lego/shared/icon/types'

const iconLabels: Record<IconName, string> = {
  search: '搜',
  close: '关',
  check: '选'
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
      <View
        class={['c_icon', props.class]}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: props.size,
          height: props.size,
          color: props.color
        }}
      >
        <Text style={{ fontSize: props.size, lineHeight: 1 }}>{iconLabels[props.name]}</Text>
      </View>
    )
  }
})

export default Icon
export type { IconName, IconProps } from '@lego/shared/icon/types'
