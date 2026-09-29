import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontData from './display-font.json';
import { Post } from './Post';
import T from '../timing.json';
export type V3 = [number, number, number];
const lime = '#bdff39',
  violet = '#7650ff',
  cyan = '#38daff';
const cl = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  n = cl(n);
  return n * n * (3 - 2 * n);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const font = new FontLoader().parse(fontData);
const geometry = new Map<string, THREE.BufferGeometry>();
function rounded(s: V3) {
  const key = s.join(',');
  if (!geometry.has(key)) geometry.set(key, new RoundedBoxGeometry(...s, 3, 0.065));
  return geometry.get(key)!;
}
function letter(text: string, size: number, depth = 0.22) {
  const key = text + size + depth;
  if (!geometry.has(key)) {
    const g = new TextGeometry(text, {
      font,
      size,
      depth,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: Math.min(0.045, depth * 0.18),
      bevelSize: Math.min(0.028, size * 0.025),
      bevelSegments: 3,
    });
    g.computeBoundingBox();
    const b = g.boundingBox!;
    g.translate(-(b.max.x - b.min.x) / 2, -(b.max.y - b.min.y) / 2, 0);
    geometry.set(key, g);
  }
  return geometry.get(key)!;
}
function metalMap() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#8b8b8b';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) {
    const x = (i * 127.73) % 256,
      y = (i * 43.41) % 256;
    g.fillStyle = `rgba(${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},.09)`;
    g.fillRect(x, y, 1 + (i % 12), 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}
function Materials() {
  const rough = metalMap();
  return {
    shell: new THREE.MeshPhysicalMaterial({
      color: '#24324e',
      metalness: 0.78,
      roughness: 0.3,
      roughnessMap: rough,
      clearcoat: 0.8,
    }),
    edge: new THREE.MeshPhysicalMaterial({
      color: '#7793bc',
      metalness: 0.95,
      roughness: 0.22,
      roughnessMap: rough,
    }),
    black: new THREE.MeshStandardMaterial({ color: '#080f21', metalness: 0.7, roughness: 0.5 }),
    lime: new THREE.MeshStandardMaterial({
      color: lime,
      emissive: lime,
      emissiveIntensity: 2.1,
      metalness: 0.25,
      roughness: 0.25,
    }),
    purple: new THREE.MeshStandardMaterial({
      color: violet,
      emissive: violet,
      emissiveIntensity: 1.5,
      metalness: 0.3,
      roughness: 0.3,
    }),
    cyan: new THREE.MeshStandardMaterial({ color: cyan, emissive: cyan, emissiveIntensity: 1.5 }),
    white: new THREE.MeshPhysicalMaterial({ color: '#e7efff', metalness: 0.65, roughness: 0.2 }),
    hero: new THREE.MeshPhysicalMaterial({
      color: lime,
      emissive: lime,
      emissiveIntensity: 0.28,
      metalness: 0.68,
      roughness: 0.24,
      clearcoat: 1,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: '#080e20',
      metalness: 0.65,
      roughness: 0.4,
      roughnessMap: rough,
    }),
  };
}
type Mats = ReturnType<typeof Materials>;
function Box({
  s,
  p = [0, 0, 0],
  r = [0, 0, 0],
  mat,
}: {
  s: V3;
  p?: V3;
  r?: V3;
  mat: THREE.Material;
}) {
  return (
    <mesh position={p} rotation={r} geometry={rounded(s)} material={mat} castShadow receiveShadow />
  );
}
function Label({
  text,
  p = [0, 0, 0],
  size = 0.35,
  color = lime,
}: {
  text: string;
  p?: V3;
  size?: number;
  color?: string;
}) {
  return (
    <mesh position={p} geometry={letter(text, size, 0.025)}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
function Cargo({
  m,
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  selected = false,
  id = 0,
}: {
  m: Mats;
  p?: V3;
  r?: V3;
  s?: number;
  selected?: boolean;
  id?: number;
}) {
  return (
    <group position={p} rotation={r} scale={s}>
      <Box s={[2, 2.7, 0.6]} mat={m.shell} />
      <Box s={[1.7, 2.34, 0.065]} p={[0, 0, 0.34]} mat={m.black} />
      {[-0.91, 0.91].map(x => (
        <Box key={x} s={[0.055, 2.44, 0.1]} p={[x, 0, 0.38]} mat={selected ? m.lime : m.edge} />
      ))}
      {[-1.21, 1.21].map(y => (
        <Box key={y} s={[1.84, 0.055, 0.1]} p={[0, y, 0.38]} mat={m.edge} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          s={[0.68 + (i % 4) * 0.16, 0.042, 0.03]}
          p={[-0.05 + (i % 3) * 0.06, 0.65 - i * 0.15, 0.405]}
          mat={selected && i === 3 ? m.lime : m.edge}
        />
      ))}
      <Box s={[0.28, 0.07, 0.05]} p={[-0.58, 1, 0.42]} mat={selected ? m.lime : m.purple} />
      <Label
        text={`SRC-${String(id).padStart(2, '0')}`}
        p={[0, -1.02, 0.415]}
        size={0.15}
        color={selected ? lime : '#95accb'}
      />
      {[-0.8, 0.8].flatMap(x =>
        [-1.1, 1.1].map(y => (
          <mesh
            key={x + ':' + y}
            position={[x, y, 0.44]}
            rotation={[Math.PI / 2, 0, 0]}
            material={m.edge}
          >
            <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
          </mesh>
        )),
      )}
    </group>
  );
}
function Cable({
  points,
  m,
  t,
  offset = 0,
}: {
  points: V3[];
  m: Mats;
  t: number;
  offset?: number;
}) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))),
    [JSON.stringify(points)],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 40, 0.027, 6, false), [curve]);
  const pos = curve.getPoint((((t * 0.32 + offset) % 1) + 1) % 1);
  return (
    <>
      <mesh geometry={tube} material={m.purple} />
      <mesh position={pos} material={m.lime}>
        <sphereGeometry args={[0.105, 12, 8]} />
      </mesh>
    </>
  );
}
function Facility({ m, t }: { m: Mats; t: number }) {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, 0]}
        material={m.floor}
        receiveShadow
      >
        <planeGeometry args={[140, 140]} />
      </mesh>
      {Array.from({ length: 21 }, (_, i) => (
        <React.Fragment key={i}>
          <Box s={[0.022, 0.012, 70]} p={[(i - 10) * 3, -0.185, 0]} mat={m.edge} />
          <Box s={[70, 0.012, 0.022]} p={[0, -0.184, (i - 10) * 3]} mat={m.edge} />
        </React.Fragment>
      ))}
      {[-11, 11].map(x => (
        <group key={x}>
          <Box s={[0.16, 0.04, 45]} p={[x, 0, -6]} mat={m.purple} />
          {Array.from({ length: 6 }, (_, i) => (
            <group key={i} position={[x, 3, -8 - i * 7]}>
              <Box s={[0.3, 6, 0.5]} mat={m.shell} />
              <Box s={[0.07, 5, 0.07]} p={[-Math.sign(x) * 0.21, 0, 0.3]} mat={m.cyan} />
            </group>
          ))}
        </group>
      ))}
      <group position={[0, 5, -14]} rotation={[0, 0, t * 0.025]}>
        <mesh material={m.shell}>
          <torusGeometry args={[6.3, 0.3, 12, 64]} />
        </mesh>
        <mesh position={[0, 0, 0.19]} material={m.purple}>
          <torusGeometry args={[6.3, 0.045, 8, 64]} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <Box
            key={i}
            s={[0.15, 0.8, 0.4]}
            p={[Math.cos((i * Math.PI) / 6) * 6.3, Math.sin((i * Math.PI) / 6) * 6.3, 0]}
            r={[0, 0, (i * Math.PI) / 6]}
            mat={m.edge}
          />
        ))}
      </group>
    </>
  );
}
function Intro({ m, t }: { m: Mats; t: number }) {
  return (
    <>
      <group
        position={[0, 3.25, 0]}
        rotation={[0.04 * Math.sin(t), -0.18 + Math.sin(t * 0.4) * 0.12, 0]}
      >
        <mesh geometry={letter('jg', 3, 1)} material={m.hero} castShadow />
        <mesh
          position={[0, -1.9, 0]}
          geometry={letter('JEVGREP', 0.6, 0.16)}
          material={m.white}
          castShadow
        />
      </group>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5 + t * 0.12;
        return (
          <Cargo
            key={i}
            m={m}
            p={[Math.cos(a) * 6.4, 2 + Math.sin(a * 2) * 0.6, Math.sin(a) * 4.6 - 2]}
            r={[0, -a + 0.8, 0.05 * Math.cos(a)]}
            s={0.65}
            selected={i % 3 === 0}
            id={i}
          />
        );
      })}
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, t * 0.15]} material={m.purple}>
        <torusGeometry args={[5, 0.07, 8, 96]} />
      </mesh>
    </>
  );
}
function Scanner({ m, t }: { m: Mats; t: number }) {
  return (
    <>
      <Box s={[16, 0.5, 4]} p={[0, 0.35, 0]} mat={m.shell} />
      {Array.from({ length: 30 }, (_, i) => (
        <mesh
          key={i}
          position={[-7.5 + i * 0.52, 0.7, 0]}
          rotation={[Math.PI / 2, t * 3, 0]}
          material={m.edge}
          castShadow
        >
          <cylinderGeometry args={[0.18, 0.18, 3.7, 12]} />
        </mesh>
      ))}
      {[-2.4, 2.4].map(z => (
        <Box key={z} s={[16, 0.09, 0.09]} p={[0, 0.6, z]} mat={m.purple} />
      ))}
      <group position={[0, 3, 0]}>
        <Box s={[0.6, 4.6, 0.3]} p={[0, 0, 2.5]} mat={m.shell} />
        <Box s={[0.6, 4.6, 0.3]} p={[0, 0, -2.5]} mat={m.shell} />
        <Box s={[0.6, 0.4, 5.3]} p={[0, 2.3, 0]} mat={m.shell} />
        <Box s={[0.1, 0.08, 4.7]} p={[0.4, 2.05, 0]} mat={m.lime} />
        <Box s={[0.09, 4.1, 0.07]} p={[0.4, 0, 2.24]} mat={m.lime} />
        <Box s={[0.09, 4.1, 0.07]} p={[0.4, 0, -2.24]} mat={m.lime} />
        <mesh position={[0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 4]} />
          <meshBasicMaterial
            color={lime}
            transparent
            opacity={0.055}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <Box s={[0.04, 0.045, 4.4]} p={[0.47, 1.7 - ((t * 0.85) % 3.4), 0]} mat={m.lime} />
      </group>
      {Array.from({ length: 6 }, (_, i) => {
        const x = ((i * 3.1 + t * 1.35 + 18.6) % 18.6) - 9.3;
        const selected = i % 2 === 0;
        const z = !selected && x > 1 ? smooth((x - 1) / 3) * 4 : 0;
        return (
          <Cargo
            key={i}
            m={m}
            p={[x, 2.25, z]}
            r={[0, -0.28, 0]}
            selected={selected && x > -0.7}
            id={i + 11}
          />
        );
      })}
      <Label text="PREVIEW SCAN" p={[0.6, 6.05, 0.4]} size={0.38} />
    </>
  );
}
function Batch({ m, t }: { m: Mats; t: number }) {
  const load = smooth((t - T.motion.batchLoadStart) / T.motion.batchLoadDuration);
  return (
    <>
      <Box s={[9, 0.4, 6]} p={[0, 0.2, 0]} mat={m.shell} />
      {[-4.2, 4.2].map(x => (
        <group key={x}>
          <Box s={[0.5, 7, 0.5]} p={[x, 3.4, -1.8]} mat={m.edge} />
          <Box s={[0.09, 6.5, 0.1]} p={[x + 0.28, 3.4, -1.5]} mat={m.purple} />
        </group>
      ))}
      <Box s={[9, 0.4, 0.7]} p={[0, 6.8, -1.8]} mat={m.edge} />
      <group position={[lerp(-3, 2.8, (Math.sin(t * 1.2) + 1) / 2), 6.25, -1.8]}>
        <Box s={[1.2, 0.5, 1.3]} mat={m.shell} />
        <Box s={[0.2, 1.8, 0.2]} p={[0, -1, 0]} mat={m.edge} />
        <Box s={[1.5, 0.18, 0.3]} p={[0, -1.9, 0]} mat={m.lime} />
        {[-0.7, 0.7].map(x => (
          <Box key={x} s={[0.15, 0.55, 0.3]} p={[x, -2.1, 0]} mat={m.edge} />
        ))}
      </group>
      {Array.from({ length: 16 }, (_, i) => {
        const settle = smooth(load * 2.2 - i * 0.065);
        return (
          <Cargo
            key={i}
            m={m}
            p={[((i % 4) - 1.5) * 1.85, 1.5 + (1 - settle) * 5, Math.floor(i / 4) * 1.0 - 1.5]}
            s={0.68}
            r={[0, 0, (1 - settle) * 0.3]}
            selected={settle > 0.8}
            id={i + 20}
          />
        );
      })}
      <group position={[-5.6, 3, 1.6]} rotation={[0, 0.5, 0]}>
        <Box s={[2.9, 3.8, 0.4]} mat={m.shell} />
        <Label text="ONE MANIFEST" p={[0, 1.35, 0.24]} size={0.22} />
        {['RELEVANCE', 'SCOPE', 'REFERENCE'].map((x, i) => (
          <Label key={x} text={x} p={[0, 0.55 - i * 0.65, 0.25]} size={0.22} color="#dde9ff" />
        ))}
      </group>
      <Cable
        m={m}
        t={t}
        points={[
          [-5, 2.5, 1],
          [-4, 5, 0],
          [0, 5.8, -1],
          [4, 5, 0],
        ]}
      />
    </>
  );
}
function Follow({ m, t }: { m: Mats; t: number }) {
  return (
    <>
      <Cargo m={m} p={[0, 2.6, 0]} s={1.35} r={[0, -0.18, 0]} selected id={1} />
      {[
        [-5, 3, 1],
        [4.8, 3, -1],
        [2, 1.8, 3.7],
      ].map((p, i) => (
        <group key={i}>
          <Cargo
            m={m}
            p={p as V3}
            r={[0, i === 0 ? 0.45 : -0.45, Math.sin(t + i) * 0.04]}
            selected
            s={0.85}
            id={i + 40}
          />
          <Cable
            m={m}
            t={t}
            offset={i * 0.3}
            points={[
              [p[0], p[1] + 1.14, p[2]],
              [p[0] * 0.65, 4.9 - i * 0.5, p[2] * 0.8],
              [i === 0 ? -1.32 : i === 1 ? 1.32 : 0.4, i === 2 ? 1.1 : 3.5, i === 2 ? 0.8 : 0.2],
            ]}
          />
        </group>
      ))}
      <Label text="REFERENCES" p={[0, 5.75, 0]} size={0.55} />
      {Array.from({ length: 35 }, (_, i) => {
        const a = i * 2.399 + t * 0.08;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 8, 1 + (i % 7) * 0.75, Math.sin(a) * 7]}
            material={i % 3 ? m.edge : m.purple}
          >
            <sphereGeometry args={[0.025, 6, 4]} />
          </mesh>
        );
      })}
    </>
  );
}
function Payoff({ m, t }: { m: Mats; t: number }) {
  const hit = smooth(t / T.motion.proofType);
  return (
    <>
      <group
        position={[0, 3.8, 0]}
        rotation={[0, lerp(-0.22, -0.12, hit), 0]}
        scale={lerp(0.65, 1, hit)}
      >
        <mesh geometry={letter('59%', 2.7, 0.6)} material={m.hero} castShadow />
      </group>
      <Label text="LOWER JEV COST" p={[0, 1.75, 0.4]} size={0.52} color="#e3efff" />
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i} position={[(i - 4.5) * 0.85, 0.25, 2.6]}>
          <Box s={[0.56, 0.12, 0.56]} mat={i < 8 ? m.lime : m.shell} />
        </group>
      ))}
      <group position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, t * 0.1]}>
        <mesh material={m.purple}>
          <torusGeometry args={[6.7, 0.08, 10, 96]} />
        </mesh>
      </group>
    </>
  );
}
function Env() {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.05).texture;
    scene.environmentIntensity = 0.45;
    scene.background = new THREE.Color('#030611');
    scene.fog = new THREE.Fog('#030611', 25, 80);
    return pm;
  }, [gl, scene]);
  return null;
}
export type Shot = { pos: V3; target: V3; fov: number; roll: number };
export function camera(stage: number, t: number): Shot {
  const k = T.cameras3d[stage];
  const p = smooth(t / (T.shots[stage].end - T.shots[stage].at));
  return {
    pos: k.from.map((v, i) => lerp(v, k.to[i], p)) as V3,
    target: k.target as V3,
    fov: lerp(k.fov[0], k.fov[1], p),
    roll: lerp(k.roll[0], k.roll[1], p),
  };
}
function Rig({ shot }: { shot: Shot }) {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...shot.pos);
  c.up.set(Math.sin(shot.roll), Math.cos(shot.roll), 0);
  c.lookAt(...shot.target);
  c.fov = shot.fov;
  c.updateProjectionMatrix();
  return null;
}
export function Scene({ stage, t, frame }: { stage: number; t: number; frame: number }) {
  const m = useMemo(Materials, []);
  const shot = camera(stage, t);
  return (
    <ThreeCanvas
      width={1920}
      height={1080}
      shadows="soft"
      camera={{ position: shot.pos, fov: shot.fov, near: 0.1, far: 150 }}
      gl={{ antialias: false, toneMapping: THREE.NoToneMapping, preserveDrawingBuffer: true }}
      style={{ position: 'absolute' }}
    >
      <Env />
      <Rig shot={shot} />
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[7, 10, 8]}
        intensity={2.2}
        color="#afcfff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-normalBias={0.03}
      />
      <pointLight position={[-7, 6, 2]} intensity={260} color={violet} />
      <pointLight position={[4, 6, -6]} intensity={420} color={cyan} />
      <pointLight position={[0, 4, 6]} intensity={100} color={lime} />
      <Facility m={m} t={t} />
      {stage === 0 || stage === 5 ? (
        <Intro m={m} t={t} />
      ) : stage === 1 ? (
        <Scanner m={m} t={t} />
      ) : stage === 2 ? (
        <Batch m={m} t={t} />
      ) : stage === 3 ? (
        <Follow m={m} t={t} />
      ) : (
        <Payoff m={m} t={t} />
      )}
      <Post
        focus={shot.target}
        focusRange={7}
        bokeh={1.6}
        aberration={Math.exp(-(t % 2) * 14) * 0.14}
        exposure={1}
        frame={frame}
      />
    </ThreeCanvas>
  );
}
