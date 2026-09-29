import { EVENTS, SHOTS, PRE, DURATION, CUE } from '../src/timeline.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const rate = 48000,
  total = Math.ceil((DURATION + PRE) * rate),
  left = new Float32Array(total),
  right = new Float32Array(total),
  tau = Math.PI * 2;
let seed = 501;
const noise = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296) * 2 - 1;
function add(time, duration, sound, pan = 0) {
  const start = Math.round((time + PRE) * rate);
  for (let j = 0; j < duration * rate && start + j < total; j++) {
    if (start + j < 0) continue;
    const value = sound(j / rate, j / (duration * rate));
    left[start + j] += value * Math.sqrt((1 - pan) / 2);
    right[start + j] += value * Math.sqrt((1 + pan) / 2);
  }
}
for (const e of EVENTS) {
  const gain = e.a * (e.t >= 22 ? 0.45 : 1);
  if (e.kind === 'kick') {
    add(
      e.t,
      0.45,
      s =>
        gain * 0.8 * Math.sin(tau * (43 * s + 1.9 * (1 - Math.exp(-35 * s)))) * Math.exp(-10 * s),
    );
    add(e.t, 0.025, s => noise() * 0.18 * Math.exp(-180 * s));
    const note = [43.65, 43.65, 51.91, 38.89][Math.floor(e.t / 2) % 4];
    if (e.t >= 1.5)
      add(
        e.t,
        0.42,
        s =>
          gain *
          0.25 *
          Math.tanh(2 * (Math.sin(tau * note * s) + 0.35 * Math.sin(tau * note * 2 * s))) *
          Math.min(1, s * 160) *
          Math.exp(-7 * s),
      );
  }
  if (e.kind === 'snare')
    add(
      e.t,
      0.23,
      s => gain * (0.3 * noise() + 0.22 * Math.sin(tau * 185 * s)) * Math.exp(-19 * s),
    );
  if (e.kind === 'hat') {
    let previous = 0;
    add(
      e.t,
      0.07,
      s => {
        const n = noise(),
          v = n - previous;
        previous = n;
        return gain * 0.055 * v * Math.exp(-60 * s);
      },
      e.t % 1 < 0.5 ? -0.6 : 0.6,
    );
  }
  if (e.kind === 'accent') {
    add(
      e.t,
      0.7,
      s =>
        0.26 * Math.sin(tau * (34 * s + 0.6 * (1 - Math.exp(-20 * s)))) * Math.exp(-7 * s) +
        0.12 * noise() * Math.exp(-30 * s),
    );
    add(
      e.t,
      0.3,
      s => 0.1 * (Math.sin(tau * 740 * s) + 0.5 * Math.sin(tau * 1110 * s)) * Math.exp(-17 * s),
    );
  }
}
for (let i = 0; i < 96; i++) {
  const time = i * 0.25;
  if (time < 4 || time > 22) continue;
  const notes = [220, 261.63, 329.63, 392, 329.63, 293.66, 261.63, 196];
  const f = notes[i % 8];
  add(
    time,
    0.36,
    s =>
      0.07 *
      Math.sin(tau * f * s + 2 * Math.sin(tau * f * 2 * s) * Math.exp(-10 * s)) *
      Math.exp(-9 * s),
    Math.sin(i * 2) * 0.7,
  );
}
for (const shot of SHOTS.slice(1)) {
  add(
    shot.at - 0.75,
    0.75,
    (s, p) => 0.12 * noise() * p * p * (0.5 + 0.5 * Math.sin(tau * (300 * s + 1900 * s * s))),
  );
}
const echo = Math.round(0.375 * rate);
for (let i = echo; i < total; i++) {
  left[i] += 0.12 * right[i - echo];
  right[i] += 0.12 * left[i - echo];
}
const buffer = Buffer.alloc(44 + total * 4);
buffer.write('RIFF');
buffer.writeUInt32LE(36 + total * 4, 4);
buffer.write('WAVEfmt ', 8);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(2, 22);
buffer.writeUInt32LE(rate, 24);
buffer.writeUInt32LE(rate * 4, 28);
buffer.writeUInt16LE(4, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(total * 4, 40);
for (let i = 0; i < total; i++) {
  const fade = Math.min(1, (total - i) / rate);
  buffer.writeInt16LE(Math.round(Math.tanh(left[i]) * fade * 32700), 44 + i * 4);
  buffer.writeInt16LE(Math.round(Math.tanh(right[i]) * fade * 32700), 46 + i * 4);
}
mkdirSync('out', { recursive: true });
writeFileSync('out/raw.wav', buffer);
const result = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-i',
    'out/raw.wav',
    '-af',
    'acompressor=threshold=0.08:ratio=6:attack=1:release=80,loudnorm=I=-12:TP=-2:LRA=6',
    '-ar',
    '48000',
    'public/score.wav',
  ],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Generated ${DURATION + PRE}s score from ${EVENTS.length} shared events.`);
