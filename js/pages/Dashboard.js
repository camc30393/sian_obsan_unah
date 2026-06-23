/**
 * SIAN - Dashboard
 * Tablero analítico principal con KPIs y visualizaciones core.
 * Cada indicador y gráfico lleva un tooltip explicativo de su significado.
 *
 * Indicadores incluidos en esta versión:
 *   - 8 KPIs (total, estudiantes, DDM, diversidad media, alimentos, recetas,
 *     departamentos, recordatorios)
 *   - 6 visualizaciones: distribución por etapa de vida, sexo, región,
 *     DDM × NSE, top 10 alimentos, uso de tiempos de comida
 */
const Dashboard = () => {
  const t = (k) => I18n.t(k);
  const ag = DataStore.get('agregados');
  const recetas = DataStore.get('recetas_hondurenas');
  const alimentos = DataStore.get('alimentos_incap');

  if (!ag) return <div>{t('common.loading')}</div>;

  // Importar componentes de Recharts del scope global
  const {
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
  } = window.Recharts;

  // -------- Datos para gráficos --------
  const dataEtapa = Helpers.objToArray(ag.etapa_vida).sort((a, b) => b.value - a.value);

  const dataSexo = ag.sexo_x_etapa.reduce((acc, r) => {
    const found = acc.find(a => a.name === r.sexo);
    if (found) found.value += r.count;
    else acc.push({ name: r.sexo, value: r.count });
    return acc;
  }, []);

  const dataRegion = Helpers.objToArray(ag.region)
    .map(r => ({ name: r.name.replace('Región ', ''), value: r.value }))
    .sort((a, b) => b.value - a.value);

  // DDM × NSE: matriz para barras agrupadas
  const niveles = ['a. bajo', 'b. medio', 'c. alto'];
  const dataDdmNse = niveles.map(nse => {
    const con = ag.ddm_x_nse.find(r => r.nivel_se === nse && r.diversidad_dietetica === 'a. Diversidad dietética');
    const sin = ag.ddm_x_nse.find(r => r.nivel_se === nse && r.diversidad_dietetica === 'b. Sin diversidad dietética');
    return {
      name: Helpers.cap(Helpers.cleanPrefix(nse)),
      'Con diversidad': con?.count || 0,
      'Sin diversidad': sin?.count || 0
    };
  });

  const dataTopAlim = Helpers.objToArray(ag.top_alimentos)
    .map(r => ({ name: Helpers.truncate(r.name, 28), value: r.value }))
    .slice(0, 10);

  const tiemposNombres = { '1': 'Desayuno', '2': 'M. Mat.', '3': 'Almuerzo', '4': 'M. Tar.', '5': 'Cena', '6': 'M. Noche' };
  const dataTiempos = Object.entries(ag.tiempos_comida_uso)
    .map(([k, v]) => ({ name: tiemposNombres[k] || k, value: v }));

  return (
    <div>
      {/* Header de página */}
      <div className="mb-4">
        <h1 className="h1" style={{ margin: '0 0 4px 0' }}>{t('dashboard.title')}</h1>
        <p className="muted" style={{ margin: 0 }}>{t('dashboard.subtitle')}</p>
      </div>

      {/* Filtros rápidos - v1.1: filtro de período con calendario */}
      <div className="card-tight mb-4" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 12 }}>
        <div className="flex items-center gap-3 mb-2" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-700)' }}>
            📅 Período de análisis:
          </span>
          <input type="date"
            className="input"
            defaultValue="2024-01-01"
            style={{ width: 'auto', fontSize: '0.78rem', padding: '6px 10px' }}
            title="Fecha inicial del período"
          />
          <span className="muted small">a</span>
          <input type="date"
            className="input"
            defaultValue="2026-01-01"
            style={{ width: 'auto', fontSize: '0.78rem', padding: '6px 10px' }}
            title="Fecha final del período"
          />
          <button className="btn btn-ghost btn-sm"
            onClick={() => alert('(Prototipo) Período actualizado.\n\nEn producción, todos los KPIs, gráficos y mapas se recalculan según el rango de fechas seleccionado.')}>
            🔄 Aplicar
          </button>
          <span className="muted small">|</span>
          <span className="muted small">Atajos:</span>
          {['Últimos 30d', 'Este año', 'Año anterior', 'Todo'].map(p => (
            <button key={p} className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem' }}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', borderTop: '1px solid var(--gray-100)', paddingTop: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-700)' }}>
            {t('dashboard.filters')}:
          </span>
          {['filter_etapa', 'filter_sexo', 'filter_region', 'filter_nse'].map(k => (
            <select key={k} className="select" style={{ width: 'auto', fontSize: '0.78rem', padding: '6px 10px' }}>
              <option>{t(`dashboard.${k}`)}: {t('dashboard.filter_all')}</option>
            </select>
          ))}
        </div>
      </div>

      {/* KPIs - 4 columnas × 2 filas */}
      <div className="grid-12 mb-4">
        <div className="col-3"><KPI
          label={t('dashboard.kpi_total')}
          value={Helpers.num(ag.totales.encuestados)}
          icon="👥" iconColor=""
          help={t('dashboard.kpi_total_help')}
          trend={{ dir: 'up', text: `+${ag.totales.sinteticos} sintéticos` }}
        /></div>
        <div className="col-3"><KPI
          label={t('dashboard.kpi_estudiantes')}
          value={ag.totales.estudiantes_activos}
          icon="🎓" iconColor="yellow"
          help={t('dashboard.kpi_estudiantes_help')}
        /></div>
        <div className="col-3"><KPI
          label={t('dashboard.kpi_ddm')}
          value={Helpers.pct(ag.totales.ddm_promedio, 1)}
          icon="🥗" iconColor="green"
          help={t('dashboard.kpi_ddm_help')}
        /></div>
        <div className="col-3"><KPI
          label={t('dashboard.kpi_diversidad')}
          value={ag.totales.diversidad_promedio}
          suffix=" /10"
          icon="📊" iconColor=""
          help={t('dashboard.kpi_diversidad_help')}
        /></div>

        <div className="col-3"><KPI
          label={t('dashboard.kpi_alimentos')}
          value={Helpers.num(alimentos.length)}
          icon="🍎" iconColor="red"
          help={t('dashboard.kpi_alimentos_help')}
        /></div>
        <div className="col-3"><KPI
          label={t('dashboard.kpi_recetas')}
          value={recetas.length}
          icon="🍲" iconColor="yellow"
          help={t('dashboard.kpi_recetas_help')}
        /></div>
        <div className="col-3"><KPI
          label={t('dashboard.kpi_departamentos')}
          value={`${ag.totales.departamentos} / 18`}
          icon="📍" iconColor=""
          help={t('dashboard.kpi_departamentos_help')}
        /></div>
        <div className="col-3"><KPI
          label={t('dashboard.kpi_recordatorios')}
          value="53,287"
          icon="📝" iconColor="green"
          help={t('dashboard.kpi_recordatorios_help')}
        /></div>
      </div>

      {/* Gráficos - Fila 1 */}
      <div className="grid-12 mb-4">
        <div className="col-6">
          <ChartCard title={t('dashboard.ch_etapa_title')} help={t('dashboard.ch_etapa_help')}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dataEtapa} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" style={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" style={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#002F87" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-3">
          <ChartCard title={t('dashboard.ch_sexo_title')}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dataSexo} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataSexo.map((d, i) => (
                    <Cell key={i} fill={Helpers.colorForCategory(d.name)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-3">
          <ChartCard title={t('dashboard.ch_tiempos_title')} help={t('dashboard.ch_tiempos_help')}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dataTiempos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" style={{ fontSize: 10 }} />
                <YAxis style={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#F4B71A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Gráficos - Fila 2 */}
      <div className="grid-12 mb-4">
        <div className="col-6">
          <ChartCard title={t('dashboard.ch_region_title')} help={t('dashboard.ch_region_help')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" style={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                <YAxis style={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0050B3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-6">
          <ChartCard title={t('dashboard.ch_ddm_nse_title')} help={t('dashboard.ch_ddm_nse_help')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dataDdmNse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" style={{ fontSize: 11 }} />
                <YAxis style={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Con diversidad" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sin diversidad" fill="#C8102E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Gráficos - Fila 3 */}
      <div className="grid-12 mb-4">
        <div className="col-12">
          <ChartCard title={t('dashboard.ch_top_alim_title')} help={t('dashboard.ch_top_alim_help')}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataTopAlim} layout="vertical" margin={{ left: 180 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" style={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" style={{ fontSize: 11 }} width={170} />
                <Tooltip />
                <Bar dataKey="value" fill="#002F87" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* === Sección ampliada (sesión 5) === */}

      {/* Fila 4: Etnia + DDM por etapa de vida */}
      <div className="grid-12 mb-4">
        <div className="col-6">
          <ChartCard title={t('dashboard2.etnia_title')} help={t('dashboard2.etnia_help')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={Helpers.objToArray(ag.etnia).filter(d => d.value > 0).sort((a, b) => b.value - a.value)} layout="vertical" margin={{ left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" style={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" style={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#0050B3" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-6">
          <ChartCard title={t('dashboard2.ddm_etapa_title')} help={t('dashboard2.ddm_etapa_help')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={(() => {
                const etapas = ['Lactante','Preescolar','Escolar','Adolescente','Adulto','Adulto mayor'];
                return etapas.map(et => {
                  const con = ag.ddm_x_etapa.find(r => r.etapa_vida === et && r.diversidad_dietetica === 'a. Diversidad dietética');
                  const sin = ag.ddm_x_etapa.find(r => r.etapa_vida === et && r.diversidad_dietetica === 'b. Sin diversidad dietética');
                  return {
                    name: et,
                    'Con diversidad': con?.count || 0,
                    'Sin diversidad': sin?.count || 0
                  };
                });
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" style={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                <YAxis style={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Con diversidad" fill="#10B981" stackId="a" />
                <Bar dataKey="Sin diversidad" fill="#C8102E" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Fila 5: Adecuación macronutrientes (radar) + DDM × área */}
      <div className="grid-12 mb-4">
        <div className="col-6">
          <ChartCard title={t('dashboard2.macros_title')} help={t('dashboard2.macros_help')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { macro: 'Carbohidratos', actual: 57, recomMin: 45, recomMax: 65 },
                { macro: 'Proteína', actual: 13, recomMin: 10, recomMax: 35 },
                { macro: 'Grasa', actual: 30, recomMin: 20, recomMax: 35 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="macro" style={{ fontSize: 11 }} />
                <YAxis style={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="recomMin" fill="#DCEAFB" name="AMDR mín" stackId="b" />
                <Bar dataKey="actual" fill="#002F87" name="% kcal actual" />
                <Bar dataKey="recomMax" fill="#F4B71A" name="AMDR máx" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-6">
          <ChartCard title={t('dashboard2.ddm_area_title')} help={t('dashboard2.ddm_area_help')}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={(() => {
                const areas = ['1. Urbana', '2. Rural'];
                return areas.map(ar => {
                  const con = ag.ddm_x_area.find(r => r.area_vivienda === ar && r.diversidad_dietetica === 'a. Diversidad dietética');
                  const sin = ag.ddm_x_area.find(r => r.area_vivienda === ar && r.diversidad_dietetica === 'b. Sin diversidad dietética');
                  return {
                    name: Helpers.cleanPrefix(ar),
                    'Con diversidad': con?.count || 0,
                    'Sin diversidad': sin?.count || 0
                  };
                });
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" style={{ fontSize: 11 }} />
                <YAxis style={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Con diversidad" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sin diversidad" fill="#C8102E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Fila 6: Heatmap alimento × tiempo (versión simplificada) */}
      <div className="grid-12 mb-4">
        <div className="col-12">
          <ChartCard title={t('dashboard2.heatmap_title')} help={t('dashboard2.heatmap_help')}>
            <Heatmap />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;

// ============================================================================
// Componente Heatmap: alimento × tiempo de comida
// Construido a partir de top alimentos y tiempos de comida del DataStore.
// Para mantener el rendimiento, mostramos los top 12 alimentos × 6 tiempos.
// ============================================================================
const Heatmap = () => {
  const ag = DataStore.get('agregados');
  const recordatorios = DataStore.get('recordatorios') || [];
  const tiempos = DataStore.get('tiempos_comida') || [];

  // Construir matriz alimento × tiempo
  const matriz = React.useMemo(() => {
    const topAlimentos = Object.keys(ag.top_alimentos).slice(0, 12);
    const tiempoMap = {};
    tiempos.forEach(t => { tiempoMap[t.id] = t.nombre; });

    // Inicializar matriz
    const data = topAlimentos.map(a => {
      const row = { alimento: a };
      tiempos.forEach(t => { row[t.nombre] = 0; });
      return row;
    });

    // Contar ocurrencias en recordatorios
    const idxMap = {};
    topAlimentos.forEach((a, i) => { idxMap[a] = i; });

    recordatorios.forEach(r => {
      if (idxMap[r.alimento] !== undefined) {
        const tn = tiempoMap[r.id_tiempos_comida];
        if (tn) data[idxMap[r.alimento]][tn] = (data[idxMap[r.alimento]][tn] || 0) + 1;
      }
    });

    // Encontrar el máximo para escalar la intensidad de color
    let max = 0;
    data.forEach(row => {
      tiempos.forEach(t => { if (row[t.nombre] > max) max = row[t.nombre]; });
    });

    return { data, max, tiempos: tiempos.map(t => t.nombre) };
  }, [ag, recordatorios, tiempos]);

  const colorFor = (val, max) => {
    if (val === 0) return '#F8FAFC';
    const intensity = val / max;
    // Gradiente de azul UNAH claro a oscuro
    if (intensity > 0.75) return '#002F87';
    if (intensity > 0.50) return '#0050B3';
    if (intensity > 0.25) return '#5C95DC';
    if (intensity > 0.10) return '#DCEAFB';
    return '#F0F6FF';
  };

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px', background: 'var(--gray-50)', minWidth: 220 }}>
              Alimento
            </th>
            {matriz.tiempos.map(t => (
              <th key={t} style={{
                textAlign: 'center', padding: '8px', background: 'var(--gray-50)',
                fontSize: '0.72rem', minWidth: 90
              }}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.data.map(row => (
            <tr key={row.alimento}>
              <td style={{ padding: '6px 8px', fontWeight: 500, borderBottom: '1px solid var(--gray-100)' }}>
                {Helpers.truncate(row.alimento, 38)}
              </td>
              {matriz.tiempos.map(t => {
                const val = row[t] || 0;
                const bg = colorFor(val, matriz.max);
                const isDark = val / matriz.max > 0.50;
                return (
                  <td key={t} style={{
                    padding: '6px', textAlign: 'center',
                    background: bg, color: isDark ? 'white' : 'var(--gray-700)',
                    fontWeight: val > 0 ? 600 : 400,
                    border: '1px solid white'
                  }}>{val > 0 ? Helpers.num(val) : ''}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="muted small mt-2">
        Cada celda muestra el número de veces que un alimento fue reportado en cada tiempo de comida.
        Los colores más oscuros indican mayor frecuencia.
      </div>
    </div>
  );
};
