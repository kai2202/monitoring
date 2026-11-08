/**
 * scripts/build-gh-pages.js
 *
 * Script đóng gói tĩnh Frontend ở chế độ Mock (`--mode mock`) ra thư mục gốc `/` của nhánh `mock`
 * để phục vụ cấu hình GitHub Pages: "Deploy from a branch" -> Branch: `mock` / Folder: `/ (root)`
 * (Không sử dụng GitHub Actions).
 *
 * Tự động tạo:
 * - `/index.html`
 * - `/404.html` (SPA Fallback giúp F5 / truy cập trực tiếp các đường dẫn con như `/printers/list` không bị 404)
 * - `/assets/*` (Bundles JS/CSS đã tối ưu hóa)
 * - `/.nojekyll` (Tắt bộ xử lý Jekyll của GitHub Pages để tăng tốc độ deploy và giữ nguyên tên file)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'Frontend', 'dist');
const rootAssetsDir = path.join(rootDir, 'assets');

console.log('🚀 [GitHub Pages] Đang build Frontend ở chế độ Mock (mode=mock)...');
execSync('npm run build:mock -w Frontend', {
  cwd: rootDir,
  stdio: 'inherit',
});

if (!fs.existsSync(distDir)) {
  console.error('❌ Không tìm thấy thư mục Frontend/dist sau khi build!');
  process.exit(1);
}

// 1. Xoá thư mục /assets cũ ở root (nếu có)
if (fs.existsSync(rootAssetsDir)) {
  fs.rmSync(rootAssetsDir, { recursive: true, force: true });
}

// 2. Copy toàn bộ nội dung từ Frontend/dist ra thư mục gốc (/)
const entries = fs.readdirSync(distDir, { withFileTypes: true });
for (const entry of entries) {
  const srcPath = path.join(distDir, entry.name);
  const destPath = path.join(rootDir, entry.name);
  fs.cpSync(srcPath, destPath, { recursive: true, force: true });
}

// 3. Tạo 404.html từ index.html để hỗ trợ SPA Routing trên GitHub Pages
const indexHtmlPath = path.join(rootDir, 'index.html');
const notFoundHtmlPath = path.join(rootDir, '404.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.copyFileSync(indexHtmlPath, notFoundHtmlPath);
}

// 4. Tạo file .nojekyll để GitHub Pages phục vụ trực tiếp tĩnh mà không chạy Jekyll
const nojekyllPath = path.join(rootDir, '.nojekyll');
fs.writeFileSync(nojekyllPath, '', 'utf8');

console.log('✅ [GitHub Pages] Đã xuất bản thành công ra thư mục gốc (/):');
console.log('   - /index.html');
console.log('   - /404.html (SPA Router Fallback)');
console.log('   - /assets/*');
console.log('   - /.nojekyll');
console.log('👉 Chỉ cần commit & push nhánh `mock`, sau đó chọn Source: "Deploy from a branch" -> `mock` -> `/ (root)` trên GitHub!');

