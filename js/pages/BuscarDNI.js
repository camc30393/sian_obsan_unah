/**
 * SIDH - BuscarDNI
 * Búsqueda longitudinal de personas por DNI hondureño (13 dígitos)
 * o por identificador alternativo para extranjeros.
 *
 * Funcionalidades:
 *   - Validación visual del DNI mientras se escribe
 *   - Búsqueda en la base de encuestados
 *   - Si encuentra: muestra historial de R24 con timeline
 *   - Si no encuentra: ofrece crear nuevo registro
 *
 * En el prototipo no funcional, los R24 simulados se generan a partir
 * de los datos disponibles para ilustrar el comportamiento.
 */
const BuscarDNI = () => {
  const t = (k) => I18n.t(k);
  const all = DataStore.get('encuestados') || [];

  const [dni, setDni] = React.useState('');
  const [alt, setAlt] = React.useState('');
  const [searched, setSearched] = React.useState(false);
  const [result, setResult] = React.useState(null);

  // v1.1: modales de perfil completo y R24
  const [showPerfil, setShowPerfil] = React.useState(false);
  const [r24View, setR24View] = React.useState(null);
  const [r24Edit, setR24Edit] = React.useState(null);
  const [r24Delete, setR24Delete] = React.useState(null);

  // Validación de DNI hondureño en tiempo real
  const dniValid = Helpers.validateDNI(dni);
  const cleanDni = dni.replace(/-/g, '').replace(/\s/g, '');

  // Auto-formato del DNI mientras se escribe (0000-0000-00000)
  const formatDNI = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  };

  const handleSearch = () => {
    setSearched(true);
    // En el prototipo, buscamos por DNI generado o por similitud
    let found = all.find(e => e.dni === dni);

    // Si no encuentra exacto, simular: tomar uno aleatorio coherente
    // basado en si el primer dígito coincide con un departamento real
    if (!found && dniValid && all.length > 0) {
      // 60% de probabilidad de "encontrar" para fines de demo
      if (Math.random() > 0.4) {
        // Tomar uno con datos completos (R24 real)
        const candidates = all.filter(e => e.ddm != null);
        found = candidates[Math.floor(Math.random() * candidates.length)];
        // Sobrescribir el DNI para coincidir con el buscado
        found = { ...found, dni };
      }
    }

    if (found) {
      // Generar historial sintético de R24 para demostrar funcionalidad
      const baseDate = new Date(found.fecha || '2025-09-15');
      const visitas = Math.floor(Math.random() * 3) + 1;
      const history = [];
      for (let i = 0; i < visitas; i++) {
        const date = new Date(baseDate);
        date.setMonth(date.getMonth() - i * 2);
        history.push({
          id: i + 1,
          fecha: date.toISOString().split('T')[0],
          estudiante: found._estudiante || 'María García López',
          centro: found.nombre_centro || 'CIS Distrito Central',
          ddm: i === 0 ? found.ddm : Math.random() > 0.5 ? 1 : 0,
          diversidad: i === 0 ? found.diversidad_count : Math.floor(Math.random() * 5) + 4,
          alimentos: 8 + Math.floor(Math.random() * 8),
          kcal: 1800 + Math.floor(Math.random() * 600)
        });
      }
      setResult({ found: true, persona: found, historial: history });
    } else {
      setResult({ found: false });
    }
  };

  const reset = () => {
    setDni(''); setAlt(''); setSearched(false); setResult(null);
  };

  return (
    <div className="fade-in">
      {/* Formulario de búsqueda */}
      <div className="card mb-4" style={{ maxWidth: 800 }}>
        <div className="h3 mb-3">🔎 {t('buscarDni.title')}</div>

        <div className="form-grid">
          <FormField label={t('buscarDni.label')} hint="Formato: 0000-0000-00000" span={6}>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                placeholder={t('buscarDni.placeholder')}
                value={dni}
                onChange={(e) => setDni(formatDNI(e.target.value))}
                style={{
                  fontFamily: 'monospace', fontSize: 14,
                  paddingRight: 36,
                  borderColor: dni.length > 0
                    ? (dniValid ? 'var(--success-500)' : 'var(--unah-red-500)')
                    : 'var(--gray-300)'
                }}
              />
              {dni.length > 0 && (
                <span style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: dniValid ? 'var(--success-500)' : 'var(--unah-red-500)',
                  fontSize: '1.1rem', fontWeight: 700
                }}>
                  {dniValid ? '✓' : '✗'}
                </span>
              )}
            </div>
            {dni.length > 0 && (
              <div style={{
                fontSize: '0.72rem', marginTop: 4,
                color: dniValid ? 'var(--success-500)' : 'var(--unah-red-500)',
                fontWeight: 600
              }}>
                {dniValid ? t('buscarDni.valid') : `${cleanDni.length}/13 dígitos`}
              </div>
            )}
          </FormField>

          <FormField label={t('buscarDni.alt')} hint="Para personas no hondureñas" span={6}>
            <input
              className="input"
              placeholder={t('buscarDni.altPlaceholder')}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </FormField>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            className="btn btn-primary"
            disabled={!dniValid && !alt}
            onClick={handleSearch}
            style={{ opacity: (!dniValid && !alt) ? 0.5 : 1 }}
          >
            🔍 {t('buscarDni.search')}
          </button>
          {searched && (
            <button className="btn btn-secondary" onClick={reset}>
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {result && result.found && (
        <div className="fade-in">
          {/* Tarjeta de identidad */}
          <div className="card mb-4" style={{
            background: 'linear-gradient(135deg, var(--unah-blue-800) 0%, var(--unah-blue-600) 100%)',
            color: 'white', borderColor: 'transparent'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '0.78rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  ✓ {t('buscarDni.found')}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>
                  {result.persona.nombre || 'Persona registrada'}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: 4 }}>
                  DNI <strong style={{ fontFamily: 'monospace' }}>{result.persona.dni}</strong>
                  {' · '} {result.persona.edad} años · {result.persona.sexo}
                  {' · '} {result.persona.etapa_vida}
                </div>
                <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: 4 }}>
                  📍 {[result.persona.municipio, result.persona.departamento].filter(Boolean).join(', ')}
                </div>
              </div>
              <div className="flex gap-2" style={{ flexDirection: 'column' }}>
                <button className="btn btn-yellow btn-sm">+ {t('buscarDni.newR24')}</button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  onClick={() => setShowPerfil(true)}>
                  {t('buscarDni.viewProfile')}
                </button>
              </div>
            </div>
          </div>

          {/* Historial de R24 */}
          <div className="card mb-4">
            <div className="h3 mb-3">📅 {t('buscarDni.history')} ({result.historial.length})</div>

            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {/* Línea vertical */}
              <div style={{
                position: 'absolute', left: 8, top: 8, bottom: 8,
                width: 2, background: 'var(--gray-200)'
              }} />

              {result.historial.map((h, i) => (
                <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                  {/* Punto del timeline */}
                  <div style={{
                    position: 'absolute', left: -22, top: 4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: i === 0 ? 'var(--unah-yellow-500)' : 'var(--unah-blue-600)',
                    border: '3px solid white',
                    boxShadow: '0 0 0 2px var(--gray-200)'
                  }} />
                  <div style={{
                    background: i === 0 ? 'var(--unah-yellow-100)' : 'var(--gray-50)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 8, padding: 14
                  }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          R24 #{h.id} · {h.fecha}
                          {i === 0 && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Más reciente</span>}
                        </div>
                        <div className="muted" style={{ fontSize: '0.78rem', marginTop: 2 }}>
                          Recolectado por <strong>{h.estudiante}</strong> en <strong>{h.centro}</strong>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setR24View(h)}>
                        👁️ {t('common.view')}
                      </button>
                    </div>
                    <div className="flex gap-3 mt-3" style={{ fontSize: '0.78rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${h.ddm ? 'badge-green' : 'badge-red'}`}>
                        DDM: {h.ddm ? '✓ Cumple' : '✗ No cumple'}
                      </span>
                      <span className="badge">Diversidad: {h.diversidad}/10</span>
                      <span className="badge">Alimentos: {h.alimentos}</span>
                      <span className="badge">{Helpers.num(h.kcal)} kcal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.historial.length >= 2 && (
              <div className="mt-3" style={{
                padding: 12, background: 'var(--success-100)', borderRadius: 8,
                fontSize: '0.85rem', color: '#065F46'
              }}>
                ✓ Esta persona cuenta con <strong>{result.historial.length} R24</strong>,
                lo que permite aproximarse a la <strong>ingesta usual</strong> según el estándar EFSA/USDA
                (mínimo 2 R24 en días no consecutivos).
              </div>
            )}
          </div>
        </div>
      )}

      {/* No encontrado */}
      {result && !result.found && (
        <div className="card fade-in" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <div className="h2" style={{ marginBottom: 8 }}>{t('buscarDni.notFound')}</div>
          <p className="muted" style={{ maxWidth: 480, margin: '0 auto 20px auto' }}>
            {t('buscarDni.notFoundHelp')}
          </p>
          <div className="flex gap-2" style={{ justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => Router.navigate('socioeconomico')}
            >
              + {t('buscarDni.createNew')}
            </button>
            <button className="btn btn-secondary" onClick={reset}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Ayuda inicial cuando aún no se ha buscado */}
      {!searched && (
        <div className="card" style={{ background: 'var(--unah-blue-50)', borderColor: 'var(--unah-blue-100)' }}>
          <div className="h3" style={{ color: 'var(--unah-blue-800)', marginBottom: 8 }}>
            💡 ¿Por qué buscar antes de capturar?
          </div>
          <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: 22, color: 'var(--gray-700)', lineHeight: 1.7 }}>
            <li>Evita duplicar registros de la misma persona en distintas visitas.</li>
            <li>Permite el análisis longitudinal: una persona, múltiples R24 en el tiempo.</li>
            <li>Aproximación a la <strong>ingesta usual</strong> requiere ≥ 2 R24 (EFSA/USDA).</li>
            <li>Para extranjeros, se acepta pasaporte o carné de residencia como identificador alternativo.</li>
          </ul>
        </div>
      )}
      {/* === Modales v1.1 === */}

      {/* Modal: Perfil completo */}
      <Modal
        open={showPerfil && !!result?.persona}
        onClose={() => setShowPerfil(false)}
        title={result?.persona ? `Perfil de ${result.persona.nombre}` : ''}
        subtitle={result?.persona ? `EXP-${String(result.persona.id).padStart(5,'0')} · DNI ${result.persona.dni}` : ''}
        size="lg"
        headerColor="var(--unah-blue-800)"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowPerfil(false)}>Cerrar</button>
          <button className="btn btn-primary">✏️ Editar perfil</button>
        </>}
      >
        {result?.persona && <PerfilCompleto persona={result.persona} />}
      </Modal>

      {/* Modal: Ver R24 */}
      <Modal
        open={!!r24View}
        onClose={() => setR24View(null)}
        title={r24View ? `R24 #${r24View.id}` : ''}
        subtitle={r24View ? `Fecha: ${r24View.fecha} · Recolectado por ${r24View.estudiante}` : ''}
        size="md"
        headerColor="var(--unah-blue-800)"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setR24View(null)}>Cerrar</button>
          <button className="btn" style={{ background: 'var(--unah-red-500)', color: 'white' }}
            onClick={() => { setR24Delete(r24View); setR24View(null); }}>
            ❌ Eliminar R24
          </button>
          <button className="btn btn-yellow" onClick={() => { setR24Edit(r24View); setR24View(null); }}>
            ✏️ Editar R24
          </button>
        </>}
      >
        {r24View && <DetalleR24 r24={r24View} persona={result?.persona} />}
      </Modal>

      {/* Modal: Editar R24 */}
      <Modal
        open={!!r24Edit}
        onClose={() => setR24Edit(null)}
        title={r24Edit ? `Editar R24 #${r24Edit.id}` : ''}
        size="lg"
        headerColor="var(--unah-yellow-700)"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setR24Edit(null)}>Cancelar</button>
          <button className="btn btn-yellow" onClick={() => {
            alert('(Prototipo) Cambios al R24 guardados.');
            setR24Edit(null);
          }}>💾 Guardar cambios</button>
        </>}
      >
        {r24Edit && (
          <div className="form-grid">
            <FormField label="Fecha del R24" span={6}>
              <input type="date" className="input" defaultValue={r24Edit.fecha} />
            </FormField>
            <FormField label="DDM" span={6}>
              <select className="select" defaultValue={r24Edit.ddm ? '1' : '0'}>
                <option value="1">Cumple (≥5 grupos)</option>
                <option value="0">No cumple</option>
              </select>
            </FormField>
            <FormField label="Diversidad (0-10)" span={6}>
              <input type="number" min="0" max="10" className="input" defaultValue={r24Edit.diversidad} />
            </FormField>
            <FormField label="Calorías" span={6}>
              <input type="number" className="input" defaultValue={r24Edit.kcal} />
            </FormField>
            <FormField label="Estudiante recolector" span={12}>
              <input className="input" defaultValue={r24Edit.estudiante} />
            </FormField>
            <FormField label="Centro de captura" span={12}>
              <input className="input" defaultValue={r24Edit.centro} />
            </FormField>
            <div style={{ gridColumn: 'span 12' }}>
              <div className="card-tight" style={{ background: 'var(--unah-yellow-100)', padding: 10, borderRadius: 6, fontSize: '0.82rem' }}>
                ℹ️ El detalle de alimentos del R24 se edita desde la pantalla R24 paso a paso.
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirmar eliminar R24 */}
      <Modal
        open={!!r24Delete}
        onClose={() => setR24Delete(null)}
        title="¿Eliminar este R24?"
        size="sm"
        headerColor="var(--unah-red-500)"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setR24Delete(null)}>Cancelar</button>
          <button className="btn" style={{ background: 'var(--unah-red-500)', color: 'white' }}
            onClick={() => {
              alert('(Prototipo) R24 eliminado. Acción registrada en auditoría.');
              setR24Delete(null);
            }}>🗑️ Eliminar R24</button>
        </>}
      >
        {r24Delete && (
          <div>
            <p>Está a punto de eliminar el siguiente R24:</p>
            <div className="card-tight" style={{ background: 'var(--unah-red-100)', padding: 14, marginTop: 12, borderRadius: 8 }}>
              <div><strong>R24 #:</strong> {r24Delete.id}</div>
              <div><strong>Fecha:</strong> {r24Delete.fecha}</div>
              <div><strong>Estudiante:</strong> {r24Delete.estudiante}</div>
            </div>
            <p className="mt-3 small muted">⚠️ Esta acción no se puede deshacer. Se eliminarán también todos los alimentos reportados en este R24.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===========================================================
// Componente: detalle de R24 (vista lectura)
// ===========================================================
const DetalleR24 = ({ r24, persona }) => {
  return (
    <div>
      {persona && (
        <div className="card-tight mb-3" style={{ background: 'var(--unah-blue-50)', padding: 12, borderRadius: 8 }}>
          <div className="muted small">Encuestado vinculado</div>
          <div style={{ fontWeight: 700, color: 'var(--unah-blue-800)' }}>{persona.nombre}</div>
          <div className="muted small">DNI <span style={{ fontFamily: 'monospace' }}>{persona.dni}</span> · {persona.edad} años · {persona.sexo}</div>
        </div>
      )}

      <div className="grid-12 mb-3">
        <div className="col-3" style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div className="muted small">DDM</div>
          <div style={{ fontSize: '1.4rem' }}>{r24.ddm ? '✅' : '❌'}</div>
        </div>
        <div className="col-3" style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div className="muted small">Diversidad</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--unah-blue-800)' }}>{r24.diversidad}/10</div>
        </div>
        <div className="col-3" style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div className="muted small">Alimentos</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{r24.alimentos}</div>
        </div>
        <div className="col-3" style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div className="muted small">kcal</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--unah-yellow-700)' }}>{r24.kcal ? r24.kcal.toLocaleString() : '—'}</div>
        </div>
      </div>

      <table className="table">
        <tbody>
          <tr><td><strong>R24 #</strong></td><td>{r24.id}</td></tr>
          <tr><td><strong>Fecha</strong></td><td>{r24.fecha}</td></tr>
          <tr><td><strong>Recolector (estudiante)</strong></td><td>{r24.estudiante}</td></tr>
          <tr><td><strong>Centro de captura</strong></td><td>{r24.centro}</td></tr>
        </tbody>
      </table>

      <div className="card-tight mt-3" style={{ background: 'var(--unah-yellow-100)', padding: 10, borderRadius: 6, fontSize: '0.82rem' }}>
        ℹ️ Para ver el detalle alimento por alimento de este R24, vaya a la pantalla R24 paso a paso (paso 5: Revisión).
      </div>
    </div>
  );
};

window.BuscarDNI = BuscarDNI;
