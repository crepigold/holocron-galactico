/* Láminas de las cinemáticas: ilustraciones de pixel art animadas sobre las que la cámara
 * hace paneos lentos. Cada lámina: construir() (partes estáticas), actualizar(), dibujar() y,
 * opcionalmente, dibujarUI() para rótulos nítidos en alta resolución (p. ej. el mapa).
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const G = IH.G;
  const F = IH.Fondos;
  const L = (IH.LAMINAS = IH.LAMINAS || {});

  function R(x, a, b, w, h, c) {
    x.fillStyle = c;
    x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h));
  }
  function poli(x, pts, c) {
    x.fillStyle = c;
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
    x.closePath();
    x.fill();
  }
  // Convierte coordenadas de la lámina a la interfaz (1920×1080)
  function aUI(cine, px, py) {
    const c = cine._camF || { x: 0, y: 0 };
    return [(px - c.x) * 3, (py - c.y) * 3];
  }

  // ================================================================== barcos, jinetes, camellos
  // Coca o galera cruzada vista de lado (escala 1 ≈ 60 px de largo)
  function barco(x, cx, cy, e, opc = {}) {
    const casco = opc.casco || '#4a2e1a', cascoL = U.tono(casco, 0.18), cascoS = U.tono(casco, -0.3);
    const vela = opc.vela || '#e8dcc0';
    const L2 = 30 * e;
    // casco
    poli(x, [[cx - L2, cy - 8 * e], [cx + L2, cy - 8 * e], [cx + L2 * 0.82, cy + 2 * e], [cx - L2 * 0.8, cy + 2 * e]], casco);
    R(x, cx - L2, cy - 8 * e, L2 * 2, Math.max(1, e), cascoL);
    for (let i = 1; i < 3; i++) R(x, cx - L2 * 0.9, cy - 8 * e + i * 3 * e, L2 * 1.8, Math.max(1, e * 0.5), cascoS);
    // castillos de proa y popa
    R(x, cx - L2 - 2 * e, cy - 14 * e, 12 * e, 6 * e, casco);
    R(x, cx + L2 - 9 * e, cy - 13 * e, 11 * e, 5 * e, casco);
    R(x, cx - L2 - 2 * e, cy - 14 * e, 12 * e, Math.max(1, e * 0.6), cascoL);
    if (opc.escudos) for (let i = 0; i < 6; i++) R(x, cx - L2 * 0.6 + i * 7 * e, cy - 10 * e, 4 * e, 3 * e, i % 2 ? '#8c2a2a' : '#d9c14a');
    // mástil y vela
    const alto = 46 * e;
    R(x, cx - e * 0.5, cy - 8 * e - alto, Math.max(1, e), alto, '#3a2414');
    const inflar = opc.inflar || 0;
    const vw = 22 * e, vh = 26 * e;
    const vy = cy - 8 * e - alto + 4 * e;
    poli(x, [[cx - vw / 2, vy], [cx + vw / 2, vy], [cx + vw / 2 + inflar * e, vy + vh * 0.5], [cx + vw / 2, vy + vh], [cx - vw / 2, vy + vh], [cx - vw / 2 + inflar * e, vy + vh * 0.5]], vela);
    R(x, cx + vw * 0.2, vy, vw * 0.3, vh, U.rgba('#000000', 0.08));
    if (opc.cruz !== false) {
      const c = opc.colorCruz || '#b3262a';
      R(x, cx - e, vy + 4 * e, 2.4 * e, vh - 8 * e, c);
      R(x, cx - 7 * e, vy + vh * 0.38, 14 * e, 2.4 * e, c);
    }
    R(x, cx - vw / 2 - e, vy - e, vw + 2 * e, Math.max(1, e), '#3a2414');
    // gallardete
    if (opc.banderola !== false) {
      const t = opc.t || 0;
      for (let i = 0; i < 8 * e; i++) R(x, cx + i, cy - 8 * e - alto - 2 * e + Math.round(Math.sin(t * 5 + i * 0.4) * e), 1, Math.max(1, 2 * e - i * 0.15), opc.colorBandera || '#b3262a');
    }
  }

  // Faluca del Nilo con vela latina
  function faluca(x, cx, cy, e, opc = {}) {
    poli(x, [[cx - 16 * e, cy - 3 * e], [cx + 18 * e, cy - 4 * e], [cx + 12 * e, cy + 2 * e], [cx - 12 * e, cy + 2 * e]], opc.casco || '#5a3a22');
    R(x, cx, cy - 30 * e, Math.max(1, e * 0.7), 27 * e, '#3a2414');
    poli(x, [[cx - 14 * e, cy - 6 * e], [cx + 2 * e, cy - 38 * e], [cx + 8 * e, cy - 6 * e]], opc.vela || '#efe6d0');
    poli(x, [[cx + 2 * e, cy - 38 * e], [cx + 8 * e, cy - 6 * e], [cx + 3 * e, cy - 6 * e]], U.tono(opc.vela || '#efe6d0', -0.15));
    G.linea(x, cx - 15 * e, cy - 5 * e, cx + 3 * e, cy - 40 * e, '#3a2414');
  }

  // Jinete (silueta o color) a caballo
  function jinete(x, cx, cy, e, opc = {}) {
    const c = opc.color || '#141018';
    const t = opc.t || 0;
    const fase = opc.fase || 0;
    const galope = opc.galope ? Math.sin(t * 10 + fase) : Math.sin(t * 2 + fase) * 0.3;
    const d = opc.dir || 1;
    x.save();
    x.translate(Math.round(cx), Math.round(cy));
    x.scale(d * e, e);
    // caballo
    poli(x, [[-14, -18], [10, -19], [14, -16], [12, -10], [-14, -9], [-17, -13]], c);
    poli(x, [[9, -18], [14, -30], [19, -31], [22, -27], [17, -24], [13, -14]], c);
    for (const [lx, ph] of [[-12, 0], [-8, 1.5], [7, 2], [10, 0.5]]) {
      const a = Math.sin(t * (opc.galope ? 10 : 2) + fase + ph) * (opc.galope ? 0.5 : 0.08);
      x.fillStyle = c;
      x.save();
      x.translate(lx, -10);
      x.rotate(a);
      x.fillRect(-1, 0, 2.2, 10);
      x.restore();
    }
    poli(x, [[-16, -15], [-21, -6 + galope], [-18, -6 + galope], [-14, -13]], c);
    // jinete
    poli(x, [[-4, -18], [4, -18], [3, -30], [-3, -30]], c);
    R(x, -3, -36, 6, 6, c);
    if (opc.casco === 'conico') poli(x, [[-3, -36], [0, -41], [3, -36]], c);
    if (opc.casco === 'yelmo') R(x, -3.5, -37, 7, 7, c);
    if (opc.lanza) {
      x.fillStyle = opc.colorLanza || c;
      x.save();
      x.translate(2, -26);
      x.rotate(opc.lanzaAng != null ? opc.lanzaAng : -1.2);
      x.fillRect(0, -0.5, 34, 1);
      if (opc.banderin) {
        x.fillStyle = opc.banderin;
        x.fillRect(26, -0.5, 6, 3 + Math.sin(t * 6 + fase));
      }
      x.restore();
    }
    if (opc.tug) {
      // estandarte mongol de colas de caballo
      R(x, -2, -60, 1, 30, c);
      for (let i = 0; i < 5; i++) R(x, -4 + i * 1.5, -58 + Math.sin(t * 4 + i) * 1.5, 1, 9 + i % 2 * 3, c);
    }
    x.restore();
  }

  function camello(x, cx, cy, e, opc = {}) {
    const c = opc.color || '#2a1a14';
    const t = opc.t || 0, fase = opc.fase || 0;
    x.save();
    x.translate(Math.round(cx), Math.round(cy));
    x.scale((opc.dir || 1) * e, e);
    poli(x, [[-14, -22], [-8, -30], [-2, -24], [4, -30], [10, -22], [10, -16], [-14, -16]], c);
    poli(x, [[9, -20], [16, -30], [20, -30], [21, -27], [17, -26], [12, -16]], c);
    for (const [lx, ph] of [[-12, 0], [-8, 1.6], [6, 2.2], [9, 0.6]]) {
      const a = Math.sin(t * 3 + fase + ph) * 0.25;
      x.save();
      x.translate(lx, -16);
      x.rotate(a);
      x.fillStyle = c;
      x.fillRect(-1, 0, 2, 16);
      x.restore();
    }
    if (opc.carga) R(x, -10, -34, 12, 6, opc.carga);
    x.restore();
  }

  // ================================================================== EL CRONISTA (escritorio de noche)
  L.escritorio = {
    ancho: 660, alto: 360,
    construir() {
      const lz = IH.lienzo(this.ancho, this.alto);
      const x = lz.x;
      const rng = new IH.Azar(1300);
      G.degradado(x, 0, 0, this.ancho, 190, ['#140e10', '#1a1214', '#20161a', '#261a1c', '#2c1e1e']);
      for (let i = 0; i < 900; i++) R(x, rng.entero(0, this.ancho), rng.entero(0, 188), 1, 1, rng.prob(0.5) ? '#2e2224' : '#1a1012');
      // ventana con arco: noche sobre El Cairo
      const vx = 470, vy = 26, vw = 92, vh = 128;
      x.save();
      x.beginPath();
      x.moveTo(vx, vy + vh);
      x.lineTo(vx, vy + 40);
      x.quadraticCurveTo(vx, vy, vx + vw / 2, vy - 6);
      x.quadraticCurveTo(vx + vw, vy, vx + vw, vy + 40);
      x.lineTo(vx + vw, vy + vh);
      x.closePath();
      x.clip();
      G.degradado(x, vx, vy - 8, vw, vh + 8, ['#0a0f22', '#0f1630', '#18223e', '#24304e']);
      for (let i = 0; i < 40; i++) R(x, vx + rng.entero(0, vw), vy + rng.entero(0, 80), 1, 1, rng.prob(0.3) ? '#ffffff' : '#8a9ac8');
      G.circulo(x, vx + 62, vy + 26, 7, '#e8ecf0');
      G.circulo(x, vx + 65, vy + 24, 6, '#0f1630');
      // siluetas de la ciudad
      x.fillStyle = '#080a14';
      x.fillRect(vx, vy + 104, vw, 30);
      F.minarete(x, vx + 26, vy + 108, 70, { color: '#0a0c18', hueco: '#e8a850', estilo: 'cilindrico', ancho: 9 });
      F.cupula(x, vx + 66, vy + 108, 10, { color: '#0a0c18', hueco: '#0a0c18', remate: '#0a0c18' });
      for (let i = 0; i < 4; i++) R(x, vx + 8 + i * 22, vy + 112 + (i % 2) * 3, 2, 2, '#e8a850');
      x.restore();
      // marco de la ventana y celosía
      x.strokeStyle = '#4a3226';
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(vx, vy + vh);
      x.lineTo(vx, vy + 40);
      x.quadraticCurveTo(vx, vy, vx + vw / 2, vy - 6);
      x.quadraticCurveTo(vx + vw, vy, vx + vw, vy + 40);
      x.lineTo(vx + vw, vy + vh);
      x.stroke();
      R(x, vx - 6, vy + vh, vw + 12, 6, '#3a281e');
      // estante con libros
      R(x, 34, 96, 190, 5, '#4a3020');
      R(x, 34, 101, 190, 2, '#2a1a10');
      const libros = ['#6a2a24', '#2a4a5a', '#7a5a2a', '#3a5a3a', '#5a2a4a', '#8a6a3a', '#2a3a5a', '#6a4a2a'];
      let bx = 42;
      while (bx < 210) {
        const w = rng.entero(5, 9), h = rng.entero(20, 30);
        R(x, bx, 96 - h, w, h, rng.elegir(libros));
        R(x, bx + 1, 96 - h + 4, w - 2, 1, '#c8a860');
        R(x, bx + 1, 96 - h + h - 6, w - 2, 1, '#c8a860');
        bx += w + 1;
      }
      // tintero de recambio y un pergamino enrollado en el estante
      R(x, 150, 82, 20, 6, '#d8c8a0');
      // mesa
      G.degradado(x, 0, 170, this.ancho, 190, ['#5e3e26', '#54361f', '#4a2e1a', '#3e2614', '#32200f']);
      for (let yy = 182; yy < 360; yy += rng.entero(14, 22)) R(x, 0, yy, this.ancho, 1, '#2a1a0e');
      for (let i = 0; i < 300; i++) R(x, rng.entero(0, this.ancho), rng.entero(172, 360), rng.entero(3, 12), 1, rng.prob(0.5) ? '#6a4a2e' : '#3a2414');
      R(x, 0, 168, this.ancho, 3, '#6e4a2e');
      // pergamino
      const perg = [[232, 184], [522, 184], [566, 336], [186, 336]];
      poli(x, perg.map(([a, b]) => [a + 3, b + 4]), 'rgba(0,0,0,0.35)');
      poli(x, perg, '#e4d3ac');
      for (let i = 0; i < 500; i++) {
        const yy = rng.entero(186, 334);
        const t = (yy - 184) / 152;
        const xx = rng.entero(Math.ceil(U.lerp(232, 186, t)), Math.floor(U.lerp(522, 566, t)));
        R(x, xx, yy, 1, 1, rng.prob(0.6) ? '#d6c294' : '#efe2c0');
      }
      // borde enrollado
      R(x, 228, 180, 298, 5, '#cdb98c');
      R(x, 228, 180, 298, 1, '#f0e4c4');
      R(x, 182, 334, 388, 5, '#cdb98c');
      // margen decorado
      for (let i = 0; i < 22; i++) {
        const yy = 196 + i * 6;
        const t = (yy - 184) / 152;
        R(x, U.lerp(242, 198, t), yy, 3, 3, i % 2 ? '#8a2a24' : '#2a5a6a');
      }
      // tintero, cálamos y libro
      R(x, 586, 222, 20, 18, '#3a3028');
      R(x, 588, 218, 16, 5, '#6a5a3a');
      R(x, 590, 216, 12, 3, '#1a1010');
      R(x, 588, 224, 3, 12, '#5a4a38');
      for (let i = 0; i < 3; i++) G.linea(x, 600 + i * 4, 260, 630 + i * 3, 214, '#c8b48a');
      R(x, 30, 256, 92, 20, '#5a2a24');
      R(x, 30, 256, 92, 3, '#7a3a2e');
      R(x, 34, 244, 84, 14, '#2a4a5a');
      R(x, 34, 244, 84, 2, '#3a6a7a');
      R(x, 40, 236, 74, 10, '#7a5a2a');
      R(x, 42, 238, 70, 1, '#d8b860');
      // lámpara de aceite (cuerpo)
      const lx = 118, ly = 214;
      poli(x, [[lx - 22, ly + 6], [lx + 10, ly + 6], [lx + 26, ly - 2], [lx + 14, ly - 6], [lx - 18, ly - 6]], '#a8803a');
      R(x, lx - 22, ly - 6, 34, 2, '#e0c070');
      R(x, lx - 10, ly - 12, 12, 6, '#8a6a2a');
      R(x, lx - 6, ly + 6, 8, 6, '#6a4a1a');
      R(x, lx - 14, ly + 12, 24, 3, '#8a6a2a');
      poli(x, [[lx - 22, ly], [lx - 30, ly - 6], [lx - 30, ly + 2], [lx - 22, ly + 4]], '#a8803a');
      this.lampara = { x: lx + 24, y: ly - 6 };
      this.fondo = lz;
      this.tinta = IH.lienzo(this.ancho, this.alto);
      this.reiniciar();
    },
    reiniciar() {
      this.tinta.x.clearRect(0, 0, this.ancho, this.alto);
      this.pluma = { linea: 0, x: 0, y: 0, levantada: 0, prev: null };
      this.margen(0);
    },
    margen(l) {
      const y = 200 + l * 15;
      const t = (y - 184) / 152;
      const p = this.pluma;
      p.y0 = y;
      p.x = U.lerp(508, 552, t) - 4;
      p.min = U.lerp(252, 210, t) + 6;
      p.prev = null;
      // caligrafía: palabras con letras (alif, lam, ba, nun, mim, ya…) de derecha a izquierda
      const rng = new IH.Azar(100 + l * 17);
      const glifos = [];
      const tramos = [];
      let cur = p.x;
      while (cur > p.min + 12) {
        const ancho = rng.entero(12, 30);
        const fin = Math.max(p.min, cur - ancho);
        tramos.push([cur, fin]);
        let gx = cur - rng.entero(1, 3);
        while (gx > fin + 2) {
          glifos.push({ x: gx, tipo: rng.elegir(['alif', 'alif', 'lam', 'ba', 'nun', 'mim', 'ain', 'kaf', 'nada', 'nada']) });
          gx -= rng.entero(3, 6);
        }
        glifos.push({ x: fin + 1, tipo: rng.elegir(['ya', 'nun', 'alif', 'ha']) });
        cur = fin - rng.entero(4, 7);
      }
      p.glifos = glifos;
      p.tramos = tramos;
    },
    glifo(x0, y, tipo) {
      const tx = this.tinta.x;
      const P = (a, b) => R(tx, x0 + a, y + b, 1, 1, '#2a1810');
      switch (tipo) {
        case 'alif': for (let k = 1; k <= 7; k++) P(0, -k); P(1, -7); break;
        case 'lam': for (let k = 1; k <= 8; k++) P(0, -k); P(-1, 1); P(-2, 1); P(-3, 0); break;
        case 'ba': P(0, 1); P(-1, 1); P(-2, 0); P(-1, 3); break;
        case 'nun': P(0, 1); P(-1, 2); P(-2, 2); P(-3, 1); P(-1, -2); break;
        case 'mim': P(0, 1); P(1, 1); P(0, 2); P(1, 2); P(0, 3); P(0, 4); break;
        case 'ain': P(0, -1); P(1, -2); P(0, -3); P(-1, -2); break;
        case 'kaf': for (let k = 1; k <= 6; k++) P(Math.floor(k / 2), -k); break;
        case 'ya': P(0, 1); P(-1, 2); P(-2, 3); P(-3, 3); P(-4, 3); P(-5, 2); P(-1, 5); P(-3, 5); break;
        case 'ha': P(0, -1); P(-1, -2); P(-2, -1); P(-2, 0); P(-1, 0); break;
      }
    },
    alEmpezar() {
      this.reiniciar();
    },
    actualizar(cine, dt) {
      const p = this.pluma;
      if (!p) return;
      if (p.levantada > 0) {
        p.levantada -= dt;
        return;
      }
      if (p.linea > 8) return;
      const antes = p.x;
      p.x -= dt * 22;
      const enTramo = p.tramos.some(([a, b]) => p.x <= a && p.x >= b);
      const y = p.y0 + (enTramo ? Math.round(Math.sin(p.x * 0.9) * 0.4) : 0);
      if (enTramo && p.prev) G.linea(this.tinta.x, p.prev[0], p.prev[1], p.x, y, '#2a1810');
      p.prev = enTramo ? [p.x, y] : null;
      p.yAct = y - (enTramo ? 0 : 2);
      for (const g of p.glifos) if (!g.hecho && g.x >= p.x && g.x <= antes + 0.5) {
        g.hecho = true;
        this.glifo(Math.round(g.x), p.y0, g.tipo);
      }
      if (p.x < p.min) {
        p.linea++;
        p.levantada = 0.8;
        this.margen(p.linea);
      }
      if (Math.random() < dt * 0.6) IH.audio.sfx('pluma', { vol: 0.35 });
      if (Math.random() < dt * 4) cine.particulas.emitir('mota', U.lerp(80, 360, Math.random()), U.lerp(120, 300, Math.random()), 1, { color: '#ffd8a0' });
      if (Math.random() < dt * 1.2) cine.particulas.emitir('humo', this.lampara.x, this.lampara.y - 10, 1, { color: '#3a2a22', viento: 2 });
    },
    dibujar(ctx, t, cine, cx, cy, fx, fy) {
      cine._camF = { x: fx, y: fy };
      ctx.drawImage(this.fondo.c, -cx, -cy);
      ctx.drawImage(this.tinta.c, -cx, -cy);
      const p = this.pluma;
      // mano anciana con el cálamo
      const hx = Math.round((p.x || 400) - cx), hy = Math.round((p.yAct || p.y0 || 210) - cy - (p.levantada > 0 ? 6 : 0));
      ctx.globalAlpha = 0.3;
      poli(ctx, [[hx + 6, hy + 3], [hx + 40, hy + 2], [hx + 90, hy + 14], [hx + 96, hy + 30], [hx + 20, hy + 16]], '#000');
      ctx.globalAlpha = 1;
      G.linea(ctx, hx, hy, hx + 11, hy - 17, '#d8c8a0');
      G.linea(ctx, hx + 1, hy, hx + 12, hy - 17, '#a89470');
      R(ctx, hx, hy, 1, 1, '#1a1010');
      const piel = '#9c6844', pielS = '#7a4c30';
      poli(ctx, [[hx + 6, hy - 10], [hx + 14, hy - 16], [hx + 24, hy - 16], [hx + 34, hy - 10], [hx + 34, hy + 2], [hx + 18, hy + 4], [hx + 9, hy - 2]], piel);
      R(ctx, hx + 8, hy - 7, 9, 3, piel);
      R(ctx, hx + 6, hy - 5, 6, 2, pielS);
      R(ctx, hx + 12, hy - 12, 8, 1, pielS);
      R(ctx, hx + 20, hy - 6, 6, 1, pielS);
      R(ctx, hx + 17, hy - 2, 7, 1, pielS);
      poli(ctx, [[hx + 30, hy - 14], [hx + 120, hy - 26], [hx + 130, hy + 18], [hx + 32, hy + 6]], '#2b3f5f');
      poli(ctx, [[hx + 30, hy - 14], [hx + 120, hy - 26], [hx + 120, hy - 22], [hx + 32, hy - 10]], '#3e5a82');
      R(ctx, hx + 30, hy - 12, 3, 17, '#d8c8a0');
      // luz de la lámpara
      const parp = 0.9 + U.ruido(t * 7, 3) * 0.2;
      const lx = this.lampara.x - cx, ly = this.lampara.y - cy;
      ctx.globalCompositeOperation = 'multiply';
      const g = ctx.createRadialGradient(lx + 120, ly + 30, 30, lx + 120, ly + 30, 420 * parp);
      g.addColorStop(0, '#ffe8c0');
      g.addColorStop(0.5, '#a07860');
      g.addColorStop(1, '#2a1c28');
      ctx.fillStyle = g;
      ctx.fillRect(-2, -2, IH.ANCHO + 4, IH.ALTO + 4);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.55 * parp;
      ctx.drawImage(G.brillo(60, '#ff9a40', 0.8), lx - 60, ly - 66);
      ctx.globalAlpha = 1;
      ctx.drawImage(G.brillo(8, '#fff0b0', 1), lx - 8, ly - 14);
      ctx.globalCompositeOperation = 'source-over';
      // llama
      const fh = 7 + Math.round(U.ruido(t * 9, 1) * 3);
      R(ctx, lx - 1, ly - fh, 3, fh, '#ffb040');
      R(ctx, lx, ly - fh + 2, 1, fh - 3, '#fff0b0');
      R(ctx, lx - 2, ly - 2, 5, 2, '#ff8a30');
    },
  };

  // ================================================================== MAPA de 1249
  const MAPA = { lon0: 2, lat0: 47, kx: 24, ky: 28 };
  function proy(lon, lat) {
    return [(lon - MAPA.lon0) * MAPA.kx, (MAPA.lat0 - lat) * MAPA.ky];
  }
  const MAR = [
    2, 36.6, 5, 36.8, 8, 36.9, 10.2, 37.2, 11, 37, 10.5, 36.4, 11.1, 35.5, 10, 34.3, 11.5, 33.2, 13.2, 32.9, 15.2, 32.4, 17, 31, 19, 30.3, 20, 31.2, 20.1, 32.1, 21.5, 32.8, 22.6, 32.8, 23.2, 32.2, 25, 31.6, 27.2, 31.4, 29.9, 31.2, 30.4, 31.45, 31, 31.6, 31.8, 31.5, 32.3, 31.25, 33.5, 31.1, 34.3, 31.3, 34.6, 31.8, 34.8, 32.1, 35, 32.8, 35.2, 33.3, 35.5, 33.9, 35.8, 34.4, 35.9, 35, 35.8, 35.5, 36, 35.9, 36.2, 36.6, 35.6, 36.6, 34.6, 36.8, 34, 36.3, 32.8, 36, 32, 36.5, 30.6, 36.8, 30.4, 36.2, 29.1, 36.6, 28, 36.8, 27.4, 37, 27.2, 37.9, 26.4, 38.3, 26.8, 38.9, 26.5, 39.5, 26.2, 40, 26.7, 40.4, 27.5, 40.4, 29, 41, 28.4, 41, 27.4, 40.9, 26, 40.8, 24.5, 40.9, 23.5, 40.2, 22.6, 40.5, 22.8, 39.5, 23.2, 39, 24, 38.2, 23.6, 37.9, 23.1, 37.4, 22.8, 36.5, 22.4, 36.5, 21.7, 36.8, 21.5, 37.6, 21.1, 38.3, 20.7, 38.9, 20.2, 39.6, 19.4, 40.4, 19.5, 41.5, 18.6, 42.4, 16.5, 43.5, 15.2, 44.2, 14.5, 45.2, 13.7, 45.6, 12.3, 45.4, 12.4, 44.4, 13.6, 43.6, 14.6, 42.2, 16, 41.9, 17.2, 41.1, 18.5, 40.1, 17.2, 40.4, 16.6, 38.9, 16.1, 38, 15.6, 38.2, 15.7, 39, 15, 40.2, 14.2, 40.8, 13, 41.3, 12.2, 41.8, 11, 42.5, 10.3, 43.5, 8.9, 44.4, 7.5, 43.8, 6.2, 43.1, 5.3, 43.3, 4.2, 43.5, 3, 43, 3.1, 42.4, 2, 41.4,
  ];
  const MAR_NEGRO = [29.1, 41.2, 28, 41.6, 27.9, 42.7, 28.6, 43.4, 28.7, 44.3, 29.7, 45.2, 30.7, 46.5, 31.5, 46.7, 32.6, 46.1, 33.6, 44.5, 35.4, 45, 36.5, 45.3, 37.5, 47.2, 39, 47.2, 38.3, 46, 37.8, 44.7, 39.5, 43.5, 41.6, 41.6, 40.5, 41, 38, 40.9, 36, 41.7, 35.2, 42, 33, 42, 31.5, 41.3, 30.2, 41.2];
  const MAR_ROJO = [32.5, 30, 32.6, 29.6, 33.4, 28.3, 34.2, 27.8, 34.5, 28.3, 34.9, 29.5, 35, 29.4, 34.8, 28.2, 35.6, 27.4, 36.4, 26.2, 37.2, 25, 37.6, 23.5, 35.6, 23.5, 35.1, 24.8, 34.3, 26.1, 33.8, 27.3, 33.1, 28.1, 32.6, 29.3];
  const ISLAS = {
    chipre: [32.3, 35, 32.9, 35.4, 34, 35.5, 34.6, 35.7, 33.9, 35.1, 34, 34.6, 33, 34.6, 32.4, 34.7],
    creta: [23.5, 35.3, 24.5, 35.4, 25.5, 35.3, 26.3, 35.2, 26, 35, 24.8, 35, 23.6, 35.2],
    sicilia: [12.4, 37.8, 13.3, 38.2, 15.6, 38.3, 15.1, 37.3, 15.1, 36.7, 14.3, 37, 12.6, 37.6],
    cerdena: [8.4, 39, 8.2, 40.6, 9.2, 41.2, 9.8, 40.5, 9.6, 39.2, 9, 39],
    corcega: [8.6, 41.4, 8.6, 42.4, 9.4, 43, 9.5, 42, 9.2, 41.4],
    rodas: [27.7, 36, 28.2, 36.4, 28.3, 36.1],
    mallorca: [2.4, 39.6, 3.4, 39.8, 3.2, 39.3, 2.6, 39.4],
    eubea: [23.2, 38.9, 24.6, 38.1, 24.4, 38.0, 23.0, 38.7],
  };
  const RIOS = {
    nilo: [32.9, 23.5, 32.6, 25.7, 32.7, 26.2, 31.9, 26.6, 31.2, 27.2, 30.8, 28.1, 30.9, 29.1, 31.25, 30.05],
    niloRosetta: [31.25, 30.05, 30.9, 30.6, 30.6, 31.1, 30.4, 31.45],
    niloDamieta: [31.25, 30.05, 31.35, 30.6, 31.4, 31.04, 31.8, 31.45],
    eufrates: [38, 37, 39, 36, 40.5, 35, 41.9, 34.4, 43.3, 33.4, 44.3, 32.5, 46, 31, 47.5, 30.4],
    tigris: [40.2, 37.9, 42.5, 37.1, 43.1, 36.3, 43.7, 34.6, 44.4, 33.3, 45.8, 32.5, 47, 31, 47.5, 30.4],
    jordan: [35.6, 33, 35.55, 32.4, 35.5, 31.8],
  };
  const MONTES = [[32, 37.3, 38, 38.3], [44.5, 33.5, 47.5, 37], [35.9, 33.6, 36.4, 34.6], [7, 45.8, 14, 46.8], [0, 42.4, 3, 42.9], [22, 42, 26, 43], [33.5, 28.4, 34.3, 29.3], [40, 42, 47, 43.6], [28, 38.5, 32, 39.5]];
  IH.MAPA_CIUDADES = {
    cairo: { n: 'El Cairo', lon: 31.25, lat: 30.05 },
    damieta: { n: 'Damieta', lon: 31.81, lat: 31.42 },
    mansura: { n: 'Mansura', lon: 31.38, lat: 31.04 },
    alejandria: { n: 'Alejandría', lon: 29.92, lat: 31.2 },
    jerusalen: { n: 'Jerusalén', lon: 35.23, lat: 31.78 },
    acre: { n: 'Acre', lon: 35.07, lat: 32.93 },
    damasco: { n: 'Damasco', lon: 36.29, lat: 33.51 },
    alepo: { n: 'Alepo', lon: 37.16, lat: 36.2 },
    antioquia: { n: 'Antioquía', lon: 36.16, lat: 36.2 },
    bagdad: { n: 'Bagdad', lon: 44.36, lat: 33.31 },
    constantinopla: { n: 'Constantinopla', lon: 28.98, lat: 41.01 },
    limasol: { n: 'Limasol', lon: 33.04, lat: 34.68 },
    aigues: { n: 'Aigues-Mortes', lon: 4.19, lat: 43.57 },
    roma: { n: 'Roma', lon: 12.5, lat: 41.9 },
    gaza: { n: 'Gaza', lon: 34.46, lat: 31.5 },
    ainjalut: { n: 'Ain Jalut', lon: 35.38, lat: 32.55 },
  };
  const REGIONES = {
    egipto: { n: 'EGIPTO', lon: 29.5, lat: 27.8 },
    siria: { n: 'SIRIA', lon: 38, lat: 34.6 },
    mediterraneo: { n: 'MAR MEDITERRÁNEO', lon: 18.5, lat: 34.5, mar: true },
    anatolia: { n: 'ANATOLIA', lon: 33, lat: 39.3 },
    iraq: { n: 'IRAQ', lon: 43.3, lat: 31.6 },
    francia: { n: 'FRANCIA', lon: 3.6, lat: 45.6 },
    ultramar: { n: 'ULTRAMAR', lon: 35.4, lat: 34.2, peq: true },
    negro: { n: 'MAR NEGRO', lon: 34.5, lat: 43.6, mar: true },
    rojo: { n: 'MAR ROJO', lon: 36.1, lat: 25.3, mar: true, peq: true },
    arabia: { n: 'ARABIA', lon: 41, lat: 27.5 },
    estepas: { n: 'LAS ESTEPAS', lon: 44, lat: 45.5 },
  };
  const RUTAS = {
    cruzada: [4.19, 43.5, 5.5, 42, 7.8, 38.6, 11.5, 36.6, 18, 35.6, 24, 34.6, 29, 34.4, 33.04, 34.6],
    chipreDamieta: [33.04, 34.6, 32.6, 33.4, 32.1, 32.2, 31.8, 31.5],
    marchaLuis: [31.81, 31.42, 31.6, 31.25, 31.42, 31.07],
    ejercito: [31.25, 30.05, 31.33, 30.5, 31.38, 31.0],
    esclavos: [38, 46.2, 36.6, 43.6, 34.2, 40.2, 32.6, 36.4, 31.7, 33, 31.25, 30.1],
    mongoles: [52, 41.5, 49, 38, 47, 35.5, 44.4, 33.3],
    mongolesSiria: [44.4, 33.3, 41, 35.5, 37.16, 36.2, 36.29, 33.51, 35.38, 32.55],
  };

  function polilinea(x, arr, cerrar) {
    x.beginPath();
    for (let i = 0; i < arr.length; i += 2) {
      const [px, py] = proy(arr[i], arr[i + 1]);
      if (i === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    if (cerrar) x.closePath();
  }

  L.mapa = {
    ancho: Math.round(46 * MAPA.kx),
    alto: Math.round(24 * MAPA.ky),
    construir() {
      const W = this.ancho, H = this.alto;
      const lz = IH.lienzo(W, H);
      const x = lz.x;
      const rng = new IH.Azar(1249);
      // pergamino
      G.degradado(x, 0, 0, W, H, ['#d8c39a', '#ddc9a0', '#e2cfa6', '#dcc79c', '#d4bd90']);
      for (let i = 0; i < W * H * 0.05; i++) R(x, rng.entero(0, W), rng.entero(0, H), 1, 1, rng.prob(0.5) ? '#cbb386' : '#e9d9b4');
      for (let i = 0; i < 14; i++) G.circulo(x, rng.entero(0, W), rng.entero(0, H), rng.entero(10, 40), 'rgba(150,110,60,0.06)');
      // mares
      const mar = '#a7b6a0', marO = '#93a48e';
      x.fillStyle = mar;
      for (const poly of [MAR, MAR_NEGRO, MAR_ROJO]) {
        polilinea(x, poly, true);
        x.fill();
      }
      // el mar del borde izquierdo (Atlántico-poniente) para cerrar el Mediterráneo
      polilinea(x, [2, 36.6, 2, 41.4, -1, 41.4, -1, 36.6], true);
      x.fill();
      // islas (tierra)
      x.fillStyle = '#ddc9a0';
      for (const k in ISLAS) {
        polilinea(x, ISLAS[k], true);
        x.fill();
      }
      G.nitidez(lz, 128);
      // ondas en el mar
      const img = x.getImageData(0, 0, W, H);
      const d = img.data;
      const esMar = (px, py) => {
        const i = (py * W + px) * 4;
        return Math.abs(d[i] - 0xa7) < 6 && Math.abs(d[i + 1] - 0xb6) < 6;
      };
      const marcas = [];
      for (let py = 2; py < H - 2; py += 3) for (let px = 2; px < W - 2; px += 7) if (esMar(px, py) && rng.prob(0.25) && esMar(px + 4, py)) marcas.push([px, py]);
      for (const [px, py] of marcas) {
        R(x, px, py, 2, 1, marO);
        R(x, px + 2, py - 1, 2, 1, marO);
      }
      // costas (tinta) y línea de agua
      x.lineJoin = 'round';
      for (const poly of [MAR, MAR_NEGRO, MAR_ROJO, ...Object.values(ISLAS)]) {
        x.strokeStyle = 'rgba(80,100,90,0.35)';
        x.lineWidth = 3;
        polilinea(x, poly, true);
        x.stroke();
        x.strokeStyle = '#5a4028';
        x.lineWidth = 1;
        polilinea(x, poly, true);
        x.stroke();
      }
      // ríos
      x.strokeStyle = '#5a7a8a';
      x.lineWidth = 1.5;
      for (const k in RIOS) {
        polilinea(x, RIOS[k]);
        x.stroke();
      }
      // delta fértil en verde
      for (let i = 0; i < 260; i++) {
        const lon = U.lerp(30.3, 32.0, rng.sig()), lat = U.lerp(30.1, 31.4, rng.sig());
        if (lat < 30.05 + (Math.abs(lon - 31.25) * 0.9)) continue;
        const [px, py] = proy(lon, lat);
        R(x, px, py, 1, 1, '#7a8a4a');
      }
      for (let i = 0; i < 160; i++) {
        const lat = U.lerp(23.6, 30, rng.sig());
        const t = (lat - 23.6) / 6.4;
        const lon = U.lerp(32.8, 31.0, t) + rng.rango(-0.25, 0.25);
        const [px, py] = proy(lon, lat);
        R(x, px, py, 1, 1, '#7a8a4a');
      }
      // desiertos
      for (let i = 0; i < 1600; i++) {
        const lon = rng.rango(2, 48), lat = rng.rango(23.6, 31);
        const [px, py] = proy(lon, lat);
        if (px < 0 || py < 0 || px >= W || py >= H) continue;
        const ii = (Math.round(py) * W + Math.round(px)) * 4;
        if (Math.abs(d[ii] - 0xa7) < 6) continue;
        if (Math.abs(lon - 31.5) < 1.2 && lat > 29.8) continue;
        R(x, px, py, 1, 1, '#c4a878');
      }
      // montañas
      for (const [a, b, c, e] of MONTES) {
        const n = Math.round((c - a) * (e - b) * 3) + 3;
        for (let i = 0; i < n; i++) {
          const [px, py] = proy(rng.rango(a, c), rng.rango(b, e));
          G.linea(x, px - 3, py + 2, px, py - 2, '#6a4a2a');
          G.linea(x, px, py - 2, px + 3, py + 2, '#8a6a4a');
        }
      }
      // marco y rosa de los vientos
      x.strokeStyle = '#5a4028';
      x.lineWidth = 2;
      x.strokeRect(6, 6, W - 12, H - 12);
      x.lineWidth = 1;
      x.strokeRect(11, 11, W - 22, H - 22);
      for (let i = 14; i < W - 14; i += 10) R(x, i, 8, 5, 1, '#8a2a24');
      for (let i = 14; i < W - 14; i += 10) R(x, i, H - 9, 5, 1, '#8a2a24');
      const [rx, ry] = [80, H - 90];
      x.fillStyle = '#8a2a24';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r1 = i % 2 ? 18 : 34;
        poli(x, [[rx, ry], [rx + Math.cos(a - 0.18) * 8, ry + Math.sin(a - 0.18) * 8], [rx + Math.cos(a) * r1, ry + Math.sin(a) * r1], [rx + Math.cos(a + 0.18) * 8, ry + Math.sin(a + 0.18) * 8]], i % 2 ? '#5a4028' : '#8a2a24');
      }
      G.circulo(x, rx, ry, 3, '#d4a73a');
      this.fondo = lz;
    },
    pt(lon, lat) {
      return proy(lon, lat);
    },
    actualizar() {},
    dibujar(ctx, t, cine, cx, cy, fx, fy) {
      cine._camF = { x: fx, y: fy };
      ctx.drawImage(this.fondo.c, -cx, -cy);
      const opc = (cine.plano && cine.plano.mapa) || {};
      // rutas animadas
      for (const r of opc.rutas || []) {
        const arr = RUTAS[r.id];
        const k = U.clamp((t - (r.t0 || 0)) / (r.dur || 6), 0, 1);
        const pts = [];
        for (let i = 0; i < arr.length; i += 2) pts.push(proy(arr[i], arr[i + 1]));
        let total = 0;
        const seg = [];
        for (let i = 1; i < pts.length; i++) {
          const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          seg.push(l);
          total += l;
        }
        let rest = total * U.salida(k);
        let cabeza = pts[0];
        const col = r.color || '#a8221e';
        for (let i = 1; i < pts.length && rest > 0; i++) {
          const l = Math.min(rest, seg[i - 1]);
          const a = pts[i - 1], b = pts[i];
          const n = Math.max(1, Math.floor(l / 3));
          for (let j = 0; j < n; j++) {
            if (j % 3 === 2) continue;
            const q = (j / n) * (l / seg[i - 1]);
            R(ctx, a[0] + (b[0] - a[0]) * q - cx, a[1] + (b[1] - a[1]) * q - cy, 2, 2, col);
          }
          cabeza = [a[0] + ((b[0] - a[0]) * l) / seg[i - 1], a[1] + ((b[1] - a[1]) * l) / seg[i - 1]];
          rest -= l;
        }
        if (k > 0 && k < 1 && r.barco) barco(ctx, cabeza[0] - cx, cabeza[1] - cy + 2, 0.18, { cruz: true, banderola: false, vela: '#f0e6d0' });
        if (k > 0 && r.flecha) {
          // punta de flecha
          const a = pts[pts.length - 2], b = cabeza;
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          poli(ctx, [[b[0] - cx + Math.cos(ang) * 6, b[1] - cy + Math.sin(ang) * 6], [b[0] - cx + Math.cos(ang + 2.5) * 6, b[1] - cy + Math.sin(ang + 2.5) * 6], [b[0] - cx + Math.cos(ang - 2.5) * 6, b[1] - cy + Math.sin(ang - 2.5) * 6]], col);
        }
      }
      // ciudades
      for (const id of opc.ciudades || []) {
        const c = IH.MAPA_CIUDADES[id];
        const [px, py] = proy(c.lon, c.lat);
        const res = (opc.resaltar || []).includes(id);
        R(ctx, px - 1 - cx, py - 1 - cy, 3, 3, res ? '#a8221e' : '#3a2414');
        if (res) {
          const k = (t * 1.2) % 1;
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = '#a8221e';
          ctx.beginPath();
          ctx.arc(Math.round(px - cx) + 0.5, Math.round(py - cy) + 0.5, 3 + k * 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      // zonas destacadas (dominio ayyubí, avance mongol…)
      for (const z of opc.zonas || []) {
        const k = U.clamp((t - (z.t0 || 0)) / 2, 0, 1);
        ctx.globalAlpha = 0.22 * k;
        ctx.fillStyle = z.color || '#d4a73a';
        for (const [lon, lat, r] of z.puntos) {
          const [px, py] = proy(lon, lat);
          ctx.beginPath();
          ctx.ellipse(px - cx, py - cy, r * MAPA.kx, r * MAPA.ky * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    },
    dibujarUI(ctx, t, cine) {
      const opc = (cine.plano && cine.plano.mapa) || {};
      const T = IH.T;
      const a = U.clamp((t - 0.8) / 1.5, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      for (const id of opc.regiones || []) {
        const r = REGIONES[id];
        const [px, py] = proy(r.lon, r.lat);
        const [ux, uy] = aUI(cine, px, py);
        T.linea(ctx, r.n, ux, uy, { tam: r.peq ? 26 : 34, alinear: 'center', familia: T.TITULO, color: r.mar ? 'rgba(40,70,70,0.75)' : 'rgba(90,50,30,0.8)', espaciado: 8, sombra: false });
      }
      for (const id of opc.ciudades || []) {
        const c = IH.MAPA_CIUDADES[id];
        const [px, py] = proy(c.lon, c.lat);
        const [ux, uy] = aUI(cine, px, py);
        const res = (opc.resaltar || []).includes(id);
        const desp = (opc.desplazar && opc.desplazar[id]) || [14, -10];
        T.linea(ctx, c.n, ux + desp[0], uy + desp[1], { tam: res ? 36 : 28, cursiva: true, peso: res ? 600 : 400, color: res ? '#7a1a16' : '#3a2414', sombra: false, contorno: 'rgba(230,215,180,0.75)', grosorContorno: 5 });
      }
      if (opc.fecha) T.linea(ctx, opc.fecha, IH.UIW - 160, 240, { tam: 54, alinear: 'right', familia: T.TITULO, color: '#5a2a1a', sombra: false, contorno: 'rgba(230,215,180,0.7)', grosorContorno: 6 });
      ctx.restore();
    },
  };

  // ================================================================== LA FLOTA frente a Damieta (junio de 1249)
  L.flota = {
    ancho: 980, alto: 360,
    construir() {
      const W = this.ancho;
      const H = F.HORAS.amanecer;
      const cielo = IH.lienzo(W, 360);
      G.degradado(cielo.x, 0, 0, W, 230, H.cielo);
      cielo.x.drawImage(G.brillo(150, '#ffd8a0', 0.55), 760 - 150, 205 - 150);
      G.circulo(cielo.x, 760, 210, 16, '#fff0c8');
      const rng = new IH.Azar(6);
      for (let i = 0; i < 9; i++) F.nube(cielo.x, rng.entero(0, W), rng.entero(30, 150), rng.entero(40, 110), H, rng);
      // mar
      G.degradado(cielo.x, 0, 214, W, 146, ['#c8907a', '#8a6a7a', '#4a4a6a', '#2e3456', '#222a46', '#1a2038']);
      // Damieta en la orilla izquierda
      const x = cielo.x;
      F.montes(x, 300, 214, 6, '#5a4a52', 4, 0.03);
      const colD = ['#8a6a6a', '#7a5e62', '#94706a'];
      let bx = 10;
      while (bx < 250) {
        const w = rng.entero(14, 26), h = rng.entero(14, 34);
        F.edificio(x, rng, bx, 214, w, h, { H, detalle: 0, color: rng.elegir(colD), planta: false });
        bx += w;
      }
      F.minarete(x, 120, 200, 64, { color: '#7a5e62', estilo: 'mabkhara', ancho: 9 });
      F.minarete(x, 200, 204, 50, { color: '#7a5e62', estilo: 'cilindrico', ancho: 8 });
      // murallas y torre de la cadena
      G.silleria(x, 0, 196, 270, 18, '#7a6264', '#7a6264', rng, { alto: 4, largo: 8, junta: '#5a4448' });
      for (let ax = 0; ax < 270; ax += 6) R(x, ax, 192, 4, 4, '#7a6264');
      for (const tx of [30, 110, 190, 255]) {
        R(x, tx - 8, 176, 16, 38, '#7e6668');
        for (let ax = tx - 8; ax < tx + 8; ax += 5) R(x, ax, 172, 3, 4, '#7e6668');
        R(x, tx + 3, 176, 5, 38, '#5e4a50');
      }
      for (let px = 280; px < 330; px += 10) F.palmera(x, px, 214, rng.entero(18, 28), rng, { hoja: '#3a3a3a', hojaLuz: '#4a4440', tronco: '#3a2a2a', datiles: false });
      this.fondo = cielo;
      // barcos lejanos (estáticos con leve balanceo en dibujar)
      this.barcos = [];
      for (let i = 0; i < 46; i++) this.barcos.push({ x: rng.rango(300, W + 40), y: rng.rango(216, 232), e: rng.rango(0.14, 0.22), f: rng.rango(0, 6) });
      for (let i = 0; i < 14; i++) this.barcos.push({ x: rng.rango(340, W), y: rng.rango(236, 262), e: rng.rango(0.3, 0.45), f: rng.rango(0, 6) });
      for (let i = 0; i < 5; i++) this.barcos.push({ x: rng.rango(420, W - 40), y: rng.rango(290, 320), e: rng.rango(0.8, 1.1), f: rng.rango(0, 6), escudos: true });
      this.barcos.sort((a, b) => a.y - b.y);
    },
    actualizar(cine, dt) {
      if (Math.random() < dt * 0.6) IH.audio.sfx('olaRompe', { vol: 0.3 });
    },
    dibujar(ctx, t, cine, cx, cy) {
      ctx.drawImage(this.fondo.c, -cx, -cy);
      // reflejos del sol y olas
      for (let i = 0; i < 70; i++) {
        const yy = 216 + ((i * 37) % 140);
        const xx = ((i * 97 + t * (6 + (yy - 216) * 0.15)) % (this.ancho + 40)) - 20;
        const cerca = Math.abs(xx - 760) < 60 + (yy - 216);
        R(ctx, xx - cx, yy - cy, 3 + (yy - 216) / 30, 1, cerca ? 'rgba(255,220,170,0.7)' : 'rgba(150,140,180,0.35)');
      }
      for (const b of this.barcos) {
        const bal = Math.sin(t * 1.4 + b.f) * (1 + b.e * 2);
        const xx = b.x + Math.sin(t * 0.1 + b.f) * 2 - t * 2 * b.e;
        barco(ctx, xx - cx, b.y - cy + bal, b.e, { t, escudos: b.escudos, inflar: 3, vela: b.e > 0.7 ? '#efe4cc' : '#d8c0b0', casco: b.e > 0.7 ? '#3a2416' : '#4a3a40' });
        if (b.e > 0.7) {
          ctx.globalAlpha = 0.25;
          R(ctx, xx - cx - 28 * b.e, b.y - cy + bal + 3 * b.e, 56 * b.e, 2, '#ffe0c0');
          ctx.globalAlpha = 1;
        }
      }
    },
  };

  // ================================================================== PANORAMA de El Cairo
  function crearPanorama(hora) {
    return {
      ancho: 1500, alto: 360,
      construir() {
        const W = this.ancho;
        const H = F.HORAS[hora];
        const rng = new IH.Azar(969);
        const cielo = F.cielo(hora, { solX: hora === 'tarde' ? 300 : 1100, solY: hora === 'tarde' ? 190 : 60, nubes: 8 });
        const lz = IH.lienzo(W, 360);
        const x = lz.x;
        // cielo estirado
        for (let i = 0; i < W; i += cielo.w - 8) x.drawImage(cielo.c, i, 0);
        // pirámides de Guiza al oeste
        const colP = U.mezclar(H.lejos, H.bruma, 0.45);
        F.piramide(x, 90, 232, 60, colP, U.tono(colP, -0.12));
        F.piramide(x, 150, 232, 52, colP, U.tono(colP, -0.12));
        F.piramide(x, 196, 232, 26, colP, U.tono(colP, -0.12));
        // Muqattam y Ciudadela al este
        F.montes(x, W, 236, 0, colP, 2);
        const mx = IH.lienzo(W, 360);
        F.montes(mx.x, W, 230, 46, U.mezclar(H.lejos, H.bruma, 0.25), 8, 0.01);
        x.drawImage(mx.c, 0, 0, W, 360);
        x.fillStyle = U.mezclar(H.lejos, H.bruma, 0.25);
        F.ciudadela(x, 1180, 200, 1.3, U.mezclar('#c9ad86', H.bruma, hora === 'noche' ? 0.6 : 0.25), U.mezclar(H.lejos, H.bruma, 0.25));
        // ciudad en varias capas
        const colL = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.5));
        let bx = 220;
        while (bx < W) {
          const w = rng.entero(10, 22), h = rng.entero(8, 20);
          F.edificio(x, rng, bx, 248, w, h, { H, detalle: 0, color: rng.elegir(colL), planta: false });
          if (rng.prob(0.12)) F.minarete(x, bx + w / 2, 248 - h + 2, rng.entero(34, 52), { color: rng.elegir(colL), estilo: rng.elegir(['mabkhara', 'cilindrico']), ancho: rng.entero(6, 8) });
          bx += w;
        }
        F.minarete(x, 520, 246, 74, { color: colL[0], estilo: 'tulun', ancho: 12 });
        const colM = H.enlucidos.map((c) => U.mezclar(c, H.bruma, 0.25));
        bx = 200;
        while (bx < W) {
          const w = rng.entero(16, 34), h = rng.entero(16, 38);
          F.edificio(x, rng, bx, 268, w, h, { H, detalle: 0, color: rng.elegir(colM), planta: false, remate: rng.elegir(['almenas', 'pretil']) });
          if (rng.prob(0.1)) F.minarete(x, bx + w / 2, 268 - h + 2, rng.entero(50, 80), { color: rng.elegir(colM), estilo: rng.elegir(['mabkhara', 'mabkhara', 'cilindrico']), ancho: rng.entero(8, 11) });
          else if (rng.prob(0.12)) F.cupula(x, bx + w / 2, 268 - h, rng.entero(6, 10), { color: rng.elegir(colM), nervios: true });
          bx += w;
        }
        G.niebla(lz, H.bruma, 200, 275, 0.0, 0.3);
        // palmerales de la orilla
        for (let px = 0; px < W; px += rng.entero(10, 26)) F.palmera(x, px, 286, rng.entero(26, 46), rng, { hoja: U.mezclar('#3a5a24', H.sombra, 0.3), hojaLuz: U.mezclar('#5a7a2e', H.sombra, 0.3), tronco: U.mezclar('#5a3a22', H.sombra, 0.3) });
        R(x, 0, 280, W, 8, U.mezclar('#6a5a3a', H.sombra, 0.3));
        // el Nilo
        G.degradado(x, 0, 288, W, 72, [U.mezclar(H.cielo[4], '#3a5a6a', 0.5), U.mezclar(H.cielo[3], '#2a4a5a', 0.6), '#24404e', '#1c3442', '#162a36']);
        for (let px = 0; px < W; px += rng.entero(14, 40)) F.junco(x, px, 292, rng.entero(6, 12), rng, U.mezclar('#4a5a2a', H.sombra, 0.3));
        this.fondo = lz;
        this.H = H;
        this.falucas = [];
        for (let i = 0; i < 7; i++) this.falucas.push({ x: rng.rango(0, W), y: rng.rango(300, 345), e: rng.rango(0.55, 1.0), v: rng.rango(3, 9) * (rng.prob(0.5) ? 1 : -1) });
        this.falucas.sort((a, b) => a.y - b.y);
        this.aves = [];
        for (let i = 0; i < 9; i++) this.aves.push({ x: rng.rango(0, W), y: rng.rango(60, 160), f: rng.rango(0, 6), v: rng.rango(10, 18) });
      },
      actualizar(cine, dt) {
        if (Math.random() < dt * 0.8) cine.particulas.emitir('humo', U.lerp(300, 1400, Math.random()), 250, 1, { color: '#8a7a70', viento: 3 });
      },
      dibujar(ctx, t, cine, cx, cy, fx, fy) {
        cine._camF = { x: fx, y: fy };
        ctx.drawImage(this.fondo.c, -cx, -cy);
        // destellos del río
        for (let i = 0; i < 90; i++) {
          const yy = 292 + ((i * 29) % 66);
          const xx = ((i * 131 + t * (4 + (yy - 290) * 0.1)) % this.ancho);
          R(ctx, xx - cx, yy - cy, 2 + (yy - 290) / 20, 1, 'rgba(255,236,200,0.35)');
        }
        for (const f of this.falucas) {
          const xx = ((f.x + t * f.v) % (this.ancho + 80) + this.ancho + 80) % (this.ancho + 80) - 40;
          faluca(ctx, xx - cx, f.y - cy + Math.sin(t * 1.3 + f.x) * 0.8, f.e, { vela: U.mezclar('#efe6d0', this.H.sombra, 0.15) });
        }
        for (const a of this.aves) {
          const xx = ((a.x + t * a.v) % (this.ancho + 40)) - 20;
          const yy = a.y + Math.sin(t * 0.7 + a.f) * 6;
          const ala = Math.floor(t * 6 + a.f) % 2;
          R(ctx, xx - cx - 2, yy - cy - ala, 2, 1, '#2a2020');
          R(ctx, xx - cx, yy - cy, 1, 1, '#2a2020');
          R(ctx, xx - cx + 1, yy - cy - ala, 2, 1, '#2a2020');
        }
      },
    };
  }
  L.cairoPanorama = crearPanorama('dia');
  L.cairoTitulo = crearPanorama('tarde');
  L.cairoAlba = crearPanorama('amanecer');

  // ================================================================== interior con personajes (sultán, campamento…)
  // Escena genérica: fondo de un escenario + sprites colocados + luces
  function escenaSprites(opc) {
    return {
      ancho: opc.ancho || 640, alto: 360,
      construir() {
        this.capas = opc.fondo ? opc.fondo() : [];
        this.actores = (opc.actores || []).map((a) => Object.assign({}, a, { anim: new IH.Esq.Animador(IH.sprite(a.traje), a.anim || 'quieto') }));
        this.luces = opc.luces || [];
        this.lucesMapa = IH.lienzo(IH.ANCHO + 4, IH.ALTO + 4);
        if (opc.construir) opc.construir.call(this);
      },
      alEmpezar(cine) {
        if (opc.alEmpezar) opc.alEmpezar.call(this, cine);
      },
      actualizar(cine, dt) {
        for (const a of this.actores) {
          a.anim.actualizar(dt);
          if (a.vx) {
            a.x += a.vx * dt;
            if (a.bucleX && a.x > a.bucleX[1]) a.x = a.bucleX[0];
            if (a.bucleX && a.x < a.bucleX[0]) a.x = a.bucleX[1];
          }
        }
        if (opc.actualizar) opc.actualizar.call(this, cine, dt);
      },
      dibujar(ctx, t, cine, cx, cy, fx, fy) {
        cine._camF = { x: fx, y: fy };
        for (const c of this.capas) {
          if (c.delante) continue;
          ctx.drawImage(c.lz.c, -Math.round(fx * c.factor), -cy);
        }
        if (opc.dibujarFondo) opc.dibujarFondo.call(this, ctx, t, cx, cy);
        const lista = this.actores.slice().sort((a, b) => (a.z || 0) - (b.z || 0));
        for (const a of lista) {
          if (a.oculto) continue;
          const f = a.factor || 1;
          if (a.sombra !== false) {
            ctx.globalAlpha = 0.3;
            R(ctx, a.x - fx * f - 7, a.y - cy, 14, 2, '#000');
            ctx.globalAlpha = 1;
          }
          a.anim.dibujar(ctx, a.x - Math.round(fx * f), a.y - cy, a.dir || 1, { alfa: a.alfa });
        }
        if (opc.dibujarDelante) opc.dibujarDelante.call(this, ctx, t, cx, cy);
        if (opc.ambiente) {
          const Lm = this.lucesMapa, x = Lm.x;
          x.globalCompositeOperation = 'source-over';
          x.fillStyle = opc.ambiente;
          x.fillRect(0, 0, Lm.w, Lm.h);
          x.globalCompositeOperation = 'lighter';
          for (const l of this.luces) {
            const parp = l.parpadeo ? 1 - l.parpadeo * U.ruido(t * 8 + l.x, 3) : 1;
            const r = Math.round(l.r);
            x.globalAlpha = (l.i || 1) * parp;
            x.drawImage(G.brillo(r, l.color, 1), Math.round(l.x - fx * (l.factor || 1) - r + 2), Math.round(l.y - cy - r + 2));
          }
          x.globalAlpha = 1;
          x.globalCompositeOperation = 'source-over';
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(Lm.c, -2, -2);
          ctx.globalCompositeOperation = 'source-over';
        }
        for (const c of this.capas) if (c.delante) ctx.drawImage(c.lz.c, -Math.round(fx * c.factor), -cy);
      },
    };
  }
  L.escenaSprites = escenaSprites;

  // ---- la cámara del sultán moribundo (Mansura, noviembre de 1249)
  L.sultan = escenaSprites({
    ancho: 700,
    fondo() {
      const lz = IH.lienzo(700, 360);
      const x = lz.x;
      const rng = new IH.Azar(1249);
      G.enlucido(x, 0, 0, 700, 300, '#6a5048', rng, { densidad: 0.05, grietas: 6 });
      // arcos de yesería
      for (let i = 0; i < 5; i++) {
        const ax = 70 + i * 140;
        G.arco(x, ax, 250, 90, 170, '#5a4038', 'apuntado');
        G.arco(x, ax, 250, 80, 162, '#3a2a28', 'apuntado');
        for (let yy = 100; yy < 250; yy += 6) R(x, ax - 46, yy, 3, 3, '#8a6a50');
        for (let yy = 100; yy < 250; yy += 6) R(x, ax + 43, yy, 3, 3, '#8a6a50');
      }
      // ventana con luna
      x.save();
      x.beginPath();
      x.rect(490, 110, 60, 110);
      x.clip();
      G.degradado(x, 490, 110, 60, 110, ['#0a1024', '#121a36', '#1c2a4a']);
      G.circulo(x, 530, 140, 6, '#e8ecf0');
      R(x, 490, 200, 60, 20, '#0a0c18');
      x.restore();
      G.celosia(x, 490, 110, 60, 110, '#3a2416', 'rgba(0,0,0,0)');
      // suelo con alfombra
      G.degradado(x, 0, 300, 700, 60, ['#4a3028', '#3a2420', '#2a1a16']);
      R(x, 140, 304, 420, 40, '#6a1e1e');
      R(x, 146, 308, 408, 32, '#8a2a24');
      for (let i = 150; i < 550; i += 10) {
        R(x, i, 314, 4, 4, '#d4a73a');
        R(x, i + 5, 330, 3, 3, '#2a4a6a');
      }
      // diván
      R(x, 230, 270, 220, 30, '#5a3a22');
      R(x, 226, 262, 228, 12, '#c8b890');
      R(x, 226, 262, 228, 2, '#e8dcc0');
      R(x, 420, 240, 34, 24, '#7a2a2a');
      // lámparas colgantes
      for (const lx of [150, 340, 560]) {
        R(x, lx, 0, 1, 80, '#3a2a1a');
        R(x, lx - 6, 80, 13, 9, '#a8803a');
        R(x, lx - 4, 89, 9, 4, '#8a6a2a');
      }
      return [{ lz, factor: 1 }];
    },
    actores: [
      { traje: 'sultan', anim: 'yacer', x: 335, y: 268, dir: -1, sombra: false },
      { traje: 'shajar', anim: 'manosAtras', x: 470, y: 300, dir: -1, z: 1 },
      { traje: 'medico', anim: 'arrodillado', x: 225, y: 300, dir: 1, z: 1 },
    ],
    ambiente: '#5a4a62',
    luces: [
      { x: 150, y: 110, r: 150, color: '#ffb060', i: 0.9, parpadeo: 0.15 },
      { x: 340, y: 110, r: 170, color: '#ffb060', i: 0.95, parpadeo: 0.15 },
      { x: 560, y: 110, r: 150, color: '#ffb060', i: 0.9, parpadeo: 0.15 },
      { x: 330, y: 270, r: 120, color: '#ffc880', i: 0.7, parpadeo: 0.1 },
      { x: 520, y: 160, r: 90, color: '#8aa0d0', i: 0.6 },
    ],
    dibujarDelante(ctx, t, cx, cy) {
      for (const lx of [150, 340, 560]) {
        const h = 3 + Math.round(U.ruido(t * 8 + lx, 2) * 2);
        R(ctx, lx - cx, 77 - h - cy, 2, h, '#ffd27a');
      }
    },
  });

  // ---- el ejército sale de El Cairo por Bab al-Futuh (al alba)
  L.columna = escenaSprites({
    ancho: 900,
    fondo() {
      const f = F.construir('cairo', 900, { hora: 'amanecer', babZuwayla: 470, semilla: 1250 });
      return f.capas;
    },
    construir() {
      // columna de soldados en bucle
      const tipos = ['mameluco', 'recluta1', 'recluta2', 'mameluco', 'yusufSoldado', 'recluta1', 'mamelucoArco', 'recluta2'];
      for (let i = 0; i < 14; i++) {
        const tr = tipos[i % tipos.length];
        this.actores.push({ traje: tr, anim: new IH.Esq.Animador(IH.sprite(tr), 'andar'), x: -60 + i * 70, y: 300 + (i % 2) * 6, dir: 1, vx: 26, bucleX: [-80, 980], z: i % 2 });
      }
      for (let i = 0; i < 6; i++) {
        const tr = ['vecino1', 'vecina1', 'vecino3', 'nino', 'vecina2', 'vecino2'][i];
        const anim = tr === 'vecina1' || tr === 'nino' ? 'saludar' : 'quieto';
        this.actores.push({ traje: tr, anim: new IH.Esq.Animador(IH.sprite(tr), anim), x: 150 + i * 120, y: 330, dir: -1, z: 5 });
      }
    },
    actualizar(cine, dt) {
      if (Math.random() < dt * 3) IH.audio.sfx('paso', { vol: 0.15, superficie: 'tierra' });
    },
  });

  // ---- la marcha hacia el norte junto al Nilo (atardecer)
  L.marcha = {
    ancho: 1000, alto: 360,
    construir() {
      const H = F.HORAS.tarde;
      const lz = IH.lienzo(this.ancho, 360);
      const x = lz.x;
      const rng = new IH.Azar(31);
      G.degradado(x, 0, 0, this.ancho, 250, H.cielo);
      x.drawImage(G.brillo(130, '#ffd090', 0.6), 640 - 130, 215 - 130);
      G.circulo(x, 640, 218, 18, '#ffe8b0');
      for (let i = 0; i < 6; i++) F.nube(x, rng.entero(0, this.ancho), rng.entero(40, 150), rng.entero(50, 120), H, rng);
      G.degradado(x, 0, 232, this.ancho, 40, ['#d8905a', '#a86a5a', '#6a4a5a', '#3a3048']);
      for (let i = 0; i < 300; i++) R(x, rng.entero(0, this.ancho), rng.entero(234, 270), rng.entero(2, 7), 1, 'rgba(255,210,160,0.4)');
      // orilla lejana con palmeras
      for (let px = 0; px < this.ancho; px += rng.entero(8, 22)) F.palmera(x, px, 236, rng.entero(14, 26), rng, { hoja: '#3a2a34', hojaLuz: '#4a3440', tronco: '#2e2028', datiles: false });
      R(x, 0, 234, this.ancho, 3, '#3a2a34');
      // camino de la orilla cercana
      G.degradado(x, 0, 270, this.ancho, 90, ['#4a3436', '#3a2a2e', '#2a1e22', '#1e1418']);
      this.fondo = lz;
      this.grupo = [];
      for (let i = 0; i < 40; i++) {
        const tipo = rng.sig();
        this.grupo.push({ x: i * 42 + rng.rango(-10, 10), y: 300 + rng.rango(-6, 6), tipo: tipo < 0.25 ? 'jinete' : tipo < 0.35 ? 'camello' : 'infante', f: rng.rango(0, 6), lanza: rng.prob(0.6), banderin: rng.prob(0.3) ? '#d9a521' : null });
      }
      this.grupo.sort((a, b) => a.y - b.y);
    },
    dibujar(ctx, t, cine, cx, cy) {
      ctx.drawImage(this.fondo.c, -cx, -cy);
      for (const g of this.grupo) {
        const xx = ((g.x + t * 14) % 1700) - 300 - cx;
        if (xx < -60 || xx > 700) continue;
        if (g.tipo === 'jinete') jinete(ctx, xx, g.y - cy, 1, { t, fase: g.f, lanza: g.lanza, banderin: g.banderin, casco: 'conico', color: '#120c12' });
        else if (g.tipo === 'camello') camello(ctx, xx, g.y - cy, 1.1, { t, fase: g.f, carga: '#3a2420', color: '#120c12' });
        else {
          const p = Math.sin(t * 6 + g.f);
          ctx.fillStyle = '#120c12';
          R(ctx, xx - 3, g.y - cy - 26, 6, 14, '#120c12');
          R(ctx, xx - 3, g.y - cy - 32, 6, 6, '#120c12');
          poli(ctx, [[xx - 3, g.y - cy - 32], [xx, g.y - cy - 37], [xx + 3, g.y - cy - 32]], '#120c12');
          R(ctx, xx - 2 + p, g.y - cy - 12, 2, 12, '#120c12');
          R(ctx, xx + 1 - p, g.y - cy - 12, 2, 12, '#120c12');
          if (g.lanza) R(ctx, xx + 4, g.y - cy - 44, 1, 36, '#120c12');
        }
      }
    },
  };

  // ---- los dos campamentos frente a frente (noche) con fuego griego cruzando el canal
  L.campamentos = {
    ancho: 900, alto: 360,
    construir() {
      const f = F.construir('campamento', 900, {});
      this.capas = f.capas;
      this.fuegos = [];
    },
    actualizar(cine, dt) {
      if (Math.random() < dt * 0.5) {
        const dir = Math.random() < 0.6 ? 1 : -1;
        this.fuegos.push({ x0: dir > 0 ? 80 : 820, y0: 280, x1: dir > 0 ? 700 : 150, y1: 236, t: 0, dur: 2.4 });
        IH.audio.sfx('fuego', { vol: 0.4 });
      }
      for (const f of this.fuegos) f.t += dt;
      this.fuegos = this.fuegos.filter((f) => {
        if (f.t >= f.dur) {
          cine.particulas.emitir('chispa', f.x1, f.y1, 10);
          IH.audio.sfx('explosion', { vol: 0.25 });
          return false;
        }
        return true;
      });
    },
    dibujar(ctx, t, cine, cx, cy, fx) {
      for (const c of this.capas) if (!c.delante) ctx.drawImage(c.lz.c, -Math.round(fx * c.factor), -cy);
      // oscuridad nocturna con hogueras
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#8a94b8';
      ctx.fillRect(-2, -2, IH.ANCHO + 4, IH.ALTO + 4);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) {
        const lx = 40 + i * 120 - fx * 0.7, ly = 286;
        ctx.globalAlpha = 0.5 + U.ruido(t * 6 + i, 1) * 0.3;
        ctx.drawImage(G.brillo(30, '#ff8a3a', 0.8), lx - 30, ly - 30 - cy);
      }
      // fuego griego: "como un dragón que volase por el aire" (Joinville)
      for (const f of this.fuegos) {
        const k = f.t / f.dur;
        const px = U.lerp(f.x0, f.x1, k) - fx * 0.5;
        const py = U.lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * 120 - cy;
        ctx.globalAlpha = 1;
        ctx.drawImage(G.brillo(16, '#ffb040', 1), px - 16, py - 16);
        for (let j = 1; j < 10; j++) {
          const kk = Math.max(0, k - j * 0.012);
          const qx = U.lerp(f.x0, f.x1, kk) - fx * 0.5, qy = U.lerp(f.y0, f.y1, kk) - Math.sin(kk * Math.PI) * 120 - cy;
          ctx.globalAlpha = 0.6 - j * 0.05;
          R(ctx, qx, qy, 3, 2, j < 4 ? '#ffe08a' : '#ff7a2a');
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      for (const c of this.capas) if (c.delante) ctx.drawImage(c.lz.c, -Math.round(fx * c.factor), -cy);
    },
  };

  // ---- el vado al amanecer: jinetes francos cruzando entre la niebla (8 de febrero de 1250)
  L.vado = {
    ancho: 900, alto: 360,
    construir() {
      const H = F.HORAS.amanecer;
      const lz = IH.lienzo(this.ancho, 360);
      const x = lz.x;
      const rng = new IH.Azar(8);
      G.degradado(x, 0, 0, this.ancho, 240, ['#3a3a5a', '#5a5270', '#8a7088', '#b89098', '#d8b4a8', '#e8ccb4']);
      x.drawImage(G.brillo(140, '#ffe0c0', 0.5), 700 - 140, 230 - 140);
      for (let px = 0; px < this.ancho; px += rng.entero(10, 24)) F.palmera(x, px, 236, rng.entero(18, 34), rng, { hoja: '#6a5a6e', hojaLuz: '#7a6a7e', tronco: '#5a4a5e', datiles: false });
      R(x, 0, 234, this.ancho, 6, '#6a5a6e');
      G.degradado(x, 0, 240, this.ancho, 120, ['#a88a94', '#7a6a80', '#5a5070', '#3a3a58', '#2a2a44']);
      this.fondo = lz;
      this.jinetes = [];
      for (let i = 0; i < 34; i++) this.jinetes.push({ x: rng.rango(-200, 900), y: rng.rango(262, 330), e: 0, f: rng.rango(0, 6), banderin: rng.prob(0.3) ? rng.elegir(['#b3262a', '#e8e0d0', '#2d4f86']) : null, casco: rng.prob(0.6) ? 'yelmo' : 'nasal' });
      this.jinetes.sort((a, b) => a.y - b.y);
    },
    actualizar(cine, dt) {
      if (Math.random() < dt * 1.5) IH.audio.sfx('caballo', { vol: 0.2 });
    },
    dibujar(ctx, t, cine, cx, cy) {
      ctx.drawImage(this.fondo.c, -cx, -cy);
      for (const j of this.jinetes) {
        const e = 0.7 + (j.y - 262) / 68 * 0.7;
        const xx = ((j.x + t * 9 * e) % 1100) - 100 - cx;
        const niebla = 1 - (j.y - 262) / 68;
        const col = U.mezclar('#141018', '#9a8a9c', niebla * 0.7);
        jinete(ctx, xx, j.y - cy, e, { t, fase: j.f, lanza: true, banderin: j.banderin ? U.mezclar(j.banderin, '#9a8a9c', niebla * 0.6) : null, color: col, casco: j.casco, colorLanza: col });
        // salpicaduras
        if (Math.random() < 0.02) cine.particulas.emitir('gota', xx + cx, j.y - 4, 2);
        ctx.globalAlpha = 0.35;
        R(ctx, xx - 14 * e, j.y - cy - 1, 30 * e, 1, '#d8c4c4');
        ctx.globalAlpha = 1;
      }
      // bancos de niebla
      for (let i = 0; i < 6; i++) {
        const yy = 240 + i * 18;
        const desp = (t * (3 + i)) % 300;
        ctx.globalAlpha = 0.18;
        for (let k = -1; k < 4; k++) {
          ctx.drawImage(G.brillo(90, '#f0dcd4', 0.9), k * 300 + desp - cx * 0.5 - 90, yy - 60 - cy);
        }
      }
      ctx.globalAlpha = 1;
    },
  };

  // ---- presentación de personaje (retrato grande, nombre y epíteto)
  L.presentacion = {
    ancho: 640, alto: 360,
    construir() {
      const lz = IH.lienzo(640, 360);
      G.degradado(lz.x, 0, 0, 640, 360, ['#1a0c0a', '#2a1210', '#3a1a12', '#2a1210', '#140808']);
      this.fondo = lz;
    },
    actualizar(cine, dt) {
      if (Math.random() < dt * 14) cine.particulas.emitir('brasa', U.lerp(0, 640, Math.random()), 370, 1, { fuerza: 2 });
      if (Math.random() < dt * 3) cine.particulas.emitir('humo', U.lerp(0, 640, Math.random()), 380, 1, { color: '#2a1a18' });
    },
    dibujar(ctx, t, cine, cx, cy) {
      ctx.drawImage(this.fondo.c, -cx, -cy);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.25 + 0.08 * Math.sin(t * 2);
      ctx.drawImage(G.brillo(200, '#ff6a2a', 0.6), 160 - 200, 360 - 200);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
    dibujarUI(ctx, t, cine) {
      const p = cine.plano.presentacion;
      if (!p) return;
      const T = IH.T;
      const a = U.suave((t - 0.4) / 1.4);
      const salida = cine.fase === 'salida' ? 1 - U.suave(cine.tSalida / 1.2) : 1;
      ctx.save();
      ctx.globalAlpha = a * salida;
      IH.Retratos.dibujar(ctx, p.retrato, 300 - (1 - a) * 60, 200, 560, { emocion: p.emocion || 'serio', fondo1: '#4a1a14', fondo2: '#140808' });
      T.linea(ctx, p.nombre, 1000 + (1 - a) * 60, 470, { tam: 92, familia: T.TITULO, peso: 600, color: T.COLORES.oroClaro, espaciado: 4 });
      if (p.arabe) T.linea(ctx, p.arabe, 1000 + (1 - a) * 60, 360, { tam: 80, familia: T.ARABE, color: T.COLORES.oro });
      ctx.fillStyle = T.COLORES.oro;
      ctx.fillRect(1000, 500, 600 * a, 3);
      T.parrafo(ctx, p.epiteto, 1000, 520, { tam: 40, ancho: 780, cursiva: true, color: T.COLORES.texto });
      ctx.restore();
    },
  };

  // ---- pantalla negra para frases solemnes
  L.negro = {
    ancho: 640, alto: 360,
    dibujar(ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(-2, -2, IH.ANCHO + 4, IH.ALTO + 4);
    },
  };

  // ---- las estepas: los jinetes del este (avance del capítulo II)
  L.estepa = {
    ancho: 900, alto: 360,
    construir() {
      const lz = IH.lienzo(this.ancho, 360);
      const x = lz.x;
      const rng = new IH.Azar(1258);
      G.degradado(x, 0, 0, this.ancho, 250, ['#1a1416', '#2a1c1c', '#4a2a22', '#7a3a24', '#a85a2a', '#c87a3a']);
      x.drawImage(G.brillo(110, '#ff6a2a', 0.6), 300 - 110, 236 - 110);
      G.circulo(x, 300, 236, 22, '#d8402a');
      // nubes de tormenta
      for (let i = 0; i < 14; i++) {
        const nx = rng.entero(0, this.ancho), ny = rng.entero(10, 110);
        for (let j = 0; j < 8; j++) G.circulo(x, nx + j * 12, ny + Math.sin(j) * 4, rng.entero(8, 18), j % 2 ? '#2a1a1c' : '#3a2224');
      }
      F.montes(x, this.ancho, 252, 14, '#2a1612', 21, 0.02);
      G.degradado(x, 0, 252, this.ancho, 108, ['#3a2214', '#2a180e', '#1a0e08', '#0e0804']);
      this.fondo = lz;
      this.horda = [];
      for (let i = 0; i < 70; i++) this.horda.push({ x: rng.rango(-100, 1000), y: rng.rango(250, 330), f: rng.rango(0, 6), tug: rng.prob(0.08), lanza: rng.prob(0.4) });
      this.horda.sort((a, b) => a.y - b.y);
      this.rayo = 0;
    },
    actualizar(cine, dt) {
      this.rayo = Math.max(0, this.rayo - dt * 3);
      if (Math.random() < dt * 0.25) {
        this.rayo = 1;
        IH.audio.sfx('trueno', { vol: 0.6 });
      }
      if (Math.random() < dt * 20) cine.particulas.emitir('polvo', U.lerp(0, 900, Math.random()), 330, 1, { color: '#4a3020', vx: 40 });
    },
    dibujar(ctx, t, cine, cx, cy) {
      ctx.drawImage(this.fondo.c, -cx, -cy);
      for (const h of this.horda) {
        const e = 0.55 + (h.y - 250) / 80 * 0.8;
        const xx = ((h.x + t * 40 * e) % 1100) - 100 - cx;
        jinete(ctx, xx, h.y - cy, e, { t, fase: h.f, galope: true, lanza: h.lanza, tug: h.tug, color: '#0a0606', casco: 'conico', lanzaAng: -0.5 });
      }
      if (this.rayo > 0) {
        ctx.globalAlpha = this.rayo * 0.5;
        ctx.fillStyle = '#e8e0f0';
        ctx.fillRect(-2, -2, IH.ANCHO + 4, IH.ALTO + 4);
        ctx.globalAlpha = 1;
      }
    },
  };

  // ---- Bagdad arde (febrero de 1258)
  L.bagdad = {
    ancho: 800, alto: 360,
    construir() {
      const lz = IH.lienzo(this.ancho, 360);
      const x = lz.x;
      const rng = new IH.Azar(656);
      G.degradado(x, 0, 0, this.ancho, 260, ['#0a0608', '#1a0a0a', '#3a1210', '#6a1e12', '#a83a18']);
      let bx = 0;
      while (bx < this.ancho) {
        const w = rng.entero(16, 40), h = rng.entero(20, 70);
        F.edificio(x, rng, bx, 262, w, h, { H: F.HORAS.noche, detalle: 0, color: '#1a0e0e', planta: false });
        if (rng.prob(0.15)) F.cupula(x, bx + w / 2, 262 - h, rng.entero(8, 16), { color: '#1a0e0e', hueco: '#ff8a3a', remate: '#1a0e0e' });
        else if (rng.prob(0.1)) F.minarete(x, bx + w / 2, 262 - h, rng.entero(60, 90), { color: '#1a0e0e', hueco: '#ff9a4a', estilo: 'cilindrico', remate: '#1a0e0e' });
        bx += w;
      }
      G.degradado(x, 0, 262, this.ancho, 98, ['#5a1a10', '#3a120c', '#200a08', '#100404']);
      this.fondo = lz;
    },
    actualizar(cine, dt) {
      if (Math.random() < dt * 25) cine.particulas.emitir('brasa', U.lerp(0, 800, Math.random()), 262, 1, { fuerza: 2.5 });
      if (Math.random() < dt * 8) cine.particulas.emitir('humo', U.lerp(0, 800, Math.random()), 230, 1, { color: '#1a0e0c', viento: 8 });
      if (Math.random() < dt * 6) cine.particulas.emitir('fuego', U.lerp(0, 800, Math.random()), 250, 2, { fuerza: 2, tam: 1.5 });
    },
    dibujar(ctx, t, cine, cx, cy) {
      ctx.drawImage(this.fondo.c, -cx, -cy);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 7; i++) {
        ctx.globalAlpha = 0.35 + U.ruido(t * 3 + i * 2, 4) * 0.3;
        ctx.drawImage(G.brillo(80, '#ff5a1a', 0.7), i * 120 + 40 - cx - 80, 250 - cy - 80);
      }
      // reflejo en el Tigris
      for (let i = 0; i < 60; i++) {
        const yy = 268 + ((i * 13) % 80);
        const xx = (i * 71 + t * 6) % 800;
        ctx.globalAlpha = 0.4;
        R(ctx, xx - cx, yy - cy, 4, 1, '#ff8a3a');
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };

  // ---- las calles de Mansura tras la batalla
  L.ruinas = escenaSprites({
    ancho: 820,
    fondo() {
      return F.construir('mansura', 820, { hora: 'tarde', semilla: 51 }).capas;
    },
    actores: [
      { traje: 'sargento', anim: 'yacer', x: 210, y: 300, dir: 1 },
      { traje: 'caballero', anim: 'yacer', x: 340, y: 304, dir: -1 },
      { traje: 'sargentoRojo', anim: 'yacer', x: 520, y: 300, dir: 1 },
      { traje: 'mameluco', anim: 'quieto', x: 420, y: 300, dir: -1, z: 2 },
      { traje: 'yusufSoldado', anim: 'arrodillado', x: 470, y: 302, dir: -1, z: 2 },
      { traje: 'recluta1', anim: 'quieto', x: 600, y: 300, dir: -1, z: 2 },
    ],
    actualizar(cine, dt) {
      if (Math.random() < dt * 4) cine.particulas.emitir('humo', U.lerp(0, 820, Math.random()), 300, 1, { color: '#3a2e2c', viento: 6 });
      if (Math.random() < dt * 3) cine.particulas.emitir('brasa', U.lerp(0, 820, Math.random()), 300, 1);
    },
  });
})();
