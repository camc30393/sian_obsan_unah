/**
 * SIAN - App
 * Componente raíz que orquesta:
 *   - Carga inicial de i18n y datos
 *   - Estado de autenticación
 *   - Routing entre las 22 pantallas
 *   - Renderizado del Layout cuando hay sesión
 */
const App = () => {
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [route, setRoute] = React.useState(Router.current());
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Cargar datos e i18n una sola vez al montar
  React.useEffect(() => {
    (async () => {
      const lang = localStorage.getItem('sian_lang') || 'es';
      await I18n.load(lang);
      await DataStore.loadAll();
      setReady(true);
    })();
  }, []);

  // Escuchar cambios de hash y de idioma
  React.useEffect(() => {
    const onHash = () => setRoute(Router.current());
    const onLang = () => forceUpdate();
    window.addEventListener('hashchange', onHash);
    window.addEventListener('langchange', onLang);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('langchange', onLang);
    };
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--unah-blue-900)', color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--unah-yellow-500)' }}>SIAN</div>
          <div style={{ marginTop: 12, opacity: 0.7 }}>Cargando datos...</div>
        </div>
      </div>
    );
  }

  // Sin sesión → mostrar Login
  if (!user) {
    return <Login onLogin={(u) => { setUser(u); Router.navigate('dashboard'); }} />;
  }

  // ----------- Mapeo de rutas a páginas -----------
  // Cada página tiene: { component, title, subtitle, session, features }
  const t = (k) => I18n.t(k);
  const pages = {
    'dashboard': {
      component: <Dashboard />,
      title: t('dashboard.title'),
      subtitle: t('dashboard.subtitle')
    },
    'encuestados': {
      component: <Encuestados user={user} />,
      title: t('encuestados.title'),
      subtitle: t('encuestados.subtitle')
    },
    'buscar-dni': {
      component: <BuscarDNI />,
      title: t('buscarDni.title'),
      subtitle: t('buscarDni.subtitle')
    },
    'socioeconomico': {
      component: <Socioeconomico />,
      title: t('socio.title'),
      subtitle: t('socio.subtitle')
    },
    'antropometria': {
      component: <Antropometria />,
      title: t('antro.title'),
      subtitle: t('antro.subtitle')
    },
    'r24': {
      component: <R24 />,
      title: t('r24.title'),
      subtitle: t('r24.subtitle')
    },
    'alimentos': {
      component: <Alimentos />,
      title: t('alimentos.title'),
      subtitle: t('alimentos.subtitle')
    },
    'recetas': {
      component: <Recetas />,
      title: t('recetas.title'),
      subtitle: t('recetas.subtitle')
    },
    'longitudinal': {
      component: <Longitudinal />,
      title: t('longitudinal.title'),
      subtitle: t('longitudinal.subtitle')
    },
    'mapa': {
      component: <MapaGeografico />,
      title: t('mapa.title'),
      subtitle: t('mapa.subtitle')
    },
    'reportes': {
      component: <Reportes />,
      title: t('reportes.title'),
      subtitle: t('reportes.subtitle')
    },
    'cohortes': {
      component: <Cohortes />,
      title: t('cohortes.title'),
      subtitle: t('cohortes.subtitle')
    },
    'catalogos': {
      component: <Catalogos />,
      title: t('catalogos.title'),
      subtitle: t('catalogos.subtitle')
    },
    'usuarios': {
      component: <Usuarios />,
      title: t('usuarios.title'),
      subtitle: t('usuarios.subtitle')
    },
    'auditoria': {
      component: <Auditoria />,
      title: t('auditoria.title'),
      subtitle: t('auditoria.subtitle')
    },
    'exportar': {
      component: <Exportar />,
      title: t('exportar.title'),
      subtitle: t('exportar.subtitle')
    },
    'recuperar': {
      title: 'Recuperación de contraseña',
      subtitle: 'Recibe instrucciones para restablecer tu contraseña',
      placeholder: { id: 'recuperar', session: 2, features: [
        'Envío de enlace de restablecimiento al correo institucional',
        'Validación por OTP / 2FA (opcional)',
        'Política de contraseñas robustas',
        'Log de cambios de contraseña en módulo de auditoría'
      ]}
    }
  };

  const page = pages[route.path] || pages['dashboard'];
  const content = page.component
    ? page.component
    : <Placeholder
        pageId={page.placeholder.id}
        title={page.title}
        subtitle={page.subtitle}
        sessionPlan={page.placeholder.session}
        features={page.placeholder.features}
      />;

  return (
    <Layout
      currentPath={route.path}
      onNavigate={(path) => Router.navigate(path)}
      title={page.title}
      subtitle={page.subtitle}
      user={user}
      onLogout={() => { setUser(null); Router.navigate('login'); }}
    >
      {content}
    </Layout>
  );
};

// Renderizar la app
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
