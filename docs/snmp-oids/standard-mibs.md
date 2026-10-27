# Tra Cứu OID Tiêu Chuẩn & MIB Chung (Standard SNMP MIBs)

> **Mục đích:** Tài liệu tra cứu tập trung toàn bộ các OID tiêu chuẩn (RFC 1213 MIB-II, RFC 3805 Printer-MIB, RFC 2790 HOST-RESOURCES-MIB) và OID thay thế chuyên hãng (Vendor Enterprise MIBs) phục vụ cấu hình Zabbix Template 7.0 LTS và hiển thị telemetry trên Web Frontend.  
> **Cấu trúc:** Được tổng hợp theo 6 phân hệ cốt lõi của máy in mạng.

---

## 1. Thông Tin Cơ Bản & Định Danh Thiết Bị (Device Identification)

### 1.1 OID Tiêu Chuẩn (Common OIDs)
Bao gồm các OID tiêu chuẩn theo RFC 1213 (MIB-II), RFC 3805 (Printer-MIB) và RFC 2790 (HOST-RESOURCES-MIB), có cùng địa chỉ và ngữ nghĩa trên hầu hết các dòng máy in mạng tuân thủ chuẩn.

| Feature ID | Tên tính năng | OID | MIB | Kiểu dữ liệu | Model đã xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SYS-01** | Mô tả hệ thống thiết bị (sysDescr) | `1.3.6.1.2.1.1.1.0` | RFC 1213 MIB-II | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **SYS-02** | Tên thiết bị / Hostname mạng (sysName) | `1.3.6.1.2.1.1.5.0` | RFC 1213 MIB-II | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **SYS-03** | Mã định danh hệ thống (sysObjectID) | `1.3.6.1.2.1.1.2.0` | RFC 1213 MIB-II | OBJECT IDENTIFIER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **SYS-04** | Người quản trị liên hệ (sysContact) | `1.3.6.1.2.1.1.4.0` | RFC 1213 MIB-II | DisplayString | Generic Standard (`DOCUMENTED`), Ricoh MP C6004 (`OBSERVED`) |
| **SYS-05** | Vị trí lắp đặt thiết bị (sysLocation) | `1.3.6.1.2.1.1.6.0` | RFC 1213 MIB-II | DisplayString | Generic Standard (`DOCUMENTED`), Ricoh Aficio MP 4002 (`VERIFIED` — 'Lab Draw Room'), Ricoh MP C6004 (`OBSERVED`) |
| **PRT-01** | Tên vận hành máy in (prtGeneralPrinterName) | `1.3.6.1.2.1.43.5.1.1.16.1` | RFC 3805 Printer-MIB | DisplayString | Ricoh MP C6004 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **PRT-02** | Số serial phần cứng (prtGeneralSerialNumber) | `1.3.6.1.2.1.43.5.1.1.17.1` | RFC 3805 Printer-MIB | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 'W533LB00080'), Generic Standard (`DOCUMENTED`) |
| **PRT-03** | Phiên bản firmware (hrDeviceFirmwareRevision) | `1.3.6.1.2.1.25.3.2.1.4.1` | HOST-RESOURCES-MIB | DisplayString | Generic Standard (`DOCUMENTED`), Ricoh MP C6004 (`UNVERIFIED`) |

### 1.2 OID Chuyên Hãng Thay Thế (Alternative Vendor OIDs)
| Feature ID | Model | OID thay thế | MIB | Kiểu dữ liệu | Nguồn tham khảo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PRT-01** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.1.1.1.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`VERIFIED`) — Model 'MP C6004' |
| **PRT-01** | Ricoh Aficio MP 4002 | `1.3.6.1.4.1.367.3.2.1.1.1.1.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`VERIFIED`) — Model 'Aficio MP 4002' |
| **PRT-02** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.2.1.4.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`VERIFIED`) — Serial khung máy 'G736M860609' |
| **PRT-02** | Ricoh Aficio MP 4002 | `1.3.6.1.4.1.367.3.2.1.2.1.4.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`VERIFIED`) — Serial khung máy 'W533LB00080' |
| **PRT-03** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.1.1.2.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`VERIFIED`) — Firmware '1.43' |
| **PRT-03** | Ricoh Aficio MP 4002 | `1.3.6.1.4.1.367.3.2.1.1.1.2.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`VERIFIED`) — Firmware '2.24' |
| **PRT-02** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.2.1.4.0` | Canon Private MIB | DisplayString | Canon Enterprise MIB Guide (`DOCUMENTED`) |

---

## 2. Trạng Thái Hoạt Động & Tính Sẵn Sàng (Printer Status & Availability)

### 2.1 OID Tiêu Chuẩn (Common OIDs)
| Feature ID | Tên tính năng | OID | MIB | Kiểu dữ liệu | Model đã xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **STS-01** | Thời gian chạy liên tục (sysUpTime) | `1.3.6.1.2.1.1.3.0` | RFC 1213 MIB-II | TimeTicks | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **STS-02** | Trạng thái thiết bị phần cứng (hrDeviceStatus) | `1.3.6.1.2.1.25.3.2.1.5.1` | HOST-RESOURCES-MIB | INTEGER | Generic Standard (`DOCUMENTED`), Ricoh MP C6004 (`OBSERVED`) |
| **STS-03** | Trạng thái hoạt động máy in (hrPrinterStatus) | `1.3.6.1.2.1.25.3.5.1.1.1` | HOST-RESOURCES-MIB | INTEGER | Ricoh Aficio MP 4002 (`VERIFIED` — 3: idle), Ricoh MP C6004 (`OBSERVED`), Generic Standard (`DOCUMENTED`) |
| **STS-04** | Cờ phát hiện lỗi thiết bị (hrPrinterDetectedErrorState) | `1.3.6.1.2.1.25.3.5.1.2.1` | HOST-RESOURCES-MIB | OCTET STRING | Generic Standard (`DOCUMENTED`), Ricoh MP C6004, Ricoh Aficio MP 4002 (`OBSERVED`) |
| **STS-05** | Lệnh khởi động lại controller (prtGeneralReset) | `1.3.6.1.2.1.43.5.1.1.3.1` | RFC 3805 Printer-MIB | INTEGER | Generic Standard (`DOCUMENTED`), Ricoh MP C6004 (`OBSERVED`) |
| **STS-06** | Khóa màn hình cảm ứng máy in (prtConsoleDisable) | `1.3.6.1.2.1.43.5.1.1.13.1` | RFC 3805 Printer-MIB | INTEGER | Generic Standard (`DOCUMENTED`), Ricoh MP C6004 (`OBSERVED`) |

### 2.2 OID Chuyên Hãng Thay Thế (Alternative Vendor OIDs)
| Feature ID | Model | OID thay thế | MIB | Kiểu dữ liệu | Nguồn tham khảo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **STS-07** | Ricoh MP C6004 (Trạng thái khối quét Scanner) | `1.3.6.1.4.1.367.3.2.1.2.2.11.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — ricohScannerShareStatus (1=Rảnh) |
| **STS-07** | Ricoh Aficio MP 4002 (Trạng thái khối quét Scanner) | `1.3.6.1.4.1.367.3.2.1.2.2.11.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — ricohScannerShareStatus (1=Rảnh / Sẵn sàng) |
| **STS-08** | Ricoh MP C6004 (Định danh chủng loại ADF) | `1.3.6.1.4.1.367.3.2.1.2.15.1.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — ricohAdfType (3=ARDF/SPDF) |
| **STS-08** | Ricoh Aficio MP 4002 (Định danh chủng loại ADF) | `1.3.6.1.4.1.367.3.2.1.2.15.1.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — ricohAdfType (4=ARDF Type 4) |
| **STS-09** | Ricoh MP C6004 (Tên model khay nạp ADF) | `1.3.6.1.4.1.367.3.2.1.2.15.2.0` | Ricoh Private MIB | DisplayString | snmpwalk thực tế (`OBSERVED`) — 'ARDF DF3090' |
| **STS-03** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.1.1.1.0` | Canon Private MIB | INTEGER | Canon Device Status MIB Guide (`DOCUMENTED`) |

---

## 3. Bộ Đếm Bản In & Sản Lượng In Ấn (Page Counters & Telemetry)

### 3.1 OID Tiêu Chuẩn (Common OIDs)
| Feature ID | Tên tính năng | OID | MIB | Kiểu dữ liệu | Model đã xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CNT-01** | Tổng số trang in trọn đời (prtMarkerLifeCount) | `1.3.6.1.2.1.43.10.2.1.4.1.1` | RFC 3805 Printer-MIB | Counter32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 853.193 trang), Generic Standard (`DOCUMENTED`) |
| **CNT-02** | Đơn vị đo lường bộ đếm (prtMarkerCounterUnit) | `1.3.6.1.2.1.43.10.2.1.3.1.1` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **CNT-03** | Số trang từ lần bật nguồn (prtMarkerPowerOnCount) | `1.3.6.1.2.1.43.10.2.1.5.1.1` | RFC 3805 Printer-MIB | Counter32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 1.336 trang), Generic Standard (`DOCUMENTED`) |

### 3.2 OID Chuyên Hãng Thay Thế (Phân rã MFP In / Copy / Fax)
| Feature ID | Model | OID thay thế | MIB | Kiểu dữ liệu | Nguồn tham khảo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CNT-01** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Tổng bản copy/in ('759913') |
| **CNT-01** | Ricoh Aficio MP 4002 | `1.3.6.1.4.1.367.3.2.1.2.19.1.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Tổng bản copy/in ('853193') |
| **CNT-04** | Ricoh MP C6004 (In mạng / Print Mode) | `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Bản in mạng ('641064') |
| **CNT-04** | Ricoh Aficio MP 4002 (In mạng / Print Mode) | `1.3.6.1.4.1.367.3.2.1.2.19.2.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Bản in mạng ('427014') |
| **CNT-05** | Ricoh MP C6004 (Sao chụp / Copier Mode) | `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Bản photocopy ('116343') |
| **CNT-05** | Ricoh Aficio MP 4002 (Sao chụp / Copier Mode) | `1.3.6.1.4.1.367.3.2.1.2.19.4.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Bản photocopy ('404050') |
| **CNT-06** | Ricoh MP C6004 (Truyền nhận Fax / Fax Mode) | `1.3.6.1.4.1.367.3.2.1.2.19.3.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Bản fax ('2264') |
| **CNT-06** | Ricoh Aficio MP 4002 (Truyền nhận Fax / Fax Mode) | `1.3.6.1.4.1.367.3.2.1.2.19.3.0` | Ricoh Private MIB | Counter32 | snmpwalk thực tế (`VERIFIED`) — Bản fax ('22113') |
| **CNT-01** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.11.1.3.1.4.101` | Canon Private MIB | Counter32 | Canon Counter Guide (`DOCUMENTED`) — Total Counter 101 |
| **CNT-05** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.11.1.3.1.4.102` | Canon Private MIB | Counter32 | Canon Counter Guide (`DOCUMENTED`) — Copy Total Counter 102 |

---

## 4. Quản Lý Mực In & Vật Tư Tiêu Hao (Supplies & Consumables)

### 4.1 OID Tiêu Chuẩn (RFC 3805 prtMarkerSuppliesTable)
| Feature ID | Tên tính năng | OID | MIB | Kiểu dữ liệu | Model đã xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CON-01** | Tên mô tả vật tư (prtMarkerSuppliesDescription) | `1.3.6.1.2.1.43.11.1.1.6` | RFC 3805 Printer-MIB | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **CON-02** | Loại vật tư (prtMarkerSuppliesType) | `1.3.6.1.2.1.43.11.1.1.5` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **CON-03** | Đơn vị đo lường (prtMarkerSuppliesSupplyUnit) | `1.3.6.1.2.1.43.11.1.1.7` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **CON-04** | Dung lượng tối đa (prtMarkerSuppliesMaxCapacity) | `1.3.6.1.2.1.43.11.1.1.8` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **CON-05** | Mức vật tư hiện tại (prtMarkerSuppliesLevel) | `1.3.6.1.2.1.43.11.1.1.9` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **CON-06** | Mức hộp mực thải chuẩn (prtMarkerSuppliesWasteToner) | `1.3.6.1.2.1.43.11.1.1.9.1.2` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — Level 100), Generic Standard (`DOCUMENTED`) |
| **CON-07** | Tuổi thọ cụm trống OPC (prtMarkerSuppliesDrumLevel) | `1.3.6.1.2.1.43.11.1.1.9.1.6` | RFC 3805 Printer-MIB | Integer32 | Generic Standard (`DOCUMENTED`), Ricoh MP C6004 (`UNVERIFIED`) |

### 4.2 OID Chuyên Hãng Thay Thế (Alternative Vendor OIDs)
| Feature ID | Model | OID thay thế | MIB | Kiểu dữ liệu | Nguồn tham khảo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CON-05** | Ricoh Aficio MP 4002 (Mực đen Black %) | `1.3.6.1.4.1.367.3.2.1.2.24.1.1.5.1` | Ricoh Private MIB | Integer32 | snmpwalk thực tế (`VERIFIED`) — Mực đen Black % trực tiếp (40%) |
| **CON-06** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.2.4.1.1` | Ricoh Private MIB | Integer32 | snmpwalk thực tế (`OBSERVED`) — Giá trị 100, quy ước: 100 = Full |
| **CON-05** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.11.1.3.1.4` | Canon Private MIB | Integer32 | Canon Enterprise MIB Guide (`DOCUMENTED`) — Bảng mức mực Canon |
| **CON-06** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.11.1.4.1.2` | Canon Private MIB | Integer32 | Canon Device MIB Guide (`DOCUMENTED`) — Trạng thái hộp mực thải |

---

## 5. Quản Lý Khay Giấy & Cơ Cấu Nạp Giấy (Paper Handling)

### 5.1 OID Tiêu Chuẩn (RFC 3805 prtInputTable & prtOutputTable)
| Feature ID | Tên tính năng | OID | MIB | Kiểu dữ liệu | Model đã xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PPR-01** | Tên khay giấy nạp (prtInputName) | `1.3.6.1.2.1.43.8.2.1.13` | RFC 3805 Printer-MIB | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — Tray 1-4, Bypass Tray), Generic Standard (`DOCUMENTED`) |
| **PPR-02** | Đơn vị đo lượng giấy (prtInputUnit) | `1.3.6.1.2.1.43.8.2.1.8` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 8: sheets), Generic Standard (`DOCUMENTED`) |
| **PPR-03** | Dung lượng chứa tối đa của khay (prtInputMaxCapacity) | `1.3.6.1.2.1.43.8.2.1.9` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 550 tờ/khay, Bypass 100 tờ), Generic Standard (`DOCUMENTED`) |
| **PPR-04** | Mức giấy hiện có trong khay (prtInputCurrentLevel) | `1.3.6.1.2.1.43.8.2.1.10` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **PPR-05** | Trạng thái cơ học khay nạp (prtInputStatus) | `1.3.6.1.2.1.43.8.2.1.11` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 0: normal), Generic Standard (`DOCUMENTED`) |
| **PPR-06** | Kiểu cấu trúc khay nạp (prtInputType) | `1.3.6.1.2.1.43.8.2.1.2` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`), Generic Standard (`DOCUMENTED`) |
| **PPR-07** | Tên khay giấy ra (prtOutputName) | `1.3.6.1.2.1.43.9.2.1.12` | RFC 3805 Printer-MIB | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 'Internal Tray 1'), Generic Standard (`DOCUMENTED`) |
| **PPR-08** | Dung lượng khay ra tối đa (prtOutputMaxCapacity) | `1.3.6.1.2.1.43.9.2.1.4` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 500 tờ), Generic Standard (`DOCUMENTED`) |
| **PPR-09** | Dung lượng còn trống khay ra (prtOutputRemainingCapacity) | `1.3.6.1.2.1.43.9.2.1.5` | RFC 3805 Printer-MIB | Integer32 | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — '-3': Some paper), Generic Standard (`DOCUMENTED`) |

### 5.2 OID Chuyên Hãng Thay Thế (Alternative Vendor OIDs)
| Feature ID | Model | OID thay thế | MIB | Kiểu dữ liệu | Nguồn tham khảo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PPR-04** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.2.2.12.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — Cảm biến bản gốc mặt kính (1=Không, 2=Có giấy) |
| **PPR-04** | Ricoh Aficio MP 4002 | `1.3.6.1.4.1.367.3.2.1.2.2.12.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — Cảm biến bản gốc mặt kính (1=Không có giấy) |
| **PPR-08** | Ricoh MP C6004 | `1.3.6.1.4.1.367.3.2.1.2.20.3.2.1.6.2` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`OBSERVED`) — Trạng thái bộ hoàn thiện Finisher đầu ra |
| **PPR-04** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.11.1.2.1.3` | Canon Private MIB | INTEGER | Canon Paper Feed MIB Guide (`DOCUMENTED`) — Bảng trạng thái khay giấy Canon |

---

## 6. Giám Sát Cảnh Báo Lỗi Phần Cứng (Hardware Errors & Alerts)

> **Ưu tiên dự án:** **ƯU TIÊN CAO NHẤT (#1 Priority)** — Cung cấp thông tin lỗi chính xác, actionable và phục vụ tự động tạo Incident.

### 6.1 OID Tiêu Chuẩn (RFC 3805 prtAlertTable)
| Feature ID | Tên tính năng | OID | MIB | Kiểu dữ liệu | Model đã xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ERR-01** | Chuỗi mô tả cảnh báo lỗi (prtAlertDescription) | `1.3.6.1.2.1.43.18.1.1.8` | RFC 3805 Printer-MIB | DisplayString | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 'Replace Cleaning Web {30402}', 'Replace Fusing Unit {30405}'), Generic Standard (`DOCUMENTED`) |
| **ERR-02** | Mức độ nghiêm trọng lỗi (prtAlertSeverityLevel) | `1.3.6.1.2.1.43.18.1.1.2` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — Level 4 Warning), Generic Standard (`DOCUMENTED`) |
| **ERR-03** | Mã lỗi chuẩn RFC (prtAlertCode) | `1.3.6.1.2.1.43.18.1.1.7` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — Code 1 other / Code 808), Generic Standard (`DOCUMENTED`) |
| **ERR-04** | Phân nhóm phân hệ gặp lỗi (prtAlertGroup) | `1.3.6.1.2.1.43.18.1.1.4` | RFC 3805 Printer-MIB | INTEGER | Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — Group 10 markerSupplies), Generic Standard (`DOCUMENTED`) |
| **ERR-05** | Chỉ số linh kiện trong nhóm (prtAlertGroupIndex) | `1.3.6.1.2.1.43.18.1.1.5` | RFC 3805 Printer-MIB | Integer32 | Generic Standard (`DOCUMENTED`), Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`) |
| **ERR-06** | Mã vị trí phần cứng (prtAlertLocation) | `1.3.6.1.2.1.43.18.1.1.6` | RFC 3805 Printer-MIB | Integer32 | Generic Standard (`DOCUMENTED`), Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED` — 30402, 30405) |
| **ERR-07** | Thời điểm xuất hiện cảnh báo (prtAlertTime) | `1.3.6.1.2.1.43.18.1.1.9` | RFC 3805 Printer-MIB | TimeTicks | Generic Standard (`DOCUMENTED`), Ricoh MP C6004, Ricoh Aficio MP 4002 (`VERIFIED`) |
| **ERR-08** | Tổng số lỗi nghiêm trọng lũy kế (prtAlertCriticalEvents) | `1.3.6.1.2.1.43.5.1.1.18.1` | RFC 3805 Printer-MIB | Counter32 | Ricoh MP C6004 (`OBSERVED`), Generic Standard (`DOCUMENTED`) |
| **ERR-09** | Tổng số lỗi tất cả các mức lũy kế (prtAlertAllEvents) | `1.3.6.1.2.1.43.5.1.1.19.1` | RFC 3805 Printer-MIB | Counter32 | Ricoh MP C6004 (`OBSERVED`), Generic Standard (`DOCUMENTED`) |

### 6.2 OID Chuyên Hãng Thay Thế (Phân Hệ Khối Phần Cứng Độc Lập)
| Feature ID | Model | OID thay thế | MIB | Kiểu dữ liệu | Nguồn tham khảo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ERR-10** | Ricoh MP C6004 (Lỗi phần cứng Scanner/ADF) | `1.3.6.1.4.1.367.3.2.1.2.2.13.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — ricohScannerErrorStatus (0/1=Bình thường) |
| **ERR-10** | Ricoh Aficio MP 4002 (Lỗi phần cứng Scanner/ADF) | `1.3.6.1.4.1.367.3.2.1.2.2.13.0` | Ricoh Private MIB | INTEGER | snmpwalk thực tế (`VERIFIED`) — ricohScannerErrorStatus (0=Bình thường) |
| **ERR-11** | Ricoh MP C6004 (Bitmask lỗi Scanner) | `1.3.6.1.4.1.367.3.2.1.2.2.18.0` | Ricoh Private MIB | INTEGER (bitmask) | snmpwalk thực tế (`VERIFIED`) — ricohScannerErrorSummary (0=Sạch) |
| **ERR-11** | Ricoh Aficio MP 4002 (Bitmask lỗi Scanner) | `1.3.6.1.4.1.367.3.2.1.2.2.18.0` | Ricoh Private MIB | INTEGER (bitmask) | snmpwalk thực tế (`VERIFIED`) — ricohScannerErrorSummary (0=Sạch) |
| **ERR-12** | Ricoh MP C6004 (Bitmask lỗi hệ thống nền tảng MFP) | `1.3.6.1.4.1.367.3.2.1.2.2.20.0` | Ricoh Private MIB | INTEGER (bitmask) | snmpwalk thực tế (`VERIFIED`) — ricohMfpErrorSummary (0=Sạch) |
| **ERR-12** | Ricoh Aficio MP 4002 (Bitmask lỗi hệ thống nền tảng MFP) | `1.3.6.1.4.1.367.3.2.1.2.2.20.0` | Ricoh Private MIB | INTEGER (bitmask) | snmpwalk thực tế (`VERIFIED`) — ricohMfpErrorSummary (0=Sạch) |
| **ERR-13** | Ricoh MP C6004 (Bitmask lỗi ứng dụng sao chụp Copier) | `1.3.6.1.4.1.367.3.2.1.2.2.22.0` | Ricoh Private MIB | INTEGER (bitmask) | snmpwalk thực tế (`VERIFIED`) — ricohCopyErrorSummary (1=Cảnh báo) |
| **ERR-13** | Ricoh Aficio MP 4002 (Bitmask lỗi ứng dụng sao chụp Copier) | `1.3.6.1.4.1.367.3.2.1.2.2.22.0` | Ricoh Private MIB | INTEGER (bitmask) | snmpwalk thực tế (`VERIFIED`) — ricohCopyErrorSummary (1=Cảnh báo cuộn lau sấy) |
| **ERR-03** | Canon imageRUNNER ADVANCE | `1.3.6.1.4.1.1602.1.2.2.1.0` | Canon Private MIB | INTEGER | Canon Alarm & Error Code Table (`DOCUMENTED`) |
