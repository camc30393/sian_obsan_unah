/**
 * SIAN - Catalogos
 * Vista de administración de catálogos del sistema. Cada tarjeta muestra
 * el catálogo, número de registros y acciones disponibles (ver, agregar,
 * importar, exportar). Las acciones reales abren los módulos correspondientes
 * o muestran avisos en el prototipo.
 */
const Catalogos = () => {
  const t = (k) => I18n.t(k);

  // Conteos reales desde el DataStore
  const counts = {
    alimentos: (DataStore.get('alimentos_incap') || []).length,
    porciones: (DataStore.get('porciones') || []).length,
    grupos: (DataStore.get('grupos_alimentos') || []).length,
    tiempos: (DataStore.get('tiempos_comida') || []).length,
    geografia: (DataStore.get('geografia_honduras') || []).length,
    recetas: (DataStore.get('recetas_hondurenas') || []).length,
    centros: 0  // placeholder
  };

  const catalogos = [
    {
      id: 'alimentos', icon: '🍎', color: 'var(--unah-blue-800)',
      title: t('catalogos.alimentos'), desc: t('catalogos.alimentos_desc'),
      count: counts.alimentos, route: 'alimentos',
      lastUpdated: '2025-09-15 · INCAP'
    },
    {
      id: 'recetas', icon: '🍲', color: '#F4B71A',
      title: t('catalogos.recetas'), desc: t('catalogos.recetas_desc'),
      count: counts.recetas, route: 'recetas',
      lastUpdated: '2026-04-15 · OBSAN'
    },
    {
      id: 'porciones', icon: '🥄', color: '#0050B3',
      title: t('catalogos.porciones'), desc: t('catalogos.porciones_desc'),
      count: counts.porciones,
      lastUpdated: '2025-08-01 · INCAP'
    },
    {
      id: 'grupos', icon: '🥗', color: '#10B981',
      title: t('catalogos.grupos'), desc: t('catalogos.grupos_desc'),
      count: counts.grupos,
      lastUpdated: 'FAO 2021 (referencia)'
    },
    {
      id: 'tiempos', icon: '🕐', color: '#5C95DC',
      title: t('catalogos.tiempos'), desc: t('catalogos.tiempos_desc'),
      count: counts.tiempos,
      lastUpdated: 'Estable'
    },
    {
      id: 'geografia', icon: '🗺️', color: '#C8102E',
      title: t('catalogos.geografia'), desc: t('catalogos.geografia_desc'),
      count: counts.geografia + ' deptos',
      lastUpdated: '2024 · INE Honduras'
    },
    {
      id: 'centros', icon: '🏥', color: '#9E0E27',
      title: t('catalogos.centros'), desc: t('catalogos.centros_desc'),
      count: '~120 (estimado)',
      lastUpdated: '2026-01-10 · UNAH'
    }
  ];

  const handleAction = (action, cat) => {
    if (action === 'view' && cat.route) {
      Router.navigate(cat.route);
    } else {
      alert(`(Prototipo) Acción "${action}" sobre ${cat.title}\n\nEn producción, esto abriría el módulo correspondiente para administrar el catálogo.`);
    }
  };

  return (
    <div className="fade-in">
      {/* Galería de catálogos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16
      }}>
        {catalogos.map(cat => (
          <div key={cat.id} className="card-tight" style={{
            background: 'white', border: '1px solid var(--gray-200)',
            borderRadius: 12, padding: 0, overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              borderLeft: `4px solid ${cat.color}`,
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{
                fontSize: '2rem', width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: cat.color + '20', borderRadius: 10
              }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--unah-blue-800)' }}>
                  {cat.title}
                </div>
                <div className="muted small">
                  <strong>{cat.count}</strong> {typeof cat.count === 'number' && t('catalogos.items')}
                </div>
              </div>
            </div>

            <div style={{ padding: '0 18px 16px', fontSize: '0.85rem' }}>
              <div className="muted small" style={{ minHeight: 36, lineHeight: 1.5 }}>
                {cat.desc}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: 8 }}>
                <strong>{t('catalogos.lastUpdated')}:</strong> {cat.lastUpdated}
              </div>
              <div className="flex gap-1 mt-3" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAction('view', cat)}>
                  👁️ {t('catalogos.actions_view')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAction('add', cat)}>
                  ➕ {t('catalogos.actions_add')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAction('import', cat)}>
                  📥 {t('catalogos.actions_import')}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAction('export', cat)}>
                  📤 {t('catalogos.actions_export')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aviso */}
      <div className="card mt-4" style={{ background: 'var(--unah-yellow-100)', borderColor: 'var(--unah-yellow-500)' }}>
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '1.5rem' }}>🔐</div>
          <div className="small">
            <strong>Solo administradores.</strong> Las modificaciones a estos catálogos afectan
            a todos los usuarios y proyectos. Los cambios quedan registrados en el módulo de
            Auditoría con marca de tiempo, usuario e IP.
          </div>
        </div>
      </div>
    </div>
  );
};

window.Catalogos = Catalogos;
