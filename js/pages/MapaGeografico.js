/**
 * SIAN - MapaGeografico
 * Visualización geoespacial de la cobertura y los indicadores nutricionales.
 *
 * Usa Leaflet (cargado vía CDN en index.html) + OpenStreetMap como base.
 *
 * Capas disponibles:
 *   - Coropleta de DDM por departamento (colores graduados)
 *   - Puntos GPS individuales de los encuestados
 *
 * Filtros: año, etapa de vida, sexo, NSE.
 *
 * IMPORTANTE: este componente monta Leaflet en un useRef y limpia el mapa
 * cuando se desmonta. Leaflet no es React-friendly de fábrica, por eso
 * gestionamos las capas con referencias mutables (mapRef, layersRef).
 */
const MapaGeografico = () => {
  const t = (k) => I18n.t(k);
  const ag = DataStore.get('agregados') || {};
  const encuestados = DataStore.get('encuestados') || [];

  const mapRef = React.useRef(null);
  const layersRef = React.useRef({ chorop: null, points: null });
  const containerRef = React.useRef(null);

  const [layer, setLayer] = React.useState('chorop');  // 'chorop' | 'points' | 'both'
  const [nivel, setNivel] = React.useState('departamento');  // v1.1: 'departamento' | 'municipio'
  const [filterEtapa, setFilterEtapa] = React.useState('');
  const [filterSexo, setFilterSexo] = React.useState('');
  const [filterNse, setFilterNse] = React.useState('');
  const [geoData, setGeoData] = React.useState(null);
  const [geoMun, setGeoMun] = React.useState(null);

  // Cargar ambos GeoJSON al montar
  React.useEffect(() => {
    fetch('./data/honduras_departamentos.geojson')
      .then(r => r.json()).then(setGeoData).catch(err => console.error(err));
    fetch('./data/honduras_municipios.geojson')
      .then(r => r.json()).then(setGeoMun).catch(err => console.error(err));
  }, []);

  // Inicializar mapa
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [14.65, -86.5],  // Centro aproximado de Honduras
      zoom: 7,
      scrollWheelZoom: true
    });

    // Capa base OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    mapRef.current = map;

    // Cleanup al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Datos filtrados
  const filteredData = React.useMemo(() => {
    let arr = encuestados;
    if (filterEtapa) arr = arr.filter(e => e.etapa_vida === filterEtapa);
    if (filterSexo) arr = arr.filter(e => e.sexo === filterSexo);
    if (filterNse) arr = arr.filter(e => e.nivel_se === filterNse);
    return arr;
  }, [encuestados, filterEtapa, filterSexo, filterNse]);

  // Agregar por departamento (DDM%)
  const agByDepto = React.useMemo(() => {
    const map = {};
    filteredData.forEach(e => {
      if (!e.departamento) return;
      if (!map[e.departamento]) map[e.departamento] = { total: 0, ddm: 0, kcal: 0 };
      map[e.departamento].total += 1;
      if (e.ddm === 1) map[e.departamento].ddm += 1;
    });
    Object.keys(map).forEach(k => {
      map[k].pct = map[k].total > 0 ? (map[k].ddm / map[k].total) * 100 : 0;
    });
    return map;
  }, [filteredData]);

  // Color graduado según DDM%
  const colorForPct = (pct) => {
    if (pct == null || pct === 0) return '#CBD5E1';
    if (pct >= 75) return '#10B981';   // verde
    if (pct >= 60) return '#86EFAC';   // verde claro
    if (pct >= 45) return '#FCD34D';   // amarillo
    if (pct >= 30) return '#FB923C';   // naranja
    return '#C8102E';                   // rojo UNAH
  };

  // Renderizar capas cuando cambien filtros o datos
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoData) return;

    // Limpiar capas previas
    if (layersRef.current.chorop) {
      map.removeLayer(layersRef.current.chorop);
      layersRef.current.chorop = null;
    }
    if (layersRef.current.points) {
      map.removeLayer(layersRef.current.points);
      layersRef.current.points = null;
    }

    // Capa coropleta - usa departamentos o municipios según nivel
    if (layer === 'chorop' || layer === 'both') {
      const sourceGeo = nivel === 'municipio' && geoMun ? geoMun : geoData;
      if (!sourceGeo) return;

      const choropLayer = L.geoJSON(sourceGeo, {
        style: (feature) => {
          // En nivel municipio buscamos por departamento (los datos están agregados por dept en el prototipo)
          const lookupName = nivel === 'municipio' ? feature.properties.departamento : feature.properties.name;
          const data = agByDepto[lookupName];
          return {
            fillColor: colorForPct(data?.pct),
            weight: nivel === 'municipio' ? 0.8 : 1.5,
            color: nivel === 'municipio' ? '#5C95DC' : '#002F87',
            fillOpacity: 0.65
          };
        },
        onEachFeature: (feature, lyr) => {
          const lookupName = nivel === 'municipio' ? feature.properties.departamento : feature.properties.name;
          const data = agByDepto[lookupName];
          const tipoLabel = nivel === 'municipio' ? 'Municipio' : 'Departamento';
          const subInfo = nivel === 'municipio' ? `<br><span style="color: #64748B">Depto: ${feature.properties.departamento}</span>` : '';
          const html = `
            <div style="font-family: Inter, sans-serif; min-width: 200px">
              <div style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em">${tipoLabel}</div>
              <div style="font-weight: 700; color: #002F87; font-size: 14px; margin-bottom: 6px">
                ${feature.properties.name}${subInfo}
              </div>
              <div style="font-size: 12px; line-height: 1.5">
                <strong>${t('mapa.popup_n')}:</strong> ${data?.total || 0}<br>
                <strong>${t('mapa.popup_ddm')}:</strong> ${data ? data.pct.toFixed(1) + '%' : 'sin datos'}
              </div>
            </div>`;
          lyr.bindPopup(html);
          lyr.on('mouseover', e => e.target.setStyle({ weight: 3, fillOpacity: 0.85 }));
          lyr.on('mouseout', e => choropLayer.resetStyle(e.target));
        }
      }).addTo(map);
      layersRef.current.chorop = choropLayer;
    }

    // Capa de puntos GPS
    if (layer === 'points' || layer === 'both') {
      const pts = filteredData.filter(e => e.gps_lat && e.gps_lng);
      const ptsLayer = L.layerGroup();
      // Limitar a 500 puntos para rendimiento
      pts.slice(0, 500).forEach(p => {
        const marker = L.circleMarker([p.gps_lat, p.gps_lng], {
          radius: 4,
          fillColor: p.ddm === 1 ? '#10B981' : '#C8102E',
          color: 'white',
          weight: 1,
          fillOpacity: 0.7
        });
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif">
            <strong>${p.nombre || 'Encuestado'}</strong><br>
            <span style="font-size: 11px; color: #64748B">
              ${p.edad ? p.edad + ' años · ' : ''}${p.sexo || ''}<br>
              ${p.etapa_vida || ''} · ${p.municipio || ''}
            </span>
          </div>
        `);
        ptsLayer.addLayer(marker);
      });
      ptsLayer.addTo(map);
      layersRef.current.points = ptsLayer;
    }
  }, [geoData, geoMun, nivel, layer, agByDepto, filteredData]);

  // Conteos resumen
  const stats = React.useMemo(() => {
    const conGPS = filteredData.filter(e => e.gps_lat && e.gps_lng).length;
    const deptosCubiertos = Object.keys(agByDepto).length;
    const ddmHigh = Object.values(agByDepto).filter(d => d.pct >= 70).length;
    const ddmLow = Object.values(agByDepto).filter(d => d.pct < 50).length;
    return { conGPS, deptosCubiertos, ddmHigh, ddmLow };
  }, [filteredData, agByDepto]);

  return (
    <div className="fade-in">
      {/* KPIs del mapa */}
      <div className="grid-12 mb-3">
        <div className="col-3"><KPI
          label={t('mapa.totalEncuestados')} value={Helpers.num(stats.conGPS)}
          icon="📍" iconColor=""
        /></div>
        <div className="col-3"><KPI
          label={t('mapa.deptosCubiertos')} value={`${stats.deptosCubiertos} / 18`}
          icon="🗺️" iconColor="yellow"
        /></div>
        <div className="col-3"><KPI
          label={t('mapa.ddmHigh')} value={stats.ddmHigh}
          icon="✓" iconColor="green"
          help="Departamentos donde la mayoría cumple DDM"
        /></div>
        <div className="col-3"><KPI
          label={t('mapa.ddmLow')} value={stats.ddmLow}
          icon="⚠" iconColor="red"
          help="Departamentos con baja prevalencia de DDM (prioridad de intervención)"
        /></div>
      </div>

      <div className="grid-12">
        {/* Panel lateral de controles */}
        <div className="col-3">
          {/* v1.1: Nivel de visualización */}
          <div className="card mb-3">
            <div className="h3 mb-2">📐 Nivel de visualización</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'departamento', label: '🏛️ Departamento', desc: '18 departamentos' },
                { id: 'municipio', label: '🏘️ Municipio', desc: '81 municipios' }
              ].map(n => (
                <button key={n.id} onClick={() => setNivel(n.id)} style={{
                  padding: '10px 12px', textAlign: 'left',
                  border: `2px solid ${nivel === n.id ? 'var(--unah-blue-800)' : 'var(--gray-200)'}`,
                  background: nivel === n.id ? 'var(--unah-blue-50)' : 'white',
                  borderRadius: 6, cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: nivel === n.id ? 700 : 500,
                  color: nivel === n.id ? 'var(--unah-blue-800)' : 'var(--gray-700)'
                }}>
                  {n.label}
                  <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--gray-500)' }}>{n.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card mb-3">
            <div className="h3 mb-2">{t('mapa.layers')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'chorop', label: '🟢 ' + t('mapa.layer_ddm') },
                { id: 'points', label: '📍 ' + t('mapa.layer_puntos') },
                { id: 'both',   label: '🌐 Ambas capas' }
              ].map(l => (
                <button key={l.id} onClick={() => setLayer(l.id)} style={{
                  padding: '8px 12px', textAlign: 'left',
                  border: `2px solid ${layer === l.id ? 'var(--unah-blue-800)' : 'var(--gray-200)'}`,
                  background: layer === l.id ? 'var(--unah-blue-50)' : 'white',
                  borderRadius: 6, cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: layer === l.id ? 700 : 500,
                  color: layer === l.id ? 'var(--unah-blue-800)' : 'var(--gray-700)'
                }}>{l.label}</button>
              ))}
            </div>
          </div>

          <div className="card mb-3">
            <div className="h3 mb-2">{t('mapa.filters')}</div>
            <FormField label={t('encuestados.filters.etapa')}>
              <select className="select" value={filterEtapa} onChange={(e) => setFilterEtapa(e.target.value)}>
                <option value="">— {t('common.all')} —</option>
                {['Lactante','Preescolar','Escolar','Adolescente','Adulto','Adulto mayor'].map(e =>
                  <option key={e}>{e}</option>)}
              </select>
            </FormField>
            <FormField label={t('encuestados.filters.sexo')}>
              <select className="select" value={filterSexo} onChange={(e) => setFilterSexo(e.target.value)}>
                <option value="">— {t('common.all')} —</option>
                <option>Mujer</option><option>Hombre</option>
              </select>
            </FormField>
            <FormField label={t('encuestados.filters.nse')}>
              <select className="select" value={filterNse} onChange={(e) => setFilterNse(e.target.value)}>
                <option value="">— {t('common.all')} —</option>
                <option value="a. bajo">Bajo</option>
                <option value="b. medio">Medio</option>
                <option value="c. alto">Alto</option>
              </select>
            </FormField>
            {(filterEtapa || filterSexo || filterNse) && (
              <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}
                onClick={() => { setFilterEtapa(''); setFilterSexo(''); setFilterNse(''); }}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          <div className="card">
            <div className="h3 mb-2">{t('mapa.legend')}</div>
            <div className="muted small mb-2">% encuestados que cumplen DDM:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.78rem' }}>
              {[
                { color: '#10B981', label: '≥ 75% (alto)' },
                { color: '#86EFAC', label: '60–75%' },
                { color: '#FCD34D', label: '45–60%' },
                { color: '#FB923C', label: '30–45%' },
                { color: '#C8102E', label: '< 30% (bajo)' },
                { color: '#CBD5E1', label: 'Sin datos' }
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ width: 18, height: 12, background: r.color, borderRadius: 3, border: '1px solid var(--gray-300)' }} />
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="col-9">
          <div className="card-tight" style={{ padding: 0, overflow: 'hidden', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
            <div ref={containerRef} style={{ height: 580, width: '100%' }} />
          </div>
          <div className="muted small mt-2">
            ℹ️ Polígonos de los 18 departamentos representados de forma simplificada.
            En producción se usarán los <strong>polígonos oficiales del INE de Honduras</strong>
            con resolución municipal completa.
          </div>
        </div>
      </div>
    </div>
  );
};

window.MapaGeografico = MapaGeografico;
