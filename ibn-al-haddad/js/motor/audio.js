/* Audio: todo se sintetiza con Web Audio, sin archivos.
 *
 * Instrumentos: oud y qanun (cuerda pulsada Karplus-Strong), ney (flauta de caña),
 * rebab (cuerda frotada), coro, nafir (trompa larga), bordón, darbuka, riq,
 * tabl y naqqara (timbales de la banda militar mameluca, la tablkhana).
 *
 * Las escalas son maqamat reales, con cuartos de tono (Rast, Bayati, Saba…).
 * El secuenciador programa compases con antelación y las pistas se definen
 * en js/arte/musica.js. Los efectos y los ambientes están al final de este archivo.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;

  // Escalas en cents desde la tónica (8 grados: 1..8)
  const MAQAM = {
    rast: [0, 200, 350, 500, 700, 900, 1050, 1200],
    bayati: [0, 150, 300, 500, 700, 800, 1000, 1200],
    hijaz: [0, 100, 400, 500, 700, 800, 1000, 1200],
    hijazkar: [0, 100, 400, 500, 700, 800, 1100, 1200],
    saba: [0, 150, 300, 400, 700, 800, 1000, 1100],
    nahawand: [0, 200, 300, 500, 700, 800, 1100, 1200],
    kurd: [0, 100, 300, 500, 700, 800, 1000, 1200],
    dorico: [0, 200, 300, 500, 700, 900, 1000, 1200],
    pentatonica: [0, 300, 500, 700, 1000, 1200, 1500, 1700],
  };

  const A = (IH.audio = {
    ctx: null,
    listo: false,
    MAQAM,
    reproductor: null,
    pistaActual: null,
    ambienteActual: null,
    oyenteX: 0,
  });

  let ctx, maestro, busMusica, busEfectos, busAmbiente, envioReverb, convolver;
  let ruidoBlanco, ruidoRosa;
  const cachePulsos = {};

  A.iniciar = function () {
    if (A.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = A.ctx = new AC({ latencyHint: 'interactive' });
    } catch (e) {
      return;
    }
    maestro = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    comp.attack.value = 0.004;
    comp.release.value = 0.2;
    maestro.connect(comp).connect(ctx.destination);

    busMusica = ctx.createGain();
    busEfectos = ctx.createGain();
    busAmbiente = ctx.createGain();
    busMusica.connect(maestro);
    busEfectos.connect(maestro);
    busAmbiente.connect(maestro);

    convolver = ctx.createConvolver();
    convolver.buffer = crearImpulso(2.6, 2.4);
    envioReverb = ctx.createGain();
    envioReverb.gain.value = 1;
    const retornoReverb = ctx.createGain();
    retornoReverb.gain.value = 0.55;
    envioReverb.connect(convolver).connect(retornoReverb).connect(maestro);

    A._nodos = { maestro, busMusica, busEfectos, busAmbiente };
    ruidoBlanco = crearRuido(2.5, false);
    ruidoRosa = crearRuido(4, true);
    A.aplicarVolumenes();
    A.listo = true;
    if (A._pendienteMusica) {
      const p = A._pendienteMusica;
      A._pendienteMusica = null;
      A.musica(p.id, p.opc);
    }
    if (A._pendienteAmbiente) {
      const p = A._pendienteAmbiente;
      A._pendienteAmbiente = null;
      A.ambiente(p);
    }
  };

  A.desbloquear = function () {
    if (!A.ctx) A.iniciar();
    if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
  };

  A.aplicarVolumenes = function () {
    if (!ctx) return;
    const aj = IH.ajustes || {};
    const g = (v, d) => (v == null ? d : v);
    maestro.gain.setTargetAtTime(g(aj.volGeneral, 0.8), ctx.currentTime, 0.05);
    busMusica.gain.setTargetAtTime(g(aj.volMusica, 0.7) * 0.55, ctx.currentTime, 0.05);
    busEfectos.gain.setTargetAtTime(g(aj.volEfectos, 0.8), ctx.currentTime, 0.05);
    busAmbiente.gain.setTargetAtTime(g(aj.volAmbiente, 0.7) * 0.6, ctx.currentTime, 0.05);
  };

  function crearRuido(seg, rosa) {
    const n = Math.floor(ctx.sampleRate * seg);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (rosa) {
        b0 = 0.997 * b0 + w * 0.029591;
        b1 = 0.985 * b1 + w * 0.032534;
        b2 = 0.95 * b2 + w * 0.048056;
        d[i] = (b0 + b1 + b2 + w * 0.05) * 2.2;
      } else d[i] = w;
    }
    return b;
  }

  function crearImpulso(seg, caida) {
    const n = Math.floor(ctx.sampleRate * seg);
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const w = Math.random() * 2 - 1;
        lp = lp * 0.55 + w * 0.45; // reverberación algo oscura
        d[i] = lp * Math.pow(1 - t, caida) * (i < 200 ? i / 200 : 1);
      }
    }
    return b;
  }

  // ---------------------------------------------------------------- cuerda pulsada
  // Genera un buffer Karplus-Strong a una frecuencia base; luego se transpone con playbackRate.
  function pulso(nombre, frecObj) {
    const bases = [82.41, 164.81, 329.63, 659.25];
    let base = bases[0];
    for (const b of bases) if (Math.abs(Math.log(b / frecObj)) < Math.abs(Math.log(base / frecObj))) base = b;
    const clave = nombre + base;
    if (cachePulsos[clave]) return cachePulsos[clave];
    const sr = ctx.sampleRate;
    const N = Math.max(2, Math.round(sr / base));
    const frecReal = sr / N;
    const cfg = {
      oud: { dur: 3.2, t60: 2.6, brillo: 0.38, pos: 0.13 },
      qanun: { dur: 2.6, t60: 2.2, brillo: 0.75, pos: 0.08 },
      bajo: { dur: 2.4, t60: 1.6, brillo: 0.22, pos: 0.2 },
    }[nombre];
    const n = Math.floor(sr * cfg.dur);
    const buf = ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    const linea = new Float32Array(N);
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const w = Math.random() * 2 - 1;
      lp = lp + (w - lp) * cfg.brillo;
      linea[i] = lp;
    }
    // filtro de posición de pulsación (peine)
    const desp = Math.max(1, Math.floor(N * cfg.pos));
    const copia = linea.slice();
    for (let i = 0; i < N; i++) linea[i] = copia[i] - 0.8 * copia[(i + desp) % N];
    const rho = Math.pow(10, -3 / (cfg.t60 * frecReal));
    let idx = 0, max = 0;
    for (let i = 0; i < n; i++) {
      const a = linea[idx];
      const b = linea[(idx + 1) % N];
      linea[idx] = rho * (0.5 * (a + b));
      d[i] = a;
      if (Math.abs(a) > max) max = Math.abs(a);
      idx = (idx + 1) % N;
    }
    if (max > 0) for (let i = 0; i < n; i++) d[i] /= max;
    // ataque suave para que no "clique"
    for (let i = 0; i < 64 && i < n; i++) d[i] *= i / 64;
    return (cachePulsos[clave] = { buf, frec: frecReal });
  }

  function cuerdaPulsada(nombre, frec, t, dur, vel, dest, doble = true) {
    const p = pulso(nombre, frec);
    const voces = doble ? [-5, 5] : [0];
    voces.forEach((cents, i) => {
      const src = ctx.createBufferSource();
      src.buffer = p.buf;
      src.playbackRate.value = (frec / p.frec) * Math.pow(2, cents / 1200);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vel * (doble ? 0.55 : 0.8), t);
      g.gain.setTargetAtTime(0, t + dur, nombre === 'qanun' ? 0.25 : 0.12);
      src.connect(g).connect(dest);
      const t0 = t + i * 0.007;
      src.start(t0);
      src.stop(t0 + dur + 1.2);
    });
  }

  // ---------------------------------------------------------------- instrumentos de música
  // Cada canal de pista tiene su propia cadena (filtros de cuerpo, envío a reverberación).
  function crearCanal(salida, tipo) {
    const entrada = ctx.createGain();
    let fin = entrada;
    if (tipo === 'oud') {
      const cuerpo = ctx.createBiquadFilter();
      cuerpo.type = 'peaking';
      cuerpo.frequency.value = 240;
      cuerpo.Q.value = 1.2;
      cuerpo.gain.value = 5;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3200;
      entrada.connect(cuerpo).connect(lp);
      fin = lp;
    } else if (tipo === 'qanun') {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 180;
      entrada.connect(hp);
      fin = hp;
    }
    fin.connect(salida);
    const envio = ctx.createGain();
    envio.gain.value = { oud: 0.25, qanun: 0.4, ney: 0.55, rebab: 0.45, coro: 0.7, nafir: 0.5, perc: 0.18, bordon: 0.4, bajo: 0.1 }[tipo] || 0.3;
    fin.connect(envio).connect(envioReverb);
    return entrada;
  }

  const ultimaFrec = {};

  const INSTRUMENTOS = {
    oud(f, t, dur, vel, dest) {
      cuerdaPulsada('oud', f, t, dur, vel, dest, true);
    },
    qanun(f, t, dur, vel, dest) {
      cuerdaPulsada('qanun', f, t, dur, vel * 0.8, dest, true);
    },
    bajo(f, t, dur, vel, dest) {
      cuerdaPulsada('bajo', f, t, dur, vel, dest, false);
    },
    ney(f, t, dur, vel, dest, canal) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      const prev = ultimaFrec[canal];
      if (prev && prev !== f && Math.abs(Math.log2(prev / f)) < 0.6) {
        o.frequency.setValueAtTime(prev, t);
        o.frequency.setTargetAtTime(f, t, 0.035);
      } else {
        o.frequency.setValueAtTime(f * 0.985, t);
        o.frequency.setTargetAtTime(f, t, 0.05);
      }
      ultimaFrec[canal] = f;
      const o2 = ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.value = f * 2;
      const g2 = ctx.createGain();
      g2.gain.value = 0.08;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5 + Math.random() * 0.6;
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(0, t);
      lfoG.gain.linearRampToValueAtTime(f * 0.011, t + Math.min(dur, 0.6));
      lfo.connect(lfoG).connect(o.frequency);
      const ruido = ctx.createBufferSource();
      ruido.buffer = ruidoBlanco;
      ruido.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f * 2.2;
      bp.Q.value = 1.4;
      const gr = ctx.createGain();
      gr.gain.setValueAtTime(0, t);
      gr.gain.linearRampToValueAtTime(vel * 0.11, t + 0.04);
      gr.gain.setTargetAtTime(vel * 0.045, t + 0.06, 0.1);
      gr.gain.setTargetAtTime(0, t + dur, 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * 0.42, t + 0.09);
      g.gain.setTargetAtTime(vel * 0.36, t + 0.1, 0.3);
      g.gain.setTargetAtTime(0, t + dur, 0.09);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2600;
      o.connect(g);
      o2.connect(g2).connect(g);
      g.connect(lp).connect(dest);
      ruido.connect(bp).connect(gr).connect(dest);
      const fin = t + dur + 0.6;
      [o, o2, lfo, ruido].forEach((n) => {
        n.start(t);
        n.stop(fin);
      });
    },
    rebab(f, t, dur, vel, dest, canal) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      const prev = ultimaFrec[canal];
      if (prev && Math.abs(Math.log2(prev / f)) < 0.6) {
        o.frequency.setValueAtTime(prev, t);
        o.frequency.setTargetAtTime(f, t, 0.04);
      } else o.frequency.setValueAtTime(f, t);
      ultimaFrec[canal] = f;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.6;
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(0, t);
      lfoG.gain.linearRampToValueAtTime(f * 0.008, t + Math.min(dur, 0.4));
      lfo.connect(lfoG).connect(o.frequency);
      const f1 = ctx.createBiquadFilter();
      f1.type = 'lowpass';
      f1.frequency.value = 1700;
      f1.Q.value = 0.8;
      const f2 = ctx.createBiquadFilter();
      f2.type = 'peaking';
      f2.frequency.value = 900;
      f2.gain.value = 6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * 0.2, t + 0.12);
      g.gain.setTargetAtTime(vel * 0.17, t + 0.12, 0.3);
      g.gain.setTargetAtTime(0, t + dur, 0.12);
      o.connect(f1).connect(f2).connect(g).connect(dest);
      o.start(t);
      lfo.start(t);
      o.stop(t + dur + 0.8);
      lfo.stop(t + dur + 0.8);
    },
    coro(f, t, dur, vel, dest) {
      // voces "aaa" con formantes; tres voces ligeramente desafinadas
      const formantes = [[700, 1.0], [1150, 0.5], [2700, 0.2]];
      const suma = ctx.createGain();
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * 0.16, t + 0.35);
      g.gain.setTargetAtTime(0, t + dur, 0.25);
      suma.connect(g).connect(dest);
      for (const det of [-9, 0, 8]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f * Math.pow(2, det / 1200);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4.8 + Math.random();
        const lg = ctx.createGain();
        lg.gain.value = f * 0.006;
        lfo.connect(lg).connect(o.frequency);
        for (const [ff, ga] of formantes) {
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = ff;
          bp.Q.value = 6;
          const gg = ctx.createGain();
          gg.gain.value = ga;
          o.connect(bp).connect(gg).connect(suma);
        }
        o.start(t);
        lfo.start(t);
        o.stop(t + dur + 1.2);
        lfo.stop(t + dur + 1.2);
      }
    },
    nafir(f, t, dur, vel, dest) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f * 0.97, t);
      o.frequency.setTargetAtTime(f, t, 0.05);
      const o2 = ctx.createOscillator();
      o2.type = 'square';
      o2.frequency.value = f * 1.002;
      const g2 = ctx.createGain();
      g2.gain.value = 0.3;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 2;
      lp.frequency.setValueAtTime(250, t);
      lp.frequency.linearRampToValueAtTime(2400, t + 0.18);
      lp.frequency.setTargetAtTime(1500, t + 0.2, 0.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * 0.2, t + 0.08);
      g.gain.setTargetAtTime(0, t + dur, 0.1);
      o.connect(lp);
      o2.connect(g2).connect(lp);
      lp.connect(g).connect(dest);
      o.start(t);
      o2.start(t);
      o.stop(t + dur + 0.6);
      o2.stop(t + dur + 0.6);
    },
    bordon(f, t, dur, vel, dest) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * 0.12, t + Math.min(1.5, dur * 0.3));
      g.gain.setValueAtTime(vel * 0.12, t + Math.max(0.1, dur - 1));
      g.gain.linearRampToValueAtTime(0, t + dur + 0.5);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 520;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.13;
      const lg = ctx.createGain();
      lg.gain.value = 180;
      lfo.connect(lg).connect(lp.frequency);
      lp.connect(g).connect(dest);
      const osc = [];
      for (const [mul, det] of [[1, -6], [1, 6], [1.5, 2], [0.5, 0]]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f * mul * Math.pow(2, det / 1200);
        const gg = ctx.createGain();
        gg.gain.value = mul === 1.5 ? 0.35 : 0.6;
        o.connect(gg).connect(lp);
        osc.push(o);
      }
      osc.push(lfo);
      osc.forEach((o) => {
        o.start(t);
        o.stop(t + dur + 0.6);
      });
    },
    garganta(f, t, dur, vel, dest) {
      // canto difónico (para los mongoles): fundamental grave y un armónico agudo resaltado
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.value = 420;
      bp1.Q.value = 3;
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.Q.value = 28;
      bp2.frequency.setValueAtTime(f * 8, t);
      bp2.frequency.linearRampToValueAtTime(f * 10, t + dur * 0.5);
      bp2.frequency.linearRampToValueAtTime(f * 9, t + dur);
      const g1 = ctx.createGain();
      g1.gain.value = 0.7;
      const g2 = ctx.createGain();
      g2.gain.value = 2.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vel * 0.2, t + 0.4);
      g.gain.setTargetAtTime(0, t + dur, 0.3);
      o.connect(bp1).connect(g1).connect(g);
      o.connect(bp2).connect(g2).connect(g);
      g.connect(dest);
      o.start(t);
      o.stop(t + dur + 1.5);
    },
    campanilla(f, t, dur, vel, dest) {
      // golpe de yunque afinado (para la música de la forja)
      for (const [r, a, d] of [[1, 1, 0.9], [2.71, 0.45, 0.5], [5.02, 0.25, 0.25]]) {
        const o = ctx.createOscillator();
        o.frequency.value = f * r;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vel * 0.12 * a, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d * 1.2);
        o.connect(g).connect(dest);
        o.start(t);
        o.stop(t + d * 1.3);
      }
    },
  };

  // ---------------------------------------------------------------- percusión
  function ruidoFuente(t, dur, buf = ruidoBlanco) {
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.loopStart = Math.random() * 1.5;
    s.start(t, Math.random() * 1.5);
    s.stop(t + dur);
    return s;
  }

  function golpeTono(dest, t, f0, f1, caida, vel, tipo = 'sine') {
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + caida * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + caida);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + caida + 0.05);
  }

  function golpeRuido(dest, t, tipo, frec, q, caida, vel, buf) {
    const s = ruidoFuente(t, caida + 0.05, buf);
    const f = ctx.createBiquadFilter();
    f.type = tipo;
    f.frequency.value = frec;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + caida);
    s.connect(f).connect(g).connect(dest);
  }

  const PERCUSION = {
    doum(t, vel, d) {
      golpeTono(d, t, 150, 62, 0.42, vel * 0.9);
      golpeRuido(d, t, 'lowpass', 900, 0.7, 0.05, vel * 0.25);
    },
    tek(t, vel, d) {
      golpeRuido(d, t, 'bandpass', 3400, 1.6, 0.06, vel * 0.55);
      golpeTono(d, t, 760, 640, 0.05, vel * 0.18);
    },
    ka(t, vel, d) {
      golpeRuido(d, t, 'bandpass', 2600, 1.2, 0.04, vel * 0.3);
    },
    riq(t, vel, d) {
      golpeRuido(d, t, 'highpass', 6500, 0.7, 0.13, vel * 0.22);
      golpeRuido(d, t + 0.012, 'highpass', 8000, 0.7, 0.1, vel * 0.12);
    },
    bendir(t, vel, d) {
      golpeTono(d, t, 95, 70, 0.5, vel * 0.7);
      golpeRuido(d, t, 'bandpass', 400, 0.9, 0.18, vel * 0.25);
    },
    tabl(t, vel, d) {
      golpeTono(d, t, 82, 41, 0.9, vel * 1.05);
      golpeRuido(d, t, 'lowpass', 500, 0.8, 0.25, vel * 0.5);
    },
    naqqara(t, vel, d) {
      golpeTono(d, t, 210, 150, 0.32, vel * 0.7);
      golpeRuido(d, t, 'bandpass', 1200, 1.4, 0.07, vel * 0.3);
    },
    platillo(t, vel, d) {
      golpeRuido(d, t, 'highpass', 5200, 0.6, 1.4, vel * 0.18);
      golpeRuido(d, t, 'bandpass', 3100, 4, 0.9, vel * 0.08);
    },
    galope(t, vel, d) {
      golpeTono(d, t, 120, 70, 0.12, vel * 0.5);
      golpeRuido(d, t, 'lowpass', 700, 0.8, 0.06, vel * 0.3);
    },
  };

  // ---------------------------------------------------------------- secuenciador
  function frecGrado(pista, grado, octava) {
    const esc = MAQAM[pista.maqam] || MAQAM.hijaz;
    const g = grado - 1;
    const o = Math.floor(g / 7);
    const gi = ((g % 7) + 7) % 7;
    const cents = esc[gi] + (o + octava) * 1200;
    return pista.tonica * Math.pow(2, cents / 1200);
  }
  A.frecGrado = frecGrado;

  class Reproductor {
    constructor(pista, id) {
      this.pista = pista;
      this.id = id;
      this.compas = 0;
      this.rng = new IH.Azar(1234 + id.length * 97);
      this.salida = ctx.createGain();
      this.salida.gain.value = 0;
      this.salida.connect(busMusica);
      this.canales = {};
      this.siguienteT = ctx.currentTime + 0.12;
      this.parado = false;
      this.intensidad = 1;
    }
    canal(nombre, tipo) {
      if (!this.canales[nombre]) this.canales[nombre] = crearCanal(this.salida, tipo);
      return this.canales[nombre];
    }
    fundir(obj, seg) {
      const g = this.salida.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(g.value, ctx.currentTime);
      g.linearRampToValueAtTime(obj, ctx.currentTime + Math.max(0.01, seg));
    }
    programar() {
      if (this.parado) return;
      const p = this.pista;
      while (this.siguienteT < ctx.currentTime + 0.35) {
        const pasos = p.pasos || 16;
        const dPaso = 60 / p.bpm / (pasos / 4);
        const eventos = p.compas(this.compas, this.rng, this) || [];
        for (const ev of eventos) {
          const t = this.siguienteT + ev.paso * dPaso + (ev.humano ? (this.rng.sig() - 0.5) * 0.012 : 0);
          if (t < ctx.currentTime) continue;
          const vel = (ev.vel == null ? 0.8 : ev.vel) * (ev.capa === 'extra' ? this.intensidad : 1);
          if (vel <= 0.001) continue;
          if (PERCUSION[ev.inst]) {
            PERCUSION[ev.inst](t, vel, this.canal('perc', 'perc'));
          } else if (INSTRUMENTOS[ev.inst]) {
            const f = ev.frec || frecGrado(p, ev.grado, ev.octava || 0);
            const nombreCanal = ev.canal || ev.inst;
            INSTRUMENTOS[ev.inst](f, t, (ev.dur || 1) * dPaso, vel, this.canal(nombreCanal, ev.inst), nombreCanal);
          }
        }
        this.siguienteT += pasos * dPaso;
        this.compas++;
      }
    }
    parar(seg) {
      this.fundir(0, seg);
      this.parado = true;
      setTimeout(() => this.salida.disconnect(), (seg + 3) * 1000);
    }
  }

  // Convierte una frase escrita con grados del maqam en eventos.
  //   "5 - 6 5 4 3 . 2"  → números = grado, '-' prolonga, '.' silencio,
  //   sufijo ' sube una octava, sufijo , baja una octava, ~ añade un adorno.
  A.frase = function (txt, inst, opc = {}) {
    const toks = txt.trim().split(/\s+/);
    const ev = [];
    let ultimo = null;
    const inicio = opc.desde || 0;
    const paso = opc.paso || 1;
    toks.forEach((tk, i) => {
      const pos = inicio + i * paso;
      if (tk === '-') {
        if (ultimo) ultimo.dur += paso;
        return;
      }
      if (tk === '.' || tk === '|') {
        ultimo = null;
        return;
      }
      let oct = opc.octava || 0;
      let s = tk;
      let adorno = false;
      while (s.endsWith("'")) {
        oct++;
        s = s.slice(0, -1);
      }
      while (s.endsWith(',')) {
        oct--;
        s = s.slice(0, -1);
      }
      if (s.endsWith('~')) {
        adorno = true;
        s = s.slice(0, -1);
      }
      const g = parseInt(s, 10);
      if (isNaN(g)) return;
      if (adorno && opc.adornos !== false) {
        ev.push({ inst, grado: g + 1, octava: oct, paso: pos, dur: paso * 0.25, vel: (opc.vel || 0.8) * 0.6, canal: opc.canal, capa: opc.capa, humano: true });
        ultimo = { inst, grado: g, octava: oct, paso: pos + paso * 0.25, dur: paso * 0.75, vel: opc.vel || 0.8, canal: opc.canal, capa: opc.capa, humano: true };
      } else {
        ultimo = { inst, grado: g, octava: oct, paso: pos, dur: paso, vel: opc.vel || 0.8, canal: opc.canal, capa: opc.capa, humano: true };
      }
      ev.push(ultimo);
    });
    return ev;
  };

  // Ritmo: cadena con D (doum), T (tek), k (ka), . silencio; un carácter por paso
  A.ritmo = function (txt, opc = {}) {
    const ev = [];
    const v = opc.vel || 0.8;
    const mapa = opc.mapa || { D: 'doum', T: 'tek', k: 'ka', R: 'riq', B: 'tabl', N: 'naqqara', P: 'platillo', F: 'bendir', G: 'galope' };
    [...txt.replace(/\s+/g, '')].forEach((c, i) => {
      if (c === '.' || c === '-') return;
      const inst = mapa[c];
      if (!inst) return;
      const fuerte = c === c.toUpperCase();
      ev.push({ inst, paso: (opc.desde || 0) + i * (opc.paso || 1), vel: v * (fuerte ? 1 : 0.55), humano: true });
    });
    return ev;
  };

  A.pistas = {};

  A.musica = function (id, opc = {}) {
    if (!A.listo) {
      A._pendienteMusica = id ? { id, opc } : null;
      return;
    }
    if (A.pistaActual === id && A.reproductor && !A.reproductor.parado) return;
    const fundido = opc.fundido != null ? opc.fundido : 1.6;
    if (A.reproductor) A.reproductor.parar(fundido);
    A.reproductor = null;
    A.pistaActual = id;
    if (!id) return;
    const pista = A.pistas[id];
    if (!pista) {
      console.warn('Pista desconocida', id);
      return;
    }
    const r = new Reproductor(pista, id);
    r.siguienteT = ctx.currentTime + (opc.retraso || 0.15);
    r.fundir(pista.volumen || 1, opc.entrada != null ? opc.entrada : 1.2);
    A.reproductor = r;
  };

  A.intensidad = function (v) {
    if (A.reproductor) A.reproductor.intensidad = v;
  };

  // Frase musical suelta (al encontrar una crónica, al vencer, etc.)
  A.estribillo = function (id) {
    if (!A.listo) return;
    const e = A.pistas['_' + id];
    if (!e) return;
    const r = new Reproductor(e, '_' + id);
    r.salida.gain.value = e.volumen || 1;
    const eventos = e.compas(0, r.rng, r);
    const dPaso = 60 / e.bpm / ((e.pasos || 16) / 4);
    const t0 = ctx.currentTime + 0.03;
    for (const ev of eventos) {
      const t = t0 + ev.paso * dPaso;
      if (PERCUSION[ev.inst]) PERCUSION[ev.inst](t, ev.vel || 0.8, r.canal('perc', 'perc'));
      else if (INSTRUMENTOS[ev.inst]) {
        const f = ev.frec || frecGrado(e, ev.grado, ev.octava || 0);
        INSTRUMENTOS[ev.inst](f, t, (ev.dur || 1) * dPaso, ev.vel || 0.8, r.canal(ev.inst, ev.inst), '_e' + ev.inst);
      }
    }
    setTimeout(() => r.salida.disconnect(), 9000);
  };

  // ---------------------------------------------------------------- efectos de sonido
  function salidaEfecto(opc, reverb = 0.12) {
    const g = ctx.createGain();
    g.gain.value = opc.vol == null ? 1 : opc.vol;
    let dest = busEfectos;
    if (opc.x != null && ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = U.clamp((opc.x - A.oyenteX) / 320, -0.85, 0.85);
      g.connect(pan).connect(busEfectos);
      // atenuación por distancia
      const dist = Math.abs(opc.x - A.oyenteX);
      g.gain.value *= U.clamp(1.25 - dist / 520, 0.15, 1);
    } else g.connect(dest);
    if (reverb > 0) {
      const e = ctx.createGain();
      e.gain.value = reverb;
      g.connect(e).connect(envioReverb);
    }
    return g;
  }

  function metal(d, t, f, parciales, caida, vel) {
    for (const [r, a] of parciales) {
      const o = ctx.createOscillator();
      o.frequency.value = f * r * (1 + (Math.random() - 0.5) * 0.004);
      const g = ctx.createGain();
      g.gain.setValueAtTime(vel * a, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + caida * (1.2 - r * 0.04));
      o.connect(g).connect(d);
      o.start(t);
      o.stop(t + caida * 1.3);
    }
  }

  function barrido(d, t, f0, f1, dur, q, vel, tipo = 'bandpass', buf) {
    const s = ruidoFuente(t, dur + 0.05, buf);
    const f = ctx.createBiquadFilter();
    f.type = tipo;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(d);
  }

  function voz(d, t, f0, f1, dur, vel, formantes = [[600, 1], [1000, 0.6], [2500, 0.2]]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [ff, a] of formantes) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = ff;
      bp.Q.value = 5;
      const gg = ctx.createGain();
      gg.gain.value = a * 2.4;
      o.connect(bp).connect(gg).connect(g);
    }
    g.connect(d);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  const EFECTOS = {
    paso(t, o, d) {
      const sup = o.superficie || 'piedra';
      const f = { piedra: 1700, arena: 700, madera: 900, tierra: 1000 }[sup] || 1200;
      golpeRuido(d, t, 'lowpass', f * (0.8 + Math.random() * 0.4), 1, 0.06, 0.35);
      if (sup === 'madera') golpeTono(d, t, 240, 180, 0.07, 0.15);
      if (o.metal) golpeRuido(d, t + 0.02, 'bandpass', 5200, 3, 0.08, 0.08);
    },
    salto(t, o, d) {
      barrido(d, t, 500, 1300, 0.16, 1.2, 0.25);
    },
    aterrizar(t, o, d) {
      golpeRuido(d, t, 'lowpass', 500, 0.8, 0.12, 0.55);
      golpeTono(d, t, 110, 60, 0.12, 0.35);
    },
    tajo(t, o, d) {
      barrido(d, t, 700 * (o.tono || 1), 3800 * (o.tono || 1), 0.16, 1.6, 1.2);
      barrido(d, t, 300 * (o.tono || 1), 900 * (o.tono || 1), 0.14, 1, 0.35, 'lowpass');
    },
    tajoFuerte(t, o, d) {
      barrido(d, t, 300, 2600, 0.3, 1.4, 1.2);
      barrido(d, t + 0.05, 200, 900, 0.3, 1, 0.5, 'lowpass');
    },
    choque(t, o, d) {
      const f = 480 + Math.random() * 120;
      metal(d, t, f, [[1, 0.5], [2.76, 0.3], [5.4, 0.22], [8.93, 0.12]], 0.55, 0.55);
      golpeRuido(d, t, 'bandpass', 4200, 1.5, 0.05, 0.7);
    },
    parada(t, o, d) {
      const f = 620;
      metal(d, t, f, [[1, 0.5], [2.76, 0.4], [5.4, 0.3], [8.93, 0.2], [13.3, 0.12]], 1.3, 0.6);
      golpeRuido(d, t, 'highpass', 5000, 1, 0.1, 0.6);
      metal(d, t + 0.05, f * 2, [[1, 0.2], [1.5, 0.15]], 1.5, 0.4);
    },
    golpe(t, o, d) {
      golpeTono(d, t, 140, 55, 0.2, 1.1);
      golpeRuido(d, t, 'lowpass', 1600, 0.9, 0.1, 0.9);
    },
    golpeArmadura(t, o, d) {
      metal(d, t, 330, [[1, 0.3], [2.4, 0.25], [4.1, 0.15]], 0.3, 0.6);
      golpeTono(d, t, 120, 60, 0.15, 0.55);
      golpeRuido(d, t, 'bandpass', 2600, 1, 0.08, 0.5);
    },
    escudo(t, o, d) {
      golpeTono(d, t, 190, 140, 0.16, 0.55, 'triangle');
      golpeRuido(d, t, 'bandpass', 850, 1.6, 0.12, 0.6);
    },
    madera(t, o, d) {
      golpeTono(d, t, 320, 260, 0.1, 0.5, 'triangle');
      golpeRuido(d, t, 'bandpass', 1400, 2, 0.06, 0.45);
    },
    dolor(t, o, d) {
      const f = (o.tono || 1) * (115 + Math.random() * 25);
      voz(d, t, f * 1.3, f, 0.22, 0.4, [[520, 1], [950, 0.7], [2400, 0.2]]);
    },
    grito(t, o, d) {
      const f = (o.tono || 1) * (150 + Math.random() * 30);
      voz(d, t, f, f * 1.25, 0.45, 0.45, [[700, 1], [1200, 0.6], [2600, 0.25]]);
    },
    muerte(t, o, d) {
      const f = (o.tono || 1) * 120;
      voz(d, t, f * 1.2, f * 0.7, 0.6, 0.4, [[480, 1], [850, 0.6], [2300, 0.2]]);
      for (let i = 0; i < 3; i++) metal(d, t + 0.35 + i * 0.09, 700 + i * 140, [[1, 0.2], [2.7, 0.1]], 0.2, 0.4);
    },
    rodar(t, o, d) {
      barrido(d, t, 300, 1200, 0.28, 0.8, 0.35);
      golpeRuido(d, t + 0.22, 'lowpass', 400, 0.8, 0.1, 0.3);
    },
    ballesta(t, o, d) {
      golpeTono(d, t, 260, 140, 0.12, 0.6, 'triangle');
      golpeRuido(d, t, 'highpass', 2500, 1, 0.04, 0.6);
      barrido(d, t + 0.02, 1500, 4000, 0.18, 2, 0.2);
    },
    arco(t, o, d) {
      golpeTono(d, t, 340, 200, 0.15, 0.45, 'triangle');
      barrido(d, t + 0.02, 1800, 4500, 0.2, 2, 0.18);
    },
    clavarse(t, o, d) {
      golpeRuido(d, t, 'bandpass', 1100, 2, 0.06, 0.6);
      golpeTono(d, t, 220, 150, 0.08, 0.3, 'triangle');
    },
    yunque(t, o, d) {
      const f = 860 * (o.tono || 1);
      metal(d, t, f, [[1, 0.55], [2.41, 0.3], [4.12, 0.2], [6.3, 0.12], [8.7, 0.05]], 1.6, 0.6);
      golpeRuido(d, t, 'highpass', 3000, 1, 0.03, 0.8);
      golpeTono(d, t, 160, 90, 0.08, 0.4);
    },
    fuelle(t, o, d) {
      barrido(d, t, 200, 700, 0.7, 0.7, 0.45, 'lowpass', ruidoRosa);
    },
    chispas(t, o, d) {
      for (let i = 0; i < 6; i++) golpeRuido(d, t + Math.random() * 0.25, 'highpass', 4000 + Math.random() * 3000, 1, 0.02, 0.25);
    },
    temple(t, o, d) {
      // hierro al rojo en el agua
      barrido(d, t, 6000, 2500, 1.6, 0.5, 0.35, 'highpass');
      for (let i = 0; i < 8; i++) golpeTono(d, t + 0.1 + Math.random() * 0.8, 300 + Math.random() * 300, 150, 0.05, 0.1);
    },
    beber(t, o, d) {
      for (let i = 0; i < 3; i++) golpeTono(d, t + i * 0.28, 180, 110, 0.14, 0.35);
      barrido(d, t, 400, 300, 0.9, 1, 0.1, 'lowpass');
    },
    moneda(t, o, d) {
      metal(d, t, 2100, [[1, 0.3], [2.3, 0.15]], 0.4, 0.5);
      metal(d, t + 0.08, 2600, [[1, 0.25], [2.3, 0.1]], 0.5, 0.5);
    },
    pergamino(t, o, d) {
      for (let i = 0; i < 5; i++) golpeRuido(d, t + i * 0.05, 'bandpass', 2500 + Math.random() * 2000, 1.5, 0.06, 0.25);
    },
    pluma(t, o, d) {
      for (let i = 0; i < 4; i++) golpeRuido(d, t + i * 0.07 + Math.random() * 0.03, 'bandpass', 5000, 3, 0.05, 0.08);
    },
    puerta(t, o, d) {
      const s = ctx.createOscillator();
      s.type = 'sawtooth';
      s.frequency.setValueAtTime(80, t);
      s.frequency.linearRampToValueAtTime(130, t + 0.35);
      s.frequency.linearRampToValueAtTime(60, t + 0.6);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900;
      bp.Q.value = 6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      s.connect(bp).connect(g).connect(d);
      s.start(t);
      s.stop(t + 0.65);
      golpeTono(d, t + 0.6, 120, 70, 0.2, 0.4);
    },
    ui(t, o, d) {
      cuerdaPulsada('qanun', o.frec || 880, t, 0.25, 0.25, d, false);
    },
    uiAceptar(t, o, d) {
      cuerdaPulsada('oud', 293.66, t, 0.6, 0.35, d, true);
      cuerdaPulsada('oud', 440, t + 0.05, 0.6, 0.25, d, true);
    },
    uiAtras(t, o, d) {
      cuerdaPulsada('oud', 220, t, 0.4, 0.3, d, true);
    },
    texto(t, o, d) {
      golpeRuido(d, t, 'bandpass', 3500 + Math.random() * 800, 4, 0.02, 0.05);
    },
    explosion(t, o, d) {
      golpeTono(d, t, 90, 30, 1.6, 0.5);
      golpeRuido(d, t, 'lowpass', 900, 0.5, 1.8, 0.45, ruidoRosa);
      golpeRuido(d, t, 'bandpass', 2500, 0.8, 0.4, 0.22);
    },
    fuego(t, o, d) {
      barrido(d, t, 300, 1500, 1.0, 0.6, 0.4, 'lowpass', ruidoRosa);
      for (let i = 0; i < 6; i++) golpeRuido(d, t + Math.random(), 'highpass', 3000, 1, 0.02, 0.2);
    },
    cuerno(t, o, d) {
      INSTRUMENTOS.nafir(o.frec || 146.83, t, 1.8, 0.9, d);
      INSTRUMENTOS.nafir((o.frec || 146.83) * 1.5, t + 0.05, 1.6, 0.5, d);
    },
    campana(t, o, d) {
      metal(d, t, o.frec || 196, [[0.5, 0.3], [1, 0.5], [1.19, 0.3], [1.5, 0.25], [2, 0.2], [2.51, 0.12], [3, 0.08]], 4, 0.5);
    },
    latido(t, o, d) {
      golpeTono(d, t, 60, 40, 0.15, 0.6);
      golpeTono(d, t + 0.18, 55, 38, 0.15, 0.4);
    },
    multitud(t, o, d) {
      for (let i = 0; i < 14; i++) {
        const f = 110 + Math.random() * 140;
        voz(d, t + Math.random() * 0.4, f, f * (1 + Math.random() * 0.4), 0.9 + Math.random() * 0.8, 0.07);
      }
      barrido(d, t, 400, 900, 1.6, 0.5, 0.3, 'bandpass', ruidoRosa);
    },
    descubrir(t, o, d) {
      [0, 4, 7, 12].forEach((s, i) => cuerdaPulsada('qanun', 587.33 * Math.pow(2, s / 12), t + i * 0.09, 0.8, 0.3, d, true));
    },
    curar(t, o, d) {
      EFECTOS.beber(t, o, d);
      [0, 3, 7].forEach((s, i) => cuerdaPulsada('qanun', 440 * Math.pow(2, s / 12), t + 0.6 + i * 0.1, 0.8, 0.18, d, true));
    },
    caballo(t, o, d) {
      for (let i = 0; i < 4; i++) {
        golpeTono(d, t + i * 0.11, 140, 80, 0.08, 0.3);
        golpeRuido(d, t + i * 0.11, 'lowpass', 900, 0.8, 0.05, 0.2);
      }
    },
    trueno(t, o, d) {
      golpeRuido(d, t, 'lowpass', 300, 0.6, 3.5, 0.9, ruidoRosa);
      golpeTono(d, t, 55, 30, 2.5, 0.5);
    },
    viento(t, o, d) {
      barrido(d, t, 300, 900, 2.5, 0.8, 0.3, 'bandpass', ruidoRosa);
    },
    olaRompe(t, o, d) {
      barrido(d, t, 400, 2500, 1.4, 0.5, 0.35, 'lowpass', ruidoRosa);
    },
  };

  A.sfx = function (id, opc = {}) {
    if (!A.listo || ctx.state !== 'running') return;
    const f = EFECTOS[id];
    if (!f) return;
    try {
      const d = salidaEfecto(opc, opc.reverb != null ? opc.reverb : 0.12);
      f(ctx.currentTime + (opc.retraso || 0), opc, d);
    } catch (e) {
      console.warn('sfx', id, e);
    }
  };

  // ---------------------------------------------------------------- ambientes
  // Un ambiente es un lecho continuo de ruido filtrado más sucesos aleatorios.
  const AMBIENTES = {
    ciudad: {
      lechos: [
        { tipo: 'bandpass', f: 520, q: 0.6, vol: 0.32, mod: 0.35 },
        { tipo: 'bandpass', f: 1300, q: 1.2, vol: 0.09, mod: 0.5 },
      ],
      sucesos: [
        { cada: [0.4, 1.4], f: (t, d) => voz(d, t, 140 + Math.random() * 120, 120 + Math.random() * 160, 0.25 + Math.random() * 0.4, 0.035) },
        { cada: [2, 6], f: (t, d) => pajaro(d, t) },
        { cada: [5, 12], f: (t, d) => metal(d, t, 900 + Math.random() * 300, [[1, 0.1], [2.4, 0.05]], 0.6, 0.6) },
        { cada: [3, 8], f: (t, d) => golpeTono(d, t, 300, 200, 0.06, 0.06, 'triangle') },
      ],
    },
    forja: {
      lechos: [
        { tipo: 'lowpass', f: 380, q: 0.7, vol: 0.4, mod: 0.4, buf: 'rosa' },
        { tipo: 'bandpass', f: 600, q: 0.6, vol: 0.06, mod: 0.6 },
      ],
      sucesos: [
        { cada: [0.05, 0.5], f: (t, d) => golpeRuido(d, t, 'highpass', 2500 + Math.random() * 3000, 1, 0.015, 0.08 + Math.random() * 0.1) },
        { cada: [6, 14], f: (t, d) => pajaro(d, t, 0.4) },
      ],
    },
    interior: {
      lechos: [{ tipo: 'lowpass', f: 250, q: 0.7, vol: 0.12, mod: 0.2, buf: 'rosa' }],
      sucesos: [{ cada: [0.2, 1.2], f: (t, d) => golpeRuido(d, t, 'highpass', 3000, 1, 0.012, 0.04) }],
    },
    noche: {
      lechos: [
        { tipo: 'lowpass', f: 300, q: 0.5, vol: 0.18, mod: 0.5, buf: 'rosa' },
      ],
      sucesos: [
        { cada: [0.3, 1.1], f: (t, d) => grillo(d, t) },
        { cada: [0.05, 0.6], f: (t, d) => golpeRuido(d, t, 'highpass', 2800 + Math.random() * 2000, 1, 0.015, 0.06) },
        { cada: [8, 20], f: (t, d) => voz(d, t, 110, 95, 0.8, 0.02) },
      ],
    },
    campamento: {
      lechos: [
        { tipo: 'lowpass', f: 320, q: 0.5, vol: 0.2, mod: 0.5, buf: 'rosa' },
        { tipo: 'bandpass', f: 450, q: 0.8, vol: 0.12, mod: 0.4 },
      ],
      sucesos: [
        { cada: [0.4, 1.4], f: (t, d) => grillo(d, t) },
        { cada: [0.04, 0.4], f: (t, d) => golpeRuido(d, t, 'highpass', 2600 + Math.random() * 2400, 1, 0.015, 0.07) },
        { cada: [1, 3], f: (t, d) => voz(d, t, 120 + Math.random() * 60, 110 + Math.random() * 60, 0.4 + Math.random() * 0.5, 0.03) },
        { cada: [6, 15], f: (t, d) => metal(d, t, 700 + Math.random() * 400, [[1, 0.08], [2.7, 0.04]], 0.4, 0.6) },
      ],
    },
    rio: {
      lechos: [
        { tipo: 'lowpass', f: 700, q: 0.4, vol: 0.3, mod: 0.6, buf: 'rosa' },
        { tipo: 'bandpass', f: 2200, q: 1, vol: 0.05, mod: 0.8 },
      ],
      sucesos: [{ cada: [3, 7], f: (t, d) => pajaro(d, t, 0.6) }],
    },
    mar: {
      lechos: [{ tipo: 'lowpass', f: 600, q: 0.4, vol: 0.45, mod: 0.9, lento: 0.12, buf: 'rosa' }],
      sucesos: [
        { cada: [4, 8], f: (t, d) => barrido(d, t, 400, 2200, 1.6, 0.5, 0.25, 'lowpass', ruidoRosa) },
        { cada: [5, 12], f: (t, d) => gaviota(d, t) },
      ],
    },
    viento: {
      lechos: [
        { tipo: 'bandpass', f: 500, q: 0.9, vol: 0.4, mod: 0.8, lento: 0.15, buf: 'rosa' },
        { tipo: 'bandpass', f: 1400, q: 2, vol: 0.06, mod: 0.9, lento: 0.2 },
      ],
      sucesos: [],
    },
    batalla: {
      lechos: [
        { tipo: 'bandpass', f: 420, q: 0.6, vol: 0.35, mod: 0.5, buf: 'rosa' },
        { tipo: 'lowpass', f: 200, q: 0.5, vol: 0.3, mod: 0.4, buf: 'rosa' },
      ],
      sucesos: [
        { cada: [0.3, 1.2], f: (t, d) => metal(d, t, 450 + Math.random() * 300, [[1, 0.12], [2.76, 0.07], [5.4, 0.05]], 0.4, 0.5) },
        { cada: [0.6, 2], f: (t, d) => voz(d, t, 160 + Math.random() * 80, 140 + Math.random() * 120, 0.4 + Math.random() * 0.5, 0.05) },
        { cada: [5, 12], f: (t, d) => INSTRUMENTOS.nafir(110 + Math.random() * 40, t, 1.5, 0.25, d) },
        { cada: [0.05, 0.4], f: (t, d) => golpeRuido(d, t, 'highpass', 2600, 1, 0.02, 0.06) },
      ],
    },
    silencio: { lechos: [], sucesos: [] },
  };

  function pajaro(d, t, vol = 1) {
    const n = 2 + Math.floor(Math.random() * 4);
    const base = 2800 + Math.random() * 1800;
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator();
      const tt = t + i * (0.07 + Math.random() * 0.05);
      o.frequency.setValueAtTime(base, tt);
      o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), tt + 0.05);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.035 * vol, tt + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.06);
      o.connect(g).connect(d);
      o.start(tt);
      o.stop(tt + 0.07);
    }
  }

  function grillo(d, t) {
    const f = 4300 + Math.random() * 500;
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      const g = ctx.createGain();
      const tt = t + i * 0.045;
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.025, tt + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.03);
      o.connect(g).connect(d);
      o.start(tt);
      o.stop(tt + 0.035);
    }
  }

  function gaviota(d, t) {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(1600, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g).connect(d);
    o.start(t);
    o.stop(t + 0.45);
  }

  A.ambiente = function (id, opc = {}) {
    if (!A.listo) {
      A._pendienteAmbiente = id;
      return;
    }
    if (A.ambienteActual && A.ambienteActual.id === id) return;
    const fundido = opc.fundido != null ? opc.fundido : 1.5;
    if (A.ambienteActual) {
      const viejo = A.ambienteActual;
      viejo.salida.gain.setTargetAtTime(0, ctx.currentTime, fundido / 3);
      viejo.fuentes.forEach((s) => s.stop(ctx.currentTime + fundido + 0.5));
      setTimeout(() => viejo.salida.disconnect(), (fundido + 1) * 1000);
    }
    A.ambienteActual = null;
    const def = AMBIENTES[id];
    if (!def) return;
    const salida = ctx.createGain();
    salida.gain.value = 0;
    salida.gain.setTargetAtTime(opc.vol || 1, ctx.currentTime, fundido / 3);
    salida.connect(busAmbiente);
    const env = ctx.createGain();
    env.gain.value = 0.2;
    salida.connect(env).connect(envioReverb);
    const fuentes = [];
    const lechos = def.lechos.map((l) => {
      const s = ctx.createBufferSource();
      s.buffer = l.buf === 'rosa' ? ruidoRosa : ruidoBlanco;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = l.tipo;
      f.frequency.value = l.f;
      f.Q.value = l.q;
      const g = ctx.createGain();
      g.gain.value = l.vol;
      s.connect(f).connect(g).connect(salida);
      s.start(ctx.currentTime, Math.random() * 2);
      fuentes.push(s);
      return { def: l, g, f, fase: Math.random() * 10 };
    });
    A.ambienteActual = {
      id,
      salida,
      fuentes,
      lechos,
      relojes: def.sucesos.map((s) => U.lerp(s.cada[0], s.cada[1], Math.random())),
      def,
    };
  };

  A.volumenAmbiente = function (v, seg = 1) {
    if (A.ambienteActual && ctx) A.ambienteActual.salida.gain.setTargetAtTime(v, ctx.currentTime, seg / 3);
  };

  function actualizarAmbiente(dt) {
    const am = A.ambienteActual;
    if (!am) return;
    const t = ctx.currentTime;
    for (const l of am.lechos) {
      l.fase += dt * (l.def.lento || 0.35);
      const m = 1 - l.def.mod * 0.5 + l.def.mod * 0.5 * Math.sin(l.fase * 2.1 + Math.sin(l.fase * 0.73) * 2);
      l.g.gain.setTargetAtTime(l.def.vol * m, t, 0.3);
    }
    am.def.sucesos.forEach((s, i) => {
      am.relojes[i] -= dt;
      if (am.relojes[i] <= 0) {
        am.relojes[i] = U.lerp(s.cada[0], s.cada[1], Math.random());
        try {
          s.f(t + 0.02, am.salida);
        } catch (e) {
          /* nada */
        }
      }
    });
  }

  A.actualizar = function (dt) {
    if (!A.listo || ctx.state !== 'running') return;
    if (A.reproductor) A.reproductor.programar();
    actualizarAmbiente(dt);
  };

  A.pararTodo = function (seg = 1) {
    A.musica(null, { fundido: seg });
    A.ambiente(null, { fundido: seg });
  };
})();
