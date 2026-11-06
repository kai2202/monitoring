/**
 * Backend/src/controllers/mockTaskData.ts
 *
 * Dữ liệu bộ nhớ đệm ban đầu cho Task Controller (CMMS Tasks):
 * - Tuân thủ AGENTS.md Rule 7.1 (< 300 LOC).
 */

export const initialTasksDb: any[] = [
  {
    id: 'TASK-2026-001',
    printerId: 'RICOH-T1-01',
    printerName: 'Ricoh MP C6004 - P.Kế toán',
    printerModel: 'MP C6004',
    printerLocation: 'Tầng 1 - Phòng Tài chính Kế toán',
    title: 'Khắc phục lỗi kẹt giấy & Thay cụm Fuser',
    taskType: 'Bảo trì sửa chữa',
    priority: 'P1_Urgent',
    status: 'In_Progress',
    assignee: 'Lê Hoàng Nam',
    startDate: '2026-11-05',
    dueDate: '2026-11-06',
    progressPercent: 65,
    description: 'Nghi ngờ rách bao lụa sấy do kẹt giấy liên tục mã SC542.',
    dynamicSteps: [
      { id: 's-1', stepNumber: 1, title: 'Kiểm tra hiện trường & đọc mã lỗi SNMP', status: 'Completed', completedAt: '09:15' },
      { id: 's-2', stepNumber: 2, title: 'Tháo dỡ và thay thế cụm Fuser mới', status: 'In_Progress' },
      { id: 's-3', stepNumber: 3, title: 'In bản test kiểm tra chất lượng & bàn giao', status: 'Pending' },
    ],
    activityFeed: [
      { id: 'act-1', author: 'Lê Hoàng Nam', timestamp: '09:15', type: 'status_change', content: 'Đã hoàn tất bước kiểm tra mã lỗi SNMP, chuẩn bị thay linh kiện.' },
    ],
  },
  {
    id: 'TASK-2026-002',
    printerId: 'HP-T2-02',
    printerName: 'HP LaserJet M608dn - P.Nhân sự',
    printerModel: 'LaserJet Enterprise M608dn',
    printerLocation: 'Tầng 2 - Phòng Hành chính Nhân sự',
    title: 'Thay thế hộp mực Black CF237A & Vệ sinh trục cuốn',
    taskType: 'Cấp phát vật tư',
    priority: 'P2_High',
    status: 'Planned',
    assignee: 'Kỹ sư NOC',
    startDate: '2026-11-06',
    dueDate: '2026-11-07',
    progressPercent: 0,
    description: 'Hộp mực đen còn dưới 8%, xuất kho linh kiện thay thế định kỳ.',
    dynamicSteps: [
      { id: 's-1', stepNumber: 1, title: 'Xuất kho hộp mực chính hãng', status: 'Pending' },
      { id: 's-2', stepNumber: 2, title: 'Lắp ráp và cân chỉnh chất lượng trang in', status: 'Pending' },
    ],
  },
];
