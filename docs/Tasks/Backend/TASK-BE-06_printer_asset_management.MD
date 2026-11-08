# TASK-BE-06: Printer & Physical Asset Management

> **Phân hệ:** Backend / Asset & Fleet Management  
> **Mã nhiệm vụ:** TASK-BE-06 (Giai đoạn 6 / 18 trong Master Roadmap)  
> **Phiên bản:** 2.0.0 (Quản lý tài sản máy in On-Premises, Đồng bộ Zabbix Host)  
> **Trạng thái:** ✅ Hoàn thành  
> **Tài liệu liên quan:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [API_CONTRACT.MD](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Xây dựng module quản lý toàn diện hồ sơ lý lịch kỹ thuật và vòng đời vật lý của ~100 máy in trong mạng nội bộ:

1. **Quản Trị Hồ Sơ Thiết Bị (Device Asset Profile):**
   - Lưu trữ thông tin định danh phần cứng: Địa chỉ IP tĩnh, Địa chỉ MAC, Số Serial xuất xưởng, Hãng sản xuất (Ricoh, Canon, HP, Brother, Epson, Xerox), Model thiết bị.
   - Phân vùng vị trí vật lý: Tòa nhà, Tầng (Tầng 1 đến Tầng 5), Phòng ban sử dụng (Kế toán, Nhân sự, Pháp chế, Kinh doanh, Ban Giám đốc).
   - Quản lý trạng thái vòng đời thiết bị:
     - `ACTIVE`: Đang vận hành và được Zabbix giám sát liên tục.
     - `IN_STORAGE`: Máy dự phòng trong kho, tạm ngắt polling trên Zabbix để tiết kiệm tài nguyên.
     - `MAINTENANCE`: Đang trong lệnh sửa chữa CMMS, tạm hoãn cảnh báo SLA.
     - `DECOMMISSIONED`: Thiết bị thanh lý, lưu trữ lịch sử trọn đời.
2. **Đồng Bộ Hai Chiều Với Zabbix Host (Zabbix Host Orchestration):**
   - Khi Admin thêm máy in mới qua REST API Backend: Backend tự động gọi Zabbix API `host.create` để tạo Host trên Zabbix Server, gán đúng Template tương ứng với Model và điền IP/SNMP Community.
   - Khi chuyển trạng thái máy in sang `IN_STORAGE` hoặc `DECOMMISSIONED`: Backend tự động gọi `host.update` với `status: 1` (Disabled Host) trên Zabbix Server.
3. **Phân Tách Bộ Lọc Giao Diện Theo Tầng (Floor-Based Scope):**
   - Cung cấp endpoint tối ưu cho `@tanstack/react-table` trên giao diện, hỗ trợ lọc tức thì $< 5\text{ms}$ toàn bộ danh sách ~100 máy in.

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

- [x] Tạo mới máy in trên Backend đồng bộ tạo Host thành công trên Zabbix Server 7.0 LTS.
- [x] Điều chuyển vị trí máy in cập nhật tức thì vào CSDL PostgreSQL và phản ánh lên bản đồ số liệu Frontend.
- [x] Không làm mất lịch sử sản lượng in ấn khi máy in thay đổi phòng ban hoặc IP.

