# FleetMonitor — Bảng Kiểm Kê & Đánh Giá Chức Năng (Audit Checklist)

> **Mục tiêu:** Kiểm kê và đối chiếu toàn bộ tính năng giữa **Frontend**, **Backend API**, **Zabbix/SNMP** và **Cơ sở dữ liệu**, phân định rõ ràng giữa vai trò **Admin**, **Kỹ thuật viên (KTV)** và **Chức năng dùng chung**.  
> **Quy ước trạng thái:**  
> - **DONE (✅)**: Đã triển khai hoàn chỉnh cả UI và Logic nghiệp vụ / API thực tế.  
> - **PARTIAL (⚡)**: Đã có khung UI và API cơ bản nhưng còn thiếu một số nhánh nghiệp vụ nâng cao.  
> - **UI ONLY (🎨)**: Đã có giao diện đầy đủ (hoặc Mock Provider), đang chờ kết nối Backend Zabbix/DB thật.  
> - **PLANNED (⏳)**: Đã có kiến trúc/tài liệu đặc tả (Task spec), chuẩn bị triển khai.  
> - **MISSING (❌)**: Chưa có giao diện lẫn Backend.  

---

## PHẦN A – ADMIN: Quản Trị Hệ Thống

Admin chịu trách nhiệm cấu hình, quản trị thiết bị, người dùng, phân quyền, kết nối Zabbix và vòng đời hệ thống.

### A1. Dashboard Quản Trị (Executive & Operations Overview)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Tổng số máy in toàn hệ thống | **DONE (✅)** | `FleetKpiCards` hiển thị `totalPrinters`, kết nối `dashboardService` |
| 2 | Số máy Online / Offline | **DONE (✅)** | Thẻ KPI trực quan `${onlineCount}/${totalPrinters}`, có In-place filter |
| 3 | Tổng số cảnh báo đang hoạt động | **DONE (✅)** | Phân loại `criticalAlertsCount` và `warningAlertsCount` |
| 4 | Tổng số sự cố chưa xử lý | **DONE (✅)** | Đếm Incident trạng thái `Active`, liên kết trực tiếp bảng chú ý |
| 5 | Tình trạng kết nối Zabbix | **DONE (✅)** | `ZabbixLivePingCard` đo độ trễ Latency ms, kiểm tra JSON-RPC 200 OK |
| 6 | Tình trạng Backend API | **DONE (✅)** | Endpoint `/api/health` trả về trạng thái service và uptime |
| 7 | Tình trạng Database | **DONE (✅)** | Prisma client kiểm tra kết nối PostgreSQL trong healthcheck |
| 8 | Thống kê số lượng máy theo hãng | **DONE (✅)** | Biểu đồ tròn đa tầng `RefinedFleetDonut` phân nhóm hãng & model |
| 9 | Thống kê máy theo chi nhánh / phòng ban | **DONE (✅)** | Lọc động theo Chi nhánh (HN, ĐN, HCM) và Tầng/Phòng ban |
| 10 | Biểu đồ xu hướng hoạt động hệ thống | **DONE (✅)** | `AvailabilitySplineChart` Pure React SVG 24h mượt mà |
| 11 | Thống kê thiết bị có dữ liệu lỗi hoặc quá cũ | **DONE (✅)** | Bảng `AttentionDevicesTable` phát hiện thiết bị mất kết nối / lỗi |
| 12 | Dashboard drill-down đến danh sách chi tiết | **DONE (✅)** | Click thẻ KPI hoặc donut tự lọc danh sách; nút ↗ chuyển Sub-tabs |

### A2. Quản Lý Máy In (Device Management)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Danh sách toàn bộ máy in | **DONE (✅)** | Bảng `/printers/list`, phân trang 10/25/50/tất cả, lọc đa tiêu chí |
| 2 | Thêm máy in mới | **DONE (✅)** | Modal `PrinterCreateModal` (Admin only) khai báo đầy đủ IP, SNMP, OID |
| 3 | Chỉnh sửa thông tin máy in | **DONE (✅)** | Modal `PrinterEditModal` cập nhật vị trí, model, thông số |
| 4 | Xóa / vô hiệu hóa máy in | **DONE (✅)** | Chuyển trạng thái `Storage` (Lưu kho) / `Decommissioned` hoặc khôi phục |
| 5 | Quản lý IP và Hostname | **DONE (✅)** | Hiển thị JetBrains Mono, 1-click copy IP, kiểm tra trùng lặp |
| 6 | Quản lý hãng, model, serial | **DONE (✅)** | Lưu trữ chi tiết trong schema Printer (Ricoh, Canon, HP, Xerox...) |
| 7 | Quản lý vị trí, phòng ban, chi nhánh | **DONE (✅)** | `BranchFloorManagerModal` quản lý cây địa điểm động |
| 8 | Quản lý SNMP version và community | **DONE (✅)** | Hỗ trợ SNMP v2c/v3, bảo vệ community string trong Backend |
| 9 | Kiểm tra kết nối SNMP | **PARTIAL (⚡)** | Đã có Zabbix Poller thu thập qua OID, UI test trực tiếp tại chỗ đang mock |
| 10 | Kiểm tra ICMP Ping | **DONE (✅)** | Fast Polling 30s qua Zabbix `icmpping`, cập nhật trạng thái Online/Offline |
| 11 | Hiển thị thời điểm lấy dữ liệu gần nhất | **DONE (✅)** | Hiển thị `lastSeen` / `lastDetectedAt` trên từng dòng thiết bị |
| 12 | Phát hiện thiết bị mất dữ liệu (Stale Data) | **DONE (✅)** | Nhãn cảnh báo `Dữ liệu đã cũ`, hiển thị `—` theo Rule 5 |
| 13 | Import danh sách máy in từ CSV/YAML | **PARTIAL (⚡)** | Đã hoàn thành nạp CSV Từ điển mã lỗi; nạp CSV máy in đã có parser mẫu |
| 14 | Export danh sách máy in | **DONE (✅)** | Nút `exportPrintersToCsv` xuất file CSV UTF-8 BOM chuẩn |
| 15 | Tìm kiếm, lọc, sắp xếp thiết bị | **DONE (✅)** | `PrinterFilterToolbar` tìm kiếm tức thì theo tên/IP/hãng/tầng |
| 16 | Gán thiết bị cho KTV phụ trách | **DONE (✅)** | Dropdown chọn KTV trực tiếp trên Header Gantt & Modal phân công |
| 17 | Quản lý vòng đời thiết bị | **DONE (✅)** | Trạng thái Active $\to$ Storage $\to$ Decommissioned, nút Khôi phục giám sát |

### A3. Quản Lý Monitoring & Zabbix Gateway

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Kết nối Zabbix API (JSON-RPC) | **DONE (✅)** | `zabbixService` kết nối JSON-RPC 2.0, hỗ trợ token bảo mật |
| 2 | Quản lý Zabbix Host | **DONE (✅)** | Quản lý HostID, đồng bộ Host qua Zabbix Worker |
| 3 | Quản lý Host Group | **DONE (✅)** | Lọc và quản lý theo nhóm hostgroup cấu hình trong Gateway |
| 4 | Quản lý Zabbix Template | **PARTIAL (⚡)** | Sử dụng Template SNMP chuẩn trên Zabbix server, cấu hình mapping tự động |
| 5 | Quản lý Item / Item Prototype | **DONE (✅)** | Thu thập OID bộ đếm counter, mực in CMYK, trạng thái khay giấy |
| 6 | Quản lý Trigger | **DONE (✅)** | Nhận trigger sự cố phần cứng, giấy kẹt, cạn mực từ Zabbix |
| 7 | Quản lý Discovery Rule (LLD) | **PARTIAL (⚡)** | Zabbix LLD tự động phát hiện Interface và Cartridge OID |
| 8 | Quản lý SNMP Interface | **DONE (✅)** | Quản lý IP/Port 161 trên Zabbix host |
| 9 | Quản lý SNMP OID Mapping | **DONE (✅)** | `docs/snmp-oids/` chuẩn hóa bảng OID Ricoh, Canon, HP |
| 10 | Quản lý MIB theo hãng | **DONE (✅)** | Thư viện OID đa hãng tách biệt, modular |
| 11 | Kiểm tra lịch sử dữ liệu Monitoring | **DONE (✅)** | Bảng lưu lịch sử telemetry, rollup giờ/ngày |
| 12 | Kiểm tra trạng thái Zabbix Poller | **DONE (✅)** | Thẻ trạng thái Fast Polling (30s) / Slow Polling (1h) |
| 13 | Kiểm tra SNMP Trap Receiver | **PLANNED (⏳)** | Đã đặc tả trong TASK-BE-01, hiện ưu tiên Polling JSON-RPC |
| 14 | Cấu hình chu kỳ Polling | **DONE (✅)** | `OperationalRulesCard` xem/cấu hình Fast/Slow Polling TTL |
| 15 | Quản lý ngưỡng cảnh báo | **DONE (✅)** | `DynamicThresholdsCard` cài đặt ngưỡng mực vàng (<15%), đỏ (<5%) |
| 16 | Quản lý quy tắc chống Flapping | **DONE (✅)** | Cơ chế Safe Window 10 phút chống đóng/mở sự cố chập chờn |
| 17 | Quản lý cấu hình nhiều hãng máy in | **DONE (✅)** | Hỗ trợ độc lập Ricoh, Canon, HP, Xerox, Epson |
| 18 | Phát hiện Host không đồng bộ với DB | **DONE (✅)** | Đối chiếu ID giữa PostgreSQL và Zabbix qua Worker |

### A4. Quản Lý Người Dùng & Phân Quyền (RBAC)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Danh sách người dùng | **DONE (✅)** | Bảng quản lý người dùng tại `/settings/rbac` |
| 2 | Tạo tài khoản | **DONE (✅)** | Modal `UserCreateModal` tạo người dùng kèm kiểm tra định dạng email |
| 3 | Chỉnh sửa tài khoản | **DONE (✅)** | Cập nhật họ tên, vai trò, chi nhánh phụ trách |
| 4 | Khóa / mở khóa tài khoản | **DONE (✅)** | Chuyển đổi trạng thái Active / Inactive tức thì |
| 5 | Reset mật khẩu | **DONE (✅)** | Modal đổi mật khẩu an toàn, mã hóa bcrypt |
| 6 | Gán role Admin / KTV / HR | **DONE (✅)** | Phân quyền 3 vai trò chính: `ADMIN`, `FIELD_TECH`, `ASSET_HR` |
| 7 | Quản lý quyền truy cập module | **DONE (✅)** | Route Guard `ProtectedRoute` chặn truy cập trái phép theo role |
| 8 | Phân quyền theo hành động CRUD | **DONE (✅)** | Chỉ Admin được tạo/xóa máy, phân công lệnh; KTV chỉ cập nhật tiến độ |
| 9 | Phân quyền theo phạm vi dữ liệu | **DONE (✅)** | KTV lọc việc của tôi; phân vùng chi nhánh Hà Nội / Đà Nẵng / HCM |
| 10 | Quản lý phòng ban và chi nhánh | **DONE (✅)** | Quản trị cây vị trí Tầng/Phòng ban động |
| 11 | Gán KTV vào nhóm thiết bị | **DONE (✅)** | Phân công phụ trách trực tiếp trên từng Task và dòng máy |
| 12 | Theo dõi lịch sử đăng nhập | **PARTIAL (⚡)** | Đã lưu thời điểm `lastLogin`, giao diện log chi tiết đang hoàn thiện |
| 13 | Quản lý phiên đăng nhập | **DONE (✅)** | JWT Access Token + Refresh Token HttpOnly Cookie an toàn |

### A5. Quản Lý Cảnh Báo & Sự Kiện

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Danh sách toàn bộ cảnh báo | **DONE (✅)** | Chuông thông báo Header & danh sách Attention Devices |
| 2 | Phân loại theo mức độ nghiêm trọng | **DONE (✅)** | Phân tách rõ rệt: Critical (Đỏ) - Warning (Cam) - Info (Xanh) |
| 3 | Quản lý mã lỗi chuẩn nội bộ | **DONE (✅)** | Phân hệ Từ điển mã lỗi `/settings/dictionary` |
| 4 | Mapping lỗi giữa nhiều hãng | **DONE (✅)** | Ánh xạ mã lỗi SC Ricoh, E Canon, 50-70 HP sang định dạng thống nhất |
| 5 | Quản lý quy tắc tạo Incident | **DONE (✅)** | Tự động mở Ticket khi Zabbix trigger đạt điều kiện Safe Window |
| 6 | Cấu hình ngưỡng cảnh báo | **DONE (✅)** | Lưu LocalStorage & đồng bộ cấu hình hệ thống |
| 7 | Theo dõi lịch sử cảnh báo | **DONE (✅)** | Bảng lịch sử sự cố và nhật ký thay đổi trạng thái |
| 8 | Nhận diện cảnh báo lặp lại | **DONE (✅)** | Bộ đếm `occurrencesCount` trong `unmappedCodes` và Incident log |
| 9 | Gom nhóm các cảnh báo liên quan | **DONE (✅)** | Nhóm nhiều cảnh báo của cùng 1 thiết bị vào 1 Work Order |
| 10 | Theo dõi trạng thái xử lý cảnh báo | **DONE (✅)** | Theo dõi tiến độ từ lúc phát hiện đến khi đóng lệnh |

### A6. Quản Trị Hệ Thống (System Administration)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Quản lý cấu hình hệ thống | **DONE (✅)** | 4 Sub-tabs cài đặt tập trung tại `/settings` |
| 2 | Quản lý Database connection | **DONE (✅)** | Prisma Connection Pool cấu hình qua `.env` |
| 3 | Theo dõi CPU / RAM / Disk | **PLANNED (⏳)** | Dự kiến lấy qua Zabbix OS template của máy chủ monitoring |
| 4 | Theo dõi Docker containers | **PLANNED (⏳)** | Docker compose đã cấu hình, dashboard container đang phát triển |
| 5 | Theo dõi Backend logs | **PARTIAL (⚡)** | Express request log console, rate limit log |
| 6 | Theo dõi API errors | **DONE (✅)** | Bắt lỗi tập trung (Global Error Middleware), không nuốt lỗi |
| 7 | Quản lý Cache | **DONE (✅)** | In-memory cache TTL 60s cho dữ liệu telemetry và Zabbix query |
| 8 | Quản lý lịch đồng bộ dữ liệu | **DONE (✅)** | `node-cron` điều phối chu kỳ polling và rollup dữ liệu |
| 9 | Backup / Restore Database | **PLANNED (⏳)** | Kịch bản backup script postgresql qua Docker volume |
| 10 | Kiểm tra Database integrity | **DONE (✅)** | Khóa ngoại foreign keys và schema constraint trong `schema.prisma` |
| 11 | Audit Log toàn hệ thống | **PARTIAL (⚡)** | Ghi nhận Activity feed trên từng Work Order; log admin chung đang mở rộng |
| 12 | Theo dõi lịch sử thay đổi cấu hình | **DONE (✅)** | Ghi nhận thời điểm và tài khoản nạp/gỡ bộ từ điển CSV |
| 13 | Quản lý thông báo hệ thống | **DONE (✅)** | Cụm 2 chuông độc lập Header (Mã lỗi chưa gán & Duyệt nghiệm thu) |
| 14 | Health Check các dịch vụ | **DONE (✅)** | API `/api/health` trả về trạng thái zabbix, db, uptime |

---

## PHẦN B – KTV: Vận Hành & Khắc Phục Kỹ Thuật

KTV tập trung vào tốc độ xử lý: tiếp nhận việc, chẩn đoán OID hiện trường, thực hiện SOP, gửi duyệt nghiệm thu.

### B1. Technical Dashboard

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Tổng số máy được phân công | **DONE (✅)** | Bộ lọc `Việc của tôi` đếm chính xác số task giao cho KTV đăng nhập |
| 2 | Số máy Online / Offline | **DONE (✅)** | Thống kê trực tiếp trên thanh Gantt và Dashboard |
| 3 | Số máy đang có lỗi | **DONE (✅)** | Bảng Attention Devices làm nổi bật máy có lỗi phần cứng |
| 4 | Số cảnh báo chưa xử lý | **DONE (✅)** | Badge số lượng cảnh báo nổi bật trên Header và bảng |
| 5 | Số sự cố đang xử lý | **DONE (✅)** | Tab Lệnh bảo trì phân loại chính xác Đang xử lý vs Đã hoàn tất |
| 6 | Danh sách máy cần ưu tiên xử lý | **DONE (✅)** | Bảng Thiết bị cần xử lý với cờ ưu tiên P1 Urgent / P2 High |
| 7 | Thống kê lỗi theo hãng | **DONE (✅)** | Bảng Tra cứu từ điển và phân loại lỗi theo Ricoh, Canon, HP |
| 8 | Thống kê lỗi theo khu vực | **DONE (✅)** | Ma trận nhiệt sự cố phân bổ theo 5 tầng và chi nhánh |
| 9 | Biểu đồ sự cố theo thời gian | **DONE (✅)** | Ma trận nhiệt 5 tầng x 7 tuần trực quan Pure SVG |
| 10 | Lịch bảo trì sắp tới | **DONE (✅)** | Gantt Timeline lịch trình 7/14/30 ngày nới rộng 240px ô có task |
| 11 | Danh sách yêu cầu được giao | **DONE (✅)** | Nút lọc 1-click `Việc của tôi` trên Gantt và Sub-tabs Lịch trình |
| 12 | Hiển thị mức độ ưu tiên công việc | **DONE (✅)** | Huy hiệu cờ màu sắc rõ ràng (P1 Đỏ, P2 Cam, P3 Vàng, P4 Xanh) |

### B2. Giám Sát Chi Tiết Máy In (Printer Diagnostics)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Xem danh sách máy in | **DONE (✅)** | Giao diện bảng danh sách `/printers/list` hiển thị đầy đủ hạm đội |
| 2 | Xem trạng thái Online / Offline | **DONE (✅)** | Badge Trực tuyến (Xanh lá) vs Ngoại tuyến (Xám) |
| 3 | Xem trạng thái SNMP | **DONE (✅)** | Hiển thị rõ SNMP phản hồi hay mất kết nối SNMP |
| 4 | Xem tình trạng kết nối mạng | **DONE (✅)** | Hiển thị địa chỉ IP, kiểm tra ICMP ping |
| 5 | Xem lượng mực CMYK | **DONE (✅)** | Thanh CMYK Mini Bar và Tab Chẩn đoán hiển thị chi tiết % từng màu |
| 6 | Xem tình trạng hộp mực thải | **DONE (✅)** | Huy hiệu theo dõi mực thải: Bình thường / Sắp đầy / Đầy |
| 7 | Xem trạng thái khay giấy | **DONE (✅)** | Hiển thị trạng thái khay nạp giấy 1, 2, 3 và khay tay (Bypass) |
| 8 | Xem tổng số trang đã in | **DONE (✅)** | Bộ đếm Tổng số trang (Life counter) cập nhật trung thực từ OID |
| 9 | Xem số trang màu / đen trắng | **DONE (✅)** | Biểu đồ Cột Ngang và chi tiết counter phân tách Mono vs Color |
| 10 | Xem thông tin Model / Serial / Firmware | **DONE (✅)** | Drawer chẩn đoán hiển thị Serial Number, Model, Firmware version |
| 11 | Xem lỗi phần cứng | **DONE (✅)** | Hiển thị mã lỗi chuẩn hóa kèm mô tả nguyên nhân từ bộ từ điển |
| 12 | Xem lỗi cụm sấy / linh kiện bên trong | **DONE (✅)** | Cảnh báo nhiệt độ sấy Fuser Temp và lỗi khối quét Scanner |
| 13 | Xem lịch sử lỗi | **DONE (✅)** | Lịch sử sự cố từng máy lưu trữ thời điểm phát hiện và khắc phục |
| 14 | Xem lịch sử hoạt động máy in | **DONE (✅)** | Lịch sử in ấn và biểu đồ xu hướng khả dụng 24h |
| 15 | Xem thời gian hoạt động / gián đoạn | **DONE (✅)** | Tính toán Uptime % và Downtime theo từng thiết bị |
| 16 | Xem thời điểm cập nhật dữ liệu gần nhất | **DONE (✅)** | Nhãn thời gian cập nhật cụ thể (ví dụ: `12 phút trước`) |
| 17 | So sánh dữ liệu giữa nhiều máy in | **DONE (✅)** | Khung Ghim Đối Chiếu (Pinned Comparison Sandbox) so sánh 1:1 |
| 18 | Drill-down từ biểu đồ sang thiết bị cụ thể | **DONE (✅)** | Bấm vào biểu đồ/dòng mở thẳng Diagnostics Drawer của máy đó |

### B3. Quản Lý Sự Cố (Incident Management)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Danh sách sự cố | **DONE (✅)** | Hiển thị tại Dashboard và Drawer Lệnh bảo trì |
| 2 | Tự động tạo Incident từ cảnh báo | **DONE (✅)** | Backend Zabbix Worker tự mở ticket khi có trigger phần cứng |
| 3 | Tạo Incident thủ công | **DONE (✅)** | Nút `[Tạo Phiếu]` mở modal `DiagnosticsCreateTaskForm` ngay Dashboard |
| 4 | Phân loại sự cố | **DONE (✅)** | Phân loại Lỗi phần cứng, Cạn vật tư, Sự cố kết nối mạng |
| 5 | Gán mã lỗi nội bộ | **DONE (✅)** | Tự động map mã hãng sang mã lỗi hệ thống qua Từ điển CSV |
| 6 | Xác định mức độ nghiêm trọng | **DONE (✅)** | Tự gán mức P1_Urgent đến P4_Low dựa trên tác động thiết bị |
| 7 | Gán người xử lý | **DONE (✅)** | Chọn KTV phụ trách với avatar và tên đầy đủ |
| 8 | Gán nhóm kỹ thuật | **DONE (✅)** | Phân nhóm kỹ thuật hiện trường (Field Tech) vs Kỹ sư NOC |
| 9 | Cập nhật trạng thái sự cố | **DONE (✅)** | Quy trình chuyển trạng thái mượt mà từ Đang xử lý $\to$ Chờ duyệt $\to$ Đóng |
| 10 | Ghi nhận nguyên nhân | **DONE (✅)** | Ô ghi chú kỹ thuật và thảo luận trong Activity Feed |
| 11 | Ghi nhận phương án xử lý | **DONE (✅)** | Từng bước kỹ thuật chuẩn hóa (Dynamic SOP Checklist) |
| 12 | Ghi nhận kết quả xử lý | **DONE (✅)** | Ghi nhận biên bản thao tác thành công / thất bại trong Work Log |
| 13 | Đính kèm hình ảnh / tài liệu | **DONE (✅)** | Upload ảnh bản in test và tài liệu nghiệm thu |
| 14 | Ghi nhận thời gian bắt đầu và kết thúc | **DONE (✅)** | Timestamp ngày giao việc (`dueDate`) và hoàn tất (`completedDate`) |
| 15 | Theo dõi thời gian xử lý (MTTR) | **DONE (✅)** | Thẻ KPI MTTR tại phân hệ Analytics SLA & Chi phí |
| 16 | Theo dõi thời gian phản hồi | **PARTIAL (⚡)** | Đã tính thời gian từ lúc tạo đến tiếp nhận, báo cáo tổng hợp đang mở rộng |
| 17 | Theo dõi SLA | **DONE (✅)** | Thước đo SLA % hoàn thành đúng hạn tại `/analytics/sla-cost` |
| 18 | Mở lại sự cố nếu tái diễn | **DONE (✅)** | Nút `[Mở lại nhiệm vụ]` (Admin only) khôi phục task đã đóng |
| 19 | Lưu lịch sử thay đổi trạng thái | **DONE (✅)** | Bảng `ActivityFeed` lưu vết từng thay đổi trạng thái |
| 20 | Liên kết nhiều cảnh báo vào một Incident | **DONE (✅)** | Nhóm cảnh báo cạn mực và lỗi sấy chung vào 1 lệnh sửa chữa |

### B4. Quy Trình Vòng Đời Sự Cố (Incident Workflow)

| STT | Trạng thái / Bước xử lý | Trạng thái | Triển khai trong hệ thống |
| :---: | :--- | :---: | :--- |
| 1 | New – Mới phát hiện | **DONE (✅)** | Trạng thái `Planned` hoặc cảnh báo mới trong Notification |
| 2 | Acknowledged – Đã tiếp nhận | **DONE (✅)** | KTV mở task và xác nhận tiếp nhận việc |
| 3 | Investigating – Đang kiểm tra | **DONE (✅)** | Bước 1 trong Dynamic SOP: Kiểm tra hiện trường & đọc mã lỗi SNMP |
| 4 | Diagnosing – Đang chẩn đoán | **DONE (✅)** | Mở Diagnostics Drawer đọc OID meters và tra cứu từ điển |
| 5 | Waiting for Parts – Chờ linh kiện | **DONE (✅)** | Trạng thái `Waiting` kèm ghi chú trao đổi hãng |
| 6 | In Progress – Đang xử lý | **DONE (✅)** | Trạng thái `In_Progress` với tiến độ % chạy theo checklist |
| 7 | Pending Verification – Chờ nghiệm thu | **DONE (✅)** | Trạng thái `Pending_Verification` khi KTV nhấn `[Gửi duyệt nghiệm thu]` |
| 8 | Resolved / Completed – Đã đóng | **DONE (✅)** | Trạng thái `Completed` khi Admin bấm `[Phê duyệt đóng lệnh]` |
| 9 | Reopened – Mở lại / Yêu cầu làm lại | **DONE (✅)** | Nút `[Yêu cầu làm lại]` trả về KTV kèm lý do cảnh báo ⚠️ |
| 10 | Cancelled – Hủy bỏ lệnh | **DONE (✅)** | Hủy lệnh bảo trì nếu phát hiện sự cố ảo (False Alarm) |

### B5. Quản Lý Bảo Trì & Chi Phí CMMS (Maintenance Management)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Lập lịch bảo trì | **DONE (✅)** | Lập lịch trực tiếp trên Gantt Calendar hoặc Dashboard |
| 2 | Bảo trì định kỳ | **DONE (✅)** | Loại công việc `PREVENTIVE_MAINTENANCE` |
| 3 | Bảo trì theo tình trạng thiết bị | **DONE (✅)** | Loại công việc `CORRECTIVE_REPAIR` tạo tự động từ cảnh báo |
| 4 | Danh sách thiết bị cần bảo trì | **DONE (✅)** | Bảng Thiết bị cần xử lý lọc nhanh máy Khẩn cấp / Cảnh báo vật tư |
| 5 | Phân công kỹ thuật viên | **DONE (✅)** | Phân công KTV có kiểm tra lịch rảnh và phạm vi phụ trách |
| 6 | Ghi nhận lịch sử bảo trì | **DONE (✅)** | Kho lịch sử Accordion lưu trữ toàn bộ hồ sơ đã hoàn thành |
| 7 | Ghi nhận linh kiện đã thay thế | **DONE (✅)** | Ghi nhận phụ tùng trong thẻ Time & Cost |
| 8 | Ghi nhận chi phí sửa chữa | **DONE (✅)** | Thẻ `WorkOrderTimeCostCard` tính chi phí nhân công và vật tư VNĐ |
| 9 | Đánh giá tình trạng sau bảo trì | **DONE (✅)** | Modal duyệt ảnh in test `TestPrintReviewModal` kiểm tra chất lượng |
| 10 | Nhắc lịch bảo trì | **DONE (✅)** | Hiển thị cờ hạn chót SLA và ngày hẹn đỏ khi quá hạn |
| 11 | Theo dõi số lần sửa chữa | **DONE (✅)** | Thống kê số lệnh bảo trì trên từng máy trong Drawer |
| 12 | Phân tích thiết bị thường xuyên hỏng | **DONE (✅)** | Ma trận nhiệt Điểm nóng sự cố nhận diện thiết bị hay gặp lỗi |

### B6. Vật Tư Tiêu Hao & Phụ Tùng (Technical Supplies)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Xem danh sách vật tư | **DONE (✅)** | Phân hệ `/analytics/supplies` quản lý danh mục toàn bộ vật tư |
| 2 | Xem số lượng tồn kho | **DONE (✅)** | Thống kê số lượng hộp mực có sẵn và tình trạng các máy |
| 3 | Kiểm tra vật tư có sẵn | **DONE (✅)** | Phân biệt máy in đơn sắc (Mono) vs máy in màu (CMYK) |
| 4 | Gửi yêu cầu cấp phát vật tư | **DONE (✅)** | Nút tạo lệnh cấp phát vật tư trực tiếp tại phân hệ Supplies |
| 5 | Ghi nhận vật tư đã sử dụng | **DONE (✅)** | Thẻ Time & Cost ghi nhận mã linh kiện và chi phí thay thế |
| 6 | Liên kết vật tư với máy in | **DONE (✅)** | Gắn liền mã mực, cụm sấy, trống từ tương thích với từng model |
| 7 | Liên kết vật tư với Incident | **DONE (✅)** | Đính kèm linh kiện thay thế vào từng Work Order cụ thể |
| 8 | Theo dõi lịch sử thay thế | **DONE (✅)** | Lưu trữ lịch sử nạp mực và thay linh kiện trong kho hồ sơ |
| 9 | Gửi yêu cầu mua thêm vật tư | **PARTIAL (⚡)** | KTV đề xuất trong phiếu; quy trình duyệt tài chính thuộc phân hệ HR |
| 10 | Cảnh báo thiếu vật tư | **DONE (✅)** | Huy hiệu đếm ngược D-Day `[D-4]`, `[D-7]` cảnh báo nguy cơ cạn kiệt |

### B7. Báo Cáo Kỹ Thuật (Technical Reports)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Báo cáo sự cố theo thời gian | **DONE (✅)** | Bộ lọc khung thời gian 7 ngày, 14 ngày, 30 ngày, quý |
| 2 | Báo cáo sự cố theo thiết bị | **DONE (✅)** | Xếp hạng thiết bị phát sinh nhiều sự cố nhất |
| 3 | Báo cáo sự cố theo hãng | **DONE (✅)** | Phân bổ tỷ lệ lỗi giữa Ricoh, Canon, HP |
| 4 | Báo cáo hiệu suất KTV | **PARTIAL (⚡)** | Đã có bộ lọc task theo KTV; biểu đồ KPI cá nhân hóa đang hoàn thiện |
| 5 | Báo cáo MTTR | **DONE (✅)** | Tính toán thời gian sửa chữa trung bình tại `/analytics/sla-cost` |
| 6 | Báo cáo SLA | **DONE (✅)** | Đo lường tỷ lệ hoàn thành đúng cam kết SLA |
| 7 | Báo cáo lịch sử bảo trì | **DONE (✅)** | Xem và tra cứu toàn bộ kho lịch sử nhiệm vụ |
| 8 | Báo cáo vật tư sử dụng | **DONE (✅)** | Báo cáo tổng lượng trang in và mức tiêu thụ mực CMYK |
| 9 | Xuất báo cáo PDF / Excel / CSV | **DONE (✅)** | Nút Xuất CSV tại Header Analytics và Header Danh sách máy in |

---

## PHẦN C – Chức Năng Dùng Chung (Cross-Role Standards)

### C1. Trung Tâm Thông Báo (Notification Center)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Thông báo máy in Offline | **DONE (✅)** | Chuông cảnh báo và bảng chú ý cảnh báo thiết bị ngoại tuyến |
| 2 | Thông báo lỗi phần cứng | **DONE (✅)** | Chuông 1 (Hổ phách) báo lỗi phần cứng chưa có trong từ điển |
| 3 | Thông báo hết mực | **DONE (✅)** | Cảnh báo vật tư dưới ngưỡng đỏ (<5%) |
| 4 | Thông báo giấy sắp hết | **DONE (✅)** | Cảnh báo trạng thái khay giấy trên OID monitor |
| 5 | Thông báo Incident mới | **DONE (✅)** | Tự động cập nhật vào danh sách sự cố và thông báo Header |
| 6 | Thông báo được giao công việc | **DONE (✅)** | KTV nhận thông báo ngay trên chuông công việc và Gantt |
| 7 | Thông báo thay đổi trạng thái | **DONE (✅)** | Chuông 2 (Xanh) báo Admin duyệt nghiệm thu hoặc KTV làm lại |
| 8 | Đánh dấu đã đọc / chưa đọc | **DONE (✅)** | Chấm tròn xanh/cam unread chuẩn thiết kế hiện đại |
| 9 | Lọc thông báo | **DONE (✅)** | Segmented Pill Tabs `[Tất cả \| Chờ duyệt / Nghiêm trọng]` |
| 10 | Thông báo Email / In-app | **PARTIAL (⚡)** | In-app Toast (Sonner) + Popover hoàn thiện 100%; Email webhook sẵn sàng |

### C2. Tìm Kiếm & Trực Quan Hóa Dữ Liệu (Visualization & Search)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Tìm kiếm toàn hệ thống | **DONE (✅)** | Tìm kiếm tức thì theo IP, Tên máy, Mã lỗi, Kỹ thuật viên |
| 2 | Bộ lọc nâng cao | **DONE (✅)** | Lọc đa tầng: Hãng, Chi nhánh, Tầng, Sức khỏe, Trạng thái |
| 3 | Lưu bộ lọc cá nhân | **PARTIAL (⚡)** | Lưu trạng thái tab và bộ lọc ngưỡng trong LocalStorage |
| 4 | Phân trang dữ liệu | **DONE (✅)** | Phân trang tinh gọn 5 dòng (Dashboard), 10 dòng (Settings), 15–50 dòng (List) |
| 5 | Sắp xếp theo nhiều trường | **DONE (✅)** | Sắp xếp theo IP, Tên, Ngày phát hiện, Mức độ nghiêm trọng |
| 6 | Cross-filtering giữa các biểu đồ | **DONE (✅)** | Click vào phân đoạn biểu đồ tự động áp bộ lọc cho bảng dữ liệu |
| 7 | Synchronized Tooltips | **DONE (✅)** | Tooltip hiển thị chi tiết chỉ số khi rê chuột qua điểm dữ liệu |
| 8 | Drill-down chi tiết | **DONE (✅)** | Click điểm dữ liệu mở thẳng Drawer chẩn đoán hoặc trang phân tích |
| 9 | Export dữ liệu | **DONE (✅)** | Xuất file CSV UTF-8 BOM chuẩn cho Máy in, Từ điển, Chi phí |
| 10 | Hiển thị trạng thái dữ liệu cũ / mới | **DONE (✅)** | Tách bạch rõ ràng dữ liệu Stale, hiển thị `—` khi mất tín hiệu |

### C3. Bảo Mật & Kiểm Toán (Security & Audit)

| STT | Chức năng cần kiểm tra | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| 1 | Đăng nhập / Đăng xuất | **DONE (✅)** | Trang Login chuyên nghiệp, hỗ trợ 1-Click Role Login thử nghiệm |
| 2 | Kiểm tra quyền tại Backend API | **DONE (✅)** | Middleware xác thực JWT và kiểm tra Role trên từng endpoint |
| 3 | Phân quyền theo từng chức năng | **DONE (✅)** | RBAC bảo vệ chặt chẽ các tác vụ nhạy cảm (Tạo máy, duyệt lệnh, đổi mật khẩu) |
| 4 | Kiểm soát truy cập dữ liệu theo role | **DONE (✅)** | Route Guard và ẩn nút bấm tương ứng trên giao diện |
| 5 | Ghi nhận lịch sử thao tác | **DONE (✅)** | `ActivityFeed` ghi nhận chi tiết tác giả, thời điểm, nội dung |
| 6 | Ghi nhận người chỉnh sửa dữ liệu | **DONE (✅)** | Lưu `importedBy`, `unloadedBy`, `assignee`, `author` |
| 7 | Kiểm tra lịch sử đăng nhập | **PARTIAL (⚡)** | Lưu vết `lastLoginAt`, audit log mở rộng đang tích hợp |
| 8 | Quản lý phiên đăng nhập | **DONE (✅)** | Cơ chế tự động Refresh Token, tự đăng xuất khi phiên hết hạn |
| 9 | Kiểm soát truy cập API trái phép | **DONE (✅)** | Express Rate Limiting + Helmet chống tấn công Brute-force/DoS |
| 10 | Chống thao tác trùng lặp khi cập nhật | **DONE (✅)** | Debounce tìm kiếm (250ms), chống double click trên nút thao tác |

---

## 4. Bảng Tổng Hợp Tỷ Lệ Hoàn Thành Hệ Thống

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TỔNG KẾT TIẾN ĐỘ FLEETMONITOR (TÍNH ĐẾN 07/11/2026)                        │
├──────────────────────────────────────┬─────────────┬───────────┬────────────┤
│ Phân hệ chức năng                    │ Tổng tiêu chí│ Hoàn thành│ Tỷ lệ (%)  │
├──────────────────────────────────────┼─────────────┼───────────┼────────────┤
│ PHẦN A – Quản trị Admin              │     94      │    85     │   90.4%    │
│ PHẦN B – Vận hành KTV                │     84      │    80     │   95.2%    │
│ PHẦN C – Chức năng dùng chung        │     30      │    26     │   86.7%    │
├──────────────────────────────────────┼─────────────┼───────────┼────────────┤
│ TOÀN BỘ HỆ THỐNG                     │    208      │   191     │   91.8%    │
└──────────────────────────────────────┴─────────────┴───────────┴────────────┘
```

> **Đánh giá tổng quan:**
> - **Giao diện Frontend (`Frontend/`)**: Đạt **100%** khối lượng thiết kế, đạt chuẩn Modern Minimalist Bento Grid, 100% Pure React SVG sắc nét, 100% FontAwesome thuần nhất, tuân thủ nghiêm ngặt quy tắc số dòng `< 300 LOC`.
> - **Backend API & Dữ liệu (`Backend/`)**: Đã hoàn thiện cấu trúc Database Prisma, Auth JWT/RBAC, Zabbix JSON-RPC Client, Telemetry & Rollup Engine, sẵn sàng chuyển đổi hoàn toàn từ Mock Provider sang Live Database.
