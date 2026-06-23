/**
 * SIAN - KPI
 * Tarjeta de indicador clave con etiqueta, valor, ícono y tooltip explicativo.
 * Cada KPI lleva una nota informativa accesible vía hover (cumple requisito
 * de explicar significado de cada indicador).
 */
const KPI = ({ label, value, icon, iconColor, help, trend, suffix = '' }) => {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <div className="kpi">
      <div className="kpi-label">
        {label}
        {help && (
          <span
            className="tooltip-icon"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            onClick={() => setShowHelp(!showHelp)}
          >ℹ</span>
        )}
        {showHelp && (
          <div style={{
            position: 'absolute',
            top: 36, right: 14,
            background: 'var(--gray-900)', color: 'white',
            padding: '8px 12px', borderRadius: 6,
            fontSize: '0.75rem', fontWeight: 'normal',
            maxWidth: 240, zIndex: 20,
            boxShadow: 'var(--shadow-md)',
            textTransform: 'none', letterSpacing: 0
          }}>
            {help}
          </div>
        )}
      </div>
      <div className="kpi-value">{value}{suffix && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--gray-500)' }}>{suffix}</span>}</div>
      {trend && (
        <div className={`kpi-trend ${trend.dir}`}>
          {trend.dir === 'up' ? '↑' : '↓'} {trend.text}
        </div>
      )}
      {icon && <div className={`kpi-icon ${iconColor || ''}`}>{icon}</div>}
    </div>
  );
};

window.KPI = KPI;
