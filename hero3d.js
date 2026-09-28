// PRIZMA BI — opening film: "the data statue".
// A classical bust made of ~60k particles dissolves into a storm of financial
// data (points plus floating figures: €, %, digits), then reassembles as an
// intelligent statue traced with pulsing orange circuitry, and back again — a loop.
// Staging: black stage, red/orange light bars, moving beams, haze, bloom.
// Model: "Marble Bust 01" by Rico Cilliers, Poly Haven (CC0), used only as the shape.
// Priority: hero.mp4 (video) > prometheus.jpg (hero-image.js) > this scene > hero.js (2D).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const hero = document.getElementById('hero');
const media = hero && hero.querySelector('.hero-media');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = v => Math.min(1, Math.max(0, v));
const eIO = p => { p = clamp01(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const eOut = p => 1 - Math.pow(1 - clamp01(p), 3);

// ---------- timeline (seconds in a 20 s loop) ----------
// marble statue → dissolves → data storm → reforms as circuit statue → dissolves → storm → marble …
const P = 20, START = 16.2;             // the page opens mid-storm, so the first thing seen is the statue assembling
function timeline(tc) {
  let morph, circuit;
  if (tc < 4.5) { morph = 0; circuit = 0; }
  else if (tc < 6.8) { morph = eIO((tc - 4.5) / 2.3); circuit = 0; }
  else if (tc < 8.6) { morph = 1; circuit = tc > 7.6 ? 1 : 0; }
  else if (tc < 10.8) { morph = 1 - eIO((tc - 8.6) / 2.2); circuit = 1; }
  else if (tc < 14.5) { morph = 0; circuit = 1; }
  else if (tc < 16.4) { morph = eIO((tc - 14.5) / 1.9); circuit = 1; }
  else if (tc < 17.6) { morph = 1; circuit = tc > 17 ? 0 : 1; }
  else { morph = 1 - eIO((tc - 17.6) / 2.2); circuit = 0; }
  return { morph, circuit };
}

function init(gltf) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { return; }
  const canvas = renderer.domElement; canvas.id = 'hero3d';
  media.insertBefore(canvas, media.querySelector('video'));
  const PR = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR);
  renderer.setClearColor(0x030407, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050307, 0.032);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  const mobile = () => innerWidth / Math.max(1, innerHeight) < .9;
  const FLOOR = -4.6;

  // ---------- sample the statue's surface ----------
  let src = null; gltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
  const geo = src.geometry; geo.computeBoundingBox();
  const bb = geo.boundingBox, H = bb.max.y - bb.min.y, S = 7.4 / H;
  const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  const toWorld = (v, out) => out.set((v.x - cx) * S, FLOOR + 1.6 + (v.y - bb.min.y) * S, (v.z - cz) * S);
  const N = mobile() ? 60000 : 140000;
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
  const aTarget = new Float32Array(N * 3), aNormal = new Float32Array(N * 3), aRand = new Float32Array(N * 4);
  const p = new THREE.Vector3(), n = new THREE.Vector3(), w = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    sampler.sample(p, n); toWorld(p, w);
    aTarget.set([w.x, w.y, w.z], i * 3); aNormal.set([n.x, n.y, n.z], i * 3);
    aRand.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const yMin = FLOOR + 1.6, yMax = yMin + 7.4, center = new THREE.Vector3(0, (yMin + yMax) / 2, 0);

  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(aTarget, 3));
  pg.setAttribute('aTarget', new THREE.BufferAttribute(aTarget, 3));
  pg.setAttribute('aNormal', new THREE.BufferAttribute(aNormal, 3));
  pg.setAttribute('aRand', new THREE.BufferAttribute(aRand, 4));
  const U = { uTime: { value: 0 }, uMorph: { value: 1 }, uCircuit: { value: 0 }, uPR: { value: PR }, uSize: { value: mobile() ? 1.35 : 1.25 },
    uYMin: { value: yMin }, uYMax: { value: yMax }, uCenter: { value: center }, uLight: { value: new THREE.Vector3(.78, .42, .55).normalize() },
    uTurn: { value: 0 } };
  const statue = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: U, transparent: false, depthWrite: true, depthTest: true,
    vertexShader: /* glsl */`
      attribute vec3 aTarget, aNormal; attribute vec4 aRand;
      uniform float uTime, uMorph, uCircuit, uPR, uSize, uYMin, uYMax, uTurn; uniform vec3 uCenter, uLight;
      varying vec3 vColor; varying float vAlpha;
      float hash(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
      void main(){
        float h = (aTarget.y - uYMin) / (uYMax - uYMin);
        // dissolve sweeps from the crown down, with per-particle jitter
        float local = clamp(uMorph * 1.7 - (1. - h) * .55 - aRand.x * .25, 0., 1.);
        local = local * local * (3. - 2. * local);
        // the storm: a flattened vortex of data around the statue
        float r = 2.6 + pow(aRand.y, 1.6) * 8.;
        float arm = floor(aRand.z * 3.) * 2.094;                       // three spiral arms
        float ang = arm + r * .45 + (aRand.z * 3. - floor(aRand.z * 3.)) * .7 + uTime * (.22 + 1.2 / r);
        vec3 storm = uCenter + vec3(cos(ang) * r, (aRand.w - .5) * (2. + r * .45) + sin(uTime * .6 + aRand.x * 6.) * .5, sin(ang) * r * .55);
        vec3 formed = rotY(uTurn) * aTarget + normalize(aNormal) * sin(uTime * 1.6 + aRand.x * 20.) * .012;
        vec3 pos = mix(formed, storm, local);
        pos.y += sin(local * 3.1416) * (1.2 + aRand.w * 1.8);          // lift as it tears away
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        float keep = step(aRand.x, .3);                                 // a third of the dust stays visible in the storm
        float size = uSize * (.85 + aRand.y * .3) * mix(1., mix(0., .9, keep), local);
        gl_PointSize = size * uPR * (26. / -mv.z);

        // shading from the sampled normal gives the particles a sculpted form
        vec3 nrm = rotY(uTurn) * normalize(aNormal);
        float shade = .07 + .95 * pow(max(dot(nrm, uLight), 0.), 1.4) + .22 * pow(max(dot(nrm, vec3(-.8, .2, -.3)), 0.), 2.);
        vec3 marble = vec3(.86, .83, .78) * shade;
        // circuitry: traces on a grid over the surface with pulses running up
        vec3 cell = floor(aTarget * 5.5); float hc = hash(cell), hc2 = hash(cell + 7.1);
        vec3 fp = fract(aTarget * 5.5);
        float l = hc < .33 ? abs(fp.x - .5) : (hc < .66 ? abs(fp.y - .5) : abs(fp.z - .5));
        float trace = (1. - smoothstep(.05, .13, l)) * step(.35, hc2);
        float pulse = pow(fract(h * 2.5 - uTime * .35 + hc * .3), 8.);
        vec3 circuit = mix(vec3(.26, .3, .38) * shade, vec3(1., .52, .15) * (1.2 + 3.5 * pulse), trace);
        circuit += vec3(.21, .76, .7) * step(.93, hc2) * (1. - smoothstep(.1, .2, length(fp - .5))) * 2.;
        vec3 formedCol = mix(marble, circuit, uCircuit);
        vec3 stormCol = mix(vec3(1., .55, .18), mix(vec3(.9, .92, 1.), vec3(.21, .76, .7), step(.85, aRand.y)), step(.55, aRand.x));
        vColor = mix(formedCol, stormCol * .9, local);
        vAlpha = mix(.62, .55, local);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vAlpha;
      void main(){ float d = length(gl_PointCoord - .5); if (d > .48) discard;
        gl_FragColor = vec4(vColor * (1. - d * .5), 1.);
        #include <colorspace_fragment>
      }`
  }));
  statue.frustumCulled = false; scene.add(statue);
  // a dark core behind the particles so the figure reads solid while formed
  const coreGeo = geo.clone(); const cp = coreGeo.attributes.position, cn = coreGeo.attributes.normal;
  for (let i = 0; i < cp.count; i++) cp.setXYZ(i, cp.getX(i) - cn.getX(i) * H * .006, cp.getY(i) - cn.getY(i) * H * .006, cp.getZ(i) - cn.getZ(i) * H * .006);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x07080c, transparent: true, opacity: 1 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.scale.setScalar(S); core.position.set(-cx * S, FLOOR + 1.6 - bb.min.y * S, -cz * S);
  const coreGroup = new THREE.Group(); coreGroup.add(core); scene.add(coreGroup);

  // ---------- floating figures in the storm (€, %, digits) ----------
  const GL = '0123456789€%.,+−';
  const atlas = (() => { const c = document.createElement('canvas'); c.width = 64 * GL.length; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.font = '500 46px "Geist Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...GL].forEach((ch, i) => g.fillText(ch, i * 64 + 32, 34)); const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t; })();
  const NG = mobile() ? 360 : 900;
  const gGeo = new THREE.InstancedBufferGeometry(); gGeo.copy(new THREE.PlaneGeometry(1, 1)); gGeo.instanceCount = NG;
  const gIdx = new Float32Array(NG), gR = new Float32Array(NG * 4);
  for (let i = 0; i < NG; i++) { gIdx[i] = Math.floor(Math.random() * GL.length); gR.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4); }
  gGeo.setAttribute('aGlyph', new THREE.InstancedBufferAttribute(gIdx, 1));
  gGeo.setAttribute('aR', new THREE.InstancedBufferAttribute(gR, 4));
  const GU = { uTime: U.uTime, uStorm: { value: 1 }, uAtlas: { value: atlas }, uCount: { value: GL.length }, uCenter: U.uCenter };
  const glyphs = new THREE.Mesh(gGeo, new THREE.ShaderMaterial({
    uniforms: GU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aGlyph; attribute vec4 aR;
      uniform float uTime, uStorm, uCount; uniform vec3 uCenter;
      varying vec2 vUv; varying float vA; varying vec3 vC;
      void main(){
        float r = 2.6 + aR.y * 9.;
        float ang = aR.z * 6.2832 + uTime * (.15 + .9 / r);
        vec3 c = uCenter + vec3(cos(ang) * r, (aR.w - .5) * 9.5 + sin(uTime * .5 + aR.x * 6.) * .8, sin(ang) * r * .55);
        vec4 mv = modelViewMatrix * vec4(c, 1.);
        float s = (.16 + aR.x * .22) * smoothstep(0., 1., uStorm);
        mv.xy += position.xy * s;
        gl_Position = projectionMatrix * mv;
        vUv = vec2((aGlyph + uv.x) / uCount, uv.y);
        vA = uStorm * (.55 + .45 * sin(uTime * 2. + aR.x * 30.));
        vC = aR.y > .82 ? vec3(.21, .76, .7) : (aR.x > .45 ? vec3(1., .6, .22) : vec3(.92, .94, 1.));
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uAtlas; varying vec2 vUv; varying float vA; varying vec3 vC;
      void main(){ float a = texture2D(uAtlas, vUv).a; if (a < .02) discard; gl_FragColor = vec4(vC * 1.4, a * vA);
        #include <colorspace_fragment>
      }`
  }));
  glyphs.frustumCulled = false; scene.add(glyphs);

  // holographic base under the floating bust
  const baseRing = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.26, 128), new THREE.MeshBasicMaterial({ color: 0xf28c28, transparent: true, opacity: .6,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  baseRing.rotation.x = -Math.PI / 2; baseRing.position.y = yMin - .35; scene.add(baseRing);
  const baseRing2 = baseRing.clone(); baseRing2.material = baseRing.material.clone(); baseRing2.material.color.set(0x36c2b4); baseRing2.scale.setScalar(1.35); scene.add(baseRing2);

  // chest prism, shown while the statue is "intelligent"
  const prGeo = new THREE.CylinderGeometry(.36, .36, .3, 3); prGeo.rotateX(-Math.PI / 2);
  const prism = new THREE.Mesh(prGeo, new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true }));
  prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(prGeo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true })));
  prism.position.set(0, yMin + 7.4 * .38, 1.05); scene.add(prism);

  // ---------- stage ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x040507 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; scene.add(floor);
  const grid = new THREE.GridHelper(200, 120, 0x2a1408, 0x140a06); grid.position.y = FLOOR + .01; grid.material.transparent = true; grid.material.opacity = .5; scene.add(grid);
  const bars = [];
  [-12.5, -10.5, -8.5, -6.5, 6.5, 8.5, 10.5, 12.5].forEach((x, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(.1, 12, .1), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff3b1f : 0xf28c28 }));
    m.position.set(x, FLOOR + 6, -8 - (i % 3)); scene.add(m); bars.push({ m, ph: i * .8, base: m.material.color.clone() });
  });
  const led = new THREE.Mesh(new THREE.BoxGeometry(24, .08, .08), new THREE.MeshBasicMaterial({ color: 0xff6a1f })); led.position.set(0, FLOOR + .05, 3.4); scene.add(led);
  const rayTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
    const l = g.createLinearGradient(0, 0, 0, 256); l.addColorStop(0, 'rgba(255,255,255,.9)'); l.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = l; g.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c); })();
  const beams = [[-9, 0xff3b1f], [-4.5, 0xf28c28], [4.5, 0xf28c28], [9, 0xff3b1f]].map(([x, col], i) => {
    const g = new THREE.CylinderGeometry(.05, 1.3, 22, 24, 1, true); g.translate(0, -11, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, alphaMap: rayTex, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.position.set(x, FLOOR + 14.5, -4); scene.add(m); return { m, ph: i * 1.4 };
  });
  const DUST = mobile() ? 800 : 1800, dPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dPos.set([(Math.random() - .5) * 60, FLOOR + Math.random() * 18, -40 + Math.random() * 52], i * 3);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  scene.add(new THREE.Points(dGeo, new THREE.PointsMaterial({ size: .045, color: 0xffb08a, transparent: true, opacity: .35, depthWrite: false, blending: THREE.AdditiveBlending })));

  // ---------- post ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .8, .5, .72);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  let mx = 0, my = 0, tmx = 0, tmy = 0, visible = true, camDist = 18;
  function layout() {
    const w = media.clientWidth, h = media.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); bloom.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camDist = Math.max(17.5, 3.8 / (Math.tan(THREE.MathUtils.degToRad(18)) * (w / h)));
  }
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  new ResizeObserver(layout).observe(media);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(media);
  layout();

  function tick(t) {
    mx += (tmx - mx) * .04; my += (tmy - my) * .04;
    const tc = (t + START) % P, L = timeline(tc);
    U.uTime.value = t; U.uMorph.value = L.morph; U.uCircuit.value = L.circuit;
    U.uTurn.value = Math.sin(t * .12) * .22 + mx * .35;
    coreGroup.rotation.y = U.uTurn.value;
    coreMat.opacity = 1 - clamp01(L.morph * 2.2); core.visible = coreMat.opacity > .01;
    GU.uStorm.value = eOut((L.morph - .35) / .65);
    camera.position.set(Math.sin(t * .05) * 1.4 + mx * 1.5, .9 + Math.cos(t * .07) * .3 - my * .8, camDist - Math.sin(t * .04) * .8);
    camera.lookAt(0, 1.2, 0);

    const formedB = L.circuit * (1 - L.morph);
    prism.scale.setScalar(formedB * (mobile() ? .8 : 1));
    prism.rotation.y = U.uTurn.value + t * .8;
    prism.material.opacity = formedB; prism.children[0].material.opacity = formedB;
    baseRing.rotation.z = t * .2; baseRing2.rotation.z = -t * .14;
    baseRing.material.opacity = .25 + .45 * (1 - L.morph); baseRing2.material.opacity = .15 + .3 * formedB;

    const energy = .3 + .7 * Math.max(L.morph, formedB);
    bars.forEach(b => b.m.material.color.copy(b.base).multiplyScalar(energy * (.55 + .45 * Math.sin(t * 2.2 + b.ph)) * 1.4));
    led.material.color.set(0xff6a1f).multiplyScalar(energy * 1.5);
    beams.forEach(b => { b.m.rotation.z = Math.sin(t * .35 + b.ph) * .35; b.m.rotation.x = Math.cos(t * .27 + b.ph) * .15;
      b.m.material.opacity = .09 * (.4 + .6 * energy) * eOut(t / 2.5); });
    bloom.strength = .75 + .35 * L.morph;

    const d = dGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) { d[i * 3 + 2] += .012; if (d[i * 3 + 2] > 12) d[i * 3 + 2] -= 52; }
    dGeo.attributes.position.needsUpdate = true;
    composer.render();
  }

  hero.classList.add('has-3d');
  let tAcc = 0; const clock = new THREE.Clock();
  window.prizmaHero = { seek(s) { tAcc = s; tick(tAcc); }, time: () => tAcc, phase: s => timeline((s + START) % P) };
  if (reduce) { tAcc = 12 - START + P; tick(tAcc); return; }
  let pr = PR, frames = 0, spent = 0;
  (function loop() {
    requestAnimationFrame(loop);
    const raw = clock.getDelta();
    if (!visible || document.hidden || hero.classList.contains('has-video')) return;
    tAcc += Math.min(raw, .05); tick(tAcc);
    frames++; spent += raw;
    if (frames === 45) { if (spent / frames > 1 / 42 && pr > .6) { pr = Math.max(.6, pr - .25); renderer.setPixelRatio(pr); U.uPR.value = pr; layout(); } frames = 0; spent = 0; }
  })();
}

if (media) {
  const bust = () => new GLTFLoader().load('models/bust/marble_bust_01_2k.gltf',
    g => { try { init(g); } catch (e) { console.warn('hero3d disabled', e); } },
    undefined, e => console.warn('hero3d model failed', e));
  const go = () => import('./hero-image.js?v=1790560481')
    .then(m => m.findHeroImage().then(img => img ? m.initImageHero(img) : bust()))
    .catch(e => { console.warn('hero image mode failed', e); bust(); });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
}
