# FleetMonitor — Cổng Tài Liệu Trung Tâm (Documentation Index)

> **Dự án:** FleetMonitor — Hệ thống Giám sát, Bảo trì & Quản trị Tài sản Doanh nghiệp (khởi điểm từ Hạm đội Máy in)  
> **Cấu trúc tinh gọn:** 8 tài liệu Markdown cốt lõi + Thư mục cấu hình SNMP/Zabbix (`docs/snmp-oids/`).

---

## Danh Mục Tài Liệu Cốt Lõi

| Tài liệu | Nội dung chính |
| :--- | :--- |
| **[overview.md](file:///f:/Code/Github/Monitoring/docs/overview.md)** | Tổng quan dự án, Lộ trình Giai đoạn 1 (Máy in) $\to$ Giai đoạn 2+ (Quản lý Tài sản & Đối chiếu Thừa/Thiếu), và Compliance Matrix. |
| **[business_requirements.md](file:///f:/Code/Github/Monitoring/docs/business_requirements.md)** | Yêu cầu nghiệp vụ, Quy trình phát hiện thừa/thiếu gắn kết Chi phí – Doanh thu, RBAC 3 vai trò và đặc tả 4 phân hệ. |
| **[architecture.md](file:///f:/Code/Github/Monitoring/docs/architecture.md)** | Kiến trúc hệ thống On-Premises, Frontend React 18 / Pure SVG, Backend Express/Prisma, PostgreSQL 16, MinIO S3 & Cache 60s. |
| **[api_contract.md](file:///f:/Code/Github/Monitoring/docs/api_contract.md)** | Hợp đồng REST API chuẩn hóa giữa Frontend & Backend (`/api/v1/*`). |
| **[workflows.md](file:///f:/Code/Github/Monitoring/docs/workflows.md)** | Luồng cảnh báo Zabbix (Safe Window 10m), chuẩn hóa mã lỗi `FM-...` và vòng đời bảo trì CMMS 3 tầng. |
| **[snmp_zabbix_guide.md](file:///f:/Code/Github/Monitoring/docs/snmp_zabbix_guide.md)** | Kiến trúc thu thập SNMP/Zabbix, bảng tra cứu nhanh OIDs đa hãng và nguyên tắc loại trừ. |
| **[roadmap_and_progress.md](file:///f:/Code/Github/Monitoring/docs/roadmap_and_progress.md)** | Báo cáo tiến độ triển khai Frontend/Backend và tổng hợp danh mục task. |

## Tệp Cấu Hình & Script Thực Thi (`docs/snmp-oids/`)
- `docs/snmp-oids/error_dictionary_import.csv` — Bộ 75 mã lỗi phần cứng chuẩn hóa sẵn sàng import vào PostgreSQL.
- `docs/snmp-oids/zabbix_template_fleetmonitor_snmp.yaml` — Zabbix 7.0 SNMP Template chuẩn.
- `docs/snmp-oids/snmp_walk_probe.sh` — Script dò quét SNMP Walk kiểm tra OID thiết bị thực tế.
