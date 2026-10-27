# ==============================================================================
# Hướng Dẫn Cấu Hình Chạy Tự Động (Auto-start / Background Daemon) Trên Máy Ảo
# ==============================================================================

Tài liệu này cung cấp 2 giải pháp chuẩn Production để hệ thống **Tự động chạy ngầm khi bật máy ảo (VM)** mà không cần mở terminal hay IDE:
1. **Giải pháp 1: Docker Compose Restart Policy (Khuyên Dùng - Đơn giản nhất)**
2. **Giải pháp 2: Linux Systemd Service (Chuẩn Native Linux)**

---

## Giải Pháp 1: Docker Compose (Tự chạy lại khi bật VM)

Trong file `compose.yaml`, các container đã được cấu hình cờ:
```yaml
restart: unless-stopped
```
Chỉ cần kích hoạt Docker service tự chạy khi bật máy ảo:

```bash
# 1. Bật Docker service tự khởi động cùng OS máy ảo:
sudo systemctl enable docker

# 2. Khởi chạy cụm dịch vụ lần đầu:
cd /path/to/Monitoring
docker compose up -d
```
Từ thời điểm này:
- Mỗi khi bạn khởi động máy ảo, Docker sẽ tự động bật các container `zabbix-server`, `zabbix-db`, `zabbix-web`.
- Mọi dữ liệu đo đạc SNMP vẫn chạy ngầm liên tục 24/7.

---

## Giải Pháp 2: Chạy Web & API Dưới Dạng Systemd Service

Nếu bạn muốn dịch vụ Web Monitoring (Node.js) tự chạy ngầm cùng máy ảo:

### Bước 1: Tạo file cấu hình dịch vụ Systemd
Chạy lệnh sau trên máy ảo:
```bash
sudo nano /etc/systemd/system/printer-monitor.service
```

Dán nội dung sau vào file (thay thế `/home/ubuntu/Monitoring` bằng đường dẫn thực tế):

```ini
[Unit]
Description=Enterprise Printer Monitoring Dashboard & API Gateway
After=network.target docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Monitoring
ExecStart=/usr/bin/npm run start -w backend
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ZABBIX_API_URL=http://localhost:8080/api_jsonrpc.php

# Giới hạn tài nguyên an toàn cho VM
MemoryMax=512M
CPUQuota=100%

[Install]
WantedBy=multi-user.target
```

### Bước 2: Kích hoạt dịch vụ
```bash
# Nạp lại cấu hình systemd
sudo systemctl daemon-reload

# Cho phép tự chạy khi bật máy ảo
sudo systemctl enable printer-monitor

# Khởi động dịch vụ ngay lập tức
sudo systemctl start printer-monitor
```

### Bước 3: Kiểm tra trạng thái & Nhật ký
```bash
# Xem trạng thái đang chạy:
sudo systemctl status printer-monitor

# Xem log trực tiếp (kèm đường link Web đã in ra):
journalctl -u printer-monitor -f
```

---

## Trải Nghiệm Sau Khi Cấu Hình Xong

Khi bạn khởi động máy ảo VM:
1. Bạn **không cần mở terminal hay IDE**.
2. Mở trình duyệt trên máy thật, gõ:
   - **Giao diện Web Giám Sát:** `http://<IP_MÁY_ẢO>:3001`
   - **Giao diện Quản trị Zabbix:** `http://<IP_MÁY_ẢO>:8080`
3. Toàn bộ thông số 35 máy in, mức mực, cảnh báo lỗi SC/Alarm sẽ hiển thị tức thì!
