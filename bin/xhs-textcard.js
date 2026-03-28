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

// Parse template and cover options
let template = 'starry-night'; // default template
let enableCover = false; // default: no cover

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--template' || args[i] === '-t') {
    template = args[i + 1] || template;
  }
  if (args[i] === '--cover' || args[i] === '-c') {
    enableCover = true;
  }
}

// Show help
if (showHelp) {
  console.log(`
🎨 XHS-TextCard - 小红书文字卡片生成器 CLI

用法:
  xhs-textcard [选项]

选项:
  -h, --help              显示帮助信息
  -v, --version           显示版本号
  --no-open               启动服务但不自动打开浏览器
  -t, --template <name>   指定模板 (默认: starry-night)
  -c, --cover             启用封面 (默认: 不启用)

可用模板:
  starry-night           星光质感
  polaroid               复古拍立得
  notion-style           效率笔记
  elegant-book           书籍内页
  ios-memo               苹果备忘录
  swiss-studio           苏黎世工作室
  minimalist-magazine    极简杂志
  aura-gradient          弥散极光
  deep-night             暗夜深思
  pro-doc                大厂文档
  blank                  空白模板

环境变量:
  PORT                    自定义端口号 (默认: 8080)

示例:
  xhs-textcard                                    # 启动服务并打开浏览器
  xhs-textcard --no-open                          # 启动服务但不打开浏览器
  xhs-textcard -t ios-memo                        # 使用苹果备忘录模板
  xhs-textcard -t notion-style -c                 # 使用效率笔记模板并启用封面
  PORT=3000 xhs-textcard -t pro-doc               # 使用 3000 端口和大厂文档模板

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

    // Inject config for editor.html
    if (req.url === '/' || req.url === '/editor.html') {
      let html = data.toString();
      const configScript = `
<script>
  // CLI Configuration
  window.CLI_CONFIG = {
    template: '${template}',
    enableCover: ${enableCover}
  };
</script>`;
      html = html.replace('</head>', `${configScript}\n</head>`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(html);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

// Start server
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n🎨 XHS-TextCard 小红书文字卡片生成器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 服务已启动: ${url}`);
  console.log(`📂 项目目录: ${PROJECT_ROOT}`);
  console.log(`🎨 使用模板: ${template}`);
  console.log(`📄 启用封面: ${enableCover ? '是' : '否'}`);
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
