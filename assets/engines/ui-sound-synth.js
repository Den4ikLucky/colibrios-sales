// Zero-Asset Web Audio API Procedural UI Sound Synthesizer (adapted from sdkhub.org)
// Synthesizes tactile mechanical clicks, soft presses, toggles, and hover ticks with 0 external audio files.
const PRESETS = {
  press: {
    layers: [
      { source: { type: 'noise', color: 'white' }, filter: { type: 'bandpass', frequency: 2100, resonance: 0.9 }, envelope: { attack: 0, decay: 0.006, sustain: 0, release: 0.003 }, gain: 0.124 },
      { source: { type: 'triangle', frequency: { start: 520, end: 430 } }, envelope: { attack: 0.001, decay: 0.038, sustain: 0, release: 0.014 }, gain: 0.698 },
      { source: { type: 'sine', frequency: { start: 1220, end: 880 }, fm: { ratio: 0.5, depth: 35 } }, envelope: { attack: 0.001, decay: 0.018, sustain: 0, release: 0.007 }, gain: 0.203 },
    ],
  },
  pressSoft: {
    layers: [
      { source: { type: 'noise', color: 'pink' }, filter: { type: 'bandpass', frequency: 1980, resonance: 0.85 }, envelope: { attack: 0, decay: 0.007, sustain: 0, release: 0.003 }, gain: 0.111 },
      { source: { type: 'sine', frequency: { start: 760, end: 580 }, fm: { ratio: 0.5, depth: 24 } }, filter: { type: 'lowpass', frequency: 2600, resonance: 0.7 }, envelope: { attack: 0.001, decay: 0.034, sustain: 0, release: 0.012 }, gain: 0.576 },
      { source: { type: 'sine', frequency: { start: 1420, end: 1100 } }, envelope: { attack: 0.001, decay: 0.016, sustain: 0, release: 0.006 }, gain: 0.155 },
    ],
  },
  pressGhost: {
    layers: [
      { source: { type: 'noise', color: 'white' }, filter: { type: 'bandpass', frequency: 7200, resonance: 1.1 }, envelope: { attack: 0, decay: 0.004, sustain: 0, release: 0.002 }, gain: 0.25 },
      { source: { type: 'sine', frequency: { start: 2200, end: 1800 }, fm: { ratio: 0.5, depth: 42 } }, envelope: { attack: 0, decay: 0.014, sustain: 0, release: 0.005 }, gain: 0.683 },
      { source: { type: 'triangle', frequency: { start: 320, end: 240 } }, envelope: { attack: 0, decay: 0.021, sustain: 0, release: 0.008 }, gain: 0.25 },
    ],
  },
  pop: { source: { type: 'sine', frequency: { start: 300, end: 2000 } }, envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.04 }, gain: 0.326 },
  select: { source: { type: 'sine', frequency: { start: 860, end: 1040 } }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 }, gain: 0.5 },
  toggleOn: {
    layers: [
      { source: { type: 'sine', frequency: 520 }, envelope: { attack: 0.001, decay: 0.065, sustain: 0, release: 0.02 }, gain: 0.315 },
      { source: { type: 'sine', frequency: 760 }, envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.02 }, delay: 0.035, gain: 0.315 },
    ],
  },
  toggleOff: {
    layers: [
      { source: { type: 'sine', frequency: 620 }, envelope: { attack: 0.001, decay: 0.055, sustain: 0, release: 0.018 }, gain: 0.352 },
      { source: { type: 'sine', frequency: 410 }, envelope: { attack: 0.001, decay: 0.055, sustain: 0, release: 0.018 }, delay: 0.03, gain: 0.352 },
    ],
  },
  realtimeHover: { source: { type: 'sine', frequency: 1300 }, envelope: { attack: 0.005, decay: 0.015, sustain: 0, release: 0.008 }, gain: 0.641 },
};

const EPS = 1e-4;
let context = null, enabled = false;
const noiseCache = new Map(), activeLayers = new Set();
function getNoiseBuffer(ctx, color, duration) {
  const cached = noiseCache.get(color);
  if (cached && cached.duration >= duration) return cached;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * Math.max(duration, .2)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i=0;i<data.length;i++) {
    const white = Math.random()*2-1;
    if (color === 'white') { data[i] = white; continue; }
    b0=.99886*b0+white*.0555179;b1=.99332*b1+white*.0750759;b2=.969*b2+white*.153852;
    b3=.8665*b3+white*.3104856;b4=.55*b4+white*.5329522;b5=-.7616*b5-white*.016898;
    data[i]=(b0+b1+b2+b3+b4+b5+b6+white*.5362)*.11;b6=white*.115926;
  }
  noiseCache.set(color, buffer); return buffer;
}
/** Must be called by the explicit opt-in control's trusted click. */
export async function unlockAudio(event) {
  if (!event?.isTrusted) return false;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return false;
  try {
    if (!context) context = new Audio();
    if (context.state !== 'running') await context.resume();
    enabled = context.state === 'running'; return enabled;
  } catch { enabled = false; return false; }
}
function playLayer(ctx, layer, masterGain) {
  const start = ctx.currentTime + (layer.delay ?? 0), total = layer.envelope.attack + layer.envelope.decay + layer.envelope.release;
  const stopAt = start + total + .1, nodes = [], sources = [];
  const gain = ctx.createGain(); nodes.push(gain);
  const peak = Math.max(EPS, layer.gain * masterGain), envelope = layer.envelope;
  gain.gain.setValueAtTime(EPS, start);
  if (envelope.attack > 0) gain.gain.linearRampToValueAtTime(peak, start + envelope.attack); else gain.gain.setValueAtTime(peak, start);
  gain.gain.setTargetAtTime(Math.max(EPS, envelope.sustain*peak), start + envelope.attack, Math.max(.001, envelope.decay / 3));
  if (envelope.sustain && envelope.release) gain.gain.setTargetAtTime(EPS, start+envelope.attack+envelope.decay, envelope.release/3);
  const spec = layer.source;
  let source;
  if (spec.type === 'noise') {
    source = ctx.createBufferSource(); source.buffer = getNoiseBuffer(ctx, spec.color ?? 'white', total+.1);
  } else {
    source = ctx.createOscillator(); source.type = spec.type;
    const frequency = spec.frequency ?? 440;
    source.frequency.setValueAtTime(typeof frequency === 'number' ? frequency : frequency.start, start);
    if (typeof frequency !== 'number') source.frequency.exponentialRampToValueAtTime(Math.max(1, frequency.end), start+total);
    if (spec.fm) {
      const mod = ctx.createOscillator(), modGain = ctx.createGain();
      mod.frequency.value = (typeof frequency === 'number' ? frequency : frequency.start)*spec.fm.ratio;
      modGain.gain.value = spec.fm.depth; mod.connect(modGain).connect(source.frequency);
      nodes.push(mod, modGain); sources.push(mod);
    }
  }
  nodes.push(source); sources.push(source);
  let output = source;
  if (layer.filter) {
    const filter = ctx.createBiquadFilter(); filter.type=layer.filter.type;
    filter.frequency.setValueAtTime(layer.filter.frequency,start); filter.Q.value=layer.filter.resonance??1;
    source.connect(filter); output=filter; nodes.push(filter);
  }
  output.connect(gain).connect(ctx.destination);
  const cleanup = () => { for (const node of nodes) { try { node.disconnect(); } catch {} } activeLayers.delete(cleanup); };
  activeLayers.add(cleanup); source.onended = cleanup;
  for (const node of sources) { node.start(start); node.stop(stopAt); }
}
export function playUiSound(presetName = 'pressSoft', volume = .12) {
  if (!enabled || !context || context.state !== 'running') return;
  const preset = PRESETS[presetName]; if (!preset) return;
  for (const layer of ('layers' in preset ? preset.layers : [preset])) playLayer(context,layer,Math.max(0,Math.min(.25,volume)));
}
export function closeAudio() {
  enabled = false;
  for (const cleanup of activeLayers) cleanup();
  activeLayers.clear(); noiseCache.clear();
  const previous = context; context = null;
  if (previous && previous.state !== 'closed') previous.close().catch(() => {});
}
export function installUiSounds(root = document) {
  const life = new AbortController(), buttons = [...root.querySelectorAll('[data-ui-sound-toggle]')];
  let disposed = false;
  function paint(value) {
    for (const button of buttons) { button.setAttribute('aria-pressed',String(value)); button.textContent=`Звук интерфейса: ${value?'вкл.':'выкл.'}`; }
    document.documentElement.dataset.uiSound = value ? 'on' : 'off';
  }
  paint(false);
  root.addEventListener('click', async event => {
    const toggle = event.target.closest?.('[data-ui-sound-toggle]');
    if (toggle) {
      if (!event.isTrusted) return;
      if (enabled) { closeAudio(); paint(false); return; }
      const ready = await unlockAudio(event);
      if (disposed) { closeAudio(); return; }
      paint(ready);
      if (ready) playUiSound('toggleOn'); else { toggle.textContent='Звук недоступен'; toggle.disabled=true; }
      return;
    }
    if (event.isTrusted && event.target.closest?.('button, a[href], summary, input[type="range"]')) playUiSound('pressSoft');
  }, { signal: life.signal });
  return () => { disposed=true; life.abort(); closeAudio(); paint(false); delete document.documentElement.dataset.uiSound; };
}
