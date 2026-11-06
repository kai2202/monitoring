# TASK-[FE/BE]-[ID]: [Tên Nhiệm Vụ Kỹ Thuật]

> **Phân hệ:** [Frontend | Backend] / [Tên Module]  
> **Mã nhiệm vụ:** TASK-[FE/BE]-[ID]  
> **Phiên bản:** 1.0.0  
> **Trạng thái:** [Đang thực hiện | Sẵn sàng triển khai | Đã hoàn thành]  
> **Tài liệu liên quan:** [Kiến Trúc](file:///f:/Code/Github/Monitoring/docs/Design/architecture.md), [Tổng Quan](file:///f:/Code/Github/Monitoring/docs/Design/00_overview.MD), [API Contract](file:///f:/Code/Github/Monitoring/docs/Build/API_CONTRACT.MD)

---

## 1. Mục Tiêu & Phạm Vi Nghiệp Vụ (Objectives & Business Scope)

### 1.1 Mục Tiêu Kỹ Thuật
- [Mô tả chi tiết mục tiêu cần đạt được trong nhiệm vụ này]
- [Các ranh giới kỹ thuật: Quy mô ~100 máy in, Single Source of Truth, v.v.]

### 1.2 Nguyên Tắc Bắt Buộc Tuân Thủ (AGENTS.md Compliance)
- **Data Integrity (Rule 5):** `MetricValue = number | null`, không tự ý bịa số 0 cho dữ liệu rỗng.
- **File Length (Rule 7.1):** Mỗi file `< 300 LOC` (tối ưu 150 – 250 LOC).
- **Hệ Thống Icon (Rule 7.1):** 100% FontAwesome (`@/shared/icons`), nghiêm cấm icon bên ngoài.
- **Không trường cấm (Rule 6):** Tuyệt đối không thêm trường `actionGuidance`.

---

## 2. Thiết Kế Cấu Trúc File & Luồng Dữ Liệu (File Layout & Data Flow)

```text
[Đường dẫn file chính và các sub-components / services liên quan]
```

---

## 3. Hợp Đồng Dữ Liệu & Typescript Interfaces (Data Contracts)

```typescript
// Các interface dữ liệu chuẩn hóa cho task này
```

---

## 4. Tiêu Chí Nghiệm Thu Chi Tiết (Acceptance Criteria)

- [ ] **Tiêu chí 1:** [Mô tả hành vi UI / API / Service mong đợi]
- [ ] **Tiêu chí 2:** [Xử lý các trạng thái Loading, Empty, Error, Stale]
- [ ] **Tiêu chí 3:** [Kiểm tra tính toàn vẹn và không xung đột dữ liệu]
- [ ] **Tiêu chí 4:** [Mọi file tuân thủ hard limit < 300 LOC]

---

## 5. Kế Hoạch Kiểm Thử & Lệnh Xác Minh (Verification & Testing)

```bash
# Lệnh kiểm thử tự động
npm --prefix frontend test -- --run
npm --prefix frontend run build
npm --prefix backend run typecheck
```

