/**
 * Frontend/src/services/providers/api/ApiTaskProvider.ts
 *
 * Triển khai ITaskService thông qua REST API Backend & MinIO S3 Object Storage:
 * - Hỗ trợ đầy đủ CRUD lệnh bảo trì, ghi nhận WorkLog tính chi phí tự động,
 *   upload ảnh nghiệm thu in test (`FormData` -> MinIO) và sinh Presigned Download URL.
 * - Tuân thủ AGENTS.md Rule 4 & Rule 7.1 (< 300 LOC).
 */

import {
  ITaskService,
  CreateTaskDto,
  UpdateTaskStatusDto,
  ReassignTaskDto,
  RescheduleTaskDto,
  AddTaskNoteDto,
} from '../../interfaces/ITaskService';
import { Task, TaskAttachment, WorkLogEntry } from '../../../types/task';
import { requestApi } from './apiClient';

export class ApiTaskProvider implements ITaskService {
  async getTasks(): Promise<Task[]> {
    return requestApi<Task[]>('/tasks');
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      return await requestApi<Task>(`/tasks/${id}`);
    } catch (err: unknown) {
      if ((err as any)?.status === 404 || (err instanceof Error && err.message.includes('404'))) {
        return null;
      }
      throw err;
    }
  }

  async createTask(dto: CreateTaskDto, author: string): Promise<Task> {
    const res = await requestApi<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...dto, author }),
    });
    return (res?.task ?? res) as Task;
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });
    return (res?.task ?? res) as Task;
  }

  async updateTaskStatus(id: string, dto: UpdateTaskStatusDto): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return (res?.task ?? res) as Task;
  }

  async reassignTask(id: string, dto: ReassignTaskDto): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return (res?.task ?? res) as Task;
  }

  async rescheduleTask(id: string, dto: RescheduleTaskDto): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return (res?.task ?? res) as Task;
  }

  async addTaskNote(id: string, dto: AddTaskNoteDto): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return (res?.task ?? res) as Task;
  }

  async addTaskWorkLog(id: string, log: Partial<WorkLogEntry>): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}/worklogs`, {
      method: 'POST',
      body: JSON.stringify({
        authorName: log.performerName,
        note: log.actionsTaken,
        hoursSpent: log.additionalTimeHours ?? (log.durationMinutes ? log.durationMinutes / 60 : 0.5),
        partsCostVnd: log.additionalCostVnd ?? 0,
      }),
    });
    return (res?.task ?? res) as Task;
  }

  async uploadTaskAttachment(
    id: string,
    file: File,
    author: string,
    isTestPrintProof = false
  ): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('author', author);
    formData.append('isTestPrintProof', String(isTestPrintProof));

    return requestApi<TaskAttachment>(
      `/tasks/${encodeURIComponent(id)}/attachments`,
      {
        method: 'POST',
        body: formData,
      },
      30000
    );
  }

  async getAttachmentDownloadUrl(id: string, attachmentId: string): Promise<string | null> {
    const res = await requestApi<{ downloadUrl: string }>(
      `/tasks/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}/download`
    );
    return res?.downloadUrl || null;
  }

  async updateProgress(id: string, percent: number, author: string, comment?: string): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ percent, author, comment }),
    });
    return (res?.task ?? res) as Task;
  }

  async approveTask(taskId: string): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${encodeURIComponent(taskId)}/approve`, {
      method: 'POST',
    });
    return (res?.data ?? res?.task ?? res) as Task;
  }

  async reworkTask(taskId: string, reason: string): Promise<Task> {
    const res = await requestApi<any>(`/tasks/${encodeURIComponent(taskId)}/rework`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return (res?.data ?? res?.task ?? res) as Task;
  }
}
