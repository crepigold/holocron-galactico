/* Holocrón Galáctico — lector de la Biblia del canon */
(function () {
  const L = window.LORE;
  const app = document.getElementById('app');

  /* ---------------------------------------------------- utilidades */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = s => esc(s).replace(/\{([^{}]+)\}/g, '<span class="prop" title="Propuesta: pendiente de aprobación">$1</span>');
  const plain = s => String(s == null ? '' : s).replace(/[{}]/g, '');
  const paras = s => String(s).trim().split(/\n\s*\n/).map(p => `<p>${fmt(p.trim())}</p>`).join('');
  const fac = id => L.facciones.find(f => f.id === id);
  const per = id => L.personajes.find(p => p.id === id);
  const bat = id => L.batallas.find(b => b.id === id);
  const lug = id => L.lugares.find(l => l.id === id);
  const tomoNum = n => L.tomos.find(t => t.num === n);
  const facColor = id => (fac(id) || {}).color || '#a855f7';
  const SRC = {
    O: { cls: 'b-o', label: 'Original', tip: 'Texto literal de la web original (2025)' },
    A: { cls: 'b-a', label: 'Autor 2026', tip: 'Decisión del autor al reconstruir el canon (2 oct 2026)' },
    P: { cls: 'b-p', label: 'Propuesta', tip: 'Reconstrucción propuesta, pendiente de aprobación' }
  };
  const badge = k => `<span class="badge ${SRC[k].cls}" title="${SRC[k].tip}">${SRC[k].label}</span>`;
  const statusName = f => f.id === 'andalus' ? 'Restos de Andalus' : f.nombre;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  const facChip = id => {
    const f = fac(id);
    return f ? `<a class="chip" href="#faccion-${f.id}" style="--fc:${f.color}"><i class="dot"></i>${esc(f.nombre)}</a>` : '';
  };
  const perLink = id => { const p = per(id); return p ? `<a href="#personaje-${p.id}">${fmt(p.nombre)}</a>` : esc(id); };
  const batLink = id => { const b = bat(id); return b ? `<a href="#batalla-${b.id}">${fmt(b.nombre)}</a>` : esc(id); };
  const lugLink = id => { const l = lug(id); return l ? `<a href="#lugar-${l.id}">${fmt(l.nombre)}</a>` : esc(id); };
  const tomoLink = n => { const t = tomoNum(n); return t ? `<a href="#${t.id}">Tomo ${n}</a>` : ''; };

  /* ---------------------------------------------------- portada */
  function viewHome() {
    const status = L.facciones.filter(f => f.poder != null);
    const total = status.reduce((a, f) => a + f.poder, 0);
    const maxSpan = Math.max(...L.tomos.map(t => t.anios[1] - t.anios[0]));
    return `
      <section class="hero">
        <canvas class="stars" aria-hidden="true"></canvas>
        <div class="wrap hero-in">
          <p class="eyebrow">Crónica interactiva · Era de las Grandes Guerras y sus Ecos</p>
          <h1 class="hero-title">Holocrón<br><span>Galáctico</span></h1>
          <p class="lede">${fmt(L.epilogo.texto)}</p>
          <p class="hero-meta">Presente del Holocrón: <b>${fmt('{año ' + L.epilogo.presente + '}')}</b> · ${L.tomos.length} Tomos · ${L.facciones.length} facciones · ${L.personajes.length} personajes</p>
          <div class="cta">
            <a class="btn" href="#tomo-1">Empezar por el Tomo I</a>
            <a class="btn ghost" href="#mapa">Abrir el mapa galáctico</a>
          </div>
        </div>
      </section>

      <section class="wrap block">
        <header class="sec-head">
          <p class="eyebrow">Presente</p>
          <h2>Estado actual de la galaxia</h2>
          <p>Las potencias tras la Última Gran Guerra y el peso relativo que les daba el gráfico de la web original.</p>
        </header>
        <div class="power" role="img" aria-label="Balance de poder: ${status.map(f => statusName(f) + ' ' + f.poder + '%').join(', ')}">
          <div class="power-bar">${status.map(f => `<span style="--fc:${f.color};width:${(f.poder / total) * 100}%"></span>`).join('')}</div>
          <div class="power-legend">${status.map(f => `<span><i class="dot" style="--fc:${f.color}"></i>${esc(statusName(f))} · ${f.poder}%</span>`).join('')}</div>
        </div>
        <div class="status-grid">
          ${status.map(f => `
            <a class="status" href="#faccion-${f.id}" style="--fc:${f.color}">
              <h3>${esc(statusName(f))} <span class="pill">${esc(f.estado)}</span></h3>
              <p>${fmt(f.resumenActual)}</p>
            </a>`).join('')}
        </div>
      </section>

      <section class="wrap block" id="biblioteca">
        <header class="sec-head">
          <p class="eyebrow">La Biblioteca</p>
          <h2>Los siete Tomos</h2>
          <p>La Línea Temporal de las Grandes Guerras, narrada capítulo a capítulo. Cada lomo muestra en su borde los colores de las facciones que participan.</p>
        </header>
        <div class="shelf">
          ${L.tomos.map(t => {
            const span = t.anios[1] - t.anios[0];
            const h = 270 + Math.round((span / maxSpan) * 90);
            return `
            <a class="spine" href="#${t.id}" style="--h:${h}px" aria-label="Tomo ${t.num}: ${esc(t.titulo)}">
              <span class="spine-bands">${t.ficha.facciones.map(id => `<i style="--fc:${facColor(id)}"></i>`).join('')}</span>
              <span class="spine-num">${t.num}</span>
              <span class="spine-title">${esc(t.titulo)}</span>
              <span class="spine-years">${esc(t.periodo)}</span>
            </a>`;
          }).join('')}
        </div>
      </section>

      <section class="wrap block">
        <header class="sec-head">
          <p class="eyebrow">Cómo leer este archivo</p>
          <h2>Tres niveles de canon</h2>
          <p>Todo dato indica su origen, para que recuerdos, decisiones e invenciones no se mezclen por accidente.</p>
        </header>
        <div class="legend-grid">
          <div class="legend-item">${badge('O')}<p>Texto literal de tu web Holocrón Galáctico (2025), recuperado del código fuente. Es el canon firme.</p></div>
          <div class="legend-item">${badge('A')}<p>Decisiones que tomaste al reconstruir el lore el 2 de octubre de 2026.</p></div>
          <div class="legend-item">${badge('P')}<p>Detalles propuestos para rellenar huecos. En el texto aparecen <span class="prop" title="Propuesta: pendiente de aprobación">subrayados con puntos</span>. Puedes ocultar el subrayado con el botón «Propuestas».</p></div>
        </div>
      </section>`;
  }

  /* ---------------------------------------------------- tomo */
  function viewTomo(t) {
    const i = L.tomos.indexOf(t);
    const prev = L.tomos[i - 1], next = L.tomos[i + 1];
    const f = t.ficha;
    return `
      <div class="wrap page">
        <nav class="crumbs"><a href="#inicio">Biblioteca</a> / Tomo ${t.num}</nav>
        <header class="tomo-head">
          <div class="tomo-num" aria-hidden="true">${t.num}</div>
          <div>
            <p class="eyebrow">Tomo ${t.num} · ${fmt(t.periodo)}</p>
            <h1>${esc(t.titulo)}</h1>
            <div class="chips">${f.facciones.map(facChip).join('')}</div>
          </div>
        </header>
        <div class="reader-grid">
          <aside class="toc">
            <p class="label">En este tomo</p>
            <ol>
              ${t.capitulos.map((c, n) => `<li><a href="#${t.id}.c${n + 1}"><span>${n + 1}</span>${esc(c.titulo)}</a></li>`).join('')}
              <li><a href="#${t.id}.ficha"><span>◇</span>Ficha del Tomo</a></li>
              <li><a href="#${t.id}.juegos"><span>◇</span>Para videojuegos</a></li>
            </ol>
            <div class="toc-pager">
              ${prev ? `<a href="#${prev.id}">← Tomo ${prev.num}</a>` : ''}
              ${next ? `<a href="#${next.id}">Tomo ${next.num} →</a>` : `<a href="#inicio">Volver a la Biblioteca</a>`}
            </div>
          </aside>
          <article class="prose">
            <figure class="record">
              <figcaption><span class="label">Registro original del Holocrón</span>${badge('O')}</figcaption>
              <blockquote>${esc(t.original)}</blockquote>
              ${t.notaOriginal ? `<p class="note">Nota: ${esc(t.notaOriginal)}</p>` : ''}
            </figure>
            <p class="synopsis">${fmt(t.sinopsis)}</p>

            ${t.capitulos.map((c, n) => `
              <section class="chapter" id="${t.id}.c${n + 1}">
                <header>
                  <p class="label">Capítulo ${n + 1}</p>
                  <h2>${esc(c.titulo)}</h2>
                  <div class="ch-src"><span class="label">Fuentes</span><span class="badges">${c.base.split(/\s+/).map(badge).join('')}</span></div>
                </header>
                ${paras(c.texto)}
              </section>`).join('')}

            <hr class="divider">
            <section class="sheet" id="${t.id}.ficha">
              <p class="eyebrow">Datos</p>
              <h2>Ficha del Tomo ${t.num}</h2>
              <dl class="facts">
                <dt>Periodo</dt><dd>${fmt(t.periodo)}</dd>
                <dt>Facciones</dt><dd><div class="chips">${f.facciones.map(facChip).join('')}</div></dd>
                <dt>Personajes</dt><dd>${f.personajes.map(perLink).join(' · ')}</dd>
                ${f.batallas.length ? `<dt>Batallas</dt><dd>${f.batallas.map(batLink).join(' · ')}</dd>` : ''}
                <dt>Lugares</dt><dd>${t.lugares.map(lugLink).join(' · ')}</dd>
                <dt>Territorio</dt><dd>${fmt(f.territorio)}</dd>
                <dt>Muertes</dt><dd>${fmt(f.muertes)}</dd>
                <dt>Nuevos líderes</dt><dd>${fmt(f.lideres)}</dd>
                <dt>Tecnología</dt><dd>${fmt(f.tecnologia)}</dd>
                <dt>Consecuencias</dt><dd>${fmt(f.consecuencias)}</dd>
              </dl>
            </section>
            <section class="sheet" id="${t.id}.juegos">
              <p class="eyebrow">Semillas</p>
              <h2>Para videojuegos</h2>
              <ul class="hooks">${t.juegos.map(j => `<li>${fmt(j)}</li>`).join('')}</ul>
            </section>
            <nav class="pager">
              ${prev ? `<a href="#${prev.id}"><span class="label">← Anterior</span><strong>Tomo ${prev.num}. ${esc(prev.titulo)}</strong></a>` : ''}
              ${next ? `<a class="next" href="#${next.id}"><span class="label">Siguiente →</span><strong>Tomo ${next.num}. ${esc(next.titulo)}</strong></a>`
                     : `<a class="next" href="#inicio"><span class="label">Fin de la crónica</span><strong>${esc(L.epilogo.titulo)}</strong></a>`}
            </nav>
          </article>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------- facciones */
  function viewFacciones() {
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Códice de Facciones</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Las civilizaciones</h1>
          <p>Cada facción tiene su historia, su cultura y sus ambiciones. El texto del códice original abre cada ficha, y después vienen la historia completa, los gobernantes, el ejército y las notas de jugabilidad.</p>
        </header>
        <div class="fac-grid">
          ${L.facciones.map(f => `
            <a class="fac-card" href="#faccion-${f.id}" style="--fc:${f.color}">
              <span class="pill" style="justify-self:start">${esc(f.estado)}</span>
              <h3>${esc(f.nombre)}</h3>
              <p class="lema">${fmt(f.lema)}</p>
              <p>${fmt(f.codice.split('. ').slice(0, 2).join('. '))}.</p>
            </a>`).join('')}
        </div>
      </div>`;
  }

  function viewFaccion(f) {
    const people = L.personajes.filter(p => p.faccion === f.id);
    const others = L.facciones.filter(x => x.id !== f.id);
    return `
      <div class="wrap page" style="--fc:${f.color}">
        <nav class="crumbs"><a href="#facciones">Códice de Facciones</a> / ${esc(f.nombre)}</nav>
        <header class="fac-head">
          <p class="eyebrow">Códice de Facciones</p>
          <h1>${esc(f.nombre)}</h1>
          ${f.alias ? `<p class="muted">${esc(f.alias)}</p>` : ''}
          <div class="chips">
            <span class="pill">${esc(f.estado)}</span>
            ${['historia', 'gobernantes', 'ejercito', 'cultura', 'relaciones', 'presente', 'juego'].map(s =>
              `<a class="chip" href="#faccion-${f.id}.${s}">${{ historia: 'Historia', gobernantes: 'Gobernantes', ejercito: 'Ejército', cultura: 'Cultura', relaciones: 'Relaciones', presente: 'Presente', juego: 'Jugabilidad' }[s]}</a>`).join('')}
          </div>
        </header>
        <div class="fac-layout">
          <div class="fac-main">
            <figure class="record" style="margin:0">
              <figcaption><span class="label">Códice original</span>${badge('O')}</figcaption>
              <blockquote>${esc(f.codice)}</blockquote>
            </figure>

            <section class="fac-sec" id="faccion-${f.id}.historia">
              <h2>Historia</h2>
              <ol class="era-list">${f.historia.map(h => `<li><div><h3>${fmt(h.titulo)}</h3><p>${fmt(h.texto)}</p></div></li>`).join('')}</ol>
            </section>

            <section class="fac-sec" id="faccion-${f.id}.gobernantes">
              <h2>Gobernantes y líderes</h2>
              <div class="table-wrap"><table>
                <thead><tr><th>Nombre</th><th>Título</th><th>Periodo</th><th>Nota</th></tr></thead>
                <tbody>${f.gobernantes.map(g => `<tr><td><strong>${fmt(g.nombre)}</strong></td><td>${fmt(g.titulo)}</td><td class="num">${fmt(g.periodo)}</td><td>${fmt(g.nota)}</td></tr>`).join('')}</tbody>
              </table></div>
            </section>

            <section class="fac-sec" id="faccion-${f.id}.ejercito">
              <h2>${f.id === 'sintonia' ? 'Caballeros y poderes' : 'Ejército'}</h2>
              <div class="unit-list">${f.ejercito.map(e => `<div class="unit"><h3>${fmt(e.nombre)}</h3><p>${fmt(e.texto)}</p></div>`).join('')}</div>
            </section>

            <section class="fac-sec" id="faccion-${f.id}.cultura">
              <h2>Cultura</h2>
              <p>${fmt(f.cultura)}</p>
            </section>

            <section class="fac-sec" id="faccion-${f.id}.relaciones">
              <h2>Relaciones</h2>
              <div>${f.relaciones.map(r => { const o = fac(r.con); return `
                <div class="rel">
                  <a href="#faccion-${o.id}" style="--fc:${o.color}"><i class="dot"></i>${esc(o.nombre)}</a>
                  <span class="pill" style="justify-self:start">${esc(r.tipo)}</span>
                  <p>${fmt(r.texto)}</p>
                </div>`; }).join('')}</div>
            </section>

            <section class="fac-sec" id="faccion-${f.id}.presente">
              <h2>Situación actual</h2>
              <p>${fmt(f.resumenActual)}</p>
            </section>

            <section class="fac-sec" id="faccion-${f.id}.juego">
              <h2>Para videojuegos</h2>
              <div class="play">
                <p class="label">Estilo de juego</p>
                <p>${fmt(f.jugabilidad)}</p>
              </div>
              <p class="label">Ganchos narrativos</p>
              <ul class="hooks">${f.ganchos.map(g => `<li>${fmt(g)}</li>`).join('')}</ul>
            </section>
          </div>

          <aside class="fac-side">
            <dl>
              <div><dt>Estado</dt><dd>${esc(f.estado)}${f.poder != null ? ` · peso ${f.poder}%` : ''}</dd></div>
              <div><dt>Lema</dt><dd>${fmt(f.lema)}</dd></div>
              <div><dt>Capital / sede</dt><dd>${fmt(f.capital)}</dd></div>
              <div><dt>Gobierno</dt><dd>${fmt(f.gobierno)}</dd></div>
              ${people.length ? `<div><dt>Personajes</dt><dd>${people.map(p => perLink(p.id)).join(' · ')}</dd></div>` : ''}
            </dl>
            <div><p class="label" style="margin-bottom:8px">Otras facciones</p><div class="chips">${others.map(o => facChip(o.id)).join('')}</div></div>
          </aside>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------- personajes */
  function viewPersonajes() {
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Fichas</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Personajes</h1>
          <p>Héroes, emperadores y enemigos de las Grandes Guerras. Pulsa una ficha para leer la biografía completa.</p>
        </header>
        <div class="toolbar" role="group" aria-label="Filtrar por facción">
          <button class="chip" data-f="" aria-pressed="true">Todas</button>
          ${L.facciones.map(f => `<button class="chip" data-f="${f.id}" aria-pressed="false" style="--fc:${f.color}"><i class="dot"></i>${esc(f.nombre)}</button>`).join('')}
        </div>
        <div class="people">
          ${L.personajes.map(p => { const f = fac(p.faccion); return `
            <details class="person" id="personaje-${p.id}" data-f="${p.faccion}" style="--fc:${f.color}">
              <summary>
                <h3>${fmt(p.nombre)}</h3>
                <p>${fmt(p.titulos)}</p>
                <p class="kv"><i class="dot"></i> ${esc(f.nombre)} · ${fmt(p.vida)}</p>
              </summary>
              <div class="body">
                <p class="kv"><b>Papel:</b> ${fmt(p.rol)} · <b>Tomos:</b> ${p.tomos.map(tomoLink).join(', ')}</p>
                <p>${fmt(p.bio)}</p>
                <p class="kv"><b>Destino:</b> ${fmt(p.destino)}</p>
              </div>
            </details>`; }).join('')}
        </div>
      </div>`;
  }

  /* ---------------------------------------------------- batallas */
  function viewBatallas() {
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Hechos de armas</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Batallas y acontecimientos</h1>
          <p>Ordenados por año (calendario propuesto: año 0 = Batalla de Orion-34).</p>
        </header>
        <div class="rows">
          ${L.batallas.slice().sort((a, b) => a.anio - b.anio).map(b => `
            <div class="row" id="batalla-${b.id}">
              <div class="row-year">${fmt('{' + b.anio + ' DO}')}</div>
              <div>
                <h3>${fmt(b.nombre)}</h3>
                <dl class="facts">
                  <dt>Tomo</dt><dd>${tomoLink(b.tomo)}</dd>
                  <dt>Lugar</dt><dd>${lugLink(b.lugar)}</dd>
                  <dt>Bandos</dt><dd>${fmt(b.bandos)}</dd>
                  <dt>Mandos</dt><dd>${fmt(b.mandos)}</dd>
                  <dt>Resultado</dt><dd>${fmt(b.resultado)}</dd>
                  <dt>Consecuencias</dt><dd>${fmt(b.consecuencias)}</dd>
                </dl>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------------------------------------------------- cronología */
  function viewCronologia() {
    let lastTomo = undefined;
    const items = L.cronologia.map(c => {
      let head = '';
      if (c.tomo !== lastTomo) {
        const t = c.tomo ? tomoNum(c.tomo) : null;
        head = `<li class="tl-era" style="display:block">${t ? `Tomo ${t.num} · ${esc(t.titulo)}` : 'Antes de las Grandes Guerras'}</li>`;
        lastTomo = c.tomo;
      }
      return head + `
        <li>
          <span class="t-year">${fmt(c.anio)}</span>
          <div class="t-body">
            <p>${fmt(c.texto)}</p>
            <div class="t-meta">${badge(c.src)}${c.tomo ? tomoLink(c.tomo) : ''}</div>
          </div>
        </li>`;
    }).join('');
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Línea temporal</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Cronología</h1>
          <p>Del encendido del Reactor Oscuro al presente. Las fechas exactas son una propuesta de trabajo: el año 0 es la Batalla de Orion-34.</p>
        </header>
        <ol class="timeline">${items}</ol>
      </div>`;
  }

  /* ---------------------------------------------------- mapa */
  const W = 160, H = 100;
  const px = l => ({ x: l.left / 100 * W, y: l.top / 100 * H });
  function viewMapa(selId) {
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Geografía</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Mapa Galáctico Conceptual</h1>
          <p>Las esferas de influencia tras la Última Gran Guerra. Las posiciones de los siete sistemas originales son las de tu web; el resto se han colocado según su papel en la historia. Pulsa un sistema para ver su ficha.</p>
        </header>
        <div class="map-controls">
          <label for="map-era">Resaltar</label>
          <select id="map-era">
            <option value="">Todos los sistemas</option>
            ${L.tomos.map(t => `<option value="${t.id}">Tomo ${t.num}. ${esc(t.titulo)}</option>`).join('')}
          </select>
        </div>
        <div class="map-layout">
          <div class="map-box">${mapSVG()}</div>
          <aside class="map-panel" id="map-panel" aria-live="polite"></aside>
        </div>
      </div>`;
  }
  function mapSVG() {
    const caps = { rilur: 'rilur-prime', dubitsa: 'dubitsa-prime', vinica: 'vinica-prime', principados: 'union-este', andalus: 'portus' };
    const spheres = Object.entries(caps).map(([fid, lid]) => {
      const f = fac(fid), p = px(lug(lid));
      const r = 7 + f.poder * 0.55;
      return `<circle class="map-sphere" cx="${p.x}" cy="${p.y}" r="${r}" fill="${f.color}" fill-opacity=".1" stroke="${f.color}" stroke-opacity=".45" ${fid === 'andalus' ? 'stroke-dasharray="1 .8"' : ''}/>`;
    }).join('');
    const rings = [14, 28, 42].map(r => `<ellipse class="map-ring" cx="${W / 2}" cy="${H / 2}" rx="${r * 1.55}" ry="${r}"/>`).join('');
    const grid = [];
    for (let x = 20; x < W; x += 20) grid.push(`<line class="map-grid" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
    for (let y = 20; y < H; y += 20) grid.push(`<line class="map-grid" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
    const pts = L.lugares.map(l => {
      const p = px(l);
      const color = l.faccion === 'neutral' ? '#a855f7' : facColor(l.faccion);
      const right = p.x < 128;
      return `
        <g class="map-pt" data-id="${l.id}" tabindex="0" role="button" aria-label="${esc(plain(l.nombre))}">
          <circle class="halo" cx="${p.x}" cy="${p.y}" r="3"/>
          <circle class="core" cx="${p.x}" cy="${p.y}" r="1.4" fill="${color}"/>
          <text x="${right ? p.x + 2.6 : p.x - 2.6}" y="${p.y + .9}" text-anchor="${right ? 'start' : 'end'}">${esc(plain(l.nombre))}</text>
        </g>`;
    }).join('');
    const portus = px(lug('portus')), vac = px(lug('paso-vacio'));
    return `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Mapa galáctico">
        ${grid.join('')}${rings}${spheres}
        <path class="map-route" d="M${portus.x} ${portus.y} L${vac.x} ${vac.y}"/>
        <text class="map-note" x="${W - 2}" y="${vac.y + 4.5}" text-anchor="end">→ galaxia de Andalus</text>
        <text class="map-note" x="2" y="${H - 2}">Esferas: influencia en el presente (68 DO) · línea discontinua = restos dispersos</text>
        ${pts}
      </svg>`;
  }
  function mapPanel(id) {
    const panel = document.getElementById('map-panel');
    if (!panel) return;
    const l = lug(id);
    if (!l) {
      panel.innerHTML = `<p class="label">Leyenda</p>
        ${L.facciones.filter(f => f.id !== 'sintonia').map(f => `<p class="kv"><i class="dot" style="--fc:${f.color}"></i> ${esc(f.nombre)}</p>`).join('')}
        <p class="kv"><i class="dot" style="--fc:#9ca3af"></i> Caballeros de la Sintonía</p>
        <p class="kv"><i class="dot" style="--fc:#a855f7"></i> Neutral / campo de batalla</p>
        <p class="muted" style="font-size:.88rem">Selecciona un sistema en el mapa para ver su historia.</p>`;
      return;
    }
    const bs = L.batallas.filter(b => b.lugar === l.id);
    panel.innerHTML = `
      <p class="label">${fmt(l.tipo)}</p>
      <h3>${fmt(l.nombre)}</h3>
      <div class="chips">${l.faccion !== 'neutral' ? facChip(l.faccion) : `<span class="chip"><i class="dot" style="--fc:#a855f7"></i>${esc(l.afiliacion)}</span>`}${badge(l.src)}</div>
      <p>${fmt(l.texto)}</p>
      ${bs.length ? `<p class="label">Batallas aquí</p><p style="font-size:.9rem">${bs.map(b => batLink(b.id)).join('<br>')}</p>` : ''}`;
    document.querySelectorAll('.map-pt').forEach(g => g.classList.toggle('sel', g.dataset.id === id));
  }
  function mapEra(tid) {
    const t = L.tomos.find(x => x.id === tid);
    document.querySelectorAll('.map-pt').forEach(g => g.classList.toggle('dim', !!t && !t.lugares.includes(g.dataset.id)));
  }

  /* ---------------------------------------------------- glosario */
  function viewGlosario() {
    const items = L.glosario.slice().sort((a, b) => plain(a.t).localeCompare(plain(b.t), 'es'));
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Términos</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Glosario</h1>
          <p>Conceptos, órdenes, tecnologías y tratados del universo.</p>
        </header>
        <dl class="gloss" style="max-width:960px">
          ${items.map(g => `<dt>${fmt(g.t)}${badge(g.src)}</dt><dd>${fmt(g.d)}</dd>`).join('')}
        </dl>
      </div>`;
  }

  /* ---------------------------------------------------- canon */
  function viewCanon() {
    const C = L.canon;
    return `
      <div class="wrap page">
        <header class="sec-head">
          <p class="eyebrow">Registro</p>
          <h1 class="hero-title" style="font-size:var(--step-3)">Registro de canon</h1>
          <p>De dónde sale cada dato, qué decidiste al reconstruir el lore y qué falta por cerrar antes de declarar el canon definitivo.</p>
        </header>
        <div class="canon-grid">
          <section class="fac-sec">
            <h2>Fuentes</h2>
            <dl class="qa">${C.fuentes.map(f => `<div><dt>${esc(f.nombre)}</dt><dd>${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.url)}</a><br>` : ''}${esc(f.nota)}</dd></div>`).join('')}</dl>
          </section>
          <section class="fac-sec">
            <h2>Tus decisiones (2 oct 2026) ${badge('A')}</h2>
            <dl class="qa">${C.decisiones.map(d => `<div><dt>${esc(d.p)}</dt><dd>${esc(d.r)}</dd></div>`).join('')}</dl>
          </section>
          <section class="fac-sec">
            <h2>Propuestas por aprobar ${badge('P')}</h2>
            <p class="muted">Todo lo que inventé para unir las piezas. Cada una puede aprobarse, cambiarse o descartarse.</p>
            <ul class="checklist">${C.propuestas.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          </section>
          <section class="fac-sec">
            <h2>Preguntas abiertas</h2>
            <ul class="checklist" style="--fc:var(--brass)">${C.pendientes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          </section>
          <section class="fac-sec">
            <h2>Exportar</h2>
            <p class="muted">Copia la Biblia completa para guardarla o para usarla en un motor de juego. En tu carpeta también están <span class="mono">BIBLIA_CANON.md</span> y <span class="mono">lore.json</span>.</p>
            <div class="export">
              <button class="btn" id="copy-md">Copiar Biblia en Markdown</button>
              <button class="btn ghost" id="copy-json">Copiar datos en JSON</button>
            </div>
            <p class="toast" id="toast" role="status"></p>
            <div id="fallback"></div>
          </section>
        </div>
      </div>`;
  }
  function copyText(text, what) {
    const toast = document.getElementById('toast');
    const fb = document.getElementById('fallback');
    const done = () => { toast.textContent = what + ' copiado al portapapeles (' + Math.round(text.length / 1024) + ' KB).'; fb.innerHTML = ''; };
    const fail = () => {
      toast.textContent = 'No se pudo copiar automáticamente. Selecciona el texto de abajo y cópialo.';
      fb.innerHTML = '<textarea class="copy-fallback" id="fb-text" readonly></textarea>';
      const ta = document.getElementById('fb-text'); ta.value = text; ta.focus(); ta.select();
    };
    try { navigator.clipboard.writeText(text).then(done, fail); } catch (e) { fail(); }
  }

  /* ---------------------------------------------------- estrellas */
  function drawStars() {
    const c = document.querySelector('.stars');
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = r.width * dpr; c.height = r.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--star').trim() || '231,227,215';
    let s = 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const n = Math.round(r.width * r.height / 2600);
    for (let i = 0; i < n; i++) {
      const x = rnd() * r.width, y = rnd() * r.height, big = rnd() > .94;
      ctx.fillStyle = `rgba(${rgb},${(.15 + rnd() * .5).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, big ? 1.3 : .7, 0, Math.PI * 2); ctx.fill();
    }
    // brazo galáctico tenue a la derecha
    const g = ctx.createRadialGradient(r.width * .82, r.height * .45, 0, r.width * .82, r.height * .45, r.width * .35);
    g.addColorStop(0, `rgba(${rgb},.07)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
  }

  /* ---------------------------------------------------- router */
  const NAV = [['inicio', 'Biblioteca'], ['facciones', 'Facciones'], ['personajes', 'Personajes'], ['batallas', 'Batallas'], ['cronologia', 'Cronología'], ['mapa', 'Mapa'], ['glosario', 'Glosario'], ['canon', 'Canon']];
  function navFor(key) {
    if (key.startsWith('tomo-')) return 'inicio';
    if (key.startsWith('faccion-')) return 'facciones';
    if (key.startsWith('personaje-')) return 'personajes';
    if (key.startsWith('batalla-')) return 'batallas';
    if (key.startsWith('lugar-')) return 'mapa';
    return key;
  }
  let current = null;
  function route() {
    const hash = decodeURIComponent(location.hash.slice(1)) || 'inicio';
    const key = hash.split('.')[0];
    let html = null, after = null, viewKey = key;

    if (key === 'inicio' || key === 'biblioteca') { viewKey = 'inicio'; html = viewHome; after = drawStars; }
    else if (key.startsWith('tomo-')) { const t = L.tomos.find(x => x.id === key); if (t) html = () => viewTomo(t); }
    else if (key === 'facciones') html = viewFacciones;
    else if (key.startsWith('faccion-')) { const f = fac(key.slice(8)); if (f) html = () => viewFaccion(f); }
    else if (key === 'personajes' || key.startsWith('personaje-')) {
      viewKey = 'personajes'; html = viewPersonajes;
      after = () => {
        bindPeople();
        const d = key.startsWith('personaje-') && document.getElementById(key);
        if (d) { d.open = true; d.classList.add('flash'); }
      };
    }
    else if (key === 'batallas' || key.startsWith('batalla-')) {
      viewKey = 'batallas'; html = viewBatallas;
      after = () => { const r = key.startsWith('batalla-') && document.getElementById(key); if (r) r.classList.add('flash'); };
    }
    else if (key === 'cronologia') html = viewCronologia;
    else if (key === 'mapa' || key.startsWith('lugar-')) {
      viewKey = 'mapa'; html = () => viewMapa();
      after = () => { bindMap(); mapPanel(key.startsWith('lugar-') ? key.slice(6) : null); };
    }
    else if (key === 'glosario') html = viewGlosario;
    else if (key === 'canon') {
      html = viewCanon;
      after = () => {
        document.getElementById('copy-md').onclick = () => copyText(L.aMarkdown(new Date().toISOString().slice(0, 10)), 'Markdown');
        document.getElementById('copy-json').onclick = () => copyText(L.aJSON(), 'JSON');
      };
    }
    if (!html) { location.hash = '#inicio'; return; }

    const sameView = current === key && hash.includes('.');
    if (!sameView) {
      app.innerHTML = html();
      if (after) after();
      current = key;
    }
    document.querySelectorAll('.nav a').forEach(a => a.setAttribute('aria-current', a.dataset.k === navFor(viewKey) ? 'page' : 'false'));
    const target = hash.includes('.') ? document.getElementById(hash) : (key.match(/^(personaje|batalla)-/) ? document.getElementById(key) : null);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    else if (!sameView) window.scrollTo(0, 0);
    const t = L.tomos.find(x => x.id === key);
    document.title = (t ? 'Tomo ' + t.num + ' · ' : '') + 'Holocrón Galáctico';
  }

  function bindPeople() {
    const btns = document.querySelectorAll('.toolbar .chip');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      document.querySelectorAll('.person').forEach(p => { p.hidden = !!b.dataset.f && p.dataset.f !== b.dataset.f; });
    }));
  }
  function bindMap() {
    document.querySelectorAll('.map-pt').forEach(g => {
      const go = () => { history.replaceState(null, '', '#lugar-' + g.dataset.id); current = 'lugar-' + g.dataset.id; mapPanel(g.dataset.id); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    const sel = document.getElementById('map-era');
    sel.addEventListener('change', () => mapEra(sel.value));
  }

  /* ---------------------------------------------------- cabecera, tema y propuestas */
  document.getElementById('nav').innerHTML = NAV.map(([k, label]) => `<a href="#${k}" data-k="${k}">${label}</a>`).join('');
  const themeBtn = document.getElementById('theme-btn');
  const THEMES = ['sistema', 'oscuro', 'claro'];
  function applyTheme(t) {
    if (t === 'oscuro') document.documentElement.setAttribute('data-theme', 'dark');
    else if (t === 'claro') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    themeBtn.textContent = 'Tema: ' + t;
    drawStars();
  }
  let theme = store.get('holocron-tema') || 'sistema';
  if (!THEMES.includes(theme)) theme = 'sistema';
  themeBtn.addEventListener('click', () => {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    store.set('holocron-tema', theme);
    applyTheme(theme);
  });
  const propBtn = document.getElementById('prop-btn');
  function applyProp(on) {
    document.documentElement.classList.toggle('hide-prop', !on);
    propBtn.textContent = on ? 'Propuestas: visibles' : 'Propuestas: ocultas';
    propBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  let propOn = store.get('holocron-prop') !== 'no';
  propBtn.addEventListener('click', () => { propOn = !propOn; store.set('holocron-prop', propOn ? 'si' : 'no'); applyProp(propOn); });

  window.addEventListener('hashchange', route);
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(drawStars, 150); });
  applyProp(propOn);
  route();
  applyTheme(theme);
})();
