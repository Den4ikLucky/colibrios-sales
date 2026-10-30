// Sliding selection adapted from SL UI views-navigation (MIT, copyright 2026 SLtowl).
// See ../sl-ui/colibrios-LICENSE.txt. Uses the original 260ms indicator timing.
export function installNavIndicator(track, activeSelector = '[aria-current="page"]') {
  const indicator = track?.querySelector('.nav-indicator');
  if (!track || !indicator) return () => {};
  let frame = 0;
  function position() {
    const active = track.querySelector(activeSelector);
    indicator.hidden = !active;
    if (!active) return;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.transform = `translate3d(${active.offsetLeft}px,${active.offsetTop}px,0) scaleX(${active.offsetWidth / 100})`;
  }
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; position(); track.dataset.slReady = 'true'; });
  }
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  resize?.observe(track);
  track.querySelectorAll('button, .nav-link').forEach(link => resize?.observe(link));
  const changes = new MutationObserver(schedule);
  changes.observe(track, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'aria-pressed', 'aria-selected'] });
  track.addEventListener('route-position', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  position(); schedule();
  return () => {
    cancelAnimationFrame(frame); resize?.disconnect(); changes.disconnect();
    track.removeEventListener('route-position', schedule); window.removeEventListener('resize', schedule);
    delete track.dataset.slReady;
    indicator.style.removeProperty('transform'); indicator.style.removeProperty('height');
  };
}
