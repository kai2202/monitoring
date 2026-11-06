const { createServer } = require('vite');
const path = require('path');
const http = require('http');
const fs = require('fs');

async function test() {
  const log = [];
  log.push('Starting Vite server test...');
  log.push('Current CWD: ' + process.cwd());
  
  try {
    const server = await createServer({
      configFile: path.resolve(__dirname, '../../vite.config.ts'),
      root: path.resolve(__dirname, '../../'),
      server: { port: 3333 }
    });
    
    await server.listen();
    log.push('Server started on port 3333');
    
    // Also test transforming /src/main.tsx
    try {
      const transformResult = await server.transformRequest('/src/main.tsx');
      log.push('Transform /src/main.tsx SUCCESS, code length: ' + (transformResult ? transformResult.code.length : 0));
    } catch (err) {
      log.push('Transform /src/main.tsx ERROR: ' + err.stack);
    }

    // Also test transforming /src/App.tsx
    try {
      const transformResult = await server.transformRequest('/src/App.tsx');
      log.push('Transform /src/App.tsx SUCCESS, code length: ' + (transformResult ? transformResult.code.length : 0));
    } catch (err) {
      log.push('Transform /src/App.tsx ERROR: ' + err.stack);
    }

    // Also test transforming /src/routes/AppRoutes.tsx
    try {
      const transformResult = await server.transformRequest('/src/routes/AppRoutes.tsx');
      log.push('Transform /src/routes/AppRoutes.tsx SUCCESS, code length: ' + (transformResult ? transformResult.code.length : 0));
    } catch (err) {
      log.push('Transform /src/routes/AppRoutes.tsx ERROR: ' + err.stack);
    }

    await new Promise((resolve) => {
      http.get('http://localhost:3333/', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
          log.push('Status code: ' + res.statusCode);
          log.push('Response HTML: ' + data);
          await server.close();
          resolve();
        });
      }).on('error', async (err) => {
        log.push('HTTP error: ' + err.message);
        await server.close();
        resolve();
      });
    });

  } catch (err) {
    log.push('Vite createServer error: ' + err.stack);
  }

  fs.writeFileSync(path.resolve(__dirname, 'vite_result.txt'), log.join('\n'), 'utf8');
}

test();
