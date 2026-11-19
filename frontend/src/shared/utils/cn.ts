import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Frontend/src/shared/utils/cn.ts
 *
 * Hàm gộp classname tối ưu chuẩn shadcn/ui kết hợp clsx và tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
