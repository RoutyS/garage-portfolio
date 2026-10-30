import * as THREE from 'three';

/** Small, self-contained life around the house. All time comes from update(dt). */
export function createNeighborhoodLife(scene) {
  const root = new THREE.Group();
  root.name = 'neighborhood_life';
  scene.add(root);
  const geometries = new Set();
  const materials = new Set();
  const ownGeometry = geometry => (geometries.add(geometry), geometry);
  const material = (color, roughness = .65, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.add(m);
    return m;
  };
  const sphere = ownGeometry(new THREE.SphereGeometry(1, 20, 12));
  const cylinder = ownGeometry(new THREE.CylinderGeometry(1, 1, 1, 24));
  const cone = ownGeometry(new THREE.ConeGeometry(1, 1, 18));
  const cube = ownGeometry(new THREE.BoxGeometry(1, 1, 1));
  const m = {
    cat: material('#ba8660'), catCream: material('#eddfc7'), catDark: material('#78583f'),
    pink: material('#c58d82'), eye: material('#172c2c', .28), nose: material('#584039'),
    hedgehog: material('#917456'), hedgehogFace: material('#c3aa86'),
    spine: material('#6b5948'), spineLight: material('#ad9270'),
    bird: material('#5f727b'), wing: material('#3d505c'), birdChest: material('#ddd6c5'),
    beak: material('#bca16a'), steel: material('#b8c2c6', .3, .72),
    rubber: material('#242b30', .85), trim: material('#263d46', .5),
    glass: material('#526f7d', .19, .45), red: material('#b94738', .28),
    light: material('#f4e8c7', .3), carBlue: material('#527480', .3, .28),
    carCream: material('#d6cbb4', .34, .24)
  };
  let seed = 0x39a51;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const mesh = (parent, geometry, mat, position, scale, name = '') => {
    const obj = new THREE.Mesh(geometry, mat);
    if (position) obj.position.set(...position);
    if (scale) obj.scale.set(...scale);
    obj.name = name;
    obj.castShadow = false;
    obj.receiveShadow = false;
    parent.add(obj);
    return obj;
  };
  const ellipsoid = (parent, mat, position, scale, name) => mesh(parent, sphere, mat, position, scale, name);
  const box = (parent, mat, position, scale) => mesh(parent, cube, mat, position, scale);
  const point = (x, y, z) => new THREE.Vector3(x, y, z);
  const direction = new THREE.Vector3();
  const sample = new THREE.Vector3();
  const clamp = THREE.MathUtils.clamp;
  let time = 0;
  let disposed = false;

  // Cars face +X in their local frame. Rounded side profiles give the vehicles
  // a compact manufactured silhouette without importing another car asset.
  function sideVolume(points, depth, mat, parent, radius = .07) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = ownGeometry(new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelSegments: 3, steps: 1,
      bevelSize: radius, bevelThickness: radius, curveSegments: 6
    }));
    geometry.translate(0, 0, -depth / 2);
    return mesh(parent, geometry, mat);
  }

  function makeCar(color, estate = false) {
    const car = new THREE.Group();
    car.name = estate ? 'traffic_estate' : 'traffic_compact';
    car.scale.setScalar(1.35);
    root.add(car);
    sideVolume([[-2.95, .65], [-3.02, .91], [-2.72, 1.27], [-1.7, 1.37],
      [1.26, 1.38], [2.48, 1.22], [2.96, 1.01], [2.98, .69]], 2.36, color, car, .09);
    const roofProfile = estate
      ? [[-2.0, 1.39], [-1.65, 2.12], [-1.25, 2.25], [.70, 2.25], [1.45, 1.40]]
      : [[-1.85, 1.39], [-1.18, 2.12], [-.75, 2.23], [.63, 2.23], [1.44, 1.40]];
    sideVolume(roofProfile, 1.98, color, car, .075);
    // Inset glazing on each side, separated by a body-colour B pillar.
    for (const side of [-1, 1]) {
      const windows = sideVolume(estate
        ? [[-1.82, 1.49], [-1.52, 2.06], [.63, 2.10], [1.22, 1.49]]
        : [[-1.60, 1.49], [-1.06, 2.05], [.57, 2.10], [1.22, 1.49]],
      .014, m.glass, car, .025);
      windows.position.z = side * 1.053;
      box(car, color, [-.20, 1.79, side * 1.079], [.11, .67, .04]);
      box(car, m.steel, [.45, 1.31, side * 1.21], [.27, .048, .035]);
      ellipsoid(car, color, [1.08, 1.51, side * 1.30], [.20, .11, .13]);
      box(car, m.trim, [0, .65, side * 1.20], [4.72, .10, .055]);
    }
    const windshield = box(car, m.glass, [1.06, 1.83, 0], [.035, .84, 1.78]);
    windshield.rotation.z = .68;
    const rearWindow = box(car, m.glass, [estate ? -1.83 : -1.47, 1.78, 0], [.025, .66, 1.72]);
    rearWindow.rotation.z = estate ? -.39 : -.75;
    box(car, m.trim, [3.045, .83, 0], [.04, .20, 1.00]);
    box(car, m.steel, [3.075, .75, 0], [.025, .13, .45]);
    box(car, m.trim, [-3.045, .78, 0], [.04, .13, 1.88]);
    for (const z of [-.85, .85]) {
      ellipsoid(car, m.light, [2.91, 1.04, z], [.10, .10, .29]);
      ellipsoid(car, m.red, [-2.92, 1.03, z], [.055, .16, .23]);
    }
    const wheels = [];
    for (const x of [-1.91, 1.91]) for (const z of [-1.23, 1.23]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, .57, z);
      car.add(pivot);
      const tyre = mesh(pivot, cylinder, m.rubber, [0, 0, 0], [.55, .31, .55]);
      tyre.rotation.x = Math.PI / 2;
      const rim = mesh(pivot, cylinder, m.steel, [0, 0, Math.sign(z) * .17], [.35, .025, .35]);
      rim.rotation.x = Math.PI / 2;
      for (let k = 0; k < 5; k++) {
        const a = k * Math.PI * 2 / 5;
        const spoke = box(pivot, m.trim, [Math.cos(a) * .21, Math.sin(a) * .21, Math.sign(z) * .19], [.24, .055, .012]);
        spoke.rotation.z = a;
      }
      wheels.push(pivot);
    }
    car.traverse(object => { if (object.isMesh) object.castShadow = true; });
    const beam=new THREE.SpotLight(0xffe1b5,0,19,.36,.75,2);beam.position.set(3.0,1.08,0);beam.target.position.set(11,.02,0);beam.visible=false;car.add(beam,beam.target);car.userData.headlight=beam;
    car.userData.wheels = wheels;
    return car;
  }

  const traffic = [
    { group: makeCar(m.carBlue), sign: 1, lane: 19.875, x: -39, speed: 4.6, wait: 0, active: true },
    { group: makeCar(m.carCream, true), sign: -1, lane: 25.625, x: 54, speed: 4.1, wait: 5.1, active: false }
  ];
  for (const car of traffic) {
    car.group.rotation.y = car.sign < 0 ? Math.PI : 0;
    car.group.position.set(car.x, .065, car.lane);
    car.group.visible = car.active;
  }

  // A small cat with separate legs, ears, muzzle, whiskers and an articulated tail.
  const cat = new THREE.Group();
  cat.name = 'garden_cat';
  cat.scale.setScalar(.70);
  root.add(cat);
  ellipsoid(cat, m.cat, [0, .75, 0], [.70, .31, .29]);
  ellipsoid(cat, m.catCream, [.45, .78, 0], [.28, .29, .26]);
  const catHead = new THREE.Group();
  catHead.position.set(.66, 1.00, 0);
  cat.add(catHead);
  ellipsoid(catHead, m.cat, [0, 0, 0], [.29, .27, .25]);
  for (const z of [-.16, .16]) {
    const ear = mesh(catHead, cone, m.cat, [-.025, .28, z], [.13, .32, .10]);
    ear.rotation.z = -.14;
    const inside = mesh(catHead, cone, m.pink, [.04, .29, z], [.065, .19, .055]);
    inside.rotation.z = -.14;
    ellipsoid(catHead, m.eye, [.215, .065, z * 1.11], [.038, .050, .023]);
    ellipsoid(catHead, m.catCream, [.25, -.08, z * .45], [.12, .10, .10]);
    for (let i = 0; i < 2; i++) {
      const whisker = box(catHead, m.catCream, [.26, -.045 - i * .035, z * 1.65], [.012, .008, .27]);
      whisker.rotation.y = Math.sign(z) * -.23;
    }
  }
  ellipsoid(catHead, m.nose, [.354, -.04, 0], [.035, .025, .04]);
  const catLegs = [];
  for (const x of [-.44, .45]) for (const z of [-.20, .20]) {
    const leg = new THREE.Group();
    leg.position.set(x, .66, z);
    cat.add(leg);
    ellipsoid(leg, m.cat, [0, -.27, 0], [.105, .32, .10]);
    ellipsoid(leg, m.catCream, [.045, -.585, 0], [.15, .075, .105]);
    catLegs.push({ leg, phase: (x * z > 0 ? 0 : Math.PI) });
  }
  const tail = [];
  let tailParent = cat;
  for (let i = 0; i < 6; i++) {
    const bone = new THREE.Group();
    bone.position.set(i ? -.20 : -.63, i ? 0 : .88, 0);
    tailParent.add(bone);
    ellipsoid(bone, i > 4 ? m.catDark : m.cat, [-.10, 0, 0], [.14, .064 - i * .005, .064 - i * .005]);
    tail.push(bone);
    tailParent = bone;
  }
  const catPaths = [
    [[14.2, 7], [14.7, 7.7], [15.8, 8.1], [16.5, 7.7]],
    [[16.5, 7.7], [17.4, 7.3], [18.5, 7.1], [19.5, 7.8]],
    [[19.5, 7.8], [19.7, 7.0], [18.2, 6.4], [16.5, 6.5]],
    [[16.5, 6.5], [15.3, 6.2], [14.3, 6.4], [14.2, 7]]
  ].map(points => new THREE.CatmullRomCurve3(points.map(([x, z]) => point(x, .22, z)), false, 'centripetal'));
  const catState = { index: 0, progress: 0, pause: 1.0, moving: false, step: 0 };
  cat.position.copy(catPaths[0].getPointAt(0));

  // Dense lightweight instanced quills distinguish the hedgehog from a generic
  // brown oval, while its face and body remain smoothly shaded.
  const hedgehog = new THREE.Group();
  hedgehog.name = 'garden_hedgehog';
  hedgehog.scale.setScalar(.65);
  root.add(hedgehog);
  ellipsoid(hedgehog, m.hedgehog, [0, .37, 0], [.46, .29, .31]);
  ellipsoid(hedgehog, m.hedgehogFace, [.38, .30, 0], [.25, .18, .21]);
  const snout = mesh(hedgehog, cone, m.hedgehogFace, [.61, .27, 0], [.11, .30, .11]);
  snout.rotation.z = -Math.PI / 2;
  ellipsoid(hedgehog, m.nose, [.77, .27, 0], [.052, .042, .05]);
  for (const z of [-.15, .15]) {
    ellipsoid(hedgehog, m.eye, [.49, .37, z], [.030, .031, .025]);
    ellipsoid(hedgehog, m.hedgehogFace, [.26, .52, z], [.075, .09, .07]);
  }
  const hedgehogLegs = [];
  for (const x of [-.25, .25]) for (const z of [-.18, .18]) {
    const leg = new THREE.Group();
    leg.position.set(x, .21, z);
    hedgehog.add(leg);
    ellipsoid(leg, m.hedgehogFace, [.015, -.11, 0], [.10, .10, .06]);
    hedgehogLegs.push({ leg, phase: (x * z > 0 ? 0 : Math.PI) });
  }
  const quillGeometry = ownGeometry(new THREE.ConeGeometry(.024, .18, 5));
  const quills = [new THREE.InstancedMesh(quillGeometry, m.spine, 62), new THREE.InstancedMesh(quillGeometry, m.spineLight, 62)];
  const dummy = new THREE.Object3D();
  const up = point(0, 1, 0);
  for (let i = 0; i < 124; i++) {
    const ny = .10 + .90 * ((i + .5) / 124);
    const theta = i * 2.39996323;
    const radial = Math.sqrt(1 - ny * ny);
    const normal = point(Math.cos(theta) * radial, ny, Math.sin(theta) * radial);
    dummy.position.set(normal.x * .44 - .04, .37 + normal.y * .28, normal.z * .30);
    dummy.position.addScaledVector(normal, .055);
    dummy.quaternion.setFromUnitVectors(up, normal);
    dummy.scale.setScalar(.8 + random() * .35);
    dummy.updateMatrix();
    quills[i % 2].setMatrixAt(Math.floor(i / 2), dummy.matrix);
  }
  for (const instanced of quills) {
    instanced.instanceMatrix.needsUpdate = true;
    instanced.computeBoundingSphere();
    instanced.castShadow = false;
    hedgehog.add(instanced);
  }
  const hedgePaths = [
    [[18.7, 12.0], [19.2, 12.2], [19.6, 11.6], [19.5, 11.0]],
    [[19.5, 11.0], [19.2, 10.8], [18.7, 11.0], [18.5, 11.5]],
    [[18.5, 11.5], [18.4, 11.7], [18.6, 11.9], [18.7, 12.0]]
  ].map(points => new THREE.CatmullRomCurve3(points.map(([x, z]) => point(x, .22, z)), false, 'centripetal'));
  const hedgeState = { index: 0, progress: 0, pause: 2.7, moving: false, step: 0 };
  hedgehog.position.copy(hedgePaths[0].getPointAt(0));

  // Birds fly between genuine roof perches, taking a newly varied high route
  // each time. They land and fold their wings instead of orbiting continuously.
  const perches = [point(6.6, 7.71, 5.95), point(14.45, 10.88, -5.3), point(20.75, 7.35, 2.9)];
  function makeBird(index) {
    const bird = new THREE.Group();
    bird.name = 'roof_bird_' + index;
    root.add(bird);
    ellipsoid(bird, m.bird, [0, .12, 0], [.29, .14, .13]);
    ellipsoid(bird, m.birdChest, [.07, .04, 0], [.19, .105, .115]);
    ellipsoid(bird, m.bird, [.25, .23, 0], [.135, .13, .12]);
    const beak = mesh(bird, cone, m.beak, [.405, .22, 0], [.045, .14, .04]);
    beak.rotation.z = -Math.PI / 2;
    for (const side of [-1, 1]) ellipsoid(bird, m.eye, [.31, .26, side * .096], [.022, .022, .012]);
    const birdTail = ellipsoid(bird, m.wing, [-.32, .13, 0], [.21, .025, .11]);
    birdTail.rotation.z = -.13;
    const wings = [];
    for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      wing.position.set(-.025, .17, side * .08);
      bird.add(wing);
      wing.rotation.x = side * 1.20;
      wing.scale.z = .40;
      ellipsoid(wing, m.wing, [-.015, 0, side * .22], [.20, .026, .28]);
      for (let feather = 0; feather < 3; feather++) {
        const f = ellipsoid(wing, m.bird, [-.095 + feather * .065, 0, side * (.40 + feather * .035)], [.055, .020, .15]);
        f.rotation.y = side * (.16 + feather * .13);
      }
      wings.push({ wing, side });
    }
    const feet = new THREE.Group();
    bird.add(feet);
    for (const z of [-.065, .065]) {
      box(feet, m.beak, [.05, -.045, z], [.016, .13, .016]);
      box(feet, m.beak, [.10, -.10, z], [.13, .018, .025]);
    }
    bird.position.copy(perches[index]);
    return { group: bird, wings, feet, perch: index, target: index, wait: index ? 2.5 + index * 1.8 : 0,
      flying: false, progress: 0, duration: 7, curve: null, phase: index * 2.4 };
  }
  const birds = [makeBird(0), makeBird(1), makeBird(2)];

  function startFlight(bird) {
    bird.target = (bird.perch + (random() > .5 ? 1 : 2)) % perches.length;
    const from = perches[bird.perch], to = perches[bird.target];
    const high = point((from.x + to.x) / 2 + (random() - .5) * 5,
      12.3 + random() * 1.7, (from.z + to.z) / 2 - 2.5 - random() * 2);
    const lift = from.clone().lerp(high, .36);
    lift.y = Math.max(from.y + 1.7, 10.1);
    const approach = to.clone().lerp(high, .28);
    approach.y = to.y + 1.5;
    bird.curve = new THREE.CatmullRomCurve3([from.clone(), lift, high, approach, to.clone()], false, 'centripetal');
    bird.duration = 5.8 + bird.curve.getLength() / 7 + random();
    bird.progress = 0;
    bird.flying = true;
  }

  function walkAnimal(group, state, paths, speed, dt) {
    if (state.pause > 0) {
      state.pause = Math.max(0, state.pause - dt);
      state.moving = false;
      return;
    }
    const path = paths[state.index];
    state.moving = true;
    state.progress = Math.min(1, state.progress + dt * speed / path.getLength());
    path.getPointAt(state.progress, sample);
    group.position.copy(sample);
    path.getTangentAt(state.progress, direction);
    const targetYaw = -Math.atan2(direction.z, direction.x);
    const yawDelta = Math.atan2(Math.sin(targetYaw - group.rotation.y), Math.cos(targetYaw - group.rotation.y));
    group.rotation.y += yawDelta * Math.min(1, dt * 8);
    state.step += dt * speed * 9;
    if (state.progress >= 1) {
      state.index = (state.index + 1) % paths.length;
      state.progress = 0;
      state.pause = 2.5 + random() * 4.0;
      state.moving = false;
    }
  }

  function update(dt, { outside = true, paused = false } = {}) {
    if (disposed) return;
    root.visible = outside;
    if (!outside || paused || !Number.isFinite(dt) || dt <= 0) return;
    // No Date/performance clock: hidden views and explicit pauses freeze life.
    dt = Math.min(dt, .1);
    time += dt;
    for (const car of traffic) {
      if (!car.active) {
        car.wait -= dt;
        if (car.wait <= 0) {
          car.active = true;
          car.x = car.sign > 0 ? -57 : 65;
          car.speed = 4.0 + random() * 1.2;
          car.group.position.set(car.x, .065, car.lane);
          car.group.visible = true;
        }
      } else {
        car.x += car.sign * car.speed * dt;
        car.group.position.set(car.x, .065, car.lane);
        for (const wheel of car.group.userData.wheels) wheel.rotation.z -= car.speed * dt / .55;
        if (car.sign > 0 ? car.x > 65 : car.x < -57) {
          car.active = false;
          car.group.visible = false;
          car.wait = 5.5 + random() * 7;
        }
      }
    }
    walkAnimal(cat, catState, catPaths, .75, dt);
    for (const { leg, phase } of catLegs) leg.rotation.z = catState.moving ? Math.sin(catState.step + phase) * .39 : 0;
    cat.position.y = .22 + (catState.moving ? Math.abs(Math.sin(catState.step * 2)) * .019 : 0);
    catHead.rotation.y = catState.moving ? .035 * Math.sin(time * 2) : .24 * Math.sin(time * .65);
    catHead.rotation.z = catState.moving ? -.03 : -.04 + .07 * Math.sin(time * .9);
    tail.forEach((bone, index) => {
      bone.rotation.z = index ? -.16 + .06 * Math.sin(time * 1.9 - index * .35) : -.55;
      bone.rotation.y = .14 * Math.sin(time * 1.5 - index * .34);
    });
    walkAnimal(hedgehog, hedgeState, hedgePaths, .35, dt);
    for (const { leg, phase } of hedgehogLegs) leg.rotation.z = hedgeState.moving ? .43 * Math.sin(hedgeState.step * 1.5 + phase) : 0;
    hedgehog.rotation.z = hedgeState.moving ? Math.sin(hedgeState.step * 3) * .025 : Math.sin(time * 1.3) * .012;
    for (const bird of birds) {
      if (!bird.flying) {
        bird.wait -= dt;
        bird.group.rotation.z = 0;
        bird.group.rotation.x = 0;
        bird.group.rotation.y += Math.sin(time * .7 + bird.phase) * dt * .12;
        if (bird.wait <= 0) startFlight(bird);
      }
      if (bird.flying) {
        bird.progress = Math.min(1, bird.progress + dt / bird.duration);
        bird.curve.getPointAt(bird.progress, sample);
        bird.group.position.copy(sample);
        bird.curve.getTangentAt(bird.progress, direction);
        bird.group.rotation.order = 'YXZ';
        bird.group.rotation.y = -Math.atan2(direction.z, direction.x);
        bird.group.rotation.z = Math.atan2(direction.y, Math.hypot(direction.x, direction.z));
        bird.group.rotation.x = Math.sin(bird.progress * Math.PI) * .15;
        if (bird.progress === 1) {
          bird.flying = false;
          bird.perch = bird.target;
          bird.wait = 5.5 + random() * 8;
          bird.group.position.copy(perches[bird.perch]);
          bird.group.rotation.z = 0;
        }
      }
      bird.feet.visible = !bird.flying;
      for (const { wing, side } of bird.wings) {
        wing.rotation.x = side * (bird.flying ? Math.sin(time * 15 + bird.phase) * .80 : 1.20);
        wing.scale.z = bird.flying ? 1 : .40;
      }
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    root.removeFromParent();
    for (const geometry of geometries) geometry.dispose();
    for (const mat of materials) mat.dispose();
    for (const instance of quills) instance.dispose?.();
  }
  function setNight(value){m.light.emissive.set('#fff0cf');m.light.emissiveIntensity=value?2.8:0;m.red.emissive.set('#e53b28');m.red.emissiveIntensity=value?1.5:0;for(const car of traffic){car.group.userData.headlight.visible=value;car.group.userData.headlight.intensity=value?75:0}}
  return { update, dispose, setNight };
}
