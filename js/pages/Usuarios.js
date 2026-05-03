/**
 * SIDH - Usuarios
 * Gestión de cuentas y permisos del sistema. En el prototipo se generan
 * usuarios sintéticos a partir de los estudiantes reales del C24 más
 * algunos perfiles institucionales (docentes, investigadores, admin).
 */
const Usuarios = () => {
  const t = (k) => I18n.t(k);
  const estudiantes = DataStore.get('estudiantes') || [];

  // Construir lista de usuarios desde los estudiantes + otros roles ficticios
  const usuarios = React.useMemo(() => {
    const list = [];
    // Admins y docentes ficticios coherentes con el contexto del proyecto
    list.push(
      { id: 'u1', nombre: 'Christian A. Manzanares Cruz', cuenta: '20081012345', rol: 'admin', centro: 'OBSAN-UNAH', estado: 'activo', ultimo: '2026-04-28 09:15' },
      { id: 'u2', nombre: 'Patricia Ochoa', cuenta: '19940056789', rol: 'investigador', centro: 'OBSAN-UNAH', estado: 'activo', ultimo: '2026-04-27 16:42' },
      { id: 'u3', nombre: 'Elizabeth León', cuenta: '19920134567', rol: 'investigador', centro: 'OBSAN-UNAH', estado: 'activo', ultimo: '2026-04-28 08:30' },
      { id: 'u4', nombre: 'María Luisa García', cuenta: '20051098765', rol: 'docente', centro: 'Carrera de Nutrición', estado: 'activo', ultimo: '2026-04-27 14:10' },
      { id: 'u5', nombre: 'Elena Rivera', cuenta: '20091023456', rol: 'docente', centro: 'Carrera de Nutrición', estado: 'activo', ultimo: '2026-04-26 11:25' },
      { id: 'u6', nombre: 'Fiama García', cuenta: '20111076543', rol: 'investigador', centro: 'OBSAN-UNAH', estado: 'activo', ultimo: '2026-04-28 07:55' }
    );
    // Estudiantes reales del C24 como usuarios "estudiante"
    estudiantes.forEach(e => {
      list.push({
        id: 'e' + e.id,
        nombre: e.nombre,
        cuenta: e.cuenta,
        rol: 'estudiante',
        centro: e.centro || 'No especificado',
        estado: Math.random() > 0.15 ? 'activo' : (Math.random() > 0.5 ? 'inactivo' : 'bloqueado'),
        ultimo: '2026-' + String(Math.floor(Math.random() * 4) + 1).padStart(2, '0') + '-' +
          String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' ' +
          String(Math.floor(Math.random() * 10) + 8).padStart(2, '0') + ':' +
          String(Math.floor(Math.random() * 60)).padStart(2, '0')
      });
    });
    return list;
  }, [estudiantes]);

  const [search, setSearch] = React.useState('');
  const [filterRol, setFilterRol] = React.useState('');
  const [filterEstado, setFilterEstado] = React.useState('');
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 12;

  const filtered = React.useMemo(() => {
    let r = usuarios;
    if (filterRol) r = r.filter(u => u.rol === filterRol);
    if (filterEstado) r = r.filter(u => u.estado === filterEstado);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        u.cuenta.includes(q) ||
        u.centro.toLowerCase().includes(q)
      );
    }
    return r;
  }, [usuarios, search, filterRol, filterEstado]);

  React.useEffect(() => { setPage(1); }, [search, filterRol, filterEstado]);

  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Conteos por rol
  const stats = React.useMemo(() => ({
    total: usuarios.length,
    estudiantes: usuarios.filter(u => u.rol === 'estudiante').length,
    docentes: usuarios.filter(u => u.rol === 'docente').length,
    investigadores: usuarios.filter(u => u.rol === 'investigador').length,
    admins: usuarios.filter(u => u.rol === 'admin').length,
    activos: usuarios.filter(u => u.estado === 'activo').length
  }), [usuarios]);

  const rolBadge = (rol) => {
    const map = {
      estudiante: { cls: 'badge-blue', icon: '🎓' },
      docente: { cls: 'badge-yellow', icon: '📚' },
      investigador: { cls: 'badge-green', icon: '🔬' },
      admin: { cls: 'badge-red', icon: '⚙️' }
    };
    const m = map[rol] || map.estudiante;
    return <span className={`badge ${m.cls}`}>{m.icon} {t(`usuarios.roles.${rol}`)}</span>;
  };

  const estadoBadge = (estado) => {
    const map = {
      activo: { cls: 'badge-green', icon: '●' },
      inactivo: { cls: '', icon: '○' },
      bloqueado: { cls: 'badge-red', icon: '🚫' },
      pendiente: { cls: 'badge-yellow', icon: '⌛' }
    };
    const m = map[estado] || map.inactivo;
    return <span className={`badge ${m.cls}`}>{m.icon} {t(`usuarios.estados.${estado}`)}</span>;
  };

  return (
    <div className="fade-in">
      {/* KPIs */}
      <div className="grid-12 mb-3">
        <div className="col-3"><KPI label="Total usuarios" value={stats.total} icon="👥" /></div>
        <div className="col-3"><KPI label="Activos" value={stats.activos} icon="●" iconColor="green" /></div>
        <div className="col-3"><KPI label="Estudiantes PIS/SSC" value={stats.estudiantes} icon="🎓" iconColor="yellow" /></div>
        <div className="col-3"><KPI label="Docentes + investigadores" value={stats.docentes + stats.investigadores} icon="🔬" /></div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <input className="input" placeholder={t('usuarios.search')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }} />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>🔍</span>
        </div>
        <select className="select" value={filterRol} onChange={(e) => setFilterRol(e.target.value)} style={{ width: 'auto' }}>
          <option value="">— Todos los roles —</option>
          <option value="estudiante">{t('usuarios.roles.estudiante')}</option>
          <option value="docente">{t('usuarios.roles.docente')}</option>
          <option value="investigador">{t('usuarios.roles.investigador')}</option>
          <option value="admin">{t('usuarios.roles.admin')}</option>
        </select>
        <select className="select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ width: 'auto' }}>
          <option value="">— Todos los estados —</option>
          <option value="activo">{t('usuarios.estados.activo')}</option>
          <option value="inactivo">{t('usuarios.estados.inactivo')}</option>
          <option value="bloqueado">{t('usuarios.estados.bloqueado')}</option>
        </select>
        <div className="muted small" style={{ marginLeft: 'auto' }}>
          {t('common.showing')} <strong>{filtered.length}</strong> {t('common.results')}
        </div>
        <button className="btn btn-primary btn-sm">+ {t('usuarios.addNew')}</button>
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-200)', overflow: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('usuarios.table.nombre')}</th>
              <th>{t('usuarios.table.cuenta')}</th>
              <th>{t('usuarios.table.rol')}</th>
              <th>{t('usuarios.table.centro')}</th>
              <th>{t('usuarios.table.estado')}</th>
              <th>{t('usuarios.table.ultimoAcceso')}</th>
              <th>{t('usuarios.table.acciones')}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{u.cuenta}</td>
                <td>{rolBadge(u.rol)}</td>
                <td className="muted small">{Helpers.truncate(u.centro, 30)}</td>
                <td>{estadoBadge(u.estado)}</td>
                <td className="muted small">{u.ultimo}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" title={t('usuarios.actions.edit')}>✏️</button>
                  <button className="btn btn-ghost btn-sm" title={t('usuarios.actions.reset')}>🔑</button>
                  <button className="btn btn-ghost btn-sm" title={t('usuarios.actions.permissions')}>🔐</button>
                </td>
              </tr>
            ))}
            {slice.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
                Sin resultados
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3" style={{ fontSize: '0.85rem' }}>
          <div className="muted">{t('common.page')} <strong>{page}</strong> {t('common.of')} <strong>{totalPages}</strong></div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← {t('common.previous')}</button>
            <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next')} →</button>
          </div>
        </div>
      )}
    </div>
  );
};

window.Usuarios = Usuarios;
