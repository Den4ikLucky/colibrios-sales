import './reviews-data.js';

// Preserve the companion editorial dataset. Adapt its public schema locally.
const REVIEW_ROLES = Object.freeze([
  { id: 'all', label: "Los 20", count: 20 },
  { id: 'tutors', label: "Tutores", count: 4 },
  { id: 'psychologists', label: "Psicólogos", count: 4 },
  { id: 'experts', label: "Expertos y novatos", count: 4 },
  { id: 'marketers', label: "Comercializadores", count: 4 },
  { id: 'commerce', label: "Comercios y servicios", count: 4 },
]);
const ROLE_IDS = Object.freeze({
  'a-prepod': 'tutors',
  'a-psiholog': 'psychologists',
  'a-novichok': 'experts',
  'a-marketolog': 'marketers',
  'a-magazin': 'commerce',
});
const SELECTED_STUDENT_VIDEOS = Object.freeze([
  'assets/videos/student_01.mp4',
  'assets/videos/student_02.mp4',
  'assets/videos/student_03.mp4',
  'assets/videos/student_04.mp4',
  'assets/videos/student_05.mp4',
  'assets/videos/student_06.mp4',
  'assets/videos/student_07.mp4',
  'assets/videos/student_08.mp4',
  'assets/videos/student_09.mp4',
  'assets/videos/student_10.mp4',
]);
const STUDENT_REVIEWS = Object.freeze(
  (window.COLIBRIOS_REVIEWS_20 || []).map((item, index) =>
    Object.freeze({
      id: index + 1,
      role: ROLE_IDS[item.roleId],
      name: item.name,
      title: item.headline,
      task: item.taskBuiltIn3Evenings,
      summary: item.quote,
      beforeText: item.routineBefore,
      afterText: item.resultAfter,
      acceptance: item.nextStep,
      portrait: item.posterSrc,
      video: SELECTED_STUDENT_VIDEOS[index] || null,
      poster: item.posterSrc,
      evidenceType: item.caseType,
    }),
  ),
);
// Keep the supplied dataset intact and select the verified public price repair.
const PUBLIC_BROLL_SOURCES = Object.freeze({
  broll_01: Object.freeze({
    video: 'assets/videos/broll_01_dennis_pool_29s_public.mp4',
    poster: 'assets/videos/broll_01_dennis_pool_29s_public.jpg',
  }),
});
const BROLLS = Object.freeze(
  (window.COLIBRIOS_BROLL_SHOWCASE || []).map((item) =>
    Object.freeze({
      id: item.id,
      title: item.title,
      caption: item.caption,
      video: PUBLIC_BROLL_SOURCES[item.id]?.video || item.videoSrc,
      poster: PUBLIC_BROLL_SOURCES[item.id]?.poster || item.posterSrc,
    }),
  ),
);

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const players = new Set();
const visibleBroll = new Set();
const manualPlayback = new WeakMap();
const managedPauses = new WeakSet();
const automaticStarts = new WeakSet();
const waveforms = new Map();
const publicBase = 'https://den4iklucky.github.io/colibrios-sales/';

function mediaUrl(path) {
  if (window.COLIBRI_MEDIA_URLS?.[path]) return window.COLIBRI_MEDIA_URLS[path];
  if (!/^https?:/.test(import.meta.url)) return new URL(path, publicBase).href;
  return new URL('/' + path.replace(/^\.\.\//, '').replace(/^\//, ''), location.origin).href;
}
function pageUrl(path) {
  if (window.COLIBRI_PAGE_URLS?.[path]) return window.COLIBRI_PAGE_URLS[path];
  if (!/^https?:/.test(import.meta.url)) return new URL(path, publicBase).href;
  return new URL('/' + path.replace(/^\.\.\//, '').replace(/^\//, ''), location.origin).href;
}
function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}
function icon(name) {
  const paths = {
    play: '<path d="m9 5 10 7-10 7Z"/>',
    sound: '<path d="m11 5-5 4H3v6h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 5-5 4H3v6h3l5 4Z"/><path d="m16 9 5 6m0-6-5 6"/>',
  };
  const wrapper = node('span', 'review-icon');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  return wrapper;
}
function updateSound(video, button) {
  const audible = !video.muted && video.volume > 0;
  button.replaceChildren(
    icon(audible ? 'sound' : 'mute'),
    document.createTextNode(audible ? "Silenciar" : "Dejar de silenciar"),
  );
  button.setAttribute('aria-pressed', String(audible));
  button.setAttribute(
    'aria-label',
    `${audible ? "Silenciar" : "Dejar de silenciar"}: ${video.getAttribute('aria-label')}`,
  );
}
function muteOthers(active) {
  for (const player of players) if (player !== active) player.muted = true;
}
function pauseManaged(video) {
  if (video.paused) return;
  managedPauses.add(video);
  video.pause();
}
function pauseEverything() {
  for (const player of players) {
    pauseManaged(player);
    player.muted = true;
  }
  for (const controller of waveforms.values()) controller.stop();
}
function startSilentLoops() {
  if (document.hidden || reducedMotion.matches) return;
  // Bound simultaneous automatic decoders while keeping all eight clips available.
  let automaticCount = 0;
  for (const video of visibleBroll) {
    // A viewer's explicit play or pause takes precedence over automatic loops.
    if (manualPlayback.has(video)) continue;
    if (!video.muted && !video.paused) continue;
    if (automaticCount++ < 2) {
      video.muted = true;
      if (video.paused) {
        automaticStarts.add(video);
        video.play().catch(() => {
          automaticStarts.delete(video);
        });
      }
    } else pauseManaged(video);
  }
}
const visibility =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (video.dataset.brollPlayer !== undefined) visibleBroll.add(video);
            } else {
              visibleBroll.delete(video);
              pauseManaged(video);
              video.muted = true;
            }
          }
          startSilentLoops();
        },
        { threshold: 0.25 },
      )
    : null;

function makeVideo({ video: source, poster, title }, { loop = false } = {}) {
  const container = node('div', 'review-video-block');
  const video = node('video', 'review-video');
  video.src = mediaUrl(source);
  video.poster = mediaUrl(poster);
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';
  video.muted = true;
  video.defaultMuted = true;
  video.loop = loop;
  video.setAttribute('aria-label', title);
  if (loop) video.dataset.brollPlayer = '';
  const fallback = node('p', 'review-media-fallback');
  fallback.append(document.createTextNode("Si el reproductor integrado no está disponible, "));
  const direct = node('a', '', "abre el video como un archivo separado");
  direct.href = mediaUrl(source);
  fallback.append(direct, document.createTextNode('.'));
  const controls = node('div', 'review-media-actions');
  const play = node('button', 'review-control');
  play.type = 'button';
  play.append(icon('play'), document.createTextNode("ver"));
  play.setAttribute('aria-label', `Mirar: ${title}`);
  const sound = node('button', 'review-control');
  sound.type = 'button';
  sound.setAttribute('aria-label', `Sonido: ${title}`);
  updateSound(video, sound);
  const message = node('p', 'review-player-status');
  message.setAttribute('role', 'status');
  play.addEventListener('click', () => {
    if (!video.paused) {
      if (loop) manualPlayback.set(video, 'pause');
      video.pause();
      return;
    }
    if (loop) manualPlayback.set(video, 'play');
    if (!video.muted) muteOthers(video);
    video.play().catch(() => {
      message.textContent = "Inicie el video a través de elementos estándar del reproductor o el enlace a continuación.";
    });
  });
  sound.addEventListener('click', () => {
    const makeAudible = video.muted || video.volume === 0;
    if (makeAudible) {
      if (loop) manualPlayback.set(video, 'play');
      muteOthers(video);
      video.volume = 1;
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        message.textContent = "Presione el botón de reproducción en el reproductor, luego active el sonido.";
      });
    } else video.muted = true;
    updateSound(video, sound);
  });
  video.addEventListener('volumechange', () => {
    if (!video.muted && video.volume > 0) muteOthers(video);
    updateSound(video, sound);
  });
  video.addEventListener('play', () => {
    if (automaticStarts.has(video)) automaticStarts.delete(video);
    else if (loop) manualPlayback.set(video, 'play');
    if (!video.muted) muteOthers(video);
    play.lastChild.textContent = "Pausa";
    play.setAttribute('aria-label', `Pausa: ${title}`);
    message.textContent = '';
  });
  video.addEventListener('pause', () => {
    if (managedPauses.has(video)) managedPauses.delete(video);
    else if (loop) manualPlayback.set(video, 'pause');
    play.lastChild.textContent = "ver";
    play.setAttribute('aria-label', `Mirar: ${title}`);
  });
  video.addEventListener('error', () => {
    message.textContent = "El vídeo no se ha cargado en este momento. El contenido del guión está disponible en texto.";
  });
  players.add(video);
  visibility?.observe(video);
  controls.append(play, sound);
  container.append(video, controls, message, fallback);
  return container;
}

function makeStory(review) {
  const details = node('details', 'review-story');
  details.dataset.storyPlayer = String(review.id);
  const summary = node('summary', '', "Leer el análisis del guión");
  const label = node(
    'p',
    'review-story-disclosure',
    "Análisis de texto, no transcripción del vídeo. Aquí no hay grabación de audio.",
  );
  const canvas = node('canvas', 'review-waveform');
  // Text-only breakdown: keep the legacy hook, never imply recorded audio.
  canvas.hidden = true;
  canvas.width = 400;
  canvas.height = 64;
  canvas.setAttribute('aria-hidden', 'true');
  const text = node('p', 'review-story-text', review.summary);
  const heading = node('p', 'review-evenings-heading', "Qué comprobar en el ejemplo del tutorial");
  const acceptance = node('p', 'review-story-text', review.acceptance);
  const routeNote = node(
    'p',
    'review-story-disclosure',
    "Las palabras del ejemplo se refieren a la ruta de aprendizaje. Para diagnosticar en este sitio, utilice QUIERO o INICIAR.",
  );
  details.append(summary, label, canvas, text, heading, acceptance, routeNote);
  let frame = 0;
  const draw = (time) => {
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#10B981';
    context.lineWidth = 2;
    context.beginPath();
    for (let x = 0; x < canvas.width; x += 3) {
      const envelope = Math.sin((Math.PI * x) / canvas.width);
      const y = 32 + Math.sin(x * 0.13 + time / 500) * Math.sin(x * 0.037 + review.id) * 19 * envelope;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    draw(0);
  };
  const tick = (time) => {
    if (!details.open || canvas.hidden || document.hidden || reducedMotion.matches) {
      stop();
      return;
    }
    draw(time);
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    stop();
    if (details.open && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick);
  };
  details.addEventListener('toggle', () => {
    if (details.open) {
      for (const [other, controller] of waveforms)
        if (other !== details) {
          other.open = false;
          controller.stop();
        }
      start();
    } else stop();
  });
  waveforms.set(details, { stop, start });
  draw(0);
  return details;
}

function reviewCard(review) {
  const article = node('article', 'review-card');
  article.dataset.reviewCard = '';
  article.dataset.reviewRole = review.role;
  article.dataset.reviewId = String(review.id);
  article.dataset.motionReveal = '';
  article.id = 'scenario-student_' + String(review.id).padStart(2, '0');
  const badges = node('div', 'review-badges');
  badges.append(
    node('span', 'review-role', REVIEW_ROLES.find((role) => role.id === review.role).label),
    node('span', 'review-ai-label', "guión de IA"),
  );
  if (review.video)
    article.append(makeVideo({ video: review.video, poster: review.poster, title: review.title }));
  else {
    const portraitBox = node('div', 'review-portrait-box');
    const image = node('img', 'review-portrait');
    image.src = mediaUrl(review.portrait);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 540;
    image.height = 960;
    image.alt = "Personaje ilustrativo de IA para escenario de entrenamiento.";
    const missing = node('p', 'review-portrait-fallback', "Escenario de entrenamiento");
    missing.hidden = true;
    image.addEventListener('error', () => {
      image.hidden = true;
      missing.hidden = false;
    });
    portraitBox.append(image, missing);
    article.append(portraitBox);
  }
  const body = node('div', 'review-card-body');
  const title = node('h3', '', review.title);
  const identity = node(
    'p',
    'review-persona',
    review.name && review.id <= 5
      ? `${review.name} · carácter ilustrativo`
      : `Ejemplo de tutorial ${String(review.id).padStart(2, '0')}`,
  );
  {
    const portrait = node('img', 'review-persona-image portal-dossier-portrait');
    portrait.src = mediaUrl(review.portrait);
    portrait.loading = 'lazy';
    portrait.decoding = 'async';
    portrait.width = 64;
    portrait.height = 64;
    portrait.alt = "Ilustración AI del rol, no una foto de un cliente confirmado";
    identity.prepend(portrait);
  }
  const task = node('p', 'review-task', review.task);
  if (review.video) {
    if (review.id > 5)
      task.prepend(
        node('span', 'review-video-context', "El vídeo ilustra el papel; Esta no es una entrada de personaje de tarjeta. "),
      );
    task.prepend(
      node(
        'span',
        'review-video-context',
        "Ilustración de IA de juego de roles. El siguiente texto describe una tarea de aprendizaje específica. ",
      ),
    );
  }
  const metric = node('div', 'review-metric');
  metric.setAttribute(
    'aria-label',
    "Comparación del escenario de origen y el artefacto de destino. No hay resultados medidos del cliente.",
  );
  for (const [label, value] of [
    ["Rutina inicial", review.beforeText],
    ["Objetivo después del montaje", review.afterText],
  ]) {
    const comparison = node('details', 'review-comparison');
    comparison.append(node('summary', '', label), node('p', '', value));
    metric.append(comparison);
  }
  const assumption = node(
    'p',
    'review-assumption',
    "Escenario de instrucción y propósito de la prueba, no se mide el resultado del estudiante y no es una garantía de ahorro.",
  );
  const cta = node('a', 'review-checkout', "Taller de 3 noches · $19");
  cta.href = pageUrl('checkout.html?product=vip');
  cta.dataset.reviewCheckout = '';
  cta.addEventListener('click', (event) => {
    const existing = document.querySelector('[data-order="vip"]');
    if (existing instanceof HTMLElement) {
      event.preventDefault();
      existing.click();
    }
  });
  const codeword = node('a', 'review-codeword', "QUIERO · diagnóstico gratuito");
  codeword.href = pageUrl('tma_magnet/');
  body.append(title, badges, identity, task, metric, assumption, makeStory(review), cta, codeword);
  article.append(body);
  return article;
}

function mountReviews(root) {
  if (root.dataset.reviewsMounted) return;
  root.dataset.reviewsMounted = 'true';
  const heading = node('h2', '', "20 historias y análisis sobre tu tarea.");
  heading.id = 'student-reviews-heading';
  const intro = node(
    'p',
    'reviews-intro',
    "Los personajes de IA muestran escenarios de entrenamiento para cinco roles. Estas no son reseñas de estudiantes reales. Los valores temporales son suposiciones para comparar, no promesas de resultados.",
  );
  const formats = node(
    'p',
    'reviews-formats',
    `${STUDENT_REVIEWS.filter((review) => review.video).length} guiones de vídeo y ${STUDENT_REVIEWS.filter((review) => !review.video).length} análisis de texto. El sonido se enciende solo cuando lo presionas.`,
  );
  const filters = node('div', 'review-filters');
  filters.setAttribute('role', 'tablist');
  filters.setAttribute('aria-label', "Seleccionar rol");
  const results = node('div', 'review-grid');
  results.dataset.reviewResults = '';
  results.id = 'student-review-results';
  results.setAttribute('role', 'tabpanel');
  results.setAttribute('aria-labelledby', 'review-filter-all');
  const status = node('p', 'review-filter-status', "Se muestran los 20 escenarios de entrenamiento.");
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const cards = STUDENT_REVIEWS.map(reviewCard);
  results.append(...cards);
  function filter(role) {
    if (!REVIEW_ROLES.some((item) => item.id === role)) return;
    let count = 0;
    for (const card of cards) {
      card.hidden = role !== 'all' && card.dataset.reviewRole !== role;
      if (!card.hidden) count++;
      else {
        card.querySelectorAll('video').forEach((video) => {
          video.pause();
          video.muted = true;
        });
        card.querySelectorAll('details[open]').forEach((details) => {
          details.open = false;
        });
      }
    }
    for (const button of filters.querySelectorAll('[data-role-filter]')) {
      const selected = button.dataset.roleFilter === role;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    results.setAttribute('aria-labelledby', `review-filter-${role}`);
    status.textContent =
      role === 'all' ? "Se muestran los 20 escenarios de entrenamiento." : `Mostrado ${count} escenario de entrenamiento.`;
    root.dispatchEvent(new CustomEvent('colibri:review-filter', { bubbles: true, detail: { role, count } }));
  }
  REVIEW_ROLES.forEach((role) => {
    const button = node(
      'button',
      'review-filter',
      role.id === 'all' ? role.label : `${role.label} (${role.count})`,
    );
    button.type = 'button';
    button.id = `review-filter-${role.id}`;
    button.dataset.reviewFilter = '';
    button.dataset.roleFilter = role.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', results.id);
    button.setAttribute('aria-selected', String(role.id === 'all'));
    button.tabIndex = role.id === 'all' ? 0 : -1;
    button.addEventListener('click', () => filter(role.id));
    filters.append(button);
  });
  document.addEventListener('colibri:set-review-filter', (event) => filter(event.detail?.role));
  root.replaceChildren(heading, intro, formats, filters, status, results);
  filter('all');
}

function mountBroll(root) {
  if (root.dataset.brollMounted) return;
  root.dataset.brollMounted = 'true';
  const heading = node('h2', '', "Mira cómo podría ser tu idea");
  const intro = node(
    'p',
    'reviews-intro',
    "Ocho montajes de demostración y escenas de IA. Sin sonido por defecto. Tú eliges qué ver y escuchar.",
  );
  const grid = node('div', 'broll-grid');
  BROLLS.forEach((item) => {
    const article = node('article', 'broll-card');
    article.dataset.motionReveal = '';
    article.append(
      node('h3', '', item.title),
      makeVideo(item, { loop: true }),
      node('p', 'broll-caption', item.caption),
    );
    grid.append(article);
  });
  root.replaceChildren(heading, intro, grid);
}

document.querySelectorAll('[data-student-reviews-root]').forEach(mountReviews);
document.querySelectorAll('[data-broll-showcase-root]').forEach(mountBroll);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseEverything();
  else {
    startSilentLoops();
    for (const controller of waveforms.values()) controller.start();
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) pauseEverything();
  else startSilentLoops();
});
window.addEventListener('pagehide', pauseEverything);
document.dispatchEvent(
  new CustomEvent('colibri:reviews-mounted', {
    detail: { cards: STUDENT_REVIEWS.length, brolls: BROLLS.length },
  }),
);
