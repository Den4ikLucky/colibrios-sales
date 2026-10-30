window.COLIBRI_ROUTING = Object.freeze({"schemaVersion": 1, "storefrontTarget": "primary", "technicalTarget": "primary", "primaryStorefrontBase": "https://colibri-os.com/", "fallbackStorefrontBase": "https://den4iklucky.github.io/colibrios-sales/", "technicalBase": "https://colibrios.pro/", "storefrontBase": "https://colibri-os.com/", "checkoutUrl": "https://colibri-os.com/checkout.html?product=vip", "pricingUrl": "https://colibri-os.com/#pricing", "tmaUrl": "https://colibrios.pro/tma_magnet/", "checkoutApiBase": null, "endpoints": {"checkout": "https://colibrios.pro/api/checkout", "lavatopWebhook": "https://colibrios.pro/api/webhooks/lavatop", "instagramWebhook": "https://colibrios.pro/webhook/instagram"}, "allowedOrigins": ["https://colibri-os.com", "https://den4iklucky.github.io", "https://colibrios.pro"]});
'use strict';
/* Public configuration only. Secret credentials must stay in the backend environment. */
(() => {
  const base = new URL('../', document.currentScript.src);
  const routing = window.COLIBRI_ROUTING || null;
  // Preserve local/GitHub Pages previews. Only the technical host crosses to the storefront.
  const storefrontBase = routing && base.origin === new URL(routing.technicalBase).origin
    ? new URL(routing.storefrontBase) : base;
  const publicUrl = path => new URL(path, storefrontBase).href;
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
    routing,
    storefrontUrl: publicUrl('index.html'),
    tmaUrl: routing?.tmaUrl || publicUrl('tma_magnet/'),
    hostedPaymentUrls,
    paymentUrls: Object.freeze(Object.fromEntries(['vip', 'light', 'pro', 'swarm'].map(product => [product, publicUrl('checkout.html?product=' + product)]))),
    checkoutApiBase: routing?.checkoutApiBase || null,
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
