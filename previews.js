// PRIZMA BI — animated "sample deliverable" previews, one per use case.
// Each renderer draws a looping product mock-up (8 s) on a canvas in a 800×500
// logical space. Data shown is illustrative.
(() => {
  const LW = 800, LH = 500, LOOP = 8;
  const C = { bg: '#0A1220', panel: '#0F1A2D', panel2: '#132238', line: 'rgba(255,255,255,.08)', line2: 'rgba(255,255,255,.16)',
    text: '#E9EDF4', text2: '#B4BDCC', muted: '#7C879A', orange: '#F28C28', amber: '#FFB547', teal: '#36C2B4', red: '#FF6B5B', ice: '#7FB2FF' };
  const MONO = '"Geist Mono", ui-monospace, Menlo, Consolas, monospace', DISP = 'Geist, "Helvetica Neue", Arial, sans-serif', UI = 'Geist, "Helvetica Neue", Arial, sans-serif';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eo = p => 1 - Math.pow(1 - clamp(p), 3);
  const eb = p => { p = clamp(p); const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const lang = () => (document.documentElement.lang === 'es' ? 'es' : 'en');
  const L = (en, es) => (lang() === 'es' ? es : en);
  const fmt = (n, d = 0) => n.toLocaleString(lang() === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });

  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function txt(g, s, x, y, size, color, w = 500, fam = UI, align = 'left') {
    g.font = `${w} ${size}px ${fam}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y);
  }
  function chrome(g, title, tag) {
    g.fillStyle = C.bg; g.fillRect(0, 0, LW, LH);
    g.fillStyle = C.panel; g.fillRect(0, 0, LW, 40);
    g.fillStyle = C.line; g.fillRect(0, 40, LW, 1);
    ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(22 + i * 18, 20, 5.5, 0, 6.3); g.fill(); });
    txt(g, title, 86, 25, 13, C.text2, 500, UI);
    if (tag) { g.font = `500 11px ${MONO}`; const w = g.measureText(tag).width + 18;
      rr(g, LW - w - 16, 11, w, 19, 10); g.fillStyle = 'rgba(242,140,40,.15)'; g.fill();
      txt(g, tag, LW - w - 7, 25, 11, C.amber, 500, MONO); }
  }
  function card(g, x, y, w, h) { rr(g, x, y, w, h, 12); g.fillStyle = C.panel; g.fill(); g.strokeStyle = C.line; g.lineWidth = 1; g.stroke(); }
  function fadeLoop(g, t) { const f = prog(t, LOOP - .45, LOOP); if (f > 0) { g.globalAlpha = f; g.fillStyle = C.bg; g.fillRect(0, 0, LW, LH); g.globalAlpha = 1; } }
  function cursor(g, x, y, click) {
    g.save(); g.translate(x, y);
    if (click) { g.strokeStyle = 'rgba(242,140,40,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 10 + click * 12, 0, 6.3); g.globalAlpha = 1 - click; g.stroke(); g.globalAlpha = 1; }
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 17); g.lineTo(4.5, 13); g.lineTo(8, 20); g.lineTo(10.5, 19); g.lineTo(7, 12); g.lineTo(12.5, 12); g.closePath();
    g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#05080F'; g.lineWidth = 1.2; g.stroke(); g.restore();
  }

  // 1 ── Management reporting: KPI tiles + actual vs budget bars + variances
  function management(g, t) {
    chrome(g, L('Management Pack — September', 'Pack de gestión — Septiembre'), L('AUTO-GENERATED', 'GENERADO AUTO'));
    const kpis = [[L('Revenue', 'Ingresos'), 4.82, 'M€', 6.1], [L('Gross margin', 'Margen bruto'), 38.4, '%', 1.2], ['EBITDA', 0.91, 'M€', 4.3], [L('Cash', 'Caja'), 2.37, 'M€', -2.1]];
    kpis.forEach(([k, v, u, d], i) => {
      const p = eo(prog(t, .2 + i * .12, 1.4 + i * .12)), x = 20 + i * 192;
      g.globalAlpha = clamp(p * 2); card(g, x, 56 + (1 - p) * 20, 180, 86);
      txt(g, k.toUpperCase(), x + 16, 80 + (1 - p) * 20, 11, C.muted, 500, MONO);
      txt(g, fmt(v * p, u === '%' ? 1 : 2) + ' ' + u, x + 16, 116 + (1 - p) * 20, 26, C.text, 800, DISP);
      txt(g, (d > 0 ? '▲ ' : '▼ ') + fmt(Math.abs(d), 1) + '%', x + 16, 134 + (1 - p) * 20, 12, d > 0 ? C.teal : C.red, 600);
      g.globalAlpha = 1;
    });
    card(g, 20, 158, 470, 322);
    txt(g, L('Actual vs budget · k€', 'Real vs presupuesto · k€'), 38, 186, 13, C.text2, 600);
    const act = [310, 342, 368, 355, 401, 428, 415, 446, 482], bud = [320, 330, 350, 370, 385, 400, 420, 435, 450];
    const mo = L('JFMAMJJAS', 'EFMAMJJAS');
    for (let i = 0; i < 9; i++) {
      const p = eb(prog(t, .8 + i * .08, 1.8 + i * .08)), x = 50 + i * 48, base = 440;
      g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x, base - bud[i] * .5 * p, 16, bud[i] * .5 * p);
      g.fillStyle = i === 8 ? C.orange : C.amber; g.globalAlpha = i === 8 ? 1 : .75;
      g.fillRect(x + 18, base - act[i] * .5 * p, 16, act[i] * .5 * p); g.globalAlpha = 1;
      txt(g, mo[i], x + 17, 462, 11, C.muted, 500, MONO, 'center');
    }
    g.fillStyle = C.line; g.fillRect(40, 440, 440, 1);
    card(g, 506, 158, 274, 322);
    txt(g, L('Top variances', 'Principales desviaciones'), 524, 186, 13, C.text2, 600);
    const rows = [[L('Room revenue', 'Ingresos habitaciones'), '+84k', 1], [L('Energy', 'Energía'), '-22k', 0], [L('Marketing', 'Marketing'), '-15k', 0], ['F&B', '+31k', 1], [L('Maintenance', 'Mantenimiento'), '-9k', 0]];
    rows.forEach(([n, v, up], i) => {
      const p = eo(prog(t, 1.8 + i * .15, 2.5 + i * .15)); if (p <= 0) return;
      g.globalAlpha = p; const y = 222 + i * 50;
      g.fillStyle = C.line; g.fillRect(524, y + 16, 238, 1);
      txt(g, n, 524 + (1 - p) * 20, y, 13, C.text, 500);
      txt(g, v, 762, y, 13, up ? C.teal : C.red, 700, MONO, 'right');
      g.fillStyle = up ? 'rgba(54,194,180,.25)' : 'rgba(255,107,91,.25)';
      g.fillRect(524, y + 6, 238 * (.2 + (i % 3) * .2) * p, 3);
      g.globalAlpha = 1;
    });
    const c = prog(t, 4.2, 5.2); if (c > 0 && c < 1) cursor(g, 600 + c * 80, 300 - c * 60);
    if (t > 5.2) { const k = prog(t, 5.2, 5.8); cursor(g, 680, 240, k); if (t > 5.4) {
      rr(g, 540, 250, 230, 58, 10); g.fillStyle = '#1A2B45'; g.fill(); g.strokeStyle = C.orange; g.stroke();
      txt(g, L('AI note: occupancy +6 pts vs plan', 'Nota IA: ocupación +6 pts vs plan'), 554, 274, 12, C.text, 600);
      txt(g, L('driven by group bookings', 'por reservas de grupos'), 554, 294, 12, C.muted, 500); } }
    fadeLoop(g, t);
  }

  // 2 ── Investor & board reporting: slide deck cycling through slides
  function board(g, t) {
    chrome(g, L('Board Pack — Q3 2026.pptx', 'Board Pack — T3 2026.pptx'), L('READY TO PRESENT', 'LISTO'));
    g.fillStyle = '#070C16'; g.fillRect(0, 41, 150, LH);
    const slide = Math.floor(t / 2.4) % 3, sp = prog(t % 2.4, 0, .5);
    for (let i = 0; i < 4; i++) { rr(g, 18, 60 + i * 96, 114, 72, 6); g.fillStyle = i === slide ? '#1A2B45' : C.panel; g.fill();
      g.strokeStyle = i === slide ? C.orange : C.line; g.lineWidth = i === slide ? 2 : 1; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(28, 72 + i * 96, 60, 5); g.fillRect(28, 84 + i * 96, 90, 3); g.fillRect(28, 92 + i * 96, 76, 3); }
    const X = 172, Y = 62, SW = 610, SH = 400;
    g.save(); g.translate((1 - eo(sp)) * 40, 0); g.globalAlpha = eo(sp);
    rr(g, X, Y, SW, SH, 10); g.fillStyle = '#F7F5F0'; g.fill();
    g.fillStyle = C.orange; g.fillRect(X, Y, 8, SH);
    const N = '#0B1F3A';
    if (slide === 0) {
      txt(g, L('Q3 highlights', 'Aspectos clave T3'), X + 40, Y + 70, 30, N, 800, DISP);
      [L('Revenue ahead of plan (+4.3%)', 'Ingresos por encima del plan (+4,3%)'), L('EBITDA margin at 18.9%', 'Margen EBITDA del 18,9%'),
       L('Cash runway: 22 months', 'Runway de caja: 22 meses'), L('Two openings on schedule', 'Dos aperturas en plazo')].forEach((s, i) => {
        const p = eo(prog(t % 2.4, .4 + i * .2, .9 + i * .2)); g.globalAlpha = p;
        g.fillStyle = C.orange; g.fillRect(X + 40, Y + 118 + i * 58, 10, 10);
        txt(g, s, X + 64 + (1 - p) * 20, Y + 128 + i * 58, 19, N, 600); });
    } else if (slide === 1) {
      txt(g, L('Revenue & EBITDA trend', 'Evolución ingresos y EBITDA'), X + 40, Y + 70, 28, N, 800, DISP);
      const v = [42, 48, 51, 57, 63, 70, 76, 84];
      v.forEach((h, i) => { const p = eb(prog(t % 2.4, .3 + i * .07, .9 + i * .07));
        g.fillStyle = i === 7 ? C.orange : '#C9D2DF'; g.fillRect(X + 60 + i * 64, Y + 350 - h * 3 * p, 38, h * 3 * p); });
      g.strokeStyle = N; g.lineWidth = 3; g.beginPath();
      v.forEach((h, i) => { const p = prog(t % 2.4, .9, 1.8); if (i / 7 > p) return; const x = X + 79 + i * 64, y = Y + 330 - h * 2.2; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
    } else {
      txt(g, L('Decisions requested', 'Decisiones a aprobar'), X + 40, Y + 70, 30, N, 800, DISP);
      [[L('Approve FY27 budget', 'Aprobar presupuesto FY27'), 'A'], [L('Refinance facility B', 'Refinanciar línea B'), 'B'], [L('New site: Lisbon', 'Nueva ubicación: Lisboa'), 'C']].forEach(([s, k], i) => {
        const p = eo(prog(t % 2.4, .3 + i * .25, .8 + i * .25)); g.globalAlpha = p;
        rr(g, X + 40, Y + 108 + i * 84, SW - 80, 64, 10); g.fillStyle = '#ECE8E0'; g.fill();
        txt(g, k, X + 66, Y + 150 + i * 84, 22, C.orange, 800, DISP); txt(g, s, X + 100, Y + 148 + i * 84, 19, N, 600);
        if (t % 2.4 > 1.3 + i * .2) { g.fillStyle = C.teal; g.beginPath(); g.arc(X + SW - 80, Y + 140 + i * 84, 13, 0, 6.3); g.fill(); txt(g, '✓', X + SW - 80, Y + 146 + i * 84, 15, '#fff', 800, UI, 'center'); } });
    }
    g.globalAlpha = 1; g.restore();
    fadeLoop(g, t);
  }

  // 3 ── Consolidated reporting: entities flowing into a group total
  function consolidated(g, t) {
    chrome(g, L('Group consolidation — FY26 · 5 entities', 'Consolidación de grupo — FY26 · 5 sociedades'), 'IFRS');
    const ents = [['ES', 'EUR', 2.41], ['UK', 'GBP', 1.12], ['DE', 'EUR', 0.84], ['NL', 'EUR', 0.63], ['US', 'USD', 0.97]];
    const gx = 620, gy = 270;
    ents.forEach(([c, cur, v], i) => {
      const y = 80 + i * 80, p = eo(prog(t, .2 + i * .12, 1 + i * .12)); g.globalAlpha = p;
      card(g, 30, y, 210, 60);
      txt(g, c, 50, y + 38, 22, C.text, 800, DISP);
      txt(g, cur, 96, y + 26, 11, C.muted, 500, MONO);
      txt(g, fmt(v * p, 2) + 'M', 96, y + 46, 16, C.text, 700, MONO);
      if (cur !== 'EUR') { rr(g, 180, y + 18, 44, 22, 11); g.fillStyle = 'rgba(127,178,255,.15)'; g.fill(); txt(g, 'FX', 202, y + 34, 11, C.ice, 600, MONO, 'center'); }
      g.globalAlpha = 1;
      const lp = prog(t, 1 + i * .1, 2 + i * .1);
      g.strokeStyle = 'rgba(255,181,71,.35)'; g.lineWidth = 1.5; g.beginPath();
      const sx = 240, sy = y + 30, mx = 420;
      g.moveTo(sx, sy); g.bezierCurveTo(mx, sy, mx, gy, lerp(sx, gx - 110, lp), lerp(sy, gy, lp)); g.stroke();
      for (let k = 0; k < 3; k++) { const u = ((t * .5 + k / 3 + i * .13) % 1); if (lp < 1) break;
        const bx = bez(sx, mx, mx, gx - 110, u), by = bez(sy, sy, gy, gy, u);
        g.fillStyle = C.amber; g.beginPath(); g.arc(bx, by, 3, 0, 6.3); g.fill(); }
    });
    const gp = eb(prog(t, 2, 2.8));
    g.save(); g.translate(gx, gy); g.scale(gp, gp);
    rr(g, -110, -86, 220, 172, 16); g.fillStyle = '#16263F'; g.fill(); g.strokeStyle = C.orange; g.lineWidth = 2; g.stroke();
    txt(g, L('GROUP', 'GRUPO'), 0, -50, 12, C.amber, 600, MONO, 'center');
    const tot = 5.97 - 0.38 * prog(t, 3.2, 4.4);
    txt(g, fmt(tot, 2) + 'M€', 0, -6, 34, C.text, 800, DISP, 'center');
    txt(g, L('Revenue, consolidated', 'Ingresos consolidados'), 0, 20, 12, C.muted, 500, UI, 'center');
    if (t > 3.2) { const p = prog(t, 3.2, 4.4); rr(g, -86, 38, 172, 30, 15); g.fillStyle = 'rgba(54,194,180,.15)'; g.fill();
      txt(g, (p < 1 ? L('Eliminating… ', 'Eliminando… ') : '✓ ') + L('interco −0.38M', 'interco −0,38M'), 0, 58, 12, C.teal, 600, MONO, 'center'); }
    g.restore();
    fadeLoop(g, t);
  }
  const lerp = (a, b, p) => a + (b - a) * p;
  const bez = (a, b, c, d, u) => { const m = 1 - u; return m * m * m * a + 3 * m * m * u * b + 3 * m * u * u * c + u * u * u * d; };

  // 4 ── Budgeting: department table with budget vs actual progress
  function budget(g, t) {
    chrome(g, L('FY26 Budget tracker — by department', 'Seguimiento presupuesto FY26 — por área'), L('LIVE', 'EN VIVO'));
    const cols = [L('Department', 'Área'), L('Budget', 'Presup.'), L('Actual YTD', 'Real acum.'), L('Used', 'Consumido'), L('Var.', 'Desv.')];
    const cx = [30, 250, 360, 480, 700];
    card(g, 20, 56, 760, 424);
    cols.forEach((c, i) => txt(g, c.toUpperCase(), cx[i], 86, 11, C.muted, 500, MONO));
    const rows = [[L('Sales', 'Ventas'), 820, 610], [L('Operations', 'Operaciones'), 1450, 1180], [L('Marketing', 'Marketing'), 380, 342], ['IT', 290, 170], [L('Finance', 'Finanzas'), 240, 175], [L('Facilities', 'Instalaciones'), 510, 402], [L('HQ & other', 'Central y otros'), 330, 214]];
    const hi = Math.floor(prog(t, 3, 6.5) * rows.length);
    rows.forEach(([n, b, a], i) => {
      const y = 126 + i * 50, p = eo(prog(t, .3 + i * .1, 1.6 + i * .1));
      if (t > 3 && i === hi && t < 6.5) { g.fillStyle = 'rgba(242,140,40,.08)'; g.fillRect(22, y - 28, 756, 46); }
      g.fillStyle = C.line; g.fillRect(30, y + 14, 740, 1);
      g.globalAlpha = clamp(p * 1.5);
      txt(g, n, cx[0], y, 14, C.text, 600);
      txt(g, fmt(b) + 'k', cx[1], y, 13, C.text2, 500, MONO);
      txt(g, fmt(a * p) + 'k', cx[2], y, 13, C.text, 600, MONO);
      const used = a / b, bw = 190;
      rr(g, cx[3], y - 11, bw, 10, 5); g.fillStyle = 'rgba(255,255,255,.08)'; g.fill();
      rr(g, cx[3], y - 11, bw * Math.min(used, 1) * p, 10, 5); g.fillStyle = used > .85 ? C.orange : C.teal; g.fill();
      const ytd = .75; const v = (used - ytd) * 100;
      rr(g, cx[4] - 6, y - 17, 64, 22, 11); g.fillStyle = v > 5 ? 'rgba(255,107,91,.15)' : 'rgba(54,194,180,.15)'; g.fill();
      txt(g, (v > 0 ? '+' : '') + fmt(v, 0) + '%', cx[4] + 26, y - 1, 12, v > 5 ? C.red : C.teal, 700, MONO, 'center');
      g.globalAlpha = 1;
    });
    g.strokeStyle = 'rgba(255,181,71,.5)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx[3] + 190 * .75, 100); g.lineTo(cx[3] + 190 * .75, 460); g.stroke(); g.setLineDash([]);
    txt(g, L('YTD 75%', 'ACUM. 75%'), cx[3] + 190 * .75, 474, 10, C.amber, 500, MONO, 'center');
    fadeLoop(g, t);
  }

  // 5 ── Cash flow: 13-week forecast with scenarios and a minimum-cash line
  function cash(g, t) {
    chrome(g, L('13-week cash flow forecast', 'Previsión de caja a 13 semanas'), L('UPDATED TODAY', 'ACTUALIZADO HOY'));
    card(g, 20, 56, 760, 424);
    const sc = Math.floor(prog(t, 3.4, 7.4) * 3), names = [L('Base', 'Base'), L('Best', 'Optimista'), L('Worst', 'Pesimista')];
    names.forEach((n, i) => { rr(g, 40 + i * 110, 74, 100, 28, 14); g.fillStyle = i === Math.min(sc, 2) ? C.orange : 'rgba(255,255,255,.06)'; g.fill();
      txt(g, n, 90 + i * 110, 93, 12, i === Math.min(sc, 2) ? '#05080F' : C.text2, 600, UI, 'center'); });
    const base = [2.4, 2.1, 2.3, 1.9, 1.7, 2.0, 2.2, 1.8, 1.6, 1.9, 2.3, 2.5, 2.7];
    const DELTA = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                   [0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5, .55, .6],
                   [0, 0, -.05, -.1, -.1, -.2, -.3, -.45, -.55, -.35, -.2, -.1, 0]][Math.min(sc, 2)];
    const vals = base.map((v, i) => v + DELTA[i]), MIN = 1.5, first = vals.findIndex(v => v < MIN);
    const X0 = 70, Y0 = 440, dx = 52, k = 110;
    g.fillStyle = C.line; for (let i = 0; i < 5; i++) g.fillRect(X0 - 20, Y0 - i * 70, 690, 1);
    for (let i = 0; i < 5; i++) txt(g, fmt(i * 70 / k, 1) + 'M', X0 - 26, Y0 - i * 70 + 4, 10, C.muted, 500, MONO, 'right');
    vals.forEach((vv, i) => {
      const p = eb(prog(t, .3 + i * .06, 1.2 + i * .06)), h = vv * k * p;
      g.fillStyle = vv < MIN ? C.red : i < 2 ? C.teal : 'rgba(255,181,71,.8)';
      rr(g, X0 + i * dx, Y0 - h, 30, h, 4); g.fill();
      txt(g, (lang() === 'es' ? 'S' : 'W') + (i + 1), X0 + i * dx + 15, Y0 + 18, 10, C.muted, 500, MONO, 'center');
    });
    const mp = prog(t, 1.6, 2.4);
    g.strokeStyle = C.red; g.setLineDash([6, 5]); g.lineWidth = 1.5; g.beginPath();
    g.moveTo(X0 - 20, Y0 - MIN * k); g.lineTo(X0 - 20 + 690 * mp, Y0 - MIN * k); g.stroke(); g.setLineDash([]);
    if (mp >= 1) { rr(g, X0 - 20, Y0 - MIN * k - 24, 150, 20, 6); g.fillStyle = '#0A1220'; g.fill();
      txt(g, L('MIN. CASH 1.5M', 'CAJA MÍN. 1,5M'), X0 - 12, Y0 - MIN * k - 10, 11, C.red, 600, MONO); }
    if (first >= 0 && t > 6) { rr(g, 440, 120, 320, 54, 10); g.fillStyle = 'rgba(255,107,91,.12)'; g.fill(); g.strokeStyle = C.red; g.stroke();
      txt(g, L(`⚠ Alert: W${first + 1} below minimum cash`, `⚠ Alerta: S${first + 1} por debajo de caja mínima`), 456, 142, 13, C.text, 700);
      txt(g, L('Suggested: delay capex, draw facility', 'Sugerido: aplazar capex, disponer línea'), 456, 162, 12, C.text2, 500); }
    fadeLoop(g, t);
  }

  // 6 ── FP&A: driver tree that recalculates
  function fpa(g, t) {
    chrome(g, L('Driver-based plan — Revenue', 'Plan por drivers — Ingresos'), 'FP&A');
    const tw = Math.sin(clamp((t - 3) / 3) * Math.PI);
    const occ = 72 + tw * 6, adr = 118 + tw * 7, rooms = 420;
    const rev = rooms * 365 * occ / 100 * adr / 1e6;
    const nodes = [
      [400, 110, L('Revenue', 'Ingresos'), fmt(rev, 2) + 'M€', C.orange, 0],
      [210, 250, L('Room nights', 'Noches vendidas'), fmt(rooms * 365 * occ / 100 / 1000, 1) + 'k', C.amber, .3],
      [590, 250, 'ADR', fmt(adr, 0) + ' €', C.amber, .4],
      [105, 390, L('Rooms', 'Habitaciones'), fmt(rooms), C.text2, .6],
      [295, 390, L('Occupancy', 'Ocupación'), fmt(occ, 1) + '%', C.teal, .7],
      [505, 390, L('Rack rate', 'Tarifa base'), '142 €', C.text2, .8],
      [695, 390, L('Discounts', 'Descuentos'), '-' + fmt(24 - tw * 7, 0) + ' €', C.text2, .9]];
    const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
    edges.forEach(([a, b]) => { const p = prog(t, .4 + nodes[b][5], 1 + nodes[b][5]); const A = nodes[a], B = nodes[b];
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(A[0], A[1] + 32);
      g.lineTo(A[0], lerp(A[1] + 32, (A[1] + B[1]) / 2, p)); if (p > .5) { g.lineTo(lerp(A[0], B[0], (p - .5) * 2), (A[1] + B[1]) / 2); }
      if (p >= 1) g.lineTo(B[0], B[1] - 32); g.stroke();
      if (t > 3 && t < 6) { const u = (t * .8) % 1; g.fillStyle = C.orange; g.beginPath();
        g.arc(lerp(B[0], A[0], u), lerp(B[1] - 32, A[1] + 32, u), 3, 0, 6.3); g.fill(); } });
    nodes.forEach(([x, y, n, v, c, d], i) => {
      const p = eb(prog(t, d, d + .6)); g.save(); g.translate(x, y); g.scale(p, p);
      const w = i === 0 ? 220 : i > 2 ? 160 : 180; rr(g, -w / 2, -32, w, 64, 12); g.fillStyle = i === 0 ? '#1B2A44' : C.panel; g.fill();
      g.strokeStyle = (i === 4 || i === 6) && t > 3 && t < 6 ? C.orange : c === C.orange ? C.orange : C.line2; g.lineWidth = 1.5; g.stroke();
      txt(g, n.toUpperCase(), 0, -8, 10.5, C.muted, 500, MONO, 'center'); txt(g, v, 0, 20, i === 0 ? 24 : 19, i === 0 ? C.text : c, 800, DISP, 'center');
      g.restore(); });
    if (t > 3 && t < 6.2) { rr(g, 560, 70, 210, 50, 10); g.fillStyle = 'rgba(242,140,40,.12)'; g.fill(); g.strokeStyle = C.orange; g.stroke();
      txt(g, L('Scenario: +6 pts occupancy', 'Escenario: +6 pts ocupación'), 574, 92, 12, C.text, 700); txt(g, L('recalculating live…', 'recalculando en vivo…'), 574, 110, 11, C.amber, 500, MONO); }
    fadeLoop(g, t);
  }

  // 7 ── Financial modelling: spreadsheet computing + sensitivity heatmap
  function model(g, t) {
    chrome(g, L('DCF_Valuation_v7.xlsx', 'DCF_Valoracion_v7.xlsx'), L('MODEL CHECKS ✓', 'CONTROLES ✓'));
    g.fillStyle = '#0C1627'; g.fillRect(0, 41, LW, 26); txt(g, 'fx  =NPV(WACC, FCF[1:5]) + TV / (1+WACC)^5', 16, 59, 12, C.text2, 500, MONO);
    const yrs = ['2026', '2027', '2028', '2029', '2030'], rows = [L('Revenue', 'Ingresos'), 'EBITDA', L('Capex', 'Capex'), L('Δ Working cap.', 'Δ Circulante'), 'FCF'];
    const vals = [[24.1, 27.3, 30.2, 33.0, 35.4], [4.3, 5.2, 6.0, 6.8, 7.4], [-1.2, -1.4, -1.5, -1.6, -1.6], [-.4, -.5, -.4, -.4, -.3], [2.1, 2.7, 3.3, 3.9, 4.4]];
    for (let c = 0; c <= 5; c++) g.fillStyle = C.line, g.fillRect(150 + c * 74, 80, 1, 200);
    yrs.forEach((y, i) => txt(g, y, 187 + i * 74, 98, 12, C.muted, 600, MONO, 'center'));
    rows.forEach((r, j) => {
      const y = 132 + j * 34; g.fillStyle = C.line; g.fillRect(16, y + 10, 520, 1);
      txt(g, r, 22, y, 13, j === 4 ? C.amber : C.text, j === 4 ? 700 : 500);
      vals[j].forEach((v, i) => { const settle = t > .6 + (j * 5 + i) * .05; const shown = settle ? v : (Math.random() * 40 - 10);
        txt(g, fmt(shown, 1), 214 + i * 74, y, 13, settle ? (v < 0 ? C.red : j === 4 ? C.amber : C.text) : C.muted, 600, MONO, 'right'); });
    });
    const ep = eb(prog(t, 2.2, 3)); g.save(); g.translate(660, 190); g.scale(ep, ep);
    rr(g, -110, -100, 220, 200, 14); g.fillStyle = '#16263F'; g.fill(); g.strokeStyle = C.orange; g.lineWidth = 2; g.stroke();
    txt(g, 'ENTERPRISE VALUE', 0, -64, 11, C.amber, 600, MONO, 'center');
    txt(g, fmt(42.3 * clamp(ep), 1) + 'M€', 0, -22, 34, C.text, 800, DISP, 'center');
    [['WACC', '9.5%'], ['g', '2.0%'], ['EV/EBITDA', '9.8x']].forEach(([k, v], i) => { txt(g, k, -86, 18 + i * 24, 12, C.muted, 500, MONO); txt(g, v, 86, 18 + i * 24, 12, C.text, 700, MONO, 'right'); });
    g.restore();
    txt(g, L('Sensitivity · EV (M€) — WACC × g', 'Sensibilidad · EV (M€) — WACC × g'), 22, 330, 12, C.text2, 600);
    const w = [8.5, 9, 9.5, 10, 10.5], gg = [1.5, 2, 2.5];
    gg.forEach((gv, r) => w.forEach((wv, c) => {
      const p = prog(t, 3.2 + (r * 5 + c) * .06, 3.6 + (r * 5 + c) * .06); if (p <= 0) return;
      const ev = 42.3 + (9.5 - wv) * 6.2 + (gv - 2) * 5.1, hue = clamp((ev - 30) / 25);
      g.globalAlpha = p; rr(g, 100 + c * 132, 346 + r * 42, 126, 36, 6);
      g.fillStyle = `rgba(${Math.round(255 - hue * 200)},${Math.round(107 + hue * 80)},${Math.round(91 + hue * 90)},.28)`; g.fill();
      if (r === 1 && c === 2) { g.strokeStyle = C.orange; g.lineWidth = 2; g.stroke(); }
      txt(g, fmt(ev, 1), 163 + c * 132, 369 + r * 42, 13, C.text, 700, MONO, 'center'); g.globalAlpha = 1; }));
    gg.forEach((v, r) => txt(g, 'g ' + fmt(v, 1) + '%', 90, 369 + r * 42, 11, C.muted, 500, MONO, 'right'));
    w.forEach((v, c) => txt(g, fmt(v, 1) + '%', 163 + c * 132, 486, 11, C.muted, 500, MONO, 'center'));
    fadeLoop(g, t);
  }

  // 8 ── Bookkeeping: invoices flow in, AI codes them, bank match ticks
  function books(g, t) {
    chrome(g, L('Accounts payable inbox — AI coding', 'Bandeja de proveedores — codificación IA'), L('AUTO-MATCH', 'CUADRE AUTO'));
    const inv = [[L('Iberdrola — Energy', 'Iberdrola — Energía'), '4.218,40', '628 Supplies', '628 Suministros'], [L('Amazon Business', 'Amazon Business'), '312,99', '602 Purchases', '602 Compras'],
      [L('Google Workspace', 'Google Workspace'), '86,40', '629 Software', '629 Software'], [L('Laundry Services SL', 'Lavandería SL'), '1.940,00', '623 Services', '623 Servicios'],
      [L('Booking.com — Commission', 'Booking.com — Comisión'), '6.702,15', '623 Commissions', '623 Comisiones'], [L('Makro — F&B', 'Makro — A&B'), '2.110,72', '600 F&B stock', '600 Existencias A&B']];
    card(g, 20, 56, 760, 424);
    const cols = [L('Supplier', 'Proveedor'), L('Amount €', 'Importe €'), L('AI account', 'Cuenta IA'), L('Bank', 'Banco')];
    [40, 330, 470, 690].forEach((x, i) => txt(g, cols[i].toUpperCase(), x, 86, 11, C.muted, 500, MONO));
    let done = 0;
    inv.forEach(([s, a, en, es], i) => {
      const y = 128 + i * 56, p = eo(prog(t, .2 + i * .35, .8 + i * .35)); if (p <= 0) return;
      g.globalAlpha = p; g.save(); g.translate((1 - p) * -60, 0);
      g.fillStyle = C.line; g.fillRect(36, y + 18, 728, 1);
      rr(g, 40, y - 16, 26, 30, 4); g.fillStyle = 'rgba(255,255,255,.08)'; g.fill(); txt(g, 'PDF', 53, y + 3, 8, C.muted, 600, MONO, 'center');
      txt(g, s, 78, y + 4, 13.5, C.text, 600);
      txt(g, a, 330, y + 4, 13, C.text, 600, MONO);
      const cp = prog(t, .8 + i * .35, 1.3 + i * .35);
      if (cp > 0) { const lab = L(en, es); g.font = `600 11.5px ${MONO}`; const w = g.measureText(lab).width + 20;
        rr(g, 470, y - 12, w * cp, 24, 12); g.fillStyle = 'rgba(242,140,40,.16)'; g.fill();
        if (cp >= 1) txt(g, lab, 480, y + 4, 11.5, C.amber, 600, MONO); }
      const bp = prog(t, 1.4 + i * .35, 1.7 + i * .35);
      if (bp > 0) { g.fillStyle = C.teal; g.globalAlpha = p * bp; g.beginPath(); g.arc(704, y, 11, 0, 6.3); g.fill(); txt(g, '✓', 704, y + 5, 13, '#05080F', 800, UI, 'center'); done++; }
      g.restore(); g.globalAlpha = 1;
    });
    rr(g, 560, 440, 204, 28, 14); g.fillStyle = 'rgba(54,194,180,.14)'; g.fill();
    txt(g, `${done}/6 ` + L('matched · 0 manual', 'cuadradas · 0 manual'), 662, 459, 11.5, C.teal, 600, MONO, 'center');
    fadeLoop(g, t);
  }

  const R = { management, board, consolidated, budget, cash, fpa, model, books };

  // ---------- mounting ----------
  const live = new Set();
  function mount(canvas, kind, opts = {}) {
    const g = canvas.getContext('2d'), fn = R[kind]; if (!fn) return () => {};
    const st = { canvas, g, fn, t0: performance.now() - (opts.offset || 0) * 1000, on: !opts.lazy, dead: false };
    function size() { const d = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth || 400;
      canvas.width = Math.round(w * d); canvas.height = Math.round(w * d * LH / LW); }
    st.ro = new ResizeObserver(size); st.ro.observe(canvas); size();
    if (opts.lazy && 'IntersectionObserver' in window) {
      st.io = new IntersectionObserver(es => { st.on = es[0].isIntersecting; }); st.io.observe(canvas);
    }
    live.add(st);
    return () => { st.dead = true; st.ro.disconnect(); st.io && st.io.disconnect(); live.delete(st); };
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(now) {
    live.forEach(st => {
      if (!st.on || st.dead) return;
      const t = reduce ? 3.9 : ((now - st.t0) / 1000) % LOOP;
      const s = st.canvas.width / LW; st.g.setTransform(s, 0, 0, s, 0, 0);
      try { st.fn(st.g, t); } catch (e) { /* keep other previews alive */ }
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.PrizmaPreview = { mount, kinds: Object.keys(R) };
})();
