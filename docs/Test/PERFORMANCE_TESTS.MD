# FleetMonitor — Hướng Dẫn & Bộ Kịch Bản Kiểm Thử Hiệu Năng (Performance Optimization & Testing)

> **Dự án:** FleetMonitor — Enterprise Printer Monitoring & Management System  
> **Tài liệu:** Tiêu Chuẩn Hiệu Năng & Kịch Bản Đo Lường (Performance Testing Guide)  
> **Phương pháp:** Xây dựng theo kỹ năng `performance-optimization` — *Measure $\to$ Identify $\to$ Fix $\to$ Verify $\to$ Guard*.

---

## 1. Triết Lý Tối Ưu Hóa & Quy Trình 5 Bước

> **Nguyên tắc cốt lõi:** *Đo lường trước khi tối ưu.* Mọi hành động cải tiến hiệu năng không dựa trên số liệu thực tế đều là phỏng đoán, dễ dẫn đến phức tạp hóa mã nguồn mà không mang lại giá trị thực tiễn.

Quy trình 5 bước bắt buộc khi thực hiện tối ưu hóa hiệu năng trong FleetMonitor:

```text
1. MEASURE  (Đo lường)   → Xác lập đường cơ sở (Baseline) bằng số liệu thực tế từ môi trường.
2. IDENTIFY (Định danh)  → Xác định chính xác điểm nghẽn (Bottleneck), không dựa trên cảm tính.
3. FIX      (Khắc phục)  → Giải quyết đúng điểm nghẽn cụ thể bằng giải pháp tối giản nhất.
4. VERIFY   (Xác minh)   → Đo lường lại sau khi sửa; kiểm tra cải thiện và quyết định giữ/revert.
5. GUARD    (Bảo vệ)     → Thiết lập bài test hồi quy (Regression test) và ngưỡng cảnh báo tự động.
```

---

## 2. Tiêu Chuẩn Hiệu Năng (SLAs & Performance SLOs)

Toàn bộ hệ thống FleetMonitor phải đáp ứng các chỉ tiêu hiệu năng định lượng dưới đây trong điều kiện đội máy in tiêu chuẩn (từ 35 đến 100 thiết bị):

| Chỉ tiêu hiệu năng (Metric) | Ngưỡng Mục Tiêu (SLO) | Ngưỡng Cảnh Báo (Breach Threshold) | Phương thức đo lường |
| :--- | :---: | :---: | :--- |
| **Thời gian render Dashboard (FCP)** | $\le 100 \text{ ms}$ | $> 250 \text{ ms}$ | Chrome DevTools Performance / React Profiler |
| **Độ trễ API `/api/printers` (P95)** | $\le 500 \text{ ms}$ | $> 1.000 \text{ ms}$ | Autocannon / K6 Benchmark (với Zabbix Cache Hit) |
| **Độ trễ API `/api/tasks` (P95)** | $\le 200 \text{ ms}$ | $> 500 \text{ ms}$ | PostgreSQL query latency + Express routing |
| **Tỷ lệ Hit Cache Zabbix (TTL: 60s)** | $\ge 85\%$ | $< 70\%$ | In-Memory Cache Telemetry Monitor |
| **Thời gian tính toán Telemetry 30 ngày** | $\le 50 \text{ ms}$ | $> 150 \text{ ms}$ | Vitest Benchmark / Node.js `console.time` |
| **Chỉ số Dịch chuyển Bố cục (CLS)** | $\le 0.05$ | $> 0.1$ | Lighthouse / Core Web Vitals (đổi theme, mở drawer) |

---

## 3. Các Điểm Nghẽn Thường Gặp & Giải Pháp Đã Áp Dụng

### 3.1 Truy vấn Zabbix API quá thường xuyên gây nghẽn kết nối
- **Hiện tượng:** Mỗi lần người dùng tải trang Dashboard hoặc Printers, Frontend gửi nhiều request khiến Backend gọi dồn dập vào Zabbix JSON-RPC, gây trễ mạng hoặc bị Zabbix từ chối dịch vụ.
- **Giải pháp (Fix):**
  - Thiết lập tầng **In-Memory Cache** tại `backend/src/services/zabbixClient.ts` với TTL 60 giây cho danh sách host và items giám sát.
  - Áp dụng kỹ thuật Request Deduplication: Nếu nhiều client gọi API cùng lúc khi cache đang hết hạn, chỉ 1 request duy nhất được gửi tới Zabbix; các request khác chờ kết quả chia sẻ.

### 3.2 N+1 Query khi lấy danh sách Task kèm Activity Log
- **Hiện tượng:** Truy vấn lấy 50 task trên chế độ Bảng/Kanban dẫn đến 50 câu lệnh SQL con để lấy lịch sử hoạt động `TaskActivityLog`.
- **Giải pháp (Fix):**
  - Tối ưu hóa truy vấn Prisma ORM bằng `include: { logs: { take: 5, orderBy: { timestamp: 'desc' } } }` hoặc chỉ nạp chi tiết logs khi người dùng mở Side Drawer chi tiết (`GET /api/tasks/:id`).
  - Đánh chỉ mục Index trên cơ sở dữ liệu:
    ```prisma
    @@index([status])
    @@index([dueDate])
    @@index([assignee])
    @@index([printerHostId])
    ```

### 3.3 Re-render toàn bộ thẻ Kanban khi kéo thả trạng thái
- **Hiện tượng:** Kéo thả một card công việc trên `TaskBoardView` làm re-render toàn bộ 5 cột với hàng chục components con, gây giật lag (frame drop dưới 30fps).
- **Giải pháp (Fix):**
  - Sử dụng `React.memo` cho `TaskCardComponent`.
  - Truyền handler thông qua `useCallback` ổn định.
  - Phân tách state cục bộ kéo thả với state tổng của danh sách.

---

## 4. Kịch Bản Đo Lường & Benchmark Tự Động

### 4.1 Benchmark Thuật Toán Tính Telemetry (`telemetryBenchmark.bench.ts`)

Sử dụng tính năng Benchmark tích hợp của **Vitest** để kiểm soát thời gian xử lý:

```typescript
import { bench, describe } from 'vitest';
import { calculateVolumeDelta, detectLemonDevices } from '../../src/services/telemetryAggregator';

describe('Benchmark: Tính toán Telemetry & Nhận diện Lemon Devices', () => {
  // Chuẩn bị 100 thiết bị x 720 mẫu đo (1 tháng dữ liệu)
  const mockDataset = Array.from({ length: 100 }, (_, i) => ({
    printerHostId: `printer_${i}`,
    samples: Array.from({ length: 720 }, (_, j) => ({
      count: 10000 + j * 15,
      timestamp: new Date(Date.now() - (720 - j) * 3600 * 1000).toISOString(),
    })),
    incidents: Array.from({ length: 4 }, (_, k) => ({
      downtimeHours: 5,
      severity: 'Warning',
    })),
  }));

  bench('Xử lý tổng hợp sản lượng in cho 100 máy in', () => {
    mockDataset.forEach((device) => {
      calculateVolumeDelta(device.samples[0], device.samples[device.samples.length - 1]);
    });
  }, { time: 1000, iterations: 100 });

  bench('Thuật toán sàng lọc Lemon Devices trên 100 máy', () => {
    detectLemonDevices(mockDataset as any);
  }, { time: 1000, iterations: 100 });
});
```

### 4.2 Kịch Bản Kiểm Thử Tải API Với Autocannon (`loadTest.js`)

Kịch bản kiểm tra khả năng phục vụ đồng thời của Backend API với bộ đệm Cache Zabbix:

```javascript
import autocannon from 'autocannon';

async function runLoadTest() {
  console.log('🚀 Bắt đầu kiểm thử tải API FleetMonitor (Printers & Tasks)...');

  const instance = autocannon({
    url: 'http://localhost:3000/api/printers',
    connections: 20, // 20 kết nối đồng thời
    pipelining: 1,
    duration: 10, // Chạy trong 10 giây
    headers: {
      'Content-Type': 'application/json',
    },
  }, (err, result) => {
    if (err) {
      console.error('Lỗi khi chạy benchmark:', err);
      return;
    }

    console.log('--- KẾT QUẢ ĐO LƯỜNG HIỆU NĂNG ---');
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Latency P50:  ${result.latency.p50} ms`);
    console.log(`Latency P95:  ${result.latency.p95} ms`);
    console.log(`Latency P99:  ${result.latency.p99} ms`);
    console.log(`Tỷ lệ lỗi:    ${result.errors} requests`);

    // Kiểm tra ngưỡng SLO: P95 phải <= 500ms
    if (result.latency.p95 > 500) {
      console.error('❌ CẢNH BÁO: Vi phạm ngưỡng SLO P95 (500ms)!');
      process.exit(1);
    } else {
      console.log('✅ ĐẠT YÊU CẦU: Độ trễ P95 nằm trong giới hạn cho phép.');
    }
  });

  autocannon.track(instance, { renderProgressBar: true });
}

runLoadTest();
```

---

## 5. Hàng Rào Bảo Vệ Tránh Suy Thoái Hiệu Năng (Performance Guards)

1. **Kiểm soát Bundle Size Frontend:**
   - Cấu hình Vite Chunk Splitting: tách các thư viện biểu đồ nặng (`chart.js`, `lucide-react`) thành chunk riêng biệt.
   - Giới hạn kích thước gói chunk chính $\le 500 \text{ KB}$.
2. **Kiểm tra Layout Shift khi chuyển giao diện:**
   - Toàn bộ component Side Drawer, Modal và Table phải sử dụng thuộc tính kích thước cố định (`min-height`, `min-width`) để tránh hiện tượng màn hình co giãn khi dữ liệu tải xong.
3. **Giám sát Tỷ lệ Cache Hit trong Production:**
   - Ghi log thống kê số lần hit/miss của Zabbix Cache sau mỗi chu kỳ 1 giờ. Nếu tỷ lệ hit $< 85\%$, kích hoạt cảnh báo kỹ thuật để rà soát lại TTL hoặc tần suất polling của client.

