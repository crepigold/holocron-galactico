/*
  Construye la Biblia del canon a partir de web/datos/*.js

  Uso:  node herramientas/construir.js [ruta-artefacto.html]

  Genera:
    BIBLIA_CANON.md            Biblia completa en Markdown (para leer y guardar)
    lore.json                  Todos los datos en JSON (para motores de juego)
    Holocron_Galactico.html    La web entera en un solo archivo (se abre con doble clic)
    [ruta-artefacto.html]      (opcional) versión fragmento para publicar como Artifact
  Antes comprueba que todas las referencias entre datos existan.
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..');
const WEB = path.join(RAIZ, 'web');
const DATOS = ['datos/tomos.js', 'datos/facciones.js', 'datos/personajes.js', 'datos/mundo.js', 'exportar.js'];
const leer = f => fs.readFileSync(path.join(WEB, f), 'utf8');

/* 1. Cargar los datos como lo haría el navegador */
const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);
DATOS.forEach(f => vm.runInContext(leer(f), ctx, { filename: f }));
const L = ctx.LORE;

/* 2. Validar referencias */
const errores = [];
const ids = k => new Set(L[k].map(x => x.id));
const F = ids('facciones'), P = ids('personajes'), B = ids('batallas'), LU = ids('lugares');
const nums = new Set(L.tomos.map(t => t.num));
const chk = (set, id, donde) => { if (!set.has(id)) errores.push(`${donde}: «${id}» no existe`); };
L.tomos.forEach(t => {
  t.ficha.facciones.forEach(id => chk(F, id, t.id + '.facciones'));
  t.ficha.personajes.forEach(id => chk(P, id, t.id + '.personajes'));
  t.ficha.batallas.forEach(id => chk(B, id, t.id + '.batallas'));
  t.lugares.forEach(id => chk(LU, id, t.id + '.lugares'));
});
L.facciones.forEach(f => f.relaciones.forEach(r => chk(F, r.con, f.id + '.relaciones')));
L.personajes.forEach(p => { chk(F, p.faccion, p.id + '.faccion'); p.tomos.forEach(n => chk(nums, n, p.id + '.tomos')); });
L.batallas.forEach(b => { chk(LU, b.lugar, b.id + '.lugar'); chk(nums, b.tomo, b.id + '.tomo'); });
L.lugares.forEach(l => { if (l.faccion !== 'neutral') chk(F, l.faccion, l.id + '.faccion'); });
L.cronologia.forEach((c, i) => { if (c.tomo) chk(nums, c.tomo, 'cronologia[' + i + ']'); });
// llaves de propuesta equilibradas en todo el texto
(function walk(o, ruta) {
  if (typeof o === 'string') {
    let d = 0;
    for (const ch of o) { if (ch === '{') d++; if (ch === '}') d--; if (d < 0 || d > 1) break; }
    if (d !== 0) errores.push(`${ruta}: llaves { } desequilibradas`);
  } else if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) if (typeof o[k] !== 'function') walk(o[k], ruta + '.' + k);
  }
})({ tomos: L.tomos, facciones: L.facciones, personajes: L.personajes, lugares: L.lugares, batallas: L.batallas, cronologia: L.cronologia, glosario: L.glosario }, 'LORE');

if (errores.length) {
  console.error('Errores en los datos:\n  ' + errores.join('\n  '));
  process.exit(1);
}

/* 3. Exportar Biblia */
const hoy = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(RAIZ, 'BIBLIA_CANON.md'), L.aMarkdown(hoy), 'utf8');
fs.writeFileSync(path.join(RAIZ, 'lore.json'), L.aJSON(), 'utf8');

/* 4. Empaquetar la web en un solo archivo */
const index = leer('index.html');
const css = leer('estilo.css');
const js = DATOS.concat('app.js').map(f => `<script>/* ${f} */\n${leer(f).replace(/<\/script/gi, '<\\/script')}\n</script>`).join('\n');
const entre = (s, tag) => s.slice(s.indexOf(`<!--${tag}-->`) + tag.length + 7, s.indexOf(`<!--/${tag}-->`));
const unico = index
  .replace(/<!--CSS-->[\s\S]*<!--\/CSS-->/, `<style>\n${css}\n</style>`)
  .replace(/<!--JS-->[\s\S]*<!--\/JS-->/, js);
fs.writeFileSync(path.join(RAIZ, 'Holocron_Galactico.html'), unico, 'utf8');

/* 5. (opcional) Fragmento para publicar como Artifact */
const destino = process.argv[2];
if (destino) {
  const fragmento = [
    '<title>Holocrón Galáctico</title>',
    entre(index, 'FUENTES').trim(),
    `<style>\n${css}\n</style>`,
    entre(index, 'CUERPO').trim(),
    js
  ].join('\n');
  fs.writeFileSync(destino, fragmento, 'utf8');
}

/* 6. Resumen */
const palabras = L.tomos.reduce((n, t) => n + t.capitulos.reduce((m, c) => m + c.texto.split(/\s+/).length, 0), 0);
console.log(`OK · ${L.tomos.length} tomos (${L.tomos.reduce((n, t) => n + t.capitulos.length, 0)} capítulos, ~${palabras} palabras de crónica)`);
console.log(`   ${L.facciones.length} facciones · ${L.personajes.length} personajes · ${L.batallas.length} batallas · ${L.lugares.length} lugares · ${L.glosario.length} términos`);
console.log('   → BIBLIA_CANON.md, lore.json, Holocron_Galactico.html' + (destino ? ', ' + destino : ''));
