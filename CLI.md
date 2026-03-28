# XHS-TextCard CLI 使用指南

## 📦 安装

### 全局安装（推荐）

```bash
npm install -g xhs-textcard
```

安装后可以在任何地方使用 `xhs-textcard` 或 `xhs` 命令。

### 本地安装

```bash
# 克隆项目
git clone https://github.com/geekfoxcharlie/XHS-TextCard.git
cd XHS-TextCard

# 安装依赖
npm install

# 链接到全局（开发模式）
npm link
```

## 🚀 使用方法

### 启动服务

```bash
# 使用完整命令
xhs-textcard

```

服务启动后会：
- 自动在浏览器中打开编辑器页面
- 默认运行在 `http://localhost:8080`
- 显示项目目录路径

### 自定义端口

```bash
PORT=3000 xhs-textcard
```

### 停止服务

按 `Ctrl+C` 停止服务

## 📝 示例

```bash
# 启动服务（默认端口 8080）
$ xhs-textcard

🎨 XHS-TextCard 小红书文字卡片生成器
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 服务已启动: http://localhost:8080
📂 项目目录: /path/to/XHS-TextCard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 提示: 按 Ctrl+C 停止服务
```

## 🔧 开发

如果你想修改 CLI 代码：

1. 编辑 `bin/xhs-textcard.js`
2. 运行 `npm link` 重新链接
3. 测试命令 `xhs-textcard`

## 📋 系统要求

- Node.js >= 14.0.0
- 支持的浏览器：Chrome 80+、Firefox 75+、Safari 13+、Edge 80+

## 🐛 故障排除

### 端口被占用

```bash
# 使用其他端口
PORT=8888 xhs-textcard
```

### 浏览器未自动打开

手动访问控制台显示的 URL（通常是 `http://localhost:8080`）

### 权限错误

```bash
# macOS/Linux
chmod +x bin/xhs-textcard.js
```

## 📮 反馈

遇到问题？[提交 Issue](https://github.com/geekfoxcharlie/XHS-TextCard/issues)
