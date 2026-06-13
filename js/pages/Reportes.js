/**
 * SIAN - Reportes
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
      <AdecuacionPoblacional />
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


// ====================================================================
// Resumen poblacional de adecuacion de nutrientes por etapa de vida
// PRELIMINAR: 1 R24/persona; no es prevalencia de ingesta usual.
// Marco: docs/marco-teorico-evaluacion-adecuacion-nutricional.md
// ====================================================================
const PSEM = { verde:'#1f9d55', ambar:'#d9930a', rojo:'#c8102e' };
const PBG  = { verde:'#e7f6ec', ambar:'#fdf3e0', rojo:'#fde8eb' };
const ETAPAS_POB = ['lactante','preescolar','escolar','adolescente','adulto','adulto_mayor','embarazo','lactancia'];

const AdecuacionPoblacional = () => {
  const [estandar, setEstandar] = React.useState('iom');
  const [etapaSel, setEtapaSel] = React.useState('adulto');

  // Agrupar recordatorios por persona (una sola vez)
  const grupos = React.useMemo(() => {
    const encs = DataStore.get('encuestados') || [];
    const recs = DataStore.get('recordatorios') || [];
    const encById = {}; encs.forEach(e => { encById[e.id_estudiante_entrevistado] = e; });
    const byPersona = {};
    recs.forEach(r => {
      const k = r.id_estudiante_entrevistado;
      (byPersona[k] = byPersona[k] || []).push(r);
    });
    const out = [];
    Object.keys(byPersona).forEach(k => {
      const e = encById[k]; if (!e) return;
      out.push({ encuestado: e, records: byPersona[k] });
    });
    return out;
  }, []);

  const gruposEtapa = React.useMemo(
    () => grupos.filter(g => Nutricion.mapEtapa(g.encuestado) === etapaSel),
    [grupos, etapaSel]
  );
  const resumen = React.useMemo(
    () => Nutricion.resumenPoblacional(gruposEtapa, { estandar }),
    [gruposEtapa, estandar]
  );

  const filas = Object.keys(resumen.acc).map(n => {
    const a = resumen.acc[n], pctOk = a.n ? Math.round(a.verde / a.n * 100) : 0;
    return { nutriente:n, ...a, pctOk };
  });

  return (
    <div className="card" style={{ marginBottom: 20, border:'2px solid var(--unah-blue-800)' }}>
      <div className="flex items-center justify-between" style={{ flexWrap:'wrap', gap:8 }}>
        <div className="h3" style={{ margin:0 }}>🗺️ Adecuacion poblacional por etapa de vida</div>
        <div className="flex gap-1">
          {[['iom','IOM'],['fao_oms','FAO/OMS'],['incap','INCAP']].map(([id,l]) => (
            <button key={id} onClick={() => setEstandar(id)}
              style={{ padding:'4px 10px', borderRadius:8, fontSize:'.8rem', fontWeight:600,
                border:`1.5px solid ${estandar===id?'var(--unah-blue-800)':'#cbd5e1'}`,
                background: estandar===id?'#eef3fb':'white',
                color: estandar===id?'var(--unah-blue-800)':'#475569', cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-1" style={{ flexWrap:'wrap', margin:'10px 0' }}>
        {ETAPAS_POB.map(e => (
          <button key={e} onClick={() => setEtapaSel(e)}
            style={{ padding:'3px 9px', borderRadius:20, fontSize:'.76rem', fontWeight:600,
              border:`1px solid ${etapaSel===e?'var(--unah-blue-800)':'#cbd5e1'}`,
              background: etapaSel===e?'var(--unah-blue-800)':'white',
              color: etapaSel===e?'white':'#475569', cursor:'pointer' }}>{e}</button>
        ))}
      </div>

      <div style={{ background:'#fff8e6', border:'1px solid #f0d48a', borderRadius:8,
        padding:'8px 12px', marginBottom:10, fontSize:'.8rem', color:'#7a5b12' }}>
        ⚠️ <strong>Estimacion preliminar</strong> — basada en 1 R24 por persona. La prevalencia
        valida de inadecuacion requiere ingesta usual (≥2 R24) y metodo del punto de corte de la EAR.
        Personas evaluadas en esta etapa: <strong>{resumen.evaluados}</strong>
        {resumen.excluidos ? ` · excluidas: ${resumen.excluidos}` : ''}.
      </div>

      {filas.length === 0 ? (
        <div style={{ background:'#eef2f7', borderRadius:8, padding:12, fontSize:'.85rem', color:'#475569' }}>
          {estandar==='incap'
            ? 'INCAP pendiente de verificacion documental. Use IOM o FAO/OMS.'
            : 'Sin personas con recordatorios en esta etapa (las etapas no-adultas pueden no tener registros reales en el prototipo).'}
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.85rem' }}>
            <thead>
              <tr style={{ textAlign:'left', color:'#475569', borderBottom:'2px solid #e2e8f0' }}>
                <th style={{ padding:'6px 8px' }}>Nutriente</th>
                <th style={{ padding:'6px 8px' }}>% cubre</th>
                <th style={{ padding:'6px 8px', width:'45%' }}>Distribucion</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f,i) => (
                <tr key={i} style={{ borderBottom:'1px solid #eef2f7' }}>
                  <td style={{ padding:'6px 8px', fontWeight:600 }}>
                    {f.nutriente}{f.tipo==='limite' && <span style={{ color:'#c8102e', fontSize:'.72rem' }}> (limite)</span>}
                  </td>
                  <td style={{ padding:'6px 8px', fontWeight:700,
                    color: f.pctOk>=70?PSEM.verde:(f.pctOk>=40?PSEM.ambar:PSEM.rojo) }}>{f.pctOk}%</td>
                  <td style={{ padding:'6px 8px' }}>
                    <div style={{ display:'flex', height:14, borderRadius:7, overflow:'hidden', border:'1px solid #e2e8f0' }}>
                      {['verde','ambar','rojo'].map(k => f[k] ? (
                        <div key={k} title={`${k}: ${f[k]}`}
                          style={{ width:`${f[k]/f.n*100}%`, background:PSEM[k] }} />
                      ) : null)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

window.Reportes = Reportes;
