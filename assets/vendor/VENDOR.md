# Librerías vendorizadas — Prototipo SIAN v1.1

Todas las dependencias del prototipo están **auto-hospedadas** en esta carpeta con
versión fija. **No hay CDNs en runtime.** El prototipo abre sin internet y es
inmune a que un CDN cambie de versión, retire un archivo o se caiga.

## Motivo (incidente de junio 2026)

El `index.html` cargaba `@babel/standalone` **sin versión** desde unpkg. unpkg
empezó a servir **Babel 8**, cuyo `preset-react` pasó al *automatic runtime* y
empezó a emitir `import { jsx } from "react/jsx-runtime"`. Como los
`<script type="text/babel">` se ejecutan como scripts clásicos (no módulos) y
React entra como global UMD, **todos** los archivos JSX fallaban con:

> Uncaught SyntaxError: Cannot use import statement outside a module

La causa raíz no era el código del prototipo, sino una dependencia de CDN sin pin.
Vendorizar elimina esa clase de fallo de forma permanente.

## Versiones fijadas

| Librería            | Versión  | Archivo local                                   |
|---------------------|----------|-------------------------------------------------|
| React               | 18.3.1   | `react/react.development.js`                     |
| ReactDOM            | 18.3.1   | `react-dom/react-dom.development.js`             |
| @babel/standalone   | 7.26.4   | `babel/babel.min.js`                            |
| Recharts            | 2.12.7   | `recharts/Recharts.js`                          |
| prop-types          | 15.8.1   | `prop-types/prop-types.min.js`                  |
| Leaflet             | 1.9.4    | `leaflet/leaflet.js` + `leaflet.css` + `images/`|
| Tailwind CSS        | 3.4.16   | `tailwind/tailwind.css` (precompilado)          |
| Inter (variable)    | fontsource | `fonts/inter.css` + `fonts/files/*.woff2`     |

Babel se mantiene en la rama **7.x** a propósito: usa el runtime clásico
(`React.createElement`) por defecto, que es lo que necesita un prototipo sin
bundler. El `index.html` además incluye una red de seguridad que fuerza el
runtime clásico vía `Babel.registerPreset`.

## Tailwind: cómo recompilar si se agregan utilidades nuevas

`tailwind/tailwind.css` es CSS **estático** generado escaneando `index.html` y
`js/**/*.js`. Solo contiene las utilidades Tailwind realmente usadas (el grueso
del estilo vive en `assets/css/theme.css`, que son clases propias). Si agregas
clases utilitarias Tailwind nuevas (p. ej. `grid-cols-4`, `rounded-xl`),
regenera el CSS:

```bash
npm install tailwindcss@3.4.16
npx tailwindcss \
  -c tailwind.config.js \
  -i input.css \
  -o assets/vendor/tailwind/tailwind.css --minify
```

con `input.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
y `tailwind.config.js` apuntando `content` a `index.html` + `js/**/*.js`, con la
paleta `unah` (blue `#002F87`, yellow `#F4B71A`, red `#C8102E`) en `theme.extend.colors`.

> Nota: clases Tailwind construidas dinámicamente por interpolación
> (`` `text-${color}-500` ``) NO las detecta el escaneo estático. El prototipo
> hoy no usa ninguna (solo interpola clases propias como `badge-${x}`), pero si
> se introducen, añádelas a un `safelist` en la config.
