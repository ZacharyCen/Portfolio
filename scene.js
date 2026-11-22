import {
  AmbientLight, BufferGeometry, Color, DirectionalLight, Float32BufferAttribute,
  Group, LineBasicMaterial, LineLoop, MathUtils, Mesh, MeshBasicMaterial,
  MeshPhongMaterial, PerspectiveCamera, Points, PointsMaterial, Scene,
  SphereGeometry, Vector3, WebGLRenderer
} from 'three';

const hero = document.querySelector('.hero');
const canvas = document.querySelector('.orbit-scene');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mouse = matchMedia('(hover: hover) and (pointer: fine)');
let started = false;

function start() {
  if (started || reduced.matches) return;
  started = true;
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!context) return;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new Scene();
  const camera = new PerspectiveCamera(39, 1, .1, 100);
  camera.position.z = 11;

  const system = new Group();
  scene.add(system, new AmbientLight('#b4dfff', .75));
  const key = new DirectionalLight('#aaffdf', 2.4);
  key.position.set(-4, 5, 7);
  const rim = new DirectionalLight('#8078ff', 2.2);
  rim.position.set(4, -1, -5);
  scene.add(key, rim);

  const planet = new Mesh(new SphereGeometry(.92, 40, 24),
    new MeshPhongMaterial({ color: '#2c9c83', shininess: 28, specular: '#81c4aa' }));
  system.add(planet);
  const patterns = new Group();
  planet.add(patterns);
  for (let i = 0; i < 8; i++) {
    const latitude = -.67 + i * .19;
    const band = Array.from({ length: 100 }, (_, step) => {
      const angle = step / 100 * Math.PI * 2;
      const y = latitude + Math.sin(angle * 3 + i) * .035;
      const radius = Math.sqrt(.928 ** 2 - y ** 2);
      return new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    });
    patterns.add(new LineLoop(new BufferGeometry().setFromPoints(band),
      new LineBasicMaterial({ color: '#b1ffe2', transparent: true, opacity: .23 })));
  }

  const rings = new Group();
  system.add(rings);
  const palette = ['#67ffd3', '#658ab7', '#a67bff', '#73e6d9', '#7467c8', '#7354b5'];
  const moons = palette.map((color, i) => {
    const radius = 1.36 + i * .55;
    const path = Array.from({ length: 112 }, (_, step) => {
      const angle = step / 112 * Math.PI * 2;
      return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    });
    rings.add(new LineLoop(new BufferGeometry().setFromPoints(path),
      new LineBasicMaterial({ color, transparent: true, opacity: .76 })));
    const moon = new Mesh(new SphereGeometry(i % 2 ? .036 : .059, 12, 8),
      new MeshBasicMaterial({ color: new Color(color).lerp(new Color('#ffffff'), .45) }));
    rings.add(moon);
    return { moon, radius, phase: i * 1.92, speed: .26 + .34 / radius };
  });

  const stars = new BufferGeometry();
  const coordinates = [];
  for (let i = 0; i < 125; i++) {
    coordinates.push((Math.random() - .5) * 23, (Math.random() - .5) * 15, -2 - Math.random() * 9);
  }
  stars.setAttribute('position', new Float32BufferAttribute(coordinates, 3));
  const dust = new Points(stars, new PointsMaterial({ color: '#91a9e7', size: .029, transparent: true, opacity: .56 }));
  scene.add(dust);

  let visible = false;
  let lost = false;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let targetX = 0;
  let targetY = 0;
  let compact = false;

  function resize() {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    compact = width < 540;
    system.position.x = compact ? 1.04 : 1.63;
    system.position.y = compact ? -1.0 : 0;
    system.scale.setScalar(compact ? .69 : 1);
    sync();
  }

  function tick(now) {
    frame = 0;
    if (previousTime) elapsed += Math.min((now - previousTime) / 1000, .05);
    previousTime = now;
    const t = elapsed;
    planet.rotation.set(.18, t * .21, -.24);
    rings.rotation.x = 1.10 + Math.sin(t * .30) * .12;
    rings.rotation.z = t * .027;
    system.rotation.x = MathUtils.lerp(system.rotation.x, targetY * .24, .055);
    system.rotation.y = MathUtils.lerp(system.rotation.y, targetX * .32, .055);
    system.rotation.z = .39 + Math.sin(t * .29) * .075;
    system.position.y = (compact ? -1.0 : 0) + Math.sin(t * .76) * .14;
    dust.rotation.z = t * .007;
    for (const { moon, radius, phase, speed } of moons) {
      const angle = phase + t * speed;
      moon.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }
    renderer.render(scene, camera);
    hero.classList.add('has-webgl');
    sync();
  }

  function sync() {
    const running = visible && !lost && !document.hidden && !reduced.matches;
    if (running && !frame) frame = requestAnimationFrame(tick);
    if (!running) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }
    if (lost || reduced.matches) hero.classList.remove('has-webgl');
  }

  hero.addEventListener('pointermove', event => {
    if (!mouse.matches || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
    targetY = (event.clientY - rect.top) / rect.height * 2 - 1;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; sync(); });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; sync(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(hero);
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  resize();
}

start();
reduced.addEventListener('change', start);
