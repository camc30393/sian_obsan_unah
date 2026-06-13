# SIAN · Sistema de Información Alimentaria y Nutricional

> **Versión 1.1 — Prototipo no funcional con retroalimentación 1 incorporada**
> 22 de 22 pantallas · Listo para presentación ante DICITH UNAH

**Autor:** Christian Alexis Manzanares Cruz
**ORCID:** [0009-0004-7419-0449](https://orcid.org/0009-0004-7419-0449)
**Institución:** OBSAN · Carrera de Nutrición · UNAH

---

## Cambios en v1.1 (retroalimentación 1)

### General
- ✅ Banner reducido a "⚠️ PROTOTIPO NO FUNCIONAL"
- ✅ Tooltips ℹ con explicación completa de siglas (AMDR, DDM, INCAP, EFSA, USDA, CV, MNA, etc.)
- ✅ Sidebar con secciones colapsables, todas expandidas por defecto
- ✅ Drawer móvil con botón hamburguesa
- ✅ Responsividad total (móvil, tablet, desktop, pizarras 4K)

### Dashboard
- ✅ Filtro de período de análisis con dos calendarios (fecha inicio/fin)
- ✅ Atajos rápidos: últimos 30 días, este año, año anterior, todo

### Encuestados
- ✅ Expediente = ID único interno (EXP-00001)
- ✅ Columna DNI antes del nombre (formato 0801-1994-02095)
- ✅ "+ Nuevo encuestado" abre modal con 4 secciones (generales/demográficos/geográficos/socioeconómicos)
- ✅ Botones lápiz (editar) y X (eliminar) por fila + modal de confirmación
- ✅ Click en fila abre modal de perfil completo

### Buscar DNI
- ✅ "Ver perfil completo" abre modal con datos completos
- ✅ "Ver" R24 abre modal con detalle + botones editar/eliminar

### Datos socioeconómicos
- ✅ Sección 3 (Geografía): municipios filtrados según departamento
- ✅ Si país ≠ Honduras: campos depto/municipio se vuelven texto libre

### Antropometría
- ✅ PersonPicker para vincular medición a un encuestado por DNI o nombre
- ✅ Modo "tutor" para infantes (lactante/preescolar/escolar)
- ✅ Fecha de nacimiento opcional con cálculo automático de edad
- ✅ Selección automática de etapa de vida según edad calculada
- ✅ Modal cuestionario MNA completo (18 ítems: cribaje A-F + evaluación G-R)

### Recordatorio 24h
- ✅ PersonPicker obligatorio antes de iniciar la entrevista
- ✅ Calendario para seleccionar fecha del R24 (no solo "ayer")
- ✅ Catálogo INCAP con botón "+ Nuevo alimento" + lápiz/X por cada alimento

### Análisis longitudinal
- ✅ Botón "Ver historial →" arreglado con onClick correcto
- ✅ Listado de personas con stopPropagation y feedback "sin resultados"

### Mapa geográfico
- ✅ Toggle de nivel: Departamento / Municipio
- ✅ GeoJSON realista (no rectángulos): 18 departamentos + 81 municipios sintéticos con formas realistas
- ✅ Popup con jerarquía (depto + municipio cuando aplica)

---

## Archivos entregables (v1.1)

| Archivo | Descripción |
|---|---|
| `SIAN_prototipo_v1.1.zip` | Prototipo completo (todos los archivos) |
| `MODELO_DATOS_SIAN.docx` | Propuesta de modelo relacional PostgreSQL+PostGIS |
| `DOCUMENTACION_SIAN.docx` | Documentación general (15 capítulos) |
| `DICCIONARIO_DATOS_SIAN.xlsx` | Diccionario de variables (11 hojas) |

---

## Inicio rápido

```bash
# Windows
iniciar.bat

# macOS / Linux
./iniciar.sh

# Manual
python3 servidor.py
```

Abrir `http://127.0.0.1:8080/`

---

## Stack técnico

| Capa | Tecnología | Carga |
|---|---|---|
| UI | React 18 | CDN |
| Estilos | Tailwind CSS + theme.css custom | CDN |
| Visualización | Recharts 2.12 | CDN |
| Mapas | Leaflet 1.9 + OpenStreetMap | CDN |
| JSX runtime | Babel standalone | CDN |
| Servidor | Python http.server | local |

**No requiere `npm install`** — todo se transforma en el navegador.

---

## Componentes nuevos en v1.1

- **`Modal.js`** — modal genérico reutilizable con backdrop, ESC para cerrar, header coloreable, footer flexible
- **`PersonPicker.js`** — selector de encuestado por DNI o nombre, con modo tutor para infantes
- Sidebar y Topbar refactorizados con estado móvil

---

## Estructura del proyecto

```
sian/
├── index.html                      Punto de entrada
├── servidor.py                     Servidor HTTP local
├── iniciar.{bat,sh}                Lanzadores
├── README.md                       Este archivo
├── INSTALACION.txt                 Guía de instalación
├── DOCUMENTACION_SIAN.docx         Documento principal (15 capítulos)
├── DICCIONARIO_DATOS_SIAN.xlsx     Diccionario de datos (11 hojas)
├── MODELO_DATOS_SIAN.docx          Modelo relacional propuesto (NUEVO v1.1)
│
├── assets/css/theme.css            Tema visual UNAH + responsive
├── data/                           12 archivos de datos
│   ├── encuestados.json (5,523)
│   ├── recordatorios.json (10,000)
│   ├── alimentos_incap.json (2,469)
│   ├── recetas_hondurenas.json (30)
│   ├── honduras_departamentos.geojson (18 deptos REALISTAS)
│   ├── honduras_municipios.geojson (81 municipios) ← NUEVO v1.1
│   └── ...
├── locales/{es,en}.json
└── js/
    ├── app.js
    ├── components/                 11 componentes (incluye Modal y PersonPicker NUEVOS)
    ├── pages/                      18 páginas (22 pantallas)
    └── utils/                      4 utilidades
```

---

## Verificaciones v1.1

| Validación | Estado |
|---|---|
| 34/34 archivos JS válidos (Babel parse) | ✓ |
| 12 archivos JSON/GeoJSON válidos | ✓ |
| DOCX y XLSX validados con OOXML | ✓ |
| GeoJSON con 18 departamentos + 81 municipios | ✓ |
| i18n bilingüe completo (ES/EN) | ✓ |
| Todas las pantallas accesibles desde sidebar expandido | ✓ |

---

© 2026 OBSAN-UNAH. Christian A. Manzanares Cruz · ORCID 0009-0004-7419-0449
