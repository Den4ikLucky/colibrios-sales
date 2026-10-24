// Adapted from SL UI tabs-navigation, views-navigation and metric-display.
// Copyright (c) 2026 SLtowl, MIT. See colibrios-LICENSE.txt.
import { installNavIndicator } from '../engines/nav-indicator.js';
const folder = '<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path d="M4.5 9a2 2 0 0 1 2-2h5l2.5 3h7.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2Z"/></svg>';
const file = '<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path d="M7 4h10l6 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm10 0v6h6"/></svg>';
const metric = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 16 11 10l4 4 5-8M15 6h5v5"/></svg>';
function installFilters(root) {
  const buttons=[...root.querySelectorAll('[data-review-filter][data-role-filter]')];
  if (!buttons.length) return () => {};
  const track=buttons[0].parentElement, life=new AbortController(), added=[];
  track.classList.add('sl-review-track');
  const indicator=document.createElement('span');indicator.className='nav-indicator';indicator.setAttribute('aria-hidden','true');track.prepend(indicator);
  for (const button of buttons) {
    const icon=document.createElement('span');icon.className='sl-filter-icon';icon.innerHTML=button.dataset.roleFilter==='all'?folder:file;button.prepend(icon);added.push(icon);
  }
  let selected=Math.max(0,buttons.findIndex(button=>button.getAttribute('aria-pressed')==='true'));
  function paint(role) {
    selected=Math.max(0,buttons.findIndex(button=>button.dataset.roleFilter===role));
    buttons.forEach((button,index)=>{button.setAttribute('aria-pressed',String(index===selected));button.tabIndex=index===selected?0:-1;});
    track.dispatchEvent(new Event('route-position'));
  }
  track.addEventListener('keydown',event=>{
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key) || !event.target.closest('[data-review-filter]')) return;
    event.preventDefault();
    const rtl=getComputedStyle(track).direction==='rtl';
    const delta=(event.key==='ArrowRight'?1:-1)*(rtl?-1:1);
    const index=event.key==='Home'?0:event.key==='End'?buttons.length-1:(selected+delta+buttons.length)%buttons.length;
    buttons[index].focus({preventScroll:true});
    root.dispatchEvent(new CustomEvent('colibri:set-review-filter',{bubbles:true,detail:{role:buttons[index].dataset.roleFilter}}));
  },{signal:life.signal});
  root.addEventListener('colibri:review-filter',event=>{if(buttons.some(button=>button.dataset.roleFilter===event.detail?.role))paint(event.detail.role);},{signal:life.signal});
  paint(buttons[selected].dataset.roleFilter);
  const stopIndicator=installNavIndicator(track,'[aria-pressed="true"]');
  root.dataset.slNavigation='tabs-views';
  return()=>{life.abort();stopIndicator();indicator.remove();added.forEach(node=>node.remove());track.classList.remove('sl-review-track');delete root.dataset.slNavigation;buttons.forEach(button=>button.removeAttribute('tabindex'));};
}
function installTelemetry(root) {
  const life=new AbortController(), reduced=matchMedia('(prefers-reduced-motion: reduce)'), animations=new Map();
  const outputs=[...root.querySelectorAll('#monthly-cost, #annual-cost, #monthly-hours, #net-effect, #payback, #scan-capacity, #scan-payback, #scan-time, #scan-year')];
  const caption=document.createElement('div');caption.className='sl-metric-caption';caption.innerHTML=metric+'<span>Сценарий по вашим данным</span>';root.prepend(caption);
  const previous=new Map(outputs.map(node=>[node,node.textContent]));
  outputs.forEach(node=>node.classList.add('sl-metric-value'));
  root.dataset.slDisplay='metric';
  const observer=new MutationObserver(()=>{
    const changed=outputs.filter(node=>previous.get(node)!==node.textContent);
    if(!changed.length)return;
    for(const node of changed){previous.set(node,node.textContent);animations.get(node)?.cancel();if(!reduced.matches&&node.animate){const animation=node.animate([{opacity:.5},{opacity:1}],{duration:250,easing:'cubic-bezier(.2,0,0,1)'});animations.set(node,animation);animation.finished.then(()=>animations.delete(node),()=>animations.delete(node));}}
    root.dispatchEvent(new CustomEvent('colibri:roi-telemetry',{bubbles:true,detail:{values:Object.fromEntries(outputs.map(node=>[node.id,node.textContent.trim()]))}}));
  });
  observer.observe(root,{characterData:true,childList:true,subtree:true});
  reduced.addEventListener('change',()=>{if(reduced.matches){for(const animation of animations.values())animation.cancel();animations.clear();}},{signal:life.signal});
  return()=>{life.abort();observer.disconnect();for(const animation of animations.values())animation.cancel();animations.clear();caption.remove();outputs.forEach(node=>node.classList.remove('sl-metric-value'));delete root.dataset.slDisplay;};
}
/** Business filtering and all calculator arithmetic remain in their owning modules. */
export function installSlUi(root = document) {
  const cleanups=[], mounted=new WeakSet();
  function scan(){
    for(const element of root.querySelectorAll('[data-student-reviews-root]'))if(!mounted.has(element)&&element.querySelector('[data-review-filter]')){mounted.add(element);cleanups.push(installFilters(element));}
    for(const element of root.querySelectorAll('[data-ui="roi-telemetry"]'))if(!mounted.has(element)){mounted.add(element);cleanups.push(installTelemetry(element));}
  }
  scan();const observer=new MutationObserver(scan);observer.observe(root===document?document.body:root,{childList:true,subtree:true});
  return()=>{observer.disconnect();for(const cleanup of cleanups.reverse())cleanup();};
}
