import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CAKE, CAKE_CAMERA, cakePoint, createCutFace, createDripGeometry, createPipedCreamGeometry, getCakeCameraFraming, getCakeCutFrame } from './cakeGeometry';

test('cut faces share the cylinder edge at both sides of the wedge', () => {
  for (const angle of [CAKE.sliceStart, CAKE.sliceStart + CAKE.sliceAngle]) {
    const face = createCutFace(CAKE.radius, CAKE.bottom, CAKE.height, angle);
    const positions = face.getAttribute('position');
    const edge = cakePoint(angle, CAKE.radius);
    assert.ok(Math.abs(positions.getX(1) - edge.x) < 1e-6);
    assert.ok(Math.abs(positions.getZ(1) - edge.z) < 1e-6);
    assert.ok(Math.abs(positions.getY(2) - (CAKE.bottom + CAKE.height)) < 1e-6);
    assert.equal(face.getIndex()!.count, 6);
    face.dispose();
  }
});

test('both cuts reach the bottom before the slice can move', () => {
  const firstCut = getCakeCutFrame(.28);
  const secondCut = getCakeCutFrame(.59);
  assert.ok(firstCut.knifeY < CAKE.bottom + .03);
  assert.ok(secondCut.knifeY < CAKE.bottom + .03);
  assert.equal(firstCut.knifeAngle, CAKE.sliceStart);
  assert.equal(secondCut.knifeAngle, CAKE.sliceStart + CAKE.sliceAngle);
  assert.equal(firstCut.sliceDistance, 0);
  assert.equal(secondCut.sliceDistance, 0);
});

test('the finished slice rests on the serving plate with the knife and flames gone', () => {
  const frame = getCakeCutFrame(1);
  assert.equal(frame.extracted, true);
  assert.equal(frame.sliceDistance, CAKE.sliceTravel);
  assert.equal(frame.sliceY, -.37);
  assert.equal(frame.knifeOpacity, 0);
  assert.equal(frame.candleIntensity, 0);
  assert.equal(frame.sliceTilt, 0);
  assert.ok(Math.abs(CAKE.bottom + frame.sliceY - CAKE.plateHeight) < 1e-6);
  const sliceCentroid = 4 * CAKE.radius * Math.sin(CAKE.sliceAngle / 2) / (3 * CAKE.sliceAngle);
  assert.ok(Math.abs(frame.sliceDistance + sliceCentroid - CAKE.plateRadius) < .03);
  assert.deepEqual(getCakeCutFrame(3), frame);
});

test('piped cream normals face outward so frosting receives the studio lighting', () => {
  const cream = createPipedCreamGeometry();
  const normal = cream.getAttribute('normal');
  const position = cream.getAttribute('position');
  for (let i = 37; i < 37 * 10; i++) {
    assert.ok(normal.getX(i) * position.getX(i) + normal.getZ(i) * position.getZ(i) > 0);
  }
  cream.dispose();
});

test('ganache drip geometry contains finite positions and a continuous shared seam', () => {
  const wedge = createDripGeometry(CAKE.sliceStart, CAKE.sliceAngle);
  const main = createDripGeometry(CAKE.sliceStart + CAKE.sliceAngle, Math.PI * 2 - CAKE.sliceAngle);
  const a = wedge.getAttribute('position');
  const b = main.getAttribute('position');
  assert.ok(Array.from(a.array).every(Number.isFinite));
  for (let row = 0; row < 11; row++) {
    const last = a.count - 11 + row;
    assert.ok(Math.abs(a.getX(last) - b.getX(row)) < 1e-6);
    assert.ok(Math.abs(a.getY(last) - b.getY(row)) < 1e-6);
    assert.ok(Math.abs(a.getZ(last) - b.getZ(row)) < 1e-6);
  }
  wedge.dispose(); main.dispose();
});

test('mobile camera framing keeps the candles, stand, serving plate and slice visible after resizing', () => {
  for (const [width, height] of [[288, 200], [328, 227], [358, 287], [398, 300], [636, 220], [760, 430]]) {
    const framing = getCakeCameraFraming(width, height);
    for (const mode of ['idle', 'cutting'] as const) {
      const preset = CAKE_CAMERA[mode];
      const camera = new THREE.PerspectiveCamera(framing.fov, framing.aspect, .1, 60);
      camera.zoom = mode === 'idle' ? framing.idleZoom : framing.cuttingZoom;
      camera.position.fromArray(preset.position);
      camera.lookAt(new THREE.Vector3().fromArray(preset.target));
      camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      const plateCenter = cakePoint(CAKE.sliceStart + CAKE.sliceAngle / 2, CAKE.plateRadius);
      const landmarks = [
        cakePoint(3, .66, 2.6), cakePoint(3.63, .66, 2.6), cakePoint(4.26, .66, 2.6),
        cakePoint(0, 1.58, 0), cakePoint(Math.PI / 2, 1.58, 0), cakePoint(Math.PI, 1.58, 0),
        plateCenter.clone().add(new THREE.Vector3(.88, .16, 0)),
        plateCenter.clone().add(new THREE.Vector3(0, .16, .88)),
        cakePoint(CAKE.sliceStart + CAKE.sliceAngle / 2, CAKE.sliceTravel + CAKE.radius, CAKE.bottom + CAKE.height),
      ];
      for (const landmark of landmarks) {
        const screen = landmark.project(camera);
        assert.ok(Math.abs(screen.x) < .95 && Math.abs(screen.y) < .95, `${mode} cake clipped at ${width} × ${height}`);
      }
    }
  }
});
