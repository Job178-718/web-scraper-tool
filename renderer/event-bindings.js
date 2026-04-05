// event-bindings.js - 事件绑定
function bindEvents() {
  console.log('开始绑定事件...');

  // URL加载事件
  const urlInput = window.Utils.$('urlInput');
  const loadBtn = window.Utils.$('loadBtn');
  const refreshBtn = window.Utils.$('refreshBtn');
  const backBtn = window.Utils.$('backBtn');

  if (urlInput && loadBtn) {
    loadBtn.addEventListener('click', () => window.UrlLoader.loadUrl());
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') window.UrlLoader.loadUrl();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => window.UrlLoader.refreshPage());
  }

  // 标签页切换事件
  const tabButtons = document.querySelectorAll('.tab');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      window.TabManager.switchTab(tabId);
       // 模拟测试数据 - 基于 README.md 中的结构
      const mockData = [
        {
    "index": 16,
    "tagName": "img",
    "alt": "图片[16]-XIUREN秀人网 2026.02.04 NO.11319 杨晨晨 [73P 923.78 MB]-六色网",
    "src": "https://wkphoto.cdn.bcebos.com/63d0f703918fa0ec6c29ea55369759ee3c6ddbf8.jpg",
    "imgboxIndex": "15"
  },
  {
    "index": 17,
    "tagName": "img",
    "alt": "图片[17]-XIUREN秀人网 2026.02.04 NO.11319 杨晨晨 [73P 923.78 MB]-六色网",
    "src": "https://wkphoto.cdn.bcebos.com/94cad1c8a786c9178fb3dc61d93d70cf3bc75732.jpg",
    "imgboxIndex": "16"
  },
  {
    "index": 18,
    "tagName": "img",
    "alt": "图片[18]-XIUREN秀人网 2026.02.04 NO.11319 杨晨晨 [73P 923.78 MB]-六色网",
    "src": "https://wkphoto.cdn.bcebos.com/6609c93d70cf3bc76acb43b4c100baa1cc112a9b.jpg",
    "imgboxIndex": "17"
  },
  {
    "index": 19,
    "tagName": "img",
    "alt": "图片[19]-XIUREN秀人网 2026.02.04 NO.11319 杨晨晨 [73P 923.78 MB]-六色网",
    "src": "https://wkphoto.cdn.bcebos.com/9a504fc2d56285355ec75b7980ef76c6a7ef6347.jpg",
    "imgboxIndex": "18"
  },
  {
    "index": 20,
    "tagName": "img",
    "alt": "图片[20]-XIUREN秀人网 2026.02.04 NO.11319 杨晨晨 [73P 923.78 MB]-六色网",
    "src": "https://wkphoto.cdn.bcebos.com/42a98226cffc1e17bc5e02695a90f603728de981.jpg",
    "imgboxIndex": "19"
  },
  {
    "index": 21,
    "tagName": "img",
    "alt": "图片[21]-XIUREN秀人网 2026.02.04 NO.11319 杨晨晨 [73P 923.78 MB]-六色网",
    "src": "https://wkphoto.cdn.bcebos.com/63d0f703918fa0ec6c75ea55369759ee3d6ddb3c.jpg",
    "imgboxIndex": "20"
  }];
      // window.ContentExtractor.showDownloadGroup(mockData); // 切换标签时隐藏下载条目
    });
  });

  // 选择模式事件
  const selectModeBtn = window.Utils.$('selectModeBtn');
  if (selectModeBtn) {
    selectModeBtn.addEventListener('click', () => window.ElementSelector.toggleSelectMode());

    // 添加右键菜单
    selectModeBtn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showSelectModeContextMenu(e);
    });
  }

  // 使用选中选择器事件
  const useSelectorBtn = window.Utils.$('useSelectorBtn');
  if (useSelectorBtn) {
    useSelectorBtn.addEventListener('click', () => window.ElementSelector.useSelectedSelector());
  }

  // 选择器选择按钮事件
  const pickSelectorBtn = window.Utils.$('pickSelectorBtn');
  if (pickSelectorBtn) {
    pickSelectorBtn.addEventListener('click', () => {
      window.State.setSelectTarget('extract');
      window.ElementSelector.toggleSelectMode('extract');
    });
  }

  // 删除选择器选择按钮事件
  const pickDeleteBtn = window.Utils.$('pickDeleteBtn');
  if (pickDeleteBtn) {
    pickDeleteBtn.addEventListener('click', () => {
      window.State.setSelectTarget('delete');
      window.ElementSelector.toggleSelectMode('delete');
    });
  }

  // 内容提取事件 - 功能已禁用
  const extractBtn = window.Utils.$('extractBtn');
  const extractSelector = window.Utils.$('extractSelector');
  const extractType = document.querySelector('input[name="extractType"]:checked');
  const attrNameInput = window.Utils.$('attrName');

  // 提取类型切换事件 - 已禁用
  const extractTypeRadios = document.querySelectorAll('input[name="extractType"]');
  extractTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      // 功能已禁用，什么都不做
      window.Utils.setStatus('内容提取功能已被禁用', 'warning');
    });
  });

  if (extractBtn) {
    extractBtn.addEventListener('click', () => {
      // 功能已禁用
      window.Utils.setStatus('内容提取功能已被禁用', 'warning');
    });
  }

  // 如果存在选择器输入框，为其添加禁用提示
  if (extractSelector) {
    extractSelector.addEventListener('focus', () => {
      window.Utils.setStatus('内容提取功能已被禁用', 'warning');
    });
  }

  // 元素清理事件
  const deleteBtn = window.Utils.$('deleteBtn');
  const deleteSelector = window.Utils.$('deleteSelector');
  const smartCleanupBtn = window.Utils.$('smartCleanupBtn');
  const batchCleanupBtn = window.Utils.$('batchCleanupBtn');
  const undoCleanupBtn = window.Utils.$('undoCleanupBtn');

  // 清理预设卡片事件
  const cleanupPresetCards = document.querySelectorAll('.preset-card[data-action]');
  cleanupPresetCards.forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      if (action && window.Config.CLEANUP_SELECTORS[action]) {
        window.ElementCleaner.cleanupElements(action);
      }
    });
  });

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const selector = deleteSelector?.value?.trim();
      if (selector) {
        window.ElementCleaner.deleteCustomElements(selector);
      } else {
        window.Utils.setStatus('请输入要删除的选择器', 'error');
      }
    });
  }

  // 智能清理按钮事件
  if (smartCleanupBtn) {
    smartCleanupBtn.addEventListener('click', () => {
      window.ElementCleaner.smartCleanup();
    });
  }

  // 批量清理按钮事件
  if (batchCleanupBtn) {
    batchCleanupBtn.addEventListener('click', () => {
      // 默认清理广告、弹窗和Cookie提示
      window.ElementCleaner.batchCleanup(['ads', 'popup', 'cookie']);
    });
  }

  // 撤销清理按钮事件
  if (undoCleanupBtn) {
    undoCleanupBtn.addEventListener('click', () => {
      window.ElementCleaner.undoLastCleanup();
    });
  }

  // 脚本注入事件
  const injectBtn = window.Utils.$('injectBtn');
  const injectCode = window.Utils.$('injectCode');

  if (injectBtn) {
    injectBtn.addEventListener('click', () => {
      const code = injectCode?.value?.trim();
      if (code) {
        window.ScriptInjector.injectScript(code);
      } else {
        window.Utils.setStatus('请输入要注入的代码', 'error');
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => window.UrlLoader.goBack());
  }

  // 添加保存路径相关元素（由 DownloadManager 或 ContentExtractor 绑定 browse 按钮）
  // 不在这里直接绑定 browsePathBtn，以免重复注册多个监听器。

  // 数据导出事件
  const exportBtn = window.Utils.$('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => window.DataExporter.exportData());
  }

  // 源码查看事件
  const viewSourceBtn = window.Utils.$('viewSourceBtn');
  const copySourceBtn = window.Utils.$('copySourceBtn');

  if (viewSourceBtn) {
    viewSourceBtn.addEventListener('click', () => window.SourceViewer.viewSource());
  }

  if (copySourceBtn) {
    copySourceBtn.addEventListener('click', () => window.SourceViewer.copySource());
  }

  // 开发者工具事件
  const openDevToolsBtn = window.Utils.$('openDevToolsBtn');
  if (openDevToolsBtn) {
    openDevToolsBtn.addEventListener('click', () => window.ContextMenu.openDevTools());
  }

  // 取消选择事件
  const cancelSelectBtn = window.Utils.$('cancelSelectBtn');
  if (cancelSelectBtn) {
    cancelSelectBtn.addEventListener('click', () => window.ElementSelector.toggleSelectMode());
  }

  // 关闭信息面板事件
  const closeInfoBtn = window.Utils.$('closeInfoBtn');
  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', () => window.ElementSelector.hideElementInfo());
  }

  // 复制按钮事件
  const copyXPathBtn = window.Utils.$('copyXPathBtn');
  const copySelectorBtn = window.Utils.$('copySelectorBtn');
  const copySrcBtn = window.Utils.$('copySrcBtn');

  if (copyXPathBtn) {
    copyXPathBtn.addEventListener('click', () => {
      const xpath = window.Utils.$('selectedXPath')?.textContent;
      console.log('复制XPath:', xpath);
      if (xpath && xpath !== '-') {
        window.Utils.copyToClipboard(xpath);
        window.Utils.setStatus('XPath 已复制到剪贴板', 'success');
      } else {
        window.Utils.setStatus('没有可复制的XPath', 'warning');
      }
    });
  }

  if (copySelectorBtn) {
    copySelectorBtn.addEventListener('click', () => {
      const selector = window.Utils.$('selectedSelector')?.textContent;
      console.log('复制CSS选择器:', selector);
      if (selector && selector !== '-') {
        window.Utils.copyToClipboard(selector);
        window.Utils.setStatus('CSS 选择器已复制到剪贴板', 'success');
      } else {
        window.Utils.setStatus('没有可复制的CSS选择器', 'warning');
      }
    });
  }

  if (copySrcBtn) {
    copySrcBtn.addEventListener('click', () => {
      const src = window.Utils.$('selectedSrc')?.textContent;
      console.log('复制图片地址:', src);
      if (src && src !== '(无)') {
        window.Utils.copyToClipboard(src);
        window.Utils.setStatus('图片地址已复制到剪贴板', 'success');
      } else {
        window.Utils.setStatus('没有可复制的图片地址', 'warning');
      }
    });
  }

  // 右键菜单事件
 const webview = document.querySelector('webview');
  if (webview) {
    webview.addEventListener('context-menu', (e) => {
      e.preventDefault();
      // Deleted:window.ContextMenu.handleContextMenu(e);
      // 为webview右键菜单创建一个默认处理器或使用现有的上下文菜单系统
      showWebViewContextMenu(e);
    });
  }

  // ... existing code ...

// 显示选择模式按钮的右键菜单
function showSelectModeContextMenu(e) {
  // 移除现有的右键菜单
  const existingMenu = document.querySelector('.select-mode-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建右键菜单
  const menu = document.createElement('div');
  menu.className = 'select-mode-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    min-width: 150px;
    font-size: 12px;
  `;

  // 复制JS路径选项
  const copyJSPathItem = document.createElement('div');
  copyJSPathItem.textContent = '复制 JS 路径';
  copyJSPathItem.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    color: #e2e8f0;
    border-bottom: 1px solid #4a5568;
  `;
  copyJSPathItem.addEventListener('mouseenter', () => {
    copyJSPathItem.style.backgroundColor = '#4a5568';
  });
  copyJSPathItem.addEventListener('mouseleave', () => {
    copyJSPathItem.style.backgroundColor = 'transparent';
  });
  copyJSPathItem.addEventListener('click', () => {
    copyJSPath();
    menu.remove();
  });

  menu.appendChild(copyJSPathItem);
  document.body.appendChild(menu);

  // 点击其他地方关闭菜单
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 10);
}

// 显示webview右键菜单
function showWebViewContextMenu(e) {
  // 移除现有的右键菜单
  const existingMenu = document.querySelector('.webview-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建右键菜单
  const menu = document.createElement('div');
  menu.className = 'webview-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    min-width: 180px;
    font-size: 12px;
  `;

  // 获取点击元素的信息
  const menuItems = [
    { text: '复制 CSS 选择器', action: 'copy-css-selector' },
    { text: '复制 XPath', action: 'copy-xpath' },
    { text: '复制 JS 路径', action: 'copy-js-path' },
    { text: '查看元素信息', action: 'show-element-info' },
    { text: '在提取器中使用', action: 'use-in-extractor' }
  ];

  menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.textContent = item.text;
    menuItem.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      color: #e2e8f0;
      border-bottom: 1px solid #4a5568;
    `;
    
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.backgroundColor = '#4a5568';
    });
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.backgroundColor = 'transparent';
    });
    menuItem.addEventListener('click', async () => {
      try {
        // 从webview获取元素信息
        const elementInfo = await window.WebViewExecutor.executeInWebView(`
          (function() {
            const el = document.elementFromPoint(${e.offsetX}, ${e.offsetY});
            if (el) {
              // 获取CSS选择器
              let cssSelector = '';
              if (el.id) {
                cssSelector = '#' + el.id;
              } else if (el.className) {
                cssSelector = '.' + el.className.trim().split(' ').join('.');
              } else {
                cssSelector = el.tagName.toLowerCase();
              }
              
              // 获取XPath
              let xpath = '';
              if (el.id) {
                xpath = '//*[@id="' + el.id + '"]';
              } else {
                xpath = '';
                for (let parent = el, i = 0; parent && parent.nodeName.toLowerCase() !== 'html'; parent = parent.parentElement, i++) {
                  let sibling = 0;
                  for (let s = parent.previousSibling; s; s = s.previousSibling) {
                    if (s.nodeName === parent.nodeName) sibling++;
                  }
                  xpath = '/' + parent.nodeName.toLowerCase() + (sibling > 0 ? '[' + (sibling + 1) + ']' : '') + xpath;
                }
                xpath = '/' + xpath;
              }
              
              return JSON.stringify({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: el.className || '',
                cssSelector: cssSelector,
                xpath: xpath,
                attributes: Array.from(el.attributes).reduce((obj, attr) => {
                  obj[attr.name] = attr.value;
                  return obj;
                }, {})
              });
            }
            return null;
          })();
        `);
        
        if (elementInfo) {
          const info = JSON.parse(elementInfo);
          
          switch(item.action) {
            case 'copy-css-selector':
              window.Utils.copyToClipboard(info.cssSelector);
              window.Utils.setStatus('CSS选择器已复制: ' + info.cssSelector, 'success');
              break;
            case 'copy-xpath':
              window.Utils.copyToClipboard(info.xpath);
              window.Utils.setStatus('XPath已复制: ' + info.xpath, 'success');
              break;
            case 'copy-js-path':
              const jsPath = info.id ? `document.getElementById('${info.id}')` : `document.querySelector('${info.cssSelector}')`;
              window.Utils.copyToClipboard(jsPath);
              window.Utils.setStatus('JS路径已复制: ' + jsPath, 'success');
              break;
            case 'show-element-info':
              window.Utils.setStatus(`元素信息 - 标签: ${info.tag}, ID: ${info.id}, Class: ${info.className}`, 'info');
              break;
            case 'use-in-extractor':
              const selectorInput = window.Utils.$('extractSelector');
              if (selectorInput) {
                selectorInput.value = info.cssSelector;
                selectorInput.focus();
                window.Utils.setStatus('选择器已填入提取框: ' + info.cssSelector, 'success');
              }
              break;
          }
        }
      } catch (err) {
        console.error('处理右键菜单项失败:', err);
        window.Utils.setStatus('操作失败: ' + err.message, 'error');
      }
      
      menu.remove();
    });

    // 最后一个元素不添加底部分割线
    if (item === menuItems[menuItems.length - 1]) {
      menuItem.style.borderBottom = 'none';
    }
    
    menu.appendChild(menuItem);
  });

  document.body.appendChild(menu);

  // 点击其他地方关闭菜单
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 10);
}

  // 窗口事件
  window.addEventListener('beforeunload', () => {
    if (window.State.selectCheckInterval) {
      clearInterval(window.State.selectCheckInterval);
    }
  });

  console.log('事件绑定完成');
}

// 显示选择模式按钮的右键菜单
function showSelectModeContextMenu(e) {
  // 移除现有的右键菜单
  const existingMenu = document.querySelector('.select-mode-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // 创建右键菜单
  const menu = document.createElement('div');
  menu.className = 'select-mode-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: #2d3748;
    border: 1px solid #4a5568;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    min-width: 150px;
    font-size: 12px;
  `;

  // 复制JS路径选项
  const copyJSPathItem = document.createElement('div');
  copyJSPathItem.textContent = '复制 JS 路径';
  copyJSPathItem.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    color: #e2e8f0;
    border-bottom: 1px solid #4a5568;
  `;
  copyJSPathItem.addEventListener('mouseenter', () => {
    copyJSPathItem.style.backgroundColor = '#4a5568';
  });
  copyJSPathItem.addEventListener('mouseleave', () => {
    copyJSPathItem.style.backgroundColor = 'transparent';
  });
  copyJSPathItem.addEventListener('click', () => {
    copyJSPath();
    menu.remove();
  });

  menu.appendChild(copyJSPathItem);
  document.body.appendChild(menu);

  // 点击其他地方关闭菜单
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 10);
}

// 复制当前选中元素的JS路径
function copyJSPath() {
  const path = window.State.selectedElementPath;
  const selector = window.Utils.$('selectedSelector')?.textContent;
  const id = window.Utils.$('selectedId')?.textContent;
  const tag = window.Utils.$('selectedTag')?.textContent;

  if (!path || path.length === 0) {
    window.Utils.setStatus('请先选择一个元素', 'warning');
    return;
  }

  let jsPath = '';

  // 生成基于完整路径的JS代码
  if (path.length === 1) {
    // 只有一个元素
    const element = path[0];
    if (element.id) {
      jsPath = `document.getElementById('${element.id}')`;
    } else {
      jsPath = `document.querySelector('${element.tag}')`;
    }
  } else {
    // 多个元素，生成完整的路径选择器
    const selectors = path.map((element, index) => {
      if (index === 0) {
        // 第一个元素（通常是html或body）
        return element.tag;
      } else {
        // 子元素
        let sel = element.tag;
        if (element.id) {
          sel = `#${element.id}`;
        } else if (element.class) {
          sel = `${element.tag}.${element.class.split(' ')[0]}`;
        }
        return sel;
      }
    });

    jsPath = `document.querySelector('${selectors.join(' > ')}')`;
  }

  window.Utils.copyToClipboard(jsPath);
  window.Utils.setStatus(`JS路径已复制: ${jsPath}`, 'success');
}

// 导出事件绑定功能
window.EventBindings = {
  bindEvents,
  showSelectModeContextMenu,
  copyJSPath
};