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
| `src/lib/submit.js` | `submitRequest()` y adaptadores de envío (`leadAdapter` → Worker, `httpAdapter`, `mailtoAdapter`). |
| `worker/` | Worker de Cloudflare: respuesta automática al formulario (ver sección siguiente). |

## Envío de solicitudes — [FALTA: servicio de envío]

No hay endpoint. `submitRequest()` (`src/lib/submit.js`) usa un adaptador:

- **Por defecto, `mailtoAdapter`**: abre el programa de correo del visitante con la solicitud redactada para `pableteizquierdoperez@gmail.com`. `mailto:` no puede adjuntar archivos, así que la web le pide que adjunte allí sus fotos.
- **Para enchufar un servicio o backend**:
  1. Define `VITE_SUBMIT_ENDPOINT=https://…` al construir. Se usará `httpAdapter`, que hace `POST` `multipart/form-data` con los campos (`nombre`, `email`, `telefono`, `tipo`, `acabados`, `m2`, `descripcion`, `privacidad`) y las fotos en `fotos` (varias). Sirve para Formspree, Basin, Getform, una función serverless propia (Vercel/Netlify + Resend/Postmark) o cualquier backend que reciba multipart. El destino del email se configura en ese servicio.
  2. O registra tu propio adaptador: `setAdapter(async ({ data, photos, labels, lang }) => ({ ok: true, mode: 'http' }))`.
- La v3 tenía una función serverless con Resend (JSON + base64); está en `legacy/2con2-v3/api/` como referencia, no conectada.
- Validación en cliente: todo obligatorio salvo las fotos; descripción ≥ 10 caracteres; fotos JPG/PNG/WebP/HEIC, hasta 8, 10 MB cada una. Hay un campo trampa (`website`) para cuando exista backend. **Valida también en el servidor.**

## Respuesta automática al formulario (Worker de Cloudflare · DEMO)

Al enviar el formulario, el Worker (`worker/`) valida en servidor, guarda la solicitud en Cloudflare D1, envía una confirmación al visitante (con enlace para reservar una llamada) y un resumen al dueño, y una cron diaria manda como máximo 2 recordatorios suaves (24 h y 3 días) si no hay reserva. **Está pensado como demo comercial: `DEMO_MODE=true` por defecto.**

```
Formulario (React) ──POST JSON──▶ /api/lead ──▶ D1 (leads, rate_limits)
                                       └──▶ Resend (confirmación, resumen, recordatorios)
cron diaria ─▶ recordatorios 1 y 2        /api/unsubscribe  (baja)      /api/booking (webhook, opcional)
```

### Qué hace cada pieza
| Archivo | Función |
|---|---|
| `worker/src/lead.js` | `POST /api/lead`: Origin, límite por IP, tamaño, JSON, validación, honeypot, guardado y correos. |
| `worker/src/validate.js` | Reutiliza `src/lib/validate.js` (mismas reglas que el cliente) y añade comprobación de tipos y saneado. |
| `worker/src/mail.js` | Envío con Resend **y la puerta del modo demo** (lista blanca). |
| `worker/src/templates.js` | Correos ES/EN: confirmación, resumen al dueño, recordatorio 1 y 2 (texto + HTML con todo escapado). |
| `worker/src/unsubscribe.js` | Baja funcional (`GET` pide confirmar, `POST` da de baja; también vale para «baja con un clic» del cliente de correo). |
| `worker/src/scheduled.js` | Cron: recordatorios y limpieza del límite por IP. |
| `worker/src/ai.js` | Borrador con IA para el dueño (apagado por defecto). |
| `worker/src/booking.js` | Webhook opcional del calendario para marcar `booked`. |
| `worker/schema.sql` | Tablas `leads` (estados `new`, `booked`, `reminded1`, `reminded2`, `unsubscribed`) y `rate_limits`. |

**Datos que se guardan** (solo lo necesario): id, fecha, idioma, nombre, email, teléfono, tipo, acabados, m², mensaje, momento del consentimiento, estado y si fue demo. **No** se guardan fotos (el formulario no las sube: solo se envía cuántas se eligieron y el correo de confirmación pide al visitante que las mande respondiendo) ni la IP en claro (solo un hash con clave, para el límite). [FALTA: política de conservación y borrado de datos; hoy no hay borrado automático.]

### Modo demo (obligatorio)
- `DEMO_MODE` vale `true` si no se define. Con `true`, **ningún correo sale a una dirección que no esté en `DEMO_ALLOWLIST`** (incluido el dueño). El resto se escribe en el log del Worker (`mail.demo_blocked`, con el destinatario enmascarado) y la web muestra una **vista previa** del correo al visitante bajo el formulario.
- En demo, el asunto lleva `[DEMO]` y el cuerpo un aviso de que son datos ficticios. Escribe datos inventados marcados `[DEMO]` al grabar.
- Para desactivarlo en producción real: `DEMO_MODE = "false"` en `worker/wrangler.toml` (sección `[vars]`) y volver a desplegar. Fuera de demo, el Worker **no envía** si falta `RESEND_API_KEY`, `MAIL_FROM`, `BOOKING_URL`, `POSTAL_ADDRESS` o `PUBLIC_BASE_URL` (queda en el log como `mail.skipped`).

### Probarlo en local (Windows, PowerShell, desde la carpeta del proyecto)
Requisitos: Node 22.5 o superior.
```powershell
npm install
Copy-Item worker\.dev.vars.example worker\.dev.vars   # edita APP_SECRET y DEMO_ALLOWLIST
"VITE_LEAD_ENDPOINT=/api/lead" | Out-File -Encoding ascii .env.local
npm run worker:node        # Worker local en :8787 (D1 simulada con SQLite; no necesita Cloudflare)
npm run dev                # en otra terminal: la web en :5173; Vite redirige /api al Worker
npm test                   # incluye 17 pruebas del Worker
```
- Con `DEMO_ALLOWLIST` vacío no sale ningún correo: verás la vista previa en la web y los registros en la terminal del Worker.
- Para recibir de verdad el correo en tu dirección de pruebas: pon tu correo en `DEMO_ALLOWLIST`, y en `worker/.dev.vars` añade `RESEND_API_KEY` y `MAIL_FROM`.
- Para ver un recordatorio sin esperar un día: abre `http://127.0.0.1:8787/__scheduled?now=2026-11-14T12:00:00Z` (una fecha posterior a la de tu solicitud; solo existe en el servidor local).
- Alternativa con el entorno real de Cloudflare: `npm run worker:dev` (usa `wrangler`, que descarga `npx`).

### Desplegar (una vez resueltos los [FALTA])
```powershell
npx wrangler login
npx wrangler d1 create 2con2estudio-leads                     # copia el database_id a worker/wrangler.toml
npx wrangler d1 execute 2con2estudio-leads --file=worker/schema.sql --config worker/wrangler.toml --remote
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"   # genera APP_SECRET
npx wrangler secret put APP_SECRET     --config worker/wrangler.toml   # pega el valor generado
npx wrangler secret put RESEND_API_KEY --config worker/wrangler.toml   # la clave de tu proveedor
npx wrangler deploy --config worker/wrangler.toml
```
Los secretos (`APP_SECRET`, `RESEND_API_KEY`, `BOOKING_WEBHOOK_SECRET`) **solo** se guardan con `wrangler secret put` o en `worker/.dev.vars` (ignorado por git). Nunca en `wrangler.toml` ni en el código; `tests/worker.test.mjs` falla si detecta claves en el repositorio.
El Worker debe responder en `https://TU-DOMINIO/api/*` (descomenta `routes` en `wrangler.toml`) y la web debe construirse con `VITE_LEAD_ENDPOINT=/api/lead`.

### Variables del Worker (`worker/wrangler.toml` → `[vars]`)
| Variable | Valor por defecto | Uso |
|---|---|---|
| `DEMO_MODE` | `true` | Ver «Modo demo». |
| `DEMO_ALLOWLIST` | vacío | Correos que sí pueden recibir en demo, separados por comas. |
| `AI_DRAFT` | `false` | `true` + binding `[ai]` descomentado: el dueño recibe un borrador de respuesta marcado «NO enviado». |
| `OWNER_EMAIL` | email público del cliente | Destino del resumen. |
| `MAIL_FROM`, `BOOKING_URL`, `POSTAL_ADDRESS`, `PUBLIC_BASE_URL` | vacío | Ver lista de pendientes. |
| `ALLOWED_ORIGINS` | vacío | Si se rellena, `/api/lead` solo acepta peticiones de navegador desde esos orígenes. |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MIN` | `8` / `60` | Peticiones por IP y ventana. |

### IA opcional (`AI_DRAFT=true`)
El modelo solo devuelve texto: no tiene herramientas, base de datos ni correo. Guardar y enviar lo hace el código del Worker. El texto del visitante viaja como dato dentro de un bloque JSON (nunca en las instrucciones), la salida se limpia de enlaces y correos, y el borrador solo llega al dueño, etiquetado como no enviado.

### Calendario (`/api/booking`, opcional)
Sin `BOOKING_WEBHOOK_SECRET` la ruta no existe. Con él, acepta el webhook `BOOKING_CREATED` de Cal.com (firma `x-cal-signature-256`) y marca `booked` al visitante para que no reciba recordatorios. Está escrito según el formato documentado de Cal.com y **no se ha probado contra un Cal.com real**; sin el webhook, los recordatorios se mandan igualmente aunque ya haya reservado.

### Pendientes `[FALTA]` de esta iteración
1. **Proveedor de correo y su clave** (el código usa Resend; cambiar de proveedor es reescribir el bloque `fetch` de `deliver` en `worker/src/mail.js`) → `RESEND_API_KEY` como secreto y `MAIL_FROM` con un remitente verificado.
2. **URL del calendario** (p. ej. Cal.com) → `BOOKING_URL`.
3. **Dirección postal** para el pie de los correos → `POSTAL_ADDRESS`. Ojo: `src/content/business.js` indica que el estudio **no tiene dirección postal**; hay que decidir qué dirección de contacto se pone.
4. **Tu correo de pruebas** → `DEMO_ALLOWLIST`.
5. **Dominio definitivo** → `PUBLIC_BASE_URL`, `routes` y `VITE_SITE_URL`.
6. **ID de la base de datos D1** → `database_id` en `wrangler.toml` (se obtiene con `wrangler d1 create`).
7. **Responsable del tratamiento, NIF y política de privacidad** (ya pendiente) y **política de conservación de datos**.
8. Confirmar el formato del webhook con el calendario elegido.

## Baremo

Rellena `min`/`max` (€/m²) en `src/content/pricing.js` y pon `SHOW_ESTIMATE = true`. El formulario mostrará, al elegir tipo, acabados y m², un «rango aproximado y no vinculante». Mientras sea `false` no aparece ninguna cifra.

## Variables de entorno

| Variable | Uso |
|---|---|
| `VITE_SITE_URL` | URL pública (canonical, OG, JSON-LD, sitemap). [FALTA: dominio definitivo]; sin ella se usa `https://2con2estudio.example`. |
| `VITE_SUBMIT_ENDPOINT` | Opcional. Endpoint multipart para las solicitudes. |
| `VITE_LEAD_ENDPOINT` | Opcional. `/api/lead` activa el Worker de `worker/` (JSON). Tiene prioridad sobre las otras dos vías; sin ella el formulario sigue usando `mailto`. |

## Verificación (regla 6)

Con `npm run dev` y Playwright MCP: `browser_run_code_unsafe` con `filename: scripts/verify-shots.cjs` hace capturas por sección y por scroll en 25 % (cambia `W` a 390 para móvil) en `shots/v4/`. `node scripts/contact-sheet.mjs shots/v4/1440 hoja.jpg` monta una hoja de contacto. v5: `scripts/verify-v5.cjs` (casa, carga, plano a obra, hotlinks, consola y red). `?introT=1300` congela la carga de entrada en ese instante. `window.__cfHouse.renders` cuenta los fotogramas WebGL de la casa. Las animaciones se avanzan con `window.__cfTicker.step(n)`; `window.__cfTicker.stats()` da ms por fotograma.

## Pendiente del cliente

Ver `docs/skills-log.md` (lista completa de `[FALTA]` y `[DEMO]`).
