# FleetMonitor — Từ Điển OID & MIBs Thiết Bị In Ấn (SNMP OID Master Index)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Thư mục tra cứu mã định danh đối tượng SNMP (SNMP OIDs & MIBs Dictionary)  
> **Phiên bản:** 2.6.0  
> **Quy chuẩn:** RFC 3805 (Printer-MIB v2), RFC 2790 (Host Resources MIB), Vendor Private Enterprise MIBs

---

## 1. Tổng Quan Kiến Trúc Thu Thập SNMP (SNMP Polling Hierarchy)

Hệ thống FleetMonitor thực hiện thu thập dữ liệu từ xa (Telemetry) thông qua Zabbix 7.0 LTS Poller kết hợp hai chu kỳ:

```text
                                  ┌──────────────────────────────┐
                                  │   Zabbix Server 7.0 LTS      │
                                  └──────────────┬───────────────┘
                                                 │
                         ┌───────────────────────┴───────────────────────┐
                         ▼                                               ▼
         ┌───────────────────────────────┐               ┌───────────────────────────────┐
         │   Fast Polling (Chu kỳ 30s)   │               │   Slow Polling (Chu kỳ 1h)    │
         │ • ICMP Ping: icmpping[<ip>]   │               │ • Counters: RFC 3805 Marker   │
         │ • RFC 2790: hrDeviceStatus    │               │ • Supplies: RFC 3805 MarkerSup│
         │ • RFC 3805: prtAlertTable     │               │ • Waste Box: Waste Toner OID  │
         │ • Vendor Error Code Trap      │               │ • Color / Mono Counters       │
         └───────────────────────────────┘               └───────────────────────────────┘
```

---

## 2. Bản Đồ Tài Liệu Tra Cứu Chi Tiết

| Tài Liệu Tra Cứu | Nội Dung Kỹ Thuật | Phạm Vi Áp Dụng |
| :--- | :--- | :--- |
| [rfc3805_printer_mib.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/rfc3805_printer_mib.md) | Đặc tả các OID chuẩn quốc tế RFC 3805 & RFC 2790 (Trạng thái thiết bị, bộ đếm MarkerLifeCount, vật tư CMYK, hộp mực thải, bảng mã cảnh báo). | Mọi dòng máy in hỗ trợ chuẩn Printer-MIB (Canon, Ricoh, HP, Epson, Brother, Toshiba). |
| [vendor_enterprise_oids.md](file:///f:/Code/Github/Monitoring/docs/snmp-oids/vendor_enterprise_oids.md) | Tra cứu OID doanh nghiệp chuyên sâu (Private Enterprise OIDs: Ricoh 1.3.6.1.4.1.367, Canon 1.3.6.1.4.1.1602, HP 1.3.6.1.4.1.11, v.v.), mã SC, mã E và giải mã bộ đếm màu. | Ánh xạ chi tiết mã lỗi phần cứng và phân loại linh kiện hư hỏng. |
| [frontend_mock_to_oid_mapping.md](file:///f:/Code/Github/Monitoring/docs/Design/frontend_mock_to_oid_mapping.md) | Bảng đối chiếu ánh xạ 100% dữ liệu giao diện sang cột CSDL PostgreSQL và OIDs SNMP. | Tài liệu cutover giữa Frontend Mock và Backend Poller. |

---

## 3. Nguyên Tắc An Toàn Khi Xử Lý OID (AGENTS.md Rule 5 Compliance)

1. **Không Tự Ý Bịa Đặt OID:** Tuyệt đối không suy diễn OID nếu chưa được kiểm chứng trong tài liệu kỹ thuật của hãng hoặc tiêu chuẩn RFC.
2. **Xử Lý Dữ Liệu Thiếu (Null-Safety):** Nếu máy in không trả về giá trị cho OID vật tư hoặc OID nhiệt độ sấy, giá trị bắt buộc là `null`, hiển thị `—` trên UI. Tuyệt đối không thay thế bằng số `0`.
3. **Phân Biệt Thiết Bị Đơn Sắc vs In Màu:** Thiết bị đơn sắc (Mono) chỉ truy vấn bộ đếm màu Đen (Black); tự động bỏ qua các OID màu C, M, Y để không gây lỗi SNMP `noSuchName`.

