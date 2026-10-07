/* Menús: pantalla de título, nueva partida (dificultad), opciones, crónicas, controles,
 * créditos y menú de pausa. Se manejan con teclado, mando o ratón.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  // ------------------------------------------------------------------ lista de opciones genérica
  class Lista {
    constructor(items, opc = {}) {
      this.items = items;
      this.sel = items.findIndex((i) => !i.deshabilitado);
      if (this.sel < 0) this.sel = 0;
      this.opc = opc;
      this.t = 0;
    }
    mover(d) {
      const n = this.items.length;
      for (let k = 0; k < n; k++) {
        this.sel = (this.sel + d + n) % n;
        if (!this.items[this.sel].deshabilitado) break;
      }
      IH.audio.sfx('ui', { frec: 700 + this.sel * 30 });
    }
    actualizar(dt) {
      this.t += dt;
      const E = IH.entrada;
      if (E.presionado('arriba')) this.mover(-1);
      if (E.presionado('abajo')) this.mover(1);
      const it = this.items[this.sel];
      if (it.valor) {
        if (E.presionado('izq')) {
          it.cambiar(-1);
          IH.audio.sfx('ui', { frec: 600 });
        }
        if (E.presionado('der')) {
          it.cambiar(1);
          IH.audio.sfx('ui', { frec: 800 });
        }
      }
      // ratón
      if (E.raton.movido && this.cajas) {
        this.cajas.forEach((c, i) => {
          if (E.raton.x > c.x && E.raton.x < c.x + c.w && E.raton.y > c.y && E.raton.y < c.y + c.h && !this.items[i].deshabilitado && this.sel !== i) {
            this.sel = i;
            IH.audio.sfx('ui', { frec: 700 + i * 30 });
          }
        });
        E.raton.movido = false;
      }
      if ((E.presionado('aceptar') || E.presionado('interactuar')) && this.t > 0.2) {
        if (it.accion) {
          IH.audio.sfx('uiAceptar');
          it.accion();
        } else if (it.valor) {
          it.cambiar(1);
          IH.audio.sfx('ui', { frec: 800 });
        }
      }
    }
    dibujar(ctx, x, y, opc = {}) {
      const T = IH.T;
      const alto = opc.alto || 78;
      const tam = opc.tam || 46;
      const ancho = opc.ancho || 700;
      this.cajas = [];
      this.items.forEach((it, i) => {
        const yy = y + i * alto;
        const sel = i === this.sel;
        const alin = opc.alinear || 'center';
        const bx = alin === 'center' ? x - ancho / 2 : x - 40;
        this.cajas.push({ x: bx, y: yy - alto * 0.62, w: ancho, h: alto });
        if (sel) {
          const g = ctx.createLinearGradient(bx, 0, bx + ancho, 0);
          g.addColorStop(0, 'rgba(212,167,58,0)');
          g.addColorStop(0.5, 'rgba(212,167,58,0.22)');
          g.addColorStop(1, 'rgba(212,167,58,0)');
          ctx.fillStyle = g;
          ctx.fillRect(bx, yy - alto * 0.62, ancho, alto * 0.86);
        }
        const color = it.deshabilitado ? 'rgba(185,168,136,0.35)' : sel ? T.COLORES.oroClaro : T.COLORES.texto;
        let texto = it.texto;
        if (it.valor) texto = it.texto + ':  ' + it.valor();
        const w = T.linea(ctx, texto, alin === 'center' ? x : x, yy, { tam, alinear: alin, familia: opc.familia || T.TITULO, color, peso: sel ? 600 : 400 });
        if (sel) {
          const k = Math.sin(this.t * 5) * 4;
          const ex = alin === 'center' ? x - w / 2 - 40 - k : x - 34 - k;
          T.estrella(ctx, ex, yy - tam * 0.32, 12, T.COLORES.oroClaro);
          if (alin === 'center') T.estrella(ctx, x + w / 2 + 40 + k, yy - tam * 0.32, 12, T.COLORES.oroClaro);
        }
      });
      const it = this.items[this.sel];
      if (it && it.ayuda) T.parrafo(ctx, it.ayuda, IH.UIW / 2, opc.yAyuda || IH.UIH - 150, { tam: 32, ancho: 1300, alinear: 'center', cursiva: true, color: T.COLORES.tenue });
    }
  }
  IH.Lista = Lista;

  // ------------------------------------------------------------------ opciones
  function itemsOpciones() {
    const A = IH.ajustes;
    const pct = (v) => Math.round(v * 100) + ' %';
    const vol = (clave, texto) => ({
      texto,
      valor: () => pct(A[clave]),
      cambiar(d) {
        A[clave] = U.clamp(Math.round((A[clave] + d * 0.1) * 10) / 10, 0, 1);
        IH.guardarAjustes();
      },
    });
    const bool = (clave, texto, si = 'Sí', no = 'No', ayuda) => ({
      texto,
      ayuda,
      valor: () => (A[clave] ? si : no),
      cambiar() {
        A[clave] = !A[clave];
        IH.guardarAjustes();
      },
    });
    return [
      vol('volGeneral', 'Volumen general'),
      vol('volMusica', 'Música'),
      vol('volEfectos', 'Efectos'),
      vol('volAmbiente', 'Ambiente'),
      {
        texto: 'Velocidad del texto',
        valor: () => ({ 0.6: 'Lenta', 1: 'Normal', 1.6: 'Rápida' }[A.velTexto] || 'Normal'),
        cambiar(d) {
          const v = [0.6, 1, 1.6];
          let i = v.indexOf(A.velTexto);
          if (i < 0) i = 1;
          A.velTexto = v[U.clamp(i + d, 0, 2)];
          IH.guardarAjustes();
        },
        ayuda: 'Afecta a los diálogos y a la narración de las cinemáticas.',
      },
      bool('narracionAuto', 'Narración de cinemáticas', 'Automática', 'Manual', 'En «Manual», cada frase espera a que pulses para continuar.'),
      bool('sacudida', 'Sacudida de cámara'),
      bool('sangre', 'Sangre'),
      bool('vibracion', 'Vibración del mando'),
      bool('pixelPerfecto', 'Escalado', 'Píxel perfecto', 'Pantalla completa', 'Píxel perfecto usa solo múltiplos enteros (bordes negros, píxeles idénticos).'),
      { texto: 'Pantalla completa (F11)', accion: () => IH.alternarPantallaCompleta() },
    ];
  }

  class SubMenu {
    constructor(titulo, items, volver) {
      this.titulo = titulo;
      this.lista = new Lista(items.concat([{ texto: 'Volver', accion: volver }]));
      this.volver = volver;
    }
    actualizar(dt) {
      if (IH.entrada.presionado('cancelar')) {
        IH.audio.sfx('uiAtras');
        this.volver();
        return;
      }
      this.lista.actualizar(dt);
    }
    dibujar(ctx) {
      const T = IH.T;
      ctx.fillStyle = 'rgba(8,5,4,0.82)';
      ctx.fillRect(0, 0, IH.UIW, IH.UIH);
      T.linea(ctx, this.titulo, IH.UIW / 2, 170, { tam: 72, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro, espaciado: 4 });
      T.estrella(ctx, IH.UIW / 2, 210, 12, T.COLORES.oro);
      this.lista.dibujar(ctx, IH.UIW / 2, 300, { tam: 40, alto: 64, ancho: 1000, familia: T.FUENTE });
    }
  }

  // ------------------------------------------------------------------ controles
  class Controles {
    constructor(volver) {
      this.volver = volver;
    }
    actualizar() {
      if (IH.entrada.presionado('cancelar') || IH.entrada.presionado('aceptar')) {
        IH.audio.sfx('uiAtras');
        this.volver();
      }
    }
    dibujar(ctx) {
      const T = IH.T;
      ctx.fillStyle = 'rgba(8,5,4,0.88)';
      ctx.fillRect(0, 0, IH.UIW, IH.UIH);
      T.linea(ctx, 'Controles', IH.UIW / 2, 150, { tam: 72, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro });
      const filas = [
        ['Moverse', 'A / D  ·  ← →', 'Stick izquierdo / cruceta'],
        ['Saltar', 'Espacio', 'Ⓐ'],
        ['Interactuar / hablar', 'E  ·  W  ·  ↑', 'Arriba'],
        ['Ataque (combo de 3)', 'J  ·  clic izquierdo', 'Ⓧ'],
        ['Golpe fuerte (rompe guardias)', 'K  ·  clic derecho', 'Ⓨ'],
        ['Bloquear  ·  PARADA si es justo a tiempo', 'L (mantener)', 'LB / RB'],
        ['Voltereta (invulnerable)', 'Mayús izquierda', 'Ⓑ'],
        ['Beber del odre (curarse)', 'Q', 'Select'],
        ['Correr (en la ciudad)', 'Mayús izquierda (mantener)', 'Ⓑ (mantener)'],
        ['Pausa', 'Esc', 'Start'],
        ['Pantalla completa', 'F11  ·  Alt+Intro', ''],
      ];
      T.linea(ctx, 'Teclado y ratón', 1060, 250, { tam: 34, familia: T.TITULO, color: T.COLORES.oro });
      T.linea(ctx, 'Mando', 1500, 250, { tam: 34, familia: T.TITULO, color: T.COLORES.oro });
      filas.forEach((f, i) => {
        const y = 320 + i * 60;
        T.linea(ctx, f[0], 220, y, { tam: 34 });
        T.linea(ctx, f[1], 1060, y, { tam: 34, color: T.COLORES.oroClaro });
        T.linea(ctx, f[2], 1500, y, { tam: 34, color: T.COLORES.oroClaro });
      });
      T.parrafo(ctx, 'Consejo: la *parada* se consigue pulsando bloquear justo antes de que llegue el golpe. El enemigo queda aturdido y tu siguiente ataque es un *contraataque* devastador. Los ataques con *brillo rojo* no se pueden bloquear: esquívalos.', IH.UIW / 2, 1000 - 70, { tam: 30, ancho: 1500, alinear: 'center', cursiva: true, color: T.COLORES.tenue });
    }
  }

  // ------------------------------------------------------------------ crónicas
  class MenuCronicas {
    constructor(volver) {
      this.volver = volver;
      const desbloq = IH.cronicasDesbloqueadas();
      this.ids = Object.keys(IH.CRONICAS);
      this.desbloq = desbloq;
      this.sel = 0;
      this.leyendo = null;
      this.t = 0;
    }
    actualizar(dt) {
      this.t += dt;
      const E = IH.entrada;
      if (this.leyendo) {
        if (E.presionado('cancelar') || E.presionado('aceptar')) {
          this.leyendo = null;
          IH.audio.sfx('uiAtras');
        }
        return;
      }
      if (E.presionado('cancelar')) {
        IH.audio.sfx('uiAtras');
        this.volver();
        return;
      }
      if (E.presionado('arriba')) {
        this.sel = (this.sel + this.ids.length - 1) % this.ids.length;
        IH.audio.sfx('ui');
      }
      if (E.presionado('abajo')) {
        this.sel = (this.sel + 1) % this.ids.length;
        IH.audio.sfx('ui');
      }
      if (E.presionado('aceptar') && this.t > 0.2 && this.desbloq.has(this.ids[this.sel])) {
        this.leyendo = this.ids[this.sel];
        IH.audio.sfx('pergamino');
      }
    }
    dibujar(ctx) {
      const T = IH.T;
      ctx.fillStyle = 'rgba(8,5,4,0.9)';
      ctx.fillRect(0, 0, IH.UIW, IH.UIH);
      T.linea(ctx, 'Crónicas', IH.UIW / 2, 130, { tam: 72, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro });
      T.linea(ctx, `${this.desbloq.size} de ${this.ids.length} descubiertas`, IH.UIW / 2, 185, { tam: 30, alinear: 'center', cursiva: true, color: T.COLORES.tenue });
      if (this.leyendo) {
        const c = IH.CRONICAS[this.leyendo];
        T.caja(ctx, 260, 230, IH.UIW - 520, 760);
        T.linea(ctx, c.titulo, IH.UIW / 2, 320, { tam: 56, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro });
        if (c.fecha) T.linea(ctx, c.fecha, IH.UIW / 2, 372, { tam: 32, alinear: 'center', cursiva: true, color: T.COLORES.tenue });
        T.parrafo(ctx, c.texto, 340, 410, { tam: 36, ancho: IH.UIW - 680, interlineado: 1.45 });
        T.aviso(ctx, 'cancelar', 'Volver', IH.UIW / 2, 950, { tam: 30 });
        return;
      }
      const visibles = 12;
      const ini = U.clamp(this.sel - 5, 0, Math.max(0, this.ids.length - visibles));
      for (let k = 0; k < visibles && ini + k < this.ids.length; k++) {
        const i = ini + k;
        const id = this.ids[i];
        const ok = this.desbloq.has(id);
        const y = 270 + k * 58;
        if (i === this.sel) {
          ctx.fillStyle = 'rgba(212,167,58,0.18)';
          ctx.fillRect(360, y - 40, IH.UIW - 720, 54);
          T.estrella(ctx, 390, y - 13, 10, T.COLORES.oroClaro);
        }
        T.linea(ctx, ok ? IH.CRONICAS[id].titulo : '· · ·  (sin descubrir)', 420, y, { tam: 36, color: ok ? (i === this.sel ? T.COLORES.oroClaro : T.COLORES.texto) : 'rgba(185,168,136,0.4)' });
        if (ok && IH.CRONICAS[id].fecha) T.linea(ctx, IH.CRONICAS[id].fecha, IH.UIW - 400, y, { tam: 30, alinear: 'right', cursiva: true, color: T.COLORES.tenue });
      }
      const id = this.ids[this.sel];
      if (id && !this.desbloq.has(id) && IH.CRONICAS[id].pista) T.linea(ctx, 'Pista: ' + IH.CRONICAS[id].pista, IH.UIW / 2, 1010, { tam: 30, alinear: 'center', cursiva: true, color: T.COLORES.tenue });
    }
  }

  // ------------------------------------------------------------------ créditos
  const CREDITOS = [
    ['IBN AL-HADDAD', 'titulo'],
    ['El hijo del herrero', 'sub'],
    ['', ''],
    ['Capítulo I · Prólogo', 'cab'],
    ['Idea y dirección', 'cab'],
    ['crepigold', ''],
    ['', ''],
    ['Diseño, programación, arte procedural y música', 'cab'],
    ['Claude (Anthropic), con Claude Code', ''],
    ['', ''],
    ['Tipografías (SIL Open Font License)', 'cab'],
    ['Alegreya — Juan Pablo del Peral, Huerta Tipográfica', ''],
    ['Reem Kufi — Khaled Hosny, Santiago Orozco', ''],
    ['Aref Ruqaa — Abdullah Aref, Khaled Hosny', ''],
    ['Amiri — Khaled Hosny', ''],
    ['', ''],
    ['Música', 'cab'],
    ['Sintetizada en tiempo real: oud, qanun, ney, rebab, darbuka,', ''],
    ['riq, tabl, naqqara y nafir, en los maqamat Hijaz, Bayati, Rast, Saba y Kurd.', ''],
    ['', ''],
    ['Fuentes históricas de referencia', 'cab'],
    ['Joinville, «Vida de San Luis» (c. 1309)', ''],
    ['Al-Maqrizi, «Kitab al-Suluk»', ''],
    ['Ibn Wasil, «Mufarrij al-Kurub»', ''],
    ['', ''],
    ['Gracias por jugar.', 'sub'],
  ];
  class Creditos {
    constructor(volver) {
      this.volver = volver;
      this.t = 0;
    }
    actualizar(dt) {
      this.t += dt;
      if (IH.entrada.presionado('cancelar') || (IH.entrada.presionado('aceptar') && this.t > 1)) this.volver();
    }
    dibujar(ctx) {
      const T = IH.T;
      ctx.fillStyle = 'rgba(6,4,3,0.94)';
      ctx.fillRect(0, 0, IH.UIW, IH.UIH);
      let y = IH.UIH + 40 - this.t * 55;
      for (const [txt, tipo] of CREDITOS) {
        if (tipo === 'titulo') T.linea(ctx, txt, IH.UIW / 2, y, { tam: 90, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro, espaciado: 6 });
        else if (tipo === 'sub') T.linea(ctx, txt, IH.UIW / 2, y, { tam: 46, alinear: 'center', cursiva: true });
        else if (tipo === 'cab') T.linea(ctx, txt, IH.UIW / 2, y, { tam: 36, alinear: 'center', familia: T.TITULO, color: T.COLORES.oro });
        else if (txt) T.linea(ctx, txt, IH.UIW / 2, y, { tam: 34, alinear: 'center' });
        y += tipo === 'titulo' ? 110 : 62;
      }
      if (y < -40) this.t = 0;
    }
  }

  // ------------------------------------------------------------------ pantalla de título
  class Titulo {
    constructor(params = {}) {
      this.t = 0;
      this.params = params;
      this.sub = null;
      this.particulas = new IH.Particulas();
      this.pulsado = !!params.directo;
    }
    entrar() {
      IH.audio.musica('titulo', { fundido: 2 });
      IH.audio.ambiente('viento');
      this.lamina = IH.LAMINAS.cairoTitulo || IH.LAMINAS.cairoPanorama;
      if (this.lamina && !this.lamina._construida && this.lamina.construir) {
        this.lamina.construir();
        this.lamina._construida = true;
      }
      this.crearMenu();
      if (this.params.creditos) {
        this.pulsado = true;
        this.tMenu = 1;
        this.sub = new Creditos(() => (this.sub = null));
      }
    }
    crearMenu() {
      const hay = IH.hayPartida();
      const items = [];
      if (hay) items.push({ texto: 'Continuar', accion: () => IH.continuar(), ayuda: 'Retoma desde el último punto de control.' });
      items.push({ texto: 'Nueva partida', accion: () => this.elegirDificultad() });
      items.push({ texto: 'Crónicas', accion: () => (this.sub = new MenuCronicas(() => (this.sub = null))), ayuda: 'La historia real detrás del juego: lugares, personajes y batallas.' });
      items.push({ texto: 'Opciones', accion: () => (this.sub = new SubMenu('Opciones', itemsOpciones(), () => (this.sub = null))) });
      items.push({ texto: 'Controles', accion: () => (this.sub = new Controles(() => (this.sub = null))) });
      items.push({ texto: 'Créditos', accion: () => (this.sub = new Creditos(() => (this.sub = null))) });
      if (window.electronAPI) items.push({ texto: 'Salir', accion: () => window.electronAPI.salir() });
      this.lista = new Lista(items);
    }
    elegirDificultad() {
      const empezar = (dif) => {
        if (IH.hayPartida() && !this.confirmado) {
          this.confirmado = true;
        }
        IH.borrarPartida();
        IH.nuevaPartida(dif);
        IH.audio.musica(null, { fundido: 2 });
        IH.cambiarEscena('cinematica', { id: 'intro' }, { fundido: 2 });
      };
      this.sub = new SubMenu(
        'Elige tu camino',
        [
          { texto: 'Relato', accion: () => empezar('historia'), ayuda: 'Para disfrutar de la historia: los enemigos hacen la mitad de daño.' },
          { texto: 'Guerrero', accion: () => empezar('normal'), ayuda: 'La experiencia prevista. Exigente pero justa.' },
          { texto: 'Mameluco', accion: () => empezar('dificil'), ayuda: 'Para veteranos: los francos golpean mucho más fuerte.' },
        ],
        () => (this.sub = null)
      );
      this.sub.lista.sel = 1;
    }
    actualizar(dt) {
      this.t += dt;
      if (this.lamina && this.lamina.actualizar) this.lamina.actualizar(this, dt);
      this.particulas.actualizar(dt);
      if (!this.pulsado) {
        if (this.t > 1.5 && (IH.entrada.cualquierTecla || IH.entrada.presionado('aceptar'))) {
          this.pulsado = true;
          this.tMenu = 0;
          IH.audio.sfx('uiAceptar');
          IH.entrada.consumirTodo();
        }
        return;
      }
      this.tMenu = (this.tMenu || 0) + dt;
      if (this.sub) {
        this.sub.actualizar(dt);
        return;
      }
      this.lista.actualizar(dt);
    }
    dibujar(ctx) {
      if (!this.lamina) return;
      const ancho = this.lamina.ancho || IH.ANCHO;
      const x = (ancho - IH.ANCHO) * (0.5 + 0.5 * Math.sin(this.t * 0.02 - Math.PI / 2));
      const cx = Math.floor(x);
      IH.subpixel.x = x - cx;
      this.lamina.dibujar(ctx, this.t, this, cx, 0, x, 0);
      this.particulas.dibujar(ctx, cx, 0, true);
    }
    dibujarUI(ctx) {
      const T = IH.T;
      T.vineta(ctx, 0.7);
      const a = U.suave((this.t - 0.5) / 2.5);
      ctx.save();
      ctx.globalAlpha = a;
      const yLogo = this.pulsado ? 300 - Math.min(1, this.tMenu * 2) * 60 : 330;
      // sombra detrás del logo
      const g = ctx.createRadialGradient(IH.UIW / 2, yLogo, 50, IH.UIW / 2, yLogo, 700);
      g.addColorStop(0, 'rgba(0,0,0,0.55)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, IH.UIW, IH.UIH);
      T.linea(ctx, 'ابن الحداد', IH.UIW / 2, yLogo - 70, { tam: 150, alinear: 'center', familia: T.ARABE, color: T.COLORES.oro });
      T.linea(ctx, 'IBN AL-HADDAD', IH.UIW / 2, yLogo + 70, { tam: 120, alinear: 'center', familia: T.TITULO, peso: 600, color: T.COLORES.oroClaro, espaciado: 14, contorno: 'rgba(20,10,6,0.8)', grosorContorno: 10 });
      ctx.fillStyle = T.COLORES.oro;
      ctx.fillRect(IH.UIW / 2 - 360, yLogo + 104, 720, 3);
      T.estrella(ctx, IH.UIW / 2, yLogo + 105, 16, T.COLORES.oroClaro);
      T.linea(ctx, 'El hijo del herrero', IH.UIW / 2, yLogo + 168, { tam: 54, alinear: 'center', cursiva: true, color: T.COLORES.texto });
      ctx.restore();
      if (!this.pulsado) {
        if (this.t > 2.5) {
          ctx.save();
          ctx.globalAlpha = 0.7 + 0.3 * Math.sin(this.t * 3);
          T.linea(ctx, IH.entrada.ultimoDispositivo === 'mando' ? 'Pulsa Ⓐ' : 'Pulsa cualquier tecla', IH.UIW / 2, IH.UIH * 0.86, { tam: 42, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro, espaciado: 4, contorno: 'rgba(10,6,4,0.85)', grosorContorno: 8 });
          ctx.restore();
        }
      } else if (!this.sub) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.tMenu * 3);
        this.lista.dibujar(ctx, IH.UIW / 2, 620, { tam: 46, alto: 70, ancho: 640 });
        ctx.restore();
      }
      T.linea(ctx, 'Capítulo I · Prólogo  —  v' + IH.VERSION, 40, IH.UIH - 30, { tam: 26, color: 'rgba(241,230,207,0.45)', sombra: false });
      if (this.sub) this.sub.dibujar(ctx);
    }
  }
  IH.escenas.titulo = Titulo;

  // ------------------------------------------------------------------ menú de pausa
  class MenuPausa {
    constructor(zona) {
      this.zona = zona;
      this.sub = null;
      this.t = 0;
      IH.audio.volumenAmbiente(0.3);
      this.lista = new Lista([
        { texto: 'Continuar', accion: () => this.cerrar() },
        { texto: 'Crónicas', accion: () => (this.sub = new MenuCronicas(() => (this.sub = null))) },
        { texto: 'Opciones', accion: () => (this.sub = new SubMenu('Opciones', itemsOpciones(), () => (this.sub = null))) },
        { texto: 'Controles', accion: () => (this.sub = new Controles(() => (this.sub = null))) },
        {
          texto: 'Volver al título',
          accion: () => {
            IH.partida.vida = zona.jugador.vida;
            IH.guardar();
            this.cerrar();
            IH.cambiarEscena('titulo', { directo: true }, { fundido: 1 });
          },
          ayuda: 'La partida se guarda en el último punto de control.',
        },
      ]);
    }
    cerrar() {
      this.zona.pausa = null;
      IH.audio.volumenAmbiente(1);
      IH.entrada.consumirTodo();
    }
    actualizar(dt) {
      this.t += dt;
      if (this.sub) {
        this.sub.actualizar(dt);
        return;
      }
      if (IH.entrada.presionado('pausa') || IH.entrada.presionado('cancelar')) {
        this.cerrar();
        return;
      }
      this.lista.actualizar(dt);
    }
    dibujar(ctx) {
      const T = IH.T;
      ctx.fillStyle = 'rgba(8,5,4,0.72)';
      ctx.fillRect(0, 0, IH.UIW, IH.UIH);
      if (this.sub) {
        this.sub.dibujar(ctx);
        return;
      }
      T.linea(ctx, 'Pausa', IH.UIW / 2, 260, { tam: 80, alinear: 'center', familia: T.TITULO, color: T.COLORES.oroClaro, espaciado: 6 });
      T.estrella(ctx, IH.UIW / 2, 300, 12, T.COLORES.oro);
      if (IH.partida.objetivo) T.linea(ctx, 'Objetivo: ' + IH.partida.objetivo, IH.UIW / 2, 360, { tam: 34, alinear: 'center', cursiva: true, color: T.COLORES.tenue });
      this.lista.dibujar(ctx, IH.UIW / 2, 480, { tam: 46, alto: 76, ancho: 640 });
      const P = IH.partida;
      T.linea(ctx, `Crónicas: ${P.cronicas.length}   ·   Enemigos derrotados: ${P.estadisticas.derrotados || 0}   ·   Paradas: ${P.estadisticas.paradas || 0}`, IH.UIW / 2, IH.UIH - 80, { tam: 28, alinear: 'center', color: T.COLORES.tenue });
    }
  }
  IH.MenuPausa = MenuPausa;
  IH.Menus = { Lista, SubMenu, Controles, MenuCronicas, Creditos, itemsOpciones };
})();
