/**
 * SIAN - Nutricion
 * Evaluacion del consumo minimo adecuado de macro y micronutrientes.
 * Compara la ingesta de un R24 (o de una poblacion) contra los requerimientos
 * por etapa de vida y sexo, segun estandar (IOM / FAO-OMS / INCAP).
 *
 * IMPORTANTE (marco metodologico):
 *  - Un R24 unico es INDICATIVO del dia, NO diagnostico de ingesta usual.
 *  - Sodio se evalua como LIMITE maximo (no minimo).
 *  - Grasa y carbohidratos se evaluan como RANGO (% energia, AMDR), no como minimo.
 *  - Proteina como minimo (g/kg x peso). Solo poblacion sana sin condicion especial.
 *  - Energia: requerimiento estimado (EER, IOM 2005) con peso/talla/edad/actividad.
 *  Ver docs/marco-teorico-evaluacion-adecuacion-nutricional.md
 */
window.Nutricion = {

  CAMPOS: ['energia_kcal','proteina_g','grasa_g','carbohidratos_g','fibra_g',
           'calcio_mg','hierro_mg','zinc_mg','sodio_mg','vit_c_mg','vit_a_mcg',
           'folato_mcg','vit_b12_mcg'],

  PESO_REF:  { lactante:9, preescolar:14, escolar:25, adolescente:55,
               adulto:62, adulto_mayor:62, embarazo:65, lactancia:62 },
  TALLA_REF: { lactante:75, preescolar:95, escolar:125, adolescente:160,
               adulto:162, adulto_mayor:160, embarazo:158, lactancia:158 },
  EDAD_REF:  { lactante:1, preescolar:3, escolar:8, adolescente:15,
               adulto:35, adulto_mayor:68, embarazo:28, lactancia:28 },

  PA: {
    M: { sedentario:1.00, ligero:1.11, activo:1.25, muy_activo:1.48 },
    F: { sedentario:1.00, ligero:1.12, activo:1.27, muy_activo:1.45 },
    Mj:{ sedentario:1.00, ligero:1.13, activo:1.26, muy_activo:1.42 },
    Fj:{ sedentario:1.00, ligero:1.16, activo:1.31, muy_activo:1.56 }
  },

  computeEER: function(o) {
    var sexo = o.sexo === 'M' ? 'M' : 'F';
    var edad = o.edad, peso = o.peso, ht = (o.talla_cm || 0) / 100;
    var pal = o.pal || 'sedentario';
    if (!edad || !peso || !ht) return null;
    var kcal, PA, base;
    if (edad >= 19) {
      PA = this.PA[sexo][pal];
      kcal = sexo === 'M'
        ? 662 - 9.53*edad + PA*(15.91*peso + 539.6*ht)
        : 354 - 6.91*edad + PA*(9.36*peso + 726*ht);
    } else if (edad >= 3) {
      PA = this.PA[sexo === 'M' ? 'Mj' : 'Fj'][pal];
      base = (edad >= 9) ? 25 : 20;
      kcal = sexo === 'M'
        ? 88.5 - 61.9*edad + PA*(26.7*peso + 903*ht) + base
        : 135.3 - 30.8*edad + PA*(10.0*peso + 934*ht) + base;
    } else if (edad >= 1) {
      kcal = (89*peso - 100) + 20;
    } else {
      kcal = (89*peso - 100) + 175;
    }
    if (o.etapa === 'embarazo') kcal += 340;
    if (o.etapa === 'lactancia') kcal += 330;
    return { kcal: Math.round(kcal), fuente: 'EER IOM 2005' };
  },

  mapEtapa: function(e0) {
    var ce = (e0.condicion_especial || '').toLowerCase();
    if (ce.indexOf('embaraz') >= 0) return 'embarazo';
    if (ce.indexOf('lactancia') >= 0) return 'lactancia';
    var e = (e0.etapa_vida || '').toLowerCase();
    if (e.indexOf('lactante') >= 0) return 'lactante';
    if (e.indexOf('preescolar') >= 0) return 'preescolar';
    if (e.indexOf('escolar') >= 0) return 'escolar';
    if (e.indexOf('adolescente') >= 0) return 'adolescente';
    if (e.indexOf('mayor') >= 0) return 'adulto_mayor';
    if (e.indexOf('adulto') >= 0) return 'adulto';
    return null;
  },

  mapSexo: function(e0) {
    return (e0.sexo || '').toLowerCase().indexOf('hombre') >= 0 ? 'M' : 'F';
  },

  tieneCondicionEspecial: function(e0) {
    var ce = (e0.condicion_especial || '').toLowerCase();
    return ce && ce !== 'none' && ce !== 'null';
  },

  computeIntake: function(items) {
    var alimentos = DataStore.get('alimentos_incap') || [];
    var recetasN = ((DataStore.get('recetas_nutrientes') || {}).recetas) || {};
    var idx = {}, self = this;
    alimentos.forEach(function(a){ idx[a.id] = a; });
    var tot = {}; this.CAMPOS.forEach(function(c){ tot[c] = 0; });
    (items || []).forEach(function(it){
      var factor = (it.gramos || 0) / 100;
      if (it.esReceta && it.idReceta != null && recetasN[it.idReceta]) {
        var p = recetasN[it.idReceta].por_100g;     // perfil receta por 100g (descompuesto a ingredientes INCAP)
        self.CAMPOS.forEach(function(c){ tot[c] += (p[c] || 0) * factor; });
        return;
      }
      var a = idx[it.idAlimento]; if (!a) return;
      self.CAMPOS.forEach(function(c){ tot[c] += (a[c] || 0) * factor; });
    });
    return tot;
  },

  computeIntakeFromRecords: function(records) {
    var items = (records || []).map(function(r){
      return { idAlimento: r.id_alimentos, gramos: (r.gramos_netos != null ? r.gramos_netos : 0) };
    });
    return this.computeIntake(items);
  },

  _semaforoMin: function(pct) { return pct >= 100 ? 'verde' : (pct >= 70 ? 'ambar' : 'rojo'); },

  evaluate: function(tot, etapa, sexo, opts) {
    opts = opts || {};
    var estandar = opts.estandar || 'iom';
    var peso = opts.peso || this.PESO_REF[etapa] || 60;
    var talla_cm = opts.talla_cm || this.TALLA_REF[etapa] || 160;
    var edad = opts.edad || this.EDAD_REF[etapa] || 30;
    var pal = opts.pal || 'sedentario';
    var pesoEsReal = !!opts.peso;

    var req = (((DataStore.get('requerimientos') || {}).estandares || {})[estandar] || {});
    var r = (req[etapa] || {})[sexo];
    var filas = [];
    if (!r) return { filas: filas, disponible: false, estandar: estandar, etapa: etapa, sexo: sexo };

    var kcal = tot.energia_kcal || 0;
    var push = function(nutriente, consumido, unidad, def, extra) {
      filas.push(Object.assign({ nutriente: nutriente, consumido: Math.round(consumido * 10) / 10, unidad: unidad }, def, extra || {}));
    };

    var eer = this.computeEER({ sexo: sexo, edad: edad, peso: peso, talla_cm: talla_cm, pal: pal, etapa: etapa });
    var refE = null, fuenteE = null;
    if (eer) { refE = eer.kcal; fuenteE = eer.fuente; }
    else if (r.energia_kcal) { refE = r.energia_kcal.valor; fuenteE = r.energia_kcal.fuente; }
    if (refE) {
      push('Energia', kcal, 'kcal', { tipo:'referencia', referencia: refE, pct: Math.round(kcal / refE * 100),
        semaforo:'info', fuente: fuenteE, detalle: pal + (pesoEsReal ? '' : ' (antropometria de referencia)') });
    }

    if (r.proteina_g_kg) {
      var reqG = r.proteina_g_kg.valor * peso, pctP = Math.round((tot.proteina_g || 0) / reqG * 100);
      push('Proteina', tot.proteina_g, 'g', { tipo:'minimo', referencia: Math.round(reqG*10)/10,
        pct: pctP, semaforo: this._semaforoMin(pctP), fuente: r.proteina_g_kg.fuente,
        detalle: r.proteina_g_kg.valor + ' g/kg x ' + peso + ' kg' + (pesoEsReal ? '' : ' (ref.)') });
    }

    var macroRango = function(campo, etiqueta, kcalPorG, def) {
      if (!def) return;
      var g = tot[campo] || 0, pctE = kcal ? (g * kcalPorG / kcal * 100) : 0, sem = 'verde';
      if (pctE < def.min_pct_energia - 0.001) sem = pctE >= def.min_pct_energia - 5 ? 'ambar' : 'rojo';
      else if (pctE > def.max_pct_energia + 0.001) sem = pctE <= def.max_pct_energia + 5 ? 'ambar' : 'rojo';
      push(etiqueta, g, 'g', { tipo:'rango', referencia: def.min_pct_energia + '-' + def.max_pct_energia + '% E',
        pct: Math.round(pctE), unidad_pct:'% energia', semaforo: sem, fuente: def.fuente });
    };
    macroRango('grasa_g','Grasa', 9, r.grasa);
    macroRango('carbohidratos_g','Carbohidratos', 4, r.carbohidratos);

    if (r.fibra_g) {
      var pctF = Math.round((tot.fibra_g||0)/r.fibra_g.valor*100);
      push('Fibra', tot.fibra_g, 'g', { tipo:'meta', referencia:r.fibra_g.valor, pct: pctF,
        semaforo: this._semaforoMin(pctF), fuente:r.fibra_g.fuente });
    }

    var micros = [['calcio_mg','Calcio','mg'],['hierro_mg','Hierro','mg'],['zinc_mg','Zinc','mg'],
                  ['vit_a_mcg','Vitamina A','ug'],['vit_c_mg','Vitamina C','mg'],
                  ['folato_mcg','Folato','ug'],['vit_b12_mcg','Vitamina B12','ug']];
    var self = this;
    micros.forEach(function(m) {
      var def = r[m[0]]; if (!def) return;
      var pct = Math.round((tot[m[0]]||0)/def.valor*100);
      push(m[1], tot[m[0]], m[2], { tipo:'minimo', referencia:def.valor, pct: pct,
        semaforo: self._semaforoMin(pct), fuente:def.fuente, biodisp:def.biodisp, nota:def.unidad_nota });
    });

    if (r.sodio_mg) {
      var lim = r.sodio_mg.valor, cons = tot.sodio_mg||0;
      push('Sodio', cons, 'mg', { tipo:'limite', referencia: lim, pct: Math.round(cons/lim*100),
        semaforo: cons <= lim ? 'verde' : 'rojo', fuente:r.sodio_mg.fuente, nota:'limite maximo' });
    }
    return { filas: filas, disponible:true, estandar: estandar, etapa: etapa, sexo: sexo, peso: peso };
  },

  resumenPoblacional: function(grupos, opts) {
    opts = opts || {};
    var estandar = opts.estandar || 'iom', acc = {}, evaluados = 0, excluidos = 0, self = this;
    (grupos || []).forEach(function(g) {
      var etapa = self.mapEtapa(g.encuestado), sexo = self.mapSexo(g.encuestado);
      if (!etapa) { excluidos++; return; }
      var tot = self.computeIntakeFromRecords(g.records);
      var ev = self.evaluate(tot, etapa, sexo, { estandar: estandar });
      if (!ev.disponible) { excluidos++; return; }
      evaluados++;
      ev.filas.forEach(function(f) {
        if (f.semaforo === 'info') return;
        acc[f.nutriente] = acc[f.nutriente] || { verde:0, ambar:0, rojo:0, n:0, tipo:f.tipo };
        acc[f.nutriente][f.semaforo]++; acc[f.nutriente].n++;
      });
    });
    return { acc: acc, evaluados: evaluados, excluidos: excluidos, estandar: estandar };
  }
};
