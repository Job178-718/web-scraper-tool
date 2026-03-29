# 🕷️ Web Scraper Pro

专业的网页抓取和内容提取工具，界面现代简洁，功能强大易用。

## ✨ 特性

- 🎨 **现代化 UI** - 深色主题，GitHub 风格界面
- 🎯 **精准元素选择** - 可视化点选，自动生成唯一选择器
- 📦 **智能内容提取** - 支持文本、HTML、属性提取
- 🧹 **一键页面清理** - 快速删除广告、导航、页脚等
- 💉 **脚本注入** - 执行自定义 JavaScript/CSS
- 💾 **数据导出** - 导出为 JSON 格式

## 🚀 快速开始

### 开发运行
```bash
# 安装依赖
npm install

# 启动应用
npm start
```

### 打包为可执行文件

#### 一键打包（推荐）
```bash
# Windows
build.bat

# Linux/Mac
./build.sh
```

#### 手动打包
```bash
npm install
npm install -D electron-builder
npm run build:win
```

打包完成后在 `dist/` 目录下会生成：
- `Web Scraper Pro Setup 2.0.0.exe` - 安装版
- `WebScraperPro-Portable-2.0.0.exe` - 便携版

## 📖 使用指南

### 1. 加载网页
- 在顶部地址栏输入网址
- 按回车或点击播放按钮加载

### 2. 提取内容
- 切换到"内容提取"标签
- 输入 CSS 选择器，或使用 🎯 按钮从页面选择
- 选择提取类型（文本/HTML/属性）
- 点击"开始提取"

### 3. 页面清理
- 切换到"页面清理"标签
- 点击预设卡片快速清理（广告/导航/页脚等）
- 或使用自定义选择器删除特定元素

### 4. 脚本注入
- 切换到"脚本注入"标签
- 输入 JavaScript 或 CSS 代码
- 或使用预设脚本（暗黑模式/去广告/阅读模式）

### 5. 元素选择器
- 点击工具栏的"选择元素"按钮
- 在网页上悬停预览，点击选中
- 自动生成精准的选择器

## 🛠️ 技术栈
- **Electron** - 桌面应用框架
- **Webview** - 网页渲染
- **现代 CSS** - 深色主题，流畅动画

## 📁 项目结构

```
web-scraper-tool/
├── package.json              # 项目配置
├── main.js                   # Electron 主进程
├── preload.js                # 预加载脚本
├── build.bat                 # Windows 打包脚本
├── build.sh                  # Linux/Mac 打包脚本
├── PACKAGE_GUIDE.md          # 详细打包指南
├── assets/                   # 图标资源
│   ├── ICON_GUIDE.md
│   └── icon.ico             # 应用图标（需自行添加）
└── renderer/
    ├── index.html           # 主界面
    ├── style.css            # 样式（深色主题）
    └── renderer.js          # 前端逻辑
```

## ⚠️ 注意事项

- 部分网站可能有反爬虫机制
- 请遵守目标网站的 robots.txt 和使用条款
- 仅用于合法合规的数据抓取

## 📦 打包文件说明

| 文件 | 大小 | 说明 |
|------|------|------|
| Setup 版 | ~150MB | 安装程序，推荐普通用户使用 |
| 便携版 | ~150MB | 无需安装，适合U盘携带 |

## 🔧 系统要求

- Windows 10/11 (64位)
- macOS 10.14+
- Linux (Ubuntu 18.04+)

---

**版本**: 2.0  
**更新日期**: 2026-03-28  
