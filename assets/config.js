'use strict';
/* Public configuration only. Secret credentials must stay in the backend environment. */
(() => {
  const base = new URL('../', document.currentScript.src);
  const publicUrl = path => new URL(path, base).href;
  window.COLIBRI_CONFIG = Object.freeze({
    campaignId: 'colibrios-3-evenings-v1',
    offerDeadline: null,
    entryPriceRUB: 990,
    paymentUrls: Object.freeze(Object.fromEntries(['vip', 'light', 'pro', 'swarm'].map(product => [product, publicUrl('checkout.html?product=' + product)]))),
    checkoutApiBase: null,
    telegramLaunchMode: null,
    qualificationEndpoint: null,
    sellerName: 'Денис / Denis · Проект AI is... & ColibriOS',
    sellerLegalName: null,
    sellerAddress: null,
    sellerTaxId: null,
    supportEmail: null,
    supportUrl: null,
    termsUrl: publicUrl('terms.html'),
    privacyUrl: publicUrl('privacy.html'),
    commercialReady: false
  });
})();
