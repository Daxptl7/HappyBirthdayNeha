import test from 'node:test';
import assert from 'node:assert/strict';
import { canStartCelebration, getCountdown, JOURNEY_STAGES, nextBirthdayStage, registerSecretTap, toLocalDateTimeInput } from './experienceLogic';
import { BIRTHDAY_WISHES } from '../data/birthdayWishes';

const midnight = Date.parse('2026-10-27T00:00:00+05:30');

test('birthday midnight is a fixed India-time instant across visitor timezones', () => {
  assert.equal(midnight, Date.parse('2026-10-26T18:30:00Z'));
  assert.deepEqual(getCountdown(midnight, midnight - 90_061_000), {
    days: 1, hours: 1, minutes: 1, seconds: 1, hasStarted: false,
  });
});

test('countdown holds the final second and releases exactly at the deadline', () => {
  assert.equal(getCountdown(midnight, midnight - 1).seconds, 1);
  assert.equal(getCountdown(midnight, midnight - 1).hasStarted, false);
  assert.deepEqual(getCountdown(midnight, midnight), {
    days: 0, hours: 0, minutes: 0, seconds: 0, hasStarted: true,
  });
  assert.equal(getCountdown(midnight, midnight + 86_400_000).hasStarted, true);
  assert.equal(getCountdown(midnight, midnight + 86_400_000).days, 0);
});

test('early and late visits require an opening tap; a late visit starts immediately after it', () => {
  assert.equal(canStartCelebration(midnight, midnight - 1, true), false);
  assert.equal(canStartCelebration(midnight, midnight, false), false);
  assert.equal(canStartCelebration(midnight, midnight, true), true);
  assert.equal(canStartCelebration(midnight, midnight + 1000, true), true);
});

test('a user-selected test time follows the same release rules as birthday midnight', () => {
  const customTarget = Date.parse('2026-10-24T15:45:30+05:30');
  assert.equal(getCountdown(customTarget, customTarget - 10_000).seconds, 10);
  assert.equal(canStartCelebration(customTarget, customTarget - 1, true), false);
  assert.equal(canStartCelebration(customTarget, customTarget, true), true);
  assert.equal(new Date(toLocalDateTimeInput(customTarget)).getTime(), customTarget);
});

test('invalid celebration times fail explicitly instead of releasing early', () => {
  assert.throws(() => getCountdown('invalid'), /valid timestamp/);
});

test('the birthday journey visits memories, twenty wishes, the QR surprise, then the finale', () => {
  const visited = ['countdown'];
  let current = JOURNEY_STAGES[0] as typeof JOURNEY_STAGES[number];
  while (current !== 'finale') { current = nextBirthdayStage(current); visited.push(current); }
  assert.deepEqual(visited, ['countdown', 'cake', 'birthday', 'letter', 'memories', 'wishes', 'surprise', 'finale']);
  assert.equal(nextBirthdayStage('finale'), 'finale');
  assert.equal(BIRTHDAY_WISHES.length, 20);
  assert.equal(new Set(BIRTHDAY_WISHES.map(wish => wish.title)).size, 20);
});

test('five name taps unlock the secret exactly once and reset the counter', () => {
  let state = { count: 0, startedAt: 0 };
  for (let i = 0; i < 5; i++) {
    const result = registerSecretTap(state, 1000 + i * 400);
    assert.equal(result.unlocked, i === 4);
    state = result;
  }
  assert.equal(state.count, 0);
  assert.equal(registerSecretTap(state, 3500).unlocked, false);
});

test('ordinary name clicks spaced far apart do not unexpectedly open the secret', () => {
  const first = registerSecretTap({ count: 0, startedAt: 0 }, 1000);
  const later = registerSecretTap(first, 8000);
  assert.equal(later.count, 1);
  assert.equal(later.startedAt, 8000);
  assert.equal(later.unlocked, false);
});
