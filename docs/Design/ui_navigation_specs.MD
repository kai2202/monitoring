# FleetMonitor — Đặc Tả Điều Hướng & Giao Diện Người Dùng (UI/UX Navigation Specs)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Đặc Tả Luồng Điều Hướng, Cấu Trúc Sub-Tabs & Thành Phần Giao Diện 4 Phân Hệ  
> **Phiên bản:** 2.6.0 (Chuẩn hóa quy mô hạm đội ~100 máy in, 100% Pure React SVG, FontAwesome duy nhất, CMMS & Drawer 2 Tab)  
> **Trạng thái:** Authoritative (Đã nghiệm thu giao diện)

---

## 1. Tổng Quan Cấu Trúc Điều Hướng (Navigation Hierarchy)

Hệ thống FleetMonitor áp dụng mô hình điều hướng phân cấp chuẩn **Enterprise SaaS Dashboard**, bao gồm thanh điều hướng chính (Sidebar cố định bên trái) kết hợp cây phân nhánh (Treeview Connector Lines) và các Sub-Tabs chuyên biệt cho từng phân hệ:

```mermaid
flowchart TD
    AppRoot["FleetMonitor App (/)]"] --> Dashboard["1. Tổng Quan (/dashboard)"]
    AppRoot --> Printers["2. Máy In (/printers)"]
    AppRoot --> Analytics["3. Phân Tích (/analytics)"]
    AppRoot --> Settings["4. Cấu Hình (/settings)"]

    Printers --> P_List["Danh Sách (/printers/list)"]
    Printers --> P_Timeline["Lịch Trình Gantt (/printers/timeline)"]
    Printers --> P_History["Bảo Trì CMMS (/printers/history)"]

    Analytics --> A_Overview["Sản Lượng In (/analytics/overview)"]
    Analytics --> A_Supplies["Vật Tư D-Day (/analytics/supplies)"]
    Analytics --> A_SLACost["SLA & Chi Phí (/analytics/sla-cost)"]

    Dashboard -.-> Drawer["Slide-over Diagnostics Drawer (960px)"]
    P_List -.-> Drawer
    P_Timeline -.-> Drawer
    P_History -.-> Drawer
    A_Supplies -.-> Drawer
```

---

## 2. Đặc Tả Chi Tiết 4 Phân Hệ Giao Diện

### 2.1. Phân Hệ 1: Dashboard Tổng Quan (`/dashboard`)

Bố cục dạng **Bento Minimalist** hiện đại, loại bỏ hiệu ứng gradient lòe loẹt kiểu cũ, sử dụng nền phẳng viền mảnh `#e2e8f0`, số liệu nổi bật font JetBrains Mono và màu thương hiệu `#2563eb`:

1. **Khối 4 Thẻ Fleet KPI Bento:**
   - *Thẻ 1 (Sự cố phần cứng):* Số máy bị lỗi nguy cấp (`${criticalAlertsCount} máy`), badge `Khẩn cấp` (đỏ) hoặc `An toàn` (xanh), icon `faTriangleExclamation`. Bấm thẻ kích hoạt lọc nhanh.
   - *Thẻ 2 (Tỷ lệ khả dụng):* Tỷ lệ trực tuyến hạm đội (`${onlineRate}%`), badge động `${onlineCount}/${totalPrinters} Trực tuyến` (loại bỏ dữ liệu cứng), icon `faWifi`.
   - *Thẻ 3 (Tổng số thiết bị):* Tổng số máy in trong hạm đội (`${totalPrinters} máy`), badge `Toàn hạm đội`, icon `faPrint`.
   - *Thẻ 4 (Vật tư cần chú ý):* Số máy có vật tư $\le 10\%$ (`${lowSuppliesCount} máy`), badge `≤ 10% CMYK`, icon `faBox`. Nút chuyển hướng nhanh trỏ chuẩn xác sang `/analytics/supplies`.
2. **Lưới Biểu Đồ Kép (Side-by-Side Bento Grid):**
   - *Cột trái (60%): Biểu đồ Khả dụng (AvailabilitySplineChart):* Pure React SVG, đường cong spline mượt mà (stroke 2.25px, gradient glow bán trong suốt), trục thời gian 24h và tooltip tương tác tức thì hiển thị số máy online/offline.
   - *Cột phải (40%): Biểu đồ Cung tròn đồng tâm (RefinedFleetDonut):* 3 vòng tròn thể hiện phân bổ trạng thái: Hoạt động tốt (Xanh lá), Cảnh báo vật tư (Vàng), Sự cố & Ngoại tuyến (Đỏ). Bấm từng vòng để lọc trực tiếp danh sách bên dưới.
3. **Bảng Thiết Bị Cần Xử Lý (AttentionDevicesTable):**
   - Tách bạch rõ ràng giữa Mất kết nối mạng (Offline) và Lỗi phần cứng/cơ khí (Hardware Error) theo chuẩn Rule 5 & 6 AGENTS.md.
   - Tích hợp phân trang thu gọn (5 dòng/trang).
   - Nút thao tác kép:
     + `[Chẩn đoán]`: Mở Slide-over Diagnostics Drawer 960px.
     + `[+ Lập lệnh]`: Chuyển sang tạo nhiệm vụ bảo trì.

---

### 2.2. Phân Hệ 2: Máy In & Bảo Trì (`/printers`)

Phân hệ cốt lõi quản lý hạm đội ~100 máy in, chia thành 3 Sub-tabs chuyên trách:

#### Sub-Tab 1: Danh Sách Máy In (`/printers/list`)
- **Thanh công cụ Toolbar & Nút Quản Trị Vị Trí:**
  + Ô tìm kiếm tức thì theo tên/model/IP/serial/chi nhánh/tầng.
  + Bộ lọc theo **Chi nhánh** (`branch`): Tất cả, Trụ sở chính, Chi nhánh HCM, Chi nhánh Đà Nẵng...
  + Bộ lọc theo **Tầng** (`floor`): Cơ chế **Dynamic Render** đồng bộ từ `locationService`, hiển thị danh sách các tầng thực tế của chi nhánh đã chọn (HQ 7 tầng T1-T7, Chi nhánh...).
  + Bộ lọc theo **Hãng sản xuất**: Hai hãng chủ lực (**Canon**, **Ricoh**) cùng các dòng máy đồng hành (**Epson**, **HP**, **Brother**, **Toshiba**, **Olivetti**).
  + Bộ lọc theo trạng thái kết nối (Online / Offline) và cảnh báo sức khỏe (Healthy / Warning / Critical).
  + Nút **`[+ Khai báo máy in]`** (`PrinterCreateModal`): Dành riêng cho `ADMIN` để thêm thiết bị mới vào hệ thống giám sát (Tên máy, Hãng chủ lực Canon/Ricoh/Khác, Model, IP IPv4, Chi nhánh & Tầng linh hoạt, Loại in Mono/Color, Đa năng/Đơn năng).
  + Nút **`[Quản lý Vị trí & Tầng]`** (`BranchFloorManagerModal`): Dành riêng cho `ADMIN` để thêm Trụ sở/Chi nhánh mới, thêm/bớt Tầng cho từng cơ sở, kèm cơ chế an toàn **chặn xóa vật lý khi còn máy in hoạt động**.
  + Nút **`[Xuất CSV]`** (`exportPrintersToCsv`): Hỗ trợ `ADMIN` và `ASSET_HR` tải toàn bộ danh mục ~100 máy in (IP, vị trí, tầng, CMYK, counters...) chuẩn UTF-8 BOM phục vụ kiểm kê tài sản.
- **Bảng Danh mục Thiết bị (PrinterTableView):**
  + 8 cột thông tin chuẩn mực: Tên & Model thiết bị, Địa chỉ IP (hỗ trợ copy nhanh 1-click), Vị trí (Chi nhánh - Tầng - Phòng ban), Hãng & Loại thiết bị, Mực in CMYK, Trạng thái kết nối (kèm huy hiệu **Lưu kho** / **Đã thanh lý**), Sức khỏe phần cứng, Thao tác chẩn đoán.
  + **Nút [Sửa]** (`PrinterEditModal`): Cho phép `ADMIN` hiệu chỉnh tên hiển thị, địa chỉ IP, model, số serial, trạng thái quản lý (Đang giám sát / Tạm ngưng / Lưu kho / Thanh lý).
  + **Nút [Dời]** (`PrinterRelocateModal`): Chỉ hiển thị đối với vai trò `ADMIN` để di dời máy in giữa các Chi nhánh/Tầng/Phòng ban và bắt buộc nhập lý do điều chuyển.
  + **Nút [Ngưng] (Decommission / Khóa an toàn):** Cho phép `ADMIN` chuyển trạng thái máy in sang Lưu kho / Thanh lý; **tự động chặn ngưng/xóa** nếu thiết bị đang có lệnh bảo trì chưa hoàn thành (`taskInfo.active > 0`).
  + Phân quyền thao tác theo JD: Chỉ `ADMIN` mới có quyền khai báo, sửa, điều chuyển và ngưng giám sát; `ASSET_HR` xem Serial, Model và Vị trí để kiểm kê; `FIELD_TECH` xem IP & vị trí để định vị thiết bị.
  + **Phân trang linh hoạt (Client-side Pagination):** Tùy chọn 15, 25, 50 hoặc Tất cả dòng/trang kèm điều hướng Trước/Sau và hiển thị tổng số máy in. Nạp toàn bộ danh mục ~100 máy in (< 50KB) vào bộ nhớ client để tìm kiếm và lọc tức thì $< 5\text{ms}$.

#### Sub-Tab 2: Lịch Trình Tiến Độ Gantt (`/printers/timeline`)
- **Khung thời gian (View Duration):** Tùy chọn 7 ngày, 14 ngày, hoặc 30 ngày. Khắc phục triệt để lỗi lệch múi giờ bằng định dạng chuẩn Local Date `YYYY-MM-DD`.
- **Cơ chế nới rộng ô tự động (Expandable Day Width):** Tự động nới rộng chiều ngang ô ngày lên **240px** khi có công việc để thẻ task hiển thị trọn vẹn (tiêu đề, người phụ trách, tiến độ %) mà không bị tràn ô hoặc chồng lấn.
- **Quy tắc chuyển dịch trạng thái tự động:** Khi một task hoàn thành (`status = 'Completed'`), task đó lập tức được chuyển sang Kho lịch sử và **tự động xóa khỏi biểu đồ Gantt** để người vận hành chỉ tập trung vào các công việc đang xử lý.
- **Nút hành động nhanh:** `[+ Tạo việc mới]` chỉ hiển thị với vai trò `ADMIN` để đảm bảo tính kỷ luật ban hành lệnh bảo trì.

#### Sub-Tab 3: Lệnh Bảo Trì CMMS (`/printers/history`)
- **Bảng Đối Chiếu Hiệu Suất Kỹ Thuật Viên (TechnicianPerformanceCard):**
  + Tích hợp ngay đầu trang dành cho HR và Quản lý đối chiếu dữ liệu đánh giá hiệu suất, duyệt thưởng KPI và đối soát nghiệm thu SOP.
  + Thống kê 4 chỉ số: Khối lượng lệnh đã xong (Completed/Total), Tỷ lệ tuân thủ SLA (chuẩn $\ge 90\%$), Thời gian xử lý trung bình MTTR (phút/lệnh), và Tỷ lệ có ảnh nghiệm thu in test MinIO (`100% PASSED`).
  + Với `FIELD_TECH`, hiển thị tóm tắt năng suất cá nhân để tự theo dõi tiến độ.
- **Bảng Quản Lý Lệnh Bảo Trì (WorkOrdersTable):**
  + Theo dõi toàn diện vòng đời công việc 3 tầng `Ticket -> Task -> Work Log`.
  + Bộ lọc phạm vi: `Tất cả`, `Đang xử lý` (Planned, In Progress, Waiting), và `Kho lịch sử` (Completed, Cancelled).
  + **Đồng bộ bộ lọc Chi nhánh & Tầng:** Tích hợp bộ chọn Chi nhánh và Tầng đồng bộ với Danh mục thiết bị giúp tra cứu tiến độ công việc theo từng địa bàn.
  + Hỗ trợ mở rộng dòng (Sub-steps Row) xem chi tiết các bước SOP kỹ thuật.
  + **Nút [Gán KTV]** (`WorkOrderReassignModal`): Dành riêng cho `ADMIN` để điều phối hoặc chuyển giao người phụ trách công việc sang KTV khác, bắt buộc nhập lý do điều phối để lưu vết Audit Log.
  + **Nút [Hủy]** (`WorkOrderCancelModal`): Dành riêng cho `ADMIN` để hủy hoặc đóng cưỡng bức các lệnh bảo trì tạo nhầm/sự cố đã tự hồi phục, bắt buộc nhập lý do hủy để lưu vết kiểm toán.

#### Slide-over Diagnostics Drawer (960px):
Khung trượt từ cạnh phải màn hình, hỗ trợ phím tắt `Esc` và điều hướng nhanh giữa các máy:
- **Tab 1: Chẩn đoán & Vật tư (DiagnosticsCmykTab):** Đồng hồ đo mức mực CMYK thực tế (0–100%), tuổi thọ Cụm Trống (Drum Life), Cụm Sấy (Fuser Life), tình trạng Hộp mực thải (Waste Toner Box) và các bộ đếm OID SNMP Zabbix.
- **Tab 2: Lệnh Bảo Trì & Tiến Độ (DiagnosticsTasksTab):**
  + *Quyền tạo lệnh:* Nút `[+ Tạo công việc mới]` chỉ hiển thị đối với vai trò `ADMIN`.
  + *Bộ chuyển đổi chế độ:* `Đang xử lý` vs `Kho lịch sử`.
  + *Đang xử lý:* Khối Thời gian & Chi phí (WorkOrderTimeCostCard) tự động phân quyền theo vai trò: `FIELD_TECH` chỉ xem và ghi nhận thời gian sửa/chờ thực tế (ẩn hoàn toàn các trường tiền tệ VNĐ); `ASSET_HR` xem đầy đủ chi phí để hạch toán (Read-only); `ADMIN` toàn quyền hiệu chỉnh.
  + *Kho lịch sử (Accordion Collapsible):* Hiển thị dạng thẻ đóng/mở tóm tắt (chọn tới đâu hiện tới đó), tích hợp biên bản nghiệm thu và kết quả in thử.

---

### 2.3. Phân Hệ 3: Phân Tích & Báo Cáo (`/analytics`)

Giao diện trực quan hóa dữ liệu sản lượng và vật tư bằng **100% Pure React SVG**, chia thành 3 Sub-tabs:

#### Sub-Tab 1: Sản Lượng In (`/analytics/overview`)
- **Banner Tổng Sản Lượng In:** Hiển thị tổng số trang in theo chu kỳ (24 Giờ, 7 Ngày, 30 Ngày), tỷ lệ tăng trưởng so với kỳ trước, và thanh phân bổ sản lượng theo tầng.
- **Biểu Đồ Xu Hướng Sản Lượng & Đỉnh Tải (PrintVolumePeakLineChart):**
  + Pure React SVG, Soft Spline 2.25px với Gradient Glow bán trong suốt.
  + Viên nang đỉnh tải (Peak Pill) chỉ báo thời điểm có lượng in cao nhất.
  + Chú giải trực quan: Kỳ hiện tại (nét liền xanh dương `#2563eb`), Kỳ trước (nét đứt xám `#94a3b8`).
- **Khối Phân Bố Sản Lượng & Đối Chiếu Hạm Đội (Collapsible Split-View Bento):**
  + *Bố cục gập/mở tại chỗ (Collapsible Split-View):* Mặc định biểu đồ "Sản lượng theo thiết bị" mở rộng **100% toàn màn hình** giúp góc nhìn thoáng đãng, tối ưu không gian.
  + *Nút mở/gập đối chiếu:* Tích hợp nút `[Đối chiếu thiết bị]` (hoặc `[Thu gọn đối chiếu]`) trên thanh công cụ của biểu đồ cột ngang kèm huy hiệu (badge) đếm số lượng máy đang ghim.
  + *Cơ chế kích hoạt thông minh:* Sàn đối chiếu tự động xuất hiện song song (chia 2 cột 50% - 50%) ngay khi người vận hành bấm biểu tượng ghim 📌 trên bất kỳ máy in nào; và tự động thu gọn về 100% khi danh sách máy ghim trở về 0 (hoặc khi bấm nút "Xóa tất cả máy ghim" / nút `[✕ Thu gọn]`).
  + *Cột trái: Sản lượng theo thiết bị (ProductionHorizontalBarChart):* Biểu đồ cột ngang chia rõ tỷ trọng Mono & Color. Nút ghim nhanh 📌 đưa máy vào sàn đối chiếu.
  + *Cột phải: Đối chiếu thiết bị (PinnedComparisonSandbox):* Khung hình Bento riêng biệt chứa các thanh cột ngang của các máy được ghim đặt song song, căn chỉnh **cùng thang đo (common scale)** để so sánh trực diện độ dài thanh, độ lệch tải (% vs #1), tốc độ PPM và chỉ số MTBF.
  + *Modal So sánh 1:1:* Phân tích đối sánh đa chiều chuyên sâu giữa các thiết bị đã chọn.

#### Sub-Tab 2: Vật Tư Tiêu Hao (`/analytics/supplies`)
- **3 Thẻ Thống Kê Tổng Quan Bento:** `Khẩn cấp (< 15%)`, `Cần lưu ý (< 25%)`, và `Cạn kiệt sớm nhất`. Hỗ trợ bấm thẻ để kích hoạt lọc nhanh.
- **Bảng Cảnh Báo Cạn Kiệt Vật Tư (UrgentConsumablesAlertsTable):**
  + Theo dõi hạn chót cạn kiệt với huy hiệu đếm ngược D-Day: `[D-4]` (Đỏ $\le 5$ ngày), `[D-7]` (Vàng $\le 14$ ngày), `[D-25]` (Xanh an toàn).
  + Nút hành động nhanh: `[+ Lập lệnh thay]` mở modal tạo task cấp phát vật tư chuyển thẳng sang lịch trình bảo trì.
- **Bảng Vật Tư Máy Tải Cao (HighLoadFleetSuppliesTable):**
  + Trực quan hóa linh kiện 6 thành phần (CMYK, Drum, Fuser) trong cùng 1 hàng.
  + **Quy chuẩn hiển thị:** Máy in đơn sắc hiển thị 1 chấm đen duy nhất ⚫ + chỉ số % mực K (kèm tooltip); Máy in màu hiển thị 4 vạch thanh đứng siêu nhỏ đại diện cho K-C-M-Y.
  + Pill theo dõi trạng thái Hộp mực thải (Waste Toner: Bình thường, Sắp đầy ⚠️, Đầy 🛑).
  + Bấm bất kỳ dòng nào để mở Slide-over Diagnostics Drawer.

#### Sub-Tab 3: Hiệu Suất SLA & Chi Phí (`/analytics/sla-cost`)
- **4 Thẻ KPI Bento SLA:** Tỷ lệ sẵn sàng SLA hạm đội (Uptime %), Thời gian chạy ổn định trung bình (MTBF), Thời gian xử lý sự cố (MTTR), và Tổng chi phí in kỳ này (VNĐ).
- **Lưới Phân Tích Kép (Side-by-Side):**
  + *Cột trái: Chi phí theo phòng ban (CostAllocationArcChart):* Vòng cung bán nguyệt 180° nét mảnh 11px kèm 5 Micro-Cards phòng ban (tỷ trọng %, số trang mono/color, chi phí VNĐ).
  + *Cột phải: Điểm nóng sự cố (SLAIncidentHeatmapMatrix):* Ma trận nhiệt **Dynamic Render** theo các Chi nhánh và các Tầng thực tế có đặt máy in $\times$ 7 tuần nhận diện tần suất hỏng hóc, kèm Inspector Panel xem chi tiết từng vụ việc.

---

### 2.4. Phân Hệ 4: Cấu Hình & Quản Lý Mã Lỗi (`/settings`)

Giao diện quản trị hệ thống phục vụ Kỹ sư NOC và Quản trị viên (`ADMIN`):

1. **Thẻ Trạng Thái Zabbix Gateway (ZabbixStatusCard — Chỉ Đọc):**
   - Thông số Zabbix Server và chu kỳ Polling (Fast: 30s | Slow: 1h) được **cấu hình mặc định cố định từ Backend Environment**, Admin không có quyền sửa trên giao diện Web UI (khóa ở cả 2 đầu: không có API ghi và UI chỉ đọc).
   - Hiển thị: Trạng thái kết nối Xanh (`Đang kết nối`), Endpoint đã che token, chu kỳ Fast/Slow và huy hiệu an toàn: *"Khóa bởi Backend Environment"*.
2. **Quy Tắc An Toàn Vận Hành NOC (Operational Safety Rules):**
   - *Safe Window 10m:* Cơ chế giữ cảnh báo an toàn tối thiểu 10 phút trước khi tự động đóng, ngăn chặn hiện tượng flapping (chập chờn mạng/sensor).
   - *Critical Protection:* Ngăn chặn việc đóng tự động các sự cố mức Critical nếu chưa có biên bản nghiệm thu từ kỹ thuật viên.
   - *In-Memory Cache TTL 60s:* Điều chỉnh thời gian sống của bộ đệm cache dữ liệu Zabbix.
3. **Từ Điển & Chuẩn Hóa Mã Lỗi Đa Thương Hiệu (Error Code Standardization):**
   - Tra cứu danh mục mã lỗi chuẩn nội bộ `FM-<SUBSYSTEM>-<INDEX>`.
   - **Cơ chế Import/Export CSV:** Quản trị viên tải tệp CSV mẫu, điền danh mục mã lỗi từ Service Manual của các hãng trong hạm đội (Chủ lực: Canon, Ricoh; Đồng hành: Epson, HP, Brother, Toshiba, Olivetti) và upload lên hệ thống.
   - Bảng lịch sử thay đổi (Audit Trail): Lưu vết bất biến ai đã thêm/sửa mã lỗi, thời gian và lý do thay đổi.
4. **Quản Lý Người Dùng & Phân Quyền (User & RBAC Manager):**
   - Xem danh sách tài khoản nhân sự (`ADMIN`, `FIELD_TECH`, `ASSET_HR`), đổi mật khẩu nhanh (`UserPasswordChangeModal`), cấu hình Data Scope theo Chi nhánh / Tầng (`UserScopeAssignModal`).
   - Nút **`[+ Tạo tài khoản mới]`** (`UserCreateModal`): Cho phép Admin khởi tạo tài khoản nhanh gồm Họ tên, Email, Mật khẩu và chỉ định một trong 3 vai trò.

---

## 3. Quy Chuẩn Kỹ Thuật Giao Diện Bắt Buộc (Mandatory UI Principles)

1. **100% FontAwesome Icons Duy Nhất:** Sử dụng độc quyền `@/shared/icons/` (`@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`). Tuyệt đối không cài đặt hoặc sử dụng Lucide, Heroicons hay React Icons.
2. **Quy Tắc File Length < 300 LOC:** Mọi component `.tsx` và file logic `.ts` phải duy trì dưới 300 dòng code. Bóc tách logic phức tạp ra Custom Hooks (`use<Feature>.ts`).
3. **Tính Toàn Vẹn Dữ Liệu Đo Lường:** `MetricValue = number | null`. Tuyệt đối không thay thế giá trị thiếu bằng số `0`, hiển thị dấu gạch ngang `—` hoặc `Chưa có dữ liệu`.
4. **Không Sử Dụng Trường `actionGuidance`:** Nghiêm cấm xuất hiện trường `actionGuidance` trên toàn bộ giao diện và cơ sở dữ liệu.
5. **Ngôn Ngữ Giao Diện:** 100% tiếng Việt tự nhiên, chuẩn kỹ thuật vận hành IT NOC doanh nghiệp.

