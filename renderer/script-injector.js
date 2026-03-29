// script-injector.js - 脚本注入
async function injectScript() {
  const code = window.Utils.$('injectCode')?.value?.trim();
  if (!code) {
    window.Utils.setStatus('请输入脚本代码', 'warning');
    return;
  }

  const type = document.querySelector('input[name="scriptType"]:checked')?.value || 'js';

  try {
    let script;
    if (type === 'css') {
      script = `const style=document.createElement('style');style.textContent=${JSON.stringify(code)};document.head.appendChild(style);'CSS注入成功'`;
    } else {
      script = code;
    }

    const  result = await window.WebViewExecutor.executeInWebView(script);
    handleScriptResult(result);
    window.Utils.setStatus('injectScript 脚本执行成功', 'success');
  } catch (error) {
    window.Utils.setStatus('执行失败: ' + error.message, 'error');
  }
}



// 处理脚本执行结果
function handleScriptResult(result) {
  // 验证结果格式
  if (!result || typeof result !== 'object') {
    window.Utils.setStatus('脚本执行成功（无结构化返回）', 'success');
    return;
  }

  if (result.status === 404) {
    // 处理错误
    const errorMessage = result.error || '未知错误';
    console.error('脚本执行错误:', errorMessage);
    window.Utils.setStatus('执行失败: ' + errorMessage, 'error');
    
    // 存储错误数据（如果有）
    if (result.data) {
      window.State.setExtractedData(Array.isArray(result.data) ? result.data : [result.data]);
    }
  } else {
    // 处理成功
    const data = result.data;
    if (data) {
      if (Array.isArray(data)) {
        console.error('脚本执行成功Array.isArray(data)，提取到数据:', data);
        // 数组数据
        window.State.setExtractedData(data);
        window.Utils.setStatus(`执行成功，提取到 ${data.length} 条数据`, 'success');
        if (typeof window.ContentExtractor?.showDownloadGroup === 'function') {
          window.ContentExtractor.showDownloadGroup(data);
        }
      } else {
        console.error('脚本执行成功typeof else === "object"，提取到数据:', data);
        // 其他类型数据
        window.Utils.setStatus(`执行成功: ${data}`, 'success');
      }
    } else {
      window.Utils.setStatus('执行成功（无数据返回）', 'success');
    }
  }
}

// 初始化保存路径显示
function initSavePathDisplay() {
  if (window.State && window.State.savePath) {
    const pathInput = window.Utils.$('savePath');
    if (pathInput) {
      pathInput.value = window.State.savePath;
    }
  }

    // 同时初始化下载面板的保存路径（如果存在）
  const downloadSavePath = document.getElementById('downloadSavePath');
  if (downloadSavePath && window.State && window.State.savePath) {
    downloadSavePath.value = window.State.savePath;
  }
}

// 获取保存路径
async function getSavePath() {
  
  if (window.electronAPI && typeof window.electronAPI.selectSavePath === 'function') {
    try {
      window.Utils.setStatus(`正在选择保存路径...`, 'info');
      const path = await window.electronAPI.selectSavePath();
      window.Utils.setStatus(`path...`, 'info');
      if (path) {
        window.Utils.setStatus(`保存路径选择完成`, 'success');
        window.Utils.setStatus(`保存路径已设置: ${path}`, 'success');
        
        const pathInput = window.Utils.$('savePath');
        if (pathInput) {
          pathInput.value = path;
          window.Utils.setStatus(`保存路径已设置: ${path}`, 'success');
        }
      } else {
        window.Utils.setStatus('未选择任何路径', 'info');
      }
      return path;
    } catch (error) {
      console.error('getSavePath:', error);
      window.Utils.setStatus('选择保存路径失败: ' + error.message, 'error');
      return null;
    }
  } else {
    console.warn('Electron API 不可用或 selectSavePath 方法不存在');
    //window.Utils.setStatus('electronAPI 或 selectSavePath 方法不可用', 'error');
    return null;
  }
}



// 导出脚本注入功能
window.ScriptInjector = {
  injectScript,
  getSavePath,
  initSavePathDisplay
};