'use strict';
(() => {
  const C = window.Colibri;
  const $ = id => document.getElementById(id);
  let tg = null; let telegramBooted = false;
  // Tier 0 never receives paid instructions or grants access from browser state.
  $('codeword-form').addEventListener('submit', event => {
    event.preventDefault();
    const word = $('codeword').value.trim().toLocaleLowerCase('ru');
    if (!['хочу', 'старт', 'колибри'].includes(word)) {
      $('codeword-status').textContent = 'Введите ХОЧУ или СТАРТ, чтобы открыть бесплатную диагностику';
      return;
    }
    $('codeword-status').textContent = 'Диагностика открыта. Модули 02–06 остаются закрыты до подтверждённой оплаты';
    $('safe-to-scan').click();
  });
  const selectAppTab = C.bindTabs($('app-tabs'), { onChange(tab) { C.store.set('activeTab', tab.id); if (document.activeElement?.closest('.bottom-rail')) window.scrollTo({ top: 0, behavior: 'instant' }); } });
  $('safe-to-scan').addEventListener('click', e => { e.preventDefault(); selectAppTab($('scan-tab')); window.scrollTo({ top: 0, behavior: 'instant' }); $('scan-panel').focus({ preventScroll: true }); });
  const requestedTab = new URLSearchParams(location.search).get('tab');
  if (requestedTab === 'scan' || (!requestedTab && C.store.get('activeTab') === 'scan-tab')) selectAppTab($('scan-tab'));

  // No contact fields are persisted. Only the finite, numeric/enum diagnostic draft.
  const draftFields = ['scan-track', 'scan-employees', 'scan-hours', 'scan-rate', 'scan-recovery', 'scan-operating', 'risk-context', 'risk-content', 'risk-leads', 'risk-sales', 'risk-docs', 'risk-quality', 'scan-owner', 'scan-product'];
  let currentStep = 0; let completed = false; let result = null;
  const saved = C.store.get('scanDraft');
  if (saved && saved.version === 1 && ['creator', 'b2b'].includes(saved.role)) {
    document.querySelector('input[name=role][value=' + saved.role + ']').checked = true;
    draftFields.forEach(id => { const el = $(id); const value = saved.values?.[id]; if (typeof value !== 'string' || value.length > 50) return; if (el.tagName === 'SELECT') { if ([...el.options].some(option => option.value === value)) el.value = value; } else if (value !== '' && Number.isFinite(Number(value))) el.value = value; });
    currentStep = Math.floor(C.bounded(saved.step, 0, 3)); completed = saved.completed === true;
  }
  function role() { return document.querySelector('input[name=role]:checked').value; }
  function syncRole(resetHours = false) {
    const b2b = role() === 'b2b'; $('scan-employees-field').hidden = !b2b; $('scan-employees').disabled = !b2b;
    $('scan-hours-label').textContent = b2b ? 'Рутина каждого, часов в день' : 'Рутина, часов в неделю'; $('scan-formula-note').textContent = b2b ? 'Для команды: люди × часы в день × стоимость часа × 22 рабочих дня' : 'Для автора: ваши часы в неделю × 4,3 недели × стоимость часа';
    $('scan-hours').max = b2b ? '8' : '80'; $('scan-hours').step = b2b ? '0.25' : '0.5';
    if (resetHours) { $('scan-hours').value = b2b ? '1.5' : '15'; $('scan-employees').value = b2b ? '12' : '1'; }
  }
  function saveDraft() { const values = Object.fromEntries(draftFields.map(id => [id, $(id).value])); C.store.set('scanDraft', { version: 1, role: role(), values, step: currentStep, completed }); }
  function setStep(step, focus = false) { currentStep = C.bounded(step, 0, 3); for (let i = 0; i < 4; i++) $('scan-step-' + i).hidden = i !== currentStep; $('step-label').textContent = 'ШАГ ' + String(currentStep + 1).padStart(2, '0') + ' / 04'; $('wizard-progress').style.width = ((currentStep + 1) / 4 * 100) + '%'; $('scan-back').hidden = currentStep === 0; $('scan-next').textContent = currentStep === 3 ? 'Получить мой расчёт ↗' : 'Продолжить ↗'; $('scan-error').textContent = ''; if (focus) $('scan-step-' + currentStep).querySelector('h2').focus({ preventScroll: false }); saveDraft(); }
  function validStep() { const controls = [...$('scan-step-' + currentStep).querySelectorAll('input,select')].filter(input => !input.disabled && input.offsetParent !== null); const bad = controls.find(input => !input.checkValidity()); if (bad) { $('scan-error').textContent = 'Проверьте значение: ' + (document.querySelector('label[for="' + bad.id + '"]')?.textContent || 'поле'); bad.reportValidity(); return false; } return true; }
  document.querySelectorAll('input[name=role]').forEach(input => input.addEventListener('change', () => { syncRole(true); completed = false; saveDraft(); }));
  $('scan-form').addEventListener('input', () => { completed = false; saveDraft(); });
  $('scan-form').addEventListener('change', () => { completed = false; saveDraft(); });
  $('scan-form').addEventListener('submit', e => { e.preventDefault(); $('scan-next').click(); });
  $('scan-back').addEventListener('click', () => { setStep(currentStep - 1, true); C.haptic(); });
  $('scan-next').addEventListener('click', () => { if (!validStep()) return; if (currentStep < 3) setStep(currentStep + 1, true); else { completed = true; renderResult(); saveDraft(); } C.haptic(); });
  const risks = [
    { id: 'risk-context', name: 'контекст и база знаний' },
    { id: 'risk-content', name: 'контент и выпуск' },
    { id: 'risk-leads', name: 'заявки и первый ответ' },
    { id: 'risk-sales', name: 'продажи и передачи' },
    { id: 'risk-docs', name: 'документы и финансы' },
    { id: 'risk-quality', name: 'контроль и приёмка' }
  ];
  function valuesAreValid() {
    return draftFields.every(id => { const el = $(id); return el.disabled || el.checkValidity(); });
  }
  function renderResult() {
    if (!valuesAreValid()) { completed = false; $('wizard').hidden = false; $('scan-result').hidden = true; setStep(1); $('scan-error').textContent = 'Сохранённые числа требуют проверки. Уточните параметры'; return; }
    const b2b = role() === 'b2b'; const employees = b2b ? Number($('scan-employees').value) : 1; const hours = Number($('scan-hours').value); const rate = Number($('scan-rate').value); const recovery = Number($('scan-recovery').value); const operating = Number($('scan-operating').value); const days = b2b ? 22 : 4.3;
    const base = C.routineModel({ employees, hours, rate, recovery, operating, investment: 0, days });
    const ready = $('scan-owner').value !== 'none'; const productExists = $('scan-product').value === 'yes';
    const route = b2b && employees >= 5 && base.routineCost >= 100000 && ready && productExists ? 'b2b' : 'vip'; const investment = route === 'b2b' ? 450000 : 990;
    const model = C.routineModel({ employees, hours, rate, recovery, operating, investment, days });
    const ratings = risks.map(r => C.bounded($(r.id).value, 0, 2)); const riskSum = ratings.reduce((a, b) => a + b, 0); const score = Math.round(100 - riskSum / 12 * 100); const maxRisk = Math.max(...ratings); const priority = risks[ratings.indexOf(maxRisk)]; const track = C.tracks.find(t => t.id === $('scan-track').value) || C.tracks[0];
    result = { schema: 'colibrios.scan.v1', source: 'tier0_diagnostic', role: role(), track: track.id, employees, hours, hourlyRateRUB: rate, daysFactor: days, recoveryPercent: recovery, operatingRUB: operating, monthlyRoutineHours: model.monthlyHours, monthlyRoutineCostRUB: model.routineCost, monthlyPotentialNetRUB: model.net, recoverableHours: model.monthlyHours * recovery / 100, score, riskRatings: Object.fromEntries(risks.map((r, i) => [r.id, ratings[i]])), bottleneck: maxRisk > 0 ? priority.id : null, route, investmentRUB: investment, paybackMonths: model.payback, assumptions: 'scenario_not_guaranteed_cash_savings', ownership: $('scan-owner').value, existingProcess: $('scan-product').value };
    $('scan-score').textContent = score; $('scan-monthly').textContent = C.money(model.routineCost); $('scan-capacity').textContent = C.money(model.net); $('scan-payback').textContent = model.payback === null ? 'Не достигается' : (model.payback < 0.1 ? '< 0,1' : C.number(model.payback)) + ' мес.'; $('scan-time').textContent = C.number(result.recoverableHours) + ' ч'; $('scan-year').textContent = C.money(model.annualCost);
    $('scan-bottleneck').textContent = maxRisk === 0 ? 'контрольный пилот' : priority.name;
    $('scan-first-step').textContent = (maxRisk === 0 ? 'Вы не отметили явных сбоев. ' : 'По вашим ответам первый риск: ' + priority.name + '. При равной оценке приоритет получает первый участок карты. ') + 'Ваше направление: ' + track.name + '. Это диагностика потерь, а не инструкция внедрения. Практика и материалы модулей 02–06 доступны в платном Концентрате от 990 ₽.';
    $('scan-arithmetic').textContent = 'Расчёт: ' + (b2b ? C.number(employees) + ' × ' : '') + C.number(hours) + ' × ' + C.number(rate) + ' × ' + C.number(days) + ' = ' + C.money(model.routineCost) + '/мес. Потенциал: ' + C.money(model.routineCost) + ' × ' + C.number(recovery) + '% − ' + C.money(operating) + ' = ' + C.money(model.net) + '/мес. Окупаемость выбранного варианта: ' + C.money(investment) + ' / положительный потенциал. Время внедрения и налоги не включены.';
    $('scan-route-title').textContent = route === 'b2b' ? 'Ваш маршрут: диагностика B2B-процесса' : 'Ваш маршрут: начать с Концентрата';
    $('scan-route-reason').textContent = route === 'b2b' ? 'Есть команда, существующая задача и ответственный, а стоимость занятых часов превышает порог. Обсудите с Денисом и Татьяной объём внедрения за 450 000 ₽. Заявка на разговор не равна покупке.' : 'Сначала проверьте один сценарий на практике за 990 ₽. Для внедрения под ключ нужны процесс, владелец и подтверждённая экономика. Расчёт не обещает окупаемость обучения.';
    $('scan-route-link').textContent = route === 'b2b' ? 'Обсудить внедрение · 450 000 ₽ ↗' : 'Концентрат на 3 вечера · 990 ₽ ↗'; $('scan-route-link').href = route === 'b2b'
      ? new URL('?from=scan&route=b2b#b2b', window.COLIBRI_CONFIG?.storefrontUrl || new URL('../web/index.html', location.href)).href
      : window.COLIBRI_CONFIG?.paymentUrls?.vip || '../web/checkout.html?product=vip';
    $('wizard').hidden = true; $('scan-result').hidden = false; $('scan-result').focus({ preventScroll: true }); $('scan-result').scrollIntoView({ block: 'start', behavior: 'instant' }); updateTelegramSend();
  }
  $('scan-export').addEventListener('click', () => { if (result) C.download('ColibriOS-ROI-diagnostic.json', JSON.stringify({ ...result, exportedAt: new Date().toISOString(), status: 'local_not_sent' }, null, 2), 'application/json'); });
  $('scan-restart').addEventListener('click', () => { completed = false; $('scan-result').hidden = true; $('wizard').hidden = false; setStep(0, true); });
  $('scan-clear').addEventListener('click', () => { C.store.remove('scanDraft'); $('scan-form').reset(); completed = false; currentStep = 0; result = null; syncRole(true); $('scan-result').hidden = true; $('wizard').hidden = false; setStep(0); C.store.remove('scanDraft'); C.toast('Ответы диагностики удалены с устройства'); });
  syncRole(); setStep(currentStep); if (completed) renderResult();

  function telegramSafeAreas() {
    if (!tg) return; const a = tg.safeAreaInset || {}; const b = tg.contentSafeAreaInset || {};
    document.documentElement.style.setProperty('--tg-safe-top', Math.max(0, Number(a.top) || 0, Number(b.top) || 0) + 'px'); document.documentElement.style.setProperty('--tg-safe-bottom', Math.max(0, Number(a.bottom) || 0, Number(b.bottom) || 0) + 'px');
  }
  function canSendData() { return Boolean(tg && tg.platform && tg.platform !== 'unknown' && typeof tg.sendData === 'function' && window.COLIBRI_CONFIG?.telegramLaunchMode === 'keyboard'); }
  function updateTelegramSend() { const can = canSendData(); $('scan-send').hidden = !can; $('scan-send-note').textContent = can ? 'По этой кнопке отправится только обезличенный расчёт. Telegram закроет Mini App; получение подтверждает сам бот' : 'Автоотправка недоступна: sendData работает только при запуске через KeyboardButton, подтверждённом конфигурацией. Можно скачать расчёт'; }
  function bootTelegram() {
    if (telegramBooted || !window.Telegram?.WebApp) return;
    tg = window.Telegram.WebApp;
    if (!tg.platform || tg.platform === 'unknown') { updateTelegramSend(); return; }
    telegramBooted = true;
    try { tg.ready(); tg.expand(); if (tg.isVersionAtLeast?.('7.7') && typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes(); if (tg.isVersionAtLeast?.('6.1')) { tg.setHeaderColor?.('#050508'); tg.setBackgroundColor?.('#050508'); } telegramSafeAreas(); tg.onEvent?.('safeAreaChanged', telegramSafeAreas); tg.onEvent?.('contentSafeAreaChanged', telegramSafeAreas); tg.onEvent?.('viewportChanged', telegramSafeAreas); $('container-status').textContent = 'Telegram Mini App · данные локально'; }
    catch { $('container-status').textContent = 'Telegram: часть функций недоступна'; }
    updateTelegramSend();
  }
  $('scan-send').addEventListener('click', () => {
    if (!result || !canSendData()) { C.toast('Нужен подтверждённый запуск через кнопку бота'); return; }
    const payload = JSON.stringify({ ...result, source: 'telegram_keyboard_safe' });
    if (new TextEncoder().encode(payload).length > 4096) { C.toast('Расчёт слишком большой для sendData. Скачайте файл'); return; }
    try { tg.sendData(payload); $('scan-send-note').textContent = 'Метод Telegram вызван. Получение данных подтверждает бот, а не эта страница'; }
    catch { C.toast('Отправка не подтверждена. Скачайте расчёт'); }
  });
  const sdk = document.querySelector('script[src*="telegram-web-app.js"]'); sdk?.addEventListener('load', bootTelegram); bootTelegram(); updateTelegramSend();
})();
