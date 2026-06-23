/**
 * SIAN - ChartCard
 * Wrapper estándar para tarjetas con visualización: título, descripción
 * y tooltip de ayuda. Mantiene consistencia visual en todo el dashboard.
 */
const ChartCard = ({ title, help, children, action }) => {
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="h3" style={{ margin: 0 }}>{title}</span>
          {help && (
            <span
              className="tooltip-icon"
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
            >ℹ</span>
          )}
        </div>
        {action}
      </div>
      {showHelp && (
        <div style={{
          position: 'absolute', top: 48, left: 20,
          background: 'var(--gray-900)', color: 'white',
          padding: '8px 12px', borderRadius: 6,
          fontSize: '0.75rem', maxWidth: 320, zIndex: 20,
          boxShadow: 'var(--shadow-md)'
        }}>
          {help}
        </div>
      )}
      {children}
    </div>
  );
};

window.ChartCard = ChartCard;
