/**
 * SIAN - Cohortes (Proyectos)
 * Gestión de proyectos/cohortes paralelos. Permite cambiar entre cohortes
 * activas y crear nuevas. Cada cohorte tiene su propia muestra y reportes.
 */
const Cohortes = () => {
  const t = (k) => I18n.t(k);

  // Cohortes ficticias coherentes con el contexto del proyecto
  const cohortes = [
    {
      id: 'C24', codigo: 'C24', nombre: 'Cohorte 24 (estudio prototipo)',
      periodo: '2024-2025', muestraTarget: 4500, muestraActual: 4573,
      responsable: 'Patricia Ochoa', estado: 'closed', activa: false,
      descripcion: 'Estudio prototipo OBSAN sobre alimentación y NSE en adultos hondureños 19-59 años.'
    },
    {
      id: 'SIAN-2026', codigo: 'SIAN-26', nombre: 'SIAN 2026 - Curso de vida completo',
      periodo: '2026-2027', muestraTarget: 8000, muestraActual: 350,
      responsable: 'Christian Manzanares', estado: 'active', activa: true,
      descripcion: 'Primer levantamiento del SIAN con cobertura de todas las etapas del curso de vida (lactantes a adultos mayores).'
    },
    {
      id: 'EMB-2026', codigo: 'EMB-26', nombre: 'Embarazadas y lactantes 2026',
      periodo: '2026-2027', muestraTarget: 800, muestraActual: 0,
      responsable: 'Elizabeth León', estado: 'planning', activa: false,
      descripcion: 'Estudio focalizado en mujeres embarazadas y en período de lactancia con seguimiento longitudinal.'
    },
    {
      id: 'AM-2026', codigo: 'AM-26', nombre: 'Adultos mayores en zonas rurales',
      periodo: '2025-2026', muestraTarget: 600, muestraActual: 580,
      responsable: 'María Luisa García', estado: 'analysis', activa: false,
      descripcion: 'Levantamiento finalizado, fase de análisis. Énfasis en sarcopenia y MNA en adultos 60+ rurales.'
    }
  ];

  const estadoBadge = (estado) => {
    const map = {
      planning: { cls: 'badge-blue', label: t('cohortes.estados.planning') },
      active: { cls: 'badge-green', label: t('cohortes.estados.active') },
      closed: { cls: '', label: t('cohortes.estados.closed') },
      analysis: { cls: 'badge-yellow', label: t('cohortes.estados.analysis') }
    };
    const m = map[estado] || map.planning;
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
  };

  const handleSwitch = (c) => {
    if (c.estado === 'closed') {
      alert('(Prototipo) Esta cohorte está cerrada. Solo se puede consultar, no modificar.');
    } else {
      alert(`(Prototipo) Cambiando a cohorte: ${c.nombre}\n\nA partir de este momento, todas las pantallas del SIAN mostrarán únicamente los datos de esta cohorte. La selección queda registrada en auditoría.`);
    }
  };

  return (
    <div className="fade-in">
      {/* Cohorte activa destacada */}
      {(() => {
        const activa = cohortes.find(c => c.activa);
        if (!activa) return null;
        const pct = (activa.muestraActual / activa.muestraTarget) * 100;
        return (
          <div className="card mb-3" style={{
            background: 'linear-gradient(135deg, var(--unah-blue-800) 0%, var(--unah-blue-600) 100%)',
            color: 'white', borderColor: 'transparent'
          }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⭐ {t('cohortes.active')} · {t('cohortes.current')}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{activa.nombre}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  {activa.codigo} · {activa.periodo} · {activa.responsable}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Muestra recolectada</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                  {Helpers.num(activa.muestraActual)} / {Helpers.num(activa.muestraTarget)}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{pct.toFixed(1)}% completado</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 4, overflow: 'hidden'
            }}>
              <div style={{
                width: pct + '%', height: '100%',
                background: 'var(--unah-yellow-500)',
                transition: 'width 0.5s'
              }} />
            </div>
          </div>
        );
      })()}

      {/* Lista de cohortes */}
      <div className="flex justify-between items-center mb-3">
        <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
          📁 Todas las cohortes ({cohortes.length})
        </div>
        <button className="btn btn-primary">+ {t('cohortes.addNew')}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cohortes.map(c => {
          const pct = c.muestraTarget > 0 ? (c.muestraActual / c.muestraTarget) * 100 : 0;
          return (
            <div key={c.id} className="card-tight" style={{
              background: 'white',
              border: c.activa ? '2px solid var(--unah-yellow-500)' : '1px solid var(--gray-200)',
              borderRadius: 12, padding: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 220px 180px',
              gap: 16, alignItems: 'center'
            }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-blue">{c.codigo}</span>
                  {estadoBadge(c.estado)}
                  {c.activa && <span className="badge badge-yellow">⭐ Activa</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--unah-blue-800)' }}>
                  {c.nombre}
                </div>
                <div className="muted small mt-2" style={{ lineHeight: 1.5 }}>
                  {c.descripcion}
                </div>
                <div className="muted small mt-2">
                  📅 {c.periodo} · 👤 {c.responsable}
                </div>
              </div>

              <div>
                <div className="muted small">{t('cohortes.muestraActual')}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--unah-blue-800)' }}>
                  {Helpers.num(c.muestraActual)} / {Helpers.num(c.muestraTarget)}
                </div>
                <div style={{
                  background: 'var(--gray-200)', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6
                }}>
                  <div style={{
                    width: Math.min(100, pct) + '%', height: '100%',
                    background: pct >= 100 ? 'var(--success-500)' : pct >= 50 ? 'var(--unah-blue-600)' : 'var(--unah-yellow-500)'
                  }} />
                </div>
                <div className="muted small mt-2">{pct.toFixed(1)}%</div>
              </div>

              <div className="flex" style={{ flexDirection: 'column', gap: 6 }}>
                {!c.activa && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleSwitch(c)}>
                    {t('cohortes.switchTo')}
                  </button>
                )}
                {c.activa && (
                  <button className="btn btn-ghost btn-sm" disabled>
                    ⭐ {t('cohortes.current')}
                  </button>
                )}
                <button className="btn btn-secondary btn-sm">⚙️ Configurar</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-3" style={{ background: 'var(--unah-blue-50)', borderColor: 'var(--unah-blue-100)' }}>
        <div className="h3" style={{ color: 'var(--unah-blue-800)' }}>
          💡 ¿Para qué sirven las cohortes?
        </div>
        <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: 22, color: 'var(--gray-700)', lineHeight: 1.7 }}>
          <li>Permiten ejecutar varios estudios paralelos sin mezclar datos.</li>
          <li>Cada cohorte tiene su propia muestra objetivo, variables específicas y reportes.</li>
          <li>Los permisos pueden definirse por cohorte (un investigador ve solo los proyectos a los que pertenece).</li>
          <li>Las plantillas de cohorte facilitan replicar metodologías para nuevos estudios.</li>
        </ul>
      </div>
    </div>
  );
};

window.Cohortes = Cohortes;
