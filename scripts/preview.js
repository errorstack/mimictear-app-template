import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 读取 app.json 获取 appId
const appJsonPath = path.join(rootDir, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
const appId = appJson.appId;

console.log(`App ID: ${appId}`);

// Step 1: 运行 vite build
console.log('\n📦 Running vite build...');
try {
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed!');
  process.exit(1);
}

// Step 2: 打包 dist 文件夹为 [appId].mapp
const distPath = path.join(rootDir, 'dist');
const mappFileName = `${appId}.mapp`;
const mappPath = path.join(distPath, mappFileName);

console.log(`\n📦 Creating ${mappFileName}...`);

if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found!');
  process.exit(1);
}

// 创建 zip 文件
const output = fs.createWriteStream(mappPath);
const archive = new ZipArchive();

output.on('close', () => {
  console.log(`✅ ${mappFileName} created successfully!`);
  console.log(`   Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  
  // Step 3: 启动服务
  startServer();
});

archive.on('error', (err) => {
  console.error('❌ Archive error:', err);
  process.exit(1);
});

archive.pipe(output);

// 添加 dist 文件夹中的所有文件（排除 .mapp 文件本身）
const files = fs.readdirSync(distPath);
files.forEach(file => {
  if (file !== mappFileName) {
    const filePath = path.join(distPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      archive.file(filePath, { name: file });
    } else if (stat.isDirectory()) {
      archive.directory(filePath, file);
    }
  }
});

archive.finalize();

// Step 3: 启动 HTTP 服务
function startServer() {
  const PORT = 3000;
  
  const server = http.createServer((req, res) => {
    // 处理请求路径
    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);
    
    // 安全检查：防止目录遍历攻击
    if (!filePath.startsWith(distPath)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // 设置 Content-Type
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm',
      '.mapp': 'application/zip'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // 读取并发送文件
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Preview server started!`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://<your-ip>:${PORT}`);
    console.log(`   MAPP file: http://localhost:${PORT}/${mappFileName}`);
    console.log(`\nPress Ctrl+C to stop the server`);
  });
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n\n👋 Server stopped.');
    server.close();
    process.exit(0);
  });
}
