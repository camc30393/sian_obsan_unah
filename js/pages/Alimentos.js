/**
 * SIDH - Alimentos (Catálogo INCAP)
 * Buscador inteligente sobre 2,469 alimentos del catálogo INCAP con
 * composición nutricional completa (38+ nutrientes por 100g).
 *
 * Funcionalidades:
 *   - Búsqueda por nombre, código INCAP o grupo
 *   - Filtros por grupo INCAP (26) y grupo C24/FAO-DDM (10)
 *   - Vista detalle con composición completa
 *   - Comparador hasta 3 alimentos lado a lado
 *   - Indicador de alimentos "No Definido" en grupo C24 (mejora del catálogo)
 */
const Alimentos = () => {
  const t = (k) => I18n.t(k);
  const allAlimentos = DataStore.get('alimentos_incap') || [];

  const [search, setSearch] = React.useState('');
  const [grupoIncap, setGrupoIncap] = React.useState('');
  const [grupoC24, setGrupoC24] = React.useState('');
  const [selected, setSelected] = React.useState(null);  // alimento detallado
  const [compare, setCompare] = React.useState([]);      // alimentos a comparar (max 3)
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 20;

  // Listas de grupos únicos para filtros
  const gruposIncap = React.useMemo(() => {
    return [...new Set(allAlimentos.map(a => a.grupo_incap))].filter(Boolean).sort();
  }, [allAlimentos]);

  const gruposC24 = React.useMemo(() => {
    return [...new Set(allAlimentos.map(a => a.grupo_c24))].filter(Boolean).sort();
  }, [allAlimentos]);

  // Resultados filtrados
  const filtered = React.useMemo(() => {
    let r = allAlimentos;
    if (grupoIncap) r = r.filter(a => a.grupo_incap === grupoIncap);
    if (grupoC24)   r = r.filter(a => a.grupo_c24 === grupoC24);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(a =>
        (a.alimento || '').toLowerCase().includes(q) ||
        String(a.codigo).includes(q) ||
        (a.grupo_incap || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [allAlimentos, search, grupoIncap, grupoC24]);

  React.useEffect(() => { setPage(1); }, [search, grupoIncap, grupoC24]);

  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const noDefinidoCount = allAlimentos.filter(a => a.grupo_c24 === '11. No Definido').length;

  // Toggle compare (max 3)
  const toggleCompare = (item) => {
    if (compare.find(c => c.id === item.id)) {
      setCompare(compare.filter(c => c.id !== item.id));
    } else if (compare.length < 3) {
      setCompare([...compare, item]);
    }
  };

  return (
    <div className="fade-in">
      {/* Estadísticas y alerta de mejora */}
      <div className="grid-12 mb-4">
        <div className="col-3"><KPI
          label="Alimentos catalogados" value={Helpers.num(allAlimentos.length)}
          icon="🍎" iconColor=""
        /></div>
        <div className="col-3"><KPI
          label="Grupos INCAP" value={gruposIncap.length}
          icon="📂" iconColor="yellow"
          help="Clasificación interna del INCAP por familia de alimentos"
        /></div>
        <div className="col-3"><KPI
          label="Grupos C24/FAO-DDM" value="10"
          icon="🥗" iconColor="green"
          help="Los 10 grupos para el cálculo de Diversidad Dietética Mínima (FAO)"
        /></div>
        <div className="col-3"><KPI
          label="Sin grupo C24 asignado" value={noDefinidoCount}
          icon="⚠️" iconColor="red"
          help="Alimentos en grupo 'No Definido' del C24 - oportunidad de mejora del catálogo"
        /></div>
      </div>

      {/* Toolbar de búsqueda y filtros */}
      <div className="card mb-3">
        <div className="form-grid">
          <FormField label={t('common.search')} span={6}>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                placeholder={t('alimentos.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32 }}
              />
              <span style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--gray-400)'
              }}>🔍</span>
            </div>
          </FormField>
          <FormField label={t('alimentos.filter_grupo')} span={3}>
            <select className="select" value={grupoIncap} onChange={(e) => setGrupoIncap(e.target.value)}>
              <option value="">— {t('common.all')} —</option>
              {gruposIncap.map(g => <option key={g}>{g}</option>)}
            </select>
          </FormField>
          <FormField label={t('alimentos.filter_grupo_c24')} span={3}>
            <select className="select" value={grupoC24} onChange={(e) => setGrupoC24(e.target.value)}>
              <option value="">— {t('common.all')} —</option>
              {gruposC24.map(g => <option key={g}>{g}</option>)}
            </select>
          </FormField>
        </div>
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="muted small">
            {t('common.showing')} <strong>{Helpers.num(filtered.length)}</strong> {t('common.results')}
            {filtered.length !== allAlimentos.length && (
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}
                onClick={() => { setSearch(''); setGrupoIncap(''); setGrupoC24(''); }}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>
          <button className="btn btn-primary btn-sm"
            onClick={() => alert('(Prototipo) Agregar nuevo alimento al catálogo.\n\nEn producción, abre formulario con los 38+ campos nutricionales: código INCAP, nombre, grupos, energía, macros y micros. Requiere rol administrador.')}
          >+ Nuevo alimento</button>
        </div>
      </div>

      {/* Comparador activo */}
      {compare.length > 0 && (
        <div className="card mb-3" style={{ background: 'var(--unah-yellow-100)', borderColor: 'var(--unah-yellow-500)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="h3" style={{ margin: 0 }}>
              ⚖️ {t('alimentos.compareSelected')} ({compare.length}/3)
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setCompare([])}>
                {t('alimentos.clearCompare')}
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ background: 'white' }}>
              <thead>
                <tr>
                  <th>{t('alimentos.per100g')}</th>
                  {compare.map(c => (
                    <th key={c.id} style={{ minWidth: 120 }}>
                      {Helpers.truncate(c.alimento, 25)}
                      <button onClick={() => toggleCompare(c)}
                        style={{ marginLeft: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--unah-red-500)' }}>✕</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Energía (kcal)', 'energia_kcal'],
                  ['Proteína (g)', 'proteina_g'],
                  ['Grasa (g)', 'grasa_g'],
                  ['Carbohidratos (g)', 'carbohidratos_g'],
                  ['Fibra (g)', 'fibra_g'],
                  ['Calcio (mg)', 'calcio_mg'],
                  ['Hierro (mg)', 'hierro_mg'],
                  ['Vit. A (mcg)', 'vit_a_mcg'],
                  ['Vit. C (mg)', 'vit_c_mg'],
                ].map(([label, key]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 600 }}>{label}</td>
                    {compare.map(c => (
                      <td key={c.id} style={{ fontFamily: 'monospace' }}>
                        {(c[key] || 0).toFixed(1)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lista de alimentos */}
      <div className="card-tight" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Cód.</th>
              <th>Alimento</th>
              <th>Grupo INCAP</th>
              <th>Grupo C24</th>
              <th style={{ textAlign: 'right' }}>kcal</th>
              <th style={{ textAlign: 'right' }}>Prot.</th>
              <th style={{ textAlign: 'right' }}>Grasa</th>
              <th style={{ textAlign: 'right' }}>CH</th>
              <th style={{ width: 140 }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map(a => {
              const isComparing = compare.find(c => c.id === a.id);
              const isNoDef = a.grupo_c24 === '11. No Definido';
              return (
                <tr key={a.id} style={{ background: isComparing ? 'var(--unah-yellow-100)' : undefined }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{a.codigo}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{Helpers.truncate(a.alimento, 60)}</div>
                  </td>
                  <td><span className="badge" style={{ fontSize: '0.7rem' }}>{Helpers.truncate(a.grupo_incap, 28)}</span></td>
                  <td>
                    {isNoDef
                      ? <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>⚠ Sin grupo</span>
                      : <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{Helpers.truncate(a.grupo_c24, 28)}</span>}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {(a.energia_kcal || 0).toFixed(0)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {(a.proteina_g || 0).toFixed(1)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {(a.grasa_g || 0).toFixed(1)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {(a.carbohidratos_g || 0).toFixed(1)}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(a)} title="Ver detalle">👁️</button>
                    <button
                      className={`btn btn-sm ${isComparing ? 'btn-yellow' : 'btn-ghost'}`}
                      onClick={() => toggleCompare(a)}
                      disabled={!isComparing && compare.length >= 3}
                      title={t('alimentos.compare')}
                    >⚖️</button>
                    <button className="btn btn-ghost btn-sm" title="Editar"
                      onClick={() => alert(`(Prototipo) Editar alimento: ${a.alimento}\n\nEn producción, abre formulario de edición de los 38+ campos nutricionales con validaciones contra el catálogo INCAP.`)}
                    >✏️</button>
                    <button className="btn btn-ghost btn-sm" title="Eliminar"
                      style={{ color: 'var(--unah-red-500)' }}
                      onClick={() => {
                        if (confirm(`¿Eliminar "${a.alimento}" del catálogo?\n\n(Prototipo) Esta acción quedaría registrada en auditoría.`)) {
                          alert('Alimento eliminado.');
                        }
                      }}
                    >❌</button>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
                Sin resultados
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3" style={{ fontSize: '0.85rem' }}>
          <div className="muted">
            {t('common.page')} <strong>{page}</strong> {t('common.of')} <strong>{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}>← {t('common.previous')}</button>
            <button className="btn btn-secondary btn-sm" disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}>{t('common.next')} →</button>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 24
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: 12, padding: 28,
            maxWidth: 720, width: '100%', maxHeight: '90vh', overflow: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }} className="fade-in">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="muted small" style={{ fontFamily: 'monospace' }}>
                  Código INCAP: {selected.codigo}
                </div>
                <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
                  {selected.alimento}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{selected.grupo_incap}</span>
              {selected.grupo_c24 === '11. No Definido'
                ? <span className="badge badge-red">⚠ {selected.grupo_c24}</span>
                : <span className="badge badge-yellow">{selected.grupo_c24}</span>}
            </div>

            <div className="muted small mb-3">{t('alimentos.per100g')}</div>

            {/* Macros */}
            <div className="h3 mt-3 mb-2">{t('alimentos.macros')}</div>
            <div className="grid-12">
              {[
                { label: '⚡ Energía', val: selected.energia_kcal, unit: 'kcal' },
                { label: '🥩 Proteína', val: selected.proteina_g, unit: 'g' },
                { label: '🥑 Grasa total', val: selected.grasa_g, unit: 'g' },
                { label: '🍞 Carbohidratos', val: selected.carbohidratos_g, unit: 'g' },
                { label: '🌾 Fibra dietética', val: selected.fibra_g, unit: 'g' },
              ].map((m, i) => (
                <div key={i} className="col-3" style={{
                  background: 'var(--gray-50)', borderRadius: 8, padding: 12, textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>{m.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--unah-blue-800)' }}>
                    {(m.val || 0).toFixed(1)}<span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--gray-500)' }}> {m.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Micros */}
            <div className="h3 mt-3 mb-2">{t('alimentos.micros')}</div>
            <table className="table">
              <tbody>
                {[
                  ['Calcio', 'calcio_mg', 'mg'],
                  ['Hierro', 'hierro_mg', 'mg'],
                  ['Zinc', 'zinc_mg', 'mg'],
                  ['Sodio', 'sodio_mg', 'mg'],
                  ['Vitamina A (equiv. retinol)', 'vit_a_mcg', 'mcg'],
                  ['Vitamina C', 'vit_c_mg', 'mg'],
                  ['Folato (FDE)', 'folato_mcg', 'mcg'],
                  ['Vitamina B12', 'vit_b12_mcg', 'mcg'],
                ].map(([label, key, unit]) => (
                  <tr key={key}>
                    <td>{label}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      {(selected[key] || 0).toFixed(2)} {unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-2 mt-3">
              <button
                className={`btn btn-sm ${compare.find(c => c.id === selected.id) ? 'btn-yellow' : 'btn-secondary'}`}
                onClick={() => toggleCompare(selected)}
                disabled={!compare.find(c => c.id === selected.id) && compare.length >= 3}
              >
                ⚖️ {compare.find(c => c.id === selected.id) ? 'Quitar de comparación' : t('alimentos.compare')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setSelected(null)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.Alimentos = Alimentos;
