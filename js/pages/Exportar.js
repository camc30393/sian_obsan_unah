/**
 * SIDH - Exportar
 * Configurador de exportación de datos para análisis externo.
 * Permite seleccionar dataset, formato, filtros y opciones (anonimización,
 * incluir diccionario de variables).
 */
const Exportar = () => {
  const t = (k) => I18n.t(k);

  const [dataset, setDataset] = React.useState('encuestados');
  const [formato, setFormato] = React.useState('xlsx');
  const [anonymize, setAnonymize] = React.useState(true);
  const [includeDict, setIncludeDict] = React.useState(true);
  const [showPreview, setShowPreview] = React.useState(false);

  const datasets = [
    { id: 'encuestados', icon: '👥', label: t('exportar.datasets.encuestados'), count: 5523, vars: 32 },
    { id: 'r24', icon: '🍽️', label: t('exportar.datasets.r24'), count: 53287, vars: 18 },
    { id: 'antropometria', icon: '📏', label: t('exportar.datasets.antropometria'), count: 4892, vars: 22 },
    { id: 'agregados', icon: '📊', label: t('exportar.datasets.agregados'), count: 76, vars: 12 },
    { id: 'longitudinal', icon: '📈', label: t('exportar.datasets.longitudinal'), count: 1247, vars: 25 }
  ];

  const formatos = [
    { id: 'csv', label: 'CSV', icon: '📄', desc: 'Texto plano separado por comas' },
    { id: 'xlsx', label: 'Excel (xlsx)', icon: '📗', desc: 'Microsoft Excel' },
    { id: 'sav', label: 'SPSS (sav)', icon: '📊', desc: 'IBM SPSS Statistics' },
    { id: 'dta', label: 'Stata (dta)', icon: '📈', desc: 'StataCorp' },
    { id: 'rds', label: 'R (rds)', icon: '🅡', desc: 'R Statistical Computing' },
    { id: 'json', label: 'JSON', icon: '🔧', desc: 'JavaScript Object Notation' }
  ];

  const selectedDS = datasets.find(d => d.id === dataset);

  // Historial sintético de exportaciones
  const historial = [
    { fecha: '2026-04-26 14:32', dataset: 'encuestados', formato: 'xlsx', usuario: 'Patricia Ochoa', registros: 5523 },
    { fecha: '2026-04-25 09:15', dataset: 'r24', formato: 'csv', usuario: 'Christian Manzanares', registros: 53287 },
    { fecha: '2026-04-22 16:48', dataset: 'agregados', formato: 'xlsx', usuario: 'Elizabeth León', registros: 76 },
    { fecha: '2026-04-20 11:23', dataset: 'antropometria', formato: 'sav', usuario: 'Patricia Ochoa', registros: 4892 }
  ];

  const handleDownload = () => {
    alert(`(Prototipo) Generando exportación...\n\nDataset: ${selectedDS.label}\nFormato: ${formato.toUpperCase()}\nRegistros: ${Helpers.num(selectedDS.count)}\nAnonimización: ${anonymize ? 'Sí' : 'No'}\nDiccionario incluido: ${includeDict ? 'Sí' : 'No'}\n\nEn producción, este botón generaría el archivo y lo descargaría.`);
  };

  return (
    <div className="fade-in">
      <div className="grid-12">
        {/* Panel izquierdo: configuración */}
        <div className="col-8">
          {/* Paso 1: Dataset */}
          <div className="card mb-3">
            <div className="h3 mb-3">1️⃣ {t('exportar.selectData')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
              {datasets.map(d => (
                <button key={d.id} onClick={() => setDataset(d.id)} style={{
                  padding: 14, textAlign: 'left',
                  border: `2px solid ${dataset === d.id ? 'var(--unah-blue-800)' : 'var(--gray-200)'}`,
                  background: dataset === d.id ? 'var(--unah-blue-50)' : 'white',
                  borderRadius: 8, cursor: 'pointer'
                }}>
                  <div className="flex items-center gap-2">
                    <div style={{ fontSize: '1.3rem' }}>{d.icon}</div>
                    <div style={{
                      fontWeight: 600,
                      color: dataset === d.id ? 'var(--unah-blue-800)' : 'var(--gray-700)'
                    }}>{d.label}</div>
                  </div>
                  <div className="muted small mt-2">
                    {Helpers.num(d.count)} registros · {d.vars} variables
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Formato */}
          <div className="card mb-3">
            <div className="h3 mb-3">2️⃣ {t('exportar.format')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {formatos.map(f => (
                <button key={f.id} onClick={() => setFormato(f.id)} style={{
                  padding: 12, textAlign: 'left',
                  border: `2px solid ${formato === f.id ? 'var(--unah-yellow-500)' : 'var(--gray-200)'}`,
                  background: formato === f.id ? 'var(--unah-yellow-100)' : 'white',
                  borderRadius: 8, cursor: 'pointer'
                }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                    <strong>{f.label}</strong>
                  </div>
                  <div className="muted" style={{ fontSize: '0.72rem', marginTop: 4 }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 3: Opciones */}
          <div className="card mb-3">
            <div className="h3 mb-3">3️⃣ Opciones</div>

            <label className="flex items-center gap-2 mb-3" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={anonymize} onChange={(e) => setAnonymize(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{t('exportar.anonymize')}</div>
                <div className="muted small">{t('exportar.anonymize_desc')}</div>
              </div>
            </label>

            <label className="flex items-center gap-2 mb-3" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={includeDict} onChange={(e) => setIncludeDict(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{t('exportar.includeDict')}</div>
                <div className="muted small">Hoja adicional con descripción de cada variable, tipo y categorías.</div>
              </div>
            </label>

            <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{t('exportar.schedule')}</div>
                <div className="muted small">Generar y enviar este export por correo cada mes.</div>
              </div>
            </label>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setShowPreview(!showPreview)}>
              👁️ {showPreview ? 'Ocultar' : 'Mostrar'} {t('exportar.preview')}
            </button>
            <button className="btn btn-yellow" style={{ marginLeft: 'auto' }} onClick={handleDownload}>
              ⬇️ {t('exportar.download')}
            </button>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="card mt-3 fade-in">
              <div className="h3 mb-2">{t('exportar.previewRecords')}</div>
              <div style={{ background: 'var(--gray-900)', color: '#A7F3D0', padding: 14, borderRadius: 8, fontSize: '0.78rem', fontFamily: 'monospace', overflow: 'auto' }}>
                {dataset === 'encuestados' && (
                  <pre style={{ margin: 0 }}>{`id,dni,nombre,edad,sexo,depto,etapa,ddm
1,${anonymize ? 'ANON-0001' : '0801-1985-04501'},${anonymize ? '[anonimizado]' : 'María Reyes'},42,Mujer,Francisco Morazán,Adulto,1
2,${anonymize ? 'ANON-0002' : '0801-1992-08741'},${anonymize ? '[anonimizado]' : 'Carlos López'},33,Hombre,Cortés,Adulto,0
3,${anonymize ? 'ANON-0003' : '1801-1975-12303'},${anonymize ? '[anonimizado]' : 'Ana García'},51,Mujer,Atlántida,Adulto,1
4,${anonymize ? 'ANON-0004' : '1601-2000-09812'},${anonymize ? '[anonimizado]' : 'Juan Mendoza'},25,Hombre,Olancho,Adulto,1
5,${anonymize ? 'ANON-0005' : '0501-2010-04123'},${anonymize ? '[anonimizado]' : 'Luis Pérez'},15,Hombre,Comayagua,Adolescente,0`}</pre>
                )}
                {dataset !== 'encuestados' && (
                  <div style={{ color: '#94A3B8' }}>
                    Vista previa para "{selectedDS.label}" disponible en producción.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho: resumen + historial */}
        <div className="col-4">
          <div className="card mb-3" style={{
            background: 'linear-gradient(135deg, var(--unah-blue-800) 0%, var(--unah-blue-600) 100%)',
            color: 'white', borderColor: 'transparent'
          }}>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resumen de la exportación
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 6 }}>
              {selectedDS.label}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: 4 }}>
              {Helpers.num(selectedDS.count)} registros · {selectedDS.vars} variables
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '12px 0' }} />
            <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-yellow">{formato.toUpperCase()}</span>
              {anonymize && <span className="badge badge-green">🔒 Anonimizado</span>}
              {includeDict && <span className="badge badge-blue">📖 Diccionario</span>}
            </div>
          </div>

          {/* Historial */}
          <div className="card">
            <div className="h3 mb-2">📂 {t('exportar.history')}</div>
            {historial.map((h, i) => (
              <div key={i} style={{
                padding: '10px 0',
                borderBottom: i < historial.length - 1 ? '1px solid var(--gray-100)' : 'none'
              }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.dataset}</div>
                    <div className="muted small">{h.usuario} · {h.fecha}</div>
                  </div>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>{h.formato.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Exportar = Exportar;
