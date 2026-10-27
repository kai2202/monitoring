# Hồ Sơ Thiết Bị & OID: Canon imageRUNNER ADVANCE C5535i

> **Vị trí trong dự án:** Thiết bị khảo sát mở rộng (**Phase 2 Fleet Rollout**)  
> **Trạng thái kiểm chứng:** **DOCUMENTED** (Căn cứ theo tài liệu kỹ thuật MIB chính thức của hãng Canon)  
> **Áp dụng:** Cấu hình Zabbix Template Canon, Backend API Diagnostic Rules và Frontend Display.

---

## 1. Thông Tin Nhận Diện Phần Cứng

| Thuộc tính | Giá trị quy ước / Đặc tả | Trạng thái |
| :--- | :--- | :---: |
| **Hãng sản xuất** | Canon Inc. | `DOCUMENTED` |
| **Dòng sản phẩm** | imageRUNNER ADVANCE (iR-ADV Gen 3) | `DOCUMENTED` |
| **Model máy in** | C5535i (tương thích C5540i, C5550i, C5560i) | `DOCUMENTED` |
| **Phân loại thiết bị** | Color Multifunction Printer (Color MFP A3) | `DOCUMENTED` |
| **Giao thức SNMP** | SNMP v2c / v3 (UDP 161) | `DOCUMENTED` |
| **Enterprise OID Root**| `.1.3.6.1.4.1.1602` (Canon Enterprise MIB) | `DOCUMENTED` |
| **Zabbix Template** | `Template Network Printer Standard SNMP` kết hợp `Template Canon iR ADV SNMP` | `DOCUMENTED` |

---

## 2. Đặc Điểm Kỹ Thuật & Cấu Trúc Bộ Đếm Canon

- **Nền tảng ứng dụng:** Hỗ trợ nền tảng phần mềm nhúng Canon MEAP (Multifunctional Embedded Application Platform).
- **Cấu trúc bộ đếm:** Hệ thống bộ đếm Canon sử dụng phân vùng chuyên biệt:
  - `Counter 101`: Tổng số trang in toàn hệ thống (Total Counter).
  - `Counter 102`: Tổng số trang photocopy mặt kính (Copy Total Counter).
  - `Counter 103`: Tổng số trang in từ máy tính qua mạng (Print Total Counter).
- **Mã lỗi Canon E-Codes:** Canon sử dụng hệ thống mã báo lỗi dịch vụ dạng `E-code` (ví dụ `E000`, `E001` lỗi nhiệt độ sấy, `E110` lỗi motor đa giác laser) qua bảng mã lỗi Canon Alarm Table (`1.3.6.1.4.1.1602.1.2.2.1.0`).

---

## 3. Bảng Tra Cứu OID Private Canon

Nhánh Enterprise OID: `.1.3.6.1.4.1.1602` (`iso.org.dod.internet.private.enterprises.canon`)

| OID số | Tên ký hiệu OID | Kiểu dữ liệu | Ý nghĩa kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `1.3.6.1.4.1.1602.1.1.1.1.0` | `canonDeviceStatus` | INTEGER | Trạng thái máy in Canon tổng thể | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.2.1.4.0` | `canonSerialNumber` | DisplayString | Số serial phần cứng Canon | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.2.2.1.0` | `canonAlertCode` | INTEGER | Mã số cảnh báo lỗi Canon Alarm Code | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.11.1.3.1.4.101` | `canonTotalCounter101` | Counter32 | Bộ đếm tổng trang in toàn hệ thống | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.11.1.3.1.4.102` | `canonCopyCounter102` | Counter32 | Bộ đếm số trang photocopy | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.11.1.3.1.4.103` | `canonPrintCounter103` | Counter32 | Bộ đếm số trang in từ máy tính | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.11.1.4.1.2` | `canonWasteTonerBox` | INTEGER | Trạng thái hộp mực thải Canon | `DOCUMENTED` |
| `1.3.6.1.4.1.1602.1.11.1.2.1.3` | `canonTrayStatus` | INTEGER | Bảng trạng thái khay giấy Canon | `DOCUMENTED` |
