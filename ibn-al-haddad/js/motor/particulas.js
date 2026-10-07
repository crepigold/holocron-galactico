/* Partículas: chispas, brasas, polvo, humo, sangre, astillas, hojas, gotas, estelas de espada.
 * Se dibujan en coordenadas del mundo (la escena aplica la cámara).
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  class Particulas {
    constructor(max = 900) {
      this.lista = [];
      this.max = max;
      this.estelas = [];
    }
    emitir(tipo, x, y, n = 1, opc = {}) {
      const def = TIPOS[tipo];
      if (!def) return;
      if (tipo === 'sangre' && IH.ajustes && IH.ajustes.sangre === false) return;
      for (let i = 0; i < n; i++) {
        if (this.lista.length >= this.max) this.lista.shift();
        const p = { tipo, x, y, vx: 0, vy: 0, vida: 1, t: 0, tam: 1, color: '#fff', aditivo: false, g: 0, roce: 0, delante: !!opc.delante };
        def.iniciar(p, opc, IH.azar);
        this.lista.push(p);
      }
    }
    // Estela de espada: arco en forma de media luna
    estela(x, y, dir, opc = {}) {
      this.estelas.push({ x, y, dir, t: 0, vida: opc.vida || 0.14, r: opc.r || 26, a0: opc.a0 != null ? opc.a0 : -80, a1: opc.a1 != null ? opc.a1 : 60, color: opc.color || '#fff4dc', grosor: opc.grosor || 5, tipo: opc.tipo || 'arco' });
    }
    actualizar(dt, suelo) {
      const l = this.lista;
      for (let i = l.length - 1; i >= 0; i--) {
        const p = l[i];
        p.t += dt;
        if (p.t >= p.vida) {
          l.splice(i, 1);
          continue;
        }
        p.vy += p.g * dt;
        if (p.roce) {
          p.vx *= Math.pow(1 - p.roce, dt * 60);
          p.vy *= Math.pow(1 - p.roce, dt * 60);
        }
        if (p.onda) p.vx += Math.sin(p.t * p.onda + p.fase) * p.amp * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.rebota && suelo != null && p.y > suelo) {
          p.y = suelo;
          p.vy *= -0.3;
          p.vx *= 0.6;
          if (Math.abs(p.vy) < 10) {
            p.vy = 0;
            p.g = 0;
            p.vx = 0;
            p.posada = true;
          }
        }
      }
      for (let i = this.estelas.length - 1; i >= 0; i--) {
        this.estelas[i].t += dt;
        if (this.estelas[i].t > this.estelas[i].vida) this.estelas.splice(i, 1);
      }
    }
    dibujar(ctx, cx, cy, delante = false) {
      for (const p of this.lista) {
        if (p.delante !== delante) continue;
        const k = p.t / p.vida;
        const def = TIPOS[p.tipo];
        const x = Math.round(p.x - cx), y = Math.round(p.y - cy);
        if (x < -20 || x > IH.ANCHO + 20 || y < -40 || y > IH.ALTO + 20) continue;
        if (def.dibujar) {
          def.dibujar(ctx, p, x, y, k);
          continue;
        }
        const a = def.alfa ? def.alfa(k) : 1 - k;
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        if (p.aditivo) ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = typeof p.color === 'function' ? p.color(k) : p.color;
        const t = Math.max(1, Math.round(p.tam * (def.escala ? def.escala(k) : 1)));
        ctx.fillRect(x - (t >> 1), y - (t >> 1), t, t);
        if (p.aditivo) ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = 1;
      if (!delante) return;
      for (const e of this.estelas) {
        const k = e.t / e.vida;
        ctx.save();
        ctx.translate(Math.round(e.x - cx), Math.round(e.y - cy));
        ctx.scale(e.dir, 1);
        ctx.globalAlpha = (1 - k) * 0.9;
        ctx.strokeStyle = e.color;
        ctx.lineCap = 'round';
        if (e.tipo === 'estocada') {
          ctx.lineWidth = Math.max(1, e.grosor * (1 - k));
          ctx.beginPath();
          ctx.moveTo(4, 0);
          ctx.lineTo(e.r + k * 10, 0);
          ctx.stroke();
          ctx.globalAlpha *= 0.5;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -3);
          ctx.lineTo(e.r * 0.8, -1);
          ctx.moveTo(0, 3);
          ctx.lineTo(e.r * 0.8, 1);
          ctx.stroke();
        } else {
          const a0 = (e.a0 * Math.PI) / 180, a1 = (e.a1 * Math.PI) / 180;
          const pasos = 10;
          for (let i = 0; i < pasos; i++) {
            const t0 = i / pasos, t1 = (i + 1) / pasos;
            // la estela se va borrando desde la cola
            if (t1 < k * 1.2) continue;
            ctx.lineWidth = Math.max(1, e.grosor * Math.sin(t1 * Math.PI) * (1 - k * 0.6));
            ctx.beginPath();
            ctx.arc(0, 0, e.r, U.lerp(a0, a1, t0), U.lerp(a0, a1, t1), a1 < a0);
            ctx.stroke();
          }
          ctx.globalAlpha *= 0.6;
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, e.r + 1, a0, a1, a1 < a0);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    limpiar() {
      this.lista.length = 0;
      this.estelas.length = 0;
    }
  }

  const TIPOS = {
    chispa: {
      iniciar(p, o, r) {
        const ang = o.angulo != null ? o.angulo + r.rango(-0.8, 0.8) : r.rango(0, Math.PI * 2);
        const v = r.rango(60, 220) * (o.fuerza || 1);
        p.vx = Math.cos(ang) * v;
        p.vy = Math.sin(ang) * v - 40;
        p.g = 420;
        p.vida = r.rango(0.15, 0.45);
        p.aditivo = true;
        p.color = r.prob(0.5) ? '#ffe6a0' : '#ffb040';
        p.roce = 0.04;
      },
      dibujar(ctx, p, x, y, k) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = p.color;
        const lx = Math.round(-p.vx * 0.02), ly = Math.round(-p.vy * 0.02);
        ctx.fillRect(x, y, 1, 1);
        ctx.fillRect(x + (lx >> 1), y + (ly >> 1), 1, 1);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
    },
    brasa: {
      iniciar(p, o, r) {
        p.vx = r.rango(-12, 12);
        p.vy = r.rango(-40, -15) * (o.fuerza || 1);
        p.vida = r.rango(1, 2.6);
        p.aditivo = true;
        p.onda = r.rango(2, 5);
        p.fase = r.rango(0, 6);
        p.amp = 30;
        p.color = (k) => (k < 0.4 ? '#ffd27a' : k < 0.75 ? '#ff8a3a' : '#a83a20');
      },
    },
    polvo: {
      iniciar(p, o, r) {
        p.vx = r.rango(-30, 30) + (o.vx || 0);
        p.vy = r.rango(-18, -4);
        p.vida = r.rango(0.35, 0.7);
        p.tam = r.rango(2, 4);
        p.roce = 0.08;
        p.color = o.color || '#c8b088';
      },
      alfa: (k) => 0.7 * (1 - k),
      escala: (k) => 1 + k,
    },
    humo: {
      iniciar(p, o, r) {
        p.vx = r.rango(-6, 6) + (o.viento || 4);
        p.vy = r.rango(-22, -10);
        p.vida = r.rango(2, 4);
        p.tam = r.rango(3, 6);
        p.color = o.color || '#4a3e3c';
      },
      alfa: (k) => 0.35 * Math.sin(k * Math.PI),
      escala: (k) => 1 + k * 2.5,
    },
    sangre: {
      iniciar(p, o, r) {
        const ang = (o.angulo != null ? o.angulo : -Math.PI / 2) + r.rango(-0.7, 0.7);
        const v = r.rango(40, 140);
        p.vx = Math.cos(ang) * v;
        p.vy = Math.sin(ang) * v - 30;
        p.g = 520;
        p.vida = r.rango(0.5, 1.2);
        p.rebota = true;
        p.color = r.prob(0.5) ? '#8a1a1a' : '#a82424';
        p.tam = r.prob(0.3) ? 2 : 1;
      },
      alfa: (k) => (k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3),
    },
    astilla: {
      iniciar(p, o, r) {
        const ang = r.rango(-Math.PI, 0);
        const v = r.rango(50, 150);
        p.vx = Math.cos(ang) * v;
        p.vy = Math.sin(ang) * v;
        p.g = 500;
        p.vida = r.rango(0.6, 1.2);
        p.rebota = true;
        p.color = o.color || (r.prob(0.5) ? '#8a6a3a' : '#5a4022');
        p.tam = r.prob(0.4) ? 2 : 1;
      },
      alfa: (k) => (k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2),
    },
    gota: {
      iniciar(p, o, r) {
        p.vx = r.rango(-40, 40);
        p.vy = r.rango(-80, -20);
        p.g = 500;
        p.vida = r.rango(0.4, 0.8);
        p.color = '#9ac8e8';
      },
    },
    vapor: {
      iniciar(p, o, r) {
        p.vx = r.rango(-10, 10);
        p.vy = r.rango(-40, -20);
        p.vida = r.rango(0.8, 1.6);
        p.tam = r.rango(3, 5);
        p.color = '#e8e8f0';
      },
      alfa: (k) => 0.5 * (1 - k),
      escala: (k) => 1 + k * 2,
    },
    fuego: {
      iniciar(p, o, r) {
        p.vx = r.rango(-8, 8);
        p.vy = r.rango(-50, -25) * (o.fuerza || 1);
        p.vida = r.rango(0.3, 0.7);
        p.tam = r.rango(2, 4) * (o.tam || 1);
        p.aditivo = true;
        p.color = (k) => (k < 0.3 ? '#fff0a0' : k < 0.6 ? '#ffa030' : '#c83a1a');
      },
      escala: (k) => 1 - k * 0.7,
    },
    hoja: {
      iniciar(p, o, r) {
        p.vx = r.rango(10, 30);
        p.vy = r.rango(5, 20);
        p.vida = r.rango(3, 6);
        p.onda = r.rango(1, 3);
        p.fase = r.rango(0, 6);
        p.amp = 40;
        p.color = o.color || '#c8a860';
      },
      alfa: (k) => (k > 0.85 ? (1 - k) / 0.15 : 0.8),
    },
    mota: {
      // polvo en suspensión iluminado por un rayo de luz
      iniciar(p, o, r) {
        p.vx = r.rango(-3, 3);
        p.vy = r.rango(-3, 3);
        p.vida = r.rango(3, 7);
        p.onda = r.rango(0.5, 1.5);
        p.fase = r.rango(0, 6);
        p.amp = 3;
        p.color = o.color || '#fff0c8';
        p.aditivo = true;
      },
      alfa: (k) => 0.5 * Math.sin(k * Math.PI),
    },
    anillo: {
      iniciar(p, o, r) {
        p.vida = o.vida || 0.35;
        p.color = o.color || '#fff4dc';
        p.r = o.r || 18;
      },
      dibujar(ctx, p, x, y, k) {
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1, 3 * (1 - k));
        ctx.beginPath();
        ctx.arc(x, y, 2 + p.r * U.salida(k), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      },
    },
    destello: {
      iniciar(p, o, r) {
        p.vida = o.vida || 0.18;
        p.r = o.r || 16;
        p.color = o.color || '#fff4dc';
      },
      dibujar(ctx, p, x, y, k) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 1 - k;
        const r = Math.round(p.r * (0.6 + k * 0.6));
        ctx.drawImage(IH.G.brillo(r, p.color, 1), x - r, y - r);
        ctx.fillStyle = '#ffffff';
        const l = Math.round(p.r * 1.2 * (1 - k));
        ctx.fillRect(x - l, y, l * 2 + 1, 1);
        ctx.fillRect(x, y - (l >> 1), 1, l + 1);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
    },
    texto: {
      // números o palabras flotantes (p. ej. "¡Parada!")
      iniciar(p, o, r) {
        p.vy = -26;
        p.vida = o.vida || 0.9;
        p.texto = o.texto;
        p.color = o.color || '#fff4dc';
      },
      dibujar() {},
    },
  };

  IH.Particulas = Particulas;
})();
