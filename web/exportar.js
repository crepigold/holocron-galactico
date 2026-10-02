/*
  Exportador de la Biblia del canon.
  Funciona en el navegador (botones de la página Canon) y en Node (herramientas/construir.js).
  {llaves} se convierten en «texto†» en Markdown: † = propuesta pendiente de aprobación.
*/
(function () {
  const L = window.LORE;
  const SRC = { O: 'Original (web 2025)', A: 'Autor (2026)', P: 'Propuesta' };
  const m = s => String(s == null ? '' : s).replace(/\{([^{}]+)\}/g, '$1†');
  const facName = id => (L.facciones.find(f => f.id === id) || { nombre: id }).nombre;
  const perName = id => m((L.personajes.find(p => p.id === id) || { nombre: id }).nombre);
  const batName = id => m((L.batallas.find(b => b.id === id) || { nombre: id }).nombre);
  const lugName = id => m((L.lugares.find(l => l.id === id) || { nombre: id }).nombre);

  L.aMarkdown = function (fecha) {
    const o = [];
    const P = (...x) => o.push(...x);
    P('# Holocrón Galáctico — Biblia del Canon', '');
    P('> Crónica de la Era de las Grandes Guerras y sus Ecos.');
    P('> Generada' + (fecha ? ' el ' + fecha : '') + ' a partir de `web/datos/*.js`. **No edites este archivo a mano:** edita los datos y vuelve a generarla.');
    P('>');
    P('> **Leyenda:** las marcas de fuente son *Original* (texto literal de la web de 2025), *Autor 2026* (decisiones del autor al reconstruir) y *Propuesta* (reconstrucción pendiente de aprobar). Dentro del texto, **†** marca los detalles propuestos.', '');

    P('## Índice', '');
    P('1. Estado actual de la galaxia', '2. Los Tomos (I–VII)', '3. Códice de Facciones', '4. Personajes', '5. Batallas y acontecimientos', '6. Lugares', '7. Cronología', '8. Glosario', '9. Registro de canon', '');

    P('---', '', '## 1. Estado actual de la galaxia', '');
    P(m(L.epilogo.texto), '');
    P('| Facción | Estado | Peso | Situación |', '|---|---|---|---|');
    L.facciones.filter(f => f.poder != null).forEach(f => {
      P(`| ${f.id === 'andalus' ? 'Restos de Andalus' : f.nombre} | ${f.estado} | ${f.poder} | ${m(f.resumenActual)} |`);
    });
    P('');

    P('---', '', '## 2. Los Tomos', '');
    L.tomos.forEach(t => {
      P(`### Tomo ${t.num} — ${t.titulo}`, '');
      P(`*Periodo: ${m(t.periodo)}*`, '');
      P('**Registro original del Holocrón:**', '', '> ' + t.original, '');
      if (t.notaOriginal) P('*Nota: ' + t.notaOriginal + '*', '');
      P('**Sinopsis.** ' + m(t.sinopsis), '');
      t.capitulos.forEach((c, i) => {
        P(`#### Capítulo ${i + 1}. ${c.titulo}`, '');
        P('*Fuentes: ' + c.base.split(/\s+/).map(k => SRC[k]).join(', ') + '*', '');
        c.texto.trim().split(/\n\s*\n/).forEach(p => P(m(p.trim()), ''));
      });
      const f = t.ficha;
      P('#### Ficha del Tomo', '');
      P('- **Facciones:** ' + f.facciones.map(facName).join(', '));
      P('- **Personajes:** ' + f.personajes.map(perName).join(', '));
      if (f.batallas.length) P('- **Batallas y acontecimientos:** ' + f.batallas.map(batName).join(', '));
      P('- **Cambios territoriales:** ' + m(f.territorio));
      P('- **Muertes:** ' + m(f.muertes));
      P('- **Nuevos líderes:** ' + m(f.lideres));
      P('- **Tecnología:** ' + m(f.tecnologia));
      P('- **Consecuencias:** ' + m(f.consecuencias), '');
      P('#### Para videojuegos', '');
      t.juegos.forEach(j => P('- ' + m(j)));
      P('');
    });
    P('### Epílogo — ' + L.epilogo.titulo, '', m(L.epilogo.texto), '');

    P('---', '', '## 3. Códice de Facciones', '');
    L.facciones.forEach(f => {
      P(`### ${f.nombre}`, '');
      if (f.alias) P('*' + m(f.alias) + '*', '');
      P(`- **Estado actual:** ${f.estado}${f.poder != null ? ' (peso ' + f.poder + ')' : ''}`);
      P('- **Lema:** ' + m(f.lema));
      P('- **Capital / sede:** ' + m(f.capital));
      P('- **Gobierno:** ' + m(f.gobierno), '');
      P('**Códice original:**', '', '> ' + f.codice, '');
      P('**Historia**', '');
      f.historia.forEach(h => P(`- **${m(h.titulo)}.** ${m(h.texto)}`));
      P('', '**Gobernantes y líderes**', '');
      P('| Nombre | Título | Periodo | Nota |', '|---|---|---|---|');
      f.gobernantes.forEach(g => P(`| ${m(g.nombre)} | ${m(g.titulo)} | ${m(g.periodo)} | ${m(g.nota)} |`));
      P('', '**Ejército**', '');
      f.ejercito.forEach(e => P(`- **${m(e.nombre)}:** ${m(e.texto)}`));
      P('', '**Cultura.** ' + m(f.cultura), '');
      P('**Relaciones**', '');
      f.relaciones.forEach(r => P(`- **${facName(r.con)}** (${r.tipo}): ${m(r.texto)}`));
      P('', '**Situación actual.** ' + m(f.resumenActual), '');
      P('**Jugabilidad.** ' + m(f.jugabilidad), '');
      P('**Ganchos narrativos:**', '');
      f.ganchos.forEach(g => P('- ' + m(g)));
      P('');
    });

    P('---', '', '## 4. Personajes', '');
    L.personajes.forEach(p => {
      P(`### ${m(p.nombre)}`, '');
      P(`- **Títulos:** ${m(p.titulos)}`);
      P(`- **Facción:** ${facName(p.faccion)}`);
      P(`- **Vida:** ${m(p.vida)}`);
      P(`- **Papel:** ${m(p.rol)}`);
      P(`- **Tomos:** ${p.tomos.join(', ')}`, '');
      P(m(p.bio), '');
      P('**Destino:** ' + m(p.destino), '');
    });

    P('---', '', '## 5. Batallas y acontecimientos', '');
    L.batallas.slice().sort((a, b) => a.anio - b.anio).forEach(b => {
      P(`### ${m(b.nombre)} — año ${b.anio} DO† · Tomo ${b.tomo}`, '');
      P(`- **Lugar:** ${lugName(b.lugar)}`);
      P(`- **Bandos:** ${m(b.bandos)}`);
      P(`- **Mandos:** ${m(b.mandos)}`);
      P(`- **Resultado:** ${m(b.resultado)}`);
      P(`- **Consecuencias:** ${m(b.consecuencias)}`, '');
    });

    P('---', '', '## 6. Lugares', '');
    P('| Lugar | Tipo | Afiliación | Fuente | Descripción |', '|---|---|---|---|---|');
    L.lugares.forEach(l => P(`| ${m(l.nombre)} | ${m(l.tipo)} | ${m(l.afiliacion)} | ${SRC[l.src]} | ${m(l.texto)} |`));
    P('');

    P('---', '', '## 7. Cronología', '', '*Calendario de trabajo†: año 0 = Batalla de Orion-34; AO = antes, DO = después.*', '');
    L.cronologia.forEach(c => P(`- **${m(c.anio)}** — ${m(c.texto)}${c.tomo ? ' *(Tomo ' + c.tomo + ')*' : ''}`));
    P('');

    P('---', '', '## 8. Glosario', '');
    L.glosario.slice().sort((a, b) => m(a.t).localeCompare(m(b.t), 'es')).forEach(g => P(`- **${m(g.t)}** — ${m(g.d)}`));
    P('');

    P('---', '', '## 9. Registro de canon', '');
    P('### Fuentes', '');
    L.canon.fuentes.forEach(f => P(`- **${f.nombre}**${f.url ? ' — ' + f.url : ''}. ${f.nota}`));
    P('', '### Decisiones del autor (2 oct 2026)', '');
    L.canon.decisiones.forEach(d => P(`- **${d.p}** → ${d.r}`));
    P('', '### Propuestas pendientes de aprobar', '');
    L.canon.propuestas.forEach(x => P('- [ ] ' + x));
    P('', '### Preguntas abiertas', '');
    L.canon.pendientes.forEach(x => P('- [ ] ' + x));
    P('');
    return o.join('\n');
  };

  L.aJSON = function () {
    const datos = {};
    ['epilogo', 'tomos', 'facciones', 'personajes', 'batallas', 'lugares', 'cronologia', 'glosario', 'canon'].forEach(k => { datos[k] = L[k]; });
    return JSON.stringify({
      convenciones: {
        llaves: 'El texto entre {llaves} es una propuesta pendiente de aprobación.',
        src: { O: SRC.O, A: SRC.A, P: SRC.P },
        calendario: 'Año 0 = Batalla de Orion-34 (propuesta). AO = antes, DO = después.'
      },
      ...datos
    }, null, 2);
  };
})();
