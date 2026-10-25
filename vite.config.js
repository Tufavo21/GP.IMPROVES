import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Inyecta el JSON-LD (ES) en el HTML estático desde los mismos datos DEMO que usa la app.
function jsonLdPlugin() {
  return {
    name: 'inject-jsonld',
    async transformIndexHtml(html) {
      const { buildJsonLd } = await import('./src/i18n.js');
      return html.replace('<!--JSONLD-->', JSON.stringify(buildJsonLd('es')));
    },
  };
}

export default defineConfig({
  plugins: [react(), jsonLdPlugin()],
  server: { port: 5173 },
});
