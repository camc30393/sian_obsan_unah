/**
 * SIAN - FormStepper
 * Indicador visual de pasos para formularios multi-step.
 *
 * Props:
 *   steps: array de strings (nombres de pasos)
 *   current: índice del paso actual (0-based)
 *   onStepClick?: function (permite navegación si se desea)
 */
const FormStepper = ({ steps, current, onStepClick }) => {
  return (
    <div className="flex items-center mb-4" style={{
      background: 'white', padding: '16px 20px', borderRadius: 12,
      border: '1px solid var(--gray-200)'
    }}>
      {steps.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        const clickable = !!onStepClick && i <= current;

        return (
          <React.Fragment key={i}>
            <div
              onClick={clickable ? () => onStepClick(i) : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: clickable ? 'pointer' : 'default',
                opacity: i > current ? 0.5 : 1
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isActive ? 'var(--unah-blue-800)' : isDone ? 'var(--success-500)' : 'var(--gray-200)',
                color: isActive || isDone ? 'white' : 'var(--gray-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}>
                {isDone ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--unah-blue-900)' : 'var(--gray-700)'
              }}>{label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: isDone ? 'var(--success-500)' : 'var(--gray-200)',
                margin: '0 12px',
                transition: 'background 0.2s'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

window.FormStepper = FormStepper;
