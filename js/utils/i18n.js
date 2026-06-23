/**
 * SIAN - i18n
 * Cargador de traducciones simple. Carga locales/{idioma}.json
 * y expone una función t(key) que navega claves anidadas con punto.
 *
 * Uso:
 *   await I18n.load('es');
 *   I18n.t('app.name')         // 'SIAN'
 *   I18n.t('nav.dashboard')    // 'Tablero analítico'
 */
window.I18n = {
  current: 'es',
  data: {},

  async load(lang) {
    try {
      const res = await fetch(`./locales/${lang}.json`);
      this.data = await res.json();
      this.current = lang;
      localStorage.setItem('sian_lang', lang);
      return true;
    } catch (e) {
      console.error('I18n load failed:', e);
      return false;
    }
  },

  t(key, fallback = '') {
    const parts = key.split('.');
    let val = this.data;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) val = val[p];
      else return fallback || key;
    }
    return typeof val === 'string' ? val : (fallback || key);
  },

  async toggle() {
    const next = this.current === 'es' ? 'en' : 'es';
    await this.load(next);
    // Forzar re-render disparando evento
    window.dispatchEvent(new CustomEvent('langchange', { detail: next }));
  }
};
