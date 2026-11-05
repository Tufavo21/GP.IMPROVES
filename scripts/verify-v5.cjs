// Verificación de la iteración v5 (Baukasten + casa + fotos demo + plano a obra nítido).
// Uso con Playwright MCP: browser_run_code_unsafe con filename (cambia W a 390 para móvil).
// Las animaciones se avanzan con window.__cfTicker.step(n) (el rAF va frenado en navegadores automatizados).
async (page) => {
  const W = 1440;
  const H = W < 600 ? 844 : 900;
  const dir = `shots/v5/${W}`;
  const errors = []; const bad = []; const hosts = new Set();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  page.on('request', (r) => { try { hosts.add(new URL(r.url()).host); } catch { /* data: */ } });
  await page.setViewportSize({ width: W, height: H });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('2con2-lang', 'es'); sessionStorage.setItem('2con2-intro', '1'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; window.__cfTicker.step(120); });
  const go = async (y, name, steps = 90) => {
    await page.evaluate(([yy, n]) => { window.scrollTo(0, yy); window.__cfTicker.step(n); }, [y, steps]);
    await page.waitForTimeout(300);
    await page.evaluate(() => window.__cfTicker.step(20));
    await page.screenshot({ path: `${dir}/${name}.png` });
    return name;
  };
  const out = [];
  const q = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? { top: e.getBoundingClientRect().top + scrollY, h: e.offsetHeight } : null; }, sel);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const f of [0, 0.25, 0.5, 0.75, 1]) out.push(await go(Math.round(total * f), `pct-${f * 100}`));
  const hero = await q('.hero');
  for (const f of [0, 0.5, 1]) out.push(await go(Math.round((hero.h - H) * f), `hero-${f * 100}`));
  const house = await q('#casa');
  const houseInfo = [];
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    out.push(await go(Math.round(house.top + (house.h - H) * f), `casa-${f * 100}`, 140));
    houseInfo.push(await page.evaluate(() => ({ ...window.__cfHouse, pinTop: Math.round(document.querySelector('.house__pin').getBoundingClientRect().top) })));
  }
  // WebGL pausado cuando la sección está tapada (scroll a proyectos)
  const projs = await page.evaluate(() => [...document.querySelectorAll('.proj, .plan')].map((e) => e.getBoundingClientRect().top + scrollY));
  const nav = W < 900 ? 64 : 72;
  const r0 = await page.evaluate(() => window.__cfHouse.renders);
  for (let i = 0; i < projs.length; i += 1) out.push(await go(projs[i] - nav - 40, `proyecto-${i + 1}`));
  const r1 = await page.evaluate(() => window.__cfHouse.renders);
  // Plano a obra: pincel, obra completa (nitidez) y tamaño nativo frente a la caja
  const plan = await page.evaluate(() => {
    const b = document.querySelector('.plan__box').getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  });
  await page.mouse.move(plan.x + plan.w * 0.3, plan.y + plan.h * 0.4);
  for (let i = 0; i < 12; i += 1) { await page.mouse.move(plan.x + plan.w * (0.3 + i * 0.03), plan.y + plan.h * (0.4 + i * 0.02)); await page.evaluate(() => window.__cfTicker.step(2)); }
  await page.screenshot({ path: `${dir}/plano-pincel.png` });
  await page.getByRole('button', { name: /obra completa|full build/i }).click();
  await page.evaluate(() => window.__cfTicker.step(60));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/plano-obra.png` });
  const sharp = await page.evaluate(() => {
    const im = document.querySelector('.plan__pic--photo img');
    const c = document.querySelector('.plan__canvas');
    return { natural: im.naturalWidth, current: im.currentSrc.split('/').pop(), boxCssW: Math.round(im.getBoundingClientRect().width), dpr: devicePixelRatio, canvas: c ? [c.width, c.height] : null };
  });
  const proc = await q('#proceso');
  for (const f of [0, 0.5, 1]) out.push(await go(Math.round(proc.top + (proc.h - H) * f), `proceso-${f * 100}`));
  out.push(await go(total, 'footer'));
  const imgs = await page.evaluate(() => [...document.images].map((i) => i.currentSrc || i.src).filter(Boolean)
    .filter((s) => !/^https?:\/\/localhost/.test(s) && !s.startsWith('data:') && !s.startsWith('blob:')));
  const stats = await page.evaluate(() => window.__cfTicker.stats());
  return { W, total, houseInfo, webglRendersWhileCovered: r1 - r0, sharp, hotlinks: imgs, hosts: [...hosts], errors, bad, stats, out };
}
