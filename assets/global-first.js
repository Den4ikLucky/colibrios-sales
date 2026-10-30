(function() {
  'use strict';
  function updateHeaderOffset() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--locale-anchor-offset', `${Math.round(height + 16)}px`);
  }
  if (typeof ResizeObserver !== 'undefined') {
    const header = document.querySelector('.site-header');
    if (header) {
      new ResizeObserver(updateHeaderOffset).observe(header);
    }
  }
  window.addEventListener('resize', updateHeaderOffset, { passive: true });
  document.addEventListener('DOMContentLoaded', updateHeaderOffset);
})();
