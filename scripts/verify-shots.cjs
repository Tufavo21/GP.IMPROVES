// Verificación (regla 6): capturas por sección y por incrementos de scroll.
// Uso con Playwright MCP (browser_run_code_unsafe, filename) o adaptado a un test de Playwright.
// Avanza las animaciones con window.__cfTicker.step(n) porque el rAF va frenado en navegadores automatizados.
async (page) => {
  const W = 1440; // cambia a 390 para móvil
  const H = W < 600 ? 844 : 900;
  const dir = `shots/v4/${W}`;
  await page.setViewportSize({ width: W, height: H });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('2con2-lang', 'es'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; window.__cfTicker.step(90); });
  const go = async (y, name) => {
    const info = await page.evaluate((yy) => {
      window.scrollTo(0, yy);
      window.__cfTicker.step(70);
      // fuerza la carga de las imágenes diferidas que estén a la vista
      return { y: Math.round(scrollY), mode: document.querySelector('.nav').dataset.mode };
    }, y);
    await page.waitForTimeout(250);
    await page.evaluate(() => window.__cfTicker.step(10));
    await page.screenshot({ path: `${dir}/${name}.png` });
    return { name, ...info };
  };
  const out = [];
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const f of [0, 0.25, 0.5, 0.75, 1]) out.push(await go(Math.round(total * f), `pct-${f * 100}`));
  const hero = await page.evaluate(() => document.querySelector('.hero').offsetHeight - innerHeight);
  for (const f of [0, 0.25, 0.5, 0.75, 1]) out.push(await go(Math.round(hero * f), `hero-${f * 100}`));
  const tops = await page.evaluate(() => Object.fromEntries(['estudio', 'proyectos', 'servicios', 'proceso', 'opiniones', 'preguntas', 'presupuesto']
    .map((id) => [id, document.getElementById(id).getBoundingClientRect().top + scrollY - 0])));
  const nav = W < 900 ? 64 : 72;
  out.push(await go(tops.estudio - nav, 'estudio'));
  out.push(await go(tops.estudio + H * 0.9, 'estudio-2'));
  const projs = await page.evaluate(() => [...document.querySelectorAll('.proj, .plan')].map((e) => e.getBoundingClientRect().top + scrollY));
  out.push(await go(tops.proyectos - nav, 'proyectos'));
  for (let i = 0; i < projs.length; i += 1) out.push(await go(projs[i] - nav - 40, `proyecto-${i + 1}`));
  out.push(await go(tops.servicios - nav, 'servicios'));
  const proc = await page.evaluate(() => { const p = document.getElementById('proceso'); return { top: p.getBoundingClientRect().top + scrollY, h: p.offsetHeight - innerHeight }; });
  for (const f of [0, 0.25, 0.5, 0.75, 1]) out.push(await go(Math.round(proc.top + proc.h * f), `proceso-${f * 100}`));
  out.push(await go(tops.opiniones - nav, 'opiniones'));
  out.push(await go(tops.preguntas - nav, 'preguntas'));
  out.push(await go(tops.presupuesto - nav, 'presupuesto'));
  out.push(await go(tops.presupuesto - nav + H * 0.8, 'presupuesto-2'));
  out.push(await go(total, 'footer'));
  const stats = await page.evaluate(() => window.__cfTicker.stats());
  return { W, total, wheelScrolls: Math.round(total / 100), stats, out };
}
