# 2con2estudio — web v4 «Atelier Mono»

Web de práctica de 2con2estudio (Bea Pérez y Gonzalo Pau, Valencia): diseño de interiores y ejecución de obra.
React + Vite + Motion + Lenis, bilingüe ES/EN, editorial en blanco y negro. La v3 (monografía suiza) está archivada en `legacy/2con2-v3/` y en el historial de git.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ (incluye sitemap.xml y robots.txt)
npm run preview    # http://localhost:4173
npm test           # baremo y validación del formulario
npm run assets     # regenera fotos (WebP/JPG, B/N, plano), favicons, OG y manifest desde assets-cliente/
npm run assets:demo # [DEMO-IMG] fotos de demostración: AVIF/WebP/JPG 640–2400, B/N, plano y mapas de profundidad, desde assets-demo/
```

## Dónde está cada cosa

| Archivo | Contenido |
|---|---|
| `src/content/business.js` | **Datos reales** del cliente y marcadores `[FALTA]` (`SHOW_PLACEHOLDERS`). |
| `public/img-demo/` | [DEMO-IMG] Fotos de demostración (Unsplash). Créditos en `CREDITS.md` e imágenes pendientes de IA en `PROMPTS_IMAGENES.md`. |
| `src/content/demo-content.js` | **Todo lo inventado** `[DEMO]`: roles, cifras, nombres y m² de proyectos, servicios, proceso, testimonios ficticios, FAQ y EN del eslogan. `DEMO_ENABLED = false` retira lo que solo existe con datos inventados. |
| `src/content/pricing.js` | Baremo €/m² por tipo y acabados, **vacío** (`null`) y `SHOW_ESTIMATE = false`. |
| `src/i18n/es.js`, `en.js` | Textos de interfaz. |
| `src/lib/ticker.js`, `spring.js`, `hooks.js` | Kit de movimiento: rAF único con tiers, muelles a mano (pasos de 1 ms), vigilante de viewport, Lenis. |
| `src/lib/submit.js` | `submitRequest()` y adaptadores de envío. |

## Envío de solicitudes — [FALTA: servicio de envío]

No hay endpoint. `submitRequest()` (`src/lib/submit.js`) usa un adaptador:

- **Por defecto, `mailtoAdapter`**: abre el programa de correo del visitante con la solicitud redactada para `pableteizquierdoperez@gmail.com`. `mailto:` no puede adjuntar archivos, así que la web le pide que adjunte allí sus fotos.
- **Para enchufar un servicio o backend**:
  1. Define `VITE_SUBMIT_ENDPOINT=https://…` al construir. Se usará `httpAdapter`, que hace `POST` `multipart/form-data` con los campos (`nombre`, `email`, `telefono`, `tipo`, `acabados`, `m2`, `descripcion`, `privacidad`) y las fotos en `fotos` (varias). Sirve para Formspree, Basin, Getform, una función serverless propia (Vercel/Netlify + Resend/Postmark) o cualquier backend que reciba multipart. El destino del email se configura en ese servicio.
  2. O registra tu propio adaptador: `setAdapter(async ({ data, photos, labels, lang }) => ({ ok: true, mode: 'http' }))`.
- La v3 tenía una función serverless con Resend (JSON + base64); está en `legacy/2con2-v3/api/` como referencia, no conectada.
- Validación en cliente: todo obligatorio salvo las fotos; descripción ≥ 10 caracteres; fotos JPG/PNG/WebP/HEIC, hasta 8, 10 MB cada una. Hay un campo trampa (`website`) para cuando exista backend. **Valida también en el servidor.**

## Baremo

Rellena `min`/`max` (€/m²) en `src/content/pricing.js` y pon `SHOW_ESTIMATE = true`. El formulario mostrará, al elegir tipo, acabados y m², un «rango aproximado y no vinculante». Mientras sea `false` no aparece ninguna cifra.

## Variables de entorno

| Variable | Uso |
|---|---|
| `VITE_SITE_URL` | URL pública (canonical, OG, JSON-LD, sitemap). [FALTA: dominio definitivo]; sin ella se usa `https://2con2estudio.example`. |
| `VITE_SUBMIT_ENDPOINT` | Opcional. Endpoint multipart para las solicitudes. |

## Verificación (regla 6)

Con `npm run dev` y Playwright MCP: `browser_run_code_unsafe` con `filename: scripts/verify-shots.cjs` hace capturas por sección y por scroll en 25 % (cambia `W` a 390 para móvil) en `shots/v4/`. `node scripts/contact-sheet.mjs shots/v4/1440 hoja.jpg` monta una hoja de contacto. v5: `scripts/verify-v5.cjs` (casa, carga, plano a obra, hotlinks, consola y red). `?introT=1300` congela la carga de entrada en ese instante. `window.__cfHouse.renders` cuenta los fotogramas WebGL de la casa. Las animaciones se avanzan con `window.__cfTicker.step(n)`; `window.__cfTicker.stats()` da ms por fotograma.

## Pendiente del cliente

Ver `docs/skills-log.md` (lista completa de `[FALTA]` y `[DEMO]`).
