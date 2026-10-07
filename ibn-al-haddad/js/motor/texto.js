/* Texto e interfaz en alta resolución (espacio virtual 1920×1080).
 * Admite énfasis con *asteriscos* (nombres, lugares, fechas en dorado) y escritura progresiva.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  const T = (IH.T = {});
  T.COLORES = {
    texto: '#f1e6cf',
    enfasis: '#e8b84a',
    tenue: '#b9a888',
    oro: '#d4a73a',
    oroClaro: '#f0cf72',
    fondo: 'rgba(16,10,8,0.86)',
    borde: '#8a6a2a',
    rojo: '#c8402a',
  };
  T.FUENTE = 'Alegreya, "Iowan Old Style", Georgia, serif';
  T.TITULO = '"Reem Kufi", Alegreya, Georgia, serif';
  T.ARABE = '"Aref Ruqaa", Amiri, serif';

  T.fuente = function (tam, opc = {}) {
    const fam = opc.familia || T.FUENTE;
    return `${opc.cursiva ? 'italic ' : ''}${opc.peso || 400} ${Math.round(tam)}px ${fam}`;
  };

  // Separa en tramos con y sin énfasis
  function tramos(txt) {
    const r = [];
    let enf = false;
    for (const parte of txt.split('*')) {
      if (parte) r.push({ t: parte, e: enf });
      enf = !enf;
    }
    return r;
  }

  const cacheLineas = new Map();
  // Devuelve líneas: [{palabras:[{t,e,w}], ancho}], y el total de caracteres visibles
  T.maquetar = function (ctx, txt, ancho, tam, opc = {}) {
    const clave = txt + '|' + ancho + '|' + tam + '|' + (opc.familia || '') + (opc.cursiva ? 'i' : '') + (opc.peso || '');
    if (cacheLineas.has(clave)) return cacheLineas.get(clave);
    const lineas = [];
    let actual = { palabras: [], ancho: 0 };
    const fN = T.fuente(tam, opc), fE = T.fuente(tam, Object.assign({}, opc, { peso: opc.pesoEnfasis || 600 }));
    ctx.font = fN;
    const esp = ctx.measureText(' ').width;
    let total = 0;
    const parrafos = txt.split('\n');
    parrafos.forEach((par, pi) => {
      for (const tr of tramos(par)) {
        const pals = tr.t.split(/( +)/);
        for (const p of pals) {
          if (!p) continue;
          if (/^ +$/.test(p)) {
            actual.palabras.push({ t: ' ', e: tr.e, w: esp, esp: true });
            actual.ancho += esp;
            total += 1;
            continue;
          }
          ctx.font = tr.e ? fE : fN;
          const w = ctx.measureText(p).width;
          if (actual.ancho + w > ancho && actual.palabras.some((q) => !q.esp)) {
            // quita espacios finales
            while (actual.palabras.length && actual.palabras[actual.palabras.length - 1].esp) {
              actual.ancho -= actual.palabras.pop().w;
            }
            lineas.push(actual);
            actual = { palabras: [], ancho: 0 };
          }
          actual.palabras.push({ t: p, e: tr.e, w });
          actual.ancho += w;
          total += p.length;
        }
      }
      if (pi < parrafos.length - 1) {
        lineas.push(actual);
        actual = { palabras: [], ancho: 0 };
        total += 1;
      }
    });
    if (actual.palabras.length) lineas.push(actual);
    const r = { lineas, total, fN, fE };
    if (cacheLineas.size > 600) cacheLineas.clear();
    cacheLineas.set(clave, r);
    return r;
  };

  // Dibuja un párrafo; "visibles" limita los caracteres mostrados (máquina de escribir)
  T.parrafo = function (ctx, txt, x, y, opc = {}) {
    const tam = opc.tam || 40;
    const ancho = opc.ancho || 1200;
    const m = T.maquetar(ctx, txt, ancho, tam, opc);
    const inter = (opc.interlineado || 1.38) * tam;
    const visibles = opc.visibles == null ? Infinity : opc.visibles;
    const alinear = opc.alinear || 'left';
    let cuenta = 0;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    m.lineas.forEach((l, i) => {
      let px = alinear === 'center' ? x - l.ancho / 2 : alinear === 'right' ? x - l.ancho : x;
      const py = y + i * inter + tam;
      for (const p of l.palabras) {
        if (cuenta >= visibles) return;
        let t = p.t;
        if (cuenta + t.length > visibles) t = t.slice(0, visibles - cuenta);
        cuenta += p.t.length;
        ctx.font = p.e ? m.fE : m.fN;
        if (opc.sombra !== false) {
          ctx.fillStyle = opc.colorSombra || 'rgba(0,0,0,0.75)';
          ctx.fillText(t, px + tam * 0.06, py + tam * 0.07);
        }
        ctx.fillStyle = p.e ? opc.colorEnfasis || T.COLORES.enfasis : opc.color || T.COLORES.texto;
        if (opc.alfaPorLetra && t.length) {
          ctx.fillText(t, px, py);
        } else ctx.fillText(t, px, py);
        px += p.w;
      }
      cuenta += 1; // salto de línea cuenta como carácter (evita pausas raras)
    });
    return { alto: m.lineas.length * inter, total: m.total + m.lineas.length, lineas: m.lineas.length };
  };

  T.medirAlto = function (ctx, txt, ancho, tam, opc = {}) {
    const m = T.maquetar(ctx, txt, ancho, tam, opc);
    return m.lineas.length * (opc.interlineado || 1.38) * tam;
  };

  // Texto sencillo de una línea
  T.linea = function (ctx, txt, x, y, opc = {}) {
    ctx.font = T.fuente(opc.tam || 36, opc);
    ctx.textAlign = opc.alinear || 'left';
    ctx.textBaseline = opc.base || 'alphabetic';
    if (opc.espaciado) ctx.letterSpacing = opc.espaciado + 'px';
    if (opc.sombra !== false) {
      ctx.fillStyle = opc.colorSombra || 'rgba(0,0,0,0.7)';
      ctx.fillText(txt, x + (opc.tam || 36) * 0.05, y + (opc.tam || 36) * 0.06);
    }
    if (opc.contorno) {
      ctx.strokeStyle = opc.contorno;
      ctx.lineWidth = opc.grosorContorno || 6;
      ctx.lineJoin = 'round';
      ctx.strokeText(txt, x, y);
    }
    ctx.fillStyle = opc.color || T.COLORES.texto;
    ctx.fillText(txt, x, y);
    if (opc.espaciado) ctx.letterSpacing = '0px';
    return ctx.measureText(txt).width;
  };

  // Estrella de ocho puntas (motivo geométrico islámico) para adornos
  T.estrella = function (ctx, x, y, r, color, relleno = true) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? r * 0.55 : r;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (relleno) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  };

  // Panel ornamentado (cajas de diálogo, menús)
  T.caja = function (ctx, x, y, w, h, opc = {}) {
    const a = opc.alfa == null ? 1 : opc.alfa;
    ctx.save();
    ctx.globalAlpha *= a;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, opc.fondo1 || 'rgba(30,20,14,0.92)');
    g.addColorStop(1, opc.fondo2 || 'rgba(14,9,7,0.94)');
    ctx.fillStyle = g;
    ctx.beginPath();
    const r = opc.radio || 10;
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = opc.borde || T.COLORES.borde;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = U.rgba('#f0cf72', 0.35);
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 8, w - 16, h - 16, Math.max(2, r - 4));
    ctx.stroke();
    if (opc.adornos !== false) {
      for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
        T.estrella(ctx, px, py, 14, T.COLORES.oro);
        T.estrella(ctx, px, py, 6, '#2a1a10');
      }
    }
    ctx.restore();
  };

  // Icono de tecla o botón con su etiqueta
  T.tecla = function (ctx, accion, x, y, tam = 34, opc = {}) {
    const etiqueta = IH.entrada ? IH.entrada.etiqueta(accion) : accion;
    ctx.font = T.fuente(tam * 0.72, { familia: T.TITULO, peso: 600 });
    const w = Math.max(tam, ctx.measureText(etiqueta).width + tam * 0.6);
    ctx.save();
    ctx.globalAlpha *= opc.alfa == null ? 1 : opc.alfa;
    ctx.fillStyle = 'rgba(20,12,8,0.85)';
    ctx.strokeStyle = T.COLORES.oroClaro;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y - tam / 2, w, tam, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = T.COLORES.oroClaro;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(etiqueta, x + w / 2, y + 2);
    ctx.restore();
    return w;
  };

  // "[E] Hablar"
  T.aviso = function (ctx, accion, texto, x, y, opc = {}) {
    const tam = opc.tam || 34;
    ctx.font = T.fuente(tam, { peso: 600 });
    const wt = ctx.measureText(texto).width;
    ctx.font = T.fuente(tam * 0.72, { familia: T.TITULO, peso: 600 });
    const wk = Math.max(tam, ctx.measureText(IH.entrada.etiqueta(accion)).width + tam * 0.6);
    const total = wk + 12 + wt;
    let px = opc.centrado === false ? x : x - total / 2;
    ctx.save();
    ctx.globalAlpha *= opc.alfa == null ? 1 : opc.alfa;
    T.tecla(ctx, accion, px, y, tam);
    T.linea(ctx, texto, px + wk + 12, y + tam * 0.34, { tam, peso: 600, color: T.COLORES.texto });
    ctx.restore();
  };

  // Viñeta (oscurece los bordes de la imagen)
  T.vineta = function (ctx, intensidad = 0.55, color = '0,0,0') {
    const g = ctx.createRadialGradient(IH.UIW / 2, IH.UIH / 2, IH.UIH * 0.35, IH.UIW / 2, IH.UIH / 2, IH.UIH * 1.05);
    g.addColorStop(0, `rgba(${color},0)`);
    g.addColorStop(1, `rgba(${color},${intensidad})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, IH.UIW, IH.UIH);
  };

  // Barras de cine (letterbox)
  T.barrasCine = function (ctx, k) {
    if (k <= 0) return;
    const h = Math.round(118 * U.suave(k));
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, IH.UIW, h);
    ctx.fillRect(0, IH.UIH - h, IH.UIW, h);
  };

  // ------------------------------------------------------------------ notificaciones breves
  const notas = [];
  IH.notificar = function (texto, opc = {}) {
    notas.push({ texto, t: 0, vida: opc.vida || 3.2, icono: opc.icono || null });
    if (notas.length > 4) notas.shift();
  };
  IH.notificaciones = {
    dibujar(ctx) {
      IH.prepararUI();
      let y = 150;
      for (let i = notas.length - 1; i >= 0; i--) {
        const n = notas[i];
        n.t += 1 / 60;
        if (n.t > n.vida) {
          notas.splice(i, 1);
          continue;
        }
        const a = Math.min(1, n.t * 4, (n.vida - n.t) * 2);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = T.fuente(34, { peso: 600 });
        const w = ctx.measureText(n.texto).width + 90;
        const x = IH.UIW - w - 50 + (1 - Math.min(1, n.t * 5)) * 60;
        T.caja(ctx, x, y, w, 64, { adornos: false, radio: 8 });
        T.estrella(ctx, x + 34, y + 32, 13, T.COLORES.oro);
        T.linea(ctx, n.texto, x + 60, y + 44, { tam: 34, peso: 600 });
        ctx.restore();
        y += 80;
      }
    },
  };
})();
