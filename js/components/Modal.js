/**
 * SIDH - Modal genérico reutilizable
 * Props: open, onClose, title, subtitle, size ('sm'|'md'|'lg'|'xl'),
 *        children, footer (componente o array de botones)
 */
const Modal = ({ open, onClose, title, subtitle, size = 'md', children, footer, headerColor }) => {
  if (!open) return null;
  const widths = { sm: 420, md: 640, lg: 880, xl: 1100 };
  const maxWidth = widths[size] || 640;

  // Cerrar con Escape
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} className="modal-backdrop" style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 16
    }}>
      <div onClick={(e) => e.stopPropagation()} className="modal-box fade-in" style={{
        background: 'white', borderRadius: 12,
        maxWidth, width: '100%', maxHeight: '92vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--gray-200)',
          background: headerColor || 'white',
          color: headerColor ? 'white' : 'var(--gray-900)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            {title && <div style={{ fontSize: '1.15rem', fontWeight: 700, color: headerColor ? 'white' : 'var(--unah-blue-800)' }}>{title}</div>}
            {subtitle && <div className="small" style={{ color: headerColor ? 'rgba(255,255,255,0.85)' : 'var(--gray-500)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{
            background: headerColor ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
            color: headerColor ? 'white' : 'var(--gray-700)',
            border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            fontSize: '1rem', fontWeight: 700
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--gray-200)',
            background: 'var(--gray-50)', display: 'flex',
            justifyContent: 'flex-end', gap: 8, flexShrink: 0
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

window.Modal = Modal;
