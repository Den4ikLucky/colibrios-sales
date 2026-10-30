window.COLIBRI_ROUTING = Object.freeze({"schemaVersion": 1, "storefrontTarget": "primary", "technicalTarget": "primary", "primaryStorefrontBase": "https://colibri-os.com/", "fallbackStorefrontBase": "https://den4iklucky.github.io/colibrios-sales/", "technicalBase": "https://colibrios.pro/", "storefrontBase": "https://colibri-os.com/", "checkoutUrl": "https://colibri-os.com/checkout.html?product=vip", "pricingUrl": "https://colibri-os.com/#pricing", "tmaUrl": "https://colibrios.pro/tma_magnet/", "checkoutApiBase": null, "endpoints": {"checkout": "https://colibrios.pro/api/checkout", "lavatopWebhook": "https://colibrios.pro/api/webhooks/lavatop", "instagramWebhook": "https://colibrios.pro/webhook/instagram"}, "allowedOrigins": ["https://colibri-os.com", "https://den4iklucky.github.io", "https://colibrios.pro"]});
'use strict';
/* Public configuration only. Secret credentials must stay in the backend environment. */
(() => {
  const base = new URL('/ko/', document.currentScript.src);
  const routing = window.COLIBRI_ROUTING || null;
  // Preserve local/GitHub Pages previews. Only the technical host crosses to the storefront.
  const storefrontBase = routing && base.origin === new URL(routing.technicalBase).origin
    ? new URL(routing.storefrontBase) : base;
  const publicUrl = path => new URL(path, storefrontBase).href;
  const hostedPaymentUrls = Object.freeze({});
  window.COLIBRI_CONFIG = Object.freeze({
    campaignId: 'colibrios-3-evenings-v1',
    offerDeadline: null,
    entryPriceUSD: 19,
    routing,
    storefrontUrl: publicUrl('index.html'),
    tmaUrl: routing?.tmaUrl || publicUrl('tma_magnet/'),
    hostedPaymentUrls,
    paymentUrls: Object.freeze(Object.fromEntries(['vip', 'light', 'pro', 'swarm'].map(product => [product, publicUrl('checkout.html?product=' + product)]))),
    checkoutApiBase: routing?.checkoutApiBase || null,
    telegramLaunchMode: null,
    qualificationEndpoint: null,
    sellerName: "Denys Viet · AI is... & ColibriOS",
    sellerLegalName: null,
    sellerAddress: null,
    sellerTaxId: null,
    supportEmail: null,
    supportUrl: 'https://t.me/AI_is_Channel',
    termsUrl: publicUrl('terms.html'),
    privacyUrl: publicUrl('privacy.html'),
    commercialReady: false
  });
})();
