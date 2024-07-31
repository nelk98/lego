import { ref } from 'vue'
import { useComputeValue, type ComputedValue } from './index'

const foo = (options: { isLoading: ComputedValue<boolean> }) => {
  const isLoading = useComputeValue(options.isLoading)

  // 此时用 isLoading 渲染具有响应式特性
}

foo({ isLoading: true }) // 非响应式
foo({ isLoading: ref(true) }) // 响应式
foo({ isLoading: () => true }) // 响应式
