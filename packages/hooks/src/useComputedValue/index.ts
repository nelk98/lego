import { computed, isRef, type Ref } from 'vue'

export type ComputedValue<T> = T | Ref<T> | (() => T)

/**
 * 定义一个泛型函数，接受一个 ComputedValue 类型的参数，并返回一个计算值
 *
 * ComputedValue 支持 普通变量、Ref、Reactive、函数返回值，注意：不支持异步函数
 */
export const useComputeValue = <T>(value: ComputedValue<T>) => {
  return computed<T>(() => {
    if (isRef(value)) {
      return value.value
    }
    if (typeof value === 'function') {
      return (value as () => T)()
    }
    return value
  })
}
