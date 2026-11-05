// Baremo orientativo en €/m² por tipo de reforma y nivel de acabados.
// [FALTA: baremo del cliente] Todos los valores están a null y SHOW_ESTIMATE = false:
// mientras sea así, la web no muestra ninguna cifra ni horquilla.
//
// Para activarlo: rellena min y max (€/m²) de las celdas que correspondan y
// pon SHOW_ESTIMATE = true. Las celdas que sigan en null no producen horquilla.

export const SHOW_ESTIMATE = false;

const cell = () => ({ min: null, max: null });
const row = () => ({ basico: cell(), medio: cell(), alto: cell() });

export const PRICING = {
  cocina: row(),
  bano: row(),
  integral: row(),
  otro: row(),
};
