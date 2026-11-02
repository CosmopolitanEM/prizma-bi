// PRIZMA BI — "The AI layer at work": a 30-second scripted film drawn on canvas,
// with play/pause, a seekable timeline and five clickable chapters.
// Everything shown is illustrative (fictional target, sample figures).
(() => {
  const W = 1280, H = 720, DUR = 30;
  const K = { bg: '#FFFFFF', panel: '#F4F5F6', panel2: '#ECEEF0', line: 'rgba(20,20,20,.1)', text: '#1F1F1F', text2: '#4A4A4A', muted: '#8A8A8A',
    gold: '#F0571A', goldL: '#C2410C', cyan: '#2D2D2D', red: '#D4351C', green: '#2E7D5B' };
  const SERIF = '"Source Serif 4", Georgia, serif', SANS = 'Geist, "Helvetica Neue", Arial, sans-serif', MONO = '"Geist Mono", ui-monospace, Consolas, monospace';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eo = p => 1 - Math.pow(1 - clamp(p), 3);
  const es = () => document.documentElement.lang === 'es';
  const L = (en, sp) => (es() ? sp : en);
  const nf = n => n.toLocaleString(es() ? 'es-ES' : 'en-GB');

  const CH = [
    { t0: 0, en: 'Ingest', es: 'Carga', capEn: 'The full data room goes in: ledgers, bank statements, contracts, payroll and board minutes.', capEs: 'Entra el data room completo: mayores, extractos bancarios, contratos, nóminas y actas.' },
    { t0: 6, en: 'Map', es: 'Mapeo', capEn: 'Every account is mapped to a standard chart. The AI handles 97%; a person reviews the rest.', capEs: 'Cada cuenta se mapea a un plan estándar. La IA hace el 97%; una persona revisa el resto.' },
    { t0: 12, en: 'Test', es: 'Análisis', capEn: 'All 1.28 million journal entries are tested, not a sample of sixty.', capEs: 'Se analizan los 1,28 millones de asientos, no una muestra de sesenta.' },
    { t0: 18, en: 'Review', es: 'Revisión', capEn: 'Only the outliers reach a senior. A Certified Fraud Examiner clears or escalates each one.', capEs: 'Solo los atípicos llegan a un senior. Un Certified Fraud Examiner aclara o escala cada uno.' },
    { t0: 24, en: 'Report', es: 'Informe', capEn: 'Findings become numbers the investment committee can act on: price, structure, protections.', capEs: 'Los hallazgos se convierten en cifras para el comité: precio, estructura y garantías.' }
  ];

  function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  function tx(g, s, x, y, size, col, w = 500, fam = SANS, al = 'left') { g.font = `${w} ${size}px ${fam}`; g.fillStyle = col; g.textAlign = al; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); }
  function panel(g, x, y, w, h, a = 1) { g.globalAlpha = a; rr(g, x, y, w, h, 14); g.fillStyle = K.panel; g.fill(); g.strokeStyle = K.line; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1; }
  function chip(g, s, x, y, col, bg) { g.font = `600 13px ${MONO}`; const w = g.measureText(s).width + 20; rr(g, x, y, w, 26, 13); g.fillStyle = bg; g.fill(); tx(g, s, x + 10, y + 18, 13, col, 600, MONO); return w; }
  let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- scenes ----------
  function ingest(g, t) {
    tx(g, L('Data room · Target Co. (illustrative)', 'Data room · Target Co. (ilustrativo)'), 80, 120, 22, K.text2, 500);
    const files = [['Ledger_FY23–FY25.xlsx', '1.28M rows'], ['Bank statements / 6 accounts', '36 months'], ['Customer contracts /', '214 files'], ['Payroll exports', '24 months'],
      ['Board minutes /', '31 files'], ['Fixed-asset register.xlsx', '4,812 rows'], ['Leases /', '9 files'], ['Tax returns /', '3 years']];
    files.forEach(([n, m], i) => {
      const p = eo(prog(t, .3 + i * .35, 1.1 + i * .35)); if (p <= 0) return;
      const col = i % 4, row = Math.floor(i / 4), x = 80 + col * 285, y = 160 + row * 150 + (1 - p) * -60;
      g.globalAlpha = p; panel(g, x, y, 265, 120);
      rr(g, x + 20, y + 22, 34, 42, 4); g.fillStyle = i ? 'rgba(45,45,45,.15)' : 'rgba(240,87,26,.2)'; g.fill();
      tx(g, n, x + 68, y + 42, 15, K.text, 600); tx(g, m, x + 68, y + 64, 13, K.muted, 500, MONO);
      const sc = clamp((t - 1.5 - i * .35) / 1.2); rr(g, x + 20, y + 88, 225, 6, 3); g.fillStyle = K.line; g.fill();
      rr(g, x + 20, y + 88, 225 * sc, 6, 3); g.fillStyle = K.cyan; g.fill();
      g.globalAlpha = 1;
    });
    const n = Math.floor(2418 * eo(prog(t, .5, 5)));
    tx(g, nf(n), 80, 520, 64, K.text, 400, SERIF); tx(g, L('files indexed', 'archivos indexados'), 80, 552, 16, K.muted, 500);
    tx(g, nf(Math.floor(1284302 * eo(prog(t, 1, 5.5)))), 520, 520, 64, K.cyan, 400, SERIF); tx(g, L('journal entries loaded', 'asientos cargados'), 520, 552, 16, K.muted, 500);
  }
  function map(g, t) {
    const lt = t - 6;
    tx(g, L('Chart-of-accounts mapping', 'Mapeo del plan de cuentas'), 80, 120, 22, K.text2, 500);
    const raw = ['4000 Sales – services', '4010 Sales – licence', '4900 Other income', '6100 Wages & salaries', '6420 Consulting fees', '6810 Rent – HQ', '1620 Software (capitalised)', '7990 Misc. adjustments'];
    const std = [L('Revenue', 'Ingresos'), L('Other income', 'Otros ingresos'), L('Staff costs', 'Personal'), L('External services', 'Servicios externos'), L('Occupancy', 'Inmuebles'), L('Intangible assets', 'Intangibles'), L('Needs review', 'Para revisar')];
    const to = [0, 0, 1, 2, 3, 4, 5, 6];
    raw.forEach((r, i) => { const p = eo(prog(lt, i * .25, .6 + i * .25)); g.globalAlpha = p; panel(g, 80, 150 + i * 58, 330, 46); tx(g, r, 100, 179 + i * 58, 15, K.text, 500, MONO); g.globalAlpha = 1; });
    std.forEach((s, j) => { const p = eo(prog(lt, .4 + j * .2, 1 + j * .2)); g.globalAlpha = p; const rev = j === 6;
      rr(g, 860, 158 + j * 66, 340, 50, 12); g.fillStyle = rev ? 'rgba(240,87,26,.14)' : 'rgba(45,45,45,.1)'; g.fill();
      g.strokeStyle = rev ? K.gold : 'rgba(45,45,45,.4)'; g.stroke(); tx(g, s, 880, 189 + j * 66, 16, rev ? K.goldL : K.text, 600); g.globalAlpha = 1; });
    raw.forEach((r, i) => { const p = prog(lt, 1.6 + i * .3, 2.4 + i * .3); if (p <= 0) return; const j = to[i];
      const x1 = 410, y1 = 173 + i * 58, x2 = 860, y2 = 183 + j * 66; g.strokeStyle = j === 6 ? K.gold : K.cyan; g.globalAlpha = .75; g.lineWidth = 1.6;
      g.setLineDash([620 * eo(p), 2000]); g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo(x1 + 180, y1, x2 - 180, y2, x2, y2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; });
    if (lt > 4) { const p = eo(prog(lt, 4, 4.8)); g.globalAlpha = p; tx(g, '97%', 520, 688, 56, K.cyan, 400, SERIF); tx(g, L('auto-mapped', 'mapeado automático'), 610, 680, 16, K.muted, 500);
      tx(g, '41', 820, 688, 56, K.gold, 400, SERIF); tx(g, L('accounts to a person', 'cuentas a una persona'), 880, 680, 16, K.muted, 500); g.globalAlpha = 1; }
  }
  function test(g, t) {
    const lt = t - 12;
    tx(g, L('Full-population tests', 'Pruebas sobre la población completa'), 80, 120, 22, K.text2, 500);
    const tests = [[L('Weekend & night postings', 'Asientos en fin de semana o de noche'), 2104], [L('Round amounts ≥ US$10k', 'Importes redondos ≥ 10k US$'), 388], [L('Duplicate payments', 'Pagos duplicados'), 17],
      [L('Related-party matches', 'Coincidencias con partes vinculadas'), 6], [L('Revenue cut-off', 'Corte de ingresos'), 23], [L("Benford's law deviation", 'Desviación de la ley de Benford'), 1]];
    tests.forEach(([n, c], i) => { const p = prog(lt, .3 + i * .7, 1.1 + i * .7); g.globalAlpha = clamp(p * 3); const y = 160 + i * 66;
      panel(g, 80, y, 470, 52); tx(g, n, 100, y + 32, 15, K.text, 500);
      if (p >= 1) { tx(g, nf(c), 520, y + 32, 15, c < 30 ? K.gold : K.text2, 700, MONO, 'right'); } else { tx(g, L('running…', 'analizando…'), 520, y + 32, 13, K.cyan, 500, MONO, 'right'); }
      g.globalAlpha = 1; });
    // scatter
    panel(g, 600, 150, 600, 400); seed = 3;
    const n = Math.floor(900 * eo(prog(lt, 0, 4)));
    for (let i = 0; i < n; i++) { const x = 630 + (.25 + rnd() * .5) * 540, y = 530 - Math.pow(rnd(), 2.6) * 220; g.fillStyle = 'rgba(45,45,45,.5)'; g.fillRect(x, y, 2.4, 2.4); }
    const out = [[.95, .82], [.08, .7], [.6, .93], [.88, .55], [.15, .48]];
    out.forEach(([fx, fy], i) => { if (lt < 3 + i * .4) return; const x = 630 + fx * 540, y = 530 - fy * 360, pu = 1 + .25 * Math.sin(t * 7 + i);
      g.beginPath(); g.arc(x, y, 7 * pu, 0, 6.3); g.fillStyle = K.red; g.fill(); });
    tx(g, L('amount', 'importe'), 620, 176, 12, K.muted, 500, MONO); tx(g, L('posting time →', 'hora de registro →'), 1180, 540, 12, K.muted, 500, MONO, 'right');
    tx(g, nf(Math.floor(1284302 * eo(prog(lt, 0, 5)))), 600, 620, 44, K.text, 400, SERIF); tx(g, L('entries scored · 100%', 'asientos puntuados · 100%'), 600, 648, 15, K.muted, 500);
  }
  function review(g, t) {
    const lt = t - 18;
    tx(g, L('Senior review of outliers', 'Revisión senior de los atípicos'), 80, 120, 22, K.text2, 500);
    const f = [[L('Manual entry, Sunday 23:40, finance user', 'Asiento manual, domingo 23:40, usuario de finanzas'), L('Explained: year-end accrual, documented', 'Explicado: periodificación de cierre, documentada'), 'ok'],
      [L('Round transfer of US$250,000 to a new supplier', 'Transferencia redonda de 250.000 US$ a un proveedor nuevo'), L('Explained: deposit under signed lease', 'Explicado: fianza de un arrendamiento firmado'), 'ok'],
      [L('Supplier owned by a director · US$1.9M over 3 years', 'Proveedor de un consejero · 1,9 M US$ en 3 años'), L('Escalated: above-market pricing, ask for SPA indemnity', 'Escalado: precios por encima de mercado, pedir garantía'), 'esc']];
    f.forEach(([a, b, st], i) => { const p = eo(prog(lt, .3 + i * 1.2, 1 + i * 1.2)); if (p <= 0) return; const y = 160 + i * 140, x = 80 + (1 - p) * 80;
      g.globalAlpha = p; panel(g, x, y, 760, 116); rr(g, x, y, 6, 116, 3); g.fillStyle = K.red; g.fill();
      tx(g, '#' + (i + 1), x + 26, y + 40, 15, K.red, 700, MONO); tx(g, a, x + 70, y + 40, 18, K.text, 600);
      const r = prog(lt, 1 + i * 1.2, 1.8 + i * 1.2);
      if (r > 0) { g.globalAlpha = p * r; tx(g, b, x + 70, y + 78, 16, st === 'ok' ? K.green : K.goldL, 500);
        chip(g, st === 'ok' ? L('CLEARED', 'ACLARADO') : L('ESCALATED', 'ESCALADO'), x + 600, y + 20, st === 'ok' ? K.green : '#FFFFFF', st === 'ok' ? 'rgba(46,125,91,.15)' : K.gold); }
      g.globalAlpha = 1; });
    const p = eo(prog(lt, .5, 1.5)); g.globalAlpha = p; panel(g, 880, 160, 320, 396);
    g.beginPath(); g.arc(1040, 250, 48, 0, 6.3); g.fillStyle = 'rgba(240,87,26,.18)'; g.fill(); g.strokeStyle = K.gold; g.lineWidth = 2; g.stroke();
    tx(g, 'CFE', 1040, 260, 26, K.goldL, 400, SERIF, 'center');
    tx(g, L('Senior reviewer', 'Revisor senior'), 1040, 330, 18, K.text, 600, SANS, 'center'); tx(g, L('Certified Fraud Examiner', 'Certified Fraud Examiner'), 1040, 354, 14, K.muted, 500, SANS, 'center');
    tx(g, '1.28M → 3', 1040, 440, 44, K.gold, 400, SERIF, 'center'); tx(g, L('entries that needed a person', 'asientos que necesitaron a una persona'), 1040, 470, 14, K.muted, 500, SANS, 'center');
    g.globalAlpha = 1;
  }
  function report(g, t) {
    const lt = t - 24;
    const p = eo(prog(lt, 0, 1)); g.globalAlpha = p;
    rr(g, 300, 90 + (1 - p) * 40, 680, 560, 6); g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = 'rgba(20,20,20,.18)'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#F0571A'; g.fillRect(300, 90 + (1 - p) * 40, 680, 4);
    const y0 = 90 + (1 - p) * 40, ink = '#0B1424';
    tx(g, L('Financial due diligence · executive summary', 'Due diligence financiera · resumen ejecutivo'), 340, y0 + 50, 14, '#8A8A8A', 600, MONO);
    tx(g, L('Target Co. — key findings', 'Target Co. — hallazgos clave'), 340, y0 + 100, 38, ink, 400, SERIF);
    const rows = [[L('Reported EBITDA FY25', 'EBITDA reportado FY25'), 'US$12.4M', ink], [L('Adjusted EBITDA', 'EBITDA ajustado'), 'US$10.5M', '#F0571A'], [L('EV impact at 8.0x', 'Impacto en valor a 8,0x'), '−US$15.2M', '#D4351C'],
      [L('Working-capital adjustment', 'Ajuste de circulante'), '−US$1.7M', '#D4351C'], [L('Debt-like items added', 'Partidas asimilables a deuda'), '−US$4.5M', '#D4351C'], [L('Red flags for SPA', 'Alertas para el contrato'), '1', '#D4351C']];
    rows.forEach(([a, b, c], i) => { const r = prog(lt, .8 + i * .45, 1.2 + i * .45); if (r <= 0) return; g.globalAlpha = p * r; const y = y0 + 160 + i * 56;
      g.fillStyle = 'rgba(11,20,36,.1)'; g.fillRect(340, y + 18, 600, 1); tx(g, a, 340, y, 18, ink, 500); tx(g, b, 940, y, 22, c, 400, SERIF, 'right'); });
    if (lt > 4) { const r = eo(prog(lt, 4, 4.6)); g.globalAlpha = r; rr(g, 340, y0 + 494, 600, 44, 2); g.fillStyle = '#F0571A'; g.fill();
      tx(g, L('Recommendation: bid US$78M, indemnity for finding #3', 'Recomendación: ofertar 78 M US$, garantía por el hallazgo #3'), 640, y0 + 522, 16, '#FFFFFF', 600, SANS, 'center'); }
    g.globalAlpha = 1;
  }
  const SCENES = [ingest, map, test, review, report];

  function draw(g, t) {
    g.fillStyle = K.bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(20,20,20,.035)'; g.lineWidth = 1;
    for (let x = 0; x < W; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y < H; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const ci = Math.min(4, Math.floor(t / 6)), lt = t - ci * 6;
    const fade = Math.min(prog(lt, 0, .35), 1 - prog(lt, 5.6, 6));
    g.globalAlpha = 1; tx(g, `0${ci + 1} · ${L(CH[ci].en, CH[ci].es).toUpperCase()}`, 80, 72, 14, K.gold, 600, MONO);
    tx(g, 'PRIZMA BI · AI LAYER', W - 80, 72, 14, K.muted, 600, MONO, 'right');
    g.save(); g.globalAlpha = fade; SCENES[ci](g, t); g.restore();
  }

  function init(root) {
    const cv = root.querySelector('canvas'), g = cv.getContext('2d');
    const btn = root.querySelector('.fp-play'), bar = root.querySelector('.fp-bar'), fill = root.querySelector('.fp-fill'), cap = root.querySelector('.fp-cap'), chips = root.querySelector('.fp-chips');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = reduce ? 26 : 0, playing = !reduce, last = performance.now(), visible = true;
    function size() { const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(cv.clientWidth * d); cv.height = Math.round(cv.clientWidth * d * H / W); }
    new ResizeObserver(size).observe(cv); size();
    function renderChips() { chips.innerHTML = CH.map((c, i) => `<button type="button" data-i="${i}"><span>0${i + 1}</span>${es() ? c.es : c.en}</button>`).join('');
      chips.querySelectorAll('button').forEach(b => b.onclick = () => { t = CH[+b.dataset.i].t0 + .01; playing = true; ui(); }); }
    function ui() { btn.setAttribute('aria-label', playing ? L('Pause', 'Pausa') : L('Play', 'Reproducir')); btn.textContent = playing ? '❚❚' : '▶';
      const ci = Math.min(4, Math.floor(t / 6)); cap.textContent = es() ? CH[ci].capEs : CH[ci].capEn;
      chips.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === ci)); fill.style.width = (t / DUR * 100) + '%'; }
    const paint = () => { const s = cv.width / W; g.setTransform(s, 0, 0, s, 0, 0); draw(g, t); };
    root.seek = s => { t = clamp(s, 0, DUR - .01); playing = false; ui(); paint(); };
    btn.onclick = () => { playing = !playing; ui(); };
    cv.onclick = () => { playing = !playing; ui(); };
    bar.onclick = e => { const r = bar.getBoundingClientRect(); t = clamp((e.clientX - r.left) / r.width) * DUR; ui(); paint(); };
    bar.onkeydown = e => { if (e.key === 'ArrowRight') t = Math.min(DUR - .01, t + 3); if (e.key === 'ArrowLeft') t = Math.max(0, t - 3); ui(); };
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
    document.addEventListener('langchange', () => { renderChips(); ui(); });
    renderChips(); ui();
    (function frame(now) { const dt = Math.max(0, Math.min(.5, (now - last) / 1000)); last = now;
      if (playing && visible) { t = (t + dt) % DUR; ui(); }
      const s = cv.width / W; g.setTransform(s, 0, 0, s, 0, 0); draw(g, t); requestAnimationFrame(frame); })(last);
  }
  document.querySelectorAll('.film').forEach(init);
})();
