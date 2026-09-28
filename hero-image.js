// PRIZMA BI — 2.5D cinematic hero from a single still (prometheus.jpg).
// Bright subject on a dark background ⇒ luminance works as a depth map, so the
// statue floats in front of the background with mouse/scroll parallax. On top:
// pulsing circuitry, heat shimmer, an animated flame locked to the flame found
// in the image, rising embers and foreground bokeh for depth.
import * as THREE from 'three';

const hero = document.getElementById('hero');
const media = hero.querySelector('.hero-media');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Find the flame in the picture: centroid of bright, saturated orange pixels.
function findFlame(img) {
  const w = 200, h = Math.round(200 * img.height / img.width);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  let sx = 0, sy = 0, sw = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
    const bright = Math.max(r, gg, b), orange = r - b;
    const score = bright > .72 && orange > .35 && gg > .3 && gg < .92 ? (bright * orange) ** 3 : 0;
    sx += x * score; sy += y * score; sw += score;
  }
  return sw > 2 ? { x: sx / sw / w, y: sy / sw / h, found: true } : { x: .72, y: .32, found: false };
}

export function initImageHero(img) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  const canvas = renderer.domElement; canvas.id = 'hero3d';
  media.insertBefore(canvas, media.querySelector('video'));
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x05080f, 1);

  const flameAt = findFlame(img);
  const tex = new THREE.Texture(img); tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.needsUpdate = true;

  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10); cam.position.z = 1;

  const U = { uTex: { value: tex }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 },
    uIntro: { value: 0 }, uCover: { value: new THREE.Vector4(1, 1, 0, 0) }, uFlame: { value: new THREE.Vector2(flameAt.x, 1 - flameAt.y) } };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: /* glsl */`
      precision highp float;
      uniform sampler2D uTex; uniform float uTime, uScroll, uIntro; uniform vec2 uMouse, uFlame; uniform vec4 uCover;
      varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      vec3 tone(vec3 c){ return c; }
      void main(){
        // cover-fit + slow breathing push-in
        float zoom = mix(1.14, 1.045, uIntro) - .012 * sin(uTime * .25) - uScroll * .05;
        vec2 uv = (vUv - .5) * uCover.xy / zoom + .5 + uCover.zw;
        // luminance as depth (blurred via mip level) → parallax
        float depth = smoothstep(.05, .6, dot(textureLod(uTex, uv, 5.).rgb, vec3(.3, .59, .11)));
        uv += uMouse * (depth * .022 - (1. - depth) * .006) + vec2(0., uScroll * .03 * depth);
        // heat shimmer above the flame
        vec2 fd = uv - uFlame; float fall = exp(-dot(fd * vec2(3., 1.4), fd * vec2(3., 1.4)) * 40.) * step(0., fd.y + .04);
        uv.x += (n(uv * 38. + vec2(0., -uTime * 3.)) - .5) * .006 * fall;
        vec3 col = texture2D(uTex, uv).rgb;
        // pulse the orange circuitry
        float orange = smoothstep(.12, .4, col.r - col.b) * smoothstep(.35, .8, col.r);
        float wave = .5 + .5 * sin(uTime * 2.4 - uv.y * 14. + uv.x * 6.);
        col += vec3(1., .5, .15) * orange * (.08 + .22 * wave * wave);
        // flicker light from the flame onto the scene
        float fl = .9 + .1 * sin(uTime * 13.) * sin(uTime * 7.3);
        col *= mix(1., fl, orange);
        // grade: deep blacks, slight teal shadows
        col = mix(col, col * vec3(.9, 1., 1.06), smoothstep(.4, 0., dot(col, vec3(.33))));
        // intro reveal: a horizontal scan line sweeps the image in
        float scan = smoothstep(uIntro * 1.3 - .08, uIntro * 1.3, 1. - vUv.y);
        col *= 1. - scan;
        col += vec3(1., .6, .25) * exp(-pow((1. - vUv.y - uIntro * 1.3 + .04) * 60., 2.)) * .6 * (1. - uIntro);
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }`
  }));
  scene.add(quad);

  // soft sprite
  const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.3, 'rgba(255,255,255,.6)');
    r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const spr = (color, op) => new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color, transparent: true, opacity: op,
    blending: THREE.AdditiveBlending, depthWrite: false }));

  // flame locked to the flame in the image
  const flame = [...Array(150)].map(() => { const s = spr(0xffffff, 0); s.userData = { life: Math.random(), max: .6 + Math.random() * .6, ox: 0 }; scene.add(s); return s; });
  const cHot = new THREE.Color(0xfff4d6), cMid = new THREE.Color(0xffa230), cCool = new THREE.Color(0xc2410c);
  // embers across the frame
  const embers = [...Array(90)].map(() => { const s = spr(0xffb547, 0); s.userData = { life: Math.random(), p: new THREE.Vector2(), v: new THREE.Vector2() }; scene.add(s); return s; });
  // foreground bokeh (depth)
  const bokeh = [...Array(14)].map(() => { const s = spr(Math.random() < .6 ? 0xf28c28 : 0x36c2b4, 0);
    s.userData = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, r: .08 + Math.random() * .18, sp: .02 + Math.random() * .04, ph: Math.random() * 6 }; scene.add(s); return s; });

  let W = 1, H = 1, aspect = 1, mx = 0, my = 0, tmx = 0, tmy = 0, visible = true;
  const ia = img.width / img.height;
  function toScreen(u, v) {       // image uv (0..1, y down) → NDC, respecting cover-fit and zoom
    const c = U.uCover.value, zoom = 1.045;
    const x = ((u - .5 - c.z) * zoom / c.x) * 2, y = ((1 - v - .5 - c.w) * zoom / c.y) * 2;
    return new THREE.Vector2(x, y);
  }
  function layout() {
    W = media.clientWidth; H = media.clientHeight; aspect = W / H;
    renderer.setSize(W, H, false);
    // cover-fit; on narrow screens keep the subject (right third) in view
    const sx = aspect > ia ? 1 : aspect / ia, sy = aspect > ia ? ia / aspect : 1;
    const shift = aspect < ia ? Math.min((1 - sx) / 2, (flameAt.x - .5) * .9) : 0;
    U.uCover.value.set(sx, sy, shift, 0);
  }
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  new ResizeObserver(layout).observe(media);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(media);
  layout();

  const clock = new THREE.Clock(); let t = 0;
  const ease = p => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
  function tick(dt) {
    t += dt; U.uTime.value = t; U.uIntro.value = ease(t / 2.6);
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    U.uMouse.value.set(-mx, my);
    U.uScroll.value = Math.min(1, scrollY / innerHeight);
    const f = toScreen(flameAt.x, flameAt.y), pw = ease((t - 1.8) / 1.5) * (flameAt.found ? 1 : .0);
    const s = .06;   // flame size in vertical NDC units
    flame.forEach(p => { const d = p.userData; d.life += dt / d.max; if (d.life >= 1) { d.life = 0; d.ox = (Math.random() - .5) * .6; }
      const k = d.life;
      p.position.set(f.x + (d.ox * (1 - k) + Math.sin(t * 3 + d.ox * 9 + k * 5) * .5 * k) * s / aspect, f.y + k * s * 5.5, 0);
      p.material.color.copy(k < .35 ? cHot.clone().lerp(cMid, k / .35) : cMid.clone().lerp(cCool, (k - .35) / .65));
      p.material.opacity = pw * Math.sin(Math.PI * Math.min(1, k * 1.1)) * (k < .35 ? .5 : .32);
      p.scale.set((1.1 - k * .7) * s * 1.6 / aspect, (1.7 - k * .8) * s * 1.6, 1);
    });
    embers.forEach(p => { const d = p.userData; d.life += dt * .32;
      if (d.life >= 1 || d.p.lengthSq() === 0) { d.life = 0;
        const fromFlame = flameAt.found && Math.random() < .55;
        d.p.set(fromFlame ? f.x + (Math.random() - .5) * .08 : Math.random() * 2 - 1, fromFlame ? f.y : -1.05);
        d.v.set((Math.random() - .5) * .08, .12 + Math.random() * .25); }
      d.p.addScaledVector(d.v, dt); d.v.x += Math.sin(t * 1.7 + d.life * 11) * dt * .05;
      p.position.set(d.p.x, d.p.y, 0); const es = .014 + .006 * Math.sin(d.life * 20); p.scale.set(es / aspect, es, 1);
      p.material.opacity = (1 - d.life) * .9 * ease(t / 2); });
    bokeh.forEach(p => { const d = p.userData; d.y += d.sp * dt; if (d.y > 1.3) d.y = -1.3;
      p.position.set(d.x + mx * .08 * (d.r * 6), d.y + Math.sin(t * .3 + d.ph) * .02 - my * .05, 0);
      p.scale.set(d.r / aspect * 1.2, d.r, 1); p.material.opacity = .05 * ease(t / 3); });
    renderer.render(scene, cam);
  }
  hero.classList.add('has-3d', 'has-image');
  if (reduce) { t = 6; tick(0); return; }
  (function loop() { requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), .05);
    if (!visible || document.hidden || hero.classList.contains('has-video')) return; tick(dt); })();
  window.prizmaHero = { flame: flameAt, time: () => t };
}

// Look for the still; resolve with the <img> if one exists.
export function findHeroImage() {
  const names = ['prometheus.jpg', 'prometheus.png'];
  return names.reduce((p, name) => p.then(found => found || new Promise(res => {
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = name;
  })), Promise.resolve(null));
}
