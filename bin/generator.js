const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

/**
 * Start a simple HTTP server
 */
function startServer(projectRoot, port = 0) {
  return new Promise((resolve, reject) => {
    const MIME_TYPES = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf'
    };

    const server = http.createServer((req, res) => {
      let filePath = path.join(projectRoot, req.url === '/' ? '/editor.html' : req.url);

      if (!filePath.startsWith(projectRoot)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    server.listen(port, () => {
      const actualPort = server.address().port;
      resolve({ server, port: actualPort });
    });

    server.on('error', reject);
  });
}

/**
 * Generate images from markdown file
 */
async function generateImages(options) {
  const { input, output, template = 'starry-night', enableCover = false } = options;

  // Validate input file
  const inputPath = path.resolve(input);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // Read markdown content
  const markdownContent = fs.readFileSync(inputPath, 'utf-8');

  // Create output directory
  const outputPath = path.resolve(output);
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  console.log('\n🎨 XHS-TextCard 图片生成器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📄 输入文件: ${inputPath}`);
  console.log(`📁 输出目录: ${outputPath}`);
  console.log(`🎨 使用模板: ${template}`);
  console.log(`📄 启用封面: ${enableCover ? '是' : '否'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Start local server
  const projectRoot = path.join(__dirname, '..');
  console.log('🌐 启动本地服务器...');
  const { server, port } = await startServer(projectRoot);
  const editorUrl = `http://localhost:${port}/editor.html`;
  console.log(`   服务器地址: ${editorUrl}`);

  console.log('🚀 启动浏览器...');
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });

    // Load editor page
    console.log('📄 加载编辑器页面...');
    await page.goto(editorUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Inject configuration
    await page.evaluate((config) => {
      window.CLI_CONFIG = config;
    }, { template, enableCover });

    // Wait for app to initialize
    console.log('⏳ 等待应用初始化...');
    await page.waitForFunction(() => {
      return typeof window.app !== 'undefined' && window.app.currentTemplate;
    }, { timeout: 15000 });

    // Set markdown content
    console.log('✍️  设置 Markdown 内容...');
    await page.evaluate((content) => {
      const textInput = document.getElementById('text-input');
      if (textInput) {
        textInput.value = content;
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, markdownContent);

    // Wait for preview to render
    console.log('⏳ 等待渲染完成...');
    await page.waitForTimeout(5000);

    // Get preview count
    const previewCount = await page.evaluate(() => {
      const previews = document.querySelectorAll('.preview-item canvas');
      return previews.length;
    });

    if (previewCount === 0) {
      throw new Error('未生成任何预览图片，请检查 Markdown 内容');
    }

    console.log(`📸 生成 ${previewCount} 张图片...\n`);

    // Download each preview
    for (let i = 0; i < previewCount; i++) {
      const imageData = await page.evaluate((index) => {
        const previews = document.querySelectorAll('.preview-item canvas');
        const canvas = previews[index];
        return canvas ? canvas.toDataURL('image/png') : null;
      }, i);

      if (!imageData) {
        console.warn(`  ⚠️  跳过第 ${i + 1} 张图片（无法获取数据）`);
        continue;
      }

      // Save image
      const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
      const fileName = `page-${String(i + 1).padStart(2, '0')}.png`;
      const filePath = path.join(outputPath, fileName);

      fs.writeFileSync(filePath, base64Data, 'base64');
      console.log(`  ✅ ${fileName}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 完成！共生成 ${previewCount} 张图片`);
    console.log(`📁 保存位置: ${outputPath}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } finally {
    await browser.close();
    server.close();
  }
}

module.exports = { generateImages };

