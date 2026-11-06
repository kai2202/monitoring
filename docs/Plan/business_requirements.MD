# FleetMonitor — Yêu Cầu Nghiệp Vụ Hệ Thống (Business Requirements Document)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Yêu Cầu Nghiệp Vụ & Phạm Vi Chức Năng 4 Hạng Mục Trọng Tâm (Business Requirements)  
> **Phiên bản:** 2.6.0 (Hiệu chỉnh quy mô hạm đội tập trung ~100 máy in, 100% Pure React SVG, Quản trị Bảo trì CMMS, Chuẩn hóa mã lỗi CSV & RBAC Data Scope)  
> **Trạng thái:** Authoritative (Đã phê duyệt kiến trúc)

---

## 1. Bối Cảnh Nghiệp Vụ & 4 Trọng Tâm Chiến Lược

Tại các tổ chức và doanh nghiệp phân tán đa chi nhánh, hạ tầng thiết bị in ấn bao gồm **hạm đội khoảng 100 máy in** đặt tại **Toà nhà Trụ sở chính (quy mô 7 tầng, máy in bố trí linh hoạt ở tùy tầng)** kết hợp với **các chi nhánh/văn phòng vệ tinh khác** kết nối an toàn qua mạng Site-to-Site VPN / SD-WAN. Hệ sinh thái máy in xoay quanh hai hãng chủ lực là **Canon** và **Ricoh**, cùng các dòng máy văn phòng khác: **Epson, HP, Brother, Toshiba và Olivetti**. FleetMonitor giải quyết triệt để 4 bài toán vận hành cốt tử:

1. **Printer Analytics (Phân tích sản lượng máy in hạm đội ~100 máy):**
   - Theo dõi sản lượng in chi tiết theo Chu kỳ: 24 Giờ (Giờ cao điểm), 7 Ngày và 30 Ngày gần nhất.
   - Trực quan hóa toàn diện bằng **100% Pure React SVG** siêu nhẹ, sắc nét Retina/HiDPI, loại bỏ hoàn toàn gánh nặng WebGL 3D quá tải:
     + Biểu đồ đường cong mượt mà **Soft Spline 2.25px** phân tích xu hướng tải in và đối chiếu kỳ trước.
     + Biểu đồ **Cột Ngang (Horizontal Bar Chart)** phân định tỷ trọng bản in Đen trắng (Mono) & Màu (Color).
     + **Khung Ghim Đối Chiếu (Pinned Comparison Sandbox)**: Cho phép ghim trực tiếp các máy in vào sàn so sánh trên cùng thang đo (scale) để đối chiếu trực diện độ dài thanh, độ lệch tải và chỉ số MTBF/PPM.
     + **Vòng cung bán nguyệt 180° (Donut Arc)**: Phân bổ chi phí in ấn theo phòng ban kèm micro-cards.
     + **Ma trận nhiệt (Heatmap Matrix)**: Hiển thị động (**Dynamic Render**) theo các Chi nhánh và các Tầng thực tế có đặt máy in $\times$ 7 tuần nhận diện điểm nóng sự cố.
   - Backend tổng hợp dữ liệu counter từ Zabbix API (chu kỳ 1 giờ/lần), tính delta, xử lý rollover/reset, lưu bảng rollup ngày/tháng để phản hồi giao diện $< 50\text{ms}$ qua In-Memory Cache (TTL = 60s).

2. **Maintenance Management (Quản lý bảo trì khép kín & Tái sử dụng lịch sử):**
   - Vòng đời 3 tầng chuẩn mực CMMS: **Ticket $\to$ Task $\to$ Work Log**.
   - Ghi nhận đầy đủ: Người thực hiện, thiết bị, thời gian bắt đầu/kết thúc, trạng thái, các bước kỹ thuật SOP (Dynamic Stepper), phụ tùng linh kiện thay thế, chi phí vật tư và nhân công (VNĐ), kết quả nghiệm thu in thử kèm ảnh MinIO S3 (`PASSED`).
   - Sử dụng PostgreSQL làm cơ sở dữ liệu chính, kết hợp MinIO S3 Object Storage để lưu trữ hình ảnh hiện trường, chứng từ và tài liệu kỹ thuật.
   - Quản lý Lịch trình Gantt (Timeline) cho 100 máy in: Tự động nới rộng ô ngày có việc (240px) để hiển thị trọn vẹn thẻ công việc. Khi task hoàn thành, tự động chuyển vào **Kho lịch sử** và xóa khỏi biểu đồ Gantt.
   - Bảng đối chiếu Đánh giá Hiệu suất Kỹ thuật viên (Technician Performance KPI Card) phục vụ HR đối soát năng suất, tính thưởng và Quản lý giám sát vận hành.

3. **Error Code Standardization (Chuẩn hóa mã lỗi đa thương hiệu):**
   - Tổng hợp mã lỗi từ các thương hiệu trong hạm đội: Hai hãng chủ lực **Canon, Ricoh** cùng **HP, Brother, Epson, Toshiba, Olivetti**.
   - Phân loại theo phân hệ cơ điện tử (Cụm sấy, Laser, Quét, Kéo giấy, Trống, Từ, Mực, Băng tải, Nguồn, Mạng), loại bỏ trùng lặp về bản chất hư hỏng và xây dựng bộ mã định danh nội bộ chuẩn `FM-<SUBSYSTEM>-<INDEX>`.
   - Quản lý mã lỗi trên PostgreSQL, nạp dữ liệu bằng cơ chế **Import CSV** trực tiếp từ giao diện Cài đặt (`/settings`) và lưu vết lịch sử thay đổi (Audit Trail).

4. **Role-Based Dashboard & RBAC (Dashboard theo vai trò & Phân quyền dữ liệu):**
   - Cơ chế RBAC 3 vai trò chuẩn hoá (**`ADMIN`**, **`FIELD_TECH`**, **`ASSET_HR`**) kết hợp **Data Scope** (phân vùng dữ liệu theo Chi nhánh, Tầng và Phòng ban).
   - React đảm nhiệm giao diện với bố cục Dashboard tùy biến cho từng vai trò; Backend kiểm soát quyền truy cập và tự động lọc dữ liệu SQL; PostgreSQL lưu thông tin phân quyền và cấu hình widget người dùng.

---

## 2. Mô Hình Người Dùng, RBAC & Phân Vùng Dữ Liệu (Data Scope)

FleetMonitor chuẩn hóa thành **3 nhóm vai trò cốt lõi** gắn liền với trách nhiệm và phạm vi dữ liệu phân cấp theo Chi nhánh (`branch`), Tầng (`floor`) và Phòng ban (`department`):

| Nhóm Vai Trò (Role) | Chức Danh Thực Tế | Phạm Vi Dữ Liệu (Data Scope) | Tiêu Chí KPI & Trọng Tâm Hiển Thị | Quyền Hạn Hệ Thống (Permissions) |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`**<br>(Quản trị IT & NOC) | Trưởng phòng IT / Kỹ sư giám sát NOC | **Toàn công ty** (Tất cả chi nhánh, toà nhà 7 tầng, toàn bộ ~100 máy in) | Tỷ lệ khả dụng SLA hạm đội, Hàng đợi sự cố phần cứng khẩn cấp, Lịch trình Gantt, Giám sát polling Zabbix qua VPN, Kiểm duyệt từ điển CSV. | Toàn quyền xem và cấu hình (Full Access); **Duy nhất có quyền điều chuyển vị trí/chi nhánh/phòng ban máy in và tạo lệnh bảo trì**; cấu hình Safe Window 10m và nạp CSV mã lỗi. |
| **`FIELD_TECH`**<br>(Kỹ thuật viên) | Kỹ thuật viên bảo trì hiện trường | **Chỉ các Lệnh bảo trì được phân công** | Danh sách lệnh công việc trong ngày; Lịch trình Gantt; Quy trình Dynamic Stepper; Bảng đối chiếu năng suất cá nhân (MTTR, SLA). | Nhận lệnh và cập nhật tiến độ; ghi chép Work Log; tải ảnh nghiệm thu in test MinIO (`PASSED`). **Ẩn hoàn toàn các số liệu chi phí tiền tệ (VNĐ)**. |
| **`ASSET_HR`**<br>(HR / Kiểm kê) | Chuyên viên quản lý tài sản / Kế toán | **Quản trị tài sản & Chi phí** (Theo Chi nhánh & Phòng ban) | Kiểm kê số lượng máy in (Serial, Model, Chi nhánh, Tầng); Hạch toán chi phí thuê máy & sản lượng Mono/Color; Bảng đối chiếu KPI Kỹ thuật viên. | Quyền xem kiểm kê tài sản (Read-only, không tự ý sửa vị trí); xem Vòng cung chi phí 180° để đối soát tiền thuê máy; đối soát dữ liệu MTTR/SLA để đánh giá hiệu suất nhân sự. |

---

## 3. Đặc Tả Chi Tiết 4 Phân Hệ Nghiệp Vụ Cốt Lõi

### 3.1. Phân Hệ Phân Tích Sản Lượng & Vật Tư (Printer Analytics — Quy Mô ~100 Máy In)

- **Trực quan hóa Pure React SVG Đậm Đặc Thông Tin:**
  - *Xu Hướng Sản Lượng & Đỉnh Tải:* Đường cong Soft Spline 2.25px với Gradient Glow bán trong suốt, viên nang đỉnh tải (Peak Pill), tooltip đa tầng hiển thị chi tiết số trang và đối chiếu kỳ trước.
  - *Phân Bố Sản Lượng Theo Thiết Bị (Horizontal Bar Chart):*
    + Trục tung (Y-axis): Tên/model máy in, vị trí tầng (T1–T5) và phòng ban.
    + Thanh ngang chia tỷ lệ rõ ràng giữa bản in Đen trắng (Mono - `#2563eb`) và bản in Màu (Color - `#ec4899`).
    + Nút ghim nhanh 📌 (Pin Icon) đưa máy vào sàn đối chiếu.
  - *Khung Ghim Đối Chiếu (Pinned Comparison Sandbox Bento Dock):*
    + Đặt song song hoặc cố định bên cạnh biểu đồ cột ngang.
    + Căn chỉnh các máy được chọn trên **cùng thang đo (common scale)** để so sánh trực diện độ dài thanh tải, độ chênh lệch sản lượng (% so với máy dẫn đầu), tốc độ PPM và chỉ số MTBF.
    + Nút mở modal phân tích đối chiếu chuyên sâu 1:1.
  - *Dự Báo Cạn Kiệt Vật Tư [D-Day] (Supplies Forecasting):*
    + Thuật toán tính toán Tốc độ tiêu hao trung bình trượt 7 ngày: $\Delta C_{avg} = (C_{t-7} - C_t) / 7$ (%/ngày); Số ngày còn lại $D = C_t / \Delta C_{avg}$.
    + Huy hiệu viên nang đếm ngược hạn chót: `[D-4]` (Đỏ $\le 5$ ngày), `[D-7]` (Vàng $\le 14$ ngày), `[D-25]` (Xanh an toàn).
    + Quy chuẩn điều kiện biên (Rule 5 AGENTS.md): Máy mới (< 3 ngày dữ liệu) hoặc máy không in trong tuần ($\Delta C_{avg} \le 0$) bắt buộc trả về `null` (hiển thị `—`, tuyệt đối không bịa số ngày); Khi thay mực mới ($C_t > C_{prev}$), tự động reset cửa sổ tính toán.
    + Hiển thị trực quan: Máy in đơn sắc hiển thị chấm đen ⚫ + % mực K (C, M, Y trả về `null` hiển thị `—`); Máy in màu hiển thị 4 vạch thanh đứng siêu nhỏ (CMYK).
    + Theo dõi riêng trạng thái Hộp mực thải (Waste Toner Box: Bình thường, Sắp đầy ⚠️, Đầy 🛑).
    + Nút hành động nhanh: Tạo lệnh cấp phát vật tư chuyển thẳng sang Lệnh bảo trì.
  - *Phân Bổ Chi Phí & Ma Trận Điểm Nóng Sự Cố (SLA & Cost):*
    + Vòng cung bán nguyệt 180° Donut Arc nét mảnh 11px thể hiện tỷ trọng chi phí phòng ban kèm 5 Micro-Cards.
    + Ma trận nhiệt Heatmap 5 tầng/khu vực $\times$ 7 tuần kèm Inspector Panel xem chi tiết sự cố từng ô.

- **Tổng hợp dữ liệu Backend & Caching cho ~100 Thiết Bị:**
  - Tự động lấy số counter từ Zabbix API qua chu kỳ 1 giờ/lần, tính chênh lệch delta total, color và mono.
  - Xử lý 32-bit counter rollover và counter reset bo mạch bảo đảm tính liên tục của dữ liệu.
  - Lưu trữ vào bảng rollup `printer_daily_volume` (~100 bản ghi/ngày, ~36.500 bản ghi/năm — cực kỳ nhẹ và tối ưu cho PostgreSQL) và `printer_monthly_volume`.
  - Đảm bảo thời gian phản hồi giao diện $< 50\text{ms}$ thông qua In-Memory Cache TTL 60 giây.

### 3.2. Phân Hệ Quản Lý Bảo Trì & Lịch Trình (Maintenance Management)

- **Mô hình Vòng đời 3 Tầng:**
  1. *Ticket (Phiếu yêu cầu):* Tự động sinh từ cảnh báo SNMP Zabbix (Hardware Error, Paper Jam, Consumables Low) hoặc tạo thủ công; phân định mức nghiêm trọng (Critical, Warning, Info).
  2. *Task (Lệnh công việc):* Phân công cho kỹ thuật viên; theo dõi qua Danh sách bảng, Lịch trình tiến độ Gantt; quản lý quy trình Dynamic Stepper từng bước kỹ thuật.
  3. *Work Log (Nhật ký phiên làm việc):* Ghi nhận kỹ thuật viên thực hiện, thời gian bắt đầu/kết thúc, nội dung xử lý, phụ tùng linh kiện thay thế, chi phí vật tư và nhân công (VNĐ), kết quả in thử nghiệm thu (Passed / Failed).
- **Lịch Trình Gantt Timeline (~100 Máy In):**
  - Hiển thị theo dải ngày (7 ngày, 14 ngày, 30 ngày) an toàn múi giờ địa phương (Local Date YYYY-MM-DD).
  - Tự động nới rộng chiều ngang ô ngày có việc (240px) để hiển thị trọn vẹn thẻ công việc, ngày trống giữ nhỏ gọn.
  - **Quy tắc chuyển dịch trạng thái:** Khi một task hoàn thành (`status = 'Completed'`), task đó lập tức được chuyển sang **Kho lịch sử** và tự động xóa khỏi biểu đồ Gantt để giữ lịch trình luôn tinh gọn, tập trung vào công việc đang xử lý.
- **Lưu trữ tệp tin MinIO S3 Object Storage:**
  - Upload ảnh hiện trường trước và sau sửa chữa, biên bản kỹ thuật có chữ ký.
  - Truy xuất an toàn qua Presigned URL có thời hạn.
- **Tái sử dụng Tri thức Lịch sử (Knowledge Reuse Engine):**
  - Khi máy in model $M$ phát sinh mã lỗi $E$, hệ thống tự động tìm kiếm các Work Log thành công của các máy cùng model trong lịch sử, gợi ý linh kiện cần chuẩn bị, chi phí ước tính và quy trình khắc phục hiệu quả nhất.

### 3.3. Phân Hệ Chuẩn Hóa Mã Lỗi (Error Code Standardization)

- **Quy tắc định danh nội bộ:**
  - Cấu trúc chuẩn: `FM-<SUBSYSTEM>-<INDEX>` (Ví dụ: `FM-FUS-01` [Cụm sấy], `FM-OPT-01` [Khối quang học/Laser], `FM-FED-01` [Cơ kéo giấy], `FM-DRM-01` [Trống hình], `FM-SCN-01` [Khối quét/ADF]).
  - Loại bỏ hoàn toàn sự trùng lặp bản chất: Cùng là lỗi quá nhiệt cụm sấy, Ricoh báo `SC542`, Canon báo `E000`, HP báo `50.1`, Xerox báo `010-327` $\to$ Tất cả đều được ánh xạ về mã nội bộ `FM-FUS-01`.
- **Cơ chế Nạp Dữ Liệu Bằng Import/Export CSV trong Cài Đặt (`/settings`):**
  - Quản trị viên tải tệp CSV mẫu, điền danh mục mã lỗi của 6 hãng (Ricoh, HP, Canon, Epson, Brother, Xerox) và upload lên hệ thống.
  - Backend kiểm tra tính hợp lệ và cập nhật vào bảng PostgreSQL `internal_error_definitions` và `vendor_error_mappings`.
  - Toàn bộ lịch sử thêm/sửa/xóa mã lỗi được ghi nhận bất biến trong bảng `error_code_audit_logs`.
- **Cơ chế Xử lý Mã Lỗi Không Hỗ Trợ & Chưa Ánh Xạ (Fallback Engine):**
  - Khi phát hiện mã lỗi từ Zabbix/SNMP chưa có trong từ điển:
    + Gán mã dự phòng chuẩn `FM-UNK-01` (hoặc `FM-<SUBSYSTEM>-99` nếu nhận diện được phân hệ cơ bản từ tên trigger Zabbix).
    + Lưu nguyên vẹn chuỗi lỗi hãng vào `raw_vendor_code` (ví dụ `SC990-00`, `0x80041001`), không xóa hoặc làm tròn.
    + Kế thừa mức độ nghiêm trọng từ Zabbix Trigger (`Critical`, `Warning`, `Info`).
    + Tự động gắn cờ `needs_mapping_review: true` trong Ticket/Incident để Kỹ sư NOC tra cứu Service Manual và bổ sung vào từ điển CSV tại `/settings`.

### 3.4. Phân Hệ Dashboard Theo Vai Trò (Role-Based Dashboard)

- **Giao diện React tối giản hiện đại (Modern Minimalist Bento Grid):**
  - *Thẻ Fleet KPI Bento:* Đồng bộ nền phẳng viền mảnh (`#e2e8f0`), số liệu font JetBrains Mono nổi bật, màu thương hiệu `#2563eb`. Hiển thị tỷ lệ động `${onlineCount}/${totalPrinters}` Trực tuyến (loại bỏ số liệu cứng).
  - *Biểu đồ Khả dụng (AvailabilitySplineChart):* Pure React SVG sắc nét, đường cong spline 2.25px với trục thời gian 24h và tooltip tương tác tức thì.
  - *Biểu đồ Cung tròn đồng tâm (RefinedFleetDonut):* Phân bổ trạng thái thiết bị 3 dải màu (Hoạt động tốt, Cảnh báo vật tư, Sự cố & Ngoại tuyến).
  - *Bảng Thiết Bị Cần Xử Lý (AttentionDevicesTable):* Tách bạch rõ ràng giữa Mất kết nối mạng (Offline) và Hư hỏng cơ khí/phần cứng; phân trang thu gọn (5 dòng/trang); nút thao tác kép: [Chẩn đoán] (mở Drawer OID) và [+ Lập lệnh] (chuyển sang tạo lệnh bảo trì).
- **Cơ chế Data Scope:**
  - Backend middleware tự động kiểm tra JWT claims và tiêm điều kiện `WHERE department_id IN (...)` vào câu truy vấn cơ sở dữ liệu.
  - Người dùng phòng ban tuyệt đối không truy cập được dữ liệu chi tiết của phòng ban khác.
- **Lưu trữ Tùy biến Giao diện:**
  - Bảng PostgreSQL `user_dashboard_preferences` lưu cấu hình widget JSON để người dùng có thể kéo thả, sắp xếp hoặc ẩn/hiện các khối theo nhu cầu cá nhân.

---

## 4. Các Nguyên Tắc Nghiệp Vụ Bắt Buộc (Mandatory Principles)

1. **Tuyệt đối không bịa đặt dữ liệu (No Fabricated Data):** Không tự tạo mã lỗi giả lập hoặc số liệu đo lường không có thực từ Zabbix/SNMP.
2. **Không dùng Mock Data ngầm khi mất kết nối:** Khi API gián đoạn, hiển thị trung thực trạng thái `Trống`, `Dữ liệu đã cũ (Stale)` hoặc `Lỗi kết nối`.
3. **Quy chuẩn giá trị đo lường số (`MetricValue`):** Mọi giá trị đo lường phải dùng kiểu `number | null`. Khi không có dữ liệu, hiển thị `—`, tuyệt đối không thay bằng số `0`.
4. **Tuyệt đối không sử dụng trường `actionGuidance`:** Toàn bộ hệ thống (giao diện, backend, cơ sở dữ liệu, tài liệu) không được xuất hiện trường `actionGuidance`.
5. **Giao diện thuần Việt chuẩn mực:** Sử dụng thuật ngữ tiếng Việt chuẩn kỹ thuật vận hành: *Danh sách máy in, Lịch trình, Lệnh bảo trì, Sản lượng theo thiết bị, Vật tư máy tải cao, Điểm nóng sự cố, Hộp mực thải*.
6. **Hệ thống Icon chuẩn duy nhất:** 100% sử dụng FontAwesome (`@/shared/icons/`), nghiêm cấm các thư viện icon khác (AGENTS.md Rule 7.1).
7. **Giới hạn độ dài tệp tin mã nguồn:** Mọi tệp `.tsx`/`.ts` duy trì nghiêm ngặt $< 300\text{ LOC}$ (tối ưu 150–250 LOC).
8. **Tuân thủ Bộ Tiêu Chuẩn 6 Cổng (6-Gate Checklist) Trước Khi Nối Backend & Xóa Mock:** Bắt buộc vượt qua 6 cổng kiểm duyệt (Schema Prisma PostgreSQL 16, Nạp từ điển 6 hãng + Test unmapped fallback, Zabbix poller 30s/1h + Test Rollover 32-bit, Cache 60s + Xử lý Stale không dùng mock ngầm, Đồng bộ 100% Type Contracts `MetricValue = number | null`, và Kiểm thử E2E) trước khi chuyển cờ `DATA_SOURCE = "api"`. Mock data phải được lưu trữ dự phòng (archive) thay vì xóa đột ngột.
