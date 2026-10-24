export const JOURNEY_STAGES = ['countdown', 'cake', 'birthday', 'letter', 'memories', 'wishes', 'surprise', 'finale'] as const;
export type BirthdayStage = typeof JOURNEY_STAGES[number];

export function nextBirthdayStage(stage: BirthdayStage): BirthdayStage {
  return JOURNEY_STAGES[Math.min(JOURNEY_STAGES.indexOf(stage) + 1, JOURNEY_STAGES.length - 1)];
}

export function registerSecretTap(previous: { count: number; startedAt: number }, now: number) {
  const continuing = previous.count > 0 && now - previous.startedAt <= 6000;
  const count = continuing ? previous.count + 1 : 1;
  return { count: count >= 5 ? 0 : count, startedAt: continuing ? previous.startedAt : now, unlocked: count >= 5 };
}

export function getCountdown(target: string | number, now = Date.now()) {
  const targetMs = typeof target === 'number' ? target : Date.parse(target);
  if (!Number.isFinite(targetMs)) throw new Error('The celebration time must be a valid timestamp.');
  const totalSeconds = Math.max(0, Math.ceil((targetMs - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    hasStarted: now >= targetMs,
  };
}

// Explicitly arm the experience through a visitor gesture before releasing it.
export function canStartCelebration(target: number, now: number, armed: boolean) {
  return armed && now >= target;
}

export function toLocalDateTimeInput(timestamp: number) {
  const date = new Date(timestamp);
  const local = new Date(timestamp - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 19);
}
