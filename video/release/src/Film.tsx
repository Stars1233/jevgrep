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
            width: `${clamp(t / CUE.claim) * 100}%`,
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
  const lock = bounce(t, CUE.lock),
    fade = 1 - progress(t, CUE.lock, 0.25);
  return (
    <>
      <HitText
        text="PREVIEW BEFORE FULL READS."
        t={t}
        start={CUE.search}
        x={110}
        y={125}
        size={106}
      />
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            ...at(190 + i * 560, 480),
            width: 420,
            height: 170,
            border: `2px solid ${BLUE}`,
            background: '#101823',
            padding: 28,
            boxSizing: 'border-box',
            opacity: fade,
          }}
        >
          <div style={{ fontFamily: 'Mono', fontSize: 29, color: BLUE }}>PREVIEW</div>
          {[280, 220, 300].map((w, j) => (
            <div key={j} style={{ height: 5, width: w, background: '#dbe7f688', marginTop: 18 }} />
          ))}
        </div>
      ))}
      <div style={{ opacity: clamp(lock * 3) }}>
        <Source
          index={0}
          x={960}
          y={625}
          scale={0.5 + lock * 0.85}
          energy={pulse(t, 'accent', 0.1)}
        />
        <div
          style={{
            ...at(1320, 510),
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: BLUE,
            color: '#08090d',
            fontFamily: 'Display',
            fontSize: 73,
            textAlign: 'center',
            lineHeight: '104px',
          }}
        >
          ✓
        </div>
      </div>
      <HitText
        text="FULL READS ONLY WHEN RELEVANT."
        t={t}
        start={CUE.lock + 0.25}
        x={110}
        y={888}
        size={70}
        color={BLUE}
      />
    </>
  );
}
function Context({ t }: { t: number }) {
  const collect = progress(t, CUE.collect, 0.85),
    tick = pulse(t, 'kick', 0.08);
  return (
    <>
      <HitText text="ONE BRIEF. MORE CODE." t={t} start={CUE.context} x={110} y={125} size={120} />
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            ...at(160 + i * 555 + (960 - (160 + i * 555)) * collect, 330 - collect * 20),
            width: 490,
            height: 85,
            background: BLUE,
            color: '#08090d',
            fontFamily: 'Mono',
            fontSize: 27,
            lineHeight: '85px',
            textAlign: 'center',
            opacity: clamp(1 - collect * 3),
            transform: `translateX(${-collect * 245}px)`,
          }}
        >
          RELEVANCE CRITERIA
        </div>
      ))}
      {Array.from({ length: 18 }, (_, i) => {
        const x = 190 + (i % 6) * 266,
          y = 495 + Math.floor(i / 6) * 115;
        return (
          <div
            key={i}
            style={{
              ...at(
                x + (550 + (i % 6) * 130 - x) * collect,
                y + (500 + Math.floor(i / 6) * 75 - y) * collect,
              ),
              width: 210 * (1 - collect) + 110 * collect,
              height: 72 * (1 - collect) + 48 * collect,
              border: `2px solid ${BLUE}`,
              background: '#132130',
              transform: `scale(${1 + tick * 0.035})`,
            }}
          >
            {[0, 1, 2].map(j => (
              <div
                key={j}
                style={{
                  margin: '6px 12px',
                  height: 3,
                  width: `${70 - j * 13}%`,
                  background: '#cfe5fa99',
                }}
              />
            ))}
          </div>
        );
      })}
      <div
        style={{
          ...at(475, 330),
          width: 950,
          height: 405,
          border: `3px solid ${BLUE}`,
          boxShadow: '0 0 25px #87eaff22',
          opacity: collect,
        }}
      >
        <div
          style={{
            height: 92,
            background: BLUE,
            color: '#08090d',
            fontFamily: 'Mono',
            fontSize: 38,
            textAlign: 'center',
            lineHeight: '92px',
          }}
        >
          ONE SHARED BRIEF
        </div>
      </div>
      <HitText
        text="UP TO 128 CODE UNITS PER BATCH."
        t={t}
        start={CUE.collect + 0.6}
        x={110}
        y={865}
        size={75}
      />
    </>
  );
}
function Thumbnail() {
  return (
    <>
      <div style={{ ...at(110, 100), fontFamily: 'Display', fontSize: 91, color: WHITE }}>
        INTRODUCING JEVGREP 0.5
      </div>
      <div style={{ ...at(115, 250), fontFamily: 'Mono', fontSize: 32, color: BLUE }}>
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
        <div style={{ marginTop: 26 }}>
          <span style={{ color: BLUE }}>Jevgrep: 17 relevant files.</span>
          <br />
          {paths[0]}
          <br />
          {paths[1]} &nbsp; · &nbsp; {paths[2]} &nbsp; …
        </div>
      </div>
      <div style={{ ...at(115, 838), fontFamily: 'Mono', fontSize: 36, color: WHITE }}>
        npm i -g @dzhng/jevgrep
      </div>
      <div style={{ ...at(115, 901), fontFamily: 'Mono', fontSize: 31, color: BLUE }}>
        jg auth → jg skill
      </div>
    </>
  );
}
function Install({ t }: { t: number }) {
  return (
    <>
      <HitText text="INSTALL JEVGREP." t={t} start={CUE.install} x={110} y={130} size={132} />
      {['npm i -g @dzhng/jevgrep', 'jg auth', 'jg skill'].map((command, i) => {
        const p = progress(t, CUE.install + 0.25 + i * 0.5, 0.25);
        return (
          <div
            key={command}
            style={{
              ...at(120, 420 + i * 175),
              fontFamily: 'Mono',
              fontSize: 57,
              color: WHITE,
              opacity: p,
              transform: `translateX(${(1 - p) * 100}px)`,
            }}
          >
            <span style={{ color: BLUE, marginRight: 45, fontSize: 35 }}>0{i + 1}</span>
            {command}
          </div>
        );
      })}
      <div style={{ ...at(115, 970), fontFamily: 'Mono', fontSize: 28, color: BLUE }}>
        github.com/dzhng/jevgrep
      </div>
    </>
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
            <Thumbnail />
          ) : t < CUE.claim ? (
            <Intro t={t} />
          ) : t < CUE.search ? (
            <Proof t={t} />
          ) : t < CUE.context ? (
            <Search t={t} />
          ) : t < CUE.terminal ? (
            <Context t={t} />
          ) : (
            <Install t={t} />
          )}
        </>
      )}
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
          <Field t={4.25} />
          <Proof t={4.25} />
        </>
      )}
    </AbsoluteFill>
  );
}
