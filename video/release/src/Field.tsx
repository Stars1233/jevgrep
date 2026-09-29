import React, { useLayoutEffect, useRef } from 'react';
import { CUE, EVENTS, clamp, ease, progress, pulse } from './timeline';
const W = 1920,
  H = 1080,
  RED = '#ff3e2b',
  BLUE = '#87eaff';
const random = (i: number) => {
  const n = Math.sin(i * 127.13 + 78.71) * 43758.5453;
  return n - Math.floor(n);
};
function project(x: number, y: number, z: number, t: number, k: number) {
  const a = Math.sin(t * 0.3) * 0.1,
    xx = x * Math.cos(a) + z * Math.sin(a),
    zz = z * Math.cos(a) - x * Math.sin(a);
  const f = 950 / (zz + 1200 - k * 130);
  return { x: 960 + xx * f, y: 540 + y * f, scale: f, z: zz };
}
function glow(g: CanvasRenderingContext2D, color: string, width: number) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.shadowColor = color;
  g.shadowBlur = width * 3;
}
export function Field({ t }: { t: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = ref.current!.getContext('2d')!;
    const kick = pulse(t, 'kick'),
      snare = pulse(t, 'snare', 0.09),
      accent = pulse(t, 'accent', 0.2);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#08090d';
    g.fillRect(0, 0, W, H);
    const bloom = g.createRadialGradient(960, 560, 20, 960, 560, 1000);
    bloom.addColorStop(0, `rgba(126,22,16,${0.1 + kick * 0.11})`);
    bloom.addColorStop(0.5, 'rgba(16,24,34,.2)');
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = bloom;
    g.fillRect(0, 0, W, H);
    const inSearch = t >= CUE.search && t < CUE.context,
      inCollect = t >= CUE.context && t < CUE.terminal;
    const closing = t >= CUE.terminal;
    // Source strips travel through perspective, then converge toward the search aperture.
    g.save();
    g.translate(Math.sin(t * 91) * accent * 7, Math.cos(t * 83) * accent * 5);
    for (let i = 0; i < 230; i++) {
      let z = 500 + ((((random(i + 1) * 5000 - t * (inSearch ? 750 : 420)) % 5000) + 5000) % 5000);
      let x = (random(i + 20) - 0.5) * 7400,
        y = (random(i + 80) - 0.5) * 3900;
      const chosen = i % 17 === 0;
      const pull =
        inSearch && chosen
          ? progress(t, CUE.lock, 0.65)
          : inCollect
            ? progress(t, CUE.collect, 0.8)
            : 0;
      x *= 1 - pull * 0.94;
      y *= 1 - pull * 0.94;
      z = z * (1 - pull) + 400 * pull;
      const p = project(x, y, z, t, kick);
      if (p.x < -600 || p.x > W + 600 || p.y < -300 || p.y > H + 300) continue;
      const opacity = (chosen ? 0.78 : 0.15 + random(i + 5) * 0.16) * (closing ? 0.23 : 1);
      g.globalAlpha = opacity * (inCollect || chosen ? 1 - pull : 1);
      g.strokeStyle = chosen ? (inSearch ? BLUE : RED) : '#acb4c1';
      g.lineWidth = Math.max(0.7, p.scale * 3);
      g.shadowBlur = chosen ? 12 : 0;
      g.shadowColor = g.strokeStyle;
      for (let j = 0; j < 3; j++) {
        const len = (120 + random(i + j + 7) * 210) * p.scale;
        g.beginPath();
        g.moveTo(p.x, p.y + j * 18 * p.scale);
        g.lineTo(p.x + len, p.y + j * 18 * p.scale);
        g.stroke();
      }
      if (chosen && p.scale > 0.24 && pull < 0.1) {
        g.font = `${Math.max(10, p.scale * 20)}px Mono`;
        g.fillStyle = g.strokeStyle;
        g.fillText(
          ['selection.ts', 'retrieve.ts', 'source.ts', 'preview.py'][i % 4],
          p.x,
          p.y - 14 * p.scale,
        );
      }
    }
    g.restore();
    g.globalAlpha = 1;
    g.shadowBlur = 0;
    // Concentric beat rings are full-frame effects, not static decoration.
    const cx = 960,
      cy = 540;
    for (const e of EVENTS) {
      if (e.kind !== 'accent' || e.t !== CUE.fracture) continue;
      const age = t - e.t;
      if (age < 0 || age > 0.7) continue;
      const q = age / 0.7;
      const radius = 80 + ease(q) * 1250;
      g.globalAlpha = (1 - q) * (0.25 + e.a * 0.35) * (closing ? 0.3 : 1);
      glow(
        g,
        e.kind === 'accent' ? RED : '#697f94',
        Math.max(1, (1 - q) * (e.kind === 'accent' ? 14 : 4)),
      );
      g.beginPath();
      g.ellipse(cx, cy, radius, radius * 0.56, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.shadowBlur = 0;
    // The API cost mass loses 59% of its fragments exactly on the accent.
    if (t >= CUE.claim && t < CUE.search) {
      const d = t - CUE.fracture;
      for (let i = 0; i < 100; i++) {
        let x = 190 + i * 15,
          y = 786;
        const discard = i >= 41;
        if (discard && d >= 0) {
          x += (180 + random(i + 50) * 900) * d;
          y += (50 + random(i + 60) * 250) * d + 900 * d * d;
        }
        g.globalAlpha = discard && d > 0 ? clamp(1 - d * 1.3) : 0.5 + kick * 0.3;
        g.fillStyle = discard ? '#d5e4ea' : RED;
        g.shadowColor = g.fillStyle;
        g.shadowBlur = discard ? 8 : 15;
        g.save();
        g.translate(x, y);
        g.rotate(discard ? Math.max(0, d) * (random(i + 4) - 0.5) * 12 : 0);
        g.fillRect(-6, -48, 13, 96);
        g.restore();
      }
      g.globalAlpha = 1;
      g.shadowBlur = 0;
    }
    if (inSearch) {
      const scan = progress(t, CUE.scan, 2.5),
        lock = progress(t, CUE.lock, 0.3);
      const originalX = 250 + scan * 1420,
        sx = originalX + (960 - originalX) * lock,
        sy = 570 + (660 - 570) * lock;
      g.globalAlpha = 1 - lock * 0.8;
      glow(g, BLUE, 3 + kick * 8);
      g.beginPath();
      g.ellipse(sx, sy, 170 + lock * 340 + kick * 20, 280 - lock * 130 + kick * 20, 0, 0, 6.283);
      g.stroke();
      const laser = g.createLinearGradient(sx - 100, 0, sx + 100, 0);
      laser.addColorStop(0, '#87eaff00');
      laser.addColorStop(0.5, `rgba(135,234,255,${0.08 + kick * 0.08})`);
      laser.addColorStop(1, '#87eaff00');
      g.fillStyle = laser;
      g.fillRect(sx - 100, 250, 200, 650);
      g.globalAlpha = 1;
      g.shadowBlur = 0;
    }
    if (inCollect) {
      const collect = progress(t, CUE.collect, 0.8),
        starts = [
          [750, 510],
          [1120, 540],
          [960, 725],
        ];
      for (let i = 0; i < 3; i++) {
        const [x, y] = starts[i],
          sx = x + (960 - x) * collect,
          sy = y + (620 - y) * collect,
          cx = (sx + 960) / 2,
          cy = (sy + 620) / 2 - (1 - collect) * (80 + kick * 35);
        g.globalAlpha = 1 - collect;
        glow(g, i === 0 ? RED : BLUE, 3 + kick * 3);
        g.beginPath();
        g.moveTo(sx, sy);
        g.quadraticCurveTo(cx, cy, 960, 620);
        g.stroke();
        for (let n = 0; n < 4; n++) {
          const u = (t * 1.7 + n / 4) % 1,
            px = (1 - u) ** 2 * sx + 2 * (1 - u) * u * cx + u * u * 960,
            py = (1 - u) ** 2 * sy + 2 * (1 - u) * u * cy + u * u * 620;
          g.fillStyle = '#f3fbff';
          g.beginPath();
          g.arc(px, py, 4 + kick * 3, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.globalAlpha = 1 - collect;
      g.fillStyle = RED;
      g.shadowColor = RED;
      g.shadowBlur = 40;
      g.beginPath();
      g.arc(960, 620, 12 + kick * 12, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;
      g.globalAlpha = 1;
    }
    // Bass hits drive perspective streaks, giving the field a physical acceleration.
    if (kick > 0.12 && !closing) {
      g.globalAlpha = kick * 0.26;
      glow(g, t < CUE.search ? RED : BLUE, 1.5);
      for (let i = 0; i < 20; i++) {
        const a = (i * Math.PI) / 10 + 0.12,
          r = 650 + random(i) * 250,
          length = kick * (100 + random(i + 8) * 220);
        g.beginPath();
        g.moveTo(960 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.7);
        g.lineTo(960 + Math.cos(a) * (r + length), 540 + Math.sin(a) * (r + length) * 0.7);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.shadowBlur = 0;
    }
    // Snare tears, moving edge light and hats create rhythmic foreground detail.
    g.globalAlpha = snare * 0.38;
    g.fillStyle = BLUE;
    for (let i = 0; i < 3; i++)
      g.fillRect(0, Math.floor(random(i + Math.floor(t * 2)) * H), W, 2 + i * 3);
    g.globalAlpha = 1;
    for (let i = 0; i < 70; i++) {
      const phase = (t * 0.65 + random(i)) % 1;
      const x = 960 + (random(i + 120) - 0.5) * 2400 * phase,
        y = 540 + (random(i + 300) - 0.5) * 1500 * phase;
      g.fillStyle = i % 4 === 0 ? RED : '#e1efff';
      g.globalAlpha = (1 - phase) * (0.2 + kick * 0.6) * (closing ? 0.3 : 1);
      g.fillRect(x, y, 2 + phase * 7, 1 + phase * 3);
    }
    g.globalAlpha = 1;
    const edge = g.createLinearGradient(0, 0, 0, H);
    edge.addColorStop(0, `rgba(255,62,43,${0.12 + kick * 0.3})`);
    edge.addColorStop(0.12, '#ff3e2b00');
    edge.addColorStop(0.88, '#ff3e2b00');
    edge.addColorStop(1, `rgba(255,62,43,${0.1 + snare * 0.3})`);
    g.fillStyle = edge;
    g.fillRect(0, 0, W, H);
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
}
