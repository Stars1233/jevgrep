import React, { useLayoutEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  cancelRender,
  staticFile,
  useCurrentFrame,
  spring,
} from 'remotion';
import T from './timing.json';
const C = { paper: '#f4f0e6', ink: '#151515', red: '#f05235', blue: '#a9c6df', grey: '#8b877e' };
const serif = 'Fraunces',
  sans = 'Inter',
  mono = 'JetBrains Mono';
const cl = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => 1 - (1 - cl(v)) ** 3;
const ramp = (t: number, a: number, d = 0.5) => ease((t - a) / d);
const sp = (t: number, a: number, damping = 13) =>
  spring({ frame: (t - a) * 60, fps: 60, config: { damping, stiffness: 220, mass: 0.65 } });
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 81.7) * 43758.5453;
  return x - Math.floor(x);
};
const hit = (t: number, a: number) => (t < a ? 0 : Math.exp(-(t - a) * 12));
const pos = (x: number, y: number): React.CSSProperties => ({
  position: 'absolute',
  left: x,
  top: y,
});
function useFonts() {
  const [h] = useState(() => delayRender('Vendored fonts'));
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    Promise.all(
      [
        ['Inter', 'Inter-600-latin.woff2'],
        ['JetBrains Mono', 'JetBrainsMono-500-latin.woff2'],
        ['Fraunces', 'Fraunces-900-latin.woff2'],
      ].map(async ([n, f]) => {
        const font = new FontFace(n, `url(${staticFile('fonts/' + f)})`, {
          weight: n === 'Fraunces' ? '900' : '600',
        });
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
function Burst({
  t,
  at,
  x = 960,
  y = 520,
  color = C.red,
}: {
  t: number;
  at: number;
  x?: number;
  y?: number;
  color?: string;
}) {
  const dt = t - at;
  if (dt < 0 || dt > 1.2) return null;
  return (
    <svg width="1920" height="1080" style={pos(0, 0)}>
      {Array.from({ length: 32 }, (_, i) => {
        const a = (i / 32) * Math.PI * 2,
          r = 180 + ease(dt) * 1000,
          tail = r - 150 * (1 - cl(dt));
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * tail}
            y1={y + Math.sin(a) * tail}
            x2={x + Math.cos(a) * r}
            y2={y + Math.sin(a) * r}
            stroke={color}
            strokeWidth={6 * (1 - cl(dt))}
          />
        );
      })}
      <circle
        cx={x}
        cy={y}
        r={ease(dt) * 1100}
        fill="none"
        stroke={color}
        strokeWidth={30 * (1 - cl(dt))}
      />
    </svg>
  );
}
function Confetti({ t, at }: { t: number; at: number }) {
  const d = t - at;
  if (d < 0 || d > 2) return null;
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const a = rnd(i) * 6.28,
          v = 350 + rnd(i + 90) * 1100,
          x = 960 + Math.cos(a) * v * (1 - Math.exp(-d * 2)),
          y = 450 + Math.sin(a) * v * d + 450 * d * d;
        return (
          <div
            key={i}
            style={{
              ...pos(x, y),
              width: 12 + rnd(i + 30) * 22,
              height: 10,
              background: [C.red, C.ink, C.blue][i % 3],
              transform: `rotate(${d * (rnd(i + 8) - 0.5) * 900}deg)`,
              opacity: cl(2 - d),
            }}
          />
        );
      })}
    </>
  );
}
function Word({
  text,
  t,
  at,
  size = 190,
  color = C.ink,
}: {
  text: string;
  t: number;
  at: number;
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        fontFamily: serif,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: -size * 0.055,
        lineHeight: 1,
        color,
      }}
    >
      {[...text].map((c, i) => {
        const s = sp(t, at + i * 0.045);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: cl(s * 4),
              transform: `translateY(${(1 - s) * -360}px) rotate(${(1 - s) * (i % 2 ? 16 : -16)}deg) scaleY(${1 + hit(t, at + i * 0.045 + 0.15) * 0.12})`,
            }}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
}
function Sheet({
  x,
  y,
  r = 0,
  s = 1,
  selected = false,
  opacity = 1,
}: {
  x: number;
  y: number;
  r?: number;
  s?: number;
  selected?: boolean;
  opacity?: number;
}) {
  return (
    <div
      style={{
        ...pos(x, y),
        width: 190,
        height: 250,
        background: selected ? C.paper : '#dcd7cc',
        border: `3px solid ${C.ink}`,
        borderRadius: 8,
        boxShadow: '12px 14px 0 #0002',
        transform: `translate(-50%,-50%) rotate(${r}deg) scale(${s})`,
        opacity,
      }}
    >
      <div style={{ margin: 22, width: 50, height: 14, background: selected ? C.red : C.ink }} />
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          style={{
            margin: '15px 22px',
            height: 7,
            width: 80 + (i % 3) * 22,
            background: selected && i === 3 ? C.red : '#88867f',
          }}
        />
      ))}
    </div>
  );
}
function Intro({ t }: { t: number }) {
  const E = T.events.intro;
  const exit = ramp(t, E.exit, 0.5);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div
        style={{
          ...pos(960, 540),
          transform: `translate(-50%,-50%) rotate(${-3 + exit * 12}deg) scale(${1 + exit * 3})`,
          opacity: 1 - exit,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 37,
            letterSpacing: 9,
            marginBottom: 25,
            transform: `translateX(${(1 - sp(t, E.introducing)) * -600}px)`,
          }}
        >
          INTRODUCING
        </div>
        <Word text="jevgrep" t={t} at={E.word} size={260} />
        <div
          style={{
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 245,
            lineHeight: 1,
            color: C.red,
            textAlign: 'right',
            transform: `scale(${sp(t, E.version)}) rotate(-5deg)`,
          }}
        >
          0.5<span style={{ fontSize: 100 }}>●</span>
        </div>
      </div>
      <Burst t={t} at={E.version} />
      <Confetti t={t} at={E.version} />
      <div
        style={{
          ...pos(110, 920),
          fontFamily: mono,
          fontSize: 25,
          letterSpacing: 2,
          opacity: ramp(t, E.caption),
        }}
      >
        NATURAL-LANGUAGE CODE SEARCH FOR AGENTS
      </div>
      <div
        style={{
          ...pos(1550, 650),
          width: 180,
          height: 180,
          border: `3px solid ${C.red}`,
          borderRadius: '50%',
          transform: `scale(${sp(t, E.badge)}) rotate(${t * 50}deg)`,
        }}
      >
        <div
          style={{ ...pos(27, 57), fontFamily: serif, fontWeight: 900, fontSize: 52, color: C.red }}
        >
          jg ↗
        </div>
      </div>
    </AbsoluteFill>
  );
}
function Proof({ t }: { t: number }) {
  const E = T.events.proof;
  const cut = sp(t, E.cut),
    settle = ramp(t, E.settle, 1);
  const shake = hit(t, E.cut) * 12;
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div
        style={{
          ...pos(0, 0),
          width: 1920,
          height: 1080,
          transform: `translate(${Math.sin(t * 90) * shake}px,${Math.cos(t * 80) * shake}px)`,
        }}
      >
        <div style={{ ...pos(100, 105), fontFamily: mono, fontSize: 28, letterSpacing: 5 }}>
          JEVGREP 0.5
        </div>
        <div
          style={{
            ...pos(95, 200),
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 400,
            lineHeight: 1,
            letterSpacing: -24,
            color: C.red,
            transformOrigin: 'left center',
            transform: `scale(${2.3 - 1.3 * sp(t, E.number)}) rotate(${-5 + settle * 5}deg)`,
          }}
        >
          59%
        </div>
        <div
          style={{
            ...pos(990, 285),
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 93,
            lineHeight: 1.08,
            letterSpacing: -4,
            transform: `translateX(${(1 - sp(t, E.cut)) * 700}px)`,
          }}
        >
          less
          <br />
          Jev API cost.
        </div>
        <div style={{ ...pos(110, 654), width: 1640, height: 24, background: '#ddd7cb' }}>
          <div style={{ width: '41%', height: '100%', background: C.red }} />
          {Array.from({ length: 12 }, (_, i) => {
            const dt = Math.max(0, t - E.cut);
            return (
              <div
                key={i}
                style={{
                  ...pos(672 + i * 80, 0),
                  width: 77,
                  height: 24,
                  background: C.ink,
                  transform: `translate(${cut * (70 + i * 17)}px,${cut * (-180 - rnd(i) * 170) + Math.max(0, dt - 0.25) ** 2 * 700}px) rotate(${dt * (rnd(i + 20) - 0.5) * 360}deg)`,
                  opacity: 1 - cl((dt - 0.8) / 0.4),
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            ...pos(110, 730),
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 94,
            letterSpacing: -3,
            transform: `translateY(${(1 - sp(t, E.same)) * 180}px)`,
            opacity: cl(sp(t, E.same)),
          }}
        >
          same performance<span style={{ color: C.red }}>.</span>
        </div>
      </div>
      <Burst t={t} at={E.cut} />
      <Confetti t={t} at={E.cut} />
    </AbsoluteFill>
  );
}
function Preview({ t }: { t: number }) {
  const E = T.events.preview;
  const pick = ramp(t, E.select, 0.5),
    zoom = ramp(t, E.exit, 0.5);
  return (
    <AbsoluteFill style={{ background: C.ink, color: C.paper, overflow: 'hidden' }}>
      <div
        style={{
          ...pos(100, 100),
          fontFamily: serif,
          fontWeight: 900,
          fontSize: 102,
          letterSpacing: -4,
        }}
      >
        Preview. Pick. Read.
      </div>
      <div
        style={{
          ...pos(0, 0),
          width: 1920,
          height: 1080,
          transform: `scale(${1 + zoom * 3})`,
          transformOrigin: '960px 565px',
          opacity: 1 - zoom,
        }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const selected = i === 4;
          const x = 300 + i * 165;
          return (
            <Sheet
              key={i}
              x={x + (selected ? 0 : (i < 4 ? -1 : 1) * pick * 500)}
              y={560 + Math.sin(i * 0.8) * 65 + (selected ? 0 : pick * 180)}
              r={(i - 4) * 7 * (1 - pick)}
              s={selected ? 1 + pick * 0.7 : 1}
              selected={selected}
              opacity={1 - (selected ? 0 : pick * 0.85)}
            />
          );
        })}
        <div
          style={{
            ...pos(290 + ramp(t, E.scan, E.select - E.scan) * 670, 370),
            width: 280,
            height: 300,
            border: `9px solid ${C.red}`,
            borderRadius: '50%',
            opacity: 1 - ramp(t, E.select, 0.3),
            transform: 'rotate(-18deg)',
          }}
        >
          <div
            style={{
              ...pos(250, 245),
              width: 22,
              height: 140,
              background: C.red,
              transform: 'rotate(-38deg)',
            }}
          />
        </div>
        <div
          style={{
            ...pos(1100, 455),
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: C.red,
            color: C.paper,
            fontSize: 93,
            textAlign: 'center',
            transform: `scale(${sp(t, E.stamp)}) rotate(-12deg)`,
          }}
        >
          ✓
        </div>
      </div>
      <Burst t={t} at={E.stamp} color={C.blue} />
    </AbsoluteFill>
  );
}
function Batch({ t }: { t: number }) {
  const E = T.events.batch;
  const merge = ramp(t, E.merge, E.stamp - E.merge),
    send = ramp(t, E.exit, 0.5);
  return (
    <AbsoluteFill style={{ background: C.blue, overflow: 'hidden' }}>
      <div
        style={{
          ...pos(100, 100),
          fontFamily: serif,
          fontWeight: 900,
          fontSize: 97,
          letterSpacing: -4,
        }}
      >
        More code. One shared brief.
      </div>
      <div
        style={{
          transform: `translateX(${send * 2400}px) rotate(${send * 8}deg)`,
          transformOrigin: '50% 50%',
          width: 1920,
          height: 1080,
        }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const sx = 300 + (i % 6) * 245,
            sy = 430 + Math.floor(i / 6) * 320;
          return (
            <Sheet
              key={i}
              x={sx + (830 - sx) * merge + (i - 5.5) * 5 * merge}
              y={sy + (570 - sy) * merge - i * 2 * merge}
              r={(1 - merge) * (rnd(i) - 0.5) * 20}
              s={1 + merge * 0.5}
              selected={i === 11}
            />
          );
        })}
        <div
          style={{
            ...pos(1110, 380),
            width: 420,
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 200,
            lineHeight: 0.9,
            color: C.ink,
            transform: `scale(${sp(t, E.count)}) rotate(-5deg)`,
          }}
        >
          128
          <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: 1, marginTop: 25 }}>
            UNITS / BATCH · UP TO
          </div>
        </div>
        <div
          style={{
            ...pos(500, 700),
            padding: '18px 38px',
            border: `4px solid ${C.ink}`,
            background: C.red,
            color: C.paper,
            fontFamily: mono,
            fontSize: 33,
            transform: `rotate(-9deg) scale(${sp(t, E.stamp)})`,
          }}
        >
          ONE SHARED BRIEF
        </div>
      </div>
      <Burst t={t} at={E.stamp} />
    </AbsoluteFill>
  );
}
function Terminal({ t, poster = false }: { t: number; poster?: boolean }) {
  const E = T.events.terminal;
  const enter = poster ? 1 : sp(t, E.enter);
  const out = poster ? 1 : ramp(t, E.results, 0.6);
  const titleScale = poster ? 1 : 1 + hit(t, 0) * 0.12;
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      {poster && (
        <div style={{ ...pos(105, 48), fontFamily: mono, fontSize: 26, letterSpacing: 5 }}>
          INTRODUCING
        </div>
      )}
      <div
        style={{
          ...pos(100, 100),
          fontFamily: serif,
          fontWeight: 900,
          fontSize: 115,
          letterSpacing: -6,
          transform: `scale(${titleScale})`,
          transformOrigin: 'left',
        }}
      >
        jevgrep <span style={{ color: C.red }}>0.5</span>
      </div>
      <div style={{ ...pos(106, 252), fontFamily: sans, fontSize: 37 }}>
        Find code by what it does.
      </div>
      <div
        style={{
          ...pos(100, 362),
          width: 1720,
          height: 415,
          background: C.ink,
          borderRadius: 16,
          color: C.paper,
          boxShadow: '0 24px 45px #0003',
          transform: `translateY(${(1 - enter) * 350}px) rotate(${(1 - enter) * 8}deg)`,
        }}
      >
        <div
          style={{
            padding: '20px 34px',
            borderBottom: '1px solid #ffffff25',
            fontFamily: mono,
            fontSize: 18,
            color: '#9b978d',
          }}
        >
          <span style={{ color: C.red }}>●</span> ● ● &nbsp; jg / recorded search
        </div>
        <div style={{ padding: '27px 40px', fontFamily: mono, fontSize: 27, lineHeight: 1.65 }}>
          <div>
            <span style={{ color: C.red }}>$</span> jg "How does file preview relevance control
            which source files
            <br /> &nbsp; are opened and selected?" packages/core
          </div>
          <div style={{ opacity: out }}>
            <span style={{ color: C.red }}>13 relevant files.</span>
            <br />
            src/selection.ts &nbsp; · &nbsp; assets/python/preview.py &nbsp; · &nbsp;
            src/retrieve.ts
            <div style={{color: C.grey}}>…</div>
          </div>
        </div>
      </div>
      <div
        style={{
          ...pos(105, 837),
          fontFamily: mono,
          fontSize: 34,
          opacity: poster ? 1 : ramp(t, E.install),
        }}
      >
        npm install -g @dzhng/jevgrep <span style={{ color: C.red }}>→ jg auth → jg skill</span>
      </div>
      <div style={{ ...pos(105, 948), fontFamily: mono, fontSize: 26 }}>
        github.com/dzhng/jevgrep
      </div>
      <div
        style={{
          ...pos(1500, 920),
          fontFamily: serif,
          fontWeight: 900,
          fontSize: 56,
          color: C.red,
          transform: `rotate(-5deg) scale(${poster ? 1 : sp(t, E.cta)})`,
        }}
      >
        go find it. ↗
      </div>
    </AbsoluteFill>
  );
}
function Grain({ frame }: { frame: number }) {
  return (
    <svg
      width="1920"
      height="1080"
      style={{ ...pos(0, 0), opacity: 0.075, pointerEvents: 'none', mixBlendMode: 'multiply' }}
    >
      <filter id="grain">
        <feTurbulence baseFrequency=".8" numOctaves={2} seed={Math.floor(frame / 3) % 23} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
export function Film() {
  const ready = useFonts();
  const frame = useCurrentFrame(),
    sec = frame / T.fps,
    pre = sec < T.preroll,
    t = Math.max(0, sec - T.preroll);
  const stage = Math.max(
      0,
      T.shots.findIndex(s => t >= s.at && t < s.end),
    ),
    local = t - T.shots[stage].at;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Audio src={staticFile('score.wav')} />
      {ready &&
        (pre ? (
          <Terminal t={5} poster />
        ) : stage === 0 ? (
          <Intro t={local} />
        ) : stage === 1 ? (
          <Proof t={local} />
        ) : stage === 2 ? (
          <Preview t={local} />
        ) : stage === 3 ? (
          <Batch t={local} />
        ) : (
          <Terminal t={local} />
        ))}
      <Grain frame={frame} />
      {!pre && (
        <div style={{ ...pos(100, 1030), width: 1720, height: 3, background: '#8883' }}>
          <div style={{ width: `${(t / T.duration) * 100}%`, height: 3, background: C.red }} />
        </div>
      )}
    </AbsoluteFill>
  );
}
export function KeyArt() {
  const ready = useFonts();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {ready && <Proof t={3} />}
      <Grain frame={0} />
    </AbsoluteFill>
  );
}
