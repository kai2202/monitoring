# FleetMonitor — Đặc Tả Zabbix Templates & Tra Cứu SNMP OIDs/MIBs

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Zabbix SNMP Templates & Item Reference Specification (Đặc tả MIBs & OIDs cho Zabbix Server 7.0 LTS)  
> **Phiên bản:** 2.7.0  
> **Mô hình triển khai:** On-Premises (LAN-Only)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD) & [docs/Design/architecture.md](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md)

---

## 1. Ranh Giới Trách Nhiệm Cốt Lõi (Architecture Boundary)

> [!IMPORTANT]
> **Zabbix Server 7.0 LTS là thành phần DUY NHẤT giao tiếp SNMP và ICMP với máy in.**  
> Backend FleetMonitor **tuyệt đối không chạy SNMP Poller trực tiếp**, không gửi bản tin SNMP Get/Walk tới thiết bị. Thư mục tài liệu này đóng vai trò là **chuẩn cấu hình Zabbix Templates, Discovery Rules và Items** trên máy chủ Zabbix, đồng thời làm từ điển đối soát khóa đo lường (`item.key_`) khi Backend gọi Zabbix JSON-RPC API.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HẠ TẦNG MÁY IN MẠNG NỘI BỘ (LAN-ONLY)                │
│         ~100 máy in đa hãng (Ricoh, Canon, HP, Brother, Epson, Xerox)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SNMP v1/v2c/v3 (UDP 161) & ICMP
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ZABBIX SERVER 7.0 LTS                           │
│  • Quản trị Host Groups, Templates, Discovery Rules, Triggers, Events  │
│  • Cấu hình các OIDs chuẩn (RFC 3805, RFC 2790) & Private Vendor MIBs  │
│  • Thu thập số liệu chu kỳ Fast (30s) & Slow (1h)                      │
└──────────────┬──────────────────────────────────────────▲──────────────┘
               │                                          │
    Zabbix API │ JSON-RPC 2.0 (host.get, item.get,        │ Webhook Push
   (Pull chính)│ history.get, problem.get, trigger.get)   │ (Problem/Recovery)
               ▼                                          │
┌─────────────────────────────────────────────────────────┴──────────────┐
│                    FLEETMONITOR BACKEND (EXPRESS/TS)                   │
│  • Zabbix API Client & Webhook Event Receiver (Chống trùng lặp)        │
│  • Chuẩn hóa dữ liệu Telemetry đa hãng (Normalization Engine)          │
│  • PostgreSQL 16 (Dữ liệu nghiệp vụ, CMMS, Kho, Tài sản, Chi phí)       │
│  • Cung cấp RESTful API cho Frontend React 18                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    FLEETMONITOR FRONTEND (REACT 18)                    │
│  • Pure React SVG Visualizations, Bento Dashboard, Quản trị CMMS       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Bản Đồ Tài Liệu Tra Cứu Cấu Hình Zabbix Items

| Tài Liệu Tra Cứu | Nội Dung Kỹ Thuật | Phạm Vi Áp Dụng Trên Zabbix Server |
| :--- | :--- | :--- |
| [rfc3805_printer_mib.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/rfc3805_printer_mib.md) | Đặc tả các OID chuẩn quốc tế RFC 3805 & RFC 2790 (Trạng thái thiết bị, bộ đếm MarkerLifeCount, vật tư CMYK, hộp mực thải, bảng mã cảnh báo). | Cấu hình Template chuẩn cho mọi dòng máy in hỗ trợ Printer-MIB (Canon, Ricoh, HP, Epson, Brother, Xerox). |
| [vendor_enterprise_oids.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/vendor_enterprise_oids.md) | Tra cứu OID doanh nghiệp chuyên sâu (Private Enterprise OIDs: Ricoh `1.3.6.1.4.1.367`, Canon `1.3.6.1.4.1.1602`, HP `1.3.6.1.4.1.11`, Brother, Epson, Xerox), mã SC, mã E và giải mã bộ đếm màu. | Cấu hình Vendor-specific Templates để lấy mã lỗi phần cứng chi tiết và tách biệt bộ đếm Mono / Color. |
| [frontend_mock_to_oid_mapping.md](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md) | Bảng đối chiếu ánh xạ 100% dữ liệu giao diện sang cột CSDL PostgreSQL và Zabbix Item Keys / OIDs. | Căn cứ kiểm thử tích hợp giữa Frontend Mock, Backend Service và Zabbix Items. |

---

## 3. Nguyên Tắc An Toàn & Chuẩn Hóa Dữ Liệu (AGENTS.md Rule 5 Compliance)

1. **Không Tự Ý Bịa Đặt OID:** Tuyệt đối không suy diễn OID nếu chưa được kiểm chứng trong tài liệu kỹ thuật của hãng hoặc tiêu chuẩn RFC.
2. **Xử Lý Dữ Liệu Thiếu (Null-Safety):** Nếu Zabbix Item không trả về giá trị (Not supported hoặc Zabbix trả về null), Backend bắt buộc lưu trữ `null` và Frontend hiển thị `—` hoặc `Chưa có dữ liệu`. Tuyệt đối không thay thế bằng số `0`.
3. **Phân Biệt Thiết Bị Đơn Sắc vs In Màu:** Thiết bị đơn sắc (Mono) chỉ cấu hình Zabbix Items đọc mực Đen (Black); không gán template màu C, M, Y để tránh sinh lỗi `SNMP error: noSuchName` trên Zabbix Server.
4. **Bảo Toàn Mã Lỗi Gốc:** Mã lỗi phần cứng do Zabbix Item thu về được Backend bảo toàn nguyên trạng trong trường `raw_vendor_code` trước khi phân loại sang bộ mã chuẩn nội bộ `FM-...`.
