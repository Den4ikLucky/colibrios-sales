'use strict';
(() => {
  const config = window.COLIBRI_CONFIG || {};
  const products = {
    vip: ["Concentrado de IA grabado · 3 Noches", 19, "Taller digital autoguiado durante 3 noches: módulos de vídeo grabados paso a paso, plantillas de IA listas para usar y diagnósticos de IA por $19. Formato 100% a tu propio ritmo: ve a tu propio ritmo sin horario. El grupo máster se paga aparte. La composición y las normas de acceso están especificadas en la oferta."],
    light: ['ColibriOS Master-Group · Light', 990],
    pro: ['ColibriOS Master-Group · Pro', 1490],
    swarm: ['ColibriOS Master-Group · Sovereign Swarm', 2490]
  };
  const key = new URLSearchParams(location.search).get('product') || 'vip';
  const product = products[key];
  const status = document.getElementById('checkout-status');
  const form = document.getElementById('checkout-form');
  if (!product) { status.textContent = "Tarifa no encontrada. Volver a elegir un formato."; return; }
  document.getElementById('product-title').textContent = product[0];
  document.getElementById('product-price').textContent = new Intl.NumberFormat("en-US", {style:"currency", currency: "USD", maximumFractionDigits:0}).format(product[1]);
  document.getElementById('product-description').textContent = product[2] || "Un formato separado para implementar ColibriOS Master-Group. La composición, condiciones y reglas de acceso se especifican en la oferta. El Concentrado de IA por $19 se compra por separado.";
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
    status.textContent = "El pago aún no está disponible. Conectamos el servicio de pago y emitimos acceso. No es posible retirar dinero de esta página.";
    return;
  }
  document.getElementById('terms-link').href = config.termsUrl;
  document.getElementById('privacy-link').href = config.privacyUrl;
  const emailInput = document.getElementById('email');
  if (!base && hostedUrl && emailInput) {
    emailInput.required = false;
    emailInput.placeholder = "Indíquelo en la página segura Lava.top (o aquí para recibir un recordatorio)";
  }
  status.textContent = "Consulta la tarifa seleccionada y confirma tu aceptación de la oferta. El Visa / Mastercard / Apple Pay / Crypto (código QR) o el pago con tarjeta se abrirán en la página segura Lava.top.";
  form.hidden = false;
  const currency = document.getElementById('currency');
  const method = document.getElementById('method');
  currency.addEventListener('change', () => { method.options[0].disabled = currency.value !== 'RUB'; if (currency.value !== 'RUB') method.value = 'CARD'; });
  let attempt = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!base && hostedUrl) {
      status.textContent = "Vaya a la página de pago seguro Lava.top (Visa / Mastercard / Apple Pay / Crypto / tarjeta)…";
      location.assign(hostedUrl);
      return;
    }
    const payload = { product: key, email: emailInput.value.trim(), currency: currency.value, paymentMethod: method.value };
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) payload.initData = initData;
    const fingerprint = JSON.stringify(payload);
    if (attempt && attempt.fingerprint !== fingerprint) {
      status.textContent = "El resultado de la solicitud anterior aún no ha sido confirmado. Verifique el estado a través de soporte antes de cambiar su pedido.";
      return;
    }
    if (!attempt) attempt = { id: crypto.randomUUID(), fingerprint };
    const button = document.getElementById('pay-button');
    button.disabled = true;
    status.textContent = "Creando una cuenta...";
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
      status.textContent = "La creación de la cuenta no ha sido confirmada. La reproducción utiliza el mismo número de solicitud. Si el pago ya se ha realizado, no vuelvas a pagar: contacta con soporte.";
      button.disabled = false;
    }
  });
})();
