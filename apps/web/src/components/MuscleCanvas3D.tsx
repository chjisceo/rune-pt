import { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { MUSCLE_META, SAFETY_ATTRIBUTION } from '@rune-pt/core';
import type { MuscleGroupId, ThemeMode } from '@rune-pt/core';
import type { Group, Mesh, PerspectiveCamera, Scene } from 'three';
import { readCssToken } from '../utils/themeTokens';

export type AnatomyCameraPreset = 'front' | 'quarter' | 'back';

export interface MuscleCanvas3DProps {
  highlightedMuscles: MuscleGroupId[];
  theme: ThemeMode;
  preset: AnatomyCameraPreset;
  presetTrigger?: number;
  showSkeleton: boolean;
  dimUnselected: boolean;
  dragEnabled: boolean;
  heightPx: number;
  maxPixelRatio?: number;
}

const GLB_URL = '/models/stayfit-muscle-skeleton.glb';

const MUSCLE_KEYWORDS: Record<MuscleGroupId, readonly string[]> = {
  chest: ['pectoralis major', 'pectoralis minor', 'serratus anterior'],
  shoulder: ['deltoid'],
  arm: [
    'biceps brachii',
    'triceps brachii',
    'brachialis',
    'brachioradialis',
    'coracobrachialis',
    'pronator',
    'flexor carpi',
    'extensor carpi',
  ],
  back: [
    'trapezius',
    'rhomboid',
    'teres major',
    'teres minor',
    'iliocostalis',
    'longissimus',
    'semispinalis',
    'spinalis',
    'levator scapulae',
    'infraspinatus',
    'supraspinatus',
    'latissimus',
  ],
  core: [
    'external oblique',
    'internal oblique',
    'transversus abdominis',
    'rectus abdominis',
    'quadratus lumborum',
  ],
  leg: [
    'gluteus',
    'rectus femoris',
    'vastus',
    'biceps femoris',
    'semitendinosus',
    'semimembranosus',
    'sartorius',
    'gracilis',
    'adductor',
    'gastrocnemius',
    'soleus',
    'tibialis',
  ],
};

function classifyMuscleMesh(meshName: string): MuscleGroupId | null {
  const lower = meshName.toLowerCase().replaceAll('_', ' ');
  for (const group of Object.keys(MUSCLE_KEYWORDS) as MuscleGroupId[]) {
    if (MUSCLE_KEYWORDS[group].some((kw) => lower.includes(kw))) {
      return group;
    }
  }
  return null;
}

export function MuscleCanvas3D({
  highlightedMuscles,
  theme,
  preset,
  presetTrigger = 0,
  showSkeleton,
  dimUnselected,
  dragEnabled,
  heightPx,
  maxPixelRatio = 1.75,
}: MuscleCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const modelRef = useRef<Group | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const controlsRef = useRef<{
    enabled: boolean;
    target: { set: (x: number, y: number, z: number) => void };
    update: () => void;
  } | null>(null);
  const distanceRef = useRef<number>(2.7);
  const visibleRef = useRef<boolean>(true);

  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const highlightedKey = highlightedMuscles.join(',');

  // Three.js + Draco GLB 초기화 (IntersectionObserver로 화면 밖 렌더 정지)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId = 0;
    let cleanup: (() => void) | undefined;

    setIsLoaded(false);
    setLoadProgress(0);
    setLoadError(null);

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    (async () => {
      try {
        const THREE = await import('three');
        const [{ GLTFLoader }, { DRACOLoader }, { OrbitControls }] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/loaders/DRACOLoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js'),
        ]);

        if (cancelled || !mountRef.current) return;
        const width = container.clientWidth || 340;
        const height = container.clientHeight || heightPx;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(
          readCssToken('--canvas-bg', isDark ? '#071020' : '#efeae0'),
        );
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(34, width / height, 0.05, 40);
        camera.position.set(0, 0, 2.7);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const hemiLight = new THREE.HemisphereLight('#ffffff', '#334155', 1.18);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight('#fff7ed', 1.65);
        keyLight.position.set(2.2, 3.2, 3.0);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight('#93c5fd', 0.8);
        fillLight.position.set(-2.5, 1.5, -2.0);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight('#ffffff', 0.55);
        rimLight.position.set(0, -1.5, -3.0);
        scene.add(rimLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.enablePan = false;
        controls.enableZoom = dragEnabled;
        controls.enableRotate = dragEnabled;
        controls.enabled = dragEnabled;
        controls.minDistance = 0.9;
        controls.maxDistance = 4.6;
        controls.target.set(0, 0, 0);
        controls.update();
        renderer.domElement.style.touchAction = dragEnabled ? 'none' : 'pan-y';
        controlsRef.current = controls;

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        loader.load(
          GLB_URL,
          (gltf) => {
            if (cancelled) return;
            const root = gltf.scene;

            const box = new THREE.Box3().setFromObject(root);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 1.44 / maxDim;
            root.scale.setScalar(scale);
            root.position.set(
              -center.x * scale,
              -center.y * scale,
              -center.z * scale,
            );

            root.traverse((obj) => {
              const mesh = obj as Mesh;
              if (!mesh.isMesh) return;
              const baseMat = Array.isArray(mesh.material)
                ? mesh.material[0]
                : mesh.material;
              if (!baseMat) return;
              const cloned = baseMat.clone();
              const matName = (baseMat.name || '').toLowerCase();
              const isSkeleton = matName.includes('skeleton');
              mesh.userData.isSkeleton = isSkeleton;
              mesh.userData.muscleGroup = isSkeleton
                ? null
                : classifyMuscleMesh(mesh.name || '');
              mesh.material = cloned;
            });

            modelRef.current = root;
            scene.add(root);
            distanceRef.current = 2.7;
            setIsLoaded(true);
            setLoadProgress(100);
          },
          (evt) => {
            if (cancelled) return;
            if (evt.total > 0) {
              setLoadProgress(Math.min(99, Math.round((evt.loaded / evt.total) * 100)));
            }
          },
          () => {
            if (cancelled) return;
            setLoadError(
              '3D 해부 모델 파일을 불러올 수 없습니다. 모델 경로(/models/stayfit-muscle-skeleton.glb)를 확인해 주세요.',
            );
          },
        );

        const handleResize = () => {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth || 340;
          const h = mountRef.current.clientHeight || heightPx;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        const animate = () => {
          if (cancelled) return;
          rafId = window.requestAnimationFrame(animate);
          if (!visibleRef.current) return;
          if (controls.enabled) controls.update();
          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          dracoLoader.dispose();
          controls.dispose();
          renderer.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          modelRef.current = null;
          sceneRef.current = null;
          cameraRef.current = null;
          controlsRef.current = null;
        };
      } catch {
        if (!cancelled) {
          setLoadError('WebGL 3D 렌더러 초기화 중 오류가 발생했습니다.');
        }
      }
    })();

    return () => {
      cancelled = true;
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [heightPx, maxPixelRatio]);

  // 테마 변경 시 캔버스 배경만 즉시 갱신 (재로딩 방지)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    import('three').then((THREE) => {
      scene.background = new THREE.Color(
        readCssToken('--canvas-bg', isDark ? '#071020' : '#efeae0'),
      );
    });
  }, [isDark]);

  // 드래그 잠금/해제 동기화 (모바일 세로 스크롤 간섭 방지)
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enabled = dragEnabled;
    // OrbitControls enableRotate/enableZoom 동기화
    const raw = controls as unknown as {
      enableRotate: boolean;
      enableZoom: boolean;
      domElement?: HTMLElement;
    };
    raw.enableRotate = dragEnabled;
    raw.enableZoom = dragEnabled;
    if (raw.domElement) {
      raw.domElement.style.touchAction = dragEnabled ? 'none' : 'pan-y';
    }
  }, [dragEnabled]);

  // 카메라 프리셋 이동
  useEffect(() => {
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    const dist = distanceRef.current || 2.7;
    if (!cam || !controls || !isLoaded) return;

    if (preset === 'front') cam.position.set(0, 0, dist);
    if (preset === 'quarter') cam.position.set(dist * 0.72, 0.08, dist * 0.72);
    if (preset === 'back') cam.position.set(0, 0, -dist);
    controls.target.set(0, 0, 0);
    cam.lookAt(0, 0, 0);
    controls.update();
  }, [preset, presetTrigger, isLoaded]);

  // 활성 근육 하이라이트 & 뼈 레이어 토글 반영
  useEffect(() => {
    const root = modelRef.current;
    if (!root || !isLoaded) return;

    const activeSet = new Set<MuscleGroupId>(highlightedMuscles);
    const skeletonColor = readCssToken('--canvas-skeleton', '#e8dfd1');
    const dimColor = readCssToken('--canvas-muscle-dim', '#6e4949');
    const baseColor = readCssToken('--canvas-muscle-base', '#b24f47');

    import('three').then((THREE) => {
      root.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
        if (!mat || typeof mat.color === 'undefined') return;

        if (mesh.userData.isSkeleton) {
          mesh.visible = showSkeleton;
          mat.color.set(skeletonColor);
          mat.emissive?.set('#000000');
          mat.opacity = 1;
          mat.transparent = false;
          return;
        }

        mesh.visible = true;
        const group = mesh.userData.muscleGroup as MuscleGroupId | null;
        const isHit = group !== null && activeSet.has(group);

        if (isHit && group) {
          const fallback = isDark
            ? MUSCLE_META[group].colorDark
            : MUSCLE_META[group].colorLight;
          const accent = readCssToken(`--${group}`, fallback);
          mat.color.set(accent);
          mat.emissive?.set(accent);
          mat.emissiveIntensity = 0.35;
          mat.opacity = 1;
          mat.transparent = false;
        } else {
          mat.color.set(dimUnselected ? dimColor : baseColor);
          mat.emissive?.set('#000000');
          mat.emissiveIntensity = 0;
          mat.opacity = 1;
          mat.transparent = false;
        }
        mat.needsUpdate = true;
      });
    });
  }, [highlightedKey, highlightedMuscles, showSkeleton, dimUnselected, isLoaded, isDark]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border"
      style={{
        backgroundColor: 'var(--canvas-bg)',
        borderColor: 'var(--border)',
        height: `${heightPx}px`,
      }}
    >
      <div
        ref={mountRef}
        className={`h-full w-full ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{ touchAction: dragEnabled ? 'none' : 'pan-y' }}
      />

      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[#071020]/80 px-5 text-center text-[#eef5ff]">
          <Loader2 className="h-6 w-6 animate-spin text-[#4ad4e6]" />
          <div className="text-xs font-semibold">
            3D 근육 모델 로드 중 ({SAFETY_ATTRIBUTION.glbSizeMb}MB 경량)
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${Math.max(8, loadProgress)}%`,
                backgroundColor: '#4ad4e6',
              }}
            />
          </div>
          <span className="mono-num text-[11px] text-[#98abc4]">{loadProgress}%</span>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center text-xs text-[var(--warn)]">
          <ShieldAlert className="h-5 w-5" />
          <p className="max-w-xs">{loadError}</p>
        </div>
      )}
    </div>
  );
}

export default MuscleCanvas3D;
