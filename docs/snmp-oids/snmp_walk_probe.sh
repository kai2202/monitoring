#!/bin/bash
# ==============================================================================
# FleetMonitor — Script SNMP Walk Kiểm Tra & Khám Phá OID Thiết Bị Thực Tế
# Sử dụng: Chạy trực tiếp trên máy chủ Zabbix (10.48.91.39) hoặc trạm kỹ thuật
# Cú pháp: ./snmp_walk_probe.sh <IP_MAY_IN> [SNMP_COMMUNITY]
# Ví dụ:   ./snmp_walk_probe.sh 10.48.3.252 public
# ==============================================================================

TARGET_IP=${1:-"10.48.3.252"}
COMMUNITY=${2:-"public"}

echo "======================================================================"
echo " [FleetMonitor] Bắt đầu SNMP Walk kiểm tra thiết bị: $TARGET_IP"
echo " Community: $COMMUNITY | Phiên bản SNMP: v2c"
echo "======================================================================"

# 1. Kiểm tra ICMP Ping
echo -n "[1/5] Kiểm tra ICMP Ping... "
if ping -c 2 -W 2 "$TARGET_IP" > /dev/null 2>&1; then
    echo "THÀNH CÔNG (Thiết bị phản hồi mạng)"
else
    echo "THẤT BẠI (Thiết bị không phản hồi ping hoặc chặn ICMP)"
fi

# 2. Khám phá Định Danh Thiết Bị (RFC 1213 / RFC 3805)
echo ""
echo "[2/5] Lấy thông tin định danh hệ thống (Identity & Serial)..."
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" \
    1.3.6.1.2.1.1.1.0 \
    1.3.6.1.2.1.1.5.0 \
    1.3.6.1.2.1.1.3.0 \
    1.3.6.1.2.1.43.5.1.1.17.1 2>/dev/null || echo "-> Không đọc được OID định danh"

# 3. Khám phá Bộ Đếm Trang In (Page Counters)
echo ""
echo "[3/5] Khám phá Bộ đếm trang in (Total, Mono, Color)..."
echo "--- RFC 3805 Marker Life Count (Total) ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.2.1.43.10.2.1.4.1.1 2>/dev/null
echo "--- Ricoh Private Counters (Mono & Color) ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" \
    1.3.6.1.4.1.367.3.2.1.2.19.1.0 \
    1.3.6.1.4.1.367.3.2.1.2.19.2.0 2>/dev/null
echo "--- Canon Private Counters (Counter 101, 102, 103) ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" \
    1.3.6.1.4.1.1602.1.11.1.3.1.4.101 \
    1.3.6.1.4.1.1602.1.11.1.3.1.4.102 \
    1.3.6.1.4.1.1602.1.11.1.3.1.4.103 2>/dev/null

# 4. Khám phá Bảng Mức Mực CMYK & Hộp Mực Thải
echo ""
echo "[4/5] Quét bảng vật tư tiêu hao (Toner & Waste Container)..."
echo "--- RFC 3805 Marker Supplies Table ---"
snmpwalk -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.2.1.43.11.1.1.6.1 2>/dev/null | head -n 10
snmpwalk -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.2.1.43.11.1.1.9.1 2>/dev/null | head -n 10
echo "--- Ricoh Waste Toner State ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.4.1.367.3.2.1.2.4.2.4.0 2>/dev/null

# 5. Khám phá Mã Lỗi Phần Cứng Đích Thực (SC Code / E-Code)
echo ""
echo "[5/5] Kiểm tra Bẫy cảnh báo mã lỗi phần cứng..."
echo "--- Ricoh Active SC Code ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.4.1.367.3.2.1.6.1.1.7.1 2>/dev/null
echo "--- Canon Active E-Code ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.4.1.1602.1.1.1.1.0 2>/dev/null
echo "--- RFC 3805 Console LCD Display Text ---"
snmpget -v2c -c "$COMMUNITY" -t 3 -r 1 "$TARGET_IP" 1.3.6.1.2.1.43.16.5.1.2.1.1.1 2>/dev/null

echo ""
echo "======================================================================"
echo " [Hoàn tất] Kết quả quét SNMP đã kết thúc."
echo "======================================================================"

