# Jevgrep 0.5 — magnetic search field

An 18-second release film: a brief cost result, two concrete savings mechanisms,
and the installation commands. Previews avoid unnecessary full reads; larger
code batches share one relevance brief. Local object motion follows the beat,
with no full-screen red wash, edge pulse or red wipe.

This standalone package is outside the CLI workspace. Node.js 24 and ffmpeg are
required. From this directory:

```sh
npm ci
npm run music
npm run studio
npm run draft
npm run stills
npm run render
npm run check-types
```

The master is `out/jevgrep-0.5-short.mp4`, rendered at 1080p60 with H.264 CRF 14 and
320k AAC. Generated media and dependencies are ignored. Font licenses accompany
the vendored Anton and IBM Plex Mono files.

## Sound and motion are one schedule

`src/timeline.ts` defines beats, accents and scene cues. Both the synthesized
score and picture consume its events. Kick and snare envelopes drive visible
scene effects continuously; accents drive the larger transformations. The
0.3-second thumbnail pre-roll shifts picture and sound together.

Review every shot and the before/on/after-impact sequences. A pretty still is
not evidence of dynamic motion. `npm run stills` captures both sets plus key art.
Check audio loudness and its spectrogram; audio is measured, not auditioned.

## Claim sources

The [retained benchmark report](../../evals/results/combined-cost-research-2026-09-28.md)
compares the saved 0.4.3 cohort with the accepted 0.5 strategy. Estimated native
Jev API cost is 59.24% lower, rounded to 59%; coding-agent costs are outside that
headline. Both versions solved 8/10 of the same ten tuned Python SWE-bench tasks.
“Same performance” refers to those task results, not speed or statistical
equivalence. Native prices are estimates, including a conservative allowance
for 19 missing responses. Methodology stays in these supporting docs, not in
the marketing frames.

The opening thumbnail reproduces an installed-CLI search run on this repository:
`jg "How are previews used to decide which files to open?" packages/core`.
It returned 17 files; the displayed first three paths are followed by an
ellipsis. Source-strip artwork illustrates retrieval rather than a literal
inventory of every request. The install sequence includes authentication and
the official skill because agents need that setup to use the CLI.
