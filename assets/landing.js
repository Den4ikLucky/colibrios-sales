'use strict';
(() => {
  const C = window.Colibri;
  const $ = id => document.getElementById(id);
  const config = window.COLIBRI_CONFIG || {};
  const menu = $('menu-button');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); $('primary-nav').classList.toggle('open', open); });
  $('primary-nav').querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Открыть меню'); $('primary-nav').classList.remove('open'); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { menu.click(); menu.focus(); } });
  C.bindTabs($('program-tabs'));
  let agentTimer;
  $('run-agents').addEventListener('click', () => {
    clearInterval(agentTimer); const agents = [...$('agent-grid').children]; let index = 0;
    agents.forEach(a => a.classList.remove('active')); $('run-agents').disabled = true;
    function step() { agents.forEach((a, i) => a.classList.toggle('active', i === index)); $('console-event').textContent = '> ' + String(index + 1) + ' / ' + agents[index].textContent.trim() + ': принимает свой участок работы'; index++; if (index >= agents.length) { clearInterval(agentTimer); $('run-agents').disabled = false; $('console-event').textContent = '> 12 ролей → результат у проверяющего → ждём ваше «ДА»'; } }
    step(); agentTimer = setInterval(step, matchMedia('(prefers-reduced-motion: reduce)').matches ? 40 : 280);
  });
  let mode = 'b2b';
  const calcIds = ['employees', 'hours', 'rate', 'recovery', 'operating', 'investment', 'coi-track', 'coi-leads', 'coi-conv', 'coi-margin'];
  const modeValues = { b2b: { employees: 12, hours: 1.5 }, creator: { employees: 1, hours: 15 } };
  function inputNumber(id, min, max) { return C.bounded($(id).value === '' ? NaN : $(id).value, min, max, 0); }
  function calculate() {
    const employees = mode === 'b2b' ? inputNumber('employees', 1, 50) : 1;
    const hours = inputNumber('hours', 0, mode === 'b2b' ? 8 : 60);
    const rate = inputNumber('rate', 100, 5000);
    const recovery = inputNumber('recovery', 0, 100);
    const operating = inputNumber('operating', 0, 1000000);
    const investment = inputNumber('investment', 990, 450000);
    const r = C.routineModel({ employees, hours, rate, recovery, operating, investment, days: mode === 'b2b' ? 22 : 4.3 });
    $('employees-out').textContent = C.number(employees);
    $('hours-out').textContent = C.number(hours);
    $('rate-out').textContent = C.number(rate);
    $('monthly-cost').textContent = C.money(r.routineCost); $('annual-cost').textContent = C.money(r.annualCost); $('monthly-hours').textContent = C.number(r.monthlyHours) + ' ч'; $('net-effect').textContent = C.money(r.net); $('payback').textContent = r.payback === null ? 'Не достигается' : (r.payback < 0.1 ? '< 0,1' : C.number(r.payback)) + ' мес.';
    $('formula-text').textContent = (mode === 'b2b' ? C.number(employees) + ' × ' : '') + C.number(hours) + ' × ' + C.number(rate) + ' × ' + (mode === 'b2b' ? '22' : '4,3') + ' = ' + C.money(r.routineCost);
    const track = C.tracks.find(t => t.id === $('coi-track').value) || C.tracks[0]; $('track-name').textContent = track.name; $('track-start').textContent = track.start;
    const coi = inputNumber('coi-leads', 0, 100000) * inputNumber('coi-conv', 0, 100) / 100 * inputNumber('coi-margin', 0, 10000000); $('coi-cost').textContent = C.money(coi) + ' / мес.';
  }
  calcIds.forEach(id => $(id).addEventListener('input', calculate));
  $('calc-mode').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    modeValues[mode] = { employees: Number($('employees').value), hours: Number($('hours').value) }; mode = button.dataset.mode;
    $('calc-mode').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('employees').closest('.field').hidden = mode === 'creator'; $('hours').max = mode === 'b2b' ? '8' : '60'; $('hours').step = mode === 'b2b' ? '0.25' : '1'; $('employees').value = modeValues[mode].employees; $('hours').value = modeValues[mode].hours;
    $('hours-label').textContent = mode === 'b2b' ? 'Рутина каждого, часов в день' : 'Ваша рутина, часов в неделю'; $('mode-hint').textContent = mode === 'b2b' ? 'Для команды: люди × часы в день × стоимость часа × 22 рабочих дня' : 'Для автора: часы в неделю × стоимость часа × 4,3 недели в месяце. Не суммируйте уже учтённые часы'; C.haptic(); calculate();
  })); calculate();

  // The same persisted deadline is used on every visit. The server owns actual eligibility.
  const windowMs = 48 * 60 * 60 * 1000;
  const timerKey = 'offer.' + (config.campaignId || 'default');
  let offer = C.store.get(timerKey);
  const configuredDeadline = typeof config.offerDeadline === 'string' ? Date.parse(config.offerDeadline) : NaN;
  let durable = true;
  if (Number.isFinite(configuredDeadline)) { offer = { end: configuredDeadline, lastSeen: Date.now(), fixed: true }; }
  else if (!offer || !Number.isFinite(offer.end) || !Number.isFinite(offer.lastSeen)) { offer = { end: Date.now() + windowMs, lastSeen: Date.now(), fixed: false }; durable = C.store.set(timerKey, offer); }
  function tick() {
    const now = Math.max(Date.now(), offer.lastSeen); offer.lastSeen = now;
    const remaining = Math.max(0, offer.end - now); const seconds = Math.floor(remaining / 1000);
    // taste-skill-ignore: clock fields use zero padding, not decorative numbering.
    $('timer-hours').textContent = String(Math.floor(seconds / 3600)).padStart(2, '0'); $('timer-minutes').textContent = String(Math.floor(seconds / 60) % 60).padStart(2, '0'); $('timer-seconds').textContent = String(seconds % 60).padStart(2, '0');
    if (!remaining) { $('countdown-note').textContent = 'Окно завершено. Тарифы доступны, условия апгрейда уточните до оплаты'; $('light-upgrade').textContent = 'Окно апгрейда завершено'; }
    else if (!durable) $('countdown-note').textContent = 'Хранилище недоступно: таймер только для текущей вкладки, право на акцию подтверждает куратор';
    else if (offer.fixed) $('countdown-note').textContent = 'Окно до ' + new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(offer.end) + ' по времени устройства. Право на апгрейд подтверждается отдельно';
    else $('countdown-note').textContent = 'Личное ознакомительное окно на этом устройстве. Не резерв участия и не подтверждение скидки';
    if (!remaining) clearInterval(countdownInterval);
  }
  let countdownInterval = setInterval(tick, 1000); tick();
  document.addEventListener('visibilitychange', () => { C.store.set(timerKey, offer); if (!document.hidden) tick(); });
  window.addEventListener('pagehide', () => C.store.set(timerKey, offer));

  const tiers = {
    vip: { name: 'ИИ-Концентрат', price: 990, description: 'Программа трёх вечеров, стартовые скиллы и задания. Даты и доступы подтверждаются продавцом до оплаты.' },
    light: { name: 'Light Tier', price: 79990, description: 'Команда ролей, база проекта и контентный процесс. Условия 48-часового апгрейда до Pro нужно подтвердить отдельно до платежа.' },
    pro: { name: 'Pro Tier', price: 119990, description: 'Light плюс TMA, воронки, контент-завод пяти форматов и контроль качества. Комплектация и сроки фиксируются в оферте.' },
    swarm: { name: 'Sovereign Swarm', price: 199990, description: 'Pro плюс архитектурный разбор с Татьяной и Денисом и план суверенного контура. Объём работ и инфраструктурные расходы согласуются отдельно.' }
  };
  function internalPageUrl(value, path) {
    const local = C.trustedUrl(value, true);
    if (local) return local;
    const allowed = /^(?:checkout\.html\?product=(?:vip|light|pro|swarm)|terms\.html|privacy\.html)$/.test(path);
    const pages = window.COLIBRI_PAGE_URLS;
    if (!allowed || window.COLIBRI_PORTABLE_PREVIEW !== true || !pages || !Object.prototype.hasOwnProperty.call(pages, path)) return null;
    const expected = new URL(path, 'https://den4iklucky.github.io/colibrios-sales/').href;
    return C.trustedUrl(pages[path]) === expected && C.trustedUrl(value) === expected ? expected : null;
  }
  let selectedTier = 'vip';
  document.querySelectorAll('[data-order]').forEach(button => button.addEventListener('click', () => {
    selectedTier = button.dataset.order; const tier = tiers[selectedTier]; $('order-tier').textContent = tier.name; $('order-title').textContent = 'Ваш формат: ' + tier.name; $('order-price').textContent = C.money(tier.price); $('order-description').textContent = tier.description;
    const url = internalPageUrl(config.paymentUrls?.[selectedTier], 'checkout.html?product=' + selectedTier); const legalReady = Boolean(config.sellerName && internalPageUrl(config.termsUrl, 'terms.html') && internalPageUrl(config.privacyUrl, 'privacy.html'));
    $('pay-link').hidden = !(url && legalReady); if (url && legalReady) $('pay-link').href = url; else $('pay-link').removeAttribute('href');
    $('payment-status').textContent = url && legalReady ? 'Откроется оформление: проверьте доступность оплаты, продавца и условия. Карточка заказа сама по себе не является оплатой.' : 'Оплата ещё не активирована: не заданы подтверждённые платёжные и правовые реквизиты. Можно скачать карточку выбранного формата; она никуда не отправится.';
    $('order-dialog').showModal();
  }));
  $('export-order').addEventListener('click', () => { const tier = tiers[selectedTier]; C.download('ColibriOS-' + selectedTier + '-order.json', JSON.stringify({ schema: 'colibrios.order.v1', tier: selectedTier, name: tier.name, amountRUB: tier.price, status: 'draft_not_paid_not_reserved', createdAt: new Date().toISOString(), upgradeEligibility: 'requires_operator_confirmation' }, null, 2), 'application/json'); C.toast('Карточка скачана. Оплата и бронь не созданы'); });
  if (config.sellerName) $('seller-notice').textContent = String(config.sellerName) + '. Перед оплатой ознакомьтесь с офертой и политикой данных. Сценарные расчёты не гарантируют доход.';

  const endpoint = C.trustedUrl(config.qualificationEndpoint, true);
  const leadReady = endpoint && config.sellerName && C.trustedUrl(config.privacyUrl);
  $('b2b-submit').textContent = leadReady ? 'Отправить заявку на диагностику' : 'Скачать заявку для передачи';
  if (leadReady) $('consent-text').firstChild.textContent = 'Согласен отправить указанные данные оператору ' + String(config.sellerName) + ' для ответа на заявку. ';
  function openB2B() { $('b2b-status').textContent = ''; $('b2b-dialog').showModal(); }
  $('open-b2b').addEventListener('click', openB2B);
  $('b2b-contact').addEventListener('input', () => $('b2b-contact').setCustomValidity(''));
  $('b2b-form').addEventListener('submit', async e => {
    e.preventDefault(); const form = e.currentTarget; const contact = $('b2b-contact').value.trim();
    if (!/^@[A-Za-z0-9_]{5,32}$/.test(contact) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) { $('b2b-contact').setCustomValidity('Укажите Telegram @username от 5 символов или email'); $('b2b-contact').reportValidity(); return; }
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form)); ['name', 'contact', 'business', 'process', 'attempts', 'goal'].forEach(key => data[key] = data[key].trim());
    if (data.name.length < 2 || data.business.length < 3 || data.process.length < 20 || data.attempts.length < 10 || data.goal.length < 10) { $('b2b-status').textContent = 'Заполните ответы содержательно, не только пробелами'; return; }
    const payload = { schema: 'colibrios.qualification.v1', source: 'landing', offer: 'b2b_turnkey_450000', createdAt: new Date().toISOString(), ...data, consent: true };
    if (!leadReady) { C.download('ColibriOS-B2B-application.json', JSON.stringify({ ...payload, status: 'local_draft_not_sent' }, null, 2), 'application/json'); $('b2b-status').textContent = 'Файл заявки скачан на ваше устройство. Он не отправлен Татьяне и Денису. Передайте его через согласованный канал связи'; return; }
    const button = $('b2b-submit'); button.disabled = true; $('b2b-status').textContent = 'Отправляем на настроенный обработчик…';
    try { const response = await fetch(endpoint, { method: 'POST', mode: 'same-origin', credentials: 'same-origin', redirect: 'error', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) }); if (!response.ok) throw new Error('HTTP ' + response.status); const receipt = await response.json(); if (typeof receipt.receiptId !== 'string' || !receipt.receiptId.trim()) throw new Error('No receipt'); $('b2b-status').textContent = 'Обработчик принял заявку. ID: ' + receipt.receiptId.slice(0, 120) + '. Ожидайте отдельного подтверждения команды'; form.reset(); }
    catch { $('b2b-status').textContent = 'Получение заявки не подтверждено. Не отправляйте повторно вслепую: проверьте связь с командой или скачайте ответы'; const fallback = document.createElement('button'); fallback.type = 'button'; fallback.className = 'btn secondary compact'; fallback.textContent = 'Скачать мои ответы'; fallback.addEventListener('click', () => C.download('ColibriOS-B2B-application.json', JSON.stringify({ ...payload, status: 'delivery_unconfirmed' }, null, 2), 'application/json')); $('b2b-status').append(document.createElement('br'), fallback); }
    finally { button.disabled = false; }
  });
  function privacy() { $('privacy-dialog').showModal(); }
  $('privacy-button').addEventListener('click', privacy); $('form-privacy').addEventListener('click', () => { const url = C.trustedUrl(config.privacyUrl); if (url) window.open(url, '_blank', 'noopener,noreferrer'); else privacy(); });
  if (new URLSearchParams(location.search).get('route') === 'b2b') openB2B();

})();
