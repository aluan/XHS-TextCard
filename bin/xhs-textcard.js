#!/usr/bin/env node

const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const showVersion = args.includes('--version') || args.includes('-v');
const noOpen = args.includes('--no-open');

// Show help
if (showHelp) {
  console.log(`
🎨 XHS-TextCard - 小红书文字卡片生成器 CLI

用法:
  xhs-textcard [选项]
  xhs [选项]

选项:
  -h, --help       显示帮助信息
  -v, --version    显示版本号
  --no-open        启动服务但不自动打开浏览器

环境变量:
  PORT             自定义端口号 (默认: 8080)

示例:
  xhs-textcard              # 启动服务并打开浏览器
  xhs --no-open             # 启动服务但不打开浏览器
  PORT=3000 xhs             # 使用 3000 端口启动

更多信息: https://github.com/geekfoxcharlie/XHS-TextCard
  `);
  process.exit(0);
}

// Show version
if (showVersion) {
  const pkg = require('../package.json');
  console.log(`v${pkg.version}`);
  process.exit(0);
}

const PORT = process.env.PORT || 8080;
const PROJECT_ROOT = path.join(__dirname, '..');

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = path.join(PROJECT_ROOT, req.url === '/' ? '/editor.html' : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PROJECT_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Start server
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n🎨 XHS-TextCard 小红书文字卡片生成器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 服务已启动: ${url}`);
  console.log(`📂 项目目录: ${PROJECT_ROOT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 提示: 按 Ctrl+C 停止服务\n');

  // Auto open browser
  if (!noOpen) {
    openBrowser(url);
  }
});

// Open browser
function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.log(`⚠️  无法自动打开浏览器，请手动访问: ${url}`);
    }
  });
}
