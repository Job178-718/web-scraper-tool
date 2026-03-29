// content-extractor.js - 内容提取
async function extractContent() {
  const selector = window.Utils.$('extractSelector')?.value?.trim();
  if (!selector) {
    window.Utils.setStatus('请输入CSS 选择器', 'warning');
    return;
  }

  const extractType = document.querySelector('input[name="extractType"]:checked')?.value || 'text';

  try {
    const safeSelector = window.Utils.escapeSelector(selector);
    let script;

    if (extractType === 'text') {
      script = `Array.from(document.querySelectorAll('${safeSelector}')).map((el, i) => ({index: i+1, text: el.innerText?.trim(), tag: el.tagName.toLowerCase()})).filter(item => item.text)`;
    } else if (extractType === 'html') {
      script = `Array.from(document.querySelectorAll('${safeSelector}')).map((el, i) => ({index: i+1, html: el.innerHTML?.substring(0, 500), tag: el.tagName.toLowerCase()}))`;
    } else {
      const attrName = window.Utils.$('attrName')?.value?.trim() || 'href';
      script = `Array.from(document.querySelectorAll('${safeSelector}')).map((el, i) => ({index: i+1, value: el.getAttribute('${attrName}'), tag: el.tagName.toLowerCase()})).filter(item => item.value)`;
    }

    const results = await window.WebViewExecutor.executeInWebView(script);
    window.State.setExtractedData(results || []);

    displayResults(window.State.extractedData);
    window.Utils.setStatus(`成功提取 ${window.State.extractedData.length} 条数据`, 'success');
  } catch (error) {
    window.Utils.setStatus('提取失败: ' + error.message, 'error');
  }
}

function displayResults(results) {
  const countEl = window.Utils.$('resultCount');
  const container = window.Utils.$('extractResult');

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

// 显示下载组
function showDownloadGroup(extractedData) {
    // 隐藏脚本注入面板，显示下载组
    const injectPanel = document.getElementById('panel-inject');
    const downloadGroup = document.getElementById('download');
    if (injectPanel && downloadGroup) {
      injectPanel.classList.add('hidden');
      downloadGroup.classList.remove('hidden');
      // 更新下载条目
      if (typeof window.ContentExtractor?.updateDownloadEntries === 'function') {
        window.ContentExtractor.updateDownloadEntries(extractedData);
      }
  }
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
  
  // 提取可下载的项目
  const downloadItems = extractDownloadableItemsFromExtractedData(extractedData);
  
  if (downloadItems.length === 0) {
    container.innerHTML = '<div class="empty-state">未找到可下载的内容</div>';
    return;
  }
  
  container.innerHTML = downloadItems.map((item, index) => {
    // 安全地处理可能为 null/undefined 的值
    const safeUrl = item.url || '';
    const safeTitle = item.title || '未命名';
    const escapedUrl = safeUrl.replace(/'/g, '\\\'');
    const escapedTitle = safeTitle.replace(/'/g, '\\\'');
    
    return `
    <div class="download-entry-item" data-url="${safeUrl}" data-title="${safeTitle}">
      <input type="checkbox" class="download-checkbox" data-index="${index}">
      <div class="download-entry-info">
        <div class="download-entry-title" title="${safeTitle}">${safeTitle}</div>
        <div class="download-entry-url" title="${safeUrl}">${safeUrl}</div>
      </div>
      <div class="download-entry-actions">
        <button class="download-entry-btn preview-btn" title="预览" onclick="window.WebViewExecutor.executeInWebView(\`window.open('${escapedUrl}', '_blank')\`)">👁️</button>
        <button class="download-entry-btn download-btn" title="单独下载" onclick="window.ContentExtractor.downloadSingleItemByIndex(${index})">📥</button>
      </div>
    </div>
  `;
  }).join('');
  
  bindDownloadSelectionEvents();
  
  
  const downloadBtn = document.getElementById('downloadSelectedBtn');
  if (downloadBtn) {
    downloadBtn.onclick = null;
    downloadBtn.addEventListener('click', () => {
      downloadSelectedItems(downloadItems);
    });
  }
  
  window.State.downloadItems = downloadItems;
  // 绑定浏览路径按钮到保存路径变量
  bindBrowseSavePath();
}

// 从提取的数据中提取可下载项目（支持 README.md 中的结构）
function extractDownloadableItemsFromExtractedData(extractedData) {
  const items = [];
  
  if (Array.isArray(extractedData)) {
    extractedData.forEach(item => {

      // 处理字符串 URL
      if (typeof item === 'string' && isValidUrl(item)) {
        items.push({
          url: item,
          title: getFilenameFromUrl(item)
        });
      }
      // 处理对象数据（如 README.md 中的结构）
      else if (typeof item === 'object' && item !== null) {
        // 检查常见的 URL 属性
        let url = '';
        let title = '';
        
        if (item.src && isValidUrl(item.src)) {
          url = item.src;
          title = item.alt || getFilenameFromUrl(item.src);
        } else if (item.href && isValidUrl(item.href)) {
          url = item.href;
          title = item.text || item.value || getFilenameFromUrl(item.href);
        } else if (item.url && isValidUrl(item.url)) {
          url = item.url;
          title = item.title || getFilenameFromUrl(item.url);
        } else if (item.value && isValidUrl(item.value)) {
          url = item.value;
          title = getFilenameFromUrl(item.value);
        }
        
        if (url) {
          items.push({
            url: url,
            title: title || '未命名',
            imgboxIndex: item.imgboxIndex || item.imgboxindex || item.imgBoxIndex || item.img_box_index || ''
          });
        }
      }
    });
  }
  // 处理单个字符串
  else if (typeof extractedData === 'string' && isValidUrl(extractedData)) {
    items.push({
      url: extractedData,
      title: getFilenameFromUrl(extractedData)
    });
  }
  // 处理单个对象
  else if (typeof extractedData === 'object' && extractedData !== null) {
    let url = '';
    let title = '';
    
    if (extractedData.src && isValidUrl(extractedData.src)) {
      url = extractedData.src;
      title = extractedData.alt || getFilenameFromUrl(extractedData.src);
    } else if (extractedData.href && isValidUrl(extractedData.href)) {
      url = extractedData.href;
      title = extractedData.text || extractedData.value || getFilenameFromUrl(extractedData.href);
    } else if (extractedData.url && isValidUrl(extractedData.url)) {
      url = extractedData.url;
      title = extractedData.title || getFilenameFromUrl(extractedData.url);
    } else if (extractedData.value && isValidUrl(extractedData.value)) {
      url = extractedData.value;
      title = getFilenameFromUrl(extractedData.value);
    }
    
    if (url) {
      items.push({
        url: url,
        title: title || '未命名',
        imgboxIndex: extractedData.imgboxIndex || extractedData.imgboxindex || extractedData.imgBoxIndex || extractedData.img_box_index || ''
      });
    }
  }
  
  return items;
}


function clearDownloadEntries() {
  const container = document.getElementById('downloadEntriesList');
  if (container) {
    container.innerHTML = '<div class="empty-state">请先提取包含链接的内容</div>';
  }
  window.State.downloadItems = [];
}

function extractDownloadableItems(extractedData) {
  const items = [];
  
  if (Array.isArray(extractedData)) {
    extractedData.forEach(item => {
      if (typeof item === 'string' && isValidUrl(item)) {
        items.push({
          url: item,
          title: getFilenameFromUrl(item)
        });
      }
    });
  } else if (typeof extractedData === 'string' && isValidUrl(extractedData)) {
    items.push({
      url: extractedData,
      title: getFilenameFromUrl(extractedData)
    });
  }
  
  return items;
}


// 验证URL的辅助函数
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

async function downloadSingleItem(item, title) {
  const savePathInput = document.getElementById('savePath');
  let savePath = savePathInput?.value || window.State?.savePath;
  
  if (!savePath) {
    const path = await window.ScriptInjector?.getSavePath();
    if (!path) return;
    savePath = path;
    if (savePathInput) savePathInput.value = path;
  }
  
  if (window.DownloadManager) {
    // 以对象哈希生成文件名，尽量保留 URL 中的扩展名，否则使用 jpg
    const extMatch = (item.url || '').match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const filename = computeHashFilename(item, ext);
    window.DownloadManager.addDownload(item.url, {
      filename: filename,
      savePath: savePath
    });
  }
}


async function downloadSelectedItems(selectedItems) {
  
  // 添加日志：遍历所有传入的 items
  console.error('=== 开始处理下载所选项 ===');
  console.error('传入的 selectedItems 数组长度:', selectedItems.length);

  const savePathInput = document.getElementById('savePath');
  let savePath = savePathInput?.value || window.State?.savePath;

  
  if (!savePath) {
    const path = await window.ScriptInjector?.getSavePath();
    if (!path) return;
    savePath = path;
    if (savePathInput) savePathInput.value = path;
  }
  
  
  if (window.DownloadManager) {
    const downloadBtnEl = document.getElementById('downloadSelectedBtn');
    if (downloadBtnEl) downloadBtnEl.disabled = true;
    console.error('保存路径:', savePath);
    window.Utils?.setStatus(`开始加入 ${selectedItems.length} 个下载任务`, 'info');
    // 过滤出有效的项目并记录
    const validItems = selectedItems.filter(item => item.url && isValidUrl(item.url));
    console.error('有效下载项目数量:', validItems.length);
// 逐个下载，每个下载之间间隔1秒
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const extMatch = (item.url || '').match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
      const filename = item.imgboxIndex ? (sanitizeFilename(String(item.imgboxIndex)) + '.' + ext) : computeHashFilename(item, ext);
      
      console.error('准备下载:', {
        url: item.url,
        filename: filename,
        imgboxIndex: item.imgboxIndex,
        extension: ext
      });
      
      window.DownloadManager.addDownload(item.url, {
        filename: filename,
        savePath: savePath
      });
      
      // 如果不是最后一个项目，等待1秒
      if (i < validItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    window.Utils?.setStatus(`已加入 ${validItems.length} 个下载任务`, 'success');
    console.error(`=== 下载任务完成，共 ${validItems.length} 个有效任务 ===`);
    if (downloadBtnEl) downloadBtnEl.disabled = false;
  }
}

function getFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename || 'download';
  } catch {
    return 'download';
  }
}

// ... existing code ...
// 根据对象生成稳定的哈希文件名，默认扩展名 .jpg
function computeHashFilename(item, ext = 'jpg') {
  try {
    // 优先使用 imgboxIndex 作为文件名基础
    let filenameBase = '';
    if (item && item.imgboxIndex) {
      // 如果有 imgboxIndex，直接使用它（确保安全）
      filenameBase = String(item.imgboxIndex).replace(/[^a-zA-Z0-9_-]/g, '_');
    } else {
      // 最后使用整个对象生成哈希
      const str = JSON.stringify(item || {});
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & 0xFFFFFFFF;
      }
      filenameBase = (hash >>> 0).toString(16);
    }
    
    const safeExt = (ext || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
    return `${filenameBase}.${safeExt}`;
  } catch (e) {
    return `download.${ext || 'jpg'}`;
  }
}

// 绑定浏览保存路径按钮，更新窗口状态
function bindBrowseSavePath() {
  const browseBtn = document.getElementById('browsePathBtn');
  const savePathInput = document.getElementById('savePath');
  if (!browseBtn) return;
  // 避免重复绑定
  if (browseBtn.dataset.browseBound === '1') return;
  browseBtn.dataset.browseBound = '1';
  browseBtn.onclick = null;
  browseBtn.addEventListener('click', async () => {
    const path = await window.ScriptInjector?.getSavePath();
    if (path) {
      if (savePathInput) savePathInput.value = path;
      window.State = window.State || {};
      window.State.savePath = path;
      window.Utils?.setStatus(`已选择保存路径: ${path}`, 'info');
    }
  });
}

function sanitizeFilename(name) {
  if (!name) return '';
  return String(name).replace(/[^a-z0-9._-]/gi, '_');
}

// 根据条目索引进行单条下载（从 window.State.downloadItems 中取出完整对象）
async function downloadSingleItemByIndex(index) {
  const items = window.State?.downloadItems || [];
  const item = items[index];
  if (!item) {
    window.Utils?.setStatus('未找到下载项', 'warning');
    return;
  }

  const savePathInput = document.getElementById('savePath');
  let savePath = savePathInput?.value || window.State?.savePath;
  if (!savePath) {
    const path = await window.ScriptInjector?.getSavePath();
    if (!path) return;
    savePath = path;
    if (savePathInput) savePathInput.value = path;
  }

  // 使用 imgboxIndex 作为文件名（若存在），否则保留 URL 后缀或哈希
  const url = item.url;
  const extMatch = (url || '').match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
  let filename = '';
  if (item.imgboxIndex) {
    filename = sanitizeFilename(String(item.imgboxIndex)) + '.' + ext;
  } else {
    filename = computeHashFilename(item, ext);
  }

  if (window.DownloadManager) {
    window.DownloadManager.addDownload(url, {
      filename: filename,
      savePath: savePath,
      id: item.id || undefined
    });
  }
}

/**
 * 绑定下载条目的选择事件，支持全选/反选和更新下载按钮状态
 */
function bindDownloadSelectionEvents() {
  const selectAllBtn = document.getElementById('selectAllDownloadsBtn');
  const downloadBtn = document.getElementById('downloadSelectedBtn');
  const checkboxes = Array.from(document.querySelectorAll('.download-checkbox'));

  function updateSelectAllAndDownloadBtn() {
    const total = checkboxes.length;
    const checkedCount = checkboxes.filter(cb => cb.checked).length;

    // 更新全选按钮状态
    if (selectAllBtn) {
      if (total === 0) {
        selectAllBtn.textContent = '全选';
        selectAllBtn.classList.remove('btn-primary');
        selectAllBtn.style.opacity = '0.6';
        selectAllBtn.disabled = true;
      } else if (checkedCount === total) {
        selectAllBtn.textContent = '取消全选';
        selectAllBtn.classList.add('btn-primary');
        selectAllBtn.style.opacity = '1';
        selectAllBtn.disabled = false;
      } else {
        selectAllBtn.textContent = '全选';
        selectAllBtn.classList.remove('btn-primary');
        selectAllBtn.style.opacity = '0.8';
        selectAllBtn.disabled = false;
      }
    }

    // 更新下载按钮状态与计数
    if (downloadBtn) {
      if (checkedCount === 0) {
        downloadBtn.disabled = true;
        downloadBtn.textContent = '下载所选';
        downloadBtn.title = '请先选择要下载的项目';
      } else {
        downloadBtn.disabled = false;
        downloadBtn.textContent = `下载所选 (${checkedCount})`;
        downloadBtn.title = `下载所选 ${checkedCount} 项`;
      }
    }
  }

  if (selectAllBtn) {
    selectAllBtn.onclick = null;
    selectAllBtn.addEventListener('click', () => {
      const allChecked = checkboxes.length > 0 && checkboxes.every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
      updateSelectAllAndDownloadBtn();
    });
  }

  checkboxes.forEach(cb => {
    cb.onchange = null;
    cb.addEventListener('change', updateSelectAllAndDownloadBtn);
  });

  // 初始化
  updateSelectAllAndDownloadBtn();
}

// 导出内容提取功能
window.ContentExtractor = {
  extractContent,
  displayResults,
  downloadSingleItem,
  downloadSelectedItems,
  downloadSingleItemByIndex,
  showDownloadGroup,
  updateDownloadEntries
};