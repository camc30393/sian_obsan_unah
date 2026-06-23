/**
 * SIAN - Recetas hondureñas
 * Catálogo de preparaciones típicas con descomposición en ingredientes.
 *
 * Funcionalidades:
 *   - Vista en cards con porción y kcal por porción
 *   - Búsqueda por nombre o ingrediente
 *   - Vista detallada con lista de ingredientes y gramajes
 *   - Editor visual (mock en prototipo no funcional)
 *   - Importación masiva desde Excel (placeholder)
 */
const Recetas = () => {
  const t = (k) => I18n.t(k);
  const recetas = DataStore.get('recetas_hondurenas') || [];

  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  // Filtrar
  const filtered = React.useMemo(() => {
    if (!search.trim()) return recetas;
    const q = search.toLowerCase();
    return recetas.filter(r =>
      r.nombre.toLowerCase().includes(q) ||
      r.descripcion.toLowerCase().includes(q) ||
      r.ingredientes.some(i => i.alimento.toLowerCase().includes(q))
    );
  }, [recetas, search]);

  // Color de categoría según kcal (densidad calórica)
  const kcalColor = (kcal) => {
    if (kcal < 200) return 'var(--success-500)';
    if (kcal < 400) return 'var(--unah-blue-600)';
    if (kcal < 600) return 'var(--unah-yellow-700)';
    return 'var(--unah-red-500)';
  };

  // Emoji representativo por nombre (para visual rápido)
  const recetaIcon = (nombre) => {
    const n = nombre.toLowerCase();
    if (n.includes('baleada')) return '🫓';
    if (n.includes('sopa')) return '🍲';
    if (n.includes('café') || n.includes('atol') || n.includes('avena') || n.includes('pinol')) return '☕';
    if (n.includes('tamal') || n.includes('nacatamal') || n.includes('montucas')) return '🫔';
    if (n.includes('pollo')) return '🍗';
    if (n.includes('pescado')) return '🐟';
    if (n.includes('carne')) return '🥩';
    if (n.includes('frijol') || n.includes('anafres')) return '🫘';
    if (n.includes('tortilla') || n.includes('catracha') || n.includes('pupusa') || n.includes('enchilada')) return '🌮';
    if (n.includes('pan') || n.includes('quesadilla') || n.includes('rosquilla')) return '🥖';
    if (n.includes('yuca') || n.includes('chicharrón')) return '🥔';
    if (n.includes('pastelitos')) return '🥟';
    return '🍽️';
  };

  return (
    <div className="fade-in">
      {/* KPIs */}
      <div className="grid-12 mb-4">
        <div className="col-3"><KPI
          label="Recetas catalogadas" value={recetas.length}
          icon="🍲" iconColor="yellow"
        /></div>
        <div className="col-3"><KPI
          label="kcal promedio/porción"
          value={Math.round(recetas.reduce((s, r) => s + r.kcal, 0) / recetas.length)}
          icon="⚡" iconColor=""
        /></div>
        <div className="col-3"><KPI
          label="Porción promedio (g)"
          value={Math.round(recetas.reduce((s, r) => s + r.porcion_g, 0) / recetas.length)}
          icon="⚖️" iconColor="green"
        /></div>
        <div className="col-3"><KPI
          label="Total ingredientes únicos"
          value={new Set(recetas.flatMap(r => r.ingredientes.map(i => i.alimento))).size}
          icon="🥘" iconColor="red"
        /></div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div style={{ position: 'relative', flex: '0 0 320px' }}>
          <input className="input" placeholder={t('recetas.search')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }} />
          <span style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--gray-400)'
          }}>🔍</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm">📥 {t('recetas.import')}</button>
          <button className="btn btn-primary btn-sm">+ {t('recetas.addNew')}</button>
        </div>
      </div>

      {/* Grid de recetas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16
      }}>
        {filtered.map(r => (
          <div
            key={r.id}
            className="card-tight"
            onClick={() => setSelected(r)}
            style={{
              background: 'white', border: '1px solid var(--gray-200)',
              borderRadius: 12, padding: 16, cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', gap: 8
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div className="flex items-center justify-between">
              <div style={{ fontSize: '2.4rem', lineHeight: 1 }}>{recetaIcon(r.nombre)}</div>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>#{r.id}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--unah-blue-800)' }}>
              {r.nombre}
            </div>
            <div className="muted" style={{ fontSize: '0.78rem', minHeight: 36, lineHeight: 1.4 }}>
              {Helpers.truncate(r.descripcion, 80)}
            </div>
            <div style={{ height: 1, background: 'var(--gray-100)', margin: '4px 0' }} />
            <div className="flex justify-between items-center" style={{ fontSize: '0.78rem' }}>
              <div>
                <span className="muted">⚖️ </span>
                <strong>{r.porcion_g} g</strong>
              </div>
              <div>
                <span className="muted">⚡ </span>
                <strong style={{ color: kcalColor(r.kcal) }}>{r.kcal} kcal</strong>
              </div>
              <div>
                <span className="muted">🥘 </span>
                <strong>{r.ingredientes.length}</strong>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-12" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
            Sin resultados
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 24
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: 12, padding: 0,
            maxWidth: 760, width: '100%', maxHeight: '90vh', overflow: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }} className="fade-in">

            {/* Header del modal con gradiente */}
            <div style={{
              background: 'linear-gradient(135deg, var(--unah-blue-800) 0%, var(--unah-blue-600) 100%)',
              color: 'white', padding: '24px 28px',
              borderRadius: '12px 12px 0 0',
              position: 'relative'
            }}>
              <button onClick={() => setSelected(null)} style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer'
              }}>✕</button>

              <div style={{ fontSize: '3rem', marginBottom: 8 }}>{recetaIcon(selected.nombre)}</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Receta #{selected.id} · Hondureña tradicional
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 4 }}>{selected.nombre}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: 6 }}>{selected.descripcion}</div>
            </div>

            {/* Body */}
            <div style={{ padding: 28 }}>
              {/* Métricas rápidas */}
              <div className="grid-12 mb-4">
                <div className="col-4" style={{
                  background: 'var(--unah-blue-50)', borderRadius: 8, padding: 14, textAlign: 'center'
                }}>
                  <div className="muted small">{t('recetas.porcion')}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--unah-blue-800)' }}>
                    {selected.porcion_g} <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>g</span>
                  </div>
                </div>
                <div className="col-4" style={{
                  background: 'var(--unah-yellow-100)', borderRadius: 8, padding: 14, textAlign: 'center'
                }}>
                  <div className="muted small">{t('recetas.kcal')}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--unah-yellow-700)' }}>
                    {selected.kcal} <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>kcal</span>
                  </div>
                </div>
                <div className="col-4" style={{
                  background: 'var(--success-100)', borderRadius: 8, padding: 14, textAlign: 'center'
                }}>
                  <div className="muted small">{t('recetas.totalIngredients')}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success-500)' }}>
                    {selected.ingredientes.length}
                  </div>
                </div>
              </div>

              {/* Ingredientes */}
              <div className="h3 mb-2">🥘 {t('recetas.ingredients')}</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Alimento</th>
                    <th style={{ textAlign: 'right' }}>Gramos</th>
                    <th style={{ textAlign: 'right' }}>% del total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.ingredientes.map((ing, i) => {
                    const pct = (ing.gramos / selected.porcion_g) * 100;
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{ing.alimento}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{ing.gramos} g</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{
                            background: 'var(--gray-100)', borderRadius: 4,
                            height: 6, position: 'relative', overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute', left: 0, top: 0, bottom: 0,
                              width: pct + '%', background: 'var(--unah-blue-600)'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', marginTop: 2 }}>{pct.toFixed(1)}%</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="card mt-3" style={{ background: 'var(--unah-blue-50)', borderColor: 'var(--unah-blue-100)' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>💡 {t('recetas.estimateNutrition')}</div>
                <div className="small muted">
                  En el sistema en producción, los gramajes de los ingredientes se cruzan con el catálogo INCAP
                  para calcular automáticamente la composición nutricional total de la receta (energía,
                  macronutrientes y micronutrientes), aplicando factores de rendimiento por método de
                  preparación (FAO/INFOODS).
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 justify-between mt-3">
                <button className="btn btn-secondary btn-sm">📋 Duplicar</button>
                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm">✏️ {t('recetas.edit')}</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(null)}>
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.Recetas = Recetas;
