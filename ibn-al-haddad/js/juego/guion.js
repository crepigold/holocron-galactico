/* Guiones con generadores: las escenas se escriben de forma lineal y legible,
 *
 *   function* (z) {
 *     yield z.dialogo([['ibrahim', '¡Yusuf!'], ['yusuf', 'Ya voy, padre.']]);
 *     yield 1.5;                       // espera segundos
 *     yield z.mover('ibrahim', 320);   // tareas que terminan solas
 *     const r = yield z.eleccion('¿Qué dices?', ['Sí', 'No']);
 *   }
 *
 * Una tarea es cualquier objeto con actualizar(dt) → true cuando termina (opcional: .resultado).
 */
'use strict';
(function () {
  const IH = window.IH;

  function normalizar(t) {
    if (t == null) return { actualizar: () => true };
    if (typeof t === 'number') return IH.esperar(t);
    if (typeof t === 'function') return IH.hasta(t);
    if (Array.isArray(t)) return IH.paralelo(...t);
    if (typeof t.next === 'function') return new Guion(t);
    return t;
  }

  class Guion {
    constructor(gen, nombre) {
      this.gen = gen;
      this.nombre = nombre || '';
      this.tarea = null;
      this.fin = false;
      this.resultado = undefined;
      this.iniciado = false;
    }
    avanzar(valor) {
      for (let guard = 0; guard < 1000; guard++) {
        let r;
        try {
          r = this.gen.next(valor);
        } catch (e) {
          console.error('Error en guion', this.nombre, e);
          this.fin = true;
          return;
        }
        if (r.done) {
          this.fin = true;
          this.resultado = r.value;
          return;
        }
        this.tarea = normalizar(r.value);
        return;
      }
    }
    actualizar(dt) {
      if (!this.iniciado) {
        this.iniciado = true;
        this.avanzar();
      }
      for (let i = 0; i < 20 && !this.fin; i++) {
        if (!this.tarea) {
          this.avanzar();
          continue;
        }
        if (!this.tarea.actualizar(dt)) return false;
        const v = this.tarea.resultado;
        this.tarea = null;
        dt = 0;
        this.avanzar(v);
        if (this.tarea && this.tarea._unFrame) return false;
      }
      return this.fin;
    }
    cancelar() {
      this.fin = true;
      try {
        this.gen.return();
      } catch (e) {
        /* nada */
      }
    }
  }
  IH.Guion = Guion;

  IH.esperar = function (seg) {
    return {
      r: seg,
      actualizar(dt) {
        this.r -= dt;
        return this.r <= 0;
      },
    };
  };
  IH.frame = function () {
    return { _unFrame: true, actualizar: () => true };
  };
  IH.hasta = function (cond) {
    return { actualizar: () => !!cond() };
  };
  IH.paralelo = function (...tareas) {
    const ts = tareas.map(normalizar);
    const hechas = ts.map(() => false);
    return {
      actualizar(dt) {
        let todas = true;
        ts.forEach((t, i) => {
          if (!hechas[i]) hechas[i] = t.actualizar(dt);
          if (!hechas[i]) todas = false;
        });
        return todas;
      },
    };
  };
  // Interpola un valor durante un tiempo
  IH.interpolar = function (dur, fn, curva = IH.U.entradaSalida) {
    let t = 0;
    return {
      actualizar(dt) {
        t += dt;
        const k = Math.min(1, t / dur);
        fn(curva(k), k);
        return k >= 1;
      },
    };
  };

  // ------------------------------------------------------------------ hablantes
  IH.HABLANTES = {
    yusuf: { nombre: 'Yusuf', retrato: 'yusuf' },
    ibrahim: { nombre: 'Ibrahim', retrato: 'ibrahim' },
    nur: { nombre: 'Nur', retrato: 'nur' },
    abuSalim: { nombre: 'Abu Salim, el aguador', retrato: 'abuSalim' },
    hakawati: { nombre: 'El hakawati', retrato: 'hakawati' },
    pregonero: { nombre: 'Pregonero del sultán', retrato: 'pregonero' },
    sunqur: { nombre: 'Sunqur', retrato: 'sunqur' },
    baibars: { nombre: 'Baibars', retrato: 'baibars' },
    hamid: { nombre: 'Hamid', retrato: 'recluta1' },
    amr: { nombre: 'Amr', retrato: 'nino' },
    templario: { nombre: 'Thibaut de Clermont', retrato: 'templario' },
    templarioCara: { nombre: 'Thibaut de Clermont', retrato: 'templarioSinYelmo' },
    franco: { nombre: 'Sargento franco', retrato: 'sargento' },
    mameluco: { nombre: 'Mameluco', retrato: 'mameluco' },
    recluta: { nombre: 'Recluta', retrato: 'recluta2' },
    vecino: { nombre: 'Vecino', retrato: 'vecino1' },
    vecina: { nombre: 'Vecina', retrato: 'vecina1' },
    mercader: { nombre: 'Mercader', retrato: 'mercader1' },
    especiero: { nombre: 'Especiero yemení', retrato: 'mercader2' },
    alfarero: { nombre: 'Alfarero', retrato: 'mercader3' },
    naffat: { nombre: 'Naffat', retrato: 'naffat' },
    miliciano: { nombre: 'Vecino de Mansura', retrato: 'miliciano' },
    cronista: { nombre: 'Yusuf, el cronista', retrato: 'cronista' },
    narrador: { nombre: null, retrato: null },
  };

  // ------------------------------------------------------------------ diálogo
  class Dialogo {
    constructor(lineas, opc = {}) {
      this.lineas = lineas.map((l) => (Array.isArray(l) ? { q: l[0], t: l[1], e: l[2] } : l));
      this.i = 0;
      this.visibles = 0;
      this.t = 0;
      this.tLinea = 0;
      this.fin = false;
      this.opc = opc;
      this.entrada = 0;
      this.sonidoAcum = 0;
      IH.entrada.consumir('aceptar');
      IH.entrada.consumir('atacar');
    }
    get linea() {
      return this.lineas[this.i];
    }
    actualizar(dt) {
      if (this.fin) return true;
      const E = IH.entrada;
      this.entrada = Math.min(1, this.entrada + dt * 6);
      this.t += dt;
      this.tLinea += dt;
      const l = this.linea;
      const total = l.t.replace(/\*/g, '').length + 4;
      const vel = (IH.ajustes ? IH.ajustes.velTexto : 1) * 42;
      if (this.visibles < total) {
        const antes = Math.floor(this.visibles);
        this.visibles = Math.min(total, this.visibles + dt * vel);
        if (Math.floor(this.visibles) !== antes && Math.floor(this.visibles) % 3 === 0 && IH.ajustes && IH.ajustes.sonidoTexto) IH.audio.sfx('texto', { vol: 0.5 });
      }
      const completa = this.visibles >= total;
      if (this.tLinea > 0.12 && (E.presionado('aceptar') || E.presionado('interactuar'))) {
        if (!completa) this.visibles = total;
        else this.siguiente();
      }
      // avance automático opcional (solo para líneas de narración en escenas)
      if (completa && this.opc.auto && this.tLinea > IH.U.tiempoLectura(l.t)) this.siguiente();
      return this.fin;
    }
    siguiente() {
      IH.audio.sfx('ui', { frec: 660, vol: 0.4 });
      this.i++;
      this.visibles = 0;
      this.tLinea = 0;
      if (this.i >= this.lineas.length) this.fin = true;
    }
    dibujar(ctx) {
      if (this.fin) return;
      const l = this.linea;
      const h = IH.HABLANTES[l.q] || { nombre: l.q, retrato: null };
      const nombre = l.nombre || h.nombre;
      const y0 = IH.UIH - 330 + (1 - this.entrada) * 40;
      ctx.save();
      ctx.globalAlpha = this.entrada;
      const x0 = 220, w = IH.UIW - 440, alto = 260;
      IH.T.caja(ctx, x0, y0, w, alto);
      let tx = x0 + 60;
      const retrato = l.retrato !== undefined ? l.retrato : h.retrato;
      if (retrato && IH.Retratos) {
        IH.Retratos.dibujar(ctx, retrato, x0 - 70, y0 - 60, 300, { emocion: l.e, hablando: this.visibles < l.t.length, t: this.t });
        tx = x0 + 260;
      }
      if (nombre) {
        IH.T.linea(ctx, nombre, tx, y0 + 62, { tam: 40, familia: IH.T.TITULO, peso: 600, color: IH.T.COLORES.oroClaro });
      }
      const cursiva = l.q === 'narrador' || l.cursiva;
      IH.T.parrafo(ctx, l.t, tx, y0 + (nombre ? 82 : 50), { tam: 42, ancho: x0 + w - tx - 70, visibles: Math.floor(this.visibles), cursiva });
      if (this.visibles >= l.t.replace(/\*/g, '').length + 4) {
        const k = (Math.sin(this.t * 5) + 1) / 2;
        IH.T.estrella(ctx, x0 + w - 50, y0 + alto - 40 + k * 6, 12, IH.T.COLORES.oroClaro);
      }
      ctx.restore();
    }
  }
  IH.Dialogo = Dialogo;

  // ------------------------------------------------------------------ elección
  class Eleccion {
    constructor(pregunta, opciones, opc = {}) {
      this.pregunta = pregunta;
      this.opciones = opciones;
      this.sel = 0;
      this.fin = false;
      this.resultado = null;
      this.t = 0;
      this.opc = opc;
      IH.entrada.consumir('aceptar');
    }
    actualizar(dt) {
      this.t += dt;
      const E = IH.entrada;
      if (E.presionado('arriba') || E.presionado('izq')) {
        this.sel = (this.sel + this.opciones.length - 1) % this.opciones.length;
        IH.audio.sfx('ui', { frec: 740 });
      }
      if (E.presionado('abajo') || E.presionado('der')) {
        this.sel = (this.sel + 1) % this.opciones.length;
        IH.audio.sfx('ui', { frec: 740 });
      }
      if (this.t > 0.25 && (E.presionado('aceptar') || E.presionado('interactuar'))) {
        this.resultado = this.sel;
        this.fin = true;
        IH.audio.sfx('uiAceptar');
      }
      return this.fin;
    }
    dibujar(ctx) {
      const n = this.opciones.length;
      const alto = 120 + n * 74;
      const x0 = 460, w = IH.UIW - 920, y0 = IH.UIH - alto - 90;
      const a = Math.min(1, this.t * 6);
      ctx.save();
      ctx.globalAlpha = a;
      IH.T.caja(ctx, x0, y0, w, alto);
      if (this.pregunta) IH.T.linea(ctx, this.pregunta, x0 + w / 2, y0 + 66, { tam: 40, alinear: 'center', peso: 600, color: IH.T.COLORES.oroClaro });
      this.opciones.forEach((o, i) => {
        const y = y0 + 110 + i * 74;
        if (i === this.sel) {
          ctx.fillStyle = 'rgba(212,167,58,0.18)';
          ctx.fillRect(x0 + 30, y - 6, w - 60, 62);
          IH.T.estrella(ctx, x0 + 64, y + 26, 12, IH.T.COLORES.oroClaro);
        }
        IH.T.linea(ctx, o, x0 + 96, y + 40, { tam: 40, color: i === this.sel ? IH.T.COLORES.texto : IH.T.COLORES.tenue });
      });
      ctx.restore();
    }
  }
  IH.Eleccion = Eleccion;
})();
