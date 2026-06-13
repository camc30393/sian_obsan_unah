/**
 * SIAN - Antropometría
 * Captura antropométrica diferenciada según etapa de vida.
 *
 * 7 etapas con campos distintos:
 *   1. Lactante (0-2):       peso, talla, perímetro cefálico, perímetro braquial
 *   2. Preescolar (2-5):     peso, talla, IMC, perímetro braquial
 *   3. Escolar (5-12):       peso, talla, IMC
 *   4. Adolescente (12-19):  peso, talla, IMC, cintura
 *   5. Adulto (19-60):       peso, talla, IMC, cintura, cadera, pliegues
 *   6. Adulto mayor (60+):   peso, talla, IMC, circunf. pantorrilla
 *   7. Embarazada / Lactancia: peso pregest., peso actual, IMC pregest., talla
 *
 * Estándares aplicados:
 *   - OMS 2006 (lactantes y preescolares)
 *   - OMS 2007 (escolares y adolescentes)
 *   - OMS adultos (IMC clásico)
 *   - IOM 2009 (ganancia de peso en embarazo)
 *
 * Cálculos automáticos:
 *   - IMC = peso / (talla en metros)^2
 *   - Z-scores aproximados (en producción se usarían tablas oficiales OMS LMS)
 *   - Interpretación clínica según percentiles/puntos de corte estándar
 */
const Antropometria = () => {
  const t = (k) => I18n.t(k);

  // v1.1: vinculación a encuestado + cálculo automático edad
  const [persona, setPersona] = React.useState(null);
  const [fechaNac, setFechaNac] = React.useState('');
  const [showMNA, setShowMNA] = React.useState(false);
  const [mnaScore, setMnaScore] = React.useState(null);
  const [mnaResp, setMnaResp] = React.useState({});

  const [etapa, setEtapa] = React.useState('Adulto');
  const [data, setData] = React.useState({
    fechaMedicion: new Date().toISOString().split('T')[0],
    evaluador: '',
    peso: '', talla: '', tallaSentado: '',
    perimetroCefalico: '', perimetroBraquial: '',
    perimetroCintura: '', perimetroCadera: '',
    perimetroPantorrilla: '',
    pliegueTricipital: '', pliegueSubescapular: '',
    pesoPregest: '', tallaMadre: '', edadGest: '',
    sexoNino: 'F', edadMeses: ''
  });

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  // v1.1: calcular edad automáticamente desde fecha de nacimiento
  const edadCalculada = React.useMemo(() => {
    if (!fechaNac) return null;
    const nac = new Date(fechaNac);
    const hoy = new Date();
    if (isNaN(nac.getTime())) return null;
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad >= 0 ? edad : null;
  }, [fechaNac]);

  // v1.1: auto-seleccionar etapa según edad calculada
  React.useEffect(() => {
    if (edadCalculada == null) return;
    if (edadCalculada < 2) setEtapa('Lactante');
    else if (edadCalculada < 5) setEtapa('Preescolar');
    else if (edadCalculada < 12) setEtapa('Escolar');
    else if (edadCalculada < 19) setEtapa('Adolescente');
    else if (edadCalculada < 60) setEtapa('Adulto');
    else setEtapa('Adulto mayor');
  }, [edadCalculada]);

  // v1.1: si selecciono persona, pre-cargar fecha nac y etapa
  React.useEffect(() => {
    if (persona) {
      if (persona.fecha_nac) setFechaNac(persona.fecha_nac);
      if (persona.etapa_vida) setEtapa(persona.etapa_vida);
    }
  }, [persona]);

  // Estándares por etapa
  const ESTANDARES = {
    'Lactante': 'OMS 2006 (0-2 años)',
    'Preescolar': 'OMS 2006 (2-5 años)',
    'Escolar': 'OMS 2007 (5-12 años)',
    'Adolescente': 'OMS 2007 (12-19 años)',
    'Adulto': 'OMS adultos (IMC)',
    'Adulto mayor': 'OMS adultos + MNA (60+)',
    'Embarazada': 'IOM 2009 + OMS adultos'
  };

  // ============ CÁLCULOS ============

  // IMC clásico
  const calcIMC = (peso, talla) => {
    const p = parseFloat(peso), t_cm = parseFloat(talla);
    if (!p || !t_cm) return null;
    const tm = t_cm / 100;
    return p / (tm * tm);
  };

  const imc = calcIMC(data.peso, data.talla);
  const imcPregest = calcIMC(data.pesoPregest, data.talla);

  // Interpretación IMC adultos (OMS)
  const interpretIMC_Adulto = (imc) => {
    if (!imc) return null;
    if (imc < 18.5) return { txt: 'Bajo peso', color: 'var(--warning-500)' };
    if (imc < 25)   return { txt: 'Normal', color: 'var(--success-500)' };
    if (imc < 30)   return { txt: 'Sobrepeso', color: 'var(--warning-500)' };
    if (imc < 35)   return { txt: 'Obesidad I', color: 'var(--unah-red-500)' };
    if (imc < 40)   return { txt: 'Obesidad II', color: 'var(--unah-red-500)' };
    return { txt: 'Obesidad III', color: 'var(--unah-red-700)' };
  };

  // IMC pregestacional (IOM 2009) - ganancia de peso esperada
  const interpretEmbarazo = (imcPre) => {
    if (!imcPre) return null;
    if (imcPre < 18.5) return { categoria: 'Bajo peso',  ganancia: '12.5 - 18 kg' };
    if (imcPre < 25)   return { categoria: 'Normal',     ganancia: '11.5 - 16 kg' };
    if (imcPre < 30)   return { categoria: 'Sobrepeso',  ganancia: '7 - 11.5 kg' };
    return { categoria: 'Obesidad', ganancia: '5 - 9 kg' };
  };

  // Cintura riesgo cardiovascular (OMS)
  const interpretCintura = (cintura, sexo) => {
    const c = parseFloat(cintura);
    if (!c) return null;
    const limit = sexo === 'Mujer' ? 80 : 94;
    const limitHigh = sexo === 'Mujer' ? 88 : 102;
    if (c < limit) return { txt: 'Sin riesgo', color: 'var(--success-500)' };
    if (c < limitHigh) return { txt: 'Riesgo aumentado', color: 'var(--warning-500)' };
    return { txt: 'Riesgo muy aumentado', color: 'var(--unah-red-500)' };
  };

  // MUAC (circunf. braquial) y pantorrilla - cortes de cribado (documentar/validar)
  const interpretMUAC = (cm, et) => {
    const c = parseFloat(cm); if (!c) return null;
    if (et === 'Adulto' || et === 'Adulto mayor') {
      if (c < 23.5) return { txt: 'Bajo peso (MUAC <23.5)', color: 'var(--unah-red-500)' };
      if (c < 25)   return { txt: 'Riesgo (MUAC)', color: 'var(--warning-500)' };
      return { txt: 'Adecuado (MUAC)', color: 'var(--success-500)' };
    }
    if (c < 11.5) return { txt: 'Desnutricion aguda severa', color: 'var(--unah-red-700)' };
    if (c < 12.5) return { txt: 'Desnutricion aguda moderada', color: 'var(--warning-500)' };
    return { txt: 'Adecuado', color: 'var(--success-500)' };
  };
  const interpretPantorrilla = (cm) => {
    const c = parseFloat(cm); if (!c) return null;
    return c < 31 ? { txt: 'Baja masa muscular (CP <31)', color: 'var(--unah-red-500)' }
                  : { txt: 'Adecuada (CP)', color: 'var(--success-500)' };
  };

  // Z-score aproximado para escolares (placeholder - producción usa tablas LMS OMS)
  const zScoreApprox = (imc, edad, sexo) => {
    if (!imc) return null;
    // Aproximación simplificada para demo (NO usar en producción real)
    const median = sexo === 'Mujer' ? (edad > 10 ? 17 + (edad - 10) * 0.4 : 16) : (edad > 10 ? 17 + (edad - 10) * 0.4 : 16);
    const sd = 2.5;
    return (imc - median) / sd;
  };

  // ============ RENDERIZADO POR ETAPA ============

  const renderFormulario = () => {
    switch (etapa) {
      case 'Lactante':
        return (
          <div className="form-grid">
            <FormField label="Edad en meses" required hint="0-24 meses" span={3}>
              <input className="input" type="number" min="0" max="24"
                value={data.edadMeses} onChange={(e) => update('edadMeses', e.target.value)} />
            </FormField>
            <FormField label="Sexo" required span={3}>
              <select className="select" value={data.sexoNino}
                onChange={(e) => update('sexoNino', e.target.value)}>
                <option value="F">Femenino</option><option value="M">Masculino</option>
              </select>
            </FormField>
            <FormField label={t('antro.fields.peso')} required hint="Balanza pediátrica · OMS 2006" span={3}>
              <input className="input" type="number" step="0.01"
                value={data.peso} onChange={(e) => update('peso', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.talla')} required hint="Tallímetro horizontal" span={3}>
              <input className="input" type="number" step="0.1"
                value={data.talla} onChange={(e) => update('talla', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroCefalico')} required hint="Cinta no extensible" span={6}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroCefalico} onChange={(e) => update('perimetroCefalico', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroBraquial')} hint="Punto medio brazo izquierdo" span={6}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroBraquial} onChange={(e) => update('perimetroBraquial', e.target.value)} />
            </FormField>
          </div>
        );

      case 'Preescolar':
        return (
          <div className="form-grid">
            <FormField label="Edad (años)" required span={3}>
              <input className="input" type="number" min="2" max="5" />
            </FormField>
            <FormField label="Sexo" required span={3}>
              <select className="select"><option>Femenino</option><option>Masculino</option></select>
            </FormField>
            <FormField label={t('antro.fields.peso')} required hint="OMS 2006" span={3}>
              <input className="input" type="number" step="0.01"
                value={data.peso} onChange={(e) => update('peso', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.talla')} required hint="Estadiómetro de pie" span={3}>
              <input className="input" type="number" step="0.1"
                value={data.talla} onChange={(e) => update('talla', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroBraquial')} hint="Detección de desnutrición aguda" span={6}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroBraquial} onChange={(e) => update('perimetroBraquial', e.target.value)} />
            </FormField>
            {interpretMUAC(data.perimetroBraquial, etapa) && (
              <div className="small" style={{ color: interpretMUAC(data.perimetroBraquial, etapa).color, fontWeight:600, marginTop:-6 }}>
                ↳ {interpretMUAC(data.perimetroBraquial, etapa).txt}
              </div>
            )}
          </div>
        );

      case 'Escolar':
        return (
          <div className="form-grid">
            <FormField label="Edad (años)" required span={3}>
              <input className="input" type="number" min="5" max="12" />
            </FormField>
            <FormField label="Sexo" required span={3}>
              <select className="select"><option>Femenino</option><option>Masculino</option></select>
            </FormField>
            <FormField label={t('antro.fields.peso')} required hint="OMS 2007" span={3}>
              <input className="input" type="number" step="0.01"
                value={data.peso} onChange={(e) => update('peso', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.talla')} required span={3}>
              <input className="input" type="number" step="0.1"
                value={data.talla} onChange={(e) => update('talla', e.target.value)} />
            </FormField>
          </div>
        );

      case 'Adolescente':
        return (
          <div className="form-grid">
            <FormField label="Edad (años)" required span={3}>
              <input className="input" type="number" min="12" max="19" />
            </FormField>
            <FormField label="Sexo" required span={3}>
              <select className="select"><option>Femenino</option><option>Masculino</option></select>
            </FormField>
            <FormField label={t('antro.fields.peso')} required hint="OMS 2007" span={3}>
              <input className="input" type="number" step="0.01"
                value={data.peso} onChange={(e) => update('peso', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.talla')} required span={3}>
              <input className="input" type="number" step="0.1"
                value={data.talla} onChange={(e) => update('talla', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroCintura')} hint="Sobre cresta ilíaca · estimación riesgo cardiometabólico" span={6}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroCintura} onChange={(e) => update('perimetroCintura', e.target.value)} />
            </FormField>
          </div>
        );

      case 'Adulto':
        return (
          <div className="form-grid">
            <FormField label="Sexo" required span={4}>
              <select className="select" value={data.sexoNino}
                onChange={(e) => update('sexoNino', e.target.value)}>
                <option value="Mujer">Mujer</option><option value="Hombre">Hombre</option>
              </select>
            </FormField>
            <FormField label={t('antro.fields.peso')} required span={4}>
              <input className="input" type="number" step="0.01"
                value={data.peso} onChange={(e) => update('peso', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.talla')} required span={4}>
              <input className="input" type="number" step="0.1"
                value={data.talla} onChange={(e) => update('talla', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroCintura')} hint="OMS: M >80, H >94 indica riesgo" span={4}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroCintura} onChange={(e) => update('perimetroCintura', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroCadera')} span={4}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroCadera} onChange={(e) => update('perimetroCadera', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.pliegueTricipital')} hint="Plicómetro · estima grasa corporal" span={4}>
              <input className="input" type="number" step="0.1"
                value={data.pliegueTricipital} onChange={(e) => update('pliegueTricipital', e.target.value)} />
            </FormField>
          </div>
        );

      case 'Adulto mayor':
        return (
          <div className="form-grid">
            <FormField label="Sexo" required span={4}>
              <select className="select" value={data.sexoNino}
                onChange={(e) => update('sexoNino', e.target.value)}>
                <option value="Mujer">Mujer</option><option value="Hombre">Hombre</option>
              </select>
            </FormField>
            <FormField label={t('antro.fields.peso')} required span={4}>
              <input className="input" type="number" step="0.01"
                value={data.peso} onChange={(e) => update('peso', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.talla')} hint="Si hay cifosis, estimar con altura de rodilla" required span={4}>
              <input className="input" type="number" step="0.1"
                value={data.talla} onChange={(e) => update('talla', e.target.value)} />
            </FormField>
            <FormField label={t('antro.fields.perimetroPantorrilla')} hint="< 31 cm sugiere sarcopenia" required span={4}>
              <input className="input" type="number" step="0.1"
                value={data.perimetroPantorrilla} onChange={(e) => update('perimetroPantorrilla', e.target.value)} />
            </FormField>
            {interpretPantorrilla(data.perimetroPantorrilla) && (
              <div className="small" style={{ color: interpretPantorrilla(data.perimetroPantorrilla).color, fontWeight:600, marginTop:-6 }}>
                ↳ {interpretPantorrilla(data.perimetroPantorrilla).txt}
              </div>
            )}
            <FormField label="MNA (Mini Nutritional Assessment)" hint="Aplicar cuestionario de 18 ítems para tamizaje nutricional en adultos mayores" span={8}>
              <button className="btn btn-secondary btn-sm" type="button" style={{ width: '100%' }}
                onClick={() => setShowMNA(true)}>
                📋 Aplicar cuestionario MNA
                {mnaScore != null && (
                  <span className="badge" style={{ marginLeft: 8, background: mnaScore.color, color:'#fff' }}>
                    MNA-SF {mnaScore.sf}/14 · {mnaScore.cat}{mnaScore.sfDone && mnaScore.full!=null ? ` · total ${mnaScore.full}/30` : ''}
                  </span>
                )}
              </button>
            </FormField>
          </div>
        );

      case 'Embarazada':
        const interp = interpretEmbarazo(imcPregest);
        return (
          <div>
            <div className="form-grid">
              <FormField label={t('antro.fields.pesoPregest')} required hint="Peso antes del embarazo" span={4}>
                <input className="input" type="number" step="0.01"
                  value={data.pesoPregest} onChange={(e) => update('pesoPregest', e.target.value)} />
              </FormField>
              <FormField label={t('antro.fields.peso') + ' actual'} required span={4}>
                <input className="input" type="number" step="0.01"
                  value={data.peso} onChange={(e) => update('peso', e.target.value)} />
              </FormField>
              <FormField label={t('antro.fields.talla')} required span={4}>
                <input className="input" type="number" step="0.1"
                  value={data.talla} onChange={(e) => update('talla', e.target.value)} />
              </FormField>
              <FormField label={t('antro.fields.edadGest')} required hint="0-42 semanas" span={4}>
                <input className="input" type="number" min="0" max="42"
                  value={data.edadGest} onChange={(e) => update('edadGest', e.target.value)} />
              </FormField>
              <FormField label={t('antro.fields.tallaMadre')} hint="Predictor de riesgo gestacional" span={4}>
                <input className="input" type="number" step="0.1"
                  value={data.tallaMadre} onChange={(e) => update('tallaMadre', e.target.value)} />
              </FormField>
            </div>

            {interp && (
              <div style={{
                marginTop: 16, padding: 14, borderRadius: 8,
                background: 'var(--unah-blue-50)', border: '1px solid var(--unah-blue-100)'
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  Categoría IMC pregestacional: {interp.categoria}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Ganancia de peso esperada (IOM 2009):</strong> {interp.ganancia}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      {/* v1.1: Vinculación a encuestado + fecha de nacimiento */}
      <div className="card mb-4" style={{
        borderLeft: '4px solid var(--unah-blue-800)',
        background: 'white'
      }}>
        <div className="h3 mb-2">🔗 Vincular a encuestado</div>
        <p className="muted small mb-3">
          Los datos antropométricos deben estar vinculados a un encuestado por DNI o nombre.
          Para infantes, registre a través de un padre o tutor.
        </p>

        <div className="grid-12">
          <div className="col-8">
            <PersonPicker
              value={persona}
              onChange={setPersona}
              allowTutor={['Lactante', 'Preescolar', 'Escolar'].includes(etapa)}
              label="Encuestado"
            />
          </div>
          <div className="col-4">
            <FormField label="Fecha de nacimiento" hint="Opcional - calcula edad automáticamente">
              <input
                type="date"
                className="input"
                value={fechaNac}
                onChange={(e) => setFechaNac(e.target.value)}
              />
            </FormField>
            {edadCalculada != null && (
              <div className="card-tight" style={{
                background: 'var(--success-100)',
                padding: 8, borderRadius: 6,
                marginTop: 8, fontSize: '0.85rem'
              }}>
                ✓ Edad calculada: <strong>{edadCalculada} años</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selector de etapa */}
      <div className="card mb-4">
        <div className="h3 mb-2">📏 {t('antro.selectEtapa')}</div>
        <p className="muted small mb-3">{t('antro.etapaInfo')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          {[
            { id: 'Lactante', icon: '👶', label: 'Lactante (0-2)' },
            { id: 'Preescolar', icon: '🧒', label: 'Preescolar (2-5)' },
            { id: 'Escolar', icon: '📚', label: 'Escolar (5-12)' },
            { id: 'Adolescente', icon: '🧑', label: 'Adolescente (12-19)' },
            { id: 'Adulto', icon: '👨', label: 'Adulto (19-60)' },
            { id: 'Adulto mayor', icon: '🧓', label: 'Adulto mayor (60+)' },
            { id: 'Embarazada', icon: '🤰', label: 'Embarazada / Lactancia' },
          ].map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEtapa(e.id)}
              style={{
                padding: '12px 8px',
                border: `2px solid ${etapa === e.id ? 'var(--unah-blue-800)' : 'var(--gray-200)'}`,
                background: etapa === e.id ? 'var(--unah-blue-50)' : 'white',
                borderRadius: 8, cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: etapa === e.id ? 700 : 500,
                color: etapa === e.id ? 'var(--unah-blue-800)' : 'var(--gray-700)',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{e.icon}</div>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cabecera del formulario */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
              📐 Formulario para: <span style={{ color: 'var(--unah-yellow-700)' }}>{etapa}</span>
            </div>
            <div className="muted small mt-2">
              <strong>{t('antro.results.estandar')}:</strong> {ESTANDARES[etapa]}
            </div>
          </div>
        </div>

        <div className="form-grid mb-3">
          <FormField label={t('antro.fechaMedicion')} span={4}>
            <input className="input" type="date" value={data.fechaMedicion}
              onChange={(e) => update('fechaMedicion', e.target.value)} />
          </FormField>
          <FormField label={t('antro.evaluador')} span={8}>
            <input className="input" placeholder="Nombre del evaluador"
              value={data.evaluador} onChange={(e) => update('evaluador', e.target.value)} />
          </FormField>
        </div>

        <div className="divider" />

        {renderFormulario()}
      </div>

      {/* Resultados e interpretación */}
      {(imc || imcPregest) && (
        <div className="card fade-in" style={{
          background: 'linear-gradient(135deg, var(--unah-blue-900) 0%, var(--unah-blue-700) 100%)',
          color: 'white', borderColor: 'transparent'
        }}>
          <div className="h3" style={{ color: 'white', marginBottom: 16 }}>
            📊 {t('antro.results.title')}
          </div>

          <div className="grid-12">
            {imc && (
              <div className="col-3" style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  {t('antro.results.imc')}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 4 }}>
                  {imc.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>kg/m²</div>
              </div>
            )}

            {etapa === 'Adulto' && imc && interpretIMC_Adulto(imc) && (
              <div className="col-4" style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  {t('antro.results.interpretacion')}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 4 }}>
                  {interpretIMC_Adulto(imc).txt}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>OMS adultos</div>
              </div>
            )}

            {etapa === 'Adulto' && data.perimetroCintura && data.sexoNino && interpretCintura(data.perimetroCintura, data.sexoNino) && (
              <div className="col-5" style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  Riesgo cardiometabólico (cintura)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 4 }}>
                  {interpretCintura(data.perimetroCintura, data.sexoNino).txt}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{data.perimetroCintura} cm</div>
              </div>
            )}

            {etapa === 'Embarazada' && imcPregest && (
              <div className="col-4" style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  IMC pregestacional
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 4 }}>
                  {imcPregest.toFixed(1)}
                </div>
              </div>
            )}

            {etapa === 'Embarazada' && data.peso && data.pesoPregest && (
              <div className="col-5" style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  Ganancia actual
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 4 }}>
                  +{(parseFloat(data.peso) - parseFloat(data.pesoPregest)).toFixed(1)} kg
                </div>
              </div>
            )}

            {(etapa === 'Escolar' || etapa === 'Adolescente') && imc && (
              <div className="col-9" style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 14
              }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                  {t('antro.results.interpretacion')}
                </div>
                <div style={{ fontSize: '1rem', marginTop: 4 }}>
                  En el sistema en producción, los z-scores IMC/edad y T/edad se calcularán
                  contra las tablas oficiales OMS (LMS) según edad y sexo. Resultado clasificado en:
                  <strong> {imc.toFixed(1)} kg/m² → </strong>
                  {imc < 14 ? 'desnutrición severa' : imc < 16 ? 'desnutrición moderada' :
                   imc < 25 ? 'normal' : imc < 30 ? 'sobrepeso' : 'obesidad'}.
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, fontSize: '0.78rem', opacity: 0.8 }}>
            ⚠️ <em>Prototipo: las interpretaciones aquí mostradas son aproximaciones para fines demostrativos.
            En producción se aplicarán las tablas oficiales OMS LMS y los algoritmos validados clínicamente.</em>
          </div>
        </div>
      )}

      {/* Acciones finales */}
      <div className="flex justify-between mt-4">
        <button className="btn btn-secondary">
          ← {t('common.back')}
        </button>
        <div className="flex gap-2">
          <button className="btn btn-secondary">
            💾 {t('common.draft')}
          </button>
          <button className="btn btn-primary"
            onClick={() => alert(`(Prototipo) Antropometría guardada\n\nEtapa: ${etapa}\nIMC calculado: ${imc ? imc.toFixed(1) : '—'}\nFecha: ${data.fechaMedicion}\n\nPróximo paso: iniciar el R24 de múltiples pasos.`)}>
            ✓ {t('common.save')}
          </button>
        </div>
      </div>
      {/* v1.1: Modal cuestionario MNA */}
      <Modal
        open={showMNA}
        onClose={() => setShowMNA(false)}
        title="📋 Cuestionario MNA - Mini Nutritional Assessment"
        subtitle="Tamizaje + evaluación completa para adultos mayores (≥60 años)"
        size="lg"
        headerColor="var(--unah-blue-800)"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowMNA(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            const sfKeys = ['A','B','C','D','E','F'];
            const allKeys = sfKeys.concat(['G','H','I','J','K','L','M','N','O','P','Q','R']);
            const sum = (ks) => ks.reduce((s,k) => s + (mnaResp[k] != null ? mnaResp[k] : 0), 0);
            const sf = sum(sfKeys);
            const sfDone = sfKeys.every(k => mnaResp[k] != null);
            const full = sum(allKeys);
            // MNA-SF: >=12 normal, 8-11 riesgo, <=7 desnutricion
            const cat = sf >= 12 ? 'Normal' : (sf >= 8 ? 'Riesgo de desnutricion' : 'Desnutricion');
            const color = sf >= 12 ? 'var(--success-500)' : (sf >= 8 ? 'var(--warning-500)' : 'var(--unah-red-500)');
            setMnaScore({ sf, full, sfDone, cat, color });
            setShowMNA(false);
          }}>💾 Calcular y guardar puntaje</button>
        </>}
      >
        <CuestionarioMNA resp={mnaResp} setResp={setMnaResp} />
      </Modal>
    </div>
  );
};

// =================================================================
// Cuestionario MNA (18 ítems agrupados en tamizaje + evaluación)
// =================================================================
const CuestionarioMNA = ({ resp = {}, setResp }) => {
  const tamizaje = [
    { id: 'A', q: '¿Ha disminuido la ingesta de alimentos en los últimos 3 meses por pérdida de apetito, problemas digestivos, dificultades para masticar o tragar?',
      opts: ['0 = anorexia grave', '1 = anorexia moderada', '2 = sin anorexia'] },
    { id: 'B', q: 'Pérdida reciente de peso (<3 meses)',
      opts: ['0 = pérdida >3 kg', '1 = no sabe', '2 = pérdida 1-3 kg', '3 = sin pérdida'] },
    { id: 'C', q: 'Movilidad',
      opts: ['0 = de cama o sillón', '1 = autonomía interior', '2 = sale del domicilio'] },
    { id: 'D', q: '¿Ha tenido enfermedad aguda o estrés psicológico en los últimos 3 meses?',
      opts: ['0 = sí', '2 = no'] },
    { id: 'E', q: 'Problemas neuropsicológicos',
      opts: ['0 = demencia o depresión grave', '1 = demencia moderada', '2 = sin problemas'] },
    { id: 'F', q: 'IMC (kg/m²)',
      opts: ['0 = < 19', '1 = 19 ≤ IMC < 21', '2 = 21 ≤ IMC < 23', '3 = ≥ 23'] }
  ];

  const evaluacion = [
    { id: 'G', q: '¿El paciente vive de forma independiente (no en residencia geriátrica ni hospital)?',
      opts: ['0 = no', '1 = sí'] },
    { id: 'H', q: '¿Toma más de 3 medicamentos al día?',
      opts: ['0 = sí', '1 = no'] },
    { id: 'I', q: 'Úlceras o lesiones cutáneas',
      opts: ['0 = sí', '1 = no'] },
    { id: 'J', q: '¿Cuántas comidas completas toma al día?',
      opts: ['0 = 1 comida', '1 = 2 comidas', '2 = 3 comidas'] },
    { id: 'K', q: 'Marcadores de consumo proteico (lácteos, leguminosas, carnes/huevos)',
      opts: ['0.0 = 0-1 sí', '0.5 = 2 sí', '1.0 = 3 sí'] },
    { id: 'L', q: '¿Consume al menos 2 raciones de frutas/verduras al día?',
      opts: ['0 = no', '1 = sí'] },
    { id: 'M', q: '¿Cuántos vasos de agua/líquidos consume por día?',
      opts: ['0.0 = <3 vasos', '0.5 = 3-5 vasos', '1.0 = >5 vasos'] },
    { id: 'N', q: 'Forma de alimentarse',
      opts: ['0 = necesita ayuda', '1 = se alimenta solo con dificultad', '2 = se alimenta solo sin problema'] },
    { id: 'O', q: 'Auto-percepción del estado nutricional',
      opts: ['0 = se considera mal nutrido', '1 = no lo sabe', '2 = se considera bien nutrido'] },
    { id: 'P', q: 'Autopercepción salud comparada con personas de su edad',
      opts: ['0.0 = peor', '0.5 = no sabe', '1.0 = igual', '2.0 = mejor'] },
    { id: 'Q', q: 'Circunferencia braquial (CB) en cm',
      opts: ['0.0 = <21', '0.5 = 21 ≤ CB ≤ 22', '1.0 = >22'] },
    { id: 'R', q: 'Circunferencia de pantorrilla (CP) en cm',
      opts: ['0 = <31', '1 = ≥ 31'] }
  ];

  const renderPregunta = (item) => (
    <div key={item.id} className="card-tight" style={{
      background: 'var(--gray-50)', padding: 12, borderRadius: 8, marginBottom: 8
    }}>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>
        <span className="badge badge-blue" style={{ marginRight: 6 }}>{item.id}</span>
        {item.q}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
        {item.opts.map((opt, i) => (
          <label key={i} className="flex items-center gap-2" style={{ fontSize: '0.78rem', cursor: 'pointer' }}>
            <input type="radio" name={`mna-${item.id}`} checked={resp[item.id] === parseFloat(opt)} onChange={() => setResp(prev => Object.assign({}, prev, { [item.id]: parseFloat(opt) }))} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="card-tight mb-3" style={{ background: 'var(--unah-yellow-100)', padding: 10, borderRadius: 6, fontSize: '0.82rem' }}>
        ℹ️ <strong>MNA</strong> = Mini Nutritional Assessment (Evaluación Mini Nutricional). Cuestionario validado para tamizaje del estado nutricional en adultos mayores.
        Tamizaje (preguntas A-F): puntaje ≥12 indica estado normal; ≤11 sigue con evaluación completa (G-R) para puntaje total /30.
      </div>

      <h4 style={{ color: 'var(--unah-blue-800)' }}>Cribaje (preguntas A-F, máx. 14 puntos)</h4>
      {tamizaje.map(renderPregunta)}

      <h4 style={{ color: 'var(--unah-blue-800)', marginTop: 16 }}>Evaluación completa (preguntas G-R, máx. 16 puntos)</h4>
      {evaluacion.map(renderPregunta)}

      <div className="card-tight mt-3" style={{ background: 'var(--unah-blue-50)', padding: 12, borderRadius: 8, fontSize: '0.85rem' }}>
        <strong>Interpretación del puntaje total (0-30):</strong>
        <ul style={{ margin: '6px 0 0 18px', lineHeight: 1.6 }}>
          <li><strong>≥ 24:</strong> Estado nutricional satisfactorio</li>
          <li><strong>17-23.5:</strong> Riesgo de desnutrición</li>
          <li><strong>&lt; 17:</strong> Desnutrición</li>
        </ul>
      </div>
    </div>
  );
};

window.Antropometria = Antropometria;
