// utils.js - 工具函数
const $ = id => document.getElementById(id);

function setStatus(text, type = 'info') {
  const el = $('statusText');
  if (!el) return;
  el.textContent = text;
  const colors = { info: '#7d8590', success: '#3fb950', error: '#f85149', warning: '#d29922' };
  el.style.color = colors[type] || colors.info;
}

function showLoading(show) {
  const el = $('loading');
  if (el) el.classList.toggle('hidden', !show);
}

function escapeSelector(str) {
  return str?.replace(/[\\"']/g, '\\$&') || '';
}

function setCurrentPageInfo(text) {
  const pageInfoEl = $('currentPageInfo');
  if (pageInfoEl) {
    pageInfoEl.textContent = text || '未加载页面';
  }
}

function copyToClipboard(text) {
  if (!text || text === '-') return;
  navigator.clipboard.writeText(text).then(() => {
    setStatus('已复制到剪贴板', 'success');
  }).catch(() => {
    setStatus('复制失败', 'error');
  });
}

// 导出工具函数
window.Utils = {
  $,
  setStatus,
  showLoading,
  escapeSelector,
  setCurrentPageInfo,
  copyToClipboard
};