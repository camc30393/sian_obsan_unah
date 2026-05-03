/**
 * SIDH - Layout v1.1
 * Composición principal: sidebar + topbar + contenido + footer.
 * Maneja estado de drawer móvil del sidebar.
 */
const Layout = ({ currentPath, onNavigate, title, subtitle, user, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <div className="demo-banner">
        ⚠️ {I18n.t('app.demoBanner')}
      </div>
      <div className="app-shell">
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <Topbar
          title={title} subtitle={subtitle} user={user} onLogout={onLogout}
          onMobileMenu={() => setMobileOpen(true)}
        />
        <main className="main fade-in" key={currentPath}>{children}</main>
        <Footer />
      </div>
    </>
  );
};

window.Layout = Layout;
