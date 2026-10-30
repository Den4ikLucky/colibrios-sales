/** Quintic Hermite navigation adapted from the audited staged engine.
 * Wheel, touch and keyboard scrolling remain native. Only same-page link clicks opt in.
 */
export function sceneScrollCurve(t, slope = 0) {
  return slope * (t - 6 * t ** 3 + 8 * t ** 4 - 3 * t ** 5) + t ** 3 * (t * (t * 6 - 15) + 10);
}
export function sceneScrollSlope(t, slope = 0) {
  return slope * (1 - 18 * t ** 2 + 32 * t ** 3 - 15 * t ** 4) + 30 * t ** 2 * (1 - t) ** 2;
}
export function installSceneScroll(root = document) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const life = new AbortController();
  let frame = 0, motion = null;
  function cancel() { cancelAnimationFrame(frame); frame = 0; motion = null; }
  function scrollToTarget(target, complete) {
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const top = Math.max(0, Math.min(maximum, target));
    const from = window.scrollY, previous = motion;
    const progress = previous ? Math.min(1, (performance.now() - previous.start) / 620) : 1;
    const velocity = previous && progress < 1 ? sceneScrollSlope(progress, previous.slope) * previous.distance / 620 : 0;
    cancel();
    if (reduced.matches || Math.abs(top - from) < 2) { window.scrollTo({ top, behavior: 'instant' }); complete(); return; }
    const slope = Math.max(0, Math.min(2.5, velocity * 620 / (top - from)));
    const start = performance.now();
    motion = { start, slope, distance: top - from };
    function tick(now) {
      const t = Math.min(1, Math.max(0, (now - start) / 620));
      window.scrollTo({ top: from + (top - from) * sceneScrollCurve(t, slope), behavior: 'instant' });
      if (t < 1) frame = requestAnimationFrame(tick); else { cancel(); complete(); }
    }
    frame = requestAnimationFrame(tick);
  }
  root.addEventListener('click', event => {
    const link = event.target.closest?.('a[href*="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (!url.hash || url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    let id; try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !target.getClientRects().length) return;
    event.preventDefault();
    const header = document.querySelector('.site-header, .topbar, header');
    const inset = header && ['sticky','fixed'].includes(getComputedStyle(header).position) ? header.getBoundingClientRect().height : 0;
    scrollToTarget(target.getBoundingClientRect().top + window.scrollY - inset - 16, () => {
      try { history.pushState(null, '', url.hash); } catch { /* Embedded previews may restrict history. */ }
      const temporary = !target.hasAttribute('tabindex');
      if (temporary) { target.tabIndex = -1; target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true }); }
      target.focus({ preventScroll: true });
    });
  }, { signal: life.signal });
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(type, cancel, { passive: true, signal: life.signal });
  reduced.addEventListener('change', cancel, { signal: life.signal });
  return () => { cancel(); life.abort(); };
}
