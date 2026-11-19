# FleetMonitor — Yêu Cầu Nghiệp Vụ Hệ Thống (Business Requirements Document)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Yêu Cầu Nghiệp Vụ & Phạm Vi Chức Năng 4 Hạng Mục Trọng Tâm (Business Requirements)  
> **Phiên bản:** 2.6.0 (Hiệu chỉnh quy mô hạm đội tập trung ~100 máy in, 100% Pure React SVG, Quản trị Bảo trì CMMS, Chuẩn hóa mã lỗi CSV & RBAC Data Scope)  
> **Trạng thái:** Authoritative (Đã phê duyệt kiến trúc)

---

## 1. Bối Cảnh Nghiệp Vụ, Định Hướng Mở Rộng & 4 Trọng Tâm

### 1.1. Bối cảnh khởi điểm (Giai đoạn 1 — Hạm đội Máy in)
Tại doanh nghiệp, hệ thống khởi đầu bằng bài toán quản lý **hạm đội thiết bị in ấn** (tại các tòa nhà/trụ sở và chi nhánh vệ tinh) với hai hãng chủ lực **Canon, Ricoh** cùng **HP, Brother, Epson, Toshiba, Olivetti**. Giai đoạn 1 giải quyết 4 bài toán vận hành cốt lõi:

1. **Printer Analytics & Cost Control:**
   - Theo dõi sản lượng in theo chu kỳ 24 Giờ, 7 Ngày và 30 Ngày bằng **100% Pure React SVG**: Biểu đồ *Biến động sản lượng in*, *Bảng sản lượng theo thiết bị* kèm *Modal So sánh chi tiết thiết bị*.
   - Dự báo cạn kiệt vật tư theo tốc độ tiêu hao 7 ngày (**D-Day**) và theo dõi hộp mực thải.
   - Theo dõi **SLA & Chi phí** với 3 KPI trọng tâm (*Độ sẵn sàng Uptime SLA*, *Tổng chi phí sửa chữa & vật tư*, *Máy cảnh báo lỗi lặp lại*), **Donut Chart Phân bổ chi phí theo Tầng & Quản lý đại diện** (xem chi tiết khoản *Sửa chữa*, *Vật tư* và *Chi phí khác*), bảng *Máy in lỗi nhiều & Chi phí sửa chữa* và *Bảng mã lỗi lặp lại*.
2. **Maintenance Management (CMMS):** Vòng đời 3 tầng `Ticket -> Task -> Work Log`, lưu ảnh nghiệm thu MinIO S3, lịch trình Gantt và tái sử dụng tri thức lịch sử.
3. **Error Code Standardization:** Chuẩn hóa mã lỗi đa hãng về `FM-<SUBSYSTEM>-<INDEX>`, nạp qua CSV tại `/settings/dictionary`.
4. **Role-Based Dashboard & RBAC:** 3 vai trò (`ADMIN`, `FIELD_TECH`, `ASSET_HR`); nhân sự không bị giới hạn xem theo chi nhánh.

### 1.2. Định hướng Mở rộng (Giai đoạn 2+ — Quản lý Tài sản Doanh nghiệp & Đối chiếu Thừa/Thiếu)
Từ nền tảng kiểm kê và hạch toán chi phí máy in ở Giai đoạn 1, hệ thống định hướng mở rộng thành giải pháp **Quản lý Tài sản Doanh nghiệp (TSCĐ, CCDC, thiết bị & tồn kho)** với **3 mục tiêu cụ thể**:

1. **Mục tiêu 1 — Khớp 100% giữa Thực tế – Sổ tài sản – Sổ cái kế toán:**
   - *Vấn đề giải quyết:* Xóa bỏ lệch số liệu giữa kiểm đếm hiện trường, file theo dõi nội bộ và sổ kế toán.
   - *Giải pháp cần xây:*
     - **Kiểm kê QR/Mã vạch vs Sổ tài sản:** Gắn mã định danh duy nhất; quét kiểm kê định kỳ/đột xuất để tự động phân loại tài sản **Thiếu** (mất/thất lạc) và **Thừa** (chưa ghi sổ).
     - **Sổ tài sản vs Sổ cái kế toán:** Đối chiếu số dư, khấu hao, chi phí trả trước (`242`) để phát hiện chênh lệch do nhập tay hoặc điều chỉnh chưa đồng bộ.
2. **Mục tiêu 2 — Tối ưu hiệu suất sử dụng (Phát hiện Dư thừa & Thiếu hụt theo nhu cầu):**
   - *Vấn đề giải quyết:* Ngăn tình trạng chôn vốn ở nơi thừa và gián đoạn vận hành hoặc mua mới lãng phí ở nơi thiếu.
   - *Giải pháp cần xây:*
     - Theo dõi vòng đời trạng thái: **`Đang dùng` – `Trong kho` – `Hư hỏng / Chờ thanh lý`**.
     - Cảnh báo tài sản nằm im quá hạn, cảnh báo thiếu hụt định mức và tạo luồng đề xuất **Điều chuyển nội bộ** / **Thanh lý** trước khi mua mới.
3. **Mục tiêu 3 — Gắn kết trực tiếp Thừa/Thiếu với Chi phí & Doanh thu:**
   - *Tác động tới Chi phí:*
     - *Tài sản thừa/nhàn rỗi:* Tính toán chi phí phát sinh vô ích (khấu hao, lưu kho, bảo trì, bảo hiểm, thuê mặt bằng) để làm cơ sở cắt giảm.
     - *Tài sản thiếu/mất mát:* Gắn với **Người quản lý đại diện** và lịch sử bàn giao để làm rõ nguyên nhân, quy trách nhiệm bồi thường và hạch toán chênh lệch theo quy định.
   - *Tác động tới Doanh thu:*
     - *Ngăn sụt giảm doanh thu:* Cảnh báo thiếu thiết bị/tồn kho/công cụ kịp thời để không trễ đơn hàng hay gián đoạn phục vụ.
     - *Cải thiện biên lợi nhuận:* Điều chuyển tài sản dư sang bộ phận cần dùng hoặc thanh lý thu hồi vốn.

---

## 2. Mô Hình Người Dùng & Phân Quyền RBAC

FleetMonitor chuẩn hóa thành **3 nhóm vai trò cốt lõi** (không giới hạn phạm vi xem theo chi nhánh/tầng đối với nhân sự tác nghiệp):

| Nhóm Vai Trò (Role) | Chức Danh Thực Tế | Phạm Vi Truy Cập | Tiêu Chí KPI & Trọng Tâm Hiển Thị | Quyền Hạn Hệ Thống (Permissions) |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`**<br>(Quản trị IT & NOC) | Trưởng phòng IT / Kỹ sư giám sát NOC | **Toàn công ty** | Tỷ lệ khả dụng SLA hạm đội, Hàng đợi sự cố phần cứng khẩn cấp, Lịch trình Gantt, Giám sát polling Zabbix qua VPN, Kiểm duyệt từ điển CSV. | Toàn quyền xem và cấu hình (Full Access); **Duy nhất có quyền điều chuyển vị trí máy in, quản lý tài khoản RBAC và tạo/duyệt lệnh bảo trì**; nạp CSV mã lỗi. |
| **`FIELD_TECH`**<br>(Kỹ thuật viên) | Kỹ thuật viên bảo trì hiện trường | **Toàn công ty (theo tác vụ kỹ thuật)** | Danh sách lệnh công việc trong ngày; Lịch trình Gantt; Quy trình Dynamic Stepper; Bảng đối chiếu năng suất cá nhân. | Nhận lệnh và cập nhật tiến độ; ghi chép Work Log; tải ảnh nghiệm thu in test MinIO (`PASSED`). **Ẩn hoàn toàn các số liệu chi phí tiền tệ (VNĐ)**. |
| **`ASSET_HR`**<br>(HR / Kiểm kê) | Chuyên viên quản lý tài sản / Kế toán | **Quản trị tài sản & Chi phí** | Kiểm kê số lượng thiết bị (Serial, Model, Tầng, Quản lý đại diện); Hạch toán chi phí sửa chữa, vật tư & chi phí khác theo Tầng/Quản lý; Đối soát thừa/thiếu. | Quyền xem kiểm kê tài sản (Read-only, không tự ý sửa vị trí); xem Donut Chart chi phí sửa chữa & vật tư để đối soát ngân sách; xuất CSV đối soát kế toán. |

---

## 3. Đặc Tả Chi Tiết 4 Phân Hệ Nghiệp Vụ Cốt Lõi

### 3.1. Phân Hệ Phân Tích Sản Lượng & Vật Tư (Printer Analytics — Quy Mô ~100 Máy In)

- **Trực quan hóa Pure React SVG Đậm Đặc Thông Tin:**
  - *Xu Hướng Sản Lượng & Đỉnh Tải:* Đường cong Soft Spline 2.25px với Gradient Glow bán trong suốt, viên nang đỉnh tải (Peak Pill), tooltip đa tầng hiển thị chi tiết số trang và đối chiếu kỳ trước.
  - *Bảng Sản Lượng Theo Thiết Bị & So Sánh Chi Tiết:*
    + Bảng chuẩn 7 cột hiển thị tên máy, vị trí tầng, tổng sản lượng, tách cột Đen trắng (Mono - `#2563eb`) và In màu (Color - `#ec4899`) kèm thanh tỷ trọng gọn.
    + Cho phép ghim nhiều thiết bị và mở **Modal So sánh chi tiết thiết bị** (Biểu đồ cột đối chiếu + Bảng 3 nhóm cốt lõi có tự động đánh dấu giá trị *Tốt nhất*).
  - *Dự Báo Cạn Kiệt Vật Tư [D-Day] (Supplies Forecasting):*
    + Thuật toán tính toán Tốc độ tiêu hao trung bình trượt 7 ngày: $\Delta C_{avg} = (C_{t-7} - C_t) / 7$ (%/ngày); Số ngày còn lại $D = C_t / \Delta C_{avg}$.
    + Huy hiệu viên nang đếm ngược hạn chót: `[D-4]` (Đỏ $\le 5$ ngày), `[D-7]` (Vàng $\le 14$ ngày), `[D-25]` (Xanh an toàn).
    + Quy chuẩn điều kiện biên (Rule 5 AGENTS.md): Máy mới (< 3 ngày dữ liệu) hoặc máy không in trong tuần ($\Delta C_{avg} \le 0$) bắt buộc trả về `null` (hiển thị `—`, tuyệt đối không bịa số ngày); Khi thay mực mới ($C_t > C_{prev}$), tự động reset cửa sổ tính toán.
    + Hiển thị trực quan: Máy in đơn sắc hiển thị chấm đen ⚫ + % mực K (C, M, Y trả về `null` hiển thị `—`); Máy in màu hiển thị 4 vạch thanh đứng siêu nhỏ (CMYK).
    + Theo dõi riêng trạng thái Hộp mực thải (Waste Toner Box: Bình thường, Sắp đầy ⚠️, Đầy 🛑).
    + Nút hành động nhanh: Tạo lệnh cấp phát vật tư chuyển thẳng sang Lệnh bảo trì.
  - *Phân Bổ Chi Phí Theo Tầng & Quản Lý, Máy Lỗi Nhiều & Mã Lỗi Lặp Lại (SLA & Cost):*
    + Dải 3 KPI trọng tâm: *Độ sẵn sàng (Uptime SLA)*, *Tổng chi phí sửa chữa & vật tư*, và *Máy cảnh báo lỗi lặp lại*.
    + Biểu đồ **Donut Chart** (Top 5 khu vực + nhóm Khác) kết hợp bảng cuộn tìm kiếm theo **Tầng & Người quản lý đại diện**, kèm Modal xem chi tiết từng khoản chi (*Sửa chữa*, *Vật tư*, *Chi phí khác*).
    + Bảng **Máy in lỗi nhiều & Chi phí sửa chữa** (xếp theo số lần sự cố, chi phí đã bỏ ra và nút *Đề xuất thay thế*) cùng **Bảng mã lỗi phần cứng lặp lại**.

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
- **Cơ chế phân quyền RBAC:**
  - Backend middleware kiểm tra JWT claims và phân quyền theo vai trò (`ADMIN`, `FIELD_TECH`, `ASSET_HR`); ẩn thông tin chi phí tài chính đối với `FIELD_TECH`.
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
