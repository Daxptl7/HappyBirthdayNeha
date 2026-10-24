import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { BirthdayAudioEngine } from './audioPlayer';

const originalWindow = globalThis.window;
const originalAudio = globalThis.Audio;
const engines: BirthdayAudioEngine[] = [];
let notes = 0;

class TestAudioContext {
  state = 'suspended';
  currentTime = 0;
  destination = {};
  async resume() { this.state = 'running'; }
  createOscillator() {
    return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() { notes++; }, stop() {} };
  }
  createGain() {
    return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
  }
}

function engine() {
  notes = 0;
  Object.assign(globalThis, { window: { AudioContext: TestAudioContext } });
  const audio = new BirthdayAudioEngine();
  engines.push(audio);
  return audio;
}

afterEach(() => {
  engines.splice(0).forEach(audio => audio.stop());
  Object.assign(globalThis, { window: originalWindow, Audio: originalAudio });
});

test('the opening gesture prepares audio silently; the song starts only on play', async () => {
  const audio = engine();
  assert.equal(await audio.prepare(), true);
  assert.equal(audio.getIsPlaying(), false);
  assert.equal(notes, 0);
  assert.equal(await audio.play(), true);
  assert.equal(audio.getIsPlaying(), true);
  assert.ok(notes > 0);
  audio.pause();
  assert.equal(audio.getIsPlaying(), false);
});

test('stopping during a pending start prevents playback after the reset', async () => {
  const audio = engine();
  const playback = audio.play();
  audio.stop();
  assert.equal(await playback, false);
  assert.equal(audio.getIsPlaying(), false);
  assert.equal(notes, 0);
});

test('rapid play requests schedule only one melody', async () => {
  const audio = engine();
  const [first, second] = await Promise.all([audio.play(), audio.play()]);
  assert.equal(first, false);
  assert.equal(second, true);
  assert.equal(notes, 2); // One bell note consists of two oscillators.
});

test('a browser without usable audio reports failure without claiming music is playing', async () => {
  const audio = engine();
  Object.assign(globalThis, { window: {} });
  assert.equal(await audio.prepare(), false);
  assert.equal(await audio.play(), false);
  assert.equal(audio.getIsPlaying(), false);
});

test('a blocked custom recording reports playback failure for the tap-to-retry UI', async () => {
  const audio = engine();
  Object.assign(globalThis, { Audio: class {
    addEventListener() {}
    async play() { throw new Error('Playback blocked by browser'); }
    pause() {}
  } });
  audio.setSong('custom-url', '/audio/song.mp3');
  assert.equal(await audio.prepare(), false);
  assert.equal(await audio.play(), false);
  assert.equal(audio.getIsPlaying(), false);
});

test('a custom song is prepared silently, then plays at the configured volume', async () => {
  const audio = engine();
  let recording: { volume: number; paused: boolean; currentTime: number; loop: boolean };
  Object.assign(globalThis, { Audio: class {
    volume = 1;
    paused = true;
    currentTime = 0;
    loop = false;
    constructor() { recording = this; }
    addEventListener() {}
    async play() { this.paused = false; }
    pause() { this.paused = true; }
  } });
  audio.setSong('custom-url', '/audio/song.mp3');
  audio.setVolume(.4);
  assert.equal(await audio.prepare(), true);
  assert.equal(recording!.volume, 0);
  assert.equal(recording!.paused, true);
  assert.equal(recording!.currentTime, 0);
  assert.equal(await audio.play(), true);
  assert.equal(recording!.volume, .4);
  assert.equal(recording!.paused, false);
  assert.equal(recording!.loop, true);
  assert.equal(notes, 0);
});
