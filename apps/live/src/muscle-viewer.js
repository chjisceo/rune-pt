// 3D muscle viewer for the live app. Bundled by scripts/live-build.mjs into ui/muscle-viewer.js
// and imported only when the dialog opens, so the GLB and three.js never load on login or home.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Keys match MU in the trainer's index.html (세부 근육 분류). Patterns match BodyParts3D mesh names.
// A key with no pattern (e.g. lat: the model has no latissimus mesh) is named in chips but not lit.
const MESH = {
  chest_up: [/clavicular part of (left|right) pectoralis major/],
  chest_mid: [/sternocostal part of (left|right) pectoralis major/, /abdominal part of (left|right) pectoralis major/],
  delt_f: [/clavicular part of (left|right) deltoid/],
  delt_s: [/acromial part of (left|right) deltoid/],
  delt_r: [/spinal part of (left|right) deltoid/],
  lat: [/latissimus/],
  trap: [/trapezius/],
  rhom: [/rhomboid/],
  erec: [/iliocostalis/, /longissimus/, /^(left |right )?spinalis/],
  bic: [/biceps brachii/, /^(left |right )?brachialis/],
  tri: [/triceps brachii/, /anconeus/],
  fore: [/brachioradialis/, /flexor carpi/, /extensor carpi/, /flexor digitorum superficialis/, /flexor digitorum profundus/, /^(left |right )?extensor digitorum$/, /palmaris longus/, /pronator teres/],
  abs: [/rectus abdominis/],
  obl: [/external oblique/, /internal oblique/],
  glute: [/gluteus maximus/],
  glmed: [/gluteus medius/, /gluteus minimus/],
  quad: [/rectus femoris/, /vastus/],
  ham: [/biceps femoris/, /semitendinosus/, /semimembranosus/],
  add: [/adductor (longus|brevis|magnus|minimus)/, /gracilis/, /pectineus/],
  calf: [/gastrocnemius/, /soleus/],
};
const BACK_SIDE = new Set(['delt_r', 'lat', 'trap', 'rhom', 'erec', 'tri', 'glute', 'glmed', 'ham', 'calf']);

function keyOf(name) {
  const n = name.toLowerCase().replace(/_/g, ' ').replace(/\.\d+$/, '');
  for (const k in MESH) if (MESH[k].some((re) => re.test(n))) return k;
  return null;
}

function css(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * @param {HTMLElement} host
 * @param {{ primary: string[], secondary: string[], base: string, onProgress?: (pct:number)=>void }} opt
 */
export function mountViewer(host, opt) {
  const primary = new Set(opt.primary);
  const secondary = new Set(opt.secondary);
  const w = () => host.clientWidth || 320;
  const h = () => host.clientHeight || 360;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(css('--pa-canvas', '#0b1220'));
  const camera = new THREE.PerspectiveCamera(32, w() / h(), 0.05, 40);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(w(), h());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.touchAction = 'none';
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight('#ffffff', '#334155', 1.2));
  const key = new THREE.DirectionalLight('#fff7ed', 1.6); key.position.set(2.2, 3.2, 3); scene.add(key);
  const fill = new THREE.DirectionalLight('#93c5fd', 0.8); fill.position.set(-2.5, 1.5, -2); scene.add(fill);
  const rim = new THREE.DirectionalLight('#ffffff', 0.6); rim.position.set(0, -1.5, -3); scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 0.7;
  controls.maxDistance = 4.4;

  let focus = new THREE.Vector3(0, 0, 0);
  const DIST = 2.6;
  const backFirst = [...primary].some((k) => BACK_SIDE.has(k));
  function setView(v) {
    const d = v === 'reset' ? DIST : camera.position.distanceTo(controls.target) || DIST;
    const dir = v === 'back' || (v === 'reset' && backFirst) ? new THREE.Vector3(0, 0, -1)
      : v === 'side' ? new THREE.Vector3(1, 0.05, 0)
      : new THREE.Vector3(0, 0, 1);
    controls.target.copy(focus);
    camera.position.copy(focus).addScaledVector(dir, d);
    camera.lookAt(focus);
    controls.update();
  }

  const draco = new DRACOLoader();
  draco.setDecoderPath(opt.base + 'draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  let raf = 0;
  let disposed = false;
  const loaded = new Promise((resolve, reject) => {
    loader.load(opt.base + 'models/stayfit-muscle-skeleton.glb', (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const s = 1.5 / (Math.max(size.x, size.y, size.z) || 1);
      model.scale.setScalar(s);
      model.position.set(-center.x * s, -center.y * s, -center.z * s);

      const hot = css('--pa-muscle-hot', '#f06a54');
      const warm = css('--pa-muscle-warm', '#eab354');
      // 강조할 근육이 없으면(포스터) 전체를 밝은 기본색으로, 있으면 나머지를 낮춰 대비를 줘요.
      const dim = primary.size ? css('--pa-muscle-dim', '#a2665d') : css('--pa-muscle-base', '#c9786c');
      const bone = css('--pa-bone', '#e8dfd1');
      const hits = new THREE.Box3();
      let anyHit = false;
      model.updateMatrixWorld(true);
      model.traverse((o) => {
        if (!o.isMesh) return;
        const base = Array.isArray(o.material) ? o.material[0] : o.material;
        const mat = base.clone();
        o.material = mat;
        if ((base.name || '').toLowerCase().includes('skeleton')) { mat.color.set(bone); return; }
        const k = keyOf(o.name || '');
        const isP = k && primary.has(k);
        const isS = k && secondary.has(k);
        mat.color.set(isP ? hot : isS ? warm : dim);
        if (mat.emissive) { mat.emissive.set(isP ? hot : '#000000'); mat.emissiveIntensity = isP ? 0.3 : 0; }
        if (isP) { hits.expandByObject(o); anyHit = true; }
      });
      scene.add(model);
      if (anyHit) { focus = hits.getCenter(new THREE.Vector3()); focus.x = 0; focus.z = 0; }
      setView('reset');
      resolve();
    }, (e) => { if (e.total && opt.onProgress) opt.onProgress(Math.round((e.loaded / e.total) * 100)); }, reject);
  });

  const onResize = () => { camera.aspect = w() / h(); camera.updateProjectionMatrix(); renderer.setSize(w(), h()); };
  const ro = new ResizeObserver(onResize);
  ro.observe(host);
  const tick = () => { raf = requestAnimationFrame(tick); controls.update(); renderer.render(scene, camera); };
  setView('reset');
  tick();

  return {
    loaded,
    setView,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      draco.dispose();
      scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); } });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
