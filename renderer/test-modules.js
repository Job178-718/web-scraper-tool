// test-modules.js - 模块加载测试
console.log('开始测试模块加载...');

// 检查所有必需的模块
const requiredModules = [
  'Utils', 'Config', 'State', 'WebViewExecutor',
  'UrlLoader', 'TabManager', 'ElementSelector',
  'ContentExtractor', 'ElementCleaner', 'ScriptInjector',
  'DataExporter', 'SourceViewer', 'ContextMenu', 'EventBindings'
];

let loadedCount = 0;
let missingModules = [];

requiredModules.forEach(module => {
  if (window[module]) {
    loadedCount++;
    console.log(`✓ ${module} 已加载`);
  } else {
    missingModules.push(module);
    console.error(`✗ ${module} 未加载`);
  }
});

console.log(`模块加载状态: ${loadedCount}/${requiredModules.length}`);
if (missingModules.length > 0) {
  console.error('缺失的模块:', missingModules.join(', '));
} else {
  console.log('所有模块加载成功！');
}

// 测试基本功能
setTimeout(() => {
  console.log('测试基本DOM元素...');

  const testElements = [
    'urlInput', 'loadBtn', 'selectModeBtn', 'extractBtn',
    'exportBtn', 'extractSelector', 'extractResult'
  ];

  testElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      console.log(`✓ 元素 ${id} 存在`);
    } else {
      console.error(`✗ 元素 ${id} 不存在`);
    }
  });

  console.log('模块测试完成');
}, 1000);