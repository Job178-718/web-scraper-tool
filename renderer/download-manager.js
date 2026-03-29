// 简化的下载管理器
class DownloadManager {
  constructor() {
    this.downloads = new Map();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.bindUIEvents();
    
    // 设置默认保存路径
    if (window.State?.savePath) {
      const el1 = document.getElementById('downloadSavePath');
      const el2 = document.getElementById('savePath');
      if (el1) el1.value = window.State.savePath;
      if (el2) el2.value = window.State.savePath;
    }
  }

  setupEventListeners() {
    if (window.electronAPI) {
      window.electronAPI.onDownloadProgress((event, info) => {
        this.updateDownload(info);
      });
      
      window.electronAPI.onDownloadComplete((event, info) => {
        this.completeDownload(info);
      });
      
      window.electronAPI.onDownloadError((event, info) => {
        this.errorDownload(info);
      });
    }
  }

  bindUIEvents() {
    // 选择路径按钮（兼容不同面板 id）
    const selBtn = document.getElementById('selectDownloadPathBtn') || document.getElementById('browsePathBtn');
    if (selBtn) {
      selBtn.addEventListener('click', async () => {
        const path = await window.ScriptInjector?.getSavePath();
        if (path) {
          const el1 = document.getElementById('downloadSavePath');
          const el2 = document.getElementById('savePath');
          if (el1) el1.value = path;
          if (el2) el2.value = path;
          window.State = window.State || {};
          window.State.savePath = path;
        }
      });
    }

    // 开始下载按钮
    document.getElementById('startDownloadBtn')?.addEventListener('click', () => {
      this.startDownload();
    });

    // 清除已完成
    document.getElementById('clearCompletedBtn')?.addEventListener('click', () => {
      this.clearCompleted();
    });
  }

  startDownload() {
    const url = document.getElementById('downloadUrl').value.trim();
    const savePath = document.getElementById('downloadSavePath').value.trim();
    const filename = document.getElementById('downloadFilename').value.trim() || this.getFilenameFromUrl(url);

    if (!url || !savePath) {
      window.Utils?.setStatus('请填写完整信息', 'warning');
      return;
    }

    const id = Date.now().toString();
    const download = {
      id,
      url,
      filename,
      savePath,
      status: 'pending',
      progress: 0,
      totalBytes: 0,
      receivedBytes: 0
    };

    this.downloads.set(id, download);
    this.render();
    
    // 开始下载
    window.electronAPI?.startDownload({
      url,
      savePath,
      filename,
      id
    }).catch(err => {
      this.errorDownload({ id, error: err.message });
    });

    // 清空输入框
    document.getElementById('downloadUrl').value = '';
    document.getElementById('downloadFilename').value = '';
  }

  // 通过代码接口添加下载项并开始下载
  addDownload(url, options = {}) {
    const savePath = options.savePath || options.path || window.State?.savePath || '';
    const filename = options.filename || this.getFilenameFromUrl(url) || 'download';
    if (!url || !savePath) {
      window.Utils?.setStatus('下载失败，缺少 URL 或保存路径', 'warning');
      return;
    }

    const id = (options.id) ? String(options.id) : Date.now().toString();
    const download = {
      id,
      url,
      filename,
      savePath,
      status: 'pending',
      progress: 0,
      totalBytes: 0,
      receivedBytes: 0
    };

    this.downloads.set(id, download);
    this.render();

    window.electronAPI?.startDownload({
      url,
      savePath,
      filename,
      id
    }).catch(err => {
      this.errorDownload({ id, error: err?.message || String(err), filename });
    });
  }

  getFilenameFromUrl(url) {
    try {
      return new URL(url).pathname.split('/').pop() || 'download';
    } catch {
      return 'download';
    }
  }

  updateDownload(info) {
    const download = this.downloads.get(info.id);
    if (download) {
      Object.assign(download, info);
      this.render();
    }
  }

  completeDownload(info) {
    const download = this.downloads.get(info.id);
    if (download) {
      download.status = 'completed';
      download.progress = 100;
      this.downloads.set(info.id, download);
      this.render();
      window.Utils?.setStatus(`下载完成: ${info.filename}`, 'success');
    }
  }

  errorDownload(info) {
    const download = this.downloads.get(info.id);
    if (download) {
      download.status = 'error';
      download.error = info.error;
      this.downloads.set(info.id, download);
      this.render();
      window.Utils?.setStatus(`下载失败: ${info.filename}`, 'error');
    }
  }

  async cancelDownload(id) {
    await window.electronAPI?.cancelDownload?.(id);
    const download = this.downloads.get(id);
    if (download) {
      download.status = 'cancelled';
      this.render();
    }
  }

  clearCompleted() {
    for (const [id, download] of this.downloads.entries()) {
      if (['completed', 'cancelled'].includes(download.status)) {
        this.downloads.delete(id);
      }
    }
    this.render();
  }

  render() {
    const container = document.getElementById('download-list');
    if (!container) return;

    const stats = this.getStats();
    document.getElementById('download-stats').textContent = 
      `总计: ${stats.total} | 下载中: ${stats.downloading} | 完成: ${stats.completed}`;

    if (this.downloads.size === 0) {
      container.innerHTML = '<div class="empty-state">暂无下载</div>';
      return;
    }

    const downloads = Array.from(this.downloads.values())
      .sort((a, b) => (a.status === 'downloading' ? -1 : 1));
    
    container.innerHTML = downloads.map(d => this.createItem(d)).join('');
    this.bindItemEvents();
  }

  getStats() {
    const stats = { total: 0, downloading: 0, completed: 0 };
    for (const download of this.downloads.values()) {
      stats.total++;
      if (download.status === 'downloading') stats.downloading++;
      if (download.status === 'completed') stats.completed++;
    }
    return stats;
  }

  createItem(download) {
    const percent = Math.min(100, Math.round((download.receivedBytes / (download.totalBytes || 1)) * 100));
    const statusText = {
      'downloading': '下载中',
      'completed': '完成',
      'error': '错误',
      'cancelled': '已取消',
      'pending': '等待'
    }[download.status] || download.status;

    return `
      <div class="download-item" data-id="${download.id}">
        <div class="download-info">
          <div class="download-filename">${download.filename}</div>
        </div>
        <div class="download-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
          <div class="progress-text">${percent}%</div>
        </div>
        <div class="download-status">${statusText}</div>
        <div class="download-actions">
          ${download.status === 'downloading' ? 
            `<button class="action-btn cancel-btn">❌</button>` : 
            `<button class="action-btn delete-btn">🗑️</button>`}
        </div>
      </div>
    `;
  }

  bindItemEvents() {
    document.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.closest('.download-item').dataset.id;
        this.cancelDownload(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.closest('.download-item').dataset.id;
        this.downloads.delete(id);
        this.render();
      });
    });
  }
}

// 初始化下载管理器
if (typeof window !== 'undefined') {
  window.DownloadManager = new DownloadManager();
}