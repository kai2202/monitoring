# FleetMonitor — Master Documentation Index

Tài liệu chính thức của hệ thống **FleetMonitor (Enterprise Printer Fleet & Operations Management)**. Cấu trúc thư mục tài liệu tuân thủ nghiêm ngặt quy định tại [`.agent/rules/AGENTS.md`](../.agent/rules/AGENTS.md) (Mục 2 — Documentation and Source of Truth).

---

## 1. Cấu trúc Thư mục Tài liệu (`docs/`)

| Thư mục                           | Mục đích & Phạm vi                                                                   | Tài liệu tiêu biểu                                                                                                                                                                 |
| :-------------------------------- | :----------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/Design/`](./Design/)       | Kiến trúc tổng thể hệ thống, điều hướng UI/UX, đặc tả màn hình chi tiết              | [`00_overview.MD`](./Design/00_overview.MD), [`architecture.md`](./Design/architecture.md), [`ui_navigation_specs.MD`](./Design/ui_navigation_specs.MD), [`UI/`](./Design/UI/)     |
| [`docs/Plan/`](./Plan/)           | Yêu cầu nghiệp vụ (Business Requirements), lộ trình phát triển, luồng nghiệp vụ      | [`business_requirements.MD`](./Plan/business_requirements.MD), [`progress.MD`](./Plan/progress.MD), [`workflow/`](./Plan/workflow/)                                                |
| [`docs/Tasks/`](./Tasks/)         | Hồ sơ đặc tả kỹ thuật từng Task theo module (`01_Infrastructure` -> `08_Testing_QA`) | [`task_template.MD`](./Tasks/task_template.MD), các thư mục module `01_*` đến `08_*`                                                                                               |
| [`docs/snmp-oids/`](./snmp-oids/) | Từ điển SNMP OIDs, MIBs thực tế và hướng dẫn cấu hình Zabbix theo từng dòng máy in   | [`printer-monitoring-oids.md`](./snmp-oids/printer-monitoring-oids.md), [`Ricoh-MP-7502/`](./snmp-oids/Ricoh-MP-7502/), [`Toshiba-e-STUDIO856/`](./snmp-oids/Toshiba-e-STUDIO856/) |
| [`docs/Test/`](./Test/)           | Kịch bản kiểm thử, báo cáo nghiệm thu (QA/QC) và hướng dẫn kiểm thử tích hợp         | [`test_plan.md`](./Test/test_plan.md)                                                                                                                                              |
| [`docs/Build/`](./Build/)         | Nhật ký đóng gói, cấu hình môi trường triển khai và hướng dẫn vận hành               | Tài liệu hướng dẫn build & deployment                                                                                                                                              |

---

## 2. Thứ tự Ưu tiên Nguồn Sự thật (Source of Truth Precedence)

Khi có sự khác biệt giữa các tài liệu hoặc mã nguồn, áp dụng thứ tự ưu tiên sau (theo `AGENTS.md` Mục 2):

1. **Yêu cầu trực tiếp hiện tại của người dùng (Explicit User Instructions)**.
2. **Yêu cầu nghiệp vụ & quyết định kiến trúc đã phê duyệt** (`docs/Plan/business_requirements.MD`, `docs/Design/architecture.md`).
3. **Mã nguồn hiện hành và hành vi kiểm chứng được** (`Frontend/`, `Backend/`).
4. **Tài liệu kỹ thuật bổ trợ trong dự án** (`docs/Tasks/`, `docs/Design/UI/`, `docs/snmp-oids/`).
5. **Tài liệu chuẩn từ nhà sản xuất thiết bị (Vendor MIBs / RFCs)**.
