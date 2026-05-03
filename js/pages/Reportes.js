/**
 * SIDH - Reportes
 * Galería de reportes pre-armados para distintas audiencias.
 * Cada reporte es una "tarjeta" con descripción, parámetros y formatos.
 *
 * En el prototipo no funcional, "Generar" muestra una alerta describiendo
 * lo que el sistema produciría en producción.
 */
const Reportes = () => {
  const t = (k) => I18n.t(k);

  const reportes = [
    {
      id: 'academic',
      icon: '🎓',
      color: 'var(--unah-blue-800)',
      title: t('reportes.academic'),
      desc: t('reportes.academic_desc'),
      formatos: ['PDF', 'Word', 'LaTeX'],
      contenido: 'N=5,523 · 18 deptos · DDM ± IC95% · Análisis multivariado · Tablas APA · Referencias INCAP/FAO/USDA'
    },
    {
      id: 'institutional',
      icon: '🏛️',
      color: '#0050B3',
      title: t('reportes.institutional'),
      desc: t('reportes.institutional_desc'),
      formatos: ['PDF', 'Word', 'PowerPoint'],
      contenido: 'Resumen ejecutivo · Hallazgos clave · Mapa Honduras · Comparativa SESAL · 8-10 páginas'
    },
    {
      id: 'executive',
      icon: '📊',
      color: '#F4B71A',
      title: t('reportes.executive'),
      desc: t('reportes.executive_desc'),
      formatos: ['PDF', 'PowerPoint'],
      contenido: '1 página · 6 KPIs · Semáforos por depto · Mensajes accionables'
    },
    {
      id: 'student',
      icon: '👤',
      color: '#10B981',
      title: t('reportes.student'),
      desc: t('reportes.student_desc'),
      formatos: ['PDF'],
      contenido: 'Datos del estudiante · Muestra recolectada · Calidad del dato · Reflexión final'
    },
    {
      id: 'departmental',
      icon: '📍',
      color: '#C8102E',
      title: t('reportes.departmental'),
      desc: t('reportes.departmental_desc'),
      formatos: ['PDF', 'Word'],
      contenido: 'Específico de un departamento · Mapa municipal · Comparativa nacional'
    },
    {
      id: 'longitudinalRep',
      icon: '📈',
      color: '#5C95DC',
      title: t('reportes.longitudinalRep'),
      desc: t('reportes.longitudinalRep_desc'),
      formatos: ['PDF'],
      contenido: 'Por persona · Timeline R24 · Tendencias · Comparación día 1 vs día 2'
    }
  ];

  const handleGenerate = (rep) => {
    alert(`(Prototipo) Generando reporte: ${rep.title}\n\nContenido: ${rep.contenido}\n\nFormatos disponibles: ${rep.formatos.join(', ')}\n\nEn producción, este botón generará el reporte y lo descargará en el formato seleccionado, aplicando los filtros configurados.`);
  };

  return (
    <div className="fade-in">
      {/* Galería de reportes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16
      }} className="mb-4">
        {reportes.map(rep => (
          <div key={rep.id} className="card-tight" style={{
            background: 'white', border: '1px solid var(--gray-200)',
            borderRadius: 12, padding: 0, overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              background: rep.color, color: 'white',
              padding: '16px 18px', position: 'relative'
            }}>
              <div style={{ fontSize: '2rem' }}>{rep.icon}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 4 }}>
                {rep.title}
              </div>
            </div>
            <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="muted small" style={{ minHeight: 80, lineHeight: 1.5 }}>
                {rep.desc}
              </div>
              <div style={{
                fontSize: '0.72rem', color: 'var(--gray-500)',
                background: 'var(--gray-50)', padding: 8, borderRadius: 6,
                marginTop: 10, marginBottom: 12, lineHeight: 1.5
              }}>
                <strong>Incluye:</strong> {rep.contenido}
              </div>
              <div className="flex gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
                {rep.formatos.map(f => (
                  <span key={f} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{f}</span>
                ))}
              </div>
              <div className="flex gap-2" style={{ marginTop: 'auto' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>👁️ Vista previa</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                  onClick={() => handleGenerate(rep)}>📄 Generar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de programación */}
      <div className="card" style={{ background: 'var(--unah-blue-50)', borderColor: 'var(--unah-blue-100)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="h3" style={{ color: 'var(--unah-blue-800)' }}>
              ⏰ {t('reportes.schedule')}
            </div>
            <div className="muted small mt-2" style={{ maxWidth: 600 }}>
              {t('reportes.schedule_desc')}
            </div>
          </div>
          <button className="btn btn-primary">+ Nueva programación</button>
        </div>
      </div>
    </div>
  );
};

window.Reportes = Reportes;
