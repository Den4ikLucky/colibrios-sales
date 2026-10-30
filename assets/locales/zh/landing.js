'use strict';
(() => {
  const C = window.Colibri;
  const $ = (id) => document.getElementById(id);
  const config = window.COLIBRI_CONFIG || {};
  const menu = $('menu-button');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? "关闭菜单" : "打开菜单");
    $('primary-nav').classList.toggle('open', open);
  });
  $('primary-nav')
    .querySelectorAll('a')
    .forEach((a) =>
      a.addEventListener('click', () => {
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', "打开菜单");
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
        ": 接受他的工作领域";
      index++;
      if (index >= agents.length) {
        clearInterval(agentTimer);
        $('run-agents').disabled = false;
        $('console-event').textContent = "> 12个角色→检查员的结果→等待您的“是”";
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
    $('monthly-hours').textContent = C.number(r.monthlyHours) + " 小时";
    $('net-effect').textContent = C.money(r.net);
    $('payback').textContent =
      r.payback === null ? "未实现" : (r.payback < 0.1 ? '< 0,1' : C.number(r.payback)) + " 月";
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
    $('coi-cost').textContent = C.money(coi) + " /月";
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
          mode === 'b2b' ? "每个人的例行公事，一天几个小时" : "您的日常安排，每周的小时数";
        $('mode-hint').textContent =
          mode === 'b2b'
            ? "对于团队：人员×每天小时数×每小时成本×22个工作日"
            : "对于作者来说：每周工作时间 × 每小时费用 × 每月 4.3 周。不要将已经考虑在内的小时数相加。";
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
        "窗口就完成了。有资费，付款前请检查升级条件";
      $('light-upgrade').textContent = "升级窗口已完成";
    } else if (!durable)
      $('countdown-note').textContent =
        "存储不可用：定时器仅针对当前标签，分享权限由策展人确认";
    else if (offer.fixed)
      $('countdown-note').textContent =
        "开窗 " +
        new Intl.DateTimeFormat("zh-Hans", { dateStyle: 'long', timeStyle: 'short' }).format(offer.end) +
        " 按设备时间。升级权另行确认";
    else
      $('countdown-note').textContent =
        "此设备上的个人评估窗口。不是参与预订或折扣确认";
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
      name: "AI 实战特训营 (AI Concentrate)",
      price: 19,
      description:
        "为期 3 个晚上的自导式数字研讨会：录制的分步视频模块、现成的 AI 模板和 AI 诊断。按照自己的步调进行，无需制定时间表。大师组单独付费。",
    },
    light: {
      name: 'Light Tier',
      price: 990,
      description:
        "角色团队、项目基础和内容流程。 48 小时升级到 Pro 的条件必须在付款前单独确认。",
    },
    pro: {
      name: 'Pro Tier',
      price: 1490,
      description:
        "Light plus TMA、漏斗、五种格式的内容工厂和质量控制。报价中明确了内容和条款。",
    },
    swarm: {
      name: 'Sovereign Swarm',
      price: 2490,
      description:
        "Pro plus 与 Tatiana Colibri 和 Denys Viet 进行建筑分析以及主权轮廓规划。工作范围和基础设施成本另行商定。",
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
      $('order-title').textContent = "您的格式： " + tier.name;
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
          ? "结帐将打开：检查付款可用性、卖家和条款。订单卡本身并不是付款。"
          : "付款尚未激活：已确认的付款和法律详细信息尚未指定。您可以下载所选格式的卡片；她哪儿也不去。";
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
    C.toast("该卡已下载。未创建付款和预订");
  });
  if (config.sellerName)
    $('seller-notice').textContent =
      String(config.sellerName) +
      "。付款前，请阅读优惠和数据政策。情景计算并不能保证收入。";

  const endpoint = C.trustedUrl(config.qualificationEndpoint, true);
  const leadReady = endpoint && config.sellerName && C.trustedUrl(config.privacyUrl);
  $('b2b-submit').textContent = leadReady ? "发送诊断请求" : "下载转让申请表";
  if (leadReady)
    $('consent-text').firstChild.textContent =
      "我同意将指定数据发送给运营商 " +
      String(config.sellerName) +
      " 回应申请。 ";
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
      $('b2b-contact').setCustomValidity("指定 Telegram @用户名（5 个字符）或电子邮件");
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
      $('b2b-status').textContent = "有意义地填写答案，而不仅仅是空白。";
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
        "应用程序文件已下载到您的设备。它没有发送给Tatiana Colibri和Denys Viet。通过约定的沟通渠道发送";
      return;
    }
    const button = $('b2b-submit');
    button.disabled = true;
    $('b2b-status').textContent = "我们将其发送到配置的处理程序...";
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
        "处理者接受了该申请。身份证号： " +
        receipt.receiptId.slice(0, 120) +
        "。等待命令的单独确认";
      form.reset();
    } catch {
      $('b2b-status').textContent =
        "尚未确认收到申请。不要盲目重新提交：与团队核实或下载答案";
      const fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'btn secondary compact';
      fallback.textContent = "下载我的答案";
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
        " 接受：与来源核实并获得您的发布许可。";
      document
        .querySelectorAll('[data-pipeline-role]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  const browserSelect = C.bindTabs($('browser-tabs'), {
    onChange(tab) {
      $('browser-address').textContent = "示例/ " + tab.textContent.toLowerCase();
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
    $('carousel-status').textContent = `${carouselIndex + 1} 来自 ${slides.length}`;
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
      track.start + "。输出： " + track.artifact + '.';
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
      "教育项目：教师备忘录。\n目标：从经过验证的规则中收集一种材料。\n来源、草稿和修订版分开保存。\n外部行为是经过人允许的。",
    'audience/questions.md':
      "研究问题：如何用英语介绍自己。\n需要样本、练习和自测。\n不使用学生的个人信息。\n未知的事实需要澄清。",
    'products/offer.md':
      "神器：带有练习和示例答案的提醒。\n这是一个虚构的产品，用于演示界面。\n该产品的价格和销售情况没有具体说明。\n付费 ColibriOS 研讨会需单独订购。",
    'funnels/route.md':
      "学习路线：请求→选择资料→查看版本。\n这是一个方案，而不是一个连接的邮件列表。\n实际付款需要单独注册。\n没有消息从此视图发送。",
    'agents/checklist.md':
      "事实已向消息人士核实。\n练习是由老师决定的。\n清楚地标明了材料的版本。\n出版和发行需要单独决定。",
    'prompts-989/recipe.md':
      "培训请求配方：\n我的任务：[一个动作]。\n资料来源：[已核实的事实]。\n草案：[所需材料]。\n验证：[谁将接受结果以及基于什么标准]。\n源代码中缺少什么，请澄清。不要编造任何事情。",
    'reports/07-00.md':
      "07:00：预定报告示例。\n备忘录草案正在等待审查。\n关于来源的一个问题需要澄清。\n出版、付款和发货均未进行。",
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
      ? "文件已被复制。"
      : "自动复制失败。在文件窗口中选择文本。";
  });
  $('gift-copy').addEventListener('click', async () => {
    const success = await C.copy($('starter-template').textContent);
    $('gift-status').textContent = success
      ? "模板已复制。提交您的任务。"
      : "缓冲区不可用。手动选择并复制模板。";
  });
  const curator = {
    start:
      "选择一项操作：例如，带有练习的提醒。确定谁将接受结果。",
    input:
      "仅传达经过验证的事实和非机密来源。未知的情况需要澄清，而不是发明。",
    check:
      "与来源核实事实，亲自检查示例并保存批准的版本。单独允许外部操作。",
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
    $('curator-answer').textContent = "选择一个问题：我们将向您展示任务提示的示例。";
    document.querySelectorAll('[data-curator]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
  });

  const questions = [
    {
      id: 'now',
      text: "第一个任务你已经有了什么？",
      choices: [
        ['experience', "经验和材料"],
        ['audience', "观众和问题"],
        ['product', "产品或服务"],
        ['start', "目前只是一个想法"],
      ],
    },
    {
      id: 'pain',
      text: "现在哪里手工制作比较多？",
      choices: [
        ['context', "来源搜索"],
        ['content', "内容"],
        ['route', "申请和回应"],
        ['scope', "选择第一个任务"],
      ],
    },
    {
      id: 'tried',
      text: "你已经尝试过什么？",
      choices: [
        ['chat', "与AI单独聊天"],
        ['templates', "模板"],
        ['delegate', "转移给承包商"],
        ['none', "还没有什么"],
      ],
    },
    {
      id: 'delay',
      text: "这个任务你已经推迟多久了？",
      choices: [
        ['recent', "最近"],
        ['month', "大约一个月"],
        ['long', "几个月"],
        ['unknown', "我不计算时间"],
      ],
    },
    {
      id: 'friction',
      text: "是什么经常阻止你继续下去？",
      choices: [
        ['unclear', "下一步尚不清楚"],
        ['time', "时间不够"],
        ['facts', "未收集来源"],
        ['check', "我不知道如何检查"],
      ],
    },
    {
      id: 'goal',
      text: "您需要第一次构建的结果是什么？",
      choices: [
        ['text', "经过验证的材料"],
        ['page', "页面清晰，路线清晰"],
        ['request', "处理申请的程序"],
        ['map', "项目地图"],
      ],
    },
    {
      id: 'acceptance',
      text: "您如何知道该步骤何时准备就绪？",
      choices: [
        ['source', "我会与来源核实一下"],
        ['test', "我将通过测试请求"],
        ['review', "我会拿给负责人看"],
        ['help', "需要验证清单"],
      ],
    },
    {
      id: 'path',
      text: "继续前进的最佳方式是什么？",
      choices: [
        ['self', "预约独立"],
        ['done', "讨论团队的实施"],
        ['watch', "现在，请看一个示例"],
      ],
    },
  ];
  let quizIndex = 0;
  const answers = Object.create(null);
  function renderQuestion(focus = false) {
    $('portal-quiz').hidden = false;
    $('quiz-result').hidden = true;
    const question = questions[quizIndex];
    $('quiz-progress').textContent = `问题 ${quizIndex + 1} 来自 ${questions.length}`;
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
    $('quiz-next').textContent = quizIndex === questions.length - 1 ? "显示我的计划 →" : "继续 →";
    $('quiz-back').disabled = quizIndex === 0;
    if (focus) title.focus({ preventScroll: true });
  }
  function answerLabel(key) {
    return (
      questions.find((q) => q.id === key)?.choices.find((choice) => choice[0] === answers[key])?.[1] ||
      "未指定"
    );
  }
  function showQuizResult() {
    $('portal-quiz').hidden = true;
    $('quiz-result').hidden = false;
    const result = $('quiz-result');
    const title = node('h3', '', "你的A点和下一步");
    title.tabIndex = -1;
    const gaps = node('dl', 'portal-gap-list');
    for (const [label, key] of [
      ["现在", 'now'],
      ["主要瓶颈", 'pain'],
      ["必备神器", 'goal'],
      ["如何检查", 'acceptance'],
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
        ? "将您的第一个构建缩小为一个小行动和一个验收标准。不要尝试一次运行所有内容。"
        : "提交一个源代码、一个工件，并在发布前进行审查。单独指定未知条件。",
    );
    const actions = node('div', 'actions');
    const link = node('a', 'btn');
    if (answers.now === 'start' || answers.path === 'watch' || !answers.path) {
      link.href = '#starter-gift';
      link.textContent = "拿起第一个任务模板→";
    } else if (answers.path === 'done') {
      link.href = '?route=b2b';
      link.textContent = "讨论单独的 B2B 实施 →";
      link.addEventListener('click', (event) => {
        event.preventDefault();
        $('open-b2b').click();
      });
    } else {
      link.href = "/zh/checkout.html?product=vip";
      link.textContent = "独立工场·$19→";
    }
    const program = node('a', 'btn secondary', "查看节目");
    program.href = '#program';
    actions.append(link, program);
    const reset = node('button', 'btn secondary', "再过一遍");
    reset.type = 'button';
    reset.id = 'quiz-reset';
    reset.addEventListener('click', () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      quizIndex = 0;
      renderQuestion(true);
    });
    result.replaceChildren(
      title,
      node('p', 'portal-caption', "选定答案的本地计划。数据尚未发送到任何地方。"),
      gaps,
      suggestion,
      actions,
      node(
        'p',
        'portal-caption',
        "所有四种格式仍然可用。自我评估并不能保证结果。",
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
      .map((item) => ({ item, key: 'scenario-' + item.id, text: item.quote, type: "训练场景" }))
      .concat(
        reviews
          .slice(0, 18)
          .map((item) => ({ item, key: 'check-' + item.id, text: item.nextStep, type: "要检查什么" })),
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
      labels.append(node('strong', '', message.item.name + " ·人工智能角色"), node('span', '', message.type));
      identity.append(portrait, labels);
      const action = node('a', 'portal-text-link', "开放分析 →");
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
      controls.setAttribute('aria-label', "播放速度");
      controls.append(node('span', '', "速度"));
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
        const sound = node('button', '', "有声观看");
        sound.type = 'button';
        sound.addEventListener('click', () => {
          document.querySelectorAll('video').forEach((other) => {
            if (other !== video) other.muted = true;
          });
          video.volume = 1;
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            C.toast("使用播放器中的标准播放按钮。");
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
