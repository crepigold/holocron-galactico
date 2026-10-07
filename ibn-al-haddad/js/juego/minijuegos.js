/* Minijuegos de la forja:
 *  - Fuelle: mantener el fuego en la temperatura justa (ni frío ni "quemado").
 *  - Martillo: golpear el hierro al rojo cuando el indicador cruza la zona dorada.
 *  - Temple: sumergir la hoja en el agua en el momento del color adecuado.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  function panel(ctx, titulo, y = 720, h = 260) {
    const T = IH.T;
    T.caja(ctx, 460, y, IH.UIW - 920, h);
    T.linea(ctx, titulo, IH.UIW / 2, y + 62, { tam: 40, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro });
  }

  // ------------------------------------------------------------------ fuelle
  class Fuelle {
    constructor(zona, opc = {}) {
      this.z = zona;
      this.calor = 0.15;
      this.enZona = 0;
      this.t = 0;
      this.fin = false;
      this.objetivo = [0.62, 0.82];
      this.necesario = opc.necesario || 2.2;
      this.fuelle = zona.buscar('fuelle');
      this.fragua = zona.buscar('fragua');
      this.pulsando = false;
    }
    actualizar(dt) {
      if (this.fin) return true;
      this.t += dt;
      const E = IH.entrada;
      const pulsa = E.pulsado('interactuar') || E.pulsado('aceptar') || E.pulsado('atacar');
      if (pulsa && !this.pulsando) {
        IH.audio.sfx('fuelle', { vol: 0.8 });
        this.z.anim('yusuf', 'fuelle');
      }
      this.pulsando = pulsa;
      this.calor += (pulsa ? 0.32 : -0.11) * dt;
      this.calor = U.clamp(this.calor, 0, 1);
      if (this.fuelle) this.fuelle.comprimido = U.aproximar(this.fuelle.comprimido || 0, pulsa ? 1 : 0, dt * 3);
      if (this.fragua) this.fragua.intensidad = 0.4 + this.calor * 0.9;
      if (this.calor > 0.9 && Math.random() < dt * 8) {
        this.z.particulas.emitir('chispa', this.fragua.x, this.fragua.y - 30, 2);
        IH.audio.sfx('chispas', { vol: 0.4 });
      }
      if (this.calor >= this.objetivo[0] && this.calor <= this.objetivo[1]) this.enZona += dt;
      else this.enZona = Math.max(0, this.enZona - dt * 0.5);
      if (this.enZona >= this.necesario) {
        this.fin = true;
        this.z.anim('yusuf', null);
        IH.audio.sfx('fuego');
        IH.audio.estribillo('mision');
        if (this.fragua) this.fragua.intensidad = 1;
      }
      return this.fin;
    }
    dibujar(ctx) {
      ctx.save();
      ctx.translate(0, -600);
      this._dibujar(ctx);
      ctx.restore();
    }
    _dibujar(ctx) {
      const T = IH.T;
      panel(ctx, 'Aviva el fuego de la fragua');
      const x0 = 620, w = IH.UIW - 1240, y = 840;
      // barra de temperatura
      const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, '#3a1a10');
      g.addColorStop(0.45, '#a8301a');
      g.addColorStop(0.7, '#ff9a3a');
      g.addColorStop(0.85, '#ffe08a');
      g.addColorStop(1, '#ffffff');
      ctx.fillStyle = g;
      ctx.fillRect(x0, y, w, 34);
      ctx.strokeStyle = T.COLORES.oro;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0 + w * this.objetivo[0], y - 8, w * (this.objetivo[1] - this.objetivo[0]), 50);
      ctx.strokeRect(x0, y, w, 34);
      const cx = x0 + w * this.calor;
      ctx.fillStyle = '#fff4dc';
      ctx.beginPath();
      ctx.moveTo(cx, y - 4);
      ctx.lineTo(cx - 12, y - 24);
      ctx.lineTo(cx + 12, y - 24);
      ctx.fill();
      // progreso
      ctx.fillStyle = 'rgba(212,167,58,0.3)';
      ctx.fillRect(x0, y + 50, w, 8);
      ctx.fillStyle = T.COLORES.oroClaro;
      ctx.fillRect(x0, y + 50, (w * this.enZona) / this.necesario, 8);
      T.aviso(ctx, 'interactuar', 'Mantén para soplar  ·  suelta para que baje', IH.UIW / 2, y + 112, { tam: 30 });
    }
  }

  // ------------------------------------------------------------------ martillo
  class Martillo {
    constructor(zona, opc = {}) {
      this.z = zona;
      this.golpes = opc.golpes || 5;
      this.hechos = 0;
      this.puntos = [];
      this.t = 0;
      this.pos = 0;
      this.vel = 1.25;
      this.ancho = 0.2;
      this.fin = false;
      this.espera = 0;
      this.yunque = zona.buscar('yunque');
      this.calor = 1;
      this.mensaje = null;
    }
    actualizar(dt) {
      if (this.fin) return true;
      this.t += dt;
      const E = IH.entrada;
      this.calor = Math.max(0.3, this.calor - dt * 0.05);
      if (this.yunque) this.yunque.hierro = this.calor;
      if (this.espera > 0) {
        this.espera -= dt;
        if (this.espera <= 0 && this.hechos >= this.golpes) {
          this.fin = true;
          this.z.anim('yusuf', null);
        }
        return false;
      }
      this.pos = (Math.sin(this.t * this.vel * Math.PI) + 1) / 2;
      if (E.presionado('atacar') || E.presionado('aceptar') || E.presionado('interactuar')) {
        const d = Math.abs(this.pos - 0.5);
        let p, txt;
        if (d < this.ancho * 0.22) {
          p = 3;
          txt = '¡Perfecto!';
        } else if (d < this.ancho / 2) {
          p = 2;
          txt = 'Bien';
        } else {
          p = 0;
          txt = 'Torcido…';
        }
        this.puntos.push(p);
        this.mensaje = { txt, t: 0, p };
        this.hechos++;
        this.vel += 0.18;
        this.ancho = Math.max(0.1, this.ancho - 0.018);
        const J = this.z.jugador;
        J.poner('golpeMartillo', true);
        setTimeout(() => {
          IH.audio.sfx('yunque', { tono: p === 3 ? 1.05 : 0.95 });
          if (this.yunque) {
            this.z.particulas.emitir('chispa', this.yunque.x, this.yunque.y - 17, p === 3 ? 16 : 8, { fuerza: p === 3 ? 1.2 : 0.7 });
            if (p === 3) this.z.particulas.emitir('destello', this.yunque.x, this.yunque.y - 17, 1, { r: 14 });
          }
          this.z.sacudir(p === 3 ? 0.15 : 0.06);
        }, 90);
        this.espera = 0.5;
      }
      if (this.mensaje) this.mensaje.t += dt;
      return false;
    }
    get calidad() {
      const s = this.puntos.reduce((a, b) => a + b, 0) / (this.golpes * 3);
      return s;
    }
    dibujar(ctx) {
      ctx.save();
      ctx.translate(0, -600);
      this._dibujar(ctx);
      ctx.restore();
    }
    _dibujar(ctx) {
      const T = IH.T;
      panel(ctx, `Forja la hoja  ·  golpe ${Math.min(this.hechos + 1, this.golpes)} de ${this.golpes}`);
      const x0 = 620, w = IH.UIW - 1240, y = 850;
      ctx.fillStyle = 'rgba(20,12,8,0.9)';
      ctx.fillRect(x0, y, w, 30);
      const zx = x0 + w * (0.5 - this.ancho / 2), zw = w * this.ancho;
      ctx.fillStyle = 'rgba(212,167,58,0.45)';
      ctx.fillRect(zx, y, zw, 30);
      ctx.fillStyle = 'rgba(255,240,180,0.65)';
      ctx.fillRect(x0 + w * (0.5 - this.ancho * 0.11), y, w * this.ancho * 0.22, 30);
      ctx.strokeStyle = T.COLORES.oro;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0, y, w, 30);
      const cx = x0 + w * this.pos;
      ctx.fillStyle = '#fff4dc';
      ctx.fillRect(cx - 3, y - 12, 6, 54);
      // marcas de golpes dados
      for (let i = 0; i < this.golpes; i++) {
        const p = this.puntos[i];
        const col = p === 3 ? T.COLORES.oroClaro : p === 2 ? '#c8b088' : p === 0 ? '#a83a2a' : 'rgba(255,255,255,0.15)';
        T.estrella(ctx, IH.UIW / 2 - (this.golpes - 1) * 30 + i * 60, y + 76, 14, col);
      }
      if (this.mensaje && this.mensaje.t < 0.9) {
        ctx.save();
        ctx.globalAlpha = 1 - this.mensaje.t / 0.9;
        T.linea(ctx, this.mensaje.txt, IH.UIW / 2, y - 30 - this.mensaje.t * 30, { tam: 44, alinear: 'center', familia: T.TITULO, color: this.mensaje.p === 3 ? T.COLORES.oroClaro : this.mensaje.p ? T.COLORES.texto : '#e07050' });
        ctx.restore();
      }
      T.aviso(ctx, 'atacar', 'Golpear cuando el indicador esté en el oro', IH.UIW / 2, y + 140, { tam: 28 });
    }
  }

  // ------------------------------------------------------------------ temple
  class Temple {
    constructor(zona) {
      this.z = zona;
      this.t = 0;
      this.fin = false;
      this.resultado = null;
    }
    actualizar(dt) {
      if (this.fin) return true;
      this.t += dt;
      // el color del hierro baja de blanco a rojo oscuro
      this.color = U.clamp(1 - this.t / 4.5, 0, 1);
      const E = IH.entrada;
      if (this.t > 0.6 && (E.presionado('atacar') || E.presionado('aceptar') || E.presionado('interactuar'))) {
        const ok = this.color > 0.32 && this.color < 0.6;
        this.resultado = ok ? 'bien' : this.color >= 0.6 ? 'pronto' : 'tarde';
        this.fin = true;
        IH.audio.sfx('temple');
        const b = this.z.buscar('cubo');
        if (b) this.z.particulas.emitir('vapor', b.x, b.y - 18, 16);
      }
      if (this.color <= 0) {
        this.resultado = 'tarde';
        this.fin = true;
      }
      return this.fin;
    }
    dibujar(ctx) {
      ctx.save();
      ctx.translate(0, -600);
      this._dibujar(ctx);
      ctx.restore();
    }
    _dibujar(ctx) {
      const T = IH.T;
      panel(ctx, 'Templa la hoja en el agua');
      const x0 = 620, w = IH.UIW - 1240, y = 850;
      const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, '#fffbe8');
      g.addColorStop(0.3, '#ffcf6a');
      g.addColorStop(0.55, '#e0541c');
      g.addColorStop(0.8, '#8a1a10');
      g.addColorStop(1, '#3a3a3a');
      ctx.fillStyle = g;
      ctx.fillRect(x0, y, w, 30);
      ctx.strokeStyle = T.COLORES.oro;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0 + w * 0.4, y - 8, w * 0.28, 46);
      const cx = x0 + w * (1 - (this.color || 1));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3, y - 12, 6, 54);
      T.parrafo(ctx, '«Ni blanco, ni negro: cuando tenga el color de la *granada madura*.»', IH.UIW / 2, y + 44, { tam: 30, alinear: 'center', ancho: 900, cursiva: true, color: T.COLORES.tenue });
      T.aviso(ctx, 'atacar', 'Sumergir', IH.UIW / 2, y + 128, { tam: 28 });
    }
  }

  IH.Minijuegos = { Fuelle, Martillo, Temple };

  // Envuelve un minijuego como tarea de guion mostrada en la interfaz de la zona
  IH.Zona.prototype.minijuego = function (Clase, opc) {
    const m = new Clase(this, opc);
    const z = this;
    z.ui = m;
    return {
      juego: m,
      get resultado() {
        return m.resultado != null ? m.resultado : m.calidad;
      },
      actualizar(dt) {
        const fin = m.actualizar(dt);
        if (fin && z.ui === m) z.ui = null;
        return fin;
      },
    };
  };
})();
