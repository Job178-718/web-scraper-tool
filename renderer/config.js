// config.js - 配置
const CONFIG = {
  cleanup: {
    ads: ['.ad', '.ads', '.advertisement', '.ad-banner', '[class*="ad-"]', '[id*="ad-"]', '.sponsor', '.promotion', '.banner'],
    nav: ['nav', 'header', '.navbar', '.nav', '.navigation', '.top-nav', '#header', '#navbar'],
    footer: ['footer', '.footer', '.foot', '#footer'],
    sidebar: ['aside', '.sidebar', '.side-bar', '.widget-area'],
    popup: ['.modal', '.popup', '.overlay', '.dialog', '[class*="modal"]', '[class*="popup"]']
  }
};

// 导出配置
window.Config = CONFIG;