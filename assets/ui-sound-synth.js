// Zero-Asset Web Audio API Procedural UI Sound Synthesizer (adapted from sdkhub.org)
// Synthesizes tactile mechanical clicks, soft presses, toggles, and hover ticks with 0 external audio files.
const PRESETS = {
  press: {
    layers: [
      { source: { type: 'noise', color: 'flat' }, filter: { type: 'bandpass', frequency: 2100, resonance: 0.9 }, envelope: { attack: 0, decay: 0.006, sustain: 0, release: 0.003 }, gain: 0.124 },
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
      { source: { type: 'noise', color: 'flat' }, filter: { type: 'bandpass', frequency: 7200, resonance: 1.1 }, envelope: { attack: 0, decay: 0.004, sustain: 0, release: 0.002 }, gain: 0.25 },
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
let ctx = null;
let noiseSeed = 6317;
function seededNoise() { noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) >>> 0; return noiseSeed / 4294967296; }
const noiseCache = {};

function getNoiseBuffer(context, color, duration) {
  const cached = noiseCache[color];
  if (cached && cached.duration >= duration) return cached;
  const buf = context.createBuffer(1, Math.ceil(context.sampleRate * Math.max(duration, 0.2)), context.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < data.length; i++) {
    const flat = seededNoise() * 2 - 1;
    if (color === 'flat') { data[i] = flat; continue; }
    b0 = 0.99886 * b0 + flat * 0.0555179;
    b1 = 0.99332 * b1 + flat * 0.0750759;
    b2 = 0.96900 * b2 + flat * 0.1538520;
    b3 = 0.86650 * b3 + flat * 0.3104856;
    b4 = 0.55000 * b4 + flat * 0.5329522;
    b5 = -0.7616 * b5 - flat * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + flat * 0.5362) * 0.11;
    b6 = flat * 0.115926;
  }
  return (noiseCache[color] = buf);
}

function unlockAudio() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
  }
  if (ctx.state !== 'running') ctx.resume();
}

// Audio unlock is host-controlled and opt-in only.

function playLayer(context, layer, masterGain) {
  const { source, envelope } = layer;
  const start = context.currentTime + (layer.delay ?? 0);
  const peak = layer.gain * masterGain;
  const total = envelope.attack + envelope.decay + envelope.release;
  const gainNode = context.createGain();
  const sustainLevel = Math.max(envelope.sustain * peak, EPS);
  gainNode.gain.setValueAtTime(EPS, start);
  if (envelope.attack > 0) gainNode.gain.linearRampToValueAtTime(peak, start + envelope.attack);
  else gainNode.gain.setValueAtTime(peak, start);
  if (envelope.sustain > 0) {
    gainNode.gain.setTargetAtTime(sustainLevel, start + envelope.attack, envelope.decay / 3);
    if (envelope.release > 0) gainNode.gain.setTargetAtTime(EPS, start + envelope.attack + envelope.decay, envelope.release / 3);
  } else {
    gainNode.gain.setTargetAtTime(EPS, start + envelope.attack, envelope.decay / 3);
  }
  const stopAt = start + total + 0.1;
  let node;
  if (source.type === 'noise') {
    const src = context.createBufferSource();
    src.buffer = getNoiseBuffer(context, source.color ?? 'flat', total + 0.1);
    src.start(start); src.stop(stopAt);
    node = src;
  } else {
    const osc = context.createOscillator();
    osc.type = source.type;
    const freq = source.frequency ?? 440;
    if (typeof freq === 'number') osc.frequency.setValueAtTime(freq, start);
    else {
      osc.frequency.setValueAtTime(freq.start, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(freq.end, 1), start + total);
    }
    if (source.fm) {
      const mod = context.createOscillator();
      mod.type = 'sine';
      mod.frequency.value = (typeof freq === 'number' ? freq : freq.start) * source.fm.ratio;
      const modGain = context.createGain();
      modGain.gain.value = source.fm.depth;
      mod.connect(modGain).connect(osc.frequency);
      mod.start(start); mod.stop(stopAt);
    }
    osc.start(start); osc.stop(stopAt);
    node = osc;
  }
  if (layer.filter) {
    const filter = context.createBiquadFilter();
    filter.type = layer.filter.type;
    filter.frequency.setValueAtTime(layer.filter.frequency, start);
    filter.Q.value = layer.filter.resonance ?? 1;
    node.connect(filter);
    node = filter;
  }
  node.connect(gainNode).connect(context.destination);
}

function playUiSound(presetName = 'press', volume = 1.6) {
  if (!ctx || ctx.state !== 'running') return;
  const preset = PRESETS[presetName];
  if (!preset) return;
  const layers = 'layers' in preset ? preset.layers : [preset];
  for (const layer of layers) playLayer(ctx, layer, volume);
}

(() => { let enabled=false; const play=(name)=>{ if(enabled) playUiSound(name,.2); }; window.StudioAudio={setEnabled:(value)=>{enabled=!!value;},isEnabled:()=>enabled,unlock:()=>{if(enabled)unlockAudio();},click:()=>play('press'),hover:()=>play('realtimeHover'),toggle:()=>play('toggleOn'),select:()=>play('select'),success:()=>play('pop')}; })();
