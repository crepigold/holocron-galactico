/* Utilidades de dibujo pixel art: degradados con tramado ordenado (Bayer), texturas de muro,
 * nitidez de capas, brillos para la iluminación y formas básicas en píxeles enteros.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ].map((f) => f.map((v) => (v + 0.5) / 16));

  const G = (IH.G = { BAYER });

  // Degradado vertical tramado entre una lista de colores discretos
  G.degradado = function (x, x0, y0, w, h, colores, opc = {}) {
    const img = x.getImageData(x0, y0, w, h);
    const d = img.data;
    const pal = colores.map((c) => U.hexARgb(c));
    const n = pal.length - 1;
    const curva = opc.curva || ((t) => t);
    for (let yy = 0; yy < h; yy++) {
      const t = U.clamp(curva(yy / Math.max(1, h - 1)), 0, 1) * n;
      const i = Math.min(n - 1, Math.floor(t));
      const f = t - i;
      for (let xx = 0; xx < w; xx++) {
        const umbral = BAYER[(yy + y0) & 3][(xx + x0) & 3];
        const c = f > umbral ? pal[Math.min(n, i + 1)] : pal[i];
        const k = (yy * w + xx) * 4;
        d[k] = c[0];
        d[k + 1] = c[1];
        d[k + 2] = c[2];
        d[k + 3] = 255;
      }
    }
    x.putImageData(img, x0, y0);
  };

  // Rellena un rectángulo con tramado entre dos colores según una proporción (0..1)
  G.trama = function (x, x0, y0, w, h, c1, c2, prop) {
    x.fillStyle = c1;
    x.fillRect(x0, y0, w, h);
    x.fillStyle = c2;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (BAYER[(yy + y0) & 3][(xx + x0) & 3] < prop) x.fillRect(x0 + xx, y0 + yy, 1, 1);
  };

  // Quita el semitransparente de los bordes (para que todo quede nítido)
  G.nitidez = function (lz, umbral = 100) {
    const img = lz.x.getImageData(0, 0, lz.w, lz.h);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] < umbral) d[i] = 0;
      else if (d[i] < 255) {
        const f = 255 / d[i];
        d[i - 3] = Math.min(255, d[i - 3] * f);
        d[i - 2] = Math.min(255, d[i - 2] * f);
        d[i - 1] = Math.min(255, d[i - 1] * f);
        d[i] = 255;
      }
    }
    lz.x.putImageData(img, 0, 0);
  };

  // Tiñe todo lo opaco de una capa (perspectiva atmosférica, hora del día)
  G.tenir = function (lz, color, alfa, modo = 'source-atop') {
    const x = lz.x;
    x.save();
    x.globalCompositeOperation = modo;
    x.globalAlpha = alfa;
    x.fillStyle = color;
    x.fillRect(0, 0, lz.w, lz.h);
    x.restore();
  };

  // Degradado de niebla vertical sobre lo opaco
  G.niebla = function (lz, color, y0, y1, a0, a1) {
    const x = lz.x;
    x.save();
    x.globalCompositeOperation = 'source-atop';
    const g = x.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, U.rgba(color, a0));
    g.addColorStop(1, U.rgba(color, a1));
    x.fillStyle = g;
    x.fillRect(0, Math.min(y0, y1), lz.w, Math.abs(y1 - y0));
    x.restore();
  };

  // Textura de enlucido: motas claras y oscuras, manchas de humedad
  G.enlucido = function (x, x0, y0, w, h, base, rng, opc = {}) {
    x.fillStyle = base;
    x.fillRect(x0, y0, w, h);
    const claro = U.tono(base, 0.1), oscuro = U.tono(base, -0.1), muyOsc = U.tono(base, -0.2);
    const n = Math.floor(w * h * (opc.densidad || 0.05));
    for (let i = 0; i < n; i++) {
      const px = x0 + Math.floor(rng.sig() * w), py = y0 + Math.floor(rng.sig() * h);
      x.fillStyle = rng.prob(0.5) ? claro : oscuro;
      x.fillRect(px, py, rng.prob(0.3) ? 2 : 1, 1);
    }
    // manchas de humedad en la base
    if (opc.humedad !== false) {
      for (let xx = 0; xx < w; xx++) {
        const alto = Math.floor(U.fbm((x0 + xx) * 0.08, 2, 3) * h * 0.18);
        for (let yy = 0; yy < alto; yy++) {
          if (BAYER[(y0 + h - yy) & 3][(x0 + xx) & 3] < 0.5 - yy / (alto + 1) * 0.5) {
            x.fillStyle = oscuro;
            x.fillRect(x0 + xx, y0 + h - 1 - yy, 1, 1);
          }
        }
      }
    }
    // grietas
    const grietas = opc.grietas == null ? Math.floor(w * h / 3000) : opc.grietas;
    for (let i = 0; i < grietas; i++) {
      let px = x0 + Math.floor(rng.sig() * w), py = y0 + Math.floor(rng.sig() * h * 0.8);
      const largo = rng.entero(3, 9);
      x.fillStyle = muyOsc;
      for (let j = 0; j < largo; j++) {
        x.fillRect(px, py, 1, 1);
        px += rng.entero(-1, 1);
        py += 1;
      }
    }
  };

  // Sillería (bloques de piedra), con opción de "ablaq" (hiladas alternas de dos colores)
  G.silleria = function (x, x0, y0, w, h, c1, c2, rng, opc = {}) {
    const alto = opc.alto || 5;
    const largoMin = opc.largo || 8;
    const junta = opc.junta || U.tono(c1, -0.25);
    let fila = 0;
    for (let y = y0; y < y0 + h; y += alto) {
      const col = opc.ablaq && fila % 2 ? c2 : c1;
      let xx = x0 - (fila % 2 ? Math.floor(largoMin / 2) : 0);
      while (xx < x0 + w) {
        const lw = largoMin + rng.entero(0, 4);
        const a = Math.max(xx, x0), b = Math.min(xx + lw, x0 + w);
        if (b > a) {
          const tono = opc.ablaq ? col : U.tono(col, rng.rango(-0.06, 0.06));
          x.fillStyle = tono;
          x.fillRect(a, y, b - a, Math.min(alto, y0 + h - y));
          x.fillStyle = U.tono(tono, 0.12);
          x.fillRect(a, y, b - a, 1);
        }
        x.fillStyle = junta;
        if (xx + lw < x0 + w && xx + lw >= x0) x.fillRect(xx + lw - 1, y, 1, Math.min(alto, y0 + h - y));
        xx += lw;
      }
      x.fillStyle = junta;
      if (y + alto - 1 < y0 + h) x.fillRect(x0, y + alto - 1, w, 1);
      fila++;
    }
  };

  // Arco de herradura / apuntado relleno (puertas, ventanas)
  G.arco = function (x, cx, base, ancho, alto, color, tipo = 'apuntado') {
    x.fillStyle = color;
    const r = ancho / 2;
    x.beginPath();
    x.moveTo(cx - r, base);
    x.lineTo(cx - r, base - alto + r);
    if (tipo === 'apuntado') {
      x.quadraticCurveTo(cx - r, base - alto - r * 0.2, cx, base - alto - r * 0.15);
      x.quadraticCurveTo(cx + r, base - alto - r * 0.2, cx + r, base - alto + r);
    } else if (tipo === 'herradura') {
      x.arc(cx, base - alto + r, r * 1.08, Math.PI * 0.9, Math.PI * 2.1);
    } else {
      x.arc(cx, base - alto + r, r, Math.PI, Math.PI * 2);
    }
    x.lineTo(cx + r, base);
    x.closePath();
    x.fill();
  };

  // Celosía de madera (mashrabiya)
  G.celosia = function (x, x0, y0, w, h, madera, hueco) {
    x.fillStyle = madera;
    x.fillRect(x0, y0, w, h);
    x.fillStyle = hueco;
    for (let yy = y0 + 1; yy < y0 + h - 1; yy++) for (let xx = x0 + 1; xx < x0 + w - 1; xx++) if ((xx - x0 + yy - y0) % 3 === 0 || (xx - x0 - (yy - y0) + 300) % 3 === 0) x.fillRect(xx, yy, 1, 1);
    x.fillStyle = U.tono(madera, 0.18);
    x.fillRect(x0, y0, w, 1);
    x.fillStyle = U.tono(madera, -0.3);
    x.fillRect(x0, y0 + h - 1, w, 1);
  };

  // Brillo radial (para luces y resplandores), cacheado por color/tamaño
  const cacheBrillos = {};
  G.brillo = function (radio, color, centro = 1) {
    const r = Math.max(2, Math.round(radio));
    const clave = r + color + centro;
    if (cacheBrillos[clave]) return cacheBrillos[clave];
    const lz = IH.lienzo(r * 2, r * 2);
    const g = lz.x.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, U.rgba(color, centro));
    g.addColorStop(0.35, U.rgba(color, centro * 0.45));
    g.addColorStop(1, U.rgba(color, 0));
    lz.x.fillStyle = g;
    lz.x.fillRect(0, 0, r * 2, r * 2);
    return (cacheBrillos[clave] = lz.c);
  };

  // Elipse/círculo relleno con bordes nítidos (para lunas, cúpulas pequeñas…)
  G.circulo = function (x, cx, cy, r, color) {
    x.fillStyle = color;
    for (let yy = -Math.ceil(r); yy <= Math.ceil(r); yy++) {
      const ww = Math.floor(Math.sqrt(Math.max(0, r * r - yy * yy)));
      if (ww > 0 || Math.abs(yy) < r) x.fillRect(Math.round(cx - ww), Math.round(cy + yy), ww * 2 + 1, 1);
    }
  };
  G.semicirculo = function (x, cx, cy, r, color, alto = 1) {
    x.fillStyle = color;
    for (let yy = -Math.ceil(r * alto); yy <= 0; yy++) {
      const t = yy / alto;
      const ww = Math.floor(Math.sqrt(Math.max(0, r * r - t * t)));
      x.fillRect(Math.round(cx - ww), Math.round(cy + yy), ww * 2 + 1, 1);
    }
  };

  // Línea de píxeles (Bresenham)
  G.linea = function (x, x0, y0, x1, y1, color) {
    x.fillStyle = color;
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; i < 2000; i++) {
      x.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  // Polígono relleno nítido: se dibuja en un lienzo temporal y se aplica umbral
  G.poligono = function (x, pts, color) {
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
    x.closePath();
    x.fill();
  };

  // Texto de título con relieve (para láminas)
  G.sombraTexto = function (x, txt, px, py, color, sombra) {
    x.fillStyle = sombra;
    x.fillText(txt, px + 1, py + 1);
    x.fillStyle = color;
    x.fillText(txt, px, py);
  };
})();
