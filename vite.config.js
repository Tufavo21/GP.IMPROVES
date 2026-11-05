import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import es from './src/i18n/es.js';
import { buildJsonLd } from './src/lib/seo.js';

const BUSINESS_HEAD = {
  name: '2con2estudio',
  founders: ['Bea Pérez', 'Gonzalo Pau'],
  slogan: { es: 'DISEÑO DE INTERIORES · EJECUCIÓN DE OBRA' },
  city: 'Valencia', country: 'ES',
  phone: { intl: '+34 685 35 41 53' },
  email: 'pableteizquierdoperez@gmail.com',
  instagram: { url: 'https://www.instagram.com/2con2estudio/' },
};

// Inyecta URL del sitio y JSON-LD (ES) en el HTML, y genera sitemap.xml y robots.txt.
function seoPlugin(siteUrl) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  return {
    name: '2con2-seo',
    transformIndexHtml(html) {
      return html
        .replaceAll('%SITE_URL%', siteUrl)
        .replace('__JSONLD__', JSON.stringify(buildJsonLd('es', es, { ...BUSINESS_HEAD, siteUrl })));
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/sitemap.xml') { res.setHeader('Content-Type', 'application/xml'); res.end(sitemap); return; }
        if (req.url === '/robots.txt') { res.setHeader('Content-Type', 'text/plain'); res.end(robots); return; }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // [FALTA: dominio definitivo] — define VITE_SITE_URL al construir
  const siteUrl = (env.VITE_SITE_URL || 'https://2con2estudio.example').replace(/\/$/, '');
  return {
    plugins: [react(), seoPlugin(siteUrl)],
    server: { port: 5173 },
    build: { target: 'es2022' },
  };
});
