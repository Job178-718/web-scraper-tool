// 存储回调函数用于监听结果
const resultCallbacks = new Map();
let callbackIdCounter = 0;

async function executeInWebView(script, options = {}) {
  const webview = window.Utils.$('webview');
  if (!webview) throw new Error('WebView 未找到');

  // 等待WebView准备就绪
  if (!window._webviewReady) {
    console.log('等待WebView准备就绪...');
    await new Promise((resolve) => {
      const checkReady = () => {
        if (window._webviewReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

try {
    // 包装脚本以确保返回值被正确捕获
    const wrappedScript = `(function() {
      try {
        return (function() {
          ${script}
        })();
      } catch (error) {
        console.error('脚本执行错误:', error);
        // 返回标准化的错误对象
       return {
         status: 404,
         data: []
      };
      }
    })();`;
    
    const result = await webview.executeJavaScript(wrappedScript, true);
    window.Utils.setStatus('执行成功，提取到数据', 'success');
    return result;
  } catch (error) {
    console.error('WebView脚本执行失败:', error);
    window.Utils.setStatus('执行失败: ' + error.message, 'error');
    // 如果executeJavaScript本身失败，返回错误对象
    return{
      status: 404,
      data: []
    }
  }
}




// 导出WebView执行功能
window.WebViewExecutor = {
  executeInWebView
};