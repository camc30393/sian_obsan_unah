/**
 * SIAN - Placeholder
 * Pantalla genérica para módulos aún no construidos.
 * Indica claramente qué se construirá en sesiones siguientes del plan.
 */
const Placeholder = ({ pageId, title, subtitle, sessionPlan, features }) => {
  return (
    <div className="fade-in">
      <div className="mb-4">
        <h1 className="h1" style={{ margin: '0 0 4px 0' }}>{title}</h1>
        <p className="muted" style={{ margin: 0 }}>{subtitle}</p>
      </div>

      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--unah-blue-50) 0%, var(--unah-yellow-100) 100%)',
        borderColor: 'var(--unah-blue-100)',
        textAlign: 'center', padding: '48px 32px'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚧</div>
        <h2 className="h2" style={{ marginBottom: 8 }}>Módulo en construcción</h2>
        <p className="muted" style={{ maxWidth: 560, margin: '0 auto 20px auto' }}>
          Este módulo será desarrollado en la <strong>Sesión {sessionPlan}</strong> del plan
          de prototipado del SIAN. Forma parte de las 22 pantallas planificadas para el sistema completo.
        </p>

        {features && features.length > 0 && (
          <div style={{
            background: 'white', borderRadius: 12, padding: 20,
            maxWidth: 560, margin: '0 auto', textAlign: 'left'
          }}>
            <div className="h3" style={{ marginBottom: 12 }}>Funcionalidades planificadas</div>
            <ul style={{ paddingLeft: 22, margin: 0, fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: 1.7 }}>
              {features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <span className="badge badge-blue">ID: {pageId}</span>
          <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Sesión {sessionPlan}</span>
        </div>
      </div>
    </div>
  );
};

window.Placeholder = Placeholder;
