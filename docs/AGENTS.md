# Hướng Dẫn & Quy Tắc Cốt Lõi Cho AI Agent (AGENTS.md)

> **Bản Tuyên Ngôn Kỹ Thuật (Engineering Manifesto):**  
> Dự án này là **Hệ Thống Giám Sát Máy In Mạng Doanh Nghiệp (Enterprise Printer Monitoring System)**.  
> Mục tiêu tối thượng của dự án là **phát hiện lỗi phần cứng tin cậy và cung cấp thông tin sự cố chính xác**, tuyệt đối không chạy theo số lượng trường giao diện hay sáng tác dữ liệu không có thực chứng.

---

## 1. Bản Đồ Tài Liệu Bắt Buộc (Mandatory Documentation)

Trước khi đề xuất hoặc thực hiện bất kỳ thay đổi nào, Agent **bắt buộc phải đọc** các tài liệu sau theo thứ tự ưu tiên:

1. **`docs/SPECIFICATION.md`** — Đặc tả yêu cầu chức năng (FR), yêu cầu phi chức năng (NFR), tiêu chí nghiệm thu (IEEE/ISO) và lộ trình mở rộng.
2. **`docs/ARCHITECTURE.md`** — Kiến trúc hệ thống phân tầng, luồng dữ liệu 4 chặng, cơ chế đệm cache 60s và quyết định công nghệ.
3. **`docs/REPO_OVERVIEW.md`** — Cấu trúc thư mục Monorepo, vai trò từng phân hệ, danh mục công nghệ và hướng dẫn cài đặt.
4. **`docs/DATA_SOURCES.md`** — Bảng dữ liệu SNMP OID, định nghĩa trạng thái xác thực (`VERIFIED`, `DOCUMENTED`, `OBSERVED`, `UNSUPPORTED`) và giới hạn kỹ thuật.
5. **`docs/PRINTER_DATA_REQUIREMENTS.md`** — Checklist đối chiếu toàn diện giữa 100% trường dữ liệu UI và OID SNMP / Zabbix Item Keys.
6. **`docs/snmp-oids/standard-mibs.md`** — Danh bạ tra cứu OID MIB tiêu chuẩn quốc tế (RFC 1213 MIB-II, RFC 3805 Printer-MIB, RFC 2790 Host-Resources).
7. **`docs/models/`** — Hồ sơ kỹ thuật và từ điển mã lỗi theo từng hãng/model:
   - `docs/models/ricoh-mp-c6004.md`: Thiết bị tham chiếu chính (Phase 1) & từ điển mã lỗi SC (Service Call).
   - `docs/models/canon-c5535i.md`: Thiết bị mở rộng Canon (Phase 2).
   - `docs/models/ricoh-aficio-legacy.md`: Dữ liệu đo đạc các dòng Ricoh đơn sắc thế hệ trước.

---

## 2. Kiến Trúc & Luồng Dữ Liệu Thực Tế (Architecture & Data Flow)

Hệ thống được tổ chức theo mô hình **Monorepo (NPM Workspaces)** với 2 ứng dụng độc lập:
- **`frontend/`**: Web Single Page Application (React 18 + Vite + TypeScript, giao diện Midnight Dashboard).
- **`backend/`**: API Gateway trung gian (Node.js + Express + TypeScript + Prisma + Zabbix JSON-RPC Client).
- **Hạ tầng Zabbix & Cấu hình ở thư mục gốc**: `compose.yaml`, `hosts_all_printers.yaml`, `templates/`, `mibs/`.

Luồng dữ liệu duy nhất đã được xác nhận:
$$\text{Máy in (SNMP v2c)} \longrightarrow \text{Zabbix 7.0 LTS (Port 8080)} \xrightarrow{\text{JSON-RPC 2.0}} \text{Backend API (Port 3001)} \xrightarrow{\text{REST JSON}} \text{Frontend (Port 3000)}$$

> [!IMPORTANT]
> - **Tuyệt đối không kết nối trực tiếp:** Frontend và Backend không bao giờ được gửi bản tin SNMP trực tiếp đến máy in. Toàn bộ việc thu thập SNMP do máy chủ Zabbix đảm nhiệm để bảo vệ card mạng máy in.
> - **Không có Mock Data ngầm:** Khi Backend chưa chạy hoặc Zabbix chưa có dữ liệu, Frontend hiển thị trạng thái trung thực **"Chờ kết nối / Chưa có dữ liệu" (No Data / Pending State)**. Tuyệt đối không tự sinh dữ liệu giả lập hay gán số liệu ảo.

---

## 3. Nguyên Tắc Giám Sát Lỗi Phần Cứng (Hardware Error Monitoring - Ưu Tiên #1)

Phát hiện lỗi phần cứng chính xác là **ƯU TIÊN SỐ 1** của toàn bộ dự án. Khi xử lý logic cảnh báo sự cố:

1. **Hiển thị thông tin lỗi chuẩn xác:**
   - Trích xuất chính xác: **Mã lỗi (Error Code)**, **Tên lỗi (Error Name)**, **Phân hệ gặp sự cố (Subsystem)** và **Mức độ nghiêm trọng (Severity: Warning / Critical)**.
   - **Không hiển thị hộp hướng dẫn sửa chữa (`actionGuidance`):** Giao diện chỉ cần tập trung thông báo lỗi rõ ràng, dễ hiểu, giữ lại mã lỗi gốc để kỹ thuật viên truy vết.
2. **Tập trung vào 2 hãng mục tiêu: Ricoh và Canon:**
   - **Ricoh:** Sử dụng model **Ricoh MP C6004** làm mốc kiểm chứng vật lý. Phân loại mã lỗi theo từ điển SC codes tại `docs/models/ricoh-mp-c6004.md`. Bóc tách các phân hệ: Bo điều khiển (SC6xx/SC8xx), Khối quét Scanner/ADF (SC1xx), Cụm laser (SC2xx), Trống/Mực (SC3xx), Băng tải (SC4xx), Cụm sấy Fusing (SC5xx).
   - **Canon:** Sử dụng model **imageRUNNER ADVANCE C5535i** (Alarm codes, MEAP platform).
   - Không sáng tác hay duy trì các model của hãng thứ ba chưa được kiểm chứng.
3. **Phân biệt rạch ròi các nhóm lỗi:**
   - Phân biệt sự cố vật tư thông thường (hết giấy, mở nắp, hết mực) với lỗi hỏng hóc cơ điện tử phần cứng (kẹt giấy cơ học, đứt cảm biến sấy, lỗi motor laser).
   - Không suy diễn lỗi phần cứng khối quét Scanner/ADF từ bộ đếm số trang in.
   - Sự vắng mặt của cảnh báo lỗi không đồng nghĩa với việc máy in đang khỏe mạnh nếu thiết bị đang ngoại tuyến (`Offline`) hoặc dữ liệu bị mất kết nối (`Stale`).

---

## 4. Chuẩn Hóa Ngôn Ngữ & Thuật Ngữ Tiếng Việt (Vietnamese Terminology)

Toàn bộ nhãn, tiêu đề, mô tả và thông báo trong hệ thống phải sử dụng **tiếng Việt tự nhiên, chuẩn mực cho môi trường IT quản trị thiết bị văn phòng**:

| Thuật ngữ tiếng Anh | CẤM DÙNG (Dịch thô / Calque) | BẮT BUỘC DÙNG (Chuẩn ngữ cảnh) |
| :--- | :--- | :--- |
| **Fleet / Printer Fleet** | *Hạm đội, đoàn tàu* | **Toàn hệ thống, hệ thống máy in, danh sách máy in** |
| **Load Curves / Volume Trend** | *Đường cong tải* | **Biểu đồ sản lượng in theo thời gian, xu hướng in ấn** |
| **Marker Supplies** | *Nguồn cung cấp đánh dấu* | **Mực in & vật tư tiêu hao** |
| **Waste Toner Box** | *Hộp mực thải rác* | **Hộp mực thải** |
| **Fuser Unit** | *Cụm kết hợp, cụm nung* | **Cụm sấy (Fuser)** |
| **Lifetime Counter** | *Số đếm cuộc đời* | **Bộ đếm vòng đời, tổng số trang trọn đời** |

---

## 5. Quy Chuẩn Kỹ Thuật Mã Nguồn (Code Standards)

### 5.1 React & TypeScript (`frontend/`)
- **Strict Type Safety:** Không dùng `any`. Sử dụng kiểu dữ liệu phản ánh chính xác API contract.
- **Quy ước giá trị đo lường bắt buộc:** `MetricValue = number | null`.
  - Giá trị số (`number >= 0`): Dữ liệu đo đạc thực tế hợp lệ.
  - Giá trị rỗng (`null`): Không thu thập được hoặc thiết bị không hỗ trợ. Hiển thị dấu gạch ngang `—` hoặc `Chưa có dữ liệu`. **Tuyệt đối không tự ý gán về 0**.
- **Tách biệt tầng:** Giữ tách biệt giữa tầng hiển thị UI Components và tầng xử lý dữ liệu (Hooks / Services).

### 5.2 Node.js & Express (`backend/`)
- **Modular Architecture:** Phân chia rõ ràng giữa Routes, Controller, Services, Diagnostics Catalog và Zabbix Client.
- **In-Memory Cache (TTL 60s):** Bảo vệ Zabbix API khỏi việc bị spam request từ nhiều client. Tự động trả về dữ liệu cache gần nhất khi Zabbix quá tải hoặc mạng chập chờn (`Stale-while-revalidate`).
- **Data Integrity:** Không để lộ Zabbix Token hay SNMP Community String ra phản hồi API của Frontend.

---

## 6. Quy Trình Vận Hành Lệnh Monorepo (NPM Workspaces)

Dự án được cấu hình NPM Workspaces chính quy tại thư mục gốc. **Luôn đứng tại thư mục gốc `Monitoring/` để thực thi các lệnh:**

```bash
# 1. Cài đặt toàn bộ dependencies cho cả frontend và backend:
npm install

# 2. Khởi chạy môi trường phát triển:
npm run dev              # Chạy Web Frontend (http://localhost:3000)
npm run dev:backend      # Chạy Backend API (http://localhost:3001)

# 3. Kiểm tra chất lượng mã nguồn bắt buộc (Quality Gates):
npm run typecheck        # Kiểm tra TypeScript toàn bộ workspaces (Yêu cầu: 0 errors)
npm run test             # Chạy toàn bộ 79 unit test cases Vitest (Yêu cầu: 100% pass)
npm run build:all        # Biên dịch production bundle cho toàn bộ monorepo
```

---

## 7. Quy Tắc Kiểm Tra & Báo Cáo Khi Thay Đổi (Verification & Reporting)

Sau khi hoàn thành bất kỳ tác vụ chỉnh sửa mã nguồn nào, Agent phải:

1. **Thực thi Quality Gate:**
   - Chạy `npm run typecheck` và đảm bảo **0 lỗi biên dịch**.
   - Chạy `npm run test` và đảm bảo **tất cả unit tests đều vượt qua**.
2. **Không phá vỡ hành vi đang hoạt động:** Giữ nguyên các chức năng, giao diện và cấu trúc đã được kiểm chứng trừ khi có yêu cầu thay đổi rõ ràng từ người dùng.
3. **Báo cáo trung thực và súc tích:**
   - Liệt kê chính xác các file đã thay đổi.
   - Nêu rõ lý do thay đổi.
   - Báo cáo kết quả các lệnh kiểm tra đã chạy thực tế.
   - Nêu rõ những gì chưa thể kiểm chứng (nếu cần máy in vật lý hoặc môi trường thực).

---
*Tuyên ngôn này là kim chỉ nam tối cao cho toàn bộ quá trình phát triển dự án.*
