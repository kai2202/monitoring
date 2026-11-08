const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = [];
out.push('Root files: ' + JSON.stringify(fs.readdirSync(root).filter(f => !['node_modules', '.git'].includes(f))));
const frontendDist = path.join(root, 'Frontend', 'dist');
out.push('Frontend dist exists? ' + fs.existsSync(frontendDist));
if (fs.existsSync(frontendDist)) {
  out.push('Frontend dist files: ' + JSON.stringify(fs.readdirSync(frontendDist)));
}
fs.writeFileSync(path.join(__dirname, 'debug.log'), out.join('\n'));
