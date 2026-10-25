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
