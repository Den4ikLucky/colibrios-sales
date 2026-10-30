'use strict';
(() => {
  const rub = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
  const dec = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
  const store = {
    get(key, fallback = null) { try { const value = localStorage.getItem('colibri.v1.' + key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem('colibri.v1.' + key, JSON.stringify(value)); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem('colibri.v1.' + key); } catch {} }
  };
  function bounded(value, min, max, fallback = min) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
  function money(value) { return rub.format(Number.isFinite(value) ? value : 0) + ' RUB'; }
  function number(value) { return dec.format(Number.isFinite(value) ? value : 0); }
  function toast(message) { const el = document.querySelector('#toast'); if (!el) return; el.textContent = message; el.classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 4500); }
  function haptic(type = 'light') { try { const tg = window.Telegram?.WebApp; if (tg?.isVersionAtLeast?.('6.1')) tg.HapticFeedback?.impactOccurred(type); } catch {} }
  function download(name, text, type = 'text/plain;charset=utf-8') {
    const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([text], { type })); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function copy(text) {
    try { if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable'); await navigator.clipboard.writeText(text); return true; }
    catch { const textarea = document.createElement('textarea'); textarea.value = text; textarea.setAttribute('readonly', ''); textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;width:1px;height:1px;'; const active = document.activeElement; document.body.append(textarea); textarea.select(); let success = false; try { success = document.execCommand('copy'); } catch {} textarea.remove(); active?.focus({ preventScroll: true }); return success; }
  }
  function trustedUrl(value, sameOrigin = false) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try { const url = new URL(value, location.href); if (url.protocol !== 'https:' && !(sameOrigin && url.origin === location.origin && ['http:', 'https:'].includes(url.protocol))) return null; if (sameOrigin && url.origin !== location.origin) return null; return url.href; } catch { return null; }
  }
  const tracks = [
    { id: 'digital', name: "Digital Products", short: "Product", start: "One product, page and clear path to payment", artifact: "Draft product and criteria for the first paid test" },
    { id: 'expert', name: "Personal and group work", short: "Expertise", start: "Pre-registration form and preparation for the first consultation", artifact: "Questionnaire without questions about the budget and application card" },
    { id: 'club', name: "Club and subscription", short: "Subscription", start: "Regular value, access issuance and reuse", artifact: "Participant Route and Retention Test Plan" },
    { id: 'commerce', name: "Product business and UGC", short: "Products/UGC", start: "One product, verifiable facts and content for consumer questions", artifact: "Package of materials for one product card" },
    { id: 'service', name: "IT service and application", short: 'IT / TMA', start: "One user task, trial scenario and feedback", artifact: "Working vertical slice and checking target action" },
    { id: 'agency', name: "Freelancer and producer", short: "Client Services", start: "A separate project for the client and verifiable transfer of the result", artifact: "Project passport, estimate and criteria for the first stage" }
  ];
  function routineModel({ employees, hours, rate, recovery, operating, investment, days = 22 }) {
    const monthlyHours = employees * hours * days;
    const routineCost = monthlyHours * rate;
    const capacity = routineCost * recovery / 100;
    const net = capacity - operating;
    return { monthlyHours, routineCost, capacity, net, payback: net > 0 ? investment / net : null, annualCost: routineCost * 12 };
  }
  function bindTabs(root, { onChange } = {}) {
    const buttons = [...root.querySelectorAll('[role=tab]')];
    function select(tab, focus = false) {
      for (const button of buttons) { const active = button === tab; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; const panel = document.getElementById(button.getAttribute('aria-controls')); if (panel) panel.hidden = !active; }
      if (focus) tab.focus(); onChange?.(tab); haptic();
    }
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        let next = null; if (event.key === 'ArrowRight') next = (index + 1) % buttons.length; if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = buttons.length - 1; if (next !== null) { event.preventDefault(); select(buttons[next], true); }
      });
    });
    return select;
  }
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => { let previous; dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); previous?.focus({ preventScroll: true }); }); dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }); const show = dialog.showModal.bind(dialog); dialog.showModal = () => { previous = document.activeElement; document.body.classList.add('modal-open'); show(); }; });
  const publicConfig = window.COLIBRI_CONFIG || {};
  document.querySelectorAll('[data-support-contact]').forEach(element => {
    if (publicConfig.supportEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicConfig.supportEmail)) {
      element.textContent = "Support: ";
      const link = document.createElement('a'); link.href = 'mailto:' + publicConfig.supportEmail; link.textContent = publicConfig.supportEmail; element.append(link);
    } else if (trustedUrl(publicConfig.supportUrl)) {
      element.textContent = "Support: ";
      const link = document.createElement('a'); link.href = trustedUrl(publicConfig.supportUrl); link.textContent = "Write to the seller"; element.append(link);
    }
  });
  window.Colibri = Object.freeze({ money, number, bounded, store, toast, haptic, download, copy, trustedUrl, tracks, routineModel, bindTabs });
})();
