/**
 * Backend/src/utils/taskMapper.ts
 *
 * Bộ chuyển đổi dữ liệu chuẩn hóa giữa Prisma ORM (`Task`, `WorkLog`, `TaskAttachment`)
 * và Type Contract giao diện của Frontend (`Frontend/src/types/task.ts`).
 * - Tuân thủ AGENTS.md Rule 5 (MetricValue = number | null) & Rule 7.1 (< 300 LOC).
 */

export const TASK_RELATIONS = {
  printer: true,
  workLogs: { orderBy: { createdAt: 'desc' as const } },
  attachments: {
    include: { uploadedBy: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' as const },
  },
};

export function buildTaskCreateData(body: any) {
  const rawPriority = String(body.priority || 'P3_Medium');
  const normalizedPriority =
    rawPriority === 'P1_Urgent' || rawPriority === 'P1_Critical'
      ? 'P1_Urgent'
      : rawPriority === 'P2_High' || rawPriority === 'P3_Medium' || rawPriority === 'P4_Low'
      ? rawPriority
      : 'P3_Medium';

  const rawStatus = String(body.status || 'Planned');
  const normalizedStatus =
    rawStatus === 'In_Progress' || rawStatus === 'Waiting' || rawStatus === 'Pending_Verification' || rawStatus === 'Completed' || rawStatus === 'Cancelled'
      ? rawStatus
      : 'Planned';

  return {
    id: body.id && !String(body.id).startsWith('task-') ? body.id : `TASK-${Date.now().toString().slice(-6)}`,
    printerId: body.printerId,
    incidentId: body.incidentId || null,
    title: body.title || 'Lệnh bảo trì kỹ thuật',
    taskType: body.taskType || body.type || 'CORRECTIVE_REPAIR',
    priority: normalizedPriority as any,
    status: normalizedStatus as any,
    assigneeId: body.assigneeId || null,
    assigneeName: body.assignee || body.assigneeName || 'Kỹ thuật viên NOC',
    dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 2 * 24 * 3600 * 1000),
    dynamicSteps: body.dynamicSteps || [],
    timeAndCost: body.timeAndCost || {
      repairTimeHours: null,
      waitingTimeHours: null,
      downtimeHours: null,
      laborCostVnd: null,
      partsCostVnd: null,
      totalCostVnd: null,
    },
  };
}

export function computeUpdatedTaskCost(
  prevCostInput: any,
  existingLogs: Array<{ hoursSpent: number }>,
  addedHours: number,
  addedPartsCostVnd: number,
  hourlyRate: number
) {
  const prevCost = prevCostInput || {};
  const totalHours = existingLogs.reduce((acc, w) => acc + w.hoursSpent, 0) + addedHours;
  const newPartsCost = (Number(prevCost.partsCostVnd) || 0) + (Number(addedPartsCostVnd) || 0);
  const newLaborCost = Math.round(totalHours * hourlyRate);

  return {
    repairTimeHours: Number(totalHours.toFixed(2)),
    waitingTimeHours: prevCost.waitingTimeHours ?? null,
    downtimeHours: prevCost.downtimeHours ?? Number(totalHours.toFixed(2)),
    laborCostVnd: newLaborCost,
    partsCostVnd: newPartsCost,
    totalCostVnd: newLaborCost + newPartsCost,
  };
}

export function formatBytesToSizeLabel(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return '—';
  const kb = Number(bytes) / 1024;
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(kb))} KB`;
}

export function resolveAttachmentCategory(
  mimeOrType: string | null | undefined,
  fileName: string
): 'PDF' | 'IMAGE' | 'LOG' | 'DOC' {
  const mime = (mimeOrType || '').toLowerCase();
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
    return 'IMAGE';
  }
  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'PDF';
  }
  if (['log', 'txt', 'csv', 'json'].includes(ext) || mime.startsWith('text/')) {
    return 'LOG';
  }
  return 'DOC';
}

export function formatVnTimestamp(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '—';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return String(dateInput);
  const timePart = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const datePart = d.toLocaleDateString('vi-VN');
  return `${timePart}, ${datePart}`;
}

export function mapAttachmentRecord(a: any, fallbackUploaderName?: string) {
  const uploaderName = a.uploadedBy?.fullName || fallbackUploaderName || 'Kỹ thuật viên';
  return {
    id: a.id,
    fileName: a.fileName,
    fileType: resolveAttachmentCategory(a.fileType, a.fileName),
    mimeType: a.fileType,
    fileSize: typeof a.fileSize === 'number' ? formatBytesToSizeLabel(a.fileSize) : String(a.fileSize || '—'),
    fileUrl: a.fileUrl || undefined,
    minioObjectKey: a.minioObjectKey || undefined,
    isTestPrintProof: Boolean(a.isTestPrintProof),
    uploadedAt: formatVnTimestamp(a.createdAt),
    uploadedBy: uploaderName,
  };
}

export function mapWorkLogRecord(w: any) {
  const name = w.authorName || 'Kỹ thuật viên';
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((p: string) => p[0])
    .join('')
    .toUpperCase();

  return {
    id: w.id,
    stepNumber: 0,
    stepTitle: 'Thao tác bảo trì kỹ thuật',
    performerName: name,
    performerAvatar: initials || 'KT',
    createdAt: formatVnTimestamp(w.createdAt),
    actionsTaken: w.note || '',
    resultStatus: 'SUCCESS' as const,
    additionalTimeHours: typeof w.hoursSpent === 'number' ? w.hoursSpent : undefined,
  };
}

export function mapTaskRecord(t: any) {
  const dueDateIso = t.dueDate ? new Date(t.dueDate).toISOString() : '';
  const isOverdue =
    t.status !== 'Completed' &&
    t.status !== 'Cancelled' &&
    t.dueDate &&
    new Date(t.dueDate).getTime() < Date.now();

  return {
    id: t.id,
    printerId: t.printerId,
    printerName: t.printer?.name || t.printerId,
    printerModel: t.printer?.model || 'Unknown',
    location: t.printer?.location || 'Chưa định vị',
    printerLocation: t.printer?.location || 'Chưa định vị',
    incidentId: t.incidentId || undefined,
    title: t.title,
    description: t.description || t.title,
    taskType: t.taskType,
    priority: t.priority,
    status: t.status,
    assigneeId: t.assigneeId || undefined,
    assignee: t.assigneeName || 'Chưa phân công',
    startDate: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    dueDate: dueDateIso,
    dueDateStatus: isOverdue ? ('overdue' as const) : ('on_track' as const),
    completedDate: t.completedDate ? new Date(t.completedDate).toISOString() : undefined,
    progressPercent: t.progressPercent ?? 0,
    reworkReason: t.reworkReason || undefined,
    notes: t.description || '',
    activityLogs: [],
    dynamicSteps: Array.isArray(t.dynamicSteps) ? t.dynamicSteps : [],
    timeAndCost: t.timeAndCost || {
      repairTimeHours: null,
      waitingTimeHours: null,
      downtimeHours: null,
      laborCostVnd: null,
      partsCostVnd: null,
      totalCostVnd: null,
    },
    workLogs: Array.isArray(t.workLogs)
      ? t.workLogs.filter((w: any) => !String(w.note || '').startsWith('[HÃNG:')).map(mapWorkLogRecord)
      : [],
    vendorCommunications: Array.isArray(t.workLogs)
      ? t.workLogs
          .filter((w: any) => String(w.note || '').startsWith('[HÃNG:'))
          .map((w: any) => {
            const raw = String(w.note || '');
            const match = raw.match(/^\[HÃNG:\s*([^|\]]+?)(?:\s*\|\s*([^\]]*))?\]\s*(.*)$/s);
            return {
              id: w.id,
              vendorName: match?.[1]?.trim() || 'Hỗ trợ kỹ thuật chính hãng',
              contactPerson: match?.[2]?.trim() || '',
              phoneOrEmail: '',
              discussionContent: match?.[3]?.trim() || raw,
              vendorGuidance: '',
              timestamp: w.createdAt ? new Date(w.createdAt).toISOString() : new Date().toISOString(),
            };
          })
      : [],
    attachments: Array.isArray(t.attachments) ? t.attachments.map((a: any) => mapAttachmentRecord(a)) : [],
    activityFeed: Array.isArray(t.workLogs)
      ? t.workLogs.map((w: any) => ({
          id: w.id,
          author: w.authorName,
          timestamp: formatVnTimestamp(w.createdAt),
          type: 'note_added' as const,
          content: w.note,
        }))
      : [],
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
  };
}
