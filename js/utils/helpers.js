/**
 * SIDH - Helpers
 * Utilidades de formateo y manipulación de datos.
 */
window.Helpers = {
  /** Formatea número con separadores de miles según locale */
  num(n, decimals = 0) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('es-HN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /** Formatea porcentaje */
  pct(n, decimals = 1) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toFixed(decimals) + '%';
  },

  /** Capitaliza primera letra */
  cap(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  },

  /** Limpia prefijos del tipo "a. ", "b. " que vienen en encuestas */
  cleanPrefix(s) {
    if (!s) return '';
    return s.replace(/^[a-z]\.\s*/i, '').trim();
  },

  /** Convierte objeto {clave: valor} a array [{name, value}] para Recharts */
  objToArray(obj, nameKey = 'name', valueKey = 'value') {
    if (!obj) return [];
    return Object.entries(obj).map(([k, v]) => ({ [nameKey]: k, [valueKey]: v }));
  },

  /** Truncar texto */
  truncate(s, len = 30) {
    if (!s) return '';
    return s.length > len ? s.slice(0, len) + '…' : s;
  },

  /** Validador de DNI hondureño (formato 0000-0000-00000) */
  validateDNI(dni) {
    if (!dni) return false;
    const cleaned = dni.replace(/-/g, '').replace(/\s/g, '');
    return /^\d{13}$/.test(cleaned);
  },

  /** Color UNAH por categoría (para gráficos) */
  colorPalette: [
    '#002F87',  // azul UNAH
    '#F4B71A',  // amarillo UNAH
    '#0050B3',  // azul medio
    '#10B981',  // verde
    '#C8102E',  // rojo UNAH
    '#F59E0B',  // naranja
    '#5C95DC',  // azul claro
    '#9E0E27',  // rojo oscuro
    '#3B82F6',  // info azul
    '#64748B',  // gris
  ],

  colorForCategory(cat) {
    const map = {
      'Mujer': '#C8102E', 'Hombre': '#002F87',
      'Female': '#C8102E', 'Male': '#002F87',
      'a. Diversidad dietética': '#10B981',
      'b. Sin diversidad dietética': '#C8102E',
      'c. Sin definir': '#94A3B8',
      'a. bajo': '#C8102E', 'b. medio': '#F4B71A', 'c. alto': '#10B981',
      '1. Urbana': '#002F87', '2. Rural': '#F4B71A',
    };
    return map[cat] || '#0050B3';
  }
};
