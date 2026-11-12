import { useSyncExternalStore } from 'react';

// Almacenes mínimos compartidos: idioma y noche elegida (la noche tiñe toda la web).
function make(initial) {
  let v = initial;
  const subs = new Set();
  return {
    get: () => v,
    set: (n) => { if (n !== v) { v = n; subs.forEach((f) => f()); } },
    sub: (f) => { subs.add(f); return () => subs.delete(f); },
  };
}

function initialLang() {
  try {
    const saved = localStorage.getItem('committee-lang');
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* almacenamiento bloqueado */ }
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
}

export const langStore = make(typeof window === 'undefined' ? 'es' : initialLang());
export const nightStore = make('thu');
export const useStore = (s) => useSyncExternalStore(s.sub, s.get, s.get);

export function setLang(lang) {
  langStore.set(lang);
  try { localStorage.setItem('committee-lang', lang); } catch { /* sin almacenamiento */ }
}

// Traducción en línea: const tr = useTr(); tr('Hola', 'Hello')
export function useTr() {
  const lang = useStore(langStore);
  return (es, en) => (lang === 'es' ? es : en);
}
