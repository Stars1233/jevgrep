import React, { useLayoutEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  cancelRender,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { Scene } from './three/Scene';
import T from './timing.json';
const mono = 'JetBrains Mono',
  sans = 'Inter';
function useFonts() {
  const [h] = useState(() => delayRender('Load vendored fonts'));
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    Promise.all(
      [
        ['Inter', 'Inter-600-latin.woff2'],
        ['JetBrains Mono', 'JetBrainsMono-500-latin.woff2'],
      ].map(async ([n, f]) => {
        const font = new FontFace(n, `url(${staticFile('fonts/' + f)})`);
        await font.load();
        document.fonts.add(font);
      }),
    )
      .then(() => setReady(true))
      .catch(cancelRender);
  }, []);
  useLayoutEffect(() => {
    if (ready) continueRender(h);
  }, [ready, h]);
  return ready;
}
function Monitor({ poster = false }: { poster?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 100,
        top: poster ? 390 : 480,
        width: 725,
        padding: '28px 32px',
        background: 'rgba(7,16,33,.88)',
        border: '1px solid #566b98',
        borderLeft: '4px solid #caff47',
        boxShadow: '0 20px 80px #000a',
        fontFamily: mono,
        fontSize: 22,
        lineHeight: 1.7,
        transform: 'perspective(1800px) rotateY(-5deg)',
      }}
    >
      <div style={{ color: '#caff47', fontSize: 20, marginBottom: 12 }}>
        jg / RECORDED SOURCE SEARCH
      </div>
      <div>
        $ jg "How does file preview relevance
        <br />
        control which source files are opened
        <br />
        and selected?" packages/core
      </div>
      <div style={{ marginTop: 18, color: '#caff47' }}>13 relevant files.</div>
      <div>
        src/selection.ts
        <br />
        assets/python/preview.py
        <br />
        src/retrieve.ts
      </div>
      <div style={{ fontSize: 16, color: '#97aace', marginTop: 14 }}>
        First 3 returned paths shown.
      </div>
    </div>
  );
}
function Overlays({ stage, t, poster = false }: { stage: number; t: number; poster?: boolean }) {
  return (
    <AbsoluteFill style={{ color: '#eff6ff', fontFamily: sans, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 58,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: mono,
          fontSize: 26,
          textShadow: '0 4px 16px #000',
        }}
      >
        <span>{poster ? 'FIND CODE BY WHAT IT DOES.' : T.shots[stage].header}</span>
        <span style={{ color: '#caff47' }}>JEVGREP / 0.5.0</span>
      </div>
      {stage === 0 && !poster && (
        <div
          style={{
            position: 'absolute',
            left: 95,
            bottom: 110,
            fontSize: 48,
            fontWeight: 700,
            textShadow: '0 4px 28px #000',
          }}
        >
          Find the code.
          <br />
          <span style={{ color: '#caff47' }}>Keep the context.</span>
        </div>
      )}
      {stage === 1 && (
        <div
          style={{
            position: 'absolute',
            left: 90,
            bottom: 52,
            fontSize: 25,
            background: '#030713b8',
            padding: '13px 20px',
          }}
        >
          A negative preview can miss relevant code later in the file.
        </div>
      )}
      {stage === 2 && (
        <div
          style={{
            position: 'absolute',
            right: 115,
            bottom: 110,
            textAlign: 'right',
            textShadow: '0 4px 30px #000',
          }}
        >
          <div style={{ fontFamily: mono, fontSize: 22 }}>UP TO</div>
          <div style={{ fontFamily: mono, color: '#caff47', fontSize: 130, lineHeight: 1.1 }}>
            128
          </div>
          <div style={{ fontSize: 26 }}>code units per batch</div>
        </div>
      )}
      {stage === 4 && (
        <div
          style={{
            position: 'absolute',
            left: 90,
            right: 90,
            bottom: 38,
            textShadow: '0 3px 12px #000',
            background: 'linear-gradient(0deg,#030713f0,#030713b0)',
            padding: 24,
          }}
        >
          <div style={{ fontSize: 34, marginBottom: 17 }}>
            Combined agent + Jev cost: <span style={{ color: '#caff47' }}>2–3% higher.</span>
          </div>
          <div style={{ fontSize: 23, lineHeight: 1.6 }}>
            8/10 solved in both versions · 10 tuned Python SWE-bench tasks · vs saved 0.4.3 · native
            Jev cost estimate*
            <br />
            No speed or statistical-equivalence claim.
          </div>
          <div style={{ fontSize: 19, marginTop: 8, color: '#b5c5e0' }}>
            *Includes a conservative allowance for 19 missing native responses. Methodology:
            github.com/dzhng/jevgrep → evals
          </div>
        </div>
      )}
      {(stage === 5 || poster) && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 90,
              top: poster ? 190 : 210,
              fontWeight: 700,
              fontSize: 100,
              letterSpacing: -6,
              textShadow: '0 4px 35px #000',
            }}
          >
            jevgrep
          </div>
          <div
            style={{
              position: 'absolute',
              left: 95,
              top: 340,
              fontSize: 40,
              textShadow: '0 4px 25px #000',
            }}
          >
            Less to Jev.
            <br />
            Source to your agent.
          </div>
          <Monitor poster={poster} />
          <div
            style={{
              position: 'absolute',
              left: 95,
              bottom: 145,
              fontFamily: mono,
              fontSize: 27,
              textShadow: '0 4px 20px #000',
            }}
          >
            npm install -g @dzhng/jevgrep
            <br />
            <span style={{ color: '#caff47' }}>jg auth → jg skill</span>
          </div>
          <div
            style={{ position: 'absolute', left: 95, bottom: 65, fontFamily: mono, fontSize: 23 }}
          >
            github.com/dzhng/jevgrep
          </div>
        </>
      )}
    </AbsoluteFill>
  );
}
export function Film() {
  const ready = useFonts();
  const frame = useCurrentFrame();
  const sec = frame / T.fps;
  const pre = sec < T.preroll;
  const t = Math.max(0, sec - T.preroll);
  let stage = T.shots.findIndex(s => t >= s.at && t < s.end);
  if (stage < 0) stage = 5;
  const local = t - T.shots[stage].at;
  return (
    <AbsoluteFill style={{ background: '#030611' }}>
      <Audio src={staticFile('score.wav')} />
      {ready && (
        <>
          <Scene stage={pre ? 5 : stage} t={pre ? 5 : local} frame={pre ? 0 : frame} />
          <Overlays stage={pre ? 5 : stage} t={local} poster={pre} />
        </>
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 100px #0006',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
export function KeyArt() {
  const ready = useFonts();
  return (
    <AbsoluteFill style={{ background: '#030611' }}>
      {ready && (
        <>
          <Scene stage={4} t={4} frame={1500} />
          <Overlays stage={4} t={4} />
        </>
      )}
    </AbsoluteFill>
  );
}
