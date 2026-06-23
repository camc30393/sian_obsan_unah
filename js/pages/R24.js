/**
 * SIAN - R24 (Recordatorio de 24 horas - metodología AMPM-USDA)
 *
 * Wizard de 5 pasos:
 *   1. Lista rápida (Quick List) — alimentos sin detalles
 *   2. Olvidados (Forgotten Foods) — prompts por categorías comunes
 *   3. Hora y ocasión — asignar tiempo de comida y hora aproximada
 *   4. Detalle — cantidad, porción/utensilio, método de preparación
 *   5. Revisión final — verificación del día completo + DDM en vivo
 *
 * Referencias:
 *   - USDA Automated Multiple-Pass Method (AMPM)
 *   - FAO 2021: Diversidad Dietética Mínima (10 grupos)
 */
const R24 = () => {
  const t = (k) => I18n.t(k);
  const alimentos = DataStore.get('alimentos_incap') || [];
  const recetas = DataStore.get('recetas_hondurenas') || [];
  const tiempos = DataStore.get('tiempos_comida') || [];
  const porciones = DataStore.get('porciones') || [];

  const [step, setStep] = React.useState(0);
  const [persona, setPersona] = React.useState(null);
  const [fechaR24, setFechaR24] = React.useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = React.useState([]);

  // ============ HELPERS ============

  const addItem = (alimento, opts = {}) => {
    const newItem = {
      uid: Date.now() + Math.random(),
      alimento: alimento.alimento || alimento.nombre,
      idAlimento: alimento.id,
      grupoC24: alimento.grupo_c24 || '',
      kcal100: alimento.energia_kcal || alimento.kcal || 0,
      esReceta: !!alimento.ingredientes,
      idReceta: alimento.ingredientes ? alimento.id : null,
      hora: opts.hora || '',
      tiempo: opts.tiempo || '',
      cantidad: 1,
      porcion: '',
      gramos: 100,
      preparacion: '',
      ...opts
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (uid) => setItems(prev => prev.filter(i => i.uid !== uid));
  const updateItem = (uid, patch) => setItems(prev => prev.map(i => i.uid === uid ? { ...i, ...patch } : i));

  // Cálculo DDM en vivo a partir de los grupos consumidos
  const gruposConsumidos = React.useMemo(() => {
    const set = new Set();
    items.forEach(i => {
      if (i.grupoC24 && i.grupoC24 !== '11. No Definido') {
        // Tomar el número del grupo (01, 02, ..., 10)
        const num = i.grupoC24.split('.')[0];
        if (num && num !== '11' && num !== '00') set.add(num);
      }
    });
    return set;
  }, [items]);

  const ddmCount = gruposConsumidos.size;
  const ddmCumple = ddmCount >= 5;

  // Cálculo energético total
  const totalKcal = React.useMemo(() => {
    return items.reduce((s, i) => s + ((i.kcal100 || 0) * (i.gramos / 100)), 0);
  }, [items]);

  const stepDefs = [
    { id: 'step1', label: t('r24.step1'), icon: '⚡' },
    { id: 'step2', label: t('r24.step2'), icon: '💭' },
    { id: 'step3', label: t('r24.step3'), icon: '🕐' },
    { id: 'step4', label: t('r24.step4'), icon: '📝' },
    { id: 'step5', label: t('r24.step5'), icon: '✓' },
  ];

  return (
    <div className="fade-in">
      {/* v1.1: Vinculación a encuestado + fecha del R24 */}
      {!persona ? (
        <div className="card mb-3" style={{ borderLeft: '4px solid var(--unah-blue-800)' }}>
          <div className="h3 mb-2">🔗 Vincular R24 a un encuestado</div>
          <p className="muted small mb-3">
            Antes de iniciar la entrevista del Recordatorio 24h, seleccione el encuestado al que pertenece.
            Para infantes, registre a través de un padre o tutor responsable.
          </p>
          <div className="grid-12">
            <div className="col-8">
              <PersonPicker
                value={persona}
                onChange={setPersona}
                allowTutor={true}
                label="Encuestado"
              />
            </div>
            <div className="col-4">
              <FormField label="📅 Fecha del R24" hint="Día del consumo recordado">
                <input
                  type="date"
                  className="input"
                  value={fechaR24}
                  onChange={(e) => setFechaR24(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-3" style={{
          background: 'linear-gradient(135deg, var(--unah-blue-800) 0%, var(--unah-blue-600) 100%)',
          color: 'white', borderColor: 'transparent'
        }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('r24.person')}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{persona.nombre}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                DNI <span style={{ fontFamily: 'monospace' }}>{persona.dni}</span>
                {persona.edad && ` · ${persona.edad} años`}
                {persona.sexo && ` · ${persona.sexo}`}
              </div>
              <div style={{ marginTop: 8 }} className="flex items-center gap-2">
                <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>📅 Fecha del R24:</span>
                <input
                  type="date"
                  value={fechaR24}
                  onChange={(e) => setFechaR24(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 4, padding: '4px 8px', fontSize: '0.85rem'
                  }}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'white', background: 'rgba(255,255,255,0.15)' }}
                  onClick={() => setPersona(null)}
                >✕ Cambiar persona</button>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Alimentos registrados</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{items.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Solo mostrar pasos si hay persona seleccionada */}
      {!persona ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>👆</div>
          <div className="h2" style={{ marginBottom: 6 }}>Seleccione un encuestado para comenzar</div>
          <p className="muted">El R24 debe estar vinculado a una persona registrada en el sistema.</p>
        </div>
      ) : (
        <>

      {/* Stepper */}
      <FormStepper
        steps={stepDefs.map(s => `${s.icon} ${s.label}`)}
        current={step}
        onStepClick={setStep}
      />

      {/* Pasos */}
      {step === 0 && <Step1QuickList items={items} addItem={addItem} removeItem={removeItem}
        alimentos={alimentos} recetas={recetas} t={t} />}
      {step === 1 && <Step2Olvidados items={items} addItem={addItem} t={t} />}
      {step === 2 && <Step3HoraOcasion items={items} updateItem={updateItem} tiempos={tiempos} t={t} />}
      {step === 3 && <Step4Detalle items={items} updateItem={updateItem} porciones={porciones} t={t} />}
      {step === 4 && <Step5Revision items={items} ddmCount={ddmCount} ddmCumple={ddmCumple}
        gruposConsumidos={gruposConsumidos} totalKcal={totalKcal} tiempos={tiempos} t={t} />}
      {step === 4 && persona && <AdecuacionR24 items={items} persona={persona} />}

      {/* Indicadores en vivo (sticky bottom) */}
      <div style={{
        position: 'sticky', bottom: 0, marginTop: 16,
        background: 'white', borderTop: '2px solid var(--unah-blue-800)',
        padding: 14, borderRadius: '12px 12px 0 0',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)'
      }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex gap-3">
            <div>
              <div className="muted small">{t('r24.totalKcal')}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--unah-blue-800)' }}>
                {Helpers.num(Math.round(totalKcal))} kcal
              </div>
            </div>
            <div>
              <div className="muted small">{t('r24.totalDDM')}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: ddmCumple ? 'var(--success-500)' : 'var(--unah-red-500)' }}>
                {ddmCount} / 10 grupos {ddmCumple ? '✓' : ''}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
              ← {t('common.previous')}
            </button>
            {step < 4 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => Math.min(4, s + 1))} disabled={items.length === 0 && step === 0}>
                {t('common.next')} →
              </button>
            ) : (
              <button className="btn btn-yellow" onClick={() => {
                const faltan = items.filter(i => !i.porcion);
                if (faltan.length) { alert(`Falta especificar la porción en ${faltan.length} alimento(s).\nLa porción es OBLIGATORIA antes de guardar el R24 (paso 4 - Detalle).`); return; }
                alert(`(Prototipo) R24 guardado\n\nTotal: ${items.length} alimentos\nDDM: ${ddmCount}/10\nKcal: ${Math.round(totalKcal)}`);
              }}>
                ✓ {t('r24.confirm')}
              </button>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

// ====================================================================
// PASO 1: Lista rápida con buscador de alimentos + recetas
// ====================================================================
const Step1QuickList = ({ items, addItem, removeItem, alimentos, recetas, t }) => {
  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState('alimentos'); // 'alimentos' | 'recetas'

  // Resultados de búsqueda (top 12)
  const results = React.useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    if (tab === 'alimentos') {
      return alimentos
        .filter(a => (a.alimento || '').toLowerCase().includes(q))
        .slice(0, 12);
    } else {
      return recetas
        .filter(r => r.nombre.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q))
        .slice(0, 12);
    }
  }, [search, tab, alimentos, recetas]);

  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
          ⚡ {t('r24.step1')}
        </div>
        <span className="badge badge-blue">Paso 1 de 5</span>
      </div>
      <p className="muted mb-3">{t('r24.step1_help')}</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, borderBottom: '2px solid var(--gray-200)' }}>
        {[
          { id: 'alimentos', label: '🍎 Catálogo INCAP', count: alimentos.length },
          { id: 'recetas', label: '🍲 Recetas hondureñas', count: recetas.length }
        ].map(tt => (
          <button key={tt.id} onClick={() => setTab(tt.id)} style={{
            padding: '10px 16px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: '0.9rem',
            fontWeight: tab === tt.id ? 700 : 500,
            color: tab === tt.id ? 'var(--unah-blue-800)' : 'var(--gray-600)',
            borderBottom: `3px solid ${tab === tt.id ? 'var(--unah-blue-800)' : 'transparent'}`,
            marginBottom: -2
          }}>
            {tt.label} <span className="muted small">({tt.count})</span>
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative' }} className="mb-3">
        <input
          className="input"
          placeholder={t('r24.searchFood')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 36, fontSize: 14 }}
          autoFocus
        />
        <span style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--gray-400)'
        }}>🔍</span>
      </div>

      {/* Resultados */}
      {search.length > 0 && (
        <div style={{
          background: 'var(--gray-50)', borderRadius: 8, padding: 8,
          maxHeight: 320, overflowY: 'auto'
        }}>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--gray-500)' }}>
              Sin resultados para "{search}"
            </div>
          ) : (
            results.map((r, i) => (
              <div key={i} onClick={() => { addItem(r); setSearch(''); }}
                style={{
                  padding: '10px 12px', background: 'white',
                  borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: '1px solid var(--gray-200)',
                  transition: 'all 0.1s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--unah-blue-50)'; e.currentTarget.style.borderColor = 'var(--unah-blue-600)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{r.alimento || r.nombre}</div>
                  <div className="muted small">
                    {r.energia_kcal ? `${r.energia_kcal.toFixed(0)} kcal/100g · ${r.grupo_c24 || ''}` : `${r.kcal} kcal/porción · ${r.descripcion?.slice(0, 60)}`}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm">+ Agregar</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lista actual */}
      <div className="mt-3">
        <div className="h3 mb-2">
          📋 Lista actual <span className="badge badge-yellow">{items.length} {t('r24.items')}</span>
        </div>
        {items.length === 0 ? (
          <div style={{
            border: '2px dashed var(--gray-300)', borderRadius: 8,
            padding: 32, textAlign: 'center', color: 'var(--gray-500)'
          }}>
            Aún no se han agregado alimentos.<br />
            Use el buscador arriba para listar lo que el encuestado consumió ayer.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((it, i) => (
              <div key={it.uid} style={{
                background: 'white', border: '1px solid var(--gray-200)',
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div className="flex items-center gap-2">
                  <span className="badge badge-blue" style={{ minWidth: 28 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.alimento}</div>
                    <div className="muted small">
                      {it.grupoC24 ? Helpers.truncate(it.grupoC24, 40) : 'Receta hondureña'}
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(it.uid)}
                  style={{ color: 'var(--unah-red-500)' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ====================================================================
// PASO 2: Alimentos olvidados (prompts por categoría)
// ====================================================================
const Step2Olvidados = ({ items, addItem, t }) => {
  // Categorías de alimentos comúnmente olvidados (adaptados al contexto hondureño)
  const categorias = [
    { icon: '🥤', nombre: 'Bebidas', items: ['Café', 'Refresco/gaseosa', 'Agua sola', 'Jugo de fruta', 'Refresco natural', 'Cerveza/alcohol', 'Té'] },
    { icon: '🍬', nombre: 'Antojos y dulces', items: ['Caramelos/dulces', 'Galletas', 'Chocolate', 'Helado', 'Postres', 'Fruta seca'] },
    { icon: '🥨', nombre: 'Snacks y meriendas', items: ['Churros/papitas', 'Tostones/tajadas', 'Maní/semillas', 'Pan dulce', 'Chips de plátano'] },
    { icon: '🧂', nombre: 'Condimentos y aderezos', items: ['Sal', 'Azúcar', 'Mayonesa', 'Salsa de tomate', 'Mantequilla/margarina', 'Crema'] },
    { icon: '🍳', nombre: 'Acompañamientos', items: ['Tortilla extra', 'Pan', 'Aguacate', 'Queso adicional', 'Chismol/pico de gallo'] },
    { icon: '🍎', nombre: 'Frutas frescas', items: ['Banano', 'Naranja', 'Manzana', 'Piña', 'Mango', 'Sandía', 'Papaya'] },
  ];

  // Lista local de marcados (para mostrar visualmente lo que ya se preguntó)
  const [marcados, setMarcados] = React.useState({});

  const handleAdd = (item) => {
    addItem({ id: 0, alimento: item, energia_kcal: 80, grupo_c24: '' });
    setMarcados(prev => ({ ...prev, [item]: true }));
  };

  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
          💭 {t('r24.olvidados_title')}
        </div>
        <span className="badge badge-blue">Paso 2 de 5</span>
      </div>
      <p className="muted mb-3">{t('r24.olvidados_intro')}</p>

      <div style={{
        display: 'grid', gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
      }}>
        {categorias.map((cat) => (
          <div key={cat.nombre} style={{
            background: 'var(--gray-50)', borderRadius: 8,
            border: '1px solid var(--gray-200)', padding: 14
          }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>
              {cat.icon} {cat.nombre}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cat.items.map((it) => {
                const ya = marcados[it] || items.some(i => i.alimento === it);
                return (
                  <button
                    key={it}
                    type="button"
                    onClick={() => handleAdd(it)}
                    disabled={ya}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 16,
                      border: ya ? 'none' : '1px solid var(--gray-300)',
                      background: ya ? 'var(--success-500)' : 'white',
                      color: ya ? 'white' : 'var(--gray-700)',
                      cursor: ya ? 'default' : 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      transition: 'all 0.15s'
                    }}
                  >
                    {ya ? '✓' : '+'} {it}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-3" style={{ background: 'var(--unah-yellow-100)', borderColor: 'var(--unah-yellow-500)' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>💡 ¿Por qué este paso?</div>
        <div className="small">
          La metodología AMPM-USDA contempla este paso porque las personas tienden a olvidar
          alimentos consumidos en pequeñas cantidades (bebidas, condimentos, snacks). Preguntar
          por categorías mejora significativamente la exhaustividad del recordatorio.
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// PASO 3: Hora y ocasión
// ====================================================================
const Step3HoraOcasion = ({ items, updateItem, tiempos, t }) => {
  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
          🕐 {t('r24.step3')}
        </div>
        <span className="badge badge-blue">Paso 3 de 5</span>
      </div>
      <p className="muted mb-3">{t('r24.step3_help')}</p>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
          Vuelva al paso 1 para listar los alimentos consumidos.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Alimento</th>
              <th style={{ width: 140 }}>{t('r24.hour')}</th>
              <th style={{ width: 200 }}>{t('r24.meal')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.uid}>
                <td>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{it.alimento}</td>
                <td>
                  <input
                    className="input" type="time" value={it.hora}
                    onChange={(e) => updateItem(it.uid, { hora: e.target.value })}
                    style={{ padding: '6px 8px', fontSize: 13 }}
                  />
                </td>
                <td>
                  <select className="select" value={it.tiempo}
                    onChange={(e) => updateItem(it.uid, { tiempo: e.target.value })}
                    style={{ padding: '6px 8px', fontSize: 13 }}>
                    <option value="">— Seleccione —</option>
                    {tiempos.map(tc => <option key={tc.id} value={tc.id}>{tc.nombre}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ====================================================================
// PASO 4: Detalle (cantidad, porción, preparación)
// ====================================================================
const Step4Detalle = ({ items, updateItem, porciones, t }) => {
  const preps = t('r24.preparation_options').split(',');
  // Sub-conjunto de porciones más comunes
  const porcionesComunes = porciones.slice(0, 30);

  return (
    <div className="card fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="h2" style={{ margin: 0, color: 'var(--unah-blue-800)' }}>
          📝 {t('r24.step4')}
        </div>
        <span className="badge badge-blue">Paso 4 de 5</span>
      </div>
      <p className="muted mb-3">{t('r24.step4_help')}</p>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
          Vuelva al paso 1 para listar los alimentos consumidos.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <div key={it.uid} style={{
              background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
              borderRadius: 8, padding: 12
            }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-blue">{i + 1}</span>
                <div style={{ fontWeight: 600, flex: 1 }}>{it.alimento}</div>
                <div className="muted small">
                  💡 Atlas fotográfico de porciones disponible en sesión 4
                </div>
              </div>

              <div className="form-grid">
                <FormField label={t('r24.quantity')} span={2}>
                  <input className="input" type="number" min="0" step="0.5"
                    value={it.cantidad}
                    onChange={(e) => updateItem(it.uid, { cantidad: parseFloat(e.target.value) || 0 })} />
                </FormField>
                <FormField label={t('r24.portion')} span={4}>
                  <select className="select" value={it.porcion}
                    onChange={(e) => {
                      const p = porcionesComunes.find(p => p.porcion === e.target.value);
                      updateItem(it.uid, { porcion: e.target.value, gramos: p ? p.gramos : 100 });
                    }}>
                    <option value="">— Seleccione porción —</option>
                    {porcionesComunes.map(p => (
                      <option key={p.id} value={p.porcion}>
                        {p.porcion} ({p.gramos}g)
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Gramos totales" hint="Calculado" span={2}>
                  <input className="input" readOnly
                    value={Math.round((it.cantidad || 1) * (it.gramos || 100))}
                    style={{ background: 'var(--gray-100)', fontFamily: 'monospace' }} />
                </FormField>
                <FormField label={t('r24.preparation')} span={4}>
                  <select className="select" value={it.preparacion}
                    onChange={(e) => updateItem(it.uid, { preparacion: e.target.value })}>
                    <option value="">— Seleccione —</option>
                    {preps.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="muted small mt-2">
                ⚡ Energía estimada: <strong>{Math.round((it.kcal100 || 0) * (it.cantidad * it.gramos) / 100)} kcal</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ====================================================================
// PASO 5: Revisión final
// ====================================================================
const Step5Revision = ({ items, ddmCount, ddmCumple, gruposConsumidos, totalKcal, tiempos, t }) => {
  // Agrupar por tiempo de comida
  const porTiempo = React.useMemo(() => {
    const map = {};
    items.forEach(it => {
      const tc = tiempos.find(tt => tt.id == it.tiempo);
      const nombre = tc ? tc.nombre : 'Sin asignar';
      if (!map[nombre]) map[nombre] = [];
      map[nombre].push(it);
    });
    return map;
  }, [items, tiempos]);

  // Los 10 grupos de la DDM/FAO
  const TODOS_GRUPOS = [
    { num: '01', nombre: 'Cereales, raíces y tubérculos' },
    { num: '02', nombre: 'Verduras de hoja verde' },
    { num: '03', nombre: 'Frutas ricas en vitamina A' },
    { num: '04', nombre: 'Carnes y vísceras' },
    { num: '05', nombre: 'Huevos' },
    { num: '06', nombre: 'Pescado y mariscos' },
    { num: '07', nombre: 'Legumbres, nueces y semillas' },
    { num: '08', nombre: 'Leche y productos lácteos' },
    { num: '09', nombre: 'Aceites y grasas' },
    { num: '10', nombre: 'Otros (dulces, especias, bebidas)' },
  ];

  return (
    <div className="fade-in">
      {/* Tarjeta de resumen DDM */}
      <div className="card mb-3" style={{
        background: ddmCumple
          ? 'linear-gradient(135deg, var(--success-500) 0%, #059669 100%)'
          : 'linear-gradient(135deg, var(--unah-red-500) 0%, var(--unah-red-700) 100%)',
        color: 'white', borderColor: 'transparent'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resultado del Recordatorio 24h
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: 4 }}>
              {ddmCumple ? `✓ ${t('r24.ddm_complies')}` : `✗ ${t('r24.ddm_no')}`}
            </div>
            <div style={{ fontSize: '0.95rem', opacity: 0.95, marginTop: 4 }}>
              {ddmCount} de 10 grupos consumidos · {Helpers.num(Math.round(totalKcal))} kcal totales
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)', borderRadius: 12,
            padding: 18, textAlign: 'center', minWidth: 100
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
              {ddmCount}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>/ 10</div>
          </div>
        </div>
      </div>

      {/* Grupos cumplidos */}
      <div className="card mb-3">
        <div className="h3 mb-2">🥗 {t('r24.groupsConsumed')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TODOS_GRUPOS.map(g => {
            const ok = gruposConsumidos.has(g.num);
            return (
              <div key={g.num} style={{
                padding: '8px 12px',
                background: ok ? 'var(--success-100)' : 'var(--gray-100)',
                color: ok ? '#065F46' : 'var(--gray-500)',
                border: `1px solid ${ok ? 'var(--success-500)' : 'var(--gray-300)'}`,
                borderRadius: 6, fontSize: '0.8rem',
                fontWeight: ok ? 600 : 500,
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <span>{ok ? '✓' : '○'}</span>
                <span>{g.num}. {g.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen por tiempo de comida */}
      <div className="card">
        <div className="h3 mb-2">📋 {t('r24.summary')}</div>
        {Object.entries(porTiempo).length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
            Sin alimentos para revisar.
          </div>
        ) : (
          Object.entries(porTiempo).map(([tiempo, lista]) => (
            <div key={tiempo} style={{ marginBottom: 14 }}>
              <div style={{
                fontWeight: 700, color: 'var(--unah-blue-800)',
                paddingBottom: 4, borderBottom: '2px solid var(--unah-blue-100)',
                marginBottom: 6
              }}>
                {tiempo} <span className="muted small">({lista.length} {t('r24.items')})</span>
              </div>
              {lista.map(it => (
                <div key={it.uid} style={{
                  padding: '6px 8px', display: 'flex',
                  justifyContent: 'space-between', fontSize: '0.85rem',
                  borderBottom: '1px solid var(--gray-100)'
                }}>
                  <div>
                    {it.alimento}
                    {it.preparacion && <span className="muted small"> · {it.preparacion}</span>}
                  </div>
                  <div className="muted small">
                    {it.cantidad}× {it.porcion || '—'}
                    {' · '}
                    {Math.round((it.kcal100 || 0) * (it.cantidad * it.gramos) / 100)} kcal
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// ====================================================================
// PANEL: Evaluacion de adecuacion de macro y micronutrientes (R24)
// Marco: docs/marco-teorico-evaluacion-adecuacion-nutricional.md
// ====================================================================
const SEM_COLOR = { verde:'#1f9d55', ambar:'#d9930a', rojo:'#c8102e', info:'#64748b' };
const SEM_BG    = { verde:'#e7f6ec', ambar:'#fdf3e0', rojo:'#fde8eb', info:'#eef2f7' };

const AdecuacionR24 = ({ items, persona }) => {
  const [estandar, setEstandar] = React.useState('iom');
  const etapa = Nutricion.mapEtapa(persona);
  const sexo  = Nutricion.mapSexo(persona);
  const especial = Nutricion.tieneCondicionEspecial(persona);

  // Antropometria: edad real del encuestado; peso/talla editables (no hay antropometria en proto)
  const [peso, setPeso]   = React.useState('');
  const [talla, setTalla] = React.useState('');
  const [edad, setEdad]   = React.useState(persona.edad || '');
  const [pal, setPal]     = React.useState('sedentario');

  const opts = {
    estandar,
    peso:  peso ? parseFloat(peso) : undefined,
    talla_cm: talla ? parseFloat(talla) : undefined,
    edad:  edad ? parseFloat(edad) : undefined,
    pal
  };
  const tot = React.useMemo(() => Nutricion.computeIntake(items), [items]);
  const ev  = React.useMemo(
    () => Nutricion.evaluate(tot, etapa, sexo, opts),
    [tot, etapa, sexo, estandar, peso, talla, edad, pal]
  );

  const meta = ((DataStore.get('requerimientos') || {})._meta || {});
  const stdMeta = ((meta.estandares || {})[estandar] || {});
  const ESTANDARES = [
    { id:'iom', label:'IOM (DRI)' },
    { id:'fao_oms', label:'FAO/OMS' },
    { id:'incap', label:'INCAP' },
  ];

  return (
    <div className="card" style={{ marginTop: 16, border:'2px solid var(--unah-blue-800)' }}>
      <div className="flex items-center justify-between" style={{ flexWrap:'wrap', gap:8 }}>
        <div className="h3" style={{ margin:0 }}>🍎 Adecuacion de nutrientes</div>
        <div className="flex gap-1">
          {ESTANDARES.map(e => (
            <button key={e.id} onClick={() => setEstandar(e.id)}
              style={{ padding:'4px 10px', borderRadius:8, fontSize:'.8rem', fontWeight:600,
                border:`1.5px solid ${estandar===e.id?'var(--unah-blue-800)':'#cbd5e1'}`,
                background: estandar===e.id?'var(--unah-blue-50, #eef3fb)':'white',
                color: estandar===e.id?'var(--unah-blue-800)':'#475569', cursor:'pointer' }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Antropometria para EER y proteina g/kg */}
      <div className="flex gap-2" style={{ flexWrap:'wrap', alignItems:'flex-end', margin:'10px 0' }}>
        {[['Peso (kg)', peso, setPeso, '62'],['Talla (cm)', talla, setTalla, '162'],['Edad (años)', edad, setEdad, '']].map(([lbl,val,set,ph],i)=>(
          <div key={i}>
            <div className="muted small" style={{ marginBottom:2 }}>{lbl}</div>
            <input type="number" value={val} placeholder={ph} onChange={e=>set(e.target.value)}
              style={{ width:90, padding:'5px 8px', border:'1px solid #cbd5e1', borderRadius:6 }} />
          </div>
        ))}
        <div>
          <div className="muted small" style={{ marginBottom:2 }}>Actividad</div>
          <select value={pal} onChange={e=>setPal(e.target.value)}
            style={{ padding:'5px 8px', border:'1px solid #cbd5e1', borderRadius:6 }}>
            <option value="sedentario">Sedentario</option>
            <option value="ligero">Ligero</option>
            <option value="activo">Activo</option>
            <option value="muy_activo">Muy activo</option>
          </select>
        </div>
        <div className="muted small" style={{ alignSelf:'center', maxWidth:200 }}>
          Sin peso/talla se usa antropometría de referencia de la etapa.
        </div>
      </div>

      {/* Disclaimer metodologico obligatorio */}
      <div style={{ background:'#fff8e6', border:'1px solid #f0d48a', borderRadius:8,
        padding:'8px 12px', margin:'10px 0', fontSize:'.82rem', color:'#7a5b12' }}>
        ⚠️ <strong>Indicativo de 1 dia</strong> — un solo R24 no es diagnostico de ingesta usual.
        Aplica a poblacion sana. Etapa: <strong>{etapa || '—'}</strong> · Sexo: <strong>{sexo==='M'?'Hombre':'Mujer'}</strong>.
      </div>

      {especial && (
        <div style={{ background:SEM_BG.ambar, border:'1px solid #f0d48a', borderRadius:8,
          padding:'8px 12px', marginBottom:10, fontSize:'.82rem', color:'#7a5b12' }}>
          Esta persona tiene condicion especial (<strong>{persona.condicion_especial}</strong>):
          se usan referencias propias de esa condicion.
        </div>
      )}

      {!ev.disponible ? (
        <div style={{ background:SEM_BG.info, borderRadius:8, padding:'12px',
          fontSize:'.85rem', color:'#475569' }}>
          {estandar==='incap'
            ? 'INCAP esta pendiente de verificacion documental (PDF escaneado). Seleccione IOM o FAO/OMS.'
            : `Sin referencia disponible para etapa "${etapa}" / sexo en el estandar seleccionado.`}
        </div>
      ) : (
        <React.Fragment>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.85rem' }}>
              <thead>
                <tr style={{ textAlign:'left', color:'#475569', borderBottom:'2px solid #e2e8f0' }}>
                  <th style={{ padding:'6px 8px' }}>Nutriente</th>
                  <th style={{ padding:'6px 8px' }}>Consumo</th>
                  <th style={{ padding:'6px 8px' }}>Referencia</th>
                  <th style={{ padding:'6px 8px' }}>%</th>
                  <th style={{ padding:'6px 8px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ev.filas.map((f, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #eef2f7' }}>
                    <td style={{ padding:'6px 8px', fontWeight:600 }}>
                      {f.nutriente}
                      {f.tipo==='limite' && <span style={{ color:'#c8102e', fontSize:'.72rem' }}> (limite)</span>}
                      {f.tipo==='rango' && <span style={{ color:'#64748b', fontSize:'.72rem' }}> (rango)</span>}
                      {f.tipo==='referencia' && <span style={{ color:'#64748b', fontSize:'.72rem' }}> (ref.)</span>}
                    </td>
                    <td style={{ padding:'6px 8px' }}>{f.consumido} {f.unidad}</td>
                    <td style={{ padding:'6px 8px', color:'#475569' }}>
                      {f.referencia}{f.tipo==='minimo'||f.tipo==='meta'||f.tipo==='limite' ? ' '+f.unidad : ''}
                      {f.biodisp && <div style={{ fontSize:'.7rem', color:'#94a3b8' }}>biodisp {f.biodisp}</div>}
                    </td>
                    <td style={{ padding:'6px 8px' }}>{f.pct != null ? f.pct+'%' : '—'}</td>
                    <td style={{ padding:'6px 8px' }}>
                      <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:20,
                        fontSize:'.72rem', fontWeight:700,
                        color: SEM_COLOR[f.semaforo], background: SEM_BG[f.semaforo] }}>
                        {f.semaforo==='verde'?'Cubre':f.semaforo==='ambar'?'Cerca':f.semaforo==='rojo'?(f.tipo==='limite'?'Excede':'Bajo'):'—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:8, fontSize:'.74rem', color:'#94a3b8' }}>
            Fuente: <strong>{stdMeta.nombre || estandar}</strong>
            {stdMeta.anio ? ` (${stdMeta.anio})` : ''}.
            {stdMeta.restricciones ? ' Restriccion: '+stdMeta.restricciones : ''}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

window.R24 = R24;
