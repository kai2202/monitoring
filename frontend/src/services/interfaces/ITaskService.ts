/**
 * Frontend/src/services/interfaces/ITaskService.ts
 *
 * Hợp đồng Service Layer cho Quản lý công việc & bảo trì Notion Workspace.
 */

import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  TaskStepItem,
  TaskActivityFeedItem,
  TaskCustomField,
  TimeAndCostSummary,
  WorkLogEntry,
  VendorCommunicationLog,
  TaskAttachment,
} from '../../types/task';

export interface CreateTaskDto {
  title: string;
  description: string;
  taskType: TaskType;
  priority: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  assignee: string;
  startDate?: string;
  dueDate: string;
  nextCheckDate?: string;
  printerId: string;
  printerName: string;
  location: string;
  incidentId?: string;
  notes?: string;
  contingencyPlan?: string;
  dynamicSteps?: TaskStepItem[];
  activityFeed?: TaskActivityFeedItem[];
  customFields?: TaskCustomField[];
  timeAndCost?: TimeAndCostSummary;
  estimatedTimeAndCost?: TimeAndCostSummary;
  workLogs?: WorkLogEntry[];
  vendorCommunications?: VendorCommunicationLog[];
  attachments?: TaskAttachment[];
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
  comment?: string;
  author: string;
  progressPercent?: number;
  dynamicSteps?: TaskStepItem[];
  activityFeed?: TaskActivityFeedItem[];
  customFields?: TaskCustomField[];
  timeAndCost?: TimeAndCostSummary;
  workLogs?: WorkLogEntry[];
  vendorCommunications?: VendorCommunicationLog[];
  attachments?: TaskAttachment[];
}

export interface ReassignTaskDto {
  newAssignee: string;
  assigneeId?: string;
  reason: string;
  author: string;
}

export interface RescheduleTaskDto {
  newDueDate: string;
  newNextCheckDate?: string;
  reason: string;
  author: string;
}

export interface AddTaskNoteDto {
  note: string;
  author: string;
}

export interface ITaskService {
  getTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(dto: CreateTaskDto, author: string): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task>;
  updateTaskStatus(id: string, dto: UpdateTaskStatusDto): Promise<Task>;
  reassignTask(id: string, dto: ReassignTaskDto): Promise<Task>;
  rescheduleTask(id: string, dto: RescheduleTaskDto): Promise<Task>;
  addTaskNote(id: string, dto: AddTaskNoteDto): Promise<Task>;
  addTaskWorkLog(id: string, log: Partial<WorkLogEntry>): Promise<Task>;
  uploadTaskAttachment(
    id: string,
    file: File,
    author: string,
    isTestPrintProof?: boolean
  ): Promise<TaskAttachment>;
  getAttachmentDownloadUrl(id: string, attachmentId: string): Promise<string | null>;
  updateProgress(id: string, percent: number, author: string, comment?: string): Promise<Task>;
  approveTask(taskId: string): Promise<Task>;
  reworkTask(taskId: string, reason: string): Promise<Task>;
}
