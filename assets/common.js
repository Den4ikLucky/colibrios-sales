'use strict';
(() => {
  const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const dec = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
  const store = {
    get(key, fallback = null) { try { const value = localStorage.getItem('colibri.v1.' + key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem('colibri.v1.' + key, JSON.stringify(value)); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem('colibri.v1.' + key); } catch {} }
  };
  function bounded(value, min, max, fallback = min) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
  function money(value) { return rub.format(Number.isFinite(value) ? value : 0) + ' ₽'; }
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
    { id: 'digital', name: 'Цифровые продукты', short: 'Продукт', start: 'Один продукт, страница и понятный путь до оплаты', artifact: 'Черновик продукта и критерии первого платного теста' },
    { id: 'expert', name: 'Личная и групповая работа', short: 'Экспертиза', start: 'Анкета предзаписи и подготовка к первой консультации', artifact: 'Анкета без вопросов о бюджете и карточка заявки' },
    { id: 'club', name: 'Клуб и подписка', short: 'Подписка', start: 'Регулярная ценность, выдача доступа и повторное использование', artifact: 'Маршрут участника и план проверки удержания' },
    { id: 'commerce', name: 'Товарный бизнес и UGC', short: 'Товары / UGC', start: 'Один товар, проверяемые факты и контент под покупательский вопрос', artifact: 'Пакет материалов для одной карточки товара' },
    { id: 'service', name: 'IT-сервис и приложение', short: 'IT / TMA', start: 'Одна задача пользователя, пробный сценарий и обратная связь', artifact: 'Рабочий вертикальный срез и проверка целевого действия' },
    { id: 'agency', name: 'Фрилансер и продюсер', short: 'Клиентские услуги', start: 'Отдельный проект на клиента и проверяемая передача результата', artifact: 'Паспорт проекта, смета и критерии первого этапа' }
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
      element.textContent = 'Поддержка: ';
      const link = document.createElement('a'); link.href = 'mailto:' + publicConfig.supportEmail; link.textContent = publicConfig.supportEmail; element.append(link);
    } else if (trustedUrl(publicConfig.supportUrl)) {
      element.textContent = 'Поддержка: ';
      const link = document.createElement('a'); link.href = trustedUrl(publicConfig.supportUrl); link.textContent = 'Написать продавцу'; element.append(link);
    }
  });
  window.Colibri = Object.freeze({ money, number, bounded, store, toast, haptic, download, copy, trustedUrl, tracks, routineModel, bindTabs });
})();
