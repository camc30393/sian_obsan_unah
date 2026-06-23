/**
 * SIAN - Encuestados v1.1
 * Cambios:
 *   - Expediente = ID interno único de BD
 *   - DNI como columna ANTES del nombre (formato 0801-1994-02095)
 *   - Nombre solo el nombre (sin DNI debajo)
 *   - Botón "+ Nuevo encuestado" abre modal completo (4 secciones)
 *   - Botones lápiz (editar) y X (eliminar) después de columna estado
 *   - Click en fila abre modal de perfil completo
 */
const Encuestados = ({ user }) => {
  const [consentNuevo, setConsentNuevo] = React.useState(false);
  const t = (k) => I18n.t(k);
  const all = DataStore.get('encuestados') || [];
  const estudiantes = DataStore.get('estudiantes') || [];

  const [showNuevo, setShowNuevo] = React.useState(false);
  const [perfil, setPerfil] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const estMap = React.useMemo(() => {
    const m = {};
    estudiantes.forEach(e => { m[e.id] = e.nombre; });
    return m;
  }, [estudiantes]);

  const enriched = React.useMemo(() => {
    return all.map(e => ({
      ...e,
      _estudiante: estMap[e.id_estudiante] || '—',
      _ubicacion: [e.municipio, e.departamento].filter(Boolean).join(', '),
      _ddmText: e.ddm == null ? '—' : (e.ddm === 1 ? 'Sí' : 'No'),
      _estado: e.ddm != null ? 'completo' : (e.edad ? 'parcial' : 'pendiente_r24')
    }));
  }, [all, estMap]);

  const columns = [
    {
      key: 'expediente', label: 'Expediente',
      render: (v, row) => <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>EXP-{String(row.id).padStart(5, '0')}</span>
    },
    {
      key: 'dni', label: 'DNI',
      render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{v || '—'}</span>
    },
    {
      key: 'nombre', label: 'Nombre',
      render: (v) => <span style={{ fontWeight: 600 }}>{v || '—'}</span>
    },
    { key: 'edad', label: 'Edad' },
    {
      key: 'sexo', label: 'Sexo', filter: true,
      render: (v) => v ? <span className={`badge ${v === 'Mujer' ? 'badge-red' : 'badge-blue'}`}>{v}</span> : '—'
    },
    {
      key: 'etapa_vida', label: 'Etapa', filter: true,
      render: (v) => <span className="badge">{v}</span>
    },
    {
      key: '_ubicacion', label: 'Ubicación',
      render: (v) => <span style={{ fontSize: '0.78rem' }}>{v || '—'}</span>
    },
    {
      key: '_ddmText', label: 'DDM',
      render: (v, row) => row.ddm == null ? '—' : (
        <span className={`badge ${row.ddm === 1 ? 'badge-green' : 'badge-red'}`}>
          {row.ddm === 1 ? '✓' : '✗'}
        </span>
      )
    },
    {
      key: '_estado', label: 'Estado', filter: true,
      render: (v) => {
        const map = {
          completo: { cls: 'badge-green', label: 'Completo' },
          parcial: { cls: 'badge-yellow', label: 'Parcial' },
          pendiente_r24: { cls: 'badge-red', label: 'Pendiente R24' }
        };
        const m = map[v] || map.parcial;
        return <span className={`badge ${m.cls}`}>{m.label}</span>;
      }
    },
    {
      key: '_acciones', label: 'Acciones',
      render: (v, row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-sm" title="Editar"
            onClick={() => setEditing(row)}
          >✏️</button>
          <button
            className="btn btn-ghost btn-sm" title="Eliminar"
            style={{ color: 'var(--unah-red-500)' }}
            onClick={() => setConfirmDelete(row)}
          >❌</button>
        </div>
      )
    }
  ];

  const stats = {
    total: enriched.length,
    completos: enriched.filter(e => e._estado === 'completo').length,
    reales: enriched.filter(e => e.origen === 'C24_real').length,
    sinteticos: enriched.filter(e => e.origen === 'sintetico').length,
  };

  return (
    <div className="fade-in">
      <div className="grid-12 mb-4">
        <div className="col-3"><KPI label="Total encuestados" value={Helpers.num(stats.total)} icon="👥" /></div>
        <div className="col-3"><KPI label="Registros completos" value={Helpers.num(stats.completos)} icon="✓" iconColor="green" /></div>
        <div className="col-3"><KPI label="Datos C24 reales" value={Helpers.num(stats.reales)} icon="📋" iconColor="yellow" /></div>
        <div className="col-3"><KPI label="Sintéticos (etapas faltantes)" value={Helpers.num(stats.sinteticos)} icon="🧪" /></div>
      </div>

      <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span className="badge badge-blue">{stats.total} encuestados</span>
          {' '}
          <span className="badge badge-yellow">Prototipo · datos demo</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm">⬇️ Exportar</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNuevo(true)}>
            + Nuevo encuestado
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={enriched}
        pageSize={15}
        searchPlaceholder="Buscar por nombre, DNI, expediente, departamento..."
        onRowClick={(row) => setPerfil(row)}
      />

      {/* Modal: nuevo encuestado */}
      <Modal
        open={showNuevo}
        onClose={() => setShowNuevo(false)}
        title="+ Nuevo encuestado"
        subtitle="Complete los datos generales, demográficos, geográficos y socioeconómicos"
        size="lg"
        headerColor="var(--unah-blue-800)"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowNuevo(false)}>Cancelar</button>
            <button className="btn btn-primary" disabled={!consentNuevo} title={!consentNuevo ? 'Requiere consentimiento informado' : ''} onClick={() => {
              if (!consentNuevo) { alert('No se puede registrar sin consentimiento informado activo.'); return; }
              alert('(Prototipo) Encuestado registrado.\n\nEn producción, se guardaría en BD y se navegaría al perfil del nuevo registro.');
              setShowNuevo(false); setConsentNuevo(false);
            }}>💾 Guardar encuestado</button>
          </>
        }
      >
        <FormularioEncuestado consent={consentNuevo} setConsent={setConsentNuevo} />
      </Modal>

      {/* Modal: perfil completo */}
      <Modal
        open={!!perfil}
        onClose={() => setPerfil(null)}
        title={perfil ? `Perfil de ${perfil.nombre}` : ''}
        subtitle={perfil ? `EXP-${String(perfil.id).padStart(5,'0')} · DNI ${perfil.dni}` : ''}
        size="lg"
        headerColor="var(--unah-blue-800)"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPerfil(null)}>Cerrar</button>
            <button className="btn btn-primary" onClick={() => {
              setEditing(perfil); setPerfil(null);
            }}>✏️ Editar</button>
          </>
        }
      >
        {perfil && <PerfilCompleto persona={perfil} />}
      </Modal>

      {/* Modal: editar */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Editar: ${editing.nombre}` : ''}
        subtitle={editing ? `EXP-${String(editing.id).padStart(5,'0')}` : ''}
        size="lg"
        headerColor="var(--unah-yellow-700)"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn btn-yellow" onClick={() => {
              alert('(Prototipo) Cambios guardados.');
              setEditing(null);
            }}>💾 Guardar cambios</button>
          </>
        }
      >
        {editing && <FormularioEncuestado initial={editing} />}
      </Modal>

      {/* Modal: confirmar eliminación */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="¿Eliminar este encuestado?"
        size="sm"
        headerColor="var(--unah-red-500)"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'var(--unah-red-500)', color: 'white' }}
              onClick={() => {
                alert('(Prototipo) Registro eliminado.\n\nEn producción, esta acción se registra en auditoría con marca de tiempo y usuario.');
                setConfirmDelete(null);
              }}>🗑️ Eliminar</button>
          </>
        }
      >
        {confirmDelete && (
          <div>
            <p>Está a punto de eliminar el siguiente registro:</p>
            <div className="card-tight" style={{ background: 'var(--unah-red-100)', padding: 14, marginTop: 12, borderRadius: 8 }}>
              <div><strong>Expediente:</strong> EXP-{String(confirmDelete.id).padStart(5,'0')}</div>
              <div><strong>DNI:</strong> {confirmDelete.dni}</div>
              <div><strong>Nombre:</strong> {confirmDelete.nombre}</div>
            </div>
            <p className="mt-3 small muted">⚠️ Esta acción no se puede deshacer y eliminará también todos los R24 asociados a esta persona.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===========================================================
// Formulario completo de encuestado (4 secciones)
// ===========================================================
const FormularioEncuestado = ({ initial = {}, consent, setConsent }) => {
  const [dni, setDni] = React.useState(initial.dni || '');
  const dniValido = !dni || (window.Helpers && Helpers.validateDNI(dni));
  const [section, setSection] = React.useState(0);
  const sections = [
    { id: 0, label: '1. Generales', icon: '👤' },
    { id: 1, label: '2. Demográficos', icon: '📋' },
    { id: 2, label: '3. Geográficos', icon: '📍' },
    { id: 3, label: '4. Socioeconómicos', icon: '💰' }
  ];

  return (
    <div>
      {setConsent && (
        <div style={{ background: consent ? '#e7f6ec' : '#fde8eb', border: `1px solid ${consent ? '#9ed8b4' : '#f0a9b4'}`,
          borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: '0.85rem' }}>
          <label className="flex items-center gap-2" style={{ cursor:'pointer', fontWeight:600 }}>
            <input type="checkbox" checked={!!consent} onChange={(e) => setConsent(e.target.checked)} />
            Declaro que se obtuvo el <strong>consentimiento informado</strong> de la persona antes de capturar sus datos.
          </label>
          {!consent && <div className="small" style={{ color:'#c8102e', marginTop:4 }}>Sin consentimiento activo no se puede guardar el registro (requisito del comité de ética).</div>}
        </div>
      )}
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--gray-200)', flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: '10px 14px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: '0.85rem',
            fontWeight: section === s.id ? 700 : 500,
            color: section === s.id ? 'var(--unah-blue-800)' : 'var(--gray-600)',
            borderBottom: `3px solid ${section === s.id ? 'var(--unah-blue-800)' : 'transparent'}`,
            marginBottom: -2
          }}>{s.icon} {s.label}</button>
        ))}
      </div>

      {/* Sección 1: Generales */}
      {section === 0 && (
        <div className="form-grid">
          <FormField label="DNI" hint="Formato: 0801-1994-02095" span={6}>
            <input className="input" placeholder="0801-1994-02095" value={dni}
              onChange={(e) => setDni(e.target.value)}
              style={{ borderColor: dniValido ? undefined : 'var(--unah-red-500)' }} />
            {!dniValido && <div className="small" style={{ color:'var(--unah-red-500)', marginTop:2 }}>DNI inválido (formato 0000-0000-00000)</div>}
          </FormField>
          <FormField label="Documento alternativo (extranjeros)" span={6}>
            <input className="input" placeholder="Pasaporte / Carné de residencia" />
          </FormField>
          <FormField label="Nombres" span={6}>
            <input className="input" placeholder="Nombres" defaultValue={(initial.nombre || '').split(' ').slice(0,2).join(' ')} />
          </FormField>
          <FormField label="Apellidos" span={6}>
            <input className="input" placeholder="Apellidos" defaultValue={(initial.nombre || '').split(' ').slice(2).join(' ')} />
          </FormField>
          <FormField label="Fecha de nacimiento" hint="Calcula edad automáticamente" span={4}>
            <input type="date" className="input" defaultValue={initial.fecha_nac} />
          </FormField>
          <FormField label="Edad (años)" span={4}>
            <input type="number" className="input" defaultValue={initial.edad} />
          </FormField>
          <FormField label="Sexo" span={4}>
            <select className="select" defaultValue={initial.sexo}>
              <option value="">— Seleccione —</option>
              <option>Mujer</option><option>Hombre</option>
            </select>
          </FormField>
          <FormField label="Teléfono" span={6}>
            <input className="input" placeholder="9999-9999" />
          </FormField>
          <FormField label="N° de expediente clínico (opcional)" span={6}>
            <input className="input" placeholder="Si aplica" />
          </FormField>
        </div>
      )}

      {/* Sección 2: Demográficos */}
      {section === 1 && (
        <div className="form-grid">
          <FormField label="Estado civil" span={6}>
            <select className="select">
              <option>Soltero/a</option><option>Casado/a</option>
              <option>Unión libre</option><option>Divorciado/a</option>
              <option>Viudo/a</option>
            </select>
          </FormField>
          <FormField label="Grupo étnico (autoidentificación)" span={6}>
            <select className="select">
              <option>Mestizo/a</option><option>Lenca</option>
              <option>Garífuna</option><option>Miskitu</option>
              <option>Maya-Chortí</option><option>Tolupán</option>
              <option>Pech</option><option>Tawahka</option>
              <option>Negro inglés</option><option>Otro</option>
            </select>
          </FormField>
          <FormField label="Etapa de vida" span={6}>
            <select className="select" defaultValue={initial.etapa_vida}>
              <option>Lactante</option><option>Preescolar</option>
              <option>Escolar</option><option>Adolescente</option>
              <option>Adulto</option><option>Adulto mayor</option>
            </select>
          </FormField>
          <FormField label="Condición especial" span={6}>
            <select className="select">
              <option value="">— Ninguna —</option>
              <option>Embarazada</option><option>Lactancia materna</option>
            </select>
          </FormField>
          <FormField label="Nivel educativo" span={12}>
            <select className="select">
              <option>Sin escolaridad</option>
              <option>Primaria incompleta</option>
              <option>Primaria completa</option>
              <option>Secundaria incompleta</option>
              <option>Secundaria completa</option>
              <option>Universidad</option>
            </select>
          </FormField>
        </div>
      )}

      {/* Sección 3: Geográficos */}
      {section === 2 && <SeccionGeografica initial={initial} />}

      {/* Sección 4: Socioeconómicos */}
      {section === 3 && (
        <div className="form-grid">
          <FormField label="Ocupación" span={6}>
            <select className="select">
              <option>Ama de casa</option><option>Estudiante</option>
              <option>Trabajo no calificado</option><option>Comerciante</option>
              <option>Agricultor</option><option>Profesional</option>
              <option>Otra</option>
            </select>
          </FormField>
          <FormField label="Situación laboral" span={6}>
            <select className="select">
              <option>Empleado</option><option>Por cuenta propia</option>
              <option>Desempleado</option><option>Jubilado</option>
              <option>No aplica</option>
            </select>
          </FormField>
          <FormField label="Ingreso mensual del hogar" span={6}>
            <select className="select">
              <option>Menos de 1 salario mínimo</option>
              <option>Entre 1 y 2 salarios mínimos</option>
              <option>Más de 2 salarios mínimos</option>
            </select>
          </FormField>
          <FormField label="Cobertura de seguro social (IHSS u otra)" span={6}>
            <select className="select"><option>Sí</option><option>No</option></select>
          </FormField>
          <FormField label="Tipo de centro de captura" span={12}>
            <select className="select">
              <option>Centro de salud</option><option>Hospital</option>
              <option>Comunidad</option><option>Centro educativo</option>
              <option>Centro UNAH</option>
            </select>
          </FormField>
        </div>
      )}
    </div>
  );
};

// ===========================================================
// Sección geográfica con filtrado depto→municipio condicional
// ===========================================================
const SeccionGeografica = ({ initial = {} }) => {
  const geo = DataStore.get('geografia_honduras') || [];
  const [pais, setPais] = React.useState(initial.pais || 'Honduras');
  const [depto, setDepto] = React.useState(initial.departamento || '');
  const [muni, setMuni] = React.useState(initial.municipio || '');

  const isHonduras = pais === 'Honduras';

  const departamentos = React.useMemo(() => {
    if (!isHonduras) return [];
    return geo.map(g => g.departamento).sort();
  }, [geo, isHonduras]);

  const municipios = React.useMemo(() => {
    if (!isHonduras || !depto) return [];
    const d = geo.find(g => g.departamento === depto);
    if (!d) return [];
    return (d.municipios || []).map(m => m.nombre).sort();
  }, [geo, depto, isHonduras]);

  return (
    <div className="form-grid">
      <FormField label="País" span={6}>
        <select className="select" value={pais} onChange={(e) => { setPais(e.target.value); setDepto(''); setMuni(''); }}>
          <option>Honduras</option>
          <option>Guatemala</option><option>El Salvador</option>
          <option>Nicaragua</option><option>Costa Rica</option>
          <option>Belice</option><option>México</option>
          <option>Estados Unidos</option><option>Otro</option>
        </select>
      </FormField>
      <FormField label="Área de vivienda" span={6}>
        <select className="select">
          <option>1. Urbana</option><option>2. Rural</option>
        </select>
      </FormField>

      {/* Si Honduras, selectores con filtrado */}
      {isHonduras ? (
        <>
          <FormField label="Departamento" hint={`${departamentos.length} disponibles`} span={6}>
            <select className="select" value={depto} onChange={(e) => { setDepto(e.target.value); setMuni(''); }}>
              <option value="">— Seleccione —</option>
              {departamentos.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Municipio" hint={depto ? `${municipios.length} en ${depto}` : 'Seleccione depto. primero'} span={6}>
            <select className="select" value={muni} onChange={(e) => setMuni(e.target.value)} disabled={!depto}>
              <option value="">— Seleccione —</option>
              {municipios.map(m => <option key={m}>{m}</option>)}
            </select>
          </FormField>
        </>
      ) : (
        // Si país no es Honduras → texto libre
        <>
          <FormField label="Estado / Departamento / Provincia" hint="Texto libre" span={6}>
            <input className="input" placeholder="Ingrese región" />
          </FormField>
          <FormField label="Ciudad / Municipio" hint="Texto libre" span={6}>
            <input className="input" placeholder="Ingrese ciudad" />
          </FormField>
        </>
      )}

      <FormField label="Comunidad / aldea / barrio" span={6}>
        <input className="input" placeholder="Nombre específico" />
      </FormField>
      <FormField label="Tipo de localidad" span={6}>
        <select className="select">
          <option>Caserío</option><option>Aldea</option>
          <option>Barrio</option><option>Colonia</option>
          <option>Residencial</option>
        </select>
      </FormField>
      <FormField label="GPS Latitud" span={6}>
        <input className="input" placeholder="Capturar GPS" />
      </FormField>
      <FormField label="GPS Longitud" span={6}>
        <input className="input" placeholder="Capturar GPS" />
      </FormField>
    </div>
  );
};

// ===========================================================
// Perfil completo (vista lectura)
// ===========================================================
const PerfilCompleto = ({ persona }) => {
  return (
    <div>
      <div className="grid-12 mb-3">
        <div className="col-12 card-tight" style={{ background: 'var(--unah-blue-50)', padding: 14, borderRadius: 8 }}>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="muted small">Identificación</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--unah-blue-800)' }}>{persona.nombre}</div>
              <div className="muted small">DNI <span style={{ fontFamily: 'monospace' }}>{persona.dni}</span></div>
              <div className="muted small">Expediente: <strong>EXP-{String(persona.id).padStart(5,'0')}</strong></div>
            </div>
            <div>
              <div className="muted small">Estado del registro</div>
              <span className={`badge ${persona.ddm == null ? 'badge-yellow' : 'badge-green'}`}>
                {persona.ddm == null ? 'Parcial' : '✓ Completo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h4 style={{ color: 'var(--unah-blue-800)', marginTop: 0 }}>Datos demográficos</h4>
      <table className="table" style={{ marginBottom: 16 }}>
        <tbody>
          <tr><td><strong>Edad</strong></td><td>{persona.edad} años</td>
              <td><strong>Sexo</strong></td><td>{persona.sexo || '—'}</td></tr>
          <tr><td><strong>Etapa de vida</strong></td><td>{persona.etapa_vida || '—'}</td>
              <td><strong>Estado civil</strong></td><td>{persona.estado_civil || '—'}</td></tr>
          <tr><td><strong>Grupo étnico</strong></td><td colSpan="3">{persona.grupo_etnico || '—'}</td></tr>
        </tbody>
      </table>

      <h4 style={{ color: 'var(--unah-blue-800)' }}>Ubicación</h4>
      <table className="table" style={{ marginBottom: 16 }}>
        <tbody>
          <tr><td><strong>País</strong></td><td>{persona.pais || 'Honduras'}</td>
              <td><strong>Área</strong></td><td>{persona.area_vivienda || '—'}</td></tr>
          <tr><td><strong>Departamento</strong></td><td>{persona.departamento || '—'}</td>
              <td><strong>Municipio</strong></td><td>{persona.municipio || '—'}</td></tr>
          <tr><td><strong>Comunidad</strong></td><td colSpan="3">{persona.comunidad || '—'}</td></tr>
        </tbody>
      </table>

      <h4 style={{ color: 'var(--unah-blue-800)' }}>Socioeconómico</h4>
      <table className="table" style={{ marginBottom: 16 }}>
        <tbody>
          <tr><td><strong>Nivel educativo</strong></td><td>{persona.nivel_educativo || '—'}</td>
              <td><strong>Ocupación</strong></td><td>{persona.ocupacion || '—'}</td></tr>
          <tr><td><strong>NSE</strong></td><td>{persona.nivel_se || '—'}</td>
              <td><strong>DDM</strong></td>
              <td>{persona.ddm == null ? '—' :
                <span className={`badge ${persona.ddm === 1 ? 'badge-green' : 'badge-red'}`}>
                  {persona.ddm === 1 ? '✓ Cumple' : '✗ No cumple'}
                </span>}</td></tr>
        </tbody>
      </table>

      <div className="card" style={{ background: 'var(--unah-yellow-100)', borderColor: 'var(--unah-yellow-500)' }}>
        <div className="small">
          📅 <strong>Última visita:</strong> {persona.fecha || '—'} ·
          <strong> Recolectado por:</strong> {persona._estudiante || '—'}
        </div>
      </div>
    </div>
  );
};

window.Encuestados = Encuestados;
