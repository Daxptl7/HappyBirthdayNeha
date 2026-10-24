export interface BreathSample { rms: number; breadth: number; }

// A short calibration and a sustained broad noise pulse reject isolated taps.
// This is a playful breath detector; the tap alternative is always available.
export function createBlowDetector(startedAt: number) {
  let baseline = 0;
  let samples = 0;
  let sustainedAt: number | null = null;
  let lastStrongAt = 0;
  return (sample: BreathSample, now: number) => {
    if (now - startedAt < 650) {
      samples++;
      baseline += (sample.rms - baseline) / samples;
      return { calibrating: true, detected: false, level: 0 };
    }
    const threshold = Math.max(.035, baseline * 2.4);
    const strong = sample.rms >= threshold && sample.breadth >= .24;
    if (strong) {
      if (sustainedAt === null) sustainedAt = now;
      lastStrongAt = now;
    } else if (now - lastStrongAt > 110) sustainedAt = null;
    return {
      calibrating: false,
      detected: strong && sustainedAt !== null && now - sustainedAt >= 260,
      level: Math.max(0, Math.min(1, sample.rms / threshold)),
    };
  };
}

export function measureBreath(waveform: Float32Array, spectrum: Uint8Array, sampleRate: number): BreathSample {
  let sum = 0;
  for (const value of waveform) sum += value * value;
  const rms = Math.sqrt(sum / Math.max(1, waveform.length));
  const from = Math.floor(180 / (sampleRate / (spectrum.length * 2)));
  const to = Math.min(spectrum.length, Math.ceil(6500 / (sampleRate / (spectrum.length * 2))));
  let mean = 0;
  for (let i = from; i < to; i++) mean += spectrum[i];
  mean /= Math.max(1, to - from);
  let occupied = 0;
  for (let i = from; i < to; i++) if (spectrum[i] > Math.max(12, mean * .6)) occupied++;
  return { rms, breadth: occupied / Math.max(1, to - from) };
}
