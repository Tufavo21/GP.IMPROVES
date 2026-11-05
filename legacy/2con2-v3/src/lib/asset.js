// Ruta de un recurso de public/. En la versión para compartir (un solo HTML) los recursos van
// incrustados y se leen de window.__ASSETS__; en el resto de builds es la ruta absoluta de siempre.
export const asset = (p) => (typeof window !== 'undefined' && window.__ASSETS__?.[p]) || `/${p}`;
