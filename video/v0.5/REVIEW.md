# Release film verification

The delivered film uses the full 3D cargo-facility treatment requested by the
user, replacing the initial vector study. It retains the release's accounting
caveats and makes no speed claim.

## Rendered-frame review

A fresh visual reviewer inspected every shot through 18 chronological rendered
captures, with direct inspection of the individual frames as well as contact
sheets. The review led to these changes:

- Pulled the batching camera back and placed the manifest in front of the gantry.
- Moved the 8/10 result into the disclosure overlay so the camera cannot hide it.
- Raised the scanner sign clear of its beam.
- Routed reference cables to separate card edges, away from the title, and
  brought the foreground node fully into frame.
- Reduced text bevels and separated label brightness from emissive edge lighting.
- Reduced bloom and made the large type metallic rather than uniformly emissive.

The reviewer accepted the revised graph, scanner, proof and central batching
frames. The extracted master frames at both ends of the batching shot also show the
entire manifest in front of the gantry. Every shot was inspected again in the
final encoded master, using the same 18-frame capture set. The independent
reviewer also inspected all 18 final captures and found no blocking defects.

Foreground clipping on the conveyor is intentional depth framing. The closing
command monitor intentionally occupies the foreground while the 3D world keeps
moving behind it. The key-art still uses the complete benchmark disclosure.

## Code review

Independent Codex review found three issues, all addressed: absolute effect time
now makes grain independent of rendering history; a failed ffmpeg launch exits
music generation unsuccessfully; the benchmark citation resolves inside the
repository. TypeScript checking passes. No product code or benchmark runs changed.

## Audio and delivery

The original stereo score was checked by measurement and spectrogram, **not by
ear**. The normalized WAV measures −13.5 LUFS integrated, 1.6 LU loudness range,
and −1.2 dBFS true peak. The spectrogram shows the risers ending at the scene
boundaries plus the shared 0.3-second preview offset. The final AAC measures −13.5 LUFS integrated, 1.6 LU loudness range, and
−0.8 dBFS true peak. No clipping is indicated.

The master contains 2,178 H.264 frames at 1920×1080 and 60 fps (36.3 seconds of
picture), stereo AAC averaging 317 kbps from a 320k target, and a 36.352-second
container duration including AAC padding. Separate `thumbnail.png` and
`key-art.png` files accompany the local master. Render captures and measurement
logs remain under ignored `out/`; the package sources are committed.
