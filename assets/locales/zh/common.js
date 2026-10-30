'use strict';
(() => {
  const rub = new Intl.NumberFormat("zh-Hans", { maximumFractionDigits: 0 });
  const dec = new Intl.NumberFormat("zh-Hans", { maximumFractionDigits: 1 });
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
    { id: 'digital', name: "数码产品", short: "产品展示", start: "一种产品、一个页面和清晰的付款路径", artifact: "首次付费测试的草案产品和标准" },
    { id: 'expert', name: "个人和小组工作", short: "专业知识", start: "预登记表和第一次咨询的准备", artifact: "没有关于预算和申请卡问题的调查问卷" },
    { id: 'club', name: "俱乐部和订阅", short: "订阅", start: "定期价值、访问发放和重用", artifact: "参与者路线和保留测试计划" },
    { id: 'commerce', name: "产品业务和UGC", short: "产品/UGC", start: "一种产品，可验证的事实和消费者问题的内容", artifact: "一张产品卡的材料包" },
    { id: 'service', name: "IT服务与应用", short: 'IT / TMA', start: "一项用户任务、试用场景和反馈", artifact: "工作垂直切片并检查目标动作" },
    { id: 'agency', name: "自由职业者和制片人", short: "客户服务", start: "为客户提供单独的项目以及可验证的结果传输", artifact: "第一阶段的项目护照、估算和标准" }
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
      element.textContent = "支持： ";
      const link = document.createElement('a'); link.href = 'mailto:' + publicConfig.supportEmail; link.textContent = publicConfig.supportEmail; element.append(link);
    } else if (trustedUrl(publicConfig.supportUrl)) {
      element.textContent = "支持： ";
      const link = document.createElement('a'); link.href = trustedUrl(publicConfig.supportUrl); link.textContent = "写信给卖家"; element.append(link);
    }
  });
  window.Colibri = Object.freeze({ money, number, bounded, store, toast, haptic, download, copy, trustedUrl, tracks, routineModel, bindTabs });
})();
