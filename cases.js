// PRIZMA BI — use cases: cards with live deliverable previews + a detail drawer
// (sub-services, automation layer, illustrative real-life example).
(() => {
  const CASES = [
    { id: 'management', kind: 'management',
      en: { t: 'Management reporting', d: 'Clear monthly reports, on time, with the KPIs that drive decisions.',
        lead: 'One reliable view of how the business is performing, every month on the same day.',
        subs: [['Monthly management pack', 'P&L, balance sheet and cash flow with commentary, on a fixed calendar.'],
               ['KPI dashboards', 'Live dashboards in Power BI, Looker or the tool you already use.'],
               ['Variance analysis', 'Actual vs. budget vs. prior year, with the why behind every gap.'],
               ['Departmental P&L', 'Profitability by business line, cost centre, site or project.'],
               ['Automated distribution', 'Reports generated and sent to the right people automatically.']],
        auto: ['Data pulled automatically from ERP and banks', 'AI-drafted commentary, reviewed by a senior', 'Anomaly alerts on key KPIs'],
        ex: 'A multi-site hospitality group gets its management pack on working day 5, plus a dashboard per site manager. The AI flags that occupancy is 6 points above plan and explains why before the monthly meeting.' },
      es: { t: 'Reporting de gestión', d: 'Informes mensuales claros y a tiempo, con los KPIs que ayudan a decidir.',
        lead: 'Una visión única y fiable de cómo va el negocio, cada mes y el mismo día.',
        subs: [['Pack de gestión mensual', 'Resultados, balance y cash flow con comentarios, en un calendario fijo.'],
               ['Dashboards de KPIs', 'Dashboards en tiempo real en Power BI, Looker o la herramienta que ya uses.'],
               ['Análisis de desviaciones', 'Real vs. presupuesto vs. año anterior, con el porqué de cada diferencia.'],
               ['Resultados por área', 'Rentabilidad por línea de negocio, centro de coste, centro o proyecto.'],
               ['Distribución automática', 'Informes generados y enviados automáticamente a quien corresponde.']],
        auto: ['Datos extraídos automáticamente del ERP y bancos', 'Comentarios redactados por IA y revisados por un senior', 'Alertas de anomalías en KPIs clave'],
        ex: 'Un grupo hotelero con varios centros recibe su pack de gestión el día hábil 5 y un dashboard por director de centro. La IA detecta que la ocupación va 6 puntos por encima del plan y explica por qué antes de la reunión mensual.' } },
    { id: 'board', kind: 'board',
      en: { t: 'Investor & board reporting', d: 'Board and investor packs that are consistent, traceable and ready to present.',
        lead: 'Reporting that builds trust with your board, investors and lenders.',
        subs: [['Board packs', 'Monthly or quarterly board decks with financials, KPIs and decisions.'],
               ['Investor updates', 'Regular investor letters and dashboards with a consistent narrative.'],
               ['Lender & covenant reporting', 'Covenant calculations and compliance certificates for your banks.'],
               ['Data room preparation', 'Organised, audit-ready data rooms for fundraising or due diligence.'],
               ['Cap table support', 'Cap table tracking and scenarios for new rounds.']],
        auto: ['One-click board pack refresh', 'Version control and full audit trail', 'KPI definitions kept consistent across every report'],
        ex: 'A founder-led company sends its quarterly board pack three days before the meeting instead of the night before. Figures tie back to the ledger, and covenant tests are pre-calculated for the bank.' },
      es: { t: 'Reporting a inversores y consejo', d: 'Paquetes para consejo e inversores coherentes, trazables y listos para presentar.',
        lead: 'Un reporting que genera confianza en tu consejo, inversores y bancos.',
        subs: [['Paquetes para el consejo', 'Presentaciones mensuales o trimestrales con cifras, KPIs y decisiones.'],
               ['Actualizaciones a inversores', 'Cartas y dashboards periódicos con un relato coherente.'],
               ['Reporting a bancos y covenants', 'Cálculo de covenants y certificados de cumplimiento para tus bancos.'],
               ['Preparación de data room', 'Data rooms ordenados y listos para auditoría en rondas o due diligence.'],
               ['Soporte en cap table', 'Seguimiento del cap table y escenarios para nuevas rondas.']],
        auto: ['Actualización del board pack con un clic', 'Control de versiones y trazabilidad completa', 'Definiciones de KPIs coherentes en todos los informes'],
        ex: 'Una empresa liderada por su fundador envía el board pack trimestral tres días antes de la reunión, no la noche anterior. Las cifras cuadran con la contabilidad y los covenants llegan precalculados para el banco.' } },
    { id: 'consolidated', kind: 'consolidated',
      en: { t: 'Consolidated reporting', d: 'Multi-entity, multi-currency consolidation with intercompany eliminations.',
        lead: 'Group-level visibility across entities, currencies and accounting standards.',
        subs: [['Multi-entity consolidation', 'Monthly consolidation across every company in the group.'],
               ['Intercompany eliminations', 'Intercompany reconciliation, matching and elimination entries.'],
               ['Multi-currency translation', 'FX translation and revaluation under consistent group policies.'],
               ['Group chart of accounts', 'Local ledgers mapped to one group reporting structure.'],
               ['IFRS & local GAAP packs', 'Reporting packs under IFRS or local standards.']],
        auto: ['Automated intercompany matching', 'Scheduled FX rate feeds', 'Consolidation checks with exception flags'],
        ex: 'A group with five companies in three currencies closes its consolidated accounts in days, not weeks. Intercompany balances are matched automatically and only real differences reach a person.' },
      es: { t: 'Reporting consolidado', d: 'Consolidación multisociedad y multidivisa, con eliminaciones intercompañía.',
        lead: 'Visibilidad de grupo entre sociedades, divisas y normas contables.',
        subs: [['Consolidación multisociedad', 'Consolidación mensual de todas las sociedades del grupo.'],
               ['Eliminaciones intercompañía', 'Conciliación, cuadre y asientos de eliminación intercompañía.'],
               ['Conversión multidivisa', 'Conversión y revaluación de divisas con políticas de grupo homogéneas.'],
               ['Plan de cuentas de grupo', 'Contabilidades locales mapeadas a una única estructura de reporting.'],
               ['Paquetes NIIF y normativa local', 'Paquetes de reporting bajo NIIF o normativa local.']],
        auto: ['Cuadre intercompañía automatizado', 'Carga programada de tipos de cambio', 'Controles de consolidación con alertas de excepciones'],
        ex: 'Un grupo con cinco sociedades en tres divisas cierra sus cuentas consolidadas en días, no en semanas. Los saldos intercompañía se cuadran solos y solo las diferencias reales llegan a una persona.' } },
    { id: 'budget', kind: 'budget',
      en: { t: 'Business budgeting', d: 'Annual budget and actual vs. budget tracking by area and cost centre.',
        lead: 'A realistic budget your managers own, and a clear view of how you track against it.',
        subs: [['Annual budget build', 'Bottom-up and top-down budgeting with every department.'],
               ['Opex & capex planning', 'Operating and investment budgets tied to the business plan.'],
               ['Budget vs. actual tracking', 'Monthly tracking with an owner for every line.'],
               ['Rolling reforecasts', 'Quarterly or monthly reforecasts as the year unfolds.'],
               ['Templates & process', 'A repeatable budgeting calendar, templates and approval workflow.']],
        auto: ['Templates pre-filled from actuals', 'Automatic budget vs. actual reports', 'Approval workflows with reminders'],
        ex: 'Each department head opens a template already filled with last year\'s actuals, adjusts it and submits it for approval. Finance consolidates the budget in one week instead of chasing spreadsheets for a month.' },
      es: { t: 'Presupuestos', d: 'Presupuesto anual y seguimiento real vs. presupuesto por área y centro de coste.',
        lead: 'Un presupuesto realista que tus responsables hacen suyo, y una visión clara de cómo vas frente a él.',
        subs: [['Elaboración del presupuesto anual', 'Presupuesto bottom-up y top-down con cada departamento.'],
               ['Planificación de opex y capex', 'Presupuestos operativos y de inversión ligados al plan de negocio.'],
               ['Seguimiento real vs. presupuesto', 'Seguimiento mensual con un responsable por partida.'],
               ['Reforecasts periódicos', 'Reforecasts trimestrales o mensuales según avanza el año.'],
               ['Plantillas y proceso', 'Calendario, plantillas y flujo de aprobación repetibles.']],
        auto: ['Plantillas prellenadas con datos reales', 'Informes real vs. presupuesto automáticos', 'Flujos de aprobación con recordatorios'],
        ex: 'Cada responsable abre una plantilla ya rellena con los datos reales del año anterior, la ajusta y la envía a aprobación. Finanzas consolida el presupuesto en una semana en lugar de perseguir hojas de cálculo durante un mes.' } },
    { id: 'cash', kind: 'cash',
      en: { t: 'Cash flow forecasting', d: '13-week cash flow and scenarios to get ahead of cash pressure.',
        lead: 'Know your cash position weeks ahead and act before pressure builds.',
        subs: [['13-week cash flow', 'Rolling short-term forecast updated every week.'],
               ['Long-term cash planning', '12–36 month cash outlook linked to your plan.'],
               ['Working capital', 'Receivables, payables and stock levers to free up cash.'],
               ['Scenarios & stress tests', 'Best, base and worst cases, and what triggers each.'],
               ['Liquidity monitoring', 'Daily bank positions, facilities and headroom in one view.']],
        auto: ['Bank balances consolidated daily', 'Forecast auto-updated from invoices and bills', 'Early-warning alerts before cash runs low'],
        ex: 'In the worst-case scenario the forecast shows cash dipping below the minimum in week 8. Management delays a capex payment and draws on a credit line six weeks in advance, with no last-minute surprises.' },
      es: { t: 'Previsión de tesorería', d: 'Cash flow a 13 semanas y escenarios para anticiparte a las tensiones de caja.',
        lead: 'Conoce tu posición de caja con semanas de antelación y actúa antes de que haya tensión.',
        subs: [['Cash flow a 13 semanas', 'Previsión a corto plazo actualizada cada semana.'],
               ['Planificación de caja a largo plazo', 'Visión de caja a 12–36 meses ligada a tu plan.'],
               ['Capital circulante', 'Palancas en cobros, pagos e inventario para liberar caja.'],
               ['Escenarios y estrés', 'Escenarios optimista, base y pesimista, y qué los activa.'],
               ['Seguimiento de liquidez', 'Saldos diarios, líneas de crédito y margen disponible en una vista.']],
        auto: ['Saldos bancarios consolidados a diario', 'Previsión actualizada automáticamente desde facturas', 'Alertas tempranas antes de quedarse sin caja'],
        ex: 'En el escenario pesimista la previsión muestra que la caja baja del mínimo en la semana 8. La dirección aplaza un pago de capex y dispone de una línea de crédito con seis semanas de margen, sin sorpresas de última hora.' } },
    { id: 'fpa', kind: 'fpa',
      en: { t: 'FP&A', d: 'Ongoing planning and analysis: variances, business drivers and recommendations.',
        lead: 'Finance as a strategic partner: planning and analysis that move the numbers.',
        subs: [['Rolling forecasts', 'Continuous forecasting beyond the fiscal year.'],
               ['Driver-based planning', 'Models built on the real drivers of your business.'],
               ['Margins & unit economics', 'Profitability by product, customer and channel.'],
               ['Pricing analysis', 'Price, discount and mix analysis to protect margins.'],
               ['Strategic planning', 'Three-to-five-year plans and decision support for management.']],
        auto: ['Data pipelines feeding the planning models', 'AI-assisted variance explanations', 'Self-serve analysis for managers'],
        ex: 'The commercial director asks what 6 more points of occupancy would mean. The driver model recalculates revenue live in the meeting, and the decision is taken on the spot.' },
      es: { t: 'FP&A', d: 'Planificación y análisis continuo: desviaciones, drivers de negocio y recomendaciones.',
        lead: 'Finanzas como socio estratégico: planificación y análisis que mueven los números.',
        subs: [['Forecasts rolling', 'Previsión continua más allá del ejercicio fiscal.'],
               ['Planificación por drivers', 'Modelos construidos sobre los drivers reales de tu negocio.'],
               ['Márgenes y unit economics', 'Rentabilidad por producto, cliente y canal.'],
               ['Análisis de precios', 'Análisis de precios, descuentos y mix para proteger márgenes.'],
               ['Planificación estratégica', 'Planes a 3–5 años y apoyo a la toma de decisiones de dirección.']],
        auto: ['Flujos de datos automáticos hacia los modelos', 'Explicación de desviaciones asistida por IA', 'Análisis autoservicio para directivos'],
        ex: 'El director comercial pregunta qué supondrían 6 puntos más de ocupación. El modelo por drivers recalcula los ingresos en directo durante la reunión y la decisión se toma en el momento.' } },
    { id: 'model', kind: 'model',
      en: { t: 'Financial modelling', d: 'Models for investments, financing, valuations and business plans.',
        lead: 'Robust, transparent models for the decisions that matter most.',
        subs: [['Three-statement models', 'Integrated P&L, balance sheet and cash flow models.'],
               ['Valuation', 'DCF, multiples and scenario-based valuations.'],
               ['Fundraising models', 'Investor-ready models for equity or debt raises.'],
               ['M&A and investment cases', 'Business cases for acquisitions, expansions and new projects.'],
               ['Sensitivity analysis', 'Clear views of what moves the result, and by how much.']],
        auto: ['Models linked to live actuals', 'Scenarios run automatically', 'Built-in model integrity checks'],
        ex: 'Before signing an acquisition, the board reviews a DCF with a sensitivity table showing value across WACC and growth assumptions. Every figure traces back to a documented source.' },
      es: { t: 'Modelización financiera', d: 'Modelos para inversiones, financiación, valoraciones y planes de negocio.',
        lead: 'Modelos sólidos y transparentes para las decisiones que más importan.',
        subs: [['Modelos de tres estados', 'Modelos integrados de resultados, balance y cash flow.'],
               ['Valoración', 'Valoraciones por DCF, múltiplos y escenarios.'],
               ['Modelos para rondas', 'Modelos listos para inversores en rondas de capital o deuda.'],
               ['M&A y casos de inversión', 'Business cases para adquisiciones, expansiones y nuevos proyectos.'],
               ['Análisis de sensibilidad', 'Qué mueve el resultado y cuánto, de forma clara.']],
        auto: ['Modelos conectados a datos reales', 'Escenarios ejecutados automáticamente', 'Controles de integridad integrados'],
        ex: 'Antes de firmar una adquisición, el consejo revisa un DCF con una tabla de sensibilidad que muestra el valor según WACC y crecimiento. Cada cifra se puede rastrear hasta una fuente documentada.' } },
    { id: 'books', kind: 'books',
      en: { t: 'Bookkeeping', d: 'Up-to-date books, bank reconciliations and a clean month-end close.',
        lead: 'Clean, current books: the foundation everything else is built on.',
        subs: [['Transaction processing', 'Every transaction coded and posted, every day.'],
               ['Payables & receivables', 'Invoices, collections and supplier payments under control.'],
               ['Bank reconciliations', 'Bank and card reconciliations kept current.'],
               ['Month-end close', 'A structured close: accruals, prepayments and fixed assets.'],
               ['Audit-ready ledgers', 'Supporting documents and schedules ready for your auditors.']],
        auto: ['AI invoice capture and account coding', 'Automatic bank matching', 'Close checklist with automated checks'],
        ex: 'Supplier invoices arrive by email, the AI reads and codes them, and each one is matched to its bank payment. The team only reviews exceptions, and the month closes on day 4.' },
      es: { t: 'Contabilidad', d: 'Contabilidad al día, conciliaciones bancarias y un cierre mensual ordenado.',
        lead: 'Una contabilidad limpia y al día: la base sobre la que se construye todo lo demás.',
        subs: [['Registro de operaciones', 'Cada operación codificada y registrada, cada día.'],
               ['Proveedores y clientes', 'Facturas, cobros y pagos a proveedores bajo control.'],
               ['Conciliaciones bancarias', 'Conciliaciones bancarias y de tarjetas siempre al día.'],
               ['Cierre mensual', 'Cierre estructurado: periodificaciones, anticipos e inmovilizado.'],
               ['Contabilidad lista para auditoría', 'Soportes y detalles preparados para tus auditores.']],
        auto: ['Captura y codificación de facturas con IA', 'Cuadre bancario automático', 'Checklist de cierre con controles automáticos'],
        ex: 'Las facturas de proveedores llegan por email, la IA las lee y las codifica, y cada una se cuadra con su pago en el banco. El equipo solo revisa las excepciones y el mes se cierra el día 4.' } }
  ];

  const UI = {
    en: { explore: 'Explore', services: 'services', deliver: 'What we deliver', auto: 'Automation & AI layer',
          ex: 'Real-life example', illus: 'Illustrative scenario', sample: 'Sample deliverable · illustrative data',
          cta: 'Discuss this with us', close: 'Close', prev: 'Previous', next: 'Next' },
    es: { explore: 'Explorar', services: 'servicios', deliver: 'Qué entregamos', auto: 'Capa de automatización e IA',
          ex: 'Ejemplo real de uso', illus: 'Escenario ilustrativo', sample: 'Entregable de ejemplo · datos ilustrativos',
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
