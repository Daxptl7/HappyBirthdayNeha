import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CakeSlice, Check, Hand, Scissors } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CAKE, CAKE_CAMERA, cakePoint, createCutFace, createDripGeometry, createPipedCreamGeometry, getCakeCameraFraming, getCakeCutFrame } from '../utils/cakeGeometry';
import { CandleBlowing } from './CandleBlowing';

type CakeStatus = 'loading' | 'ready' | 'cutting' | 'sliced' | 'unavailable';

function createPastryTextures() {
  let seed = 71623;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#e5bf82'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6500; i++) {
    const light = random() > .42;
    ctx.fillStyle = light ? `rgba(255,238,187,${random() * .6})` : `rgba(127,77,27,${random() * .32})`;
    ctx.beginPath(); ctx.ellipse(random() * 256, random() * 256, .3 + random() * 1.9, .3 + random() * 1.3, random() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
  const sponge = new THREE.CanvasTexture(canvas);
  sponge.colorSpace = THREE.SRGBColorSpace;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = bumpCanvas.height = 128;
  const bumpCtx = bumpCanvas.getContext('2d')!;
  const noise = bumpCtx.createImageData(128, 128);
  for (let i = 0; i < noise.data.length; i += 4) {
    const value = 115 + Math.floor(random() * 45);
    noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value;
    noise.data[i + 3] = 255;
  }
  bumpCtx.putImageData(noise, 0, 0);
  const buttercream = new THREE.CanvasTexture(bumpCanvas);
  buttercream.wrapS = buttercream.wrapT = THREE.RepeatWrapping;
  buttercream.repeat.set(7, 3);
  return { sponge, buttercream };
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const glow = ctx.createRadialGradient(32, 32, 1, 32, 32, 31);
  glow.addColorStop(0, 'rgba(255,255,225,1)');
  glow.addColorStop(.2, 'rgba(255,222,120,.85)');
  glow.addColorStop(.5, 'rgba(255,143,35,.3)');
  glow.addColorStop(1, 'rgba(255,100,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export default function BirthdayCake3D({ recipientName, onComplete, onListeningChange }: { recipientName: string; onComplete: () => void; onListeningChange: (active: boolean) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const startCutRef = useRef<() => void>(() => {});
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const [status, setStatus] = useState<CakeStatus>('loading');
  const [candlesOut, setCandlesOut] = useState(false);
  const candlesOutRef = useRef(false);
  const blownAtRef = useRef<number | null>(null);
  const extinguish = () => { if (candlesOutRef.current) return; candlesOutRef.current = true; blownAtRef.current = performance.now(); setCandlesOut(true); };
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let disposed = false;
    let frameId = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let observer: ResizeObserver | undefined;
    let environment: THREE.WebGLRenderTarget | undefined;
    let removeEvents = () => {};
    const scene = new THREE.Scene();
    const textures = new Set<THREE.Texture>();

    const cleanup = () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      removeEvents();
      controls?.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
        if (object instanceof THREE.Sprite) materials.add(object.material);
        if (object instanceof THREE.InstancedMesh) object.dispose();
        if (object instanceof THREE.Light && 'shadow' in object) (object.shadow as THREE.LightShadow)?.dispose();
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      environment?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };

    try {
      const compact = window.matchMedia('(max-width: 700px)').matches;
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      const gl = renderer.getContext();
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      const software = /SwiftShader|llvmpipe|Software/i.test(String(gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER)));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, software ? 1 : compact ? 1.5 : 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = !software;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-label', `A strawberry birthday cake for ${recipientName}. Drag to rotate the view. Blow out the candles, then tap the cake to cut it.`);
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('data-testid', 'three-cake-canvas');
      container.appendChild(canvas);

      const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
      let cuttingZoom = 1.12;
      const initialPosition = new THREE.Vector3().fromArray(CAKE_CAMERA.idle.position);
      const cutPosition = new THREE.Vector3().fromArray(CAKE_CAMERA.cutting.position);
      const cutTarget = new THREE.Vector3().fromArray(CAKE_CAMERA.cutting.target);
      camera.position.copy(initialPosition);
      controls = new OrbitControls(camera, canvas);
      // OrbitControls sets touch-action:none inline; override it so a vertical
      // swipe over the model can still reach the instructions on a phone.
      canvas.style.touchAction = 'pan-y pinch-zoom';
      controls.target.fromArray(CAKE_CAMERA.idle.target);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = true;
      controls.dampingFactor = .065;
      controls.minPolarAngle = .45;
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = .32;
      controls.update();

      const room = new RoomEnvironment();
      const pmrem = new THREE.PMREMGenerator(renderer);
      environment = pmrem.fromScene(room, .05);
      scene.environment = environment.texture;
      scene.environmentIntensity = .65;
      room.dispose(); pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xfff5e6, 0xba9395, 1.15));
      const key = new THREE.DirectionalLight(0xfff2dc, 3.4);
      key.position.set(-3.5, 7, 4.5);
      key.castShadow = !software;
      key.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .1, far: 18 });
      key.shadow.bias = -.0003;
      key.shadow.normalBias = .025;
      key.shadow.radius = 4;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffd4cf, 2.2);
      rim.position.set(3.5, 4.5, -3.5); scene.add(rim);
      const fill = new THREE.DirectionalLight(0xffffff, .6);
      fill.position.set(4, 2, 4); scene.add(fill);

      const pastry = createPastryTextures();
      textures.add(pastry.sponge); textures.add(pastry.buttercream);
      const cream = new THREE.MeshPhysicalMaterial({ color: 0xffeed8, roughness: .53, bumpMap: pastry.buttercream, bumpScale: .014, clearcoat: .06 });
      const icing = new THREE.MeshPhysicalMaterial({ color: 0xe8a5b1, roughness: .28, clearcoat: .4, clearcoatRoughness: .32, bumpMap: pastry.buttercream, bumpScale: .006, side: THREE.DoubleSide });
      const sponge = new THREE.MeshStandardMaterial({ map: pastry.sponge, bumpMap: pastry.sponge, bumpScale: .035, roughness: .96, side: THREE.DoubleSide });
      const filling = new THREE.MeshStandardMaterial({ color: 0xfff4df, roughness: .6, side: THREE.DoubleSide });
      const jam = new THREE.MeshPhysicalMaterial({ color: 0x9e2946, roughness: .24, clearcoat: .6, side: THREE.DoubleSide });
      const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xfff9ee, roughness: .18, metalness: .02, clearcoat: 1, clearcoatRoughness: .1 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xb99456, metalness: .85, roughness: .28 });
      const silver = new THREE.MeshPhysicalMaterial({ color: 0xe8e6e1, metalness: 1, roughness: .14, clearcoat: .6, transparent: true });
      const handleMaterial = new THREE.MeshPhysicalMaterial({ color: 0x6b3446, roughness: .25, clearcoat: .8, transparent: true });
      const ruby = new THREE.MeshPhysicalMaterial({ color: 0xb51e37, roughness: .34, clearcoat: .55, bumpMap: pastry.buttercream, bumpScale: .012 });
      const green = new THREE.MeshStandardMaterial({ color: 0x45653b, roughness: .7 });
      const seedMaterial = new THREE.MeshStandardMaterial({ color: 0xe6b15c, roughness: .75 });

      const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = scene) => {
        const object = new THREE.Mesh(geometry, material);
        object.castShadow = true; object.receiveShadow = true; parent.add(object);
        return object;
      };

      const floor = mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: .14 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = -.012; floor.castShadow = false;
      const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
      const shadowContext = shadowCanvas.getContext('2d')!;
      const shadowGradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
      shadowGradient.addColorStop(0, 'rgba(80,49,30,.22)'); shadowGradient.addColorStop(1, 'rgba(80,49,30,0)');
      shadowContext.fillStyle = shadowGradient; shadowContext.fillRect(0, 0, 128, 128);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas); textures.add(shadowTexture);
      const contact = mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
      contact.rotation.x = -Math.PI / 2; contact.position.y = -.005; contact.castShadow = false;

      const standProfile = [[0, 0], [.64, 0], [.73, .035], [.74, .07], [.59, .11], [.25, .17], [.19, .32], [.3, .38], [1.46, .41], [1.57, .46], [1.57, .49], [1.5, .51], [0, .51]];
      mesh(new THREE.LatheGeometry(standProfile.map(([r, y]) => new THREE.Vector2(r, y)), 96), porcelain);
      const standRim = mesh(new THREE.TorusGeometry(1.554, .014, 8, 96), gold);
      standRim.rotation.x = Math.PI / 2; standRim.position.y = .49;
      const sliceDirection = CAKE.sliceStart + CAKE.sliceAngle / 2;
      const servingPosition = cakePoint(sliceDirection, CAKE.plateRadius);
      const plate = new THREE.Group(); plate.position.copy(servingPosition); scene.add(plate);
      const plateProfile = [[0, .035], [.62, .035], [.85, .06], [.87, .09], [.84, .11], [.62, .15], [0, .16]];
      mesh(new THREE.LatheGeometry(plateProfile.map(([r, y]) => new THREE.Vector2(r, y)), 64), porcelain, plate);
      const plateRim = mesh(new THREE.TorusGeometry(.85, .009, 8, 64), gold, plate);
      plateRim.rotation.x = Math.PI / 2; plateRim.position.y = .10;

      const mainCake = new THREE.Group(); const slice = new THREE.Group();
      scene.add(mainCake, slice);
      const topY = CAKE.bottom + CAKE.height;
      const cutMeshes: THREE.Object3D[] = [];

      function buildCakePart(parent: THREE.Group, start: number, sweep: number) {
        const segments = Math.max(18, Math.ceil(sweep / (Math.PI * 2) * 100));
        let y = CAKE.bottom;
        [.34, .10, .34, .10, .34].forEach((height, i) => {
          const material = i % 2 === 0 ? sponge : filling;
          const layer = mesh(new THREE.CylinderGeometry(CAKE.radius - .012, CAKE.radius - .012, height, segments, 1, false, start, sweep), material, parent);
          layer.position.y = y + height / 2;
          for (const angle of [start, start + sweep]) {
            mesh(createCutFace(CAKE.radius, y, height, angle), material, parent);
            if (i % 2 === 1) mesh(createCutFace(CAKE.radius, y + height * .65, .026, angle), jam, parent);
          }
          y += height;
        });
        const shell = mesh(new THREE.CylinderGeometry(CAKE.radius, CAKE.radius + .006, CAKE.height, segments, 12, true, start, sweep), cream, parent);
        shell.position.y = CAKE.bottom + CAKE.height / 2;
        cutMeshes.push(shell);
        const top = mesh(new THREE.CylinderGeometry(CAKE.radius + .012, CAKE.radius + .012, .045, segments, 1, false, start, sweep), icing, parent);
        top.position.y = topY + .018; cutMeshes.push(top);
        mesh(createDripGeometry(start, sweep), icing, parent);
      }
      buildCakePart(mainCake, CAKE.sliceStart + CAKE.sliceAngle, Math.PI * 2 - CAKE.sliceAngle);
      buildCakePart(slice, CAKE.sliceStart, CAKE.sliceAngle);
      const partAt = (angle: number) => angle >= CAKE.sliceStart && angle <= CAKE.sliceStart + CAKE.sliceAngle ? slice : mainCake;
      const pipedGeometry = createPipedCreamGeometry();
      const berryGeometry = new THREE.LatheGeometry([[.014, 0], [.05, .035], [.09, .09], [.118, .17], [.106, .23], [.06, .26], [0, .265]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
      const leafGeometry = new THREE.SphereGeometry(1, 10, 6);
      const seedGeometry = new THREE.SphereGeometry(.007, 5, 4);
      function strawberry(parent: THREE.Object3D, angle: number, radius = .99) {
        const fruit = new THREE.Group(); fruit.position.copy(cakePoint(angle, radius, topY + .06)); fruit.rotation.set(.12 * Math.cos(angle), angle, .12 * Math.sin(angle));
        parent.add(fruit); mesh(berryGeometry, ruby, fruit);
        for (let i = 0; i < 5; i++) {
          const leaf = mesh(leafGeometry, green, fruit);
          const a = i / 5 * Math.PI * 2;
          leaf.position.set(Math.sin(a) * .04, .268, Math.cos(a) * .04);
          leaf.scale.set(.037, .007, .085); leaf.rotation.y = a; leaf.rotation.x = -.25;
        }
        const seeds = new THREE.InstancedMesh(seedGeometry, seedMaterial, 42);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < 42; i++) {
          const row = Math.floor(i / 7); const a = i % 7 / 7 * Math.PI * 2 + row * .42;
          const y = .044 + row * .033;
          const radius = y < .17 ? .053 + (y - .044) / .126 * .066 : .119 - (y - .17) * .4;
          dummy.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
          dummy.rotation.set(0, a, .3); dummy.scale.set(.65, 1, .45); dummy.updateMatrix(); seeds.setMatrixAt(i, dummy.matrix);
        }
        fruit.add(seeds);
      }
      for (let i = 0; i < 12; i++) {
        const angle = i / 12 * Math.PI * 2 + .07;
        const parent = partAt(angle);
        if (i % 2 === 0) strawberry(parent, angle);
        else {
          const rosette = mesh(pipedGeometry, filling, parent);
          rosette.position.copy(cakePoint(angle, 1.02, topY + .04)); rosette.rotation.y = angle;
        }
      }
      for (let i = 0; i < 48; i++) {
        const angle = i / 48 * Math.PI * 2;
        const piping = mesh(pipedGeometry, cream, partAt(angle));
        piping.position.copy(cakePoint(angle, 1.23, CAKE.bottom + .025));
        piping.scale.set(.43, .44, .43); piping.rotation.y = angle;
      }
      strawberry(slice, sliceDirection, .71);
      const pearlGeometry = new THREE.SphereGeometry(.018, 10, 8);
      for (let i = 0; i < 40; i++) {
        const angle = i / 40 * Math.PI * 2;
        const pearl = mesh(pearlGeometry, i % 5 === 0 ? gold : filling, partAt(angle));
        pearl.position.copy(cakePoint(angle, 1.18, topY + .052));
      }

      // Lettering is a transparent icing decal on the real cake surface.
      const writingCanvas = document.createElement('canvas'); writingCanvas.width = 1024; writingCanvas.height = 512;
      const writingContext = writingCanvas.getContext('2d')!;
      writingContext.textAlign = 'center'; writingContext.textBaseline = 'middle';
      writingContext.fillStyle = '#8a4153'; writingContext.shadowColor = '#fff3d9'; writingContext.shadowOffsetY = 2;
      writingContext.font = 'italic 50px Georgia'; writingContext.fillText('Happy Birthday', 512, 135);
      writingContext.font = `italic ${Math.min(148, 660 / Math.max(1, recipientName.length) * 1.6)}px Georgia`;
      writingContext.fillText(recipientName, 512, 280, 850);
      const writingTexture = new THREE.CanvasTexture(writingCanvas); writingTexture.colorSpace = THREE.SRGBColorSpace; textures.add(writingTexture);
      const writing = mesh(new THREE.PlaneGeometry(1.52, .76), new THREE.MeshStandardMaterial({ map: writingTexture, transparent: true, depthWrite: false, roughness: .6, polygonOffset: true, polygonOffsetFactor: -1 }), mainCake);
      writing.rotation.x = -Math.PI / 2; writing.position.set(-.14, topY + .043, -.1); writing.castShadow = false;

      const glowTexture = createGlowTexture(); textures.add(glowTexture);
      const flames: { sprite: THREE.Sprite; smoke: THREE.Sprite; core: THREE.Mesh; light: THREE.PointLight; y: number; phase: number }[] = [];
      const waxMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf7dcc1, roughness: .35, clearcoat: .25 });
      const wickMaterial = new THREE.MeshStandardMaterial({ color: 0x493127, roughness: 1 });
      for (let i = 0; i < 3; i++) {
        const angle = 3 + i * .63;
        const position = cakePoint(angle, .66, topY + .04);
        const candle = new THREE.Group(); candle.position.copy(position); mainCake.add(candle);
        const height = i === 1 ? .57 : .46;
        const wax = mesh(new THREE.CylinderGeometry(.033, .034, height, 20), waxMaterial, candle); wax.position.y = height / 2;
        const spiral = new THREE.CurvePath<THREE.Vector3>();
        const points = Array.from({ length: 100 }, (_, n) => {
          const t = n / 99; return new THREE.Vector3(Math.sin(t * Math.PI * 12) * .034, t * height, Math.cos(t * Math.PI * 12) * .034);
        });
        spiral.add(new THREE.CatmullRomCurve3(points));
        mesh(new THREE.TubeGeometry(spiral, 100, .0035, 4, false), gold, candle);
        const waxLip = mesh(new THREE.TorusGeometry(.025, .008, 6, 18), waxMaterial, candle); waxLip.rotation.x = Math.PI / 2; waxLip.position.y = height;
        const wick = mesh(new THREE.CylinderGeometry(.004, .004, .041, 6), wickMaterial, candle); wick.position.y = height + .015;
        const spriteMaterial = new THREE.SpriteMaterial({ map: glowTexture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xffbb61 });
        const sprite = new THREE.Sprite(spriteMaterial); sprite.position.y = height + .10; sprite.scale.set(.16, .25, 1); candle.add(sprite);
        const core = mesh(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffefbc, transparent: true, depthWrite: false }), candle);
        core.position.y = height + .067; core.scale.set(.019, .05, .019); core.castShadow = false;
        const light = new THREE.PointLight(0xffac52, .7, 1.7, 2); light.position.y = height + .10; candle.add(light);
        const smoke = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xada499, transparent: true, opacity: 0, depthWrite: false }));
        smoke.position.y = height + .1; smoke.scale.set(.12, .18, 1); candle.add(smoke);
        flames.push({ sprite, smoke, core, light, y: height + .10, phase: i * 2.3 });
      }

      const knife = new THREE.Group(); scene.add(knife); knife.visible = false;
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0); bladeShape.lineTo(1.48, 0); bladeShape.lineTo(1.48, .26); bladeShape.lineTo(.22, .26); bladeShape.quadraticCurveTo(.02, .24, 0, .06); bladeShape.closePath();
      const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, { depth: .023, bevelEnabled: true, bevelSize: .009, bevelThickness: .007, bevelSegments: 2, steps: 1 });
      bladeGeometry.rotateY(-Math.PI / 2);
      mesh(bladeGeometry, silver, knife);
      const bolster = mesh(new THREE.CylinderGeometry(.05, .05, .13, 16), silver, knife); bolster.rotation.x = Math.PI / 2; bolster.position.set(0, .13, 1.5);
      const grip = mesh(new THREE.CapsuleGeometry(.055, .48, 6, 18), handleMaterial, knife); grip.rotation.x = Math.PI / 2; grip.position.set(0, .13, 1.84);
      for (const z of [1.7, 1.97]) { const pin = mesh(new THREE.SphereGeometry(.014, 8, 6), silver, knife); pin.position.set(-.052, .13, z); }

      const crumbs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.018, 0), sponge, 22);
      crumbs.visible = false; scene.add(crumbs);
      const crumbDummy = new THREE.Object3D();
      let cutStart: number | null = null;
      let complete = false;
      let notified = false;
      let hasRotated = false;
      const startCut = () => {
        if (cutStart !== null || disposed || !candlesOutRef.current) return;
        cutStart = performance.now();
        controls!.enabled = false; controls!.autoRotate = false;
        setStatus('cutting');
      };
      startCutRef.current = startCut;
      controls.addEventListener('start', () => { hasRotated = true; controls!.autoRotate = false; });
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let pointerDown = { x: 0, y: 0 };
      const onPointerDown = (event: PointerEvent) => { pointerDown = { x: event.clientX, y: event.clientY }; canvas.classList.add('is-dragging'); };
      const onPointerCancel = () => canvas.classList.remove('is-dragging');
      const onPointerUp = (event: PointerEvent) => {
        canvas.classList.remove('is-dragging');
        if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) return;
        const rect = canvas.getBoundingClientRect();
        pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.intersectObjects(cutMeshes).length) startCut();
      };
      const onContextLost = (event: Event) => { event.preventDefault(); if (!disposed) { cancelAnimationFrame(frameId); setStatus('unavailable'); } };
      canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointerup', onPointerUp); canvas.addEventListener('pointercancel', onPointerCancel); canvas.addEventListener('webglcontextlost', onContextLost);
      removeEvents = () => { canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerup', onPointerUp); canvas.removeEventListener('pointercancel', onPointerCancel); canvas.removeEventListener('webglcontextlost', onContextLost); };
      const resize = () => {
        const width = container.clientWidth; const height = container.clientHeight;
        if (!width || !height) return;
        // CSS owns the canvas size. Its drawing buffer must not widen the grid
        // and trigger another ResizeObserver update on every frame.
        renderer!.setSize(width, height, false);
        const framing = getCakeCameraFraming(width, height);
        camera.aspect = framing.aspect;
        camera.fov = framing.fov;
        cuttingZoom = framing.cuttingZoom;
        camera.zoom = cutStart === null ? framing.idleZoom : cuttingZoom;
        camera.updateProjectionMatrix();
      };
      observer = new ResizeObserver(resize); observer.observe(container); resize();
      let previous = performance.now();
      let ready = false;
      function render(time: number) {
        if (disposed) return;
        frameId = requestAnimationFrame(render);
        if (document.hidden) { previous = time; return; }
        const delta = Math.min((time - previous) / 1000, .05); previous = time;
        const seconds = cutStart === null ? 0 : (time - cutStart) / 1000;
        const progress = cutStart === null ? 0 : reducedMotion ? 1 : Math.min(seconds / CAKE.cutSeconds, 1);
        const frame = getCakeCutFrame(progress);
        if (cutStart !== null) {
          camera.position.lerp(cutPosition, 1 - Math.exp(-delta * 2.4));
          camera.zoom = THREE.MathUtils.damp(camera.zoom, cuttingZoom, 2.4, delta);
          camera.updateProjectionMatrix();
          controls!.target.lerp(cutTarget, 1 - Math.exp(-delta * 2.4));
          knife.visible = frame.knifeOpacity > .005;
          knife.position.y = frame.knifeY; knife.rotation.y = frame.knifeAngle;
          silver.opacity = handleMaterial.opacity = frame.knifeOpacity;
          const point = cakePoint(sliceDirection, frame.sliceDistance, frame.sliceY);
          slice.position.copy(point); slice.rotation.z = frame.sliceTilt;
          crumbs.visible = progress > .71;
          for (let i = 0; i < 22; i++) {
            const t = Math.min(1, Math.max(0, (progress - .71) / .23));
            const a = sliceDirection + Math.sin(i * 4.8) * .22;
            const distance = .8 + frame.sliceDistance * .7 + Math.sin(i * 3.7) * .24;
            crumbDummy.position.copy(cakePoint(a, distance, Math.max(.18, .65 - t * t * .6 + Math.sin(i) * .07)));
            crumbDummy.rotation.set(i + t, i * 2, i); crumbDummy.scale.setScalar(.4 + i % 4 * .22); crumbDummy.updateMatrix(); crumbs.setMatrixAt(i, crumbDummy.matrix);
          }
          crumbs.instanceMatrix.needsUpdate = true;
          if (frame.extracted && !complete) { complete = true; setStatus('sliced'); }
          if (!notified && seconds >= (reducedMotion ? .8 : CAKE.cutSeconds + .95)) { notified = true; completeRef.current(); }
        } else if (!hasRotated) controls!.autoRotate = !reducedMotion;
        flames.forEach(({ sprite, smoke, core, light, y, phase }) => {
          const flicker = reducedMotion ? 1 : 1 + Math.sin(time * .012 + phase) * .09 + Math.sin(time * .021 + phase) * .035;
          const sinceBlow = blownAtRef.current === null ? null : (time - blownAtRef.current) / 1000;
          const intensity = (cutStart === null ? 1 : frame.candleIntensity) * (sinceBlow === null ? 1 : Math.max(0, 1 - sinceBlow / .35));
          sprite.material.opacity = intensity * .8;
          sprite.position.y = y + (flicker - 1) * .035;
          sprite.scale.set(.13 * flicker, .24 * flicker, 1);
          (core.material as THREE.MeshBasicMaterial).opacity = intensity;
          core.scale.y = .05 * flicker;
          light.intensity = .65 * flicker * intensity;
          smoke.material.opacity = sinceBlow !== null && !reducedMotion ? Math.max(0, Math.min(1, sinceBlow * 4)) * Math.max(0, 1 - sinceBlow / 1.6) * .25 : 0;
          if (sinceBlow !== null) { smoke.position.set(Math.sin(sinceBlow * 3 + phase) * .035, y + sinceBlow * .19, 0); smoke.scale.set(.12 + sinceBlow * .07, .18 + sinceBlow * .14, 1); }
        });
        controls!.update(delta);
        renderer!.render(scene, camera);
        if (!ready) { ready = true; setStatus('ready'); }
      }
      frameId = requestAnimationFrame(render);
    } catch (error) {
      cleanup();
      console.warn('Birthday cake renderer is unavailable:', error);
      setStatus('unavailable');
    }
    return cleanup;
  }, [recipientName, reducedMotion]);

  return <div className="three-cake-experience" data-cake-state={status} data-candles-lit={!candlesOut}>
    <div className="cake-viewport" ref={mountRef} style={{ display: status === 'unavailable' ? 'none' : undefined }}>
      {status === 'loading' && <div className="cake-loading" role="status"><CakeSlice size={27} strokeWidth={1} /><span>Setting the table for your birthday…</span></div>}
      {status !== 'loading' && status !== 'unavailable' && <span className="cake-scene-label">Drag sideways to turn your cake</span>}
    </div>
    {status === 'unavailable' ? <div className="cake-fallback"><CakeSlice size={56} strokeWidth={1} /><p>A birthday wish is just as special here.</p><button className="primary-button" onClick={() => completeRef.current()}>Make a wish & continue <ArrowRight size={17} /></button></div> : <div className="cake-controls">
      <p className="cake-interaction-hint"><Hand size={15} />{status === 'ready' ? candlesOut ? 'Step 2 · Tap the cake or cut your first slice below.' : 'Step 1 · Make a wish and blow out the candles.' : status === 'sliced' ? 'Your first slice, served with love.' : status === 'cutting' ? 'Two little cuts. One very big wish.' : 'Your cake is getting ready.'}</p>
      {status === 'ready' && !candlesOut ? <CandleBlowing onBlown={extinguish} onListeningChange={onListeningChange} /> : <>
      <button className="primary-button" disabled={status !== 'ready'} onClick={() => startCutRef.current()}>
        {status === 'sliced' ? <Check size={17} /> : <Scissors size={17} />}
        {status === 'loading' ? 'Your cake is getting ready…' : status === 'cutting' ? 'Making your birthday slice…' : status === 'sliced' ? 'A wish worth celebrating' : 'Make a wish & cut the cake'}
        {status === 'ready' && <ArrowRight size={17} />}
      </button>
      <p className="small-note">{status === 'loading' ? 'Your cake and candles will appear in a moment.' : status === 'cutting' || status === 'sliced' ? 'The candles are out. Your next surprise is on its way.' : 'Wish made. Candles out. The first slice is yours.'}</p>
      </>}
    </div>}
  </div>;
}
