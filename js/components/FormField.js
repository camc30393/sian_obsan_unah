/**
 * SIAN - FormField
 * Campo de formulario con label, hint, indicador de obligatorio y mensaje de error.
 *
 * Props:
 *   label: string
 *   required?: bool
 *   hint?: string  (texto de ayuda debajo del input)
 *   error?: string  (mensaje de error)
 *   children: el input/select/textarea real
 *   span?: 1-12 (cuántas columnas ocupa en el grid de 12)
 */
const FormField = ({ label, required, hint, error, children, span = 6 }) => {
  return (
    <div className="field" style={{ gridColumn: `span ${span}` }}>
      {label && (
        <label className="label">
          {label}
          {required && <span style={{ color: 'var(--unah-red-500)', marginLeft: 4 }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: 4 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: '0.72rem', color: 'var(--unah-red-500)', marginTop: 4, fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
};

window.FormField = FormField;
