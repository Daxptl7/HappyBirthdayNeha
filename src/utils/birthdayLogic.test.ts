import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBirthdayStats,
  encodeBirthdayConfig,
  decodeBirthdayConfig,
  getScrollRevealState,
  createStarfieldParticles,
  stepStarParticle,
  lerpCursorPosition,
  computeCakeCutKinematics,
} from './birthdayLogic';

test('calculateBirthdayStats accurately detects birthday today', () => {
  const refDate = new Date(2026, 9, 24); // Oct 24, 2026
  const stats = calculateBirthdayStats('2000-10-24', refDate);
  assert.equal(stats.isToday, true);
  assert.equal(stats.daysUntilNext, 0);
  assert.equal(stats.age, 26);
  assert.ok(stats.totalDaysLived > 9000);
});

test('calculateBirthdayStats handles future birthday this year', () => {
  const refDate = new Date(2026, 9, 20); // Oct 20, 2026
  const stats = calculateBirthdayStats('2000-10-24', refDate);
  assert.equal(stats.isToday, false);
  assert.equal(stats.daysUntilNext, 4);
  assert.equal(stats.age, 25);
});

test('encodeBirthdayConfig and decodeBirthdayConfig serialize and deserialize accurately', () => {
  const testConfig = {
    recipientName: 'Aria',
    senderName: 'With Forever Love',
    birthDate: '1999-05-18',
    headline: 'To the Queen of My Heart',
    subheadline: 'Happy 27th Birthday!',
    letter: {
      salutation: 'Dearest Aria,',
      paragraphs: ['You bring light wherever you walk.', 'May this year be your grandest adventure yet.'],
      closing: 'All my love, always,',
      signoff: 'Yours truly',
    },
    giftNote: 'A special trip under the northern lights.',
    reasons: ['Your laugh is contagious', 'Your kindness never ceases'],
  };

  const encoded = encodeBirthdayConfig(testConfig);
  assert.ok(encoded.length > 10);

  const decoded = decodeBirthdayConfig(encoded);
  assert.equal(decoded?.recipientName, 'Aria');
  assert.equal(decoded?.senderName, 'With Forever Love');
  assert.equal(decoded?.headline, 'To the Queen of My Heart');
  assert.equal(decoded?.letter?.paragraphs.length, 2);
  assert.equal(decoded?.reasons?.length, 2);
});

test('getScrollRevealState returns hidden and revealed classes and respects prefersReducedMotion', () => {
  const hidden = getScrollRevealState({ isVisible: false, delayMs: 120 });
  assert.equal(hidden.dataRevealed, 'false');
  assert.ok(hidden.className.includes('opacity-0'));
  assert.ok(hidden.className.includes('translate-y-8'));
  assert.equal(hidden.transitionDelay, '120ms');

  const revealed = getScrollRevealState({ isVisible: true, delayMs: 80 });
  assert.equal(revealed.dataRevealed, 'true');
  assert.ok(revealed.className.includes('opacity-100'));
  assert.ok(revealed.className.includes('translate-y-0'));
  assert.equal(revealed.transitionDelay, '80ms');

  const reduced = getScrollRevealState({ isVisible: false, prefersReducedMotion: true });
  assert.equal(reduced.dataRevealed, 'true');
  assert.equal(reduced.className, 'opacity-100 translate-y-0');
});

test('createStarfieldParticles and stepStarParticle compute bounded parallax positions', () => {
  const stars = createStarfieldParticles(1440, 900, 50);
  assert.equal(stars.length, 50);
  assert.ok(stars.every((s) => s.x >= 0 && s.x <= 1440 && s.y >= 0 && s.y <= 900));
  assert.ok(stars.every((s) => s.depth >= 0.15 && s.depth <= 1.0));

  const stepped = stepStarParticle(stars[0], 1440, 900, 500, 2.5);
  assert.ok(stepped.renderX >= 0 && stepped.renderX < 1440);
  assert.ok(stepped.renderY >= 0 && stepped.renderY < 900);
  assert.ok(stepped.currentAlpha >= 0.08 && stepped.currentAlpha <= 1);
});

test('lerpCursorPosition smoothly interpolates toward target cursor coordinates', () => {
  const next = lerpCursorPosition({ x: 100, y: 200 }, { x: 200, y: 400 }, 0.25);
  assert.equal(next.x, 125);
  assert.equal(next.y, 250);
});

test('computeCakeCutKinematics transitions from whole to cutting and sliced states', () => {
  const whole = computeCakeCutKinematics('whole', 0);
  assert.equal(whole.isSliceSeparated, false);
  assert.equal(whole.sliceOffsetX, 0);

  const midCut = computeCakeCutKinematics('cutting', 0.5);
  assert.ok(midCut.knifeY < whole.knifeY);

  const sliced = computeCakeCutKinematics('sliced', 1);
  assert.equal(sliced.isSliceSeparated, true);
  assert.ok(sliced.sliceOffsetX > 0.8);
  assert.ok(sliced.sliceOffsetZ > 0.4);
});




