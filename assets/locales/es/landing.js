'use strict';
(() => {
  const C = window.Colibri;
  const $ = (id) => document.getElementById(id);
  const config = window.COLIBRI_CONFIG || {};
  const menu = $('menu-button');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? "Cerrar menú" : "abrir menú");
    $('primary-nav').classList.toggle('open', open);
  });
  $('primary-nav')
    .querySelectorAll('a')
    .forEach((a) =>
      a.addEventListener('click', () => {
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', "abrir menú");
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
        ": acepta su área de trabajo";
      index++;
      if (index >= agents.length) {
        clearInterval(agentTimer);
        $('run-agents').disabled = false;
        $('console-event').textContent = "> 12 roles → resultado del inspector → esperando tu “SÍ”";
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
      r.payback === null ? "No logrado" : (r.payback < 0.1 ? '< 0,1' : C.number(r.payback)) + " meses";
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
    $('coi-cost').textContent = C.money(coi) + " / mes";
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
          mode === 'b2b' ? "La rutina de todos, horas al día" : "Tu rutina, horas por semana";
        $('mode-hint').textContent =
          mode === 'b2b'
            ? "Para el equipo: personas × horas por día × costo por hora × 22 días hábiles"
            : "Para el autor: horas por semana × costo por hora × 4,3 semanas por mes. No sumar horas ya tenidas en cuenta.";
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
        "La ventana está completa. Las tarifas están disponibles, consulte las condiciones de actualización antes del pago.";
      $('light-upgrade').textContent = "La ventana de actualización está completa";
    } else if (!durable)
      $('countdown-note').textContent =
        "El almacenamiento no está disponible: el temporizador es solo para la pestaña actual, el curador confirma el derecho a compartir";
    else if (offer.fixed)
      $('countdown-note').textContent =
        "ventana arriba " +
        new Intl.DateTimeFormat("es", { dateStyle: 'long', timeStyle: 'short' }).format(offer.end) +
        " por hora del dispositivo. El derecho a la actualización se confirma por separado.";
    else
      $('countdown-note').textContent =
        "Una ventana de evaluación personal en este dispositivo. No es reserva de participación ni confirmación de descuento.";
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
      name: "Concentrado de IA",
      price: 19,
      description:
        "Taller digital autoguiado durante 3 noches: módulos de vídeo grabados paso a paso, plantillas de IA listas para usar y diagnósticos de IA. Ve a tu propio ritmo sin horario. El grupo máster se paga aparte.",
    },
    light: {
      name: 'Light Tier',
      price: 990,
      description:
        "Rol del equipo, base del proyecto y proceso de contenidos. Las condiciones para una actualización de 48 horas a Pro deben confirmarse por separado antes del pago.",
    },
    pro: {
      name: 'Pro Tier',
      price: 1490,
      description:
        "Light plus TMA, embudos, fábrica de contenidos de cinco formatos y control de calidad. Los contenidos y condiciones están especificados en la oferta.",
    },
    swarm: {
      name: 'Sovereign Swarm',
      price: 2490,
      description:
        "Análisis arquitectónico pro plus con Tatiana Colibri y Denys Viet y plano soberano. El alcance de la obra y los costos de infraestructura se acuerdan por separado.",
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
      $('order-title').textContent = "Su formato: " + tier.name;
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
          ? "Se abrirá el proceso de pago: verifique la disponibilidad de pago, el vendedor y los términos. La tarjeta de pedido en sí no es un pago."
          : "El pago aún no se ha activado: pago confirmado y no se han especificado detalles legales. Puede descargar una tarjeta del formato seleccionado; ella no irá a ninguna parte.";
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
    C.toast("La tarjeta ha sido descargada. Pago y reserva no creados");
  });
  if (config.sellerName)
    $('seller-notice').textContent =
      String(config.sellerName) +
      ". Antes de pagar lee la oferta y política de datos. Los cálculos de escenarios no garantizan ingresos.";

  const endpoint = C.trustedUrl(config.qualificationEndpoint, true);
  const leadReady = endpoint && config.sellerName && C.trustedUrl(config.privacyUrl);
  $('b2b-submit').textContent = leadReady ? "Enviar una solicitud de diagnóstico" : "Descargar solicitud de transferencia";
  if (leadReady)
    $('consent-text').firstChild.textContent =
      "Acepto enviar los datos especificados al operador " +
      String(config.sellerName) +
      " para responder a la solicitud. ";
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
      $('b2b-contact').setCustomValidity("Especifique Telegram @nombre de usuario de 5 caracteres o correo electrónico");
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
      $('b2b-status').textContent = "Complete las respuestas de manera significativa, no solo con espacios en blanco.";
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
        "El archivo de la aplicación se ha descargado en su dispositivo. No se lo enviaron a Tatiana Colibri y Denys Viet. Enviarlo a través de un canal de comunicación acordado";
      return;
    }
    const button = $('b2b-submit');
    button.disabled = true;
    $('b2b-status').textContent = "Lo enviamos al controlador configurado...";
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
        "El procesador aceptó la solicitud. identificación: " +
        receipt.receiptId.slice(0, 120) +
        ". Espere una confirmación separada del comando.";
      form.reset();
    } catch {
      $('b2b-status').textContent =
        "No se ha confirmado la recepción de la solicitud. No vuelva a enviar a ciegas: consulte con el equipo o descargue las respuestas";
      const fallback = document.createElement('button');
      fallback.type = 'button';
      fallback.className = 'btn secondary compact';
      fallback.textContent = "Descarga mis respuestas";
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
        " Aceptación: consulte con la fuente y obtenga su permiso para publicarlo.";
      document
        .querySelectorAll('[data-pipeline-role]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  const browserSelect = C.bindTabs($('browser-tabs'), {
    onChange(tab) {
      $('browser-address').textContent = "Ejemplo / " + tab.textContent.toLowerCase();
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
    $('carousel-status').textContent = `${carouselIndex + 1} de ${slides.length}`;
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
      track.start + ". Salida: " + track.artifact + '.';
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
      "Proyecto educativo: memorando del profesor.\nObjetivo: recopilar un material de reglas probadas.\nLas fuentes, el borrador y la revisión se mantienen por separado.\nLas acciones externas están permitidas por una persona.",
    'audience/questions.md':
      "Pregunta de estudio: cómo presentarse en inglés.\nSe necesita una muestra, un ejercicio y una autoevaluación.\nNo se utiliza la información personal de los estudiantes.\nEs necesario aclarar hechos desconocidos.",
    'products/offer.md':
      "Artefacto: un recordatorio con un ejercicio y una respuesta de muestra.\nEste es un producto ficticio para demostrar la interfaz.\nEl precio y venta de este producto no están especificados.\nEl taller ColibriOS pago se pide por separado.",
    'funnels/route.md':
      "Ruta de estudio: solicitar → seleccionar material → consultar versión.\nEste es un esquema, no una lista de correo conectada.\nEl pago real requiere registro por separado.\nNo se envía ningún mensaje desde esta vista.",
    'agents/checklist.md':
      "Los hechos han sido verificados con la fuente.\nEl ejercicio lo decidió el profesor.\nLa versión del material está claramente indicada.\nLa publicación y la emisión requieren una decisión separada.",
    'prompts-989/recipe.md':
      "Receta de solicitud de formación:\nMi tarea: [una acción].\nFuente: [hechos verificados].\nBorrador: [material requerido].\nVerificación: [quién aceptará el resultado y en base a qué criterios].\nLo que falta en el código fuente, por favor aclare. No inventes nada.",
    'reports/07-00.md':
      "07:00: ejemplo de informe programado.\nEl borrador del memorando está pendiente de revisión.\nUna pregunta sobre la fuente requiere aclaración.\nNo se realizaron publicaciones, pagos ni envíos.",
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
      ? "El archivo ha sido copiado."
      : "No se pudo copiar automáticamente. Seleccione texto en la ventana del archivo.";
  });
  $('gift-copy').addEventListener('click', async () => {
    const success = await C.copy($('starter-template').textContent);
    $('gift-status').textContent = success
      ? "La plantilla ha sido copiada. Envía tu tarea."
      : "Búfer no disponible. Seleccione y copie la plantilla manualmente.";
  });
  const curator = {
    start:
      "Elige una acción: por ejemplo, un recordatorio con un ejercicio. Arreglar quién aceptará el resultado.",
    input:
      "Transmitir únicamente hechos verificados y fuentes no clasificadas. Es necesario aclarar las condiciones desconocidas, no inventarlas.",
    check:
      "Verifique los hechos con la fuente, verifique el ejemplo usted mismo y guarde la versión aprobada. Permitir acciones externas por separado.",
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
    $('curator-answer').textContent = "Elige una pregunta: te mostraremos un ejemplo de una pista para la tarea.";
    document.querySelectorAll('[data-curator]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
  });

  const questions = [
    {
      id: 'now',
      text: "¿Qué tienes ya para la primera tarea?",
      choices: [
        ['experience', "Experiencia y materiales."],
        ['audience', "Audiencia y preguntas"],
        ['product', "Producto o servicio"],
        ['start', "Solo una idea por ahora"],
      ],
    },
    {
      id: 'pain',
      text: "¿Dónde hay más artesanía ahora?",
      choices: [
        ['context', "búsqueda de fuentes"],
        ['content', "Contenido"],
        ['route', "Aplicaciones y respuestas"],
        ['scope', "Seleccionar la primera tarea"],
      ],
    },
    {
      id: 'tried',
      text: "¿Qué has probado ya?",
      choices: [
        ['chat', "Chats individuales con IA"],
        ['templates', "Plantillas"],
        ['delegate', "Transferencia al contratista"],
        ['none', "Nada todavía"],
      ],
    },
    {
      id: 'delay',
      text: "¿Cuánto tiempo llevas postergando esta tarea?",
      choices: [
        ['recent', "Recientemente"],
        ['month', "alrededor de un mes"],
        ['long', "Varios meses"],
        ['unknown', "no cuento el tiempo"],
      ],
    },
    {
      id: 'friction',
      text: "¿Qué te impide muchas veces continuar?",
      choices: [
        ['unclear', "El siguiente paso no está claro"],
        ['time', "no hay suficiente tiempo"],
        ['facts', "Fuentes no recopiladas"],
        ['check', "no se como comprobarlo"],
      ],
    },
    {
      id: 'goal',
      text: "¿Qué resultado de la primera compilación necesitas?",
      choices: [
        ['text', "Material probado"],
        ['page', "Pagina y ruta clara"],
        ['request', "Procedimiento para tramitar una solicitud"],
        ['map', "Mapa del proyecto"],
      ],
    },
    {
      id: 'acceptance',
      text: "¿Cómo sabrás cuando el paso esté listo?",
      choices: [
        ['source', "Lo comprobaré con la fuente."],
        ['test', "Pasaré la solicitud de prueba"],
        ['review', "Se lo mostraré al responsable."],
        ['help', "Necesita una lista de verificación de verificación"],
      ],
    },
    {
      id: 'path',
      text: "¿Cuál es la mejor manera de seguir adelante?",
      choices: [
        ['self', "Independientemente con cita previa"],
        ['done', "Discutir la implementación para el equipo."],
        ['watch', "Por ahora, vea un ejemplo."],
      ],
    },
  ];
  let quizIndex = 0;
  const answers = Object.create(null);
  function renderQuestion(focus = false) {
    $('portal-quiz').hidden = false;
    $('quiz-result').hidden = true;
    const question = questions[quizIndex];
    $('quiz-progress').textContent = `Pregunta ${quizIndex + 1} de ${questions.length}`;
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
    $('quiz-next').textContent = quizIndex === questions.length - 1 ? "Mostrar mi plan →" : "Continuar →";
    $('quiz-back').disabled = quizIndex === 0;
    if (focus) title.focus({ preventScroll: true });
  }
  function answerLabel(key) {
    return (
      questions.find((q) => q.id === key)?.choices.find((choice) => choice[0] === answers[key])?.[1] ||
      "No especificado"
    );
  }
  function showQuizResult() {
    $('portal-quiz').hidden = true;
    $('quiz-result').hidden = false;
    const result = $('quiz-result');
    const title = node('h3', '', "Tu punto A y el siguiente paso");
    title.tabIndex = -1;
    const gaps = node('dl', 'portal-gap-list');
    for (const [label, key] of [
      ["ahora", 'now'],
      ["Principal cuello de botella", 'pain'],
      ["El artefacto necesario", 'goal'],
      ["como comprobar", 'acceptance'],
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
        ? "Limite su primera construcción a una pequeña acción y un criterio de aceptación. No intente ejecutar todo a la vez."
        : "Confirme una fuente, un artefacto y revíselo antes del lanzamiento. Especifique las condiciones desconocidas por separado.",
    );
    const actions = node('div', 'actions');
    const link = node('a', 'btn');
    if (answers.now === 'start' || answers.path === 'watch' || !answers.path) {
      link.href = '#starter-gift';
      link.textContent = "Elija la primera plantilla de tarea →";
    } else if (answers.path === 'done') {
      link.href = '?route=b2b';
      link.textContent = "Discutir una implementación B2B separada →";
      link.addEventListener('click', (event) => {
        event.preventDefault();
        $('open-b2b').click();
      });
    } else {
      link.href = "/es/checkout.html?product=vip";
      link.textContent = "Taller independiente · $19 →";
    }
    const program = node('a', 'btn secondary', "Ver programa");
    program.href = '#program';
    actions.append(link, program);
    const reset = node('button', 'btn secondary', "pasar de nuevo");
    reset.type = 'button';
    reset.id = 'quiz-reset';
    reset.addEventListener('click', () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      quizIndex = 0;
      renderQuestion(true);
    });
    result.replaceChildren(
      title,
      node('p', 'portal-caption', "Plan local para respuestas seleccionadas. Los datos no han sido enviados a ninguna parte."),
      gaps,
      suggestion,
      actions,
      node(
        'p',
        'portal-caption',
        "Los cuatro formatos siguen estando disponibles. La autoevaluación no es garantía de resultados.",
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
      .map((item) => ({ item, key: 'scenario-' + item.id, text: item.quote, type: "Escenario de entrenamiento" }))
      .concat(
        reviews
          .slice(0, 18)
          .map((item) => ({ item, key: 'check-' + item.id, text: item.nextStep, type: "Que comprobar" })),
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
      labels.append(node('strong', '', message.item.name + " · Personaje de IA"), node('span', '', message.type));
      identity.append(portrait, labels);
      const action = node('a', 'portal-text-link', "Abrir análisis →");
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
      controls.setAttribute('aria-label', "Velocidad de reproducción");
      controls.append(node('span', '', "Velocidad"));
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
        const sound = node('button', '', "Mirar con sonido");
        sound.type = 'button';
        sound.addEventListener('click', () => {
          document.querySelectorAll('video').forEach((other) => {
            if (other !== video) other.muted = true;
          });
          video.volume = 1;
          video.muted = false;
          video.play().catch(() => {
            video.muted = true;
            C.toast("Utilice el botón de reproducción estándar en el reproductor.");
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
