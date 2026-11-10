// Sliding selection adapted from SL UI matte-views-navigation / views-navigation (MIT).
// Source: buttons.js position(), buttons.css nav-indicator, 260ms cubic-bezier(.22,.61,.36,1).
function installNavIndicator(track) {
  const indicator = track.querySelector('.nav-indicator');
  let frame = 0;
  let previousTransform = '';
  function position() {
    const active = track.querySelector('[aria-current="page"]');
    if (!active) {
      indicator.hidden = true;
      return;
    }
    const x = active.offsetLeft;
    const width = active.offsetWidth;
    const transform = `translate3d(${x}px,0,0) scaleX(${width / 100})`;
    indicator.hidden = false;
    if (transform !== previousTransform) {
      indicator.style.transform = transform;
      previousTransform = transform;
    }
  }
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      position();
      track.dataset.ready = 'true';
    });
  }
  const resize = new ResizeObserver(schedule);
  resize.observe(track);
  track.querySelectorAll('.nav-link').forEach(link => resize.observe(link));
  const changes = new MutationObserver(schedule);
  changes.observe(track, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  track.addEventListener('route-position', position);
  position();
  schedule();
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect(); changes.disconnect();
    track.removeEventListener('route-position', position);
    delete track.dataset.ready;
    indicator.style.removeProperty('transform');
  };
}
