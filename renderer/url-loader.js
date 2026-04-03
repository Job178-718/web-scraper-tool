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

  // 更健壮的URL处理
  try {
    // 如果已经是有效的URL，直接使用
    new URL(url);
  } catch (e) {
    // 如果不是有效URL，尝试添加协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
  }

  console.log('正在加载:', url);
  window.Utils.showLoading(true);
  window.Utils.setStatus('正在加载...', 'info');
  window.Utils.setCurrentPageInfo('正在加载: ' + url);

  try {
    // 确保webview有正确的属性
    webview.src = url;
    
    // 重置webview准备状态
    window._webviewReady = false;
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

function goBack() {
  const webview = window.Utils.$('webview');
  if (webview && webview.canGoBack()) {
    webview.goBack();
    window.Utils.setStatus('回退到上一个页面...', 'info');
  } else {
    window.Utils.setStatus('无法回退到上一个页面', 'warning');
  }
}

// 导出URL加载功能
window.UrlLoader = {
  loadUrl,
  refreshPage,
  goBack
};