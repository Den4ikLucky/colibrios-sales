(function() {
  'use strict';
  const html = document.documentElement;
  const locale = html.getAttribute('data-locale') || html.getAttribute('lang') || 'en';
  window.COLIBRI_LOCALE = Object.freeze({
    code: locale,
    isRtl: false,
    currency: locale === 'ru' ? 'RUB' : 'USD',
  });
})();
