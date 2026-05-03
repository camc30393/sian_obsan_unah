/**
 * SIDH - Topbar
 * Barra superior con título dinámico, búsqueda global, toggle idioma y menú usuario.
 */
const Topbar = ({ title, subtitle, user, onLogout, onMobileMenu }) => {
  const t = (k) => I18n.t(k);
  const [lang, setLang] = React.useState(I18n.current);

  const handleLangToggle = async () => {
    await I18n.toggle();
    setLang(I18n.current);
  };

  return (
    <header className="topbar">
      <div className="flex items-center gap-2">
        {/* Botón hamburguesa solo en móvil */}
        <button
          className="btn btn-ghost btn-sm topbar-mobile-menu"
          onClick={onMobileMenu}
          title="Menú"
          aria-label="Abrir menú"
        >☰</button>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--unah-blue-900)' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{subtitle}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 topbar-actions">
        <div className="topbar-search" style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder={t('common.search') + '...'}
            style={{ width: 260, paddingLeft: 32, fontSize: 13 }}
          />
          <span style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--gray-400)'
          }}>🔍</span>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleLangToggle} title={t('common.language')}>
          🌐 {lang.toUpperCase()}
        </button>

        <div className="flex items-center gap-2 topbar-user" style={{ paddingLeft: 12, borderLeft: '1px solid var(--gray-200)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--unah-blue-800)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem'
          }}>
            {(user?.name || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div className="topbar-user-info" style={{ fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 600 }}>{user?.name || 'Invitado'}</div>
            <div className="muted" style={{ fontSize: '0.72rem' }}>{user?.role || ''}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} title={t('common.logout')}>
            ⏻
          </button>
        </div>
      </div>
    </header>
  );
};

window.Topbar = Topbar;
