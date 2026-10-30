'use strict';
(() => {
  const C = window.Colibri;
  const $ = (id) => document.getElementById(id);
  const config = window.COLIBRI_CONFIG || {};
  const menu = $('menu-button');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? "메뉴 닫기" : "메뉴 열기");
    $('primary-nav').classList.toggle('open', open);
  });
  $('primary-nav')
    .querySelectorAll('a')
    .forEach((a) =>
      a.addEventListener('click', () => {
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', "메뉴 열기");
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
        ": 자신의 업무 영역을 받아들인다";
      index++;
      if (index >= agents.length) {
        clearInterval(agentTimer);
        $('run-agents').disabled = false;
        $('console-event').textContent = "> 12개 역할 → 검사관 결과 → \"YES\" 대기 중";
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
    $('monthly-hours').textContent = C.number(r.monthlyHours) + " 시간";
    $('net-effect').textContent = C.money(r.net);
    $('payback').textContent =
      r.payback === null ? "달성되지 않음" : (r.payback < 0.1 ? '< 0,1' : C.number(r.payback)) + " 개월";
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
    $('coi-cost').textContent = C.money(coi) + " /월";
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
          mode === 'b2b' ? "모두의 일상, 하루에 몇 시간씩" : "귀하의 루틴, 주당 시간";
        $('mode-hint').textContent =
          mode === 'b2b'
            ? "팀의 경우: 인력 × 일일 시간 × 시간당 비용 × 22 영업일"
            : "저자의 경우: 주당 시간 × 시간당 비용 × 월 4.3주입니다. 이미 고려한 시간을 합산하지 마십시오.";
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
        "창이 완성되었습니다. 관세가 적용됩니다. 결제 전 업그레이드 조건을 확인하세요.";
      $('light-upgrade').textContent = "업그레이드 기간이 완료되었습니다";
    } else if (!durable)
      $('countdown-note').textContent =
        "저장 공간을 사용할 수 없습니다. 타이머는 현재 탭에만 적용되며, 공유 권한은 큐레이터가 확인합니다.";
    else if (offer.fixed)
      $('countdown-note').textContent =
        "창 위로 " +
        new Intl.DateTimeFormat("ko", { dateStyle: 'long', timeStyle: 'short' }).format(offer.end) +
        " 장치 시간별. 업그레이드 권한은 별도로 확인됩니다.";
    else
      $('countdown-note').textContent =
        "이 장치에 대한 개인 평가 창입니다. 참가예약이나 할인확인이 아닌";
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
      name: "AI 집중 마스터클래스 (AI Concentrate)",
      price: 19,
      description:
        "3일 저녁 동안 진행되는 셀프 가이드 디지털 워크숍: 녹화된 단계별 비디오 모듈, 기성 AI 템플릿 및 AI 진단. 일정 없이 원하는 속도로 이동하세요. 마스터 그룹은 별도로 지불됩니다.",
    },
    light: {
      name: 'Light Tier',
      price: 990,
      description:
        "역할 팀, 프로젝트 기반 및 콘텐츠 프로세스. Pro로 48시간 업그레이드 조건은 결제 전 별도로 확인해야 합니다.",
    },
    pro: {
      name: 'Pro Tier',
      price: 1490,
      description:
        "Light와 TMA, 퍼널, 5가지 형식의 콘텐츠 팩토리 및 품질 관리. 내용과 조건은 제안에 명시되어 있습니다.",
    },
    swarm: {
      name: 'Sovereign Swarm',
      price: 2490,
      description:
        "Tatiana Colibri 및 Denys Viet을 사용한 Pro Plus 아키텍처 분석 및 주권 개요 계획. 작업 범위와 인프라 비용은 별도로 합의됩니다.",
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
      $('order-title').textContent = "귀하의 형식: " + tier.name;
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
          ? "결제가 시작됩니다. 결제 가능 여부, 판매자 및 조건을 확인하세요. 주문카드 자체는 결제가 되지 않습니다."
          : "결제가 아직 활성화되지 않았습니다. 결제 확인 및 법적 세부정보가 지정되지 않았습니다. 선택한 형식의 카드를 다운로드할 수 있습니다. 그녀는 아무데도 가지 않을 것입니다.";
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
    C.toast("카드가 다운로드되었습니다. 결제 및 예약이 생성되지 않았습니다.");
  });
  if (config.sellerName)
    $('seller-notice').textContent =
      String(config.sellerName) +
      ". 결제하기 전에 혜택 및 데이터 정책을 읽어보세요. 시나리오 계산은 수입을 보장하지 않습니다.";

  const endpoint = C.trustedUrl(config.qualificationEndpoint, true);
  const leadReady = endpoint && config.sellerName && C.trustedUrl(config.privacyUrl);
  $('b2b-submit').textContent = leadReady ? "진단 요청 보내기" : "이전 신청서 다운로드";
  if (leadReady)
    $('consent-text').firstChild.textContent =
      "지정된 데이터를 운영자에게 보내는 데 동의합니다. " +
      String(config.sellerName) +
      " 신청서에 응답합니다. ";
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
      $('b2b-contact').setCustomValidity("텔레그램 @사용자 이름을 5자 또는 이메일로 지정하세요.");
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
      $('b2b-status').textContent = "빈칸만 채우지 말고 의미 있게 답을 채워보세요.";
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
        "애플리케이션 파일이 장치에 다운로드되었습니다. Tatiana Colibri와 Denys Viet에게는 전송되지 않았습니다. 합의된 통신 채널을 통해 전송합니다.";
      return;
    }
    const button = $('b2b-submit');
    button.disabled = true;
    $('b2b-status').textContent = "구성된 핸들러로 보냅니다...";
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
        "프로세서가 신청서를 수락했습니다. 아이디: " +
        receipt.receiptId.slice(0, 120) +
        ". 별도의 명령 확인을 기다립니다.";
      form.reset();
    } catch {
      $('b2b-status').textContent =
        "신청서 접수가 확인되지 않았습니다. 무작정 다시 제출하지 마세요. 팀에 확인하거나 답변을 다운로드하세요.";
      const fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'btn secondary compact';
      fallback.textContent = "내 답변 다운로드";
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
        " 동의: 출처를 확인하고 공개 허가를 받으세요.";
      document
        .querySelectorAll('[data-pipeline-role]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  const browserSelect = C.bindTabs($('browser-tabs'), {
    onChange(tab) {
      $('browser-address').textContent = "예시 / " + tab.textContent.toLowerCase();
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
    $('carousel-status').textContent = `${carouselIndex + 1} 에서 ${slides.length}`;
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
      track.start + ". 출력: " + track.artifact + '.';
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
      "교육 프로젝트: 교사의 메모.\n목표: 입증된 규칙에서 하나의 자료를 수집합니다.\n소스, 초안 및 개정판은 별도로 보관됩니다.\n사람은 외부 행동을 허용합니다.",
    'audience/questions.md':
      "학습문제: 영어로 자신을 소개하는 방법.\n샘플, 연습 및 자체 테스트가 필요합니다.\n학생의 개인정보는 사용되지 않습니다.\n알려지지 않은 사실을 밝혀야 합니다.",
    'products/offer.md':
      "아티팩트: 연습 문제와 샘플 답변이 포함된 알림입니다.\n인터페이스를 시연하기 위한 가상의 제품입니다.\n이 제품의 가격과 판매는 명시되어 있지 않습니다.\n유료 ColibriOS 워크샵은 별도로 주문됩니다.",
    'funnels/route.md':
      "학습 경로 : 요청 → 자료 선택 → 버전 확인.\n이것은 연결된 메일링 리스트가 아닌 계획입니다.\n실제 결제는 별도 등록이 필요합니다.\n이 보기에서는 메시지가 전송되지 않습니다.",
    'agents/checklist.md':
      "사실은 출처를 통해 확인되었습니다.\n운동은 선생님이 결정했어요.\n자료의 버전이 명확하게 표시됩니다.\n출판과 발행에는 별도의 결정이 필요합니다.",
    'prompts-989/recipe.md':
      "훈련 요청 레시피:\n내 작업: [원액션].\n출처 : [확인된 사실].\n초안: [필수 자료].\n검증: [결과를 누가, 어떤 기준에 따라 받아들일 것인가].\n소스코드에 무엇이 빠졌는지 명확히 해주세요. 아무것도 꾸미지 마세요.",
    'reports/07-00.md':
      "07:00: 예정된 보고서의 예입니다.\n초안 메모가 검토를 기다리고 있습니다.\n출처에 대한 한 가지 질문에는 설명이 필요합니다.\n출판, 결제, 배송이 이루어지지 않았습니다.",
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
      ? "파일이 복사되었습니다."
      : "자동으로 복사하지 못했습니다. 파일 창에서 텍스트를 선택합니다.";
  });
  $('gift-copy').addEventListener('click', async () => {
    const success = await C.copy($('starter-template').textContent);
    $('gift-status').textContent = success
      ? "템플릿이 복사되었습니다. 작업을 제출하세요."
      : "버퍼를 사용할 수 없습니다. 템플릿을 수동으로 선택하고 복사합니다.";
  });
  const curator = {
    start:
      "하나의 작업을 선택합니다(예: 운동 알림). 결과를 받아들일 사람을 정하세요.",
    input:
      "검증된 사실과 분류되지 않은 출처만을 전달합니다. 알려지지 않은 조건은 만들어내는 것이 아니라 명확히 해야 합니다.",
    check:
      "출처를 통해 사실을 확인하고, 예시를 직접 확인하고, 승인된 버전을 저장하세요. 외부 작업을 별도로 허용합니다.",
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
    $('curator-answer').textContent = "질문을 선택하세요. 작업에 대한 힌트의 예를 보여드리겠습니다.";
    document.querySelectorAll('[data-curator]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
  });

  const questions = [
    {
      id: 'now',
      text: "첫 번째 작업을 위해 이미 무엇을 갖고 있나요?",
      choices: [
        ['experience', "경험과 재료"],
        ['audience', "청중과 질문"],
        ['product', "제품 또는 서비스"],
        ['start', "지금은 그냥 아이디어"],
      ],
    },
    {
      id: 'pain',
      text: "이제 손으로 만드는 것이 더 많은 곳은 어디입니까?",
      choices: [
        ['context', "소스 검색"],
        ['content', "내용"],
        ['route', "신청 및 응답"],
        ['scope', "첫 번째 작업 선택"],
      ],
    },
    {
      id: 'tried',
      text: "이미 무엇을 시도하셨나요?",
      choices: [
        ['chat', "AI와의 개별 채팅"],
        ['templates', "템플릿"],
        ['delegate', "계약자에게 양도"],
        ['none', "아직 아무것도 없습니다"],
      ],
    },
    {
      id: 'delay',
      text: "이 일을 얼마나 미루셨나요?",
      choices: [
        ['recent', "최근"],
        ['month', "약 한 달"],
        ['long', "몇 달"],
        ['unknown', "나는 시간을 세지 않는다"],
      ],
    },
    {
      id: 'friction',
      text: "종종 무엇이 계속 진행을 방해합니까?",
      choices: [
        ['unclear', "다음 단계가 불분명함"],
        ['time', "시간이 부족해요"],
        ['facts', "수집되지 않은 소스"],
        ['check', "어떻게 확인하는지 모르겠어요"],
      ],
    },
    {
      id: 'goal',
      text: "첫 번째 빌드의 결과는 무엇입니까?",
      choices: [
        ['text', "검증된 소재"],
        ['page', "페이지 및 경로 지우기"],
        ['request', "신청서 처리 절차"],
        ['map', "프로젝트 맵"],
      ],
    },
    {
      id: 'acceptance',
      text: "단계가 언제 준비되었는지 어떻게 알 수 있나요?",
      choices: [
        ['source', "출처를 통해 확인해보겠습니다"],
        ['test', "테스트 요청을 통과하겠습니다."],
        ['review', "담당자에게 보여드릴게요"],
        ['help', "확인 체크리스트가 필요합니다"],
      ],
    },
    {
      id: 'path',
      text: "계속 진행하는 가장 좋은 방법은 무엇입니까?",
      choices: [
        ['self', "약속에 의해 독립적으로"],
        ['done', "팀 구현 논의"],
        ['watch', "지금은 예를 참조하세요."],
      ],
    },
  ];
  let quizIndex = 0;
  const answers = Object.create(null);
  function renderQuestion(focus = false) {
    $('portal-quiz').hidden = false;
    $('quiz-result').hidden = true;
    const question = questions[quizIndex];
    $('quiz-progress').textContent = `질문 ${quizIndex + 1} 에서 ${questions.length}`;
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
    $('quiz-next').textContent = quizIndex === questions.length - 1 ? "내 계획 보기 →" : "계속 →";
    $('quiz-back').disabled = quizIndex === 0;
    if (focus) title.focus({ preventScroll: true });
  }
  function answerLabel(key) {
    return (
      questions.find((q) => q.id === key)?.choices.find((choice) => choice[0] === answers[key])?.[1] ||
      "지정되지 않음"
    );
  }
  function showQuizResult() {
    $('portal-quiz').hidden = true;
    $('quiz-result').hidden = false;
    const result = $('quiz-result');
    const title = node('h3', '', "포인트 A와 다음 단계");
    title.tabIndex = -1;
    const gaps = node('dl', 'portal-gap-list');
    for (const [label, key] of [
      ["지금", 'now'],
      ["주요 병목 현상", 'pain'],
      ["필요한 아티팩트", 'goal'],
      ["확인 방법", 'acceptance'],
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
        ? "첫 번째 빌드를 하나의 작은 작업과 하나의 승인 기준으로 좁힙니다. 모든 것을 한 번에 실행하려고 하지 마십시오."
        : "하나의 소스, 하나의 아티팩트를 커밋하고 출시 전에 검토하세요. 알 수 없는 조건을 별도로 지정합니다.",
    );
    const actions = node('div', 'actions');
    const link = node('a', 'btn');
    if (answers.now === 'start' || answers.path === 'watch' || !answers.path) {
      link.href = '#starter-gift';
      link.textContent = "첫 번째 작업 템플릿 선택 →";
    } else if (answers.path === 'done') {
      link.href = '?route=b2b';
      link.textContent = "별도의 B2B 구현 논의 →";
      link.addEventListener('click', (event) => {
        event.preventDefault();
        $('open-b2b').click();
      });
    } else {
      link.href = "/ko/checkout.html?product=vip";
      link.textContent = "독립 워크샵 · $19 →";
    }
    const program = node('a', 'btn secondary', "프로그램 보기");
    program.href = '#program';
    actions.append(link, program);
    const reset = node('button', 'btn secondary', "다시 통과하세요");
    reset.type = 'button';
    reset.id = 'quiz-reset';
    reset.addEventListener('click', () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      quizIndex = 0;
      renderQuestion(true);
    });
    result.replaceChildren(
      title,
      node('p', 'portal-caption', "선택된 답변에 대한 지역 계획. 데이터가 어디로도 전송되지 않았습니다."),
      gaps,
      suggestion,
      actions,
      node(
        'p',
        'portal-caption',
        "네 가지 형식을 모두 계속 사용할 수 있습니다. 자체 평가는 결과를 보장하지 않습니다.",
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
      .map((item) => ({ item, key: 'scenario-' + item.id, text: item.quote, type: "훈련 시나리오" }))
      .concat(
        reviews
          .slice(0, 18)
          .map((item) => ({ item, key: 'check-' + item.id, text: item.nextStep, type: "확인해야 할 사항" })),
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
      labels.append(node('strong', '', message.item.name + " · AI 캐릭터"), node('span', '', message.type));
      identity.append(portrait, labels);
      const action = node('a', 'portal-text-link', "분석 열기 →");
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
      controls.setAttribute('aria-label', "재생 속도");
      controls.append(node('span', '', "속도"));
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
        const sound = node('button', '', "소리와 함께 시청");
        sound.type = 'button';
        sound.addEventListener('click', () => {
          document.querySelectorAll('video').forEach((other) => {
            if (other !== video) other.muted = true;
          });
          video.volume = 1;
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            C.toast("플레이어의 표준 재생 버튼을 사용하세요.");
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
