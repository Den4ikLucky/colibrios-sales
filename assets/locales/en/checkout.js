'use strict';
(() => {
  const config = window.COLIBRI_CONFIG || {};
  const products = {
    vip: ["3-Evening Recorded AI Concentrate", 19, "Self-guided digital workshop for 3 evenings: recorded step-by-step video modules, ready-made AI templates and AI diagnostics for $19. 100% self-paced format: go at your own pace without a schedule. The master group is paid separately. The composition and access rules are specified in the offer."],
    light: ['ColibriOS Master-Group · Light', 990],
    pro: ['ColibriOS Master-Group · Pro', 1490],
    swarm: ['ColibriOS Master-Group · Sovereign Swarm', 2490]
  };
  const key = new URLSearchParams(location.search).get('product') || 'vip';
  const product = products[key];
  const status = document.getElementById('checkout-status');
  const form = document.getElementById('checkout-form');
  if (!product) { status.textContent = "Tariff not found. Return to choosing a format."; return; }
  document.getElementById('product-title').textContent = product[0];
  document.getElementById('product-price').textContent = new Intl.NumberFormat("en-US", {style:"currency", currency: "USD", maximumFractionDigits:0}).format(product[1]);
  document.getElementById('product-description').textContent = product[2] || "A separate format for implementing ColibriOS Master-Group. The composition, terms and rules of access are specified in the offer. AI Concentrate for $19 is purchased separately.";
  const support = document.getElementById('support-link');
  if (config.supportUrl && /^https:\/\//.test(config.supportUrl)) { support.href = config.supportUrl; support.hidden = false; }
  else if (config.supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)) { support.href = 'mailto:' + config.supportEmail; support.hidden = false; }
  let base;
  try { base = config.checkoutApiBase ? new URL(config.checkoutApiBase) : null; if (base && base.protocol !== 'https:') base = null; } catch { base = null; }
  let hostedUrl = null;
  try {
    const rawHosted = config.hostedPaymentUrls?.[key];
    if (rawHosted) {
      const parsedHosted = new URL(rawHosted);
      if (parsedHosted.protocol === 'https:' && (parsedHosted.hostname === 'lava.top' || parsedHosted.hostname.endsWith('.lava.top'))) {
        hostedUrl = parsedHosted.href;
      }
    }
  } catch { hostedUrl = null; }
  if ((!base && !hostedUrl) || config.commercialReady !== true) {
    status.textContent = "Payment is not yet available. We connect the payment service and issue access. It is not possible to withdraw money from this page.";
    return;
  }
  document.getElementById('terms-link').href = config.termsUrl;
  document.getElementById('privacy-link').href = config.privacyUrl;
  const emailInput = document.getElementById('email');
  if (!base && hostedUrl && emailInput) {
    emailInput.required = false;
    emailInput.placeholder = "Indicate on the secure Lava.top page (or here for a reminder)";
  }
  status.textContent = "Check the selected tariff and confirm your acceptance of the offer. Visa / Mastercard / Apple Pay / Crypto or card payment will open on the secure Lava.top page.";
  form.hidden = false;
  const currency = document.getElementById('currency');
  const method = document.getElementById('method');
  currency.addEventListener('change', () => { method.options[0].disabled = currency.value !== 'RUB'; if (currency.value !== 'RUB') method.value = 'CARD'; });
  let attempt = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!base && hostedUrl) {
      status.textContent = "Go to the secure payment page Lava.top (Visa / Mastercard / Apple Pay / Crypto / card)…";
      location.assign(hostedUrl);
      return;
    }
    const payload = { product: key, email: emailInput.value.trim(), currency: currency.value, paymentMethod: method.value };
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) payload.initData = initData;
    const fingerprint = JSON.stringify(payload);
    if (attempt && attempt.fingerprint !== fingerprint) {
      status.textContent = "The outcome of the previous request has not yet been confirmed. Check the status through support before changing your order.";
      return;
    }
    if (!attempt) attempt = { id: crypto.randomUUID(), fingerprint };
    const button = document.getElementById('pay-button');
    button.disabled = true;
    status.textContent = "Creating an account...";
    try {
      const response = await fetch(new URL('api/checkout', base.href.endsWith('/') ? base : base.href + '/'), {
        method: 'POST', credentials: 'omit', redirect: 'error',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': attempt.id },
        body: fingerprint, signal: AbortSignal.timeout(25000)
      });
      const result = await response.json();
      if (!response.ok) throw new Error('checkout_unconfirmed');
      const payment = new URL(result.paymentUrl);
      if (payment.protocol !== 'https:' || !(payment.hostname === 'lava.top' || payment.hostname.endsWith('.lava.top'))) throw new Error('invalid_payment_url');
      location.assign(payment.href);
    } catch {
      if (hostedUrl) {
        location.assign(hostedUrl);
        return;
      }
      status.textContent = "Account creation has not been confirmed. Replay uses the same request number. If the payment has already been made, do not pay again: contact support.";
      button.disabled = false;
    }
  });
})();
