/**
 * Frontend/tests/services/serviceProvider.test.ts
 *
 * Kiểm thử toàn diện Service Provider Layer, Mock Providers và cơ chế chuyển đổi DATA_SOURCE.
 * Tuân thủ nghiêm ngặt AGENTS.md:
 * - Không có trường actionGuidance
 * - Giá trị số đo lường tuân thủ MetricValue = number | null
 * - Tách biệt tầng UI và tầng dữ liệu
 */

import { describe, it, expect } from 'vitest';
import {
  MockPrinterProvider,
  MockTaskProvider,
  MockIncidentProvider,
  MockSuppliesProvider,
  MockTelemetryProvider,
  MockSettingsProvider,
  MockDashboardProvider,
  ApiPrinterProvider,
  ApiTaskProvider,
  ApiIncidentProvider,
  ApiSuppliesProvider,
  ApiTelemetryProvider,
  ApiSettingsProvider,
  ApiDashboardProvider,
  createPrinterService,
  createTaskService,
  createIncidentService,
  createSuppliesService,
  createTelemetryService,
  createSettingsService,
  createDashboardService,
  printerService,
  taskService,
  incidentService,
  suppliesService,
  telemetryService,
  settingsService,
  dashboardService,
} from '../../src/services';
import { DATA_SOURCE } from '../../src/config/dataSource';

describe('Service Provider Layer (TASK-013)', () => {
  // 1. MockPrinterProvider
  describe('MockPrinterProvider', () => {
    const provider = new MockPrinterProvider();

    it('trả về danh sách 35 máy in mô phỏng', async () => {
      const printers = await provider.getPrinters();
      expect(printers).toBeInstanceOf(Array);
      expect(printers.length).toBe(35);
      expect(printers[0]).toHaveProperty('id');
      expect(printers[0]).toHaveProperty('connectionStatus');
    });

    it('tìm kiếm máy in hợp lệ theo ID', async () => {
      const printer = await provider.getPrinterById('prt-001');
      expect(printer).not.toBeNull();
      expect(printer?.id).toBe('prt-001');
    });

    it('trả về null khi tìm kiếm máy in không tồn tại', async () => {
      const printer = await provider.getPrinterById('prt-non-existent');
      expect(printer).toBeNull();
    });

    it('cập nhật vị trí máy in thành công', async () => {
      const result = await provider.updatePrinterLocation('prt-001', {
        location: 'Tầng 1 - Khu Kế toán cập nhật mới',
      });
      expect(result.success).toBe(true);
      expect(result.printer.location).toBe('Tầng 1 - Khu Kế toán cập nhật mới');
    });

    it('đồng bộ danh sách máy in và cập nhật timestamp cào dữ liệu', async () => {
      const result = await provider.syncPrinters();
      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(35);
      expect(result.timestamp).toBeDefined();
    });
  });

  // 2. MockTaskProvider
  describe('MockTaskProvider', () => {
    const provider = new MockTaskProvider();

    it('trả về danh sách công việc ban đầu', async () => {
      const tasks = await provider.getTasks();
      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('tạo mới công việc và tự động ghi activity audit log', async () => {
      const newTask = await provider.createTask(
        {
          title: 'Thay thế thanh nhiệt cụm sấy Ricoh SC541',
          taskType: 'Maintenance',
          priority: 'Critical',
          assignee: 'Nguyễn Văn A',
          dueDate: '2026-10-30T17:00:00Z',
          printerId: 'prt-001',
          printerName: 'Ricoh MP C6004 - P.Kế toán',
          location: 'Tầng 1 - Phòng Kế toán & Tài chính',
          incidentId: 'INC-20261028-0001',
        },
        'System Operator'
      );

      expect(newTask.id).toMatch(/^TSK-/);
      expect(newTask.title).toBe('Thay thế thanh nhiệt cụm sấy Ricoh SC541');
      expect(newTask.activityLogs).toHaveLength(1);
      expect(newTask.activityLogs[0].action).toBe('CREATED');
    });

    it('chuyển trạng thái công việc và ghi nhật ký lịch sử', async () => {
      const tasks = await provider.getTasks();
      const firstTask = tasks[0];

      const updated = await provider.updateTaskStatus(firstTask.id, {
        status: 'In_Progress',
        comment: 'Đã bắt đầu thực hiện kiểm tra thiết bị',
        author: 'Kỹ thuật viên 1',
        progressPercent: 30,
      });

      expect(updated.status).toBe('In_Progress');
      expect(updated.progressPercent).toBe(30);
      const lastLog = updated.activityLogs[updated.activityLogs.length - 1];
      expect(lastLog.action).toBe('STATUS_CHANGED');
      expect(lastLog.newValue).toBe('In_Progress');
    });
  });

  // 3. MockIncidentProvider & AGENTS.md Invariants
  describe('MockIncidentProvider', () => {
    const provider = new MockIncidentProvider();

    it('trả về danh sách sự cố và TUYỆT ĐỐI không chứa actionGuidance', async () => {
      const incidents = await provider.getIncidents();
      expect(incidents.length).toBeGreaterThan(0);

      // Bất biến AGENTS.md Section 6: Không được có trường actionGuidance
      incidents.forEach(inc => {
        expect((inc as Record<string, unknown>).actionGuidance).toBeUndefined();
        if (inc.diagnostic) {
          expect((inc.diagnostic as Record<string, unknown>).actionGuidance).toBeUndefined();
        }
      });
    });

    it('triage sự cố và ghi nhận nhật ký trạng thái', async () => {
      const incidents = await provider.getIncidents();
      const targetId = incidents[0].id;

      const triaged = await provider.triageIncident(targetId, {
        status: 'Active',
        lifecycle: 'Waiting (Chờ linh kiện cụm sấy)',
        note: 'Đã liên hệ nhà cung cấp Ricoh Việt Nam',
        pendingReason: 'Chờ linh kiện thay thế',
        nextCheckDate: '2026-10-30',
      });

      expect(triaged.lifecycle).toBe('Waiting (Chờ linh kiện cụm sấy)');
      const lastHistory = triaged.statusHistory[triaged.statusHistory.length - 1];
      expect(lastHistory.note).toContain('Lý do chờ: Chờ linh kiện thay thế');
    });
  });

  // 4. MockSuppliesProvider
  describe('MockSuppliesProvider', () => {
    const provider = new MockSuppliesProvider();

    it('tính toán đúng tổng quan vật tư tiêu hao', async () => {
      const summary = await provider.getSuppliesSummary();
      expect(summary.totalMonitoredPrinters).toBe(35);
      expect(summary.lowTonerCriticalCount).toBeGreaterThanOrEqual(0);
      expect(summary.wasteTonerFullCount).toBeGreaterThanOrEqual(0);
    });

    it('trả về danh sách chi tiết vật tư của 35 thiết bị', async () => {
      const list = await provider.getSuppliesList();
      expect(list.length).toBe(35);
      expect(list[0]).toHaveProperty('supplies');
      expect(list[0]).toHaveProperty('hasLowSupply');
    });
  });

  // 5. MockTelemetryProvider
  describe('MockTelemetryProvider', () => {
    const provider = new MockTelemetryProvider();

    it('trả về chuỗi sản lượng in 30 ngày', async () => {
      const trend = await provider.getVolumeTrend(30);
      expect(trend.length).toBe(30);
      expect(trend[0]).toHaveProperty('date');
      expect(trend[0]).toHaveProperty('totalPages');
    });

    it('trả về dòng thời gian khả dụng 24 giờ', async () => {
      const timeline = await provider.getAvailabilityTimeline(24);
      expect(timeline.length).toBe(12); // mỗi điểm 2 giờ
      expect(timeline[0]).toHaveProperty('onlineRate');
    });

    it('trả về danh mục Lemon Devices', async () => {
      const lemons = await provider.getLemonDevices();
      expect(lemons.length).toBeGreaterThan(0);
      expect(lemons[0]).toHaveProperty('reasons');
      expect(lemons[0].reasons.length).toBeGreaterThan(0);
    });

    it('trả về chỉ số độ tin cậy tổng thể', async () => {
      const stats = await provider.getReliabilityStats();
      expect(stats.totalFleetVolume30Days).toBeGreaterThan(0);
      expect(stats.fleetMtbfHours).toBeGreaterThan(0);
    });
  });

  // 6. MockSettingsProvider
  describe('MockSettingsProvider', () => {
    const provider = new MockSettingsProvider();

    it('trả về cấu hình hệ thống', async () => {
      const settings = await provider.getSettings();
      expect(settings.zabbix.pollIntervalSeconds).toBe(60);
      expect(settings.autoClosure.protectCriticalIncidents).toBe(true);
    });

    it('thử nghiệm kết nối Zabbix API giả lập thành công', async () => {
      const result = await provider.testZabbixConnection();
      expect(result.success).toBe(true);
      expect(result.message).toContain('Zabbix API');
    });

    it('tra cứu từ điển mã lỗi phần cứng đa thương hiệu', async () => {
      const found = await provider.lookupErrorCode('SC541', 'Ricoh');
      expect(found).not.toBeNull();
      expect(found?.affectedSubsystem).toBe('Fuser');
    });
  });

  // 7. MockDashboardProvider
  describe('MockDashboardProvider', () => {
    const provider = new MockDashboardProvider();

    it('tổng hợp KPI dashboard đầy đủ và chính xác', async () => {
      const dash = await provider.getDashboardSummary();
      expect(dash.kpis.totalPrinters).toBe(35);
      expect(dash.kpis.onlineCount + dash.kpis.offlineCount + dash.kpis.unknownCount).toBe(35);
      expect(dash.kpis.onlineRate).toBeGreaterThan(0);
      expect(dash.devicesNeedingAttention).toBeInstanceOf(Array);
      expect(dash.recentIncidents).toBeInstanceOf(Array);
    });
  });

  // 8. DATA_SOURCE Toggle & Factory Instantiation
  describe('DATA_SOURCE Toggle & Factories', () => {
    it('kiểm tra biến môi trường cấu hình DATA_SOURCE', () => {
      expect(['mock', 'api']).toContain(DATA_SOURCE);
    });

    it('khởi tạo Mock Provider khi truyền source = "mock"', () => {
      expect(createPrinterService('mock')).toBeInstanceOf(MockPrinterProvider);
      expect(createTaskService('mock')).toBeInstanceOf(MockTaskProvider);
      expect(createIncidentService('mock')).toBeInstanceOf(MockIncidentProvider);
      expect(createSuppliesService('mock')).toBeInstanceOf(MockSuppliesProvider);
      expect(createTelemetryService('mock')).toBeInstanceOf(MockTelemetryProvider);
      expect(createSettingsService('mock')).toBeInstanceOf(MockSettingsProvider);
      expect(createDashboardService('mock')).toBeInstanceOf(MockDashboardProvider);
    });

    it('khởi tạo API Provider khi truyền source = "api"', () => {
      expect(createPrinterService('api')).toBeInstanceOf(ApiPrinterProvider);
      expect(createTaskService('api')).toBeInstanceOf(ApiTaskProvider);
      expect(createIncidentService('api')).toBeInstanceOf(ApiIncidentProvider);
      expect(createSuppliesService('api')).toBeInstanceOf(ApiSuppliesProvider);
      expect(createTelemetryService('api')).toBeInstanceOf(ApiTelemetryProvider);
      expect(createSettingsService('api')).toBeInstanceOf(ApiSettingsProvider);
      expect(createDashboardService('api')).toBeInstanceOf(ApiDashboardProvider);
    });

    it('các singleton service mặc định tương ứng với DATA_SOURCE cấu hình hiện tại', () => {
      const expectedClass = DATA_SOURCE === 'api' ? ApiPrinterProvider : MockPrinterProvider;
      expect(printerService).toBeInstanceOf(expectedClass);
      expect(taskService).toBeDefined();
      expect(incidentService).toBeDefined();
      expect(suppliesService).toBeDefined();
      expect(telemetryService).toBeDefined();
      expect(settingsService).toBeDefined();
      expect(dashboardService).toBeDefined();
    });
  });
});

