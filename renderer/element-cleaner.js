// element-cleaner.js - 元素清理
async function cleanupElements(type) {
  const selectors = window.Config.CLEANUP_SELECTORS[type];
  if (!selectors) {
    window.Utils.setStatus(`未知的清理类型: ${type}`, 'error');
    return 0;
  }

  let total = 0;
  const failedSelectors = [];

  for (const selector of selectors) {
    try {
      const count = await window.WebViewExecutor.executeInWebView(`
        (function() {
          try {
            const els = document.querySelectorAll('${window.Utils.escapeSelector(selector)}');
            els.forEach(el => {
              el.style.opacity = '0.5';
              el.style.transition = 'all 0.3s ease';
              setTimeout(() => el.remove(), 300);
            });
            return els.length;
          } catch (e) {
            return 0;
          }
        })()
      `);
      total += count || 0;
    } catch (e) {
      failedSelectors.push(selector);
      console.error(`删除选择器 "${selector}" 时出错:`, e);
    }
  }

  const names = { 
    ads: '广告', 
    nav: '导航', 
    footer: '页脚', 
    sidebar: '侧边栏', 
    popup: '弹窗',
    social: '社交分享',
    comments: '评论区',
    cookie: 'Cookie提示',
    forms: '表单'
  };
  
  const typeName = names[type] || type;
  const statusMsg = total > 0 
    ? `已删除 ${total} 个${typeName}元素` 
    : `未找到${typeName}元素`;
    
  window.Utils.setStatus(statusMsg, total > 0 ? 'success' : 'info');
  
  if (failedSelectors.length > 0) {
    console.warn(`未能删除以下选择器:`, failedSelectors);
  }
  
  return total;
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
        try {
          const els = document.querySelectorAll('${window.Utils.escapeSelector(selector)}');
          els.forEach(el => {
            el.style.opacity = '0.5';
            el.style.transition = 'all 0.3s ease';
            setTimeout(() => el.remove(), 300);
          });
          return els.length;
        } catch (e) {
          return 0;
        }
      })()
    `);
    
    if (count > 0) {
      window.Utils.setStatus(`已删除 ${count} 个元素`, 'success');
    } else {
      window.Utils.setStatus(`未找到匹配 "${selector}" 的元素`, 'info');
    }
  } catch (error) {
    window.Utils.setStatus('删除失败: ' + error.message, 'error');
  }
}

// 批量清理功能
async function batchCleanup(types) {
  if (!Array.isArray(types)) {
    window.Utils.setStatus('批量清理参数错误', 'error');
    return;
  }
  
  let totalCount = 0;
  window.Utils.setStatus('开始批量清理...', 'info');
  
  for (const type of types) {
    const count = await cleanupElements(type);
    totalCount += count;
  }
  
  window.Utils.setStatus(`批量清理完成，共删除 ${totalCount} 个元素`, 'success');
}

// 智能清理功能 - 根据页面类型自动清理
async function smartCleanup() {
  const pageType = await window.WebViewExecutor.executeInWebView(`
    (function() {
      const url = window.location.href.toLowerCase();
      const title = document.title.toLowerCase();
      
      if (url.includes('blog') || url.includes('article') || title.includes('文章')) {
        return 'reading';
      } else if (url.includes('news') || title.includes('新闻')) {
        return 'news';
      } else if (url.includes('shop') || url.includes('product') || title.includes('商品')) {
        return 'shopping';
      } else {
        return 'general';
      }
    })()
  `);
  
  let selectorsToApply = [];
  
  switch(pageType) {
    case 'reading':
      selectorsToApply = ['ads', 'nav', 'sidebar', 'comments', 'social'];
      break;
    case 'news':
      selectorsToApply = ['ads', 'popup', 'cookie', 'sidebar'];
      break;
    case 'shopping':
      selectorsToApply = ['ads', 'popup', 'social'];
      break;
    case 'general':
    default:
      selectorsToApply = ['ads', 'popup', 'cookie'];
      break;
  }
  
  window.Utils.setStatus('智能清理已启动...', 'info');
  await batchCleanup(selectorsToApply);
}

// 撤销上次清理操作
async function undoLastCleanup() {
  try {
    await window.WebViewExecutor.executeInWebView(`
      (function() {
        // 由于元素已经被删除，我们无法真正撤消删除
        // 但我们可以尝试刷新页面
        if (confirm('确定要刷新页面以恢复元素吗？')) {
          window.location.reload();
        }
      })()
    `);
  } catch (error) {
    window.Utils.setStatus('撤销操作失败: ' + error.message, 'error');
  }
}

// 导出元素清理功能
window.ElementCleaner = {
  cleanupElements,
  deleteCustomElements,
  batchCleanup,
  smartCleanup,
  undoLastCleanup
};