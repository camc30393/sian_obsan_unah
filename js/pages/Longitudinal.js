/**
 * SIAN - Longitudinal
 * Historial dietético longitudinal de una persona a lo largo del tiempo.
 *
 * Para el prototipo no funcional, generamos series sintéticas de R24 a partir
 * del registro real del encuestado seleccionado, simulando 4-6 visitas
 * espaciadas en el tiempo. En producción este componente leerá los R24
 * realmente registrados por la persona.
 *
 * Vistas:
 *   - Timeline de visitas
 *   - Tendencias (DDM, kcal) en líneas
 *   - Comparación día 1 vs día 2 lado a lado (radar)
 *   - Variabilidad intraindividual
 *   - Aproximación a ingesta usual
 */
const Longitudinal = () => {
  const t = (k) => I18n.t(k);
  const encuestados = DataStore.get('encuestados') || [];

  const [search, setSearch] = React.useState('');
  const [persona, setPersona] = React.useState(null);

  // Solo personas con datos completos
  const candidatas = React.useMemo(() => {
    return encuestados.filter(e => e.ddm != null && e.nombre);
  }, [encuestados]);

  // Resultados de búsqueda (top 8)
  const results = React.useMemo(() => {
    if (!search.trim()) return candidatas.slice(0, 8);
    const q = search.toLowerCase();
    return candidatas.filter(e =>
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.dni || '').includes(q)
    ).slice(0, 8);
  }, [search, candidatas]);

  // Generar serie longitudinal sintética coherente con la persona seleccionada
  const series = React.useMemo(() => {
    if (!persona) return null;
    // Semilla determinista basada en el id para que cada persona tenga su misma serie
    const seed = persona.id || 1;
    const rand = (n) => {
      // PRNG simple determinista
      let x = (seed * (n + 1) * 9301 + 49297) % 233280;
      return x / 233280;
    };

    const baseDDM = persona.ddm === 1 ? 0.7 : 0.35;
    const baseKcal = 1900 + Math.floor(rand(0) * 400);
    const baseDiv = persona.diversidad_count || 6;

    const today = new Date(persona.fecha || '2025-09-15');
    const visitas = [];
    const numVisitas = 4 + Math.floor(rand(99) * 3);  // 4-6 visitas

    for (let i = 0; i < numVisitas; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - (numVisitas - 1 - i) * 2);

      const variacion = (rand(i + 100) - 0.5) * 0.4;  // ±20% variabilidad
      const ddmProb = Math.max(0, Math.min(1, baseDDM + variacion));
      const ddmCumple = rand(i + 200) < ddmProb;
      const div = Math.max(2, Math.min(10, baseDiv + Math.floor((rand(i + 300) - 0.5) * 4)));
      const kcal = Math.max(1200, Math.round(baseKcal + (rand(i + 400) - 0.5) * 600));
      const alimentos = 8 + Math.floor(rand(i + 500) * 12);

      visitas.push({
        n: i + 1,
        fecha: date.toISOString().split('T')[0],
        ddm: ddmCumple ? 1 : 0,
        diversidad: div,
        kcal,
        alimentos,
        proteina: Math.round(kcal * 0.13 / 4),
        grasa: Math.round(kcal * 0.30 / 9),
        carbo: Math.round(kcal * 0.57 / 4)
      });
    }

    // Estadísticas agregadas
    const cv = (arr) => {
      const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
      if (mean === 0) return 0;
      const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
      return Math.sqrt(variance) / mean * 100;
    };
    const stats = {
      ddmRate: visitas.filter(v => v.ddm === 1).length / visitas.length * 100,
      kcalAvg: Math.round(visitas.reduce((s, v) => s + v.kcal, 0) / visitas.length),
      divAvg: (visitas.reduce((s, v) => s + v.diversidad, 0) / visitas.length).toFixed(1),
      cvKcal: cv(visitas.map(v => v.kcal)).toFixed(1),
      cvDiv: cv(visitas.map(v => v.diversidad)).toFixed(1)
    };

    return { visitas, stats };
  }, [persona]);

  return (
    <div className="fade-in">
      {/* Selector de persona */}
      {!persona && (
        <div className="card mb-3">
          <div className="h3 mb-2">📈 {t('longitudinal.selectPerson')}</div>
          <div style={{ position: 'relative' }} className="mb-3">
            <input
              className="input"
              placeholder={t('longitudinal.searchPerson')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: 14 }}
            />
            <span style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--gray-400)'
            }}>🔍</span>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {results.map(p => (
              <div key={p.id} style={{
                padding: '10px 14px', background: 'white',
                border: '1px solid var(--gray-200)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 10, flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  <div className="muted small" style={{ fontFamily: 'monospace' }}>
                    {p.dni} · {p.edad} años · {p.sexo} · {p.etapa_vida}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); setPersona(p); }}
                    title="Ver perfil + tendencias + comparador completo"
                  >📊 Ver historial →</button>
                </div>
              </div>
            ))}
            {results.length === 0 && search.trim() && (
              <div className="muted small" style={{ textAlign: 'center', padding: 24 }}>
                Sin resultados para "{search}". Intente con otro DNI o nombre.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vista detallada de la persona */}
      {persona && series && (
        <div>
          {/* Tarjeta de identidad */}
          <div className="card mb-3" style={{
            background: 'linear-gradient(135deg, var(--unah-blue-800) 0%, var(--unah-blue-600) 100%)',
            color: 'white', borderColor: 'transparent'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '0.78rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('longitudinal.currentPerson')}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{persona.nombre}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  DNI <span style={{ fontFamily: 'monospace' }}>{persona.dni}</span>
                  {' · '} {persona.edad} años · {persona.sexo} · {persona.etapa_vida}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-yellow btn-sm">+ Nuevo R24</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setPersona(null)}>
                  ← Cambiar persona
                </button>
              </div>
            </div>
          </div>

          {/* KPIs longitudinales */}
          <div className="grid-12 mb-3">
            <div className="col-3"><KPI
              label={t('longitudinal.totalR24')} value={series.visitas.length}
              icon="📅" iconColor=""
            /></div>
            <div className="col-3"><KPI
              label="Tasa de cumplimiento DDM"
              value={Helpers.pct(series.stats.ddmRate, 0)}
              icon="✓" iconColor={series.stats.ddmRate >= 70 ? 'green' : 'red'}
              help="Porcentaje de R24 en los que la persona cumplió DDM"
            /></div>
            <div className="col-3"><KPI
              label="Diversidad media"
              value={series.stats.divAvg + ' /10'}
              icon="🥗" iconColor="yellow"
              help={t('longitudinal.usualIntake_help')}
            /></div>
            <div className="col-3"><KPI
              label={t('longitudinal.variability')}
              value={series.stats.cvKcal + '%'}
              icon="📊" iconColor=""
              help={t('longitudinal.variability_help')}
            /></div>
          </div>

          {/* Tendencias */}
          <div className="grid-12 mb-3">
            <div className="col-6">
              <ChartCard title={t('longitudinal.trendDDM')} help="Evolución del cumplimiento de DDM y diversidad dietética">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={series.visitas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="fecha" style={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="diversidad" stroke="#002F87" strokeWidth={3}
                      name="Diversidad (0-10)" dot={{ r: 5, fill: '#F4B71A' }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div className="col-6">
              <ChartCard title={t('longitudinal.trendCalorias')} help="Evolución de la ingesta energética estimada por R24">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={series.visitas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="fecha" style={{ fontSize: 10 }} />
                    <YAxis style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="kcal" stroke="#002F87" strokeWidth={2}
                      fill="#002F87" fillOpacity={0.2} name="kcal" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* Timeline detallado */}
          <div className="card mb-3">
            <div className="h3 mb-2">📅 Línea de tiempo de R24</div>
            <table className="table">
              <thead>
                <tr>
                  <th>R24 #</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'center' }}>DDM</th>
                  <th style={{ textAlign: 'right' }}>Diversidad</th>
                  <th style={{ textAlign: 'right' }}>Alimentos</th>
                  <th style={{ textAlign: 'right' }}>kcal</th>
                  <th style={{ textAlign: 'right' }}>Prot.</th>
                  <th style={{ textAlign: 'right' }}>Grasa</th>
                  <th style={{ textAlign: 'right' }}>CH</th>
                </tr>
              </thead>
              <tbody>
                {series.visitas.map((v, i) => (
                  <tr key={v.n}>
                    <td><span className="badge badge-blue">#{v.n}</span></td>
                    <td>{v.fecha}{i === series.visitas.length - 1 && <span className="badge badge-yellow" style={{ marginLeft: 6 }}>último</span>}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${v.ddm ? 'badge-green' : 'badge-red'}`}>
                        {v.ddm ? '✓' : '✗'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{v.diversidad}/10</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{v.alimentos}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{Helpers.num(v.kcal)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{v.proteina}g</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{v.grasa}g</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{v.carbo}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comparador día 1 vs día 2 */}
          {series.visitas.length >= 2 && (
            <div className="card mb-3">
              <div className="h3 mb-2">⚖️ {t('longitudinal.compareDays')}</div>
              <p className="muted small mb-3">
                Estándar EFSA/USDA: con ≥2 R24 en días no consecutivos se aproxima la <strong>ingesta usual</strong>.
              </p>
              <div className="grid-12">
                {[
                  ['compareDay1', series.visitas[0]],
                  ['compareDay2', series.visitas[1]]
                ].map(([key, v], i) => (
                  <div key={i} className="col-6">
                    <div className="card-tight" style={{
                      background: i === 0 ? 'var(--unah-blue-50)' : 'var(--unah-yellow-100)',
                      border: `2px solid ${i === 0 ? 'var(--unah-blue-600)' : 'var(--unah-yellow-500)'}`,
                      borderRadius: 8, padding: 16
                    }}>
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>
                        {t(`longitudinal.${key}`)} · {v.fecha}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.85rem' }}>
                        <div>📊 Diversidad</div><div style={{ fontWeight: 700, textAlign: 'right' }}>{v.diversidad}/10</div>
                        <div>⚡ Energía</div><div style={{ fontWeight: 700, textAlign: 'right' }}>{Helpers.num(v.kcal)} kcal</div>
                        <div>🥩 Proteína</div><div style={{ fontWeight: 700, textAlign: 'right' }}>{v.proteina} g</div>
                        <div>🥑 Grasa</div><div style={{ fontWeight: 700, textAlign: 'right' }}>{v.grasa} g</div>
                        <div>🍞 Carbohidratos</div><div style={{ fontWeight: 700, textAlign: 'right' }}>{v.carbo} g</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Δ */}
              <div className="card-tight mt-3" style={{
                background: 'var(--gray-50)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('longitudinal.delta')}</div>
                <div className="flex gap-3" style={{ fontSize: '0.85rem', flexWrap: 'wrap' }}>
                  {(() => {
                    const a = series.visitas[0], b = series.visitas[1];
                    const dKcal = b.kcal - a.kcal;
                    const dDiv = b.diversidad - a.diversidad;
                    return (
                      <>
                        <span className="badge" style={{ fontSize: '0.78rem' }}>
                          ⚡ Δ kcal: <strong style={{ color: dKcal >= 0 ? 'var(--success-500)' : 'var(--unah-red-500)' }}>{dKcal >= 0 ? '+' : ''}{dKcal}</strong>
                        </span>
                        <span className="badge" style={{ fontSize: '0.78rem' }}>
                          🥗 Δ diversidad: <strong style={{ color: dDiv >= 0 ? 'var(--success-500)' : 'var(--unah-red-500)' }}>{dDiv >= 0 ? '+' : ''}{dDiv}</strong>
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '0.78rem' }}>
                          ✓ {t('longitudinal.usualIntake')}: ~{Math.round((a.kcal + b.kcal) / 2)} kcal
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Aviso sobre datos sintéticos */}
          <div className="card" style={{ background: 'var(--unah-yellow-100)', borderColor: 'var(--unah-yellow-500)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Aviso del prototipo</div>
            <div className="small">
              Las visitas mostradas son <strong>una serie sintética coherente</strong> derivada del registro real
              de la persona seleccionada (semilla determinista por ID). Esto permite demostrar la funcionalidad
              longitudinal sin contar todavía con múltiples R24 reales por persona. En producción este componente
              leerá los R24 efectivamente capturados.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.Longitudinal = Longitudinal;
