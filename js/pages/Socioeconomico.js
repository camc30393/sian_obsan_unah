/**
 * SIDH - Socioeconomico
 * Formulario multi-paso para captura de datos socioeconómicos
 * y consentimiento informado del encuestado.
 *
 * Pasos:
 *   1. Consentimiento informado (texto + checkbox + firma)
 *   2. Identificación (DNI, nombre, fecha nac., teléfono, expediente)
 *   3. Geografía (País → Depto → Mun → Comunidad + tipo localidad + GPS)
 *   4. Demografía (sexo, estado civil, etnia, escolaridad)
 *   5. Socioeconomía (ocupación, situación laboral, ingreso, NSE)
 *
 * En el prototipo no funcional el guardado es simulado.
 */
const Socioeconomico = () => {
  const t = (k) => I18n.t(k);
  const geo = DataStore.get('geografia_honduras') || [];

  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    consent: false,
    consentTutor: false,
    dni: '',
    nombre: '',
    fechaNac: '',
    edad: '',
    telefono: '',
    expediente: '',
    pais: 'Honduras',
    departamento: '',
    municipio: '',
    comunidad: '',
    tipoLoc: 'colonia',
    nombreLoc: '',
    area: 'urbana',
    gpsLat: '',
    gpsLng: '',
    sexo: '',
    estadoCivil: '',
    etnia: 'Mestizo/a',
    escolaridad: '',
    nivelEducativo: '',
    ocupacion: '',
    situacion: '',
    ingreso: '',
    seguro: 'no',
    nseScore: '',
    nseCat: ''
  });

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  // Auto-formato DNI
  const formatDNI = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  };

  // Calcular edad desde fecha nacimiento
  React.useEffect(() => {
    if (data.fechaNac) {
      const nac = new Date(data.fechaNac);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nac.getFullYear();
      const m = hoy.getMonth() - nac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
      if (!isNaN(edad) && edad >= 0) update('edad', edad);
    }
  }, [data.fechaNac]);

  // Geografía: municipios disponibles para el departamento seleccionado
  const munList = React.useMemo(() => {
    const dep = geo.find(d => d.departamento === data.departamento);
    return dep ? dep.municipios : [];
  }, [geo, data.departamento]);

  const comList = React.useMemo(() => {
    const mun = munList.find(m => m.nombre === data.municipio);
    return mun ? mun.comunidades : [];
  }, [munList, data.municipio]);

  // Captura GPS simulada
  const captureGPS = () => {
    update('gpsLat', (14.0723 + (Math.random() - 0.5) * 0.5).toFixed(6));
    update('gpsLng', (-87.1921 + (Math.random() - 0.5) * 0.5).toFixed(6));
  };

  // Cálculo NSE simulado (escala simple para el prototipo)
  React.useEffect(() => {
    if (data.nivelEducativo && data.ingreso && data.seguro) {
      let score = 1;
      const eduMap = { 'primaria_inc': 1, 'primaria': 2, 'secundaria_inc': 3, 'secundaria': 4, 'universidad': 6 };
      const ingMap = { 'menos_1sm': 1, '1_2sm': 3, 'mas_2sm': 6 };
      score += (eduMap[data.nivelEducativo] || 0);
      score += (ingMap[data.ingreso] || 0);
      score += (data.seguro === 'si' ? 1 : 0);
      const cat = score < 4 ? 'bajo' : score < 7 ? 'medio' : 'alto';
      update('nseScore', score.toFixed(1));
      update('nseCat', cat);
    }
  }, [data.nivelEducativo, data.ingreso, data.seguro]);

  const steps = [
    t('socio.step1'), t('socio.step2'), t('socio.step3'),
    t('socio.step4'), t('socio.step5')
  ];

  // Validación mínima por paso
  const stepValid = {
    0: data.consent,
    1: Helpers.validateDNI(data.dni) && data.nombre && data.fechaNac,
    2: data.departamento && data.municipio,
    3: data.sexo && data.escolaridad,
    4: data.nivelEducativo && data.ingreso
  };

  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));
  const save = () => {
    alert(`(Prototipo) Datos socioeconómicos guardados\n\n` +
      `DNI: ${data.dni}\n` +
      `Nombre: ${data.nombre}\n` +
      `Edad: ${data.edad} años · Sexo: ${data.sexo}\n` +
      `Ubicación: ${data.comunidad}, ${data.municipio}, ${data.departamento}\n` +
      `NSE: ${data.nseCat} (puntaje ${data.nseScore})\n\n` +
      `Próximo paso: ir a Antropometría o iniciar el R24.`);
  };

  return (
    <div className="fade-in">
      <FormStepper steps={steps} current={step} onStepClick={setStep} />

      {/* PASO 1: Consentimiento */}
      {step === 0 && (
        <div className="card fade-in" key="s0">
          <div className="h2" style={{ color: 'var(--unah-blue-800)', marginBottom: 12 }}>
            📜 {t('socio.consent.title')}
          </div>
          <p className="muted" style={{ marginBottom: 16 }}>{t('socio.consent.intro')}</p>

          <div style={{
            background: 'var(--unah-blue-50)', border: '1px solid var(--unah-blue-100)',
            borderRadius: 8, padding: 20, fontSize: '0.9rem', lineHeight: 1.7,
            color: 'var(--gray-700)', marginBottom: 16
          }}>
            {t('socio.consent.text')}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="consent"
              checked={data.consent}
              onChange={(e) => update('consent', e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="consent" style={{ cursor: 'pointer', fontWeight: 500 }}>
              {t('socio.consent.agree')}
            </label>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input type="checkbox" id="tutor" checked={data.consentTutor}
              onChange={(e) => update('consentTutor', e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="tutor" style={{ cursor: 'pointer', fontSize: '0.85rem' }} className="muted">
              {t('socio.consent.tutor')}
            </label>
          </div>

          <div style={{
            border: '2px dashed var(--gray-300)', borderRadius: 8,
            padding: 24, textAlign: 'center', background: 'var(--gray-50)'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 8 }}>
              ✍️ {t('socio.consent.signature')}
            </div>
            <button className="btn btn-secondary btn-sm" type="button">
              {t('socio.consent.captureSignature')}
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Identificación */}
      {step === 1 && (
        <div className="card fade-in" key="s1">
          <div className="h2" style={{ color: 'var(--unah-blue-800)', marginBottom: 16 }}>
            🆔 {t('socio.step2')}
          </div>
          <div className="form-grid">
            <FormField label={t('socio.id.dni')} required hint="13 dígitos" span={6}>
              <input
                className="input"
                value={data.dni}
                onChange={(e) => update('dni', formatDNI(e.target.value))}
                placeholder="0000-0000-00000"
                style={{ fontFamily: 'monospace' }}
              />
            </FormField>
            <FormField label={t('socio.id.alt')} hint="Solo extranjeros" span={6}>
              <input className="input" placeholder="Pasaporte / carné residencia" />
            </FormField>
            <FormField label={t('socio.id.nombre')} required span={12}>
              <input className="input" value={data.nombre}
                onChange={(e) => update('nombre', e.target.value)}
                placeholder="Nombres y apellidos completos" />
            </FormField>
            <FormField label={t('socio.id.fechaNac')} required span={4}>
              <input className="input" type="date" value={data.fechaNac}
                onChange={(e) => update('fechaNac', e.target.value)} />
            </FormField>
            <FormField label={t('socio.id.edad')} hint="Calculada automáticamente" span={2}>
              <input className="input" value={data.edad} readOnly
                style={{ background: 'var(--gray-100)' }} />
            </FormField>
            <FormField label={t('socio.id.telefono')} span={3}>
              <input className="input" value={data.telefono}
                onChange={(e) => update('telefono', e.target.value)}
                placeholder="9999-9999" />
            </FormField>
            <FormField label={t('socio.id.expediente')} hint="Opcional" span={3}>
              <input className="input" value={data.expediente}
                onChange={(e) => update('expediente', e.target.value)} />
            </FormField>
          </div>
        </div>
      )}

      {/* PASO 3: Geografía */}
      {step === 2 && (
        <div className="card fade-in" key="s2">
          <div className="h2" style={{ color: 'var(--unah-blue-800)', marginBottom: 16 }}>
            🗺️ {t('socio.geo.title')}
          </div>
          <div className="form-grid">
            <FormField label={t('socio.geo.pais')} required span={4}>
              <select className="select" value={data.pais}
                onChange={(e) => update('pais', e.target.value)}>
                <option>Honduras</option>
                <option>Otro</option>
              </select>
            </FormField>
            <FormField label={t('socio.geo.departamento')} required span={4}>
              <select className="select" value={data.departamento}
                onChange={(e) => { update('departamento', e.target.value); update('municipio', ''); update('comunidad', ''); }}>
                <option value="">— Seleccione —</option>
                {geo.map(d => <option key={d.departamento}>{d.departamento}</option>)}
              </select>
            </FormField>
            <FormField label={t('socio.geo.municipio')} required span={4}>
              <select className="select" value={data.municipio}
                onChange={(e) => { update('municipio', e.target.value); update('comunidad', ''); }}
                disabled={!data.departamento}>
                <option value="">— Seleccione —</option>
                {munList.map(m => <option key={m.nombre}>{m.nombre}</option>)}
              </select>
            </FormField>
            <FormField label={t('socio.geo.comunidad')} span={6}>
              <input className="input" list="comList" value={data.comunidad}
                onChange={(e) => update('comunidad', e.target.value)}
                placeholder="Comunidad / aldea" disabled={!data.municipio} />
              <datalist id="comList">
                {comList.map(c => <option key={c} value={c} />)}
              </datalist>
            </FormField>
            <FormField label={t('socio.geo.tipoLoc')} span={3}>
              <select className="select" value={data.tipoLoc}
                onChange={(e) => update('tipoLoc', e.target.value)}>
                <option value="caserio">{t('socio.geo.tipoLoc_caserio')}</option>
                <option value="aldea">{t('socio.geo.tipoLoc_aldea')}</option>
                <option value="barrio">{t('socio.geo.tipoLoc_barrio')}</option>
                <option value="colonia">{t('socio.geo.tipoLoc_colonia')}</option>
                <option value="residencial">{t('socio.geo.tipoLoc_residencial')}</option>
              </select>
            </FormField>
            <FormField label={t('socio.geo.nombreLoc')} span={3}>
              <input className="input" value={data.nombreLoc}
                onChange={(e) => update('nombreLoc', e.target.value)} />
            </FormField>
            <FormField label={t('socio.geo.area')} span={4}>
              <select className="select" value={data.area}
                onChange={(e) => update('area', e.target.value)}>
                <option value="urbana">{t('socio.geo.area_urbana')}</option>
                <option value="rural">{t('socio.geo.area_rural')}</option>
              </select>
            </FormField>
            <FormField label={t('socio.geo.tipoCentro')} span={4}>
              <select className="select">
                <option>Centro de salud</option>
                <option>Hospital</option>
                <option>Comunidad</option>
                <option>Centro educativo</option>
                <option>Centro UNAH</option>
              </select>
            </FormField>
            <FormField label={t('socio.geo.nombreCentro')} span={4}>
              <input className="input" placeholder="Nombre del centro o lugar" />
            </FormField>

            {/* GPS */}
            <div style={{ gridColumn: 'span 12' }}>
              <div style={{
                background: 'var(--unah-blue-50)', border: '1px solid var(--unah-blue-100)',
                borderRadius: 8, padding: 14, marginTop: 8
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    📍 {t('socio.geo.gps')}
                  </div>
                  <button className="btn btn-primary btn-sm" type="button" onClick={captureGPS}>
                    📡 {t('socio.geo.captureGps')}
                  </button>
                </div>
                <div className="flex gap-3" style={{ fontSize: '0.85rem' }}>
                  <div><strong>Lat:</strong> <span style={{ fontFamily: 'monospace' }}>{data.gpsLat || '—'}</span></div>
                  <div><strong>Lng:</strong> <span style={{ fontFamily: 'monospace' }}>{data.gpsLng || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASO 4: Demografía */}
      {step === 3 && (
        <div className="card fade-in" key="s3">
          <div className="h2" style={{ color: 'var(--unah-blue-800)', marginBottom: 16 }}>
            👤 {t('socio.demo.title')}
          </div>
          <div className="form-grid">
            <FormField label={t('socio.demo.sexo')} required span={3}>
              <select className="select" value={data.sexo}
                onChange={(e) => update('sexo', e.target.value)}>
                <option value="">— Seleccione —</option>
                <option>Mujer</option><option>Hombre</option>
              </select>
            </FormField>
            <FormField label={t('socio.demo.estadoCivil')} span={3}>
              <select className="select" value={data.estadoCivil}
                onChange={(e) => update('estadoCivil', e.target.value)}>
                <option value="">—</option>
                <option>Soltero/a</option><option>Casado/a</option>
                <option>Unión libre</option><option>Divorciado/a</option><option>Viudo/a</option>
              </select>
            </FormField>
            <FormField label={t('socio.demo.etnia')} span={6}>
              <select className="select" value={data.etnia}
                onChange={(e) => update('etnia', e.target.value)}>
                <option>Mestizo/a</option><option>Lenca</option>
                <option>Garífuna</option><option>Miskitu</option>
                <option>Maya-Chortí</option><option>Tolupán</option>
                <option>Pech</option><option>Tawahka</option>
                <option>Negro/a inglés</option><option>Otro</option>
              </select>
            </FormField>
            <FormField label={t('socio.demo.escolaridad')} required span={6}>
              <select className="select" value={data.escolaridad}
                onChange={(e) => update('escolaridad', e.target.value)}>
                <option value="">—</option>
                <option>Sin escolaridad</option>
                <option>Pre-básica</option>
                <option>Básica (1° - 9°)</option>
                <option>Media (Bachillerato)</option>
                <option>Superior</option>
              </select>
            </FormField>
            <FormField label={t('socio.demo.nivelEducativo')} required span={6}>
              <select className="select" value={data.nivelEducativo}
                onChange={(e) => update('nivelEducativo', e.target.value)}>
                <option value="">—</option>
                <option value="primaria_inc">Primaria incompleta</option>
                <option value="primaria">Primaria completa</option>
                <option value="secundaria_inc">Secundaria incompleta</option>
                <option value="secundaria">Secundaria completa</option>
                <option value="universidad">Universidad</option>
              </select>
            </FormField>
          </div>
        </div>
      )}

      {/* PASO 5: Socioeconomía */}
      {step === 4 && (
        <div className="card fade-in" key="s4">
          <div className="h2" style={{ color: 'var(--unah-blue-800)', marginBottom: 16 }}>
            💼 {t('socio.se.title')}
          </div>
          <div className="form-grid">
            <FormField label={t('socio.se.ocupacion')} span={6}>
              <select className="select" value={data.ocupacion}
                onChange={(e) => update('ocupacion', e.target.value)}>
                <option value="">—</option>
                <option>Ama de casa</option>
                <option>Estudiante</option>
                <option>Trabajo no calificado</option>
                <option>Comerciante</option>
                <option>Agricultor</option>
                <option>Profesional</option>
                <option>Otra</option>
              </select>
            </FormField>
            <FormField label={t('socio.se.situacion')} span={6}>
              <select className="select" value={data.situacion}
                onChange={(e) => update('situacion', e.target.value)}>
                <option value="">—</option>
                <option>Empleado</option>
                <option>Por cuenta propia</option>
                <option>Desempleado</option>
                <option>Jubilado/Pensionado</option>
                <option>No aplica</option>
              </select>
            </FormField>
            <FormField label={t('socio.se.ingreso')} required span={8}>
              <select className="select" value={data.ingreso}
                onChange={(e) => update('ingreso', e.target.value)}>
                <option value="">—</option>
                <option value="menos_1sm">Menos de 1 salario mínimo</option>
                <option value="1_2sm">Entre 1 y 2 salarios mínimos</option>
                <option value="mas_2sm">Más de 2 salarios mínimos</option>
              </select>
            </FormField>
            <FormField label={t('socio.se.seguro')} required span={4}>
              <select className="select" value={data.seguro}
                onChange={(e) => update('seguro', e.target.value)}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </FormField>
          </div>

          {/* Cálculo NSE en vivo */}
          {data.nseCat && (
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 8,
              background: data.nseCat === 'alto' ? 'var(--success-100)' : data.nseCat === 'medio' ? 'var(--unah-yellow-100)' : 'var(--unah-red-100)',
              border: `2px solid ${data.nseCat === 'alto' ? 'var(--success-500)' : data.nseCat === 'medio' ? 'var(--unah-yellow-500)' : 'var(--unah-red-500)'}`
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>
                    {t('socio.se.categoria')}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>
                    NSE {Helpers.cap(data.nseCat)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{t('socio.se.calculo')}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{data.nseScore}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between mt-4">
        <button className="btn btn-secondary" onClick={prev} disabled={step === 0}>
          ← {t('common.previous')}
        </button>

        <div className="flex gap-2">
          <span className="badge" style={{ alignSelf: 'center' }}>
            Paso {step + 1} / {steps.length}
          </span>
          {step < steps.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={next}
              disabled={!stepValid[step]}
              style={{ opacity: stepValid[step] ? 1 : 0.5 }}
            >
              {t('common.next')} →
            </button>
          ) : (
            <button
              className="btn btn-yellow"
              onClick={save}
              disabled={!stepValid[step]}
              style={{ opacity: stepValid[step] ? 1 : 0.5 }}
            >
              ✓ {t('common.save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

window.Socioeconomico = Socioeconomico;
