import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { REVIEW, IMPACT_REVIEW, PRE } from '../src/timeline.ts';
const input = process.argv[2] ?? 'out/draft.mp4';
function ff(args) {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}
for (const [name, times] of [
  ['review', REVIEW],
  ['impacts', IMPACT_REVIEW.map(t => t + PRE)],
]) {
  mkdirSync(`out/${name}`, { recursive: true });
  for (const [i, t] of times.entries())
    ff([
      '-ss',
      String(t),
      '-i',
      input,
      '-frames:v',
      '1',
      `out/${name}/${String(i).padStart(2, '0')}.png`,
    ]);
  for (let offset = 0; offset < times.length; offset += 6)
    ff([
      '-start_number',
      String(offset),
      '-i',
      `out/${name}/%02d.png`,
      '-vf',
      'scale=640:360,tile=3x2',
      '-frames:v',
      '1',
      `out/${name}-${offset}.png`,
    ]);
}
ff(['-i', input, '-frames:v', '1', 'out/thumbnail.png']);
