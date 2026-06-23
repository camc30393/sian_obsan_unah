/**
 * SIAN - Sidebar (v1.1)
 * Barra lateral fija con navegación, secciones colapsables.
 * Por defecto TODAS las secciones aparecen expandidas (desplegadas).
 * En móviles se convierte en drawer con overlay.
 */
const Sidebar = ({ currentPath, onNavigate, mobileOpen, onMobileClose }) => {
  const t = (k) => I18n.t(k);

  // Estado de cada sección - TODAS arrancan expandidas (true por defecto)
  const [expanded, setExpanded] = React.useState({
    main: true,
    recoleccion: true,
    analisis: true,
    admin: true
  });

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const sections = [
    {
      key: 'main',
      title: t('nav.section_main'),
      items: [
        { id: 'dashboard',     icon: '📊', label: t('nav.dashboard') },
        { id: 'encuestados',   icon: '👥', label: t('nav.encuestados') },
        { id: 'buscar-dni',    icon: '🔎', label: t('nav.buscarDni') },
      ]
    },
    {
      key: 'recoleccion',
      title: t('nav.section_recoleccion'),
      items: [
        { id: 'socioeconomico',icon: '📋', label: t('nav.socioeconomico') },
        { id: 'antropometria', icon: '📏', label: t('nav.antropometria') },
        { id: 'r24',           icon: '🍽️', label: t('nav.r24') },
        { id: 'alimentos',     icon: '🥗', label: t('nav.alimentos') },
        { id: 'recetas',       icon: '🍲', label: t('nav.recetas') },
      ]
    },
    {
      key: 'analisis',
      title: t('nav.section_analisis'),
      items: [
        { id: 'longitudinal',  icon: '📈', label: t('nav.longitudinal') },
        { id: 'mapa',          icon: '🗺️', label: t('nav.mapa') },
        { id: 'reportes',      icon: '📑', label: t('nav.reportes') },
      ]
    },
    {
      key: 'admin',
      title: t('nav.section_admin'),
      items: [
        { id: 'cohortes',      icon: '🗂️', label: t('nav.cohortes') },
        { id: 'catalogos',     icon: '📚', label: t('nav.catalogos') },
        { id: 'usuarios',      icon: '👤', label: t('nav.usuarios') },
        { id: 'auditoria',     icon: '🔐', label: t('nav.auditoria') },
        { id: 'exportar',      icon: '⬇️', label: t('nav.exportar') },
      ]
    }
  ];

  const handleNav = (id) => {
    onNavigate(id);
    if (onMobileClose) onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo">SI</div>
          <div>
            <div className="name">{t('app.name')}</div>
            <div className="sub">{t('app.subtitle')}</div>
          </div>
        </div>

        {sections.map((sec) => (
          <div key={sec.key}>
            <button
              className="sidebar-section-toggle"
              onClick={() => toggle(sec.key)}
              aria-expanded={expanded[sec.key]}
            >
              <span>{sec.title}</span>
              <span className="chevron" style={{
                transform: expanded[sec.key] ? 'rotate(0deg)' : 'rotate(-90deg)'
              }}>▼</span>
            </button>

            {expanded[sec.key] && (
              <div style={{ animation: 'fadeIn 0.15s ease' }}>
                {sec.items.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`sidebar-link ${currentPath === item.id ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); handleNav(item.id); }}
                  >
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>
    </>
  );
};

window.Sidebar = Sidebar;
