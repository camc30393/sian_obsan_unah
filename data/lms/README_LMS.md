# Tablas LMS de la OMS — PENDIENTES de obtener

El motor `js/utils/antropometria.js` calcula Z-scores con el método LMS oficial,
pero **requiere las tablas LMS de la OMS** que NO se incluyen en el prototipo
(deben solicitarse a las nutricionistas / descargarse de la OMS).

## Archivos requeridos (formato JSON)
Colocar en esta carpeta como `data/lms/<indicador>_<sexo>.json`
(`sexo` = `m` | `f`). Cada archivo: `[{ "x": <edad_dias o talla_cm>, "L":.., "M":.., "S":.. }, ...]`

| Indicador | Clave | x = | Rango | Norma |
|---|---|---|---|---|
| Talla/edad | `lhfa_m`, `lhfa_f` | edad (días) | 0–60 m / 5–19 a | OMS 2006 / 2007 |
| Peso/edad | `wfa_m`, `wfa_f` | edad (días) | 0–120 m / 5–10 a | OMS 2006 / 2007 |
| IMC/edad | `bfa_m`, `bfa_f` | edad (días) | 0–60 m / 5–19 a | OMS 2006 / 2007 |
| Peso/talla | `wfl_m`, `wfl_f` (acostado) y `wfh_*` (de pie) | talla (cm) | 45–120 cm | OMS 2006 |
| Perímetro cefálico/edad | `hcfa_m`, `hcfa_f` | edad (días) | 0–60 m | OMS 2007 |

## Fuente oficial
- OMS Child Growth Standards (0–5 a): https://www.who.int/tools/child-growth-standards/standards (tablas "expanded tables", columnas L, M, S).
- OMS Growth reference 5–19 a (2007): https://www.who.int/tools/growth-reference-data-for-5to19-years
- Software de referencia: WHO Anthro / igrowup (macros R/STATA con los mismos LMS).

## Acción
Solicitar a las nutricionistas del proyecto (o descargar) los archivos LMS y
convertirlos a este formato JSON. Mientras no existan, la pantalla de
antropometría mostrará "Z-score no disponible (faltan tablas OMS)" en lugar de
un valor aproximado — decisión metodológica deliberada.
