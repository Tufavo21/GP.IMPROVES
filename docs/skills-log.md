# Registro de skills y decisiones

| Proyecto | Fingerprint (estilo) | Skills | Tipografía | Paradigma de hero | Tono de color | Layout | Detalle de firma | Conflictos resueltos |
|---|---|---|---|---|---|---|---|---|
| Marjal · clínica estética València (beta, datos DEMO) | **Dimension** (dado por el cliente; Fases -1 y 1 omitidas) | review-animations e impeccable (criterios aplicados como checklist manual; la skill `review-animations` no figura entre las instaladas en esta sesión). `redesign-existing-projects` no aplica. | DM Sans 500 (display `clamp(44px, 6vw, 72px)`, -0.035em) + Geist 500 en encabezados | Panel "Hero Horizon" ámbar→coral→cobalto, texto a la izquierda, marco de imagen 40px/40px/0/0 a la derecha con parallax de capas | Casi acromático; violeta `#6b62f2` solo en la franja Dusk Violet (degradado) | Columna de 1200px, secciones 64-80px, alterna lienzo y cristal | Nav flotante en píldora + banner píldora + sección Proceso sticky con degradado que se desplaza y texto enmascarado | Ver abajo |

## Conflictos resueltos (Prompt Maestro v6.1 > Dimension)
- **Nav**: el md pide radio asimétrico de 19px; el encargo pide píldora → 9999px.
- **Hairline #e5e5e5**: se usa pleno en controles (píldoras, inputs: contraste 3:1) y `rgba(229,229,229,.16)` (`--hairline-soft`) en divisores decorativos y tarjetas de cristal.
- **Hero Horizon**: ámbar y coral oscurecidos (`#a3470a`, `#a83a2e`) y cobalto `#1f46c4` para que el texto blanco cumpla AA, incluso sobre el cristal del Proceso.
- **Errores de formulario**: color `#ffb4a8` (tinte del coral del degradado) + icono; no es un color de marca nuevo.
- **Geist**: el md lo limita a ≥24px en cuerpo, pero su "Section Header" usa Geist 18px/500 para el párrafo de apertura; se respeta esto último.
- **Titulares ≤500**: se evita el 600 de Geist en todos los h1-h3.
- **`#686868` (Slate)**: no se usa para texto (3.5:1 sobre #0a0a0a). El número atenuado de las filas usa Ash al 68% (≥4.5:1).
- **Sombras**: ninguna. El md lista una sombra de elevación para la nav, pero también prohíbe box-shadow para elevar; gana la prohibición.
- **Acordeón**: la altura animada usa `grid-template-rows` (CSS). La altura `auto` con Motion dejaba la visibilidad bloqueada.
- **Archivos**: `docs/design/dimension.md` no existía; se creó con el texto entregado. El `index.html` anterior (Mundo Pato) se movió a `legacy/mundo-pato.html`.

---

## 2026-11-04 · Hercas Peluqueros (València) · demo de rediseño

| Campo | Valor |
|---|---|
| Fecha | 2026-11-04 |
| Cliente | Hercas Peluqueros S.L. — C/ del Cronista Carreres, 9, 46003 València |
| Carpeta | `hercas/` (vanilla HTML/CSS/JS, servidor `hercas` en `.claude/launch.json`, puerto 5180) |
| Estilo | Editorial clásico-elegante (revista de peluquería de prestigio) |
| Skills | `impeccable` (craft + brand), `redesign-existing-projects` (auditoría de hercaspeluqueria.com), `emil-design-eng` en lugar de `review-animations`, que no está instalada en esta máquina (tampoco `improve-animations` ni `find-animation-opportunities`) |
| Piezas de movimiento | M15 (reveal letra a letra + blur) + M19 (parallax de 2 capas en el hero) + M22 (contador «+35» ligado al scroll) + M9 (panel de cierre en duotono). BASE: ticker rAF único con muelles, marquesina, botones con flood y `scale(0.97)` |
| Tipografía | Bodoni Moda (display) + Figtree (cuerpo, 19px) |
| Color | Rojo del logo `#FD1827` (extraído del PNG), rojo profundo `#C40F1D` para superficies con texto blanco, negro cálido `#171314`, blanco roto `#F7F1EF` tintado hacia el rojo |
| Verificación | Playwright: desktop 1440 y móvil 390 por sección; scroll al 0/25/50/75/100 %; contador 0→35 monótono con rueda real; formulario solo con datos inválidos (sin envío ni navegación); 0 errores de consola; enlaces y anclas; `<head>`; ES/EN; `prefers-reduced-motion` |

### Conflictos resueltos
- **Playfair Display** (pedida «o similar») está en la lista de vetadas de impeccable → **Bodoni Moda**, didona de revista con eje óptico.
- **Atkinson Hyperlegible Next** se probó para el cuerpo, pero su cero tachado («46ØØ3», «1Ø:ØØ») chocaba con el tono clásico y no tiene alternativa OpenType → **Figtree**.
- **Fondo crema**: impeccable lo marca como tópico; el cliente lo pide → blanco roto con matiz del rojo de marca (no arena).
- **Regla de 10 caracteres**: aplicada al único texto libre (*Mensaje*, con espacios recortados). *Tema* pasó a ser un desplegable para no exigir 10 caracteres a un asunto.
- **Plaqueta del logo**: en secciones negras, el logo original va sobre una plaqueta `#F7F1EF`; en rojo, versión blanca calada (generada del PNG); en claro, el original sin nada. La barra de la cabecera toma el color exacto de la sección de debajo, así que no se ve como una caja.
- **JSON-LD**: sin `aggregateRating` (Google ignora las reseñas «propias» de LocalBusiness) ni coordenadas, que no estaban confirmadas.

### Hallazgos
- Todas las fotos de la web actual son de stock (nombres tipo Envato `…-utc-…`), **ninguna del salón**. Instagram @hercasvalencia pide sesión para ver los posts. Se reutilizan en duotono o con color atenuado y el pie lo avisa. **[FALTA]** fotos reales: fachada con neón, sillones rojos, trabajos.
- La web actual enlaza su «Política de Privacidad» a `/politicas-de-cookies` (404) y no existe ninguna página de privacidad → **[FALTA]**; en la demo el texto queda sin enlace y con comentario en el HTML.
- **[FALTA]** precios (se muestra «Precio a consultar»), nombre del propietario/a (las reseñas citan a «Juan Carlos»; no se usa fuera de la cita literal) y confirmar si el sitio va dentro del Kit Digital (la web actual muestra los logos de fondos UE en el pie; la nueva tendría que mantenerlos).
- El dev server de Vite devuelve 200 en rutas inexistentes (fallback SPA); `hercas/404.html` está lista para el hosting estático.
- `noindex` puesto a propósito mientras sea demo; quitarlo al publicar. `og:image` y canonical apuntan a hercaspeluqueria.com, así que funcionarán al desplegar en ese dominio.

### Iteración 2 · 2026-11-04 · piezas M4 + M5 + M6 (técnica traducida de `clinica-ferrer/src`, paleta Hercas intacta)

| Pieza | Dónde | Mecánica traducida (sin objetos ni colores de Ferrer) |
|---|---|---|
| **M4** PixelDissolve | 6 franjas `[data-dissolve]` entre bloques de color (claro↔negro, claro→rojo, rojo→negro) | Canvas con cuadrícula y ruido determinista; las celdas del color siguiente entran desde abajo en diagonal según el scroll, con muelle (k 240 / c 32). La franja cambia su `data-surface` a mitad de recorrido para que la cabecera acompañe |
| **M5** Halftone + trazo + reticle | Sección nueva «Su visita, paso a paso» (asesoramiento → lavado → corte o color → peinado, textos de la web actual) | Catmull-Rom sobre 4 nodos (horizontal en desktop, en zigzag vertical en móvil); el trazo avanza con el scroll y la mira lo sigue con muelle y «fija» cada parada (escala 1.18 y borde rojo). Halftone en tinta que engorda junto a la ruta, con ondas alrededor de la mira |
| **M6** Timeline | «Más de 35 años de oficio»: sustituye a la escena fija con contador | Rail que se rellena con el scroll (k 200 / c 30); 5 plates escalonadas que entran con `clip-path: inset` + zoom de la imagen; los nodos se encienden al pasar el relleno. El contador +35 avanza con el rail en desktop y con su propia posición en móvil |

Otros cambios: cabecera fija con el logo visible desde el primer fotograma (fuera el logo gigante y el relevo). La barra aparece con muelle (0 → 1 en unos 350 ms, sin rebote). Las reseñas son ahora fichas tipo Google (avatar con inicial en rojo de marca, «Reseña de Google», 5 estrellas dibujadas en SVG con `aria-label`, texto literal). El mapa interactivo es Leaflet 1.9.4 + teselas de OSM, en gris oscuro con chincheta roja en las coordenadas de la ficha de Google (39.4730834, −0.3681971); un clic o toque en el mapa o en la chincheta abre `google.com/maps/dir/?api=1&destination=…`, arrastrar no lo abre, y en táctil un dedo sigue haciendo scroll. Sin cambios en el horario, la marquesina de servicios ni los CTA. Las comprobaciones de visibilidad pasan al ticker (medir rects) en lugar de IntersectionObserver, igual que en el kit.

Verificación Playwright: logo visible en el fotograma 0. Tras el primer paso de rueda ningún texto ni CTA queda bajo la cabecera, y las anclas de la nav dejan el h2 por debajo de la barra. Las tres piezas se disparan en orden en 1440 y en 390 táctil; las estrellas miden 22 px en desktop y 24 px en móvil. El clic en el mapa, en la chincheta y el toque en móvil abren la ruta en Google Maps. Con movimiento reducido todo sale visible (rail lleno, 4 pasos encendidos, contador en 35). ES/EN incluye los textos nuevos. 0 errores de consola.

**Pendiente (no forma parte del menú genérico reutilizable):** hero 3D opcional de cabeza + pelo cuyo cabello se recorta dentro del radio del cursor y vuelve a crecer con decaimiento por fotograma (patrón pincel + decay). Queda **a la espera de confirmar presupuesto y plazos**: requiere encargar o generar el asset 3D de persona + pelo y un shader propio. No se reutiliza el objeto 3D de Clínica Ferrer ni su mecánica de diadema.

### Iteración 3 · 2026-11-04 · hero 3D + paso a paso con paradas + fotos nuevas + reseñas con funda Google

- **Hero 3D (antes pendiente, ahora construido a petición del cliente):** Three.js r160 desde jsDelivr con import map; `hercas/js/hero3d.js`. Cabeza «Lee Perry-Smith» (Infinite Realities, CC BY 3.0) con mapas de color y normales, y el busto fundido en alfa por debajo del mentón. El pelo son 16.000 mechones procedurales (7.000 en táctil) dibujados en GPU como `LineSegments`:
  - **Curva y luz:** el peinado va hacia atrás, tangente al cuero cabelludo, con gravedad, puntas hacia dentro, colisión con un elipsoide del cráneo y sombreado Kajiya-Kay con contraluz rojo de marca.
  - **Corte:** la longitud de cada mechón vive en una textura flotante. En CPU se proyectan 5 puntos de cada mechón y, si cruzan el anillo del cursor, se cortan por ese punto y el trozo cae como partícula. Fuera de la zona vuelven a crecer con decaimiento exponencial por fotograma (pincel + decay).
  - **Coste e interacción:** unos 5 ms de CPU por fotograma de corte con 16.000 mechones. Cursor de tijeras y anillo; en móvil se corta deslizando el dedo en horizontal y el scroll vertical sigue funcionando (`touch-action: pan-y`).
  - **Respaldo:** si falla WebGL2, queda la foto. No se ha reutilizado ningún objeto ni mecánica de Clínica Ferrer.
- **Paso a paso (M5):** escena fijada de 640svh con 4 paradas (`HOLD 1.7` / `TRAVEL 1`). La mira se detiene en cada paso y abre un recuadro con foto, texto detallado y 3 puntos; la lista inferior se ha eliminado. Con un scroll normal cada recuadro dura unos 6 pasos de rueda. En desktop la ruta ocupa el 60 % izquierdo y el recuadro va a la derecha (no tapa pasos); en móvil, mapa arriba y recuadro abajo.
- **Fotos:** 11 de Unsplash (licencia Unsplash, autorías en `hercas/CREDITS.md`, script `scripts/hercas-photos.mjs`): blanco y negro editorial con un punto cálido, y color sobrio a saturación 0,82. Fuera el duotono rojo y la melena rosa.
- **Reseñas:** avatar público de Google de cada autor/a (los mismos que muestra hoy su widget), con la inicial como respaldo si una foto no carga. Cada tarjeta lleva una «funda» con los 4 colores de Google en `conic-gradient` que gira despacio (`@property --gangle`, parada con movimiento reducido), la «G» de Google y estrellas en el amarillo de Google.
- **Lección de pruebas:** una pestaña de Playwright en segundo plano baja a 1 fps y falsea las animaciones con muelle. Hay que medir siempre en una pestaña nueva al frente (`newPage` + `bringToFront`).

### Iteración 4 · 2026-11-04 · el hero 3D se sustituye por un «corte de pelo» con dos fotos

- **Fuera:** `hercas/js/hero3d.js`, `hercas/models/` (head.glb y texturas), el import map de Three.js, el CSS del escenario 3D, sus textos y el crédito del modelo. Three.js no estaba en `package.json` (solo venía del CDN) y nada más lo usaba. También se borran `hero-*.webp`, que ya no se mostraban; la imagen OG del script de fotos pasa a salir de `salon-1200`.
- **Fotos del cliente:** las dos medían 1135 × 1408, pero en «después» la cara estaba 1 px a la derecha y 20 px más abajo (ojos 20, boca 22 y camiseta 18 coinciden). Se recortaron al mismo encuadre de 1135 × 1388; el error en la cara baja de 39,5 a 9,6 (sobre 255). Los PNG de respaldo son `img/corte-antes.png` y `img/corte-despues.png`; los WebP salen a 720 y 1135 px.
- **Máscara de la zona del pelo:** `img/corte-mascara.png` (142 × 174, el 11,8 % de la foto) se calculó con los píxeles oscuros por encima de las cejas y a los lados de la cara, más la zona donde las dos fotos difieren. Quedan fuera la cara, la barba y la camiseta.
- **Efecto** (`hercas/js/cut.js`, sin dependencias):
  - La foto «después» va en un `<img>` y la «antes» en un `<canvas>` encima.
  - Lo cortado se guarda en una máscara con el tamaño de la foto y se compone con `destination-out`, así que al cambiar el tamaño o la densidad de pantalla no se pierde.
  - El pincel tiene el borde suave (gradiente radial) y mide 70 px en escritorio y 90 px en táctil. Funciona con Pointer Events y `getCoalescedEvents`, e interpola puntos a ¼ del radio.
  - El porcentaje se mide cada 300 ms: el canvas se reduce a 142 × 174 y se lee su alfa solo en los píxeles de la máscara. Al pasar del 85 % se descubre del todo y aparece «Reserva tu cita».
  - No vuelve a crecer. Se restaura con «Restaurar pelo» o cuando la sección sale entera de la pantalla (IntersectionObserver).
  - Lleva cursor de tijeras en SVG propio y `touch-action: none` solo en el canvas. Con movimiento reducido no hay transiciones y aparece el botón «Ver el corte».
- **Verificación Playwright (1440 px y 390 px táctil):**
  - Capturas en los tres momentos (entrada, mitad y final).
  - Restaurar funciona y salir y volver a la sección también restaura.
  - Al cortar en móvil la página no se mueve (0 px) y fuera de la foto el scroll va normal (400 px).
  - 0 errores y 0 avisos en consola.
- **Lección:** la ventana de Playwright está a la vista del usuario, y un ratón real que pase por encima corta la foto y estropea las mediciones. Se cuentan los `pointermove` ajenos a la prueba para descartar pasadas contaminadas.
- **Ajuste final (sin fondo y más grande):**
  - **Recorte del fondo:** `scripts/hercas-sinfondo.mjs`, en local, sin subir las fotos a ningún servicio. Se ajusta el gris de estudio como superficie cuadrática y se rellena desde los bordes (los blancos de ojos y dientes se quedan). En la banda de 5 px junto al fondo, el alfa se calcula por luminancia entre el pelo y el gris, con descontaminación del color y el contorno recogido 1 px. Los huecos encerrados entre rizos se vacían solo fuera de la cara. Ojos y dientes quedan opacos.
  - **Canvas:** como las fotos ya no tienen fondo, el «después» no puede ir visible debajo (asomaría por fuera del pelo largo). Se pinta «antes·(1−m)» y se suma «después·m» con `lighter`, un fundido exacto que evita el halo oscuro en el borde suave del pincel. El porcentaje se lee ahora del alfa de la máscara de corte.
  - **Integración:** fuera la tarjeta y la sombra; queda una luz de estudio radial detrás de la cabeza y un fundido inferior con `mask-image`. Pasa de 460 a 580 px en escritorio y hasta 520 en móvil. «Reserva tu cita» no ocupa sitio hasta que aparece.

### Iteración 5 · 2026-11-04 · reservas reales conectadas a n8n (`#reservar`)

- **Sustituido:** la sección `#cita` (formulario estático que solo abría `mailto:`) y su JS de `main.js`. Nuevo `hercas/js/booking.js` (JS nativo + fetch, `API_BASE` en la primera constante).
- **Flujo de 6 pasos:** servicio → peluquero («Me da igual» por defecto) → día (`diasMax` días, cerrados según `horario`, fila deslizable con flechas en escritorio y con el dedo en móvil) → hora (esqueleto, agrupada en mañana y tarde, mensaje si no hay huecos) → datos (validación antes de enviar) → resumen con «Cambiar» por fila y «Confirmar cita» bloqueado mientras envía. Al final, «¡Cita confirmada!».
- **Errores:** el 409 vuelve al paso 4 con aviso y recarga los huecos; el 400 muestra el mensaje del servidor; un fallo de red o de servidor muestra «Reintentar» y el teléfono. Hay indicador de paso, se puede volver atrás conservando lo elegido, `aria-live`, foco al título de cada paso y todo está en ES/EN.
- **Lecciones:**
  - La respuesta OK de n8n trae nombres y la fecha ya en texto (`"fecha":"jueves 5 de noviembre"`), no ids ni ISO. El formateador de fechas lanzaba `RangeError` y dejaba el botón en «Confirmando…»; ahora se aceptan nombres o ids y la fecha sale del día elegido.
  - Validar al salir del campo hacía desaparecer el aviso y movía la casilla de privacidad justo al pulsarla, así que ahora se valida mientras se escribe.
- **Pruebas:** UNA reserva real (corte de caballero · Juan Carlos · jueves 5/11/2026 12:00 · suligonserv@gmail.com · respuesta 200). La prueba de 409 se envió al servidor real, que la rechazó sin crear reserva. Las capturas de la pantalla final usan la misma respuesta real repetida en el navegador, sin llamar a n8n.
- **Pendiente:** el horario de la API dice martes de 10:00 a 19:00 y la web, de 9:30 a 13:30. La política de privacidad sigue sin existir.
