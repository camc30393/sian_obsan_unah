/**
 * SIDH - Auditoría
 * Registro detallado de todas las operaciones del sistema con filtros
 * por usuario, módulo, acción, fecha y resultado.
 *
 * En el prototipo, el log se genera sintéticamente con eventos coherentes
 * y realistas (logins, modificaciones, exportaciones, anomalías).
 */
const Auditoria = () => {
  const t = (k) => I18n.t(k);

  // Generar log sintético determinista (200 entradas)
  const log = React.useMemo(() => {
    const usuarios = [
      { name: 'Christian Manzanares', rol: 'admin' },
      { name: 'Patricia Ochoa', rol: 'investigador' },
      { name: 'María Luisa García', rol: 'docente' },
      { name: 'Elena Rivera', rol: 'docente' },
      { name: 'Estudiante PIS-08', rol: 'estudiante' },
      { name: 'Estudiante SSC-12', rol: 'estudiante' },
      { name: 'Fiama García', rol: 'investigador' },
      { name: 'Estudiante PIS-23', rol: 'estudiante' }
    ];
    const acciones = ['login', 'logout', 'create', 'update', 'delete', 'export', 'view'];
    const modulos = ['Encuestados', 'Antropometría', 'R24', 'Catálogos', 'Usuarios', 'Reportes', 'Exportación', 'Login'];
    const entidades = ['Encuestado #4592', 'R24 #88123', 'Usuario u-035', 'Receta "Baleada"', 'Catálogo INCAP', 'Sesión'];
    const resultados = ['success', 'success', 'success', 'success', 'failed', 'warning'];

    const out = [];
    let date = new Date('2026-04-28T16:30:00');
    for (let i = 0; i < 200; i++) {
      // Restar tiempo en intervalos de 1-30 minutos para crear historial
      date = new Date(date.getTime() - (1 + Math.floor(Math.random() * 30)) * 60000);
      const u = usuarios[Math.floor(Math.random() * usuarios.length)];
      const accion = acciones[Math.floor(Math.random() * acciones.length)];
      const modulo = modulos[Math.floor(Math.random() * modulos.length)];
      const resultado = resultados[Math.floor(Math.random() * resultados.length)];
      out.push({
        id: i,
        fecha: date.toISOString().slice(0, 19).replace('T', ' '),
        usuario: u.name,
        rol: u.rol,
        accion,
        modulo,
        entidad: entidades[Math.floor(Math.random() * entidades.length)],
        ip: `10.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
        resultado
      });
    }
    return out;
  }, []);

  const [filterUser, setFilterUser] = React.useState('');
  const [filterModule, setFilterModule] = React.useState('');
  const [filterAction, setFilterAction] = React.useState('');
  const [filterResult, setFilterResult] = React.useState('');
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 15;

  const filtered = React.useMemo(() => {
    return log.filter(e =>
      (!filterUser || e.usuario === filterUser) &&
      (!filterModule || e.modulo === filterModule) &&
      (!filterAction || e.accion === filterAction) &&
      (!filterResult || e.resultado === filterResult)
    );
  }, [log, filterUser, filterModule, filterAction, filterResult]);

  React.useEffect(() => { setPage(1); }, [filterUser, filterModule, filterAction, filterResult]);

  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Anomalías detectadas (simuladas)
  const anomalias = [
    { tipo: 'Acceso fuera de horario', detalle: '3 inicios de sesión entre 23:00 y 04:00 esta semana', severidad: 'media' },
    { tipo: 'Múltiples intentos fallidos', detalle: '5 intentos de login fallidos para u-072 en 10 minutos', severidad: 'alta' },
    { tipo: 'Exportación masiva', detalle: 'Exportación de >5,000 registros por usuario u-008', severidad: 'baja' }
  ];

  // KPIs
  const stats = React.useMemo(() => ({
    total: log.length,
    fallidos: log.filter(e => e.resultado === 'failed').length,
    advertencias: log.filter(e => e.resultado === 'warning').length,
    usuariosUnicos: new Set(log.map(e => e.usuario)).size
  }), [log]);

  const accionBadge = (accion) => {
    const map = {
      login: 'badge-blue', logout: '', create: 'badge-green',
      update: 'badge-yellow', delete: 'badge-red', export: 'badge-blue', view: ''
    };
    return <span className={`badge ${map[accion] || ''}`}>{t(`auditoria.actions.${accion}`)}</span>;
  };

  const resultadoIcon = (res) => {
    if (res === 'success') return <span style={{ color: 'var(--success-500)', fontWeight: 700 }}>✓</span>;
    if (res === 'failed') return <span style={{ color: 'var(--unah-red-500)', fontWeight: 700 }}>✗</span>;
    return <span style={{ color: 'var(--warning-500)', fontWeight: 700 }}>⚠</span>;
  };

  // Listas únicas para filtros
  const usuariosUnicos = [...new Set(log.map(e => e.usuario))].sort();
  const modulosUnicos = [...new Set(log.map(e => e.modulo))].sort();

  return (
    <div className="fade-in">
      {/* KPIs */}
      <div className="grid-12 mb-3">
        <div className="col-3"><KPI label="Eventos registrados" value={Helpers.num(stats.total)} icon="📋" /></div>
        <div className="col-3"><KPI label="Operaciones fallidas" value={stats.fallidos} icon="✗" iconColor="red" /></div>
        <div className="col-3"><KPI label="Advertencias" value={stats.advertencias} icon="⚠" iconColor="yellow" /></div>
        <div className="col-3"><KPI label="Usuarios únicos hoy" value={stats.usuariosUnicos} icon="👥" iconColor="green" /></div>
      </div>

      {/* Anomalías destacadas */}
      <div className="card mb-3" style={{ background: 'var(--unah-red-100)', borderColor: 'var(--unah-red-500)' }}>
        <div className="h3" style={{ color: 'var(--unah-red-700)', marginBottom: 8 }}>
          🚨 {t('auditoria.anomaly')} ({anomalias.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {anomalias.map((a, i) => (
            <div key={i} style={{
              background: 'white', padding: '8px 12px', borderRadius: 6,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <strong>{a.tipo}:</strong> <span className="muted small">{a.detalle}</span>
              </div>
              <span className={`badge ${a.severidad === 'alta' ? 'badge-red' : a.severidad === 'media' ? 'badge-yellow' : ''}`}>
                {a.severidad}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="card-tight mb-3" style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 12 }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="small muted" style={{ fontWeight: 700 }}>Filtros:</span>
          <select className="select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} style={{ width: 'auto', fontSize: 13 }}>
            <option value="">— Todos los usuarios —</option>
            {usuariosUnicos.map(u => <option key={u}>{u}</option>)}
          </select>
          <select className="select" value={filterModule} onChange={(e) => setFilterModule(e.target.value)} style={{ width: 'auto', fontSize: 13 }}>
            <option value="">— Todos los módulos —</option>
            {modulosUnicos.map(m => <option key={m}>{m}</option>)}
          </select>
          <select className="select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ width: 'auto', fontSize: 13 }}>
            <option value="">— Todas las acciones —</option>
            <option value="login">{t('auditoria.actions.login')}</option>
            <option value="create">{t('auditoria.actions.create')}</option>
            <option value="update">{t('auditoria.actions.update')}</option>
            <option value="delete">{t('auditoria.actions.delete')}</option>
            <option value="export">{t('auditoria.actions.export')}</option>
          </select>
          <select className="select" value={filterResult} onChange={(e) => setFilterResult(e.target.value)} style={{ width: 'auto', fontSize: 13 }}>
            <option value="">— Todos los resultados —</option>
            <option value="success">{t('auditoria.results.success')}</option>
            <option value="failed">{t('auditoria.results.failed')}</option>
            <option value="warning">{t('auditoria.results.warning')}</option>
          </select>
          <div className="muted small" style={{ marginLeft: 'auto' }}>
            {Helpers.num(filtered.length)} eventos
          </div>
          <button className="btn btn-secondary btn-sm">📤 {t('auditoria.exportLog')}</button>
        </div>
      </div>

      {/* Tabla del log */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-200)', overflow: 'auto' }}>
        <table className="table" style={{ fontSize: '0.82rem' }}>
          <thead>
            <tr>
              <th style={{ width: 150 }}>{t('auditoria.table.fecha')}</th>
              <th>{t('auditoria.table.usuario')}</th>
              <th>{t('auditoria.table.accion')}</th>
              <th>{t('auditoria.table.modulo')}</th>
              <th>{t('auditoria.table.entidad')}</th>
              <th style={{ width: 120 }}>{t('auditoria.table.ip')}</th>
              <th style={{ width: 70, textAlign: 'center' }}>{t('auditoria.table.resultado')}</th>
            </tr>
          </thead>
          <tbody>
            {slice.map(e => (
              <tr key={e.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{e.fecha}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{e.usuario}</div>
                  <div className="muted" style={{ fontSize: '0.7rem' }}>{e.rol}</div>
                </td>
                <td>{accionBadge(e.accion)}</td>
                <td>{e.modulo}</td>
                <td className="muted small">{e.entidad}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{e.ip}</td>
                <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>{resultadoIcon(e.resultado)}</td>
              </tr>
            ))}
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

window.Auditoria = Auditoria;
