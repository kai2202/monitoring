-- ==============================================================================
-- FleetMonitor — Migration: 20261106000000_fleetmonitor_init_and_extend
-- Chuẩn hóa toàn bộ cấu trúc CSDL PostgreSQL 16 cho FleetMonitor
-- Bao gồm: RBAC, Vị trí, Máy in, Zabbix/SNMP, Vật tư CMYK, Tasks, CSV Import, Audit, Chi phí SLA
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'FIELD_TECH', 'ASSET_HR');
CREATE TYPE "TaskPriority" AS ENUM ('P1_Urgent', 'P2_High', 'P3_Medium', 'P4_Low');
CREATE TYPE "TaskStatus" AS ENUM ('Planned', 'In_Progress', 'Waiting', 'Completed', 'Cancelled');
CREATE TYPE "CsvEntityType" AS ENUM ('PRINTER', 'ERROR_DICT', 'TELEMETRY');
CREATE TYPE "CsvImportStatus" AS ENUM ('PENDING', 'VALIDATING', 'COMPLETED', 'FAILED');
CREATE TYPE "AuditAction" AS ENUM ('IMPORT_CSV', 'EXPORT_CSV', 'PRINTER_RELOCATE', 'TASK_UPDATE');

-- 2. Create Users Table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'FIELD_TECH',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "data_scope" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- 3. Create Refresh Tokens Table
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- 4. Create User Dashboard Preferences Table
CREATE TABLE "user_dashboard_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dashboard_layout" JSONB NOT NULL DEFAULT '{"widgets": ["hero_trend", "radar", "heatmap", "top_contributors"]}',
    "theme_mode" TEXT NOT NULL DEFAULT 'light',
    "default_period" TEXT NOT NULL DEFAULT '30days',
    "pinned_printer_ids" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_dashboard_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_dashboard_preferences_user_id_key" ON "user_dashboard_preferences"("user_id");

-- 5. Create Branches Table
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "is_hq" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- 6. Create Floors Table
CREATE TABLE "floors" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "floors_branch_id_name_key" ON "floors"("branch_id", "name");

-- 7. Create Printers Table
CREATE TABLE "printers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "mfr" TEXT NOT NULL,
    "device_type" TEXT NOT NULL DEFAULT 'Laser Đa Năng (MFP)',
    "serial_number" TEXT,
    "branch" TEXT NOT NULL DEFAULT 'Trụ sở chính',
    "branch_id" TEXT,
    "location" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "floor" TEXT NOT NULL DEFAULT 'T1',
    "floor_id" TEXT,
    "is_color" BOOLEAN NOT NULL DEFAULT true,
    "connection_status" TEXT NOT NULL DEFAULT 'Online',
    "health" TEXT NOT NULL DEFAULT 'Healthy',
    "alert_severity" TEXT NOT NULL DEFAULT 'info',
    "last_seen_at" TIMESTAMP(3),
    "zabbix_host_id" TEXT,
    "snmp_community" TEXT DEFAULT 'public',
    "snmp_port" INTEGER NOT NULL DEFAULT 161,
    "last_sync_time" TIMESTAMP(3),
    "sync_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "printers_branch_idx" ON "printers"("branch");
CREATE INDEX "printers_floor_idx" ON "printers"("floor");
CREATE INDEX "printers_branch_id_idx" ON "printers"("branch_id");
CREATE INDEX "printers_floor_id_idx" ON "printers"("floor_id");
CREATE INDEX "printers_department_idx" ON "printers"("department");
CREATE INDEX "printers_connection_status_idx" ON "printers"("connection_status");
CREATE INDEX "printers_zabbix_host_id_idx" ON "printers"("zabbix_host_id");
CREATE INDEX "printers_sync_status_idx" ON "printers"("sync_status");

-- 8. Create Printer Consumables Table
CREATE TABLE "printer_consumables" (
    "id" TEXT NOT NULL,
    "printer_id" TEXT NOT NULL,
    "toner_black" DOUBLE PRECISION,
    "toner_cyan" DOUBLE PRECISION,
    "toner_magenta" DOUBLE PRECISION,
    "toner_yellow" DOUBLE PRECISION,
    "drum_life_percent" INTEGER,
    "fuser_life_percent" INTEGER,
    "waste_toner_status" TEXT NOT NULL DEFAULT 'OK',
    "forecast_exhaustion_date" TIMESTAMP(3),
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printer_consumables_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "printer_consumables_printer_id_key" ON "printer_consumables"("printer_id");
CREATE INDEX "printer_consumables_printer_id_idx" ON "printer_consumables"("printer_id");
CREATE INDEX "printer_consumables_waste_toner_status_idx" ON "printer_consumables"("waste_toner_status");

-- 9. Create Counter Rollups Table
CREATE TABLE "counter_rollups" (
    "id" TEXT NOT NULL,
    "printer_id" TEXT NOT NULL,
    "recorded_date" DATE NOT NULL,
    "mono_pages" INTEGER NOT NULL DEFAULT 0,
    "color_pages" INTEGER NOT NULL DEFAULT 0,
    "scan_pages" INTEGER NOT NULL DEFAULT 0,
    "total_pages" INTEGER NOT NULL DEFAULT 0,
    "delta_mono" INTEGER NOT NULL DEFAULT 0,
    "delta_color" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counter_rollups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "counter_rollups_printer_id_recorded_date_key" ON "counter_rollups"("printer_id", "recorded_date");
CREATE INDEX "counter_rollups_recorded_date_idx" ON "counter_rollups"("recorded_date");

-- 10. Create Incidents Table
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "printer_id" TEXT NOT NULL,
    "error_code" TEXT,
    "canonical_code" TEXT,
    "subsystem" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "incidents_printer_id_idx" ON "incidents"("printer_id");
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- 11. Create Tasks Table
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "printer_id" TEXT NOT NULL,
    "incident_id" TEXT,
    "title" TEXT NOT NULL,
    "task_type" TEXT NOT NULL DEFAULT 'Bảo trì sửa chữa',
    "priority" "TaskPriority" NOT NULL DEFAULT 'P3_Medium',
    "status" "TaskStatus" NOT NULL DEFAULT 'Planned',
    "assignee_id" TEXT,
    "assignee_name" TEXT,
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "dynamic_steps" JSONB NOT NULL DEFAULT '[]',
    "time_and_cost" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tasks_printer_id_idx" ON "tasks"("printer_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_assignee_id_idx" ON "tasks"("assignee_id");

-- 12. Create Work Logs Table
CREATE TABLE "work_logs" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "hours_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_logs_task_id_idx" ON "work_logs"("task_id");

-- 13. Create Task Attachments Table
CREATE TABLE "task_attachments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "minio_bucket" TEXT NOT NULL DEFAULT 'fleetmonitor-proofs',
    "minio_object_key" TEXT NOT NULL,
    "is_test_print_proof" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "task_attachments_task_id_idx" ON "task_attachments"("task_id");

-- 14. Create Error Dictionary Table
CREATE TABLE "error_dictionary" (
    "id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "raw_code" TEXT NOT NULL,
    "canonical_code" TEXT NOT NULL,
    "subsystem" TEXT NOT NULL,
    "description_vi" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "is_paper_jam" BOOLEAN NOT NULL DEFAULT false,
    "is_cover_open" BOOLEAN NOT NULL DEFAULT false,
    "is_consumable" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_dictionary_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "error_dictionary_vendor_raw_code_key" ON "error_dictionary"("vendor", "raw_code");
CREATE INDEX "error_dictionary_canonical_code_idx" ON "error_dictionary"("canonical_code");
CREATE INDEX "error_dictionary_subsystem_idx" ON "error_dictionary"("subsystem");

-- 15. Create CSV Import Jobs Table
CREATE TABLE "csv_import_jobs" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "uploaded_by_id" TEXT,
    "entity_type" "CsvEntityType" NOT NULL,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "error_log" JSONB NOT NULL DEFAULT '[]',
    "status" "CsvImportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "csv_import_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "csv_import_jobs_uploaded_by_id_idx" ON "csv_import_jobs"("uploaded_by_id");
CREATE INDEX "csv_import_jobs_status_idx" ON "csv_import_jobs"("status");
CREATE INDEX "csv_import_jobs_entity_type_idx" ON "csv_import_jobs"("entity_type");
CREATE INDEX "csv_import_jobs_created_at_idx" ON "csv_import_jobs"("created_at");

-- 16. Create Audit Logs Table
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "target_id" TEXT,
    "ip_address" TEXT,
    "diff_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_target_id_idx" ON "audit_logs"("target_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- 17. Create Cost Rate Configs Table
CREATE TABLE "cost_rate_configs" (
    "id" TEXT NOT NULL,
    "mono_rate_per_page" DOUBLE PRECISION NOT NULL DEFAULT 150.0,
    "color_rate_per_page" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "tech_hourly_rate" DOUBLE PRECISION NOT NULL DEFAULT 150000.0,
    "target_uptime_percent" DOUBLE PRECISION NOT NULL DEFAULT 99.0,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_rate_configs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cost_rate_configs_effective_date_idx" ON "cost_rate_configs"("effective_date");

-- 18. Add Foreign Key Constraints
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_dashboard_preferences" ADD CONSTRAINT "user_dashboard_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "floors" ADD CONSTRAINT "floors_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "printers" ADD CONSTRAINT "printers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "printers" ADD CONSTRAINT "printers_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "printer_consumables" ADD CONSTRAINT "printer_consumables_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "counter_rollups" ADD CONSTRAINT "counter_rollups_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

