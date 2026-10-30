'use strict';
(() => {
  const C = window.Colibri;
  const $ = (id) => document.getElementById(id);
  const config = window.COLIBRI_CONFIG || {};
  const menu = $('menu-button');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    $('primary-nav').classList.toggle('open', open);
  });
  $('primary-nav')
    .querySelectorAll('a')
    .forEach((a) =>
      a.addEventListener('click', () => {
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Открыть меню');
        $('primary-nav').classList.remove('open');
      }),
    );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      menu.click();
      menu.focus();
    }
  });
  C.bindTabs($('program-tabs'));
  const selectFaq = C.bindTabs($('faq-tabs'));
  selectFaq($('faq-tab-1'));
  function openLinkedDetails(hash) {
    let target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return;
    }
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
  }
  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => link.addEventListener('click', () => openLinkedDetails(link.hash)));
  window.addEventListener('hashchange', () => openLinkedDetails(location.hash));
  openLinkedDetails(location.hash);
  let agentTimer;
  $('run-agents').addEventListener('click', () => {
    clearInterval(agentTimer);
    const agents = [...$('agent-grid').children];
    let index = 0;
    agents.forEach((a) => a.classList.remove('active'));
    $('run-agents').disabled = true;
    function step() {
      agents.forEach((a, i) => a.classList.toggle('active', i === index));
      $('console-event').textContent =
        '> ' +
        String(index + 1) +
        ' / ' +
        agents[index].textContent.trim() +
        ': принимает свой участок работы';
      index++;
      if (index >= agents.length) {
        clearInterval(agentTimer);
        $('run-agents').disabled = false;
        $('console-event').textContent = '> 12 ролей → результат у проверяющего → ждём ваше «ДА»';
      }
    }
    step();
    agentTimer = setInterval(step, matchMedia('(prefers-reduced-motion: reduce)').matches ? 40 : 280);
  });
  let mode = 'b2b';
  const calcIds = [
    'employees',
    'hours',
    'rate',
    'recovery',
    'operating',
    'investment',
    'coi-track',
    'coi-leads',
    'coi-conv',
    'coi-margin',
  ];
  const modeValues = { b2b: { employees: 12, hours: 1.5 }, creator: { employees: 1, hours: 15 } };
  function inputNumber(id, min, max) {
    return C.bounded($(id).value === '' ? NaN : $(id).value, min, max, 0);
  }
  function calculate() {
    const employees = mode === 'b2b' ? inputNumber('employees', 1, 50) : 1;
    const hours = inputNumber('hours', 0, mode === 'b2b' ? 8 : 60);
    const rate = inputNumber('rate', 100, 5000);
    const recovery = inputNumber('recovery', 0, 100);
    const operating = inputNumber('operating', 0, 1000000);
    const investment = inputNumber('investment', 990, 450000);
    const r = C.routineModel({
      employees,
      hours,
      rate,
      recovery,
      operating,
      investment,
      days: mode === 'b2b' ? 22 : 4.3,
    });
    $('employees-out').textContent = C.number(employees);
    $('hours-out').textContent = C.number(hours);
    $('rate-out').textContent = C.number(rate);
    $('monthly-cost').textContent = C.money(r.routineCost);
    $('annual-cost').textContent = C.money(r.annualCost);
    $('monthly-hours').textContent = C.number(r.monthlyHours) + ' ч';
    $('net-effect').textContent = C.money(r.net);
    $('payback').textContent =
      r.payback === null ? 'Не достигается' : (r.payback < 0.1 ? '< 0,1' : C.number(r.payback)) + ' мес.';
    $('formula-text').textContent =
      (mode === 'b2b' ? C.number(employees) + ' × ' : '') +
      C.number(hours) +
      ' × ' +
      C.number(rate) +
      ' × ' +
      (mode === 'b2b' ? '22' : '4,3') +
      ' = ' +
      C.money(r.routineCost);
    const track = C.tracks.find((t) => t.id === $('coi-track').value) || C.tracks[0];
    $('track-name').textContent = track.name;
    $('track-start').textContent = track.start;
    const coi =
      ((inputNumber('coi-leads', 0, 100000) * inputNumber('coi-conv', 0, 100)) / 100) *
      inputNumber('coi-margin', 0, 10000000);
    $('coi-cost').textContent = C.money(coi) + ' / мес.';
  }
  calcIds.forEach((id) => $(id).addEventListener('input', calculate));
  $('calc-mode')
    .querySelectorAll('button')
    .forEach((button) =>
      button.addEventListener('click', () => {
        modeValues[mode] = { employees: Number($('employees').value), hours: Number($('hours').value) };
        mode = button.dataset.mode;
        $('calc-mode')
          .querySelectorAll('button')
          .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        $('employees').closest('.field').hidden = mode === 'creator';
        $('hours').max = mode === 'b2b' ? '8' : '60';
        $('hours').step = mode === 'b2b' ? '0.25' : '1';
        $('employees').value = modeValues[mode].employees;
        $('hours').value = modeValues[mode].hours;
        $('hours-label').textContent =
          mode === 'b2b' ? 'Рутина каждого, часов в день' : 'Ваша рутина, часов в неделю';
        $('mode-hint').textContent =
          mode === 'b2b'
            ? 'Для команды: люди × часы в день × стоимость часа × 22 рабочих дня'
            : 'Для автора: часы в неделю × стоимость часа × 4,3 недели в месяце. Не суммируйте уже учтённые часы';
        C.haptic();
        calculate();
      }),
    );
  calculate();

  // The same persisted deadline is used on every visit. The server owns actual eligibility.
  const windowMs = 48 * 60 * 60 * 1000;
  const timerKey = 'offer.' + (config.campaignId || 'default');
  let offer = C.store.get(timerKey);
  const configuredDeadline =
    typeof config.offerDeadline === 'string' ? Date.parse(config.offerDeadline) : NaN;
  let durable = true;
  if (Number.isFinite(configuredDeadline)) {
    offer = { end: configuredDeadline, lastSeen: Date.now(), fixed: true };
  } else if (!offer || !Number.isFinite(offer.end) || !Number.isFinite(offer.lastSeen)) {
    offer = { end: Date.now() + windowMs, lastSeen: Date.now(), fixed: false };
    durable = C.store.set(timerKey, offer);
  }
  function tick() {
    const now = Math.max(Date.now(), offer.lastSeen);
    offer.lastSeen = now;
    const remaining = Math.max(0, offer.end - now);
    const seconds = Math.floor(remaining / 1000);
    // taste-skill-ignore: clock fields use zero padding, not decorative numbering.
    $('timer-hours').textContent = String(Math.floor(seconds / 3600)).padStart(2, '0');
    $('timer-minutes').textContent = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
    $('timer-seconds').textContent = String(seconds % 60).padStart(2, '0');
    if (!remaining) {
      $('countdown-note').textContent =
        'Окно завершено. Тарифы доступны, условия апгрейда уточните до оплаты';
      $('light-upgrade').textContent = 'Окно апгрейда завершено';
    } else if (!durable)
      $('countdown-note').textContent =
        'Хранилище недоступно: таймер только для текущей вкладки, право на акцию подтверждает куратор';
    else if (offer.fixed)
      $('countdown-note').textContent =
        'Окно до ' +
        new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' }).format(offer.end) +
        ' по времени устройства. Право на апгрейд подтверждается отдельно';
    else
      $('countdown-note').textContent =
        'Личное ознакомительное окно на этом устройстве. Не резерв участия и не подтверждение скидки';
    if (!remaining) clearInterval(countdownInterval);
  }
  let countdownInterval = setInterval(tick, 1000);
  tick();
  document.addEventListener('visibilitychange', () => {
    C.store.set(timerKey, offer);
    if (!document.hidden) tick();
  });
  window.addEventListener('pagehide', () => C.store.set(timerKey, offer));

  const tiers = {
    vip: {
      name: 'ИИ-Концентрат',
      price: 990,
      description:
        'Самостоятельный цифровой практикум на 3 вечера: пошаговые видеомодули в записи, готовые ИИ-шаблоны и ИИ-диагностика. Проходите в своём темпе без расписания. Мастер-группа оплачивается отдельно.',
    },
    light: {
      name: 'Light Tier',
      price: 79990,
      description:
        'Команда ролей, база проекта и контентный процесс. Условия 48-часового апгрейда до Pro нужно подтвердить отдельно до платежа.',
    },
    pro: {
      name: 'Pro Tier',
      price: 119990,
      description:
        'Light плюс TMA, воронки, контент-завод пяти форматов и контроль качества. Комплектация и сроки фиксируются в оферте.',
    },
    swarm: {
      name: 'Sovereign Swarm',
      price: 199990,
      description:
        'Pro плюс архитектурный разбор с Татьяной и Денисом и план суверенного контура. Объём работ и инфраструктурные расходы согласуются отдельно.',
    },
  };
  function internalPageUrl(value, path) {
    const local = C.trustedUrl(value, true);
    if (local) return local;
    const allowed = /^(?:checkout\.html\?product=(?:vip|light|pro|swarm)|terms\.html|privacy\.html)$/.test(
      path,
    );
    const pages = window.COLIBRI_PAGE_URLS;
    if (
      !allowed ||
      window.COLIBRI_PORTABLE_PREVIEW !== true ||
      !pages ||
      !Object.prototype.hasOwnProperty.call(pages, path)
    )
      return null;
    const expected = new URL(path, 'https://den4iklucky.github.io/colibrios-sales/').href;
    return C.trustedUrl(pages[path]) === expected && C.trustedUrl(value) === expected ? expected : null;
  }
  let selectedTier = 'vip';
  document.querySelectorAll('[data-order]').forEach((button) =>
    button.addEventListener('click', () => {
      selectedTier = button.dataset.order;
      const tier = tiers[selectedTier];
      $('order-tier').textContent = tier.name;
      $('order-title').textContent = 'Ваш формат: ' + tier.name;
      $('order-price').textContent = C.money(tier.price);
      $('order-description').textContent = tier.description;
      const url = internalPageUrl(
        config.paymentUrls?.[selectedTier],
        'checkout.html?product=' + selectedTier,
      );
      const legalReady = Boolean(
        config.sellerName &&
        internalPageUrl(config.termsUrl, 'terms.html') &&
        internalPageUrl(config.privacyUrl, 'privacy.html'),
      );
      $('pay-link').hidden = !(url && legalReady);
      if (url && legalReady) $('pay-link').href = url;
      else $('pay-link').removeAttribute('href');
      $('payment-status').textContent =
        url && legalReady
          ? 'Откроется оформление: проверьте доступность оплаты, продавца и условия. Карточка заказа сама по себе не является оплатой.'
          : 'Оплата ещё не активирована: не заданы подтверждённые платёжные и правовые реквизиты. Можно скачать карточку выбранного формата; она никуда не отправится.';
      $('order-dialog').showModal();
    }),
  );
  $('export-order').addEventListener('click', () => {
    const tier = tiers[selectedTier];
    C.download(
      'ColibriOS-' + selectedTier + '-order.json',
      JSON.stringify(
        {
          schema: 'colibrios.order.v1',
          tier: selectedTier,
          name: tier.name,
          amountRUB: tier.price,
          status: 'draft_not_paid_not_reserved',
          createdAt: new Date().toISOString(),
          upgradeEligibility: 'requires_operator_confirmation',
        },
        null,
        2,
      ),
      'application/json',
    );
    C.toast('Карточка скачана. Оплата и бронь не созданы');
  });
  if (config.sellerName)
    $('seller-notice').textContent =
      String(config.sellerName) +
      '. Перед оплатой ознакомьтесь с офертой и политикой данных. Сценарные расчёты не гарантируют доход.';

  const endpoint = C.trustedUrl(config.qualificationEndpoint, true);
  const leadReady = endpoint && config.sellerName && C.trustedUrl(config.privacyUrl);
  $('b2b-submit').textContent = leadReady ? 'Отправить заявку на диагностику' : 'Скачать заявку для передачи';
  if (leadReady)
    $('consent-text').firstChild.textContent =
      'Согласен отправить указанные данные оператору ' +
      String(config.sellerName) +
      ' для ответа на заявку. ';
  function openB2B() {
    $('b2b-status').textContent = '';
    $('b2b-dialog').showModal();
  }
  $('open-b2b').addEventListener('click', openB2B);
  $('b2b-contact').addEventListener('input', () => $('b2b-contact').setCustomValidity(''));
  $('b2b-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const contact = $('b2b-contact').value.trim();
    if (!/^@[A-Za-z0-9_]{5,32}$/.test(contact) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) {
      $('b2b-contact').setCustomValidity('Укажите Telegram @username от 5 символов или email');
      $('b2b-contact').reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    ['name', 'contact', 'business', 'process', 'attempts', 'goal'].forEach(
      (key) => (data[key] = data[key].trim()),
    );
    if (
      data.name.length < 2 ||
      data.business.length < 3 ||
      data.process.length < 20 ||
      data.attempts.length < 10 ||
      data.goal.length < 10
    ) {
      $('b2b-status').textContent = 'Заполните ответы содержательно, не только пробелами';
      return;
    }
    const payload = {
      schema: 'colibrios.qualification.v1',
      source: 'landing',
      offer: 'b2b_turnkey_450000',
      createdAt: new Date().toISOString(),
      ...data,
      consent: true,
    };
    if (!leadReady) {
      C.download(
        'ColibriOS-B2B-application.json',
        JSON.stringify({ ...payload, status: 'local_draft_not_sent' }, null, 2),
        'application/json',
      );
      $('b2b-status').textContent =
        'Файл заявки скачан на ваше устройство. Он не отправлен Татьяне и Денису. Передайте его через согласованный канал связи';
      return;
    }
    const button = $('b2b-submit');
    button.disabled = true;
    $('b2b-status').textContent = 'Отправляем на настроенный обработчик…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'same-origin',
        credentials: 'same-origin',
        redirect: 'error',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const receipt = await response.json();
      if (typeof receipt.receiptId !== 'string' || !receipt.receiptId.trim()) throw new Error('No receipt');
      $('b2b-status').textContent =
        'Обработчик принял заявку. ID: ' +
        receipt.receiptId.slice(0, 120) +
        '. Ожидайте отдельного подтверждения команды';
      form.reset();
    } catch {
      $('b2b-status').textContent =
        'Получение заявки не подтверждено. Не отправляйте повторно вслепую: проверьте связь с командой или скачайте ответы';
      const fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'btn secondary compact';
      fallback.textContent = 'Скачать мои ответы';
      fallback.addEventListener('click', () =>
        C.download(
          'ColibriOS-B2B-application.json',
          JSON.stringify({ ...payload, status: 'delivery_unconfirmed' }, null, 2),
          'application/json',
        ),
      );
      $('b2b-status').append(document.createElement('br'), fallback);
    } finally {
      button.disabled = false;
    }
  });
  function privacy() {
    $('privacy-dialog').showModal();
  }
  $('privacy-button').addEventListener('click', privacy);
  $('form-privacy').addEventListener('click', () => {
    const url = C.trustedUrl(config.privacyUrl);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else privacy();
  });
  if (new URLSearchParams(location.search).get('route') === 'b2b') openB2B();
})();

// Flagship portal widgets: local public examples, never account actions.
(() => {
  const C = window.Colibri;
  const $ = (id) => document.getElementById(id);
  if (!$('portal-hero') || !C) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function pauseHidden() {
    document.querySelectorAll('video').forEach((video) => {
      if (video.closest('[hidden]')) {
        video.pause();
        video.muted = true;
      }
    });
  }
  document.querySelectorAll('[data-pipeline-role]').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const role = button.closest('article');
      $('pipeline-output').textContent =
        role.querySelector('h3').textContent +
        ': ' +
        role.querySelector('p').textContent +
        ' Приёмка: сверить с исходником и получить твоё разрешение на выпуск.';
      document
        .querySelectorAll('[data-pipeline-role]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  const browserSelect = C.bindTabs($('browser-tabs'), {
    onChange(tab) {
      $('browser-address').textContent = 'Пример / ' + tab.textContent.toLowerCase();
      document
        .querySelectorAll('button[data-browser-select]')
        .forEach((button) =>
          button.setAttribute(
            'aria-pressed',
            String(button.dataset.browserSelect === tab.id.replace('browser-tab-', '')),
          ),
        );
      pauseHidden();
    },
  });
  browserSelect($('browser-tab-site'));
  document.querySelectorAll('[data-browser-select]').forEach((button) =>
    button.addEventListener('click', () => {
      browserSelect($('browser-tab-' + button.dataset.browserSelect));
    }),
  );
  let chatStep = 1;
  const chatRows = [...$('browser-chat').children];
  function renderChat() {
    chatRows.forEach((row, index) => {
      row.hidden = index >= chatStep;
    });
    $('browser-chat-next').disabled = chatStep >= chatRows.length;
  }
  $('browser-chat-next').addEventListener('click', () => {
    chatStep = Math.min(chatRows.length, chatStep + 1);
    renderChat();
  });
  $('browser-chat-reset').addEventListener('click', () => {
    chatStep = 1;
    renderChat();
  });
  renderChat();
  let carouselIndex = 0;
  const slides = [...document.querySelectorAll('[data-carousel-slide]')];
  function showSlide() {
    slides.forEach((slide, index) => {
      slide.hidden = index !== carouselIndex;
    });
    $('carousel-status').textContent = `${carouselIndex + 1} из ${slides.length}`;
  }
  document.querySelectorAll('[data-carousel-delta]').forEach((button) =>
    button.addEventListener('click', () => {
      carouselIndex = (carouselIndex + Number(button.dataset.carouselDelta) + slides.length) % slides.length;
      showSlide();
    }),
  );
  showSlide();

  const trackSelect = C.bindTabs($('track-tabs'), {
    onChange(tab) {
      const key = tab.id.replace('track-tab-', '');
      if ($('coi-track').value !== key) {
        $('coi-track').value = key;
        $('coi-track').dispatchEvent(new Event('input', { bubbles: true }));
      }
      pauseHidden();
    },
  });
  C.tracks.forEach((track) => {
    const selectStep = C.bindTabs($('step-tabs-' + track.id));
    selectStep($('step-tab-' + track.id + '-1'));
    document.querySelector(`[data-track-summary="${track.id}"]`).textContent =
      track.start + '. На выходе: ' + track.artifact + '.';
  });
  function syncTrack() {
    const tab = $('track-tab-' + $('coi-track').value);
    if (tab && tab.getAttribute('aria-selected') !== 'true') trackSelect(tab);
  }
  $('coi-track').addEventListener('input', syncTrack);
  $('coi-track').addEventListener('change', syncTrack);
  trackSelect($('track-tab-' + $('coi-track').value));

  const files = Object.freeze({
    'INDEX.md':
      'Учебный проект: памятка преподавателя.\nЦель: собрать один материал из проверенных правил.\nИсточники, черновик и проверка хранятся отдельно.\nВнешние действия разрешает человек.',
    'audience/questions.md':
      'Учебный вопрос: как представить себя на английском.\nНужны образец, упражнение и самопроверка.\nЛичные данные учеников не используются.\nНеизвестные факты нужно уточнить.',
    'products/offer.md':
      'Артефакт: памятка с упражнением и образцом ответа.\nЭто вымышленный продукт для демонстрации интерфейса.\nСтоимость и продажа этого продукта не задаются.\nПлатный практикум ColibriOS оформляется отдельно.',
    'funnels/route.md':
      'Учебный маршрут: запрос → выбор материала → проверка версии.\nЭто схема, не подключённая рассылка.\nРеальная оплата требует отдельного оформления.\nНикакое сообщение не отправляется из этого просмотра.',
    'agents/checklist.md':
      'Факты сверены с исходником.\nУпражнение решено преподавателем.\nВерсия материала указана явно.\nПубликация и выдача требуют отдельного решения.',
    'prompts-989/recipe.md':
      'Рецепт учебного запроса:\nМоя задача: [одно действие].\nИсходник: [проверенные факты].\nЧерновик: [нужный материал].\nПроверка: [кто и по каким признакам примет результат].\nЧего не хватает в исходнике, уточни. Ничего не выдумывай.',
    'reports/07-00.md':
      '07:00: пример запланированного отчёта.\nЧерновик памятки ждёт проверки.\nОдин вопрос по исходнику требует уточнения.\nПубликации, оплаты и отправки не выполнялись.',
  });
  let selectedFile = 'INDEX.md';
  document.querySelectorAll('[data-brain-file]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!Object.prototype.hasOwnProperty.call(files, button.dataset.brainFile)) return;
      selectedFile = button.dataset.brainFile;
      $('brain-filename').textContent = selectedFile;
      $('brain-content').textContent = files[selectedFile];
      $('brain-status').textContent = '';
      document
        .querySelectorAll('[data-brain-file]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    }),
  );
  $('brain-copy').addEventListener('click', async () => {
    const success = await C.copy(files[selectedFile]);
    $('brain-status').textContent = success
      ? 'Файл скопирован.'
      : 'Не удалось скопировать автоматически. Выдели текст в окне файла.';
  });
  $('gift-copy').addEventListener('click', async () => {
    const success = await C.copy($('starter-template').textContent);
    $('gift-status').textContent = success
      ? 'Шаблон скопирован. Подставь свою задачу.'
      : 'Буфер недоступен. Выдели и скопируй шаблон вручную.';
  });
  const curator = {
    start:
      'Выбери одно действие: например, памятку с упражнением. Зафиксируй, кто будет принимать результат.',
    input:
      'Передай только проверенные факты и несекретные исходники. Неизвестные условия нужно уточнить, а не выдумывать.',
    check:
      'Сверь факты с исходником, проверь пример самостоятельно и сохрани одобренную версию. Внешние действия разрешай отдельно.',
  };
  document.querySelectorAll('[data-curator]').forEach((button) =>
    button.addEventListener('click', () => {
      $('curator-answer').textContent = curator[button.dataset.curator];
      document
        .querySelectorAll('[data-curator]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    }),
  );
  $('curator-reset').addEventListener('click', () => {
    $('curator-answer').textContent = 'Выбери вопрос: покажем пример подсказки к заданию.';
    document.querySelectorAll('[data-curator]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
  });

  const questions = [
    {
      id: 'now',
      text: 'Что у тебя уже есть для первой задачи?',
      choices: [
        ['experience', 'Опыт и материалы'],
        ['audience', 'Аудитория и вопросы'],
        ['product', 'Продукт или услуга'],
        ['start', 'Пока только идея'],
      ],
    },
    {
      id: 'pain',
      text: 'Где сейчас больше ручной работы?',
      choices: [
        ['context', 'Поиск исходников'],
        ['content', 'Контент'],
        ['route', 'Заявки и ответы'],
        ['scope', 'Выбор первой задачи'],
      ],
    },
    {
      id: 'tried',
      text: 'Что уже пробовал?',
      choices: [
        ['chat', 'Отдельные чаты с ИИ'],
        ['templates', 'Шаблоны'],
        ['delegate', 'Передачу подрядчику'],
        ['none', 'Пока ничего'],
      ],
    },
    {
      id: 'delay',
      text: 'Как давно откладываешь эту задачу?',
      choices: [
        ['recent', 'Недавно'],
        ['month', 'Около месяца'],
        ['long', 'Несколько месяцев'],
        ['unknown', 'Не считаю срок'],
      ],
    },
    {
      id: 'friction',
      text: 'Что чаще мешает продолжить?',
      choices: [
        ['unclear', 'Непонятен следующий шаг'],
        ['time', 'Не хватает времени'],
        ['facts', 'Не собраны исходники'],
        ['check', 'Не знаю, как проверить'],
      ],
    },
    {
      id: 'goal',
      text: 'Какой результат первой сборки тебе нужен?',
      choices: [
        ['text', 'Проверенный материал'],
        ['page', 'Страница и понятный маршрут'],
        ['request', 'Порядок работы с заявкой'],
        ['map', 'Карта проекта'],
      ],
    },
    {
      id: 'acceptance',
      text: 'Как поймёшь, что шаг готов?',
      choices: [
        ['source', 'Сверю с исходником'],
        ['test', 'Пройду тестовый запрос'],
        ['review', 'Покажу ответственному'],
        ['help', 'Нужен чеклист проверки'],
      ],
    },
    {
      id: 'path',
      text: 'Как удобнее идти дальше?',
      choices: [
        ['self', 'Самостоятельно по записи'],
        ['done', 'Обсудить внедрение для команды'],
        ['watch', 'Пока посмотреть пример'],
      ],
    },
  ];
  let quizIndex = 0;
  const answers = Object.create(null);
  function renderQuestion(focus = false) {
    $('portal-quiz').hidden = false;
    $('quiz-result').hidden = true;
    const question = questions[quizIndex];
    $('quiz-progress').textContent = `Вопрос ${quizIndex + 1} из ${questions.length}`;
    [...document.querySelectorAll('.portal-quiz-segments span')].forEach((el, index) => {
      el.dataset.done = String(index <= quizIndex);
    });
    const title = node('h3', '', question.text);
    title.id = 'quiz-question-title';
    title.tabIndex = -1;
    const fieldset = node('fieldset');
    fieldset.setAttribute('aria-labelledby', title.id);
    for (const [value, label] of question.choices) {
      const choice = node('label', 'portal-quiz-option');
      const input = node('input');
      input.type = 'radio';
      input.name = 'quiz-' + question.id;
      input.value = value;
      input.checked = answers[question.id] === value;
      input.addEventListener('change', () => {
        answers[question.id] = value;
        $('quiz-next').disabled = false;
      });
      choice.append(input, node('span', '', label));
      fieldset.append(choice);
    }
    $('quiz-question').replaceChildren(title, fieldset);
    $('quiz-next').disabled = !answers[question.id];
    $('quiz-next').textContent = quizIndex === questions.length - 1 ? 'Показать мой план →' : 'Дальше →';
    $('quiz-back').disabled = quizIndex === 0;
    if (focus) title.focus({ preventScroll: true });
  }
  function answerLabel(key) {
    return (
      questions.find((q) => q.id === key)?.choices.find((choice) => choice[0] === answers[key])?.[1] ||
      'Не указано'
    );
  }
  function showQuizResult() {
    $('portal-quiz').hidden = true;
    $('quiz-result').hidden = false;
    const result = $('quiz-result');
    const title = node('h3', '', 'Твоя точка А и следующий шаг');
    title.tabIndex = -1;
    const gaps = node('dl', 'portal-gap-list');
    for (const [label, key] of [
      ['Сейчас', 'now'],
      ['Главное узкое место', 'pain'],
      ['Нужный артефакт', 'goal'],
      ['Как проверить', 'acceptance'],
    ]) {
      const group = node('div');
      group.append(node('dt', '', label), node('dd', '', answerLabel(key)));
      gaps.append(group);
    }
    const smaller = answers.delay === 'long' || ['time', 'unclear'].includes(answers.friction);
    const suggestion = node(
      'p',
      '',
      smaller
        ? 'Сузь первую сборку до одного небольшого действия и одного критерия приёмки. Не пытайся запускать всё сразу.'
        : 'Зафиксируй один исходник, один артефакт и проверку перед выпуском. Неизвестные условия уточни отдельно.',
    );
    const actions = node('div', 'actions');
    const link = node('a', 'btn');
    if (answers.now === 'start' || answers.path === 'watch' || !answers.path) {
      link.href = '#starter-gift';
      link.textContent = 'Забрать шаблон первой задачи →';
    } else if (answers.path === 'done') {
      link.href = '?route=b2b';
      link.textContent = 'Обсудить отдельное B2B-внедрение →';
      link.addEventListener('click', (event) => {
        event.preventDefault();
        $('open-b2b').click();
      });
    } else {
      link.href = 'checkout.html?product=vip';
      link.textContent = 'Самостоятельный практикум · 990 ₽ →';
    }
    const program = node('a', 'btn secondary', 'Посмотреть программу');
    program.href = '#program';
    actions.append(link, program);
    const reset = node('button', 'btn secondary', 'Пройти заново');
    reset.type = 'button';
    reset.id = 'quiz-reset';
    reset.addEventListener('click', () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      quizIndex = 0;
      renderQuestion(true);
    });
    result.replaceChildren(
      title,
      node('p', 'portal-caption', 'Локальный план по выбранным ответам. Данные никуда не отправлены.'),
      gaps,
      suggestion,
      actions,
      node(
        'p',
        'portal-caption',
        'Все четыре формата остаются доступны. Самооценка не является гарантией результата.',
      ),
      reset,
    );
    title.focus({ preventScroll: true });
  }
  function nextQuestion() {
    if (quizIndex < questions.length - 1) {
      quizIndex++;
      renderQuestion(true);
    } else showQuizResult();
  }
  $('portal-quiz').addEventListener('submit', (event) => {
    event.preventDefault();
    if (answers[questions[quizIndex].id]) nextQuestion();
  });
  $('quiz-skip').addEventListener('click', nextQuestion);
  $('quiz-back').addEventListener('click', () => {
    if (quizIndex > 0) {
      quizIndex--;
      renderQuestion(true);
    }
  });
  renderQuestion();

  function mountMessages() {
    if ($('proof-rail').children.length || !window.COLIBRIOS_REVIEWS_20) return;
    const reviews = window.COLIBRIOS_REVIEWS_20;
    const pool = reviews
      .map((item) => ({ item, key: 'scenario-' + item.id, text: item.quote, type: 'Учебный сценарий' }))
      .concat(
        reviews
          .slice(0, 18)
          .map((item) => ({ item, key: 'check-' + item.id, text: item.nextStep, type: 'Что проверить' })),
      );
    for (const message of pool) {
      const card = node('article', 'portal-proof-message');
      card.dataset.messageId = message.key;
      card.setAttribute('role', 'listitem');
      const identity = node('div', 'portal-proof-identity');
      const portrait = node('img');
      portrait.src = new URL(
        '/' + message.item.posterSrc.replace(/^\.\.\//, '').replace(/^\//, ''),
        document.querySelector('script[src$="landing.js"]').src,
      ).href;
      portrait.alt = '';
      portrait.width = 48;
      portrait.height = 48;
      portrait.loading = 'lazy';
      const labels = node('div');
      labels.append(node('strong', '', message.item.name + ' · AI-персонаж'), node('span', '', message.type));
      identity.append(portrait, labels);
      const action = node('a', 'portal-text-link', 'Открыть разбор →');
      action.href = '#scenario-' + message.item.id;
      action.addEventListener('click', (event) => {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('colibri:set-review-filter', { detail: { role: 'all' } }));
        const target = $('scenario-' + message.item.id);
        if (target) {
          target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
          history.replaceState(null, '', action.hash);
        }
      });
      card.append(identity, node('p', '', message.text), action);
      $('proof-rail').append(card);
    }
  }
  mountMessages();
  document.addEventListener('colibri:reviews-mounted', mountMessages, { once: true });
  document.querySelectorAll('[data-proof-scroll]').forEach((button) =>
    button.addEventListener('click', () => {
      $('proof-rail').scrollBy({
        left: Number(button.dataset.proofScroll) * ($('proof-rail').clientWidth * 0.8),
        behavior: reduced.matches ? 'instant' : 'smooth',
      });
    }),
  );

  // Extend, never replace, the existing managed video controller.
  function addSpeedControls() {
    document.querySelectorAll('video').forEach((video, index) => {
      if (video.dataset.portalSpeedReady) return;
      video.dataset.portalSpeedReady = 'true';
      const controls = node('div', 'portal-media-speeds');
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', 'Скорость воспроизведения');
      controls.append(node('span', '', 'Скорость'));
      for (const speed of [1, 1.5, 2]) {
        const button = node('button', '', speed + 'x');
        button.type = 'button';
        button.dataset.playbackRate = String(speed);
        button.setAttribute('aria-pressed', String(speed === 1));
        button.addEventListener('click', () => {
          video.playbackRate = speed;
          controls
            .querySelectorAll('[data-playback-rate]')
            .forEach((item) =>
              item.setAttribute('aria-pressed', String(Number(item.dataset.playbackRate) === speed)),
            );
        });
        controls.append(button);
      }
      if (video.hasAttribute('data-track-video') || video.id === 'browser-video') {
        const sound = node('button', '', 'Смотреть со звуком');
        sound.type = 'button';
        sound.addEventListener('click', () => {
          document.querySelectorAll('video').forEach((other) => {
            if (other !== video) other.muted = true;
          });
          video.volume = 1;
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            C.toast('Используй стандартную кнопку воспроизведения в плеере.');
          });
        });
        controls.append(sound);
      }
      if (!video.id) video.id = 'portal-video-' + index;
      controls.setAttribute('aria-controls', video.id);
      video.insertAdjacentElement('afterend', controls);
    });
  }
  addSpeedControls();
  document.addEventListener('colibri:reviews-mounted', addSpeedControls);
  document.addEventListener(
    'volumechange',
    (event) => {
      const active = event.target;
      if (active instanceof HTMLVideoElement && !active.muted && active.volume > 0)
        document.querySelectorAll('video').forEach((video) => {
          if (video !== active) video.muted = true;
        });
    },
    true,
  );
  const extraVisibility = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          entry.target.pause();
          entry.target.muted = true;
        }
      });
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll('[data-track-video],#browser-video')
    .forEach((video) => extraVisibility.observe(video));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden)
      document.querySelectorAll('[data-track-video],#browser-video').forEach((video) => {
        video.pause();
        video.muted = true;
      });
  });
  window.addEventListener('pagehide', () => extraVisibility.disconnect());
})();
