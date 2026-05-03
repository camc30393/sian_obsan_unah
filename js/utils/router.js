/**
 * SIDH - Router
 * Routing por hash (#dashboard, #encuestados, etc.) sin dependencias.
 * Permite que el prototipo funcione abriendo el index.html sin servidor.
 */
window.Router = {
  routes: {},

  register(path, component) {
    this.routes[path] = component;
  },

  current() {
    const hash = window.location.hash.replace('#', '') || 'login';
    const [path, ...params] = hash.split('/');
    return { path, params };
  },

  navigate(path) {
    window.location.hash = path;
  },

  onChange(callback) {
    window.addEventListener('hashchange', callback);
  }
};
