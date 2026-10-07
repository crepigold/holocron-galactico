/* Entidades: física, jugador, enemigos, personajes no jugadores y proyectiles.
 *
 * Combate (pensado para sentirse justo y legible):
 *  - Combo ligero de 3 golpes, golpe fuerte que rompe guardias, ataque aéreo.
 *  - Bloqueo (gasta aguante) y PARADA perfecta si se bloquea justo antes del impacto:
 *    el enemigo queda aturdido y el siguiente golpe es un contraataque crítico.
 *  - Voltereta con invulnerabilidad. Los ataques "imparables" (brillo rojo) solo se esquivan.
 *  - Los enemigos se turnan para atacar (como mucho dos a la vez).
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const GRAV = 1000;

  function cajaMundo(ent, c) {
    const x0 = ent.dir >= 0 ? ent.x + c.x : ent.x - c.x - c.w;
    return { x: x0, y: ent.y + c.y, w: c.w, h: c.h };
  }
  function solapan(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  IH.cajaMundo = cajaMundo;
  IH.solapan = solapan;

  // ================================================================== base
  class Entidad {
    constructor(zona, opc = {}) {
      this.zona = zona;
      this.x = opc.x || 0;
      this.y = opc.y != null ? opc.y : zona ? zona.suelo : 300;
      this.vx = 0;
      this.vy = 0;
      this.w = opc.w || 12;
      this.h = opc.h || 46;
      this.dir = opc.dir || 1;
      this.enSuelo = true;
      this.vivo = true;
      this.borrar = false;
      this.gravedad = 1;
      this.capa = opc.capa || 0;
      this.flash = 0;
      this.id = opc.id || null;
      this.visible = opc.visible !== false;
      this.alfa = 1;
      this.solida = false;
      this.sombra = opc.sombra !== false;
    }
    get caja() {
      return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h };
    }
    mover(dt) {
      const z = this.zona;
      // horizontal
      this.x += this.vx * dt;
      this.choqueX = false;
      for (const s of z.solidos) {
        if (s.inactivo || s.soloProyectil) continue;
        const c = this.caja;
        if (solapan(c, s)) {
          if (this.y - 0.5 <= s.y) continue; // está encima
          if (this.x < s.x + s.w / 2) this.x = s.x - this.w / 2;
          else this.x = s.x + s.w + this.w / 2;
          this.choqueX = true;
        }
      }
      const minX = z.limites ? z.limites[0] : 0, maxX = z.limites ? z.limites[1] : z.ancho;
      if (this.x < minX + this.w / 2) {
        this.x = minX + this.w / 2;
        this.choqueX = true;
      }
      if (this.x > maxX - this.w / 2) {
        this.x = maxX - this.w / 2;
        this.choqueX = true;
      }
      // vertical
      const yPrev = this.y;
      this.vy = Math.min(this.vy + GRAV * this.gravedad * dt, 620);
      this.y += this.vy * dt;
      const estabaEnSuelo = this.enSuelo;
      this.enSuelo = false;
      this.plataforma = null;
      if (this.vy >= 0) {
        if (z.suelo != null && this.y >= z.suelo) {
          this.y = z.suelo;
          this.vy = 0;
          this.enSuelo = true;
          this.superficie = z.superficie || 'tierra';
        }
        if (!this.atravesando) {
          for (const p of z.plataformas) {
            if (this.x + this.w / 2 - 2 < p.x || this.x - this.w / 2 + 2 > p.x + p.w) continue;
            if (yPrev <= p.y + 0.5 && this.y >= p.y) {
              this.y = p.y;
              this.vy = 0;
              this.enSuelo = true;
              this.plataforma = p;
              this.superficie = p.superficie || 'madera';
            }
          }
        }
      }
      for (const s of z.solidos) {
        if (s.inactivo || s.soloProyectil) continue;
        const c = this.caja;
        if (!solapan(c, s)) continue;
        if (this.vy >= 0 && yPrev <= s.y + 1) {
          this.y = s.y;
          this.vy = 0;
          this.enSuelo = true;
          this.superficie = s.superficie || 'piedra';
        } else if (this.vy < 0) {
          this.y = s.y + s.h + this.h;
          this.vy = 0;
        }
      }
      this.aterrizo = !estabaEnSuelo && this.enSuelo;
    }
    actualizar() {}
    dibujar() {}
    dibujarSombra(ctx, cx, cy) {
      if (!this.sombra || !this.visible) return;
      const z = this.zona;
      let suelo = z.suelo;
      for (const p of z.plataformas) if (this.x > p.x && this.x < p.x + p.w && p.y >= this.y - 2 && p.y < suelo) suelo = p.y;
      for (const s of z.solidos) if (this.x > s.x && this.x < s.x + s.w && s.y >= this.y - 2 && s.y < suelo) suelo = s.y;
      const alt = suelo - this.y;
      const ancho = Math.max(4, Math.round(this.w * 1.3 - alt * 0.08));
      ctx.globalAlpha = U.clamp(0.32 - alt * 0.003, 0.08, 0.32) * this.alfa;
      ctx.fillStyle = '#000';
      ctx.fillRect(Math.round(this.x - ancho / 2 - cx), Math.round(suelo - cy), ancho, 2);
      ctx.fillRect(Math.round(this.x - ancho / 2 + 2 - cx), Math.round(suelo - cy - 1), ancho - 4, 1);
      ctx.globalAlpha = 1;
    }
  }
  IH.Entidad = Entidad;

  // ================================================================== personaje con sprite
  class Personaje extends Entidad {
    constructor(zona, opc) {
      super(zona, opc);
      this.traje = opc.traje;
      this.spr = IH.sprite(opc.traje);
      this.anim = new IH.Esq.Animador(this.spr, opc.anim || 'quieto');
      this.escala = IH.TRAJES[opc.traje].escala || 1;
      this.h = Math.round(46 * this.escala);
    }
    cambiarTraje(t) {
      this.traje = t;
      this.spr = IH.sprite(t);
      const a = this.anim.anim;
      this.anim = new IH.Esq.Animador(this.spr, this.spr.anims[a] ? a : 'quieto');
    }
    poner(anim, reiniciar) {
      this.anim.poner(anim, reiniciar);
    }
    dibujar(ctx, cx, cy) {
      if (!this.visible) return;
      const blanco = this.flash > 0 && Math.floor(this.flash * 30) % 2 === 0;
      this.anim.dibujar(ctx, this.x - cx, this.y - cy, this.dir, { blanco, alfa: this.alfa < 1 ? this.alfa : null });
    }
    // Pasos al andar/correr
    sonidosPasos(nombreAnim) {
      const a = this.anim;
      if ((a.anim === 'andar' || a.anim === 'correr' || a.anim === 'avanzar' || a.anim === 'cargar') && a.i !== this._ultimoPaso) {
        const n = this.spr.anims[a.anim].marcos.length;
        if (a.i === 0 || a.i === Math.floor(n / 2)) {
          IH.audio.sfx('paso', { x: this.x, superficie: this.superficie, vol: this === this.zona.jugador ? 0.55 : 0.3, metal: !!IH.TRAJES[this.traje].malla });
          if (a.anim === 'correr' && this.zona.particulas) this.zona.particulas.emitir('polvo', this.x - this.dir * 4, this.y, 1, { color: this.zona.colorPolvo, vx: -this.dir * 20 });
        }
        this._ultimoPaso = a.i;
      }
    }
  }
  IH.Personaje = Personaje;

  // ================================================================== jugador
  const ATAQUES = {
    ataque1: { dano: 10, caja: { x: 0, y: -46, w: 36, h: 40 }, empuje: 70, avance: 55, aguante: 9, estela: { a0: -115, a1: 35, r: 25, y: -30 }, sfx: 'tajo' },
    ataque2: { dano: 11, caja: { x: 0, y: -54, w: 36, h: 48 }, empuje: 70, avance: 65, aguante: 9, estela: { a0: 45, a1: -120, r: 25, y: -30 }, sfx: 'tajo', tono: 1.15 },
    ataque3: { dano: 17, caja: { x: 2, y: -38, w: 44, h: 16 }, empuje: 170, avance: 170, aguante: 13, estela: { tipo: 'estocada', r: 38, y: -31 }, sfx: 'tajoFuerte' },
    fuerte: { dano: 28, caja: { x: -4, y: -64, w: 46, h: 62 }, empuje: 210, avance: 70, aguante: 24, rompeGuardia: true, estela: { a0: -125, a1: 65, r: 31, y: -30, grosor: 8 }, sfx: 'tajoFuerte', sacudida: 0.25 },
    aereo: { dano: 13, caja: { x: -2, y: -50, w: 36, h: 50 }, empuje: 60, aguante: 9, estela: { a0: -110, a1: 70, r: 25, y: -30 }, sfx: 'tajo' },
  };
  IH.ATAQUES_JUGADOR = ATAQUES;

  class Jugador extends Personaje {
    constructor(zona, opc) {
      super(zona, Object.assign({ traje: 'yusuf' }, opc));
      const P = IH.partida || {};
      this.vidaMax = P.vidaMax || 100;
      this.vida = opc.vida != null ? opc.vida : this.vidaMax;
      this.aguanteMax = 100;
      this.aguante = 100;
      this.descansoAguante = 0;
      this.estado = 'normal';
      this.t = 0;
      this.coyote = 0;
      this.tAire = 0;
      this.invul = 0;
      this.tBloqueo = 0;
      this.golpeActivo = null;
      this.golpeados = new Set();
      this.combo = 0;
      this.encadenar = false;
      this.controlable = true;
      this.armado = !!(IH.TRAJES[this.traje].arma && ['espada', 'madera'].includes(IH.TRAJES[this.traje].arma.tipo));
      this.capa = 10;
      this.objetivoX = null;
      this.critico = 0;
      this.w = 12;
    }
    get tranquilo() {
      return !!this.zona.tranquila;
    }
    gastar(n) {
      this.aguante = Math.max(0, this.aguante - n);
      this.descansoAguante = 0.55;
    }
    puede(n) {
      return this.aguante >= Math.min(n, 8);
    }
    cambiarEstado(e) {
      this.estado = e;
      this.t = 0;
    }
    actualizar(dt) {
      const E = IH.entrada;
      this.t += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.invul = Math.max(0, this.invul - dt);
      if (this.descansoAguante > 0) this.descansoAguante -= dt;
      else if (this.estado !== 'bloqueo') this.aguante = Math.min(this.aguanteMax, this.aguante + 42 * dt);
      else this.aguante = Math.min(this.aguanteMax, this.aguante + 12 * dt);
      const ctrl = this.controlable && !this.zona.bloqueoJugador;
      const h = ctrl ? E.horizontal() : 0;

      switch (this.estado) {
        case 'normal':
          this.estadoNormal(dt, h, ctrl);
          break;
        case 'ataque':
          this.estadoAtaque(dt, ctrl);
          break;
        case 'fuerte':
          this.vx = U.aproximar(this.vx, 0, 900 * dt);
          if (this.anim.fin) this.cambiarEstado('normal');
          else if (ctrl && this.t > 0.55 && E.enBufer('esquivar')) this.empezarRodar(h);
          break;
        case 'aereo':
          this.vx = U.aproximar(this.vx, h * 100, 600 * dt);
          if (this.enSuelo) {
            this.cambiarEstado('normal');
            this.golpeActivo = null;
          } else if (this.anim.fin) this.cambiarEstado('normal');
          break;
        case 'bloqueo':
          this.vx = U.aproximar(this.vx, 0, 1200 * dt);
          this.tBloqueo += dt;
          if (this.anim.anim !== 'bloqueoGolpe' || this.anim.fin) this.poner('bloquear');
          if (!ctrl || !E.pulsado('bloquear')) this.cambiarEstado('normal');
          else if (E.enBufer('esquivar')) this.empezarRodar(h);
          else if (E.enBufer('atacar') && this.puede(10)) this.empezarAtaque(1);
          break;
        case 'rodar':
          this.vx = this.dir * U.lerp(215, 70, this.t / 0.38);
          if (this.t > 0.38) {
            this.cambiarEstado('normal');
            if (ctrl && E.enBufer('atacar') && this.armado) this.empezarAtaque(1);
          }
          break;
        case 'herido':
          this.vx = U.aproximar(this.vx, 0, 500 * dt);
          if (this.t > 0.3) this.cambiarEstado('normal');
          break;
        case 'aturdido':
          this.vx = U.aproximar(this.vx, 0, 600 * dt);
          this.poner('aturdido');
          if (this.t > 0.85) this.cambiarEstado('normal');
          break;
        case 'beber':
          this.vx = U.aproximar(this.vx, 0, 900 * dt);
          if (this.t > 0.55 && !this.bebido) {
            this.bebido = true;
            this.vida = Math.min(this.vidaMax, this.vida + 40);
            IH.audio.sfx('curar');
            this.zona.particulas.emitir('gota', this.x + this.dir * 4, this.y - 40, 4);
          }
          if (this.anim.fin) this.cambiarEstado('normal');
          break;
        case 'muerto':
          this.vx = U.aproximar(this.vx, 0, 400 * dt);
          if (this.anim.fin && this.anim.anim === 'muerte') this.poner('yacer');
          break;
        case 'escena':
          this.estadoEscena(dt);
          break;
      }
      this.mover(dt);
      if (this.enSuelo) {
        this.coyote = 0.1;
        if (this.aterrizo && this.tAire > 0.28) {
          IH.audio.sfx('aterrizar', { x: this.x, vol: 0.6 });
          this.zona.particulas.emitir('polvo', this.x, this.y, 5, { color: this.zona.colorPolvo });
          if (this.estado === 'normal') this.poner('aterrizar', true);
        }
        this.tAire = 0;
      } else {
        this.coyote -= dt;
        this.tAire += dt;
      }
      this.anim.actualizar(dt);
      for (const ev of this.anim.eventos) this.alEvento(ev);
      this.sonidosPasos();
      // golpe activo
      if (this.golpeActivo) {
        this.golpeActivo.t -= dt;
        this.zona.aplicarGolpe(this, this.golpeActivo, this.golpeados);
        if (this.golpeActivo.t <= 0) this.golpeActivo = null;
      }
      if (this.critico > 0) this.critico -= dt;
    }

    estadoNormal(dt, h, ctrl) {
      const E = IH.entrada;
      const correr = !this.tranquilo || (ctrl && E.pulsado('esquivar'));
      const vmax = this.tranquilo ? (correr ? 112 : 60) : 112;
      const acel = this.enSuelo ? 1300 : 800;
      this.vx = U.aproximar(this.vx, h * vmax, acel * dt);
      if (h !== 0) this.dir = h;
      // salto (W/↑ también salta si no hay nada con lo que interactuar)
      const quiereSaltar = ctrl && (E.enBufer('saltar') || (E.ultimoDispositivo === 'teclado' && E.presionado('arriba') && !this.zona.interactuableCerca));
      if (quiereSaltar && (this.enSuelo || this.coyote > 0) && !this.zona.sinSaltos) {
        E.consumir('saltar');
        this.vy = -345;
        this.enSuelo = false;
        this.coyote = 0;
        IH.audio.sfx('salto', { x: this.x, vol: 0.5 });
        this.zona.particulas.emitir('polvo', this.x, this.y, 3, { color: this.zona.colorPolvo });
      }
      if (ctrl && E.soltado('saltar') && this.vy < -140) this.vy *= 0.5;
      // bajar de una plataforma
      if (ctrl && this.plataforma && E.pulsado('abajo') && E.enBufer('saltar')) {
        this.atravesando = 0.25;
        this.y += 2;
      }
      if (this.atravesando) {
        this.atravesando -= dt;
        if (this.atravesando <= 0) this.atravesando = 0;
      }
      // acciones
      if (ctrl) {
        if (this.armado && !this.zona.sinCombate) {
          if (E.enBufer('atacar') && this.puede(9)) {
            E.consumir('atacar');
            if (this.enSuelo) this.empezarAtaque(1);
            else this.empezarAereo();
            return;
          }
          if (E.enBufer('fuerte') && this.enSuelo && this.puede(20)) {
            E.consumir('fuerte');
            this.empezarFuerte();
            return;
          }
          if (E.pulsado('bloquear') && this.enSuelo) {
            this.encararEnemigo(70);
            this.cambiarEstado('bloqueo');
            this.tBloqueo = 0;
            this.poner('bloquear');
            return;
          }
        }
        if (E.enBufer('esquivar') && this.enSuelo && !this.tranquilo) {
          E.consumir('esquivar');
          this.empezarRodar(h);
          return;
        }
        if (E.presionado('curar') && this.enSuelo && !this.zona.sinCombate) this.beber();
      }
      // animación
      if (this.anim.anim === 'aterrizar' && !this.anim.fin && Math.abs(h) < 0.1) return;
      if (!this.enSuelo) this.poner(this.vy < 0 ? 'saltar' : 'caer');
      else if (Math.abs(this.vx) < 6) this.poner(this.armado && !this.tranquilo ? 'guardia' : 'quieto');
      else if (Math.abs(this.vx) < 80) this.poner('andar');
      else this.poner('correr');
    }

    estadoAtaque(dt, ctrl) {
      const E = IH.entrada;
      this.vx = U.aproximar(this.vx, 0, 700 * dt);
      const prog = this.anim.t / Math.max(0.01, this.anim.duracion);
      if (ctrl && prog > 0.3 && E.enBufer('atacar') && this.combo < 3) {
        E.consumir('atacar');
        this.encadenar = true;
      }
      if (ctrl && prog > 0.45 && E.enBufer('esquivar')) {
        E.consumir('esquivar');
        this.golpeActivo = null;
        this.empezarRodar(E.horizontal());
        return;
      }
      if (ctrl && prog > 0.5 && E.pulsado('bloquear')) {
        this.golpeActivo = null;
        this.cambiarEstado('bloqueo');
        this.tBloqueo = 0;
        this.poner('bloquear');
        return;
      }
      if (this.encadenar && prog > 0.62 && this.combo < 3 && this.puede(9)) {
        const h = E.horizontal();
        if (h !== 0) this.dir = h;
        this.empezarAtaque(this.combo + 1);
        return;
      }
      if (this.anim.fin) {
        this.combo = 0;
        this.cambiarEstado('normal');
      }
    }

    empezarAtaque(n) {
      const E = IH.entrada;
      const h = E.horizontal();
      if (h !== 0) this.dir = h;
      // si hay un enemigo cerca a la espalda y no se pulsa dirección, gira hacia él
      if (h === 0) {
        const e = this.zona.enemigoMasCercano(this.x, 50);
        if (e && Math.sign(e.x - this.x) !== this.dir && Math.abs(e.x - this.x) < 40) this.dir = Math.sign(e.x - this.x);
      }
      this.combo = n;
      this.encadenar = false;
      this.cambiarEstado('ataque');
      const nombre = 'ataque' + n;
      this.poner(nombre, true);
      this.ataqueActual = nombre;
      this.vx = this.dir * ATAQUES[nombre].avance * 0.6;
      this.gastar(ATAQUES[nombre].aguante);
    }
    // Si no se pulsa dirección, se vuelve hacia el enemigo más cercano
    encararEnemigo(radio) {
      if (IH.entrada.horizontal() !== 0) return;
      const e = this.zona.enemigoMasCercano(this.x, radio);
      if (e) this.dir = Math.sign(e.x - this.x) || this.dir;
    }
    empezarFuerte() {
      const h = IH.entrada.horizontal();
      if (h !== 0) this.dir = h;
      else this.encararEnemigo(60);
      this.cambiarEstado('fuerte');
      this.poner('fuerte', true);
      this.ataqueActual = 'fuerte';
      this.gastar(ATAQUES.fuerte.aguante);
    }
    empezarAereo() {
      this.cambiarEstado('aereo');
      this.poner('aereo', true);
      this.ataqueActual = 'aereo';
      this.gastar(ATAQUES.aereo.aguante);
    }
    empezarRodar(h) {
      if (!this.puede(18) || !this.enSuelo) return;
      if (h) this.dir = h;
      this.gastar(20);
      this.cambiarEstado('rodar');
      this.poner('rodar', true);
      this.invul = 0.32;
      this.golpeActivo = null;
      IH.audio.sfx('rodar', { x: this.x, vol: 0.6 });
      this.zona.particulas.emitir('polvo', this.x, this.y, 4, { color: this.zona.colorPolvo, vx: -this.dir * 30 });
    }
    beber() {
      const P = IH.partida;
      if (!P || P.agua <= 0) {
        IH.notificar('El odre está vacío');
        return;
      }
      if (this.vida >= this.vidaMax) {
        IH.notificar('No tienes sed');
        return;
      }
      P.agua--;
      this.bebido = false;
      this.cambiarEstado('beber');
      this.poner('beber', true);
    }
    alEvento(ev) {
      if (ev === 'golpe' && this.ataqueActual && (this.estado === 'ataque' || this.estado === 'fuerte' || this.estado === 'aereo')) {
        const d = ATAQUES[this.ataqueActual];
        this.golpeActivo = { t: 0.09, d, dano: d.dano * (this.critico > 0 ? 1.8 : 1), critico: this.critico > 0, empuje: d.empuje, rompeGuardia: d.rompeGuardia, caja: d.caja, dueno: 'jugador', id: Math.random() };
        this.golpeados = new Set();
        if (d.avance) this.vx = this.dir * d.avance;
        IH.audio.sfx(d.sfx, { x: this.x, tono: d.tono || 1, vol: 0.7 });
        const e = d.estela;
        this.zona.particulas.estela(this.x + this.dir * 4, this.y + e.y, this.dir, e);
        if (d.sacudida) this.zona.sacudir(d.sacudida * 0.6);
      }
    }

    // Recibe un golpe enemigo; devuelve el resultado
    recibirGolpe(g, atacante) {
      if (this.estado === 'muerto' || this.zona.invulnerable) return null;
      if (this.invul > 0 && this.estado === 'rodar') {
        if (!this._esquivaMostrada) {
          this._esquivaMostrada = true;
          setTimeout(() => (this._esquivaMostrada = false), 400);
        }
        return 'esquiva';
      }
      if (this.invul > 0) return null;
      const deFrente = Math.sign(atacante.x - this.x) === this.dir || Math.abs(atacante.x - this.x) < 3;
      if (this.estado === 'bloqueo' && deFrente && !g.imparable) {
        if (this.tBloqueo < 0.2 && !g.proyectilPesado) {
          // ¡PARADA!
          IH.audio.sfx('parada', { x: this.x });
          IH.pararGolpe(0.09);
          IH.camaraLenta(0.35, 0.35);
          this.zona.sacudir(0.25);
          this.zona.particulas.emitir('chispa', this.x + this.dir * 10, this.y - 32, 18, { fuerza: 1.3 });
          this.zona.particulas.emitir('destello', this.x + this.dir * 10, this.y - 32, 1, { r: 24 });
          this.zona.textoFlotante('¡Parada!', this.x, this.y - 64, '#f0cf72');
          this.poner('parada', true);
          this.cambiarEstado('ataque');
          this.combo = 0;
          this.encadenar = false;
          this.ataqueActual = null;
          this.critico = 1.6;
          IH.entrada.vibrar(0.6, 140);
          if (IH.partida) IH.partida.estadisticas.paradas = (IH.partida.estadisticas.paradas || 0) + 1;
          return 'parada';
        }
        const coste = g.dano * 1.6 + (g.rompeGuardia ? 40 : 0);
        if (this.aguante >= coste && !g.rompeGuardia) {
          this.gastar(coste);
          IH.audio.sfx(IH.TRAJES[this.traje].escudo ? 'escudo' : 'choque', { x: this.x });
          this.zona.particulas.emitir('chispa', this.x + this.dir * 10, this.y - 30, 7);
          this.poner('bloqueoGolpe', true);
          this.vx = -this.dir * 90;
          this.zona.sacudir(0.12);
          IH.entrada.vibrar(0.3, 80);
          return 'bloqueo';
        }
        // guardia rota
        this.gastar(100);
        this.aguante = 0;
        IH.audio.sfx('choque', { x: this.x });
        this.zona.textoFlotante('Guardia rota', this.x, this.y - 64, '#e07050');
        this.cambiarEstado('aturdido');
        this.vx = -this.dir * 140;
        return 'rota';
      }
      // impacto
      const dano = g.dano * (IH.partida && IH.partida.dificultad === 'historia' ? 0.5 : 1);
      this.vida -= dano;
      this.flash = 0.2;
      this.invul = 0.55;
      this.golpeActivo = null;
      IH.audio.sfx('golpe', { x: this.x });
      IH.audio.sfx('dolor', { x: this.x, tono: 1.05, vol: 0.7 });
      this.zona.particulas.emitir('sangre', this.x, this.y - 30, 6, { angulo: atacante.x < this.x ? -0.6 : -2.5 });
      this.zona.sacudir(0.35);
      IH.pararGolpe(0.06);
      IH.entrada.vibrar(0.7, 160);
      this.vx = Math.sign(this.x - atacante.x || 1) * (g.empuje || 100);
      this.dir = Math.sign(atacante.x - this.x) || this.dir;
      if (this.zona.sinMuerte) this.vida = Math.max(1, this.vida);
      if (this.vida <= 0) {
        this.vida = 0;
        this.morir();
      } else {
        this.cambiarEstado('herido');
        this.poner('herido', true);
      }
      return 'golpe';
    }
    morir() {
      this.cambiarEstado('muerto');
      this.poner('muerte', true);
      IH.audio.sfx('muerte', { x: this.x, tono: 1.1 });
      IH.camaraLenta(0.3, 1.2);
      this.zona.alMorirJugador();
    }

    // ---- control desde guiones
    irA(x, opc = {}) {
      this.cambiarEstado('escena');
      this.objetivoX = x;
      this.velEscena = opc.vel || 60;
      this.animEscena = opc.anim || (this.velEscena > 80 ? 'correr' : 'andar');
      this.animFinal = opc.final;
      const yo = this;
      return { actualizar: () => yo.objetivoX == null };
    }
    estadoEscena(dt) {
      if (this.objetivoX != null) {
        const d = this.objetivoX - this.x;
        if (Math.abs(d) < 2) {
          this.x = this.objetivoX;
          this.objetivoX = null;
          this.vx = 0;
          this.poner(this.animFinal || 'quieto');
          if (this.mirarAlLlegar) this.dir = this.mirarAlLlegar;
        } else {
          this.dir = Math.sign(d);
          this.vx = this.dir * Math.min(this.velEscena, Math.abs(d) * 8 + 20);
          this.poner(this.animEscena);
        }
      } else {
        this.vx = U.aproximar(this.vx, 0, 800 * dt);
        if (this.animForzada) this.poner(this.animForzada);
      }
    }
    soltar() {
      this.cambiarEstado('normal');
      this.animForzada = null;
      this.objetivoX = null;
    }
  }
  IH.Jugador = Jugador;

  // ================================================================== enemigos
  const TIPOS_ENEMIGO = {
    sargento: {
      vida: 46, vel: 50, alcance: 30, bloqueo: 0.42, escudo: true, tono: 1, aplomo: 1,
      pausa: [0.7, 1.7],
      ataques: [
        { anim: 'ataque1', peso: 3, dano: 12, caja: { x: 0, y: -48, w: 34, h: 42 }, empuje: 90, avance: 40, dist: [0, 36] },
        { anim: 'estocada', peso: 2, dano: 15, caja: { x: 2, y: -38, w: 42, h: 16 }, empuje: 130, avance: 150, dist: [18, 60] },
        { anim: 'embestida', peso: 1, dano: 6, caja: { x: 0, y: -46, w: 24, h: 40 }, empuje: 190, avance: 190, rompeGuardia: true, dist: [10, 55] },
      ],
    },
    sargentoMaza: {
      vida: 52, vel: 46, alcance: 30, bloqueo: 0.38, escudo: true, tono: 0.9, aplomo: 1.2,
      pausa: [0.8, 1.9],
      ataques: [
        { anim: 'tajoArriba', peso: 3, dano: 17, caja: { x: 0, y: -60, w: 34, h: 56 }, empuje: 140, avance: 40, dist: [0, 38] },
        { anim: 'embestida', peso: 1, dano: 6, caja: { x: 0, y: -46, w: 24, h: 40 }, empuje: 190, avance: 190, rompeGuardia: true, dist: [10, 55] },
      ],
    },
    ballestero: {
      vida: 30, vel: 46, alcance: 26, bloqueo: 0, escudo: false, tono: 1.1, tirador: true, aplomo: 0.6,
      pausa: [1.2, 2.2],
      ataques: [{ anim: 'ataque1', peso: 1, dano: 9, caja: { x: 0, y: -46, w: 26, h: 40 }, empuje: 80, avance: 30, dist: [0, 32] }],
    },
    caballero: {
      vida: 150, vel: 40, alcance: 34, bloqueo: 0.55, escudo: true, tono: 0.85, armadura: 0.65, superArmadura: true, aplomo: 4,
      pausa: [0.6, 1.4],
      ataques: [
        { anim: 'tajoArriba', peso: 3, dano: 22, caja: { x: 0, y: -66, w: 40, h: 62 }, empuje: 170, avance: 50, dist: [0, 42] },
        { anim: 'estocada', peso: 2, dano: 18, caja: { x: 2, y: -40, w: 48, h: 16 }, empuje: 150, avance: 170, dist: [20, 70] },
        { anim: 'salto_golpe', peso: 1, dano: 28, caja: { x: -8, y: -70, w: 56, h: 70 }, empuje: 220, avance: 120, imparable: true, dist: [30, 110], sacudida: 0.6 },
        { anim: 'embestida', peso: 1, dano: 8, caja: { x: 0, y: -48, w: 26, h: 42 }, empuje: 200, avance: 200, rompeGuardia: true, dist: [10, 60] },
      ],
    },
    templario: {
      vida: 280, vel: 46, alcance: 36, bloqueo: 0.5, escudo: true, tono: 0.8, armadura: 0.7, superArmadura: true, aplomo: 5, jefe: true,
      pausa: [0.5, 1.2],
      ataques: [
        { anim: 'tajoArriba', peso: 3, dano: 22, caja: { x: 0, y: -68, w: 42, h: 64 }, empuje: 170, avance: 60, dist: [0, 44] },
        { anim: 'estocada', peso: 2, dano: 18, caja: { x: 2, y: -42, w: 52, h: 16 }, empuje: 150, avance: 190, dist: [20, 80] },
        { anim: 'salto_golpe', peso: 2, dano: 30, caja: { x: -8, y: -72, w: 60, h: 72 }, empuje: 240, avance: 140, imparable: true, dist: [30, 130], sacudida: 0.7 },
        { anim: 'embestida', peso: 1, dano: 8, caja: { x: 0, y: -50, w: 28, h: 44 }, empuje: 210, avance: 210, rompeGuardia: true, dist: [10, 60] },
        { anim: 'ataque2', peso: 2, dano: 16, caja: { x: 0, y: -60, w: 40, h: 52 }, empuje: 110, avance: 80, dist: [0, 46], fase: 2 },
      ],
    },
  };
  // Sunqur en el entrenamiento: ataques lentos y bien avisados, elegidos según la lección
  TIPOS_ENEMIGO.instructor = {
    vida: 500, vel: 44, alcance: 30, bloqueo: 0.25, escudo: false, tono: 0.95, aplomo: 2,
    pausa: [1.3, 2.0],
    ataques: [
      { anim: 'ataque1', peso: 3, dano: 6, caja: { x: 0, y: -48, w: 34, h: 42 }, empuje: 70, avance: 30, dist: [0, 40], si: (z) => z.leccion !== 'rodar' },
      { anim: 'tajoArriba', peso: 3, dano: 7, caja: { x: 0, y: -60, w: 36, h: 56 }, empuje: 90, avance: 40, dist: [0, 44], imparable: true, si: (z) => z.leccion === 'rodar' },
    ],
  };
  IH.TIPOS_ENEMIGO = TIPOS_ENEMIGO;

  class Enemigo extends Personaje {
    constructor(zona, opc) {
      super(zona, opc);
      this.tipo = opc.tipo || 'sargento';
      this.def = TIPOS_ENEMIGO[this.tipo];
      this.vidaMax = opc.vida || this.def.vida;
      this.vida = this.vidaMax;
      this.estado = opc.estado || 'espera';
      this.t = 0;
      this.pausa = U.lerp(0.4, 1.2, Math.random());
      this.alerta = !!opc.alerta;
      this.radioAlerta = opc.radioAlerta || 230;
      this.golpeActivo = null;
      this.golpeados = new Set();
      this.guardia = 0;
      this.aplomo = this.def.aplomo;
      this.capa = 5;
      this.nombre = opc.nombre || null;
      this.fase = 1;
      this.recargado = true;
      this.tMuerto = 0;
      this.w = Math.round(13 * this.escala);
      this.distPreferida = this.def.alcance + U.lerp(4, 22, Math.random());
      this.lado = Math.random() < 0.5 ? -1 : 1;
      this.poner(this.def.tirador ? 'quieto' : 'guardia');
      this.alMorir = opc.alMorir || null;
      this.fijo = !!opc.fijo;
      if (opc.vidaMin != null) this.vidaMin = opc.vidaMin;
    }
    get jugador() {
      return this.zona.jugador;
    }
    cambiarEstado(e) {
      this.estado = e;
      this.t = 0;
    }
    actualizar(dt) {
      this.t += dt;
      this.flash = Math.max(0, this.flash - dt);
      this.tSinGolpe = (this.tSinGolpe || 0) + dt;
      if (this.tSinGolpe > 2) this.aplomo = this.def.aplomo;
      const J = this.jugador;
      if (this.estado === 'muerto') {
        this.vx = U.aproximar(this.vx, 0, 300 * dt);
        this.tMuerto += dt;
        if (this.anim.fin && this.anim.anim === 'muerte') this.poner('yacer');
        if (this.tMuerto > 9 && !this.persistente) {
          this.alfa = Math.max(0, 1 - (this.tMuerto - 9) / 1.5);
          if (this.alfa <= 0) this.borrar = true;
        }
        this.mover(dt);
        this.anim.actualizar(dt);
        return;
      }
      const dx = J ? J.x - this.x : 0;
      const adx = Math.abs(dx);
      const jugadorVivo = J && J.estado !== 'muerto';
      if (!this.alerta && J && adx < this.radioAlerta && Math.abs(J.y - this.y) < 80 && !this.zona.enemigosPasivos) {
        this.alerta = true;
        this.pausa = U.lerp(0.2, 0.7, Math.random());
        if (Math.random() < 0.5) IH.audio.sfx('grito', { x: this.x, tono: this.def.tono, vol: 0.5 });
      }
      switch (this.estado) {
        case 'espera':
          this.vx = U.aproximar(this.vx, 0, 600 * dt);
          if (this.alerta && jugadorVivo) this.cambiarEstado('combate');
          break;
        case 'combate':
          if (!jugadorVivo) {
            this.vx = U.aproximar(this.vx, 0, 600 * dt);
            this.poner('guardia');
            break;
          }
          this.dir = Math.sign(dx) || this.dir;
          if (this.def.tirador) this.iaTirador(dt, dx, adx);
          else this.iaCuerpo(dt, dx, adx);
          break;
        case 'ataque':
          this.vx = U.aproximar(this.vx, 0, 600 * dt);
          if (this.anim.fin) {
            this.cambiarEstado('combate');
            this.pausa = U.lerp(this.def.pausa[0], this.def.pausa[1], Math.random()) * (this.fase === 2 ? 0.6 : 1);
            this.zona.finAtaqueEnemigo(this);
          }
          break;
        case 'apuntar':
          this.vx = 0;
          this.dir = Math.sign(dx) || this.dir;
          if (this.t > 0.85) {
            this.cambiarEstado('disparar');
            this.poner('disparar', true);
          }
          break;
        case 'disparar':
          if (this.anim.fin) {
            this.cambiarEstado('recargar');
            this.poner('recargar', true);
            this.recargado = false;
          }
          break;
        case 'recargar':
          this.vx = 0;
          if (this.t > 2.0) {
            this.recargado = true;
            this.cambiarEstado('combate');
            this.pausa = 0.3;
          }
          break;
        case 'herido':
          this.vx = U.aproximar(this.vx, 0, 500 * dt);
          if (this.t > 0.35) this.cambiarEstado('combate');
          break;
        case 'bloqueo':
          this.vx = U.aproximar(this.vx, 0, 600 * dt);
          if (this.anim.fin || this.t > 0.35) {
            this.cambiarEstado('combate');
            this.pausa = Math.min(this.pausa, 0.25);
          }
          break;
        case 'aturdido':
          this.vx = U.aproximar(this.vx, 0, 500 * dt);
          this.poner('aturdido');
          if (this.t > (this.tAturdido || 1.3)) {
            this.cambiarEstado('combate');
            this.pausa = 0.2;
          }
          break;
        case 'escena':
          this.vx = U.aproximar(this.vx, 0, 600 * dt);
          if (this.objetivoX != null) {
            const d = this.objetivoX - this.x;
            if (Math.abs(d) < 2) {
              this.objetivoX = null;
              this.vx = 0;
              this.poner(this.animFinal || 'guardia');
            } else {
              this.dir = Math.sign(d);
              this.vx = this.dir * (this.velEscena || 50);
              this.poner(this.animEscena || 'avanzar');
            }
          }
          break;
      }
      this.mover(dt);
      this.anim.actualizar(dt);
      for (const ev of this.anim.eventos) this.alEvento(ev);
      this.sonidosPasos();
      if (this.golpeActivo) {
        this.golpeActivo.t -= dt;
        this.zona.aplicarGolpe(this, this.golpeActivo, this.golpeados);
        if (this.golpeActivo.t <= 0) this.golpeActivo = null;
      }
    }
    iaCuerpo(dt, dx, adx) {
      this.pausa -= dt;
      // mantiene una distancia y se acerca/aleja con pasos cortos
      let objetivo = this.distPreferida;
      if (this.pausa <= 0) objetivo = this.def.alcance - 4;
      const diff = adx - objetivo;
      let vel = 0;
      if (Math.abs(diff) > 4) vel = Math.sign(diff) * this.def.vel * (diff < 0 ? 0.6 : 1);
      // evita amontonarse con otros enemigos
      for (const o of this.zona.enemigos) {
        if (o === this || o.estado === 'muerto') continue;
        const d = this.x - o.x;
        if (Math.abs(d) < 16 && Math.sign(d) !== Math.sign(dx)) vel += Math.sign(d || 1) * 30;
      }
      this.vx = U.aproximar(this.vx, this.dir * vel, 500 * dt);
      if (Math.abs(this.vx) > 8) this.poner('avanzar');
      else this.poner('guardia');
      if (this.pausa <= 0 && this.jugador.enSuelo !== undefined) {
        const disponibles = this.def.ataques.filter((a) => adx >= a.dist[0] && adx <= a.dist[1] && (!a.fase || a.fase <= this.fase) && (!a.si || a.si(this.zona)));
        if (disponibles.length && this.zona.pedirTurno(this)) {
          let total = disponibles.reduce((s, a) => s + a.peso, 0);
          let r = Math.random() * total;
          let elegido = disponibles[0];
          for (const a of disponibles) {
            r -= a.peso;
            if (r <= 0) {
              elegido = a;
              break;
            }
          }
          this.atacar(elegido);
        } else if (adx > 140) {
          this.pausa = 0.2;
        }
      }
    }
    iaTirador(dt, dx, adx) {
      this.pausa -= dt;
      let vel = 0;
      if (adx < 70) vel = -this.def.vel; // retrocede
      else if (adx > 230) vel = this.def.vel;
      if (this.fijo) vel = 0;
      if (adx < 34 && this.pausa <= 0 && this.zona.pedirTurno(this)) {
        this.atacar(this.def.ataques[0]);
        return;
      }
      this.vx = U.aproximar(this.vx, this.dir * vel, 500 * dt);
      if (this.choqueX) this.vx = 0;
      this.poner(Math.abs(this.vx) > 8 ? 'avanzar' : 'quieto');
      if (this.pausa <= 0 && adx >= 60 && adx < 320 && this.recargado && this.zona.pedirTurno(this, true)) {
        this.cambiarEstado('apuntar');
        this.poner('apuntar', true);
        this.zona.particulas.emitir('destello', this.x + this.dir * 16, this.y - 38, 1, { r: 10, color: '#ffd080', vida: 0.4 });
      }
    }
    atacar(a) {
      this.ataque = a;
      this.cambiarEstado('ataque');
      this.poner(a.anim, true);
      // aviso visual: brillo en el arma (rojo si es imparable)
      const color = a.imparable ? '#ff3a2a' : '#ffe6a0';
      this.zona.particulas.emitir('destello', this.x + this.dir * 12, this.y - 52 * this.escala, 1, { r: a.imparable ? 22 : 12, color, vida: 0.35 });
      if (a.imparable) this.zona.textoFlotante('!', this.x, this.y - 70, '#ff5a3a');
    }
    alEvento(ev) {
      if (ev === 'golpe' && this.estado === 'ataque' && this.ataque) {
        const a = this.ataque;
        this.golpeActivo = { t: 0.1, dano: a.dano * (this.zona.modDano || 1), caja: a.caja, empuje: a.empuje, rompeGuardia: a.rompeGuardia, imparable: a.imparable, dueno: 'enemigo', id: Math.random() };
        this.golpeados = new Set();
        this.vx = this.dir * (a.avance || 0);
        IH.audio.sfx(a.anim === 'embestida' ? 'rodar' : 'tajo', { x: this.x, tono: this.def.tono * 0.9, vol: 0.6 });
        if (a.anim !== 'embestida') this.zona.particulas.estela(this.x + this.dir * 4, this.y - 30 * this.escala, this.dir, { a0: -110, a1: 50, r: 26 * this.escala, color: '#e8e0d0' });
        if (a.sacudida) {
          this.zona.sacudir(a.sacudida);
          IH.audio.sfx('aterrizar', { x: this.x });
          this.zona.particulas.emitir('polvo', this.x + this.dir * 20, this.y, 10, { color: this.zona.colorPolvo });
        }
      }
      if (ev === 'disparo') {
        IH.audio.sfx('ballesta', { x: this.x });
        const J = this.zona.jugador;
        const x0 = this.x + this.dir * 16, y0 = this.y - 38;
        const t = Math.max(0.15, Math.abs(J.x - x0) / 330);
        const vy = U.clamp((J.y - 26 - y0) / t - 20 * t, -200, 260);
        this.zona.agregar(new Proyectil(this.zona, { x: x0, y: y0, vx: this.dir * 330, vy, dano: 16 * (this.zona.modDano || 1), dueno: 'enemigo', origen: this }));
      }
    }
    // Recibe un golpe del jugador
    recibirGolpe(g, atacante) {
      if (this.estado === 'muerto' || this.invulnerable) return null;
      const deFrente = Math.sign(atacante.x - this.x) === this.dir;
      const puedeBloquear = this.def.escudo && deFrente && (this.estado === 'combate' || this.estado === 'bloqueo' || this.estado === 'espera') && !g.critico;
      if (puedeBloquear && (g.rompeGuardia ? Math.random() < this.def.bloqueo * 0.5 : Math.random() < this.def.bloqueo)) {
        this.guardia++;
        if (g.rompeGuardia || this.guardia >= 3) {
          this.guardia = 0;
          IH.audio.sfx('escudo', { x: this.x });
          IH.audio.sfx('choque', { x: this.x, vol: 0.6 });
          this.zona.particulas.emitir('astilla', this.x + this.dir * 8, this.y - 30, 6);
          this.zona.textoFlotante('¡Guardia rota!', this.x, this.y - 66, '#f0cf72');
          this.aturdir(1.1);
          return 'rota';
        }
        IH.audio.sfx('escudo', { x: this.x });
        this.zona.particulas.emitir('chispa', this.x + this.dir * 8, this.y - 32, 5);
        this.cambiarEstado('bloqueo');
        this.poner('bloqueoGolpe', true);
        this.vx = -this.dir * 70;
        if (atacante.vx !== undefined) atacante.vx = -atacante.dir * 60;
        return 'bloqueo';
      }
      let dano = g.dano;
      if (this.def.armadura && !g.rompeGuardia && !g.critico) dano *= this.def.armadura;
      this.vida -= dano;
      if (this.vidaMin != null) this.vida = Math.max(this.vidaMin, this.vida);
      if (this.alRecibir) this.alRecibir(this, g, dano);
      this.flash = 0.16;
      const metal = !!IH.TRAJES[this.traje].malla;
      IH.audio.sfx(metal ? 'golpeArmadura' : 'golpe', { x: this.x });
      if (g.critico) {
        IH.audio.sfx('parada', { x: this.x, vol: 0.6 });
        this.zona.textoFlotante('¡Contraataque!', this.x, this.y - 70, '#f0cf72');
        IH.pararGolpe(0.1);
      } else IH.pararGolpe(g.rompeGuardia ? 0.08 : 0.05);
      this.zona.particulas.emitir('sangre', this.x, this.y - 32, g.critico ? 10 : 5, { angulo: atacante.x < this.x ? -0.5 : -2.6 });
      if (metal) this.zona.particulas.emitir('chispa', this.x, this.y - 32, 4);
      this.zona.sacudir(g.critico ? 0.4 : g.rompeGuardia ? 0.3 : 0.15);
      IH.entrada.vibrar(0.4, 70);
      const k = (g.empuje || 80) * (this.def.superArmadura ? 0.35 : 1);
      this.vx = Math.sign(this.x - atacante.x || 1) * k;
      if (this.vida <= 0) {
        this.morir(atacante);
        return 'muerte';
      }
      this.alerta = true;
      // aplomo: los enemigos pesados solo se interrumpen tras varios golpes seguidos
      this.aplomo -= g.rompeGuardia ? 2 : 1;
      this.tSinGolpe = 0;
      if (g.critico || !this.def.superArmadura || this.aplomo <= 0) {
        this.aplomo = this.def.aplomo;
        if (this.estado === 'ataque') this.zona.finAtaqueEnemigo(this);
        this.golpeActivo = null;
        this.cambiarEstado('herido');
        this.poner('herido', true);
        IH.audio.sfx('dolor', { x: this.x, tono: this.def.tono, vol: 0.5 });
      }
      if (this.def.jefe && this.fase === 1 && this.vida < this.vidaMax * 0.5 && this.alCambioFase) this.alCambioFase();
      return 'golpe';
    }
    aturdir(seg) {
      if (this.estado === 'ataque') this.zona.finAtaqueEnemigo(this);
      this.golpeActivo = null;
      this.tAturdido = seg;
      this.cambiarEstado('aturdido');
      this.poner('aturdido', true);
    }
    morir(atacante) {
      this.vida = 0;
      if (this.estado === 'ataque') this.zona.finAtaqueEnemigo(this);
      this.cambiarEstado('muerto');
      this.poner('muerte', true);
      this.golpeActivo = null;
      this.vx = Math.sign(this.x - atacante.x || 1) * 90;
      IH.audio.sfx('muerte', { x: this.x, tono: this.def.tono });
      IH.camaraLenta(0.5, 0.25);
      if (IH.partida) IH.partida.estadisticas.derrotados = (IH.partida.estadisticas.derrotados || 0) + 1;
      if (this.alMorir) this.alMorir(this);
    }
    irA(x, opc = {}) {
      this.cambiarEstado('escena');
      this.objetivoX = x;
      this.velEscena = opc.vel || 50;
      this.animEscena = opc.anim;
      this.animFinal = opc.final;
      return { actualizar: () => this.objetivoX == null };
    }
  }
  IH.Enemigo = Enemigo;

  // ================================================================== proyectiles
  class Proyectil extends Entidad {
    constructor(zona, opc) {
      super(zona, opc);
      this.vx = opc.vx;
      this.vy = opc.vy || 0;
      this.dano = opc.dano || 10;
      this.dueno = opc.dueno || 'enemigo';
      this.origen = opc.origen;
      this.w = 6;
      this.h = 3;
      this.vida = 2.5;
      this.clavado = 0;
      this.capa = 12;
      this.dir = Math.sign(this.vx);
      this.sombra = false;
      this.tipo = opc.tipo || 'virote';
    }
    actualizar(dt) {
      if (this.clavado > 0) {
        this.clavado -= dt;
        if (this.clavado <= 0) this.borrar = true;
        return;
      }
      this.vida -= dt;
      if (this.vida <= 0) this.borrar = true;
      this.vy += (this.tipo === 'piedra' ? 600 : 40) * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      const z = this.zona;
      if (this.y >= z.suelo || this.x < 0 || this.x > z.ancho) {
        this.clavado = 1.5;
        IH.audio.sfx('clavarse', { x: this.x, vol: 0.5 });
        return;
      }
      for (const s of z.solidos) {
        if (s.inactivo || s.atravesable) continue;
        if (solapan({ x: this.x - 2, y: this.y - 1, w: 4, h: 2 }, s)) {
          this.clavado = 1.5;
          IH.audio.sfx('clavarse', { x: this.x, vol: 0.5 });
          return;
        }
      }
      const caja = { x: this.x - 3, y: this.y - 2, w: 6, h: 4 };
      if (this.dueno === 'enemigo') {
        const J = z.jugador;
        if (J && J.estado !== 'muerto' && solapan(caja, J.caja)) {
          const r = J.recibirGolpe({ dano: this.dano, empuje: 70, proyectilPesado: false }, this);
          if (r === 'esquiva') return;
          if (r === 'parada' || r === 'bloqueo') {
            // desviado
            this.dueno = 'jugador';
            this.vx = -this.vx * 0.5;
            this.vy = -160;
            this.tipo = 'piedra';
            return;
          }
          this.borrar = true;
        }
      } else {
        for (const e of z.enemigos) {
          if (e.estado !== 'muerto' && solapan(caja, e.caja)) {
            e.recibirGolpe({ dano: this.dano, empuje: 60 }, this);
            this.borrar = true;
            return;
          }
        }
      }
    }
    dibujar(ctx, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      if (this.tipo === 'piedra') {
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(x - 1, y - 1, 3, 3);
        return;
      }
      const d = this.dir;
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(Math.min(x, x - d * 9), y, 10, 1);
      ctx.fillStyle = '#c8ccd0';
      ctx.fillRect(x + (d > 0 ? 0 : -2), y, 2, 1);
      ctx.fillStyle = '#d8d0c0';
      ctx.fillRect(x - d * 9, y - 1, 2, 1);
      if (!this.clavado) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#fff4dc';
        ctx.fillRect(Math.min(x - d * 10, x - d * 22), y, 12, 1);
        ctx.globalAlpha = 1;
      }
    }
  }
  IH.Proyectil = Proyectil;

  // ================================================================== personajes no jugadores
  class PNJ extends Personaje {
    constructor(zona, opc) {
      super(zona, opc);
      this.opc = opc;
      this.nombre = opc.nombre || (IH.HABLANTES[opc.hablante] || {}).nombre || IH.TRAJES[opc.traje].nombre;
      this.hablante = opc.hablante;
      this.animBase = opc.anim || 'quieto';
      this.mirar = opc.mirar !== false;
      this.patrulla = opc.patrulla || null;
      this.vel = opc.vel || 32;
      this.esperaPatrulla = 0;
      this.objetivoPatrulla = this.patrulla ? this.patrulla[1] : null;
      this.capa = opc.capa != null ? opc.capa : 2;
      this.etiqueta = opc.etiqueta || 'Hablar';
      this.alHablar = opc.hablar || null;
      this.ladridos = opc.ladridos || null;
      this.alLanzar = opc.alLanzar || null;
      this.alGolpe = opc.alGolpe || null;
      this.radioInteraccion = opc.radio || 28;
      this.tLadrido = U.lerp(2, 8, Math.random());
      this.objetivoX = null;
      this.dirBase = this.dir;
      this.marca = opc.marca || null; // '!' o '?' sobre la cabeza
    }
    interactuable() {
      return !!this.alHablar && this.visible && !this.ocupado;
    }
    actualizar(dt) {
      const J = this.zona.jugador;
      if (this.saltando) {
        this.anim.actualizar(dt);
        return;
      }
      if (this.objetivoX != null) {
        const d = this.objetivoX - this.x;
        if (Math.abs(d) < 2) {
          this.objetivoX = null;
          this.vx = 0;
          if (this.dirFinal) {
            this.dir = this.dirFinal;
            this.dirBase = this.dirFinal;
          }
          if (this.animFinal) this.animBase = this.animFinal;
          this.poner(this.animFinal || this.animBase);
        } else {
          this.dir = Math.sign(d);
          this.vx = this.dir * this.velEscena;
          this.poner(this.animEscena || (this.velEscena > 80 ? 'correr' : 'andar'));
        }
      } else if (this.patrulla && !this.hablando && !this.quieto) {
        if (this.esperaPatrulla > 0) {
          this.esperaPatrulla -= dt;
          this.vx = 0;
          this.poner(this.animBase);
        } else {
          const d = this.objetivoPatrulla - this.x;
          if (Math.abs(d) < 3) {
            this.esperaPatrulla = U.lerp(1.5, 4, Math.random());
            this.objetivoPatrulla = this.objetivoPatrulla === this.patrulla[0] ? this.patrulla[1] : this.patrulla[0];
          } else {
            this.dir = Math.sign(d);
            this.vx = this.dir * this.vel;
            this.poner(this.opc.animAndar || 'andar');
          }
        }
      } else {
        this.vx = 0;
        if (!this.animForzada) this.poner(this.hablando && this.spr.anims.hablar && this.animBase === 'quieto' ? 'hablar' : this.animBase);
        else this.poner(this.animForzada);
      }
      if (this.mirar && J && this.objetivoX == null && (!this.patrulla || this.esperaPatrulla > 0 || this.hablando)) {
        const d = J.x - this.x;
        if (Math.abs(d) < 70 && Math.abs(d) > 3) this.dir = Math.sign(d);
        else if (Math.abs(d) >= 90 && !this.patrulla) this.dir = this.dirBase;
      }
      // frases sueltas
      if (this.ladridos && J && !this.zona.guionActivo) {
        this.tLadrido -= dt;
        if (this.tLadrido <= 0 && Math.abs(J.x - this.x) < 150) {
          this.tLadrido = U.lerp(7, 14, Math.random());
          this.zona.bocadillo(this, this.ladridos[Math.floor(Math.random() * this.ladridos.length)]);
        }
      }
      if (this.opc.gravedad === false) this.gravedad = 0;
      this.mover(dt);
      if (this.opc.repetir && this.anim.fin) this.anim.poner(this.anim.anim, true);
      this.anim.actualizar(dt);
      for (const ev of this.anim.eventos) {
        if (ev === 'yunque') this.zona.alYunque && this.zona.alYunque(this);
        if (ev === 'lanzar' && this.alLanzar) this.alLanzar(this);
        if (ev === 'golpe' && this.alGolpe) this.alGolpe(this);
      }
      this.sonidosPasos();
    }
    irA(x, opc = {}) {
      this.objetivoX = x;
      this.velEscena = opc.vel || 40;
      this.animEscena = opc.anim;
      this.animFinal = opc.final;
      this.dirFinal = opc.dir;
      return { actualizar: () => this.objetivoX == null };
    }
    dibujar(ctx, cx, cy) {
      super.dibujar(ctx, cx, cy);
    }
  }
  IH.PNJ = PNJ;
})();
