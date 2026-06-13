/**
 * SIAN - DataStore
 * Carga todos los archivos JSON de /data una sola vez al inicio
 * y los expone globalmente. Evita múltiples requests por componente.
 */
window.DataStore = {
  data: {},
  loaded: false,

  async loadAll() {
    if (this.loaded) return this.data;
    const files = [
      'estudiantes', 'tiempos_comida', 'porciones', 'grupos_alimentos',
      'alimentos_incap', 'encuestados', 'recordatorios', 'recetas_hondurenas',
      'geografia_honduras', 'agregados', 'requerimientos', 'recetas_nutrientes'
    ];
    const promises = files.map(f =>
      fetch(`./data/${f}.json`).then(r => r.json()).then(d => [f, d])
    );
    const results = await Promise.all(promises);
    results.forEach(([k, v]) => { this.data[k] = v; });
    this.loaded = true;
    return this.data;
  },

  get(key) {
    return this.data[key];
  }
};
