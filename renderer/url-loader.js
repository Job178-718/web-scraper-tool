// url-loader.js - URL加载功能
async function loadUrl() {
  const urlInput = window.Utils.$('urlInput');
  const webview = window.Utils.$('webview');

  if (!urlInput || !webview) {
    console.error('找不到必要的元素');
    return;
  }

  let url = urlInput.value.trim();
  if (!url) {
    window.Utils.setStatus('请输入网址', 'warning');
    return;
  }

  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  console.log('正在加载:', url);
  window.Utils.showLoading(true);
  window.Utils.setStatus('正在加载...', 'info');
  window.Utils.setCurrentPageInfo('正在加载: ' + url);

  try {
    webview.src = url;
  } catch (error) {
    console.error('加载失败:', error);
    window.Utils.showLoading(false);
    window.Utils.setStatus('加载失败: ' + error.message, 'error');
    window.Utils.setCurrentPageInfo('加载失败');
  }
}

function refreshPage() {
  const webview = window.Utils.$('webview');
  if (webview && webview.src) {
    webview.reload();
    window.Utils.setStatus('刷新页面...', 'info');
  }
}

// 导出URL加载功能
window.UrlLoader = {
  loadUrl,
  refreshPage
};