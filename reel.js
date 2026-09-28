// PRIZMA BI — 15-second motion-graphics showreel, drawn live on a canvas.
(() => {
  const canvas = document.getElementById('reel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 1600, H = 900, DUR = 15;
  const NAVY = '#0B1F3A', DEEP = '#07142A', ORANGE = '#F28C28', AMBER = '#FFB547',
        TEAL = '#36C2B4', CREAM = '#FBFAF7';

  const COPY = {
    es: { sub: 'finanzas · procesos · IA', s3: 'Del caos al orden.', s4: 'Una entrada. Muchos resultados.',
          s5: 'Datos bajo control.', t1: 'Primero estructura.', t2: 'Después, automatización.',
          l3: '01 — ESTRUCTURA', l4: '02 — AUTOMATIZACIÓN', l5: '03 — CONTROL', ok: 'CONCILIADO' },
    en: { sub: 'finance · process · AI', s3: 'From chaos to order.', s4: 'One input. Many outcomes.',
          s5: 'Data under control.', t1: 'Structure first.', t2: 'Automation second.',
          l3: '01 — STRUCTURE', l4: '02 — AUTOMATION', l5: '03 — CONTROL', ok: 'RECONCILED' }
  };
  const txt = () => COPY[document.documentElement.lang] || COPY.es;

  // ---------- helpers ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eOut = p => 1 - Math.pow(1 - p, 4);
  const eExpo = p => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIO = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const lerp = (a, b, p) => a + (b - a) * p;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const font = (w, s, fam = 'Geist, "Helvetica Neue", Arial, sans-serif') => `${w} ${s}px ${fam}`;
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  function bg(c) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
  function rise(str, x, y, size, p, color, weight = 800, align = 'left') {
    if (p <= 0) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, y - size * 1.05, W, size * 1.35); ctx.clip();
    ctx.globalAlpha = clamp(p * 1.5);
    ctx.fillStyle = color; ctx.font = font(weight, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillText(str, x, y + (1 - eExpo(p)) * size * 1.2);
    ctx.restore();
  }
  function tri(cx, cy, r) { // equilateral, point up
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 3;
      ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.closePath();
  }

  // ---------- precomputed ----------
  const r3 = rng(7), CHAOS = [];
  const COLS = 16, ROWS = 7;
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++)
    CHAOS.push({ gx: 330 + i * 62, gy: 250 + j * 62, x: r3() * W, y: r3() * H, r: r3() * 6.28,
                 c: [ORANGE, AMBER, TEAL, '#ffffff'][Math.floor(r3() * 4)], d: r3() * .5 });
  const r4 = rng(11), SHARDS = [...Array(14)].map((_, i) => ({ a: i / 14 * 6.28, rr: 250 + r4() * 120, s: 8 + r4() * 10, sp: .3 + r4() * .5 }));

  // ---------- scenes ----------
  // 1. Pulse — HUD rings and an orange starburst that blooms into a full-frame wipe
  function s1(t) {
    bg(NAVY);
    const c = [W / 2, H / 2], p = eOut(prog(t, 0, 1.1));
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(...c, 300 * p, 0, 6.28); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(...c, 150 * eOut(prog(t, .2, 1.2)), -1.57, -1.57 + 6.28 * eOut(prog(t, .2, 1.6))); ctx.stroke();
    // tick marks
    for (let i = 0; i < 60; i++) {
      if (i / 60 > prog(t, .1, 1.3)) break;
      const a = i / 60 * 6.28 - 1.57, r1 = 318, r2 = i % 5 ? 326 : 340;
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1);
      ctx.lineTo(c[0] + Math.cos(a) * r2, c[1] + Math.sin(a) * r2); ctx.stroke();
    }
    const n = 16, burst = eOut(prog(t, .3, 1.2));
    ctx.strokeStyle = ORANGE; ctx.lineCap = 'round'; ctx.lineWidth = 6;
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.28 + t * .9, L = (60 + 40 * Math.sin(t * 6 + i)) * burst;
      ctx.beginPath(); ctx.moveTo(c[0] + Math.cos(a) * 26, c[1] + Math.sin(a) * 26);
      ctx.lineTo(c[0] + Math.cos(a) * (26 + L), c[1] + Math.sin(a) * (26 + L)); ctx.stroke();
    }
    ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.arc(...c, 18 * burst + 4 * Math.sin(t * 8), 0, 6.28); ctx.fill();
    const w = eIO(prog(t, 1.75, 2.2));
    if (w > 0) { ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.arc(...c, w * 1000, 0, 6.28); ctx.fill(); }
  }

  // 2. Wordmark slam on orange
  function s2(t) {
    bg(ORANGE);
    const word = 'PRIZMA', size = 290;
    ctx.font = font(800, size);
    const ws = [...word].map(ch => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b, 0) - 20 * 5;
    let x = W / 2 - total / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 250, W, 330); ctx.clip();
    [...word].forEach((ch, i) => {
      const p = eExpo(prog(t, .1 + i * .07, .75 + i * .07));
      ctx.fillStyle = NAVY; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = font(800, size);
      ctx.fillText(ch, x, 540 + (1 - p) * 330);
      x += ws[i] - 20;
    });
    ctx.restore();
    // underline sweep + subtitle
    const u = eOut(prog(t, .8, 1.4));
    ctx.fillStyle = NAVY; ctx.fillRect(W / 2 - total / 2, 585, total * u, 10);
    rise(txt().sub, W / 2, 680, 44, prog(t, 1, 1.6), NAVY, 600, 'center');
    // stripe wipe out
    for (let i = 0; i < 9; i++) {
      const p = eIO(prog(t, 2.0 + i * .025, 2.4 + i * .025));
      ctx.fillStyle = NAVY; ctx.fillRect(0, i * H / 9, W * p, H / 9 + 1);
    }
  }

  // 3. Chaos → structure: scattered pieces snap into a grid
  function s3(t) {
    bg(NAVY);
    const cp = eIO(prog(t, .35, 1.7)), out = eIO(prog(t, 2.25, 2.6));
    CHAOS.forEach((d, k) => {
      const p = eIO(prog(t, .3 + d.d, 1.5 + d.d));
      let x = lerp(d.x + Math.sin(t * 2 + k) * 20, d.gx, p), y = lerp(d.y + Math.cos(t * 1.7 + k) * 20, d.gy, p);
      x = lerp(x, W / 2, out); y = lerp(y, H / 2, out);
      const s = lerp(18, 30, p) * (1 - out * .8);
      ctx.save(); ctx.translate(x, y); ctx.rotate(d.r * (1 - p) + t * (1 - p));
      ctx.fillStyle = p > .98 ? (k % 9 === 0 ? ORANGE : 'rgba(255,255,255,.9)') : d.c;
      ctx.globalAlpha = .9;
      ctx.fillRect(-s / 2, -s / 2, s, s * (k % 3 ? 1 : .35));
      ctx.restore();
    });
    // grid lines appear once ordered
    ctx.strokeStyle = `rgba(255,255,255,${.12 * cp * (1 - out)})`; ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(299 + i * 62, 219); ctx.lineTo(299 + i * 62, 219 + ROWS * 62); ctx.stroke(); }
    for (let j = 0; j <= ROWS; j++) { ctx.beginPath(); ctx.moveTo(299, 219 + j * 62); ctx.lineTo(299 + COLS * 62, 219 + j * 62); ctx.stroke(); }
    ctx.globalAlpha = 1 - out;
    rise(txt().l3, 120, 170, 22, prog(t, .2, .8), AMBER, 700);
    rise(txt().s3, 120, 790, 76, prog(t, 1.2, 1.9), '#ffffff');
    ctx.globalAlpha = 1;
    // cream wipe from bottom
    const w = eIO(prog(t, 2.3, 2.6)); ctx.fillStyle = CREAM; ctx.fillRect(0, H * (1 - w), W, H * w);
  }

  // 4. Prism: one beam in, a spectrum out
  function s4(t) {
    bg(CREAM);
    const cx = 700, cy = 470, R = 230;
    ctx.strokeStyle = 'rgba(11,31,58,.08)'; ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(i * 84, 0); ctx.lineTo(i * 84, H); ctx.stroke(); }
    // incoming beam
    const bi = eOut(prog(t, .1, .7));
    ctx.strokeStyle = NAVY; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 520); ctx.lineTo(lerp(0, cx - 95, bi), lerp(520, 480, bi)); ctx.stroke();
    // prism body
    const pp = eOut(prog(t, 0, .8));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - pp) * -.6); ctx.scale(pp, pp);
    tri(0, 0, R); ctx.fillStyle = 'rgba(242,140,40,.08)'; ctx.fill();
    ctx.strokeStyle = NAVY; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    // spectrum
    const beams = [[AMBER, -150], [ORANGE, -40], [TEAL, 70], [NAVY, 180]];
    beams.forEach(([c, dy], i) => {
      const p = eOut(prog(t, .7 + i * .08, 1.4 + i * .08));
      if (p <= 0) return;
      ctx.strokeStyle = c; ctx.lineWidth = 14; ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.moveTo(cx + 70, cy + 10); ctx.lineTo(lerp(cx + 70, W + 20, p), lerp(cy + 10, cy + 10 + dy * 1.3, p)); ctx.stroke();
      ctx.globalAlpha = 1;
    });
    // orbiting shards
    SHARDS.forEach(s => {
      const a = s.a + t * s.sp, pr = eOut(prog(t, .3, 1.2));
      ctx.save(); ctx.translate(cx + Math.cos(a) * s.rr * pr, cy + Math.sin(a) * s.rr * pr); ctx.rotate(a * 2);
      tri(0, 0, s.s); ctx.fillStyle = NAVY; ctx.globalAlpha = .75 * pr; ctx.fill(); ctx.restore();
    });
    ctx.globalAlpha = 1;
    rise(txt().l4, 120, 170, 22, prog(t, .2, .8), '#B85C0A', 700);
    rise(txt().s4, 120, 800, 70, prog(t, 1.1, 1.8), NAVY);
    // dark wipe from right
    const w = eIO(prog(t, 2.3, 2.6)); ctx.fillStyle = DEEP; ctx.fillRect(W * (1 - w), 0, W * w, H);
  }

  // 5. Control: a data wave field with ticking ledger
  function s5(t) {
    bg(DEEP);
    const up = eOut(prog(t, 0, .9));
    for (let gz = 0; gz < 26; gz++) for (let gx = 0; gx < 48; gx++) {
      const x = (gx - 24) * 46, z = 160 + gz * 38;
      const y = Math.sin(gx * .32 + t * 2.4) * Math.cos(gz * .28 + t * 1.4) * 70 + 170 + (1 - up) * 500;
      const f = 520 / z, sx = W * .58 + x * f, sy = H * .36 + y * f;
      if (sx < -10 || sx > W + 10) continue;
      const hot = (gx * 7 + gz * 3) % 23 === 0;
      ctx.fillStyle = hot ? ORANGE : `rgba(255,255,255,${clamp(f * .5, .08, .9)})`;
      const s = (hot ? 3.2 : 2) * f;
      ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
    }
    // ledger
    const r = rng(Math.floor(t * 14) + 3);
    ctx.font = font(500, 22, MONO); ctx.textAlign = 'left';
    for (let i = 0; i < 7; i++) {
      const a = prog(t, .4 + i * .12, .7 + i * .12);
      if (a <= 0) continue;
      const settled = t > 1.2 + i * .15;
      const v = settled ? rng(i * 97 + 5)() * 99999 : r() * 99999;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.fillText('€ ' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), 120, 300 + i * 46);
      if (settled) { ctx.fillStyle = TEAL; ctx.fillText('✓ ' + txt().ok, 330, 300 + i * 46); }
    }
    ctx.globalAlpha = 1;
    rise(txt().l5, 120, 170, 22, prog(t, .2, .8), AMBER, 700);
    rise(txt().s5, 120, 790, 76, prog(t, 1.2, 1.9), '#ffffff');
    // orange bars sweep up
    for (let i = 0; i < 6; i++) {
      const p = eIO(prog(t, 2.2 + i * .04, 2.55 + i * .04));
      ctx.fillStyle = i % 2 ? NAVY : ORANGE;
      ctx.fillRect(i * W / 6, H * (1 - p), W / 6 + 1, H * p);
    }
  }

  // 6. Resolve: logo + tagline, then fade for a seamless loop
  function s6(t) {
    bg(NAVY);
    const cx = W / 2, cy = 330;
    const d = eOut(prog(t, .1, 1));
    ctx.save(); ctx.translate(cx, cy);
    tri(0, 0, 120);
    ctx.setLineDash([760 * d, 760]); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.stroke(); ctx.setLineDash([]);
    const ip = eExpo(prog(t, .6, 1.2)); ctx.scale(ip, ip); tri(0, 22, 62); ctx.fillStyle = AMBER; ctx.fill();
    ctx.restore();
    ctx.font = font(800, 64); ctx.textAlign = 'left';
    const wm = prog(t, .9, 1.4), w1 = ctx.measureText('PRIZMA ').width, w2 = ctx.measureText('BI').width;
    ctx.globalAlpha = wm; ctx.fillStyle = '#ffffff'; ctx.fillText('PRIZMA', cx - (w1 + w2) / 2, 560);
    ctx.fillStyle = ORANGE; ctx.fillText('BI', cx - (w1 + w2) / 2 + w1, 560); ctx.globalAlpha = 1;
    rise(txt().t1, cx, 670, 52, prog(t, 1.2, 1.8), '#ffffff', 700, 'center');
    rise(txt().t2, cx, 740, 52, prog(t, 1.35, 1.95), AMBER, 700, 'center');
    const fade = prog(t, 2.2, 2.6);
    if (fade > 0) { ctx.globalAlpha = fade; bg(NAVY); ctx.globalAlpha = 1; }
  }

  const SCENES = [[0, 2.2, s1, 1, 'INTRO'], [2.2, 4.6, s2, 0, 'WORDMARK'], [4.6, 7.2, s3, 1, 'STRUCTURE'],
                  [7.2, 9.8, s4, 0, 'PRISM'], [9.8, 12.4, s5, 1, 'CONTROL'], [12.4, 15, s6, 1, 'RESOLVE']];

  // ---------- HUD overlay ----------
  function hud(t, light, label, idx) {
    const c = light ? 'rgba(255,255,255,.7)' : 'rgba(11,31,58,.75)';
    ctx.strokeStyle = c; ctx.lineWidth = 2;
    const m = 36, L = 28;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + L * sy); ctx.lineTo(x, y); ctx.lineTo(x + L * sx, y); ctx.stroke();
    });
    ctx.fillStyle = c; ctx.font = font(500, 16, MONO); ctx.textBaseline = 'middle';
    ctx.textAlign = 'left'; ctx.fillText('PRIZMA BI  ·  SHOWREEL', m + 44, m + 10);
    ctx.textAlign = 'right'; ctx.fillText(`SC ${String(idx + 1).padStart(2, '0')} / 06  ·  ${label}`, W - m - 44, m + 10);
    const fr = Math.floor((t % 1) * 25);
    ctx.textAlign = 'left'; ctx.fillText(`00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, m + 44, H - m - 10);
    ctx.fillRect(W - m - 244, H - m - 11, 200 * (t / DUR), 2);
    ctx.globalAlpha = .3; ctx.fillRect(W - m - 244, H - m - 11, 200, 2); ctx.globalAlpha = 1;
  }

  // ---------- loop ----------
  let playing = true, visible = true, last = null, time = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * dpr * H / W);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.width / W, 0, 0);
  }
  function render(t) {
    const i = SCENES.findIndex(s => t >= s[0] && t < s[1]), sc = SCENES[i < 0 ? 5 : i];
    ctx.save(); sc[2](t - sc[0]); ctx.restore();
    hud(t, sc[3], sc[4], i < 0 ? 5 : i);
  }
  function frame(now) {
    if (last != null && playing && visible) time = (time + (now - last) / 1000) % DUR;
    last = now;
    if (visible) render(time);
    requestAnimationFrame(frame);
  }
  const btn = document.querySelector('.reel-btn');
  function setBtn() { if (btn) { btn.textContent = playing ? '❚❚' : '▶'; btn.setAttribute('aria-label', playing ? 'Pause' : 'Play'); } }
  btn && btn.addEventListener('click', () => { playing = !playing; setBtn(); });
  canvas.addEventListener('click', () => { playing = !playing; setBtn(); });
  window.prizmaReel = { seek(t) { time = t % DUR; playing = false; setBtn(); render(time); }, play() { playing = true; setBtn(); } };
  new ResizeObserver(size).observe(canvas);
  if ('IntersectionObserver' in window)
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);
  size();
  const start = () => {
    if (reduce) { playing = false; time = 13.8; setBtn(); }
    requestAnimationFrame(frame);
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
