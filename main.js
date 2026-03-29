const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 保持窗口对象的全局引用，如果不这样做，当 JavaScript 对象被垃圾回收时，
// 窗口将自动关闭
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // 关键配置：允许 webview 中使用 nodeIntegration
      nodeIntegrationInSubFrames: true,
      // 允许 webview 标签
      webviewTag: true
    },
    icon: path.join(__dirname, 'assets', 'icon.ico')
  });

  // 加载应用的 index.html
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // 打开开发者工具（可选）
  // mainWindow.webContents.openDevTools();

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当 Electron 完成初始化时触发
app.whenReady().then(() => {
  createWindow();

  // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口。
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都关闭时退出（除了 macOS）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理器
ipcMain.handle('select-save-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

// 下载相关 IPC
ipcMain.handle('start-download', async (event, options) => {
  const { url, savePath, filename, id } = options;
  const filePath = path.join(savePath, filename);
  
  try {
    const fileUrl = new URL(url);
    const client = fileUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // 处理重定向
        mainWindow.webContents.send('download-redirect', id, response.headers.location);
        return;
      }
      
      const file = fs.createWriteStream(filePath);
      let receivedBytes = 0;
      const totalBytes = parseInt(response.headers['content-length'], 10);
      
      response.pipe(file);
      
      response.on('data', (chunk) => {
        receivedBytes += chunk.length;
        const progress = Math.round((receivedBytes / totalBytes) * 100);
        mainWindow.webContents.send('download-progress', { id, progress, receivedBytes, totalBytes });
      });
      
      file.on('finish', () => {
        file.close();
        mainWindow.webContents.send('download-complete', { id, filename });
      });
    });
    
    request.on('error', (error) => {
      mainWindow.webContents.send('download-error', { id, error: error.message });
    });
    
  } catch (error) {
    mainWindow.webContents.send('download-error', { id, error: error.message });
  }
});

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});