// state.js - 状态管理
let selectMode = false;
let selectTarget = null;
let extractedData = [];
let selectCheckInterval = null;
let selectedElementPath = null;
let savePath = localStorage.getItem('savePath') || '';  // 添加保存路径状态

// 导出状态
window.State = {
  selectMode,
  selectTarget,
  extractedData,
  selectCheckInterval,
  selectedElementPath,
  savePath,
  setSelectMode: (value) => selectMode = value,
  setSelectTarget: (value) => selectTarget = value,
  setExtractedData: (value) => extractedData = value,
  setSelectCheckInterval: (value) => selectCheckInterval = value,
  setSelectedElementPath: (value) => selectedElementPath = value,
  setSavePath: (value) => {
    savePath = value;
    localStorage.setItem('savePath', value);  // 保存到本地存储
  }
};