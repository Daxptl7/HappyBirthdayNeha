import { BirthdayConfig } from '../types/birthday';

export interface BirthdayStats {
  age: number;
  daysUntilNext: number;
  isToday: boolean;
  totalDaysLived: number;
}

/**
 * Calculates milestone statistics given a birthdate string (YYYY-MM-DD).
 */
export function calculateBirthdayStats(birthDateStr: string, referenceDate: Date = new Date()): BirthdayStats {
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    return {
      age: 24,
      daysUntilNext: 0,
      isToday: true,
      totalDaysLived: 8760,
    };
  }

  const currentYear = referenceDate.getFullYear();
  let thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // Check if today is birthday (same month & day)
  const isToday =
    referenceDate.getMonth() === birthDate.getMonth() &&
    referenceDate.getDate() === birthDate.getDate();

  // If birthday already passed this year (and not today), next birthday is next year
  if (thisYearBirthday < referenceDate && !isToday) {
    thisYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  }

  const diffMs = thisYearBirthday.getTime() - referenceDate.getTime();
  const daysUntilNext = isToday ? 0 : Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  const livedDiff = referenceDate.getTime() - birthDate.getTime();
  const totalDaysLived = Math.max(1, Math.floor(livedDiff / (1000 * 60 * 60 * 24)));

  return {
    age: Math.max(0, age),
    daysUntilNext,
    isToday,
    totalDaysLived,
  };
}

/**
 * Formats a date string into an elegant human readable display.
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Encodes customized birthday state to a safe base64 URL string for sharing.
 */
export function encodeBirthdayConfig(config: Partial<BirthdayConfig>): string {
  try {
    // Only serialize lightweight properties to avoid huge URLs
    const lightweight = {
      recipientName: config.recipientName,
      senderName: config.senderName,
      birthDate: config.birthDate,
      headline: config.headline,
      subheadline: config.subheadline,
      letter: config.letter,
      songType: config.song?.type,
      songTitle: config.song?.title,
      giftNote: config.giftNote,
      reasons: config.reasons,
    };
    const json = JSON.stringify(lightweight);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch {
    return '';
  }
}

/**
 * Decodes birthday state from a base64 URL hash or query string.
 */
export function decodeBirthdayConfig(encoded: string): Partial<BirthdayConfig> | null {
  try {
    if (!encoded) return null;
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const parsed = JSON.parse(jsonStr);
    const result: Partial<BirthdayConfig> = {
      recipientName: parsed.recipientName,
      senderName: parsed.senderName,
      birthDate: parsed.birthDate,
      headline: parsed.headline,
      subheadline: parsed.subheadline,
      letter: parsed.letter,
      giftNote: parsed.giftNote,
      reasons: parsed.reasons,
    };
    if (parsed.songType) {
      result.song = {
        type: parsed.songType,
        title: parsed.songTitle || 'Happy Birthday Music Box',
        artist: 'Celebration Orchestra',
      };
    }
    return result;
  } catch {
    return null;
  }
}

export interface ScrollRevealOptions {
  isVisible: boolean;
  delayMs?: number;
  prefersReducedMotion?: boolean;
}

/**
 * Computes deterministic CSS class names and inline transition delay for intersection observer reveals.
 */
export function getScrollRevealState({
  isVisible,
  delayMs = 0,
  prefersReducedMotion = false,
}: ScrollRevealOptions): {
  className: string;
  transitionDelay: string;
  dataRevealed: 'true' | 'false';
} {
  if (prefersReducedMotion) {
    return {
      className: 'opacity-100 translate-y-0',
      transitionDelay: '0ms',
      dataRevealed: 'true',
    };
  }

  const baseTransition = 'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]';
  const stateClasses = isVisible
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-8';

  return {
    className: `${baseTransition} ${stateClasses}`,
    transitionDelay: `${Math.max(0, delayMs)}ms`,
    dataRevealed: isVisible ? 'true' : 'false',
  };
}

export interface StarParticle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  depth: number; // 0.15 (far) to 1.0 (near) for parallax
  color: string;
  driftVx: number;
  driftVy: number;
}

const STAR_PALETTE = ['#f59e0b', '#ec4899', '#fb7185', '#d97706', '#f43f5e'];

/**
 * Generates a deterministic or seeded array of parallax star particles for the canvas layer.
 */
export function createStarfieldParticles(
  width: number,
  height: number,
  count = 90
): StarParticle[] {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const stars: StarParticle[] = [];

  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random distribution based on index for stable initial frames
    const s1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const r1 = s1 - Math.floor(s1);
    const s2 = Math.sin(i * 93.9898 + 12.456) * 23421.6312;
    const r2 = s2 - Math.floor(s2);
    const s3 = Math.sin(i * 45.1234 + 54.321) * 19283.7465;
    const r3 = s3 - Math.floor(s3);

    const depth = 0.15 + r3 * 0.85; // 0.15 to 1.0
    const radius = 0.6 + depth * 1.4;
    const baseAlpha = 0.25 + depth * 0.55;

    stars.push({
      x: r1 * safeW,
      y: r2 * safeH,
      radius,
      baseAlpha,
      twinkleSpeed: 0.8 + r1 * 1.8,
      twinklePhase: r2 * Math.PI * 2,
      depth,
      color: STAR_PALETTE[i % STAR_PALETTE.length],
      driftVx: (r1 - 0.5) * 0.12 * depth,
      driftVy: (-0.08 - r2 * 0.18) * depth,
    });
  }

  return stars;
}

/**
 * Advances a star particle one frame and calculates wrapped parallax coordinates.
 */
export function stepStarParticle(
  star: StarParticle,
  width: number,
  height: number,
  scrollY: number,
  elapsedSec: number
): {
  nextX: number;
  nextY: number;
  renderX: number;
  renderY: number;
  currentAlpha: number;
} {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);

  let nextX = (star.x + star.driftVx) % safeW;
  if (nextX < 0) nextX += safeW;

  let nextY = (star.y + star.driftVy) % safeH;
  if (nextY < 0) nextY += safeH;

  // Apply vertical parallax offset proportional to star depth
  const parallaxOffset = scrollY * star.depth * 0.22;
  let renderY = (nextY - parallaxOffset) % safeH;
  if (renderY < 0) renderY += safeH;

  const twinkle = Math.sin(elapsedSec * star.twinkleSpeed + star.twinklePhase);
  const currentAlpha = Math.max(0.08, Math.min(1, star.baseAlpha + twinkle * 0.22));

  return {
    nextX,
    nextY,
    renderX: nextX,
    renderY,
    currentAlpha,
  };
}

/**
 * Smoothly interpolates current follower coordinates toward target mouse coordinates.
 */
export function lerpCursorPosition(
  current: { x: number; y: number },
  target: { x: number; y: number },
  smoothing = 0.16
): { x: number; y: number } {
  const factor = Math.max(0.01, Math.min(1, smoothing));
  return {
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  };
}

export type CakeCutState = 'whole' | 'cutting' | 'sliced';

export interface CakeCutKinematics {
  knifeY: number;
  knifeRotZ: number;
  sliceOffsetX: number;
  sliceOffsetZ: number;
  sliceLiftY: number;
  isSliceSeparated: boolean;
}

/**
 * Computes 3D positions and rotations for the cake knife and cut cake wedge given normalized progress [0..1].
 */
export function computeCakeCutKinematics(
  state: CakeCutState,
  progress: number
): CakeCutKinematics {
  const t = Math.max(0, Math.min(1, progress));

  if (state === 'whole') {
    return {
      knifeY: 2.35,
      knifeRotZ: -0.18,
      sliceOffsetX: 0,
      sliceOffsetZ: 0,
      sliceLiftY: 0,
      isSliceSeparated: false,
    };
  }

  if (state === 'cutting') {
    // First half (0 -> 0.5): knife descends through the cake
    // Second half (0.5 -> 1.0): knife rises slightly while the wedge slides out
    if (t <= 0.5) {
      const cutPhase = t / 0.5;
      return {
        knifeY: 2.35 - cutPhase * 1.45,
        knifeRotZ: -0.18 + cutPhase * 0.18,
        sliceOffsetX: 0,
        sliceOffsetZ: 0,
        sliceLiftY: 0,
        isSliceSeparated: false,
      };
    } else {
      const slidePhase = (t - 0.5) / 0.5;
      const angle = Math.PI / 6; // 30 degrees bisector of the 60-degree wedge
      const dist = slidePhase * 1.15;
      return {
        knifeY: 0.9 + slidePhase * 1.2,
        knifeRotZ: 0.08 * slidePhase,
        sliceOffsetX: Math.cos(angle) * dist,
        sliceOffsetZ: Math.sin(angle) * dist,
        sliceLiftY: Math.sin(slidePhase * Math.PI) * 0.18,
        isSliceSeparated: slidePhase > 0.2,
      };
    }
  }

  // 'sliced'
  const angle = Math.PI / 6;
  const dist = 1.15;
  return {
    knifeY: 2.1,
    knifeRotZ: 0.08,
    sliceOffsetX: Math.cos(angle) * dist,
    sliceOffsetZ: Math.sin(angle) * dist,
    sliceLiftY: 0,
    isSliceSeparated: true,
  };
}




