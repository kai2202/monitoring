# FleetMonitor — Đặc Tả & Mã Nguồn Kiểm Thử Đơn Vị Mẫu (Unit Test Specifications)

> **Dự án:** FleetMonitor — Enterprise Printer Monitoring & Management System  
> **Tài liệu:** Bộ Kịch bản Kiểm thử Đơn vị Mẫu với Vitest (Sample Unit Test Suites)  
> **Phương pháp:** Xây dựng theo kỹ năng `unit-testing-test-generate` — Tối đa hóa độ phủ, kiểm soát triệt để các ca biên (edge-cases) và xác minh tính toàn vẹn nghiệp vụ.

---

## 1. Giới Thiệu & Cấu Trúc Kiểm Thử

Tài liệu này cung cấp các kịch bản kiểm thử đơn vị mẫu hoàn chỉnh, có thể thực thi ngay bằng **Vitest** trong môi trường dự án FleetMonitor. Các bài kiểm thử tập trung vào những module có logic nghiệp vụ cốt lõi và nhạy cảm nhất:
1. `problemClassifier.test.ts`: Phân loại lỗi phần cứng, giải mã mã SC Ricoh, mã E Canon.
2. `autoClosureEngine.test.ts`: Thực thi chính sách tự động đóng sự cố (khóa cứng sự cố Critical & User-reported).
3. `telemetryAggregator.test.ts`: Đo lường sản lượng in ấn, xử lý lỗi bộ đếm giảm/reset, tính MTBF và Lemon Devices.
4. `taskService.test.ts`: Quản lý vòng đời Task, phân công, dời lịch bắt buộc có lý do và lưu vết Activity Audit Log.
5. `TaskViewSwitcher.test.tsx`: Kiểm thử tương tác component giao diện chuyển đổi 4 chế độ xem bằng `@testing-library/react`.

---

## 2. Kịch Bản 1: Phân Loại Lỗi Phần Cứng (`problemClassifier.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { classifyProblem } from '../../src/services/problemClassifier';

describe('problemClassifier — Phân loại lỗi phần cứng chuyên sâu', () => {
  it('nhận diện chính xác lỗi cụm sấy Ricoh SC541 và gán mức Critical', () => {
    const rawAlert = {
      vendor: 'Ricoh',
      model: 'MP C6004',
      message: 'SC541-00 Fusing thermistor open circuit',
      triggerValue: 1,
    };

    const result = classifyProblem(rawAlert);

    expect(result.subsystem).toBe('Fuser');
    expect(result.severity).toBe('Critical');
    expect(result.errorCode).toBe('SC541');
    expect(result.errorName).toContain('Cụm sấy');
    // Tuyệt đối không tồn tại trường actionGuidance
    expect(result).not.toHaveProperty('actionGuidance');
  });

  it('nhận diện chính xác lỗi mạch nung cụm sấy Canon E000 và gán mức Critical', () => {
    const rawAlert = {
      vendor: 'Canon',
      model: 'imageRUNNER ADVANCE C5535i',
      message: 'Error code E000-0001: Fuser temperature failure',
      triggerValue: 1,
    };

    const result = classifyProblem(rawAlert);

    expect(result.subsystem).toBe('Fuser');
    expect(result.severity).toBe('Critical');
    expect(result.errorCode).toBe('E000');
    expect(result).not.toHaveProperty('actionGuidance');
  });

  it('nhận diện chính xác lỗi khối quang học Ricoh SC101 gán mức Warning', () => {
    const rawAlert = {
      vendor: 'Ricoh',
      model: 'MP C6004',
      message: 'SC101 Exposure lamp error',
      triggerValue: 1,
    };

    const result = classifyProblem(rawAlert);

    expect(result.subsystem).toBe('Scanner_ADF');
    expect(result.severity).toBe('Warning');
    expect(result.errorCode).toBe('SC101');
  });

  it('xử lý an toàn mã lỗi không xác định mà không làm sập hệ thống', () => {
    const rawAlert = {
      vendor: 'HP',
      model: 'LaserJet M608',
      message: 'Unexpected hardware status 99.999',
      triggerValue: 1,
    };

    const result = classifyProblem(rawAlert);

    expect(result.subsystem).toBe('General');
    expect(result.severity).toBe('Warning');
    expect(result.errorCode).toBe('UNKNOWN');
    expect(result.errorName).toContain('Chưa xác định');
  });
});
```

---

## 3. Kịch Bản 2: Chính Sách Tự Động Đóng Sự Cố (`autoClosureEngine.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateAutoClosure } from '../../src/services/autoClosureEngine';

describe('autoClosureEngine — Quy tắc thống nhất tự động đóng sự cố', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('TUYỆT ĐỐI KHÔNG tự động đóng sự cố Critical dù trigger Zabbix đã clear và máy Online', () => {
    const incident = {
      id: 'INC-20261028-0001',
      severity: 'Critical',
      source: 'SYSTEM_GENERATED',
      status: 'In_Progress',
      triggerStatus: 'RESOLVED',
      triggerClearedAt: new Date(Date.now() - 20 * 60 * 1000), // Đã clear 20 phút trước
      printerStatus: 'Online',
      hasAssignee: true,
    };

    const decision = evaluateAutoClosure(incident);

    expect(decision.shouldClose).toBe(false);
    expect(decision.reason).toContain('Không tự động đóng sự cố Critical');
  });

  it('TUYỆT ĐỐI KHÔNG tự động đóng sự cố do người dùng báo (USER_REPORTED) chưa xác minh', () => {
    const incident = {
      id: 'INC-20261028-0002',
      severity: 'Warning',
      source: 'USER_REPORTED',
      status: 'New',
      triggerStatus: 'RESOLVED',
      triggerClearedAt: new Date(Date.now() - 30 * 60 * 1000),
      printerStatus: 'Online',
      verifiedByTech: false,
    };

    const decision = evaluateAutoClosure(incident);

    expect(decision.shouldClose).toBe(false);
    expect(decision.reason).toContain('Sự cố do người dùng báo cần kỹ thuật viên xác nhận');
  });

  it('chuyển sang Pending Verification thay vì đóng ngay nếu sự cố đang có Task xử lý', () => {
    const incident = {
      id: 'INC-20261028-0003',
      severity: 'Warning',
      source: 'SYSTEM_GENERATED',
      status: 'In_Progress',
      triggerStatus: 'RESOLVED',
      triggerClearedAt: new Date(Date.now() - 15 * 60 * 1000),
      printerStatus: 'Online',
      hasActiveTask: true,
    };

    const decision = evaluateAutoClosure(incident);

    expect(decision.shouldClose).toBe(false);
    expect(decision.targetStatus).toBe('Pending_Verification');
  });

  it('tự động đóng hợp lệ đối với cảnh báo Warning thoáng qua sau 10 phút và máy Online', () => {
    const incident = {
      id: 'INC-20261028-0004',
      severity: 'Warning',
      source: 'SYSTEM_GENERATED',
      status: 'New',
      triggerStatus: 'RESOLVED',
      triggerClearedAt: new Date(Date.now() - 12 * 60 * 1000), // Clear được 12 phút (> 10 phút)
      printerStatus: 'Online',
      hasAssignee: false,
      hasActiveTask: false,
    };

    const decision = evaluateAutoClosure(incident);

    expect(decision.shouldClose).toBe(true);
    expect(decision.targetStatus).toBe('Closed');
    expect(decision.reason).toContain('Tự động đóng: Thiết bị đã phục hồi và ổn định');
  });
});
```

---

## 4. Kịch Bản 3: Đo Lường Telemetry & Nhận Diện Lemon Devices (`telemetryAggregator.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateVolumeDelta,
  calculateMtbf,
  isLemonDevice,
} from '../../src/services/telemetryAggregator';

describe('telemetryAggregator — Đo lường sản lượng in & Nhận diện thiết bị', () => {
  it('tính toán chính xác sản lượng in chênh lệch bình thường', () => {
    const startSample = { count: 100000, timestamp: '2026-10-01T00:00:00Z' };
    const endSample = { count: 104500, timestamp: '2026-10-28T00:00:00Z' };

    const delta = calculateVolumeDelta(startSample, endSample);

    expect(delta).toBe(4500);
  });

  it('xử lý an toàn khi bộ đếm bị giảm bất thường (thay mainboard/reset) không ra số âm', () => {
    const startSample = { count: 100000, timestamp: '2026-10-01T00:00:00Z' };
    const endSample = { count: 500, timestamp: '2026-10-28T00:00:00Z' }; // Giảm bất thường

    const delta = calculateVolumeDelta(startSample, endSample);

    // Không được trả về -99500; phải trả về null để giao diện hiển thị "Chưa đủ dữ liệu tin cậy"
    expect(delta).toBeNull();
  });

  it('xử lý mẫu dữ liệu thiếu: trả về null khi không đủ 2 mẫu đo', () => {
    const startSample = null;
    const endSample = { count: 10500, timestamp: '2026-10-28T00:00:00Z' };

    const delta = calculateVolumeDelta(startSample, endSample);

    expect(delta).toBeNull();
  });

  it('tính MTBF an toàn không bị lỗi chia cho 0 khi không có sự cố nào', () => {
    const totalOperatingMs = 30 * 24 * 3600 * 1000;
    const totalDowntimeMs = 0;
    const failureCount = 0;

    const mtbfHours = calculateMtbf(totalOperatingMs, totalDowntimeMs, failureCount);

    expect(mtbfHours).toBeNull(); // Hoặc trả về giá trị biểu thị 100% tin cậy, không Infinity
  });

  it('nhận diện chính xác Lemon Device khi máy in có >= 5 sự cố trong tháng', () => {
    const metrics = {
      printerHostId: 'ricoh_p204',
      incidentCountLast30Days: 6,
      criticalIncidentCount: 2,
      totalDowntimeHours: 40,
      availabilityPercent: 92.5,
    };

    const lemonStatus = isLemonDevice(metrics);

    expect(lemonStatus.isLemon).toBe(true);
    expect(lemonStatus.reasons).toContain('Tần suất sự cố cao (>= 5 lần/tháng)');
    expect(lemonStatus.recommendedAction).toBe('Replacement_Candidate');
  });

  it('nhận diện Lemon Device khi Downtime > 72 giờ trong tháng', () => {
    const metrics = {
      printerHostId: 'canon_p301',
      incidentCountLast30Days: 2,
      criticalIncidentCount: 1,
      totalDowntimeHours: 85,
      availabilityPercent: 82.0,
    };

    const lemonStatus = isLemonDevice(metrics);

    expect(lemonStatus.isLemon).toBe(true);
    expect(lemonStatus.reasons).toContain('Thời gian ngừng hoạt động vượt quá 72 giờ');
  });
});
```

---

## 5. Kịch Bản 4: Nghiệp Vụ Task & Lịch Sử Hoạt Động (`taskService.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../../src/services/taskService';

// Giả lập Prisma client
const mockPrisma = {
  task: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  taskActivityLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async (cb) => cb(mockPrisma)),
};

describe('TaskService — Quản lý công việc & Activity Audit Log', () => {
  let taskService: TaskService;

  beforeEach(() => {
    vi.clearAllMocks();
    taskService = new TaskService(mockPrisma as any);
  });

  it('tạo Task mới thành công và tự động ghi log action CREATED', async () => {
    const inputData = {
      title: 'Thay cụm sấy Ricoh C6004',
      priority: 'P2_High',
      dueDate: new Date('2026-10-30T10:00:00Z'),
      printerHostId: 'printer_01',
    };
    const author = 'Kỹ thuật viên Nguyễn Văn A';

    mockPrisma.task.create.mockResolvedValue({
      id: 'TSK-20261028-0001',
      ...inputData,
      status: 'Planned',
      progressPercent: 0,
    });

    const result = await taskService.createTask(inputData, author);

    expect(result.id).toBe('TSK-20261028-0001');
    expect(mockPrisma.taskActivityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: 'TSK-20261028-0001',
        author: author,
        action: 'CREATED',
      }),
    });
  });

  it('bắt buộc phải có lý do khi dời lịch (reschedule), ném lỗi nếu reason rỗng', async () => {
    const taskId = 'TSK-20261028-0001';
    const newDueDate = new Date('2026-11-02T10:00:00Z');
    const author = 'Trần Văn B';

    await expect(
      taskService.rescheduleTask(taskId, newDueDate, null, author, '')
    ).rejects.toThrow('Lý do dời lịch là bắt buộc');
  });

  it('dời lịch hợp lệ cập nhật dueDate và ghi vết Activity Log với oldValue và newValue', async () => {
    const taskId = 'TSK-20261028-0001';
    const oldDueDate = new Date('2026-10-30T10:00:00Z');
    const newDueDate = new Date('2026-11-02T10:00:00Z');
    const reason = 'Chờ nhà cung cấp giao hàng ngày 02/11';
    const author = 'Trần Văn B';

    mockPrisma.task.findUnique.mockResolvedValue({
      id: taskId,
      dueDate: oldDueDate,
    });
    mockPrisma.task.update.mockResolvedValue({
      id: taskId,
      dueDate: newDueDate,
    });

    await taskService.rescheduleTask(taskId, newDueDate, null, author, reason);

    expect(mockPrisma.taskActivityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: taskId,
        action: 'RESCHEDULED',
        fieldChanged: 'dueDate',
        oldValue: oldDueDate.toISOString(),
        newValue: newDueDate.toISOString(),
        comment: reason,
        author: author,
      }),
    });
  });

  it('thêm ghi chú kỹ thuật (addNote) thành công và sinh bản ghi action NOTE_ADDED', async () => {
    const taskId = 'TSK-20261028-0001';
    const author = 'Trần Văn B';
    const note = 'Đã đo điện trở cụm sấy: 120 Ohm, hoạt động bình thường. Tiếp tục theo dõi rơ-le nhiệt.';

    mockPrisma.task.findUnique.mockResolvedValue({ id: taskId });

    await taskService.addNote(taskId, author, note);

    expect(mockPrisma.taskActivityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        taskId: taskId,
        action: 'NOTE_ADDED',
        author: author,
        comment: note,
      }),
    });
  });

  it('tính toán chính xác nhãn hạn chót: overdue khi quá hạn, due_soon khi trong 24h', () => {
    const now = new Date('2026-10-28T12:00:00Z');

    const pastTask = { dueDate: new Date('2026-10-27T10:00:00Z'), status: 'In_Progress' };
    const soonTask = { dueDate: new Date('2026-10-28T20:00:00Z'), status: 'In_Progress' };
    const futureTask = { dueDate: new Date('2026-11-05T10:00:00Z'), status: 'In_Progress' };
    const completedTask = { dueDate: new Date('2026-10-25T10:00:00Z'), status: 'Completed' };

    expect(taskService.computeDueDateStatus(pastTask.dueDate, pastTask.status, now)).toBe('overdue');
    expect(taskService.computeDueDateStatus(soonTask.dueDate, soonTask.status, now)).toBe('due_soon');
    expect(taskService.computeDueDateStatus(futureTask.dueDate, futureTask.status, now)).toBe('on_track');
    // Task đã hoàn thành thì không bị coi là overdue
    expect(taskService.computeDueDateStatus(completedTask.dueDate, completedTask.status, now)).toBe('on_track');
  });
});
```

---

## 6. Kịch Bản 5: Kiểm Thử Component Chuyển Chế Độ Xem (`TaskViewSwitcher.test.tsx`)

```tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskViewSwitcher, TaskViewMode } from '../../src/components/tasks/TaskViewSwitcher';

describe('TaskViewSwitcher — Chuyển đổi 4 chế độ xem Notion-style', () => {
  it('hiển thị đầy đủ 4 nút chế độ xem bằng tiếng Việt', () => {
    const handleViewChange = vi.fn();
    render(<TaskViewSwitcher activeMode="table" onViewChange={handleViewChange} />);

    expect(screen.getByRole('button', { name: /Bảng/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kanban/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lịch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tiến độ/i })).toBeInTheDocument();
  });

  it('gọi callback onViewChange với đúng giá trị khi người dùng nhấp chọn', () => {
    const handleViewChange = vi.fn();
    render(<TaskViewSwitcher activeMode="table" onViewChange={handleViewChange} />);

    const kanbanBtn = screen.getByRole('button', { name: /Kanban/i });
    fireEvent.click(kanbanBtn);

    expect(handleViewChange).toHaveBeenCalledTimes(1);
    expect(handleViewChange).toHaveBeenCalledWith('board');
  });

  it('làm nổi bật (active highlight) nút đang được lựa chọn', () => {
    const { rerender } = render(<TaskViewSwitcher activeMode="calendar" onViewChange={vi.fn()} />);

    const calendarBtn = screen.getByRole('button', { name: /Lịch/i });
    expect(calendarBtn).toHaveAttribute('data-active', 'true');

    rerender(<TaskViewSwitcher activeMode="timeline" onViewChange={vi.fn()} />);
    const timelineBtn = screen.getByRole('button', { name: /Tiến độ/i });
    expect(timelineBtn).toHaveAttribute('data-active', 'true');
  });
});
```

