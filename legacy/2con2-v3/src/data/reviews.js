// Reseñas REALES de Google. [FALTA: reseñas reales y enlace de la ficha de Google]
//
// Cada entrada debe ser una reseña publicada de verdad por un cliente. No se deben añadir reseñas
// inventadas ni ajustar la valoración: inventar reseñas es engañar al cliente y está prohibido
// (Directiva (UE) 2019/2161 y normativa de consumo española).
//
// Cómo añadir una: copia el texto literal, el nombre tal y como aparece en Google (o iniciales si el
// cliente lo prefiere), la valoración que puso y la fecha. Si Google permite enlazar la reseña, añade `url`.
// Mientras REVIEWS esté vacío, la sección no se muestra (salvo en beta con SHOW_PLACEHOLDERS, como hueco marcado).

export const GOOGLE_PROFILE = {
  url: null,    // enlace de la ficha de Google Business para «Escribir una reseña» y «Ver todas»
  rating: null, // valoración media REAL que muestra Google, p. ej. 4.9
  count: null,  // número REAL de reseñas, p. ej. 27
};

export const REVIEWS = [
  // { id: 'r1', name: 'Nombre del cliente', rating: 5, date: '2026-03', text: 'Texto literal de la reseña.', url: null },
];
