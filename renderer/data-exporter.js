// data-exporter.js - 数据导出
function exportData() {
  if (!window.State.extractedData || window.State.extractedData.length === 0) {
    window.Utils.setStatus('没有可导出的数据', 'warning');
    return;
  }

  const data = {
    url: window.Utils.$('webview')?.src || '',
    timestamp: new Date().toISOString(),
    selector: window.Utils.$('extractSelector')?.value || '',
    count: window.State.extractedData.length,
    data: window.State.extractedData
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scraper_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.Utils.setStatus('数据已导出', 'success');
}

// 导出数据导出功能
window.DataExporter = {
  exportData
};