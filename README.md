# Mar y Arena · Sistema de pedidos (demo)

Demo de pedidos para restaurante: mesas, cocina, cobro, pedidos de WhatsApp, domicilios, caja, gastos, cierre y menú.
React + Vite + Tailwind CSS v4. **Sin base de datos**: todo se guarda en el `localStorage` del navegador y se sincroniza en vivo entre pestañas.

## Accesos de prueba (clave `1234`)

| Rol | Usuario |
|---|---|
| Administrador · Caja | `marta` |
| Mesero | `luis`, `kelly`, `andres` |
| Domiciliario | `jhon`, `wilmer` |

Tip: abre dos pestañas (una como mesero y otra como admin) para ver los pedidos llegar en vivo.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Logos

Pon tus logos en `public/` con estos nombres:

- `public/logo-wide.png`: logo horizontal (barra lateral y superior)
- `public/logo-circle.png`: logo circular (pantalla de inicio de sesión)

Si no existen, se usan los SVG provisionales (`logo-wide.svg`, `logo-circle.svg`).

## Estructura

```
src/
  main.jsx               punto de entrada
  App.jsx                rutas por hash (#mesas, #pedido-3, #cobrar-3, ...) y permisos por rol
  index.css              Tailwind + tokens de color/fuente (@theme) + clases de componente
  store/AppContext.jsx   estado global, persistencia en localStorage, sesión, toasts
  lib/constants.js       roles, menú inicial, métodos de pago, etc.
  lib/utils.js           formato de dinero/fechas, datos iniciales (seed), helpers
  lib/parser.js          lector del texto de pedidos de WhatsApp
  components/            Shell (layouts), Icons, ui (Modal, Logo, Seg, Kpi...)
  views/                 una vista por pantalla
```

## Despliegue

- **Vercel**: importa el repositorio y Vercel detecta Vite solo (build `npm run build`, salida `dist`).
  Como las rutas usan `#`, no hace falta configurar rewrites.
- **CLI**: `npx vercel --prod`
