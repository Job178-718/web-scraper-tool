// element-selector.js - 元素选择
function showElementInfo(data) {
  console.log('显示元素信息:', data);
  const panel = window.Utils.$('elementInfoPanel');
  if (!panel) {
    console.error('找不到元素信息面板');
    return;
  }

  panel.classList.remove('hidden');

  const tagEl = window.Utils.$('selectedTag');
  const idEl = window.Utils.$('selectedId');
  const classEl = window.Utils.$('selectedClass');
  const xpathEl = window.Utils.$('selectedXPath');
  const selectorEl = window.Utils.$('selectedSelector');
  const srcEl = window.Utils.$('selectedSrc');
  const imageInfo = window.Utils.$('imageInfo');

  console.log('设置元素信息 - XPath:', data.xpath, '选择器:', data.selector);

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

  // 显示完整的元素路径
  showElementPath(data.path);
}

function showElementPath(path) {
  const pathContainer = window.Utils.$('elementPathContainer');
  if (!pathContainer) {
    console.error('找不到元素路径容器');
    return;
  }

  // 清空现有内容
  pathContainer.innerHTML = '';

  if (!path || path.length === 0) {
    pathContainer.innerHTML = '<div class="path-item">无路径信息</div>';
    return;
  }

  // 创建路径显示
  path.forEach((element, index) => {
    const pathItem = document.createElement('div');
    pathItem.className = 'path-item';

    // 标签名
    const tagSpan = document.createElement('span');
    tagSpan.className = 'path-tag';
    tagSpan.textContent = element.tag;
    pathItem.appendChild(tagSpan);

    // 属性
    if (element.id) {
      const idSpan = document.createElement('span');
      idSpan.className = 'path-attr';
      idSpan.textContent = `id="${element.id}"`;
      pathItem.appendChild(idSpan);
    }

    if (element.class) {
      const classSpan = document.createElement('span');
      classSpan.className = 'path-attr';
      classSpan.textContent = `class="${element.class}"`;
      pathItem.appendChild(classSpan);
    }

    // 其他重要属性
    const importantAttrs = ['href', 'src', 'type', 'name', 'value', 'data-*'];
    Object.keys(element.attributes).forEach(attr => {
      if (attr !== 'id' && attr !== 'class') {
        const isImportant = importantAttrs.some(pattern =>
          pattern === attr || (pattern.endsWith('*') && attr.startsWith(pattern.slice(0, -1)))
        );

        if (isImportant) {
          const attrSpan = document.createElement('span');
          attrSpan.className = 'path-attr';
          attrSpan.textContent = `${attr}="${element.attributes[attr]}"`;
          pathItem.appendChild(attrSpan);
        }
      }
    });

    // 添加连接符（除了最后一个）
    if (index < path.length - 1) {
      const connector = document.createElement('span');
      connector.className = 'path-connector';
      connector.textContent = ' > ';
      pathItem.appendChild(connector);
    }

    pathContainer.appendChild(pathItem);
  });
}

function hideElementInfo() {
  const panel = window.Utils.$('elementInfoPanel');
  if (panel) panel.classList.add('hidden');
}

async function checkSelectedElement() {
  if (!window.State.selectMode) return;

  try {
    const info = await Promise.race([
      window.WebViewExecutor.executeInWebView(`
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
      `),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    if (info && info !== 'null') {
      console.log('检测到选中元素:', info);
      try {
        const data = JSON.parse(info);
        // 保存完整的元素路径
        window.State.selectedElementPath = data.path;
        showElementInfo(data);
      } catch(e) {
        console.error('解析元素信息失败:', e);
      }
    }
  } catch (e) {
    if (e.message !== 'timeout') {
      console.error('检查选中元素失败:', e);
    }
  }
}

async function toggleSelectMode(target = 'extract') {
  const btn = window.Utils.$('selectModeBtn');
  const overlay = window.Utils.$('selectorOverlay');

  if (!btn || !overlay) {
    console.error('找不到选择模式按钮或遮罩');
    return;
  }

  if (window.State.selectMode) {
    console.log('关闭选择模式');
    window.State.setSelectMode(false);
    window.State.setSelectTarget(null);
    btn.classList.remove('active');
    overlay.classList.add('hidden');
    hideElementInfo();
    window.Utils.setStatus('就绪', 'info');

    if (window.State.selectCheckInterval) {
      clearInterval(window.State.selectCheckInterval);
      window.State.setSelectCheckInterval(null);
    }

    try {
      await window.WebViewExecutor.executeInWebView(`
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
      `);
    } catch (e) {
      console.error('清理选择模式失败:', e);
    }
    return;
  }

  console.log('开启选择模式');
  window.State.setSelectMode(true);
  window.State.setSelectTarget(target);
  btn.classList.add('active');
  overlay.classList.remove('hidden');
  window.Utils.setStatus('选择模式：点击元素查看详细信息', 'info');

  try {
    await window.WebViewExecutor.executeInWebView(`
      (function() {
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

        function getElementPath(element) {
          var path = [];
          var current = element;

          // 从当前元素向上遍历到根元素
          while (current && current.nodeType === 1) {
            var elementInfo = {
              tag: current.tagName.toLowerCase(),
              id: current.id || '',
              class: current.className || '',
              attributes: {}
            };

            // 获取所有属性
            for (var i = 0; i < current.attributes.length; i++) {
              var attr = current.attributes[i];
              elementInfo.attributes[attr.name] = attr.value;
            }

            path.unshift(elementInfo);
            current = current.parentNode;
          }

          return path;
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
            src: el.src || el.getAttribute('src') || '',
            path: getElementPath(el) // 添加完整的元素路径
          };

          console.log('元素已选择:', window._scraperSelectedElement);
        };

        window._scraperCleanup = function() {
          document.removeEventListener('click', window._scraperClickHandler, true);
          if (selectedEl) unhighlight(selectedEl);
        };

        document.addEventListener('click', window._scraperClickHandler, true);

        console.log('选择脚本已注入，点击元素即可选择');
      })()
    `);

    console.log('选择脚本注入完成');
    window.State.setSelectCheckInterval(setInterval(checkSelectedElement, 300));
    console.log('轮询已启动');

  } catch (e) {
    console.error('注入选择脚本失败:', e);
    window.Utils.setStatus('选择模式启动失败: ' + e.message, 'error');
    window.State.setSelectMode(false);
    btn.classList.remove('active');
    overlay.classList.add('hidden');
  }
}

function useSelectedSelector() {
  const selector = window.Utils.$('selectedSelector')?.textContent;
  if (!selector || selector === '-') return;

  if (window.State.selectTarget === 'extract') {
    const input = window.Utils.$('extractSelector');
    if (input) input.value = selector;
  } else if (window.State.selectTarget === 'delete') {
    const input = window.Utils.$('deleteSelector');
    if (input) input.value = selector;
  }

  toggleSelectMode();
}

// 导出元素选择功能
window.ElementSelector = {
  showElementInfo,
  hideElementInfo,
  checkSelectedElement,
  toggleSelectMode,
  useSelectedSelector
};