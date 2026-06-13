/**
 * SIAN - Antropometria (motor LMS-OMS)
 * Calcula Z-scores antropometricos con el metodo LMS oficial de la OMS:
 *   Z = ((valor / M)^L - 1) / (L * S)     (si L != 0)
 *   Z = ln(valor / M) / S                  (si L == 0)
 * Con la regla OMS de restriccion para |Z| > 3 (igrowup).
 *
 * IMPORTANTE: requiere las TABLAS LMS oficiales OMS, que deben colocarse en
 *   data/lms/<indicador>_<sexo>.json   (ver data/lms/README_LMS.md).
 * Indicadores: lhfa (talla/edad), wfa (peso/edad), bfa (IMC/edad),
 *              wfl/wfh (peso/talla), hcfa (perimetro cefalico/edad).
 * Mientras no existan las tablas, classify() devuelve {disponible:false} y la
 * UI debe mostrar "Z-score no disponible (faltan tablas OMS)" — NUNCA un valor
 * aproximado presentado como oficial.
 */
window.Antropometria = {

  _cache: {},

  // Carga perezosa de una tabla LMS: data/lms/<ind>_<sexo>.json
  // Formato esperado: [{ x: <edad_dias|talla_cm>, L:.., M:.., S:.. }, ...]
  loadLMS: function(indicador, sexo) {
    var key = indicador + '_' + (sexo === 'M' ? 'm' : 'f');
    if (this._cache[key] !== undefined) return Promise.resolve(this._cache[key]);
    var self = this;
    return fetch('./data/lms/' + key + '.json')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ self._cache[key] = d; return d; })
      .catch(function(){ self._cache[key] = null; return null; });
  },

  // Interpolacion lineal de L, M, S al valor x dado
  _lmsAt: function(tabla, x) {
    if (!tabla || !tabla.length) return null;
    if (x <= tabla[0].x) return tabla[0];
    if (x >= tabla[tabla.length-1].x) return tabla[tabla.length-1];
    for (var i=1;i<tabla.length;i++){
      if (x <= tabla[i].x){
        var a=tabla[i-1], b=tabla[i], t=(x-a.x)/(b.x-a.x);
        return { L:a.L+(b.L-a.L)*t, M:a.M+(b.M-a.M)*t, S:a.S+(b.S-a.S)*t };
      }
    }
    return tabla[tabla.length-1];
  },

  _zRaw: function(valor, L, M, S) {
    return L !== 0 ? (Math.pow(valor/M, L) - 1) / (L*S) : Math.log(valor/M) / S;
  },

  // valor en una desviacion (para regla de restriccion OMS)
  _valAtZ: function(z, L, M, S) {
    return L !== 0 ? M*Math.pow(1+L*S*z, 1/L) : M*Math.exp(S*z);
  },

  // Z-score OMS con restriccion para |z|>3 (metodo igrowup)
  zScore: function(valor, lms) {
    if (!lms || !valor) return null;
    var L=lms.L, M=lms.M, S=lms.S;
    var z=this._zRaw(valor,L,M,S);
    if (z>3){ var sd3=this._valAtZ(3,L,M,S), sd2=this._valAtZ(2,L,M,S); return 3+(valor-sd3)/(sd3-sd2); }
    if (z<-3){ var n3=this._valAtZ(-3,L,M,S), n2=this._valAtZ(-2,L,M,S); return -3+(valor-n3)/(n2-n3); }
    return z;
  },

  // Clasificacion por indicador (cortes OMS)
  // ind: 'lhfa'|'wfa'|'bfa'|'wfl'  -> retorna {z, etiqueta, severidad} o {disponible:false}
  clasificar: function(indicador, valor, x, sexo) {
    var key=indicador+'_'+(sexo==='M'?'m':'f');
    var tabla=this._cache[key];
    if (tabla===undefined) return { disponible:false, motivo:'tabla_no_cargada' };
    if (tabla===null) return { disponible:false, motivo:'tablas_OMS_pendientes' };
    var lms=this._lmsAt(tabla,x); if(!lms) return {disponible:false,motivo:'fuera_de_rango'};
    var z=this.zScore(valor,lms);
    var et=this._etiqueta(indicador,z);
    return { disponible:true, z:Math.round(z*100)/100, etiqueta:et.txt, severidad:et.sev };
  },

  _etiqueta: function(ind, z) {
    if (ind==='lhfa') { // talla/edad
      if (z< -3) return {txt:'Talla baja severa',sev:'rojo'};
      if (z< -2) return {txt:'Talla baja',sev:'ambar'};
      return {txt:'Talla adecuada',sev:'verde'};
    }
    if (ind==='wfa') { // peso/edad
      if (z< -3) return {txt:'Bajo peso severo',sev:'rojo'};
      if (z< -2) return {txt:'Bajo peso',sev:'ambar'};
      if (z> 2)  return {txt:'Peso elevado para la edad',sev:'ambar'};
      return {txt:'Peso adecuado',sev:'verde'};
    }
    if (ind==='bfa' || ind==='wfl') { // IMC/edad o peso/talla
      if (z< -3) return {txt:'Emaciacion severa',sev:'rojo'};
      if (z< -2) return {txt:'Emaciacion',sev:'ambar'};
      if (z> 3)  return {txt:'Obesidad',sev:'rojo'};
      if (z> 2)  return {txt:'Sobrepeso',sev:'ambar'};
      if (z> 1)  return {txt:'Riesgo de sobrepeso',sev:'ambar'};
      return {txt:'Adecuado',sev:'verde'};
    }
    return {txt:'—',sev:'info'};
  }
};
