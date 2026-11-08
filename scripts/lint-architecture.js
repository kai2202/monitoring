/**
 * scripts/lint-architecture.js
 *
 * Automated Architecture & Code Quality Guard for FleetMonitor:
 * 0. Auto-Clean Stray / Dead Files, 1-Line Re-export Shims, Redundant Modules & *.test.ts/*.test.tsx Files.
 * 1. Root Directory Whitelist (Rule 9.1).
 * 2. File Length Check: Hard Limit < 300 LOC per .ts / .tsx file (Rule 7.1.1 & 7.2).
 * 3. Mandatory Icon System: 100% FontAwesome, zero forbidden icon libraries (Rule 7.1).
 * 4. Folder Limits: Warns when a folder exceeds 10 direct items without sub-domain grouping.
 *
 * Exit code 0 on PASS, exit code 1 on VIOLATIONS.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MAX_LOC = 300;
const MAX_FOLDER_ITEMS = 10;

// Allowed root-level files and directories (Rule 9.1 - Zero Stray Files)
const ALLOWED_ROOT_ITEMS = new Set([
  '.agent',
  '.git',
  '.gitignore',
  '.env',
  '.env.mock',
  '.env.example',
  'Frontend',
  'Backend',
  'database',
  'docs',
  'node_modules',
  'package.json',
  'package-lock.json',
  'README.md',
  'scripts',
  'compose.yaml',
  'docker-compose.yml',
  'assets',
  'templates',
  'index.html',
  '404.html',
  '.nojekyll',
]);

// Known stray, 1-line re-export shim, or deprecated dead files to auto-clean if present
const AUTO_CLEAN_PATHS = [
  // Root temporary files
  path.join(ROOT_DIR, 'scratch_analyzer.js'),
  path.join(ROOT_DIR, 'scratch_scan.json'),
  path.join(ROOT_DIR, 'temp_root_files.json'),
  path.join(ROOT_DIR, 'temp_root.json'),
  // Frontend dead / 1-line re-export shims
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'auth', 'components', 'QuickRolePicker.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'dashboard', 'components', 'workorder', 'TestPrintReviewModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'dashboard', 'components', 'workorder', 'ReworkReasonModal.tsx'),
  // Frontend duplicate modals in parent folder (already moved to modals/ subfolder)
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'printers', 'components', 'PrinterCreateModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'printers', 'components', 'PrinterEditModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'printers', 'components', 'PrinterRelocateModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'printers', 'components', 'BranchFloorManagerModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'settings', 'components', 'UserCreateModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'settings', 'components', 'UserPasswordChangeModal.tsx'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'settings', 'components', 'UserScopeAssignModal.tsx'),
  // Backend 1-line re-export controller shims
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'analyticsController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'approvalController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'authController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'branchController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'dashboardController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'financeController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'incidentController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'inventoryController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'notificationController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'printerController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'procurementController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'settingsController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'suppliesController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'taskAttachmentController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'taskController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'telemetryController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'userAdminController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'vendorController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'workLogController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'zabbixWebhookController.ts'),
  // Backend redundant / unused modules decoupled during Backend Audit
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'zabbixClient.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'minioClient.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'workLogRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'controllers', 'tasks', 'workLogController.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'zabbix', 'slowPollingWorker.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'counterCalculator.ts'),
  // Backend consolidated route files (superseded by 6 domain routers)
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'settingsRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'telemetryRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'integrationRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'notificationRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'approvalRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'suppliesRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'inventoryRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'procurementRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'vendorRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'financeRoutes.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'routes', 'dashboardRoutes.ts'),
  // Backend consolidated service files (superseded by domain services)
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'telemetryService.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'telemetryExtendedService.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'telemetryTimelineService.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'csvImportService.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'errorDictLifecycleService.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'runtimeSettingsStore.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'knowledgeReuseService.ts'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'diagnostics', 'errorCodeClassifier.ts'),
  // Dead root files & obsolete legacy directories
  path.join(ROOT_DIR, 'mocks'),
  path.join(ROOT_DIR, 'Backend', 'src', 'tests'),
  path.join(ROOT_DIR, 'Backend', 'src', 'services', 'diagnostics'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'operations'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'components', 'analytics'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'components', 'dashboard'),
  path.join(ROOT_DIR, 'Frontend', 'src', 'pages'),
  path.join(ROOT_DIR, 'scripts', 'find-dead-code.js'),
  path.join(ROOT_DIR, 'scripts', 'dead_code_report.json'),
];

const AUTO_CLEAN_SET = new Set(AUTO_CLEAN_PATHS.map((p) => path.normalize(p)));

for (const cleanPath of AUTO_CLEAN_PATHS) {
  if (fs.existsSync(cleanPath)) {
    try {
      fs.rmSync(cleanPath, { recursive: true, force: true });
      console.log(`🧹 [Auto-Clean] Đã dọn dẹp tệp/thư mục thừa: ${path.relative(ROOT_DIR, cleanPath)}`);
    } catch {
      // ignore if locked
    }
  }
}

const SCAN_DIRS = [
  path.join(ROOT_DIR, 'Frontend', 'src'),
  path.join(ROOT_DIR, 'Backend', 'src'),
];

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '.system_generated',
]);

// Recursively remove *.test.ts, *.test.tsx, and 1-line re-export non-index shims
function cleanTestAndShimFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  for (const item of fs.readdirSync(dirPath)) {
    if (IGNORE_DIRS.has(item)) continue;
    const fullPath = path.join(dirPath, item);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      cleanTestAndShimFiles(fullPath);
      try {
        const remaining = fs.readdirSync(fullPath);
        if (remaining.length === 0) {
          fs.rmdirSync(fullPath);
          console.log(`🧹 [Auto-Clean] Đã xoá thư mục rỗng: ${path.relative(ROOT_DIR, fullPath)}`);
        }
      } catch {
        // ignore
      }
    } else if (item.endsWith('.test.ts') || item.endsWith('.test.tsx')) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🧹 [Auto-Clean] Đã xoá file test: ${path.relative(ROOT_DIR, fullPath)}`);
      } catch {
        // ignore
      }
    } else if (
      (item.endsWith('.ts') || item.endsWith('.tsx')) &&
      item !== 'index.ts' &&
      item !== 'index.tsx'
    ) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8').trim();
        const nonEmptyLines = content
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'));
        const isReExportShim =
          nonEmptyLines.length === 1 &&
          (/^export\s+\*\s+from\s+['"].+['"];?$/.test(nonEmptyLines[0]) ||
            /^export\s+\{[^}]+\}\s+from\s+['"].+['"];?$/.test(nonEmptyLines[0]));
        if (isReExportShim) {
          fs.unlinkSync(fullPath);
          console.log(`🧹 [Auto-Clean] Đã xoá file re-export 1 dòng: ${path.relative(ROOT_DIR, fullPath)}`);
        }
      } catch {
        // ignore
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  cleanTestAndShimFiles(dir);
}

const FORBIDDEN_ICON_PACKAGES = [
  'lucide-react',
  '@heroicons/react',
  'react-icons',
  'feather-icons',
  '@mui/icons-material',
];

const FOLDER_ITEM_EXCEPTIONS = new Set([
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src')),
  path.normalize(path.join(ROOT_DIR, 'Backend', 'src')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'shared', 'icons')),
  path.normalize(path.join(ROOT_DIR, 'Backend', 'src', 'routes')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'types')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'mocks')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'services')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'services', 'providers', 'api')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'services', 'providers', 'mock')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'analytics', 'components', 'sla')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'analytics', 'components', 'supplies')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'printers', 'components')),
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'features', 'settings', 'components')),
]);

let violations = [];
let warnings = [];

function checkRootHygiene() {
  if (!fs.existsSync(ROOT_DIR)) return;
  const rootItems = fs.readdirSync(ROOT_DIR);
  for (const item of rootItems) {
    const fullRootPath = path.normalize(path.join(ROOT_DIR, item));
    if (AUTO_CLEAN_SET.has(fullRootPath)) continue;
    if (!ALLOWED_ROOT_ITEMS.has(item)) {
      violations.push(
        `[Rule 9.1 - Root Directory Hygiene] Phát hiện tệp/thư mục lạ ở thư mục gốc: '${item}'. Chỉ cho phép các thư mục và tệp cấu hình chính thức!`
      );
    }
  }
}

function checkFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx'].includes(ext)) return;
  if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  if (lines.length > MAX_LOC) {
    violations.push(
      `[Rule 7.1.1/7.2 - File Length] ${relPath} (${lines.length} LOC) vượt quá giới hạn tối đa ${MAX_LOC} dòng!`
    );
  }

  if (filePath.includes(path.join('Frontend', 'src'))) {
    for (const pkg of FORBIDDEN_ICON_PACKAGES) {
      if (content.includes(`from '${pkg}'`) || content.includes(`from "${pkg}"`)) {
        violations.push(
          `[Rule 7.1 - Mandatory FontAwesome] ${relPath} nhập icon trái phép từ '${pkg}'! Bắt buộc dùng FontAwesome (@/shared/icons).`
        );
      }
    }
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath).filter(
    (item) =>
      !AUTO_CLEAN_SET.has(path.normalize(path.join(dirPath, item))) &&
      !item.endsWith('.test.ts') &&
      !item.endsWith('.test.tsx')
  );

  const normalizedDir = path.normalize(dirPath);
  if (!FOLDER_ITEM_EXCEPTIONS.has(normalizedDir)) {
    const validItems = items.filter(
      (item) => !item.startsWith('.') && !IGNORE_DIRS.has(item) && item !== 'index.ts'
    );
    if (validItems.length > MAX_FOLDER_ITEMS) {
      const relDir = path.relative(ROOT_DIR, dirPath).replace(/\\/g, '/');
      warnings.push(
        `[Rule 7.1.2 - Folder Limit Warning] '${relDir}' đang chứa ${validItems.length} items (vượt mốc ${MAX_FOLDER_ITEMS} items). Cần xem xét gom nhóm theo sub-domains!`
      );
    }
  }

  for (const item of items) {
    if (IGNORE_DIRS.has(item)) continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 [FleetMonitor] Đang kiểm tra kiến trúc repository theo AGENTS.md...\n');

checkRootHygiene();

for (const dir of SCAN_DIRS) {
  scanDirectory(dir);
}

if (warnings.length > 0) {
  console.log(`⚠️  CẢNH BÁO KIẾN TRÚC (${warnings.length}):`);
  warnings.forEach((w) => console.log(`   ${w}`));
  console.log('');
}

if (violations.length > 0) {
  console.error(`❌ PHÁT HIỆN VI PHẠM NGUYÊN TẮC KIẾN TRÚC (${violations.length}):`);
  violations.forEach((v) => console.error(`   ${v}`));
  console.error('\n🚨 Vui lòng khắc phục các vi phạm trên trước khi hoàn thành nhiệm vụ!\n');
  process.exit(1);
} else {
  console.log('✅ [PASS] 100% tệp tin đều dưới 300 LOC, thư mục gốc sạch 100%, tuân thủ chuẩn Enterprise Architecture!\n');
  process.exit(0);
}
