// PRIZMA BI — interactive pieces: deal simulator, sample vs full-ledger coverage,
// and the sample due-diligence report viewer. All figures are illustrative.
(() => {
  const es = () => document.documentElement.lang === 'es';
  const L = (en, sp) => (es() ? sp : en);
  const m = (v, d = 1) => (v < 0 ? '−' : '') + 'US$' + Math.abs(v).toLocaleString(es() ? 'es-ES' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }) + 'M';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------------- 1. Deal simulator ----------------
  const sim = document.getElementById('sim');
  if (sim) {
    // adjustments as a share of reported EBITDA (EBITDA items) or of EV (price items)
    const FIND = [
      { id: 'oneoff', type: 'ebitda', pct: -.089, en: 'One-off revenue booked as recurring', es: 'Ingreso puntual tratado como recurrente', on: true },
      { id: 'capex', type: 'ebitda', pct: -.048, en: 'Operating costs capitalised as assets', es: 'Gastos operativos activados', on: true },
      { id: 'owner', type: 'ebitda', pct: .024, en: 'Owner costs that stop after the deal', es: 'Gastos del dueño que desaparecen tras la compra', on: true },
      { id: 'baddebt', type: 'ebitda', pct: -.040, en: 'Under-provisioned bad debts', es: 'Insolvencias infraprovisionadas', on: true },
      { id: 'nwc', type: 'price', pct: -.017, en: 'Payables stretched before closing', es: 'Pagos a proveedores retrasados antes del cierre', on: true },
      { id: 'debt', type: 'price', pct: -.045, en: 'Debt-like items left out of net debt', es: 'Partidas asimilables a deuda fuera de la deuda neta', on: false }
    ];
    const $ = s => sim.querySelector(s);
    const eb = $('#sim-ebitda'), mu = $('#sim-mult');
    function render() {
      const E = +eb.value, M = +mu.value, EV = E * M;
      $('#sim-ebitda-v').textContent = m(E); $('#sim-mult-v').textContent = M.toFixed(1) + 'x';
      let adjE = E, price = 0; const steps = [];
      FIND.forEach(f => { if (!f.on) return; if (f.type === 'ebitda') { const v = E * f.pct; adjE += v; steps.push([f, v * M]); } else { const v = EV * f.pct; price += v; steps.push([f, v]); } });
      const adjEV = adjE * M + price, gap = EV - adjEV;
      $('#sim-list').innerHTML = FIND.map(f => {
        const v = f.type === 'ebitda' ? E * f.pct * M : EV * f.pct;
        return `<label class="find ${f.on ? 'on' : ''}"><input type="checkbox" data-id="${f.id}" ${f.on ? 'checked' : ''}>
          <span class="find-t">${esc(es() ? f.es : f.en)}<small>${f.type === 'ebitda' ? L('EBITDA adjustment × multiple', 'Ajuste de EBITDA × múltiplo') : L('Price adjustment', 'Ajuste de precio')}</small></span>
          <b class="${v < 0 ? 'neg' : 'pos'}">${m(v)}</b></label>`; }).join('');
      $('#sim-list').querySelectorAll('input').forEach(i => i.onchange = () => { FIND.find(f => f.id === i.dataset.id).on = i.checked; render(); });
      $('#sim-ev').textContent = m(EV); $('#sim-adj').textContent = m(adjEV); $('#sim-gap').textContent = m(gap);
      $('#sim-ebitda-adj').textContent = m(adjE) + ' ' + L('adjusted EBITDA', 'EBITDA ajustado');
      $('#sim-verdict').textContent = gap > 0.05 ? L(`Paying the asking price would overpay by ${m(gap)} (${(gap / EV * 100).toFixed(0)}%).`, `Pagar el precio pedido supondría pagar ${m(gap)} de más (${(gap / EV * 100).toFixed(0)}%).`) : L('No material gap with the findings selected.', 'Sin diferencia relevante con los hallazgos seleccionados.');
      // waterfall
      const svg = $('#sim-chart'), Wd = 640, Hd = 260, pad = 28, all = [['EV', EV, 'base'], ...steps.map(([f, v]) => [f, v]), [L('Fair value', 'Valor justo'), adjEV, 'base']];
      const max = Math.max(EV, adjEV) * 1.08, bw = (Wd - pad * 2) / all.length * .62, step = (Wd - pad * 2) / all.length, y = v => Hd - 30 - v / max * (Hd - 60);
      let run = 0, out = `<line x1="${pad}" x2="${Wd - pad}" y1="${Hd - 30}" y2="${Hd - 30}" class="ax"/>`;
      all.forEach(([f, v, kind], i) => {
        const x = pad + i * step + (step - bw) / 2; let y1, y2, cls;
        if (kind) { y1 = y(v); y2 = y(0); cls = i ? 'b-adj' : 'b-base'; run = v; } else { y1 = y(Math.max(run, run + v)); y2 = y(Math.min(run, run + v)); cls = v < 0 ? 'b-neg' : 'b-pos'; run += v; }
        out += `<rect x="${x.toFixed(1)}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1.5, y2 - y1).toFixed(1)}" rx="3" class="${cls}"/>`;
        out += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y1 - 7).toFixed(1)}" text-anchor="middle" class="lab">${kind ? m(v, 0) : m(v)}</text>`;
        out += `<text x="${(x + bw / 2).toFixed(1)}" y="${Hd - 12}" text-anchor="middle" class="tick">${kind ? (i ? L('Fair', 'Justo') : L('Asking', 'Pedido')) : '#' + i}</text>`;
      });
      svg.innerHTML = out;
    }
    eb.oninput = mu.oninput = render;
    document.addEventListener('langchange', render);
    render();
  }

  // ---------------- 2. Coverage: sample vs full population ----------------
  const cov = document.getElementById('coverage');
  if (cov) {
    const grid = cov.querySelector('.dots'), N = 1200, FLAGS = [77, 318, 655, 902, 1111];
    let sampled = new Set(); let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    while (sampled.size < 60) sampled.add(Math.floor(rnd() * N));
    grid.innerHTML = Array.from({ length: N }, (_, i) => `<i data-i="${i}"></i>`).join('');
    const dots = grid.children;
    function mode(full) {
      cov.querySelectorAll('.cov-tabs button').forEach(b => b.classList.toggle('on', (b.dataset.m === 'full') === full));
      for (let i = 0; i < N; i++) { const d = dots[i], f = FLAGS.includes(i), smp = sampled.has(i);
        d.className = full ? (f ? 'flag' : 'seen') : (smp ? (f ? 'flag' : 'seen') : (f ? 'miss' : ''));
        d.style.transitionDelay = full ? (i % 40) * 8 + 'ms' : '0ms'; }
      const found = full ? FLAGS.length : FLAGS.filter(f => sampled.has(f)).length;
      cov.querySelector('.cov-n').textContent = full ? '100%' : '5%';
      cov.querySelector('.cov-f').textContent = `${found} / ${FLAGS.length}`;
      cov.querySelector('.cov-note').textContent = full ? L('Every entry tested. Every anomaly surfaced for a senior to judge.', 'Cada asiento analizado. Cada anomalía llega a un senior para que la valore.')
        : L('A traditional sample of 60 entries. The anomalies outside it are never seen.', 'Una muestra tradicional de 60 asientos. Las anomalías fuera de ella nunca se ven.');
    }
    cov.querySelectorAll('.cov-tabs button').forEach(b => b.onclick = () => mode(b.dataset.m === 'full'));
    document.addEventListener('langchange', () => mode(cov.querySelector('.cov-tabs .on')?.dataset.m === 'full'));
    mode(false);
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(e => { if (e[0].isIntersecting) { setTimeout(() => mode(true), 1400); io.disconnect(); } }, { threshold: .4 }); io.observe(cov); }
  }

  // ---------------- 3. Sample report viewer ----------------
  const rep = document.getElementById('report');
  if (rep) {
    const sev = (k) => `<span class="sev ${k}">${{ high: L('High', 'Alta'), med: L('Medium', 'Media'), low: L('Low', 'Baja') }[k]}</span>`;
    const PAGES = () => [
      { id: 'sum', t: L('Executive summary', 'Resumen ejecutivo'), html: `
        <p class="r-kicker">${L('Project Atlas · Financial & forensic due diligence · Draft for IC', 'Proyecto Atlas · Due diligence financiera y forense · Borrador para comité')}</p>
        <h3>${L('Target Co. is a sound business priced on overstated earnings.', 'Target Co. es un buen negocio con un precio basado en un resultado inflado.')}</h3>
        <div class="r-kpis"><div><b>US$12.4M</b><span>${L('Reported EBITDA', 'EBITDA reportado')}</span></div><div><b class="g">US$10.5M</b><span>${L('Adjusted EBITDA', 'EBITDA ajustado')}</span></div><div><b class="r">−US$21.4M</b><span>${L('Total value at risk', 'Valor total en riesgo')}</span></div><div><b>US$78M</b><span>${L('Recommended bid', 'Oferta recomendada')}</span></div></div>
        <table class="r-tab"><thead><tr><th>#</th><th>${L('Finding', 'Hallazgo')}</th><th>${L('Severity', 'Gravedad')}</th><th class="n">${L('Value impact', 'Impacto')}</th><th>${L('Recommendation', 'Recomendación')}</th></tr></thead><tbody>
          <tr><td>1</td><td>${L('EBITDA overstated by US$1.9M (four adjustments)', 'EBITDA inflado en 1,9 M US$ (cuatro ajustes)')}</td><td>${sev('high')}</td><td class="n">−US$15.2M</td><td>${L('Price on adjusted EBITDA', 'Precio sobre EBITDA ajustado')}</td></tr>
          <tr><td>2</td><td>${L('Payables stretched before closing', 'Pagos a proveedores retrasados antes del cierre')}</td><td>${sev('med')}</td><td class="n">−US$1.7M</td><td>${L('Set NWC peg on 24-month average', 'Peg de circulante con media de 24 meses')}</td></tr>
          <tr><td>3</td><td>${L('Supplier owned by a director', 'Proveedor propiedad de un consejero')}</td><td>${sev('high')}</td><td class="n">${L('n/q', 'n/c')}</td><td>${L('Specific indemnity in SPA', 'Garantía específica en el contrato')}</td></tr>
          <tr><td>4</td><td>${L('Leases and deferred revenue outside net debt', 'Arrendamientos e ingresos diferidos fuera de la deuda neta')}</td><td>${sev('med')}</td><td class="n">−US$4.5M</td><td>${L('Treat as debt-like', 'Tratar como deuda')}</td></tr>
          <tr><td>5</td><td>${L('Top-2 customers are 55% of revenue', 'Los 2 mayores clientes son el 55% de ingresos')}</td><td>${sev('low')}</td><td class="n">—</td><td>${L('Earn-out tied to renewal', 'Earn-out ligado a la renovación')}</td></tr>
        </tbody></table>` },
      { id: 'qoe', t: L('Quality of earnings', 'Calidad del resultado'), html: `
        <p class="r-kicker">${L('Section 2 · EBITDA bridge, FY25 (US$M)', 'Sección 2 · Puente de EBITDA, FY25 (M US$)')}</p>
        <h3>${L('Four adjustments take EBITDA down 15%.', 'Cuatro ajustes reducen el EBITDA un 15%.')}</h3>
        <table class="r-tab"><thead><tr><th>${L('Line', 'Línea')}</th><th>${L('Basis', 'Fundamento')}</th><th class="n">US$M</th></tr></thead><tbody>
          <tr class="tot"><td>${L('Reported EBITDA', 'EBITDA reportado')}</td><td>${L('Audited accounts', 'Cuentas auditadas')}</td><td class="n">12.4</td></tr>
          <tr><td>${L('One-off licence revenue', 'Ingreso puntual de licencias')}</td><td>${L('Single contract, no renewal clause (DR 4.3.12)', 'Contrato único, sin renovación (DR 4.3.12)')}</td><td class="n r">(1.1)</td></tr>
          <tr><td>${L('Capitalised development costs', 'Costes de desarrollo activados')}</td><td>${L('Maintenance work, not new assets (ledger 1620)', 'Mantenimiento, no activos nuevos (cuenta 1620)')}</td><td class="n r">(0.6)</td></tr>
          <tr><td>${L('Owner costs', 'Gastos del dueño')}</td><td>${L('Family salaries and car leases ending at close', 'Sueldos familiares y coches que terminan al cierre')}</td><td class="n g">0.3</td></tr>
          <tr><td>${L('Bad-debt provision', 'Provisión de insolvencias')}</td><td>${L('Receivables > 180 days at 100%', 'Cuentas a cobrar > 180 días al 100%')}</td><td class="n r">(0.5)</td></tr>
          <tr class="tot"><td>${L('Adjusted EBITDA', 'EBITDA ajustado')}</td><td>${L('Prizma view', 'Visión Prizma')}</td><td class="n">10.5</td></tr>
        </tbody></table>
        <p class="r-note">${L('Every adjustment links to source entries in the appendix. AI-prepared, partner-reviewed.', 'Cada ajuste enlaza con los asientos de origen en el anexo. Preparado por IA, revisado por un socio.')}</p>` },
      { id: 'nwc', t: L('Net debt & working capital', 'Deuda neta y circulante'), html: `
        <p class="r-kicker">${L('Section 3 · Normalised NWC and debt-like items', 'Sección 3 · Circulante normalizado y partidas asimilables a deuda')}</p>
        <h3>${L('Adjusted net debt is US$12.7M, not US$8.2M.', 'La deuda neta ajustada es 12,7 M US$, no 8,2 M US$.')}</h3>
        <div class="r-spark">${(() => { const v = [4.1, 4.4, 4.0, 4.6, 4.9, 4.5, 4.2, 4.7, 5.0, 4.8, 4.4, 4.6, 4.3, 4.8, 5.1, 4.7, 4.5, 4.9, 5.2, 4.8, 4.6, 4.4, 3.6, 2.9];
          const pts = v.map((y, i) => `${(i * 26 + 10).toFixed(0)},${(110 - y * 18).toFixed(1)}`).join(' ');
          return `<svg viewBox="0 0 620 130" role="img" aria-label="NWC"><line x1="0" x2="620" y1="${110 - 4.6 * 18}" y2="${110 - 4.6 * 18}" class="peg"/><polyline points="${pts}" class="ln"/><circle cx="${23 * 26 + 10}" cy="${110 - 2.9 * 18}" r="6" class="dot"/><text x="6" y="${110 - 4.6 * 18 - 6}" class="pl">${L('Peg 4.6 (24-month average)', 'Peg 4,6 (media 24 meses)')}</text></svg>`; })()}</div>
        <table class="r-tab"><tbody>
          <tr><td>${L('Bank debt', 'Deuda bancaria')}</td><td class="n">8.2</td></tr><tr><td>${L('Lease liabilities', 'Arrendamientos')}</td><td class="n r">2.4</td></tr>
          <tr><td>${L('Deferred revenue', 'Ingresos diferidos')}</td><td class="n r">1.1</td></tr><tr><td>${L('Unpaid bonuses', 'Bonus pendientes')}</td><td class="n r">0.6</td></tr>
          <tr><td>${L('Tax exposure', 'Contingencia fiscal')}</td><td class="n r">0.4</td></tr><tr class="tot"><td>${L('Adjusted net debt', 'Deuda neta ajustada')}</td><td class="n">12.7</td></tr>
        </tbody></table>` },
      { id: 'for', t: L('Forensic flags', 'Alertas forenses'), html: `
        <p class="r-kicker">${L('Section 5 · Journal-entry testing, 100% of 1,284,302 entries', 'Sección 5 · Test de asientos, 100% de 1.284.302 asientos')}</p>
        <h3>${L('Three entries needed a person. One changes the SPA.', 'Tres asientos necesitaron a una persona. Uno cambia el contrato.')}</h3>
        <div class="r-flags">
          <div><span class="sev low">${L('Cleared', 'Aclarado')}</span><b>${L('Manual entry, Sunday 23:40', 'Asiento manual, domingo 23:40')}</b><p>${L('Year-end accrual by the finance manager, supported by an approved schedule.', 'Periodificación de cierre del responsable financiero, con soporte aprobado.')}</p></div>
          <div><span class="sev low">${L('Cleared', 'Aclarado')}</span><b>${L('US$250,000 round transfer', 'Transferencia redonda de 250.000 US$')}</b><p>${L('Deposit under a signed office lease; agreed to contract.', 'Fianza de un arrendamiento firmado; cuadra con el contrato.')}</p></div>
          <div><span class="sev high">${L('Escalated', 'Escalado')}</span><b>${L('Director-owned supplier', 'Proveedor de un consejero')}</b><p>${L('US$1.9M over three years at 18–25% above market rates. Not disclosed as related party.', '1,9 M US$ en tres años, un 18–25% por encima de mercado. No declarado como parte vinculada.')}</p></div>
        </div>
        <p class="r-note">${L('Tests run: timing, users, round amounts, duplicates, related parties, cut-off, Benford. Reviewed by a Certified Fraud Examiner.', 'Pruebas: horario, usuarios, importes redondos, duplicados, partes vinculadas, corte, Benford. Revisado por un Certified Fraud Examiner.')}</p>` },
      { id: 'rev', t: L('Revenue quality', 'Calidad de ingresos'), html: `
        <p class="r-kicker">${L('Section 4 · Customer cube built from 38,410 invoices', 'Sección 4 · Cubo de clientes con 38.410 facturas')}</p>
        <h3>${L('Durable revenue, concentrated in two customers.', 'Ingresos sólidos, concentrados en dos clientes.')}</h3>
        <div class="r-bars">${[['A', 34], ['B', 21], ['C', 8], ['D', 6], ['E', 4], [L('Other 212', 'Otros 212'), 27]].map(([n, v], i) => `<div><span>${i < 5 ? L('Customer ', 'Cliente ') + n : n}</span><i style="--w:${v * 2.6}%" class="${i < 2 ? 'hot' : ''}"></i><b>${v}%</b></div>`).join('')}</div>
        <div class="r-kpis"><div><b>82%</b><span>${L('Recurring revenue', 'Ingresos recurrentes')}</span></div><div><b>104%</b><span>${L('Net revenue retention', 'Retención neta')}</span></div><div><b class="r">7 ${L('mo.', 'meses')}</b><span>${L('Until contract A renews', 'Hasta renovar el contrato A')}</span></div></div>` }
    ];
    const tabs = rep.querySelector('.r-tabs'), page = rep.querySelector('.r-page');
    let cur = 'sum';
    function render() {
      const P = PAGES();
      tabs.innerHTML = P.map(p => `<button type="button" role="tab" aria-selected="${p.id === cur}" data-id="${p.id}">${esc(p.t)}</button>`).join('');
      tabs.querySelectorAll('button').forEach(b => b.onclick = () => { cur = b.dataset.id; render(); });
      const p = P.find(x => x.id === cur); page.innerHTML = p.html + `<div class="r-foot"><span>PRIZMA BI · ${L('Illustrative sample, fictional company', 'Ejemplo ilustrativo, empresa ficticia')}</span><span>${P.indexOf(p) + 1} / ${P.length}</span></div>`;
      page.classList.remove('flip'); void page.offsetWidth; page.classList.add('flip');
    }
    document.addEventListener('langchange', render);
    render();
  }
})();
