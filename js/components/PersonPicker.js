/**
 * SIDH - PersonPicker
 * Componente para seleccionar un encuestado existente (por DNI o nombre)
 * o registrar un padre/tutor para infantes.
 *
 * Props: value (objeto persona seleccionada), onChange, allowTutor (bool)
 */
const PersonPicker = ({ value, onChange, allowTutor = false, label }) => {
  const t = (k) => I18n.t(k);
  const encuestados = DataStore.get('encuestados') || [];
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [tutorMode, setTutorMode] = React.useState(false);
  const [tutorData, setTutorData] = React.useState({ dni: '', nombre: '' });

  // Resultados de búsqueda
  const results = React.useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return encuestados.filter(e =>
      ((e.nombre || '') + '').toLowerCase().includes(q) ||
      ((e.dni || '') + '').includes(q)
    ).slice(0, 8);
  }, [search, encuestados]);

  if (value) {
    return (
      <div style={{
        background: 'var(--unah-blue-50)',
        border: '2px solid var(--unah-blue-600)',
        borderRadius: 8, padding: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 10, flexWrap: 'wrap'
      }}>
        <div>
          <div className="small muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label || 'Encuestado vinculado'}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--unah-blue-800)', fontSize: '1rem', marginTop: 2 }}>
            {value.nombre}
          </div>
          <div className="muted small">
            DNI <span style={{ fontFamily: 'monospace' }}>{value.dni}</span>
            {value.edad && ` · ${value.edad} años`}
            {value.sexo && ` · ${value.sexo}`}
            {value.tutor && <span className="badge badge-yellow" style={{ marginLeft: 6 }}>Vía tutor: {value.tutor.nombre}</span>}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { onChange(null); setSearch(''); }}>
          ✕ Cambiar
        </button>
      </div>
    );
  }

  return (
    <div>
      {label && <div className="small muted" style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>}

      <div style={{ position: 'relative' }}>
        <input
          className="input"
          placeholder="Buscar por DNI (ej. 0801-1990-12345) o nombre..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{ paddingLeft: 36 }}
        />
        <span style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--gray-400)'
        }}>🔍</span>
      </div>

      {/* Dropdown de resultados */}
      {open && search.length > 0 && results.length > 0 && (
        <div style={{
          background: 'white', border: '1px solid var(--gray-300)',
          borderRadius: 6, marginTop: 4, maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          {results.map(p => (
            <div key={p.id} onClick={() => { onChange(p); setSearch(''); setOpen(false); }}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                borderBottom: '1px solid var(--gray-100)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--unah-blue-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                <div className="muted small" style={{ fontFamily: 'monospace' }}>
                  {p.dni} · {p.edad} años · {p.sexo}
                </div>
              </div>
              <span className="btn btn-primary btn-sm">Seleccionar</span>
            </div>
          ))}
        </div>
      )}

      {open && search.length > 0 && results.length === 0 && (
        <div className="muted small" style={{ marginTop: 6 }}>
          Sin resultados. Verifique el DNI o intente con otro nombre.
        </div>
      )}

      {/* Modo tutor para infantes */}
      {allowTutor && (
        <div className="card mt-2" style={{
          background: 'var(--unah-yellow-100)',
          borderColor: 'var(--unah-yellow-500)',
          padding: 12
        }}>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={tutorMode} onChange={(e) => setTutorMode(e.target.checked)} />
            <span><strong>👶 Es un infante.</strong> Registrar a través de padre o tutor responsable.</span>
          </label>
          {tutorMode && (
            <div className="form-grid mt-2">
              <FormField label="DNI del tutor" span={6}>
                <input className="input" placeholder="0801-1990-12345"
                  value={tutorData.dni}
                  onChange={(e) => setTutorData({ ...tutorData, dni: e.target.value })} />
              </FormField>
              <FormField label="Nombre del tutor" span={6}>
                <input className="input" placeholder="Nombre completo"
                  value={tutorData.nombre}
                  onChange={(e) => setTutorData({ ...tutorData, nombre: e.target.value })} />
              </FormField>
              <FormField label="Parentesco" span={6}>
                <select className="select">
                  <option>Madre</option><option>Padre</option>
                  <option>Abuela/o</option><option>Tía/o</option><option>Otro tutor legal</option>
                </select>
              </FormField>
              <FormField label="DNI del infante (si tiene)" span={6}>
                <input className="input" placeholder="Opcional - certificado de nacimiento" />
              </FormField>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

window.PersonPicker = PersonPicker;
