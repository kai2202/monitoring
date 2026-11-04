/**
 * Frontend/src/shared/index.ts
 *
 * Cổng giao tiếp duy nhất (Public API Gate) của tầng Shared Core.
 * Tuân thủ AGENTS.md Rule 7.1:
 * - 6 phân loại chuyên biệt: displays, inputs, feedback, modals, hooks, utils.
 * - Mỗi thư mục con kiểm soát nghiêm ngặt 4–8 items chống quá tải thị giác.
 */

export * from './displays';
export * from './inputs';
export * from './feedback';
export * from './modals';
export * from './hooks';
export * from './utils';
export * from './icons';


