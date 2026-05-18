import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并组件内置 class 与调用方传入的 class。
 *
 * `clsx` 负责条件 class，`tailwind-merge` 负责让后传入的 Tailwind/UnoCSS
 * 冲突工具类生效；这是 shadcn-vue 组件落地后最常用的小工具。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
