/**
 * 通用脚本：导航 + 工具函数
 */
(function () {
  'use strict';

  // 头部滚动样式
  function setupHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 移动端菜单
  function setupMobileMenu() {
    const btn = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => menu.classList.remove('is-open'));
    });
  }

  // localStorage 简易封装
  const Storage = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };

  // 暴露
  window.WellnessApp = {
    Storage,
    setupHeader,
    setupMobileMenu,
  };

  // DOM 就绪
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupHeader();
      setupMobileMenu();
    });
  } else {
    setupHeader();
    setupMobileMenu();
  }
})();