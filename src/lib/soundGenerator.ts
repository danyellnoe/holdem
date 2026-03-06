/**
 * Generates alert sounds programmatically using the Web Audio API.
 * This avoids needing bundled audio files while still providing
 * distinct, pleasant sounds for different alert types.
 */

export type SoundType = 'bell' | 'horn' | 'chime' | 'buzzer';

function createSilentBuffer(ctx: AudioContext): AudioBuffer {
  return ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
}

/**
 * Generate a bell sound: decaying sine wave at ~880Hz
 */
function generateBell(ctx: AudioContext): AudioBuffer {
  const duration = 1.5;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const freq = 880;
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const decay = Math.exp(-t * 3);
    data[i] = decay * Math.sin(2 * Math.PI * freq * t) * 0.4;
    // Add harmonics
    data[i] += decay * 0.3 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-t * 5);
    data[i] += decay * 0.1 * Math.sin(2 * Math.PI * freq * 3 * t) * Math.exp(-t * 8);
  }
  return buffer;
}

/**
 * Generate a chime: softer, higher bell (1047Hz = C6)
 */
function generateChime(ctx: AudioContext): AudioBuffer {
  const duration = 1.2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const freqs = [1047, 1319, 1568]; // C6, E6, G6 — major chord
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const decay = Math.exp(-t * 4);
    data[i] = 0;
    for (const freq of freqs) {
      data[i] += (decay * 0.2 * Math.sin(2 * Math.PI * freq * t)) / freqs.length;
    }
  }
  return buffer;
}

/**
 * Generate a horn: short, loud, buzzy tone
 */
function generateHorn(ctx: AudioContext): AudioBuffer {
  const duration = 0.8;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const freq = 440;
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const envelope = t < 0.05
      ? t / 0.05
      : t > 0.6
      ? 1 - (t - 0.6) / 0.2
      : 1;
    // Square-ish wave for buzzy horn sound
    const raw = Math.sin(2 * Math.PI * freq * t)
      + 0.5 * Math.sin(2 * Math.PI * freq * 2 * t)
      + 0.3 * Math.sin(2 * Math.PI * freq * 3 * t);
    data[i] = envelope * raw * 0.3;
  }
  return buffer;
}

/**
 * Generate a buzzer: raspy descending tone
 */
function generateBuzzer(ctx: AudioContext): AudioBuffer {
  const duration = 0.6;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const freqSweep = 300 - t * 200; // sweep down from 300 to 100
    const envelope = t < 0.02 ? t / 0.02 : t > 0.4 ? 1 - (t - 0.4) / 0.2 : 1;
    data[i] = envelope * 0.4 * (Math.random() * 2 - 1) * 0.3
      + envelope * 0.4 * Math.sin(2 * Math.PI * freqSweep * t);
  }
  return buffer;
}

const generatorMap: Record<SoundType, (ctx: AudioContext) => AudioBuffer> = {
  bell: generateBell,
  chime: generateChime,
  horn: generateHorn,
  buzzer: generateBuzzer,
};

export function generateSound(ctx: AudioContext, type: SoundType): AudioBuffer {
  try {
    return generatorMap[type](ctx);
  } catch {
    return createSilentBuffer(ctx);
  }
}
