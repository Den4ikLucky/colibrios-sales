/** Viewport capability profile. No user-agent sniffing or remote requests. */
export function installDeviceProfile({ root = document.documentElement, compactBreakpoint = 880, touchBreakpoint = 1024 } = {}) {
  const queries = [
    window.matchMedia(`(max-width: ${compactBreakpoint}px)`),
    window.matchMedia(`(hover: none) and (pointer: coarse) and (max-width: ${touchBreakpoint}px)`),
    window.matchMedia('(hover: none), (pointer: coarse)'),
  ];
  const previous = Object.fromEntries(['layout', 'input', 'orientation'].map(key => [key, root.dataset[key]]));
  const previousHeight = root.style.getPropertyValue('--app-height');
  function apply() {
    const compact = queries[0].matches || queries[1].matches;
    const height = window.visualViewport?.height || window.innerHeight;
    root.dataset.layout = compact ? 'compact' : 'desktop';
    root.dataset.input = queries[2].matches ? 'touch' : 'pointer';
    root.dataset.orientation = window.innerWidth > height ? 'landscape' : 'portrait';
    root.style.setProperty('--app-height', `${Math.round(height)}px`);
    window.dispatchEvent(new CustomEvent('deviceprofilechange', { detail: { compact, touch: queries[2].matches } }));
  }
  queries.forEach(query => query.addEventListener ? query.addEventListener('change', apply) : query.addListener(apply));
  window.visualViewport?.addEventListener('resize', apply, { passive: true });
  window.addEventListener('orientationchange', apply, { passive: true });
  window.addEventListener('resize', apply, { passive: true });
  apply();
  return () => {
    queries.forEach(query => query.removeEventListener ? query.removeEventListener('change', apply) : query.removeListener(apply));
    window.visualViewport?.removeEventListener('resize', apply);
    window.removeEventListener('orientationchange', apply);
    window.removeEventListener('resize', apply);
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete root.dataset[key]; else root.dataset[key] = value;
    }
    if (previousHeight) root.style.setProperty('--app-height', previousHeight); else root.style.removeProperty('--app-height');
  };
}
