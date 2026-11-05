# Registro de skills y decisiones

| Proyecto | Fingerprint (estilo) | Skills | Tipografía | Paradigma de hero | Tono de color | Layout | Detalle de firma | Conflictos resueltos |
|---|---|---|---|---|---|---|---|---|
| Marjal · clínica estética València (beta, datos DEMO) | **Dimension** (dado por el cliente; Fases -1 y 1 omitidas) | review-animations e impeccable (criterios aplicados como checklist manual; la skill `review-animations` no figura entre las instaladas en esta sesión). `redesign-existing-projects` no aplica. | DM Sans 500 (display `clamp(44px, 6vw, 72px)`, -0.035em) + Geist 500 en encabezados | Panel "Hero Horizon" ámbar→coral→cobalto, texto a la izquierda, marco de imagen 40px/40px/0/0 a la derecha con parallax de capas | Casi acromático; violeta `#6b62f2` solo en la franja Dusk Violet (degradado) | Columna de 1200px, secciones 64-80px, alterna lienzo y cristal | Nav flotante en píldora + banner píldora + sección Proceso sticky con degradado que se desplaza y texto enmascarado | Ver abajo |
| 2con2estudio · reformas y interiorismo, Valencia (beta, fotos provisionales) | **1. Showroom brutalista** (menú de 5; referencia «brutalist editorial showroom on warm gray» aportada por el cliente, sin menta ni amarillo) | impeccable; `review-animations` no instalada (criterios aplicados como checklist manual); `redesign-existing-projects` no aplica | Anton (display 130px, 0.9, -0.03em) + Inter Variable 450/500 + JetBrains Mono 12px solo para medidas y etiquetas | Titular partido en 4 líneas a la izquierda + tarjeta de foto con arco superior de 64px a la derecha (nunca a pantalla completa) | Gris cálido `#e5e5e5` + blanco + negro; sin acentos (el color lo ponen las fotos) | Columna de 1200px, tarjetas blancas de 32px y bloques negros a sangre, sin sombras | Arco superior de 64px como «vano» del logo abierto por abajo + animación «Vano de obra» (clip-path por scroll) | Ver abajo |

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

## Conflictos resueltos (2con2estudio · Showroom brutalista)
- **Registro**: Dimension, DM Sans + Geist, hero degradado ámbar→cobalto, fondo `#0a0a0a`, nav de cristal y proceso sticky enmascarado estaban prohibidos por defecto; ninguna de las 5 direcciones los usó.
- **Estilo**: el prompt decía «sin estilo decidido» pero el cliente pegó la referencia Dayos; se incluyó como dirección 1 del menú y la eligió el cliente. Se quitaron la menta `#d1ffca` y el amarillo `#fff100` (identidad blanco y negro).
- **Anton vs Suisse**: Suisse es comercial; se usa Anton (libre, condensada y de peso alto como el logo).
- **Display 130px**: el suelo de craft limita el display a 6rem; gana el brief (130px, 0.9, -0.03em).
- **Radios**: la referencia pide 24-64px; el suelo recomienda 12-16px; gana el brief.
- **Sin eyebrows ni números decorativos**: solo se numera el proceso porque la secuencia importa.
- **Nav blanca sobre secciones blancas**: se añade un aro de 1px (`--ash`) a la píldora y al selector de idioma; la referencia no usa bordes, pero sin él la píldora desaparecía.
- **Campos de 10 caracteres**: se aplica a textos libres (mensaje y descripciones «Otro»). Nombre, email y teléfono se validan por formato; exigir 10 caracteres a un nombre sería inviable.
- **Color de error**: `#a4161a` sobre blanco, único color fuera de la paleta, funcional.
- **Fotos**: no hay antes/después porque ninguna foto tiene su pareja del mismo proyecto; la animación de firma revela un solo proyecto.
- **Escritura de `src/`**: el proyecto Marjal se archivó en `legacy/marjal/`.

## Revisión v2 (2con2estudio · modelo Niva)
El cliente pidió cambiar el modelo de página a niva-studio.com. Se sustituye la dirección 1 por una galería blanca: logo centrado fijo con menú de hamburguesa a la izquierda e Instagram + ES/EN a la derecha, titular en serif versal, carrusel horizontal de proyectos con encaje (scroll-snap), bloques centrados con texto mono, columnas de servicios con línea inferior, formulario plano con bordes de 1px y pie oscuro.
- **Tipografía**: Instrument Serif (titulares y frases) + IBM Plex Mono (texto). Anton, Inter y JetBrains Mono salen del proyecto.
- **Color**: blanco `#fff`, tinta `#262626`, gris suave `#f4f4f2` en la zona de presupuesto; sin acentos. Error `#a4161a`.
- **Layout**: columnas centradas de 760px (estrecha) o 1180px; radios de 3px; sin sombras (el logo con placa usa un halo del color de la sección).
- **Animación de firma**: se mantiene «Vano de obra» (clip-path por scroll) sobre el fondo blanco.
- **Logo**: sigue cambiando blanco/negro y con placa; la versión blanca solo aparece si hay un fondo oscuro bajo el logo (el pie queda por debajo del logo fijo).
- **Proyectos**: pasan de cuadrícula a carrusel; la sección «Proyectos» es el carrusel.
- **Referencia**: se copia la estructura, no los textos, imágenes ni marca de niva-studio.com.

## Revisión v3 (2con2estudio · monografía suiza)
El cliente pidió adaptar la web a la referencia Yllw y añadir «todo tipo de movimiento». Se rehace el sistema visual conservando contenido, formulario, bilingüe, SEO y datos.
- **Tipografía**: Archivo Variable (ejes de peso y anchura, 68-72 % en titulares) como única familia, en mayúsculas a 0.88 de interlineado. Sustituye a la grotesca comercial de la referencia.
- **Color**: papel masilla `#cac7b4`, tinta `#000`, blanco, carbón `#191919` y amarillo `#ffdd00` solo en la barra superior y los puntos de la cinta. Se aparta de la regla «solo blanco y negro» del logo porque la referencia lo pide; se quita quitando la barra.
- **Barra amarilla**: sin ofertas ni urgencias, solo el servicio y la ciudad. El selector ES/EN va en la cabecera fija (no en la barra) para que esté siempre visible.
- **Movimiento** (todo con alternativa estática en prefers-reduced-motion): titular con máscara palabra a palabra y fotos que se abren entre las palabras; barra de progreso; cinta infinita que acelera y cambia de sentido con el scroll; filas de servicios que se rellenan de negro al pasar el cursor; botones con texto que rueda y efecto imán; «Vano de obra» (clip-path por scroll, firma); proyectos en pasillo horizontal fijado con paralaje; proceso en tarjetas apiladas que se encogen; menú a pantalla completa con revelado; nombre del estudio gigante en el pie con letras que suben.
- **Logo**: ahora se muestrea en cinco puntos; si el fondo cambia dentro del logo o hay una foto, usa placa. Con el fondo carbón aparece la versión blanca.
- **Enlaces de navegación**: usan mix-blend-mode difference para leerse sobre cualquier fondo; el logo nunca se mezcla ni se recolorea.
- **Radios**: 2px en botones y 6px en tarjetas, como la referencia; trazos de 1px en lugar de sombras.

### Ajustes v3 (cliente)
- Se quitan las dos fotos del titular; el titular queda en dos líneas.
- La cinta de texto bajo el titular va más lenta (0,9 %/s en lugar de 2,4 %/s) y reacciona menos al scroll.
- Instagram oficial (@2con2estudio): botón en la cabecera fija, enlace en el menú y fila en Contacto, todos hacia https://www.instagram.com/2con2estudio/.
- **Tipografía de titulares**: Archivo a anchura 68-78 % dibujaba mal los acentos de Ñ y Ó, así que los titulares pasan a Barlow Condensed (condensada, como el logo); Archivo queda para texto y formulario.
- **Error corregido**: la clase `.row` del titular chocaba con la de las filas desplegables (overflow hidden), y recortaba los acentos; el titular usa ahora `.hl`.

### Casa interactiva y reseñas (cliente)
- **Todo tipo de reformas**: el listado de texto se sustituye por una casa en corte dibujada en SVG (trazos que se dibujan al entrar, humo de la chimenea, tejado que se levanta). Cocina y baño abren su texto; «Reforma integral» se elige pulsando el tejado y enciende toda la casa; salón-comedor y dormitorio abren «Otras reformas». Los textos son los mismos de antes. Para teclado y lector de pantalla hay pestañas (tablist) con los cuatro tipos.
- **Reseñas de Google**: sección preparada (`src/data/reviews.js`) pero SIN reseñas inventadas. Se pidió escribir reseñas de 5 estrellas con nombres cambiables «para que sean verdaderas»; no se hace porque presentar reseñas falsas como reales engaña a los clientes y está prohibido (Directiva (UE) 2019/2161, normativa de consumo). Mientras no haya reseñas reales la sección solo aparece en beta como huecos marcados [FALTA]; con `SHOW_PLACEHOLDERS = false` desaparece. Cuando se añadan reseñas reales (texto literal, nombre y valoración que puso el cliente) se muestran con sus estrellas; la media y el recuento solo salen si se rellenan con los datos reales de la ficha. No se añade `aggregateRating` al JSON-LD.

### Nueva animación de firma: «Nivel láser» (cliente, libertad creativa)
Sustituye a «Vano de obra». Con el scroll, un láser de nivel amarillo (la herramienta real de una obra) sube por un plano (rejilla, muros, cotas «largo» y «alto» y marcas de registro) y, a su paso, el plano se convierte en la estancia construida: la foto se revela de abajo arriba mientras se encoge de 1,16 a 1. Una etiqueta «Avance de obra 0-100 %» acompaña al láser y el título «Abrimos el espacio» pasa de contorno a relleno de izquierda a derecha al mismo ritmo.
- No es un antes/después de un mismo proyecto: el plano es un dibujo genérico de cotas, sin medidas ni datos del proyecto, y por eso las cotas solo llevan palabras.
- La rejilla del plano es una superficie de plano real, no un fondo decorativo (el detector la señala como aviso, aceptado).
- Con prefers-reduced-motion: título completo y foto estática, sin plano ni láser.

---

## v4 · 2con2estudio — web de test · «Atelier Mono» (2026-11-05)

**Cliente**: 2con2estudio — web de test/práctica. **Estilo**: Design A «Atelier Mono» (elegido por el cliente; Fases -1 y 1 omitidas). **Arquitectura**: B) React + Vite + Motion (portfolio visual de ticket alto; las piezas del kit viven mejor como componentes JSX). **Nivel de movimiento**: 2.

**Skills**: `impeccable` (contexto + craft floor + detector: 0 hallazgos). `review-animations` no está instalada en esta máquina → se usó `improve-animations` (auditoría rápida, 3 hallazgos corregidos). `redesign-existing-projects` no se usó (indicado por el cliente), aunque sí existía una web previa (v3), archivada en `legacy/2con2-v3/`.

**Kit (Regla 7)**: `clinica-ferrer/src/` no existe en esta máquina; se reimplementaron desde la descripción: `src/lib/ticker.js` (rAF único, fases read/write, tiers, vigilante si el rAF se congela, `window.__cfTicker.step/stats`), `src/lib/spring.js` (tension/friction, masa 1, pasos de 1 ms), `src/lib/hooks.js` (`useTick`, vigilante de viewport en el ticker, Lenis), `src/components/Reveal.jsx`.

### Recap Fase 5
| Regla | Cómo se cumple |
|---|---|
| 1 Firma | «Del diseño a la obra» con el lema real: «DISEÑO DE INTERIORES» entra letra a letra con desenfoque (M15); con el hero fijado, «EJECUCIÓN DE OBRA» pasa de contorno a relleno letra a letra mientras la foto (roble/grafito) pasa de B/N a color y se abre a sangre con parallax. Reduced-motion/sin JS: fotograma final. |
| 2 Extensión | 1440px: 19 334 px de scroll (~190 pasos de rueda); 390px: 18 282 px. |
| 3 Formulario | Nombre, email, teléfono, tipo, **acabados** (añadido: el baremo es por tipo y acabados), m², descripción ≥10, fotos opcionales (8 × 10 MB, vista previa), privacidad. Todo obligatorio salvo fotos. |
| 4 ES/EN | Selector en la nav (aria-pressed), `<html lang>`, title, meta y JSON-LD se sincronizan. |
| 5 Logo | Muestreo de 3 puntos bajo el logo con `data-logo`: negro sobre papel, blanco sobre tinta (pie y menú), placa papel sobre fotos heterogéneas (hero abierto, proyectos, proceso). Sin caja propia. |
| 6 Verificación | Playwright MCP (ver abajo). |
| 7 Movimiento | Nivel 2: BASE + M15, M17, M10, M22. |

**Piezas del MENÚ usadas**: M10 (del plano a la obra: dibujo derivado de la foto + pincel que pinta la foto real; cursor fantasma en táctil; botón accesible), M15 (hero), M17 (proceso fijado en 5 tramos con imagen que evoluciona y rail de guiones), M22 (cifras [DEMO] del estudio). **Descartadas**: M1-M9, M11-M14, M16, M18-M22 salvo las anteriores (no las pide el design.md; M1/WebGL y 7.6 no aplican sin petición 3D). Anti-repetición: combinación distinta de la v3 (máscara + cinta + pasillo horizontal + láser).

### Conflictos resueltos
- **Web previa**: el encargo decía «no hay web previa», pero existía la v3; se archivó en `legacy/2con2-v3/` (src, api, shared, tests, scripts) y se rehízo desde cero.
- **Rutas**: el encargo cita `public/img-cliente/`; los originales estaban en `assets-cliente/`. Se mantienen ahí (no publicados) y `npm run assets` genera `public/img-cliente/`.
- **Firma B/N → color**: la cocina de mármol es casi acromática y el cambio no se percibía; el hero usa la cocina roble/grafito con pie «referencia de acabados» (posible foto de exposición) y por eso no se repite como proyecto.
- **Antes/después (M10)**: no hay parejas reales; la capa «antes» es un dibujo generado de la propia foto y se rotula como ilustración.
- **--mute #8C8A85** da 3.3:1 sobre papel: solo en texto grande/decorativo; etiquetas pequeñas en --ink-2.
- **Errores del formulario**: sin color de acento (prohibido): línea de 2 px + icono cuadrado + texto en tinta.
- **Craft floor vs brief**: display hasta 200px y numeración «01 / 07» en el margen se mantienen porque los fija el design.md; no hay eyebrows sobre los titulares.
- **Testimonios ficticios**: permitidos para práctica; cada uno lleva la etiqueta visible «Testimonio ficticio · demo», desaparecen con `DEMO_ENABLED = false` y nunca van al JSON-LD.
- **Email**: ahora es público y destino (antes vivía en una variable de servidor).

### Hallazgos de la revisión (Before → After)
| Antes | Después |
|---|---|
| Titulares con reveal sin espacios entre palabras («QUIENDISEÑA») | Espacio fuera de la máscara de cada palabra |
| La foto del hero tapaba «EJECUCIÓN DE OBRA» antes de rellenarse | Relleno 0.02→0.44, color 0.06→0.46, apertura 0.48→1 |
| Franja del hero mostraba solo el suelo | Foto centrada en la franja visible y desplazada al abrirse |
| Lema del pie partido en «· EJECUCIÓN» y tilde pisando la línea | Dos líneas sin punto, interlineado 1 |
| Etiqueta «Superficie aproximada (m²)» en 2 líneas sobre el valor | Etiqueta en una línea |
| Pincel de M10 demasiado tenue | Pincel más opaco y desvanecimiento 0.016/fotograma |
| Logo cambiaba con un fotograma de retraso (estado React) | Modo escrito en el DOM dentro del ticker |
| Enlace del menú móvil no hacía scroll (Lenis parado) | `lenis.start()` + `scrollTo(..., { force: true })` |
| Reduced-motion anulaba todas las transiciones | Solo se quita el movimiento; color y opacidad se mantienen |
| Flood de botones 550 ms, etiquetas 350 ms, FAQ 450 ms | 280 / 200 / 250 ms |
| Motion completo (436 KB JS) | LazyMotion + domAnimation (388 KB, 125 KB gzip) |
| `fetchpriority` en minúscula (error de React) | `fetchPriority` |

### Verificación Playwright MCP
- Capturas 1440 y 390 por sección y en 0/25/50/75/100 % de página, hero y proceso (`shots/v4/`).
- Ticker: 0.05–0.2 ms por fotograma (máx. 1.3 ms); canvas M10 se detiene fuera de viewport y tras 140 fotogramas sin interacción. No hay WebGL.
- Formulario solo con datos inválidos: vacío → 8 errores y foco en el primero; valores erróneos → 6 mensajes concretos + archivo .txt rechazado; sin envío ni navegación.
- Consola: 0 errores/avisos. Respuestas ≥400: 0. Anclas internas: todas existen. favicon.svg/.ico/16/32, apple-touch, manifest, og-image, sitemap.xml y robots.txt: 200.
- `<head>`: title, description, canonical, OG/Twitter, JSON-LD solo con datos reales (sin eslogan EN, sin dirección inventada).
- ES/EN: nav, titular, CTA, lema, title y `lang` cambian; vuelta a ES correcta.
- Menú móvil: abre (logo blanco), cierra con Escape y navega a Proceso.
- Reduced-motion: hero estático a color, proceso en lista, sin Lenis ni canvas.

### Pendientes [FALTA]
Dominio definitivo · servicio de envío · dirección postal · versión vectorial del logo y si el marco es cerrado · traducción EN del lema aprobada · baremo de precios · fotos de Bea y Gonzalo · originales en alta · responsable del tratamiento y NIF (privacidad).

### Contenido [DEMO] (src/content/demo-content.js)
Roles del equipo · cifras (12 años, 140 viviendas, 9800 m²) · nombre, m², año y tipo de 4 proyectos · desglose de 6 servicios · proceso en 5 pasos · 3 testimonios ficticios · 5 preguntas frecuentes · lema EN provisional.

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
