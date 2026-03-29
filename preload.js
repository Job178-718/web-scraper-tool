const { contextBridge, ipcRenderer } = require('electron');

// 暴露给 webview 的 API
contextBridge.exposeInMainWorld('electronAPI', {
  sendElementInfo: (data) => {
    try {
      ipcRenderer.sendToHost('element-selected', data);
    } catch (error) {
      console.error('发送元素信息失败:', error);
    }
  },
  selectSavePath: async () => {
    try {
      const result = await ipcRenderer.invoke('select-save-directory');
      return result;
    } catch (error) {
      console.error('选择保存路径时发生错误:', error);
      throw error;
    }
  },
  // 下载相关API
  startDownload: (downloadInfo) => {
    return ipcRenderer.invoke('start-download', downloadInfo);
  },
  cancelDownload: (downloadId) => {
    return ipcRenderer.invoke('cancel-download', downloadId);
  },
  pauseDownload: (downloadId) => {
    return ipcRenderer.invoke('pause-download', downloadId);
  },
  resumeDownload: (downloadId) => {
    return ipcRenderer.invoke('resume-download', downloadId);
  },
  openFile: (savePath, filename) => {
    return ipcRenderer.invoke('open-file', { savePath, filename });
  },
  // 脚本执行结果通信
  sendScriptResult: (callbackId, result) => {
    ipcRenderer.sendToHost('script-result', { callbackId, result });
  },
  sendScriptError: (callbackId, error) => {
    ipcRenderer.sendToHost('script-error', { callbackId, error });
  },
  // 下载事件监听器
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', callback);
  },
  onDownloadComplete: (callback) => {
    ipcRenderer.on('download-complete', callback);
  },
  onDownloadError: (callback) => {
    ipcRenderer.on('download-error', callback);
  },
  // 脚本结果监听器
  onScriptResult: (callback) => {
    ipcRenderer.on('script-result', callback);
  },
  onScriptError: (callback) => {
    ipcRenderer.on('script-error', callback);
  }
});