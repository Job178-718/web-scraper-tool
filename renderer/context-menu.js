// context-menu.js - 右键菜单处理
function handleContextMenuAction(data) {
  if (data.action === 'css-path') {
    // 将CSS路径填入提取选择器输入框
    const selectorInput = window.Utils.$('extractSelector');
    if (selectorInput) {
      selectorInput.value = data.data;
      window.Utils.setStatus(`CSS路径已获取: ${data.data}`, 'success');
    }
  } else if (data.action === 'js-info') {
    // 显示JS信息
    const jsInfo = data.data;
    let infoText = `标签: ${jsInfo.tag}\n`;
    infoText += `事件: ${jsInfo.events.join(', ') || '无'}\n`;
    infoText += `属性: ${Object.keys(jsInfo.attributes).join(', ') || '无'}`;
    window.Utils.setStatus(`JS信息: ${infoText}`, 'info');
  }
}

function openDevTools() {
  const webview = window.Utils.$('webview');
  if (!webview) {
    window.Utils.setStatus('WebView 未找到', 'error');
    return;
  }

  try {
    // 打开开发者工具，聚焦到Elements标签页（HTML源码）
    webview.openDevTools();
    window.Utils.setStatus('开发者工具已打开，请查看Elements标签页', 'success');
  } catch (error) {
    window.Utils.setStatus('打开开发者工具失败: ' + error.message, 'error');
  }
}

// 导出右键菜单功能
window.ContextMenu = {
  handleContextMenuAction,
  openDevTools
};