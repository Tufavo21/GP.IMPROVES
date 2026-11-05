import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import es from './es.js';
import en from './en.js';
import { BUSINESS } from '../data/business.js';
import { syncHead } from '../lib/seo.js';

const DICTS = { es, en };
const KEY = '2con2-lang';

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* sin almacenamiento */ }
  return 'es';
}

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
const fill = (s, vars) => (typeof s === 'string' && vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : s);

const Ctx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignora */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    syncHead(lang, DICTS[lang], BUSINESS);
  }, [lang]);

  const value = useMemo(() => {
    const dict = DICTS[lang];
    // t('a.b', vars) devuelve texto, arrays u objetos del idioma activo.
    const t = (path, vars) => fill(get(dict, path), vars);
    return { lang, setLang, t, dict };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
export { DICTS };
