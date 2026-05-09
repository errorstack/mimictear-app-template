import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import open from 'open';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4173;
const rootDir = path.join(__dirname, '..');

// 先构建(使用预览配置)
console.log('🔨 Building for preview...\n');
try {
  // 设置环境变量
  process.env.VITE_ASSETS_BASE_PATH = '/';
  
  // 临时修改vite.config.js以包含React
  const configPath = path.join(rootDir, 'vite.config.js');
  const originalConfig = fs.readFileSync(configPath, 'utf-8');
  
  // 创建一个临时的预览配置
  const previewConfig = originalConfig.replace(
    /external: \['react', 'react-dom'\]/,
    '// external: ["react", "react-dom"] // Disabled for preview'
  );
  
  fs.writeFileSync(configPath, previewConfig);
  
  execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  
  // 恢复原始配置
  fs.writeFileSync(configPath, originalConfig);
  
  // 创建dist/assets目录并复制图片资源
  const assetsDir = path.join(rootDir, 'dist', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // 复制src/assets中的文件到dist/assets
  const srcAssetsDir = path.join(rootDir, 'src', 'assets');
  if (fs.existsSync(srcAssetsDir)) {
    const files = fs.readdirSync(srcAssetsDir);
    files.forEach(file => {
      const srcFile = path.join(srcAssetsDir, file);
      const destFile = path.join(assetsDir, file);
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied ${file} to dist/assets/`);
    });
  }
} catch (e) {
  console.error('Build failed!');
  console.error(e);
  process.exit(1);
}

console.log('\n✅ Build complete\n');

// 读取文件
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const previewHtml = fs.readFileSync(path.join(rootDir, 'preview.html'), 'utf-8');

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // 移除查询参数
  
  // 根路径返回preview.html
  if (urlPath === '/' || urlPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(previewHtml);
    return;
  }
  
  // 处理/assets/路径的资源(从dist/assets读取)
  if (urlPath.startsWith('/assets/')) {
    const filePath = path.join(rootDir, 'dist', urlPath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }
  
  // 处理/dist/路径的资源
  if (urlPath.startsWith('/dist/')) {
    const filePath = path.join(rootDir, urlPath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }
  
  // 其他路径尝试从文件系统读取
  const filePath = path.join(rootDir, urlPath);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Preview server running at http://localhost:${PORT}/`);
  console.log(`📦 Serving built App from dist/index.js`);
  console.log(`\nPress Ctrl+C to stop\n`);
  
  // 自动打开浏览器
  open(`http://localhost:${PORT}/`).catch(() => {
    console.log('Could not auto-open browser. Please visit http://localhost:' + PORT);
  });
});
