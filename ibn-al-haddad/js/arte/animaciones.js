/* Animaciones humanas (poses en grados; ver convención en esqueleto.js).
 * "ciclo" = función de la fase (0..1) para bucles; "claves" = lista de poses con duración.
 * El campo "ev" marca sucesos (paso, golpe…) que el juego escucha.
 */
'use strict';
(function () {
  const S = Math.sin, C = Math.cos, TAU = Math.PI * 2;

  const guardia = { y: -24.8, tor: 9, tD: [7, -2], tT: [-6, -2], hD: 35, cD: 60, arma: 135, hT: 35, cT: 55, escudoA: 0 };
  const guardiaSinEscudo = Object.assign({}, guardia, { hT: 10, cT: 50 });

  const A = {
    quieto: {
      n: 8, fps: 5,
      ciclo: (f) => {
        const r = S(f * TAU);
        return { y: -26 + r * 0.45, tor: 3 + r * 0.8, cab: -r * 0.6, hD: 7 + r * 1.5, cD: 14 + r * 2, hT: -5 - r * 1.5, cT: 12 + r * 2, tD: [3.5, -2], tT: [-3, -2], ojos: f > 0.8 && f < 0.95 ? 0 : 1 };
      },
    },
    guardia: {
      n: 8, fps: 6,
      ciclo: (f) => {
        const r = S(f * TAU);
        return Object.assign({}, guardia, { y: guardia.y + r * 0.45, tor: guardia.tor + r, arma: 135 + r * 3 });
      },
    },
    andar: {
      n: 10, fps: 12,
      ciclo: (f) => {
        const th = f * TAU;
        const mD = 24 * S(th), mT = -mD;
        const kD = 6 + 34 * Math.max(0, C(th)) ** 2;
        const kT = 6 + 34 * Math.max(0, -C(th)) ** 2;
        return {
          y: -26 + 1.1 * Math.abs(S(th)) - 0.4, tor: 5, cab: -1,
          mD, rD: kD, mT, rT: kT, pD: Math.max(0, C(th)) * 15, pT: Math.max(0, -C(th)) * 15,
          hD: -mD * 0.75 + 4, cD: 18 + Math.max(0, mD) * 0.6, hT: -mT * 0.75, cT: 16 + Math.max(0, mT) * 0.6,
        };
      },
      evPaso: [0, 0.5],
    },
    correr: {
      n: 10, fps: 15,
      ciclo: (f) => {
        const th = f * TAU;
        const mD = 44 * S(th), mT = -mD;
        const kD = 14 + 82 * Math.max(0, C(th)) ** 1.5;
        const kT = 14 + 82 * Math.max(0, -C(th)) ** 1.5;
        return {
          y: -27 + 2.2 * Math.abs(S(th)), x: 1.5, tor: 15, cab: -6,
          mD: mD + 6, rD: kD, mT: mT + 6, rT: kT, pD: 10 + Math.max(0, C(th)) * 30, pT: 10 + Math.max(0, -C(th)) * 30,
          hD: -mD * 1.0 + 15, cD: 85, hT: -mT * 1.0 + 10, cT: 80,
          capa: 1,
        };
      },
    },
    saltar: { claves: [{ p: { y: -28, tor: 8, mD: 45, rD: 70, mT: -12, rT: 40, hD: 120, cD: 40, hT: -50, cT: 30, pD: 30, pT: 40, arma: 120, capa: 0.6 }, d: 1 }], bucle: true },
    caer: {
      claves: [
        { p: { y: -27, tor: 4, mD: 25, rD: 35, mT: -18, rT: 55, hD: 75, cD: 30, hT: -60, cT: 20, pD: 25, pT: 35, arma: 100, capa: -0.4 }, d: 0.12 },
        { p: { y: -27, tor: 2, mD: 20, rD: 25, mT: -14, rT: 45, hD: 85, cD: 25, hT: -70, cT: 20, pD: 20, pT: 30, arma: 95, capa: -0.6 }, d: 0.12 },
      ],
      bucle: true,
    },
    aterrizar: { claves: [{ p: { y: -21, tor: 16, tD: [6, -2], tT: [-5, -2], hD: 50, cD: 40, hT: -30, cT: 40, arma: 90 }, d: 0.1 }], bucle: false, sig: 'quieto' },

    // ---- combate (con espada)
    ataque1: {
      claves: [
        { p: { y: -25, tor: -6, tD: [6, -2], tT: [-7, -2], hD: 150, cD: 35, arma: 215, hT: 20, cT: 50 }, d: 0.07 },
        { p: { y: -25, x: 2, tor: 6, tD: [9, -2], tT: [-6, -2], hD: 120, cD: 10, arma: 140, hT: 15, cT: 45 }, d: 0.04, ev: 'golpe' },
        { p: { y: -24, x: 4, tor: 16, tD: [11, -2], tT: [-5, -2], hD: 80, cD: 0, arma: 80, hT: -10, cT: 30 }, d: 0.05 },
        { p: { y: -24, x: 4, tor: 18, tD: [11, -2], tT: [-5, -2], hD: 55, cD: 5, arma: 45, hT: -20, cT: 30 }, d: 0.1 },
        { p: { y: -24.5, x: 2, tor: 12, tD: [9, -2], tT: [-6, -2], hD: 40, cD: 40, arma: 100, hT: 20, cT: 50 }, d: 0.08 },
      ],
      bucle: false,
    },
    ataque2: {
      claves: [
        { p: { y: -24.5, x: 3, tor: 14, tD: [9, -2], tT: [-6, -2], hD: 40, cD: 15, arma: 30, hT: 0, cT: 40 }, d: 0.06 },
        { p: { y: -25, x: 4, tor: 6, tD: [11, -2], tT: [-6, -2], hD: 95, cD: 10, arma: 110, hT: 10, cT: 40 }, d: 0.04, ev: 'golpe' },
        { p: { y: -25.5, x: 4, tor: -2, tD: [11, -2], tT: [-6, -2], hD: 145, cD: 15, arma: 170, hT: 20, cT: 40 }, d: 0.05 },
        { p: { y: -25.5, x: 4, tor: -4, tD: [11, -2], tT: [-6, -2], hD: 160, cD: 25, arma: 195, hT: 20, cT: 45 }, d: 0.1 },
        { p: { y: -25, x: 2, tor: 6, tD: [9, -2], tT: [-6, -2], hD: 60, cD: 50, arma: 130, hT: 25, cT: 50 }, d: 0.08 },
      ],
      bucle: false,
    },
    ataque3: {
      claves: [
        { p: { y: -24, x: -2, tor: 2, tD: [7, -2], tT: [-9, -2], hD: -30, cD: 110, arma: 90, hT: 30, cT: 40 }, d: 0.1 },
        { p: { y: -23.5, x: 7, tor: 22, tD: [16, -2], tT: [-6, -2], hD: 85, cD: 0, arma: 90, hT: -35, cT: 20 }, d: 0.05, ev: 'golpe' },
        { p: { y: -23, x: 9, tor: 26, tD: [17, -2], tT: [-5, -2], hD: 92, cD: 0, arma: 92, hT: -45, cT: 15 }, d: 0.16 },
        { p: { y: -24.5, x: 5, tor: 12, tD: [11, -2], tT: [-6, -2], hD: 45, cD: 45, arma: 110, hT: 15, cT: 45 }, d: 0.1 },
      ],
      bucle: false,
    },
    fuerte: {
      claves: [
        { p: { y: -25, tor: -4, tD: [6, -2], tT: [-8, -2], hD: 165, cD: 10, arma: 190, hT: 150, cT: 20, dosManos: true }, d: 0.12 },
        { p: { y: -26, tor: -12, tD: [6, -2], tT: [-8, -2], hD: 180, cD: 20, arma: 235, hT: 165, cT: 20, dosManos: true }, d: 0.16 },
        { p: { y: -24, x: 4, tor: 14, tD: [12, -2], tT: [-6, -2], hD: 115, cD: 5, arma: 135, hT: 100, cT: 15, dosManos: true }, d: 0.04, ev: 'golpe' },
        { p: { y: -21, x: 6, tor: 30, tD: [13, -2], tT: [-6, -2], hD: 60, cD: 0, arma: 55, hT: 50, cT: 10, dosManos: true }, d: 0.06 },
        { p: { y: -21, x: 6, tor: 32, tD: [13, -2], tT: [-6, -2], hD: 50, cD: 0, arma: 40, hT: 40, cT: 10, dosManos: true }, d: 0.2 },
        { p: { y: -24, x: 3, tor: 14, tD: [10, -2], tT: [-6, -2], hD: 40, cD: 40, arma: 100, hT: 20, cT: 50 }, d: 0.12 },
      ],
      bucle: false,
    },
    aereo: {
      claves: [
        { p: { y: -28, tor: -8, mD: 40, rD: 60, mT: -10, rT: 50, hD: 170, cD: 20, arma: 220, hT: -40, cT: 30, pD: 30, pT: 30 }, d: 0.06 },
        { p: { y: -28, tor: 14, mD: 45, rD: 70, mT: -5, rT: 60, hD: 100, cD: 0, arma: 110, hT: -50, cT: 30, pD: 30, pT: 30 }, d: 0.04, ev: 'golpe' },
        { p: { y: -28, tor: 24, mD: 50, rD: 80, mT: 0, rT: 70, hD: 45, cD: 0, arma: 30, hT: -60, cT: 30, pD: 30, pT: 30 }, d: 0.14 },
      ],
      bucle: false,
    },
    bloquear: {
      claves: [{ p: { y: -24.5, tor: 2, tD: [6, -2], tT: [-8, -2], hD: 95, cD: 70, arma: 175, hT: 75, cT: 40, escudoA: -8 }, d: 1 }],
      bucle: true,
    },
    bloqueoGolpe: {
      claves: [
        { p: { y: -24, x: -3, tor: -6, tD: [4, -2], tT: [-10, -2], hD: 100, cD: 75, arma: 185, hT: 85, cT: 35, escudoA: -15 }, d: 0.08 },
        { p: { y: -24.5, x: -1, tor: 0, tD: [5, -2], tT: [-9, -2], hD: 95, cD: 70, arma: 175, hT: 75, cT: 40, escudoA: -8 }, d: 0.1 },
      ],
      bucle: false,
      sig: 'bloquear',
    },
    parada: {
      claves: [
        { p: { y: -25, tor: 8, tD: [8, -2], tT: [-7, -2], hD: 125, cD: 25, arma: 160, hT: 30, cT: 40 }, d: 0.06 },
        { p: { y: -25, x: 2, tor: 14, tD: [10, -2], tT: [-6, -2], hD: 140, cD: 10, arma: 120, hT: 10, cT: 40 }, d: 0.18 },
        { p: { y: -24.5, x: 1, tor: 10, tD: [8, -2], tT: [-6, -2], hD: 40, cD: 50, arma: 120, hT: 30, cT: 50 }, d: 0.1 },
      ],
      bucle: false,
    },
    rodar: {
      claves: [
        { p: { y: -20, tor: 35, mD: 70, rD: 110, mT: 10, rT: 100, hD: 60, cD: 90, hT: 40, cT: 90, arma: 60, giro: 0 }, d: 0.05 },
        { p: { y: -14, tor: 50, mD: 90, rD: 140, mT: 70, rT: 130, hD: 80, cD: 100, hT: 70, cT: 100, arma: 80, giro: 70 }, d: 0.05 },
        { p: { y: -14, tor: 50, mD: 90, rD: 140, mT: 70, rT: 130, hD: 80, cD: 100, hT: 70, cT: 100, arma: 80, giro: 150 }, d: 0.05 },
        { p: { y: -14, tor: 50, mD: 90, rD: 140, mT: 70, rT: 130, hD: 80, cD: 100, hT: 70, cT: 100, arma: 80, giro: 230 }, d: 0.05 },
        { p: { y: -15, tor: 50, mD: 90, rD: 140, mT: 70, rT: 130, hD: 80, cD: 100, hT: 70, cT: 100, arma: 80, giro: 310 }, d: 0.05 },
        { p: { y: -21, tor: 25, tD: [7, -2], tT: [-6, -2], hD: 50, cD: 60, hT: 30, cT: 60, arma: 100, giro: 360 }, d: 0.07 },
      ],
      bucle: false,
    },
    herido: {
      claves: [
        { p: { y: -25, x: -3, tor: -16, cab: -12, tD: [5, -2], tT: [-7, -2], hD: -30, cD: 40, hT: -45, cT: 30, arma: 30, ojos: 0 }, d: 0.1 },
        { p: { y: -25, x: -2, tor: -10, cab: -6, tD: [5, -2], tT: [-7, -2], hD: -10, cD: 40, hT: -30, cT: 30, arma: 40 }, d: 0.14 },
      ],
      bucle: false,
    },
    aturdido: {
      n: 6, fps: 6,
      ciclo: (f) => {
        const r = S(f * TAU);
        return { y: -23.5, x: -1, tor: -8 + r * 6, cab: 10 + r * 6, tD: [5, -2], tT: [-6, -2], hD: -15 + r * 10, cD: 30, hT: -30, cT: 20, arma: 10, ojos: 0 };
      },
    },
    muerte: {
      claves: [
        { p: { y: -25, x: -2, tor: -18, cab: -15, tD: [5, -2], tT: [-7, -2], hD: -30, cD: 40, hT: -45, cT: 30, arma: 20, ojos: 0 }, d: 0.15 },
        { p: { y: -14, x: 0, tor: 20, cab: 25, tD: [7, -2], tT: [-6, -2], hD: 10, cD: 10, hT: -10, cT: 20, arma: 10, ojos: 0 }, d: 0.2 },
        { p: { y: -8, x: 2, tor: 60, cab: 20, mD: 90, rD: 120, mT: 70, rT: 140, hD: 70, cD: 10, hT: 40, cT: 10, arma: 80, ojos: 0, giro: 20 }, d: 0.15 },
        { p: { y: -4, x: 4, tor: 85, cab: 5, mD: 90, rD: 20, mT: 85, rT: 30, hD: 100, cD: 5, hT: 80, cT: 10, arma: 110, ojos: 0, giro: 0 }, d: 1 },
      ],
      bucle: false,
    },
    yacer: { claves: [{ p: { y: -4, x: 4, tor: 85, cab: 5, mD: 90, rD: 20, mT: 85, rT: 30, hD: 100, cD: 5, hT: 80, cT: 10, arma: 110, ojos: 0 }, d: 1 }], bucle: true },
    arrodillado: {
      n: 6, fps: 4,
      ciclo: (f) => {
        const r = S(f * TAU);
        return { y: -15 + r * 0.3, tor: 12 + r, cab: 18, tD: [8, -2], mT: -20, rT: 100, pT: 80, hD: 20, cD: 50, hT: 0, cT: 30, arma: 60 };
      },
    },
    levantarse: {
      claves: [
        { p: { y: -15, tor: 12, cab: 18, tD: [8, -2], mT: -20, rT: 100, pT: 80, hD: 20, cD: 50, hT: 0, cT: 30, arma: 60 }, d: 0.15 },
        { p: { y: -21, tor: 20, cab: 5, tD: [7, -2], tT: [-5, -2], hD: 30, cD: 40, hT: -10, cT: 30, arma: 60 }, d: 0.15 },
      ],
      bucle: false,
      sig: 'quieto',
    },

    // ---- vida cotidiana
    hablar: {
      n: 8, fps: 6,
      ciclo: (f) => {
        const r = S(f * TAU), r2 = S(f * TAU * 2);
        return { y: -26 + r * 0.3, tor: 4, cab: -2 + r2 * 2, tD: [3.5, -2], tT: [-3, -2], hD: 45 + r * 15, cD: 60 + r2 * 15, hT: -5, cT: 14, arma: 70 };
      },
    },
    senalar: { claves: [{ p: { y: -26, tor: 2, cab: -6, tD: [4, -2], tT: [-3, -2], hD: 95, cD: 0, hT: -6, cT: 12, arma: 90 }, d: 1 }], bucle: true },
    saludar: {
      n: 6, fps: 7,
      ciclo: (f) => ({ y: -26, tor: 1, tD: [3.5, -2], tT: [-3, -2], hD: 150 + S(f * TAU) * 15, cD: 20, hT: -5, cT: 12, arma: 160 }),
    },
    brazosCruzados: {
      n: 6, fps: 4,
      ciclo: (f) => ({ y: -26 + S(f * TAU) * 0.3, tor: -2, tD: [3.5, -2], tT: [-3, -2], hD: 35, cD: 110, hT: 30, cT: 115, arma: 200, armaT: 1 }),
    },
    manosAtras: {
      n: 6, fps: 4,
      ciclo: (f) => ({ y: -26 + S(f * TAU) * 0.3, tor: -3, tD: [3.5, -2], tT: [-3, -2], hD: -25, cD: 30, hT: -30, cT: 30, arma: 0, armaT: 1 }),
    },
    martillar: {
      claves: [
        { p: { y: -25, tor: 14, cab: 12, tD: [6, -2], tT: [-6, -2], hD: 175, cD: 20, arma: 230, hT: 55, cT: 30 }, d: 0.22 },
        { p: { y: -24.5, tor: 22, cab: 16, tD: [6, -2], tT: [-6, -2], hD: 110, cD: 5, arma: 120, hT: 55, cT: 30 }, d: 0.04 },
        { p: { y: -24, tor: 26, cab: 18, tD: [6, -2], tT: [-6, -2], hD: 70, cD: 10, arma: 95, hT: 55, cT: 30 }, d: 0.18, ev: 'yunque' },
      ],
      bucle: true,
    },
    golpeMartillo: {
      claves: [
        { p: { y: -25, tor: 14, cab: 12, tD: [6, -2], tT: [-6, -2], hD: 175, cD: 20, arma: 230, hT: 55, cT: 30 }, d: 0.12 },
        { p: { y: -24.5, tor: 22, cab: 16, tD: [6, -2], tT: [-6, -2], hD: 110, cD: 5, arma: 120, hT: 55, cT: 30 }, d: 0.04 },
        { p: { y: -24, tor: 26, cab: 18, tD: [6, -2], tT: [-6, -2], hD: 70, cD: 10, arma: 95, hT: 55, cT: 30 }, d: 0.3, ev: 'yunque' },
        { p: { y: -25, tor: 16, cab: 12, tD: [6, -2], tT: [-6, -2], hD: 60, cD: 40, arma: 100, hT: 50, cT: 30 }, d: 0.2 },
      ],
      bucle: false,
    },
    fuelle: {
      claves: [
        { p: { y: -26, tor: 10, cab: 10, tD: [5, -2], tT: [-5, -2], hD: 90, cD: 40, hT: 80, cT: 50, arma: 0, armaT: 1 }, d: 0.3 },
        { p: { y: -23, tor: 28, cab: 15, tD: [6, -2], tT: [-5, -2], hD: 60, cD: 20, hT: 55, cT: 25, arma: 0, armaT: 1 }, d: 0.3, ev: 'fuelle' },
      ],
      bucle: true,
    },
    beber: {
      claves: [
        { p: { y: -26, tor: 0, tD: [3.5, -2], tT: [-3, -2], hD: 60, cD: 100, hT: -5, cT: 12, arma: 0 }, d: 0.2 },
        { p: { y: -26, tor: -8, cab: -25, tD: [3.5, -2], tT: [-3, -2], hD: 120, cD: 100, hT: -5, cT: 12, arma: 0 }, d: 0.7 },
        { p: { y: -26, tor: 2, tD: [3.5, -2], tT: [-3, -2], hD: 40, cD: 60, hT: -5, cT: 12, arma: 40 }, d: 0.2 },
      ],
      bucle: false,
    },
    sentado: {
      n: 8, fps: 4,
      ciclo: (f) => {
        const r = S(f * TAU);
        return { y: -13 + r * 0.3, tor: 4 + r, cab: 2, mD: 80, rD: 150, mT: 70, rT: 160, pD: 40, pT: 40, hD: 30, cD: 50, hT: 20, cT: 50, arma: 70 };
      },
    },
    sentadoHablar: {
      n: 8, fps: 6,
      ciclo: (f) => {
        const r = S(f * TAU), r2 = S(f * TAU * 2);
        return { y: -13, tor: 6 + r * 2, cab: -3 + r2 * 3, mD: 80, rD: 150, mT: 70, rT: 160, pD: 40, pT: 40, hD: 70 + r * 25, cD: 50 + r2 * 20, hT: 20, cT: 50, arma: 90 };
      },
    },
    tocarOud: {
      n: 8, fps: 8,
      ciclo: (f) => {
        const r = S(f * TAU * 2);
        return { y: -13, tor: 6, cab: 10, mD: 80, rD: 150, mT: 70, rT: 160, pD: 40, pT: 40, hD: 40 + r * 6, cD: 70, hT: 60, cT: 70, arma: 120 };
      },
    },
    barrer: {
      n: 8, fps: 7,
      ciclo: (f) => {
        const r = S(f * TAU);
        return { y: -25, tor: 22, cab: 10, tD: [5, -2], tT: [-5, -2], hD: 30 + r * 25, cD: 20, hT: 40 + r * 25, cT: 30, arma: 25 + r * 25 };
      },
    },
    cargar: {
      n: 10, fps: 10,
      ciclo: (f) => {
        const th = f * TAU, mD = 18 * S(th);
        return { y: -25.6 + 0.8 * Math.abs(S(th)), tor: -2, mD, rD: 6 + 26 * Math.max(0, C(th)) ** 2, mT: -mD, rT: 6 + 26 * Math.max(0, -C(th)) ** 2, hD: 160, cD: 25, hT: 160, cT: 25, arma: 180 };
      },
    },
    rezarManos: {
      n: 6, fps: 3,
      ciclo: (f) => ({ y: -26, tor: 0, cab: 10, tD: [3.5, -2], tT: [-3, -2], hD: 50, cD: 80, hT: 45, cT: 85, arma: 0, armaT: 1 }),
    },
    escribir: {
      n: 6, fps: 6,
      ciclo: (f) => ({ y: -13, tor: 25, cab: 25, mD: 80, rD: 150, mT: 70, rT: 160, pD: 40, pT: 40, hD: 55 + S(f * TAU * 2) * 4, cD: 60, hT: 50, cT: 70, arma: 120 }),
    },

    // ---- enemigos
    apuntar: {
      claves: [{ p: { y: -25.5, tor: 0, tD: [6, -2], tT: [-6, -2], hD: 88, cD: 5, arma: 90, tMT: [12, -38] }, d: 1 }],
      bucle: true,
    },
    disparar: {
      claves: [
        { p: { y: -25.5, x: -2, tor: -6, tD: [5, -2], tT: [-7, -2], hD: 95, cD: 5, arma: 100, tMT: [10, -40], descargada: true }, d: 0.12, ev: 'disparo' },
        { p: { y: -25.5, tor: -2, tD: [6, -2], tT: [-6, -2], hD: 90, cD: 5, arma: 92, tMT: [12, -38], descargada: true }, d: 0.25 },
      ],
      bucle: false,
    },
    recargar: {
      n: 8, fps: 5,
      ciclo: (f) => {
        const r = S(f * TAU);
        return { y: -21, tor: 30, cab: 20, tD: [7, -2], tT: [-6, -2], hD: 25, cD: 10, arma: 10, hT: 20 + r * 25, cT: 70, descargada: f < 0.75 };
      },
    },
    tensarArco: {
      claves: [{ p: { y: -26, tor: -2, tD: [6, -2], tT: [-6, -2], hD: 92, cD: 0, arma: 90, tMT: [-2, -40], tensar: true }, d: 1 }],
      bucle: true,
    },
    embestida: {
      claves: [
        { p: { y: -24, x: -3, tor: 0, tD: [5, -2], tT: [-9, -2], hD: 30, cD: 60, arma: 130, hT: 60, cT: 30, escudoA: 0 }, d: 0.2 },
        { p: { y: -23, x: 8, tor: 25, tD: [15, -2], tT: [-6, -2], hD: 20, cD: 50, arma: 110, hT: 85, cT: 5, escudoA: -10 }, d: 0.06, ev: 'golpe' },
        { p: { y: -23, x: 9, tor: 26, tD: [15, -2], tT: [-6, -2], hD: 20, cD: 50, arma: 110, hT: 88, cT: 5, escudoA: -10 }, d: 0.2 },
        { p: { y: -24.5, x: 3, tor: 10, tD: [9, -2], tT: [-6, -2], hD: 35, cD: 60, arma: 135, hT: 35, cT: 55 }, d: 0.12 },
      ],
      bucle: false,
    },
    tajoArriba: {
      // golpe lento descendente (caballeros)
      claves: [
        { p: { y: -25.5, tor: -10, tD: [6, -2], tT: [-8, -2], hD: 175, cD: 15, arma: 205, hT: 30, cT: 50 }, d: 0.32 },
        { p: { y: -24, x: 5, tor: 15, tD: [12, -2], tT: [-6, -2], hD: 110, cD: 0, arma: 125, hT: 10, cT: 40 }, d: 0.04, ev: 'golpe' },
        { p: { y: -22, x: 7, tor: 28, tD: [13, -2], tT: [-6, -2], hD: 55, cD: 0, arma: 45, hT: 0, cT: 40 }, d: 0.06 },
        { p: { y: -22, x: 7, tor: 28, tD: [13, -2], tT: [-6, -2], hD: 45, cD: 0, arma: 35, hT: 0, cT: 40 }, d: 0.32 },
        { p: { y: -24.5, x: 3, tor: 10, tD: [9, -2], tT: [-6, -2], hD: 35, cD: 60, arma: 135, hT: 35, cT: 55 }, d: 0.12 },
      ],
      bucle: false,
    },
    estocada: {
      claves: [
        { p: { y: -24.5, x: -3, tor: 0, tD: [6, -2], tT: [-9, -2], hD: -25, cD: 105, arma: 92, hT: 40, cT: 40 }, d: 0.28 },
        { p: { y: -23.5, x: 8, tor: 24, tD: [16, -2], tT: [-6, -2], hD: 88, cD: 0, arma: 90, hT: 10, cT: 30 }, d: 0.05, ev: 'golpe' },
        { p: { y: -23.5, x: 9, tor: 26, tD: [16, -2], tT: [-6, -2], hD: 90, cD: 0, arma: 90, hT: 10, cT: 30 }, d: 0.24 },
        { p: { y: -24.5, x: 3, tor: 10, tD: [9, -2], tT: [-6, -2], hD: 35, cD: 60, arma: 135, hT: 35, cT: 55 }, d: 0.12 },
      ],
      bucle: false,
    },
    salto_golpe: {
      claves: [
        { p: { y: -20, tor: 20, tD: [7, -2], tT: [-7, -2], hD: 170, cD: 20, arma: 210, hT: 150, cT: 20, dosManos: true }, d: 0.3 },
        { p: { y: -30, tor: -5, mD: 40, rD: 70, mT: -10, rT: 60, hD: 185, cD: 10, arma: 220, hT: 170, cT: 10, dosManos: true, pD: 30, pT: 30 }, d: 0.4 },
        { p: { y: -22, x: 4, tor: 30, tD: [12, -2], tT: [-6, -2], hD: 80, cD: 0, arma: 70, hT: 70, cT: 10, dosManos: true }, d: 0.05, ev: 'golpe' },
        { p: { y: -19, x: 6, tor: 40, tD: [13, -2], tT: [-6, -2], hD: 45, cD: 0, arma: 30, hT: 40, cT: 10, dosManos: true }, d: 0.5 },
        { p: { y: -24.5, x: 3, tor: 10, tD: [9, -2], tT: [-6, -2], hD: 35, cD: 60, arma: 135, hT: 35, cT: 55 }, d: 0.15 },
      ],
      bucle: false,
    },
    gritar: {
      claves: [
        { p: { y: -25, tor: -10, cab: -20, tD: [7, -2], tT: [-7, -2], hD: 160, cD: 10, arma: 175, hT: -40, cT: 20 }, d: 1 },
      ],
      bucle: true,
    },
    lanzar: {
      claves: [
        { p: { y: -25, tor: -10, tD: [5, -2], tT: [-8, -2], hD: 190, cD: 40, arma: 200, hT: 40, cT: 30 }, d: 0.2 },
        { p: { y: -24, x: 3, tor: 20, tD: [9, -2], tT: [-6, -2], hD: 100, cD: 0, arma: 100, hT: -20, cT: 30 }, d: 0.06, ev: 'lanzar' },
        { p: { y: -24, x: 3, tor: 20, tD: [9, -2], tT: [-6, -2], hD: 60, cD: 10, arma: 60, hT: -20, cT: 30 }, d: 0.3 },
      ],
      bucle: false,
    },
  };

  A.guardiaSinEscudo = {
    n: 8, fps: 6,
    ciclo: (f) => {
      const r = S(f * TAU);
      return Object.assign({}, guardiaSinEscudo, { y: guardiaSinEscudo.y + r * 0.45, tor: guardiaSinEscudo.tor + r, arma: 135 + r * 3 });
    },
  };
  // Avance en guardia (los enemigos se acercan con el arma lista)
  A.avanzar = {
    n: 10, fps: 11,
    ciclo: (f) => {
      const th = f * TAU;
      const mD = 20 * S(th);
      return Object.assign({}, guardia, {
        tD: undefined, tT: undefined,
        y: -25.2 + 0.9 * Math.abs(S(th)), mD: mD + 4, rD: 8 + 30 * Math.max(0, C(th)) ** 2, mT: -mD + 2, rT: 8 + 30 * Math.max(0, -C(th)) ** 2,
        pD: Math.max(0, C(th)) * 12, pT: Math.max(0, -C(th)) * 12,
      });
    },
  };

  IH.ANIMS = A;
})();
