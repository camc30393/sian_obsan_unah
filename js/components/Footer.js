/**
 * SIAN - Footer
 * Footer global (logo + nombre del sistema, badge de versión y derechos institucionales), presente en todas las pantallas.
 * Versión sesión 7: presentación pulida para entregable final.
 */
const Footer = () => {
  const t = (k) => I18n.t(k);

  return (
    <footer className="footer">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: 'var(--unah-blue-800)', color: 'white',
            width: 28, height: 28, borderRadius: 6,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.7rem'
          }}>SI</span>
          <strong style={{ color: 'var(--unah-blue-800)' }}>{t('app.fullName')}</strong>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="badge badge-yellow">PROTOTIPO v1.0</span>
        <span className="muted">{t('footer.rights')}</span>
      </div>
    </footer>
  );
};

window.Footer = Footer;
