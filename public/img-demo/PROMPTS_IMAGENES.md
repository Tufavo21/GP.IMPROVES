# Imágenes pendientes de generar (IA) [FALTA]

En esta sesión no había generador de imágenes, así que no se ha inventado ninguna. Las secciones funcionan ya con fotos reales de Unsplash (ver `CREDITS.md`). Hay dos cosas que solo un generador con edición resuelve del todo:

1. **Escena de la casa**: que las 4 estancias sean **literalmente la misma vivienda**. Ahora la cocina y el dormitorio son de la misma fotógrafa y las cuatro comparten roble, luz natural y neutros cálidos, pero son tres viviendas distintas.
2. **Piso Eixample, antes / durante / después**: tres fases del MISMO piso y el mismo encuadre. «Durante» es la foto actual en obra (`assets-demo/proj-obra.jpg`, Francesco Ungaro); «antes» y «después» hay que generarlas editándola. Mientras no existan, el proyecto muestra un piso reformado de Unsplash (`proj-piso`).
3. **Plano a obra del baño**: un par **obra / terminada** que coincida píxel a píxel. Ahora la capa «antes» es un dibujo de líneas calculado de la propia foto, que sí coincide píxel a píxel.

## Cómo sustituirlas

1. Guarda cada imagen con el **nombre exacto** de abajo en `assets-demo/`. Son los originales y no se publican. Mínimo 3200 px en el lado largo y en JPG.
2. Si cambias las fotos de la casa, regenera los mapas de profundidad:
   `npm i --no-save @huggingface/transformers@3.7.5` y después
   `node scripts/make-depth.mjs assets-demo/depth assets-demo/casa-salon.jpg assets-demo/casa-cocina.jpg assets-demo/casa-dormitorio.jpg assets-demo/casa-bano.jpg`
3. Ejecuta `npm run assets:demo`. Genera en `public/img-demo/` las versiones AVIF/WebP/JPG a 640/1280/1920/2400 y actualiza `src/content/demo-images.js`.
4. Actualiza `CREDITS.md` con «Generada con IA · herramienta y fecha» y mantén el rótulo «Proyecto de demostración».

## Estilo común (pégalo al principio de cada prompt)

> Fotografía de arquitectura interior profesional, vivienda reformada en un edificio de los años 60 en Valencia, estilo contemporáneo mediterráneo sobrio. Materiales: suelo de roble natural en espiga de lama ancha, mármol Nero Marquina negro con veta blanca, gres porcelánico continuo gris piedra, microcemento cálido, paredes a la cal blanco roto (#F6F5F2), carpintería de roble claro sin tirador, grifería negra mate. Luz natural de media mañana entrando por la izquierda, sombras suaves, sin focos de colores. Cámara a 1,40 m de altura, objetivo 24 mm tilt-shift con verticales rectas, sin distorsión. Sin personas, sin texto, sin logotipos, sin marcas, sin desorden. Color neutro, contraste natural, sin HDR ni filtros. Resolución 4K o más.

## 1. Escena de la casa: misma vivienda, misma sesión (relación 3:2, horizontal, 6000 × 4000)

| Nombre exacto | Prompt (después del estilo común) |
|---|---|
| `assets-demo/casa-salon.jpg` | Salón abierto al comedor. Sofá bajo de lino arena, butaca bouclé blanca, mesa de centro de mármol negro, estantería de roble empotrada, gran ventanal a la izquierda con estor de lino. Encuadre en diagonal con profundidad: primer plano el sofá, plano medio la mesa, fondo el comedor con la cocina asomando. 3:2. |
| `assets-demo/casa-cocina.jpg` | Cocina de la MISMA vivienda. Frentes de roble sin tirador, isla con encimera y frente de Nero Marquina a inglete, columna de hornos en roble, salpicadero de mármol negro, dos colgantes de vidrio opal. Encuadre a tres cuartos desde la esquina de la isla, con el pasillo al salón al fondo. 3:2. |
| `assets-demo/casa-dormitorio.jpg` | Dormitorio principal de la MISMA vivienda. Cama baja con cabecero de roble, ropa de cama de lino blanco roto y arena, mesillas suspendidas de roble, pared del cabecero en microcemento cálido, ventana con cortina de lino a la izquierda. Encuadre frontal ligeramente lateral, con profundidad hacia la ventana. 3:2. |
| `assets-demo/casa-bano.jpg` | Baño de la MISMA vivienda. Gres porcelánico continuo en suelo y paredes, plato de ducha de obra enrasado con mampara fija sin perfiles, mueble suspendido de roble con encimera de Nero Marquina, lavabo de piedra, grifería negra empotrada, hornacina iluminada. Encuadre a tres cuartos con la ducha al fondo. 3:2. |

## 2. Piso Eixample: antes y después del MISMO encuadre (relación 3:2, horizontal, 3200 × 2133)

Parte SIEMPRE de `assets-demo/proj-obra.jpg` y edítala con un modelo de edición de imagen (imagen a imagen o inpainting): misma cámara, misma perspectiva, mismas balconeras y ventanas, mismo techo y mismos huecos de puertas. Cuando estén las dos, `npm run assets:demo` activa sola la animación (pestañas Antes · Durante · Después con barrido) en el proyecto 02.

| Nombre exacto | Prompt (edición de `proj-obra.jpg`) |
|---|---|
| `assets-demo/proj-obra-antes.jpg` | EDITA la foto sin mover la cámara: el mismo piso ANTES de la reforma, habitado y antiguo. Suelo de baldosa hidráulica gastada, papel pintado de flores años 70 algo despegado, rodapié de madera oscura, radiador de hierro bajo la ventana, lámpara de techo de cristal anticuada, muebles viejos (aparador oscuro, sillas de enea), cortinas de visillo amarillentas. Mismas balconeras de madera original y misma luz de ventana. Sin personas. Fotografía realista, color neutro. |
| `assets-demo/proj-obra-despues.jpg` | EDITA la foto sin mover la cámara: el mismo piso DESPUÉS de una reforma integral de 2con2estudio. Suelo de roble natural en espiga, paredes lisas blanco roto a la cal, techo liso con foseado e iluminación indirecta, las balconeras originales restauradas y lacadas, rodapié enrasado, salón con sofá de lino arena, mesa baja de mármol Nero Marquina, alfombra de yute y una lámpara de pie negra. Mismos huecos y misma luz natural. Fotografía de arquitectura interior, sin personas, sin texto, color neutro. |

## 3. Plano a obra del baño: par del mismo encuadre (relación 2:3, vertical, 3200 × 4800)

Genera primero la terminada. Después pide la versión en obra **editando esa misma imagen**: misma cámara, misma perspectiva y mismas aberturas, para que coincidan píxel a píxel.

| Nombre exacto | Prompt |
|---|---|
| `assets-demo/bano-plano.jpg` (terminada, sustituye a la actual) | Estilo común. Baño en vertical 2:3: encimera continua de piedra caliza clara con lavabo integrado, mueble de roble debajo, espejo en arco con marco de roble, grifería negra mate empotrada, ducha de obra con mampara al fondo a la derecha, inodoro suspendido. Encuadre frontal a la altura del lavabo. |
| `assets-demo/bano-plano-obra.jpg` (en obra, mismo encuadre) | EDITA la imagen anterior sin mover la cámara ni la perspectiva: el mismo baño en obra, sin acabados ni sanitarios. Ladrillo y mortero a la vista, rozas con tubos de fontanería y cajas eléctricas, suelo de recrecido de mortero, hueco del espejo marcado a lápiz en la pared, plato de ducha sin revestir. Polvo ligero, luz de obra neutra, mismas ventanas y mismos huecos. |

Si existe `bano-plano-obra.jpg`, `npm run assets:demo` la usa como capa base del revelado (M10) en lugar del dibujo derivado. La mecánica no cambia.
