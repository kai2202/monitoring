/**
 * Frontend/src/services/providers/mock/MockTaskProvider.ts
 *
 * Triển khai ITaskService quản lý công việc Notion, WorkLog, Attachments và Audit Log trong bộ nhớ.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import {
  ITaskService,
  CreateTaskDto,
  UpdateTaskStatusDto,
  ReassignTaskDto,
  RescheduleTaskDto,
  AddTaskNoteDto,
} from '../../interfaces/ITaskService';
import { Task, TaskActivityLog, TaskAttachment, WorkLogEntry } from '../../../types/task';
import { mockTasks } from '../../../mocks';

const LOCAL_STORAGE_TASKS_KEY = 'fleetmonitor_tasks';

export class MockTaskProvider implements ITaskService {
  private tasks: Task[];

  constructor() {
    this.tasks = this.loadInitialTasks();
  }

  private loadInitialTasks(): Task[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.warn('[MockTaskProvider] Không thể đọc tasks từ localStorage:', err);
      }
    }
    return [...mockTasks];
  }

  private persistTasks(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(this.tasks));
      } catch (err) {
        console.warn('[MockTaskProvider] Không thể lưu tasks vào localStorage:', err);
      }
    }
  }

  async getTasks(): Promise<Task[]> {
    await new Promise((r) => setTimeout(r, 40));
    return [...this.tasks];
  }

  async getTaskById(id: string): Promise<Task | null> {
    await new Promise((r) => setTimeout(r, 20));
    const found = this.tasks.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async createTask(dto: CreateTaskDto, author: string): Promise<Task> {
    await new Promise((r) => setTimeout(r, 80));
    const now = new Date().toISOString();
    const newId = `TSK-${now.slice(0, 10).replace(/-/g, '')}-${String(this.tasks.length + 1).padStart(4, '0')}`;
    const creationLog: TaskActivityLog = {
      id: `log-${Date.now()}-1`,
      author,
      timestamp: now,
      action: 'CREATED',
      comment: `Tạo mới công việc: ${dto.title}`,
    };

    const newTask: Task = {
      id: newId,
      title: dto.title,
      description: dto.description,
      taskType: dto.taskType,
      priority: dto.priority,
      status: dto.status || 'Planned',
      assignee: dto.assignee,
      startDate: dto.startDate || now,
      dueDate: dto.dueDate,
      nextCheckDate: dto.nextCheckDate,
      progressPercent: 0,
      printerId: dto.printerId,
      printerName: dto.printerName,
      location: dto.location,
      incidentId: dto.incidentId,
      dueDateStatus: 'on_track',
      notes: dto.notes || '',
      contingencyPlan: dto.contingencyPlan,
      dynamicSteps: dto.dynamicSteps,
      activityFeed: dto.activityFeed,
      customFields: dto.customFields || [],
      timeAndCost: dto.timeAndCost,
      estimatedTimeAndCost: dto.estimatedTimeAndCost,
      workLogs: dto.workLogs || [],
      vendorCommunications: dto.vendorCommunications || [],
      attachments: dto.attachments || [],
      activityLogs: [creationLog],
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.unshift(newTask);
    this.persistTasks();
    return { ...newTask };
  }

  async updateTask(id: string, updatedFields: Partial<Task>): Promise<Task> {
    await new Promise((r) => setTimeout(r, 40));
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) throw new Error(`Không tìm thấy công việc có mã ${id}`);
    const updatedTask = { ...this.tasks[taskIndex], ...updatedFields, updatedAt: new Date().toISOString() };
    this.tasks[taskIndex] = updatedTask;
    this.persistTasks();
    return { ...updatedTask };
  }

  async updateTaskStatus(id: string, dto: UpdateTaskStatusDto): Promise<Task> {
    await new Promise((r) => setTimeout(r, 60));
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc có mã ${id}`);

    const now = new Date().toISOString();
    const oldStatus = task.status;
    task.status = dto.status;
    task.updatedAt = now;
    if (dto.status === 'Completed') {
      task.completedDate = now;
      task.progressPercent = 100;
    } else if (dto.progressPercent !== undefined) {
      task.progressPercent = dto.progressPercent;
    }
    if (dto.dynamicSteps) task.dynamicSteps = dto.dynamicSteps;
    if (dto.activityFeed) task.activityFeed = dto.activityFeed;
    if (dto.vendorCommunications) task.vendorCommunications = dto.vendorCommunications;
    if (dto.attachments) task.attachments = dto.attachments;
    if (dto.workLogs) task.workLogs = dto.workLogs;
    if (dto.timeAndCost) task.timeAndCost = dto.timeAndCost;

    task.activityLogs.push({
      id: `log-${Date.now()}`,
      author: dto.author,
      timestamp: now,
      action: 'STATUS_CHANGED',
      fieldChanged: 'status',
      oldValue: oldStatus,
      newValue: dto.status,
      comment: dto.comment || `Đổi trạng thái từ ${oldStatus} sang ${dto.status}`,
    });

    this.persistTasks();
    return { ...task };
  }

  async reassignTask(id: string, dto: ReassignTaskDto): Promise<Task> {
    await new Promise((r) => setTimeout(r, 60));
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    const now = new Date().toISOString();
    const oldAssignee = task.assignee;
    task.assignee = dto.newAssignee;
    task.updatedAt = now;
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      author: dto.author,
      timestamp: now,
      action: 'REASSIGNED',
      fieldChanged: 'assignee',
      oldValue: oldAssignee,
      newValue: dto.newAssignee,
      comment: dto.reason,
    });
    this.persistTasks();
    return { ...task };
  }

  async rescheduleTask(id: string, dto: RescheduleTaskDto): Promise<Task> {
    await new Promise((r) => setTimeout(r, 60));
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    const now = new Date().toISOString();
    const oldDueDate = task.dueDate;
    task.dueDate = dto.newDueDate;
    if (dto.newNextCheckDate) task.nextCheckDate = dto.newNextCheckDate;
    task.updatedAt = now;
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      author: dto.author,
      timestamp: now,
      action: 'RESCHEDULED',
      fieldChanged: 'dueDate',
      oldValue: oldDueDate,
      newValue: dto.newDueDate,
      comment: dto.reason,
    });
    this.persistTasks();
    return { ...task };
  }

  async addTaskNote(id: string, dto: AddTaskNoteDto): Promise<Task> {
    await new Promise((r) => setTimeout(r, 40));
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    const now = new Date().toISOString();
    task.notes = task.notes ? `${task.notes}\n[${now.slice(0, 16)}] ${dto.note}` : dto.note;
    task.updatedAt = now;
    task.activityLogs.push({ id: `log-${Date.now()}`, author: dto.author, timestamp: now, action: 'NOTE_ADDED', comment: dto.note });
    this.persistTasks();
    return { ...task };
  }

  async addTaskWorkLog(id: string, log: Partial<WorkLogEntry>): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    const entry: WorkLogEntry = {
      id: log.id || `wl-${Date.now()}`,
      stepId: log.stepId,
      stepNumber: log.stepNumber ?? 0,
      stepTitle: log.stepTitle || 'Thao tác kỹ thuật',
      performerName: log.performerName || 'Kỹ thuật viên',
      performerAvatar: log.performerAvatar || 'KT',
      createdAt: log.createdAt || new Date().toLocaleDateString('vi-VN'),
      actionsTaken: log.actionsTaken || '',
      resultStatus: log.resultStatus || 'SUCCESS',
    };
    task.workLogs = [...(task.workLogs || []), entry];
    this.persistTasks();
    return { ...task };
  }

  async uploadTaskAttachment(id: string, file: File, author: string, isTestPrintProof = false): Promise<TaskAttachment> {
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    const fileType: 'PDF' | 'IMAGE' | 'LOG' | 'DOC' = ['JPG', 'JPEG', 'PNG', 'WEBP', 'SVG'].includes(ext)
      ? 'IMAGE'
      : ext === 'PDF'
      ? 'PDF'
      : ['LOG', 'TXT', 'JSON', 'CSV'].includes(ext)
      ? 'LOG'
      : 'DOC';
    const sizeKb = file.size / 1024;
    const formattedSize = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(sizeKb))} KB`;
    const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
    const created: TaskAttachment = {
      id: `att-${Date.now()}`,
      fileName: file.name,
      fileType,
      mimeType: file.type,
      fileSize: formattedSize,
      fileUrl: objectUrl,
      isTestPrintProof: isTestPrintProof || fileType === 'IMAGE',
      uploadedAt: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('vi-VN')}`,
      uploadedBy: author || 'Kỹ sư NOC',
    };
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.attachments = [...(task.attachments || []), created];
      this.persistTasks();
    }
    return created;
  }

  async getAttachmentDownloadUrl(id: string, attachmentId: string): Promise<string | null> {
    const task = this.tasks.find((t) => t.id === id);
    return task?.attachments?.find((a) => a.id === attachmentId)?.fileUrl || null;
  }

  async updateProgress(id: string, percent: number, author: string, comment?: string): Promise<Task> {
    await new Promise((r) => setTimeout(r, 40));
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    const now = new Date().toISOString();
    const oldPercent = task.progressPercent;
    task.progressPercent = Math.min(100, Math.max(0, percent));
    task.updatedAt = now;
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      author,
      timestamp: now,
      action: 'PROGRESS_UPDATED',
      fieldChanged: 'progressPercent',
      oldValue: `${oldPercent}%`,
      newValue: `${percent}%`,
      comment: comment || `Cập nhật tiến độ: ${percent}%`,
    });
    this.persistTasks();
    return { ...task };
  }
}
