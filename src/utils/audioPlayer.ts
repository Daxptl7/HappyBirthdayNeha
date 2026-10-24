/**
 * High-fidelity Audio Synthesizer and Player for Birthday Website
 * Supports:
 * - Procedural Celestial Music Box "Happy Birthday" (Web Audio API, 0 network dependency)
 * - Acoustic Lofi Chime melody
 * - Custom uploaded audio files (Data URLs / Blobs)
 * - Custom streaming audio URLs
 */

interface Note {
  pitch: number; // Hz
  duration: number; // beats
}

// Frequencies for Happy Birthday
const G4 = 392.0;
const A4 = 440.0;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;

const HAPPY_BIRTHDAY_NOTES: Note[] = [
  // Happy Birthday to you
  { pitch: G4, duration: 0.75 },
  { pitch: G4, duration: 0.25 },
  { pitch: A4, duration: 1.0 },
  { pitch: G4, duration: 1.0 },
  { pitch: C5, duration: 1.0 },
  { pitch: B4, duration: 2.0 },

  // Happy Birthday to you
  { pitch: G4, duration: 0.75 },
  { pitch: G4, duration: 0.25 },
  { pitch: A4, duration: 1.0 },
  { pitch: G4, duration: 1.0 },
  { pitch: D5, duration: 1.0 },
  { pitch: C5, duration: 2.0 },

  // Happy Birthday dear [name]
  { pitch: G4, duration: 0.75 },
  { pitch: G4, duration: 0.25 },
  { pitch: G5, duration: 1.0 },
  { pitch: E5, duration: 1.0 },
  { pitch: C5, duration: 1.0 },
  { pitch: B4, duration: 1.0 },
  { pitch: A4, duration: 2.0 },

  // Happy Birthday to you!
  { pitch: F5, duration: 0.75 },
  { pitch: F5, duration: 0.25 },
  { pitch: E5, duration: 1.0 },
  { pitch: C5, duration: 1.0 },
  { pitch: D5, duration: 1.0 },
  { pitch: C5, duration: 3.0 },
];

const LOFI_CHIME_NOTES: Note[] = [
  { pitch: C5, duration: 1.0 },
  { pitch: E5, duration: 1.0 },
  { pitch: G5, duration: 1.0 },
  { pitch: B4, duration: 2.0 },
  { pitch: A4, duration: 1.0 },
  { pitch: C5, duration: 1.0 },
  { pitch: E5, duration: 2.0 },
  { pitch: G4, duration: 1.0 },
  { pitch: B4, duration: 1.0 },
  { pitch: D5, duration: 2.0 },
  { pitch: C5, duration: 3.0 },
];

export class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTimeout: any = null;
  private noteIndex = 0;
  private volume = 0.6;
  private isMuted = false;
  private customAudio: HTMLAudioElement | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private songType: string = 'celestial-music-box';
  private customSourceUrl: string | null = null;
  private playRequest = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isPlaying));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudio) {
      this.customAudio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.customAudio) {
      this.customAudio.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setSong(type: string, customUrl?: string, customAudioData?: string) {
    this.stop();
    this.customAudio = null;
    this.songType = type;
    this.customSourceUrl = customAudioData || customUrl || null;
  }

  // Called directly from the opening tap, before the countdown reaches zero.
  public async prepare(): Promise<boolean> {
    try {
      if (this.customSourceUrl && (this.songType === 'custom-url' || this.songType === 'custom-file')) {
        if (!this.customAudio) {
          this.customAudio = new Audio(this.customSourceUrl);
          this.customAudio.loop = true;
          this.customAudio.preload = 'auto';
          this.customAudio.addEventListener('error', () => this.stop());
        }
        // Authorize the media element during the gesture without playing the song aloud.
        this.customAudio.volume = 0;
        await this.customAudio.play();
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
        return true;
      }
      await this.initContext();
      return this.ctx?.state === 'running';
    } catch {
      return false;
    }
  }

  public async play(): Promise<boolean> {
    if (this.isPlaying) return true;
    const request = ++this.playRequest;
    try {
      if (this.customSourceUrl && (this.songType === 'custom-url' || this.songType === 'custom-file')) {
        if (!this.customAudio && !(await this.prepare())) return false;
        if (request !== this.playRequest) return false;
        this.customAudio!.volume = this.isMuted ? 0 : this.volume;
        await this.customAudio!.play();
      } else {
        await this.initContext();
        if (this.ctx?.state !== 'running') return false;
      }
      if (request !== this.playRequest) return false;
      this.isPlaying = true;
      this.noteIndex = 0;
      this.notify();
      if (!(this.customSourceUrl && (this.songType === 'custom-url' || this.songType === 'custom-file'))) this.scheduleNextNote();
      return true;
    } catch {
      if (request === this.playRequest) {
        this.isPlaying = false;
        this.notify();
      }
      return false;
    }
  }

  private playBellTone(freq: number, durationSec: number) {
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Celestial music box bell harmonics: fundamental + soft chime overtone
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.01, now); // slightly detuned harmonic for music-box sparkle

      const effectiveVol = this.volume * 0.35;
      gainNode.gain.setValueAtTime(effectiveVol, now);
      // Soft percussive bell decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.4);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec * 1.5);
      osc2.stop(now + durationSec * 1.5);
    } catch {
      // Audio node cleanup safeguard
    }
  }

  private scheduleNextNote() {
    if (!this.isPlaying) return;

    const notes = this.songType === 'acoustic-chime' ? LOFI_CHIME_NOTES : HAPPY_BIRTHDAY_NOTES;
    if (this.noteIndex >= notes.length) {
      // Pause 2 seconds and loop smoothly
      this.currentTimeout = setTimeout(() => {
        if (this.isPlaying) {
          this.noteIndex = 0;
          this.scheduleNextNote();
        }
      }, 2000);
      return;
    }

    const currentNote = notes[this.noteIndex];
    const beatSeconds = 0.52; // Tempo ~115 BPM
    const noteDuration = currentNote.duration * beatSeconds;

    this.playBellTone(currentNote.pitch, noteDuration);
    this.noteIndex++;

    this.currentTimeout = setTimeout(() => {
      this.scheduleNextNote();
    }, noteDuration * 1000);
  }

  public pause() {
    this.stop();
  }

  public stop() {
    this.playRequest++;
    this.isPlaying = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }
}

export const birthdayAudio = new BirthdayAudioEngine();
