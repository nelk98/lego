<script setup lang="ts">
import { Button, Tooltip } from 'ant-design-vue'
import type { ButtonProps } from 'ant-design-vue'

defineOptions({
  name: 'LButton',
  inheritAttrs: false,
})

// 扩展额外 props：Partial<ButtonProps> & { 自定义?: 类型 }
withDefaults(
  defineProps<
    Partial<ButtonProps> & {
      /** 自定义：例如 tooltip 文案 */
      tooltip?: string
    }
  >(),
  {
    type: 'primary',
    tooltip: 'xxxx',
  },
)
</script>

<template>
  <Tooltip :title="tooltip">
    <Button :loading="loading" v-bind="$attrs" :type="type" :size="size">
      <template v-for="(_, slot) in $slots" :key="slot" #[slot]="scope">
        <slot :name="slot" v-bind="scope ?? {}" />
      </template>
    </Button>
  </Tooltip>
</template>
