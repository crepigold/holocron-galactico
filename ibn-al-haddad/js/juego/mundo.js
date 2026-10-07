/* Escena de zona jugable: escenario con parallax, entidades, cámara, iluminación,
 * interacción, guiones, interfaz (vida, aguante, odre, objetivos, diálogos) y transiciones.
 * Las zonas concretas se definen en js/capitulos/*.js con IH.ZONAS[id] = { ... }.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const T = () => IH.T;

  IH.ZONAS = IH.ZONAS || {};

  class Zona {
    constructor(params) {
      this.params = params || {};
      this.def = IH.ZONAS[params.zona];
      if (!this.def) throw new Error('Zona desconocida: ' + params.zona);
      this.id = params.zona;
    }

    // ------------------------------------------------------------------ montaje
    entrar() {
      const d = this.def;
      const P = IH.partida;
      P.zona = this.id;
      P.entrada = this.params.entrada || 'inicio';
      this.ancho = d.ancho || 640;
      this.suelo = d.suelo != null ? d.suelo : 300;
      this.tranquila = !!d.tranquila;
      this.sinCombate = !!d.sinCombate;
      this.colorPolvo = d.colorPolvo || '#c8b088';
      this.superficie = d.superficie || 'tierra';
      this.solidos = (d.solidos || []).map((s) => Object.assign({}, s));
      this.plataformas = (d.plataformas || []).map((s) => Object.assign({}, s));
      this.luces = [];
      this.entidades = [];
      this.enemigos = [];
      this.particulas = new IH.Particulas();
      this.guiones = [];
      this.guionActivo = null;
      this.bocadillos = [];
      this.textos = [];
      this.cineK = 0;
      this.cineObj = 0;
      this.fundidoA = 0;
      this.fundidoColor = '#000';
      this.titulos = [];
      this.narracion = null;
      this.atacando = [];
      this.ultimoTurno = -10;
      this.tiempo = 0;
      this.disparados = new Set();
      this.jefe = null;
      this.limites = null;
      this.hud = d.hud !== false;
      this.ui = null; // diálogo/elección visible
      this.modDano = P.dificultad === 'historia' ? 0.6 : P.dificultad === 'dificil' ? 1.35 : 1;
      // escenario
      const f = IH.Fondos.construir(d.fondo.escena, this.ancho, Object.assign({ suelo: this.suelo }, d.fondo.opc || {}));
      this.capas = f.capas;
      this.ambiente = d.ambiente !== undefined ? d.ambiente : f.ambiente || null;
      for (const l of f.luces || []) this.luces.push(Object.assign({ estatica: true }, l));
      this.lucesMapa = IH.lienzo(IH.ANCHO + 4, IH.ALTO + 4);
      // cámara
      this.cam = { x: 0, y: 0, sacudida: 0, objetivo: null, mirada: 0, vel: 5 };
      // jugador
      const ent = (d.entradas && d.entradas[this.params.entrada || 'inicio']) || { x: 60, dir: 1 };
      const traje = this.params.traje || P.traje || d.traje || 'yusuf';
      P.traje = traje;
      this.jugador = new IH.Jugador(this, { x: ent.x, y: ent.y != null ? ent.y : this.suelo, dir: ent.dir || 1, traje, vida: P.vida != null && !this.params.curar ? P.vida : null });
      if (this.jugador.vida <= 0) this.jugador.vida = this.jugador.vidaMax;
      this.agregar(this.jugador);
      this.cam.x = U.clamp(this.jugador.x - IH.ANCHO / 2, 0, Math.max(0, this.ancho - IH.ANCHO));
      if (d.camY) this.cam.y = d.camY;
      // población
      if (d.poblar) d.poblar(this, this.params);
      // audio
      if (d.musica !== undefined) IH.audio.musica(d.musica);
      if (d.ambienteSonoro !== undefined) IH.audio.ambiente(d.ambienteSonoro);
      // guardado automático
      if (!this.params.sinGuardar) IH.guardar();
      if (d.alEntrar) this.ejecutar(d.alEntrar(this, this.params), 'alEntrar');
      if (d.titulo && !this.params.sinTitulo && !(P.titulosVistos || []).includes(this.id)) {
        P.titulosVistos = (P.titulosVistos || []).concat([this.id]);
        this.titulo(d.titulo, d.subtitulo);
      }
      if (d.objetivo) this.objetivo(typeof d.objetivo === 'function' ? d.objetivo(this) : d.objetivo);
    }
    salir() {}

    agregar(e) {
      this.entidades.push(e);
      if (e instanceof IH.Enemigo) this.enemigos.push(e);
      return e;
    }
    pnj(opc) {
      return this.agregar(new IH.PNJ(this, opc));
    }
    objeto(opc) {
      return this.agregar(new IH.Objeto(this, opc));
    }
    enemigo(opc) {
      const e = new IH.Enemigo(this, opc);
      this.agregar(e);
      return e;
    }
    buscar(id) {
      return this.entidades.find((e) => e.id === id);
    }

    // ------------------------------------------------------------------ guiones
    ejecutar(gen, nombre, principal = true) {
      const g = new IH.Guion(gen, nombre);
      g.principal = principal;
      this.guiones.push(g);
      if (principal) this.guionActivo = g;
      return g;
    }
    get enEscena() {
      return !!this.guionActivo;
    }

    // ------------------------------------------------------------------ API para guiones
    bandera(n, v) {
      const B = IH.partida.banderas;
      if (v === undefined) return B[n];
      B[n] = v;
      return v;
    }
    dialogo(lineas, opc) {
      const d = new IH.Dialogo(lineas, opc);
      const z = this;
      z.ui = d;
      if (z.jugador.estado === 'normal') z.jugador.vx = 0;
      return {
        actualizar(dt) {
          const fin = d.actualizar(dt);
          if (fin && z.ui === d) z.ui = null;
          return fin;
        },
      };
    }
    eleccion(pregunta, opciones) {
      const e = new IH.Eleccion(pregunta, opciones);
      const z = this;
      z.ui = e;
      const tarea = {
        resultado: null,
        actualizar(dt) {
          const fin = e.actualizar(dt);
          if (fin) {
            tarea.resultado = e.resultado;
            if (z.ui === e) z.ui = null;
          }
          return fin;
        },
      };
      return tarea;
    }
    narrar(texto, dur) {
      const z = this;
      const n = { texto, t: 0, dur: dur || U.tiempoLectura(texto), fin: false };
      z.narracion = n;
      return {
        actualizar(dt) {
          n.t += dt;
          if (n.t > 0.6 && IH.entrada.presionado('aceptar')) n.t = Math.max(n.t, n.dur);
          if (n.t >= n.dur + 0.8) {
            if (z.narracion === n) z.narracion = null;
            return true;
          }
          return false;
        },
      };
    }
    titulo(texto, sub, dur = 5) {
      this.titulos.push({ texto, sub, t: 0, dur });
    }
    objetivo(texto) {
      if (texto && texto !== this.textoObjetivo) {
        IH.audio.estribillo('mision');
      }
      this.textoObjetivo = texto;
      this.tObjetivo = 0;
      IH.partida.objetivo = texto;
    }
    cine(activo) {
      this.cineObj = activo ? 1 : 0;
      this.bloqueoJugador = activo;
      if (activo) {
        this.jugador.vx = 0;
        if (this.jugador.estado !== 'muerto') {
          this.jugador.cambiarEstado('escena');
          this.jugador.objetivoX = null;
        }
      } else if (this.jugador.estado === 'escena') this.jugador.soltar();
    }
    fundido(a, dur = 1, color = '#000') {
      const z = this;
      const a0 = z.fundidoA;
      z.fundidoColor = color;
      return IH.interpolar(dur, (k) => (z.fundidoA = U.lerp(a0, a, k)), U.suave);
    }
    camaraA(x, dur = 1.5, y) {
      const z = this;
      const x0 = z.cam.x, y0 = z.cam.y;
      const xd = U.clamp(x - IH.ANCHO / 2, 0, Math.max(0, z.ancho - IH.ANCHO));
      z.cam.objetivo = { x: x0, y: y0 };
      return IH.interpolar(dur, (k) => {
        z.cam.objetivo.x = U.lerp(x0, xd, k);
        if (y != null) z.cam.objetivo.y = U.lerp(y0, y, k);
      });
    }
    camaraSeguir() {
      this.cam.objetivo = null;
    }
    mover(id, x, opc) {
      const e = typeof id === 'string' ? (id === 'yusuf' ? this.jugador : this.buscar(id)) : id;
      if (!e) return null;
      return e.irA(x, opc);
    }
    mirar(id, dir) {
      const e = typeof id === 'string' ? (id === 'yusuf' ? this.jugador : this.buscar(id)) : id;
      if (!e) return;
      if (typeof dir === 'object') e.dir = Math.sign(dir.x - e.x) || e.dir;
      else e.dir = dir;
      if (e.dirBase !== undefined) e.dirBase = e.dir;
    }
    anim(id, a) {
      const e = typeof id === 'string' ? (id === 'yusuf' ? this.jugador : this.buscar(id)) : id;
      if (!e) return;
      if (e === this.jugador) {
        e.animForzada = a;
        if (a) e.poner(a, true);
      } else {
        e.animForzada = a;
        if (a) e.poner(a, true);
      }
    }
    ir(zona, entrada, opc = {}) {
      IH.partida.vida = this.jugador.vida;
      IH.cambiarEscena('zona', Object.assign({ zona, entrada }, opc), { fundido: opc.fundido != null ? opc.fundido : 0.8 });
      return { actualizar: () => false };
    }
    cinematica(id, siguiente) {
      IH.partida.vida = this.jugador.vida;
      IH.cambiarEscena('cinematica', { id, siguiente }, { fundido: 1.2 });
      return { actualizar: () => false };
    }
    sacudir(t) {
      if (IH.ajustes && IH.ajustes.sacudida === false) t *= 0.25;
      this.cam.sacudida = Math.min(1, this.cam.sacudida + t);
    }
    bocadillo(ent, texto, dur) {
      this.bocadillos = this.bocadillos.filter((b) => b.ent !== ent);
      this.bocadillos.push({ ent, texto, t: 0, dur: dur || Math.max(2.5, texto.length * 0.07) });
    }
    textoFlotante(texto, x, y, color) {
      this.textos.push({ texto, x, y, t: 0, color: color || '#fff4dc' });
    }
    soltarMoneda() {}
    // Oleada de enemigos: devuelve una tarea que termina cuando mueren todos
    oleada(lista) {
      const es = lista.map((o) => this.enemigo(Object.assign({ alerta: true }, o)));
      return { enemigos: es, actualizar: () => es.every((e) => e.estado === 'muerto') };
    }
    // Tarjeta de presentación de un personaje (retrato grande con nombre y epíteto)
    presentar(opc) {
      const z = this;
      const p = Object.assign({ t: 0, dur: opc.dur || 6 }, opc);
      z.presentacion = p;
      return {
        actualizar(dt) {
          p.t += dt;
          if (p.t > 1.2 && IH.entrada.presionado('aceptar')) p.t = Math.max(p.t, p.dur);
          if (p.t >= p.dur + 1) {
            z.presentacion = null;
            return true;
          }
          return false;
        },
      };
    }
    arena(x0, x1) {
      this.limites = x0 == null ? null : [x0, x1];
    }
    vivos() {
      return this.enemigos.filter((e) => e.estado !== 'muerto');
    }

    // ------------------------------------------------------------------ combate
    pedirTurno(e, distancia) {
      const ahora = this.tiempo;
      this.atacando = this.atacando.filter((a) => a.estado === 'ataque' || a.estado === 'apuntar' || a.estado === 'disparar');
      if (this.atacando.includes(e)) return true;
      const max = distancia ? 3 : this.def.maxAtacantes || 2;
      if (this.atacando.length >= max) return false;
      if (!distancia && ahora - this.ultimoTurno < 0.45) return false;
      this.atacando.push(e);
      if (!distancia) this.ultimoTurno = ahora;
      return true;
    }
    finAtaqueEnemigo(e) {
      this.atacando = this.atacando.filter((a) => a !== e);
    }
    enemigoMasCercano(x, r) {
      let mejor = null, md = r;
      for (const e of this.enemigos) {
        if (e.estado === 'muerto') continue;
        const d = Math.abs(e.x - x);
        if (d < md) {
          md = d;
          mejor = e;
        }
      }
      return mejor;
    }
    aplicarGolpe(atacante, g, golpeados) {
      const caja = IH.cajaMundo(atacante, g.caja);
      if (g.dueno === 'jugador') {
        for (const e of this.enemigos) {
          if (golpeados.has(e) || e.estado === 'muerto') continue;
          if (IH.solapan(caja, e.caja)) {
            golpeados.add(e);
            e.recibirGolpe(g, atacante);
          }
        }
        // objetos golpeables y rompibles
        for (const o of this.entidades) {
          if (!(o instanceof IH.Objeto) || golpeados.has(o)) continue;
          if (!(o.def.rompible || o.def.golpeable) || o.roto) continue;
          if (IH.solapan(caja, { x: o.x - o.w / 2, y: o.y - o.h, w: o.w, h: o.h })) {
            golpeados.add(o);
            if (o.def.rompible) o.def.romper(o, this);
            if (o.def.golpeable) {
              o.tambaleo = 1;
              o.flash = 0.12;
              IH.audio.sfx('madera', { x: o.x });
              this.particulas.emitir('astilla', o.x, o.y - 30, 3, { color: '#c8b07a' });
              IH.pararGolpe(0.04);
              if (o.alGolpe) o.alGolpe(o, g);
            }
          }
        }
      } else {
        const J = this.jugador;
        if (!golpeados.has(J) && J.estado !== 'muerto' && IH.solapan(caja, J.caja)) {
          golpeados.add(J);
          const r = J.recibirGolpe(g, atacante);
          if (this.alResultadoGolpe) this.alResultadoGolpe(r, atacante, g);
          if (r === 'parada' && atacante.aturdir) {
            atacante.aturdir(atacante.def && atacante.def.jefe ? 1.0 : 1.4);
            atacante.vx = -atacante.dir * 80;
          }
          if (r === 'esquiva') golpeados.delete(J);
        }
      }
    }
    alMorirJugador() {
      this.muerte = { t: 0 };
      IH.audio.musica(null, { fundido: 2 });
      IH.audio.estribillo('derrota');
      if (IH.partida) IH.partida.estadisticas.muertes = (IH.partida.estadisticas.muertes || 0) + 1;
    }
    reintentar() {
      const P = IH.partida;
      P.vida = null;
      P.agua = P.aguaMax;
      const pc = P.puntoControl || { zona: this.id, entrada: this.params.entrada };
      IH.cambiarEscena('zona', { zona: pc.zona, entrada: pc.entrada, curar: true, sinTitulo: true }, { fundido: 1 });
    }
    puntoControl(entrada) {
      IH.partida.puntoControl = { zona: this.id, entrada };
      IH.partida.agua = IH.partida.aguaMax;
      IH.partida.vida = this.jugador.vida;
      IH.guardar();
    }

    // ------------------------------------------------------------------ actualización
    actualizar(dt, dtReal) {
      if (this.pausa) {
        this.pausa.actualizar(dtReal);
        return;
      }
      if (IH.entrada.presionado('pausa') && !this.muerte && !IH.transicion && IH.MenuPausa) {
        this.pausa = new IH.MenuPausa(this);
        IH.audio.sfx('ui', { frec: 520 });
        return;
      }
      this.tiempo += dt;
      // guiones
      for (const g of this.guiones) g.actualizar(dt);
      this.guiones = this.guiones.filter((g) => !g.fin);
      if (this.guionActivo && this.guionActivo.fin) {
        this.guionActivo = null;
      }
      // entidades
      for (const e of this.entidades) e.actualizar(dt);
      this.entidades = this.entidades.filter((e) => !e.borrar);
      this.enemigos = this.enemigos.filter((e) => !e.borrar);
      this.particulas.actualizar(dt, this.suelo);
      // disparadores por posición
      const J = this.jugador;
      for (const dsp of this.def.disparadores || []) {
        if (this.disparados.has(dsp.id) && dsp.una !== false) continue;
        if (dsp.si && !dsp.si(this)) continue;
        if (J.x >= dsp.x && J.x <= dsp.x + (dsp.w || 20) && !this.guionActivo) {
          this.disparados.add(dsp.id);
          if (dsp.guion) this.ejecutar(dsp.guion(this), dsp.id, dsp.principal !== false);
        }
      }
      // salidas
      if (!this.guionActivo && J.estado === 'normal') {
        for (const s of this.def.salidas || []) {
          const dentro = s.lado === 'izq' ? J.x <= s.x + 2 : s.lado === 'der' ? J.x >= s.x - 2 : J.x >= s.x && J.x <= s.x + s.w;
          if (!dentro) continue;
          if (s.pulsar && !IH.entrada.presionado('interactuar')) continue;
          if (s.si && !s.si(this)) {
            if (s.bloqueo && !this._avisoSalida) {
              this._avisoSalida = 1.5;
              this.bocadillo(J, typeof s.bloqueo === 'function' ? s.bloqueo(this) : s.bloqueo);
              J.vx = 0;
              J.x += s.lado === 'izq' ? 4 : s.lado === 'der' ? -4 : 0;
            }
            continue;
          }
          if (s.guion) {
            this.ejecutar(s.guion(this), 'salida');
          } else this.ir(s.a, s.entrada);
          break;
        }
      }
      if (this._avisoSalida) {
        this._avisoSalida -= dt;
        if (this._avisoSalida <= 0) this._avisoSalida = 0;
      }
      // interacción
      this.interactuableCerca = null;
      if (!this.guionActivo && J.estado === 'normal' && J.enSuelo && !this.bloqueoJugador) {
        let mejor = null, md = 30;
        for (const e of this.entidades) {
          if (e === J || !e.interactuable || !e.interactuable()) continue;
          const d = Math.abs(e.x - J.x);
          const radio = e.radioInteraccion || 28;
          if (d < Math.min(md, radio) && Math.abs(e.y - J.y) < 40) {
            md = d;
            mejor = e;
          }
        }
        this.interactuableCerca = mejor;
        if (mejor && IH.entrada.presionado('interactuar')) {
          IH.entrada.consumir('interactuar');
          IH.entrada.consumir('arriba');
          this.interactuar(mejor);
        }
      }
      // muerte del jugador
      if (this.muerte) {
        this.muerte.t += dtReal;
        if (this.muerte.t > 2.6 && (IH.entrada.presionado('aceptar') || this.muerte.t > 9)) {
          this.muerte = null;
          this.reintentar();
        }
      }
      this.actualizarCamara(dt);
      // interfaz
      this.cineK = U.aproximar(this.cineK, this.cineObj, dt * 1.6);
      for (const t of this.titulos) t.t += dt;
      this.titulos = this.titulos.filter((t) => t.t < t.dur + 1.2);
      for (const b of this.bocadillos) b.t += dt;
      this.bocadillos = this.bocadillos.filter((b) => b.t < b.dur);
      for (const t of this.textos) {
        t.t += dt;
        t.y -= 22 * dt;
      }
      this.textos = this.textos.filter((t) => t.t < 1.1);
      if (this.tObjetivo != null) this.tObjetivo += dt;
      if (this.def.actualizar) this.def.actualizar(this, dt);
      IH.audio.oyenteX = this.cam.x + IH.ANCHO / 2;
      // luces dinámicas
      for (const l of this.luces) if (l.ent && l.ent.borrar) l.muerta = true;
      this.luces = this.luces.filter((l) => !l.muerta);
    }

    interactuar(e) {
      const J = this.jugador;
      J.vx = 0;
      if (e instanceof IH.PNJ) {
        const z = this;
        J.dir = Math.sign(e.x - J.x) || J.dir;
        e.dir = -J.dir;
        e.hablando = true;
        const r = typeof e.alHablar === 'function' ? e.alHablar(this, e) : e.alHablar;
        const gen = (function* () {
          if (Array.isArray(r)) yield z.dialogo(r);
          else if (r && typeof r.next === 'function') yield r;
          e.hablando = false;
        })();
        this.ejecutar(gen, 'hablar:' + (e.id || e.nombre));
      } else if (e.alInteractuar) {
        const r = e.alInteractuar(this, e);
        if (r && typeof r.next === 'function') this.ejecutar(r, 'interactuar:' + e.tipo);
      }
    }

    actualizarCamara(dt) {
      const c = this.cam;
      const J = this.jugador;
      let tx, ty = this.def.camY || 0;
      if (c.objetivo) {
        tx = c.objetivo.x;
        ty = c.objetivo.y != null ? c.objetivo.y : ty;
        c.x = tx;
        c.y = ty;
      } else {
        c.mirada = U.aproximar(c.mirada, J.dir * 28, dt * 40);
        tx = J.x - IH.ANCHO / 2 + c.mirada;
        if (this.def.camaraVertical) {
          ty = U.clamp(J.y - 230, this.def.camaraVertical[0], this.def.camaraVertical[1]);
        }
        const lim0 = this.limites && this.def.camaraArena ? this.limites[0] : 0;
        const lim1 = this.limites && this.def.camaraArena ? this.limites[1] : this.ancho;
        tx = U.clamp(tx, lim0, Math.max(lim0, lim1 - IH.ANCHO));
        c.x += (tx - c.x) * Math.min(1, dt * c.vel);
        c.y += (ty - c.y) * Math.min(1, dt * 4);
      }
      c.x = U.clamp(c.x, 0, Math.max(0, this.ancho - IH.ANCHO));
      c.sacudida = Math.max(0, c.sacudida - dt * 1.6);
    }

    // ------------------------------------------------------------------ dibujo
    dibujar(ctx) {
      const c = this.cam;
      const s = c.sacudida * c.sacudida;
      const t = IH.tiempo.total;
      const ox = s * 7 * (U.ruido(t * 30, 1) * 2 - 1);
      const oy = s * 5 * (U.ruido(t * 30, 2) * 2 - 1);
      const camX = c.x + ox, camY = c.y + oy;
      const cx = Math.floor(camX), cy = Math.floor(camY);
      IH.subpixel.x = camX - cx;
      IH.subpixel.y = camY - cy;
      const M = IH.MARGEN;
      // fondo
      for (const capa of this.capas) {
        if (capa.delante) continue;
        const px = -Math.round(camX * capa.factor);
        const py = -Math.round(camY * (capa.fy != null ? capa.fy : capa.factor));
        ctx.drawImage(capa.lz.c, px, py);
      }
      if (this.def.dibujarFondo) this.def.dibujarFondo(this, ctx, cx, cy);
      // entidades (por capas)
      const lista = this.entidades.slice().sort((a, b) => a.capa - b.capa);
      for (const e of lista) if (!(e instanceof IH.Objeto)) e.dibujarSombra(ctx, cx, cy);
      for (const e of lista) {
        if (e.x < cx - 140 || e.x > cx + IH.ANCHO + 140) {
          if (!(e.def && e.def.sinRecorte)) continue;
        }
        e.dibujar(ctx, cx, cy);
      }
      this.particulas.dibujar(ctx, cx, cy, false);
      // iluminación
      if (this.ambiente) this.dibujarLuces(ctx, cx, cy);
      this.particulas.dibujar(ctx, cx, cy, true);
      if (this.def.dibujarDelante) this.def.dibujarDelante(this, ctx, cx, cy);
      // primer plano
      for (const capa of this.capas) {
        if (!capa.delante) continue;
        ctx.drawImage(capa.lz.c, -Math.round(camX * capa.factor), -Math.round(camY * (capa.fy != null ? capa.fy : 1)));
      }
      // tinte de color (hora del día)
      if (this.def.tinte) {
        ctx.globalCompositeOperation = this.def.tinte.modo || 'soft-light';
        ctx.globalAlpha = this.def.tinte.a;
        ctx.fillStyle = this.def.tinte.color;
        ctx.fillRect(-M, -M, IH.ANCHO + M * 2, IH.ALTO + M * 2);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    dibujarLuces(ctx, cx, cy) {
      const L = this.lucesMapa;
      const x = L.x;
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = this.ambiente;
      x.fillRect(0, 0, L.w, L.h);
      x.globalCompositeOperation = 'lighter';
      const t = IH.tiempo.total;
      for (const l of this.luces) {
        if (!isFinite(l.x) || !isFinite(l.y) || !(l.r > 0)) continue;
        const f = l.factor || 1;
        const lx = l.x - cx * f + 2, ly = l.y - cy + 2;
        const parp = l.parpadeo ? 1 - l.parpadeo * U.ruido(t * 8 + l.x * 0.1, 7) : 1;
        const r = Math.round(l.r * (0.95 + 0.05 * parp));
        if (lx < -r || lx > IH.ANCHO + r) continue;
        x.globalAlpha = U.clamp((l.i == null ? 1 : l.i) * parp, 0, 1);
        x.drawImage(IH.G.brillo(r, l.color, 1), Math.round(lx - r), Math.round(ly - r));
      }
      x.globalAlpha = 1;
      x.globalCompositeOperation = 'source-over';
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(L.c, -2, -2);
      // resplandor aditivo suave
      ctx.globalCompositeOperation = 'lighter';
      for (const l of this.luces) {
        if (!l.brillo && !l.parpadeo) continue;
        const f = l.factor || 1;
        const lx = l.x - cx * f, ly = l.y - cy;
        const r = Math.round(l.r * 0.35);
        ctx.globalAlpha = 0.18 * (l.i || 1);
        ctx.drawImage(IH.G.brillo(r, l.color, 1), Math.round(lx - r), Math.round(ly - r));
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // ------------------------------------------------------------------ interfaz
    aUI(x, y) {
      return [(x - this.cam.x) * (IH.UIW / IH.ANCHO), (y - this.cam.y) * (IH.UIH / IH.ALTO)];
    }

    dibujarUI(ctx) {
      const Tx = IH.T;
      if (this.def.vineta !== false) Tx.vineta(ctx, this.def.vineta || 0.45);
      const ocultarHud = this.cineK > 0.01 || !this.hud;
      // bocadillos
      for (const b of this.bocadillos) {
        const [ux, uy] = this.aUI(b.ent.x, b.ent.y - (b.ent.h || 46) - 10);
        const a = Math.min(1, b.t * 5, (b.dur - b.t) * 3);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = Tx.fuente(30, { cursiva: true });
        const w = Math.min(560, ctx.measureText(b.texto).width + 40);
        const h = Tx.medirAlto(ctx, b.texto, w - 40, 30, { cursiva: true, interlineado: 1.25 }) + 22;
        ctx.fillStyle = 'rgba(16,10,8,0.78)';
        ctx.beginPath();
        ctx.roundRect(ux - w / 2, uy - h - 14, w, h, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ux - 10, uy - 15);
        ctx.lineTo(ux, uy - 2);
        ctx.lineTo(ux + 10, uy - 15);
        ctx.fill();
        Tx.parrafo(ctx, b.texto, ux, uy - h - 6, { tam: 30, ancho: w - 40, alinear: 'center', cursiva: true, interlineado: 1.25, sombra: false });
        ctx.restore();
      }
      // textos flotantes
      for (const t of this.textos) {
        const [ux, uy] = this.aUI(t.x, t.y);
        ctx.save();
        ctx.globalAlpha = Math.min(1, (1.1 - t.t) * 3);
        Tx.linea(ctx, t.texto, ux, uy, { tam: 40, alinear: 'center', peso: 700, familia: Tx.TITULO, color: t.color, contorno: '#1a1010', grosorContorno: 7, sombra: false });
        ctx.restore();
      }
      // aviso de interacción
      const ic = this.interactuableCerca;
      if (ic && !ocultarHud && !this.ui) {
        const [ux, uy] = this.aUI(ic.x, ic.y - (ic.h || 40) - 18);
        const k = (Math.sin(IH.tiempo.total * 4) + 1) / 2;
        Tx.aviso(ctx, 'interactuar', ic.etiqueta || 'Interactuar', ux, uy - 10 - k * 6, { tam: 30 });
      }
      // marcas (! y ?) sobre personajes
      for (const e of this.entidades) {
        if (!e.marca || !e.visible) continue;
        const [ux, uy] = this.aUI(e.x, e.y - (e.h || 46) - 14);
        const k = Math.sin(IH.tiempo.total * 3) * 6;
        if (ic === e) continue;
        Tx.linea(ctx, e.marca, ux, uy + k - 30, { tam: 54, alinear: 'center', peso: 700, familia: Tx.TITULO, color: Tx.COLORES.oroClaro, contorno: '#1a1010', grosorContorno: 8 });
      }
      if (!ocultarHud) this.dibujarHUD(ctx);
      // jefe
      if (this.jefe && this.jefe.estado !== 'muerto' && !ocultarHud) {
        const w = 900, x0 = (IH.UIW - w) / 2, y0 = IH.UIH - 110;
        Tx.linea(ctx, this.jefe.nombre || 'Enemigo', IH.UIW / 2, y0 - 16, { tam: 38, alinear: 'center', familia: Tx.TITULO, peso: 600, color: Tx.COLORES.oroClaro });
        ctx.fillStyle = 'rgba(10,6,4,0.85)';
        ctx.fillRect(x0 - 4, y0 - 4, w + 8, 30);
        this._vidaJefe = U.lerp(this._vidaJefe == null ? 1 : this._vidaJefe, this.jefe.vida / this.jefe.vidaMax, 0.08);
        ctx.fillStyle = '#e8d8b0';
        ctx.fillRect(x0, y0, w * this._vidaJefe, 22);
        ctx.fillStyle = '#9a1e1e';
        ctx.fillRect(x0, y0, w * (this.jefe.vida / this.jefe.vidaMax), 22);
        ctx.strokeStyle = Tx.COLORES.oro;
        ctx.lineWidth = 3;
        ctx.strokeRect(x0 - 4, y0 - 4, w + 8, 30);
      }
      // narración en juego
      if (this.narracion) {
        const n = this.narracion;
        const a = Math.min(1, n.t * 2, (n.dur + 0.8 - n.t) * 2);
        ctx.save();
        ctx.globalAlpha = a;
        const g = ctx.createLinearGradient(0, 0, 0, 260);
        g.addColorStop(0, 'rgba(0,0,0,0.75)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, IH.UIW, 260);
        Tx.parrafo(ctx, n.texto, IH.UIW / 2, 60 + this.cineK * 70, { tam: 44, ancho: 1400, alinear: 'center', cursiva: true, visibles: Math.floor(n.t * 40) });
        ctx.restore();
      }
      // títulos de zona
      for (const t of this.titulos) {
        const a = Math.min(1, t.t / 1.2, (t.dur + 1.2 - t.t) / 1.2);
        if (a <= 0) continue;
        ctx.save();
        ctx.globalAlpha = a;
        const y = IH.UIH * 0.3;
        const g = ctx.createLinearGradient(0, y - 120, 0, y + 120);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.5, 'rgba(0,0,0,0.55)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 120, IH.UIW, 240);
        Tx.linea(ctx, t.texto, IH.UIW / 2, y, { tam: 76, alinear: 'center', familia: Tx.TITULO, peso: 600, color: Tx.COLORES.oroClaro, espaciado: 4 });
        ctx.fillStyle = Tx.COLORES.oro;
        const ancho = 300 * Math.min(1, t.t);
        ctx.fillRect(IH.UIW / 2 - ancho, y + 26, ancho * 2, 2);
        Tx.estrella(ctx, IH.UIW / 2, y + 27, 10, Tx.COLORES.oroClaro);
        if (t.sub) Tx.linea(ctx, t.sub, IH.UIW / 2, y + 80, { tam: 40, alinear: 'center', cursiva: true, color: Tx.COLORES.texto });
        ctx.restore();
      }
      Tx.barrasCine(ctx, this.cineK);
      if (this.presentacion) {
        const p = this.presentacion;
        const a = Math.min(1, p.t / 0.8, (p.dur + 1 - p.t) / 0.8);
        ctx.save();
        ctx.globalAlpha = Math.max(0, a) * 0.85;
        ctx.fillStyle = '#0a0504';
        ctx.fillRect(0, 0, IH.UIW, IH.UIH);
        ctx.globalAlpha = Math.max(0, a);
        const k = U.salida(Math.min(1, p.t / 1.2));
        IH.Retratos.dibujar(ctx, p.retrato, 300 - (1 - k) * 60, 220, 540, { emocion: p.emocion || 'normal', fondo1: '#4a1a14', fondo2: '#140808' });
        if (p.arabe) Tx.linea(ctx, p.arabe, 960 + (1 - k) * 60, 380, { tam: 80, familia: Tx.ARABE, color: Tx.COLORES.oro });
        Tx.linea(ctx, p.nombre, 960 + (1 - k) * 60, 480, { tam: 92, familia: Tx.TITULO, peso: 600, color: Tx.COLORES.oroClaro, espaciado: 4 });
        ctx.fillStyle = Tx.COLORES.oro;
        ctx.fillRect(960, 510, 640 * k, 3);
        Tx.parrafo(ctx, p.epiteto, 960, 530, { tam: 40, ancho: 820, cursiva: true });
        ctx.restore();
      }
      if (this.ui) this.ui.dibujar(ctx);
      // fundido de guion
      if (this.fundidoA > 0) {
        ctx.fillStyle = this.fundidoColor;
        ctx.globalAlpha = this.fundidoA;
        ctx.fillRect(-10, -10, IH.UIW + 20, IH.UIH + 20);
        ctx.globalAlpha = 1;
      }
      if (this.def.dibujarUI) this.def.dibujarUI(this, ctx);
      // pantalla de muerte
      if (this.muerte) {
        const k = Math.min(1, this.muerte.t / 2);
        ctx.fillStyle = `rgba(30,4,4,${0.65 * k})`;
        ctx.fillRect(0, 0, IH.UIW, IH.UIH);
        ctx.globalAlpha = k;
        Tx.linea(ctx, 'Has caído', IH.UIW / 2, IH.UIH * 0.44, { tam: 110, alinear: 'center', familia: Tx.TITULO, color: '#d8b07a', espaciado: 6 });
        Tx.linea(ctx, '«El acero se templa en el fuego, no en el descanso.»', IH.UIW / 2, IH.UIH * 0.44 + 90, { tam: 40, alinear: 'center', cursiva: true, color: Tx.COLORES.tenue });
        if (this.muerte.t > 2.6) Tx.aviso(ctx, 'aceptar', 'Levantarse', IH.UIW / 2, IH.UIH * 0.66, { tam: 36 });
        ctx.globalAlpha = 1;
      }
      if (this.pausa) this.pausa.dibujar(ctx);
    }

    dibujarHUD(ctx) {
      const Tx = IH.T;
      const J = this.jugador;
      const P = IH.partida;
      if (!this.tranquila || J.vida < J.vidaMax) {
        const x0 = 60, y0 = 54;
        // medallón
        Tx.estrella(ctx, x0 + 40, y0 + 40, 46, Tx.COLORES.oro);
        Tx.estrella(ctx, x0 + 40, y0 + 40, 38, '#2a1a10');
        if (IH.Retratos) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x0 + 40, y0 + 40, 30, 0, Math.PI * 2);
          ctx.clip();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(IH.Retratos.obtener('yusuf'), x0 + 4, y0 + 2, 76, 76);
          ctx.restore();
        }
        // vida
        const w = 420;
        this._vidaVis = U.lerp(this._vidaVis == null ? J.vida : this._vidaVis, J.vida, 0.06);
        ctx.fillStyle = 'rgba(10,6,4,0.8)';
        ctx.fillRect(x0 + 92, y0 + 12, w + 8, 30);
        ctx.fillStyle = '#e8d8b0';
        ctx.fillRect(x0 + 96, y0 + 16, (w * this._vidaVis) / J.vidaMax, 22);
        const g = ctx.createLinearGradient(0, y0 + 16, 0, y0 + 38);
        g.addColorStop(0, '#d8483a');
        g.addColorStop(1, '#8a1a1a');
        ctx.fillStyle = g;
        ctx.fillRect(x0 + 96, y0 + 16, (w * J.vida) / J.vidaMax, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(x0 + 96, y0 + 17, (w * J.vida) / J.vidaMax, 4);
        ctx.strokeStyle = Tx.COLORES.oro;
        ctx.lineWidth = 3;
        ctx.strokeRect(x0 + 92, y0 + 12, w + 8, 30);
        // aguante
        if (J.armado) {
          ctx.fillStyle = 'rgba(10,6,4,0.8)';
          ctx.fillRect(x0 + 92, y0 + 48, w * 0.8 + 8, 16);
          ctx.fillStyle = J.aguante < 20 ? '#a86a2a' : '#d4a73a';
          ctx.fillRect(x0 + 96, y0 + 51, (w * 0.8 * J.aguante) / J.aguanteMax, 10);
          ctx.strokeStyle = Tx.COLORES.borde;
          ctx.lineWidth = 2;
          ctx.strokeRect(x0 + 92, y0 + 48, w * 0.8 + 8, 16);
        }
        // odre de agua
        if (P.aguaMax > 0 && !this.sinCombate) {
          for (let i = 0; i < P.aguaMax; i++) {
            const lleno = i < P.agua;
            const ox = x0 + 100 + i * 40, oy = y0 + 92;
            ctx.fillStyle = lleno ? '#7a4a2a' : 'rgba(60,40,30,0.6)';
            ctx.beginPath();
            ctx.ellipse(ox, oy, 13, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(ox - 4, oy - 22, 8, 8);
            if (lleno) {
              ctx.fillStyle = '#6aa8d8';
              ctx.beginPath();
              ctx.ellipse(ox, oy + 3, 7, 8, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.strokeStyle = Tx.COLORES.borde;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(ox, oy, 13, 16, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          if (P.agua > 0 && J.vida < J.vidaMax * 0.5) {
            Tx.tecla(ctx, 'curar', x0 + 96 + P.aguaMax * 40, y0 + 92, 32, { alfa: 0.6 + 0.4 * Math.sin(IH.tiempo.total * 4) });
          }
        }
      }
      // objetivo
      if (this.textoObjetivo) {
        const k = this.tObjetivo < 6 ? 1 : 0.55;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.font = Tx.fuente(32, {});
        const w = ctx.measureText(this.textoObjetivo).width;
        const x = IH.UIW - 70 - w, y = 72;
        ctx.fillStyle = 'rgba(12,8,6,0.55)';
        ctx.fillRect(x - 70, y - 40, w + 100, 64);
        Tx.estrella(ctx, x - 36, y - 9, 12, Tx.COLORES.oro);
        Tx.linea(ctx, this.textoObjetivo, x, y + 2, { tam: 32 });
        if (this.tObjetivo < 2.5) {
          ctx.globalAlpha = (1 - this.tObjetivo / 2.5) * 0.8;
          Tx.linea(ctx, 'Nuevo objetivo', x, y - 44, { tam: 26, color: Tx.COLORES.oroClaro, familia: Tx.TITULO });
        }
        ctx.restore();
      }
    }
  }

  IH.escenas.zona = Zona;
  IH.Zona = Zona;
})();
