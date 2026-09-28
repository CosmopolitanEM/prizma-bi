// PRIZMA BI — opening film: "numbers become the world".
// A storm of financial figures (€, %, digits) and data dust swirls, then
// assembles into a rotating globe whose continents are drawn with those same
// figures. Glowing arcs link the financial centres, pulses travel along them,
// orbit rings circle the planet — then it bursts back into numbers and loops.
// Land outlines: world-atlas 110m (ISC), loaded from jsdelivr at runtime;
// without it the globe still forms, just without continents.
// Priority: hero.mp4 (video) > prometheus.jpg (hero-image.js) > this scene > hero.js (2D).
import * as THREE from 'three';
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

// ---------- timeline (18 s loop): globe → numbers storm → globe ----------
const P = 18, START = 8.6;                 // opens in the storm, so the first thing seen is the world assembling
function timeline(tc) {
  if (tc < 6) return 0;                    // globe with live data
  if (tc < 8) return eIO((tc - 6) / 2);    // bursts into numbers
  if (tc < 9.6) return 1;                  // storm
  if (tc < 12.4) return 1 - eIO((tc - 9.6) / 2.8);  // numbers assemble into the world
  return 0;
}

// ---------- land mask (equirectangular) ----------
async function landMask() {
  try {
    const [topo, tj] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json').then(r => r.json()),
      import('https://cdn.jsdelivr.net/npm/topojson-client@3/+esm')
    ]);
    const land = tj.feature(topo, topo.objects.land);
    const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = '#fff';
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const ring = r => { g.beginPath(); r.forEach(([lo, la], i) => {
      const x = X(lo), y = Y(la);
      if (i && Math.abs(lo - r[i - 1][0]) > 180) g.moveTo(x, y); else i ? g.lineTo(x, y) : g.moveTo(x, y);
    }); g.closePath(); g.fill('evenodd'); };
    (land.features || [land]).forEach(f => { const geo = f.geometry || f;
      (geo.type === 'Polygon' ? [geo.coordinates] : geo.coordinates).forEach(poly => poly.forEach(ring)); });
    const d = g.getImageData(0, 0, W, H).data;
    return (lat, lon) => { const x = Math.min(W - 1, Math.max(0, Math.floor(X(lon)))), y = Math.min(H - 1, Math.max(0, Math.floor(Y(lat))));
      return d[(y * W + x) * 4] > 127; };
  } catch (e) { console.warn('world map unavailable, plain globe', e); return null; }
}

function init(isLand) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { return; }
  const canvas = renderer.domElement; canvas.id = 'hero3d';
  media.insertBefore(canvas, media.querySelector('video'));
  const PR = Math.min(devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(PR); renderer.setClearColor(0x030407, 1); renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050307, 0.028);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  const mobile = () => innerWidth / Math.max(1, innerHeight) < .9;
  const R = 3.15, CENTER = new THREE.Vector3(0, .9, 0), FLOOR = -4.6;
  const toXYZ = (lat, lon, r = R) => { const a = THREE.MathUtils.degToRad(lat), b = THREE.MathUtils.degToRad(lon);
    return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)); };

  // ---------- sample the planet: dense on land, sparse on the oceans ----------
  const N = mobile() ? 42000 : 90000, NG = mobile() ? 1600 : 3800;
  const pts = [], land = [];
  while (pts.length < N) {
    const u = Math.random() * 2 - 1, lon = Math.random() * 360 - 180, lat = THREE.MathUtils.radToDeg(Math.asin(u));
    const onLand = isLand ? isLand(lat, lon) : Math.random() < .3;
    if (onLand) { pts.push([lat, lon, 1]); if (land.length < 20000) land.push([lat, lon]); }
    else if (Math.random() < (isLand ? .16 : .5)) pts.push([lat, lon, 0]);
  }
  const aT = new Float32Array(N * 3), aL = new Float32Array(N), aR = new Float32Array(N * 4);
  pts.forEach(([la, lo, l], i) => { const v = toXYZ(la, lo, R * (l ? 1.004 : 1)); aT.set([v.x, v.y, v.z], i * 3); aL[i] = l;
    aR.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4); });
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(aT, 3));
  pg.setAttribute('aTarget', new THREE.BufferAttribute(aT, 3));
  pg.setAttribute('aLand', new THREE.BufferAttribute(aL, 1));
  pg.setAttribute('aRand', new THREE.BufferAttribute(aR, 4));
  const U = { uTime: { value: 0 }, uMorph: { value: 1 }, uPR: { value: PR }, uSize: { value: mobile() ? 1.35 : 1.15 },
    uSpin: { value: 0 }, uCenter: { value: CENTER }, uLight: { value: new THREE.Vector3(-.55, .45, .7).normalize() } };
  const STORM = /* glsl */`
    vec3 stormPos(vec4 r, float t, vec3 c){
      float rad = 2.8 + pow(r.y, 1.5) * 8.;
      float arm = floor(r.z * 3.) * 2.094;
      float ang = arm + rad * .45 + fract(r.z * 3.) * .7 + t * (.22 + 1.2 / rad);
      return c + vec3(cos(ang) * rad, (r.w - .5) * (2. + rad * .45) + sin(t * .6 + r.x * 6.) * .5, sin(ang) * rad * .55);
    }
    mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
    mat3 tilt(){ float a = .41; float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }`;
  const dust = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: U, transparent: false, depthWrite: true,
    vertexShader: /* glsl */`
      attribute vec3 aTarget; attribute float aLand; attribute vec4 aRand;
      uniform float uTime, uMorph, uPR, uSize, uSpin; uniform vec3 uCenter, uLight;
      varying vec3 vColor;
      ${STORM}
      void main(){
        vec3 n = tilt() * rotY(uSpin) * normalize(aTarget);
        float local = clamp(uMorph * 1.6 - (n.x * .5 + .5) * .45 - aRand.x * .2, 0., 1.);
        local = local * local * (3. - 2. * local);
        vec3 globe = uCenter + tilt() * rotY(uSpin) * aTarget;
        vec3 pos = mix(globe, stormPos(aRand, uTime, uCenter), local);
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        gl_Position = projectionMatrix * mv;
        float keep = step(aRand.x, .3);
        gl_PointSize = uSize * (.8 + aRand.y * .4) * mix(aLand > .5 ? 1.15 : .8, mix(0., .7, keep), local) * uPR * (26. / -mv.z);
        float lit = .25 + .75 * max(dot(n, uLight), 0.);
        float rim = pow(1. - max(dot(n, vec3(0., 0., 1.)), 0.), 3.);
        vec3 landCol = mix(vec3(.95, .9, .82), vec3(1., .6, .22), step(.82, aRand.w)) * lit;
        vec3 seaCol = vec3(.16, .22, .34) * (.5 + .5 * lit);
        vec3 col = (aLand > .5 ? landCol : seaCol) + vec3(.21, .76, .7) * rim * .5;
        vec3 stormCol = mix(vec3(1., .55, .18), mix(vec3(.9, .92, 1.), vec3(.21, .76, .7), step(.85, aRand.y)), step(.55, aRand.x));
        vColor = mix(col, stormCol * .42, local);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor;
      void main(){ float d = length(gl_PointCoord - .5); if (d > .48) discard; gl_FragColor = vec4(vColor * (1. - d * .5), 1.);
        #include <colorspace_fragment>
      }`
  }));
  dust.frustumCulled = false; scene.add(dust);

  // dark core so the far side is hidden while the globe is formed
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x05070c, transparent: true });
  const core = new THREE.Mesh(new THREE.SphereGeometry(R * .985, 64, 48), coreMat); core.position.copy(CENTER); scene.add(core);
  // atmosphere glow
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 64, 48), new THREE.ShaderMaterial({
    uniforms: { uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), 4.); gl_FragColor = vec4(mix(vec3(.95,.45,.12), vec3(.21,.76,.7), .45) * f * .7 * uA, f * uA); }'
  })); atmo.position.copy(CENTER); scene.add(atmo);

  // ---------- the figures: in the storm they swirl, then they settle on the continents ----------
  const GL = '0123456789€%.,+−';
  const atlas = (() => { const c = document.createElement('canvas'); c.width = 64 * GL.length; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.font = '600 48px "Geist Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...GL].forEach((ch, i) => g.fillText(ch, i * 64 + 32, 34)); const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t; })();
  const gGeo = new THREE.InstancedBufferGeometry(); gGeo.copy(new THREE.PlaneGeometry(1, 1)); gGeo.instanceCount = NG;
  const gIdx = new Float32Array(NG), gR = new Float32Array(NG * 4), gT = new Float32Array(NG * 3);
  for (let i = 0; i < NG; i++) {
    gIdx[i] = Math.floor(Math.random() * GL.length); gR.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    const src = land.length ? land[Math.floor(Math.random() * land.length)] : [THREE.MathUtils.radToDeg(Math.asin(Math.random() * 2 - 1)), Math.random() * 360 - 180];
    const v = toXYZ(src[0], src[1], R * 1.018); gT.set([v.x, v.y, v.z], i * 3);
  }
  gGeo.setAttribute('aGlyph', new THREE.InstancedBufferAttribute(gIdx, 1));
  gGeo.setAttribute('aR', new THREE.InstancedBufferAttribute(gR, 4));
  gGeo.setAttribute('aT', new THREE.InstancedBufferAttribute(gT, 3));
  const GU = { uTime: U.uTime, uMorph: U.uMorph, uSpin: U.uSpin, uCenter: U.uCenter, uAtlas: { value: atlas }, uCount: { value: GL.length } };
  const glyphs = new THREE.Mesh(gGeo, new THREE.ShaderMaterial({
    uniforms: GU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aGlyph; attribute vec4 aR; attribute vec3 aT;
      uniform float uTime, uMorph, uSpin, uCount; uniform vec3 uCenter;
      varying vec2 vUv; varying float vA; varying vec3 vC;
      ${STORM}
      void main(){
        vec3 n = tilt() * rotY(uSpin) * normalize(aT);
        float local = clamp(uMorph * 1.5 - aR.x * .35, 0., 1.); local = local * local * (3. - 2. * local);
        vec3 c = mix(uCenter + tilt() * rotY(uSpin) * aT, stormPos(aR, uTime * 1.05, uCenter), local);
        vec4 mv = modelViewMatrix * vec4(c, 1.);
        float s = mix(.085 + aR.y * .05, .16 + aR.x * .22, local);
        mv.xy += position.xy * s;
        gl_Position = projectionMatrix * mv;
        vUv = vec2((aGlyph + uv.x) / uCount, uv.y);
        float facing = smoothstep(-.05, .35, (viewMatrix * vec4(n, 0.)).z);
        vA = mix(facing * .9, .55 + .45 * sin(uTime * 2. + aR.x * 30.), local);
        vC = aR.y > .82 ? vec3(.21, .76, .7) : (aR.x > .45 ? vec3(1., .6, .22) : vec3(.92, .94, 1.));
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uAtlas; varying vec2 vUv; varying float vA; varying vec3 vC;
      void main(){ float a = texture2D(uAtlas, vUv).a; if (a < .02) discard; gl_FragColor = vec4(vC * 1.35, a * vA);
        #include <colorspace_fragment>
      }`
  }));
  glyphs.frustumCulled = false; scene.add(glyphs);

  // ---------- data layer that rotates with the planet ----------
  const planet = new THREE.Group(); planet.position.copy(CENTER); planet.rotation.z = .41; scene.add(planet);
  const spinG = new THREE.Group(); planet.add(spinG);
  const CITIES = { MAD: [40.4, -3.7], LON: [51.5, -.1], FRA: [50.1, 8.7], ZRH: [47.4, 8.5], PAR: [48.9, 2.35], AMS: [52.4, 4.9],
    NYC: [40.7, -74], TOR: [43.7, -79.4], DXB: [25.2, 55.3], HKG: [22.3, 114.2], SIN: [1.35, 103.8], TYO: [35.7, 139.7] };
  const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.3, 'rgba(255,200,140,.8)'); r.addColorStop(1, 'rgba(255,140,40,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const nodes = Object.values(CITIES).map(([la, lo]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: 0xffb547, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.position.copy(toXYZ(la, lo, R * 1.02)); s.scale.setScalar(.34); spinG.add(s);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.16, .19, 40), new THREE.MeshBasicMaterial({ color: 0xf28c28, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    ring.position.copy(toXYZ(la, lo, R * 1.021)); ring.lookAt(new THREE.Vector3()); spinG.add(ring);
    return { s, ring, ph: Math.random() * 6 };
  });
  const LINKS = [['MAD', 'LON'], ['MAD', 'NYC'], ['LON', 'NYC'], ['LON', 'DXB'], ['DXB', 'HKG'], ['HKG', 'TYO'], ['SIN', 'HKG'],
    ['FRA', 'ZRH'], ['MAD', 'FRA'], ['LON', 'SIN'], ['NYC', 'TOR'], ['PAR', 'MAD'], ['AMS', 'NYC'], ['ZRH', 'DXB'], ['FRA', 'TYO']];
  const arcs = LINKS.map(([a, b], i) => {
    const A = toXYZ(...CITIES[a], R * 1.02), B = toXYZ(...CITIES[b], R * 1.02), ang = A.angleTo(B);
    const pts = []; for (let k = 0; k <= 64; k++) { const t = k / 64;
      const v = new THREE.Vector3().copy(A).normalize().lerp(B.clone().normalize(), t).normalize();
      pts.push(v.multiplyScalar(R * 1.02 + Math.sin(Math.PI * t) * (.18 + ang * .42))); }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 96, .018, 6, false);
    const line = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 3 ? 0xff9a3c : 0x5fe0d2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    spinG.add(line);
    const pulse = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    pulse.scale.setScalar(.3); spinG.add(pulse);
    return { line, curve, pulse, delay: i * .23, sp: .28 + Math.random() * .2 };
  });
  // orbit rings
  const orbits = [[R * 1.32, .35, .05, 0xf28c28], [R * 1.5, -.55, .3, 0x36c2b4], [R * 1.7, .9, -.2, 0xffffff]].map(([r, rx, rz, col], i) => {
    const g = new THREE.Group(); g.position.copy(CENTER); g.rotation.set(rx + Math.PI / 2, 0, rz);
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, .006, 6, 256), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .25, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(m); const sat = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sat.scale.setScalar(.32); g.add(sat); scene.add(g); return { g, m, sat, r, sp: [.22, -.16, .1][i] };
  });


  // ---------- annual-accounts analytics floating beside the globe (illustrative figures) ----------
  const panelGroup = new THREE.Group(); scene.add(panelGroup);
  const F = { mono: '"Geist Mono", ui-monospace, monospace', sans: 'Geist, "Helvetica Neue", Arial, sans-serif' };
  function panelCanvas(draw) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 640; const g = c.getContext('2d');
    g.fillStyle = 'rgba(8,14,26,.78)'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, 1024, 640, 18) : g.rect(0, 0, 1024, 640); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#F28C28'; g.fillRect(0, 36, 6, 52);
    draw(g);
    g.font = `500 22px ${F.mono}`; g.fillStyle = 'rgba(255,255,255,.35)'; g.textAlign = 'left';
    g.fillText('GLOBAL BEVERAGE GROUP · FY ANNUAL ACCOUNTS · ILLUSTRATIVE', 40, 608);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const title = (g, a, b) => { g.textAlign = 'left'; g.font = `600 26px ${F.mono}`; g.fillStyle = 'rgba(255,255,255,.62)'; g.fillText(a, 40, 70);
    if (b) { g.font = `700 64px ${F.sans}`; g.fillStyle = '#fff'; g.fillText(b, 40, 150); } };
  const PANELS = [
    { at: [-5.7, 3.3, .6], hook: [-.7, .55], tex: panelCanvas(g => {
      title(g, 'REVENUE BY REGION', '$47.1bn');
      [['North America', .37, '#F28C28'], ['EMEA', .29, '#FFB547'], ['Asia Pacific', .19, '#36C2B4'], ['Global ventures & other', .15, '#8FA3C0']].forEach(([n, v, c], i) => {
        const y = 210 + i * 88; g.font = `500 30px ${F.sans}`; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(n, 40, y);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(40, y + 18, 800, 22); g.fillStyle = c; g.fillRect(40, y + 18, 800 * v / .4, 22);
        g.font = `600 30px ${F.mono}`; g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText(Math.round(v * 100) + '%', 984, y + 38); g.textAlign = 'left'; });
    }) },
    { at: [-9.3, .25, -1.2], hook: [-.98, .05], tex: panelCanvas(g => {
      title(g, 'P&L COMPOSITION · % OF REVENUE');
      const steps = [['Revenue', 100, 0, '#E9EDF4'], ['COGS', -39, 100, '#FF6B5B'], ['Gross profit', 61, 0, '#FFB547'], ['Opex', -40, 61, '#FF6B5B'], ['Operating inc.', 21, 0, '#F28C28'], ['Tax & other', -2, 21, '#FF6B5B'], ['Net income', 19, 0, '#36C2B4']];
      const base = 520, k = 3.3, bw = 104;
      steps.forEach(([n, v, from, c], i) => { const x = 50 + i * 136, top = base - Math.max(from, from + v) * k, h = Math.abs(v) * k;
        g.fillStyle = c; g.fillRect(x, top, bw, h);
        g.font = `600 26px ${F.mono}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText((v > 0 ? '' : '−') + Math.abs(v), x + bw / 2, top - 12);
        g.font = `500 19px ${F.sans}`; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(n, x + bw / 2, base + 30); });
      g.textAlign = 'left';
    }) },
    { at: [-5.7, -2.8, .9], hook: [-.72, -.5], tex: panelCanvas(g => {
      title(g, 'BALANCE SHEET MIX · TOTAL ASSETS', '$100.5bn');
      const parts = [['Goodwill & intangibles', .38, '#F28C28'], ['Equity investments', .20, '#FFB547'], ['Cash & securities', .13, '#36C2B4'], ['PP&E', .11, '#8FA3C0'], ['Receivables & inventory', .09, '#E9EDF4'], ['Other', .09, '#4A5A74']];
      let a0 = -Math.PI / 2; const cx0 = 830, cy0 = 360, r0 = 150;
      parts.forEach(([n, v, c], i) => { const a1 = a0 + v * Math.PI * 2; g.beginPath(); g.arc(cx0, cy0, r0, a0, a1); g.lineWidth = 58; g.strokeStyle = c; g.stroke(); a0 = a1 + .02;
        const y = 220 + i * 58; g.fillStyle = c; g.fillRect(40, y - 18, 18, 18); g.font = `500 27px ${F.sans}`; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(n, 74, y);
        g.font = `600 27px ${F.mono}`; g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText(Math.round(v * 100) + '%', 560, y); g.textAlign = 'left'; });
    }) },
    { at: [-9.5, 3.6, -2.2], hook: [-.45, .82], tex: panelCanvas(g => {
      title(g, 'KEY RATIOS');
      [['Gross margin', '61.1%'], ['Operating margin', '21.2%'], ['Net debt / EBITDA', '1.8x'], ['Free cash flow conversion', '92%']].forEach(([n, v], i) => {
        const y = 210 + i * 92; g.font = `500 32px ${F.sans}`; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(n, 40, y);
        g.font = `700 44px ${F.mono}`; g.fillStyle = i % 2 ? '#36C2B4' : '#FFB547'; g.textAlign = 'right'; g.fillText(v, 984, y + 4); g.textAlign = 'left';
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(40, y + 30, 944, 2); });
    }) }
  ].map((d, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.06), new THREE.MeshBasicMaterial({ map: d.tex, color: 0xb8b8b8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    panelGroup.add(m);
    const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xf28c28, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    panelGroup.add(line);
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: 0xffb547, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    dot.scale.setScalar(.28); panelGroup.add(dot);
    return { ...d, m, line, dot, i, ph: Math.random() * 6 };
  });
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function updatePanels(t, formed, since) {
    const show = !mobile();
    PANELS.forEach(p => {
      const k = show ? eOut((since - .8 - p.i * .35) / 1.1) * formed : 0;
      const bob = Math.sin(t * .5 + p.ph) * .12;
      const x = CENTER.x + p.at[0] - (1 - k) * 1.2;
      p.m.position.set(x, p.at[1] + bob, p.at[2]);
      p.m.lookAt(camera.position); p.m.rotateY(.16);
      p.m.material.opacity = k * .96;
      // leader line: panel edge → elbow → a point on the globe's rim
      tmpA.set(x + 1.65, p.at[1] + bob, p.at[2]);
      tmpB.set(CENTER.x + p.hook[0] * R, CENTER.y + p.hook[1] * R, Math.sqrt(Math.max(0, 1 - p.hook[0] ** 2 - p.hook[1] ** 2)) * R * .9);
      const pos = p.line.geometry.attributes.position;
      pos.setXYZ(0, tmpA.x, tmpA.y, tmpA.z); pos.setXYZ(1, (tmpA.x + tmpB.x) / 2, tmpA.y, (tmpA.z + tmpB.z) / 2); pos.setXYZ(2, tmpB.x, tmpB.y, tmpB.z);
      pos.needsUpdate = true; p.line.material.opacity = k * .55;
      p.dot.position.copy(tmpB); p.dot.material.opacity = k * (.7 + .3 * Math.sin(t * 4 + p.ph));
    });
  }

  // globe sits right of centre on wide screens, centred on phones
  function placeGlobe() {
    const aspect = media.clientWidth / Math.max(1, media.clientHeight);
    CENTER.x = aspect > 1.15 ? Math.min(3.9, 1.8 + (aspect - 1.15) * 3.4) : 0;
    [core, atmo, planet].forEach(o => o.position.copy(CENTER));
    orbits.forEach(o => o.g.position.copy(CENTER));
  }

  // ---------- stage ----------
  const floorGrid = new THREE.GridHelper(200, 120, 0x2a1408, 0x140a06); floorGrid.position.y = FLOOR; floorGrid.material.transparent = true; floorGrid.material.opacity = .45; scene.add(floorGrid);
  const bars = [];
  [-12.5, -10.5, -8.5, 8.5, 10.5, 12.5].forEach((x, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(.1, 12, .1), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff3b1f : 0xf28c28 }));
    m.position.set(x, FLOOR + 6, -9 - (i % 3)); scene.add(m); bars.push({ m, ph: i * .8, base: m.material.color.clone() }); });
  const rayTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
    const l = g.createLinearGradient(0, 0, 0, 256); l.addColorStop(0, 'rgba(255,255,255,.9)'); l.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = l; g.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c); })();
  const beams = [[-9, 0xff3b1f], [9, 0xff3b1f], [-5.5, 0xf28c28], [5.5, 0xf28c28]].map(([x, col], i) => {
    const g = new THREE.CylinderGeometry(.05, 1.3, 22, 24, 1, true); g.translate(0, -11, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, alphaMap: rayTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.position.set(x, FLOOR + 14.5, -7); scene.add(m); return { m, ph: i * 1.4 };
  });
  const DUST = mobile() ? 700 : 1600, dPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) dPos.set([(Math.random() - .5) * 60, FLOOR + Math.random() * 18, -40 + Math.random() * 52], i * 3);
  const hGeo = new THREE.BufferGeometry(); hGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  scene.add(new THREE.Points(hGeo, new THREE.PointsMaterial({ size: .045, color: 0xffb08a, transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending })));

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .7, .5, .72);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  let mx = 0, my = 0, tmx = 0, tmy = 0, visible = true, camDist = 18;
  function layout() {
    placeGlobe();
    const w = media.clientWidth, h = media.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); bloom.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camDist = Math.max(17, 4.4 / (Math.tan(THREE.MathUtils.degToRad(18)) * (w / h)));
  }
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  new ResizeObserver(layout).observe(media);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(media);
  layout();

  function tick(t) {
    mx += (tmx - mx) * .04; my += (tmy - my) * .04;
    const tc = (t + START) % P, m = timeline(tc), formed = 1 - m;
    U.uTime.value = t; U.uMorph.value = m;
    const spin = t * .09 + mx * .6 - .25;            // opens with Europe facing the viewer
    U.uSpin.value = spin; spinG.rotation.y = spin;
    camera.position.set(Math.sin(t * .05) * 1.3 + mx * 1.4, 1.4 + Math.cos(t * .07) * .3 - my * .8, camDist - Math.sin(t * .04) * .8);
    camera.lookAt(CENTER.x * .15, .9, 0);

    coreMat.opacity = clamp01(1 - m * 2.2); core.visible = coreMat.opacity > .01;
    atmo.material.uniforms.uA.value = formed;
    const since = tc < 6 ? tc + (P - 12.4) : tc - 12.4;   // seconds since the globe finished forming
    nodes.forEach(n => { const k = .75 + .25 * Math.sin(t * 3 + n.ph); n.s.material.opacity = formed * k;
      n.ring.scale.setScalar(1 + ((t * .6 + n.ph) % 1) * 2.4); n.ring.material.opacity = formed * (1 - ((t * .6 + n.ph) % 1)) * .8; });
    arcs.forEach(a => {
      const grow = eOut((since - a.delay) / 1.2) * formed;
      a.line.geometry.setDrawRange(0, Math.floor(96 * grow) * 36); a.line.material.opacity = .85 * formed;
      const u = ((t * a.sp + a.delay) % 1); a.curve.getPointAt(u, a.pulse.position);
      a.pulse.material.opacity = grow > .98 ? formed : 0;
    });
    updatePanels(t, formed, since);
    orbits.forEach(o => { const ang = t * o.sp; o.sat.position.set(Math.cos(ang) * o.r, Math.sin(ang) * o.r, 0);
      o.m.material.opacity = .22 * formed; o.sat.material.opacity = formed; });

    const energy = .35 + .65 * Math.max(m, formed * .8);
    bars.forEach(b => b.m.material.color.copy(b.base).multiplyScalar(energy * (.55 + .45 * Math.sin(t * 2.2 + b.ph)) * 1.3));
    beams.forEach(b => { b.m.rotation.z = Math.sin(t * .35 + b.ph) * .35; b.m.rotation.x = Math.cos(t * .27 + b.ph) * .15;
      b.m.material.opacity = .08 * energy * eOut(t / 2.5); });
    bloom.strength = .7;
    const d = hGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) { d[i * 3 + 2] += .012; if (d[i * 3 + 2] > 12) d[i * 3 + 2] -= 52; }
    hGeo.attributes.position.needsUpdate = true;
    composer.render();
  }

  hero.classList.add('has-3d');
  let tAcc = 0; const clock = new THREE.Clock();
  window.prizmaHero = { seek(s) { tAcc = s; tick(tAcc); }, time: () => tAcc, phase: s => timeline((s + START) % P) };
  if (reduce) { tAcc = 5 - START + P; tick(tAcc); return; }
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
  const globe = () => landMask().then(mask => { try { init(mask); } catch (e) { console.warn('hero3d disabled', e); } });
  const go = () => import('./hero-image.js?v=1790560481')
    .then(m => m.findHeroImage().then(img => img ? m.initImageHero(img) : globe()))
    .catch(e => { console.warn('hero image mode failed', e); globe(); });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
}
