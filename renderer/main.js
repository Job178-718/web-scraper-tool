// main.js - 应用程序主入口
document.addEventListener('DOMContentLoaded', function() {
  console.log('Web Scraper Pro 启动中...');

  // 等待所有模块加载完成
  const requiredModules = [
    'Utils', 'Config', 'State', 'WebViewExecutor',
    'UrlLoader', 'TabManager', 'ElementSelector',
    'ContentExtractor', 'ElementCleaner', 'ScriptInjector',
    'DataExporter', 'SourceViewer', 'ContextMenu', 'EventBindings','DownloadManager'
  ];

  function checkModulesLoaded() {
    const missing = requiredModules.filter(module => !window[module]);
    if (missing.length > 0) {
      console.log('等待模块加载:', missing.join(', '));
      setTimeout(checkModulesLoaded, 100);
      return;
    }

    // 所有模块已加载，开始初始化
    initializeApp();
  }

  function initializeApp() {
    console.log('所有模块已加载，开始初始化应用...');

    try {
      // 绑定所有事件
      window.EventBindings.bindEvents();

      // 设置初始状态
      window.Utils.setStatus('就绪', 'info');
      window.Utils.setCurrentPageInfo('未加载');

      // 初始化WebView
      const webview = document.querySelector('webview');
      if (webview) {
        webview.addEventListener('dom-ready', () => {
          console.log('WebView DOM 准备就绪');
          window.Utils.setStatus('WebView 准备就绪', 'success');
          // 设置WebView准备标志
          window._webviewReady = true;

          // 注入链接点击拦截脚本
          try {
            webview.executeJavaScript(`
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

              console.log('链接点击拦截脚本已注入');
            `);
          } catch (error) {
            console.error('注入链接拦截脚本失败:', error);
          }
        });

        webview.addEventListener('did-start-loading', () => {
          window.Utils.showLoading(true);
          window.Utils.setStatus('页面加载中...', 'info');
        });

        webview.addEventListener('did-stop-loading', () => {
          window.Utils.showLoading(false);
          window.Utils.setStatus('页面加载完成', 'success');
        });

        webview.addEventListener('did-fail-load', (event) => {
          window.Utils.showLoading(false);
          window.Utils.setStatus('页面加载失败: ' + event.errorDescription, 'error');
        });

        webview.addEventListener('page-title-updated', (event) => {
          const titleEl = window.Utils.$('pageTitle');
          if (titleEl) titleEl.textContent = event.title || '无标题';
        });

        webview.addEventListener('load-commit', (event) => {
          const urlEl = window.Utils.$('pageUrl');
          if (urlEl) urlEl.textContent = event.url || '';
          window.Utils.setCurrentPageInfo(event.url || '未知');
        });

        webview.addEventListener('did-navigate', (event) => {
          console.log('导航到:', event.url);
          const urlEl = window.Utils.$('pageUrl');
          if (urlEl) urlEl.textContent = event.url || '';
          window.Utils.setCurrentPageInfo(event.url || '未知');
        });

        webview.addEventListener('did-navigate-in-page', (event) => {
          console.log('页面内导航到:', event.url);
          const urlEl = window.Utils.$('pageUrl');
          if (urlEl) urlEl.textContent = event.url || '';
          window.Utils.setCurrentPageInfo(event.url || '未知');
        });

        webview.addEventListener('new-window', (event) => {
          // 在新窗口中打开链接
          event.preventDefault();
          if (event.url) {
            window.open(event.url);
          }
        });
      }

      // 初始化快速选择器
      initializeQuickSelectors();

      // 初始化清理预设
      initializeCleanupPresets();

      // 初始化脚本预设
      initializeScriptPresets();

      console.log('Web Scraper Pro 初始化完成！');

    } catch (error) {
      console.error('应用初始化失败:', error);
      window.Utils.setStatus('初始化失败: ' + error.message, 'error');
    }
  }

  function initializeQuickSelectors() {
    const quickTags = document.querySelectorAll('.quick-tag');
    quickTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const selector = tag.dataset.selector;
        const input = window.Utils.$('extractSelector');
        if (input) {
          input.value = selector;
          input.focus();
        }
      });
    });
  }

  function initializeCleanupPresets() {
    const presetCards = document.querySelectorAll('.preset-card');
    presetCards.forEach(card => {
      card.addEventListener('click', () => {
        const action = card.dataset.action;
        if (action && window.Config.CLEANUP_SELECTORS[action]) {
          window.ElementCleaner.cleanupElements(action);
        }
      });
    });
  }

  function initializeScriptPresets() {
    const presetTags = document.querySelectorAll('.preset-tag');
    presetTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const script = tag.dataset.script;
        let code = '';

        switch (script) {
          case 'darkmode':
            code = `document.body.style.cssText += '; filter: invert(1) hue-rotate(180deg) !important; background-color: #000 !important;';
document.querySelectorAll('img, video').forEach(el => el.style.filter = 'invert(1) hue-rotate(180deg)');`;
            break;
          case 'noads':
            code = `document.querySelectorAll('.ad, .ads, .advertisement, [class*="ad-"], [id*="ad-"]').forEach(el => el.style.display = 'none');`;
            break;
          case 'readable':
            code = `document.body.style.cssText += '; font-family: "Georgia", serif !important; font-size: 18px !important; line-height: 1.6 !important; max-width: 800px !important; margin: 0 auto !important;';
document.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(el => el.style.color = '#333 !important');`;
            break;
        }

        if (code) {
          const textarea = window.Utils.$('injectCode');
          if (textarea) {
            textarea.value = code;
            textarea.focus();
          }
        }
      });
    });
  }

  // 开始检查模块加载状态
  checkModulesLoaded();
});