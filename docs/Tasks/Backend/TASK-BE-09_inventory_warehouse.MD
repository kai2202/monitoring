# TASK-BE-09: Consumables Inventory & Warehouse Management

> **Phân hệ:** Backend / Inventory & Warehouse Management  
> **Mã nhiệm vụ:** TASK-BE-09 (Giai đoạn 9 / 18)  
> **Trạng thái:** ✅ Hoàn thành (Completed)  
> **Căn cứ kiến trúc:** [docs/context.MD](file:///f:/Code/Github/Monitoring/docs/context.MD), [docs/hr.MD](file:///f:/Code/Github/Monitoring/docs/hr.MD)

---

## 1. Mục Tiêu & Phạm Vi Kỹ Thuật

Triển khai module quản lý kho vật tư tiêu hao (Toner Cartridges CMYK, Drum Unit, Fuser, Waste Toner Box) tích hợp trực tiếp với hạm đội máy in của FleetMonitor:

1. **Quản lý danh mục tồn kho (Inventory Items):**
   - Quản lý mã phụ tùng Part Number / SKU tương thích theo từng model máy in (Ricoh, Canon, HP, Brother, Epson, Xerox).
   - Quản lý số lượng tồn kho khả dụng, số lượng đang cấp phát cho KTV, và ngưỡng an toàn (Safety Stock).
2. **Xuất/Nhập kho tự động theo quy trình bảo trì:**
   - Khi KTV ghi nhận Work Log thay thế linh kiện trong Task, hệ thống tự động trừ kho khả dụng và cập nhật chi phí vào máy in.
   - Khi vật tư chạm ngưỡng tối thiểu hoặc thuật toán D-Day cảnh báo cạn kiệt, hệ thống tự động gắn cờ cảnh báo nhập thêm vật tư.
3. **Phân quyền truy cập kho:**
   - `ASSET_HR`: Quản trị số lượng, giá trị tồn kho và đối soát tài sản định kỳ.
   - `FIELD_TECH`: Chỉ ghi nhận sử dụng phụ tùng kỹ thuật trong Work Order, không can thiệp vào giá vốn kho.

---

## 2. Thiết Kế Hợp Đồng API & Dữ Liệu

- `GET /api/v1/inventory/items`: Danh sách vật tư tiêu hao trong kho kèm ngưỡng cảnh báo.
- `POST /api/v1/inventory/items`: Khai báo mã vật tư / linh kiện mới.
- `POST /api/v1/inventory/transactions`: Ghi nhận phiếu nhập kho hoặc xuất kho phụ tùng.
- `GET /api/v1/inventory/compatibility/:printerModel`: Tra cứu phụ tùng tương thích với dòng máy.

---

## 3. Tiêu Chí Nghiệm Thu Chi Tiết

- [x] CSDL Prisma lưu trữ bảng `InventoryItem` và `InventoryTransaction`.
- [x] Tự động cập nhật số lượng tồn kho khi Task hoàn thành bước thay thế linh kiện hoặc xuất kho.
- [x] Tuân thủ Rule 7.1 (< 300 LOC/file) và RBAC 3 vai trò.

