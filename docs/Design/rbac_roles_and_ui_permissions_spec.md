# FleetMonitor — Đặc Tả Phân Quyền 3 Vai Trò & Ma Trận Hiển Thị Giao Diện (RBAC UI Matrix)

> **Dự án:** FleetMonitor — Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp Tập trung  
> **Tài liệu:** Đặc tả phân quyền 3 vai trò, hành vi giao diện người dùng & cơ chế đăng nhập  
> **Phiên bản:** 1.1.0 (Chuẩn hóa trường dữ liệu theo Job Description & Hệ thống kiểm soát chéo)  
> **Trạng thái:** Authoritative RBAC UI Specification

---

## 1. Danh Mục 3 Vai Trò Cốt Lõi (Core Roles)

Hệ thống FleetMonitor chuẩn hóa mô hình phân quyền thành **3 nhóm vai trò tác nghiệp**, bám sát cơ cấu nhân sự thực tế trong doanh nghiệp:

| Mã vai trò (Role Code) | Tên vai trò (Role Name) | Tài khoản mẫu (Demo Account) | Đối tượng thực tế | Phạm vi dữ liệu (Data Scope) |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | **Quản Trị Viên Hệ Thống (IT & NOC)** | `admin` / `admin123`<br>*(Nguyễn Văn An)* | Trưởng phòng IT, Kỹ sư giám sát & vận hành hệ thống NOC | **Toàn công ty** (Tất cả 5 tầng, toàn bộ ~100 máy in, tất cả phòng ban, cấu hình hệ thống & từ điển lỗi CSV) |
| **`FIELD_TECH`** | **Kỹ Thuật Viên Hiện Trường** | `tech_nam` / `tech123`<br>*(Lê Hoàng Nam)* | Kỹ thuật viên bảo trì máy in, sửa chữa cơ điện tử | **Công việc được giao** (Lệnh bảo trì, thiết bị cần sửa chữa tại hiện trường, thực thi SOP Stepper, ảnh nghiệm thu) |
| **`ASSET_HR`** | **HR / Kiểm Kê Tài Sản & Hành Chính** | `hr_kiemke` / `hr123`<br>*(Phạm Thu Hà)* | Chuyên viên quản lý tài sản, Hành chính văn phòng, Kế toán nội bộ | **Quản trị tài sản, Chi phí & Đánh giá KPI** (Danh mục máy in, serial, vị trí bàn giao, hạch toán chi phí thuê máy phòng ban, đối soát KPI bảo trì) |

---

## 2. Ma Trận Quyền Truy Cập Giao Diện (UI Permissions Matrix)

| Phân hệ / Màn hình | Route | `ADMIN` (IT/NOC) | `FIELD_TECH` (Kỹ thuật) | `ASSET_HR` (HR/Tài sản) | Ghi chú hành vi giao diện & Quyền kiểm soát |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Dashboard Tổng Quan** | `/dashboard` | ✅ Toàn quyền | ✅ Xem tổng quan | ✅ Xem tổng quan | • **Admin:** Đầy đủ chẩn đoán OID & thiết lập.<br>• **Tech:** Nắm bắt danh sách máy hỏng.<br>• **HR:** Nắm bắt tổng số máy trực tuyến/ngoại tuyến. |
| **Máy In — Danh Sách** | `/printers/list` | ✅ **Toàn quyền điều chuyển** | 👁️ Xem & Chẩn đoán | 👁️ **Chỉ xem kiểm kê** | • **CHỈ ADMIN có quyền điều chuyển/cập nhật vị trí & phòng ban.**<br>• **HR:** Chỉ xem số Serial, Model, Vị trí để kiểm kê đối soát, không tự ý sửa.<br>• **Tech:** Xem IP/vị trí để tiếp cận máy sửa chữa. |
| **Máy In — Lịch Trình Gantt** | `/printers/timeline` | ✅ Toàn quyền | ✅ **Thao tác chính** | 👁️ Chỉ xem (Read-only) | • **Tech:** Quan sát hạn hoàn thành công việc, nhận lệnh mới.<br>• **HR:** Xem lịch bảo dưỡng định kỳ để thông báo nhân viên. |
| **Máy In — Lệnh Bảo Trì** | `/printers/history` | ✅ **Duyệt & Tạo lệnh** | ✅ **Thực thi lệnh** | 👁️ **Đối soát KPI** | • **CHỈ ADMIN có quyền tạo Lệnh bảo trì** (kèm Zabbix auto-trigger).<br>• **HR & Admin:** Xem Thẻ KPI Đánh giá Hiệu suất KTV (MTTR, SLA, nghiệm thu).<br>• **Tech:** Thực thi Stepper, ghi Work Log, upload ảnh in test MinIO. **ẨN chi phí VNĐ**. |
| **Drawer Chẩn Đoán Chi Tiết** | *(Slide-over Drawer)* | ✅ Toàn quyền | ✅ Dynamic Stepper & Log | 👁️ Xem thông tin tài sản | • **Nút [Tạo công việc mới] chỉ hiển thị cho ADMIN.**<br>• **Tech:** Mở tab Lệnh bảo trì mặc định, ẩn ô nhập tiền VNĐ.<br>• **HR:** Mở tab Chẩn đoán & Vật tư CMYK mặc định. |
| **Phân Tích — Sản Lượng In** | `/analytics/overview` | ✅ Toàn quyền | ✅ Xem xu hướng | ✅ Xem sản lượng PB | • **HR:** Theo dõi số trang in Mono/Color của từng phòng ban để kiểm soát định mức giấy/mực. |
| **Phân Tích — Dự Báo Vật Tư** | `/analytics/supplies` | ✅ Toàn quyền | ✅ Xem D-Day để thay | ✅ Xem D-Day mua sắm | • Cả 3 vai trò đều xem được hạn chót cạn kiệt `[D-4]`, `[D-7]` và tình trạng Hộp mực thải để phối hợp cấp phát. |
| **Phân Tích — SLA & Chi Phí** | `/analytics/sla-cost` | ✅ Toàn quyền | ❌ **ẨN HOÀN TOÀN** | ✅ **Xem hạch toán CP** | • **ẨN với Tech** để bảo mật thông tin tài chính hợp đồng.<br>• **HR:** Xem Vòng cung chi phí 180° để đối soát tiền thuê máy hàng tháng. |
| **Cấu Hình Hệ Thống & NOC** | `/settings` | ✅ Toàn quyền | ❌ **ẨN HOÀN TOÀN** | ❌ **ẨN HOÀN TOÀN** | • Chỉ Admin mới có quyền cấu hình Safe Window, Zabbix polling, và nạp file CSV từ điển mã lỗi. |

---

## 3. Đặc Tả Trải Nghiệm Đăng Nhập & Chuyển Đổi Vai Trò Demo (Login & UX)

### 3.1. Màn Hình Đăng Nhập (`/login`)
- **Khối Đăng nhập chuẩn:** Ô nhập Username (`faUser`) + Mật khẩu (`faLock`) + Nút [Đăng Nhập].
- **Khối Đăng nhập nhanh 1-Click (Demo Quick Switcher):** 3 thẻ Bento đại diện 3 vai trò (`Nguyễn Văn An`, `Lê Hoàng Nam`, `Phạm Thu Hà`).

### 3.2. Thanh Điều Hướng (Sidebar Dynamic Navigation)
- Tự động lọc các mục menu theo vai trò (`FIELD_TECH` ẩn *SLA & Chi phí*, *Cấu hình*; `ASSET_HR` ẩn *Cấu hình*).
- Chân Sidebar hiển thị Avatar, Tên, Badge vai trò, Popover chuyển đổi vai trò tức thì và nút Đăng xuất.

### 3.3. Bảo Vệ Đường Dẫn (Route Guard - `ProtectedRoute`)
- Chặn truy cập trái phép, điều hướng về `/login` nếu chưa đăng nhập; hiển thị thông báo **403 Forbidden** nếu không đúng quyền.

---

## 4. Bảng Đối Chiếu Đánh Giá Hiệu Suất Kỹ Thuật Viên (KPI & SLA Audit Dashboard)

Nhằm phục vụ **HR đối chiếu dữ liệu để đánh giá hiệu suất, tính thưởng KPI và Quản lý trực tiếp giám sát vận hành**, hệ thống tích hợp Bảng KPI tóm tắt hiển thị trên màn hình Lệnh bảo trì (`/printers/history`):

### 4.1. Các Chỉ Số Đánh Giá Cốt Lõi
1. **Khối lượng công việc (Workload):** Số lệnh bảo trì đã hoàn thành / Tổng số lệnh được giao (ví dụ: `8/10 lệnh - 80%`).
2. **Tỷ lệ tuân thủ cam kết SLA (% SLA Compliance):** Tỷ lệ lệnh xử lý đúng hạn cam kết chất lượng dịch vụ (chuẩn P1/P2 < 2h, P3 < 24h) $\to$ Đạt chuẩn `92.5%`.
3. **Thời gian xử lý trung bình MTTR (Mean Time To Repair):** Thời gian trung bình từ khi Tech tiếp nhận lệnh (`In_Progress`) đến khi kết thúc (`Completed`) $\to$ Đạt `42 phút`.
4. **Tỷ lệ nghiệm thu có ảnh MinIO hợp lệ:** % số lệnh hoàn thành có đính kèm ảnh in test đạt chuẩn `PASSED` $\to$ Đạt `100%` (Bằng chứng chống báo cáo khống).
5. **Xếp hạng hiệu suất HR (HR Performance Rating):**
   - **Hạng A (Xuất sắc):** SLA $\ge$ 90%, MTTR $\le$ 60 phút, 100% có ảnh in test $\to$ *Đủ điều kiện xét duyệt mức thưởng KPI cao nhất*.
   - **Hạng B (Đạt yêu cầu):** SLA $\ge$ 80%, MTTR $\le$ 120 phút.
   - **Hạng C (Cần cải thiện):** SLA < 80% hoặc thiếu bằng chứng nghiệm thu ảnh.

### 4.2. Khả Năng Hiển Thị Theo Vai Trò
- **Đối với HR (`ASSET_HR`) & Quản lý (`ADMIN`):** Hiển thị đầy đủ bảng đối soát, cho phép chọn xem từng Kỹ thuật viên (Lê Hoàng Nam) hoặc toàn đội, làm căn cứ duyệt lương/thưởng.
- **Đối với Kỹ thuật viên (`FIELD_TECH`):** Hiển thị tóm tắt năng suất cá nhân (Số việc đã xong, tỷ lệ SLA, MTTR của chính mình) để tự theo dõi tiến độ, không hiển thị dữ liệu so sánh nhạy cảm của đồng nghiệp.

---

## 5. Từ Điển Phân Quyền Mức Trường Dữ Liệu (Field-Level Permissions Dictionary)

| Phân hệ / Thực thể | Trường dữ liệu | `FIELD_TECH` (Kỹ thuật) | `ASSET_HR` (HR/Tài sản) | `ADMIN` (Quản lý IT) | Căn cứ nguyên tắc nghiệp vụ |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Thông tin Máy in** | • Mã máy, IP, Hostname<br>• Model, Hãng, Loại thiết bị | 👁️ Xem để sửa | 👁️ Xem để kiểm kê | ✏️ Toàn quyền | Cả 3 vai trò đều cần nhận diện chính xác máy in. |
| **Vị trí & Sở hữu** | • Tầng (T1 – T5)<br>• Phòng ban sở hữu (`department`) | 👁️ Xem vị trí | 👁️ **Chỉ xem kiểm kê** | ✏️ **CHỈ ADMIN ĐIỀU CHUYỂN** | Tránh xung đột dữ liệu hạ tầng, việc đổi vị trí máy in do Admin IT thực hiện. |
| **Định danh Tài sản** | • Số Serial phần cứng<br>• Ngày bắt đầu thuê / Hạn bảo hành | 👁️ Xem Serial | 👁️ **Xem đối soát HĐ** | ✏️ Toàn quyền | HR dùng Serial để đối soát với danh mục tài sản và hợp đồng thuê. |
| **Lệnh Bảo Trì (Tạo)** | • Nút [Tạo công việc mới] | ❌ **ẨN HOÀN TOÀN** | ❌ **ẨN HOÀN TOÀN** | ✏️ **CHỈ ADMIN TẠO** | Đảm bảo tính kỷ luật vận hành: Lệnh do Quản lý ban hành hoặc Zabbix auto-trigger. |
| **Quy trình SOP** | • Checklist Dynamic Stepper<br>• Trạng thái lệnh (Planned $\to$ In Progress) | ✏️ **Tích chọn hoàn thành** | 👁️ Xem tiến độ | ✏️ Toàn quyền | Kỹ thuật viên thao tác trực tiếp tại hiện trường. |
| **Linh kiện & Vật tư** | • Tên linh kiện, Mã Part, Số lượng<br>• Ghi chú thay thế | ✏️ Nhập linh kiện đã thay | 👁️ Đối soát xuất kho | ✏️ Phê duyệt | Tech ghi nhận thực tế; HR đối chiếu với phiếu đề xuất xuất kho. |
| **Chi phí Tài chính** | • Chi phí nhân công (VNĐ)<br>• Chi phí linh kiện (VNĐ)<br>• Tổng chi phí thực tế (VNĐ) | ❌ **ẨN HOÀN TOÀN** | 👁️ **Xem để ghi sổ kế toán** | ✏️ Toàn quyền | Bảo mật thông tin thương mại; Tech không phải chịu trách nhiệm tính toán tiền tệ. |
| **Nghiệm thu** | • Tải ảnh in test MinIO (`PASSED`)<br>• Ký nhận / Đóng lệnh | 📷 **Bắt buộc upload ảnh** | 👁️ Kiểm tra xác thực | ✏️ Phê duyệt đóng lệnh | Bằng chứng khách quan phục vụ HR chấm điểm hiệu suất và tính thưởng. |
| **Hạch toán Chi phí** | • Vòng cung chi phí 180°<br>• Chi phí vượt định mức trang in | ❌ **ẨN HOÀN TOÀN** | 📊 **Xem đối soát hóa đơn** | 📊 Toàn quyền | Phục vụ HR/Kế toán đối soát thanh toán hàng tháng với nhà cung cấp dịch vụ thuê máy. |
