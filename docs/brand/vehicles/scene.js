// Procedural "modern clay" vehicles + extruded icons, rendered to transparent images.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let fitScale = 0.6; // camera distance factor: cars fill the frame, bikes need room for their height
const W = 1000;
const H = 625;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);

const pmrem = new THREE.PMREMGenerator(renderer);
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// --- materials ---------------------------------------------------------------------------------
const paint = (hex) =>
  new THREE.MeshPhysicalMaterial({ color: hex, metalness: 0.6, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.05, envMap });
const M = {
  body: paint(0x4a3f7a), // brand violet-gray, deep metallic
  glass: new THREE.MeshPhysicalMaterial({ color: 0x1b1a26, metalness: 0.3, roughness: 0.05, clearcoat: 1, envMap }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x1d1c22, roughness: 0.85, envMap }),
  rim: new THREE.MeshStandardMaterial({ color: 0xd9dbe3, metalness: 1, roughness: 0.22, envMap }),
  dark: new THREE.MeshStandardMaterial({ color: 0x2a2833, metalness: 0.2, roughness: 0.55, envMap }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xf2f3f7, metalness: 1, roughness: 0.12, envMap }),
  head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xeaf6ff, emissiveIntensity: 1.6 }),
  tail: new THREE.MeshStandardMaterial({ color: 0xff4d5e, emissive: 0xff2244, emissiveIntensity: 1.2 }),
  accent: paint(0x2fd3b9), // brand teal
};

// --- helpers -----------------------------------------------------------------------------------
const shape = (pts) => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y);
  s.closePath();
  return s;
};
// side profile (x = length, y = height) extruded across the width (z), centered, with soft bevel
const profile = (pts, width, mat, bevel = 0.07) => {
  const g = new THREE.ExtrudeGeometry(shape(pts), {
    depth: width - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 12,
  });
  g.translate(0, 0, -(width - bevel * 2) / 2);
  return new THREE.Mesh(g, mat);
};
const box = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const cyl = (r, h, mat, seg = 40) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
const at = (mesh, x, y, z) => (mesh.position.set(x, y, z), mesh);

function wheel(r, w, { spokes = 5, knobby = false } = {}) {
  const g = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(r - w * 0.32, w * 0.42, 18, 48), M.rubber);
  tire.scale.set(1, 1, w / (w * 0.84));
  const rim = cyl(r * 0.62, w * 0.7, M.rim);
  rim.rotation.x = Math.PI / 2;
  const hub = cyl(r * 0.16, w * 0.8, M.dark);
  hub.rotation.x = Math.PI / 2;
  g.add(tire, rim, hub);
  for (let i = 0; i < spokes; i++) {
    const s = box(r * 0.95, r * 0.09, w * 0.2, 0.01, M.dark);
    s.rotation.z = (i / spokes) * Math.PI;
    s.position.z = w * 0.36;
    g.add(s);
  }
  if (knobby) {
    for (let i = 0; i < 22; i++) {
      const k = box(r * 0.12, r * 0.1, w * 0.95, 0.01, M.rubber);
      const a = (i / 22) * Math.PI * 2;
      k.position.set(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, 0);
      k.rotation.z = a;
      g.add(k);
    }
  }
  return g;
}

// --- cars --------------------------------------------------------------------------------------
// body = lower shell profile; glass = greenhouse profile; roof = thin slab on top (floating roof look)
function car(spec) {
  const g = new THREE.Group();
  const { len, wid, body, glass, roof, wheelR, wheelbase, wheelX = 0, bed } = spec;
  g.add(profile(body, wid, M.body, 0.09));
  if (glass) g.add(profile(glass, wid - 0.12, M.glass, 0.05));
  if (roof) g.add(profile(roof, wid - 0.06, M.body, 0.06));
  if (bed) {
    // open pickup bed: floor + sides + tailgate in body color, dark liner
    const [x0, x1, y0, h] = bed;
    const L = x1 - x0;
    g.add(at(box(L, 0.06, wid - 0.25, 0.02, M.dark), x0 + L / 2, y0, 0));
    for (const z of [1, -1]) g.add(at(box(L, h, 0.1, 0.04, M.body), x0 + L / 2, y0 + h / 2, z * (wid / 2 - 0.1)));
    g.add(at(box(0.1, h, wid - 0.1, 0.04, M.body), x0 + 0.05, y0 + h / 2, 0));
  }
  // lights
  const front = len / 2;
  for (const z of [1, -1]) {
    g.add(at(box(0.08, 0.1, 0.46, 0.04, M.head), front + 0.07, spec.lightY, z * (wid / 2 - 0.32)));
    g.add(at(box(0.08, 0.08, 0.5, 0.04, M.tail), -front - 0.07, spec.tailY ?? spec.lightY, z * (wid / 2 - 0.32)));
  }
  // light bar across the front (modern signature)
  g.add(at(box(0.05, 0.03, wid - 0.4, 0.012, M.head), front + 0.08, spec.lightY + 0.1, 0));
  g.add(at(box(0.05, 0.03, wid - 0.4, 0.012, M.tail), -front - 0.08, (spec.tailY ?? spec.lightY) + 0.08, 0));
  for (const x of [wheelbase / 2 + wheelX, -wheelbase / 2 + wheelX]) {
    for (const z of [1, -1]) {
      const well = cyl(wheelR * 1.12, 0.04, M.dark);
      well.rotation.x = Math.PI / 2;
      well.position.set(x, wheelR, z * (wid / 2 - 0.06)); // recessed: the wheel sits in front of it
      g.add(well);
      const w = wheel(wheelR, 0.32);
      w.position.set(x, wheelR, z * (wid / 2 - 0.04));
      g.add(w);
    }
  }
  return g;
}

const CARS = {
  sedan: car({
    len: 4.7, wid: 1.85, wheelR: 0.34, wheelbase: 2.8, lightY: 0.62, tailY: 0.72,
    body: [[-2.35, 0.3], [2.35, 0.3], [2.38, 0.55], [2.2, 0.72], [0.95, 0.82], [-1.75, 0.84], [-2.3, 0.82], [-2.38, 0.55]],
    glass: [[0.9, 0.8], [-1.6, 0.82], [-1.0, 1.28], [0.2, 1.3]],
    roof: [[0.25, 1.26], [-1.05, 1.25], [-0.9, 1.34], [0.15, 1.35]],
  }),
  hatchback: car({
    len: 4.1, wid: 1.8, wheelR: 0.33, wheelbase: 2.55, lightY: 0.64, tailY: 0.86,
    body: [[-2.05, 0.3], [2.05, 0.3], [2.08, 0.55], [1.9, 0.74], [0.75, 0.84], [-1.95, 0.88], [-2.08, 0.6]],
    glass: [[0.7, 0.82], [-1.95, 0.86], [-1.85, 1.33], [0.05, 1.36]],
    roof: [[0.1, 1.32], [-1.85, 1.3], [-1.8, 1.4], [0.0, 1.41]],
  }),
  suv: car({
    len: 4.8, wid: 1.95, wheelR: 0.43, wheelbase: 2.85, lightY: 0.9, tailY: 1.0,
    body: [[-2.4, 0.4], [2.4, 0.4], [2.45, 0.75], [2.3, 1.0], [1.1, 1.1], [-2.3, 1.12], [-2.45, 0.85]],
    glass: [[1.05, 1.08], [-2.28, 1.1], [-2.15, 1.66], [0.45, 1.7]],
    roof: [[0.5, 1.66], [-2.15, 1.64], [-2.1, 1.76], [0.4, 1.78]],
  }),
  pickup: car({
    len: 5.3, wid: 1.95, wheelR: 0.44, wheelbase: 3.2, wheelX: 0.05, lightY: 0.95, tailY: 1.0,
    body: [[-2.65, 0.42], [2.65, 0.42], [2.7, 0.8], [2.55, 1.06], [1.45, 1.14], [0.1, 1.15], [0.1, 1.15], [-2.62, 1.15], [-2.7, 0.8]],
    glass: [[1.4, 1.12], [0.15, 1.13], [0.2, 1.68], [0.85, 1.72]],
    roof: [[0.9, 1.68], [0.18, 1.66], [0.2, 1.78], [0.82, 1.8]],
    bed: [-2.55, 0.08, 1.15, 0.35],
  }),
  van: car({
    len: 5.0, wid: 1.95, wheelR: 0.38, wheelbase: 3.1, lightY: 0.82, tailY: 1.0,
    body: [[-2.5, 0.36], [2.5, 0.36], [2.55, 0.75], [2.3, 1.05], [1.35, 1.4], [1.1, 2.05], [-2.45, 2.08], [-2.55, 1.9], [-2.55, 0.6]],
    glass: [[2.25, 1.06], [1.35, 1.42], [1.15, 1.95], [-1.9, 1.98], [-1.9, 1.5], [1.1, 1.45]],
  }),
  coupe: car({
    len: 4.6, wid: 1.9, wheelR: 0.35, wheelbase: 2.7, lightY: 0.58, tailY: 0.7,
    body: [[-2.3, 0.28], [2.3, 0.28], [2.36, 0.5], [2.15, 0.66], [0.9, 0.76], [-1.7, 0.8], [-2.28, 0.76], [-2.36, 0.52]],
    glass: [[0.85, 0.74], [-1.85, 0.78], [-0.85, 1.14], [-0.05, 1.16]],
    roof: [[0.0, 1.12], [-0.9, 1.11], [-0.8, 1.19], [-0.08, 1.2]],
  }),
};

// --- motorcycles -------------------------------------------------------------------------------
// x = forward, y = up. Parts hang off real joints: front axle → steering head, rear axle → swingarm pivot.
const prof = (pts, w, mat, b = 0.03) => profile(pts, w, mat, b);
const rot = (mesh, z) => ((mesh.rotation.z = z), mesh);
// cylinder from a to b ([x, y]) at depth z
function strut(a, b, r, mat, z = 0) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const m = cyl(r, Math.hypot(dx, dy), mat, 16);
  m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z);
  m.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
  return m;
}
function bike({ wheelR, frontR = wheelR, wheelW = 0.14, frontAxle, rearAxle, head, pivot, forkGap = 0.09, knobby = false, parts }) {
  const g = new THREE.Group();
  const fw = wheel(frontR, wheelW, { spokes: 6, knobby });
  fw.position.set(frontAxle, frontR, 0);
  const rw = wheel(wheelR, wheelW * 1.3, { spokes: 6, knobby });
  rw.position.set(rearAxle, wheelR, 0);
  g.add(fw, rw);
  for (const z of [forkGap, -forkGap]) {
    g.add(strut([frontAxle, frontR], head, 0.032, M.chrome, z));
    g.add(strut([rearAxle, wheelR], pivot, 0.035, M.dark, z * 1.2));
  }
  for (const p of parts) g.add(p);
  return g;
}

const BIKES = {
  sport: bike({
    wheelR: 0.31, frontAxle: 0.72, rearAxle: -0.7, head: [0.5, 0.98], pivot: [-0.05, 0.42],
    parts: [
      // fairing + tank as one sleek shell, kept clear of the front wheel
      prof([[0.95, 0.82], [0.84, 0.68], [0.46, 0.62], [0.32, 0.4], [0.02, 0.4], [-0.02, 0.62], [0.06, 0.9], [0.32, 1.02], [0.6, 1.04], [0.86, 0.96]], 0.34, M.body, 0.04),
      // tail rises from the tank
      prof([[0.02, 0.86], [-0.12, 0.8], [-0.7, 1.0], [-0.86, 1.08], [-0.82, 1.13], [-0.32, 1.04], [0.02, 0.98]], 0.22, M.body, 0.03),
      prof([[0.0, 0.98], [-0.42, 1.04], [-0.38, 1.09], [0.02, 1.04]], 0.24, M.dark, 0.02),
      prof([[0.6, 1.03], [0.84, 0.97], [0.76, 1.14], [0.62, 1.13]], 0.26, M.glass, 0.02),
      at(box(0.4, 0.26, 0.24, 0.05, M.dark), 0.15, 0.4, 0),
      strut([-0.15, 0.48], [-0.62, 0.78], 0.045, M.chrome, 0.1),
      at(box(0.06, 0.05, 0.2, 0.02, M.head), 0.96, 0.84, 0),
      at(box(0.04, 0.035, 0.14, 0.015, M.tail), -0.87, 1.1, 0),
      at(box(0.05, 0.04, 0.5, 0.02, M.dark), 0.52, 1.02, 0),
    ],
  }),
  cruiser: bike({
    wheelR: 0.33, wheelW: 0.2, frontAxle: 0.86, rearAxle: -0.8, head: [0.48, 1.0], pivot: [-0.1, 0.44], forkGap: 0.11,
    parts: [
      // teardrop tank
      (() => {
        const t = new THREE.Mesh(new THREE.SphereGeometry(0.2, 40, 24), M.body);
        t.scale.set(1.7, 0.85, 1.05);
        t.position.set(0.18, 0.86, 0);
        return t;
      })(),
      // low saddle + rear fender
      prof([[-0.05, 0.72], [-0.5, 0.7], [-0.62, 0.8], [-0.4, 0.86], [-0.05, 0.8]], 0.36, M.dark, 0.05),
      prof([[-0.55, 0.62], [-0.85, 0.66], [-1.15, 0.5], [-1.12, 0.44], [-0.85, 0.58], [-0.55, 0.56]], 0.26, M.body, 0.03),
      // front fender
      prof([[1.08, 0.4], [1.0, 0.56], [0.86, 0.62], [0.68, 0.56], [0.66, 0.5], [0.86, 0.56], [1.0, 0.5]], 0.22, M.body, 0.03),
      // V-twin
      rot(at(cyl(0.085, 0.36, M.chrome, 24), -0.02, 0.6, 0), 0.45),
      rot(at(cyl(0.085, 0.36, M.chrome, 24), 0.22, 0.6, 0), -0.45),
      at(box(0.42, 0.18, 0.3, 0.06, M.dark), 0.1, 0.38, 0),
      // exhausts
      strut([0.05, 0.36], [-1.0, 0.3], 0.045, M.chrome, 0.2),
      strut([0.2, 0.44], [-0.95, 0.42], 0.04, M.chrome, 0.21),
      // high bars + headlight
      at(box(0.05, 0.05, 0.75, 0.025, M.chrome), 0.4, 1.18, 0),
      strut([0.46, 1.0], [0.4, 1.18], 0.02, M.chrome, 0.08),
      strut([0.46, 1.0], [0.4, 1.18], 0.02, M.chrome, -0.08),
      at(new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 16), M.chrome), 0.6, 0.92, 0),
      at(cyl(0.085, 0.03, M.head, 32), 0.7, 0.92, 0),
    ].map((m, i) => (i === 13 ? ((m.rotation.z = Math.PI / 2), m) : m)),
  }),
  scooter: bike({
    wheelR: 0.24, wheelW: 0.14, frontAxle: 0.62, rearAxle: -0.6, head: [0.5, 0.9], pivot: [-0.25, 0.32],
    parts: [
      // step-through body: rear pod, floorboard, front shield
      prof([[-0.9, 0.42], [-0.3, 0.34], [0.25, 0.34], [0.42, 0.5], [0.58, 1.05], [0.46, 1.1], [0.3, 0.6], [0.2, 0.48], [-0.25, 0.48], [-0.4, 0.72], [-0.88, 0.76], [-0.98, 0.6]], 0.42, M.body, 0.06),
      prof([[-0.85, 0.76], [-0.3, 0.72], [-0.28, 0.82], [-0.8, 0.86]], 0.32, M.dark, 0.05),
      prof([[0.66, 0.5], [0.72, 0.38], [0.6, 0.3], [0.5, 0.36], [0.52, 0.48]], 0.18, M.body, 0.03),
      at(box(0.05, 0.05, 0.56, 0.02, M.chrome), 0.5, 1.13, 0),
      at(box(0.06, 0.09, 0.18, 0.03, M.head), 0.62, 0.95, 0),
      at(box(0.04, 0.05, 0.18, 0.02, M.tail), -0.98, 0.66, 0),
      prof([[0.47, 1.1], [0.57, 1.08], [0.52, 1.32], [0.43, 1.28]], 0.36, M.glass, 0.02),
    ],
  }),
  adventure: bike({
    wheelR: 0.35, frontR: 0.38, wheelW: 0.15, frontAxle: 0.8, rearAxle: -0.75, head: [0.55, 1.12], pivot: [-0.05, 0.52], knobby: true,
    parts: [
      prof([[1.0, 1.02], [0.9, 0.88], [0.55, 0.82], [0.4, 0.55], [0.05, 0.52], [-0.02, 0.75], [0.08, 1.12], [0.4, 1.22], [0.72, 1.24], [0.92, 1.15]], 0.46, M.body, 0.05),
      // beak in brand teal
      prof([[1.0, 0.98], [1.12, 0.86], [1.06, 0.82], [0.9, 0.9]], 0.2, M.accent, 0.03),
      prof([[0.72, 1.23], [0.86, 1.2], [0.76, 1.5], [0.66, 1.44]], 0.36, M.glass, 0.02),
      prof([[0.06, 1.12], [-0.7, 1.12], [-0.72, 1.18], [0.08, 1.2]], 0.28, M.dark, 0.03),
      at(box(0.42, 0.36, 0.13, 0.05, M.dark), -0.55, 0.86, 0.33),
      at(box(0.42, 0.36, 0.13, 0.05, M.dark), -0.55, 0.86, -0.33),
      at(box(0.42, 0.3, 0.32, 0.06, M.dark), 0.15, 0.6, 0),
      at(box(0.06, 0.07, 0.22, 0.02, M.head), 1.02, 1.0, 0),
      at(box(0.04, 0.04, 0.12, 0.015, M.tail), -0.78, 1.16, 0),
      at(box(0.05, 0.05, 0.7, 0.025, M.dark), 0.5, 1.28, 0),
    ],
  }),
};

// --- extruded icons (Material Design Icons path data, 24×24) -------------------------------------
function icon(path, color) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`);
  const g = new THREE.Group();
  for (const p of data.paths) {
    for (const s of SVGLoader.createShapes(p)) {
      const geo = new THREE.ExtrudeGeometry(s, { depth: 3.2, bevelEnabled: true, bevelThickness: 0.7, bevelSize: 0.35, bevelSegments: 6, curveSegments: 24 });
      g.add(new THREE.Mesh(geo, paint(color)));
    }
  }
  g.scale.set(0.12, -0.12, 0.12); // SVG y points down
  const b = new THREE.Box3().setFromObject(g);
  const c = b.getCenter(new THREE.Vector3());
  g.position.sub(c);
  const wrap = new THREE.Group();
  wrap.add(g);
  return wrap;
}

// --- render ------------------------------------------------------------------------------------
function frame(object, { view, size }) {
  const scene = new THREE.Scene();
  scene.environment = envMap;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5a5470, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc7bee6, 1.4);
  rim.position.set(-6, 3, -5);
  scene.add(rim);
  scene.add(object);

  const [w, h] = size;
  renderer.setSize(w, h, false);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const box3 = new THREE.Box3().setFromObject(object);
  const center = box3.getCenter(new THREE.Vector3());
  const sphere = box3.getBoundingSphere(new THREE.Sphere());
  const camera = new THREE.PerspectiveCamera(24, w / h, 0.1, 100);
  const dir = new THREE.Vector3(...view).normalize();
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = sphere.radius / Math.sin(fov / 2);
  const fitW = sphere.radius / Math.sin(Math.atan(Math.tan(fov / 2) * camera.aspect));
  camera.position.copy(center).add(dir.multiplyScalar(Math.max(fitH, fitW) * (size[0] === size[1] ? 0.82 : fitScale)));
  camera.lookAt(center);
  renderer.render(scene, camera);
  scene.remove(object);
}

const ICONS = {
  gasoline: ['mdiGasStation', 0x6b5e9c],
  diesel: ['mdiBarrel', 0x4a4560],
  hybrid: ['mdiLeaf', 0x1fa98f],
  phev: ['mdiEvPlugType2', 0x2fb5a2],
  ev: ['mdiLightningBolt', 0xe0a526],
};

// --- realistic cars from "Generic passenger car pack" by Comrade1280 (CC-BY-4.0) ----------------
// body style -> [body node in the pack, turn (radians) so the car faces +x like the procedural ones]
// third item: the body's paint texture, repainted per colour by paint.py
const PACK_BODIES = {
  sedan: ['Sedan Body', Math.PI, 'Body_5'],
  hatchback: ['Hatchback Body', Math.PI, 'Body_1'],
  suv: ['SUV Body', Math.PI, 'Body_7'],
  pickup: ['Pickup Body', Math.PI, 'Body_4'],
  van: ['minivan body', Math.PI, 'Body_2'],
  coupe: ['Sport body', Math.PI, 'Body_6'], // the pack's "Coupe" looks 1980s; its sports car reads as today's coupe
};
const PACK = {};
async function loadPack(url) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  // wheels are siblings of the bodies, not children: give each body the wheels inside its footprint
  const parts = [];
  root.traverse((o) => o.isMesh && parts.push(o));
  for (const [style, [bodyName, turn, tex]] of Object.entries(PACK_BODIES)) {
    const body = root.getObjectByName(bodyName.replace(/ /g, '_')); // GLTFLoader sanitizes node names
    const box = new THREE.Box3().setFromObject(body).expandByScalar(0.05 * new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3()).length());
    const g = new THREE.Group();
    for (const m of parts) {
      const isBody = m.parent === body;
      const isWheel = /^Wheel/.test(m.parent?.name) && box.containsPoint(new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()));
      if (!isBody && !isWheel) continue;
      const c = m.clone();
      c.material = m.material.clone();
      c.material.envMap = envMap;
      if (c.material.name === tex) c.userData.paint = c.material.map;
      c.matrixAutoUpdate = false;
      c.matrix.copy(m.matrixWorld);
      g.add(c);
    }
    // cars stand in a circle in the pack: turn each so its own long axis points along +x
    const shell = body.children.find((c) => c.isMesh);
    shell.geometry.computeBoundingBox();
    const local = shell.geometry.boundingBox.getSize(new THREE.Vector3()).toArray();
    const along = new THREE.Vector3().setComponent(local.indexOf(Math.max(...local)), 1).transformDirection(shell.matrixWorld);
    const wrap = new THREE.Group();
    wrap.add(g);
    wrap.rotation.y = -Math.atan2(-along.z, along.x) + turn;
    const outer = new THREE.Group();
    outer.add(wrap);
    outer.updateMatrixWorld(true);
    const c = new THREE.Box3().setFromObject(outer).getCenter(new THREE.Vector3());
    wrap.position.sub(c);
    PACK[style] = outer;
  }
}
window.loadPack = async (url) => (await loadPack(url), true);

// colour: null = the model's own paint; otherwise { name, hex } (pack cars use paint.py textures next to the pack)
const paintCache = {};
async function applyPaint(name, colour, packDir) {
  if (PACK[name]) {
    const tex = PACK_BODIES[name][2];
    let map = null;
    if (colour) {
      const url = `${packDir}/paint/${colour.name}/${tex}_baseColor.png`;
      map = paintCache[url] ??= await new THREE.TextureLoader().loadAsync(url).then((t) => {
        t.flipY = false;
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      });
    }
    PACK[name].traverse((o) => {
      if (o.userData.paint) {
        o.material.map = map ?? o.userData.paint;
        o.material.needsUpdate = true;
      }
    });
  } else M.body.color.setHex(colour ? colour.hex : 0x4a3f7a);
}
window.applyPaint = async (name, colour, packDir) => (await applyPaint(name, colour, packDir), true);

window.renderJob = (name, mdi) => {
  fitScale = CARS[name] ? 0.6 : 0.72;
  if (PACK[name]) frame(PACK[name], { view: [1.0, 0.33, 1.2], size: [W, H] });
  else if (CARS[name]) frame(CARS[name], { view: [1.0, 0.33, 1.2], size: [W, H] });
  else if (BIKES[name]) frame(BIKES[name], { view: [0.8, 0.32, 1.2], size: [W, H] });
  else {
    const [key, color] = ICONS[name];
    const o = icon(mdi[key], color);
    o.rotation.set(-0.25, -0.55, 0);
    frame(o, { view: [0, 0, 1], size: [512, 512] });
  }
  return true;
};
window.ready = true;
