/* Escenarios procedurales con parallax.
 * Elementos: edificios cairotas (enlucido, celosías, captadores de viento, almenas escalonadas),
 * alminares fatimíes y ayyubíes (sin los añadidos mamelucos posteriores), cúpulas, palmeras,
 * la Ciudadela de Saladino, Bab Zuwayla (sin los alminares de 1415), tiendas militares, río…
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const G = IH.G;

  const F = (IH.Fondos = {});

  // ------------------------------------------------------------------ paletas por hora del día
  F.HORAS = {
    dia: {
      cielo: ['#4d7bab', '#5f8cb8', '#7aa2c6', '#9bbad2', '#bccfd4', '#dcd8c4', '#eedcb6'],
      bruma: '#e4d3b2', sol: '#fff2c8', nube: '#f4ece0', nubeSombra: '#cfc4c0',
      lejos: '#bfa385', enlucidos: ['#d9c19a', '#cfb48c', '#e2cfa8', '#c9a982', '#d8b08c', '#dcc8a4'],
      sombra: '#6a4a3a', luz: null,
    },
    tarde: {
      cielo: ['#2c3a6a', '#4a4a7a', '#7a5a7a', '#b06a6a', '#d88a5a', '#eeaa5e', '#f6c878'],
      bruma: '#e8a874', sol: '#ffe0a0', nube: '#f0b08a', nubeSombra: '#9a6a7a',
      lejos: '#9a6a6a', enlucidos: ['#d8a882', '#cc9a78', '#e0b48c', '#c49070', '#d49a7a', '#d8ac88'],
      sombra: '#4a2a3a', luz: '#ffb070',
    },
    amanecer: {
      cielo: ['#2a3058', '#3e3e66', '#6a5272', '#a0687a', '#d08a7e', '#eab088', '#f4cf9e'],
      bruma: '#e2b4a0', sol: '#fff0c8', nube: '#e8b4a8', nubeSombra: '#8a6a86',
      lejos: '#8a6a7a', enlucidos: ['#c8a890', '#bc9c86', '#d2b49a', '#b8947e', '#c49c88', '#ccac94'],
      sombra: '#3a2a44', luz: '#ffc890',
    },
    noche: {
      cielo: ['#070b1c', '#0b1228', '#101a34', '#16223e', '#1e2c4a', '#283856'],
      bruma: '#2a3656', sol: '#e8eef4', nube: '#2a3452', nubeSombra: '#161c30',
      lejos: '#1c2440', enlucidos: ['#4a5068', '#454a62', '#50566e', '#40465c', '#4a4c64', '#4c526a'],
      sombra: '#0e1020', luz: '#ffb060',
    },
  };

  // ------------------------------------------------------------------ cielo
  F.cielo = function (hora, opc = {}) {
    const H = F.HORAS[hora];
    const lz = IH.lienzo(IH.ANCHO + 8, IH.ALTO);
    const alto = opc.horizonte || 260;
    G.degradado(lz.x, 0, 0, lz.w, alto, H.cielo, { curva: (t) => Math.pow(t, 0.9) });
    lz.x.fillStyle = H.cielo[H.cielo.length - 1];
    lz.x.fillRect(0, alto, lz.w, lz.h - alto);
    const rng = new IH.Azar(opc.semilla || 7);
    if (hora === 'noche') {
      // estrellas
      for (let i = 0; i < 260; i++) {
        const x = rng.entero(0, lz.w), y = Math.floor(Math.pow(rng.sig(), 1.6) * alto * 0.85);
        const b = rng.sig();
        lz.x.fillStyle = b > 0.93 ? '#ffffff' : b > 0.7 ? '#c8d4f0' : '#6a7aa8';
        lz.x.fillRect(x, y, 1, 1);
        if (b > 0.985) {
          lz.x.fillStyle = 'rgba(200,212,240,0.5)';
          lz.x.fillRect(x - 1, y, 3, 1);
          lz.x.fillRect(x, y - 1, 1, 3);
        }
      }
      // vía láctea tenue
      for (let i = 0; i < 900; i++) {
        const t = rng.sig();
        const x = Math.floor(t * lz.w), y = Math.floor(30 + t * 70 + rng.rango(-14, 14) * (1 + Math.sin(t * 9)));
        if (rng.prob(0.5)) {
          lz.x.fillStyle = 'rgba(150,160,200,0.18)';
          lz.x.fillRect(x, y, 1, 1);
        }
      }
      if (opc.luna !== false) {
        const mx = opc.lunaX || 470, my = opc.lunaY || 60;
        lz.x.drawImage(G.brillo(40, '#a8b8e0', 0.35), mx - 40, my - 40);
        G.circulo(lz.x, mx, my, 9, '#e8ecf0');
        G.circulo(lz.x, mx + 4, my - 2, 8, U.mezclar(H.cielo[1], '#e8ecf0', 0.05)); // creciente
        lz.x.fillStyle = '#c8ccd4';
        lz.x.fillRect(mx - 6, my + 2, 2, 1);
        lz.x.fillRect(mx - 4, my - 5, 1, 2);
      }
    } else {
      const sx = opc.solX != null ? opc.solX : 120, sy = opc.solY != null ? opc.solY : hora === 'dia' ? 50 : 210;
      lz.x.drawImage(G.brillo(120, H.sol, 0.5), sx - 120, sy - 120);
      lz.x.drawImage(G.brillo(40, '#ffffff', 0.6), sx - 40, sy - 40);
      G.circulo(lz.x, sx, sy, hora === 'dia' ? 9 : 13, H.sol);
      // nubes
      const n = opc.nubes != null ? opc.nubes : 5;
      for (let i = 0; i < n; i++) F.nube(lz.x, rng.entero(-20, lz.w), rng.entero(20, alto * 0.55), rng.entero(30, 80), H, rng);
    }
    return lz;
  };

  F.nube = function (x, cx, cy, ancho, H, rng) {
    const bolas = [];
    const n = Math.max(3, Math.floor(ancho / 9));
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      bolas.push([cx + (t - 0.5) * ancho, cy - Math.sin(t * Math.PI) * ancho * 0.12 - rng.rango(0, 4), rng.rango(4, 7 + Math.sin(t * Math.PI) * 6)]);
    }
    for (const [bx, by, r] of bolas) G.circulo(x, bx, by + 2, r, H.nubeSombra);
    for (const [bx, by, r] of bolas) G.circulo(x, bx - 1, by, r, H.nube);
    x.fillStyle = H.nubeSombra;
    x.fillRect(Math.round(cx - ancho / 2 - 4), Math.round(cy + 4), Math.round(ancho + 8), 2);
    // alarga en hilachas
    x.fillStyle = U.rgba(H.nube, 0.6);
    x.fillRect(Math.round(cx - ancho * 0.9), Math.round(cy + 6), Math.round(ancho * 1.8), 1);
  };

  // ------------------------------------------------------------------ montes y lejanías
  F.montes = function (x, w, yBase, amp, color, semilla, rugosidad = 0.012) {
    x.fillStyle = color;
    for (let xx = 0; xx < w; xx++) {
      const h = U.fbm(xx * rugosidad, 4, semilla) * amp + U.fbm(xx * rugosidad * 4, 2, semilla + 9) * amp * 0.25;
      x.fillRect(xx, Math.round(yBase - h), 1, Math.round(h) + 200);
    }
    // borde superior iluminado
    x.fillStyle = U.tono(color, 0.12);
    for (let xx = 0; xx < w; xx++) {
      const h = U.fbm(xx * rugosidad, 4, semilla) * amp + U.fbm(xx * rugosidad * 4, 2, semilla + 9) * amp * 0.25;
      x.fillRect(xx, Math.round(yBase - h), 1, 1);
    }
  };

  F.piramide = function (x, cx, base, ancho, color, sombra) {
    const alto = ancho * 0.62;
    for (let yy = 0; yy < alto; yy++) {
      const w = Math.round((1 - yy / alto) * ancho / 2);
      x.fillStyle = color;
      x.fillRect(Math.round(cx - w), Math.round(base - yy), w, 1);
      x.fillStyle = sombra;
      x.fillRect(Math.round(cx), Math.round(base - yy), w, 1);
    }
  };

  // ------------------------------------------------------------------ arquitectura
  F.minarete = function (x, cx, suelo, alto, opc = {}) {
    const c = opc.color || '#d8c4a0';
    const sombra = U.tono(c, -0.22);
    const luz = U.tono(c, 0.12);
    const oscuro = opc.hueco || U.tono(c, -0.55);
    const estilo = opc.estilo || 'mabkhara';
    const w = opc.ancho || 12;
    cx = Math.round(cx);
    const fuste = (y0, y1, ww) => {
      x.fillStyle = c;
      x.fillRect(cx - Math.floor(ww / 2), y0, ww, y1 - y0);
      x.fillStyle = sombra;
      x.fillRect(cx + Math.ceil(ww / 2) - Math.max(1, Math.floor(ww / 4)), y0, Math.max(1, Math.floor(ww / 4)), y1 - y0);
      x.fillStyle = luz;
      x.fillRect(cx - Math.floor(ww / 2), y0, 1, y1 - y0);
    };
    const balcon = (y, ww) => {
      x.fillStyle = sombra;
      x.fillRect(cx - Math.floor(ww / 2) - 2, y, ww + 4, 2);
      x.fillStyle = luz;
      x.fillRect(cx - Math.floor(ww / 2) - 2, y, ww + 4, 1);
      x.fillStyle = c;
      for (let i = -Math.floor(ww / 2) - 2; i < Math.ceil(ww / 2) + 2; i += 2) x.fillRect(cx + i, y - 3, 1, 3);
      x.fillRect(cx - Math.floor(ww / 2) - 2, y - 3, ww + 4, 1);
    };
    if (estilo === 'tulun') {
      // alminar de Ibn Tulun: base cuadrada, cuerpo cilíndrico con escalera exterior en espiral
      const h1 = alto * 0.45, h2 = alto * 0.35;
      fuste(Math.round(suelo - h1), suelo, w + 4);
      const y2 = Math.round(suelo - h1 - h2);
      fuste(y2, Math.round(suelo - h1), w);
      x.fillStyle = sombra;
      for (let yy = y2; yy < suelo - h1; yy += 5) G.linea(x, cx - w / 2, yy + 4, cx + w / 2, yy, sombra);
      fuste(Math.round(y2 - alto * 0.12), y2, w - 4);
      G.semicirculo(x, cx, Math.round(y2 - alto * 0.12), (w - 4) / 2, c, 1.2);
      x.fillStyle = sombra;
      x.fillRect(cx, Math.round(y2 - alto * 0.12 - (w - 4) * 0.6 - 3), 1, 3);
      return;
    }
    const h1 = Math.round(alto * 0.5), h2 = Math.round(alto * 0.28), h3 = Math.round(alto * 0.12);
    fuste(suelo - h1, suelo, w);
    // ventanitas
    x.fillStyle = oscuro;
    for (let yy = suelo - h1 + 6; yy < suelo - 8; yy += 12) x.fillRect(cx - 1, yy, 2, 4);
    balcon(suelo - h1, w);
    const w2 = estilo === 'cilindrico' ? w - 2 : w - 3;
    fuste(suelo - h1 - h2, suelo - h1 - 3, w2);
    x.fillStyle = oscuro;
    x.fillRect(cx - 1, suelo - h1 - h2 + 5, 2, 3);
    balcon(suelo - h1 - h2, w2);
    const w3 = w2 - 3;
    fuste(suelo - h1 - h2 - h3, suelo - h1 - h2 - 3, w3);
    const yTope = suelo - h1 - h2 - h3;
    if (estilo === 'mabkhara') {
      // remate "quemador de incienso" acanalado
      x.fillStyle = c;
      x.fillRect(cx - Math.floor(w3 / 2) - 1, yTope - 3, w3 + 2, 3);
      G.semicirculo(x, cx, yTope - 3, Math.floor(w3 / 2) + 1, c, 1.4);
      x.fillStyle = sombra;
      for (let i = -Math.floor(w3 / 2); i <= Math.floor(w3 / 2); i += 2) x.fillRect(cx + i, yTope - 6, 1, 3);
    } else {
      G.semicirculo(x, cx, yTope, Math.floor(w3 / 2) + 1, c, 1.6);
    }
    x.fillStyle = opc.remate || '#b89a50';
    x.fillRect(cx, yTope - Math.round(w3 * 0.8) - 6, 1, 5);
    x.fillRect(cx - 1, yTope - Math.round(w3 * 0.8) - 4, 3, 2);
  };

  F.cupula = function (x, cx, base, r, opc = {}) {
    const c = opc.color || '#d6c29e';
    const sombra = U.tono(c, -0.2);
    cx = Math.round(cx);
    // tambor
    x.fillStyle = c;
    x.fillRect(cx - r, base - 6, r * 2 + 1, 6);
    x.fillStyle = sombra;
    x.fillRect(cx + Math.floor(r * 0.5), base - 6, Math.ceil(r * 0.5) + 1, 6);
    x.fillStyle = opc.hueco || U.tono(c, -0.5);
    for (let i = -r + 2; i < r - 1; i += 4) x.fillRect(cx + i, base - 5, 1, 3);
    // cúpula apuntada
    const alto = r * 1.25;
    for (let yy = 0; yy < alto; yy++) {
      const t = yy / alto;
      const ww = Math.round(r * Math.sqrt(Math.max(0, 1 - t * t)) * (1 - t * 0.15));
      x.fillStyle = c;
      x.fillRect(cx - ww, base - 6 - yy, ww * 2 + 1, 1);
      x.fillStyle = sombra;
      x.fillRect(cx + Math.floor(ww * 0.35), base - 6 - yy, Math.ceil(ww * 0.65) + 1, 1);
      if (opc.nervios) {
        x.fillStyle = U.tono(c, -0.1);
        for (let k = -2; k <= 2; k++) x.fillRect(cx + Math.round(k * ww * 0.4), base - 6 - yy, 1, 1);
      }
    }
    x.fillStyle = opc.remate || '#b89a50';
    x.fillRect(cx, Math.round(base - 6 - alto - 4), 1, 5);
  };

  F.palmera = function (x, px, suelo, alto, rng, opc = {}) {
    const tronco = opc.tronco || '#6b4a2a';
    const hoja = opc.hoja || '#4a6a2a';
    const hojaL = opc.hojaLuz || '#6f8a3a';
    const curva = rng.rango(-0.25, 0.25);
    let tx = px, ty = suelo;
    const pts = [];
    for (let i = 0; i <= alto; i++) {
      const t = i / alto;
      tx = px + Math.sin(t * 1.6) * curva * alto * 0.5;
      ty = suelo - i;
      pts.push([tx, ty]);
      const w = t < 0.1 ? 4 : 3;
      x.fillStyle = i % 3 === 0 ? U.tono(tronco, -0.25) : tronco;
      x.fillRect(Math.round(tx - w / 2), Math.round(ty), w, 1);
      x.fillStyle = U.tono(tronco, 0.15);
      x.fillRect(Math.round(tx - w / 2), Math.round(ty), 1, 1);
    }
    const [cx, cy] = pts[pts.length - 1];
    // dátiles
    if (opc.datiles !== false) {
      x.fillStyle = opc.datil || '#b0582a';
      x.fillRect(Math.round(cx - 3), Math.round(cy + 1), 3, 3);
      x.fillRect(Math.round(cx + 1), Math.round(cy + 2), 3, 2);
    }
    // frondas
    const n = opc.frondas || 9;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (i / (n - 1) - 0.5) * Math.PI * 1.7 + rng.rango(-0.1, 0.1);
      const largo = alto * rng.rango(0.32, 0.45) + 6;
      let fx = cx, fy = cy;
      for (let j = 0; j < largo; j++) {
        const t = j / largo;
        const caida = t * t * largo * 0.6;
        fx = cx + Math.cos(ang) * j;
        fy = cy + Math.sin(ang) * j + caida;
        x.fillStyle = j % 2 ? hoja : hojaL;
        x.fillRect(Math.round(fx), Math.round(fy), 1, 1);
        if (j % 2 === 0 && t > 0.15) {
          x.fillStyle = hoja;
          x.fillRect(Math.round(fx), Math.round(fy + 1), 1, Math.round(1 + t * 2));
        }
      }
    }
  };

  // Edificio de El Cairo medieval
  F.edificio = function (x, rng, bx, suelo, w, h, opc = {}) {
    const H = opc.H || F.HORAS.dia;
    const base = opc.color || rng.elegir(H.enlucidos);
    const sombra = U.mezclar(base, H.sombra, 0.35);
    const hueco = U.mezclar('#1c120e', H.sombra, 0.3);
    const madera = U.mezclar('#6b4426', H.sombra, opc.lejos ? 0.3 : 0.1);
    bx = Math.round(bx);
    const y0 = Math.round(suelo - h);
    const detalle = opc.detalle != null ? opc.detalle : 1;
    if (detalle >= 1) G.enlucido(x, bx, y0, w, h, base, rng, { densidad: 0.04 });
    else {
      x.fillStyle = base;
      x.fillRect(bx, y0, w, h);
    }
    // zócalo de piedra
    if (detalle >= 1 && rng.prob(0.6)) {
      const zh = rng.entero(6, 12);
      G.silleria(x, bx, suelo - zh, w, zh, U.mezclar('#c2a882', H.sombra, 0.1), '#9a5a44', rng, { alto: 4, largo: 7 });
    }
    // sombra lateral (sol desde la izquierda)
    x.fillStyle = sombra;
    x.fillRect(bx + w - 3, y0, 3, h);
    // pisos
    const alturaPiso = opc.piso || rng.entero(22, 28);
    const pisos = Math.max(1, Math.floor((h - 6) / alturaPiso));
    // remate: almenas escalonadas o pretil liso
    const remate = opc.remate || rng.elegir(['almenas', 'pretil', 'pretil', 'almenas', 'captador']);
    if (remate === 'almenas' || opc.almenas) {
      for (let ax = bx + 1; ax < bx + w - 3; ax += 6) {
        x.fillStyle = base;
        x.fillRect(ax, y0 - 2, 4, 2);
        x.fillRect(ax + 1, y0 - 4, 2, 2);
        x.fillStyle = sombra;
        x.fillRect(ax + 3, y0 - 2, 1, 2);
      }
    } else {
      x.fillStyle = U.tono(base, 0.08);
      x.fillRect(bx, y0 - 2, w, 2);
      x.fillStyle = sombra;
      x.fillRect(bx, y0, w, 1);
    }
    if (remate === 'captador' && w > 24) {
      // malqaf: captador de viento inclinado
      const mx = bx + rng.entero(4, w - 16);
      x.fillStyle = madera;
      x.fillRect(mx, y0 - 9, 10, 9);
      x.fillStyle = U.tono(madera, -0.3);
      x.fillRect(mx + 1, y0 - 8, 8, 6);
      x.fillStyle = madera;
      for (let i = 0; i < 10; i++) x.fillRect(mx + i, y0 - 11 + Math.floor(i / 4), 1, 2);
    }
    // cosas en la azotea
    if (detalle >= 1 && rng.prob(0.5)) {
      const jx = bx + rng.entero(3, w - 8);
      x.fillStyle = '#a8603a';
      x.fillRect(jx, y0 - 5, 4, 5);
      x.fillRect(jx + 1, y0 - 6, 2, 1);
      x.fillStyle = '#7a4024';
      x.fillRect(jx + 3, y0 - 5, 1, 5);
    }
    if (detalle >= 1 && rng.prob(0.25) && w > 30) {
      // ropa tendida
      const lx = bx + rng.entero(2, w - 24);
      x.fillStyle = '#5a4a3a';
      x.fillRect(lx, y0 - 8, 1, 8);
      x.fillRect(lx + 20, y0 - 8, 1, 8);
      x.fillRect(lx, y0 - 8, 21, 1);
      const telas = ['#c84a3a', '#e8e0c8', '#3a6a9a', '#d8a83a'];
      for (let i = 0; i < 3; i++) {
        x.fillStyle = rng.elegir(telas);
        x.fillRect(lx + 2 + i * 6, y0 - 7, 4, rng.entero(4, 6));
      }
    }
    // vigas asomando bajo el remate
    if (rng.prob(0.6)) {
      x.fillStyle = madera;
      for (let vx = bx + 3; vx < bx + w - 4; vx += 5) x.fillRect(vx, y0 + 3, 2, 1);
    }
    // ventanas por piso
    for (let p = 0; p < pisos; p++) {
      const yPiso = suelo - (p + 1) * alturaPiso;
      if (p === 0) continue;
      const n = Math.max(1, Math.floor((w - 8) / 16));
      for (let i = 0; i < n; i++) {
        const vx = bx + 6 + i * Math.floor((w - 10) / n);
        const tipo = rng.sig();
        if (tipo < 0.35 && detalle >= 1) {
          // mashrabiya saliente
          const mw = rng.entero(9, 13), mh = rng.entero(12, 16);
          const my = yPiso + 4;
          G.celosia(x, vx - 1, my, mw, mh, madera, U.tono(madera, -0.45));
          x.fillStyle = U.tono(madera, -0.3);
          x.fillRect(vx - 1 + mw, my + 1, 1, mh);
          x.fillStyle = madera;
          x.fillRect(vx - 2, my - 1, mw + 2, 1);
          x.fillRect(vx, my + mh, 2, 2);
          x.fillRect(vx + mw - 4, my + mh, 2, 2);
          if (opc.luces && rng.prob(0.5)) opc.luces.push({ x: vx + mw / 2, y: my + mh / 2, r: 18, color: '#ffb060', i: 0.6 });
        } else if (tipo < 0.75) {
          // ventana con arco
          G.arco(x, vx + 3, yPiso + 16, 5, 9, hueco, 'apuntado');
          x.fillStyle = U.tono(base, 0.12);
          x.fillRect(vx, yPiso + 16, 7, 1);
          if (opc.luces && rng.prob(0.3)) opc.luces.push({ x: vx + 3, y: yPiso + 11, r: 12, color: '#ffa850', i: 0.5 });
        } else {
          // celosía pequeña
          G.celosia(x, vx, yPiso + 8, 6, 7, madera, U.tono(madera, -0.45));
        }
      }
    }
    // planta baja
    if (opc.planta !== false) {
      const tipo = opc.planta || rng.elegir(['puerta', 'tienda', 'puerta', 'tienda', 'muro']);
      if (tipo === 'puerta' && w > 18) {
        const pw = rng.entero(9, 12), px = bx + rng.entero(4, w - pw - 5);
        G.arco(x, px + pw / 2, suelo, pw + 4, 22, U.tono(base, 0.1), 'apuntado');
        G.arco(x, px + pw / 2, suelo, pw, 19, hueco, 'apuntado');
        x.fillStyle = madera;
        x.fillRect(px + 1, suelo - 15, pw - 2, 15);
        x.fillStyle = U.tono(madera, -0.3);
        x.fillRect(px + Math.floor(pw / 2), suelo - 15, 1, 15);
        x.fillStyle = '#c9a845';
        x.fillRect(px + Math.floor(pw / 2) - 2, suelo - 8, 1, 1);
        x.fillRect(px + Math.floor(pw / 2) + 2, suelo - 8, 1, 1);
        // mastaba (banco de piedra)
        x.fillStyle = U.tono(base, -0.1);
        x.fillRect(px - 8, suelo - 4, 7, 4);
        x.fillStyle = U.tono(base, 0.1);
        x.fillRect(px - 8, suelo - 4, 7, 1);
      } else if (tipo === 'tienda' && w > 24) {
        const tw = Math.min(w - 8, rng.entero(18, 30)), tx = bx + rng.entero(3, w - tw - 4);
        x.fillStyle = hueco;
        x.fillRect(tx, suelo - 20, tw, 20);
        // mercancía en la penumbra
        const cols = ['#c8642a', '#d8a83a', '#8a3a2a', '#6a8a3a', '#e0d0a0', '#3a5a8a'];
        for (let i = 0; i < tw - 2; i += 3) {
          x.fillStyle = U.mezclar(rng.elegir(cols), hueco, 0.45);
          x.fillRect(tx + 1 + i, suelo - 12 - rng.entero(0, 4), 2, rng.entero(3, 6));
        }
        x.fillStyle = madera;
        x.fillRect(tx - 1, suelo - 21, tw + 2, 2);
        x.fillRect(tx - 1, suelo - 21, 2, 21);
        x.fillRect(tx + tw - 1, suelo - 21, 2, 21);
        // toldo de tela a rayas
        if (opc.toldos !== false) F.toldo(x, tx - 3, suelo - 24, tw + 6, rng.elegir(['#b8402a', '#2f5a8a', '#c9a227', '#3f6a3a', '#7a2f4a']), rng);
      }
    }
  };

  F.toldo = function (x, tx, ty, tw, color, rng) {
    tx = Math.round(tx);
    ty = Math.round(ty);
    const claro = '#e8dcc0';
    for (let i = 0; i < tw; i++) {
      const caida = 5 + Math.round(Math.sin((i / tw) * Math.PI) * 1.5);
      x.fillStyle = Math.floor(i / 3) % 2 ? color : claro;
      x.fillRect(tx + i, ty, 1, caida);
      x.fillStyle = U.tono(Math.floor(i / 3) % 2 ? color : claro, -0.25);
      x.fillRect(tx + i, ty + caida, 1, 1);
    }
    x.fillStyle = '#5a3a20';
    x.fillRect(tx, ty - 1, tw, 1);
  };

  // Puerta monumental de Bab Zuwayla (1092): dos torres semicirculares y un arco entre ellas
  F.babZuwayla = function (x, cx, suelo, rng) {
    const piedra = '#cdb38a', sombra = '#9a8060', luz = '#e2cca2';
    const torreW = 44, altoT = 118, hueco = 40;
    for (const lado of [-1, 1]) {
      const tx = Math.round(cx + lado * (hueco / 2 + torreW / 2) - torreW / 2);
      G.silleria(x, tx, suelo - altoT, torreW, altoT, piedra, piedra, rng, { alto: 6, largo: 10, junta: U.tono(piedra, -0.18) });
      // redondez: sombreado
      for (let i = 0; i < torreW; i++) {
        const t = i / (torreW - 1);
        const s = Math.pow(Math.abs(t - 0.32) * 1.4, 2);
        if (s > 0.15) {
          x.fillStyle = U.rgba(sombra, Math.min(0.6, s * 0.6));
          x.fillRect(tx + i, suelo - altoT, 1, altoT);
        }
      }
      x.fillStyle = luz;
      x.fillRect(tx + 8, suelo - altoT, 2, altoT);
      // almenas
      for (let ax = tx; ax < tx + torreW; ax += 7) {
        x.fillStyle = piedra;
        x.fillRect(ax, suelo - altoT - 6, 5, 6);
        x.fillRect(ax + 1, suelo - altoT - 8, 3, 2);
      }
      // saeteras y ventanas
      x.fillStyle = '#2a1e16';
      x.fillRect(tx + 20, suelo - 90, 2, 8);
      x.fillRect(tx + 20, suelo - 60, 2, 8);
      G.arco(x, tx + 21, suelo - 30, 6, 10, '#2a1e16');
      // cornisa
      x.fillStyle = sombra;
      x.fillRect(tx - 1, suelo - 72, torreW + 2, 2);
      x.fillStyle = luz;
      x.fillRect(tx - 1, suelo - 73, torreW + 2, 1);
    }
    // cuerpo central y arco
    const bx = Math.round(cx - hueco / 2);
    G.silleria(x, bx, suelo - altoT + 14, hueco, altoT - 14, U.tono(piedra, -0.04), piedra, rng, { alto: 6, largo: 9 });
    for (let ax = bx; ax < bx + hueco; ax += 7) {
      x.fillStyle = piedra;
      x.fillRect(ax, suelo - altoT + 8, 5, 6);
    }
    G.arco(x, cx, suelo, 30, 52, U.tono(piedra, 0.08), 'herradura');
    G.arco(x, cx, suelo, 24, 48, '#20160f', 'herradura');
    // hojas de la puerta, abiertas
    x.fillStyle = '#5a3a1e';
    x.fillRect(Math.round(cx - 12), suelo - 40, 4, 40);
    x.fillRect(Math.round(cx + 8), suelo - 40, 4, 40);
    x.fillStyle = '#3a2412';
    for (let yy = suelo - 38; yy < suelo; yy += 6) {
      x.fillRect(Math.round(cx - 12), yy, 4, 1);
      x.fillRect(Math.round(cx + 8), yy, 4, 1);
    }
    // inscripción cúfica (banda)
    x.fillStyle = sombra;
    x.fillRect(bx + 2, suelo - 66, hueco - 4, 4);
    x.fillStyle = luz;
    for (let i = bx + 3; i < bx + hueco - 4; i += 2) x.fillRect(i, suelo - 65 + (i % 4 === 0 ? 0 : 1), 1, 2);
  };

  // Ciudadela de Saladino sobre el Muqattam (lejana)
  F.ciudadela = function (x, cx, suelo, esc, color) {
    const sombra = U.tono(color, -0.15);
    const luz = U.tono(color, 0.1);
    const muro = (x0, x1, y, alto) => {
      x.fillStyle = color;
      x.fillRect(Math.round(x0), Math.round(y - alto), Math.round(x1 - x0), Math.round(alto));
      x.fillStyle = luz;
      x.fillRect(Math.round(x0), Math.round(y - alto), Math.round(x1 - x0), 1);
      for (let ax = x0; ax < x1; ax += 3 * esc) {
        x.fillStyle = color;
        x.fillRect(Math.round(ax), Math.round(y - alto - 2 * esc), Math.max(1, Math.round(1.5 * esc)), Math.round(2 * esc));
      }
    };
    const torre = (tx, y, w, alto) => {
      x.fillStyle = color;
      x.fillRect(Math.round(tx - w / 2), Math.round(y - alto), Math.round(w), Math.round(alto));
      x.fillStyle = sombra;
      x.fillRect(Math.round(tx + w / 6), Math.round(y - alto), Math.round(w / 3), Math.round(alto));
      x.fillStyle = luz;
      x.fillRect(Math.round(tx - w / 2), Math.round(y - alto), 1, Math.round(alto));
      for (let ax = tx - w / 2; ax < tx + w / 2; ax += 3 * esc) {
        x.fillStyle = color;
        x.fillRect(Math.round(ax), Math.round(y - alto - 2 * esc), Math.max(1, Math.round(1.5 * esc)), Math.round(2 * esc));
      }
    };
    const W = 150 * esc;
    muro(cx - W / 2, cx + W / 2, suelo, 16 * esc);
    for (let i = 0; i <= 6; i++) torre(cx - W / 2 + (i * W) / 6, suelo, 9 * esc, 22 * esc);
    // recinto alto y palacio
    muro(cx - W * 0.2, cx + W * 0.32, suelo - 16 * esc, 14 * esc);
    torre(cx + W * 0.05, suelo - 16 * esc, 14 * esc, 26 * esc);
    torre(cx - W * 0.15, suelo - 16 * esc, 9 * esc, 20 * esc);
    F.cupula(x, cx + W * 0.22, Math.round(suelo - 30 * esc), Math.round(6 * esc), { color, hueco: sombra });
  };

  // Tienda de campaña militar (redonda, con franjas)
  F.tienda = function (x, cx, suelo, w, h, color, color2, rng, opc = {}) {
    cx = Math.round(cx);
    const sombra = U.tono(color, -0.3);
    for (let yy = 0; yy < h; yy++) {
      const t = yy / h;
      const ww = Math.round((w / 2) * (0.25 + 0.75 * Math.pow(1 - t, 0.7)));
      for (let xx = -ww; xx <= ww; xx++) {
        const franja = Math.floor((xx + w) / 5) % 2 === 0;
        let c = franja && color2 ? color2 : color;
        if (xx > ww * 0.3) c = U.mezclar(c, sombra, 0.6);
        x.fillStyle = c;
        x.fillRect(cx + xx, suelo - yy, 1, 1);
      }
    }
    // puerta
    x.fillStyle = opc.interior || '#2a1a12';
    G.poligono(x, [[cx - 5, suelo], [cx - 1, suelo - Math.round(h * 0.55)], [cx + 3, suelo]], opc.interior || '#2a1a12');
    // mástil y banderín
    x.fillStyle = '#5a3a1e';
    x.fillRect(cx, suelo - h - 8, 1, 9);
    if (opc.bandera) {
      x.fillStyle = opc.bandera;
      x.fillRect(cx + 1, suelo - h - 8, 6, 3);
      x.fillRect(cx + 1, suelo - h - 5, 4, 1);
    }
    // vientos
    x.fillStyle = U.rgba('#c8b890', 0.6);
    G.linea(x, cx - w / 2, suelo - h * 0.3, cx - w / 2 - 6, suelo, U.rgba('#d8c8a0', 0.7));
    G.linea(x, cx + w / 2, suelo - h * 0.3, cx + w / 2 + 6, suelo, U.rgba('#d8c8a0', 0.7));
  };

  F.tiendaCruzada = function (x, cx, suelo, w, h, color, rng) {
    // tienda cónica franca, con banderola
    cx = Math.round(cx);
    for (let yy = 0; yy < h; yy++) {
      const ww = Math.round((w / 2) * (1 - yy / h));
      x.fillStyle = color;
      x.fillRect(cx - ww, suelo - yy, ww * 2 + 1, 1);
      x.fillStyle = U.tono(color, -0.25);
      x.fillRect(cx + Math.floor(ww / 3), suelo - yy, Math.ceil((ww * 2) / 3) + 1, 1);
    }
    x.fillStyle = '#2a1a12';
    G.poligono(x, [[cx - 3, suelo], [cx, suelo - Math.round(h * 0.45)], [cx + 3, suelo]], '#2a1a12');
    x.fillStyle = '#5a3a1e';
    x.fillRect(cx, suelo - h - 6, 1, 7);
  };

  F.junco = function (x, px, suelo, alto, rng, color = '#5a6a2a') {
    const n = rng.entero(3, 6);
    for (let i = 0; i < n; i++) {
      const h = alto * rng.rango(0.5, 1);
      const inc = rng.rango(-0.3, 0.3);
      for (let j = 0; j < h; j++) {
        x.fillStyle = j > h - 3 ? U.tono(color, -0.2) : j % 5 === 0 ? U.tono(color, 0.15) : color;
        x.fillRect(Math.round(px + i * 2 + inc * j), Math.round(suelo - j), 1, 1);
      }
      if (rng.prob(0.5)) {
        x.fillStyle = '#7a5a2a';
        x.fillRect(Math.round(px + i * 2 + inc * h), Math.round(suelo - h - 3), 1, 4);
      }
    }
  };

  // Suelo de una calle (tierra batida con piedras y paja)
  F.sueloCalle = function (x, x0, w, suelo, alto, rng, H, opc = {}) {
    const base = opc.color || U.mezclar('#a88a62', H.sombra, opc.oscuro || 0.05);
    G.degradado(x, x0, suelo, w, alto, [U.tono(base, 0.08), base, U.tono(base, -0.12), U.tono(base, -0.25), U.tono(base, -0.38)]);
    // borde
    x.fillStyle = U.tono(base, 0.18);
    x.fillRect(x0, suelo, w, 1);
    x.fillStyle = U.tono(base, -0.15);
    x.fillRect(x0, suelo + 1, w, 1);
    const n = Math.floor(w * alto * 0.012);
    for (let i = 0; i < n; i++) {
      const px = x0 + rng.entero(0, w - 1), py = suelo + 3 + Math.floor(Math.pow(rng.sig(), 1.4) * (alto - 4));
      const t = rng.sig();
      if (t < 0.4) {
        x.fillStyle = U.tono(base, -0.2);
        x.fillRect(px, py, rng.entero(1, 3), 1);
      } else if (t < 0.65) {
        x.fillStyle = U.tono(base, 0.12);
        x.fillRect(px, py, 2, 1);
        x.fillStyle = U.tono(base, -0.25);
        x.fillRect(px, py + 1, 2, 1);
      } else if (t < 0.8 && opc.paja !== false) {
        x.fillStyle = '#c8a860';
        x.fillRect(px, py, rng.entero(2, 4), 1);
      }
    }
    if (opc.adoquines) {
      for (let yy = suelo + 2; yy < suelo + alto; yy += 4) {
        for (let xx = x0 + ((yy / 4) % 2) * 3; xx < x0 + w; xx += 7) {
          x.fillStyle = U.tono(base, rng.rango(-0.05, 0.08));
          x.fillRect(xx, yy, 6, 3);
          x.fillStyle = U.tono(base, -0.3);
          x.fillRect(xx, yy + 3, 6, 1);
        }
      }
    }
  };

  // ------------------------------------------------------------------ construcción de escenas
  function capa(w, factor, fy = 0) {
    return { lz: IH.lienzo(w, IH.ALTO), factor, fy, delante: false };
  }
  function anchoCapa(anchoNivel, factor) {
    return Math.ceil(IH.ANCHO + (anchoNivel - IH.ANCHO) * factor + 16);
  }

  // Horizonte urbano lejano: siluetas con alminares y cúpulas
  function horizonteUrbano(lz, rng, suelo, H, opc) {
    const x = lz.x;
    let bx = -10;
    while (bx < lz.w) {
      const w = rng.entero(14, 34);
      const h = rng.entero(opc.hMin || 14, opc.hMax || 34);
      F.edificio(x, rng, bx, suelo, w, h, { H, detalle: 0, color: rng.elegir(opc.colores), planta: false, remate: rng.elegir(['almenas', 'pretil']) });
      if (rng.prob(opc.pMinarete || 0.12)) F.minarete(x, bx + w / 2, suelo - h + 2, rng.entero(opc.minMin || 40, opc.minMax || 70), { color: rng.elegir(opc.colores), estilo: rng.elegir(['mabkhara', 'mabkhara', 'cilindrico']), ancho: rng.entero(7, 10) });
      else if (rng.prob(opc.pCupula || 0.12)) F.cupula(x, bx + w / 2, suelo - h, rng.entero(5, 9), { color: rng.elegir(opc.colores) });
      else if (rng.prob(0.15)) F.palmera(x, bx + w + 2, suelo, rng.entero(18, 30), rng, { hoja: U.mezclar('#4a6a2a', opc.colores[0], 0.4), hojaLuz: U.mezclar('#6f8a3a', opc.colores[0], 0.4), tronco: U.mezclar('#6b4a2a', opc.colores[0], 0.4), datiles: false });
      bx += w + rng.entero(-4, 3);
    }
    x.fillStyle = opc.colores[0];
    x.fillRect(0, suelo, lz.w, IH.ALTO - suelo);
  }

  F.construir = function (nombre, ancho, opc = {}) {
    const fn = ESCENAS[nombre];
    if (!fn) throw new Error('Fondo desconocido ' + nombre);
    const t0 = performance.now();
    const r = fn(ancho, opc);
    if (IH.DEPURAR) console.log('fondo', nombre, Math.round(performance.now() - t0) + ' ms');
    return r;
  };

  const ESCENAS = {};

  // ---- calles de El Cairo cerca de Bab Zuwayla
  ESCENAS.cairo = function (W, opc) {
    const hora = opc.hora || 'dia';
    const H = F.HORAS[hora];
    const rng = new IH.Azar(opc.semilla || 1249);
    const suelo = opc.suelo || 300;
    const capas = [];
    const luces = [];
    const cielo = { lz: F.cielo(hora, { solX: 150, nubes: 6 }), factor: 0, fy: 0 };
    capas.push(cielo);

    // montes del Muqattam y la Ciudadela
    const c1 = capa(anchoCapa(W, 0.06), 0.06);
    F.montes(c1.lz.x, c1.lz.w, 228, 40, U.mezclar(H.lejos, H.bruma, 0.35), 3, 0.01);
    F.ciudadela(c1.lz.x, Math.min(c1.lz.w - 100, 420), 196, 1, U.mezclar(H.lejos, H.bruma, 0.2));
    G.niebla(c1.lz, H.bruma, 150, 240, 0.0, 0.5);
    capas.push(c1);

    // ciudad lejana
    const c2 = capa(anchoCapa(W, 0.18), 0.18);
    const colL = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.55));
    horizonteUrbano(c2.lz, rng, 236, H, { colores: colL, hMin: 10, hMax: 26, pMinarete: 0.1, minMin: 45, minMax: 70 });
    F.minarete(c2.lz.x, 120, 230, 78, { color: colL[0], estilo: 'tulun', ancho: 14 });
    G.niebla(c2.lz, H.bruma, 170, 250, 0.15, 0.45);
    capas.push(c2);

    // ciudad media
    const c3 = capa(anchoCapa(W, 0.42), 0.42);
    const colM = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.3));
    horizonteUrbano(c3.lz, rng, 262, H, { colores: colM, hMin: 24, hMax: 56, pMinarete: 0.09, pCupula: 0.14, minMin: 60, minMax: 95 });
    G.niebla(c3.lz, H.bruma, 200, 270, 0.0, 0.3);
    capas.push(c3);

    // calle (plano de juego)
    const c4 = capa(W, 1);
    const x = c4.lz.x;
    let bx = -4;
    const zonaPuerta = opc.babZuwayla != null ? opc.babZuwayla : -1000;
    while (bx < W) {
      if (Math.abs(bx + 20 - zonaPuerta) < 110) {
        bx = zonaPuerta + 110;
        continue;
      }
      const w = rng.entero(44, 86);
      const h = rng.entero(70, 140);
      F.edificio(x, rng, bx, suelo, w, h, { H, luces: hora === 'noche' || hora === 'tarde' ? luces : null });
      bx += w;
    }
    if (zonaPuerta > 0) F.babZuwayla(x, zonaPuerta, suelo, rng);
    F.sueloCalle(x, 0, W, suelo, IH.ALTO - suelo, rng, H, { adoquines: false });
    capas.push(c4);

    // primer plano: farolillos, telas y vigas que cuelgan por arriba y tinajas por abajo
    const c5 = capa(anchoCapa(W, 1.35), 1.35);
    c5.delante = true;
    const xf = c5.lz.x;
    const oscuroF = U.mezclar('#2a1a14', H.sombra, 0.3);
    for (let px = 260; px < c5.lz.w; px += rng.entero(300, 520)) {
      const tipo = rng.sig();
      if (tipo < 0.4) {
        // viga con telas tendidas
        xf.fillStyle = oscuroF;
        xf.fillRect(px - 40, 0, 150, 6);
        for (let k = 0; k < 4; k++) {
          const col = U.mezclar(rng.elegir(['#8a2a2a', '#2a4a7a', '#8a6a1a', '#3f5a2a', '#6a2a4a']), '#000', 0.4);
          const tx = px - 30 + k * 34, tw = rng.entero(18, 26), th = rng.entero(26, 44);
          for (let i = 0; i < tw; i++) {
            xf.fillStyle = i % 5 < 3 ? col : U.tono(col, -0.15);
            xf.fillRect(tx + i, 6, 1, th + Math.round(Math.sin((i / tw) * Math.PI) * 4));
          }
        }
      } else if (tipo < 0.75) {
        // farolillo colgado de una cadena
        xf.fillStyle = oscuroF;
        xf.fillRect(px, 0, 1, 40);
        xf.fillRect(px - 5, 40, 11, 3);
        xf.fillRect(px - 4, 43, 9, 12);
        xf.fillStyle = U.mezclar('#c88a3a', '#000', 0.45);
        for (let k = 0; k < 3; k++) xf.fillRect(px - 3 + k * 3, 45, 1, 8);
        xf.fillStyle = oscuroF;
        xf.fillRect(px - 2, 55, 5, 3);
      } else {
        // tinajas y cestas en primer plano (abajo)
        const base = IH.ALTO + 6;
        for (let k = 0; k < 3; k++) {
          const tx = px + k * 22, th = rng.entero(20, 30);
          G.circulo(xf, tx, base - th * 0.45, th * 0.45, U.mezclar('#5a2e1a', '#000', 0.35));
          xf.fillStyle = U.mezclar('#4a2414', '#000', 0.35);
          xf.fillRect(tx - 4, base - th - 2, 9, 6);
        }
      }
    }
    capas.push(c5);
    return { capas, luces, suelo, hora };
  };

  // ---- el maydan bajo la Ciudadela
  ESCENAS.maydan = function (W, opc) {
    const hora = opc.hora || 'dia';
    const H = F.HORAS[hora];
    const rng = new IH.Azar(opc.semilla || 1250);
    const suelo = 300;
    const capas = [{ lz: F.cielo(hora, { solX: 520, solY: 70, nubes: 4 }), factor: 0, fy: 0 }];
    const c1 = capa(anchoCapa(W, 0.12), 0.12);
    F.montes(c1.lz.x, c1.lz.w, 210, 70, U.mezclar(H.lejos, H.bruma, 0.15), 5, 0.008);
    F.ciudadela(c1.lz.x, c1.lz.w * 0.5, 150, 1.7, U.mezclar('#c9ad86', H.bruma, 0.15));
    G.niebla(c1.lz, H.bruma, 140, 240, 0.0, 0.45);
    capas.push(c1);
    const c2 = capa(anchoCapa(W, 0.35), 0.35);
    const colM = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.35));
    horizonteUrbano(c2.lz, rng, 252, H, { colores: colM, hMin: 14, hMax: 34, pMinarete: 0.06 });
    G.niebla(c2.lz, H.bruma, 200, 260, 0.1, 0.3);
    capas.push(c2);
    const c3 = capa(anchoCapa(W, 0.7), 0.7);
    // muro del maydan, palmeras y tiendas
    const x3 = c3.lz.x;
    G.silleria(x3, 0, 248, c3.lz.w, 30, U.mezclar('#c8ae86', H.bruma, 0.15), '#c8ae86', rng, { alto: 5, largo: 9 });
    for (let ax = 0; ax < c3.lz.w; ax += 8) {
      x3.fillStyle = U.mezclar('#c8ae86', H.bruma, 0.15);
      x3.fillRect(ax, 244, 5, 4);
    }
    for (let px = 40; px < c3.lz.w; px += rng.entero(60, 120)) F.palmera(x3, px, 250, rng.entero(40, 62), rng);
    for (let px = 90; px < c3.lz.w; px += rng.entero(160, 260)) F.tienda(x3, px, 278, 40, 26, '#e0d4b4', '#b8402a', rng, { bandera: '#d9a521' });
    x3.fillStyle = U.mezclar('#c8ae86', H.bruma, 0.15);
    x3.fillRect(0, 278, c3.lz.w, 82);
    capas.push(c3);
    const c4 = capa(W, 1);
    F.sueloCalle(c4.lz.x, 0, W, suelo, 60, rng, H, { color: '#c8a874', paja: false });
    // huellas de cascos
    for (let i = 0; i < W / 4; i++) {
      c4.lz.x.fillStyle = U.tono('#c8a874', -0.18);
      c4.lz.x.fillRect(rng.entero(0, W), rng.entero(304, 340), 2, 1);
    }
    capas.push(c4);
    return { capas, luces: [], suelo, hora };
  };

  // ---- campamento de Mansura junto al Bahr al-Saghir (noche)
  ESCENAS.campamento = function (W, opc) {
    const hora = opc.hora || 'noche';
    const H = F.HORAS[hora];
    const rng = new IH.Azar(opc.semilla || 1302);
    const suelo = 300;
    const luces = [];
    const capas = [{ lz: F.cielo(hora, { lunaX: 500, lunaY: 50 }), factor: 0, fy: 0 }];
    // orilla franca al otro lado del canal, con hogueras
    const c1 = capa(anchoCapa(W, 0.15), 0.15);
    const x1 = c1.lz.x;
    F.montes(x1, c1.lz.w, 236, 8, '#141a30', 11, 0.02);
    for (let px = 10; px < c1.lz.w; px += rng.entero(12, 26)) F.tiendaCruzada(x1, px, 234, rng.entero(8, 14), rng.entero(8, 14), rng.elegir(['#2a3048', '#30344c', '#3a3248']), rng);
    for (let px = 20; px < c1.lz.w; px += rng.entero(30, 70)) {
      x1.drawImage(G.brillo(10, '#ff9a4a', 0.7), px - 10, 224);
      x1.fillStyle = '#ffcf7a';
      x1.fillRect(px, 233, 1, 1);
    }
    capas.push(c1);
    // el canal y los juncos
    const c2 = capa(anchoCapa(W, 0.4), 0.4);
    const x2 = c2.lz.x;
    G.degradado(x2, 0, 238, c2.lz.w, 30, ['#1a2440', '#16203a', '#121a30', '#0e1428']);
    for (let i = 0; i < c2.lz.w; i += 3) {
      x2.fillStyle = rng.prob(0.3) ? '#3a4a6a' : '#22304e';
      x2.fillRect(i, 240 + rng.entero(0, 25), rng.entero(2, 6), 1);
    }
    // reflejo de la luna
    for (let i = 0; i < 14; i++) {
      x2.fillStyle = 'rgba(220,228,240,' + (0.5 - i * 0.03) + ')';
      x2.fillRect(Math.round(c2.lz.w * 0.62 + rng.rango(-6, 6)), 240 + i * 2, rng.entero(3, 8), 1);
    }
    x2.fillStyle = '#0c1220';
    x2.fillRect(0, 266, c2.lz.w, 100);
    for (let px = 0; px < c2.lz.w; px += rng.entero(6, 18)) F.junco(x2, px, 268, rng.entero(10, 22), rng, '#1e2a24');
    capas.push(c2);
    // nuestras tiendas
    const c3 = capa(anchoCapa(W, 0.7), 0.7);
    const x3 = c3.lz.x;
    x3.fillStyle = '#141820';
    x3.fillRect(0, 280, c3.lz.w, 80);
    for (let px = 30; px < c3.lz.w; px += rng.entero(70, 130)) {
      F.tienda(x3, px, 282, rng.entero(36, 50), rng.entero(24, 32), '#4a4a5a', '#5a3a3a', rng, { bandera: '#8a7a2a', interior: '#3a2414' });
      if (rng.prob(0.5)) luces.push({ x: px, y: 272, r: 34, color: '#ff9a4a', i: 0.6, factor: 0.7 });
    }
    for (let px = 60; px < c3.lz.w; px += rng.entero(90, 200)) F.palmera(x3, px, 282, rng.entero(40, 70), rng, { hoja: '#1a2418', hojaLuz: '#222e1e', tronco: '#1e160e', datiles: false });
    capas.push(c3);
    const c4 = capa(W, 1);
    F.sueloCalle(c4.lz.x, 0, W, suelo, 60, rng, H, { color: '#5e5442', paja: false });
    capas.push(c4);
    const c5 = capa(anchoCapa(W, 1.3), 1.3);
    c5.delante = true;
    for (let px = 150; px < c5.lz.w; px += rng.entero(300, 520)) F.junco(c5.lz.x, px, IH.ALTO + 4, rng.entero(40, 70), rng, '#0a0e0c');
    capas.push(c5);
    return { capas, luces, suelo, hora, ambiente: '#7c86ac' };
  };

  // ---- calles de Mansura durante la batalla (amanecer, humo)
  ESCENAS.mansura = function (W, opc) {
    const hora = opc.hora || 'amanecer';
    const H = F.HORAS[hora];
    const rng = new IH.Azar(opc.semilla || 1250);
    const suelo = opc.suelo || 300;
    const luces = [];
    const capas = [{ lz: F.cielo(hora, { solX: 80, solY: 230, nubes: 7 }), factor: 0, fy: 0 }];
    const c1 = capa(anchoCapa(W, 0.1), 0.1);
    const colL = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.6));
    horizonteUrbano(c1.lz, rng, 238, H, { colores: colL, hMin: 8, hMax: 20, pMinarete: 0.05, minMin: 30, minMax: 45 });
    // columnas de humo
    for (let i = 0; i < 6; i++) {
      const sx = rng.entero(20, c1.lz.w - 20);
      for (let j = 0; j < 40; j++) {
        const r = 4 + j * 0.5;
        G.circulo(c1.lz.x, sx + Math.sin(j * 0.3) * 3 + j * 0.6, 230 - j * 4, r, U.rgba('#4a3a44', 0.06 + (40 - j) * 0.004));
      }
    }
    capas.push(c1);
    const c2 = capa(anchoCapa(W, 0.4), 0.4);
    const colM = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.3));
    horizonteUrbano(c2.lz, rng, 262, H, { colores: colM, hMin: 30, hMax: 60, pMinarete: 0.07, pCupula: 0.1, minMin: 60, minMax: 90 });
    G.niebla(c2.lz, H.bruma, 200, 270, 0.0, 0.35);
    capas.push(c2);
    const c3 = capa(W, 1);
    let bx = -4;
    while (bx < W) {
      const w = rng.entero(40, 80);
      const h = rng.entero(80, 150);
      F.edificio(c3.lz.x, rng, bx, suelo, w, h, { H, toldos: rng.prob(0.5) });
      bx += w;
    }
    // marcas de fuego y hollín
    for (let i = 0; i < W / 120; i++) {
      const hx = rng.entero(0, W);
      for (let j = 0; j < 30; j++) {
        c3.lz.x.fillStyle = U.rgba('#1a1010', 0.15);
        G.circulo(c3.lz.x, hx + rng.rango(-8, 8), suelo - 40 - j * 2, rng.rango(3, 8), U.rgba('#1a1010', 0.08));
      }
    }
    F.sueloCalle(c3.lz.x, 0, W, suelo, 60, rng, H, {});
    capas.push(c3);
    const c4 = capa(anchoCapa(W, 1.3), 1.3);
    c4.delante = true;
    for (let px = 200; px < c4.lz.w; px += rng.entero(320, 560)) {
      const xf = c4.lz.x;
      if (rng.prob(0.5)) {
        // viga rota y tela quemada colgando
        xf.fillStyle = '#1a1214';
        xf.fillRect(px - 30, 0, 120, 6);
        G.linea(xf, px + 90, 6, px + 110, 30, '#1a1214');
        G.linea(xf, px + 91, 6, px + 111, 30, '#1a1214');
        for (let i = 0; i < 22; i++) {
          xf.fillStyle = i % 4 < 2 ? '#2a1414' : '#3a1a16';
          xf.fillRect(px + i, 6, 1, 18 + Math.round(Math.sin(i * 1.7) * 6 + (i % 3) * 3));
        }
      } else {
        // escombros en primer plano
        for (let k = 0; k < 6; k++) {
          xf.fillStyle = k % 2 ? '#1a1214' : '#24181a';
          xf.fillRect(px + k * 9 - rng.entero(0, 4), IH.ALTO - rng.entero(6, 18), rng.entero(8, 14), 20);
        }
        G.linea(xf, px - 10, IH.ALTO, px + 26, IH.ALTO - 34, '#1a1214');
        G.linea(xf, px - 9, IH.ALTO, px + 27, IH.ALTO - 34, '#1a1214');
      }
    }
    capas.push(c4);
    return { capas, luces, suelo, hora };
  };

  // ---- interior de la forja de Ibrahim
  ESCENAS.forja = function (W, opc) {
    const noche = opc.hora === 'noche';
    const rng = new IH.Azar(77);
    const suelo = 300;
    const capas = [];
    const luces = [];
    // exterior visible por la puerta y la ventana (calle)
    const fuera = { lz: F.cielo(noche ? 'noche' : 'dia', { solX: 300, nubes: 3 }), factor: 0, fy: 0 };
    capas.push(fuera);
    const c1 = capa(W, 1);
    const x = c1.lz.x;
    const muro = noche ? '#5a4a44' : '#8a6e58';
    // pared del fondo de adobe y piedra
    G.enlucido(x, 0, 0, W, suelo, muro, rng, { densidad: 0.07, grietas: 30 });
    G.silleria(x, 0, suelo - 36, W, 36, U.tono(muro, -0.06), U.tono(muro, -0.12), rng, { alto: 6, largo: 11 });
    // vigas del techo
    x.fillStyle = '#3a2618';
    x.fillRect(0, 0, W, 14);
    for (let vx = 10; vx < W; vx += 46) {
      x.fillStyle = '#4a3020';
      x.fillRect(vx, 0, 10, 20);
      x.fillStyle = '#2a1a10';
      x.fillRect(vx + 8, 0, 2, 20);
    }
    // hollín sobre la fragua
    const fx = opc.fragua || 200;
    for (let j = 0; j < 160; j++) {
      G.circulo(x, fx + rng.rango(-30, 30), rng.rango(10, 170), rng.rango(4, 14), 'rgba(20,12,10,0.05)');
    }
    // ventana con celosía (luz de la calle)
    const vx = opc.ventana || 470;
    x.clearRect(vx, 120, 40, 50);
    G.arco(x, vx + 20, 172, 46, 52, U.tono(muro, 0.15), 'apuntado');
    x.save();
    x.globalCompositeOperation = 'destination-out';
    G.arco(x, vx + 20, 170, 40, 48, '#000', 'apuntado');
    x.restore();
    // la celosía se dibuja como capa delantera de la ventana
    for (let yy = 124; yy < 170; yy++) for (let xx = vx; xx < vx + 40; xx++) if ((xx + yy) % 5 === 0 || (xx - yy + 500) % 5 === 0) {
      x.fillStyle = '#3a2416';
      x.fillRect(xx, yy, 1, 1);
    }
    luces.push({ x: vx + 20, y: 160, r: 110, color: noche ? '#6a7ab0' : '#ffe8b0', i: noche ? 0.35 : 0.8 });
    // puerta a la calle (derecha)
    const px = W - 70;
    x.save();
    x.globalCompositeOperation = 'destination-out';
    G.arco(x, px + 22, suelo, 40, 78, '#000', 'apuntado');
    x.restore();
    x.fillStyle = '#4a2c18';
    x.fillRect(px - 2, suelo - 82, 4, 82);
    x.fillRect(px + 40, suelo - 82, 4, 82);
    luces.push({ x: px + 22, y: suelo - 40, r: 130, color: noche ? '#5a6aa0' : '#ffe2a8', i: noche ? 0.3 : 0.9 });
    // estantes con herramientas
    const ex = opc.estante || 330;
    x.fillStyle = '#4a3020';
    x.fillRect(ex, 150, 80, 3);
    x.fillRect(ex, 190, 80, 3);
    for (let i = 0; i < 6; i++) {
      // tenazas y martillos colgados
      const hx = ex + 6 + i * 13;
      x.fillStyle = '#3a3c40';
      x.fillRect(hx, 153, 1, 22);
      x.fillRect(hx + 2, 153, 1, 20);
      x.fillStyle = '#5a5e64';
      x.fillRect(hx - 1, 172 + (i % 2) * 2, 5, 3);
    }
    for (let i = 0; i < 5; i++) {
      x.fillStyle = rng.elegir(['#7a4a2a', '#5a5e64', '#8a6a3a']);
      x.fillRect(ex + 4 + i * 15, 182, 10, 8);
    }
    // espadas en un armero
    const ax = opc.armero || 90;
    x.fillStyle = '#4a3020';
    x.fillRect(ax, 200, 50, 3);
    x.fillRect(ax, 250, 50, 3);
    for (let i = 0; i < 5; i++) {
      const sx = ax + 6 + i * 9;
      x.fillStyle = '#c8ccd0';
      x.fillRect(sx, 196, 2, 50);
      x.fillStyle = '#e8ecf0';
      x.fillRect(sx, 196, 1, 50);
      x.fillStyle = '#b8902f';
      x.fillRect(sx - 2, 244, 6, 2);
      x.fillStyle = '#3b2416';
      x.fillRect(sx, 246, 2, 6);
    }
    // suelo de tierra apisonada con ceniza
    F.sueloCalle(x, 0, W, suelo, 60, rng, F.HORAS.dia, { color: '#5a4636', paja: false });
    for (let i = 0; i < 120; i++) {
      x.fillStyle = 'rgba(30,20,16,0.4)';
      x.fillRect(fx + rng.rango(-50, 50), suelo + rng.entero(1, 10), rng.entero(1, 3), 1);
    }
    capas.push(c1);
    const c2 = capa(anchoCapa(W, 1.2), 1.2);
    c2.delante = true;
    c2.lz.x.fillStyle = '#140c08';
    c2.lz.x.fillRect(0, 0, c2.lz.w, 8);
    for (let vx = 30; vx < c2.lz.w; vx += 70) {
      c2.lz.x.fillRect(vx, 8, 6, 5);
    }
    capas.push(c2);
    return { capas, luces, suelo, hora: noche ? 'noche' : 'dia', ambiente: noche ? '#3a3448' : '#8e7c78' };
  };
})();
