// element-cleaner.js - 元素清理
async function cleanupElements(type) {
  const selectors = window.Config.cleanup[type];
  if (!selectors) return;

  let total = 0;
  for (const selector of selectors) {
    try {
      const count = await window.WebViewExecutor.executeInWebView(`
        (function() {
          const els = document.querySelectorAll('${window.Utils.escapeSelector(selector)}');
          els.forEach(el => el.remove());
          return els.length;
        })()
      `);
      total += count || 0;
    } catch (e) {}
  }

  const names = { ads: '广告', nav: '导航', footer: '页脚', sidebar: '侧边栏', popup: '弹窗' };
  window.Utils.setStatus(`已删除${total} 个${names[type] || type}元素`, 'success');
}

async function deleteCustomElements() {
  const selector = window.Utils.$('deleteSelector')?.value?.trim();
  if (!selector) {
    window.Utils.setStatus('请输入要删除的选择器', 'warning');
    return;
  }

  try {
    const count = await window.WebViewExecutor.executeInWebView(`
      (function() {
        const els = document.querySelectorAll('${window.Utils.escapeSelector(selector)}');
        els.forEach(el => el.remove());
        return els.length;
      })()
    `);
    window.Utils.setStatus(`已删除${count || 0} 个元素`, 'success');
  } catch (error) {
    window.Utils.setStatus('删除失败: ' + error.message, 'error');
  }
}

// 导出元素清理功能
window.ElementCleaner = {
  cleanupElements,
  deleteCustomElements
};