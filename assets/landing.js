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
  let selectedTier = 'vip';
  document.querySelectorAll('[data-order]').forEach(button => button.addEventListener('click', () => {
    selectedTier = button.dataset.order; const tier = tiers[selectedTier]; $('order-tier').textContent = tier.name; $('order-title').textContent = 'Ваш формат: ' + tier.name; $('order-price').textContent = C.money(tier.price); $('order-description').textContent = tier.description;
    const url = C.trustedUrl(config.paymentUrls?.[selectedTier]); const legalReady = Boolean(config.sellerName && C.trustedUrl(config.termsUrl) && C.trustedUrl(config.privacyUrl));
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

/* LIVING_WEB_V3_START */
function initLivingV3() {
  'use strict';
  const life = new AbortController(), signal = life.signal;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set(), observers = [], disposers = [];
  const source = window.COLIBRIOS_REVIEWS_20 || window.COLIBRI_REVIEWS || window.COLIBRI_REVIEWS_DATA || window.ColibriReviews || window.REVIEWS_DATA || window.reviewsData || [];
  const rows = Array.isArray(source) ? source : (source.items || source.reviews || source.cards || []);
  const $ = id => document.getElementById(id);
  function asset(path) {
    if (typeof path !== 'string' || !path) return '';
    if (window.ColibriAsset) return window.ColibriAsset(path);
    if (/^(?:https?:|data:|blob:)/i.test(path)) return '';
    return path.startsWith('../') ? path : '../' + path.replace(/^\/+/, '');
  }
  function groupOf(row) {
    const value = String(row.roleId || row.groupId || row.categoryId || row.group || row.category || row.role || '').toLowerCase();
    if (/teach|tutor|prepod|репет|препод/.test(value)) return 'teachers';
    if (/psych|psih|псих/.test(value)) return 'psychologists';
    if (/market|маркет/.test(value)) return 'marketers';
    if (/commerc|shop|store|service|magazin|магаз|услуг/.test(value)) return 'commerce';
    if (/expert|beginner|newcom|novich|эксперт|нович/.test(value)) return 'experts';
    return value;
  }
  function text(value) { return typeof value === 'string' ? value : ''; }
  const items = rows.map((row, i) => ({
    id: text(row.id) || String(i + 1), group: groupOf(row),
    name: text(row.name || row.author || row.person || row.title),
    role: text(row.specialty || row.roleLabel || row.profession || row.role || row.categoryLabel),
    title: text(row.title || row.headline || row.name),
    summary: text(row.summary || row.quote || row.description || row.excerpt),
    detail: [row.taskBuiltIn3Evenings, row.routineBefore, row.resultAfter, row.nextStep].filter(value => typeof value === 'string' && value).join('\n\n') || text(row.detail || row.details || row.caseText || row.body || row.text || row.description),
    video: text(row.video || row.videoSrc || row.videoUrl || (row.type === 'video' ? row.src : '')),
    poster: text(row.poster || row.posterSrc || row.posterUrl || row.portrait || row.image || row.imageSrc || row.imageUrl || row.avatar),
    kind: text(row.type || row.kind), disclosure: text(row.disclosure || row.note || row.label),
  }));
  function animate(node, frames, options) {
    if (reduced.matches || !node.animate) return null;
    const animation = node.animate(frames, options); animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation)); return animation;
  }
  function waveform(holder, index) {
    const wave = document.createElement('div'); wave.className = 'review-wave'; wave.setAttribute('aria-hidden', 'true');
    for (let j = 0; j < 20; j++) { const bar = document.createElement('span'); bar.style.height = (8 + ((j * 7 + index * 3) % 8) * 4) + 'px'; wave.append(bar); }
    holder.append(wave);
    return wave;
  }
  const waveAnimations = new Map();
  function stopWave(wave) { (waveAnimations.get(wave) || []).forEach(animation => animation?.cancel()); waveAnimations.delete(wave); }
  function startWave(wave) {
    if (reduced.matches || waveAnimations.has(wave)) return;
    waveAnimations.set(wave, [...wave.children].map((bar, i) => animate(bar, [{ transform: 'scaleY(.4)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(.4)' }], { duration: 720 + (i % 4) * 160, delay: (i % 5) * 80, iterations: Infinity, easing: 'ease-in-out' })));
  }
  function card(item, index) {
    const article = document.createElement('article'); article.className = 'review-card'; article.dataset.reviewId = item.id; article.dataset.reviewGroup = item.group;
    const media = document.createElement('div'); media.className = 'review-media';
    if (item.video) {
      const video = document.createElement('video'); video.controls = true; video.playsInline = true; video.preload = 'none'; video.width = 540; video.height = 960; video.src = asset(item.video);
      if (item.poster) video.poster = asset(item.poster); video.setAttribute('aria-label', item.name + ': видео-история'); media.append(video);
      video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }), { signal });
      video.addEventListener('error', () => { const note = document.createElement('p'); note.textContent = 'Видео не загрузилось. Обновите страницу или прочитайте описание ниже.'; media.replaceChildren(note); }, { signal, once: true });
    } else {
      if (item.poster) { const portrait = document.createElement('img'); portrait.src = asset(item.poster); portrait.alt = item.name; portrait.width = 540; portrait.height = 675; portrait.loading = 'lazy'; portrait.decoding = 'async'; media.append(portrait); }
      const wave = waveform(media, index);
      article.addEventListener('pointerenter', () => startWave(wave), { signal }); article.addEventListener('pointerleave', () => { if (!article.querySelector('details[open]')) stopWave(wave); }, { signal });
      article.addEventListener('focusin', () => startWave(wave), { signal }); article.addEventListener('focusout', event => { if (!article.contains(event.relatedTarget) && !article.querySelector('details[open]')) stopWave(wave); }, { signal });
      const details = document.createElement('details'), summary = document.createElement('summary'), body = document.createElement('p'); summary.textContent = 'Читать разбор'; body.textContent = item.detail || item.summary; details.append(summary, body);
      details.addEventListener('toggle', () => details.open ? startWave(wave) : stopWave(wave), { signal }); article._details = details;
    }
    const copy = document.createElement('div'); copy.className = 'review-copy';
    const kind = document.createElement('p'); kind.className = 'review-kind'; kind.textContent = item.disclosure || (item.video ? 'Видео-история' : 'Разбор задачи · визуализация, не аудиозапись');
    const heading = document.createElement('h3'); heading.textContent = item.name || item.title;
    const role = document.createElement('p'); role.className = 'review-role'; role.textContent = item.role;
    const summary = document.createElement('p'); summary.textContent = item.summary || item.title;
    copy.append(heading, kind, role, summary); if (article._details) copy.append(article._details);
    const cta = document.createElement('a'); cta.className = 'btn'; cta.href = '../web/checkout.html?product=vip'; cta.textContent = 'Начать за 990 ₽ ↗';
    article.append(media, copy, cta); return article;
  }
  const tabs = $('review-filter-tabs'), reviewRoot = document.querySelector('#student-reviews .nav-demo');
  const groups = ['teachers', 'psychologists', 'experts', 'marketers', 'commerce'];
  const ready = items.length === 20 && groups.every(group => items.filter(item => item.group === group).length === 4);
  window.ColibriLivingDiagnostics = { ready, count: items.length, groupCounts: Object.fromEntries(groups.map(group => [group, items.filter(item => item.group === group).length])) };
  let navigation;
  if (tabs && reviewRoot && window.MatteNavigation) {
    navigation = window.MatteNavigation.mount(reviewRoot); disposers.push(() => navigation.destroy());
    function render() {
      const active = tabs.querySelector('[aria-selected=true]'), group = active.dataset.reviewGroup;
      const selected = group === 'all' ? items : items.filter(item => item.group === group);
      document.querySelectorAll('#student-reviews video').forEach(video => video.pause());
      waveAnimations.forEach((_, wave) => stopWave(wave));
      reviewRoot.querySelectorAll('[role=tabpanel]').forEach(panel => panel.replaceChildren());
      const panel = $(active.getAttribute('aria-controls'));
      if (!ready) { $('review-filter-status').textContent = 'Истории временно недоступны. Обновите страницу после загрузки материалов.'; return; }
      const grid = document.createElement('div'); grid.className = 'review-grid'; selected.forEach((item, index) => grid.append(card(item, index))); panel.append(grid);
      $('review-filter-status').textContent = 'Показано ' + selected.length + ' из 20';
      $('review-disclosure').textContent = text(window.COLIBRIOS_REVIEWS_METADATA?.disclosure || source.disclosure || source.notice) || 'Истории и разборы иллюстрируют конкретные задачи. Они не гарантируют результат обучения или доход.';
      if (typeof window.fitScenes === 'function') window.fitScenes(document);
    }
    tabs.addEventListener('click', () => queueMicrotask(render), { signal });
    tabs.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) queueMicrotask(render); }, { signal }); render();
  }
  // The ESM Sovereign installer owns sound opt-in and audio cleanup.
  function loadVideo(video) { if (!video.getAttribute('src')) video.src = asset(video.dataset.src); }
  function play(video, user = false) { loadVideo(video); if (user) delete video.dataset.userPaused; const result = video.play(); result?.catch(() => { video.closest('figure').querySelector('.living-status').textContent = 'Нажмите «Воспроизвести», чтобы запустить ролик.'; }); }
  const visibleVideos = new Set();
  function canAutoPlay() { return !reduced.matches && !navigator.connection?.saveData && !document.hidden; }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { const video = entry.target; if (entry.isIntersecting) { visibleVideos.add(video); if (canAutoPlay() && !video.dataset.userPaused) play(video); } else { visibleVideos.delete(video); video.pause(); } });
  }, { threshold: .2 }) : null;
  if (observer) observers.push(observer);
  document.querySelectorAll('[data-broll]').forEach(video => {
    const figure = video.closest('figure'), status = figure.querySelector('.living-status'), playButton = figure.querySelector('[data-video-play]'), soundButton = figure.querySelector('[data-video-sound]');
    video.muted = true; video.autoplay = !reduced.matches && !navigator.connection?.saveData;
    playButton.addEventListener('click', () => { if (video.paused) play(video, true); else { video.dataset.userPaused = 'true'; video.pause(); } }, { signal });
    soundButton.addEventListener('click', () => {
      const audible = video.muted;
      if (audible) document.querySelectorAll('video').forEach(other => { if (other !== video) { other.muted = true; const button = other.closest('figure')?.querySelector('[data-video-sound]'); button?.setAttribute('aria-pressed', 'false'); } });
      video.muted = !audible; soundButton.setAttribute('aria-pressed', String(audible)); soundButton.textContent = audible ? 'Без звука' : 'Звук'; if (video.paused) play(video, true);
    }, { signal });
    figure.querySelector('[data-video-fullscreen]').addEventListener('click', async () => {
      loadVideo(video); const holder = video.parentElement;
      try { if (document.fullscreenElement) await document.exitFullscreen(); else if (holder.requestFullscreen) await holder.requestFullscreen(); else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); else status.textContent = 'Полноэкранный просмотр недоступен в этом браузере.'; }
      catch { status.textContent = 'Браузер не разрешил полноэкранный просмотр. Ролик доступен на странице.'; }
    }, { signal });
    video.addEventListener('play', () => { playButton.textContent = 'Пауза'; status.textContent = ''; }, { signal });
    video.addEventListener('pause', () => { playButton.textContent = 'Воспроизвести'; }, { signal });
    video.addEventListener('volumechange', () => { soundButton.setAttribute('aria-pressed', String(!video.muted)); soundButton.textContent = video.muted ? 'Звук' : 'Без звука'; }, { signal });
    video.addEventListener('error', () => { status.textContent = 'Ролик не загрузился. Проверьте соединение и попробуйте ещё раз.'; }, { signal });
    if (observer) observer.observe(video);
    const spring = () => animate(figure, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)', offset: .55 }, { transform: 'translateY(-4px)', offset: .8 }, { transform: 'translateY(-6px)' }], { duration: 420, fill: 'forwards', easing: 'cubic-bezier(.22,.61,.36,1)' });
    figure.addEventListener('pointerenter', () => { if (matchMedia('(hover:hover) and (pointer:fine)').matches) spring(); }, { signal });
    figure.addEventListener('pointerleave', () => animate(figure, [{ transform: getComputedStyle(figure).transform }, { transform: 'translateY(0)' }], { duration: 280, fill: 'forwards', easing: 'cubic-bezier(.22,.61,.36,1)' }), { signal });
  });
  function pauseHidden() {
    if (document.hidden) { document.querySelectorAll('video').forEach(video => video.pause()); waveAnimations.forEach((_, wave) => stopWave(wave)); }
    else if (canAutoPlay()) visibleVideos.forEach(video => { if (!video.dataset.userPaused) play(video); });
  }
  document.addEventListener('visibilitychange', pauseHidden, { signal });
  reduced.addEventListener('change', () => { if (reduced.matches) { animations.forEach(animation => animation.cancel()); document.querySelectorAll('[data-broll]').forEach(video => { video.autoplay = false; video.pause(); }); } else pauseHidden(); }, { signal });
  const nav = $('primary-nav');
  if (nav && typeof window.installNavIndicator === 'function') {
    const indicator = document.createElement('span'); indicator.className = 'nav-indicator'; indicator.setAttribute('aria-hidden', 'true'); nav.append(indicator);
    const links = [...nav.querySelectorAll('a[href^="#"]')]; links.forEach(link => link.classList.add('nav-link'));
    links[0]?.setAttribute('aria-current', 'page'); disposers.push(window.installNavIndicator(nav));
    if ('IntersectionObserver' in window) {
      const positions = new Map();
      const sections = new IntersectionObserver(entries => { entries.forEach(entry => { positions.set(entry.target.id, entry.isIntersecting); }); const active = links.find(link => positions.get(link.hash.slice(1))); if (!active) return; links.forEach(link => { if (link === active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); }); }, { rootMargin: '-96px 0px -45% 0px', threshold: 0 });
      links.forEach(link => { const section = $(link.hash.slice(1)); if (section) sections.observe(section); }); observers.push(sections);
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof window.smoothScrollTo !== 'function') return;
    const target = $(link.hash.slice(1)); if (!target) return;
    event.preventDefault(); history.replaceState(null, '', link.hash);
    window.smoothScrollTo(target.getBoundingClientRect().top + scrollY - (document.querySelector('.site-header')?.offsetHeight || 0) - 24);
  }, { signal });
  document.fonts.ready.then(() => { if (!signal.aborted && typeof window.fitScenes === 'function') window.fitScenes(document); });
  window.addEventListener('pagehide', event => {
    document.querySelectorAll('video').forEach(video => video.pause());
    if (event.persisted) return;
    life.abort(); observers.forEach(item => item.disconnect()); disposers.forEach(dispose => dispose?.()); animations.forEach(animation => animation.cancel()); window.cancelSceneScroll?.();
  });
}
if (document.readyState === 'complete') initLivingV3();
else document.addEventListener('DOMContentLoaded', initLivingV3, { once: true });
/* LIVING_WEB_V3_END */
