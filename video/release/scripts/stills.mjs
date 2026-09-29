import { bundle } from '@remotion/bundler';
import { openBrowser, selectComposition, renderStill } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import { REVIEW, IMPACT_REVIEW, FPS, PRE } from '../src/timeline.ts';
const serveUrl = await bundle({ entryPoint: 'src/index.tsx' }),
  browser = await openBrowser('chrome');
try {
  const composition = await selectComposition({
    serveUrl,
    id: 'Release',
    puppeteerInstance: browser,
  });
  for (const [name, times] of [
    ['review', REVIEW],
    ['impacts', IMPACT_REVIEW.map(t => t + PRE)],
  ]) {
    mkdirSync(`out/${name}`, { recursive: true });
    for (const [i, time] of times.entries()) {
      await renderStill({
        serveUrl,
        composition,
        puppeteerInstance: browser,
        frame: Math.round(time * FPS),
        scale: 0.5,
        output: `out/${name}/${String(i).padStart(2, '0')}.png`,
      });
      console.log(name, i, time);
    }
  }
  const poster = await selectComposition({ serveUrl, id: 'Poster', puppeteerInstance: browser });
  await renderStill({
    serveUrl,
    composition: poster,
    puppeteerInstance: browser,
    output: 'out/key-art.png',
  });
} finally {
  await browser.close({ silent: true });
}
