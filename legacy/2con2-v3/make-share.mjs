// Genera share/index.html: la web completa en un solo HTML (CSS, JS e imágenes incrustados)
// para enseñarla sin desplegar. Las tipografías se cargan desde Google Fonts.
// Uso: npm run share
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execSync('npx vite build --outDir dist-share', { cwd: root, stdio: 'inherit', env: { ...process.env, SHARE: '1' } });

const dist = path.join(root, 'dist-share');
const assetsDir = path.join(dist, 'assets');
const files = readdirSync(assetsDir);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));
if (files.filter((f) => f.endsWith('.js')).length !== 1) throw new Error('El bundle de share debe ser un único .js');

const css = readFileSync(path.join(assetsDir, cssFile), 'utf8').replace(/@font-face\s*\{[^}]*\}/g, '');
const js = readFileSync(path.join(assetsDir, jsFile), 'utf8').replaceAll('</script', '<\\/script');
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
const jsonld = html.match(/<script type="application\/ld\+json" id="jsonld">[\s\S]*?<\/script>/)[0];

// Recursos de public/ (imágenes y logos) como data URIs
const mime = { avif: 'image/avif', webp: 'image/webp', png: 'image/png' };
const map = {};
const add = (rel) => {
  const ext = rel.split('.').pop();
  map[rel] = `data:${mime[ext]};base64,${readFileSync(path.join(root, 'public', rel)).toString('base64')}`;
};
readdirSync(path.join(root, 'public/img')).forEach((f) => add(`img/${f}`));
['logo-2con2estudio-negro.png', 'logo-2con2estudio-blanco.png'].forEach(add);

const fonts = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400..700&family=Barlow+Condensed:wght@500;600;700&display=swap';
const out = `<title>2con2estudio</title>
<link rel="stylesheet" href="${fonts}">
<style>
${css}
</style>
<div id="root"></div>
${jsonld}
<script>window.__ASSETS__=${JSON.stringify(map)};</script>
<script type="module">
${js}
</script>
`;
mkdirSync(path.join(root, 'share'), { recursive: true });
writeFileSync(path.join(root, 'share/index.html'), out);
console.log(`share/index.html: ${(out.length / 1024 / 1024).toFixed(2)} MB`);
