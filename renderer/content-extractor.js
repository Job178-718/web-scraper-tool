// content-extractor.js - 内容提取
function extractContent() {
  window.Utils.setStatus('内容提取功能已被禁用', 'warning');
  return;
}

function displayResults(results) {
  const countEl = window.Utils.$('resultCount');
  const container = window.Utils.$('extractResult');

  if (countEl) countEl.textContent = `0 条`;
  if (!container) return;

  container.innerHTML = '<div class="result-item">内容提取功能已被禁用</div>';
}

// 显示下载组
function showDownloadGroup(extractedData) {
  window.Utils.setStatus('内容提取功能已被禁用', 'warning');
  return;
}

// 隐藏下载组
function hideDownloadGroup() {
  const downloadGroup = document.querySelector('.download-group');
  const injectGroup = document.querySelector('.inject-group');
  
  if (downloadGroup && injectGroup) {
    downloadGroup.classList.add('hidden');
    injectGroup.style.marginBottom = '0';
  }
  
  clearDownloadEntries();
}

function updateDownloadEntries(extractedData) {
  const container = document.getElementById('downloadEntriesList');
  if (!container) return;
  
  container.innerHTML = '<div class="empty-state">内容提取功能已被禁用</div>';
}

function extractDownloadableItemsFromExtractedData(data) {
  return []; // 返回空数组，因为功能被禁用
}

function clearDownloadEntries() {
  const container = document.getElementById('downloadEntriesList');
  if (container) {
    container.innerHTML = '';
  }
}

// 导出内容提取功能
window.ContentExtractor = {
  extractContent,
  displayResults,
  showDownloadGroup,
  hideDownloadGroup,
  updateDownloadEntries,
  extractDownloadableItemsFromExtractedData,
  clearDownloadEntries
};