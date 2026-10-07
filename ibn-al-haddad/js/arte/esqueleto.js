/* Esqueleto 2D para personajes.
 *
 * Cada personaje se describe con un "traje" (colores, tocado, túnica, armadura, arma, escudo)
 * y se anima con poses (ángulos de articulaciones u objetivos de cinemática inversa).
 * Al cargar, cada pose se dibuja a resolución nativa y se "hornea" como pixel art:
 *   1) umbral de alfa (bordes nítidos)
 *   2) cada píxel se ajusta a la paleta del traje
 *   3) luz de borde (arriba-delante) y sombra (abajo-detrás)
 *   4) contorno exterior oscuro de 1 píxel
 * El resultado es una hoja de sprites por personaje; en juego solo se copian rectángulos.
 *
 * Convención de ángulos (grados): 0 = hacia abajo, 90 = hacia delante, 180 = hacia arriba,
 * -90 = hacia atrás. El personaje mira a la derecha (+x).
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const RAD = Math.PI / 180;

  const FW = 112, FH = 100, AX = 56, AY = 92; // tamaño del fotograma y ancla (pies)

  const BASE = {
    x: 0, y: -26, tor: 3, cab: 0,
    hD: 8, cD: 14, hT: -6, cT: 12,
    mD: 4, rD: 4, mT: -4, rT: 4,
    pD: 0, pT: 0, arma: 20, armaT: 0, giro: 0, ojos: 1, capa: 0, escudoA: 0,
  };

  const v = (x, y) => [x, y];
  const sum = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const dirA = (g) => [Math.sin(g * RAD), Math.cos(g * RAD)];
  const angDe = (d) => Math.atan2(d[0], d[1]) / RAD;
  const perp = (d) => [-d[1], d[0]];

  function ik(raiz, obj, a, b, signo) {
    let dx = obj[0] - raiz[0], dy = obj[1] - raiz[1];
    let d = Math.hypot(dx, dy);
    const dmax = a + b - 0.01, dmin = Math.abs(a - b) + 0.01;
    if (d > dmax) {
      dx *= dmax / d;
      dy *= dmax / d;
      d = dmax;
    }
    if (d < dmin) d = dmin;
    const base = Math.atan2(dy, dx);
    const alfa = Math.acos(U.clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const c1 = [raiz[0] + Math.cos(base + alfa) * a, raiz[1] + Math.sin(base + alfa) * a];
    const c2 = [raiz[0] + Math.cos(base - alfa) * a, raiz[1] + Math.sin(base - alfa) * a];
    const cruz = (c) => dx * (c[1] - raiz[1]) - dy * (c[0] - raiz[0]);
    const j = signo < 0 ? (cruz(c1) < 0 ? c1 : c2) : cruz(c1) > 0 ? c1 : c2;
    const fin = [j[0] + ((raiz[0] + dx) - j[0]), j[1] + ((raiz[1] + dy) - j[1])];
    // reajusta para que el segundo hueso mida b
    const dj = [fin[0] - j[0], fin[1] - j[1]];
    const lj = Math.hypot(dj[0], dj[1]) || 1;
    return [j, [j[0] + (dj[0] / lj) * b, j[1] + (dj[1] / lj) * b]];
  }

  // Calcula los puntos del esqueleto a partir de una pose
  function calcular(p, t) {
    const s = t.escala || 1;
    const L = {
      muslo: 12 * s * (t.piernas || 1),
      pierna: 12 * s * (t.piernas || 1),
      torso: 14.2 * s * (t.torso || 1),
      cuello: 2 * s,
      cabeza: 5.1 * s * (t.cabezaEsc || 1),
      brazo: 9.5 * s,
      antebrazo: 8.6 * s,
    };
    const alturaPelvis = L.muslo + L.pierna + 2 * s;
    const pel = v(p.x * s, -alturaPelvis + (p.y + 26) * s);
    const td = [Math.sin(p.tor * RAD), -Math.cos(p.tor * RAD)];
    const cuello = sum(pel, mul(td, L.torso));
    const angCab = p.tor + p.cab;
    const tdc = [Math.sin(angCab * RAD), -Math.cos(angCab * RAD)];
    const cabeza = sum(cuello, mul(tdc, L.cuello + L.cabeza * 0.85));
    const hombro = sum(pel, mul(td, L.torso - 2.2 * s));
    const hD = sum(hombro, [0.6, 0]);
    const hT = sum(hombro, [-0.6, 0]);
    const k = { s, L, pel, td, cuello, cabeza, tdc, angCab, hombro, hombroD: hD, hombroT: hT, p };
    // brazos
    if (p.tMD) {
      const r = ik(hD, [p.tMD[0] * s, p.tMD[1] * s], L.brazo, L.antebrazo, 1);
      k.codoD = r[0];
      k.manoD = r[1];
    } else {
      k.codoD = sum(hD, mul(dirA(p.hD), L.brazo));
      k.manoD = sum(k.codoD, mul(dirA(p.hD + p.cD), L.antebrazo));
    }
    if (p.tMT) {
      const r = ik(hT, [p.tMT[0] * s, p.tMT[1] * s], L.brazo, L.antebrazo, 1);
      k.codoT = r[0];
      k.manoT = r[1];
    } else {
      k.codoT = sum(hT, mul(dirA(p.hT), L.brazo));
      k.manoT = sum(k.codoT, mul(dirA(p.hT + p.cT), L.antebrazo));
    }
    // piernas
    const cD = sum(pel, [0.6 * s, 0]);
    const cT = sum(pel, [-0.6 * s, 0]);
    k.caderaD = cD;
    k.caderaT = cT;
    if (p.tD) {
      const r = ik(cD, [p.tD[0] * s, p.tD[1] * s], L.muslo, L.pierna, -1);
      k.rodillaD = r[0];
      k.tobilloD = r[1];
    } else {
      k.rodillaD = sum(cD, mul(dirA(p.mD), L.muslo));
      k.tobilloD = sum(k.rodillaD, mul(dirA(p.mD - p.rD), L.pierna));
    }
    if (p.tT) {
      const r = ik(cT, [p.tT[0] * s, p.tT[1] * s], L.muslo, L.pierna, -1);
      k.rodillaT = r[0];
      k.tobilloT = r[1];
    } else {
      k.rodillaT = sum(cT, mul(dirA(p.mT), L.muslo));
      k.tobilloT = sum(k.rodillaT, mul(dirA(p.mT - p.rT), L.pierna));
    }
    k.manoArma = k.manoD;
    return k;
  }

  // ------------------------------------------------------------------ pintor con registro de paleta
  const cachePatrones = new Map();
  class Pintor {
    constructor(x) {
      this.x = x;
      this.paleta = new Set();
    }
    color(c) {
      this.paleta.add(c);
      return c;
    }
    linea(a, b, w, c, borde) {
      const x = this.x;
      x.lineCap = 'round';
      x.lineJoin = 'round';
      if (borde) {
        x.strokeStyle = this.color(borde);
        x.lineWidth = w + 1.3;
        x.beginPath();
        x.moveTo(a[0], a[1]);
        x.lineTo(b[0], b[1]);
        x.stroke();
      }
      x.strokeStyle = this.color(c);
      x.lineWidth = w;
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.lineTo(b[0], b[1]);
      x.stroke();
    }
    poli(pts, c, borde, cerrar = true) {
      const x = this.x;
      x.beginPath();
      x.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
      if (cerrar) x.closePath();
      x.fillStyle = typeof c === 'string' ? this.color(c) : c;
      x.fill();
      if (borde) {
        x.strokeStyle = this.color(borde);
        x.lineWidth = 1;
        x.lineJoin = 'round';
        x.stroke();
      }
    }
    circulo(c, r, col, borde) {
      const x = this.x;
      x.beginPath();
      x.arc(c[0], c[1], r, 0, Math.PI * 2);
      x.fillStyle = this.color(col);
      x.fill();
      if (borde) {
        x.strokeStyle = this.color(borde);
        x.lineWidth = 1;
        x.stroke();
      }
    }
    elipse(c, rx, ry, rot, col, borde) {
      const x = this.x;
      x.beginPath();
      x.ellipse(c[0], c[1], Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
      x.fillStyle = typeof col === 'string' ? this.color(col) : col;
      x.fill();
      if (borde) {
        x.strokeStyle = this.color(borde);
        x.lineWidth = 1;
        x.stroke();
      }
    }
    pixel(px, py, col) {
      this.x.fillStyle = this.color(col);
      this.x.fillRect(Math.round(px - 0.5), Math.round(py - 0.5), 1, 1);
    }
    patron(c1, c2, tipo) {
      this.color(c1);
      this.color(c2);
      const clave = c1 + c2 + tipo;
      let t = cachePatrones.get(clave);
      if (!t) {
        t = IH.lienzo(4, 4);
        t.x.fillStyle = c1;
        t.x.fillRect(0, 0, 4, 4);
        t.x.fillStyle = c2;
        if (tipo === 'malla') {
          for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) if ((xx + yy * 2) % 4 === 0 || ((xx + 2 + yy * 2) % 4 === 0 && yy % 2)) t.x.fillRect(xx, yy, 1, 1);
        } else if (tipo === 'laminar') {
          t.x.fillRect(0, 2, 4, 1);
          t.x.fillRect(1, 0, 1, 2);
          t.x.fillRect(3, 3, 1, 1);
        } else if (tipo === 'rayas') {
          t.x.fillRect(0, 0, 4, 2);
        } else if (tipo === 'acolchado') {
          t.x.fillRect(0, 0, 1, 4);
          t.x.fillRect(2, 0, 1, 4);
        }
        cachePatrones.set(clave, t);
      }
      let pat = this.patrones && this.patrones.get(clave);
      if (!pat) {
        pat = this.x.createPattern(t.c, 'repeat');
        if (!this.patrones) this.patrones = new Map();
        this.patrones.set(clave, pat);
      }
      return pat;
    }
  }

  // ------------------------------------------------------------------ dibujo de partes
  function puntoEnPierna(k, lado, dist) {
    const c = lado === 'D' ? k.caderaD : k.caderaT;
    const r = lado === 'D' ? k.rodillaD : k.rodillaT;
    const t = lado === 'D' ? k.tobilloD : k.tobilloT;
    const lm = Math.hypot(r[0] - c[0], r[1] - c[1]);
    if (dist <= lm) return sum(c, mul([r[0] - c[0], r[1] - c[1]], dist / lm));
    const lp = Math.hypot(t[0] - r[0], t[1] - r[1]);
    return sum(r, mul([t[0] - r[0], t[1] - r[1]], Math.min(1.3, (dist - lm) / lp)));
  }

  function dibujarPierna(P, k, lado, traje, oscuro) {
    const s = k.s;
    const c = lado === 'D' ? k.caderaD : k.caderaT;
    const r = lado === 'D' ? k.rodillaD : k.rodillaT;
    const t = lado === 'D' ? k.tobilloD : k.tobilloT;
    const sombra = oscuro ? -0.22 : 0;
    const pant = U.tono(traje.pantalon || traje.piel, sombra);
    const borde = U.tono(pant, -0.35);
    const malla = traje.malla ? P.patron(U.tono(traje.malla, sombra), U.tono(traje.malla, sombra - 0.25), 'malla') : null;
    P.linea(c, r, 5.2 * s, pant, borde);
    P.linea(r, t, 4.2 * s, pant, borde);
    if (malla) {
      P.x.save();
      P.linea(c, r, 4.6 * s, malla);
      P.linea(r, t, 3.6 * s, malla);
      P.x.restore();
    }
    if (traje.vendas) {
      // polainas/vendas en la espinilla
      const m = sum(r, mul([t[0] - r[0], t[1] - r[1]], 0.45));
      P.linea(m, t, 4.4 * s, U.tono(traje.vendas, sombra), U.tono(traje.vendas, sombra - 0.3));
    }
    // pie
    const p = k.p;
    const tilt = lado === 'D' ? p.pD : p.pT;
    const ang = 90 - tilt;
    const zap = U.tono(traje.calzado || '#4a2c1c', sombra);
    const punta = sum(t, mul(dirA(ang), 4.6 * s));
    const talon = sum(t, mul(dirA(ang), -1.2 * s));
    P.linea(talon, punta, 2.6 * s, zap, U.tono(zap, -0.4));
  }

  function dibujarBrazo(P, k, lado, traje, oscuro) {
    const s = k.s;
    const h = lado === 'D' ? k.hombroD : k.hombroT;
    const c = lado === 'D' ? k.codoD : k.codoT;
    const m = lado === 'D' ? k.manoD : k.manoT;
    const sombra = oscuro ? -0.22 : 0;
    const manga = U.tono(traje.manga || traje.tunica, sombra);
    const piel = U.tono(traje.piel, sombra);
    const bordeM = U.tono(manga, -0.38);
    let colAnte = traje.mangaLarga === false ? piel : manga;
    let colBrazo = manga;
    if (traje.malla && traje.mallaBrazos !== false) {
      colBrazo = U.tono(traje.malla, sombra);
      colAnte = colBrazo;
    }
    P.linea(h, c, 4.1 * s, colBrazo, U.tono(colBrazo, -0.38));
    P.linea(c, m, 3.6 * s, colAnte, U.tono(colAnte, -0.38));
    if (traje.malla && traje.mallaBrazos !== false) {
      const pat = P.patron(U.tono(traje.malla, sombra), U.tono(traje.malla, sombra - 0.28), 'malla');
      P.x.save();
      P.linea(h, c, 3.3 * s, pat);
      P.linea(c, m, 2.8 * s, pat);
      P.x.restore();
    } else if (traje.tiraz) {
      // banda de tiraz (inscripción bordada en la manga)
      const a = sum(h, mul([c[0] - h[0], c[1] - h[1]], 0.45));
      const b = sum(h, mul([c[0] - h[0], c[1] - h[1]], 0.62));
      P.linea(a, b, 4.2 * s, U.tono(traje.tiraz, sombra));
    }
    if (traje.brazales) {
      const a = sum(c, mul([m[0] - c[0], m[1] - c[1]], 0.3));
      P.linea(a, sum(m, mul([c[0] - m[0], c[1] - m[1]], 0.15)), 3.9 * s, U.tono(traje.brazales, sombra), U.tono(traje.brazales, sombra - 0.35));
    }
    const guante = traje.guantes ? U.tono(traje.guantes, sombra) : piel;
    P.circulo(m, 1.9 * s, guante, U.tono(guante, -0.35));
  }

  function falda(k, traje) {
    // Faldón de la túnica: sigue a las rodillas para que se mueva al andar
    const s = k.s;
    const largo = traje.largo == null ? 0.85 : traje.largo;
    const dist = largo * (k.L.muslo + k.L.pierna);
    const pD = puntoEnPierna(k, 'D', dist);
    const pT = puntoEnPierna(k, 'T', dist);
    const mD = puntoEnPierna(k, 'D', dist * 0.55);
    const mT = puntoEnPierna(k, 'T', dist * 0.55);
    const ancho = (traje.vuelo || 1) * 3.2 * s;
    let delante = Math.max(pD[0], pT[0]) + ancho;
    let detras = Math.min(pD[0], pT[0]) - ancho;
    const minAncho = 9 * s * (traje.vuelo || 1);
    if (delante - detras < minAncho) {
      const c = (delante + detras) / 2;
      delante = c + minAncho / 2;
      detras = c - minAncho / 2;
    }
    const yBajo = Math.max(pD[1], pT[1]);
    const yD = U.lerp(yBajo, pD[1], 0.5);
    const yT = U.lerp(yBajo, pT[1], 0.5);
    const cintura = k.pel;
    const fwd = perp(k.td); // perpendicular al torso, hacia delante
    const anchoC = 4.6 * s * (traje.panza || 1);
    const cinAtras = sum(cintura, mul(fwd, -anchoC));
    const cinDelante = sum(cintura, mul(fwd, anchoC));
    return [
      cinAtras,
      cinDelante,
      [Math.max(mD[0], mT[0]) + ancho * 0.8, U.lerp(cintura[1], yD, 0.5)],
      [delante, yD + 0.5],
      [U.lerp(detras, delante, 0.5), yBajo + 1.2],
      [detras, yT + 0.5],
      [Math.min(mD[0], mT[0]) - ancho * 0.8, U.lerp(cintura[1], yT, 0.5)],
    ];
  }

  function torsoPoli(k, traje, ancho = 1) {
    const s = k.s;
    const pT = perp(k.td); // perpendicular al torso, hacia delante
    const anchoC = 4.8 * s * (traje.panza || 1) * ancho;
    const anchoH = 5.8 * s * (traje.hombros || 1) * ancho;
    const pecho = sum(k.pel, mul(k.td, k.L.torso * 0.62));
    const anchoP = 5.9 * s * (traje.panza ? Math.max(1, traje.panza * 0.95) : 1) * ancho;
    return [
      sum(k.pel, mul(pT, -anchoC)),
      sum(pecho, mul(pT, -anchoP - 0.4 * s)),
      sum(k.cuello, mul(pT, -anchoH * 0.85)),
      sum(k.cuello, mul(pT, anchoH * 0.8)),
      sum(pecho, mul(pT, anchoP * 0.9)),
      sum(k.pel, mul(pT, anchoC)),
    ];
  }

  function emblema(P, centro, tipo, color, s) {
    if (tipo === 'cruz') {
      P.linea(sum(centro, [0, -2.6 * s]), sum(centro, [0, 2.6 * s]), 1.2, color);
      P.linea(sum(centro, [-1.8 * s, -0.8 * s]), sum(centro, [1.8 * s, -0.8 * s]), 1.2, color);
    } else if (tipo === 'leon') {
      P.circulo(centro, 1.6 * s, color);
    } else if (tipo === 'flor') {
      P.circulo(centro, 1.2 * s, color);
      P.pixel(centro[0], centro[1] - 2 * s, color);
    }
  }

  function dibujarCuerpo(P, k, traje) {
    const s = k.s;
    const tun = traje.tunica;
    const bordeT = U.tono(tun, -0.35);
    // malla larga bajo la túnica/sobreveste
    if (traje.malla) {
      const tm = Object.assign({}, traje, { largo: (traje.largoMalla || 0.75) });
      const pat = P.patron(traje.malla, U.tono(traje.malla, -0.28), 'malla');
      P.poli(falda(k, tm), pat, U.tono(traje.malla, -0.4));
      P.poli(torsoPoli(k, traje), pat, U.tono(traje.malla, -0.4));
    }
    // faldón
    if (traje.largo !== 0) P.poli(falda(k, traje), tun, bordeT);
    if (traje.bordeFalda) {
      const f = falda(k, traje);
      P.linea(f[5], f[4], 1.4, traje.bordeFalda);
      P.linea(f[4], f[3], 1.4, traje.bordeFalda);
    }
    // torso
    if (!traje.sinTorsoTunica) P.poli(torsoPoli(k, traje), tun, bordeT);
    // armadura laminar / gambesón / sobreveste
    if (traje.laminar) {
      const pat = P.patron(traje.laminar, U.tono(traje.laminar, -0.3), 'laminar');
      const pts = torsoPoli(k, traje, 1.04);
      P.poli(pts, pat, U.tono(traje.laminar, -0.45));
      // faldar laminar
      const tf = Object.assign({}, traje, { largo: 0.42, vuelo: 1.15 });
      P.poli(falda(k, tf), pat, U.tono(traje.laminar, -0.45));
    }
    if (traje.gambeson) {
      const pat = P.patron(traje.gambeson, U.tono(traje.gambeson, -0.18), 'acolchado');
      P.poli(torsoPoli(k, traje, 1.04), pat, U.tono(traje.gambeson, -0.4));
    }
    if (traje.sobreveste) {
      const sv = traje.sobreveste;
      const tf = Object.assign({}, traje, { largo: sv.largo || 0.7, vuelo: 1.1 });
      P.poli(falda(k, tf), sv.color, U.tono(sv.color, -0.35));
      P.poli(torsoPoli(k, traje, 1.06), sv.color, U.tono(sv.color, -0.35));
      if (sv.emblema) emblema(P, sum(k.pel, mul(k.td, k.L.torso * 0.55)), sv.emblema, sv.colorEmblema || '#b3262a', s);
    }
    if (traje.delantal) {
      const fwd = perp(k.td);
      const f = falda(k, Object.assign({}, traje, { largo: 0.78 }));
      const pecho = sum(k.pel, mul(k.td, k.L.torso * 0.78));
      const pz = traje.panza || 1;
      const pts = [
        sum(pecho, mul(fwd, -0.5 * s)),
        sum(pecho, mul(fwd, 5.6 * s * pz)),
        sum(k.pel, mul(fwd, 5.2 * s * pz)),
        sum(f[3], [0.8, 0]),
        f[4],
        sum(k.pel, mul(fwd, -1 * s)),
      ];
      P.poli(pts, traje.delantal, U.tono(traje.delantal, -0.4));
    }
    if (traje.chaleco) {
      const pts = torsoPoli(k, traje, 1.03);
      P.poli(pts, traje.chaleco, U.tono(traje.chaleco, -0.4));
    }
    // fajín
    if (traje.fajin) {
      const pT = perp(k.td);
      const c = sum(k.pel, mul(k.td, 1.2 * s));
      const a = 5 * s * (traje.panza || 1);
      P.linea(sum(c, mul(pT, -a)), sum(c, mul(pT, a)), 2.4 * s, traje.fajin, U.tono(traje.fajin, -0.4));
      if (traje.fajinCola) P.linea(sum(c, mul(pT, a * 0.7)), sum(sum(c, mul(pT, a + 1.5 * s)), [0, 6 * s]), 1.6 * s, traje.fajin);
    }
    if (traje.cinturon) {
      const pT = perp(k.td);
      const c = sum(k.pel, mul(k.td, 1.0 * s));
      const a = 5.1 * s * (traje.panza || 1);
      P.linea(sum(c, mul(pT, -a)), sum(c, mul(pT, a)), 1.3 * s, traje.cinturon);
    }
  }

  function dibujarCapa(P, k, traje) {
    if (!traje.capa) return;
    const s = k.s;
    const p = k.p;
    const viento = (p.capa || 0) + 0.6;
    const hombro = k.hombroT;
    const largo = (traje.capaLargo || 0.9) * (k.L.torso + k.L.muslo + k.L.pierna) * 0.8;
    const base = sum(k.pel, [-3 * s - viento * 6 * s, largo * 0.55]);
    const pts = [
      sum(hombro, [1.5 * s, -1]),
      sum(hombro, [-3 * s, 0]),
      [base[0] - 3 * s - viento * 3 * s, base[1]],
      [base[0] + 4 * s, base[1] + 1.5 * s],
      sum(k.pel, [1 * s, 2 * s]),
    ];
    P.poli(pts, U.tono(traje.capa, -0.12), U.tono(traje.capa, -0.45));
  }

  function dibujarCabeza(P, k, traje) {
    const s = k.s;
    const c = k.cabeza;
    const r = k.L.cabeza;
    const a = k.angCab;
    const fw = [Math.cos(a * RAD), Math.sin(a * RAD)]; // hacia delante (rotado con la cabeza)
    const up = [Math.sin(a * RAD), -Math.cos(a * RAD)];
    const at = (fx, fy) => sum(c, sum(mul(fw, fx * r), mul(up, fy * r)));
    const piel = traje.piel;
    const bordeP = U.tono(piel, -0.4);
    const tipo = traje.tocado || 'pelo';
    // cuello
    P.linea(k.cuello, at(-0.1, -0.6), 3 * s, piel, bordeP);
    // aventail / cofia de malla (debajo de la cara)
    if (tipo === 'cofia' || tipo === 'nasal' || tipo === 'yelmo' || traje.cofia) {
      const pat = P.patron(traje.colorMalla || '#8d9196', U.tono(traje.colorMalla || '#8d9196', -0.3), 'malla');
      P.elipse(at(-0.15, -0.05), r * 1.15, r * 1.2, a * RAD, pat, U.tono(traje.colorMalla || '#8d9196', -0.45));
    }
    if (tipo === 'velo') {
      P.poli([at(-1.25, 0.6), at(0.4, 1.25), at(0.9, 0.2), at(0.6, -1.3), at(-1.4, -2.6), at(-1.7, -1.3)], traje.colorTocado, U.tono(traje.colorTocado, -0.35));
    }
    // cara
    if (tipo !== 'yelmo') {
      P.elipse(at(0.05, 0), r * 0.95, r, a * RAD, piel, bordeP);
      // nariz
      P.poli([at(0.82, 0.12), at(1.18, -0.15), at(0.85, -0.38)], piel, bordeP);
      // ojo
      if (k.p.ojos > 0.5) P.pixel(at(0.5, 0.2)[0], at(0.5, 0.2)[1], traje.ojo || '#1d1210');
      else P.pixel(at(0.5, 0.1)[0], at(0.5, 0.1)[1], bordeP);
      // ceja
      if (traje.ceja !== false) P.linea(at(0.28, 0.48), at(0.72, 0.42), 0.9, traje.pelo || '#2a1a12');
    }
    // barba
    if (traje.barba && tipo !== 'yelmo') {
      const cb = traje.colorBarba || traje.pelo || '#2a1a12';
      const bb = U.tono(cb, -0.35);
      if (traje.barba === 'larga') {
        P.poli([at(-0.35, -0.2), at(0.55, -0.35), at(0.95, -0.55), at(0.75, -1.5), at(0.15, -2.05), at(-0.3, -1.2)], cb, bb);
      } else if (traje.barba === 'corta') {
        P.poli([at(-0.45, -0.1), at(0.5, -0.45), at(0.95, -0.6), at(0.7, -1.05), at(0.05, -1.05), at(-0.45, -0.6)], cb, bb);
      } else if (traje.barba === 'perilla') {
        P.poli([at(0.35, -0.55), at(0.95, -0.6), at(0.8, -1.25), at(0.4, -1.1)], cb, bb);
      } else if (traje.barba === 'bigote') {
        P.linea(at(0.55, -0.45), at(1.0, -0.5), 1, cb);
      }
      if (traje.barba !== 'perilla') P.linea(at(0.55, -0.45), at(1.05, -0.5), 1, cb);
    }
    // tocados
    const col = traje.colorTocado || '#e8dcc0';
    const col2 = traje.colorTocado2 || U.tono(col, -0.2);
    const bt = U.tono(col, -0.4);
    switch (tipo) {
      case 'pelo':
        P.poli([at(-1.05, -0.2), at(-0.95, 0.75), at(-0.2, 1.08), at(0.65, 0.95), at(0.95, 0.45), at(0.35, 0.55), at(-0.3, 0.2), at(-0.6, -0.5)], traje.pelo || '#21140e', U.tono(traje.pelo || '#21140e', -0.3));
        break;
      case 'turbante': {
        P.elipse(at(-0.12, 0.62), r * 1.12, r * 0.78, a * RAD, col, bt);
        P.linea(at(-0.9, 0.55), at(0.85, 0.75), 1, col2);
        P.linea(at(-0.8, 0.95), at(0.6, 1.15), 1, col2);
        if (traje.colaTurbante) P.linea(at(-0.95, 0.4), at(-1.45, -1.2), 1.8 * s, col, bt);
        if (traje.joya) P.pixel(at(0.6, 0.85)[0], at(0.6, 0.85)[1], traje.joya);
        break;
      }
      case 'kalawta': {
        // gorro amarillo cónico de la élite militar, envuelto en turbante
        P.poli([at(-0.7, 0.6), at(-0.25, 2.1), at(0.15, 2.25), at(0.6, 0.65)], traje.colorGorro || '#d9a521', U.tono(traje.colorGorro || '#d9a521', -0.4));
        P.elipse(at(-0.05, 0.55), r * 1.05, r * 0.5, a * RAD, col, bt);
        P.linea(at(-0.95, 0.45), at(0.95, 0.6), 1, col2);
        break;
      }
      case 'gorro':
        P.poli([at(-0.95, 0.35), at(-0.75, 1.1), at(0.6, 1.15), at(0.9, 0.4)], col, bt);
        break;
      case 'calvo':
        P.poli([at(-1.0, 0.0), at(-0.95, 0.45), at(-0.55, 0.4), at(-0.75, -0.3)], traje.pelo || '#3a2a20');
        break;
      case 'velo':
        P.poli([at(-1.1, 0.2), at(-0.9, 1.0), at(0.2, 1.25), at(0.85, 0.75), at(0.75, 0.35), at(-0.2, 0.6)], col, bt);
        break;
      case 'conico': {
        const acero = traje.colorCasco || '#9aa0a6';
        if (traje.turbanteCasco) P.elipse(at(-0.1, 0.55), r * 1.1, r * 0.55, a * RAD, col, bt);
        P.poli([at(-0.9, 0.5), at(-0.35, 1.7), at(0.05, 2.55), at(0.4, 1.7), at(0.9, 0.55)], acero, U.tono(acero, -0.45));
        P.linea(at(-0.95, 0.5), at(0.95, 0.55), 1.2, U.tono(acero, -0.2));
        if (traje.aventail !== false) {
          const pat = P.patron(traje.colorMalla || '#8d9196', U.tono(traje.colorMalla || '#8d9196', -0.3), 'malla');
          P.poli([at(-1.0, 0.45), at(-1.15, -0.7), at(-0.6, -1.3), at(-0.2, -0.9), at(-0.35, 0.3)], pat, U.tono(traje.colorMalla || '#8d9196', -0.45));
        }
        break;
      }
      case 'nasal': {
        const acero = traje.colorCasco || '#a3a8ad';
        P.poli([at(-0.95, 0.35), at(-0.75, 1.15), at(0.1, 1.5), at(0.8, 1.1), at(0.95, 0.35)], acero, U.tono(acero, -0.45));
        P.linea(at(0.82, 0.4), at(0.95, -0.35), 1.1, U.tono(acero, -0.15));
        break;
      }
      case 'yelmo': {
        const acero = traje.colorCasco || '#a7abb0';
        const pts = [at(-1.0, -1.05), at(-1.05, 1.15), at(0.95, 1.15), at(1.05, -1.05)];
        P.poli(pts, acero, U.tono(acero, -0.45));
        P.linea(at(0.15, 0.25), at(1.05, 0.25), 1, '#16100f');
        P.linea(at(0.0, 1.15), at(0.0, -1.05), 1, U.tono(acero, 0.25));
        if (traje.cimera) P.poli([at(-0.5, 1.15), at(-0.1, 1.9), at(0.4, 1.15)], traje.cimera);
        if (traje.cruzYelmo) P.linea(at(0.55, -0.1), at(0.55, -0.85), 1, traje.cruzYelmo);
        break;
      }
      case 'cofia':
        P.poli([at(-1.05, 0.5), at(-0.6, 1.1), at(0.5, 1.12), at(0.95, 0.55), at(0.7, 0.75), at(-0.5, 0.9)], traje.colorMalla || '#8d9196');
        break;
      case 'nino':
        P.poli([at(-1.0, -0.1), at(-0.9, 0.8), at(0, 1.1), at(0.8, 0.85), at(0.9, 0.45), at(0.1, 0.6), at(-0.5, 0.0)], traje.pelo || '#1b100b');
        break;
    }
  }

  // Armas: se dibujan desde la mano en la dirección "arma"
  function dibujarArma(P, k, traje) {
    const ar = traje.arma;
    if (!ar) return;
    const s = k.s;
    const m = k.manoArma;
    const d = dirA(k.p.arma);
    const pp = perp(d);
    const tipo = ar.tipo || ar;
    const acero = ar.acero || '#c9ced3';
    const filo = U.tono(acero, 0.45);
    const madera = ar.madera || '#6b4426';
    switch (tipo) {
      case 'espada':
      case 'espadaLarga': {
        const largo = (tipo === 'espadaLarga' ? 26 : 21) * s * (ar.largo || 1);
        const pomo = sum(m, mul(d, -3.2 * s));
        P.linea(pomo, sum(m, mul(d, 1)), 1.8 * s, ar.empunadura || '#3b2416');
        P.circulo(pomo, 1.1 * s, ar.guarnicion || '#b8902f');
        const g = sum(m, mul(d, 1.6 * s));
        P.linea(sum(g, mul(pp, -2.8 * s)), sum(g, mul(pp, 2.8 * s)), 1.4 * s, ar.guarnicion || '#b8902f', U.tono(ar.guarnicion || '#b8902f', -0.4));
        const punta = sum(m, mul(d, largo));
        const base = sum(m, mul(d, 2.2 * s));
        P.poli([sum(base, mul(pp, -1.1 * s)), sum(base, mul(pp, 1.1 * s)), sum(punta, mul(pp, 0.6 * s)), sum(punta, mul(d, 1.5 * s)), sum(punta, mul(pp, -0.6 * s))], acero, U.tono(acero, -0.4));
        P.linea(sum(base, mul(d, 1)), sum(punta, mul(d, -1)), 0.6, filo);
        break;
      }
      case 'cimitarra': {
        const largo = 20 * s;
        const pomo = sum(m, mul(d, -3 * s));
        P.linea(pomo, m, 1.8 * s, ar.empunadura || '#3b2416');
        const g = sum(m, mul(d, 1.4 * s));
        P.linea(sum(g, mul(pp, -2.4 * s)), sum(g, mul(pp, 2.4 * s)), 1.3 * s, ar.guarnicion || '#b8902f');
        const pts = [];
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const curva = Math.sin(t * Math.PI * 0.8) * 3 * s;
          pts.push(sum(sum(m, mul(d, 2 * s + t * largo)), mul(pp, -curva)));
        }
        const pts2 = pts.slice().reverse().map((q, i) => sum(q, mul(pp, (1.4 - i / 6) * s)));
        P.poli(pts.concat(pts2), acero, U.tono(acero, -0.4));
        break;
      }
      case 'madera': {
        const largo = 19 * s;
        P.linea(sum(m, mul(d, -3 * s)), sum(m, mul(d, largo)), 2.4 * s, '#9b7346', '#5c3f22');
        P.linea(sum(sum(m, mul(d, 1.5 * s)), mul(pp, -2.2 * s)), sum(sum(m, mul(d, 1.5 * s)), mul(pp, 2.2 * s)), 1.5 * s, '#5c3f22');
        break;
      }
      case 'martillo': {
        const cab = sum(m, mul(d, 9 * s));
        P.linea(sum(m, mul(d, -3 * s)), cab, 1.7 * s, madera, U.tono(madera, -0.4));
        P.linea(sum(cab, mul(pp, -2.6 * s)), sum(cab, mul(pp, 3.2 * s)), 3.2 * s, '#5d6166', '#2a2d31');
        break;
      }
      case 'lanza': {
        const fin = sum(m, mul(d, 30 * s));
        P.linea(sum(m, mul(d, -14 * s)), fin, 1.6 * s, madera, U.tono(madera, -0.4));
        P.poli([sum(fin, mul(pp, -1.4 * s)), sum(fin, mul(d, 6 * s)), sum(fin, mul(pp, 1.4 * s))], acero, U.tono(acero, -0.4));
        if (ar.banderin) P.poli([sum(fin, mul(d, -1)), sum(sum(fin, mul(d, -2)), mul(pp, -6 * s)), sum(fin, mul(d, -5 * s))], ar.banderin);
        break;
      }
      case 'maza': {
        const cab = sum(m, mul(d, 12 * s));
        P.linea(sum(m, mul(d, -3 * s)), cab, 1.7 * s, madera, U.tono(madera, -0.4));
        P.circulo(cab, 2.6 * s, '#7c8187', '#2f3236');
        P.linea(sum(cab, mul(pp, -3.4 * s)), sum(cab, mul(pp, 3.4 * s)), 1.4, '#7c8187');
        break;
      }
      case 'hacha': {
        const cab = sum(m, mul(d, 14 * s));
        P.linea(sum(m, mul(d, -3 * s)), sum(cab, mul(d, 2)), 1.8 * s, madera, U.tono(madera, -0.4));
        P.poli([sum(cab, mul(pp, 0.5)), sum(sum(cab, mul(pp, 5.5 * s)), mul(d, -3.5 * s)), sum(sum(cab, mul(pp, 6 * s)), mul(d, 3.5 * s)), sum(cab, mul(d, 2))], acero, U.tono(acero, -0.45));
        break;
      }
      case 'ballesta': {
        // culata en la dirección del arma, arco perpendicular en la punta
        const punta = sum(m, mul(d, 9 * s));
        P.linea(sum(m, mul(d, -6 * s)), punta, 2.2 * s, madera, U.tono(madera, -0.45));
        const arcoA = sum(sum(punta, mul(pp, -6 * s)), mul(d, -2 * s));
        const arcoB = sum(sum(punta, mul(pp, 6 * s)), mul(d, -2 * s));
        P.linea(arcoA, punta, 1.4 * s, '#4a3220');
        P.linea(punta, arcoB, 1.4 * s, '#4a3220');
        if (!k.p.descargada) {
          P.linea(arcoA, sum(m, mul(d, 1 * s)), 0.6, '#d8cfb8');
          P.linea(arcoB, sum(m, mul(d, 1 * s)), 0.6, '#d8cfb8');
          P.linea(sum(m, mul(d, 1 * s)), sum(punta, mul(d, 2 * s)), 1, '#3a2a1c');
        } else {
          P.linea(arcoA, arcoB, 0.6, '#d8cfb8');
        }
        break;
      }
      case 'arco': {
        const a1 = sum(sum(m, mul(pp, -10 * s)), mul(d, -2 * s));
        const a2 = sum(sum(m, mul(pp, 10 * s)), mul(d, -2 * s));
        const ctrl = sum(m, mul(d, 3 * s));
        const x = P.x;
        x.beginPath();
        x.moveTo(a1[0], a1[1]);
        x.quadraticCurveTo(ctrl[0], ctrl[1], a2[0], a2[1]);
        x.strokeStyle = P.color('#5a3a1e');
        x.lineWidth = 1.6 * s;
        x.stroke();
        const cuerda = k.p.tensar ? sum(m, mul(d, -8 * s)) : sum(m, mul(d, -2 * s));
        P.linea(a1, cuerda, 0.5, '#e0d6c0');
        P.linea(cuerda, a2, 0.5, '#e0d6c0');
        break;
      }
      case 'tenazas': {
        P.linea(sum(m, mul(d, -2 * s)), sum(m, mul(d, 11 * s)), 1.1 * s, '#3c3f43');
        P.linea(sum(sum(m, mul(d, -2 * s)), mul(pp, 1)), sum(sum(m, mul(d, 11 * s)), mul(pp, 1.4)), 1.1 * s, '#3c3f43');
        if (k.p.hierroRojo) P.linea(sum(m, mul(d, 10 * s)), sum(m, mul(d, 20 * s)), 1.8 * s, '#ff8a2a');
        break;
      }
      case 'baston': {
        P.linea(sum(m, mul(d, -16 * s)), sum(m, mul(d, 12 * s)), 1.6 * s, madera, U.tono(madera, -0.4));
        break;
      }
      case 'pergamino': {
        P.linea(sum(m, mul(pp, -3 * s)), sum(m, mul(pp, 3 * s)), 3 * s, '#e9dcb8', '#9b8459');
        break;
      }
      case 'oud': {
        const cuerpo = sum(m, mul(d, -1.5 * s));
        P.elipse(cuerpo, 4.6 * s, 3.4 * s, Math.atan2(d[1], d[0]), '#8a5a2a', '#3e2412');
        P.circulo(cuerpo, 0.9 * s, '#2a1608');
        P.linea(sum(cuerpo, mul(d, 3.5 * s)), sum(cuerpo, mul(d, 11 * s)), 1.5 * s, '#5a3a1a', '#2e1a0a');
        P.linea(sum(cuerpo, mul(d, 11 * s)), sum(sum(cuerpo, mul(d, 12 * s)), mul(pp, -2.5 * s)), 1.5 * s, '#5a3a1a');
        break;
      }
      case 'odre': {
        P.elipse(sum(m, [0, 3 * s]), 2.6 * s, 3.4 * s, 0, '#7a4a2a', '#3f2412');
        break;
      }
    }
  }

  function dibujarEscudo(P, k, traje) {
    const e = traje.escudo;
    if (!e) return;
    const s = k.s;
    const m = k.manoT;
    const ang = (k.p.escudoA || 0) * RAD;
    const c = sum(m, [1.5 * s, -1 * s]);
    if (e.tipo === 'redondo') {
      P.elipse(c, 3.6 * s, 7.6 * s, ang, e.color, U.tono(e.color, -0.45));
      P.elipse(c, 2.6 * s, 6.3 * s, ang, e.color2 || U.tono(e.color, 0.15));
      P.elipse(sum(c, [0.6 * s, 0]), 1.3 * s, 1.8 * s, ang, e.umbo || '#c9a845', '#5c4718');
    } else if (e.tipo === 'cometa') {
      const x = P.x;
      x.save();
      x.translate(c[0], c[1]);
      x.rotate(ang);
      const pts = [[-2.4 * s, -8.5 * s], [3.4 * s, -8.5 * s], [3.8 * s, -3 * s], [0.9 * s, 10 * s], [-2.6 * s, -3 * s]];
      P.poli(pts, e.color, U.tono(e.color, -0.45));
      if (e.emblema) emblema(P, [0.6 * s, -2.5 * s], e.emblema, e.colorEmblema || '#b3262a', s);
      if (e.franja) P.linea([0.5 * s, -8 * s], [0.6 * s, 8 * s], 1.4 * s, e.franja);
      x.restore();
    } else if (e.tipo === 'rodela') {
      P.elipse(c, 2.8 * s, 5 * s, ang, e.color, U.tono(e.color, -0.45));
    }
  }

  // Dibuja un personaje completo en el contexto (origen = pies)
  function dibujarPersonaje(P, traje, pose) {
    const p = Object.assign({}, BASE, pose);
    const k = calcular(p, traje);
    const x = P.x;
    x.save();
    if (p.giro) {
      const centro = sum(k.pel, mul(k.td, 6 * k.s));
      x.translate(centro[0], centro[1]);
      x.rotate(p.giro * RAD);
      x.translate(-centro[0], -centro[1]);
    }
    dibujarCapa(P, k, traje);
    if (p.armaT) dibujarArma(P, k, traje);
    if (traje.armaEspalda) {
      // arma colgada a la espalda (aljaba, lanza…)
      const kk = Object.assign({}, k, { manoArma: sum(k.pel, mul(k.td, 9 * k.s)), p: Object.assign({}, p, { arma: 200 }) });
      dibujarArma(P, kk, { arma: traje.armaEspalda });
    }
    if (traje.aljaba) {
      const a = sum(k.pel, mul(k.td, 10 * k.s));
      P.linea(sum(a, [-3 * k.s, 4 * k.s]), sum(a, [-5 * k.s, -6 * k.s]), 3 * k.s, '#6a4024', '#2e1a0e');
    }
    dibujarBrazo(P, k, 'T', traje, true);
    dibujarPierna(P, k, 'T', traje, true);
    dibujarPierna(P, k, 'D', traje, false);
    dibujarCuerpo(P, k, traje);
    dibujarCabeza(P, k, traje);
    if (!traje.escudoDetras) dibujarEscudo(P, k, traje);
    if (!p.armaT) dibujarArma(P, k, traje);
    dibujarBrazo(P, k, 'D', traje, false);
    if (p.dosManos && traje.arma) {
      // segunda mano sobre la empuñadura
      P.circulo(sum(k.manoD, mul(dirA(p.arma), -2.2 * k.s)), 1.8 * k.s, traje.guantes || traje.piel, U.tono(traje.guantes || traje.piel, -0.35));
    }
    if (traje.escudoDetras) dibujarEscudo(P, k, traje);
    x.restore();
    return k;
  }

  // ------------------------------------------------------------------ horneado
  const cacheTonos = new Map();
  function tonoRGB(rgb, t) {
    const clave = rgb.join(',') + '|' + t;
    let r = cacheTonos.get(clave);
    if (!r) {
      r = U.hexARgb(U.tono(U.rgbAHex(rgb[0], rgb[1], rgb[2]), t));
      cacheTonos.set(clave, r);
    }
    return r;
  }

  function procesar(lz, paleta, opc) {
    const w = lz.w, h = lz.h;
    const img = lz.x.getImageData(0, 0, w, h);
    const d = img.data;
    const pal = [...paleta].map((c) => U.hexARgb(c));
    const n = w * h;
    const op = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const a = d[i * 4 + 3];
      if (a >= 110) {
        op[i] = 1;
        // ajuste a la paleta (desmultiplica el alfa del borde)
        const f = a < 255 ? 255 / a : 1;
        const r = d[i * 4] * f, g = d[i * 4 + 1] * f, b = d[i * 4 + 2] * f;
        let mejor = 0, md = 1e9;
        for (let j = 0; j < pal.length; j++) {
          const p = pal[j];
          const dd = (p[0] - r) * (p[0] - r) * 0.8 + (p[1] - g) * (p[1] - g) + (p[2] - b) * (p[2] - b) * 0.7;
          if (dd < md) {
            md = dd;
            mejor = j;
          }
        }
        const p = pal[mejor];
        d[i * 4] = p[0];
        d[i * 4 + 1] = p[1];
        d[i * 4 + 2] = p[2];
        d[i * 4 + 3] = 255;
      } else {
        d[i * 4 + 3] = 0;
      }
    }
    // luz de borde y sombra propia
    if (opc.luz !== false) {
      const copia = new Uint8ClampedArray(d);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (!op[i]) continue;
          const arriba = op[i - w], delante = op[i + 1], arribaD = op[i - w + 1];
          const abajo = op[i + w], detras = op[i - 1];
          let t = 0;
          if (!arriba || !arribaD) t = 0.2;
          else if (!delante) t = 0.1;
          if (!abajo || !detras) t = -0.16;
          if (t !== 0) {
            const rgb = tonoRGB([copia[i * 4], copia[i * 4 + 1], copia[i * 4 + 2]], t);
            d[i * 4] = rgb[0];
            d[i * 4 + 1] = rgb[1];
            d[i * 4 + 2] = rgb[2];
          }
        }
      }
    }
    // contorno exterior
    const cont = U.hexARgb(opc.contorno || '#1a1014');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (op[i]) continue;
        if ((x > 0 && op[i - 1]) || (x < w - 1 && op[i + 1]) || (y > 0 && op[i - w]) || (y < h - 1 && op[i + w])) {
          d[i * 4] = cont[0];
          d[i * 4 + 1] = cont[1];
          d[i * 4 + 2] = cont[2];
          d[i * 4 + 3] = 255;
        }
      }
    }
    lz.x.putImageData(img, 0, 0);
  }

  // Interpolación entre poses
  function mezclarPoses(a, b, t) {
    const r = {};
    const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const c of claves) {
      const va = a[c] != null ? a[c] : BASE[c];
      const vb = b[c] != null ? b[c] : BASE[c];
      if (Array.isArray(va) || Array.isArray(vb)) {
        if (Array.isArray(va) && Array.isArray(vb)) r[c] = [U.lerp(va[0], vb[0], t), U.lerp(va[1], vb[1], t)];
        else r[c] = t < 0.5 ? va : vb;
      } else if (typeof va === 'number' && typeof vb === 'number') r[c] = U.lerp(va, vb, t);
      else r[c] = t < 0.5 ? va : vb;
    }
    return r;
  }

  // Expande una definición de animación en una lista de {pose, d}
  function expandir(anim) {
    const fr = [];
    if (anim.ciclo) {
      const n = anim.n || 8;
      for (let i = 0; i < n; i++) fr.push({ pose: anim.ciclo(i / n), d: 1 / (anim.fps || 10) });
    } else if (anim.claves) {
      const cl = anim.claves;
      for (let i = 0; i < cl.length; i++) {
        const c = cl[i];
        fr.push({ pose: c.p || c, d: c.d || 0.08, ev: c.ev });
        if (c.entre && i < cl.length - 1) {
          for (let j = 1; j <= c.entre; j++) {
            fr.push({ pose: mezclarPoses(c.p || c, cl[i + 1].p || cl[i + 1], U.suave(j / (c.entre + 1))), d: c.dEntre || 0.05 });
          }
        }
      }
    }
    return fr;
  }

  // Hornea una animación (todas sus poses) en una tira de sprites, con su versión blanca
  let lzTrabajo = null;
  function hornearAnim(traje, def) {
    const fr = expandir(def);
    const cols = Math.min(16, Math.max(1, fr.length));
    const filas = Math.ceil(fr.length / cols);
    const hoja = IH.lienzo(cols * FW, Math.max(1, filas) * FH);
    if (!lzTrabajo) lzTrabajo = IH.lienzo(FW, FH, true);
    const lz = lzTrabajo;
    const a = { marcos: [], bucle: def.bucle === true || (def.bucle !== false && !!def.ciclo), total: 0, sig: def.sig || null };
    fr.forEach((m, i) => {
      lz.x.clearRect(0, 0, FW, FH);
      lz.x.save();
      lz.x.translate(AX, AY);
      const P = new Pintor(lz.x);
      P.color(traje.piel);
      dibujarPersonaje(P, traje, m.pose);
      lz.x.restore();
      procesar(lz, P.paleta, { contorno: traje.contorno, luz: traje.luz });
      const sx = (i % cols) * FW, sy = Math.floor(i / cols) * FH;
      hoja.x.drawImage(lz.c, sx, sy);
      a.marcos.push({ sx, sy, d: m.d, ev: m.ev });
      a.total += m.d;
    });
    const blanca = IH.lienzo(hoja.w, hoja.h);
    blanca.x.drawImage(hoja.c, 0, 0);
    blanca.x.globalCompositeOperation = 'source-in';
    blanca.x.fillStyle = '#fff6e6';
    blanca.x.fillRect(0, 0, blanca.w, blanca.h);
    a.hoja = hoja.c;
    a.blanca = blanca.c;
    return a;
  }

  // Prepara el sprite de un traje: cada animación se hornea la primera vez que se usa
  function hornear(traje, anims, nombres) {
    const lista = (nombres || Object.keys(anims)).filter((n) => anims[n]);
    const res = { fw: FW, fh: FH, ax: AX, ay: AY, traje };
    const cocidas = {};
    const tiene = (nom) => typeof nom === 'string' && lista.includes(nom);
    res.anims = new Proxy(cocidas, {
      get(t, nom) {
        if (t[nom]) return t[nom];
        if (!tiene(nom)) return undefined;
        t[nom] = hornearAnim(traje, anims[nom]);
        return t[nom];
      },
      has(t, nom) {
        return tiene(nom);
      },
      ownKeys() {
        return lista.slice();
      },
      getOwnPropertyDescriptor(t, nom) {
        if (!tiene(nom)) return undefined;
        return { enumerable: true, configurable: true, writable: true, value: res.anims[nom] };
      },
    });
    // la pose de reposo se hornea ya, para que el primer fotograma no espere
    if (lista.includes('quieto')) res.anims.quieto;
    return res;
  }

  // Dibuja un fotograma horneado (x,y = pies en coordenadas de pantalla interna)
  function dibujarMarco(ctx, spr, anim, i, x, y, dir = 1, opc = {}) {
    const a = spr.anims[anim];
    if (!a || !a.marcos.length) return;
    const m = a.marcos[Math.max(0, Math.min(a.marcos.length - 1, i))];
    const img = opc.blanco ? a.blanca : a.hoja;
    const px = Math.round(x), py = Math.round(y);
    if (opc.alfa != null) ctx.globalAlpha = opc.alfa;
    if (dir >= 0) {
      ctx.drawImage(img, m.sx, m.sy, spr.fw, spr.fh, px - spr.ax, py - spr.ay, spr.fw, spr.fh);
    } else {
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(-1, 1);
      ctx.drawImage(img, m.sx, m.sy, spr.fw, spr.fh, -spr.ax, -spr.ay, spr.fw, spr.fh);
      ctx.restore();
    }
    if (opc.alfa != null) ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ animador
  class Animador {
    constructor(spr, anim) {
      this.spr = spr;
      this.anim = null;
      this.t = 0;
      this.i = 0;
      this.fin = false;
      this.vel = 1;
      this.eventos = [];
      if (anim) this.poner(anim);
    }
    poner(anim, reiniciar = false) {
      if (!this.spr.anims[anim]) {
        if (IH.DEPURAR) console.warn('Animación inexistente', anim, this.spr.traje && this.spr.traje.nombre);
        return;
      }
      if (this.anim === anim && !reiniciar) return;
      this.anim = anim;
      this.t = 0;
      this.i = 0;
      this.fin = false;
      this.acum = 0;
    }
    actualizar(dt) {
      const a = this.spr.anims[this.anim];
      if (!a) return;
      this.eventos.length = 0;
      if (this.fin) return;
      this.t += dt * this.vel;
      this.acum += dt * this.vel;
      let m = a.marcos[this.i];
      let guard = 0;
      while (this.acum >= m.d && guard++ < 50) {
        this.acum -= m.d;
        if (this.i + 1 < a.marcos.length) {
          this.i++;
          if (a.marcos[this.i].ev) this.eventos.push(a.marcos[this.i].ev);
        } else if (a.bucle) {
          this.i = 0;
          if (a.marcos[0].ev) this.eventos.push(a.marcos[0].ev);
        } else {
          this.fin = true;
          this.acum = 0;
          if (a.sig) this.poner(a.sig);
          break;
        }
        m = a.marcos[this.i];
      }
    }
    get duracion() {
      const a = this.spr.anims[this.anim];
      return a ? a.total : 0;
    }
    dibujar(ctx, x, y, dir, opc) {
      dibujarMarco(ctx, this.spr, this.anim, this.i, x, y, dir, opc);
    }
  }

  IH.Esq = { BASE, calcular, dibujarPersonaje, hornear, dibujarMarco, Animador, Pintor, mezclarPoses, procesar, FW, FH, AX, AY };
})();
