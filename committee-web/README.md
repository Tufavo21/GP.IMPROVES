# Web de Committee Club Valencia (maqueta de propuesta)

Web completa de la discoteca en rojo y negro: entradas, mesas VIP con plano y botellas, lista de cumpleaños e información práctica. Es una maqueta de GP.IMPROVES, no la web oficial; lleva `noindex` y un aviso en el pie.

## Cómo verla

```bash
cd committee-web
npm install
npm run dev      # http://localhost:5190
npm run build
```

## Qué es real y qué falta

- **Real (fuentes públicas, noviembre de 2026)**: dirección, noches, horarios, edades, entrada 22 / 27 / 32 € con consumición, zonas, precios de mesa, reglas 5+2 con +20 %, señal del 50 % y carta de botellas. Están en `src/content/data.js`.
- **Estimado**: el plano de la sala y los precios intermedios de la zona Ghost.
- **[FALTA]**: logo oficial, fotos y vídeo de la sala, dominio (canonical y Open Graph), y a qué plataforma se envían la venta y las reservas. Hoy los tres formularios validan y muestran un aviso de maqueta; no envían ni cobran nada.
- **Propuesto, sin aprobar por el club**: la lista con enlace exclusivo de cumpleaños.

## Registro del Prompt Maestro (Fase 7) · 2026-11-12

Va aquí y no en `docs/skills-log.md` porque ese archivo está en mitad de una fusión con conflictos.

- **Estilo**: «Cartel de club», elegido en el menú de 5 direcciones. Referencias: [UNVRS], Hï Ibiza, fabric y Berghain. Paleta cambiada a rojo y negro a petición del cliente.
- **Arquitectura**: React + Vite, con el ticker único y los muelles del kit (`src/lib`). Una sola familia, Archivo variable, con el eje de anchura.
- **Firma (regla 1)**: la palabra COMMITTEE es una ventana a la sala; con el scroll la «I» crece hasta llenar la pantalla.
- **Movimiento, nivel 3**: M1 (sala de luces por shader, rastro del cursor), M3 (zonas apiladas), M12 (cambio de noche), M14 (cursor de doble anillo), M18 (palabras fantasma). Combinación distinta de 2con2estudio y Hercas.
- **Skills**: impeccable (detector sin hallazgos). No se pasó la revisión de animaciones.
- **Verificado con Playwright** a 1440 y 390: capturas por sección, la firma a lo largo del scroll, los tres formularios solo con datos inválidos, ES/EN, consola sin errores ni avisos, enlaces internos, y que el WebGL no dibuja cuando el hero está tapado. Ticker: 0,23 ms por fotograma.
- **Sin verificar**: `prefers-reduced-motion` y navegación completa con teclado.
