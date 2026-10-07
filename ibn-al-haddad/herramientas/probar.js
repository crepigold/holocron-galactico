/* Prueba automática: abre el juego en un navegador sin ventana, recorre todas las zonas
 * y cinemáticas del Prólogo y comprueba que no haya errores de JavaScript.
 *
 *   npm i -D playwright   (una vez)
 *   npm run probar
 *
 * Las capturas se guardan en herramientas/capturas/.
 */
'use strict';
const path = require('path');
const fs = require('fs');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error('Falta Playwright: ejecuta "npm i -D playwright" y vuelve a probar.');
  process.exit(1);
}

const raiz = 'file://' + path.resolve(__dirname, '..', 'index.html');
const casos = [
  ['titulo', ''],
  ['intro', '#cine=intro'],
  ['forja', '#zona=forja'],
  ['calles', '#zona=calles&entrada=desdeForja&traje=yusuf&banderas=forjaHecha'],
  ['maydan', '#zona=maydan&traje=yusuf&banderas=forjaHecha,espadasRecuperadas'],
  ['noche', '#zona=forjaNoche'],
  ['partida', '#cine=partida'],
  ['campamento', '#zona=campamento&traje=yusufSoldado'],
  ['vado', '#cine=vado'],
  ['mansura', '#zona=mansura&traje=yusufSoldado'],
  ['jefe', '#zona=mansura&entrada=c3&traje=yusufSoldado&banderas=mansuraInicio,e1,e2,e3'],
  ['epilogo', '#cine=epilogo'],
];

(async () => {
  const salida = path.join(__dirname, 'capturas');
  fs.mkdirSync(salida, { recursive: true });
  const nav = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
  let fallos = 0;
  for (const [nombre, hash] of casos) {
    const p = await nav.newPage({ viewport: { width: 1280, height: 720 } });
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
    await p.goto(raiz + hash);
    await p.waitForFunction(() => window.__listo, null, { timeout: 30000 }).catch(() => errores.push('no arrancó'));
    await p.waitForTimeout(4000);
    const internos = await p.evaluate(() => (window.IH && IH.errores ? IH.errores.map(String) : []));
    errores.push(...internos);
    await p.screenshot({ path: path.join(salida, nombre + '.png') });
    console.log((errores.length ? '✗ ' : '✓ ') + nombre + (errores.length ? '  → ' + errores.join(' | ') : ''));
    if (errores.length) fallos++;
    await p.close();
  }
  await nav.close();
  process.exit(fallos ? 1 : 0);
})();
