/**
 * WordPress tizhi-shop integration adapter.
 * Set window.TIZHI_SHOP_CONFIG before loading this file. No product URL is hard-coded.
 */
(function (global) {
  'use strict';
  const defaults = { baseUrl: '', pages: { home: '', quiz: 'quiz', result: 'result', guide: 'guide' }, productsByType: {} };
  function config() { return Object.assign({}, defaults, global.TIZHI_SHOP_CONFIG || {}, { pages: Object.assign({}, defaults.pages, (global.TIZHI_SHOP_CONFIG || {}).pages || {}) }); }
  function url(page, hash) {
    const c = config(), target = c.pages[page] || page;
    if (/^https?:\/\//.test(target)) return target + (hash || '');
    const base = c.baseUrl || '';
    return base.replace(/\/$/, '') + '/' + String(target).replace(/^\//, '') + (hash || '');
  }
  function products(typeId) {
    const list = config().productsByType[typeId] || [];
    return list.map((item) => typeof item === 'string' ? { name: item } : item).filter((item) => item && item.name);
  }
  global.TizhiShopIntegration = { config, url, products };
})(window);
