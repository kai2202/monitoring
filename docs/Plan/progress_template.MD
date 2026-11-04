# MASTER progress: [Tên dự án]

## 1. Tổng quan dự án

- **Mục tiêu:** [Mục tiêu tổng thể]
- **Ngày bắt đầu:** [YYYY-MM-DD]
- **Dự kiến hoàn thành:** [YYYY-MM-DD]
- **Trạng thái:** [Planning / In Progress / Completed]
- **Tiến độ tổng thể:** [X%]

### Thống kê tiến độ

- Tổng số Phase: [N]
- Tổng số Milestone: [N]
- Tổng số Task: [N]
- Đã hoàn thành: [N]
- Đang thực hiện: [N]
- Bị chặn: [N]
- Chưa bắt đầu: [N]

---

## 2. Danh sách các giai đoạn (Phases)

| Phase ID | Tên giai đoạn     | Trạng thái  | Tiến độ | Ưu tiên | Phụ thuộc |
| -------- | ----------------- | ----------- | ------: | ------- | --------- |
| PH-01    | [Tên giai đoạn 1] | Not Started |      0% | High    | None      |
| PH-02    | [Tên giai đoạn 2] | Not Started |      0% | High    | PH-01     |
| PH-03    | [Tên giai đoạn 3] | Not Started |      0% | Medium  | PH-02     |

---

## 3. Chi tiết từng Phase

### PH-01: [Tên giai đoạn]

**Mục tiêu:** [Kết quả cần đạt]

**Phạm vi:** [Các chức năng hoặc module liên quan]

**Điều kiện bắt đầu:** [Điều kiện tiên quyết]

**Phụ thuộc:** [Phase hoặc Task cần hoàn thành trước]

**Tiêu chí hoàn thành Phase:**

- [ ] [Tiêu chí 1]
- [ ] [Tiêu chí 2]
- [ ] [Tiêu chí 3]

#### Milestone

| Milestone ID | Tên mục tiêu | Trạng thái  | Tiến độ | Điều kiện hoàn thành |
| ------------ | ------------ | ----------- | ------: | -------------------- |
| MS-01.1      | [Mục tiêu 1] | Not Started |      0% | [Điều kiện]          |
| MS-01.2      | [Mục tiêu 2] | Not Started |      0% | [Điều kiện]          |

#### Danh sách Task

| Task ID  | Tên Task        | Milestone | Trạng thái  | Ưu tiên | Người phụ trách   | Hạn hoàn thành | File Task   |
| -------- | --------------- | --------- | ----------- | ------- | ----------------- | -------------- | ----------- |
| TASK-001 | [Tên công việc] | MS-01.1   | Not Started | High    | [Người phụ trách] | [YYYY-MM-DD]   | [Đường dẫn] |
| TASK-002 | [Tên công việc] | MS-01.1   | Not Started | Medium  | [Người phụ trách] | [YYYY-MM-DD]   | [Đường dẫn] |
| TASK-003 | [Tên công việc] | MS-01.2   | Not Started | Medium  | [Người phụ trách] | [YYYY-MM-DD]   | [Đường dẫn] |

#### Phụ thuộc giữa các Task

- TASK-002 cần TASK-001 hoàn thành trước.
- TASK-003 có thể thực hiện độc lập.

#### Tiến độ Phase

- [ ] Phân tích yêu cầu.
- [ ] Hoàn thành các Task bắt buộc.
- [ ] Kiểm thử tích hợp.
- [ ] Xác minh tiêu chí hoàn thành.
- [ ] Cập nhật tài liệu và tiến độ.

---

## 4. Danh mục trạng thái chuẩn

- `Not Started`: Chưa bắt đầu.
- `Ready`: Đủ điều kiện thực hiện.
- `In Progress`: Đang thực hiện.
- `Blocked`: Bị chặn bởi phụ thuộc hoặc vấn đề khác.
- `In Review`: Đang kiểm tra, đánh giá.
- `Completed`: Đã xác minh hoàn thành.
- `Cancelled`: Đã hủy.

## 5. Quy tắc quản lý tiến độ

1. Mỗi Phase phải có mục tiêu và tiêu chí hoàn thành rõ ràng.
2. Mỗi Milestone phải liên kết với các Task cụ thể.
3. Mỗi Task phải có ID duy nhất và liên kết đến file mô tả chi tiết.
4. Không đánh dấu Completed nếu chưa đáp ứng Definition of Done.
5. Không tự bịa tiến độ, ngày hoàn thành hoặc kết quả kiểm thử.
6. Chỉ cập nhật trạng thái sau khi có kết quả thực tế.
7. Tiến độ Phase được tính từ các Task thuộc Phase theo quy tắc nhất quán; không cộng trung bình tùy ý khi các Task có quy mô khác nhau.
8. Khi thay đổi phạm vi, phụ thuộc hoặc thời hạn, phải cập nhật roadmap và ghi nhận lý do.
9. Không tạo Task trùng lặp; ưu tiên cập nhật Task hiện có nếu cùng mục tiêu.
10. Roadmap là nơi theo dõi tổng thể; hướng dẫn triển khai chi tiết nằm trong file Task riêng.

## 6. Nhật ký thay đổi roadmap

| Ngày         | Nội dung thay đổi | Lý do   | Người cập nhật   |
| ------------ | ----------------- | ------- | ---------------- |
| [YYYY-MM-DD] | [Nội dung]        | [Lý do] | [Người cập nhật] |

## 7. Báo cáo tổng kết

- **Phase đã hoàn thành:** [Danh sách]
- **Phase đang thực hiện:** [Danh sách]
- **Task bị chặn:** [Danh sách và nguyên nhân]
- **Rủi ro hiện tại:** [Danh sách]
- **Ưu tiên tiếp theo:** [Các Task tiếp theo]
- **Tài liệu liên quan:** [Đường dẫn]
- **Cập nhật gần nhất:** [YYYY-MM-DD]
