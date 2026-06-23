import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合并条件 class，并让后传入的 Tailwind/UnoCSS 冲突工具类生效。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
