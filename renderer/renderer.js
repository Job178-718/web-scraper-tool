// Web Scraper Pro - 简化版（修复选择功能）
// by 小柒 🍀

const $ = id => document.getElementById(id);

let selectMode = false;
let selectTarget = null;
let extractedData = [];
let selectCheckInterval = null;

const CONFIG = {
  cleanup: {
    ads: ['.ad', '.ads', '.advertisement', '.ad-banner', '[class*="ad-"]', '[id*="ad-"]', '.sponsor', '.promotion', '.banner'],
    nav: ['nav', 'header', '.navbar', '.nav', '.navigation', '.top-nav', '#header', '#navbar'],
    footer: ['footer', '.footer', '.foot', '#footer'],
    sidebar: ['aside', '.sidebar', '.side-bar', '.widget-area'],
    popup: ['.modal', '.popup', '.overlay', '.dialog', '[class*="modal"]', '[class*="popup"]']
  }
};

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

// 加载 URL
async function loadUrl() {
  const urlInput = $('urlInput');
  const webview = $('webview');

  if (!urlInput || !webview) {
    console.error('找不到必要的元素');
    return;
  }

  let url = urlInput.value.trim();
  if (!url) {
    setStatus('请输入网址', 'warning');
    return;
  }

  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  console.log('正在加载:', url);
  showLoading(true);
  setStatus('正在加载...', 'info');
  setCurrentPageInfo('正在加载: ' + url);

  try {
    webview.src = url;
  } catch (error) {
    console.error('加载失败:', error);
    showLoading(false);
    setStatus('加载失败: ' + error.message, 'error');
    setCurrentPageInfo('加载失败');
  }
}

// 刷新页面
function refreshPage() {
  const webview = $('webview');
  if (webview && webview.src) {
    webview.reload();
    setStatus('刷新页面...', 'info');
  }
}

// 切换 Tab
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tabName}`);
  });
}

// 在webview中执行脚本
async function executeInWebView(script) {
  const webview = $('webview');
  if (!webview) throw new Error('WebView 未找到');
  try {
    return await webview.executeJavaScript(script);
  } catch (error) {
    console.error('执行脚本失败:', error);
    throw error;
  }
}

// 查看页面源码
async function viewSource() {
  const sourceEl = $('sourceCode');
  if (!sourceEl) {
    setStatus('源码显示区域未找到', 'error');
    return;
  }

  try {
    setStatus('正在获取页面源码...', 'info');
    const html = await executeInWebView('document.documentElement.outerHTML');

    if (html) {
      sourceEl.textContent = html;
      setStatus(`源码获取成功 (${html.length} 字符)`, 'success');
    } else {
      sourceEl.textContent = '无法获取页面源码';
      setStatus('获取源码失败', 'error');
    }
  } catch (error) {
    sourceEl.textContent = '获取源码时出错: ' + error.message;
    setStatus('获取源码失败: ' + error.message, 'error');
  }
}

// 复制源码到剪贴板
function copySource() {
  const sourceEl = $('sourceCode');
  if (!sourceEl || !sourceEl.textContent.trim()) {
    setStatus('没有可复制的源码', 'warning');
    return;
  }

  navigator.clipboard.writeText(sourceEl.textContent).then(() => {
    setStatus('源码已复制到剪贴板', 'success');
  }).catch(() => {
    setStatus('复制失败', 'error');
  });
}

// 处理右键菜单操作
function handleContextMenuAction(data) {
  if (data.action === 'css-path') {
    // 将CSS路径填入提取选择器输入框
    const selectorInput = $('extractSelector');
    if (selectorInput) {
      selectorInput.value = data.data;
      setStatus(`CSS路径已获取: ${data.data}`, 'success');
    }
  } else if (data.action === 'js-info') {
    // 显示JS信息
    const jsInfo = data.data;
    let infoText = `标签: ${jsInfo.tag}\n`;
    infoText += `事件: ${jsInfo.events.join(', ') || '无'}\n`;
    infoText += `属性: ${Object.keys(jsInfo.attributes).join(', ') || '无'}`;
    setStatus(`JS信息: ${infoText}`, 'info');
  }
}

// 打开开发者工具
function openDevTools() {
  const webview = $('webview');
  if (!webview) {
    setStatus('WebView 未找到', 'error');
    return;
  }

  try {
    // 打开开发者工具，聚焦到Elements标签页（HTML源码）
    webview.openDevTools();
    setStatus('开发者工具已打开，请查看Elements标签页', 'success');
  } catch (error) {
    setStatus('打开开发者工具失败: ' + error.message, 'error');
  }
}

// 提取内容
async function extractContent() {
  const selector = $('extractSelector')?.value?.trim();
  if (!selector) {
    setStatus('请输入CSS 选择器', 'warning');
    return;
  }

  const extractType = document.querySelector('input[name="extractType"]:checked')?.value || 'text';

  try {
    const safeSelector = escapeSelector(selector);
    let script;

    if (extractType === 'text') {
      script = `Array.from(document.querySelectorAll('${safeSelector}')).map((el, i) => ({index: i+1, text: el.innerText?.trim(), tag: el.tagName.toLowerCase()})).filter(item => item.text)`;
    } else if (extractType === 'html') {
      script = `Array.from(document.querySelectorAll('${safeSelector}')).map((el, i) => ({index: i+1, html: el.innerHTML?.substring(0, 500), tag: el.tagName.toLowerCase()}))`;
    } else {
      const attrName = $('attrName')?.value?.trim() || 'href';
      script = `Array.from(document.querySelectorAll('${safeSelector}')).map((el, i) => ({index: i+1, value: el.getAttribute('${attrName}'), tag: el.tagName.toLowerCase()})).filter(item => item.value)`;
    }

    const results = await executeInWebView(script);
    extractedData = results || [];

    displayResults(extractedData);
    setStatus(`成功提取 ${extractedData.length} 条数据`, 'success');
  } catch (error) {
    setStatus('提取失败: ' + error.message, 'error');
  }
}

// 显示结果
function displayResults(results) {
  const countEl = $('resultCount');
  const container = $('extractResult');

  if (countEl) countEl.textContent = `${results.length} 条`;
  if (!container) return;

  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<div class="result-item">未找到匹配的数据</div>';
    return;
  }

  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = '<div class="meta"><span>#' + item.index + '</span><span>&lt;' + item.tag + '&gt;</span></div><div>' + (item.text || item.html || item.value || '(无内容)') + '</div>';
    container.appendChild(div);
  });
}

// 清理元素
async function cleanupElements(type) {
  const selectors = CONFIG.cleanup[type];
  if (!selectors) return;

  let total = 0;
  for (const selector of selectors) {
    try {
      const count = await executeInWebView(
        (function() {
          const els = document.querySelectorAll('\${escapeSelector(selector)}');
          els.forEach(el => el.remove());
          return els.length;
        })()
      );
      total += count || 0;
    } catch (e) {}
  }

  const names = { ads: '广告', nav: '导航', footer: '页脚', sidebar: '侧边栏', popup: '弹窗' };
  setStatus('已删除\${total} 个\${names[type] || type}元素', 'success');
}

// 删除自定义元素
async function deleteCustomElements() {
  const selector = $('deleteSelector')?.value?.trim();
  if (!selector) {
    setStatus('请输入要删除的选择器', 'warning');
    return;
  }

  try {
    const count = await executeInWebView(
      (function() {
        const els = document.querySelectorAll('\${escapeSelector(selector)}');
        els.forEach(el => el.remove());
        return els.length;
      })()
    );
    setStatus('已删除\${count || 0} 个元素', 'success');
  } catch (error) {
    setStatus('删除失败: ' + error.message, 'error');
  }
}

// 注入脚本
async function injectScript() {
  const code = $('injectCode')?.value?.trim();
  if (!code) {
    setStatus('请输入脚本代码', 'warning');
    return;
  }

  const type = document.querySelector('input[name="scriptType"]:checked')?.value || 'js';

  try {
    let script;
    if (type === 'css') {
      script = 'const style=document.createElement(\'style\');style.textContent=\${JSON.stringify(code)};document.head.appendChild(style);\'CSS注入成功\'';
    } else {
      script = code;
    }

    await executeInWebView(script);
    setStatus('脚本执行成功', 'success');
  } catch (error) {
    setStatus('执行失败: ' + error.message, 'error');
  }
}

// 导出数据
function exportData() {
  if (!extractedData || extractedData.length === 0) {
    setStatus('没有可导出的数据', 'warning');
    return;
  }

  const data = {
    url: $('webview')?.src || '',
    timestamp: new Date().toISOString(),
    selector: $('extractSelector')?.value || '',
    count: extractedData.length,
    data: extractedData
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '\`scraper_\${Date.now()}.json\`';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  setStatus('数据已导出', 'success');
}

// 显示元素信息面板
function showElementInfo(data) {
  console.log('显示元素信息:', data);
  const panel = $('elementInfoPanel');
  if (!panel) {
    console.error('找不到元素信息面板');
    return;
  }

  panel.classList.remove('hidden');

  const tagEl = $('selectedTag');
  const idEl = $('selectedId');
  const classEl = $('selectedClass');
  const xpathEl = $('selectedXPath');
  const selectorEl = $('selectedSelector');
  const srcEl = $('selectedSrc');
  const imageInfo = $('imageInfo');

  if (tagEl) tagEl.textContent = data.tag || '-';
  if (idEl) idEl.textContent = data.id || '(无)';
  if (classEl) classEl.textContent = data.class || '(无)';
  if (xpathEl) xpathEl.textContent = data.xpath || '-';
  if (selectorEl) selectorEl.textContent = data.selector || '-';

  if (data.isImage && srcEl) {
    srcEl.textContent = data.src || '(无)';
    if (imageInfo) imageInfo.classList.remove('hidden');
  } else {
    if (imageInfo) imageInfo.classList.add('hidden');
  }
}

// 隐藏元素信息面板
function hideElementInfo() {
  const panel = $('elementInfoPanel');
  if (panel) panel.classList.add('hidden');
}

// 检查选中的元素（轮询方式）
async function checkSelectedElement() {
  if (!selectMode) return;

  try {
    // 使用 Promise 包装，设置超时
    const info = await Promise.race([
      executeInWebView(
        (function() {
          try {
            const el = window._scraperSelectedElement;
            if (el) {
              window._scraperSelectedElement = null;
              return JSON.stringify(el);
            }
            return null;
          } catch(e) {
            return null;
          }
        })()
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    if (info && info !== 'null') {
      console.log('检测到选中元素:', info);
      try {
        const data = JSON.parse(info);
        showElementInfo(data);
      } catch(e) {
        console.error('解析元素信息失败:', e);
      }
    }
  } catch (e) {
    // 忽略超时错误
    if (e.message !== 'timeout') {
      console.error('检查选中元素失败:', e);
    }
  }
}

// 切换选择模式
async function toggleSelectMode(target = 'extract') {
  const btn = $('selectModeBtn');
  const overlay = $('selectorOverlay');

  if (!btn || !overlay) {
    console.error('找不到选择模式按钮或遮罩');
    return;
  }

  // 如果已经在选择模式，则关闭
  if (selectMode) {
    console.log('关闭选择模式');
    selectMode = false;
    selectTarget = null;
    btn.classList.remove('active');
    overlay.classList.add('hidden');
    hideElementInfo();
    setStatus('就绪', 'info');

    // 停止轮询
    if (selectCheckInterval) {
      clearInterval(selectCheckInterval);
      selectCheckInterval = null;
    }

    try {
      await executeInWebView(
        (function() {
          if (window._scraperCleanup) {
            try {
              window._scraperCleanup();
            } catch(e) {}
            window._scraperCleanup = null;
          }
          window._scraperSelectMode = false;
          window._scraperSelectedElement = null;
        })()
      );
    } catch (e) {
      console.error('清理选择模式失败:', e);
    }
    return;
  }

  // 开启选择模式
  console.log('开启选择模式');
  selectMode = true;
  selectTarget = target;
  btn.classList.add('active');
  overlay.classList.remove('hidden');
  setStatus('选择模式：点击元素查看详细信息', 'info');

  try {
    // 注入选择脚本 - 简化版
    await executeInWebView(
      (function() {
        // 清理之前的事务
        if (window._scraperCleanup) {
          try {
            window._scraperCleanup();
          } catch(e) {}
        }

        window._scraperSelectMode = true;
        window._scraperSelectedElement = null;

        let selectedEl = null;

        function highlight(el) {
          if (!el || el === document.body || el === document.documentElement) return;
          el.style.cssText += '; outline: 2px solid #2f81f7 !important; outline-offset: 2px !important; background-color: rgba(47, 129, 247, 0.2) !important;';
        }

        function unhighlight(el) {
          if (!el) return;
          el.style.cssText = el.style.cssText.replace(/outline: 2px solid #2f81f7 !important; outline-offset: 2px !important; background-color: rgba\(47, 129, 247, 0\.2\) !important;/g, '');
        }

        function getXPath(element) {
          if (element.id) return '//*[@id="' + element.id + '"]';
          var parts = [];
          var current = element;
          while (current && current.nodeType === 1) {
            var i = 1;
            var sib = current.previousSibling;
            while (sib) {
              if (sib.nodeType === 1 && sib.tagName === current.tagName) i++;
              sib = sib.previousSibling;
            }
            var tag = current.tagName.toLowerCase();
            parts.unshift(i > 1 ? tag + '[' + i + ']' : tag);
            current = current.parentNode;
          }
          return '/' + parts.join('/');
        }

        function getSelector(element) {
          if (element.id) return '#' + element.id;
          var classes = element.className ? element.className.split(' ').filter(function(c) { return c.trim() && !/^\\d+$/.test(c); }) : [];
          if (classes.length > 0) return '.' + classes.join('.');
          var path = [];
          var current = element;
          while (current && current !== document.body) {
            var sel = current.tagName.toLowerCase();
            if (current.id) {
              path.unshift('#' + current.id);
              break;
            }
            var siblings = [];
            var parent = current.parentNode;
            if (parent) siblings = Array.from(parent.children);
            var idx = siblings.indexOf(current) + 1;
            sel += ':nth-child(' + idx + ')';
            path.unshift(sel);
            current = current.parentNode;
          }
          return path.join(' > ');
        }

        window._scraperClickHandler = function(e) {
          if (!window._scraperSelectMode) return;

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          if (selectedEl) unhighlight(selectedEl);

          selectedEl = e.target;
          highlight(selectedEl);

          var el = e.target;
          window._scraperSelectedElement = {
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            class: el.className || '',
            xpath: getXPath(el),
            selector: getSelector(el),
            isImage: el.tagName.toLowerCase() === 'img',
            src: el.src || el.getAttribute('src') || ''
          };

          console.log('元素已选择:', window._scraperSelectedElement);
        };

        window._scraperCleanup = function() {
          document.removeEventListener('click', window._scraperClickHandler, true);
          if (selectedEl) unhighlight(selectedEl);
        };

        // 使用 capture 阶段监听点击事件
        document.addEventListener('click', window._scraperClickHandler, true);

        console.log('选择脚本已注入，点击元素即可选择');
      })()
    \`);

    console.log('选择脚本注入完成');

    // 启动轮询检查选中的元素
    selectCheckInterval = setInterval(checkSelectedElement, 300);
    console.log('轮询已启动');

  } catch (e) {
    console.error('注入选择脚本失败:', e);
    setStatus('选择模式启动失败: ' + e.message, 'error');
    selectMode = false;
    btn.classList.remove('active');
    overlay.classList.add('hidden');
  }
}

// 使用选中的选择器
function useSelectedSelector() {
  const selector = $('selectedSelector')?.textContent;
  if (!selector || selector === '-') return;

  if (selectTarget === 'extract') {
    const input = $('extractSelector');
    if (input) input.value = selector;
  } else if (selectTarget === 'delete') {
    const input = $('deleteSelector');
    if (input) input.value = selector;
  }

  toggleSelectMode();
}

// 复制到剪贴板
function copyToClipboard(text) {
  if (!text || text === '-') return;
  navigator.clipboard.writeText(text).then(() => {
    setStatus('已复制到剪贴板', 'success');
  }).catch(() => {
    setStatus('复制失败', 'error');
  });
}

// 绑定事件
document.addEventListener('DOMContentLoaded', function() {
  console.log('🕷️Web Scraper Pro 初始化中...');

  bindTabEvents();
  bindLoadEvents();
  bindRefreshEvents();
  bindExtractEvents();
  bindCleanupEvents();
  bindDeleteEvents();
  bindInjectEvents();
  bindViewSourceEvents();
  bindCopySourceEvents();
  bindDevToolsEvents();
  bindExportEvents();
  bindSelectModeEvents();
  bindElementInfoEvents();
  bindQuickTagEvents();
  bindPresetScriptEvents();
  bindExtractTypeEvents();
  bindWebViewEvents();
  bindMessageEvents();

  setStatus('就绪', 'info');
  console.log('✅ 初始化完成');
});

// Tab 切换事件绑定
function bindTabEvents() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

// 加载相关事件绑定
function bindLoadEvents() {
  const loadBtn = $('loadBtn');
  const urlInput = $('urlInput');

  if (loadBtn) {
    loadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      loadUrl();
    });
  }

  if (urlInput) {
    urlInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        loadUrl();
      }
    });
  }
}

// 刷新事件绑定
function bindRefreshEvents() {
  const refreshBtn = $('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshPage);
  }
}

// 提取事件绑定
function bindExtractEvents() {
  const extractBtn = $('extractBtn');
  if (extractBtn) {
    extractBtn.addEventListener('click', extractContent);
  }
}

// 清理事件绑定
function bindCleanupEvents() {
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => cleanupElements(card.dataset.action));
  });
}

// 删除事件绑定
function bindDeleteEvents() {
  const deleteBtn = $('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteCustomElements);
  }
}

// 注入事件绑定
function bindInjectEvents() {
  const injectBtn = $('injectBtn');
  if (injectBtn) {
    injectBtn.addEventListener('click', injectScript);
  }
}

// 查看源码事件绑定
function bindViewSourceEvents() {
  const viewSourceBtn = $('viewSourceBtn');
  if (viewSourceBtn) {
    viewSourceBtn.addEventListener('click', viewSource);
  }
}

// 复制源码事件绑定
function bindCopySourceEvents() {
  const copySourceBtn = $('copySourceBtn');
  if (copySourceBtn) {
    copySourceBtn.addEventListener('click', copySource);
  }
}

// 开发者工具事件绑定
function bindDevToolsEvents() {
  const openDevToolsBtn = $('openDevToolsBtn');
  if (openDevToolsBtn) {
    openDevToolsBtn.addEventListener('click', openDevTools);
  }
}

// 导出事件绑定
function bindExportEvents() {
  const exportBtn = $('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
}

// 选择模式事件绑定
function bindSelectModeEvents() {
  const selectModeBtn = $('selectModeBtn');
  if (selectModeBtn) {
    selectModeBtn.addEventListener('click', function() {
      console.log('选择模式按钮被点击');
      toggleSelectMode('extract');
    });
  }

  const cancelSelectBtn = $('cancelSelectBtn');
  if (cancelSelectBtn) {
    cancelSelectBtn.addEventListener('click', function() {
      toggleSelectMode();
    });
  }
}

// 元素信息事件绑定
function bindElementInfoEvents() {
  const closeInfoBtn = $('closeInfoBtn');
  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', hideElementInfo);
  }

  const useSelectorBtn = $('useSelectorBtn');
  if (useSelectorBtn) {
    useSelectorBtn.addEventListener('click', useSelectedSelector);
  }

  const copyXPathBtn = $('copyXPathBtn');
  if (copyXPathBtn) {
    copyXPathBtn.addEventListener('click', function() {
      const text = $('selectedXPath')?.textContent;
      copyToClipboard(text);
    });
  }

  const copySelectorBtn = $('copySelectorBtn');
  if (copySelectorBtn) {
    copySelectorBtn.addEventListener('click', function() {
      const text = $('selectedSelector')?.textContent;
      copyToClipboard(text);
    });
  }

  const copySrcBtn = $('copySrcBtn');
  if (copySrcBtn) {
    copySrcBtn.addEventListener('click', function() {
      const text = $('selectedSrc')?.textContent;
      copyToClipboard(text);
    });
  }
}

// 快速标签事件绑定
function bindQuickTagEvents() {
  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const input = $('extractSelector');
      if (input) input.value = this.dataset.selector;
    });
  });
}

// 预设脚本事件绑定
function bindPresetScriptEvents() {
  const scripts = {
    darkmode: 'document.documentElement.style.filter="invert(1) hue-rotate(180deg)";',
    noads: '[...document.querySelectorAll(".ad,.ads,[class*=\\"ad-\\"]")].forEach(el=>el.style.display="none");',
    readable: 'document.body.style.maxWidth="800px";document.body.style.margin="0 auto";document.body.style.fontSize="18px";'
  };

  document.querySelectorAll('.preset-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const input = $('injectCode');
      if (input) input.value = scripts[this.dataset.script] || '';
    });
  });
}

// 提取类型切换事件绑定
function bindExtractTypeEvents() {
  document.querySelectorAll('input[name="extractType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const attrInput = $('attrName');
      if (attrInput) attrInput.classList.toggle('hidden', this.value !== 'attr');
    });
  });
}

// WebView 事件绑定
function bindWebViewEvents() {
  const webview = $('webview');
  if (webview) {
    webview.addEventListener('did-stop-loading', function() {
      showLoading(false);
      setStatus('页面加载完成', 'success');

      const currentUrl = webview.getURL && webview.getURL() ? webview.getURL() : webview.src;
      const pageTitle = $('pageTitle');
      const pageUrl = $('pageUrl');
      if (pageTitle) pageTitle.textContent = webview.getTitle ? (webview.getTitle() || '已加载页面') : '已加载页面';
      if (pageUrl) pageUrl.textContent = currentUrl || '';
      setCurrentPageInfo(currentUrl || '未知页面');
    });

    webview.addEventListener('did-fail-load', function() {
      showLoading(false);
      setStatus('页面加载失败', 'error');
      setCurrentPageInfo('加载失败');
    });

    // 页面导航事件（包括点击链接切换页面）
    webview.addEventListener('did-navigate', function(event) {
      if (event && event.url) {
        setCurrentPageInfo(event.url);
      }
    });

    webview.addEventListener('did-navigate-in-page', function(event) {
      if (event && event.url) {
        setCurrentPageInfo(event.url);
      }
    });

    // 阻止新窗口打开，强制在当前webview中加载
    webview.addEventListener('new-window', function(event) {
      event.preventDefault();
      console.log('拦截新窗口请求，加载URL:', event.url);
      // 直接在当前webview中加载新URL
      showLoading(true);
      setStatus('正在跳转...', 'info');
      setCurrentPageInfo('正在跳转: ' + event.url);
      webview.src = event.url;
    });

    webview.addEventListener('dom-ready', function() {
      // 注入脚本，拦截链接点击，移除 target="_blank" 等，并添加右键菜单
      try {
        const script = \`
          // 拦截所有链接点击
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
              e.preventDefault();
              // 如果是外部链接或有 target，强制在当前页面打开
              if (link.target && link.target !== '_self') {
                link.target = '_self';
              }
              // 手动导航
              window.location.href = link.href;
            }
          }, true);

          // 移除所有链接的 target 属性
          document.querySelectorAll('a[target]').forEach(a => {
            a.removeAttribute('target');
          });

          // 添加右键上下文菜单功能
          (function() {
            // 创建上下文菜单
            const contextMenu = document.createElement('div');
            contextMenu.id = 'scraper-context-menu';
            contextMenu.style.cssText = "position: fixed; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); padding: 4px 0; z-index: 10000; display: none; font-family: Arial, sans-serif; font-size: 12px; min-width: 150px;";
            contextMenu.innerHTML = '<div class="menu-item" data-action="get-css-path" style="padding: 6px 12px; cursor: pointer;">📋 获取CSS路径</div><div class="menu-item" data-action="get-js-info" style="padding: 6px 12px; cursor: pointer;">🔍 获取JS信息</div>';
            document.body.appendChild(contextMenu);

            // 当前右键元素
            let currentElement = null;

            // 获取CSS选择器路径
            function getCSSPath(element) {
              if (element.id) return '#' + element.id;
              if (element.className) {
                const classes = element.className.trim().split(/\\\\s+/).filter(c => c);
                if (classes.length > 0) return element.tagName.toLowerCase() + '.' + classes.join('.');
              }
              let path = [];
              let current = element;
              while (current && current.nodeType === 1 && current !== document.body) {
                let selector = current.tagName.toLowerCase();
                if (current.id) {
                  path.unshift('#' + current.id);
                  break;
                }
                if (current.className) {
                  const classes = current.className.trim().split(/\\\\s+/).filter(c => c);
                  if (classes.length > 0) {
                    selector += '.' + classes[0];
                  }
                }
                const siblings = Array.from(current.parentNode.children);
                const index = siblings.indexOf(current) + 1;
                if (siblings.length > 1) {
                  selector += ':nth-child(' + index + ')';
                }
                path.unshift(selector);
                current = current.parentNode;
              }
              return path.join(' > ');
            }

            // 获取JS信息
            function getJSInfo(element) {
              const info = {
                tag: element.tagName.toLowerCase(),
                events: [],
                attributes: {}
              };

              // 获取事件监听器（如果可能）
              try {
                const events = window.getEventListeners ? window.getEventListeners(element) : {};
                info.events = Object.keys(events);
              } catch(e) {
                info.events = ['无法获取事件信息'];
              }

              // 获取相关属性
              ['onclick', 'onload', 'onchange', 'onsubmit'].forEach(attr => {
                if (element[attr]) {
                  info.attributes[attr] = element[attr].toString().substring(0, 50) + '...';
                }
              });

              return info;
            }

            // 菜单项悬停效果
            contextMenu.addEventListener('mouseover', function(e) {
              if (e.target.classList.contains('menu-item')) {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            });

            contextMenu.addEventListener('mouseout', function(e) {
              if (e.target.classList.contains('menu-item')) {
                e.target.style.backgroundColor = '';
              }
            });

            // 右键菜单事件
            contextMenu.addEventListener('click', function(e) {
              const action = e.target.dataset.action;
              if (!currentElement) return;

              if (action === 'get-css-path') {
                const cssPath = getCSSPath(currentElement);
                // 发送到主进程
                window.postMessage({
                  type: 'scraper-context-menu',
                  action: 'css-path',
                  data: cssPath,
                  elementInfo: {
                    tag: currentElement.tagName.toLowerCase(),
                    id: currentElement.id || '',
                    class: currentElement.className || ''
                  }
                }, '*');
              } else if (action === 'get-js-info') {
                const jsInfo = getJSInfo(currentElement);
                window.postMessage({
                  type: 'scraper-context-menu',
                  action: 'js-info',
                  data: jsInfo
                }, '*');
              }

              contextMenu.style.display = 'none';
            });

            // 右键事件
            document.addEventListener('contextmenu', function(e) {
              currentElement = e.target;
              contextMenu.style.left = e.pageX + 'px';
              contextMenu.style.top = e.pageY + 'px';
              contextMenu.style.display = 'block';
              e.preventDefault();
            });

            // 点击其他地方隐藏菜单
            document.addEventListener('click', function() {
              contextMenu.style.display = 'none';
            });
          })();
        \`;
        webview.executeJavaScript(script);
        console.log('链接拦截和右键菜单脚本已注入');
      } catch (e) {
        console.warn('注入脚本失败:', e);
      }
    });
  }
}

// 消息事件绑定
function bindMessageEvents() {
  // 监听来自webview的消息
  window.addEventListener('message', function(event) {
    // 处理右键菜单消息
    if (event.data && event.data.type === 'scraper-context-menu') {
      handleContextMenuAction(event.data);
    }
  });
}