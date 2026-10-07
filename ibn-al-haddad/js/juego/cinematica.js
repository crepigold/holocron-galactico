/* Escena cinemática: una sucesión de PLANOS ilustrados (láminas de pixel art animadas)
 * con paneo lento de cámara, narración y rótulos.
 *
 * Ritmo pensado para leer con calma: cada frase se escribe letra a letra y se mantiene
 * en pantalla un tiempo de lectura generoso (ver U.tiempoLectura). Con "narración automática"
 * avanza sola; si no, espera a que el jugador pulse. Mantener [Esc]/[Intro] salta la escena.
 *
 * IH.CINEMATICAS[id] = { musica, planos: [ { lamina, texto:[...], camara:{x0,y0,x1,y1}, titulo, ... } ], siguiente }
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  IH.CINEMATICAS = IH.CINEMATICAS || {};
  IH.LAMINAS = IH.LAMINAS || {};

  class Cinematica {
    constructor(params) {
      this.params = params;
      this.def = IH.CINEMATICAS[params.id];
      if (!this.def) throw new Error('Cinemática desconocida ' + params.id);
      this.i = -1;
      this.mantener = 0;
      this.particulas = new IH.Particulas();
      this.fundido = 1;
      this.terminando = false;
    }
    entrar() {
      if (this.def.musica !== undefined) IH.audio.musica(this.def.musica, { fundido: 2 });
      if (this.def.ambiente !== undefined) IH.audio.ambiente(this.def.ambiente);
      IH.entrada.consumirTodo();
      this.siguientePlano();
    }
    salir() {}

    siguientePlano() {
      this.i++;
      if (this.i >= this.def.planos.length) {
        this.terminar();
        return;
      }
      const p = (this.plano = Object.assign({}, this.def.planos[this.i]));
      this.t = 0;
      this.linea = 0;
      this.tLinea = 0;
      this.visibles = 0;
      this.fase = 'entrada';
      this.textos = p.texto ? (Array.isArray(p.texto) ? p.texto : [p.texto]) : [];
      // duración estimada para el paneo
      let est = p.dur || 0;
      if (!p.dur) {
        for (const l of this.textos) est += U.tiempoLectura(l) + l.length / 30;
        if (p.titulo) est = Math.max(est, p.titulo.dur || 7);
        est = Math.max(est, 4);
      }
      this.duracionEstimada = est + 1.5;
      this.lamina = typeof p.lamina === 'string' ? IH.LAMINAS[p.lamina] : p.lamina;
      if (this.lamina && !this.lamina._construida && this.lamina.construir) {
        this.lamina.construir();
        this.lamina._construida = true;
      }
      if (this.lamina && this.lamina.alEmpezar) this.lamina.alEmpezar(this, p);
      this.estado = {};
      if (p.musica !== undefined) IH.audio.musica(p.musica, { fundido: p.fundidoMusica || 2 });
      if (p.ambiente !== undefined) IH.audio.ambiente(p.ambiente);
      this.sfxPendientes = (p.sfx || []).map((s) => Object.assign({}, s));
      if (p.estribillo) IH.audio.estribillo(p.estribillo);
      if (p.cronica) IH.desbloquearCronica(p.cronica, { silencio: true });
      this.particulas.limpiar();
    }

    terminar() {
      if (this.terminando) return;
      this.terminando = true;
      const s = this.params.siguiente || this.def.siguiente;
      if (typeof s === 'function') s();
      else if (s) IH.cambiarEscena(s.escena || 'zona', s.params || s, { fundido: s.fundido != null ? s.fundido : 1.5 });
      else IH.cambiarEscena('titulo', {}, { fundido: 1.5 });
    }

    actualizar(dt, dtReal) {
      if (this.terminando) return;
      const E = IH.entrada;
      const p = this.plano;
      this.t += dt;
      // saltar escena manteniendo pulsado
      if (E.pulsado('saltarEscena') || E.pulsado('pausa')) {
        this.mantener += dtReal;
        if (this.mantener > 1.2) {
          this.mantener = 0;
          this.terminar();
          return;
        }
      } else this.mantener = Math.max(0, this.mantener - dtReal * 2);

      for (const s of this.sfxPendientes) {
        if (!s.hecho && this.t >= s.t) {
          s.hecho = true;
          if (s.id) IH.audio.sfx(s.id, s.opc || {});
          if (s.musica !== undefined) IH.audio.musica(s.musica);
          if (s.estribillo) IH.audio.estribillo(s.estribillo);
        }
      }
      if (this.lamina && this.lamina.actualizar) this.lamina.actualizar(this, dt);
      this.particulas.actualizar(dt);

      const entrada = p.fundidoEntrada != null ? p.fundidoEntrada : 1.6;
      const salida = p.fundidoSalida != null ? p.fundidoSalida : 1.6;
      if (this.fase === 'entrada') {
        this.fundido = 1 - U.suave(this.t / entrada);
        if (this.t >= entrada * 0.6) this.fase = 'texto';
      }
      if (this.fase === 'texto' || this.fase === 'entrada') {
        if (this.fase === 'entrada') this.fundido = 1 - U.suave(this.t / entrada);
        else this.fundido = Math.max(0, this.fundido - dt / entrada);
        const avanzar = this.t > 0.5 && (E.presionado('aceptar') || E.presionado('atacar'));
        if (this.textos.length === 0) {
          const dur = p.dur || (p.titulo ? p.titulo.dur || 7 : 4);
          if (this.t > dur || (avanzar && this.t > 1.5)) this.empezarSalida();
        } else {
          this.tLinea += dt;
          const l = this.textos[this.linea];
          const total = l.replace(/\*/g, '').length + 6;
          const vel = 30 * (IH.ajustes.velTexto || 1);
          if (this.tLinea > (this.linea === 0 ? 0.6 : 0.35)) this.visibles = Math.min(total, this.visibles + dt * vel);
          const completa = this.visibles >= total;
          const lectura = U.tiempoLectura(l) + l.length / vel;
          if (avanzar && this.fase === 'texto') {
            if (!completa) this.visibles = total;
            else this.siguienteLinea();
          } else if (IH.ajustes.narracionAuto && completa && this.tLinea > lectura) {
            this.siguienteLinea();
          }
        }
      } else if (this.fase === 'salida') {
        this.tSalida += dt;
        this.fundido = U.suave(this.tSalida / salida);
        if (p.sinFundido) this.fundido = 0;
        if (this.tSalida >= salida) this.siguientePlano();
      }
    }
    siguienteLinea() {
      this.linea++;
      this.tLinea = 0;
      this.visibles = 0;
      if (this.linea >= this.textos.length) {
        this.linea = this.textos.length - 1;
        this.visibles = 99999;
        this.empezarSalida();
      } else IH.audio.sfx('pluma', { vol: 0.5 });
    }
    empezarSalida() {
      if (this.fase === 'salida') return;
      this.fase = 'salida';
      this.tSalida = 0;
      this.textoAlfa = 1;
    }

    // posición de cámara en la lámina (paneo suave)
    camara() {
      const c = this.plano.camara || {};
      const k = U.entradaSalida(U.clamp(this.t / this.duracionEstimada, 0, 1));
      let x = U.lerp(c.x0 || 0, c.x1 != null ? c.x1 : c.x0 || 0, k);
      let y = U.lerp(c.y0 || 0, c.y1 != null ? c.y1 : c.y0 || 0, k);
      const L = this.lamina;
      if (L && L.ancho) x = U.clamp(x, 0, Math.max(0, L.ancho - IH.ANCHO));
      if (L && L.alto) y = U.clamp(y, 0, Math.max(0, L.alto - IH.ALTO));
      return { x, y, k };
    }

    dibujar(ctx) {
      const M = IH.MARGEN;
      ctx.fillStyle = '#000';
      ctx.fillRect(-M, -M, IH.ANCHO + 2 * M, IH.ALTO + 2 * M);
      if (!this.plano || !this.lamina) return;
      const cam = this.camara();
      const cx = Math.floor(cam.x), cy = Math.floor(cam.y);
      IH.subpixel.x = cam.x - cx;
      IH.subpixel.y = cam.y - cy;
      this.lamina.dibujar(ctx, this.t, this, cx, cy, cam.x, cam.y);
      this.particulas.dibujar(ctx, cx, cy, false);
      this.particulas.dibujar(ctx, cx, cy, true);
    }

    dibujarUI(ctx) {
      const T = IH.T;
      const p = this.plano;
      if (!p) return;
      if (p.vineta !== false) T.vineta(ctx, p.vineta || 0.6);
      if (this.lamina && this.lamina.dibujarUI) this.lamina.dibujarUI(ctx, this.t, this);
      T.barrasCine(ctx, p.barras === false ? 0 : 1);
      // título
      if (p.titulo) {
        const ti = p.titulo;
        const a = this.fase === 'salida' ? 1 - U.suave(this.tSalida / 1.2) : U.suave((this.t - (ti.retraso || 0.8)) / 1.5);
        if (a > 0) {
          ctx.save();
          ctx.globalAlpha = a;
          const y = ti.y || IH.UIH * 0.42;
          if (ti.arabe) T.linea(ctx, ti.arabe, IH.UIW / 2, y - 120, { tam: ti.tamArabe || 110, alinear: 'center', familia: T.ARABE, color: T.COLORES.oro, sombra: true });
          if (ti.antes) T.linea(ctx, ti.antes, IH.UIW / 2, y - 10, { tam: 40, alinear: 'center', familia: T.TITULO, color: T.COLORES.tenue, espaciado: 10 });
          T.linea(ctx, ti.texto, IH.UIW / 2, y + 70, { tam: ti.tam || 96, alinear: 'center', familia: T.TITULO, peso: 600, color: T.COLORES.oroClaro, espaciado: 6 });
          const ancho = 340 * U.salida(U.clamp((this.t - 1) / 2, 0, 1));
          ctx.fillStyle = T.COLORES.oro;
          ctx.fillRect(IH.UIW / 2 - ancho, y + 104, ancho * 2, 2);
          T.estrella(ctx, IH.UIW / 2, y + 105, 12, T.COLORES.oroClaro);
          if (ti.sub) T.linea(ctx, ti.sub, IH.UIW / 2, y + 170, { tam: 44, alinear: 'center', cursiva: true, color: T.COLORES.texto });
          ctx.restore();
        }
      }
      // narración
      if (this.textos.length) {
        const l = this.textos[this.linea];
        const estilo = p.estilo || 'abajo';
        let a = 1;
        if (this.fase === 'salida') a = 1 - U.suave(this.tSalida / 0.9);
        ctx.save();
        ctx.globalAlpha = a;
        if (estilo === 'arriba') {
          const tam = 46;
          const alto = T.medirAlto(ctx, l, 1500, tam, { cursiva: true, interlineado: 1.42 });
          const g = ctx.createLinearGradient(0, 0, 0, 200 + alto);
          g.addColorStop(0, 'rgba(0,0,0,0.8)');
          g.addColorStop(0.65, 'rgba(0,0,0,0.55)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, IH.UIW, 200 + alto);
          T.parrafo(ctx, l, IH.UIW / 2, 150, { tam, ancho: 1500, alinear: 'center', cursiva: true, visibles: Math.floor(this.visibles), interlineado: 1.42 });
        } else if (estilo === 'centro') {
          T.parrafo(ctx, l, IH.UIW / 2, IH.UIH / 2 - T.medirAlto(ctx, l, 1300, 50, { cursiva: true }) / 2 - 30, { tam: 50, ancho: 1300, alinear: 'center', cursiva: true, visibles: Math.floor(this.visibles), interlineado: 1.45 });
        } else {
          const tam = 46;
          const alto = T.medirAlto(ctx, l, 1500, tam, { cursiva: true, interlineado: 1.42 });
          const y0 = IH.UIH - 150 - alto;
          const g = ctx.createLinearGradient(0, y0 - 90, 0, IH.UIH);
          g.addColorStop(0, 'rgba(0,0,0,0)');
          g.addColorStop(0.35, 'rgba(0,0,0,0.6)');
          g.addColorStop(1, 'rgba(0,0,0,0.8)');
          ctx.fillStyle = g;
          ctx.fillRect(0, y0 - 90, IH.UIW, IH.UIH - y0 + 90);
          T.parrafo(ctx, l, IH.UIW / 2, y0, { tam, ancho: 1500, alinear: 'center', cursiva: true, visibles: Math.floor(this.visibles), interlineado: 1.42 });
        }
        // indicador de "pulsa para continuar"
        const total = l.replace(/\*/g, '').length + 6;
        if (this.visibles >= total && this.fase === 'texto') {
          const k = (Math.sin(this.t * 4) + 1) / 2;
          T.estrella(ctx, IH.UIW - 150, IH.UIH - 160 + k * 6, 12, T.COLORES.oroClaro);
        }
        ctx.restore();
      }
      // rótulo de lugar y fecha
      if (p.rotulo) {
        const a = Math.min(U.suave((this.t - 1) / 1.5), this.fase === 'salida' ? 1 - this.tSalida : 1);
        if (a > 0) {
          ctx.save();
          ctx.globalAlpha = a;
          const ry = p.estilo === 'arriba' ? IH.UIH - 230 : 200;
          T.linea(ctx, p.rotulo, 110, ry, { tam: 44, familia: T.TITULO, color: T.COLORES.oroClaro, espaciado: 3 });
          if (p.rotuloSub) T.linea(ctx, p.rotuloSub, 112, ry + 52, { tam: 34, cursiva: true, color: T.COLORES.texto });
          ctx.restore();
        }
      }
      // fundido
      if (this.fundido > 0.001) {
        ctx.fillStyle = p.colorFundido || '#000';
        ctx.globalAlpha = this.fundido;
        ctx.fillRect(-10, -10, IH.UIW + 20, IH.UIH + 20);
        ctx.globalAlpha = 1;
      }
      // saltar
      if (this.mantener > 0.05) {
        const k = Math.min(1, this.mantener / 1.2);
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.mantener * 4);
        ctx.strokeStyle = T.COLORES.oroClaro;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(IH.UIW - 110, IH.UIH - 70, 26, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
        ctx.stroke();
        T.linea(ctx, 'Saltar escena', IH.UIW - 160, IH.UIH - 58, { tam: 30, alinear: 'right', color: T.COLORES.texto });
        ctx.restore();
      } else if (this.t < 4 && this.i === 0) {
        ctx.save();
        ctx.globalAlpha = 0.5 * Math.min(1, this.t) * Math.min(1, 4 - this.t);
        T.linea(ctx, 'Mantén ' + IH.entrada.etiqueta('saltarEscena') + ' para saltar', IH.UIW - 70, IH.UIH - 58, { tam: 28, alinear: 'right', color: T.COLORES.tenue });
        ctx.restore();
      }
    }
  }

  IH.escenas.cinematica = Cinematica;
})();
