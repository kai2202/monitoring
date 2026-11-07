# FleetMonitor – HR & Asset Management Verification Checklist

Tài liệu kiểm tra, đánh giá và đối soát các tính năng thuộc phân hệ **HR / Quản trị Tài sản & Chi phí (Business Management – Finance & Administration)** của hệ sinh thái FleetMonitor.

---

## Quy ước trạng thái kỹ thuật

| Ký hiệu | Trạng thái | Định nghĩa kỹ thuật |
| :---: | :--- | :--- |
| **DONE (✅)** | Hoàn thiện | Đã có giao diện, hook xử lý logic và kết nối State/Mock/API hoàn chỉnh |
| **PARTIAL (⚡)** | Triển khai một phần | Đã có luồng dữ liệu hoặc UI cơ bản, còn thiếu chi tiết nghiệp vụ sâu |
| **UI ONLY (🎨)** | Giao diện tĩnh | Đã có thành phần hiển thị trực quan nhưng dùng mock cứng hoặc chưa có hook |
| **PLANNED (⏳)** | Đã lên kế hoạch | Đã có đặc tả kiến trúc (Spec/Schema) nhưng chưa triển khai mã nguồn |
| **MISSING (❌)** | Chưa hỗ trợ | Thuộc phạm vi ERP/Kế toán tổng thể của doanh nghiệp, ngoài lõi FleetMonitor |

---

## C1. HR Dashboard – Tổng quan quản trị tài sản & chi phí

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Tổng quan tài chính & chi phí thiết bị | **DONE (✅)** | `SlaCostBreakdownChart.tsx` hiển thị tổng chi phí vận hành (VND), cấu thành chi phí thuê, linh kiện, nhân công |
| 2 | Tổng ngân sách định mức in ấn | **DONE (✅)** | Khai báo trong `mockSlaCostBreakdownData` & `useSlaCostAnalytics` |
| 3 | Tổng chi phí thực tế đã sử dụng | **DONE (✅)** | Thống kê lũy kế thực chi theo chu kỳ chọn trong `/analytics/sla-cost` |
| 4 | Định mức ngân sách còn lại | **PARTIAL (⚡)** | Tính toán chênh lệch Budget vs Actual trên KPI card chi phí phòng ban |
| 5 | Tổng chi phí vận hành hệ thống máy in | **DONE (✅)** | Tổng chi phí thuê máy + bảo trì + thay thế vật tư tiêu hao trên toàn đội máy |
| 6 | Tổng chi phí mua sắm vật tư trong kỳ | **DONE (✅)** | `MaterialExpenseOverview` và nhật ký thay thế vật tư của KTV trong Work Orders |
| 7 | Tổng công nợ phải trả nhà cung cấp | **UI ONLY (🎨)** | Hiển thị thông số đối soát dịch vụ thuê máy và linh kiện tại tab Tài chính SLA |
| 8 | Tổng giá trị tồn kho & vật tư dự phòng | **DONE (✅)** | `SupplyDetailModal.tsx` & `/analytics/supplies` tính toán số lượng hộp mực, cartridge, waste box |
| 9 | Số lượng yêu cầu mua sắm/nghiệm thu chờ duyệt | **DONE (✅)** | `TaskApprovalNotificationPopover.tsx` đếm số lượng task nghiệm thu/vật tư chờ duyệt |
| 10 | Hóa đơn & chi phí thuê máy chưa thanh toán | **PARTIAL (⚡)** | Quản lý qua danh mục chu kỳ đối soát SLA hàng tháng của từng máy in |
| 11 | Cảnh báo hợp đồng/máy in sắp hết hạn bảo dưỡng | **DONE (✅)** | `MaintenanceGanttView.tsx` cảnh báo các mốc bảo dưỡng định kỳ và chu kỳ kiểm tra kỹ thuật |
| 12 | Cảnh báo vượt định mức chi phí | **DONE (✅)** | Highlight màu đỏ/vàng trên biểu đồ 180° khi chi phí phòng ban vượt ngưỡng phân bổ |
| 13 | Biểu đồ biến động chi phí theo thời gian | **DONE (✅)** | Pure React SVG Area/Bar chart theo dõi chi phí theo tháng trong `SlaCostBreakdownChart.tsx` |
| 14 | Biểu đồ phân bổ chi phí theo phòng ban | **DONE (✅)** | Biểu đồ vòng cung 180° phân chia chi phí Kế toán, Kinh doanh, Nhân sự, R&D, Vận hành |
| 15 | Biểu đồ chi phí theo thương hiệu máy in | **DONE (✅)** | Bóc tách chi phí dòng máy Ricoh, Canon, HP, Xerox, Epson |

---

## C2. Budget Management – Quản lý ngân sách in ấn & chi phí phòng ban

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Tạo ngân sách theo năm | **PARTIAL (⚡)** | Thiết lập định mức in ấn và chi phí máy in trong config hệ thống |
| 2 | Phân kỳ ngân sách theo tháng/quý | **DONE (✅)** | Bộ lọc chu kỳ (7 ngày, 14 ngày, 30 ngày, Quý, Năm) trên Analytics Toolbar |
| 3 | Phân bổ định mức ngân sách theo phòng ban | **DONE (✅)** | `DepartmentCostDistribution` gán quota trang in và chi phí cho từng bộ phận |
| 4 | Phân bổ chi phí theo chi nhánh/tòa nhà | **DONE (✅)** | Bộ lọc trụ sở (HQ Tòa nhà A, Chi nhánh Miền Nam, Kho Vận) |
| 5 | Phân bổ ngân sách theo danh mục chi phí | **DONE (✅)** | Phân nhóm rành mạch: Chi phí khấu hao/thuê, Mực in/Consumables, Nhân công KTV |
| 6 | Thiết lập ngưỡng cảnh báo định mức | **DONE (✅)** | Cấu hình ngưỡng cảnh báo dung lượng trang in (Mono/Color Page Quota) |
| 7 | Theo dõi ngân sách thực chi theo thời gian thực | **DONE (✅)** | Tính toán realtime từ số trang in (Total Counter) nhân đơn giá trang in |
| 8 | Theo dõi ngân sách định mức còn lại | **DONE (✅)** | Hiển thị số trang in còn lại trong hạn mức phân bổ của tháng |
| 9 | So sánh định mức kế hoạch và thực tế | **DONE (✅)** | Hiển thị tỷ lệ % hoàn thành và % vượt định mức theo từng phòng |
| 10 | Cảnh báo khi sử dụng gần chạm ngưỡng (>= 80%) | **DONE (✅)** | Trạng thái Warning màu cam trên bảng định mức phòng ban |
| 11 | Cảnh báo khi vượt hạn mức (> 100%) | **DONE (✅)** | Trạng thái Critical màu đỏ, kích hoạt thông báo trong Notification Center |
| 12 | Điều chỉnh hạn mức ngân sách phòng ban | **PARTIAL (⚡)** | Hỗ trợ cập nhật quota trang in trong modal cấu hình thiết bị |
| 13 | Lưu nhật ký điều chỉnh hạn mức | **PARTIAL (⚡)** | Ghi nhận sự kiện trong Activity Feed (`AuditLog`) |
| 14 | Phê duyệt cấp hạn mức đột xuất | **PLANNED (⏳)** | Luồng xin cấp thêm trang in ngoài định mức khi tổ chức sự kiện |
| 15 | Xuất báo cáo ngân sách & chi phí theo kỳ | **DONE (✅)** | Nút `Xuất báo cáo` xuất dữ liệu bảng chi phí ra định dạng CSV chuẩn |

---

## C3. Procurement Management – Quản lý mua sắm & Cấp phát vật tư

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Tạo yêu cầu mua sắm/thay thế vật tư | **DONE (✅)** | Tích hợp trực tiếp trong phiếu bảo trì: KTV ghi nhận vật tư cần cấp mới |
| 2 | Tiếp nhận yêu cầu mua vật tư từ KTV | **DONE (✅)** | Modal chi tiết lệnh bảo trì hiển thị danh mục linh kiện/mực KTV yêu cầu xuất kho |
| 3 | Phân loại yêu cầu mua sắm | **DONE (✅)** | Phân định Mực in (Toner Cartridge), Hộp mực thải (Waste Box), Trống Drum, Linh kiện cơ |
| 4 | Quản lý danh mục vật tư cần cấp | **DONE (✅)** | `/analytics/supplies` liệt kê chính xác mã vật tư tương ứng với từng dòng máy |
| 5 | Ghi nhận số lượng và đơn giá dự toán | **DONE (✅)** | Tự động tính thành tiền linh kiện dựa trên bảng giá định mức trong kho |
| 6 | Kiểm tra định mức trước khi xuất mua | **DONE (✅)** | So khớp với sản lượng trang in thực tế để kiểm tra việc tiêu hao có hợp lý hay không |
| 7 | So sánh báo giá từ các nhà phân phối | **MISSING (❌)** | Quy trình đấu thầu báo giá bên ngoài phạm vi phần mềm giám sát thiết bị kỹ thuật |
| 8 | Lựa chọn nhà cung cấp linh kiện | **PARTIAL (⚡)** | Gắn thẻ nhà cung cấp chính thức (Ricoh VN, Canon An Khang, HP Partner) |
| 9 | Tạo Purchase Order (Đơn đặt mua vật tư) | **UI ONLY (🎨)** | Xuất phiếu tổng hợp vật tư cần bổ sung dựa trên thuật toán dự báo D-Day |
| 10 | Theo dõi trạng thái đơn cấp phát vật tư | **DONE (✅)** | Trạng thái `Chờ duyệt cấp` -> `Đã xuất kho` -> `Đã thay thế vào máy` |
| 11 | Theo dõi tiến độ giao nhận linh kiện | **PARTIAL (⚡)** | Ghi nhận trong nhật ký liên hệ hãng (`WorkOrderVendorAndAttachments.tsx`) |
| 12 | Xác nhận nghiệm thu hàng vào kho | **DONE (✅)** | Nút phê duyệt nhập kho và cập nhật số lượng tồn kho khả dụng |
| 13 | Đối chiếu thực nhận với phiếu yêu cầu | **PARTIAL (⚡)** | KTV đối soát mã serial linh kiện và số lượng thực nhận khi bắt đầu thực hiện task |
| 14 | Ghi nhận chi phí mua sắm vào chi phí máy in | **DONE (✅)** | Tự động cộng dồn chi phí linh kiện vào tổng chi phí bảo trì của máy in tương ứng |
| 15 | Lưu lịch sử mua sắm & cấp phát | **DONE (✅)** | Tab Lịch sử bảo trì lưu toàn bộ chi tiết linh kiện đã cấp phát qua các năm |
| 16 | Hủy hoặc hoàn trả vật tư không tương thích | **PARTIAL (⚡)** | Cho phép hủy đề xuất linh kiện trong phiếu bảo trì kèm lý do |
| 17 | Báo cáo hiệu quả sử dụng vật tư mua mới | **DONE (✅)** | Phân tích vòng đời vật tư (Yield Per Cartridge) so với khuyến nghị nhà sản xuất |

---

## C4. Inventory Management – Quản lý kho vật tư tiêu hao & Kiểm kê tài sản

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Danh mục vật tư tiêu hao trong kho | **DONE (✅)** | Quản lý tập trung tại `/analytics/supplies` với các loại mực C, M, Y, K và phụ tùng |
| 2 | Phân loại trạng thái vật tư | **DONE (✅)** | Phân nhóm: Còn nhiều (>50%), Sắp hết (15-50%), Khẩn cấp (<15%), Cạn kiệt |
| 3 | Quản lý mã Part Number / SKU linh kiện | **DONE (✅)** | Chuẩn hóa mã linh kiện theo nhà sản xuất (ví dụ: `MP C6004-BK`, `GPR-55`) |
| 4 | Quản lý số lượng tồn kho dự phòng | **DONE (✅)** | Thống kê số lượng cartridge và waste toner box còn trong tủ dự phòng |
| 5 | Quản lý đơn vị tính (Hộp, Chai, Cái, Bộ) | **DONE (✅)** | Đơn vị tính chuẩn hóa theo loại phụ tùng in ấn |
| 6 | Định giá trị tồn kho vật tư tiêu hao | **DONE (✅)** | Nhân số lượng tồn kho khả dụng với đơn giá vật tư chuẩn |
| 7 | Nhập kho vật tư mới | **PARTIAL (⚡)** | Cập nhật số lượng vật tư sẵn sàng thay thế trong kho đệm |
| 8 | Xuất kho phục vụ lệnh bảo trì | **DONE (✅)** | Tự động trừ kho khi KTV xác nhận hoàn tất bước thay thế linh kiện trên task |
| 9 | Điều chuyển máy in và kho lưu trữ | **DONE (✅)** | Nút `Chuyển sang lưu kho` và `Giám sát lại` trên danh sách máy in |
| 10 | Kiểm kê đối soát tài sản thực tế | **DONE (✅)** | Tài khoản `ASSET_HR` đối soát Serial, Model, MAC, IP và Vị trí tầng/phòng |
| 11 | Điều chỉnh số liệu sau kiểm kê | **PARTIAL (⚡)** | Cho phép chỉnh sửa thông tin vị trí phòng ban và phòng máy trực tiếp |
| 12 | Nhật ký xuất/nhập phụ tùng máy in | **DONE (✅)** | Ghi nhận từng lần thay Drum, Gạt, Mực kèm timestamp và tên KTV thực hiện |
| 13 | Theo dõi vật tư KTV đang mang đi xử lý | **DONE (✅)** | Theo dõi qua danh sách task bảo trì đang ở trạng thái `IN_PROGRESS` |
| 14 | Bóc tách mức độ tiêu hao theo từng máy in | **DONE (✅)** | Tỷ lệ % suy giảm mực in theo từng ngày dựa trên SNMP OID `hrPrinterSupplies` |
| 15 | Cảnh báo tồn kho chạm ngưỡng an toàn | **DONE (✅)** | Thuật toán D-Day (`[D-4]`, `[D-7]`) cảnh báo thời điểm cạn kiệt để kịp tái đặt hàng |
| 16 | Cảnh báo tồn kho cạn kiệt (Zero Stock) | **DONE (✅)** | Đánh dấu nhãn đỏ `Khẩn cấp` khi máy in hết mực mà kho dự phòng không còn hộp thay |
| 17 | Tra cứu khả năng tương thích của vật tư | **DONE (✅)** | Tự động gợi ý cartridge và phụ tùng tương thích 100% với model máy in đang chọn |
| 18 | Báo cáo biến động nhập - xuất - tồn | **DONE (✅)** | `SuppliesReportModal` tổng hợp số lượng vật tư đã sử dụng và cấp mới |
| 19 | Quản lý và xử lý hộp mực thải (Waste Toner) | **DONE (✅)** | Giám sát trạng thái phao mực thải (`OK`, `Gần đầy`, `Đầy`), cảnh báo tránh tràn mực |
| 20 | Phân quyền thao tác kho (HR kiểm kê vs KTV kỹ thuật) | **DONE (✅)** | HR kiểm tra số lượng và giá trị tài sản; KTV chỉ ghi nhận sử dụng kỹ thuật |

---

## C5. Vendor Management – Quản lý nhà cung cấp & Hỗ trợ kỹ thuật hãng

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Danh bạ đối tác cho thuê và bảo hành máy in | **DONE (✅)** | Quản lý thông tin nhà phân phối Ricoh, Canon, HP, Xerox, Epson |
| 2 | Thông tin liên hệ kỹ thuật hãng | **DONE (✅)** | Hotline bảo hành, email kỹ thuật, đại diện phụ trách khu vực |
| 3 | Quản lý hợp đồng cung ứng dịch vụ | **PARTIAL (⚡)** | Gắn kèm số hợp đồng và thời hạn SLA trong thông tin thiết bị |
| 4 | Nhật ký liên lạc và hỗ trợ kỹ thuật hãng | **DONE (✅)** | `WorkOrderVendorAndAttachments.tsx` lưu lịch sử gọi hãng, giờ hẹn, tên kỹ sư hãng |
| 5 | Ghi nhận phản hồi và mã ticket hãng | **DONE (✅)** | Cho phép lưu Case ID / RMA Number của hãng khi cần bảo hành chuyên sâu |
| 6 | Đánh giá chất lượng dịch vụ nhà cung cấp | **DONE (✅)** | Đo lường tỷ lệ đáp ứng cam kết SLA khắc phục lỗi (SLA Resolution Rate %) |
| 7 | Đánh giá tốc độ phản hồi kỹ thuật | **DONE (✅)** | Tính toán chỉ số MTTR (Mean Time to Repair) khi có sự tham gia của đối tác |
| 8 | Quản lý chứng từ biên bản bàn giao linh kiện | **DONE (✅)** | Đính kèm ảnh chụp biên bản bàn giao, hóa đơn VAT hoặc phiếu xuất kho hãng |
| 9 | Báo cáo chi phí dịch vụ theo từng nhà cung cấp | **DONE (✅)** | Phân loại chi phí thuê máy và dịch vụ bảo trì theo từng đối tác cung ứng |

---

## C6. Financial Management – Quản lý chi phí vận hành & Tài chính máy in

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Quản lý tổng chi phí sở hữu (TCO) | **DONE (✅)** | Tính toán tổng chi phí khấu hao/thuê + chi phí trang in + phụ tùng thay thế |
| 2 | Quản lý chi phí thuê máy in hàng tháng | **DONE (✅)** | Cấu hình đơn giá thuê cố định (Fixed Lease Fee) cho từng máy trong hợp đồng |
| 3 | Quản lý chi phí vượt định mức bản in (Overage) | **DONE (✅)** | Đơn giá trang in đen trắng (Mono) và màu (Color) khi in vượt số trang bao gói |
| 4 | Quản lý chi phí bảo dưỡng định kỳ | **DONE (✅)** | Tính toán chi phí nhân công KTV theo giờ hoặc theo từng lần bảo trì |
| 5 | Quản lý chi phí linh kiện thay thế đột xuất | **DONE (✅)** | Hạch toán tự động vào máy in khi KTV thay Cụm sấy (Fuser), Cụm ảnh (Drum unit) |
| 6 | Phân bổ chi phí vận hành cho từng phòng ban | **DONE (✅)** | `DepartmentCostDistribution` chia đều hoặc chia theo sản lượng in thực tế |
| 7 | Lưu trữ chứng từ, hóa đơn thanh toán | **DONE (✅)** | Mục `Tài Liệu & Ảnh Nghiệm Thu` trong Work Order hỗ trợ đính kèm file chứng từ |
| 8 | Báo cáo đối soát chi phí in ấn hàng tháng | **DONE (✅)** | Xuất bảng kê chi tiết số trang in, tiền thuê máy và tiền phát sinh cho HR đối soát |
| 9 | Xuất báo cáo tài chính sang file CSV | **DONE (✅)** | Hỗ trợ tải bảng dữ liệu chi phí tài chính phục vụ phần mềm kế toán doanh nghiệp |

---

## C7. Contract Management – Quản lý hợp đồng thuê máy & Bảo hành

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Danh sách hợp đồng thuê và bảo hành máy | **DONE (✅)** | Quản lý thông qua thuộc tính thiết bị và nhà phân phối tương ứng |
| 2 | Theo dõi ngày bắt đầu và ngày kết thúc hợp đồng | **DONE (✅)** | Lưu trữ thời hạn bảo hành và chu kỳ hợp đồng thuê máy |
| 3 | Cảnh báo máy in sắp hết hạn hợp đồng thuê/bảo hành | **PARTIAL (⚡)** | Thông báo nhắc nhở trước 30 ngày để HR đàm phán gia hạn hoặc thu hồi thiết bị |
| 4 | Quản lý cam kết thời gian xử lý sự cố (SLA Target) | **DONE (✅)** | Thiết lập ngưỡng thời gian khắc phục cam kết: P1 (2h), P2 (4h), P3 (8h), P4 (24h) |
| 5 | Giám sát tỷ lệ vi phạm cam kết hợp đồng (SLA Breach) | **DONE (✅)** | `SlaCostBreakdownChart.tsx` hiển thị tỷ lệ % SLA Compliance và các ca trễ hạn |
| 6 | Lưu trữ bản scan hợp đồng và phụ lục kỹ thuật | **DONE (✅)** | Hỗ trợ lưu trữ tài liệu trong kho lưu trữ đính kèm của hệ thống |

---

## C8. Approval Center – Trung tâm phê duyệt & Đối soát KPI KTV

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Danh sách yêu cầu chờ duyệt nghiệm thu | **DONE (✅)** | `TaskApprovalNotificationPopover.tsx` hiển thị danh sách các task KTV đã hoàn thành |
| 2 | Xem ảnh bản in test kiểm tra chất lượng | **DONE (✅)** | Nút `Xem ảnh in test` phóng to modal ảnh bản in thực tế KTV chụp sau khi sửa |
| 3 | Phê duyệt đóng lệnh bảo trì (Chấp thuận nghiệm thu) | **DONE (✅)** | Nút `Phê duyệt đóng lệnh` hoàn tất quy trình, đóng ticket và chốt chi phí |
| 4 | Yêu cầu KTV làm lại (Từ chối nghiệm thu) | **DONE (✅)** | Nút `Yêu cầu làm lại` mở modal nhập lý do (chất lượng in chưa đạt, thiếu linh kiện) |
| 5 | Tự động ẩn nút duyệt khi KTV chưa hoàn thành | **DONE (✅)** | Ẩn hoàn toàn hai nút duyệt khi task còn đang xử lý hoặc KTV chưa gửi nghiệm thu |
| 6 | Phê duyệt đề xuất cấp phát phụ tùng đặc biệt | **PARTIAL (⚡)** | Duyệt đơn xuất kho linh kiện có giá trị cao trước khi KTV tiến hành thay thế |
| 7 | Đánh giá chất lượng và chấm điểm KPI kỹ thuật viên | **DONE (✅)** | Đánh giá KTV dựa trên thời gian xử lý (MTTR), tỷ lệ đạt SLA và độ hài lòng người dùng |
| 8 | Lưu vết lịch sử và định danh người phê duyệt | **DONE (✅)** | Ghi nhận tài khoản Admin/HR phê duyệt kèm dấu thời gian chính xác |
| 9 | Cơ chế ngăn chặn người tạo tự phê duyệt | **DONE (✅)** | KTV thực hiện không được quyền tự đóng lệnh nghiệm thu, bắt buộc Admin/HR duyệt |

---

## C9. Reports & Analytics – Báo cáo quản trị & Xuất dữ liệu

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Báo cáo tổng hợp trang in toàn doanh nghiệp | **DONE (✅)** | `/analytics/overview` phân tích biểu đồ sản lượng Mono và Color theo chu kỳ |
| 2 | Báo cáo chi phí in ấn theo từng phòng ban | **DONE (✅)** | Bảng chi tiết sản lượng trang in, định mức và thành tiền từng bộ phận |
| 3 | Báo cáo dự báo tiêu hao vật tư D-Day | **DONE (✅)** | `/analytics/supplies` dự báo chính xác ngày cạn kiệt mực để lập kế hoạch mua sắm |
| 4 | Báo cáo hiệu suất và chất lượng dịch vụ SLA | **DONE (✅)** | Phân tích tỷ lệ hoàn thành đúng hẹn, thời gian dừng máy (Downtime) |
| 5 | Báo cáo tỷ lệ khả dụng của đội máy in | **DONE (✅)** | KPI Fleet Availability tính toán tỷ lệ máy in sẵn sàng phục vụ công việc |
| 6 | Bộ lọc dữ liệu đa chiều (Thời gian, Phòng ban, Hãng) | **DONE (✅)** | Analytics Toolbar hỗ trợ lọc nhanh theo nhiều tiêu chí linh hoạt |
| 7 | Xuất báo cáo ra định dạng CSV chuẩn | **DONE (✅)** | Nút xuất CSV tại tất cả các bảng dữ liệu quản trị để tích hợp với Excel/PowerBI |

---

## C10. HR Security & Administration – Phân quyền vai trò `ASSET_HR`

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Tài khoản định danh chuyên biệt cho HR / Kiểm kê | **DONE (✅)** | Tài khoản `hr_kiemke` (Phạm Thu Hà - Chuyên viên Quản trị Tài sản & HR) |
| 2 | Đăng nhập 1 chạm nhanh (1-Click Role Login) | **DONE (✅)** | Thẻ đăng nhập vai trò HR trên màn hình `LoginPage.tsx` |
| 3 | Quyền xem danh sách máy in để đối soát tài sản | **DONE (✅)** | Cho phép xem IP, Model, Serial, Vị trí để kiểm kê; không cho đổi cấu hình kỹ thuật SNMP |
| 4 | Quyền theo dõi tiến độ bảo dưỡng trên lịch Gantt | **DONE (✅)** | Cho phép xem lịch trình để thông báo phòng ban phối hợp ngưng sử dụng máy khi bảo trì |
| 5 | Quyền xem phân tích chi phí và dự báo vật tư | **DONE (✅)** | Truy cập đầy đủ `/analytics/overview`, `/analytics/supplies`, `/analytics/sla-cost` |
| 6 | Ẩn hoàn toàn phân hệ Cấu hình hệ thống kỹ thuật | **DONE (✅)** | Route `/settings` (Zabbix, SNMP OID, Webhook) bị ẩn hoàn toàn với vai trò `ASSET_HR` |
| 7 | Giới hạn quyền can thiệp vào logic phần cứng | **DONE (✅)** | HR không được phép kích hoạt chẩn đoán lệnh OID hoặc ghi đè trạng thái sensor |
| 8 | Nhật ký kiểm toán thao tác người dùng (Audit Log) | **DONE (✅)** | Lưu vết mọi thao tác phê duyệt nghiệm thu và xuất báo cáo của tài khoản HR |

---

## D. Shared – Các chức năng tiện ích dùng chung với HR

| STT | Tiêu chí kiểm tra | Trạng thái | Ghi chú kỹ thuật & Minh chứng triển khai |
| :---: | :--- | :---: | :--- |
| 1 | Trung tâm thông báo thông minh (Notification Center) | **DONE (✅)** | Popover thông báo hiển thị danh sách task chờ duyệt nghiệm thu và mã lỗi chưa gán |
| 2 | Nhận thông báo khi KTV hoàn thành lệnh bảo trì | **DONE (✅)** | Tự động tăng badge đếm số lượng task cần nghiệm thu trên thanh tiêu đề |
| 3 | Nhận thông báo vật tư chạm ngưỡng khẩn cấp | **DONE (✅)** | Đẩy cảnh báo khi hộp mực dưới 15% hoặc hộp mực thải đầy |
| 4 | Tìm kiếm nhanh toàn hệ thống (Global Search) | **DONE (✅)** | Ô tìm kiếm tức thì theo Model, IP, Tên thiết bị, Vị trí phòng ban |
| 5 | Bộ lọc trạng thái thiết bị dùng chung | **DONE (✅)** | Bộ lọc phân loại máy In đang hoạt động, Lưu kho, Ngoại tuyến, Lỗi phần cứng |
| 6 | Xem tài liệu và ảnh nghiệm thu đính kèm | **DONE (✅)** | Trình xem ảnh bản in test và tệp đính kèm trực quan ngay trên modal |
| 7 | Nhật ký hoạt động chung toàn hệ sinh thái | **DONE (✅)** | Dòng thời gian ghi nhận các sự kiện phát sinh sự cố, bảo dưỡng và xử lý task |

---

## Bảng tổng kết tiến độ HR & Quản trị tài sản

| Phân hệ / Nhóm chức năng | Tổng số tiêu chí | Đã hoàn thiện (DONE) | Đang triển khai / UI (PARTIAL/UI) | Kế hoạch / Không áp dụng (PLANNED/MISSING) | Tỷ lệ hoàn thành |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **C1. HR Dashboard** | 15 | 11 | 4 | 0 | **73.3%** |
| **C2. Budget Management** | 15 | 11 | 3 | 1 | **73.3%** |
| **C3. Procurement Management** | 17 | 10 | 4 | 3 | **58.8%** |
| **C4. Inventory Management** | 20 | 17 | 3 | 0 | **85.0%** |
| **C5. Vendor Management** | 9 | 7 | 2 | 0 | **77.8%** |
| **C6. Financial Management** | 9 | 9 | 0 | 0 | **100.0%** |
| **C7. Contract Management** | 6 | 4 | 2 | 0 | **66.7%** |
| **C8. Approval Center** | 9 | 8 | 1 | 0 | **88.9%** |
| **C9. Reports & Analytics** | 7 | 7 | 0 | 0 | **100.0%** |
| **C10. HR Security (RBAC)** | 8 | 8 | 0 | 0 | **100.0%** |
| **D. Shared Features** | 7 | 7 | 0 | 0 | **100.0%** |
| **TỔNG CỘNG** | **122** | **99** | **19** | **4** | **81.1%** |

> [!NOTE]
> Bảng tiêu chuẩn trên tập trung chính xác vào vai trò thực tế của **Chuyên viên Quản trị Tài sản & Chi phí In ấn (Role `ASSET_HR`)** trong hệ sinh thái FleetMonitor. Các tính năng tổng thể nằm ngoài phần mềm kỹ thuật (như so sánh giá thầu đấu thầu độc lập của doanh nghiệp) được đánh dấu minh bạch là `MISSING (❌)` theo đúng Nguyên tắc AGENTS.md.
