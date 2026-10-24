/** Visible-by-default, one-shot entrance choreography with reduced-motion fallback. */
export function installScrollReveals(root = document) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const life = new AbortController(), pending = new Set(), animations = new Map(), seen = new WeakSet();
  let destroyed = false;
  function reveal(node) {
    if (destroyed || seen.has(node) || !node.getClientRects().length) return;
    seen.add(node); pending.delete(node); observer?.unobserve(node);
    node.dataset.motionState = 'revealed';
    if (reduced.matches || !node.animate) return;
    const siblings = [...node.parentElement.children].filter(child => child.hasAttribute('data-motion-reveal'));
    const stagger = Math.min(3, siblings.indexOf(node)) * 45;
    const animation = node.animate([
      { opacity: .35, transform: 'translate3d(0,20px,0)' },
      { opacity: 1, transform: 'translate3d(0,0,0)' },
    ], { duration: 560, delay: Math.max(0, stagger), easing: 'cubic-bezier(.22,.61,.36,1)' });
    animations.set(node, animation);
    animation.finished.then(() => animations.delete(node), () => animations.delete(node));
  }
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
  }, { threshold: .06, rootMargin: '0px 0px -24px 0px' }) : null;
  function scan() {
    for (const node of root.querySelectorAll('[data-motion-reveal]')) {
      if (seen.has(node) || pending.has(node)) continue;
      node.dataset.motionState = reduced.matches ? 'reduced' : 'ready';
      if (reduced.matches) { seen.add(node); continue; }
      if (observer) { pending.add(node); observer.observe(node); } else reveal(node);
    }
  }
  const mutations = new MutationObserver(scan);
  mutations.observe(root === document ? document.body : root, { childList: true, subtree: true });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    for (const [node, animation] of animations) { animation.cancel(); node.dataset.motionState = 'reduced'; }
    animations.clear();
    for (const node of pending) { observer?.unobserve(node); seen.add(node); node.dataset.motionState = 'reduced'; }
    pending.clear();
  }, { signal: life.signal });
  scan();
  return () => { destroyed = true; life.abort(); mutations.disconnect(); observer?.disconnect(); for (const animation of animations.values()) animation.cancel(); animations.clear(); pending.clear(); };
}
