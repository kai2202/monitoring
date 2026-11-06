-- ==============================================================================
-- FleetMonitor Database Initialization Script
-- Hệ thống Giám sát & Quản trị Máy in Doanh nghiệp (~100 máy in)
-- ==============================================================================

-- 1. Kích hoạt tiện ích mở rộng tạo UUID và Mã hóa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Thiết lập Múi giờ Việt Nam (UTC+7)
SET TIME ZONE 'Asia/Ho_Chi_Minh';

-- 3. Ghi log khởi tạo
DO $$
BEGIN
  RAISE NOTICE '[FleetMonitor DB Init] Đã kích hoạt tiện ích uuid-ossp và pgcrypto thành công!';
END $$;

