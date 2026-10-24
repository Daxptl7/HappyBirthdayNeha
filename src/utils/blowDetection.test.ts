import test from 'node:test';
import assert from 'node:assert/strict';
import { createBlowDetector, measureBreath } from './blowDetection';

function calibrated(baseline = .007) {
  const detect = createBlowDetector(0);
  for (let time = 0; time < 650; time += 50) detect({ rms: baseline, breadth: .5 }, time);
  return detect;
}

test('calibration never blows out the candles, even when the microphone opens loudly', () => {
  const detect = createBlowDetector(0);
  assert.deepEqual(detect({ rms: .7, breadth: 1 }, 500), { calibrating: true, detected: false, level: 0 });
});

test('a sustained broadband puff blows out the candles after calibration', () => {
  const detect = calibrated();
  assert.equal(detect({ rms: .09, breadth: .8 }, 700).detected, false);
  assert.equal(detect({ rms: .09, breadth: .8 }, 850).detected, false);
  assert.equal(detect({ rms: .09, breadth: .8 }, 1000).detected, true);
});

test('isolated taps and narrow tones do not count as a breath', () => {
  const detect = calibrated();
  assert.equal(detect({ rms: .2, breadth: .6 }, 700).detected, false);
  assert.equal(detect({ rms: .005, breadth: .5 }, 900).detected, false);
  assert.equal(detect({ rms: .2, breadth: .6 }, 1100).detected, false);
  assert.equal(detect({ rms: .2, breadth: .05 }, 1500).detected, false);
  assert.equal(detect({ rms: .2, breadth: .05 }, 1900).detected, false);
});

test('a steady noisy room raises the threshold instead of immediately extinguishing candles', () => {
  const detect = calibrated(.07);
  assert.equal(detect({ rms: .075, breadth: .8 }, 700).detected, false);
  assert.equal(detect({ rms: .075, breadth: .8 }, 1200).detected, false);
  assert.equal(detect({ rms: .22, breadth: .8 }, 1500).detected, false);
  assert.equal(detect({ rms: .22, breadth: .8 }, 1800).detected, true);
});

test('audio measurement recognizes silence and spread-out breath energy', () => {
  assert.deepEqual(measureBreath(new Float32Array(1024), new Uint8Array(512), 48000), { rms: 0, breadth: 0 });
  const noise = new Float32Array(1024).fill(.1);
  const spectrum = new Uint8Array(512).fill(60);
  const sample = measureBreath(noise, spectrum, 48000);
  assert.ok(Math.abs(sample.rms - .1) < 1e-6);
  assert.equal(sample.breadth, 1);
});
