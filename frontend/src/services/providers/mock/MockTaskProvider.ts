/**
 * Frontend/src/services/providers/mock/MockTaskProvider.ts
 *
 * Triển khai ITaskService quản lý công việc Notion, WorkLog, Contributions và HR Dossier trong bộ nhớ.
 * Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

import {
  ITaskService,
  CreateTaskDto,
  UpdateTaskStatusDto,
  ReassignTaskDto,
  RescheduleTaskDto,
  AddTaskNoteDto,
  AddContributionDto,
  ArchiveDossierDto,
} from '../../interfaces/ITaskService';
import { Task, TaskAttachment, WorkLogEntry } from '../../../types/task';
import { mockTasks } from '../../../mocks';

const STORAGE_KEY = 'fleetmonitor_tasks';

export class MockTaskProvider implements ITaskService {
  private tasks: Task[];

  constructor() {
    this.tasks = this.loadTasks();
  }

  private loadTasks(): Task[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.warn('[MockTaskProvider] Lỗi đọc localStorage:', err);
      }
    }
    return [...mockTasks];
  }

  private persist(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      } catch (err) {
        console.warn('[MockTaskProvider] Lỗi lưu localStorage:', err);
      }
    }
  }

  async getTasks(): Promise<Task[]> {
    await new Promise((r) => setTimeout(r, 30));
    return [...this.tasks];
  }

  async getTaskById(id: string): Promise<Task | null> {
    await new Promise((r) => setTimeout(r, 20));
    const found = this.tasks.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async createTask(dto: CreateTaskDto, author: string): Promise<Task> {
    const now = new Date().toISOString();
    const newId = `TSK-${now.slice(0, 10).replace(/-/g, '')}-${String(this.tasks.length + 1).padStart(4, '0')}`;
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
      dossierStatus: 'PENDING_DOCUMENTATION',
      contributions: [],
      activityLogs: [{ id: `log-${Date.now()}`, author, timestamp: now, action: 'CREATED', comment: `Tạo: ${dto.title}` }],
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.unshift(newTask);
    this.persist();
    return { ...newTask };
  }

  async updateTask(id: string, updatedFields: Partial<Task>): Promise<Task> {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Không tìm thấy công việc ${id}`);
    const updated = { ...this.tasks[idx], ...updatedFields, updatedAt: new Date().toISOString() };
    this.tasks[idx] = updated;
    this.persist();
    return { ...updated };
  }

  async updateTaskStatus(id: string, dto: UpdateTaskStatusDto): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    const now = new Date().toISOString();
    task.status = dto.status;
    task.updatedAt = now;
    if (dto.status === 'Completed') {
      task.completedDate = now;
      task.progressPercent = 100;
    } else if (dto.progressPercent !== undefined) {
      task.progressPercent = dto.progressPercent;
    }
    if (dto.dynamicSteps) task.dynamicSteps = dto.dynamicSteps;
    if (dto.attachments) task.attachments = dto.attachments;
    if (dto.workLogs) task.workLogs = dto.workLogs;
    if (dto.timeAndCost) task.timeAndCost = dto.timeAndCost;
    task.activityLogs.push({
      id: `log-${Date.now()}`,
      author: dto.author,
      timestamp: now,
      action: 'STATUS_CHANGED',
      fieldChanged: 'status',
      newValue: dto.status,
      comment: dto.comment || `Đổi sang ${dto.status}`,
    });
    this.persist();
    return { ...task };
  }

  async approveTask(taskId: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Không tìm thấy công việc ${taskId}`);
    task.status = 'Completed';
    task.completedDate = new Date().toISOString();
    task.progressPercent = 100;
    this.persist();
    return { ...task };
  }

  async reworkTask(taskId: string, reason: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Không tìm thấy công việc ${taskId}`);
    task.status = 'In_Progress';
    task.reworkReason = reason;
    this.persist();
    return { ...task };
  }

  async addContribution(taskId: string, dto: AddContributionDto): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Không tìm thấy công việc ${taskId}`);
    const now = new Date().toISOString();
    const contrib = {
      id: `contrib-${Date.now()}`,
      taskId,
      authorName: dto.authorName || 'Kỹ thuật viên',
      authorRole: dto.authorRole || 'FIELD_TECH',
      content: dto.content,
      attachedFileName: dto.file ? dto.file.name : null,
      fileSize: dto.file ? dto.file.size : null,
      mimeType: dto.file ? dto.file.type : null,
      createdAt: now,
    };
    task.contributions = [...(task.contributions || []), contrib];
    if (dto.file && task.dossierStatus === 'PENDING_DOCUMENTATION') {
      task.dossierStatus = 'PENDING_HR_REVIEW';
    }
    this.persist();
    return { ...task };
  }

  async archiveDossier(taskId: string, dto: ArchiveDossierDto): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Không tìm thấy công việc ${taskId}`);
    const now = new Date().toISOString();
    task.status = 'Completed';
    task.dossierStatus = 'DOSSIER_ARCHIVED';
    task.hrReviewNotes = dto.hrReviewNotes || 'Đã chốt lưu hồ sơ tài sản';
    task.totalCostVnd = dto.totalCostVnd ?? task.timeAndCost?.totalCostVnd ?? null;
    task.archivedAt = now;
    task.completedDate = now;
    this.persist();
    return { ...task };
  }

  async reassignTask(id: string, dto: ReassignTaskDto): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    task.assignee = dto.newAssignee;
    task.updatedAt = new Date().toISOString();
    this.persist();
    return { ...task };
  }

  async rescheduleTask(id: string, dto: RescheduleTaskDto): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    task.dueDate = dto.newDueDate;
    task.updatedAt = new Date().toISOString();
    this.persist();
    return { ...task };
  }

  async addTaskNote(id: string, dto: AddTaskNoteDto): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    task.notes = task.notes ? `${task.notes}\n${dto.note}` : dto.note;
    this.persist();
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
    this.persist();
    return { ...task };
  }

  async uploadTaskAttachment(id: string, file: File, author: string, isTestPrintProof = false): Promise<TaskAttachment> {
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    const fileType: 'PDF' | 'IMAGE' | 'LOG' | 'DOC' = ['JPG', 'JPEG', 'PNG'].includes(ext) ? 'IMAGE' : ext === 'PDF' ? 'PDF' : 'DOC';
    const created: TaskAttachment = {
      id: `att-${Date.now()}`,
      fileName: file.name,
      fileType,
      mimeType: file.type,
      fileSize: `${Math.round(file.size / 1024)} KB`,
      fileUrl: typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined,
      isTestPrintProof,
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      uploadedBy: author || 'Kỹ sư NOC',
    };
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.attachments = [...(task.attachments || []), created];
      this.persist();
    }
    return created;
  }

  async getAttachmentDownloadUrl(id: string, attachmentId: string): Promise<string | null> {
    return this.tasks.find((t) => t.id === id)?.attachments?.find((a) => a.id === attachmentId)?.fileUrl || null;
  }

  async deleteTaskAttachment(id: string, attachmentId: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    task.attachments = (task.attachments || []).filter((a) => a.id !== attachmentId);
    this.persist();
    return { ...task };
  }

  async updateProgress(id: string, percent: number, author: string, comment?: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new Error(`Không tìm thấy công việc ${id}`);
    task.progressPercent = Math.min(100, Math.max(0, percent));
    this.persist();
    return { ...task };
  }
}
