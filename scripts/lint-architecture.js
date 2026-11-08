/**
 * scripts/lint-architecture.js
 *
 * Automated Architecture & Code Quality Guard for FleetMonitor:
 * 1. File Length Check: Hard Limit < 300 LOC per .ts / .tsx file (Rule 7.1.1 & 7.2).
 * 2. Mandatory Icon System: 100% FontAwesome, zero forbidden icon libraries (Rule 7.1).
 * 3. Folder Limits: Warns when a folder exceeds 12 direct items without sub-domain grouping.
 *
 * Exit code 0 on PASS, exit code 1 on VIOLATIONS.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MAX_LOC = 300;
const MAX_FOLDER_ITEMS = 12;

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

const FORBIDDEN_ICON_PACKAGES = [
  'lucide-react',
  '@heroicons/react',
  'react-icons',
  'feather-icons',
  '@mui/icons-material',
];

// Exceptions for flat lists that are legitimately dictionaries/barrel hubs
const FOLDER_ITEM_EXCEPTIONS = new Set([
  path.normalize(path.join(ROOT_DIR, 'Frontend', 'src', 'shared', 'icons')),
  path.normalize(path.join(ROOT_DIR, 'Backend', 'src', 'routes')),
]);

let violations = [];
let warnings = [];

function checkFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx'].includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  // 1. File Length Check
  if (lines.length > MAX_LOC) {
    violations.push(`[Rule 7.1.1/7.2 - File Length] ${relPath} (${lines.length} LOC) vượt quá giới hạn tối đa ${MAX_LOC} dòng!`);
  }

  // 2. Forbidden Icons Check (Frontend only)
  if (filePath.includes(path.join('Frontend', 'src'))) {
    for (const pkg of FORBIDDEN_ICON_PACKAGES) {
      if (content.includes(`from '${pkg}'`) || content.includes(`from "${pkg}"`)) {
        violations.push(`[Rule 7.1 - Mandatory FontAwesome] ${relPath} nhập icon trái phép từ '${pkg}'! Bắt buộc dùng FontAwesome (@/shared/icons).`);
      }
    }
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);

  const normalizedDir = path.normalize(dirPath);
  if (!FOLDER_ITEM_EXCEPTIONS.has(normalizedDir)) {
    const validItems = items.filter(
      (item) => !item.startsWith('.') && !IGNORE_DIRS.has(item) && item !== 'index.ts'
    );
    if (validItems.length > MAX_FOLDER_ITEMS) {
      const relDir = path.relative(ROOT_DIR, dirPath).replace(/\\/g, '/');
      warnings.push(`[Rule 7.1.2 - Folder Limit Warning] '${relDir}' đang chứa ${validItems.length} items (vượt mốc 10 items). Cần xem xét gom nhóm theo sub-domains!`);
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
  console.log('✅ [PASS] 100% tệp tin đều dưới 300 LOC và tuân thủ chuẩn Enterprise Architecture!\n');
  process.exit(0);
}

