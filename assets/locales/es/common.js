'use strict';
(() => {
  const rub = new Intl.NumberFormat("es", { maximumFractionDigits: 0 });
  const dec = new Intl.NumberFormat("es", { maximumFractionDigits: 1 });
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
    { id: 'digital', name: "Productos digitales", short: "Producto", start: "Un producto, una página y una ruta de pago clara", artifact: "Borrador de producto y criterios para la primera prueba paga" },
    { id: 'expert', name: "Trabajo personal y grupal.", short: "Experiencia", start: "Formulario de preinscripción y preparación para la primera consulta", artifact: "Cuestionario sin preguntas sobre el presupuesto y ficha de solicitud." },
    { id: 'club', name: "Club y suscripción", short: "Suscripción", start: "Valor regular, emisión de acceso y reutilización.", artifact: "Plan de prueba de retención y ruta del participante" },
    { id: 'commerce', name: "Negocio de productos y UGC", short: "Productos/CGU", start: "Un producto, hechos verificables y contenido para preguntas de los consumidores.", artifact: "Paquete de materiales para una ficha de producto." },
    { id: 'service', name: "Servicio y aplicación de TI.", short: 'IT / TMA', start: "Una tarea de usuario, escenario de prueba y comentarios", artifact: "Trabajar el corte vertical y comprobar la acción del objetivo." },
    { id: 'agency', name: "Freelancer y productor", short: "Servicios al cliente", start: "Un proyecto independiente para el cliente y transferencia comprobable del resultado.", artifact: "Pasaporte del proyecto, presupuesto y criterios para la primera etapa." }
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
      element.textContent = "Soporte: ";
      const link = document.createElement('a'); link.href = 'mailto:' + publicConfig.supportEmail; link.textContent = publicConfig.supportEmail; element.append(link);
    } else if (trustedUrl(publicConfig.supportUrl)) {
      element.textContent = "Soporte: ";
      const link = document.createElement('a'); link.href = trustedUrl(publicConfig.supportUrl); link.textContent = "Escribe al vendedor"; element.append(link);
    }
  });
  window.Colibri = Object.freeze({ money, number, bounded, store, toast, haptic, download, copy, trustedUrl, tracks, routineModel, bindTabs });
})();
