# Vendor Enterprise SNMP OIDs & Error Code Architecture

> **Phạm vi:** Các OID doanh nghiệp tư nhân (Private Enterprise MIBs) cho 6 thương hiệu chủ lực  
> **Áp dụng:** Ricoh, Canon, HP, Epson, Brother, Toshiba, Olivetti  
> **Phân hệ sử dụng:** `backend/src/services/zabbix/`, `TASK-BE-01`, `TASK-BE-02`, `TASK-BE-05`

---

## 1. Không Gian Tên Doanh Nghiệp (Private Enterprise Numbers - PEN)

| Thương Hiệu | Enterprise OID Prefix | Ghi Chú Kiến Trúc |
| :--- | :--- | :--- |
| **Ricoh** | `1.3.6.1.4.1.367` | Chủ lực hạm đội. Cung cấp bộ đếm chi tiết SC Codes và bộ đếm Black/Color riêng biệt. |
| **Canon** | `1.3.6.1.4.1.1602` | Chủ lực hạm đội. Hệ thống mã lỗi E-Code (E000 - E999) và bộ đếm theo khổ giấy A3/A4. |
| **Hewlett-Packard (HP)** | `1.3.6.1.4.1.11` | Dòng máy văn phòng. Mã lỗi số 2 chữ số (13.xx Jam, 50.xx Fuser, 59.xx Motor). |
| **Epson** | `1.3.6.1.4.1.268` | Dòng máy in phun màu văn phòng tốc độ cao WorkForce Pro. |
| **Brother** | `1.3.6.1.4.1.2435` | Dòng máy in nhỏ gọn phân bổ tại các phòng ban kế toán / kho. |
| **Toshiba / Olivetti** | `1.3.6.1.4.1.1129` | Thiết bị đa chức năng tích hợp giải pháp in ấn chuyên dụng. |

---

## 2. Ricoh Private MIB (`1.3.6.1.4.1.367`) — Bộ Đếm & Mã Lỗi SC

### 2.1 Bộ đếm sản lượng Mono / Color
- **Tổng trang in Đen Trắng (Mono Life Count):**  
  `1.3.6.1.4.1.367.3.2.1.2.19.1.0`
- **Tổng trang in Màu (Color Life Count):**  
  `1.3.6.1.4.1.367.3.2.1.2.19.2.0`
- **Tổng trang Copy / Print:**  
  `1.3.6.1.4.1.367.3.2.1.2.19.5.0`

### 2.2 Bẫy cảnh báo mã lỗi phần cứng (SC Codes)
- **Mã lỗi SC đang kích hoạt (Active SC Code):**  
  `1.3.6.1.4.1.367.3.2.1.6.1.1.7.1`  
  *Trả về chuỗi số như "541", "542" (Lỗi cụm sấy), "320" (Lỗi gương đa giác laser).*

---

## 3. Canon Private MIB (`1.3.6.1.4.1.1602`) — Bộ Đếm & Mã Lỗi E-Code

### 3.1 Bộ đếm sản lượng
- **Tổng trang in Total (Counter 101):**  
  `1.3.6.1.4.1.1602.1.11.1.3.1.4.101`
- **Tổng trang in Đen Trắng Mono (Counter 102):**  
  `1.3.6.1.4.1.1602.1.11.1.3.1.4.102`
- **Tổng trang in Màu Color (Counter 103):**  
  `1.3.6.1.4.1.1602.1.11.1.3.1.4.103`

### 3.2 Bẫy cảnh báo mã lỗi (Canon E-Codes)
- **Mã lỗi Canon Active Error:**  
  `1.3.6.1.4.1.1602.1.1.1.1.0`  
  *Trả về chuỗi định dạng "E000-0000", "E001-0001", "E020-0000".*

---

## 4. HP Private MIB (`1.3.6.1.4.1.11`) — Mã Lỗi Số & Mức Vật Tư

### 4.1 Bảng mã lỗi số HP (Numeric Codes)
- **Mã lỗi bảng điều khiển (Control Panel Display String):**  
  `1.3.6.1.4.1.11.2.3.9.1.1.7.0`  
  *Trả về chuỗi hiển thị trên màn hình LCD (ví dụ: "50.1 FUSER ERROR", "13.01 PAPER JAM").*

---

## 5. Ánh Xạ Sang Bộ Mã Chuẩn Nội Bộ (`FM-<SUBSYSTEM>-<INDEX>`)

Bộ phân loại lỗi tại tầng Backend (`TASK-BE-02`) tự động chuyển đổi các mã lỗi trên sang chuẩn nội bộ:

$$\text{Vendor Raw Code} \xrightarrow{\text{Error Classification Engine}} \text{FM-<SUBSYSTEM>-<INDEX>}$$

- **`FM-FUS-01`**: Ricoh SC541 / SC542, Canon E000 / E001, HP 50.x (Lỗi cụm sấy quá nhiệt/đứt nhiệt)
- **`FM-OPT-01`**: Ricoh SC320 / SC322, Canon E100, HP 51.x (Lỗi cụm gương quét đa giác Laser)
- **`FM-DRM-01`**: Ricoh SC390 / SC391, Canon E020 (Lỗi cao áp sạc hoặc cảm biến trống Drum)
- **`FM-UNK-01`**: Mã lỗi chưa được định nghĩa trong từ điển (đưa vào hàng đợi kiểm duyệt Unmapped Queue).

