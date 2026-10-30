import { installDeviceProfile } from './device-profile.js';
import { installSceneScroll } from './quintic-scene-scroll.js';
import { installScrollReveals } from './scroll-reveal.js';
import { installUiSounds } from './ui-sound-synth.js';
import { installSlUi } from '../sl-ui/colibrios-adapter.js';

export function shouldLoadAgentation(hostname = location.hostname, portable = Boolean(window.COLIBRI_PORTABLE_PREVIEW), href = location.href) {
  return hostname === 'localhost' && !portable && href !== 'about:srcdoc';
}
export function installSovereignWeb() {
  const cleanups = [], errors = [];
  let destroyed = false;
  for (const install of [installDeviceProfile, installSceneScroll, installScrollReveals, installUiSounds, installSlUi]) {
    try { cleanups.push(install()); } catch (error) { errors.push({ module: install.name, message: error.message }); }
  }
  const state = { installed: true, errors, agentation: 'disabled' };
  document.documentElement.dataset.sovereignWeb = errors.length ? 'degraded' : 'ready';
  if (shouldLoadAgentation()) {
    state.agentation = 'loading';
    import('./agentation-local.js').then(module => module.installAgentation()).then(cleanup => {
      if (destroyed) cleanup(); else { cleanups.push(cleanup); state.agentation = 'mounted'; }
    }).catch(() => { state.agentation = 'unavailable'; });
  }
  function destroy() {
    if (destroyed) return; destroyed = true;
    window.removeEventListener('pagehide', onPageHide);
    for (const cleanup of cleanups.reverse()) cleanup();
    state.installed = false; delete document.documentElement.dataset.sovereignWeb;
  }
  function onPageHide(event) { if (!event.persisted) destroy(); }
  window.addEventListener('pagehide', onPageHide);
  return Object.freeze({ state, destroy });
}
if (typeof window !== 'undefined' && !window.COLIBRI_SOVEREIGN) window.COLIBRI_SOVEREIGN = installSovereignWeb();
