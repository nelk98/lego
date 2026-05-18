<script setup lang="ts">
import { Loading } from '@lego/shared'
import { Button, Tooltip } from 'ant-design-vue'
import type { ButtonProps } from 'ant-design-vue'

defineOptions({
  name: 'LButton',
  inheritAttrs: false
})

// 扩展额外 props：Partial<ButtonProps> & { 自定义?: 类型 }
withDefaults(
  defineProps<
    Partial<ButtonProps> & {
      /** 自定义：例如 tooltip 文案 */
      tooltip?: string
    }
  >(),
  {}
)
</script>

<template>
  <Tooltip :title="tooltip">
    <Button
      loadingIcon="LoadingOutlined"
      :loading="loading"
      v-bind="$attrs"
      :type="type"
      :size="size"
      style="position: relative"
    >
      <template v-for="(_, slot) in $slots" :key="slot" #[slot]="scope">
        <!-- <Loading class="c_loading" /> -->
        <slot :name="slot" v-bind="scope ?? {}" />
      </template>
    </Button>
  </Tooltip>
</template>

<style lang="sass"></style>
