'use strict';
(() => {
  const C = window.Colibri;
  const $ = (id) => document.getElementById(id);
  const config = window.COLIBRI_CONFIG || {};
  const menu = $('menu-button');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? "Close menu" : "Open menu");
    $('primary-nav').classList.toggle('open', open);
  });
  $('primary-nav')
    .querySelectorAll('a')
    .forEach((a) =>
      a.addEventListener('click', () => {
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', "Open menu");
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
        ": accepts his area of work";
      index++;
      if (index >= agents.length) {
        clearInterval(agentTimer);
        $('run-agents').disabled = false;
        $('console-event').textContent = "> 12 roles → result from the inspector → waiting for your “YES”";
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
    $('monthly-hours').textContent = C.number(r.monthlyHours) + " h";
    $('net-effect').textContent = C.money(r.net);
    $('payback').textContent =
      r.payback === null ? "Not achieved" : (r.payback < 0.1 ? '< 0,1' : C.number(r.payback)) + " months";
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
    $('coi-cost').textContent = C.money(coi) + " / month";
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
          mode === 'b2b' ? "Everyone's routine, hours a day" : "Your routine, hours per week";
        $('mode-hint').textContent =
          mode === 'b2b'
            ? "For the team: people × hours per day × cost per hour × 22 working days"
            : "For the author: hours per week × cost per hour × 4.3 weeks per month. Do not add up hours already taken into account.";
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
        "The window is complete. Tariffs are available, please check upgrade conditions before payment";
      $('light-upgrade').textContent = "Upgrade window is completed";
    } else if (!durable)
      $('countdown-note').textContent =
        "Storage is unavailable: the timer is only for the current tab, the right to share is confirmed by the curator";
    else if (offer.fixed)
      $('countdown-note').textContent =
        "Window up " +
        new Intl.DateTimeFormat("en", { dateStyle: 'long', timeStyle: 'short' }).format(offer.end) +
        " by device time. The right to upgrade is confirmed separately";
    else
      $('countdown-note').textContent =
        "A personal evaluation window on this device. Not a participation reserve or discount confirmation";
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
      name: "AI Concentrate",
      price: 19,
      description:
        "Self-guided digital workshop for 3 evenings: recorded step-by-step video modules, ready-made AI templates and AI diagnostics. Go at your own pace without a schedule. The master group is paid separately.",
    },
    light: {
      name: 'Light Tier',
      price: 990,
      description:
        "Role team, project base and content process. Conditions for a 48-hour upgrade to Pro must be confirmed separately prior to payment.",
    },
    pro: {
      name: 'Pro Tier',
      price: 1490,
      description:
        "Light plus TMA, funnels, content factory of five formats and quality control. The contents and terms are specified in the offer.",
    },
    swarm: {
      name: 'Sovereign Swarm',
      price: 2490,
      description:
        "Pro plus architectural analysis with Tatiana Colibri and Denys Viet and sovereign outline plan. The scope of work and infrastructure costs are agreed upon separately.",
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
      $('order-title').textContent = "Your format: " + tier.name;
      $('order-price').textContent = new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0}).format(tier.price);
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
          ? "Checkout will open: check payment availability, seller and terms. The order card itself is not a payment."
          : "Payment has not yet been activated: confirmed payment and legal details have not been specified. You can download a card of the selected format; she won't go anywhere.";
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
          amountUSD: tier.price, currency: "USD",
          status: 'draft_not_paid_not_reserved',
          createdAt: new Date().toISOString(),
          upgradeEligibility: 'requires_operator_confirmation',
        },
        null,
        2,
      ),
      'application/json',
    );
    C.toast("The card has been downloaded. Payment and reservation not created");
  });
  if (config.sellerName)
    $('seller-notice').textContent =
      String(config.sellerName) +
      ". Before paying, read the offer and data policy. Scenario calculations do not guarantee income.";

  const endpoint = C.trustedUrl(config.qualificationEndpoint, true);
  const leadReady = endpoint && config.sellerName && C.trustedUrl(config.privacyUrl);
  $('b2b-submit').textContent = leadReady ? "Send a request for diagnostics" : "Download application for transfer";
  if (leadReady)
    $('consent-text').firstChild.textContent =
      "I agree to send the specified data to the operator " +
      String(config.sellerName) +
      " to respond to the application. ";
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
      $('b2b-contact').setCustomValidity("Specify Telegram @username from 5 characters or email");
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
      $('b2b-status').textContent = "Fill in the answers meaningfully, not just with blanks.";
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
        "The application file has been downloaded to your device. It was not sent to Tatiana Colibri and Denys Viet. Send it through an agreed communication channel";
      return;
    }
    const button = $('b2b-submit');
    button.disabled = true;
    $('b2b-status').textContent = "We send it to the configured handler...";
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
        "The processor accepted the application. ID: " +
        receipt.receiptId.slice(0, 120) +
        ". Wait for a separate confirmation of the command";
      form.reset();
    } catch {
      $('b2b-status').textContent =
        "Receipt of the application has not been confirmed. Don't resubmit blindly: check with the team or download the answers";
      const fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'btn secondary compact';
      fallback.textContent = "Download my answers";
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
        " Acceptance: check with the source and obtain your permission to release.";
      document
        .querySelectorAll('[data-pipeline-role]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  const browserSelect = C.bindTabs($('browser-tabs'), {
    onChange(tab) {
      $('browser-address').textContent = "Example / " + tab.textContent.toLowerCase();
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
    $('carousel-status').textContent = `${carouselIndex + 1} from ${slides.length}`;
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
      track.start + ". Output: " + track.artifact + '.';
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
      "Educational project: teacher's memo.\nGoal: collect one material from proven rules.\nSources, draft and revision are kept separately.\nExternal actions are permitted by a person.",
    'audience/questions.md':
      "Study question: how to introduce yourself in English.\nA sample, an exercise and a self-test are needed.\nStudents' personal information is not used.\nUnknown facts need to be clarified.",
    'products/offer.md':
      "Artifact: a reminder with an exercise and a sample answer.\nThis is a fictitious product to demonstrate the interface.\nThe price and sale of this product are not specified.\nThe paid ColibriOS workshop is ordered separately.",
    'funnels/route.md':
      "Study route: request → select material → check version.\nThis is a scheme, not a connected mailing list.\nActual payment requires separate registration.\nNo message is sent from this view.",
    'agents/checklist.md':
      "The facts have been verified with the source.\nThe exercise was decided by the teacher.\nThe version of the material is clearly indicated.\nPublication and issuance require a separate decision.",
    'prompts-989/recipe.md':
      "Training request recipe:\nMy task: [one action].\nSource: [verified facts].\nDraft: [required material].\nVerification: [who will accept the result and based on what criteria].\nWhat is missing in the source code, please clarify. Don't make anything up.",
    'reports/07-00.md':
      "07:00: example of a scheduled report.\nThe draft memo is awaiting review.\nOne question about the source requires clarification.\nPublications, payments and shipments were not carried out.",
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
      ? "The file has been copied."
      : "Failed to copy automatically. Select text in the file window.";
  });
  $('gift-copy').addEventListener('click', async () => {
    const success = await C.copy($('starter-template').textContent);
    $('gift-status').textContent = success
      ? "The template has been copied. Submit your task."
      : "Buffer not available. Select and copy the template manually.";
  });
  const curator = {
    start:
      "Choose one action: for example, a reminder with an exercise. Fix who will accept the result.",
    input:
      "Convey only verified facts and unclassified sources. Unknown conditions need to be clarified, not invented.",
    check:
      "Check the facts with the source, check the example yourself and save the approved version. Allow external actions separately.",
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
    $('curator-answer').textContent = "Choose a question: we'll show you an example of a hint for the task.";
    document.querySelectorAll('[data-curator]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
  });

  const questions = [
    {
      id: 'now',
      text: "What do you already have for the first task?",
      choices: [
        ['experience', "Experience and materials"],
        ['audience', "Audience and questions"],
        ['product', "Product or service"],
        ['start', "Just an idea for now"],
      ],
    },
    {
      id: 'pain',
      text: "Where is more handmade now?",
      choices: [
        ['context', "Source search"],
        ['content', "Content"],
        ['route', "Applications and responses"],
        ['scope', "Selecting the first task"],
      ],
    },
    {
      id: 'tried',
      text: "What have you already tried?",
      choices: [
        ['chat', "Individual chats with AI"],
        ['templates', "Templates"],
        ['delegate', "Transfer to the contractor"],
        ['none', "Nothing yet"],
      ],
    },
    {
      id: 'delay',
      text: "How long have you been putting off this task?",
      choices: [
        ['recent', "Recently"],
        ['month', "About a month"],
        ['long', "Several months"],
        ['unknown', "I don't count the time"],
      ],
    },
    {
      id: 'friction',
      text: "What often prevents you from continuing?",
      choices: [
        ['unclear', "Next step unclear"],
        ['time', "Not enough time"],
        ['facts', "Sources not collected"],
        ['check', "I don't know how to check"],
      ],
    },
    {
      id: 'goal',
      text: "What result of the first build do you need?",
      choices: [
        ['text', "Proven material"],
        ['page', "Page and clear route"],
        ['request', "Procedure for processing an application"],
        ['map', "Project map"],
      ],
    },
    {
      id: 'acceptance',
      text: "How will you know when the step is ready?",
      choices: [
        ['source', "I'll check it with the source"],
        ['test', "I'll pass the test request"],
        ['review', "I'll show it to the person in charge"],
        ['help', "Need a verification checklist"],
      ],
    },
    {
      id: 'path',
      text: "What is the best way to move on?",
      choices: [
        ['self', "Independently by appointment"],
        ['done', "Discuss implementation for the team"],
        ['watch', "For now, see an example"],
      ],
    },
  ];
  let quizIndex = 0;
  const answers = Object.create(null);
  function renderQuestion(focus = false) {
    $('portal-quiz').hidden = false;
    $('quiz-result').hidden = true;
    const question = questions[quizIndex];
    $('quiz-progress').textContent = `Question ${quizIndex + 1} from ${questions.length}`;
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
    $('quiz-next').textContent = quizIndex === questions.length - 1 ? "Show my plan →" : "Continue →";
    $('quiz-back').disabled = quizIndex === 0;
    if (focus) title.focus({ preventScroll: true });
  }
  function answerLabel(key) {
    return (
      questions.find((q) => q.id === key)?.choices.find((choice) => choice[0] === answers[key])?.[1] ||
      "Not specified"
    );
  }
  function showQuizResult() {
    $('portal-quiz').hidden = true;
    $('quiz-result').hidden = false;
    const result = $('quiz-result');
    const title = node('h3', '', "Your point A and the next step");
    title.tabIndex = -1;
    const gaps = node('dl', 'portal-gap-list');
    for (const [label, key] of [
      ["Now", 'now'],
      ["Main bottleneck", 'pain'],
      ["The necessary artifact", 'goal'],
      ["How to check", 'acceptance'],
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
        ? "Narrow your first build down to one small action and one acceptance criteria. Don't try to run everything at once."
        : "Commit one source, one artifact, and review before release. Specify unknown conditions separately.",
    );
    const actions = node('div', 'actions');
    const link = node('a', 'btn');
    if (answers.now === 'start' || answers.path === 'watch' || !answers.path) {
      link.href = '#starter-gift';
      link.textContent = "Pick up the first task template →";
    } else if (answers.path === 'done') {
      link.href = '?route=b2b';
      link.textContent = "Discuss a separate B2B implementation →";
      link.addEventListener('click', (event) => {
        event.preventDefault();
        $('open-b2b').click();
      });
    } else {
      link.href = "/en/checkout.html?product=vip";
      link.textContent = "Independent workshop · $19 →";
    }
    const program = node('a', 'btn secondary', "View program");
    program.href = '#program';
    actions.append(link, program);
    const reset = node('button', 'btn secondary', "Go through again");
    reset.type = 'button';
    reset.id = 'quiz-reset';
    reset.addEventListener('click', () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      quizIndex = 0;
      renderQuestion(true);
    });
    result.replaceChildren(
      title,
      node('p', 'portal-caption', "Local plan for selected answers. The data has not been sent anywhere."),
      gaps,
      suggestion,
      actions,
      node(
        'p',
        'portal-caption',
        "All four formats remain available. Self-assessment is not a guarantee of results.",
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
      .map((item) => ({ item, key: 'scenario-' + item.id, text: item.quote, type: "Training scenario" }))
      .concat(
        reviews
          .slice(0, 18)
          .map((item) => ({ item, key: 'check-' + item.id, text: item.nextStep, type: "What to check" })),
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
      labels.append(node('strong', '', message.item.name + " · AI character"), node('span', '', message.type));
      identity.append(portrait, labels);
      const action = node('a', 'portal-text-link', "Open analysis →");
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
      controls.setAttribute('aria-label', "Playback speed");
      controls.append(node('span', '', "Speed"));
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
        const sound = node('button', '', "Watch with sound");
        sound.type = 'button';
        sound.addEventListener('click', () => {
          document.querySelectorAll('video').forEach((other) => {
            if (other !== video) other.muted = true;
          });
          video.volume = 1;
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            C.toast("Use the standard play button in the player.");
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
