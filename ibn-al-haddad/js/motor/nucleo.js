/* Ibn al-Haddad — núcleo del motor.
 *
 * - Mundo interno de 640×360 (pixel art) con 2 px de margen para el desplazamiento subpíxel.
 * - Escalado "nítido": ampliación entera sin suavizado y reducción final suavizada,
 *   así el pixel art se ve limpio en cualquier resolución (1080p, 1440p, Steam Deck…).
 * - Capa de interfaz en alta resolución con un espacio virtual de 1920×1080.
 * - Bucle de lógica fijo a 60 Hz; escenas con fundidos.
 */
'use strict';
(function () {
  const IH = (window.IH = window.IH || {});

  IH.ANCHO = 640;
  IH.ALTO = 360;
  IH.MARGEN = 2;
  IH.UIW = 1920;
  IH.UIH = 1080;
  IH.PASO = 1 / 60;
  IH.VERSION = '0.1.0';
  IH.DEPURAR = /depurar/.test(location.hash);

  // ------------------------------------------------------------------ utilidades
  const U = (IH.U = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    inv: (a, b, v) => (b === a ? 0 : (v - a) / (b - a)),
    suave: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t)),
    entradaSalida: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    salida: (t) => 1 - Math.pow(1 - U.clamp(t, 0, 1), 3),
    entrada: (t) => t * t * t,
    rebote: (t) => {
      const c = 1.70158 + 1;
      return 1 + c * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
    },
    aproximar: (v, obj, paso) => (v < obj ? Math.min(v + paso, obj) : Math.max(v - paso, obj)),
    signo: (v) => (v < 0 ? -1 : v > 0 ? 1 : 0),
    angLerp(a, b, t) {
      let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      return a + d * t;
    },
    // Hash entero → [0,1)
    hash(n) {
      n = (n | 0) ^ 0x9e3779b9;
      n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
      n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
      n ^= n >>> 16;
      return (n >>> 0) / 4294967296;
    },
    hash2(x, y, s = 0) {
      return U.hash((x | 0) * 374761393 + (y | 0) * 668265263 + s * 2246822519);
    },
    // Ruido de valor 1D suave
    ruido(x, s = 0) {
      const i = Math.floor(x);
      const f = x - i;
      const a = U.hash(i * 7919 + s * 104729);
      const b = U.hash((i + 1) * 7919 + s * 104729);
      return U.lerp(a, b, f * f * (3 - 2 * f));
    },
    // Ruido fractal 1D
    fbm(x, octavas = 4, s = 0) {
      let v = 0, amp = 0.5, fr = 1, tot = 0;
      for (let o = 0; o < octavas; o++) {
        v += U.ruido(x * fr, s + o * 31) * amp;
        tot += amp;
        amp *= 0.5;
        fr *= 2;
      }
      return v / tot;
    },
    ruido2(x, y, s = 0) {
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = x - ix, fy = y - iy;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const a = U.hash2(ix, iy, s), b = U.hash2(ix + 1, iy, s);
      const c = U.hash2(ix, iy + 1, s), d = U.hash2(ix + 1, iy + 1, s);
      return U.lerp(U.lerp(a, b, sx), U.lerp(c, d, sx), sy);
    },
    hexARgb(h) {
      if (typeof h !== 'string') return h;
      h = h.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    },
    rgbAHex(r, g, b) {
      const c = (v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
      return '#' + c(r) + c(g) + c(b);
    },
    mezclar(c1, c2, t) {
      const a = U.hexARgb(c1), b = U.hexARgb(c2);
      return U.rgbAHex(U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t));
    },
    // Aclara (t>0) u oscurece (t<0) un color
    tono(c, t) {
      return t >= 0 ? U.mezclar(c, '#fff4dc', t) : U.mezclar(c, '#120a10', -t);
    },
    rgba(c, a) {
      const v = U.hexARgb(c);
      return `rgba(${v[0]},${v[1]},${v[2]},${a})`;
    },
    // Tiempo de lectura cómodo para un texto (segundos)
    tiempoLectura(txt, factor = 1) {
      return (3.2 + txt.length * 0.062) * factor;
    },
  });

  // Generador pseudoaleatorio con semilla (mulberry32)
  IH.Azar = class {
    constructor(semilla = 1) {
      this.s = semilla >>> 0 || 1;
    }
    sig() {
      let t = (this.s += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    rango(a, b) {
      return a + (b - a) * this.sig();
    }
    entero(a, b) {
      return Math.floor(this.rango(a, b + 1));
    }
    elegir(arr) {
      return arr[Math.floor(this.sig() * arr.length)];
    }
    prob(p) {
      return this.sig() < p;
    }
  };
  IH.azar = new IH.Azar((Date.now() & 0xffffff) + 7);

  // ------------------------------------------------------------------ lienzos
  IH.lienzo = function (w, h, lectura) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    const x = c.getContext('2d', lectura ? { willReadFrequently: true } : undefined);
    x.imageSmoothingEnabled = false;
    return { c, x, w: c.width, h: c.height };
  };

  // ------------------------------------------------------------------ pantalla
  const pantalla = document.getElementById('pantalla');
  const cp = pantalla.getContext('2d', { alpha: false });
  IH.pantalla = pantalla;
  IH.cp = cp;
  IH.mundo = IH.lienzo(IH.ANCHO + IH.MARGEN * 2, IH.ALTO + IH.MARGEN * 2);
  IH.ctx = IH.mundo.x;
  IH.inter = IH.lienzo(1, 1);
  IH.subpixel = { x: 0, y: 0 };
  IH.vista = { esc: 1, w: 640, h: 360, x: 0, y: 0, k: 1 };

  function redimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = window.innerWidth, h = window.innerHeight;
    pantalla.width = Math.round(w * dpr);
    pantalla.height = Math.round(h * dpr);
    pantalla.style.width = w + 'px';
    pantalla.style.height = h + 'px';
    let esc = Math.min(pantalla.width / IH.ANCHO, pantalla.height / IH.ALTO);
    if (IH.ajustes && IH.ajustes.pixelPerfecto && esc >= 1) esc = Math.floor(esc);
    const v = IH.vista;
    v.esc = esc;
    v.w = Math.round(IH.ANCHO * esc);
    v.h = Math.round(IH.ALTO * esc);
    v.x = Math.floor((pantalla.width - v.w) / 2);
    v.y = Math.floor((pantalla.height - v.h) / 2);
    v.k = U.clamp(Math.ceil(esc - 0.001), 1, 6);
    v.uiEsc = v.w / IH.UIW;
    const iw = (IH.ANCHO + IH.MARGEN * 2) * v.k, ih = (IH.ALTO + IH.MARGEN * 2) * v.k;
    if (IH.inter.c.width !== iw || IH.inter.c.height !== ih) {
      IH.inter.c.width = iw;
      IH.inter.c.height = ih;
      IH.inter.x.imageSmoothingEnabled = false;
    }
  }
  IH.redimensionar = redimensionar;
  window.addEventListener('resize', redimensionar);

  // Vuelca el mundo de baja resolución a la pantalla
  function presentarMundo() {
    const v = IH.vista, M = IH.MARGEN;
    cp.setTransform(1, 0, 0, 1, 0, 0);
    cp.fillStyle = '#000';
    cp.fillRect(0, 0, pantalla.width, pantalla.height);
    const sx = U.clamp(IH.subpixel.x, 0, 0.999), sy = U.clamp(IH.subpixel.y, 0, 0.999);
    const ix = IH.inter.x;
    ix.imageSmoothingEnabled = false;
    ix.drawImage(IH.mundo.c, 0, 0, IH.inter.c.width, IH.inter.c.height);
    cp.imageSmoothingEnabled = true;
    cp.imageSmoothingQuality = 'high';
    cp.drawImage(
      IH.inter.c,
      (M + sx) * v.k, (M + sy) * v.k, IH.ANCHO * v.k, IH.ALTO * v.k,
      v.x, v.y, v.w, v.h
    );
  }

  // Prepara la transformación de la capa de interfaz (espacio 1920×1080)
  IH.prepararUI = function () {
    const v = IH.vista;
    cp.setTransform(v.uiEsc, 0, 0, v.uiEsc, v.x, v.y);
    cp.imageSmoothingEnabled = true;
    cp.globalAlpha = 1;
    cp.globalCompositeOperation = 'source-over';
  };

  // Prepara el contexto del mundo para dibujar en coordenadas de pantalla interna
  IH.prepararMundo = function () {
    const x = IH.ctx;
    x.setTransform(1, 0, 0, 1, IH.MARGEN, IH.MARGEN);
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
    x.imageSmoothingEnabled = false;
    x.filter = 'none';
  };

  // ------------------------------------------------------------------ tiempo
  IH.tiempo = {
    total: 0, // segundos reales desde el arranque
    juego: 0, // tiempo de juego escalado
    escala: 1, // cámara lenta
    escalaObj: 1,
    parada: 0, // congelación por impacto (hit-stop)
    frame: 0,
    fps: 60,
  };
  IH.camaraLenta = function (escala, dur) {
    IH.tiempo.escala = escala;
    IH.tiempo.lentaRestante = dur;
  };
  IH.pararGolpe = function (seg) {
    IH.tiempo.parada = Math.max(IH.tiempo.parada, seg);
  };

  // ------------------------------------------------------------------ escenas
  IH.escenas = {};
  IH.escena = null;
  IH.transicion = null;

  IH.cambiarEscena = function (nombre, params = {}, opc = {}) {
    const dur = opc.fundido != null ? opc.fundido : 0.7;
    const crear = () => {
      if (IH.escena && IH.escena.salir) IH.escena.salir();
      const Clase = IH.escenas[nombre];
      if (!Clase) throw new Error('Escena desconocida: ' + nombre);
      IH.escena = new Clase(params);
      IH.escena.nombre = nombre;
      if (IH.escena.entrar) IH.escena.entrar(params);
    };
    if (dur <= 0 || !IH.escena) {
      crear();
      IH.transicion = dur > 0 ? { fase: 'entrada', t: 0, dur, color: opc.color || '#000' } : null;
      return;
    }
    IH.transicion = { fase: 'salida', t: 0, dur, color: opc.color || '#000', crear };
  };

  function actualizarTransicion(dt) {
    const tr = IH.transicion;
    if (!tr) return;
    tr.t += dt;
    if (tr.fase === 'salida' && tr.t >= tr.dur) {
      tr.crear();
      tr.fase = 'negro';
      tr.t = 0;
    } else if (tr.fase === 'negro' && tr.t >= 0.25) {
      tr.fase = 'entrada';
      tr.t = 0;
    } else if (tr.fase === 'entrada' && tr.t >= tr.dur) {
      IH.transicion = null;
    }
  }

  function dibujarTransicion() {
    const tr = IH.transicion;
    if (!tr) return;
    let a = 1;
    if (tr.fase === 'salida') a = U.suave(tr.t / tr.dur);
    else if (tr.fase === 'entrada') a = 1 - U.suave(tr.t / tr.dur);
    cp.setTransform(1, 0, 0, 1, 0, 0);
    cp.globalAlpha = a;
    cp.fillStyle = tr.color;
    cp.fillRect(0, 0, pantalla.width, pantalla.height);
    cp.globalAlpha = 1;
  }

  IH.enTransicion = () => !!IH.transicion && IH.transicion.fase !== 'entrada';

  // ------------------------------------------------------------------ bucle
  let ultimo = 0, acum = 0, fpsAcum = 0, fpsCuenta = 0;
  const errores = [];
  IH.errores = errores;

  function actualizar(dt) {
    const T = IH.tiempo;
    T.total += dt;
    T.frame++;
    if (T.lentaRestante > 0) {
      T.lentaRestante -= dt;
      if (T.lentaRestante <= 0) T.escala = 1;
    }
    if (IH.entrada) IH.entrada.actualizar();
    if (IH.audio) IH.audio.actualizar(dt);
    actualizarTransicion(dt);
    if (!IH.escena) return;
    let dtJ = dt * T.escala;
    if (T.parada > 0) {
      T.parada -= dt;
      dtJ = 0;
    }
    T.juego += dtJ;
    IH.escena.actualizar(dtJ, dt);
  }

  function dibujar() {
    IH.prepararMundo();
    IH.subpixel.x = 0;
    IH.subpixel.y = 0;
    if (IH.escena && IH.escena.dibujar) IH.escena.dibujar(IH.ctx);
    presentarMundo();
    IH.prepararUI();
    if (IH.escena && IH.escena.dibujarUI) IH.escena.dibujarUI(cp);
    if (IH.notificaciones) IH.notificaciones.dibujar(cp);
    dibujarTransicion();
    if (IH.DEPURAR) {
      IH.prepararUI();
      cp.font = '28px monospace';
      cp.fillStyle = '#0f0';
      cp.textAlign = 'left';
      cp.fillText(IH.tiempo.fps + ' fps', 20, 40);
    }
  }

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    let dt = (ahora - ultimo) / 1000;
    ultimo = ahora;
    if (dt > 0.25) dt = 0.25;
    if (dt < 0) dt = 0;
    fpsAcum += dt;
    fpsCuenta++;
    if (fpsAcum >= 1) {
      IH.tiempo.fps = fpsCuenta;
      fpsAcum = 0;
      fpsCuenta = 0;
    }
    acum += dt;
    try {
      let pasos = 0;
      while (acum >= IH.PASO && pasos < 5) {
        actualizar(IH.PASO);
        acum -= IH.PASO;
        pasos++;
      }
      if (pasos >= 5) acum = 0;
      dibujar();
    } catch (e) {
      errores.push(e);
      console.error(e);
      if (errores.length > 20) throw e;
    }
  }

  IH.arrancar = function () {
    redimensionar();
    ultimo = performance.now();
    requestAnimationFrame(cuadro);
  };

  // Avance manual de la simulación (lo usan las pruebas automáticas)
  IH.simular = function (segundos) {
    const n = Math.round(segundos / IH.PASO);
    for (let i = 0; i < n; i++) actualizar(IH.PASO);
    dibujar();
  };
})();
