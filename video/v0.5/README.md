# Jevgrep 0.5.0 — The source terminal

A 36.3-second release film set in a 3D automated cargo facility. Metallic source
cartridges pass a laser scanner, share a batch manifest, and travel along glowing
reference routes. Flying cameras, textured metal, shadows, bloom, ambient
occlusion and depth of field replace the previous films' ivory editorial style.

This is a standalone Remotion package outside the product workspace. Run these
commands from this directory, with Node.js and ffmpeg installed:

```sh
npm ci
npm run studio
npm run draft
npm run render
npm run poster
npm run check-types
node scripts/stills.mjs
```

Run `npm run music` before Studio or still rendering on a fresh checkout.
The master is `out/jevgrep-0.5.0.mp4`: 1920×1080, 60 fps, H.264 CRF 14, 320k AAC.
`out/key-art.png` is the separate benchmark still. The video opens on a completed
command for 0.3 seconds so feeds can capture the product doing its job. Generated
audio and renders stay ignored; source and font licenses are committed.

## Picture and sound share time

`src/timing.json` owns scene boundaries, review frames, camera travel and impact
cues. Both the picture and the original synthesized soundtrack read it. Audio
starts after the same preview hold as the picture. The music script requires
ffmpeg for loudness normalization. Its stereo score uses synthesized bass,
chords, arpeggios, percussion, risers and timed impacts; no stock samples.

Verify the mix with ffmpeg's `ebur128=peak=true` and `showspectrumpic` filters.
Audio review is by measurement and spectrogram, **not by ear**.

## Claims that must stay attached

The source is the repository's
[combined-cost report](../../evals/results/combined-cost-research-2026-09-28.md).
The headline is **59% lower native Jev cost**, rounded conservatively from 59.24%,
with 8/10 official solves in both versions. The comparison is the saved 0.4.3
cohort, not agents alone. The same 10 tuned Python SWE-bench tasks were used.
Native charges are list-price estimates with a conservative allowance for 19
missing responses. Combined Sol + Jev cost was 2–3% higher; the film shows that
tradeoff prominently. There is no speed or statistical-equivalence claim.

128 is a maximum declaration-unit batch size, not a universal batch size or
request-count reduction. Preview admission can miss relevant source beyond a
negative preview. The scanner shot includes that limitation.

The monitor reconstructs an actual 0.5.0 search of `packages/core`, showing three
of the 13 returned paths. The cargo artwork illustrates the mechanism; it is
not a literal inventory of files or classifications. The closing `jg skill`
command installs the agent skill, alongside CLI installation and authentication.

See `DIRECTION.md` for the shot direction and `REVIEW.md` for verification.
Inter and JetBrains Mono use their adjacent font licenses. The Three.js display
font includes its license metadata in `src/three/display-font.json`.
