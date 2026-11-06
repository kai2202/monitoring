# RFC 3805 Printer-MIB & RFC 2790 Host Resources MIB Specification

> **Tiêu chuẩn:** IETF RFC 3805 (Printer MIB v2) & RFC 2790 (Host Resources MIB v2)  
> **Mục đích:** Đặc tả các OID chuẩn quốc tế cho việc giám sát trạng thái, vật tư và bộ đếm máy in  
> **Phân hệ sử dụng:** `backend/src/services/zabbix/`, `TASK-BE-01`, `TASK-BE-04`

---

## 1. RFC 2790 — Trạng Thái Thiết Bị Ngoại Vi (Host Resources Device Table)

Bảng trạng thái cơ bản giúp Zabbix xác định nhanh thiết bị đang sẵn sàng, bận hay gặp lỗi:

| OID | Tên Đối Tượng | Kiểu Dữ Liệu | Ý Nghĩa & Giá Trị |
| :--- | :--- | :---: | :--- |
| `1.3.6.1.2.1.25.3.2.1.5.1` | `hrDeviceStatus` | `INTEGER` | Trạng thái thiết bị:<br>• `1`: unknown (không rõ)<br>• `2`: running (sẵn sàng/hoạt động tốt)<br>• `3`: warning (cảnh báo nhẹ, vẫn in được)<br>• `4`: testing (đang kiểm tra/khởi động)<br>• `5`: down (lỗi phần cứng nghiêm trọng/tắt nguồn) |
| `1.3.6.1.2.1.25.3.5.1.1.1` | `hrPrinterStatus` | `INTEGER` | Trạng thái máy in:<br>• `1`: other<br>• `2`: unknown<br>• `3`: idle (sẵn sàng chờ lệnh in)<br>• `4`: printing (đang in)<br>• `5`: warmup (đang sấy nóng) |
| `1.3.6.1.2.1.25.3.5.1.2.1` | `hrPrinterDetectedErrorState` | `OCTET STRING` | Byte cờ báo lỗi phần cứng phát hiện bởi bo mạch:<br>• Bit 0: lowPaper (hết giấy)<br>• Bit 1: noPaper (khay giấy trống)<br>• Bit 2: lowToner (sắp hết mực)<br>• Bit 3: noToner (hết sạch mực)<br>• Bit 4: doorOpen (nắp máy mở)<br>• Bit 5: jammed (kẹt giấy)<br>• Bit 6: offline (thiết bị ngoại tuyến)<br>• Bit 7: serviceRequested (cần bảo trì) |

---

## 2. RFC 3805 — Bộ Đếm Sản Lượng Trang In (Printer Marker Life Counters)

Bộ đếm cốt lõi phục vụ tính toán sản lượng in tích lũy cả đời máy (Life Count):

| OID | Tên Đối Tượng | Kiểu Dữ Liệu | Ý Nghĩa Kỹ Thuật |
| :--- | :--- | :---: | :--- |
| `1.3.6.1.2.1.43.10.2.1.4.1.1` | `prtMarkerLifeCount` | `Counter32` | **Tổng số trang in tích lũy cả đời máy** (Tổng sản lượng in từ lúc xuất xưởng). Được đọc trong Slow Polling chu kỳ 1 giờ. |
| `1.3.6.1.2.1.43.10.2.1.5.1.1` | `prtMarkerPowerOnCount` | `Counter32` | Số trang in kể từ lần bật nguồn gần nhất (Reset về 0 khi khởi động lại máy). |

---

## 3. RFC 3805 — Mức Vật Tư Tiêu Hao (Printer Marker Supplies Table)

Bảng giám sát mức mực in CMYK, Cụm sấy (Fuser), Trống (Drum), và Hộp mực thải (Waste Toner Box):

| OID | Tên Đối Tượng | Kiểu Dữ Liệu | Ý Nghĩa & Công Thức Tính |
| :--- | :--- | :---: | :--- |
| `1.3.6.1.2.1.43.11.1.1.6.1.<index>` | `prtMarkerSuppliesDescription` | `OCTET STRING` | Tên mô tả vật tư (ví dụ: "Black Toner", "Cyan Toner", "Waste Toner Container", "Drum Unit"). |
| `1.3.6.1.2.1.43.11.1.1.8.1.<index>` | `prtMarkerSuppliesMaxCapacity` | `INTEGER32` | Dung lượng tối đa của hộp vật tư (Ví dụ: 100 hoặc 10000). |
| `1.3.6.1.2.1.43.11.1.1.9.1.<index>` | `prtMarkerSuppliesLevel` | `INTEGER32` | **Mức hiện tại của vật tư**:<br>• Giá trị $\ge 0$: Mức còn lại thực tế.<br>• `-1`: Không xác định dung lượng tối đa nhưng còn hoạt động.<br>• `-2`: Mức không rõ (Unknown).<br>• `-3`: Còn lại một ít (Some remaining). |

### Công thức tính phần trăm mực còn lại:
$$\text{Remaining Percentage (\%)} = \frac{\text{prtMarkerSuppliesLevel}}{\text{prtMarkerSuppliesMaxCapacity}} \times 100\%$$

---

## 4. RFC 3805 — Bảng Mã Cảnh Báo Hoạt Động (Printer Alert Table)

Bảng thông báo các sự kiện bất thường và sự cố phần cứng theo thời gian thực:

| OID | Tên Đối Tượng | Kiểu Dữ Liệu | Ý Nghĩa |
| :--- | :--- | :---: | :--- |
| `1.3.6.1.2.1.43.18.1.1.7.1.<index>` | `prtAlertCode` | `INTEGER` | Mã phân loại sự cố (Ví dụ: `jam`, `coverOpen`, `fuserFailure`, v.v.). |
| `1.3.6.1.2.1.43.18.1.1.8.1.<index>` | `prtAlertDescription` | `OCTET STRING` | Chuỗi mô tả lỗi chi tiết do firmware máy in trả về. |

