/**
 * Frontend/src/mocks/mockTasks.ts
 *
 * Dữ liệu công việc & lệnh bảo trì (Tasks / Work Orders).
 * Clean Slate: Khởi đầu danh sách sạch (0 công việc mock).
 * Các công việc sẽ được tạo thực tế và lưu trữ theo phiên làm việc.
 *
 * Tuân thủ nghiêm ngặt AGENTS.md: Không tự ý bịa đặt số liệu mock.
 */

import { Task } from '../types/task';

export type MockTask = Task;

export const mockTasks: Task[] = [];
