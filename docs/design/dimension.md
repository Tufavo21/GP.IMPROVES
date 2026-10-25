# Dimension — Style Reference
> dusk-lit workspace with frosted glass panels. **Theme:** dark.
> Fuente: referencia proporcionada por el cliente (copiada sin el bloque Tailwind v4 duplicado).

Dimension: lienzos negros mate (#0a0a0a), paneles de cristal esmerilado, controles en píldora, titulares de peso 500. Casi acromático (blancos y grises cálidos) + un degradado hero ámbar → cobalto + un único destello violeta (#6b62f2 a 0.565 alpha) solo en degradado lineal. Radios: 9999px botones, 10px UI, 24px tarjetas, 40/42px paneles. Bordes hairline de 1px en vez de sombras.

## Colores
| Nombre | Valor | Token | Rol |
|---|---|---|---|
| Void Canvas | #0a0a0a | --color-void-canvas | Fondo de página |
| Graphite | #161616 | --color-graphite | Superficie elevada: nav, paneles |
| Frosted Glass | #d4d4d4 | --color-frosted-glass | Relleno translúcido al 10% sobre oscuro |
| Ink Black | #000000 | --color-ink-black | Trazos de iconos sobre claro |
| Snow White | #ffffff | --color-snow-white | CTA principal, titulares sobre oscuro |
| Bone | #ededed | --color-bone | Texto principal sobre oscuro |
| Ash | #c2c2c2 | --color-ash | Texto secundario |
| Slate | #686868 | --color-slate | Texto atenuado / metadatos |
| Smoke | #b2b2b2 | --color-smoke | Texto de botón inactivo |
| Hairline | #e5e5e5 | --color-hairline | Bordes de 1px sobre oscuro |
| Dusk Violet | linear-gradient(90deg, transparent 40%, rgba(107,98,242,.565) 50%, transparent 60%) | --color-dusk-violet | Único acento cromático |

## Tipografía
- **DM Sans** (peso 500): display 72px (-0.035em / -2.52px, lh 1) y UI/cuerpo 13–18px (+0.025em en 13–16px).
- **Geist** (400/500/600): encabezados de sección 32px/600, 36px/500, 48px/500; subtítulos 18–24px. No usar Geist para cuerpo por debajo de 24px.
- Escala: caption 13/1.5 (0.33px) · body 16/1.5 · subheading 18/1.5 · heading-sm 24/1.33 · heading 36/1.11 · heading-lg 48/1 · display 72/1.

## Espaciado y formas
Escala 4,6,8,10,12,14,16,20,22,24,28,32,40,44,48,56. Radios: ui 10 · cards 24 · icons 4 · panels 42 · buttons 9999 · largeCards 40. Layout: max 1200px, gap de sección 64–80px, padding de tarjeta 28px, gap de elemento 8–16px. Única sombra permitida: `rgba(255,255,255,.1) 0 0 0 1px inset`.

## Componentes
- **White Pill CTA**: fondo blanco, texto #161616, píldora, 8×12px, DM Sans 14–16px. Único botón relleno.
- **Ghost Nav Button**: transparente, texto #fff 85%, borde 1px #e5e5e5, píldora, 6×14px.
- **Floating Frosted Nav**: #161616 translúcido, blur 4px, borde 1px #e5e5e5, flota a 16–24px del borde. Logo + 2–3 enlaces + CTA blanco.
- **Hairline Ghost Button**: transparente, borde 1px #e5e5e5, radio 10px, 8px.
- **Frosted Glass Feature Card**: rgba(212,212,212,.1), radio 24px, blur 4px, sin sombra.
- **Gradient Hero Panel**: degradado ámbar/coral → cobalto; titular 72px blanco, lista con iconos, CTA blanco; mockup a la derecha.
- **Numbered Accordion Row**: nombre #ededed a la izquierda, número 01–07 #c2c2c2 a la derecha, 20px entre filas, sin bordes.
- **Bulleted Feature Row**: icono 4px radio + texto 16px #ededed, gap 12px, filas separadas 16px.
- **Device Mockup Frame**: radio 40px 40px 0 0, fondo blanco, sin padding.
- **Status Banner Pill**: píldora arriba, icono sparkle + texto 14px/500 + flecha, 6×14px.
- **Section Header**: Geist 32/600 o 36/500, #ededed, seguido de párrafo Geist 18px/500.
- **Icon Glyph**: monocromo, 16–20px, trazo ~1.5px, contenedor 4px.

## Do
- 9999px en botones, enlaces de nav y tags.
- Display DM Sans 72px/500/-2.52px; nunca más de 500.
- Cuerpo #ededed sobre oscuro; #161616 sobre blanco; evitar #fff puro en cuerpo.
- Bordes 1px #e5e5e5; nunca 2px+ ni box-shadow para definir.
- Degradado ámbar → cobalto solo en hero/spotlight.
- Gaps 8–16px en componentes, 64–80px entre bloques.
- Dusk Violet solo como degradado/glow.

## Don't
- No box-shadow para elevación.
- No añadir colores de marca.
- No radios <4px ni >42px en tarjetas.
- No titulares de peso ≥700.
- No Geist en cuerpo <24px.
- No nav pegada al borde (16–24px de margen).
- No #6b62f2 sólido en botones, texto o fondos.

## Superficies
0 Void Canvas #0a0a0a · 1 Graphite #161616 · 2 Frosted Glass #d4d4d4 al 10% + blur · 3 Snow White #fff (CTA, tarjetas blancas en secciones oscuras).

## Imagen
Poca fotografía. Degradado hero + mockups. Iconos monocromos geométricos. Un único glow radial violeta como spotlight.

## Layout
Columna ~1200px; nav píldora flotante; hero a sangre con split texto/visual; lista numerada 01–07; secciones alternando lienzo y paneles de cristal; composiciones de 1–2 columnas, alineado a la izquierda salvo el banner.

## Sistema de degradados
1. **Hero Horizon**: ámbar/coral (izq) → cobalto (der); único degradado a sección completa.
2. **Dusk Violet Wash**: 90deg, violeta .565 en banda central 40–60%; franja de acento, nunca fondo.
3. **Radial Spotlight**: radial de #6b62f2 a #fff; uso escaso.

Reglas: degradados solo en hero, franjas de acento y spotlights. Nunca en tarjetas, botones o texto. Nunca combinar varios en un mismo elemento.

## Similares
Linear, Vercel, Raycast, Arc Browser.
