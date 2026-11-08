/**
 * Backend/src/controllers/index.ts
 *
 * Master Public API Gate cho toàn bộ 6 Domain Controllers của FleetMonitor Backend:
 * 1. tasks/       - Lệnh bảo trì CMMS, Đính kèm MinIO, Nghiệm thu & Nhật ký sửa chữa
 * 2. printers/    - Thiết bị máy in, Chuỗi thời gian Telemetry & Sơ đồ tòa nhà/tầng
 * 3. incidents/   - Sự cố phần cứng, Webhook Zabbix & Chuông thông báo tập trung
 * 4. operations/  - Kho phụ tùng SKU, Mua sắm PO, Đối tác hãng & Vật tư tiêu hao
 * 5. analytics/   - Phân tích sản lượng, Hạch toán tài chính TCO & Dashboard tổng quan
 * 6. auth/        - Xác thực OWASP JWT, Quản trị tài khoản RBAC & Cấu hình hệ thống
 */

export * from './tasks';
export * from './printers';
export * from './incidents';
export * from './operations';
export * from './analytics';
export * from './auth';

