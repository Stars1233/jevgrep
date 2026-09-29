import { bundle } from '@remotion/bundler';
import { openBrowser, selectComposition, renderStill } from '@remotion/renderer';
import { mkdirSync, readFileSync } from 'node:fs';
const timing = JSON.parse(readFileSync(new URL('../src/timing.json', import.meta.url)));
const serveUrl = await bundle({ entryPoint: 'src/index.ts' });
const browser = await openBrowser('chrome', { chromiumOptions: { gl: 'angle' } });
const composition = await selectComposition({
  serveUrl,
  id: 'Release',
  puppeteerInstance: browser,
});
mkdirSync('out/review-3d', { recursive: true });
try {
  for (const [i, t] of timing.reviews.entries()) {
    await renderStill({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      frame: Math.round(t * timing.fps),
      scale: 0.5,
      output: `out/review-3d/frame-${String(i).padStart(2, '0')}.png`,
    });
    console.log(`Frame ${i}: ${t}s`);
  }
} finally {
  await browser.close({ silent: true });
}
