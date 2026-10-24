import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sparkles, RotateCcw, Eye, Heart, Utensils } from 'lucide-react';
import { CakeCutState, computeCakeCutKinematics } from '../utils/birthdayLogic';
import { triggerCelebrationConfetti } from '../utils/confettiUtils';

interface CakeCandlesSectionProps {
  recipientName: string;
}

type CameraPreset = 'front' | 'top' | 'closeup';

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0, 3.1, 6.2], target: [0, 0.9, 0] },
  top: { pos: [0.2, 5.8, 2.8], target: [0, 0.8, 0] },
  closeup: { pos: [2.6, 2.1, 3.2], target: [0.45, 0.95, 0.25] },
};

// Pre-allocated scratch vectors outside render loop (zero GC in rAF)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export const CakeCandlesSection: React.FC<CakeCandlesSectionProps> = ({ recipientName }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [cutState, setCutState] = useState<CakeCutState>('whole');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front');
  const [giftBoxOpened, setGiftBoxOpened] = useState(false);

  // Store mutable state in refs so WebGL scene never tears down on UI updates
  const cutStateRef = useRef<CakeCutState>('whole');
  const cutProgressRef = useRef<number>(0);
  const giftOpenRef = useRef<boolean>(false);
  const giftProgressRef = useRef<number>(0);
  const activePresetRef = useRef<CameraPreset | null>('front');

  const handleCutCake = () => {
    if (cutStateRef.current === 'whole') {
      cutStateRef.current = 'cutting';
      cutProgressRef.current = 0;
      setCutState('cutting');
      activePresetRef.current = 'closeup';
      setCameraPreset('closeup');
      triggerCelebrationConfetti();
    }
  };

  const handleResetCake = () => {
    cutStateRef.current = 'whole';
    cutProgressRef.current = 0;
    setCutState('whole');
    activePresetRef.current = 'front';
    setCameraPreset('front');
  };

  const handleToggle3DGift = () => {
    const next = !giftOpenRef.current;
    giftOpenRef.current = next;
    setGiftBoxOpened(next);
    if (next) {
      triggerCelebrationConfetti();
    }
  };

  const handleSelectCamera = (preset: CameraPreset) => {
    activePresetRef.current = preset;
    setCameraPreset(preset);
  };

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container || typeof window === 'undefined') return;

    // 1. Detect software WebGL from GPU renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfffaf5, 0.025);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.1, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.setAttribute('data-testid', 'three-cake-canvas');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Environment Map via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 0.9, 0);

    controls.addEventListener('start', () => {
      activePresetRef.current = null;
    });

    // 4. Studio 3-Point Lighting Rig (Warm Sunlit Key + Peach Hemisphere Fill + Golden Rim)
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xfde68a, 1.05);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    keyLight.position.set(4.5, 7.5, 5.0);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfb7185, 1.35);
    rimLight.position.set(-5.0, 4.0, -4.5);
    scene.add(rimLight);

    // 5. Shared PBR Materials (varied roughness & metalness >= 0.25 difference)
    const brushedGoldMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.4,
    });

    const porcelainPlateMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff8f6,
      metalness: 0.05,
      roughness: 0.12,
      clearcoat: 0.8,
    });

    const roseFrostingMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.45,
      metalness: 0.05,
    });

    const creamFrostingMat = new THREE.MeshStandardMaterial({
      color: 0xfff1f2,
      roughness: 0.38,
      metalness: 0.04,
    });

    const spongeInteriorMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.82,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const berryJamMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.25,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    const strawberryRubyMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.65,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.55,
      metalness: 0.05,
    });

    const steelBladeMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 0.5,
    });

    const roseGoldHandleMat = new THREE.MeshPhysicalMaterial({
      color: 0xfda4af,
      metalness: 0.85,
      roughness: 0.22,
    });

    // 6. Soft Warm Contact Shadow Disc on Floor (y = 0.015)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
      grad.addColorStop(0, 'rgba(136, 19, 55, 0.24)');
      grad.addColorStop(1, 'rgba(136, 19, 55, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 32),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.65 })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.015;
    scene.add(contactShadow);

    // 7. Build Composite 3D Cake Pedestal & Main Cake Group (300 degrees: Math.PI/3 to 2*Math.PI)
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Pedestal base + stem + platter rim
    const pedestalBase = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 0.25, 32), brushedGoldMat);
    pedestalBase.position.y = 0.125;
    stageGroup.add(pedestalBase);

    const pedestalPlatter = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.65, 0.1, 40), porcelainPlateMat);
    pedestalPlatter.position.y = 0.3;
    pedestalPlatter.receiveShadow = true;
    stageGroup.add(pedestalPlatter);

    const platterGoldRim = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.035, 12, 48), brushedGoldMat);
    platterGoldRim.rotation.x = Math.PI / 2;
    platterGoldRim.position.y = 0.33;
    stageGroup.add(platterGoldRim);

    // Side serving plate for the cut slice
    const sidePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.75, 0.06, 32), porcelainPlateMat);
    sidePlate.position.set(Math.cos(Math.PI / 6) * 1.35, 0.05, Math.sin(Math.PI / 6) * 1.35);
    stageGroup.add(sidePlate);

    // Helper to build a strawberry prop (berry body + green leaf crown)
    const createStrawberryProp = () => {
      const berryGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 14), strawberryRubyMat);
      body.rotation.x = Math.PI;
      body.position.y = 0.11;
      berryGroup.add(body);

      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.02, 0.04, 7), leafMat);
      crown.position.y = 0.22;
      berryGroup.add(crown);
      return berryGroup;
    };

    // Main Cake Body (5/6 of circle: thetaStart = Math.PI/3, thetaLength = 5*Math.PI/3)
    const mainCakeGroup = new THREE.Group();
    stageGroup.add(mainCakeGroup);

    const tier1Main = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.38, 0.72, 40, 1, false, Math.PI / 3, (5 * Math.PI) / 3),
      roseFrostingMat
    );
    tier1Main.position.y = 0.35 + 0.36;
    tier1Main.castShadow = true;
    tier1Main.receiveShadow = true;
    mainCakeGroup.add(tier1Main);

    const tier2Main = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.98, 0.56, 36, 1, false, Math.PI / 3, (5 * Math.PI) / 3),
      creamFrostingMat
    );
    tier2Main.position.y = 0.35 + 0.72 + 0.28;
    tier2Main.castShadow = true;
    mainCakeGroup.add(tier2Main);

    // Interior sponge & berry jam cross-section faces on Main Cake at angle 0 and angle Math.PI/3
    const createInteriorCutWall = (radius: number, height: number, yCenter: number, angle: number) => {
      const wallGroup = new THREE.Group();
      const spongePlane = new THREE.Mesh(new THREE.PlaneGeometry(radius, height), spongeInteriorMat);
      spongePlane.position.set(radius / 2, yCenter, 0);
      wallGroup.add(spongePlane);

      const jamStripe = new THREE.Mesh(new THREE.PlaneGeometry(radius * 0.96, height * 0.14), berryJamMat);
      jamStripe.position.set(radius / 2, yCenter, 0.004);
      wallGroup.add(jamStripe);

      const jamStripeBack = jamStripe.clone();
      jamStripeBack.position.z = -0.004;
      wallGroup.add(jamStripeBack);

      wallGroup.rotation.y = -angle;
      return wallGroup;
    };

    mainCakeGroup.add(createInteriorCutWall(1.35, 0.71, 0.35 + 0.36, 0));
    mainCakeGroup.add(createInteriorCutWall(1.35, 0.71, 0.35 + 0.36, Math.PI / 3));
    mainCakeGroup.add(createInteriorCutWall(0.95, 0.55, 0.35 + 0.72 + 0.28, 0));
    mainCakeGroup.add(createInteriorCutWall(0.95, 0.55, 0.35 + 0.72 + 0.28, Math.PI / 3));

    // Whipped cream rosettes & strawberries around Main Cake
    for (let i = 1; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + Math.PI / 6;
      const dollop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), creamFrostingMat);
      dollop.position.set(Math.cos(angle) * 1.15, 0.35 + 0.72 + 0.06, Math.sin(angle) * 1.15);
      mainCakeGroup.add(dollop);

      const topBerry = createStrawberryProp();
      topBerry.position.set(Math.cos(angle) * 0.68, 0.35 + 1.28, Math.sin(angle) * 0.68);
      mainCakeGroup.add(topBerry);
    }

    // 8. Independent 60-degree Cuttable 3D Cake Wedge Group (thetaStart = 0, thetaLength = Math.PI/3)
    const sliceWedgeGroup = new THREE.Group();
    stageGroup.add(sliceWedgeGroup);

    const tier1Slice = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.38, 0.72, 16, 1, false, 0, Math.PI / 3),
      roseFrostingMat
    );
    tier1Slice.position.y = 0.35 + 0.36;
    tier1Slice.castShadow = true;
    sliceWedgeGroup.add(tier1Slice);

    const tier2Slice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.98, 0.56, 16, 1, false, 0, Math.PI / 3),
      creamFrostingMat
    );
    tier2Slice.position.y = 0.35 + 0.72 + 0.28;
    tier2Slice.castShadow = true;
    sliceWedgeGroup.add(tier2Slice);

    sliceWedgeGroup.add(createInteriorCutWall(1.35, 0.71, 0.35 + 0.36, 0));
    sliceWedgeGroup.add(createInteriorCutWall(1.35, 0.71, 0.35 + 0.36, Math.PI / 3));
    sliceWedgeGroup.add(createInteriorCutWall(0.95, 0.55, 0.35 + 0.72 + 0.28, 0));
    sliceWedgeGroup.add(createInteriorCutWall(0.95, 0.55, 0.35 + 0.72 + 0.28, Math.PI / 3));

    const sliceAngle = Math.PI / 6;
    const sliceDollop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), creamFrostingMat);
    sliceDollop.position.set(Math.cos(sliceAngle) * 1.15, 0.35 + 0.72 + 0.06, Math.sin(sliceAngle) * 1.15);
    sliceWedgeGroup.add(sliceDollop);

    const sliceBerry = createStrawberryProp();
    sliceBerry.position.set(Math.cos(sliceAngle) * 0.68, 0.35 + 1.28, Math.sin(sliceAngle) * 0.68);
    sliceWedgeGroup.add(sliceBerry);

    // 9. Composite 3D Cake Server Knife (Handle + Bolster + Polished Beveled Blade)
    const knifeGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(1.45, 0.22, 0.025);
    const bladeMesh = new THREE.Mesh(bladeGeo, steelBladeMat);
    bladeMesh.position.set(0.65, 0, 0);
    knifeGroup.add(bladeMesh);

    const bolsterMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 16), brushedGoldMat);
    bolsterMesh.rotation.z = Math.PI / 2;
    bolsterMesh.position.set(-0.08, 0, 0);
    knifeGroup.add(bolsterMesh);

    const handleMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.55, 8, 16), roseGoldHandleMat);
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.position.set(-0.42, 0, 0);
    knifeGroup.add(handleMesh);

    knifeGroup.position.set(0.15, 2.35, 0.02);
    knifeGroup.rotation.y = -Math.PI / 6;
    stageGroup.add(knifeGroup);

    // 10. 3D Extruded Beveled Heart Sculptures & 3D Gift Box with Opening Lid
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.15);
    heartShape.bezierCurveTo(0, 0.15, -0.15, 0.35, -0.32, 0.35);
    heartShape.bezierCurveTo(-0.55, 0.35, -0.55, 0.02, -0.55, 0.02);
    heartShape.bezierCurveTo(-0.55, -0.2, -0.32, -0.42, 0, -0.62);
    heartShape.bezierCurveTo(0.32, -0.42, 0.55, -0.2, 0.55, 0.02);
    heartShape.bezierCurveTo(0.55, 0.02, 0.55, 0.35, 0.32, 0.35);
    heartShape.bezierCurveTo(0.15, 0.35, 0, 0.15, 0, 0.15);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
    heartGeo.center();

    const floatingHearts: THREE.Mesh[] = [];
    const heartPositions: [number, number, number, number][] = [
      [-2.3, 1.8, -0.8, 0.45],
      [2.4, 2.1, -1.1, 0.38],
      [-1.8, 2.7, 0.6, 0.32],
    ];
    heartPositions.forEach(([hx, hy, hz, sc], idx) => {
      const hMesh = new THREE.Mesh(heartGeo, idx % 2 === 0 ? strawberryRubyMat : brushedGoldMat);
      hMesh.position.set(hx, hy, hz);
      hMesh.scale.setScalar(sc);
      stageGroup.add(hMesh);
      floatingHearts.push(hMesh);
    });

    // 3D Gift Box on the left side of the stage
    const giftGroup = new THREE.Group();
    giftGroup.position.set(-2.25, 0.02, 0.85);
    giftGroup.rotation.y = 0.42;
    stageGroup.add(giftGroup);

    const giftBoxMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.42,
      metalness: 0.1,
    });

    const giftBase = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.68, 0.86), giftBoxMat);
    giftBase.position.y = 0.34;
    giftBase.castShadow = true;
    giftGroup.add(giftBase);

    const ribbonV1 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.69, 0.14), brushedGoldMat);
    ribbonV1.position.y = 0.34;
    giftGroup.add(ribbonV1);

    const ribbonV2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.69, 0.88), brushedGoldMat);
    ribbonV2.position.y = 0.34;
    giftGroup.add(ribbonV2);

    const giftLidGroup = new THREE.Group();
    giftLidGroup.position.set(0, 0.7, 0);
    giftGroup.add(giftLidGroup);

    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.92), roseFrostingMat);
    giftLidGroup.add(lidMesh);

    const bowLoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 10, 24), brushedGoldMat);
    bowLoop1.position.set(-0.1, 0.14, 0);
    bowLoop1.rotation.z = 0.4;
    giftLidGroup.add(bowLoop1);

    const bowLoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 10, 24), brushedGoldMat);
    bowLoop2.position.set(0.1, 0.14, 0);
    bowLoop2.rotation.z = -0.4;
    giftLidGroup.add(bowLoop2);

    // Surprise 3D Heart inside the gift box
    const giftInnerHeart = new THREE.Mesh(heartGeo, brushedGoldMat);
    giftInnerHeart.scale.setScalar(0.32);
    giftInnerHeart.position.set(0, 0.45, 0);
    giftGroup.add(giftInnerHeart);

    // Pre-compile shaders on hardware WebGL
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for direct 3D clicks on the cake or gift box
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactables: THREE.Object3D[] = [tier1Main, tier2Main, tier1Slice, tier2Slice, giftBase, lidMesh];

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj === giftBase || hitObj === lidMesh) {
          handleToggle3DGift();
        } else {
          if (cutStateRef.current === 'whole') {
            handleCutCake();
          } else if (cutStateRef.current === 'sliced') {
            handleResetCake();
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 900;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Software-WebGL safe loop scheduling via afterDraw
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Advance cake cutting progress smoothly
      if (cutStateRef.current === 'cutting') {
        cutProgressRef.current = Math.min(1, cutProgressRef.current + dt * 0.65);
        if (cutProgressRef.current >= 1) {
          cutStateRef.current = 'sliced';
          setCutState('sliced');
        }
      } else if (cutStateRef.current === 'whole') {
        cutProgressRef.current = THREE.MathUtils.damp(cutProgressRef.current, 0, 6, dt);
      }

      const kinematics = computeCakeCutKinematics(cutStateRef.current, cutProgressRef.current);
      knifeGroup.position.y = THREE.MathUtils.damp(knifeGroup.position.y, kinematics.knifeY, 8, dt);
      knifeGroup.rotation.z = THREE.MathUtils.damp(knifeGroup.rotation.z, kinematics.knifeRotZ, 8, dt);

      sliceWedgeGroup.position.x = THREE.MathUtils.damp(
        sliceWedgeGroup.position.x,
        kinematics.sliceOffsetX,
        7,
        dt
      );
      sliceWedgeGroup.position.z = THREE.MathUtils.damp(
        sliceWedgeGroup.position.z,
        kinematics.sliceOffsetZ,
        7,
        dt
      );
      sliceWedgeGroup.position.y = THREE.MathUtils.damp(
        sliceWedgeGroup.position.y,
        kinematics.sliceLiftY,
        7,
        dt
      );

      // Advance 3D gift box lid opening
      const targetGift = giftOpenRef.current || cutStateRef.current === 'sliced' ? 1 : 0;
      giftProgressRef.current = THREE.MathUtils.damp(giftProgressRef.current, targetGift, 5, dt);
      giftLidGroup.position.y = 0.7 + giftProgressRef.current * 0.55;
      giftLidGroup.rotation.z = giftProgressRef.current * 0.45;
      giftInnerHeart.position.y = 0.45 + giftProgressRef.current * 0.72;
      giftInnerHeart.rotation.y = elapsed * 1.4;

      // Subtle floating motion for 3D extruded hearts
      for (let i = 0; i < floatingHearts.length; i++) {
        const h = floatingHearts[i];
        h.rotation.y = elapsed * 0.6 + i * 1.2;
        h.position.y = heartPositions[i][1] + Math.sin(elapsed * 1.5 + i) * 0.12;
      }

      // Smoothly damp camera toward active preset if selected
      if (activePresetRef.current) {
        const preset = CAMERA_PRESETS[activePresetRef.current];
        _targetCamPos.set(preset.pos[0], preset.pos[1], preset.pos[2]);
        _targetLookAt.set(preset.target[0], preset.target[1], preset.target[2]);

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 4.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 4.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 4.5, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, 4.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, 4.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, 4.5, dt);

        if (camera.position.distanceToSquared(_targetCamPos) < 0.002) {
          activePresetRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      controls.dispose();
      envTexture.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      id="cake"
      data-cake-state={cutState}
      data-gift-3d-open={giftBoxOpened ? 'true' : 'false'}
      className="py-20 px-6 relative"
    >
      <div className="max-w-6xl mx-auto text-center">
        {/* Editorial Kicker */}
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm tracking-widest uppercase font-semibold text-rose-600 mb-3">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Interactive 3D Celebration Stage</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d1822] font-display mb-3">
          Cut the 3D Birthday Cake, {recipientName}
        </h2>
        <p className="text-[#5c404c] max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed">
          Click directly on the 3D cake or use the action below to slice a piece with the rose-gold server, inspect the layered sponge interior, and unbox the 3D gift. Drag to orbit around the 3D scene.
        </p>

        {/* Dedicated Unobstructed 3D WebGL Viewport Container */}
        <div
          ref={canvasMountRef}
          className="relative w-full h-[440px] sm:h-[520px] cursor-grab active:cursor-grabbing select-none"
        />

        {/* Unboxed Bottom Control Strip */}
        <div className="mt-6 pt-6 border-t border-rose-900/15 flex flex-wrap items-center justify-between gap-6 max-w-4xl mx-auto">
          {/* Primary 3D Cake Cutting & 3D Gift Actions */}
          <div className="flex flex-wrap items-center gap-8">
            {cutState === 'whole' ? (
              <button
                onClick={handleCutCake}
                className="pb-2 border-b-2 border-rose-500 hover:border-amber-500 text-xs sm:text-sm font-semibold text-[#2d1822] hover:text-rose-600 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-rose-500" />
                <span>Cut the 3D Birthday Cake</span>
              </button>
            ) : (
              <button
                onClick={handleResetCake}
                className="pb-2 border-b border-rose-900/30 hover:border-rose-500 text-xs sm:text-sm font-medium text-[#5c404c] hover:text-[#2d1822] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Reset 3D Cake</span>
              </button>
            )}

            <button
              onClick={handleToggle3DGift}
              className="pb-2 border-b border-rose-400 hover:border-rose-600 text-xs sm:text-sm font-medium text-rose-600 hover:text-[#2d1822] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{giftBoxOpened ? 'Close 3D Gift Box' : 'Open 3D Gift Box'}</span>
            </button>
          </div>

          {/* Camera Angle Presets */}
          <div className="flex items-center gap-5 text-xs">
            <span className="text-[#7a5c68] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span>Camera:</span>
            </span>
            {(['front', 'closeup', 'top'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleSelectCamera(preset)}
                className={`pb-1 border-b transition-colors capitalize cursor-pointer ${
                  cameraPreset === preset
                    ? 'border-amber-500 text-amber-700 font-semibold'
                    : 'border-transparent text-[#7a5c68] hover:text-[#2d1822]'
                }`}
              >
                {preset === 'closeup' ? 'Slice Close-Up' : `${preset} View`}
              </button>
            ))}
          </div>
        </div>

        {/* Open Editorial Celebration Reveal when Cake is Sliced */}
        {cutState === 'sliced' && (
          <div className="mt-8 pt-6 border-t border-rose-300 max-w-xl mx-auto animate-fade-in">
            <p className="text-base sm:text-lg text-rose-700 font-display italic">
              "The first slice is served for {recipientName} — may this year be as sweet, radiant, and full of love as today."
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
