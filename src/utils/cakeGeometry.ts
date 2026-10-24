import * as THREE from 'three';

export const CAKE = {
  radius: 1.25,
  bottom: .53,
  height: 1.22,
  sliceStart: .18,
  sliceAngle: .82,
  cutSeconds: 6.6,
  sliceTravel: 1.35,
  plateRadius: 2.17,
  plateHeight: .16,
} as const;

export const CAKE_CAMERA = {
  idle: { position: [-3.4, 3.05, 5.8], target: [0, 1.23, .12] },
  cutting: { position: [-3.35, 3.8, 6.2], target: [.24, 1.12, .3] },
} as const;

// Include the stand, candle tips, plate and extracted slice, rather than fitting
// only the round cake body. The same framing survives narrow and short screens.
export function getCakeFramingPoints() {
  const points: THREE.Vector3[] = [];
  const bisector = CAKE.sliceStart + CAKE.sliceAngle / 2;
  const plate = cakePoint(bisector, CAKE.plateRadius);
  const travel = cakePoint(bisector, CAKE.sliceTravel);
  for (let i = 0; i < 48; i++) {
    const angle = i / 48 * Math.PI * 2;
    points.push(cakePoint(angle, 1.58, 0));
    points.push(cakePoint(angle, CAKE.radius + .04, CAKE.bottom));
    points.push(cakePoint(angle, CAKE.radius + .04, CAKE.bottom + CAKE.height + .32));
    points.push(cakePoint(angle, .88, .16).add(plate));
    const sliceAngle = CAKE.sliceStart + CAKE.sliceAngle * i / 47;
    points.push(cakePoint(sliceAngle, CAKE.radius + .04, CAKE.bottom + CAKE.height).add(travel));
  }
  for (let i = 0; i < 3; i++) points.push(cakePoint(3 + i * .63, .66, 2.6));
  return points;
}

export function getCakeCameraFraming(width: number, height: number) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const fov = 38;
  const points = getCakeFramingPoints();
  const fit = (preset: typeof CAKE_CAMERA.idle | typeof CAKE_CAMERA.cutting, limit: number) => {
    const camera = new THREE.PerspectiveCamera(fov, aspect, .1, 60);
    camera.position.fromArray(preset.position);
    camera.lookAt(new THREE.Vector3().fromArray(preset.target));
    camera.updateMatrixWorld();
    const extent = points.reduce((max, point) => {
      const projected = point.clone().project(camera);
      return Math.max(max, Math.abs(projected.x), Math.abs(projected.y));
    }, 0);
    return Math.min(limit, .88 / extent);
  };
  return { aspect, fov, idleZoom: fit(CAKE_CAMERA.idle, 1.45), cuttingZoom: fit(CAKE_CAMERA.cutting, 1.12) };
}

export function cakePoint(angle: number, radius: number, y = 0) {
  // Match CylinderGeometry's convention so the cut faces meet the shell exactly.
  return new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
}

export function createCutFace(radius: number, bottom: number, height: number, angle: number) {
  const edge = cakePoint(angle, radius);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, bottom, 0, edge.x, bottom, edge.z,
    edge.x, bottom + height, edge.z, 0, bottom + height, 0,
  ], 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

export function createDripGeometry(start: number, sweep: number) {
  const positions: number[] = [];
  const uv: number[] = [];
  const indices: number[] = [];
  const columns = Math.ceil(sweep / (Math.PI * 2) * 180);
  const rows = 10;
  for (let column = 0; column <= columns; column++) {
    const angle = start + sweep * column / columns;
    const depth = .08 + .14 * Math.max(0, Math.sin(angle * 9 + .7)) ** 8 + .07 * Math.max(0, Math.sin(angle * 13)) ** 10;
    for (let row = 0; row <= rows; row++) {
      const v = row / rows;
      const radius = CAKE.radius + .012 + .022 * Math.sin(v * Math.PI);
      const point = cakePoint(angle, radius, CAKE.bottom + CAKE.height + .032 - depth * v);
      positions.push(point.x, point.y, point.z);
      uv.push(column / columns, v);
      if (column < columns && row < rows) {
        const a = column * (rows + 1) + row;
        const b = a + rows + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createPipedCreamGeometry() {
  const positions: number[] = [];
  const indices: number[] = [];
  const rings = 18;
  const segments = 36;
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    for (let segment = 0; segment <= segments; segment++) {
      const angle = segment / segments * Math.PI * 2;
      const radius = .132 * (1 - t) ** .65 * (1 + .16 * Math.cos(6 * angle - t * 10));
      positions.push(Math.sin(angle) * radius + .025 * t * t, .23 * t, Math.cos(angle) * radius);
      if (ring < rings && segment < segments) {
        const a = ring * (segments + 1) + segment;
        const b = a + segments + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function ease(from: number, to: number, progress: number) {
  const t = THREE.MathUtils.clamp((progress - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

export function getCakeCutFrame(progress: number) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const high = CAKE.bottom + CAKE.height + .45;
  const low = CAKE.bottom + .015;
  // Two distinct downward cuts, each along a radial edge of the same wedge.
  let knifeY = high;
  if (t < .28) knifeY = THREE.MathUtils.lerp(high, low, ease(.09, .28, t));
  else if (t < .38) knifeY = THREE.MathUtils.lerp(low, high, ease(.28, .38, t));
  else if (t < .59) knifeY = THREE.MathUtils.lerp(high, low, ease(.42, .59, t));
  else knifeY = THREE.MathUtils.lerp(low, high + .45, ease(.59, .69, t));
  const extraction = ease(.68, .96, t);
  return {
    knifeY,
    knifeAngle: CAKE.sliceStart + CAKE.sliceAngle * ease(.33, .41, t),
    knifeOpacity: ease(0, .07, t) * (1 - ease(.64, .72, t)),
    sliceDistance: CAKE.sliceTravel * extraction,
    sliceY: extraction === 1 ? CAKE.plateHeight - CAKE.bottom : Math.sin(extraction * Math.PI) * .23 + (CAKE.plateHeight - CAKE.bottom) * ease(.82, .96, t),
    sliceTilt: extraction === 1 ? 0 : Math.sin(extraction * Math.PI) * .035,
    candleIntensity: 1 - ease(.58, .68, t),
    extracted: t >= .96,
  };
}
