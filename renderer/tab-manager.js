// tab-manager.js - Tab切换
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.querySelectorAll('.panel').forEach(panel => {
    // 如果是提取面板，保持隐藏状态
    if (panel.id === 'panel-extract') {
      panel.classList.remove('active'); // 确保提取面板始终不激活
    } else {
      panel.classList.toggle('active', panel.id === `panel-${tabName}`);
    }
  });
  
  // 确保提取标签不被选中
  const extractTab = document.querySelector('[data-tab="extract"]');
  if (extractTab && tabName === 'extract') {
    extractTab.classList.remove('active');
    window.Utils.setStatus('内容提取功能已被禁用', 'warning');
    return; // 不执行后续操作
  }
  
  // Ensure download group is hidden when switching away from inject
  const downloadGroup = document.getElementById('download');
  const injectPanel = document.getElementById('panel-inject');
  if (tabName !== 'inject') {
    if (downloadGroup) downloadGroup.classList.add('hidden');
    if (injectPanel) injectPanel.classList.remove('hidden');
    // clear inject code to avoid preserving last input
    const injectCode = document.getElementById('injectCode');
    if (injectCode) injectCode.value = '';
    // call ContentExtractor.hideDownloadGroup if available to clear entries
    if (typeof window.ContentExtractor?.hideDownloadGroup === 'function') {
      window.ContentExtractor.hideDownloadGroup();
    }
  } else {
    // when switching to inject panel, ensure it's visible (remove any hidden class)
    if (injectPanel) injectPanel.classList.remove('hidden');
  }
}

// 导出Tab管理功能
window.TabManager = {
  switchTab
};