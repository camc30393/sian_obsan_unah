/**
 * SIAN - DataTable
 * Tabla de datos reutilizable con:
 *   - Paginación
 *   - Búsqueda global
 *   - Filtros por columna
 *   - Renderizado custom de celdas
 *   - Acciones por fila
 *
 * Props:
 *   columns: [{ key, label, render?, filter? }]
 *   data: array de objetos
 *   pageSize: int (default 10)
 *   onRowClick?: function
 */
const DataTable = ({ columns, data, pageSize = 10, onRowClick, searchPlaceholder, emptyMessage }) => {
  const t = (k) => I18n.t(k);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [filters, setFilters] = React.useState({});

  // Aplicar búsqueda y filtros
  const filtered = React.useMemo(() => {
    let result = data;
    // Filtros por columna
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== '__all__') {
        result = result.filter(row => String(row[k] || '') === String(v));
      }
    });
    // Búsqueda global (texto)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v =>
          String(v || '').toLowerCase().includes(q)
        )
      );
    }
    return result;
  }, [data, search, filters]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Filtros disponibles (extraídos de los datos para columnas con filter:true)
  const filterableColumns = columns.filter(c => c.filter);

  return (
    <div>
      {/* Toolbar: búsqueda + filtros */}
      <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <input
            className="input"
            placeholder={searchPlaceholder || t('common.search') + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13 }}
          />
          <span style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--gray-400)'
          }}>🔍</span>
        </div>

        {filterableColumns.map(col => {
          const opts = [...new Set(data.map(r => r[col.key]).filter(Boolean))].sort();
          return (
            <select
              key={col.key}
              className="select"
              style={{ width: 'auto', fontSize: 13, padding: '8px 28px 8px 10px' }}
              value={filters[col.key] || '__all__'}
              onChange={(e) => setFilters({ ...filters, [col.key]: e.target.value })}
            >
              <option value="__all__">{col.label}: {t('common.all')}</option>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          );
        })}

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
          {t('common.showing')} <strong>{filtered.length}</strong> {t('common.results')}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--gray-200)', overflow: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              {columns.map(c => <th key={c.key}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
                  {emptyMessage || t('common.noData')}
                </td>
              </tr>
            )}
            {slice.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map(c => (
                  <td key={c.key}>
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3" style={{ fontSize: '0.85rem' }}>
          <div className="muted">
            {t('common.page')} <strong>{page}</strong> {t('common.of')} <strong>{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >← {t('common.previous')}</button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >{t('common.next')} →</button>
          </div>
        </div>
      )}
    </div>
  );
};

window.DataTable = DataTable;
