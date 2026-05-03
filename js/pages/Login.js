/**
 * SIDH - Login
 * Pantalla de autenticación con selección de rol (4 perfiles).
 * En el prototipo no funcional, cualquier credencial permite ingresar.
 */
const Login = ({ onLogin }) => {
  const t = (k) => I18n.t(k);
  const [role, setRole] = React.useState('estudiante');
  const [user, setUser] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [lang, setLang] = React.useState(I18n.current);

  const handleLangToggle = async () => {
    await I18n.toggle();
    setLang(I18n.current);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prototipo: credenciales no se validan
    const roleLabels = {
      estudiante: t('login.role_estudiante'),
      docente: t('login.role_docente'),
      investigador: t('login.role_investigador'),
      admin: t('login.role_admin')
    };
    onLogin({
      name: user || 'Christian Manzanares',
      role: roleLabels[role],
      roleId: role
    });
  };

  return (
    <div className="login-bg">
      <div className="login-card fade-in">
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLangToggle}
          style={{ position: 'absolute', top: 16, right: 16 }}
        >
          🌐 {lang.toUpperCase()}
        </button>

        <div className="login-logo">SI</div>
        <h1 style={{
          textAlign: 'center', margin: '0 0 4px 0',
          color: 'var(--unah-blue-900)', fontSize: '1.5rem', fontWeight: 700
        }}>
          {t('app.name')}
        </h1>
        <p style={{
          textAlign: 'center', color: 'var(--gray-500)',
          fontSize: '0.85rem', margin: '0 0 6px 0'
        }}>
          {t('app.fullName')}
        </p>
        <p style={{
          textAlign: 'center', color: 'var(--gray-400)',
          fontSize: '0.75rem', margin: '0 0 28px 0'
        }}>
          {t('app.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">{t('login.role')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { id: 'estudiante',   label: t('login.role_estudiante'),   icon: '🎓' },
                { id: 'docente',      label: t('login.role_docente'),      icon: '📚' },
                { id: 'investigador', label: t('login.role_investigador'), icon: '🔬' },
                { id: 'admin',        label: t('login.role_admin'),        icon: '⚙️' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '10px 8px',
                    border: `2px solid ${role === r.id ? 'var(--unah-blue-800)' : 'var(--gray-200)'}`,
                    background: role === r.id ? 'var(--unah-blue-50)' : 'white',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: role === r.id ? 600 : 500,
                    color: role === r.id ? 'var(--unah-blue-800)' : 'var(--gray-700)',
                    textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{r.icon}</div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="label">{t('login.user')}</label>
            <input
              className="input"
              type="text"
              placeholder={t('login.userPlaceholder')}
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label className="label">{t('login.password')}</label>
            <input
              className="input"
              type="password"
              placeholder={t('login.pwPlaceholder')}
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between mb-3" style={{ fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" />
              <span>{t('login.remember')}</span>
            </label>
            <a href="#recuperar">{t('login.forgot')}</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {t('login.login')} →
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.72rem', color: 'var(--gray-400)' }}>
          {t('login.version')} · Christian A. Manzanares Cruz
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
