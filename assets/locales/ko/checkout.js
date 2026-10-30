'use strict';
(() => {
  const config = window.COLIBRI_CONFIG || {};
  const products = {
    vip: ["AI 집중 마스터클래스 (AI Concentrate) · 3일 저녁 · 녹화 과정", 19, "3일 저녁 셀프 가이드 디지털 워크숍: 녹화된 단계별 비디오 모듈, 기성 AI 템플릿 및 $19의 AI 진단. 100% 자기 주도형 형식: 일정 없이 원하는 속도로 진행됩니다. 마스터 그룹은 별도로 지불됩니다. 구성 및 액세스 규칙은 제안에 지정됩니다."],
    light: ['ColibriOS Master-Group · Light', 990],
    pro: ['ColibriOS Master-Group · Pro', 1490],
    swarm: ['ColibriOS Master-Group · Sovereign Swarm', 2490]
  };
  const key = new URLSearchParams(location.search).get('product') || 'vip';
  const product = products[key];
  const status = document.getElementById('checkout-status');
  const form = document.getElementById('checkout-form');
  if (!product) { status.textContent = "관세를 찾을 수 없습니다. 형식 선택으로 돌아갑니다."; return; }
  document.getElementById('product-title').textContent = product[0];
  document.getElementById('product-price').textContent = new Intl.NumberFormat("en-US", {style:"currency", currency: "USD", maximumFractionDigits:0}).format(product[1]);
  document.getElementById('product-description').textContent = product[2] || "ColibriOS 마스터 그룹을 구현하기 위한 별도의 형식입니다. 구성, 조건 및 액세스 규칙은 제안에 명시되어 있습니다. $19의 AI 집중 마스터클래스 (AI Concentrate)은 별도로 구매됩니다.";
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
    status.textContent = "아직 결제가 불가능합니다. 결제 서비스를 연결하고 액세스 권한을 발급합니다. 이 페이지에서는 돈을 인출할 수 없습니다.";
    return;
  }
  document.getElementById('terms-link').href = config.termsUrl;
  document.getElementById('privacy-link').href = config.privacyUrl;
  const emailInput = document.getElementById('email');
  if (!base && hostedUrl && emailInput) {
    emailInput.required = false;
    emailInput.placeholder = "안전한 Lava.top 페이지(또는 알림을 위해 여기)에 표시하세요.";
  }
  status.textContent = "선택한 관세를 확인하고 제안에 대한 수락을 확인하세요. Visa / Mastercard / Apple Pay / Crypto 또는 카드 결제는 안전한 Lava.top 페이지에서 열립니다.";
  form.hidden = false;
  const currency = document.getElementById('currency');
  const method = document.getElementById('method');
  currency.addEventListener('change', () => { method.options[0].disabled = currency.value !== 'RUB'; if (currency.value !== 'RUB') method.value = 'CARD'; });
  let attempt = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!base && hostedUrl) {
      status.textContent = "보안결제 페이지 Lava.top(Visa / Mastercard / Apple Pay / Crypto/카드)으로 이동…";
      location.assign(hostedUrl);
      return;
    }
    const payload = { product: key, email: emailInput.value.trim(), currency: currency.value, paymentMethod: method.value };
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) payload.initData = initData;
    const fingerprint = JSON.stringify(payload);
    if (attempt && attempt.fingerprint !== fingerprint) {
      status.textContent = "이전 요청의 결과는 아직 확인되지 않았습니다. 주문을 변경하기 전에 지원을 통해 상태를 확인하세요.";
      return;
    }
    if (!attempt) attempt = { id: crypto.randomUUID(), fingerprint };
    const button = document.getElementById('pay-button');
    button.disabled = true;
    status.textContent = "계정을 만드는 중...";
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
      status.textContent = "계정 생성이 확인되지 않았습니다. 재생에서는 동일한 요청 번호를 사용합니다. 이미 결제한 경우 다시 결제하지 마세요. 지원팀에 문의하세요.";
      button.disabled = false;
    }
  });
})();
