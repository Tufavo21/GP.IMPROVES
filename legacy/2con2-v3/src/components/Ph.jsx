import { BUSINESS, SHOW_PLACEHOLDERS } from '../data/business.js';

// Marca visible de dato pendiente [FALTA: …] mientras SHOW_PLACEHOLDERS esté activo (beta).
export default function Ph({ k, children }) {
  if (!SHOW_PLACEHOLDERS) return null;
  return <span className="falta">{children || BUSINESS.falta[k]}</span>;
}
