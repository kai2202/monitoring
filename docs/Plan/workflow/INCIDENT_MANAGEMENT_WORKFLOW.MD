# Quy trình quản lý sự cố máy in FleetMonitor — Bản mở rộng

## Giai đoạn 1 — Phát hiện và xác thực sự kiện

Bước 1.1 — Phát hiện sự kiện: Zabbix giám sát máy in thông qua SNMP và phát sinh Trigger/Event khi điều kiện cảnh báo được thỏa mãn. FleetMonitor tiếp nhận dữ liệu từ Zabbix API, lưu mã sự kiện, thiết bị liên quan, mức độ nghiêm trọng và thời điểm phát hiện.

Bước 1.2 — Xác thực dữ liệu: FleetMonitor kiểm tra tính hợp lệ, độ mới và trạng thái thu thập dữ liệu để phân biệt sự cố máy in với lỗi giám sát. Nếu dữ liệu đã cũ, thiếu hoặc không đủ bằng chứng, hệ thống đánh dấu trạng thái chưa xác định thay vì kết luận thiết bị gặp sự cố.

Bước 1.3 — Xử lý cảnh báo trùng lặp: FleetMonitor đối chiếu mã sự kiện, thiết bị, mã lỗi và các cảnh báo đang tồn tại để nhận diện những sự kiện liên quan. Hệ thống cập nhật hoặc liên kết với dữ liệu hiện có khi phù hợp, hạn chế tạo nhiều bản ghi cho cùng một vấn đề.

Bước 1.4 — Phân biệt nguồn tiếp nhận: FleetMonitor xác định sự kiện đến từ Zabbix/SNMP hay từ người dùng cuối. Các sự kiện tự động được gắn nhãn `System-Generated`; các báo cáo thủ công được gắn nhãn `User-Reported` hoặc `Non-SNMP`. Việc phân biệt nguồn giúp lựa chọn phương pháp xác minh phù hợp ngay từ đầu.

## Giai đoạn 2 — Đánh giá và khởi tạo sự cố hoặc công việc

Bước 2.1 — Phân loại sự kiện: FleetMonitor xác định loại vấn đề dựa trên mã lỗi, tên lỗi, hãng, model và bộ phận liên quan. Các nhóm có thể bao gồm kết nối, vật tư, giấy, phần cứng hoặc lỗi chất lượng bản in. Những lỗi không thể xác định bằng SNMP, chẳng hạn bản in bị mờ, lem mực, máy phát ra tiếng ồn hoặc khay giấy bị gãy, cần được xác minh trực tiếp.

Bước 2.2 — Phân biệt Incident và Task/Work Order: Hệ thống phân loại vấn đề theo mục đích xử lý. `Incident` dùng cho sự cố đang ảnh hưởng đến hoạt động hoặc cần điều tra, khắc phục; `Task/Work Order` dùng cho công việc chủ động như thay mực sắp hết, thay Drum sắp hết hạn hoặc bảo trì định kỳ. Cảnh báo sớm, chẳng hạn mực còn 15%, có thể tạo công việc chuẩn bị thay vật tư thay vì tạo sự cố gián đoạn.

Bước 2.3 — Đánh giá mức độ ưu tiên: FleetMonitor kết hợp Severity kỹ thuật, phạm vi ảnh hưởng, mức độ gián đoạn và tính khẩn cấp để xác định Priority xử lý. Severity phản ánh mức độ nghiêm trọng của cảnh báo; Priority quyết định thứ tự xử lý công việc. Hai giá trị này cần được lưu riêng biệt.

Bước 2.4 — Tạo hồ sơ: Với sự cố cần điều tra, FleetMonitor tạo Incident ID duy nhất, lưu thiết bị, nguồn phát sinh, mức ưu tiên, thời điểm và bằng chứng ban đầu. Với công việc chủ động, hệ thống tạo Task/Work Order tương ứng. Nhiều cảnh báo có thể được liên kết vào một hồ sơ nếu chúng thuộc cùng một vấn đề.

Bước 2.5 — Tiếp nhận sự cố do người dùng báo cáo: Người dùng cuối có thể gửi báo cáo qua IT Portal, email hoặc chatbot. FleetMonitor tiếp nhận mô tả, thiết bị liên quan, thời điểm, hình ảnh nếu có và thông tin liên hệ. Báo cáo được đưa vào cùng luồng xử lý với sự cố từ Zabbix, nhưng giữ nguyên nhãn nguồn để nhân viên IT biết cần kiểm tra trực tiếp hay kiểm tra dữ liệu giám sát.

## Giai đoạn 3 — Tiếp nhận và phân công

Bước 3.1 — Đưa vào hàng đợi: Các Incident và Task/Work Order được đưa vào danh sách công việc tương ứng. Hệ thống sắp xếp theo Priority, trạng thái và thời hạn để nhân viên IT phân biệt việc cần xử lý ngay với công việc bảo trì có thể lên lịch.

Bước 3.2 — Tiếp nhận công việc: Nhân viên IT xem thông tin thiết bị, cảnh báo hoặc báo cáo của người dùng rồi xác nhận tiếp nhận. FleetMonitor lưu người phụ trách, thời điểm tiếp nhận và trạng thái công việc.

Bước 3.3 — Phân công hoặc chuyển giao: Công việc được giao cho người có chuyên môn phù hợp. Khi chuyển giao, hệ thống lưu người bàn giao, người tiếp nhận, lý do và thời điểm chuyển giao. Không yêu cầu cấp quản lý hoặc bước phê duyệt trung gian.

## Giai đoạn 4 — Điều tra, xử lý và quản lý đối tác

Bước 4.1 — Thu thập thông tin chẩn đoán: Nhân viên IT kiểm tra mã lỗi, trạng thái thiết bị, dữ liệu SNMP, lịch sử cảnh báo và thông tin từ Zabbix. Với sự cố `User-Reported` hoặc `Non-SNMP`, nhân viên ưu tiên kiểm tra tại chỗ, thực hiện bản in thử hoặc kiểm tra cơ cấu máy thay vì chỉ truy vấn SNMP.

Bước 4.2 — Xác định nguyên nhân: Nhân viên ghi nhận các bước kiểm tra, bằng chứng, nguyên nhân nghi ngờ và kết quả. FleetMonitor lưu lịch sử chẩn đoán để tránh lặp lại thao tác và hỗ trợ chuyển giao khi cần.

Bước 4.3 — Khắc phục sự cố: Nhân viên thực hiện biện pháp phù hợp như kiểm tra kết nối, xử lý kẹt giấy, thay vật tư hoặc sửa chữa phần cứng. Mỗi hành động cần ghi nhận kết quả để phân biệt biện pháp đã thử, biện pháp thành công và biện pháp chưa giải quyết được vấn đề.

Bước 4.4 — Quản lý đối tác và bảo hành (Vendor Management): Khi sự cố vượt quá khả năng xử lý nội bộ hoặc thiết bị còn bảo hành, FleetMonitor lưu thông tin nhà cung cấp, thời hạn bảo hành, mã yêu cầu dịch vụ, lịch sử liên hệ và trạng thái sửa chữa. Hồ sơ sự cố được liên kết với yêu cầu bảo hành hoặc sửa chữa bên ngoài để theo dõi xuyên suốt. Chức năng này chỉ cần triển khai khi có dữ liệu và nhu cầu quản lý đối tác thực tế.

Bước 4.5 — Quản lý trường hợp chờ xử lý: Nếu phải chờ vật tư, nhà cung cấp, lịch sửa chữa hoặc phản hồi từ người báo lỗi, nhân viên cập nhật lý do chờ, biện pháp tạm thời và thời điểm dự kiến cập nhật tiếp theo. Thời gian chờ vẫn được ghi nhận để phục vụ theo dõi tiến độ và SLA.

## Giai đoạn 5 — Theo dõi, tự động đóng và xác minh phục hồi

Bước 5.1 — Theo dõi tiến độ và nhắc việc: FleetMonitor theo dõi thời gian tiếp nhận, thời hạn xử lý, trạng thái chờ và lần cập nhật gần nhất. Khi công việc chưa được tiếp nhận hoặc quá hạn, hệ thống nhắc người phụ trách. Trạng thái chờ không tự động làm dừng SLA.

Bước 5.2 — Xử lý lỗi thoáng qua (Transient Errors): Đối với các lỗi có khả năng tự phục hồi, chẳng hạn kẹt giấy đơn giản hoặc hết giấy đã được người dùng xử lý, FleetMonitor kiểm tra trạng thái Trigger và dữ liệu mới nhất. Nếu lỗi được xác nhận đã phục hồi trong khoảng 5–10 phút và chưa có nhân viên tiếp nhận, hệ thống có thể áp dụng quy tắc Auto-Closure hoặc chuyển sang trạng thái `Self-Recovered`. Khoảng thời gian này cần được cấu hình và kiểm thử theo từng loại lỗi, không áp dụng đồng loạt cho mọi cảnh báo.

Bước 5.3 — Tự động đóng sự cố (Auto-Closure): FleetMonitor chỉ tự động đóng những sự cố thỏa mãn điều kiện đã định nghĩa, chẳng hạn lỗi thoáng qua đã phục hồi, dữ liệu mới xác nhận trạng thái bình thường và không có dấu hiệu tái diễn trong khoảng xác nhận. Hệ thống lưu lý do tự đóng, thời điểm và bằng chứng liên quan. Các lỗi Critical, sự cố cần sửa chữa thực tế hoặc sự cố do người dùng báo cáo chưa được xác minh không nên tự động đóng chỉ vì Trigger đã hết.

Bước 5.4 — Kiểm tra tình trạng phục hồi: FleetMonitor kiểm tra dữ liệu Zabbix mới nhất, trạng thái Trigger, trạng thái kết nối và thông tin liên quan. Nếu dữ liệu cũ, lỗi thu thập còn tồn tại hoặc thiếu bằng chứng, hệ thống không kết luận thiết bị đã phục hồi.

Bước 5.5 — Xác minh kết quả: Nhân viên IT xác nhận kết quả khắc phục bằng dữ liệu giám sát hoặc kiểm tra thực tế tùy loại lỗi. Với lỗi chất lượng bản in hoặc lỗi cơ học, cần có kết quả kiểm tra tại chỗ hoặc phản hồi phù hợp. Nếu lỗi vẫn tồn tại, sự cố quay lại giai đoạn điều tra và xử lý.

## Giai đoạn 6 — Đóng sự cố, hậu kiểm và quản lý vòng đời thiết bị

Bước 6.1 — Đóng sự cố: Khi đủ điều kiện xác minh, nhân viên IT hoàn thiện hồ sơ bằng cách ghi nhận kết quả, biện pháp khắc phục, nguyên nhân đã xác nhận và thời điểm phục hồi. FleetMonitor lưu người thực hiện, thời điểm đóng và lịch sử thay đổi để truy vết. Các sự cố được tự động đóng cũng phải có lý do và bằng chứng rõ ràng.

Bước 6.2 — Xử lý sự cố tái diễn: Nếu lỗi xuất hiện trở lại hoặc xác minh cho thấy vấn đề chưa được giải quyết triệt để, FleetMonitor mở lại hồ sơ hoặc tạo sự cố mới có liên kết với lịch sử trước đó. Quy tắc này giúp giữ nguyên lịch sử thay vì ghi đè các lần phát sinh.

Bước 6.3 — Hậu kiểm và báo cáo: FleetMonitor tổng hợp thời gian xử lý, thời gian chờ, số lần chuyển giao, nguyên nhân, chi phí sửa chữa nếu có và tần suất tái diễn theo thiết bị, hãng hoặc loại lỗi. Dữ liệu này là đầu vào cho việc đánh giá hiệu quả vận hành và quyết định bảo trì.

Bước 6.4 — Đánh giá vòng đời thiết bị (Lifecycle Management): Một worker hoặc cron job chạy định kỳ để phân tích lịch sử sự cố đã đóng, số lần hỏng, MTBF, tổng downtime và chi phí sửa chữa nếu có dữ liệu. Thiết bị có dấu hiệu hỏng hóc bất thường được gắn nhãn `Needs Monitoring` (Cần theo dõi) hoặc `Replacement Candidate` (Đề xuất thay thế). Đây là khuyến nghị dựa trên dữ liệu, không tự động quyết định thanh lý.

Ví dụ, hệ thống có thể đánh dấu thiết bị nếu có hơn 5 sự cố phần cứng trong 30 ngày, MTBF dưới 7 ngày hoặc downtime vượt 15% thời gian làm việc trong tháng. Các ngưỡng phải có thể cấu hình, được hiệu chỉnh theo dữ liệu thực tế và tránh đếm trùng những sự cố liên quan.

Bước 6.5 — Điều chỉnh thông báo cho thiết bị chờ thay thế (Alert Suppression): Đối với thiết bị đã được xác định là ứng viên thay thế và đang chờ xử lý, FleetMonitor có thể giảm thông báo lặp lại hoặc điều chỉnh Priority xử lý theo chính sách cấu hình. Severity kỹ thuật gốc cần được giữ nguyên để phục vụ lịch sử và báo cáo. Không nên mặc định hạ mọi cảnh báo xuống mức thấp nhất; cảnh báo Critical mới, nguy cơ an toàn hoặc sự cố ảnh hưởng dịch vụ vẫn cần được hiển thị theo chính sách.

Bước 6.6 — Phân tích dự báo và lập kế hoạch bảo trì (Predictive Maintenance): Dựa trên xu hướng mức vật tư, tần suất lỗi, lịch sử downtime và chu kỳ sử dụng, hệ thống có thể tạo cảnh báo sớm hoặc Task/Work Order để chuẩn bị thay mực, Drum và vật tư khác trước khi thiết bị ngừng hoạt động. Trong giai đoạn đầu, đây nên là cơ chế dự báo theo ngưỡng và xu hướng; chỉ triển khai dự báo nâng cao khi dữ liệu lịch sử đủ chất lượng.

## Nguyên tắc xuyên suốt

FleetMonitor cần phân biệt trạng thái kỹ thuật, trạng thái công việc và trạng thái dữ liệu giám sát. Trigger đã hết không đồng nghĩa sự cố đã được xử lý; máy in đang Online cũng không chứng minh chất lượng bản in hoặc phần cứng đã bình thường.

Đồng thời, hệ thống cần phân biệt ba loại bản ghi: Alert là tín hiệu giám sát, Incident là vấn đề cần điều tra hoặc khắc phục, còn Task/Work Order là công việc cần thực hiện, bao gồm bảo trì chủ động. Tất cả thay đổi quan trọng phải được lưu lịch sử để hỗ trợ truy vết, đánh giá vận hành và quản lý vòng đời thiết bị.
