'use strict';
(() => {
  const config = window.COLIBRI_CONFIG || {};
  const products = {
    vip: ['ИИ-Концентрат на 3 вечера', 990],
    light: ['ColibriOS Master-Group · Light', 79990],
    pro: ['ColibriOS Master-Group · Pro', 119990],
    swarm: ['ColibriOS Master-Group · Sovereign Swarm', 199990]
  };
  const key = new URLSearchParams(location.search).get('product') || 'vip';
  const product = products[key];
  const status = document.getElementById('checkout-status');
  const form = document.getElementById('checkout-form');
  if (!product) { status.textContent = 'Тариф не найден. Вернитесь к выбору формата.'; return; }
  document.getElementById('product-title').textContent = product[0];
  document.getElementById('product-price').textContent = new Intl.NumberFormat('ru-RU').format(product[1]) + ' ₽';
  const support = document.getElementById('support-link');
  if (config.supportUrl && /^https:\/\//.test(config.supportUrl)) { support.href = config.supportUrl; support.hidden = false; }
  else if (config.supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)) { support.href = 'mailto:' + config.supportEmail; support.hidden = false; }
  let base;
  try { base = new URL(config.checkoutApiBase); if (base.protocol !== 'https:') base = null; } catch { base = null; }
  if (!base || config.commercialReady !== true) {
    status.textContent = 'Оплата пока недоступна. Подключаем платёжный сервис и выдачу доступа. Списание денег на этой странице невозможно.';
    return;
  }
  document.getElementById('terms-link').href = config.termsUrl;
  document.getElementById('privacy-link').href = config.privacyUrl;
  status.textContent = 'Проверьте формат. СБП QR или оплата картой откроются на странице Lava.top.';
  form.hidden = false;
  const currency = document.getElementById('currency');
  const method = document.getElementById('method');
  currency.addEventListener('change', () => { method.options[0].disabled = currency.value !== 'RUB'; if (currency.value !== 'RUB') method.value = 'CARD'; });
  let attempt = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const payload = { product: key, email: document.getElementById('email').value.trim(), currency: currency.value, paymentMethod: method.value };
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) payload.initData = initData;
    const fingerprint = JSON.stringify(payload);
    if (attempt && attempt.fingerprint !== fingerprint) {
      status.textContent = 'Исход предыдущего запроса ещё не подтверждён. Уточните статус через поддержку перед изменением заказа.';
      return;
    }
    if (!attempt) attempt = { id: crypto.randomUUID(), fingerprint };
    const button = document.getElementById('pay-button');
    button.disabled = true;
    status.textContent = 'Создаём счёт…';
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
      status.textContent = 'Создание счёта не подтверждено. Повтор использует тот же номер запроса. Если платёж уже выполнен, не оплачивайте снова: обратитесь в поддержку.';
      button.disabled = false;
    }
  });
})();
