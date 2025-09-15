import { computed, type ComputedRef, isRef, type Ref } from 'vue'

/** 响应式类型数值泛型别名，支持 Ref、函数返回值、普通值 */
export type ComputedValue<T> = T | Ref<T> | (() => T)

/**
 * 计算属性，返回一个 ComputedRef 泛型
 * @param value - 用于计算的值
 * @param filter - 过滤器，支持使用过滤器来改变返回结果/类型
 */
export const useComputedValue = <T, R = T>(value: ComputedValue<T>, filter?: (value: T) => R): ComputedRef<R> => {
  return computed(() => {
    let v: T
    if (isRef(value)) {
      v = value.value
    } else if (typeof value === 'function') {
      v = (value as () => T)()
    } else {
      v = value as T
    }
    return filter ? filter(v) : (v as unknown as R)
  })
}
