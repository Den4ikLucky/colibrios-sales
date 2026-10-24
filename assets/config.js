'use strict';
/* Public configuration only. Secret credentials must stay in the backend environment. */
(() => {
  const base = new URL('../', document.currentScript.src);
  const publicUrl = path => new URL(path, base).href;
  const hostedPaymentUrls = Object.freeze({
    vip: 'https://app.lava.top/products/4ade88c2-4bf8-46fb-89c3-6492da0589ec',
    light: 'https://app.lava.top/products/5e6ffda5-6c33-466e-9a68-0bde31f1badd',
    pro: 'https://app.lava.top/products/70454acc-a987-458e-8065-c24feea7cb7d',
    swarm: 'https://app.lava.top/products/081b5bee-3105-41f8-89c0-1015f87a5c24'
  });
  window.COLIBRI_CONFIG = Object.freeze({
    campaignId: 'colibrios-3-evenings-v1',
    offerDeadline: null,
    entryPriceRUB: 990,
    hostedPaymentUrls,
    paymentUrls: Object.freeze(Object.fromEntries(['vip', 'light', 'pro', 'swarm'].map(product => [product, publicUrl('checkout.html?product=' + product)]))),
    checkoutApiBase: null,
    telegramLaunchMode: null,
    qualificationEndpoint: null,
    sellerName: 'Денис / Denys · Проект AI is... & ColibriOS',
    sellerLegalName: null,
    sellerAddress: null,
    sellerTaxId: null,
    supportEmail: null,
    supportUrl: 'https://t.me/AI_is_Channel',
    termsUrl: publicUrl('terms.html'),
    privacyUrl: publicUrl('privacy.html'),
    commercialReady: true
  });
})();
