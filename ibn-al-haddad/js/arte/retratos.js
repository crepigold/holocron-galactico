/* Retratos de diálogo: bustos de 64×64 en vista de tres cuartos, con expresiones
 * (normal, alegre, triste, enfadado, sorpresa, serio) y boca animada al hablar.
 * Se derivan del traje de cada personaje para mantener la coherencia.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const G = IH.G;
  const N = 64;

  const EXTRA = {
    yusuf: { edad: 'joven', cara: 0.95 },
    ibrahim: { edad: 'mayor', cara: 1.1, arrugas: 1 },
    ibrahimNoche: { edad: 'mayor', cara: 1.1, arrugas: 1, base: 'ibrahim' },
    nur: { edad: 'joven', cara: 0.88, mujer: true, pestanas: true },
    abuSalim: { edad: 'mayor', cara: 1.0, arrugas: 1 },
    hakawati: { edad: 'anciano', cara: 0.98, arrugas: 2 },
    pregonero: { edad: 'adulto', cara: 1.0 },
    sunqur: { edad: 'mayor', cara: 1.05, arrugas: 1, cicatriz: true, ojosRasgados: true },
    baibars: { edad: 'adulto', cara: 1.08, ojosRasgados: true, ojoBlanco: true },
    recluta1: { edad: 'joven', cara: 1.0 },
    recluta2: { edad: 'joven', cara: 1.0 },
    nino: { edad: 'nino', cara: 0.85 },
    templario: { edad: 'adulto', cara: 1.05 },
    templarioSinYelmo: { edad: 'adulto', cara: 1.05, arrugas: 1, cicatriz: true },
    sargento: { edad: 'adulto', cara: 1.0 },
    mameluco: { edad: 'adulto', cara: 1.0, ojosRasgados: true },
    cronista: { edad: 'anciano', cara: 0.98, arrugas: 2 },
    naffat: { edad: 'adulto', cara: 1.0 },
    miliciano: { edad: 'adulto', cara: 1.0 },
    mercader1: { edad: 'adulto' }, mercader2: { edad: 'mayor', arrugas: 1 }, mercader3: { edad: 'adulto' },
    vecino1: { edad: 'adulto' }, vecina1: { edad: 'adulto', mujer: true, pestanas: true },
  };

  function lienzo() {
    return IH.lienzo(N, N);
  }

  function elipse(x, cx, cy, rx, ry, color) {
    x.fillStyle = color;
    for (let yy = Math.floor(-ry); yy <= Math.ceil(ry); yy++) {
      const t = yy / ry;
      if (Math.abs(t) > 1) continue;
      const w = rx * Math.sqrt(1 - t * t);
      x.fillRect(Math.round(cx - w), Math.round(cy + yy), Math.max(1, Math.round(w * 2)), 1);
    }
  }
  function px(x, a, b, c) {
    x.fillStyle = c;
    x.fillRect(Math.round(a), Math.round(b), 1, 1);
  }
  function rect(x, a, b, w, h, c) {
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

  function contorno(lz, color) {
    const img = lz.x.getImageData(0, 0, N, N);
    const d = img.data;
    const op = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) {
      if (d[i * 4 + 3] > 100) {
        op[i] = 1;
        d[i * 4 + 3] = 255;
      } else d[i * 4 + 3] = 0;
    }
    const c = U.hexARgb(color);
    for (let y = 0; y < N; y++)
      for (let xx = 0; xx < N; xx++) {
        const i = y * N + xx;
        if (op[i]) continue;
        if ((xx > 0 && op[i - 1]) || (xx < N - 1 && op[i + 1]) || (y > 0 && op[i - N]) || (y < N - 1 && op[i + N])) {
          d[i * 4] = c[0];
          d[i * 4 + 1] = c[1];
          d[i * 4 + 2] = c[2];
          d[i * 4 + 3] = 255;
        }
      }
    lz.x.putImageData(img, 0, 0);
  }

  function generar(id, emocion, boca) {
    const ex = EXTRA[id] || {};
    const t = IH.TRAJES[ex.base || id] || IH.TRAJES[id];
    const lz = IH.lienzo(N, N, true);
    const x = lz.x;
    const piel = t.piel || '#a46b45';
    const pielS = U.tono(piel, -0.18), pielSS = U.tono(piel, -0.32), pielL = U.tono(piel, 0.14);
    const pelo = t.pelo || '#21140e';
    const cara = ex.cara || 1;
    const edad = ex.edad || 'adulto';
    const cx = 32, cy = 31;
    const tun = (t.sobreveste && t.sobreveste.color) || t.tunica || '#887766';

    // --- hombros y ropa
    const hombro = edad === 'nino' ? 0.8 : 1;
    poli(x, [[cx - 24 * hombro, 64], [cx - 18 * hombro, 50], [cx - 6, 46], [cx + 8, 46], [cx + 20 * hombro, 50], [cx + 26 * hombro, 64]], tun);
    rect(x, cx + 10, 50, 16, 14, U.tono(tun, -0.15));
    if (t.malla) {
      for (let yy = 46; yy < 64; yy++) for (let xx = 4; xx < 60; xx++) if ((xx + yy * 2) % 4 === 0) px(x, xx, yy, U.tono(t.malla, -0.25));
    }
    if (t.sobreveste) {
      poli(x, [[cx - 14, 64], [cx - 10, 52], [cx + 14, 52], [cx + 18, 64]], t.sobreveste.color);
      if (t.sobreveste.emblema === 'cruz') {
        rect(x, cx + 1, 54, 3, 10, t.sobreveste.colorEmblema || '#b3262a');
        rect(x, cx - 3, 57, 11, 3, t.sobreveste.colorEmblema || '#b3262a');
      } else if (t.sobreveste.emblema) {
        elipse(x, cx + 2, 59, 3, 3, t.sobreveste.colorEmblema || '#d9b23a');
      }
    }
    if (t.laminar) {
      for (let yy = 50; yy < 64; yy += 3) for (let xx = 6; xx < 58; xx += 4) rect(x, xx + (yy % 2) * 2, yy, 3, 2, U.tono(t.laminar, (xx + yy) % 3 === 0 ? 0.1 : -0.05));
    }
    if (t.gambeson) for (let xx = 8; xx < 58; xx += 3) rect(x, xx, 48, 1, 16, U.tono(t.gambeson, -0.15));
    if (t.delantal) poli(x, [[cx - 6, 64], [cx - 4, 52], [cx + 14, 52], [cx + 16, 64]], t.delantal);
    if (t.tiraz) rect(x, cx - 22, 56, 8, 2, t.tiraz);
    if (t.fajin && !t.sobreveste && !t.laminar) rect(x, cx - 16, 61, 36, 3, t.fajin);
    // cuello de la túnica
    poli(x, [[cx - 6, 47], [cx + 1, 53], [cx + 8, 47]], U.tono(tun, -0.3));

    // --- cuello
    rect(x, cx - 5, 40, 11, 9, pielS);
    rect(x, cx - 5, 40, 3, 8, pielSS);

    // --- cofia / malla bajo la cabeza
    const tocado = t.tocado || 'pelo';
    const malla = t.colorMalla || '#8d9196';
    if (tocado === 'cofia' || tocado === 'nasal' || t.cofia) {
      elipse(x, cx - 1, cy + 4, 15 * cara, 16, malla);
      for (let yy = 16; yy < 50; yy++) for (let xx = 12; xx < 50; xx++) if ((xx + yy * 2) % 4 === 0) {
        const d = lz.x.getImageData(xx, yy, 1, 1).data;
        if (d[3] > 0) px(x, xx, yy, U.tono(malla, -0.3));
      }
    }
    if (tocado === 'velo') elipse(x, cx - 2, cy + 6, 16, 19, t.colorTocado || '#7a3b5a');

    // --- cabeza
    if (tocado !== 'yelmo') {
      elipse(x, cx, cy, 10.5 * cara, 12.5, piel);
      // mandíbula hacia delante
      poli(x, [[cx - 8 * cara, cy + 4], [cx + 9 * cara, cy + 2], [cx + 10 * cara, cy + 8], [cx + 6 * cara, cy + 12], [cx, cy + 13], [cx - 6 * cara, cy + 10]], piel);
      // sombra lateral (lado lejano)
      for (let yy = cy - 10; yy < cy + 12; yy++) {
        rect(x, cx - 10 * cara, yy, 2, 1, pielS);
      }
      elipse(x, cx - 7 * cara, cy + 5, 2.5, 4, pielS);
      // oreja
      elipse(x, cx - 8.5 * cara, cy + 1, 2.2, 3.5, pielS);
      px(x, cx - 8.5 * cara, cy + 1, pielSS);
      // nariz (perfil de tres cuartos)
      poli(x, [[cx + 7 * cara, cy - 2], [cx + 11.5 * cara, cy + 5], [cx + 7.5 * cara, cy + 6]], piel);
      rect(x, cx + 6 * cara, cy - 1, 1, 6, pielS);
      px(x, cx + 9 * cara, cy + 6, pielSS);
      // pómulo iluminado
      rect(x, cx + 3 * cara, cy + 1, 3, 1, pielL);
      rect(x, cx - 1, cy - 9, 6, 1, pielL);

      // --- ojos
      const ojoY = cy - 1;
      const cejaY = ojoY - 3 + (emocion === 'sorpresa' ? -1 : 0);
      const iris = t.ojo || '#1d1210';
      const dibOjo = (ox, ancho) => {
        if (emocion === 'cerrados') {
          rect(x, ox, ojoY + 1, ancho, 1, pielSS);
          return;
        }
        const alto = emocion === 'sorpresa' ? 3 : ex.ojosRasgados ? 1 : 2;
        rect(x, ox, ojoY, ancho, alto, '#efe8dc');
        rect(x, ox + ancho - 2, ojoY, 2, alto, iris);
        if (ex.ojoBlanco && ox > cx) {
          rect(x, ox + ancho - 2, ojoY, 2, alto, '#9fc2d4');
          px(x, ox + ancho - 1, ojoY, '#e8f0f4');
        }
        rect(x, ox - (ex.pestanas ? 1 : 0), ojoY - 1, ancho + (ex.pestanas ? 1 : 0), 1, '#2a1610');
        if (emocion === 'triste') px(x, ox, ojoY + alto, pielSS);
      };
      dibOjo(cx + 2 * cara, 4);
      dibOjo(cx - 5 * cara, 3);
      // cejas según emoción
      const cc = edad === 'anciano' ? '#d8d0c4' : t.colorBarba && edad === 'mayor' ? U.mezclar(pelo, '#9a948a', 0.5) : pelo;
      const ceja = (x0, x1, yIn, yOut) => {
        G.linea(x, x0, yOut, x1, yIn, cc);
        G.linea(x, x0, yOut - 1, x1, yIn - 1, cc);
      };
      if (emocion === 'enfadado') {
        ceja(cx + 7 * cara, cx + 2 * cara, cejaY + 1, cejaY - 1);
        ceja(cx - 6 * cara, cx - 2 * cara, cejaY + 1, cejaY - 1);
      } else if (emocion === 'triste') {
        ceja(cx + 7 * cara, cx + 2 * cara, cejaY - 2, cejaY);
        ceja(cx - 6 * cara, cx - 2 * cara, cejaY - 2, cejaY);
      } else {
        ceja(cx + 7 * cara, cx + 2 * cara, cejaY, cejaY - (emocion === 'sorpresa' ? 1 : 0));
        ceja(cx - 6 * cara, cx - 2 * cara, cejaY, cejaY);
      }
      // arrugas y cicatrices
      if (ex.arrugas) {
        px(x, cx + 7 * cara, ojoY + 2, pielSS);
        px(x, cx + 8 * cara, ojoY + 1, pielSS);
        rect(x, cx - 1, cy - 7, 4, 1, pielS);
        if (ex.arrugas > 1) {
          rect(x, cx - 2, cy - 5, 5, 1, pielS);
          G.linea(x, cx + 5, cy + 6, cx + 4, cy + 9, pielSS);
        }
      }
      if (ex.cicatriz) G.linea(x, cx + 4, cy - 6, cx + 1, cy + 4, U.tono(piel, 0.25));

      // --- boca
      const bocaY = cy + 8;
      if (boca && emocion !== 'cerrados') {
        rect(x, cx + 2, bocaY, 5, 2, '#3a1612');
        rect(x, cx + 3, bocaY + 1, 3, 1, '#7a2a24');
      } else if (emocion === 'alegre') {
        rect(x, cx + 2, bocaY, 5, 1, '#5a2a20');
        px(x, cx + 1, bocaY - 1, '#5a2a20');
        px(x, cx + 7, bocaY - 1, '#5a2a20');
      } else if (emocion === 'triste' || emocion === 'enfadado') {
        rect(x, cx + 2, bocaY + 1, 5, 1, '#5a2a20');
        px(x, cx + 1, bocaY + 2, '#5a2a20');
      } else {
        rect(x, cx + 2, bocaY, 5, 1, '#5a2a20');
      }

      // --- barba
      if (t.barba) {
        const cb = t.colorBarba || pelo;
        const cbS = U.tono(cb, -0.25);
        if (t.barba === 'larga') {
          poli(x, [[cx - 8, cy + 3], [cx - 3, cy + 7], [cx + 1, bocaY + 2], [cx + 8, bocaY + 2], [cx + 10, cy + 6], [cx + 9, cy + 17], [cx + 3, cy + 23], [cx - 4, cy + 19], [cx - 9, cy + 10]], cb);
          for (let i = 0; i < 6; i++) G.linea(x, cx - 4 + i * 2, cy + 11, cx - 3 + i * 2, cy + 19, cbS);
        } else if (t.barba === 'corta') {
          poli(x, [[cx - 8, cy + 3], [cx - 4, cy + 8], [cx + 1, bocaY + 2], [cx + 8, bocaY + 2], [cx + 10, cy + 5], [cx + 9, cy + 11], [cx + 4, cy + 14], [cx - 3, cy + 13], [cx - 8, cy + 8]], cb);
          for (let i = 0; i < 12; i++) px(x, cx - 5 + ((i * 7) % 14), cy + 9 + (i % 4), cbS);
        } else if (t.barba === 'perilla') {
          poli(x, [[cx + 1, bocaY + 2], [cx + 8, bocaY + 2], [cx + 7, cy + 14], [cx + 3, cy + 15]], cb);
        }
        // bigote
        if (t.barba !== 'perilla' || true) {
          rect(x, cx + 1, bocaY - 2, 8, 2, cb);
          px(x, cx, bocaY - 1, cb);
          if (t.barba === 'bigote' && (edad === 'mayor' || ex.ojosRasgados)) {
            G.linea(x, cx + 1, bocaY - 1, cx - 1, bocaY + 4, cb);
            G.linea(x, cx + 8, bocaY - 1, cx + 9, bocaY + 4, cb);
          }
        }
        if (boca) rect(x, cx + 2, bocaY, 5, 2, '#3a1612');
      }
    }

    // --- tocados
    const col = t.colorTocado || '#e8dcc0';
    const col2 = t.colorTocado2 || U.tono(col, -0.18);
    const col3 = U.tono(col, -0.32);
    switch (tocado) {
      case 'turbante': {
        elipse(x, cx - 1, cy - 12, 14 * cara, 8, col);
        elipse(x, cx - 2, cy - 16, 11 * cara, 7, col);
        // vueltas de tela
        for (let i = 0; i < 4; i++) G.linea(x, cx - 13 + i, cy - 9 - i * 3, cx + 12, cy - 12 - i * 3 + (i % 2), col2);
        rect(x, cx - 14 * cara, cy - 12, 3, 6, col3);
        if (t.colaTurbante) poli(x, [[cx - 12, cy - 8], [cx - 16, cy + 2], [cx - 13, cy + 16], [cx - 9, cy + 6]], col2);
        if (t.joya) rect(x, cx + 4, cy - 15, 2, 2, t.joya);
        rect(x, cx - 8, cy - 23, 10, 1, U.tono(col, 0.15));
        break;
      }
      case 'kalawta': {
        poli(x, [[cx - 8, cy - 12], [cx - 3, cy - 30], [cx + 2, cy - 31], [cx + 7, cy - 12]], t.colorGorro || '#d9a521');
        G.linea(x, cx + 3, cy - 29, cx + 6, cy - 13, U.tono(t.colorGorro || '#d9a521', -0.3));
        elipse(x, cx - 1, cy - 11, 14 * cara, 5, col);
        for (let i = 0; i < 3; i++) G.linea(x, cx - 13, cy - 10 - i * 2, cx + 12, cy - 11 - i * 2 + (i % 2), col2);
        break;
      }
      case 'gorro':
        elipse(x, cx - 1, cy - 9, 11.5 * cara, 7, col);
        rect(x, cx - 12 * cara, cy - 9, 24 * cara, 3, col);
        rect(x, cx - 12 * cara, cy - 7, 24 * cara, 1, col3);
        break;
      case 'velo':
        poli(x, [[cx - 14, cy + 16], [cx - 15, cy - 6], [cx - 6, cy - 15], [cx + 7, cy - 14], [cx + 12, cy - 6], [cx + 9, cy - 8], [cx - 2, cy - 10], [cx - 9, cy - 3], [cx - 9, cy + 16]], col);
        G.linea(x, cx - 6, cy - 12, cx + 8, cy - 11, col2);
        break;
      case 'conico': {
        const ac = t.colorCasco || '#a9aeb3';
        if (t.turbanteCasco) elipse(x, cx - 1, cy - 8, 14 * cara, 5, col);
        poli(x, [[cx - 12, cy - 9], [cx - 6, cy - 24], [cx, cy - 33], [cx + 5, cy - 24], [cx + 11, cy - 9]], ac);
        G.linea(x, cx + 1, cy - 31, cx + 9, cy - 10, U.tono(ac, -0.3));
        G.linea(x, cx - 1, cy - 30, cx - 8, cy - 12, U.tono(ac, 0.25));
        rect(x, cx - 12, cy - 10, 24, 2, U.tono(ac, -0.15));
        break;
      }
      case 'nasal': {
        const ac = t.colorCasco || '#a3a8ad';
        elipse(x, cx - 1, cy - 10, 12.5 * cara, 9, ac);
        rect(x, cx - 13, cy - 10, 26, 3, ac);
        rect(x, cx - 13, cy - 8, 26, 1, U.tono(ac, -0.3));
        rect(x, cx + 8, cy - 8, 2, 12, ac);
        rect(x, cx - 6, cy - 18, 4, 2, U.tono(ac, 0.3));
        break;
      }
      case 'yelmo': {
        const ac = t.colorCasco || '#a7abb0';
        rect(x, cx - 12, cy - 16, 25, 30, ac);
        rect(x, cx - 12, cy - 16, 25, 2, U.tono(ac, 0.2));
        rect(x, cx + 7, cy - 16, 6, 30, U.tono(ac, -0.2));
        rect(x, cx - 10, cy - 2, 22, 2, '#120c0a');
        rect(x, cx + 1, cy - 16, 1, 30, U.tono(ac, 0.3));
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) px(x, cx + 4 + i * 2, cy + 5 + j * 3, '#120c0a');
        if (t.cruzYelmo) {
          rect(x, cx - 6, cy + 2, 2, 9, t.cruzYelmo);
          rect(x, cx - 8, cy + 5, 6, 2, t.cruzYelmo);
        }
        if (t.cimera) poli(x, [[cx - 6, cy - 16], [cx, cy - 24], [cx + 6, cy - 16]], t.cimera);
        break;
      }
      case 'cofia':
        poli(x, [[cx - 12, cy - 2], [cx - 11, cy - 12], [cx - 2, cy - 16], [cx + 8, cy - 14], [cx + 11, cy - 6], [cx + 6, cy - 9], [cx - 4, cy - 10]], malla);
        break;
      case 'nino':
      case 'pelo':
        poli(x, [[cx - 11, cy + 2], [cx - 12, cy - 8], [cx - 5, cy - 14], [cx + 4, cy - 14], [cx + 11, cy - 8], [cx + 9, cy - 5], [cx + 2, cy - 9], [cx - 5, cy - 6], [cx - 8, cy + 1]], pelo);
        break;
      case 'calvo':
        rect(x, cx - 10, cy - 4, 3, 6, pelo);
        break;
    }
    contorno(lz, '#1a1014');
    return lz.c;
  }

  const cache = {};
  function obtener(id, emocion = 'normal', boca = 0) {
    const clave = id + '|' + emocion + '|' + boca;
    if (!cache[clave]) cache[clave] = generar(id, emocion, boca);
    return cache[clave];
  }

  // Dibuja el retrato enmarcado en un arco (coordenadas de interfaz)
  function dibujar(ctx, id, x, y, tam, opc = {}) {
    if (!IH.TRAJES[id] && !(EXTRA[id] && EXTRA[id].base)) return;
    const hablando = opc.hablando && Math.floor((opc.t || 0) * 9) % 2 === 0;
    const img = obtener(id, opc.emocion || 'normal', hablando ? 1 : 0);
    ctx.save();
    // marco en arco apuntado
    const w = tam * 0.82, h = tam;
    const cx = x + tam / 2;
    const arco = (ins) => {
      ctx.beginPath();
      ctx.moveTo(cx - w / 2 + ins, y + h - ins);
      ctx.lineTo(cx - w / 2 + ins, y + h * 0.36);
      ctx.quadraticCurveTo(cx - w / 2 + ins, y + ins, cx, y + ins - h * 0.04);
      ctx.quadraticCurveTo(cx + w / 2 - ins, y + ins, cx + w / 2 - ins, y + h * 0.36);
      ctx.lineTo(cx + w / 2 - ins, y + h - ins);
      ctx.closePath();
    };
    arco(0);
    ctx.fillStyle = IH.T.COLORES.oro;
    ctx.fill();
    arco(6);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, opc.fondo1 || '#3a2a3a');
    g.addColorStop(1, opc.fondo2 || '#120c10');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    const esc = (tam * 1.14) / N;
    ctx.drawImage(img, cx - (N * esc) / 2 - tam * 0.02, y + h - N * esc + 2, N * esc, N * esc);
    ctx.restore();
    ctx.save();
    arco(0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2a1a10';
    ctx.stroke();
    ctx.restore();
    IH.T.estrella(ctx, cx, y + 4, 12, IH.T.COLORES.oroClaro);
  }

  IH.Retratos = { obtener, dibujar, EXTRA };
})();
