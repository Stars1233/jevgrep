export const FPS = 60,
  PRE = 0.3,
  DURATION = 18,
  BPM = 120;
export const CUE = {
  introduce: 0,
  name: 0.25,
  version: 1,
  claim: 2.5,
  fracture: 3,
  parity: 3.5,
  search: 5,
  scan: 5.25,
  lock: 7,
  context: 9,
  collect: 10.5,
  terminal: 13.5,
  results: 14,
  install: 13.5,
  end: 18,
};
export const SHOTS = [
  { at: 0, end: 2.5 },
  { at: 2.5, end: 5 },
  { at: 5, end: 9 },
  { at: 9, end: 13.5 },
  { at: 13.5, end: 18 },
];
export type Event = { t: number; kind: 'kick' | 'snare' | 'hat' | 'accent'; a: number };
export const EVENTS: Event[] = [
  ...Array.from({ length: DURATION * 2 }, (_, i) => ({
    t: i * 0.5,
    kind: 'kick' as const,
    a: i < 4 ? 0.65 : 1,
  })),
  ...Array.from({ length: DURATION }, (_, i) => ({ t: i + 0.5, kind: 'snare' as const, a: 0.8 })),
  ...Array.from({ length: DURATION * 4 }, (_, i) => ({
    t: i * 0.25,
    kind: 'hat' as const,
    a: i % 2 ? 0.7 : 0.3,
  })),
  ...Array.from(new Set(Object.values(CUE)))
    .filter(t => t < DURATION)
    .map(t => ({ t, kind: 'accent' as const, a: 1 })),
];
export const clamp = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => 1 - (1 - clamp(x)) ** 3;
export const progress = (t: number, at: number, duration = 0.5) => ease((t - at) / duration);
export const pulse = (t: number, kind: Event['kind'], decay = 0.14) =>
  Math.min(
    1.5,
    EVENTS.filter(e => e.kind === kind && t >= e.t && t - e.t < decay * 7).reduce(
      (sum, e) => sum + e.a * Math.exp(-(t - e.t) / decay),
      0,
    ),
  );
export const REVIEW = [
  0.15, 0.9, 1.8, 2.6, 3.25, 4.25, 5.15, 5.9, 7.1, 8.6, 9.5, 10.8, 12.5, 13.6, 14.3, 15.4, 17.8,
];
export const IMPACT_REVIEW = [
  2.95, 3, 3.08, 3.25, 3.5, 4.1, 6.9, 7, 7.15, 7.4, 8, 8.5, 10.4, 10.5, 10.7, 11, 11.3, 12, 13.5,
  13.7, 14, 14.5, 15, 17,
];
