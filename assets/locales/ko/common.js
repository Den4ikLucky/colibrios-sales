'use strict';
(() => {
  const rub = new Intl.NumberFormat("ko", { maximumFractionDigits: 0 });
  const dec = new Intl.NumberFormat("ko", { maximumFractionDigits: 1 });
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
    { id: 'digital', name: "디지털 제품", short: "제품", start: "하나의 제품, 페이지 및 명확한 결제 경로", artifact: "초안 제품 및 첫 번째 유료 테스트 기준" },
    { id: 'expert', name: "개인 및 그룹 작업", short: "전문성", start: "사전등록 양식 및 첫 상담 준비", artifact: "예산 및 신청 카드에 대한 질문이 없는 설문지" },
    { id: 'club', name: "클럽 및 구독", short: "구독", start: "정규값, 접근권한 발급 및 재사용", artifact: "참가자 경로 및 유지 테스트 계획" },
    { id: 'commerce', name: "제품 사업 및 UGC", short: "제품/UGC", start: "하나의 제품, 소비자 질문에 대한 검증 가능한 사실과 콘텐츠", artifact: "제품 카드 1개용 자료 패키지" },
    { id: 'service', name: "IT 서비스 및 응용", short: 'IT / TMA', start: "단일 사용자 작업, 시험 시나리오 및 피드백", artifact: "수직 슬라이스 작업 및 대상 동작 확인" },
    { id: 'agency', name: "프리랜서 겸 프로듀서", short: "클라이언트 서비스", start: "고객을 위한 별도의 프로젝트 및 검증 가능한 결과 전송", artifact: "첫 번째 단계의 프로젝트 여권, 견적 및 기준" }
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
      element.textContent = "지원: ";
      const link = document.createElement('a'); link.href = 'mailto:' + publicConfig.supportEmail; link.textContent = publicConfig.supportEmail; element.append(link);
    } else if (trustedUrl(publicConfig.supportUrl)) {
      element.textContent = "지원: ";
      const link = document.createElement('a'); link.href = trustedUrl(publicConfig.supportUrl); link.textContent = "판매자에게 쓰기"; element.append(link);
    }
  });
  window.Colibri = Object.freeze({ money, number, bounded, store, toast, haptic, download, copy, trustedUrl, tracks, routineModel, bindTabs });
})();
