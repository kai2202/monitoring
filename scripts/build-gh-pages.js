/**
 * scripts/build-gh-pages.js
 *
 * Build Frontend (chế độ mock, base '/monitoring/') và đồng bộ ra thư mục gốc (root/)
 * để GitHub Pages deploy trực tiếp từ branch `main` -> `/ (root)`:
 * https://kai2202.github.io/monitoring/
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'Frontend');
const distDir = path.join(frontendDir, 'dist');

console.log('1. Building Frontend (--mode mock, base /monitoring/)...');
execSync('npx vite build --mode mock', {
  cwd: frontendDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_BASE_PATH: '/monitoring/',
  },
});

if (!fs.existsSync(distDir)) {
  throw new Error(`Không tìm thấy thư mục build tại ${distDir}`);
}

console.log('2. Cleaning old root assets...');
const rootAssetsDir = path.join(rootDir, 'assets');
if (fs.existsSync(rootAssetsDir)) {
  fs.rmSync(rootAssetsDir, { recursive: true, force: true });
}

console.log('3. Copying Frontend/dist -> repo root...');
for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
  const srcPath = path.join(distDir, entry.name);
  const destPath = path.join(rootDir, entry.name);
  if (entry.isDirectory()) {
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}

// Tạo 404.html từ index.html để hỗ trợ SPA routing trên GitHub Pages
const rootIndex = path.join(rootDir, 'index.html');
const root404 = path.join(rootDir, '404.html');
if (fs.existsSync(rootIndex)) {
  fs.copyFileSync(rootIndex, root404);
}

// Đảm bảo có .nojekyll ở root
const nojekyll = path.join(rootDir, '.nojekyll');
if (!fs.existsSync(nojekyll)) {
  fs.writeFileSync(nojekyll, '');
}

console.log('4. Done! Root files updated for https://kai2202.github.io/monitoring/');
