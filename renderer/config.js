// config.js - 配置
const CONFIG = {
  CLEANUP_SELECTORS: {
    ads: ['.ad', '.ads', '.advertisement', '.ad-banner', '[class*="ad-"]', '[id*="ad-"]', '.sponsor', '.promotion', '.banner', '.google-ads', '.adsense'],
    nav: ['nav', 'header', '.navbar', '.nav', '.navigation', '.top-nav', '#header', '#navbar', '.menu', '.main-navigation'],
    footer: ['footer', '.footer', '.foot', '#footer', '.site-footer', '.bottom'],
    sidebar: ['aside', '.sidebar', '.side-bar', '.widget-area', '.column', '.widget'],
    popup: ['.modal', '.popup', '.overlay', '.dialog', '[class*="modal"]', '[class*="popup"]', '.lightbox', '.reveal'],
    social: ['.social', '.share', '.facebook', '.twitter', '.weibo', '.share-button', '.social-share', '.social-links'],
    comments: ['.comment', '.disqus', '#comments', '.comments-section', '.comment-form', '.comment-reply'],
    cookie: ['.cookie', '.consent', '.gdpr', '.privacy', '.notice', '.alert', '.banner'],
    forms: ['form', '.contact-form', '.newsletter', '.subscribe', '.signup', '.registration']
  }
};

// 导出配置
window.Config = CONFIG;