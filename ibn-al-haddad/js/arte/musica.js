/* Banda sonora de Ibn al-Haddad.
 * Cada pista genera sus compases con frases escritas en grados del maqam
 * (ver IH.audio.frase). Tónica por defecto: Re (D3 = 146,83 Hz).
 *
 *   titulo      Hijaz — tema principal (ney sobre bordón y oud)
 *   cronista    Hijaz — lecho tranquilo para la narración
 *   cairo       Bayati — las calles de El Cairo (ritmo maqsum)
 *   forja       Rast — el taller del padre, con el yunque como percusión
 *   maydan      Hijaz Kar — campo de entrenamiento (ritmo saidi, tambores militares)
 *   despedida   Saba — el adiós al padre (ney y rebab, sin percusión)
 *   campamento  Kurd — noche en Mansura
 *   tension     Hijaz — la alarma antes de la batalla
 *   batalla     Hijaz — combate en las calles de Mansura
 *   jefe        Kurd — el caballero templario
 *   cruzados    Dórico — la flota de Luis IX (canto llano y campanas)
 *   mongoles    Pentatónica — avance de lo que viene
 *   victoria    Rast — fanfarria de la tablkhana
 */
'use strict';
(function () {
  const A = IH.audio;
  const F = (...a) => A.frase(...a);
  const R = (...a) => A.ritmo(...a);
  const P = A.pistas;
  const D3 = 146.83;

  function mezclar(...listas) {
    return [].concat(...listas);
  }

  // ------------------------------------------------------------------ TÍTULO
  const temaTitulo = [
    "5 - - - - - 6 5 4 - 3~ - 4 - - -",
    "3 - 2 - 1 - - - - - - - . . . .",
    "1 - 2 - 3 - - - 4 - 5 - 6 - 5 -",
    "4 - - - 3 - - - 2 - 3 - - - . .",
    "8 - - - 7 - 6 - 5 - - - 6 - 7 -",
    "8 - - - - - 7 6 5 - 6~ - 5 - 4 -",
    "3 - 4 - 5 - 4 - 3 - 2 - 3 - - -",
    "2 - - - 1 - - - - - - - . . . .",
  ];
  const bajoTitulo = [1, 1, 1, 4, 6, 5, 4, 1];
  P.titulo = {
    bpm: 66, maqam: 'hijaz', tonica: D3, volumen: 1.75,
    compas(n) {
      const ev = [];
      if (n % 2 === 0) ev.push({ inst: 'bordon', grado: 1, octava: -1, paso: 0, dur: 32, vel: 0.8 });
      const fase = n < 2 ? -1 : (n - 2) % 16;
      const b = bajoTitulo[(fase + 8) % 8] || 1;
      ev.push(...F(`${b} . . . 5 . . . ${b}' . 5 . 4 . 3 .`, 'oud', { octava: -1, vel: 0.55 }));
      if (n >= 1) ev.push(...R('F . . . . . . . k . F . . . k .', { vel: 0.5 }));
      if (fase >= 0) {
        ev.push(...F(temaTitulo[fase % 8], 'ney', { octava: 1, vel: 0.8 }));
        if (fase >= 8) ev.push(...F(temaTitulo[fase % 8], 'qanun', { octava: 1, vel: 0.22, desde: 1 }));
      }
      return ev;
    },
  };

  // ------------------------------------------------------------------ CRONISTA
  const motivosCronista = [
    "1 . . . . . . . 5 . . . 4 . 3 .",
    "2 . . . 1 . . . . . . . . . . .",
    "3 . . . 4 . . . 5 . . . . . . .",
    "6 . 5 . 4 . . . 3 . . . . . . .",
    ". . . . 1 . . . 2 . 3 . 2 . . .",
    "5 . . . . . 4 . 3 . 2 . 1 . . .",
  ];
  P.cronista = {
    bpm: 60, maqam: 'hijaz', tonica: D3, volumen: 1.5,
    compas(n, rng) {
      const ev = [];
      if (n % 4 === 0) {
        ev.push({ inst: 'bordon', grado: 1, octava: -1, paso: 0, dur: 64, vel: 0.65 });
      }
      ev.push(...F(motivosCronista[n % motivosCronista.length], 'oud', { octava: 0, vel: 0.45 }));
      if (n % 4 === 2) ev.push(...F(". . . . . . . . 8 . 7 . 5 . . .", 'qanun', { octava: 1, vel: 0.2 }));
      if (n % 2 === 0) ev.push({ inst: 'bendir', paso: 0, vel: 0.28 });
      if (n >= 8 && n % 8 >= 4) ev.push(...F(rng.elegir(["5 - - - - - - - 4 - - - 3 - - -", "3 - - - 2 - - - 1 - - - - - - -"]), 'ney', { octava: 1, vel: 0.35 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ EL CAIRO
  const melCairo = [
    "1 - 2 3 4 - 3 2 3 - 4 5 4 - - -",
    "5 - 6 5 4 3 4 5 3 - 2 - 1 - - -",
    "1 - 2 3 4 - 3 2 3 - 4 5 4 - 5 6",
    "5 - 4 3 4 - 3 2 1 - - - . . . .",
    "5 - 5 6 7 - 6 5 6 - 5 4 5 - - -",
    "8 - 7 6 5 4 3 4 2 - 3 2 1 - - -",
    "5 - 5 6 7 - 6 5 6 - 7 8 7 - 6 5",
    "4 - 3 4 2 - 3 2 1 - - - . . . .",
  ];
  const respuestaCairo = [". . . . . . . . . . . . 5 4 3 4", ". . . . . . . . . . . . 1 2 3 2"];
  P.cairo = {
    bpm: 108, maqam: 'bayati', tonica: D3, volumen: 1.5,
    compas(n, rng) {
      const ev = [];
      const f = n % 16;
      ev.push(...R('D . T . k . T . D . k . T . k k', { vel: 0.7 }));
      ev.push(...R('. . R . . . R . . . R . . . R .', { vel: 0.5 }));
      ev.push(...F(rng.prob(0.5) ? "1 . . . 5 . 1 . . . 4 . 5 . . ." : "1 . . . 1 . 5 . . . 4 . 3 . . .", 'bajo', { octava: -1, vel: 0.5 }));
      if (n >= 2) ev.push(...F(melCairo[f % 8], 'oud', { octava: 0, vel: 0.75 }));
      if (f >= 8) ev.push(...F(respuestaCairo[f % 2], 'qanun', { octava: 1, vel: 0.35 }));
      if (n % 8 === 7) ev.push(...R('. . . . . . . . . . . . T T T T', { vel: 0.5 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ LA FORJA
  const melForja = [
    "1 - 2 - 3 - 4 - 5 - - - 4 3 2 -",
    "3 - 2 1 2 - 3 - 1 - - - . . . .",
    "5 - 6 - 7 - 8 - 7 6 5 - 6 5 4 -",
    "3 - 4 3 2 - 1 - 2 - 1 - - - . .",
  ];
  P.forja = {
    bpm: 84, maqam: 'rast', tonica: D3, volumen: 1.6,
    compas(n) {
      const ev = [];
      ev.push({ inst: 'campanilla', frec: 587.33, paso: 0, vel: 0.5 });
      ev.push({ inst: 'campanilla', frec: 587.33, paso: 8, vel: 0.35 });
      if (n % 2 === 1) ev.push({ inst: 'campanilla', frec: 880, paso: 12, vel: 0.25 });
      ev.push(...R('D . . . . . T . D . . . T . . .', { vel: 0.4 }));
      ev.push(...F("1 . . . 5 . . . 1' . . . 5 . . .", 'bajo', { octava: -1, vel: 0.4 }));
      if (n >= 1) ev.push(...F(melForja[(n - 1) % 4], 'oud', { octava: 0, vel: 0.65 }));
      if (n >= 9 && n % 8 >= 4) ev.push(...F(melForja[(n - 1) % 4], 'ney', { octava: 1, vel: 0.3 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ MAYDAN
  P.maydan = {
    bpm: 116, maqam: 'hijazkar', tonica: D3, volumen: 1.1,
    compas(n) {
      const ev = [];
      ev.push(...R('B . . . . . N . B . N . . . N .', { vel: 0.7 }));
      ev.push(...R('D . T . . . D . D . . . T . . .', { vel: 0.5 }));
      ev.push(...F("1 . 1 . 5 . 1 . 6 . 5 . 4 . 3 .", 'oud', { octava: -1, vel: 0.55 }));
      if (n % 4 === 0) ev.push(...F("5 - - - - - - - 8 - - - - - - -", 'nafir', { octava: 0, vel: 0.5 }));
      const mel = ["5 - 6 5 4 - 3 - 4 - 5 - 6 - 5 -", "4 - 3 - 2 - 1 - 2 - 3 - 1 - - -"];
      if (n >= 4) ev.push(...F(mel[n % 2], 'rebab', { octava: 1, vel: 0.55 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ DESPEDIDA
  const melDespedida = [
    "3 - - - 2 - - - 1 - 2 - 3 - 4 -",
    "4 - - - - - 3 - 2 - - - 3 - - -",
    "5 - - - 4 - 3 - 4 - - - 3 - 2 -",
    "1 - - - - - - - - - - - . . . .",
    "1 - 2 - 3 - - - 4 - - - 5 - - -",
    "6 - 5 - 4 - 3 - 4 - - - - - - -",
    "3 - 4 - 3 - 2 - 3 - 2 - 1 - - -",
    "1, - - - - - - - - - - - . . . .",
  ];
  P.despedida = {
    bpm: 56, maqam: 'saba', tonica: D3, volumen: 0.75,
    compas(n) {
      const ev = [];
      if (n % 2 === 0) ev.push({ inst: 'bordon', grado: 1, octava: -1, paso: 0, dur: 32, vel: 0.55 });
      ev.push(...F(melDespedida[n % 8], 'ney', { octava: 1, vel: 0.8 }));
      if (n >= 8) ev.push(...F(melDespedida[(n + 4) % 8], 'rebab', { octava: 0, vel: 0.45 }));
      if (n % 4 === 3) ev.push(...F("1 . . . . . . . . . . . . . . .", 'oud', { octava: -1, vel: 0.4 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ CAMPAMENTO
  const melCampa = [
    "1 . . . 2 . 3 . 4 . . . 3 . . .",
    "2 . 1 . . . . . 5, . . . 1 . . .",
    "4 . . . 5 . 6 . 5 . 4 . 3 . . .",
    "4 . 3 . 2 . . . 1 . . . . . . .",
  ];
  P.campamento = {
    bpm: 72, maqam: 'kurd', tonica: D3, volumen: 1.3,
    compas(n) {
      const ev = [];
      if (n % 4 === 0) ev.push({ inst: 'bordon', grado: 1, octava: -1, paso: 0, dur: 64, vel: 0.5 });
      ev.push(...R('F . . . . . k . F . . . k . . .', { vel: 0.35 }));
      ev.push(...F(melCampa[n % 4], 'oud', { octava: 0, vel: 0.6 }));
      if (n >= 8 && n % 8 < 4) ev.push(...F(melCampa[(n + 2) % 4], 'ney', { octava: 1, vel: 0.28 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ TENSIÓN
  P.tension = {
    bpm: 92, maqam: 'hijaz', tonica: D3, volumen: 1.0,
    compas(n) {
      const ev = [];
      if (n % 2 === 0) ev.push({ inst: 'bordon', grado: 1, octava: -1, paso: 0, dur: 32, vel: 0.6 });
      ev.push(...R('B . . . . . . . B . . . . . . .', { vel: 0.6 }));
      ev.push(...R('. . N . N . . . . . N . N . N N', { vel: 0.35 }));
      ev.push(...F("1 . 2 . 1 . 2 . 1 . 2 . 3 . 2 .", 'oud', { octava: -1, vel: 0.45 }));
      if (n % 4 === 3) ev.push(...F("5 - - - - - - - 6 - - - 5 - - -", 'rebab', { octava: 1, vel: 0.5 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ BATALLA
  const melBatalla = [
    "5 - - - 6 - 5 - 4 - 3 - 4 - - -",
    "3 - 2 - 3 - 4 - 5 - - - - - - -",
    "8 - - - 7 - 6 - 5 - 6 - 5 - 4 -",
    "3 - 4 - 3 - 2 - 1 - - - - - - -",
    "5 - 5 - 6 - 7 - 8 - - - 7 6 5 -",
    "6 - 5 - 4 - 3 - 4 - 5 - 4 - 3 -",
    "2 - 3 - 4 - 3 - 2 - 1 - 2 - 3 -",
    "1 - - - - - - - . . . . . . . .",
  ];
  P.batalla = {
    bpm: 140, maqam: 'hijaz', tonica: D3, volumen: 0.68,
    compas(n) {
      const ev = [];
      ev.push(...R('B . . . . . . . B . . . . . B .', { vel: 0.8 }));
      ev.push(...R('D . . k D . T . D . . k D . T .', { vel: 0.6 }));
      ev.push(...R('N . N N . N N . N . N N . N N N', { vel: 0.3 }));
      ev.push(...F("1 . 1 . 2 1 . 1 3 . 2 . 1 . 2 .", 'bajo', { octava: -1, vel: 0.6 }));
      ev.push(...F("1 . 1 . 2 1 . 1 3 . 2 . 1 . 2 .", 'oud', { octava: 0, vel: 0.4 }));
      if (n >= 2) ev.push(...F(melBatalla[(n - 2) % 8], 'rebab', { octava: 1, vel: 0.6 }));
      if (n % 2 === 0) ev.push(...F("5 - - - . . . . . . . . . . . .", 'nafir', { octava: -1, vel: 0.5, capa: 'extra' }));
      if (n % 8 === 0) ev.push({ inst: 'platillo', paso: 0, vel: 0.6 });
      return ev;
    },
  };

  // ------------------------------------------------------------------ JEFE
  P.jefe = {
    bpm: 150, maqam: 'kurd', tonica: D3, volumen: 0.62,
    compas(n) {
      const ev = [];
      ev.push(...R('B . . B . . B . B . . B . . B .', { vel: 0.85 }));
      ev.push(...R('D . T k D k T . D . T k D k T T', { vel: 0.55 }));
      ev.push(...F("1 1 . 1 2 . 1 . 1 1 . 1 3 . 2 .", 'bajo', { octava: -1, vel: 0.65 }));
      const coro = ["1 - - - - - - - - - - - - - - -", "2 - - - - - - - 1 - - - - - - -", "6, - - - - - - - - - - - - - - -", "5, - - - - - - - 7, - - - - - - -"];
      ev.push(...F(coro[n % 4], 'coro', { octava: 0, vel: 0.7 }));
      const mel = ["5 - 4 - 3 - 2 - 3 - 4 - 5 - 6 -", "5 - - - 4 3 2 - 1 - - - . . . .", "8 - 7 - 6 - 5 - 6 - 5 - 4 - 3 -", "2 - 3 - 4 - 3 - 2 - 1 - - - - -"];
      if (n >= 4) ev.push(...F(mel[n % 4], 'rebab', { octava: 1, vel: 0.6 }));
      if (n % 4 === 0) ev.push({ inst: 'platillo', paso: 0, vel: 0.5 });
      if (n % 4 === 2) ev.push(...F("1 - - - - - - - . . . . . . . .", 'nafir', { octava: -1, vel: 0.5 }));
      return ev;
    },
  };

  // ------------------------------------------------------------------ CRUZADOS
  const canto = [
    "1 - - - 2 - - - 3 - - - 2 - - -",
    "3 - 4 - 5 - - - 4 - 3 - 2 - - -",
    "1 - - - 3 - 2 - 1 - - - 7, - - -",
    "1 - - - - - - - - - - - - - - -",
  ];
  P.cruzados = {
    bpm: 58, maqam: 'dorico', tonica: D3, volumen: 2.4,
    compas(n) {
      const ev = [];
      if (n % 2 === 0) ev.push({ inst: 'bordon', grado: 1, octava: -1, paso: 0, dur: 32, vel: 0.5 });
      ev.push(...F(canto[n % 4], 'coro', { octava: -1, vel: 0.85 }));
      if (n >= 4) ev.push(...F(canto[n % 4], 'coro', { octava: 0, vel: 0.45 }));
      ev.push({ inst: 'tabl', paso: 0, vel: 0.5 });
      if (n % 2 === 1) ev.push({ inst: 'campanilla', frec: 196, paso: 8, vel: 0.6 });
      return ev;
    },
  };

  // ------------------------------------------------------------------ MONGOLES
  P.mongoles = {
    bpm: 100, maqam: 'pentatonica', tonica: 73.42, volumen: 1.25,
    compas(n) {
      const ev = [];
      ev.push(...R('G . . G . G . . G . . G . G . .', { vel: 0.6 }));
      if (n % 2 === 0) ev.push({ inst: 'garganta', grado: 1, octava: 0, paso: 0, dur: 32, vel: 0.9 });
      ev.push(...R('B . . . . . . . . . . . B . . .', { vel: 0.8 }));
      if (n >= 2) {
        const m = ["5 - - - 4 - - - 3 - - - 2 - - -", "3 - - - 2 - - - 1 - - - - - - -"];
        ev.push(...F(m[n % 2], 'nafir', { octava: 1, vel: 0.45 }));
      }
      return ev;
    },
  };

  // ------------------------------------------------------------------ VICTORIA
  P.victoria = {
    bpm: 100, maqam: 'rast', tonica: D3, volumen: 0.9,
    compas(n) {
      const ev = [];
      ev.push(...R('B . . . N . N . B . . . N N N N', { vel: 0.7 }));
      ev.push(...R('D . T . D . T . D . T . D . T T', { vel: 0.5 }));
      const fan = ["1 - - - 3 - 5 - 8 - - - - - - -", "7 - 6 - 5 - - - 6 - 5 - 4 - - -", "3 - 4 - 5 - 6 - 7 - 8 - 7 - 6 -", "5 - - - - - - - 1 - - - - - - -"];
      ev.push(...F(fan[n % 4], 'nafir', { octava: 0, vel: 0.5 }));
      ev.push(...F(fan[n % 4], 'oud', { octava: 0, vel: 0.5 }));
      if (n % 4 === 0) ev.push({ inst: 'platillo', paso: 0, vel: 0.5 });
      return ev;
    },
  };

  // ------------------------------------------------------------------ ESTRIBILLOS (frases sueltas)
  P._cronica = {
    bpm: 120, maqam: 'hijaz', tonica: D3,
    compas: () => F("1 3 5 8 - - - -", 'qanun', { octava: 1, vel: 0.5 }),
  };
  P._capitulo = {
    bpm: 60, maqam: 'hijaz', tonica: D3,
    compas: () => mezclar([{ inst: 'tabl', paso: 0, vel: 1 }, { inst: 'platillo', paso: 0, vel: 0.4 }], F("5 - - - - - 4 3 2 - 1 - - - - -", 'ney', { octava: 1, vel: 0.8 })),
  };
  P._victoria = {
    bpm: 110, maqam: 'rast', tonica: D3,
    compas: () => mezclar(R('B . N N B . . .', { vel: 0.8 }), F("1 3 5 8 - - - -", 'nafir', { octava: 0, vel: 0.6 }), F("1 3 5 8 - - - -", 'oud', { octava: 0, vel: 0.5 })),
  };
  P._derrota = {
    bpm: 60, maqam: 'saba', tonica: D3,
    compas: () => mezclar([{ inst: 'tabl', paso: 0, vel: 0.7 }], F("3 - 2 - 1 - - -", 'ney', { octava: 1, vel: 0.6 })),
  };
  P._mision = {
    bpm: 100, maqam: 'bayati', tonica: D3,
    compas: () => F("1 2 3 - 5 - - -", 'oud', { octava: 0, vel: 0.6 }),
  };
})();
