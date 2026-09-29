import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const T = JSON.parse(fs.readFileSync(new URL('../src/timing.json', import.meta.url), 'utf8'));
const SR = 48000,
  N = Math.ceil((T.duration + T.preroll) * SR),
  L = new Float32Array(N),
  R = new Float32Array(N),
  PI = Math.PI;
let seed = 510;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const midi = n => 440 * 2 ** ((n - 69) / 12);
function add(at, dur, fn, pan = 0) {
  const start = Math.round((at + T.preroll) * SR);
  for (let j = 0; j < dur * SR && start + j < N; j++) {
    if (start + j < 0) continue;
    const v = fn(j / SR, j / dur / SR);
    L[start + j] += v * Math.sqrt((1 - pan) / 2);
    R[start + j] += v * Math.sqrt((1 + pan) / 2);
  }
}
const beat = 60 / T.bpm;
for (let t = 0; t < T.duration; t += beat) {
  const b = Math.round(t / beat);
  const section = T.shots.findIndex(s => t >= s.at && t < s.end);
  const gain = section === 0 ? 0.45 : section === 4 ? 1 : 0.78;
  add(
    t,
    0.38,
    s =>
      gain * 0.52 * Math.sin(2 * PI * (47 * s + 8 * (1 - Math.exp(-35 * s)))) * Math.exp(-12 * s),
  );
  if (b % 2 === 1) add(t, 0.17, s => gain * 0.22 * rnd() * Math.exp(-27 * s));
  add(t + 0.25, 0.07, s => gain * 0.085 * rnd() * Math.exp(-70 * s), b % 2 ? 0.5 : -0.5);
  const notes = [33, 33, 36, 31, 29, 29, 36, 31];
  const f = midi(notes[Math.floor(t / 2) % notes.length]);
  add(
    t,
    0.42,
    s =>
      gain *
      0.21 *
      (Math.sin(2 * PI * f * s) + 0.28 * Math.sin(2 * PI * 2 * f * s)) *
      Math.min(1, s * 150) *
      Math.exp(-5 * s),
  );
  if (t >= 4 && t < T.shots[4].at + 3) {
    const n = [69, 72, 76, 79, 76, 72, 67, 72][b % 8];
    add(
      t + 0.125,
      0.6,
      s =>
        0.11 *
        Math.sin(
          2 * PI * midi(n) * s + 1.2 * Math.sin(2 * PI * midi(n) * 2 * s) * Math.exp(-8 * s),
        ) *
        Math.exp(-6 * s),
      Math.sin(b) * 0.6,
    );
  }
}
for (let bar = 0; bar < T.duration / 2; bar++) {
  const chord = [
    [57, 60, 64],
    [53, 57, 60],
    [60, 64, 67],
    [55, 59, 62],
  ][bar % 4];
  for (const [i, n] of chord.entries())
    add(
      bar * 2,
      2.7,
      (s, p) =>
        0.055 *
        (Math.sin(2 * PI * midi(n) * s) + 0.3 * Math.sin(2 * PI * midi(n) * 1.003 * s)) *
        Math.sin(PI * Math.min(1, p)) *
        (0.75 + 0.25 * Math.sin(2 * PI * s)),
      (i - 1) * 0.6,
    );
}
const impacts = new Set([
  ...T.hits,
  ...T.shots.flatMap(shot => Object.values(T.events[shot.id]).map(local => shot.at + local)),
]);
for (const t of impacts)
  add(t, 0.18, s => 0.12 * (rnd() * 0.55 + Math.sin(2 * PI * 1600 * s) * 0.45) * Math.exp(-35 * s));
for (const shot of T.shots) {
  if (shot.at === 0) continue;
  add(
    shot.at - 1,
    1,
    (s, p) => 0.13 * rnd() * p * p * (0.5 + 0.5 * Math.sin(2 * PI * (600 * s + 2500 * s * s))),
    0.25,
  );
  add(
    shot.at,
    0.9,
    s => 0.35 * Math.sin(2 * PI * 38 * s) * Math.exp(-7 * s) + 0.15 * rnd() * Math.exp(-16 * s),
  );
}
// Stereo cross-delay supplies space; timing and impacts remain in the shared cue file.
const delay = Math.round(0.375 * SR);
for (let i = delay; i < N; i++) {
  L[i] += 0.14 * R[i - delay];
  R[i] += 0.12 * L[i - delay];
}
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (N - i) / (SR * 1.5));
  L[i] = Math.tanh(L[i]) * fade;
  R[i] = Math.tanh(R[i]) * fade;
}
const b = Buffer.alloc(44 + N * 4);
b.write('RIFF');
b.writeUInt32LE(36 + N * 4, 4);
b.write('WAVEfmt ', 8);
b.writeUInt32LE(16, 16);
b.writeUInt16LE(1, 20);
b.writeUInt16LE(2, 22);
b.writeUInt32LE(SR, 24);
b.writeUInt32LE(SR * 4, 28);
b.writeUInt16LE(4, 32);
b.writeUInt16LE(16, 34);
b.write('data', 36);
b.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
  b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
}
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync('out/raw-score.wav', b);
const r = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    'out/raw-score.wav',
    '-af',
    'loudnorm=I=-13:TP=-1.5:LRA=8',
    '-ar',
    '48000',
    'public/score.wav',
  ],
  { stdio: 'inherit' },
);
if (r.error) throw r.error;
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`Original synthesized score: ${T.duration + T.preroll}s, cues from src/timing.json`);
