import React, { useLayoutEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { Field } from './Field';
import { CUE, DURATION, FPS, PRE, clamp, progress, pulse } from './timeline';
const RED = '#ff3e2b',
  WHITE = '#f2f7fa',
  BLUE = '#87eaff';
const at = (left: number, top: number): React.CSSProperties => ({
  position: 'absolute',
  left,
  top,
});
const bounce = (t: number, when: number) =>
  spring({ frame: (t - when) * FPS, fps: FPS, config: { mass: 0.6, stiffness: 320, damping: 18 } });
function useFonts() {
  const [h] = useState(() => delayRender('Load fonts'));
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    Promise.all(
      [
        ['Display', 'Anton.ttf'],
        ['Mono', 'Mono.ttf'],
      ].map(async ([name, file]) => {
        const f = new FontFace(name, `url(${staticFile('fonts/' + file)})`);
        await f.load();
        document.fonts.add(f);
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
function Label({
  children,
  x = 120,
  y = 130,
  color = WHITE,
}: {
  children: React.ReactNode;
  x?: number;
  y?: number;
  color?: string;
}) {
  return (
    <div style={{ ...at(x, y), fontFamily: 'Mono', fontSize: 28, letterSpacing: 6, color }}>
      {children}
    </div>
  );
}
function HitText({
  text,
  t,
  start,
  x,
  y,
  size,
  color = WHITE,
  width = 1720,
}: {
  text: string;
  t: number;
  start: number;
  x: number;
  y: number;
  size: number;
  color?: string;
  width?: number;
}) {
  const p = bounce(t, start),
    kick = pulse(t, 'kick', 0.1);
  return (
    <div style={{ ...at(x, y), width, overflow: 'hidden', paddingBottom: 20 }}>
      <div
        style={{
          fontFamily: 'Display',
          fontSize: size,
          lineHeight: 1.12,
          letterSpacing: -size * 0.018,
          color,
          whiteSpace: 'nowrap',
          transformOrigin: 'left center',
          transform: `translateY(${(1 - p) * size * 1.3}px) scaleX(${1 + kick * 0.012})`,
          textShadow: `${pulse(t, 'snare', 0.06) * 6}px 0 rgba(255,62,43,.4)`,
        }}
      >
        {text}
      </div>
    </div>
  );
}
function Intro({ t }: { t: number }) {
  const kick = pulse(t, 'kick'),
    depart = progress(t, CUE.claim - 0.3, 0.3);
  const settle = progress(t, CUE.version, 0.55);
  return (
    <AbsoluteFill
      style={{ transform: `scale(${1 + depart * 0.32 + kick * 0.014})`, opacity: 1 - depart }}
    >
      <Label>INTRODUCING</Label>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '110px 250px',
          transform: `scale(${1.5 - settle * 0.5})`,
        }}
      >
        <HitText text="JEVGREP" t={t} start={CUE.name} x={110} y={250} size={290} />
      </div>
      <HitText
        text="0.5"
        t={t}
        start={CUE.version}
        x={110 + (1 - settle) * 850}
        y={580}
        size={290}
        color={RED}
      />
      <div
        style={{
          ...at(1010, 681),
          fontFamily: 'Display',
          fontSize: 70,
          lineHeight: 1.12,
          color: WHITE,
          opacity: progress(t, CUE.version + 0.5),
          transform: `translateX(${(1 - progress(t, CUE.version + 0.5)) * 120}px)`,
        }}
      >
        FIND CODE.
        <br />
        <span style={{ color: BLUE }}>KEEP CONTEXT.</span>
      </div>
      <div style={{ ...at(110, 980), height: 4, width: 1700, background: '#fff2' }}>
        <div
          style={{
            height: 4,
            width: `${clamp(t / 4) * 100}%`,
            background: RED,
            boxShadow: `0 0 ${10 + kick * 30}px ${RED}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
function Proof({ t }: { t: number }) {
  const reframe = progress(t, CUE.fracture, 0.4);
  return (
    <>
      <Label color={BLUE}>JEVGREP 0.5</Label>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '110px 218px',
          transform: `translateX(${(1 - reframe) * 160}px) scale(${1.65 - reframe * 0.65})`,
        }}
      >
        <HitText
          text="59%"
          t={t}
          start={CUE.claim}
          x={110}
          y={218}
          size={445}
          color={RED}
          width={970}
        />
      </div>
      <HitText text="LESS" t={t} start={CUE.fracture} x={1090} y={310} size={120} width={750} />
      <HitText
        text="JEV API COST"
        t={t}
        start={CUE.fracture + 0.12}
        x={1090}
        y={460}
        size={94}
        width={750}
      />
      <HitText text="SAME PERFORMANCE." t={t} start={CUE.parity} x={110} y={888} size={89} />
    </>
  );
}
const paths = ['src/retrieve.ts', 'assets/python/preview.py', 'src/selection.ts'];
function Source({
  index,
  x,
  y,
  scale = 1,
  opacity = 1,
  energy = 0,
}: {
  index: number;
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  energy?: number;
}) {
  return (
    <div
      style={{
        ...at(x, y),
        width: 620,
        height: 190,
        padding: 28,
        boxSizing: 'border-box',
        border: `2px solid ${energy > 0.1 ? WHITE : index === 0 ? RED : BLUE}`,
        background: 'linear-gradient(125deg,#171f2cf5,#090c14f5)',
        boxShadow: `0 0 ${32 + energy * 100}px ${energy > 0.1 ? '#c4f3ffbb' : index === 0 ? '#ff3e2b35' : '#87eaff25'}`,
        transform: `translate(-50%,-50%) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: 'Mono',
          fontSize: 27,
          color: index === 0 ? RED : BLUE,
          marginBottom: 24,
        }}
      >
        {paths[index]}
      </div>
      <div style={{ fontFamily: 'Mono', fontSize: 21, color: WHITE }}>
        {
          [
            'async function withDirectoryContent(',
            'def preview(query,path,text,budget=16384):',
            'export async function selectFile(',
          ][index]
        }
      </div>
      <div style={{ marginTop: 18, height: 4, width: 360, background: '#c1cfdf55' }} />
      <div style={{ marginTop: 12, height: 4, width: 240, background: '#c1cfdf35' }} />
    </div>
  );
}
function Search({ t }: { t: number }) {
  const lock = bounce(t, CUE.lock);
  return (
    <>
      <HitText text="CUT THE NOISE." t={t} start={CUE.search} x={110} y={125} size={125} />
      <div
        style={{
          ...at(120, 310),
          fontFamily: 'Mono',
          fontSize: 34,
          color: BLUE,
          opacity: progress(t, CUE.search + 0.5),
        }}
      >
        “How are previews used to decide which files to open?”
      </div>
      <div style={{ opacity: clamp(lock * 3) }}>
        <Source
          index={0}
          x={960}
          y={660}
          scale={0.5 + lock * 0.85}
          energy={pulse(t, 'accent', 0.1)}
        />
        <div
          style={{
            ...at(1315, 540),
            width: 112,
            height: 112,
            borderRadius: '50%',
            background: RED,
            color: WHITE,
            fontFamily: 'Display',
            fontSize: 74,
            textAlign: 'center',
            lineHeight: '112px',
            transform: `scale(${bounce(t, CUE.lock)})`,
          }}
        >
          ✓
        </div>
      </div>
    </>
  );
}
function Context({ t }: { t: number }) {
  const enter = progress(t, CUE.context, 0.4),
    collect = progress(t, CUE.collect, 0.8),
    depart = progress(t, CUE.terminal - 0.35, 0.35);
  const coords = [
    [440, 510],
    [1430, 540],
    [960, 820],
  ];
  return (
    <>
      <HitText text="KEEP THE CONTEXT." t={t} start={CUE.context} x={110} y={125} size={122} />
      {coords.map(([x, y], i) => (
        <Source
          key={i}
          index={i}
          x={x + (960 - x) * collect}
          y={y + (620 - y) * collect + i * 9 * collect}
          scale={(0.6 + enter * 0.4) * (1 + collect * 0.65 + depart * 5)}
          opacity={(1 - depart) * (i === 0 ? 1 : clamp(1 - collect * 4))}
        />
      ))}
      <div
        style={{
          ...at(120, 945),
          fontFamily: 'Display',
          fontSize: 47,
          color: BLUE,
          opacity: collect * (1 - depart),
        }}
      >
        THE RIGHT SOURCE. READY FOR YOUR AGENT.
      </div>
    </>
  );
}
function Terminal({ t, thumb = false }: { t: number; thumb?: boolean }) {
  const entrance = thumb ? 1 : bounce(t, CUE.terminal),
    result = thumb ? 1 : progress(t, CUE.results, 0.45),
    cta = thumb ? 0 : progress(t, CUE.install, 0.5);
  return (
    <>
      <div
        style={{
          ...at(110, 100),
          fontFamily: 'Display',
          fontSize: thumb ? 91 : 118,
          color: WHITE,
          letterSpacing: -2,
        }}
      >
        {thumb ? 'INTRODUCING JEVGREP 0.5' : 'JEVGREP 0.5'}
      </div>
      <div
        style={{ ...at(115, 250), fontFamily: 'Mono', fontSize: 32, color: BLUE, opacity: 1 - cta }}
      >
        Find code by what it does.
      </div>
      <div
        style={{
          ...at(110, 370),
          width: 1700,
          height: 380,
          border: '1px solid #7e8a9c',
          borderLeft: `7px solid ${RED}`,
          background: '#0a0e17f5',
          boxShadow: '0 20px 90px #000',
          transform: `translate(${cta * 2100}px,${(1 - entrance) * 400}px)`,
          fontFamily: 'Mono',
          padding: '34px 40px',
          boxSizing: 'border-box',
          color: WHITE,
          fontSize: 29,
          lineHeight: 1.65,
        }}
      >
        <div>
          <span style={{ color: RED }}>$</span> jg "How are previews used to decide which files to
          open?" packages/core
        </div>
        <div style={{ marginTop: 26, opacity: result }}>
          <span style={{ color: BLUE }}>Jevgrep: 17 relevant files.</span>
          <br />
          {paths[0]}
          <br />
          {paths[1]} &nbsp; · &nbsp; {paths[2]} &nbsp; …
        </div>
      </div>
      {!thumb && (
        <div
          style={{
            ...at(110, 300),
            fontFamily: 'Display',
            fontSize: 138,
            color: WHITE,
            lineHeight: 1.12,
            opacity: cta,
            transform: `translateX(${(1 - cta) * -1500}px)`,
          }}
        >
          YOUR AGENT.
          <br />
          <span style={{ color: RED }}>BETTER CONTEXT.</span>
        </div>
      )}
      <div
        style={{
          ...at(115, thumb ? 838 : 730),
          fontFamily: 'Mono',
          fontSize: thumb ? 36 : 57,
          color: WHITE,
          opacity: thumb ? 1 : cta,
        }}
      >
        npm i -g @dzhng/jevgrep
      </div>
      <div
        style={{
          ...at(115, thumb ? 901 : 842),
          fontFamily: 'Mono',
          fontSize: thumb ? 31 : 44,
          color: RED,
          opacity: thumb ? 1 : cta,
        }}
      >
        jg auth &nbsp; → &nbsp; jg skill
      </div>
      <div style={{ ...at(1175, 950), fontFamily: 'Mono', fontSize: 26, color: '#afbdd1' }}>
        github.com/dzhng/jevgrep
      </div>
    </>
  );
}
function Cut({ t }: { t: number }) {
  const cue = [CUE.claim, CUE.search, CUE.context, CUE.terminal].find(
    at => t >= at && t < at + 0.22,
  );
  if (cue === undefined) return null;
  const p = (t - cue) / 0.22;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: RED,
        transform: `translateX(${(p * 2 - 1) * 2200}px)`,
        clipPath: 'polygon(8% 0,100% 0,92% 100%,0 100%)',
        pointerEvents: 'none',
      }}
    />
  );
}
export function Film() {
  const ready = useFonts(),
    frame = useCurrentFrame(),
    seconds = frame / FPS,
    pre = seconds < PRE,
    t = Math.max(0, (frame - Math.round(PRE * FPS)) / FPS);
  return (
    <AbsoluteFill style={{ background: '#08090d', overflow: 'hidden' }}>
      <Audio src={staticFile('score.wav')} />
      {ready && (
        <>
          <Field t={pre ? 22 : t} />
          {pre ? (
            <Terminal t={22} thumb />
          ) : t < CUE.claim ? (
            <Intro t={t} />
          ) : t < CUE.search ? (
            <Proof t={t} />
          ) : t < CUE.context ? (
            <Search t={t} />
          ) : t < CUE.terminal ? (
            <Context t={t} />
          ) : (
            <Terminal t={t} />
          )}
        </>
      )}
      {!pre && <Cut t={t} />}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 180px #0008',
        }}
      />
    </AbsoluteFill>
  );
}
export function Poster() {
  const ready = useFonts();
  return (
    <AbsoluteFill style={{ background: '#08090d' }}>
      {ready && (
        <>
          <Field t={7} />
          <Proof t={7} />
        </>
      )}
    </AbsoluteFill>
  );
}
