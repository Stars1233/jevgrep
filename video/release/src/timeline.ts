export const FPS = 60,
  PRE = 0.3,
  DURATION = 24,
  BPM = 120;
export const CUE = {
  introduce: 0,
  name: 0.5,
  version: 1.5,
  claim: 4,
  fracture: 4.5,
  parity: 6,
  search: 9,
  scan: 10,
  lock: 12.5,
  context: 14,
  collect: 16,
  terminal: 18,
  results: 19,
  install: 20.5,
  end: 24,
};
export const SHOTS = [
  { at: 0, end: 4 },
  { at: 4, end: 9 },
  { at: 9, end: 14 },
  { at: 14, end: 18 },
  { at: 18, end: 24 },
];
export type Event = { t: number; kind: 'kick' | 'snare' | 'hat' | 'accent'; a: number };
export const EVENTS: Event[] = [
  ...Array.from({ length: 48 }, (_, i) => ({
    t: i * 0.5,
    kind: 'kick' as const,
    a: i < 4 ? 0.65 : 1,
  })),
  ...Array.from({ length: 24 }, (_, i) => ({ t: i + 0.5, kind: 'snare' as const, a: 0.8 })),
  ...Array.from({ length: 96 }, (_, i) => ({
    t: i * 0.25,
    kind: 'hat' as const,
    a: i % 2 ? 0.7 : 0.3,
  })),
  ...Object.values(CUE)
    .filter(t => t < 24)
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
  0.15, 0.55, 1.3, 2.5, 3.75, 4.65, 6.6, 8.7, 9.8, 11.4, 13.4, 14.6, 16.7, 17.8, 18.9, 20.8, 23.3,
];
export const IMPACT_REVIEW = [
  4.45, 4.5, 4.56, 4.66, 4.83, 5.05, 12.45, 12.5, 12.56, 12.7, 12.9, 13.15, 1.45, 1.55, 1.75, 2,
  17.6, 17.7, 17.8, 17.9, 20.45, 20.6, 20.8, 21.1,
];
