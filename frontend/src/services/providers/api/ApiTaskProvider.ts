/**
 * Frontend/src/services/providers/api/ApiTaskProvider.ts
 *
 * Triển khai ITaskService thông qua REST API Backend.
 */

import {
  ITaskService,
  CreateTaskDto,
  UpdateTaskStatusDto,
  ReassignTaskDto,
  RescheduleTaskDto,
  AddTaskNoteDto,
} from '../../interfaces/ITaskService';
import { Task } from '../../../types/task';
import { requestApi } from './apiClient';

export class ApiTaskProvider implements ITaskService {
  async getTasks(): Promise<Task[]> {
    return requestApi<Task[]>('/tasks');
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      return await requestApi<Task>(`/tasks/${id}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  }

  async createTask(dto: CreateTaskDto, author: string): Promise<Task> {
    return requestApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...dto, author }),
    });
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return requestApi<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });
  }

  async updateTaskStatus(id: string, dto: UpdateTaskStatusDto): Promise<Task> {
    return requestApi<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async reassignTask(id: string, dto: ReassignTaskDto): Promise<Task> {
    return requestApi<Task>(`/tasks/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async rescheduleTask(id: string, dto: RescheduleTaskDto): Promise<Task> {
    return requestApi<Task>(`/tasks/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async addTaskNote(id: string, dto: AddTaskNoteDto): Promise<Task> {
    return requestApi<Task>(`/tasks/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updateProgress(id: string, percent: number, author: string, comment?: string): Promise<Task> {
    return requestApi<Task>(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ percent, author, comment }),
    });
  }
}
