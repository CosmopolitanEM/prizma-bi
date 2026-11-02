// PRIZMA BI — use cases: cards with live deliverable previews + a detail drawer
// (sub-services, automation layer, illustrative real-life example).
(() => {
  const CASES = [
    { id: 'qoe', kind: 'qoe',
      en: { t: 'Quality of earnings', d: 'What the business really earns, once one-offs and aggressive accounting are stripped out.',
        lead: 'The adjusted EBITDA your price should be built on, with every adjustment traced to the ledger.',
        subs: [['Adjusted EBITDA bridge', 'Reported to normalised EBITDA, adjustment by adjustment, with evidence for each.'],
               ['Non-recurring items', 'One-off revenue, disposals, grants and costs that will not repeat.'],
               ['Accounting policy review', 'Revenue recognition, capitalisation and provisions tested against the standard.'],
               ['Run-rate and pro forma', 'Full-year effect of recent pricing, hires, closures and acquisitions.'],
               ['Monthly trend analysis', 'Seasonality, cut-off and year-end effects visible month by month.']],
        auto: ['Trial balances and ledgers mapped automatically, any ERP', 'Every adjustment linked to the source entries', 'AI drafts the bridge; a senior signs it off'],
        ex: 'A fund is buying a services company on 8x EBITDA of US$12.4M. Our review finds US$1.1M of one-off revenue and US$0.6M of operating costs booked as assets. Adjusted EBITDA is US$10.5M: roughly US$15M less enterprise value at the same multiple.' },
      es: { t: 'Calidad del resultado (QoE)', d: 'Lo que el negocio gana de verdad, sin extraordinarios ni contabilidad agresiva.',
        lead: 'El EBITDA ajustado sobre el que debería construirse el precio, con cada ajuste trazado hasta el libro mayor.',
        subs: [['Puente de EBITDA ajustado', 'Del EBITDA reportado al normalizado, ajuste a ajuste y con evidencia de cada uno.'],
               ['Partidas no recurrentes', 'Ingresos puntuales, ventas de activos, subvenciones y costes que no se repetirán.'],
               ['Revisión de políticas contables', 'Reconocimiento de ingresos, capitalizaciones y provisiones contrastadas con la norma.'],
               ['Run-rate y pro forma', 'Efecto anual de cambios recientes de precios, contrataciones, cierres y compras.'],
               ['Tendencia mensual', 'Estacionalidad, cortes y efectos de cierre visibles mes a mes.']],
        auto: ['Balances de sumas y saldos y mayores mapeados automáticamente, con cualquier ERP', 'Cada ajuste enlazado a los asientos de origen', 'La IA prepara el puente; un senior lo firma'],
        ex: 'Un fondo va a comprar una empresa de servicios a 8x un EBITDA de 12,4 M US$. La revisión encuentra 1,1 M US$ de ingresos puntuales y 0,6 M US$ de gastos activados. El EBITDA ajustado es 10,5 M US$: unos 15 M US$ menos de valor al mismo múltiplo.' } },
    { id: 'nwc', kind: 'nwc',
      en: { t: 'Net debt & working capital', d: 'The balance-sheet items that move the price between signing and closing.',
        lead: 'A defensible working-capital peg and a complete list of debt-like items for the SPA.',
        subs: [['Normalised working capital', 'Monthly NWC over 24 months and a peg the seller cannot easily game.'],
               ['Debt and debt-like items', 'Leases, deferred revenue, unpaid bonuses, provisions and tax exposures.'],
               ['Cash and trapped cash', 'Free cash versus cash locked in subsidiaries, deposits or restricted accounts.'],
               ['Locked box or completion accounts', 'Leakage review and completion-mechanism support.'],
               ['SPA price mechanics', 'Inputs for the price-adjustment clauses, agreed with your lawyers.']],
        auto: ['Balance sheets rebuilt monthly from the ledger', 'Window-dressing detected: stretched payables, early collections', 'Every debt-like item cited to its document'],
        ex: 'Working capital dropped US$1.7M in the two months before closing because supplier payments were delayed. We set the peg on the 24-month average and the buyer recovers the difference through the price adjustment.' },
      es: { t: 'Deuda neta y circulante', d: 'Las partidas de balance que mueven el precio entre la firma y el cierre.',
        lead: 'Un peg de circulante defendible y la lista completa de partidas asimilables a deuda para el contrato.',
        subs: [['Circulante normalizado', 'El circulante mensual de 24 meses y un peg difícil de manipular por el vendedor.'],
               ['Deuda y partidas asimilables', 'Arrendamientos, ingresos diferidos, bonus pendientes, provisiones y contingencias fiscales.'],
               ['Caja y caja atrapada', 'Caja libre frente a caja retenida en filiales, depósitos o cuentas restringidas.'],
               ['Locked box o cuentas de cierre', 'Revisión de fugas de valor y apoyo en el mecanismo de cierre.'],
               ['Mecánica de precio del contrato', 'Datos para las cláusulas de ajuste de precio, acordados con tus abogados.']],
        auto: ['Balances reconstruidos mes a mes desde el libro mayor', 'Detección de maquillaje: pagos a proveedores retrasados, cobros adelantados', 'Cada partida asimilable a deuda citada con su documento'],
        ex: 'El circulante cae 1,7 M US$ en los dos meses previos al cierre porque se retrasan los pagos a proveedores. Fijamos el peg con la media de 24 meses y el comprador recupera la diferencia vía ajuste de precio.' } },
    { id: 'revenue', kind: 'revenue',
      en: { t: 'Revenue & customer quality', d: 'Who pays, how often, and how much of it will still be there next year.',
        lead: 'Revenue tested invoice by invoice, so you know how durable the top line is.',
        subs: [['Customer concentration', 'Dependence on the largest customers and their contract terms.'],
               ['Recurring vs one-off', 'Contracted, repeat and project revenue separated.'],
               ['Cohorts and retention', 'Churn, net revenue retention and pricing by cohort.'],
               ['Cut-off and credit notes', 'Sales pulled into the period and reversed afterwards.'],
               ['Pipeline and backlog', 'Signed backlog versus forecast, tested against history.']],
        auto: ['Every invoice and credit note analysed, not a sample', 'Customer cube built automatically from sales data', 'Anomalies in pricing and timing flagged'],
        ex: 'Two customers make up 55% of revenue and the largest contract renews in seven months. The fund negotiates an earn-out tied to that renewal instead of paying for it up front.' },
      es: { t: 'Calidad de ingresos y clientes', d: 'Quién paga, con qué frecuencia y cuánto seguirá ahí el año que viene.',
        lead: 'Ingresos revisados factura a factura, para saber lo sólida que es la cifra de ventas.',
        subs: [['Concentración de clientes', 'Dependencia de los mayores clientes y condiciones de sus contratos.'],
               ['Recurrente vs puntual', 'Ingresos contratados, repetidos y de proyecto, separados.'],
               ['Cohortes y retención', 'Bajas, retención neta de ingresos y precios por cohorte.'],
               ['Cortes y abonos', 'Ventas adelantadas al periodo y anuladas después.'],
               ['Cartera y pipeline', 'Cartera firmada frente a previsión, contrastada con el histórico.']],
        auto: ['Todas las facturas y abonos analizados, no una muestra', 'Cubo de clientes construido automáticamente', 'Anomalías de precio y calendario señaladas'],
        ex: 'Dos clientes suman el 55% de los ingresos y el mayor contrato renueva en siete meses. El fondo negocia un earn-out ligado a esa renovación en lugar de pagarla por adelantado.' } },
    { id: 'forensic', kind: 'forensic',
      en: { t: 'Forensic review', d: 'Full-population ledger testing and a fraud-examiner\'s eye on related parties and controls.',
        lead: 'Red flags found before signing, by people trained to find them.',
        subs: [['Journal-entry testing', 'Every entry scored: timing, user, round amounts, unusual accounts.'],
               ['Related parties', 'Suppliers, customers and loans connected to owners or managers.'],
               ['Expense and payroll anomalies', 'Duplicate payments, ghost suppliers and unusual payroll patterns.'],
               ['Internal controls', 'Segregation of duties, approvals and access rights.'],
               ['Integrity checks', 'Background and adverse-media checks on key people and counterparties.']],
        auto: ['100% of journal entries tested, not a sample', 'AI scores and clusters outliers', 'A Certified Fraud Examiner reviews every flag'],
        ex: 'Out of 1.28 million entries, three need a human: a manual Sunday-night posting by a finance user, a round US$250,000 transfer and a supplier owned by a director. Two are explained; the third becomes a specific indemnity in the SPA.' },
      es: { t: 'Revisión forense', d: 'Análisis del libro mayor completo y la mirada de un examinador de fraude sobre partes vinculadas y controles.',
        lead: 'Señales de alerta detectadas antes de firmar, por personas formadas para encontrarlas.',
        subs: [['Test de asientos contables', 'Cada asiento puntuado: horario, usuario, importes redondos, cuentas inusuales.'],
               ['Partes vinculadas', 'Proveedores, clientes y préstamos relacionados con dueños o directivos.'],
               ['Anomalías en gastos y nóminas', 'Pagos duplicados, proveedores fantasma y patrones inusuales de nómina.'],
               ['Control interno', 'Segregación de funciones, aprobaciones y permisos de acceso.'],
               ['Comprobaciones de integridad', 'Antecedentes y prensa negativa de personas clave y contrapartes.']],
        auto: ['El 100% de los asientos analizado, no una muestra', 'La IA puntúa y agrupa los valores atípicos', 'Un Certified Fraud Examiner revisa cada alerta'],
        ex: 'De 1,28 millones de asientos, tres necesitan a una persona: un asiento manual un domingo por la noche, una transferencia redonda de 250.000 US$ y un proveedor propiedad de un consejero. Dos se explican; el tercero se convierte en una garantía específica en el contrato.' } },
    { id: 'valuation', kind: 'model',
      en: { t: 'Valuation & deal model', d: 'From adjusted numbers to a price range the investment committee can defend.',
        lead: 'A valuation built on the diligence findings, not on the seller\'s spreadsheet.',
        subs: [['DCF and multiples', 'Discounted cash flow cross-checked with trading and transaction multiples.'],
               ['Sensitivities', 'Price and returns under different growth, margin and exit assumptions.'],
               ['Returns analysis', 'IRR and MOIC for the fund under the proposed structure.'],
               ['Business-plan stress test', 'Management\'s plan tested against history and market data.'],
               ['IC memo support', 'Findings translated into the investment-committee paper.']],
        auto: ['Model linked directly to the adjusted figures', 'Built-in integrity checks on every formula', 'Scenarios recalculated live in the IC meeting'],
        ex: 'After diligence adjustments, the seller\'s US$100M ask maps to a defensible value of about US$78M. The fund bids US$78M and covers the forensic finding with an indemnity.' },
      es: { t: 'Valoración y modelo de la operación', d: 'De las cifras ajustadas a un rango de precio que el comité de inversión pueda defender.',
        lead: 'Una valoración basada en los hallazgos de la due diligence, no en la hoja del vendedor.',
        subs: [['DCF y múltiplos', 'Descuento de flujos contrastado con múltiplos cotizados y de transacciones.'],
               ['Sensibilidades', 'Precio y rentabilidad con distintas hipótesis de crecimiento, margen y salida.'],
               ['Análisis de retornos', 'TIR y MOIC del fondo con la estructura propuesta.'],
               ['Test de estrés del plan', 'El plan de la dirección contrastado con el histórico y el mercado.'],
               ['Apoyo al memo del comité', 'Hallazgos trasladados al documento del comité de inversión.']],
        auto: ['Modelo enlazado directamente con las cifras ajustadas', 'Controles de integridad en cada fórmula', 'Escenarios recalculados en directo en el comité'],
        ex: 'Tras los ajustes, los 100 M US$ que pide el vendedor se traducen en un valor defendible de unos 78 M US$. El fondo ofrece 78 M US$ y cubre el hallazgo forense con una garantía.' } },
    { id: 'cash', kind: 'cash',
      en: { t: 'Cash & liquidity', d: 'Whether the cash the business reports is real, free and enough.',
        lead: 'Cash proven from bank statements and a short-term forecast you can rely on after closing.',
        subs: [['Proof of cash', 'Bank statements reconciled to the ledger, month by month.'],
               ['Cash conversion', 'EBITDA to operating cash flow, and why they differ.'],
               ['13-week forecast', 'Short-term liquidity for the first quarter after closing.'],
               ['Financing and covenants', 'Facilities, covenants and change-of-control clauses.'],
               ['Capex needs', 'Maintenance versus growth capex, and what has been deferred.']],
        auto: ['Bank data matched to the ledger automatically', 'Gaps and unexplained transfers flagged', 'Forecast refreshed from live data'],
        ex: 'EBITDA converts to only 48% operating cash flow because capex has been deferred for two years. The fund budgets US$3M of catch-up capex in its first-year plan.' },
      es: { t: 'Caja y liquidez', d: 'Si la caja que reporta la empresa es real, libre y suficiente.',
        lead: 'Caja demostrada con extractos bancarios y una previsión a corto plazo fiable para después del cierre.',
        subs: [['Prueba de caja', 'Extractos bancarios conciliados con el libro mayor, mes a mes.'],
               ['Conversión en caja', 'Del EBITDA al flujo operativo, y por qué difieren.'],
               ['Previsión a 13 semanas', 'Liquidez a corto plazo para el primer trimestre tras el cierre.'],
               ['Financiación y covenants', 'Líneas, covenants y cláusulas de cambio de control.'],
               ['Necesidades de capex', 'Capex de mantenimiento frente a crecimiento, y lo que se ha aplazado.']],
        auto: ['Datos bancarios cruzados con el libro mayor automáticamente', 'Huecos y transferencias sin explicar señalados', 'Previsión actualizada con datos en vivo'],
        ex: 'El EBITDA solo se convierte en un 48% de flujo operativo porque el capex lleva dos años aplazado. El fondo presupuesta 3 M US$ de capex de puesta al día en su plan del primer año.' } },
    { id: 'vdd', kind: 'board',
      en: { t: 'Vendor due diligence', d: 'For sellers: find the issues first and go to market with numbers that hold up.',
        lead: 'A sell-side report and data room that shorten the buyer\'s diligence and protect the price.',
        subs: [['Vendor QoE report', 'An independent quality-of-earnings report buyers can rely on.'],
               ['Data-room build', 'Organised, complete and consistent from the first request.'],
               ['Issue remediation', 'Fix or explain the findings before a buyer finds them.'],
               ['Q&A management', 'Buyer questions answered quickly and consistently.'],
               ['Equity story numbers', 'KPIs and forecasts that tie back to the accounts.']],
        auto: ['Data room indexed and cross-referenced automatically', 'Buyer questions answered from the source documents', 'Consistency checks across every number released'],
        ex: 'A founder preparing a sale fixes a revenue cut-off issue and documents three normalisation adjustments six months before going to market. Buyers accept the vendor report and diligence closes in five weeks.' },
      es: { t: 'Vendor due diligence', d: 'Para vendedores: encontrar los problemas primero y salir al mercado con cifras que aguantan.',
        lead: 'Un informe de vendedor y un data room que acortan la due diligence del comprador y protegen el precio.',
        subs: [['Informe QoE de vendedor', 'Un informe independiente de calidad del resultado en el que el comprador pueda confiar.'],
               ['Construcción del data room', 'Ordenado, completo y coherente desde la primera petición.'],
               ['Corrección de incidencias', 'Arreglar o explicar los hallazgos antes de que los encuentre un comprador.'],
               ['Gestión de preguntas', 'Respuestas rápidas y coherentes a las preguntas del comprador.'],
               ['Cifras del equity story', 'KPIs y previsiones que cuadran con la contabilidad.']],
        auto: ['Data room indexado y referenciado automáticamente', 'Preguntas del comprador respondidas desde los documentos de origen', 'Controles de coherencia en cada cifra publicada'],
        ex: 'Un fundador que prepara la venta corrige un problema de corte de ingresos y documenta tres ajustes de normalización seis meses antes de salir al mercado. Los compradores aceptan el informe y la due diligence se cierra en cinco semanas.' } },
    { id: 'postdeal', kind: 'consolidated',
      en: { t: 'Post-deal 100 days', d: 'The finance foundations a newly acquired company needs to report to its new owner.',
        lead: 'From closing to reliable monthly reporting, consolidation and controls in the first 100 days.',
        subs: [['Reporting to the fund', 'Monthly pack in the fund\'s format and calendar.'],
               ['Consolidation and GAAP bridge', 'Group close and conversion to the owner\'s standards.'],
               ['Control fixes', 'The diligence findings turned into controls that work.'],
               ['Cash and covenant monitoring', 'Weekly cash and lender reporting from day one.'],
               ['Finance team assessment', 'Who to keep, who to hire and what to automate.']],
        auto: ['Reporting automated from the ledger', 'Diligence findings tracked to closure', 'Alerts on cash and covenant headroom'],
        ex: 'A fund closes on a three-country group with no monthly consolidation. Within 100 days it receives a consolidated pack on working day 8, weekly cash reporting and the two control gaps from diligence closed.' },
      es: { t: 'Primeros 100 días tras la compra', d: 'Las bases financieras que necesita una empresa recién adquirida para reportar a su nuevo dueño.',
        lead: 'Del cierre a un reporting mensual fiable, consolidación y controles en los primeros 100 días.',
        subs: [['Reporting al fondo', 'Pack mensual con el formato y el calendario del fondo.'],
               ['Consolidación y puente de normas', 'Cierre de grupo y conversión a las normas del nuevo dueño.'],
               ['Corrección de controles', 'Los hallazgos de la due diligence convertidos en controles que funcionan.'],
               ['Seguimiento de caja y covenants', 'Reporting semanal de caja y a bancos desde el primer día.'],
               ['Evaluación del equipo financiero', 'A quién mantener, a quién contratar y qué automatizar.']],
        auto: ['Reporting automatizado desde el libro mayor', 'Seguimiento de los hallazgos hasta su cierre', 'Alertas de caja y margen sobre covenants'],
        ex: 'Un fondo compra un grupo en tres países sin consolidación mensual. En 100 días recibe un pack consolidado el día hábil 8, reporting semanal de caja y los dos fallos de control de la due diligence resueltos.' } }
  ];

  const UI = {
    en: { explore: 'Explore', services: 'services', deliver: 'What we deliver', auto: 'AI layer',
          ex: 'Deal example', illus: 'Illustrative deal', sample: 'Sample deliverable · illustrative data',
          cta: 'Discuss this with us', close: 'Close', prev: 'Previous', next: 'Next' },
    es: { explore: 'Explorar', services: 'servicios', deliver: 'Qué entregamos', auto: 'Capa de IA',
          ex: 'Ejemplo de operación', illus: 'Operación ilustrativa', sample: 'Entregable de ejemplo · datos ilustrativos',
          cta: 'Hablemos de esto', close: 'Cerrar', prev: 'Anterior', next: 'Siguiente' }
  };
  const lg = () => (document.documentElement.lang === 'es' ? 'es' : 'en');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const grid = document.getElementById('cases-grid');
  const drawer = document.getElementById('drawer'), panel = drawer.querySelector('.drawer-panel'), body = drawer.querySelector('.drawer-body');
  let unmounts = [], current = -1, lastFocus = null;

  function renderCards() {
    unmounts.forEach(u => u()); unmounts = [];
    const l = lg(), u = UI[l];
    grid.innerHTML = CASES.map((c, i) => {
      const d = c[l];
      return `<button type="button" class="card case" data-i="${i}" aria-haspopup="dialog">
        <div class="thumb"><canvas data-kind="${c.kind}" aria-hidden="true"></canvas><span class="live mono">● LIVE</span></div>
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(d.t)}</h3><p>${esc(d.d)}</p>
        <span class="go mono">→ ${u.explore} · ${d.subs.length} ${u.services}</span>
      </button>`;
    }).join('');
    grid.querySelectorAll('canvas').forEach((cv, i) => unmounts.push(PrizmaPreview.mount(cv, cv.dataset.kind, { lazy: true, offset: i * 1.3 })));
    grid.querySelectorAll('.case').forEach(b => {
      b.addEventListener('click', () => open(+b.dataset.i));
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
    if (window.PrizmaReveal) window.PrizmaReveal(grid.querySelectorAll('.case'));
  }

  let drawerUnmount = null;
  function fill(i) {
    const c = CASES[i], l = lg(), d = c[l], u = UI[l];
    drawerUnmount && drawerUnmount();
    body.innerHTML = `
      <span class="idx">${String(i + 1).padStart(2, '0')} / ${String(CASES.length).padStart(2, '0')}</span>
      <h2 id="dr-title">${esc(d.t)}</h2>
      <p class="dr-lead">${esc(d.lead)}</p>
      <div class="dr-preview"><canvas aria-label="${esc(u.sample)}"></canvas><span class="mono">${esc(u.sample)}</span></div>
      <h4 class="mono">${esc(u.deliver)}</h4>
      <div class="subs">${d.subs.map((s, k) => `<div class="sub" style="--i:${k}"><span class="mono">${String(k + 1).padStart(2, '0')}</span><div><b>${esc(s[0])}</b><p>${esc(s[1])}</p></div></div>`).join('')}</div>
      <div class="auto"><h4 class="mono">⚡ ${esc(u.auto)}</h4><ul>${d.auto.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
      <div class="example"><h4 class="mono">${esc(u.ex)} <em>· ${esc(u.illus)}</em></h4><p>${esc(d.ex)}</p></div>
      <div class="dr-foot">
        <a class="btn primary" href="#contact" data-close><span>${esc(u.cta)}</span><span class="arr">→</span></a>
        <div class="dr-nav"><button type="button" class="dr-prev" aria-label="${esc(u.prev)}">←</button><button type="button" class="dr-next" aria-label="${esc(u.next)}">→</button></div>
      </div>`;
    drawerUnmount = PrizmaPreview.mount(body.querySelector('.dr-preview canvas'), c.kind);
    body.querySelector('.dr-prev').onclick = () => go(-1);
    body.querySelector('.dr-next').onclick = () => go(1);
    body.querySelector('[data-close]').addEventListener('click', close);
    drawer.querySelector('.dr-x').setAttribute('aria-label', u.close);
    panel.scrollTop = 0;
    body.classList.remove('swap'); void body.offsetWidth; body.classList.add('swap');
  }
  function open(i) {
    current = i; lastFocus = document.activeElement; fill(i);
    drawer.classList.add('open'); drawer.removeAttribute('aria-hidden'); document.body.classList.add('lock');
    setTimeout(() => drawer.querySelector('.dr-x').focus(), 50);
  }
  function close() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock');
    drawerUnmount && drawerUnmount(); drawerUnmount = null; current = -1;
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  function go(dir) { current = (current + dir + CASES.length) % CASES.length; fill(current); }
  drawer.querySelector('.drawer-bg').addEventListener('click', close);
  drawer.querySelector('.dr-x').addEventListener('click', close);
  addEventListener('keydown', e => {
    if (current < 0) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  window.PrizmaCases = { render: () => { renderCards(); if (current >= 0) fill(current); }, open };
  renderCards();
})();
