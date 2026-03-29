// source-viewer.js - 源码查看
async function viewSource() {
  const sourceEl = window.Utils.$('sourceCode');
  if (!sourceEl) {
    window.Utils.setStatus('源码显示区域未找到', 'error');
    return;
  }

  try {
    window.Utils.setStatus('正在获取页面源码...', 'info');
    const html = await window.WebViewExecutor.executeInWebView('document.documentElement.outerHTML');

    if (html) {
      sourceEl.textContent = html;
      window.Utils.setStatus(`源码获取成功 (${html.length} 字符)`, 'success');
    } else {
      sourceEl.textContent = '无法获取页面源码';
      window.Utils.setStatus('获取源码失败', 'error');
    }
  } catch (error) {
    sourceEl.textContent = '获取源码时出错: ' + error.message;
    window.Utils.setStatus('获取源码失败: ' + error.message, 'error');
  }
}

function copySource() {
  const sourceEl = window.Utils.$('sourceCode');
  if (!sourceEl || !sourceEl.textContent.trim()) {
    window.Utils.setStatus('没有可复制的源码', 'warning');
    return;
  }

  navigator.clipboard.writeText(sourceEl.textContent).then(() => {
    window.Utils.setStatus('源码已复制到剪贴板', 'success');
  }).catch(() => {
    window.Utils.setStatus('复制失败', 'error');
  });
}

// 导出源码查看功能
window.SourceViewer = {
  viewSource,
  copySource
};