// PRIZMA BI — generative hero: a rotating point-cloud "core" with orange circuitry
// and travelling data pulses. Shown until/unless hero.mp4 is available.
(() => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.getElementById('hero');

  // Fibonacci sphere, slightly flattened into a prism-like silhouette
  const N = 1100, pts = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963;
    pts.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r, hot: false });
  }
  // Circuit nodes: pick a subset and link each to its nearest neighbours
  let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const nodes = pts.filter(() => rnd() < .11);
  nodes.forEach(p => (p.hot = true));
  const links = [];
  nodes.forEach((a, i) => {
    const near = nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2])
      .filter(([j]) => j !== i).sort((m, n) => m[1] - n[1]).slice(0, 2);
    near.forEach(([j, d]) => { if (d < .12 && i < j) links.push([a, nodes[j], rnd()]); });
  });
  // Orbit rings
  const rings = [{ tilt: .5, r: 1.45, sp: .25, n: 3 }, { tilt: -.9, r: 1.75, sp: -.18, n: 2 }];

  let W = 0, H = 0, dpr = 1, mx = 0, my = 0, tmx = 0, tmy = 0, visible = true;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  function rot(p, ay, ax) {
    let x = p.x * Math.cos(ay) - p.z * Math.sin(ay), z = p.x * Math.sin(ay) + p.z * Math.cos(ay), y = p.y;
    const y2 = y * Math.cos(ax) - z * Math.sin(ax), z2 = y * Math.sin(ax) + z * Math.cos(ax);
    return { x, y: y2, z: z2 };
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const mobile = W < 820;
    const cx = mobile ? W * .5 : W * .68, cy = mobile ? H * .34 : H * .46;
    const R = Math.min(W, H) * (mobile ? .32 : .33);
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    const ay = t * .12 + mx * .8, ax = .35 + my * .5;
    const f = 3.2, proj = p => { const s = f / (f + p.z); return [cx + p.x * R * s, cy + p.y * R * s, s]; };

    // glow
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
    g.addColorStop(0, 'rgba(242,140,40,.18)'); g.addColorStop(.5, 'rgba(242,140,40,.05)'); g.addColorStop(1, 'rgba(242,140,40,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // rings
    rings.forEach(rg => {
      ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 0; k <= 96; k++) {
        const a = k / 96 * 6.283, p = rot({ x: Math.cos(a) * rg.r, y: 0, z: Math.sin(a) * rg.r }, ay * .3, ax + rg.tilt);
        const [x, y] = proj(p); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      for (let k = 0; k < rg.n; k++) {
        const a = t * rg.sp + k / rg.n * 6.283, p = rot({ x: Math.cos(a) * rg.r, y: 0, z: Math.sin(a) * rg.r }, ay * .3, ax + rg.tilt);
        const [x, y, s] = proj(p);
        ctx.fillStyle = k % 2 ? '#36C2B4' : '#FFB547';
        ctx.beginPath(); ctx.arc(x, y, 3.2 * s, 0, 6.283); ctx.fill();
      }
    });

    // points
    const P = pts.map(p => { const r = rot(p, ay, ax), [x, y, s] = proj(r); return { x, y, s, z: r.z, hot: p.hot, src: p }; });
    P.forEach(p => {
      const front = p.z < 0, a = front ? .75 : .18;
      if (p.hot) {
        ctx.fillStyle = `rgba(242,140,40,${front ? .95 : .35})`;
        const s = 2.6 * p.s; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      } else {
        ctx.fillStyle = `rgba(233,237,244,${a * .8})`;
        const s = 1.5 * p.s; ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    });

    // circuitry + pulses
    const map = new Map(P.map(p => [p.src, p]));
    links.forEach(([a, b, ph]) => {
      const A = map.get(a), B = map.get(b), front = (A.z + B.z) < 0;
      ctx.strokeStyle = front ? 'rgba(255,181,71,.55)' : 'rgba(255,181,71,.12)'; ctx.lineWidth = 1;
      // right-angle "trace" look
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      if (front) {
        const q = (t * .6 + ph) % 1, len = Math.abs(B.x - A.x) + Math.abs(B.y - A.y), d = q * len, hx = Math.abs(B.x - A.x);
        const x = d < hx ? A.x + Math.sign(B.x - A.x) * d : B.x, y = d < hx ? A.y : A.y + Math.sign(B.y - A.y) * (d - hx);
        ctx.fillStyle = '#fff'; ctx.shadowColor = '#F28C28'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      }
    });
  }

  let t0 = null;
  function frame(now) {
    if (t0 == null) t0 = now;
    if (hero.classList.contains('has-3d')) return;   // WebGL hero took over
    if (visible && !hero.classList.contains('has-video')) draw((now - t0) / 1000);
    if (!reduce) requestAnimationFrame(frame);
  }
  new ResizeObserver(size).observe(canvas);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);
  size();
  requestAnimationFrame(frame);
})();
