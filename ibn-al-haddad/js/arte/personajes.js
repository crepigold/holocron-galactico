/* Trajes de los personajes del Prólogo y conjuntos de animaciones que necesita cada uno.
 * Los colores buscan verosimilitud: lino sin teñir, añil (el tinte más común del Egipto medieval),
 * rubia (rojo), el amarillo de los ayyubíes, la malla gris de los francos…
 */
'use strict';
(function () {
  const IH = window.IH;

  const PIEL = { egipcio: '#a46b45', egipcioOsc: '#8a5634', egipcioClaro: '#b57d55', turco: '#c08a62', franco: '#d4a07e', francoRojo: '#cf9274' };

  const ANIM_JUGADOR = ['quieto', 'guardia', 'guardiaSinEscudo', 'andar', 'correr', 'saltar', 'caer', 'aterrizar', 'ataque1', 'ataque2', 'ataque3', 'fuerte', 'aereo', 'bloquear', 'bloqueoGolpe', 'parada', 'rodar', 'herido', 'aturdido', 'muerte', 'yacer', 'beber', 'hablar', 'arrodillado', 'levantarse', 'senalar', 'saludar', 'martillar', 'fuelle', 'cargar'];
  const ANIM_CIVIL = ['quieto', 'andar', 'correr', 'hablar', 'senalar', 'saludar', 'brazosCruzados', 'manosAtras'];
  const ANIM_SOLDADO = ['quieto', 'guardia', 'avanzar', 'andar', 'correr', 'ataque1', 'tajoArriba', 'estocada', 'embestida', 'bloquear', 'bloqueoGolpe', 'herido', 'aturdido', 'muerte', 'yacer', 'hablar', 'gritar', 'senalar', 'brazosCruzados', 'saltar', 'caer'];
  const ANIM_TIRADOR = ['quieto', 'avanzar', 'andar', 'correr', 'apuntar', 'disparar', 'recargar', 'herido', 'aturdido', 'muerte', 'yacer', 'guardia', 'ataque1', 'saltar', 'caer'];

  const T = {};

  // ---------------------------------------------------------------- Yusuf
  const yusufBase = {
    nombre: 'Yusuf', piel: PIEL.egipcio, pelo: '#1d120c', ojo: '#1a0f0b',
    tunica: '#d9cba8', mangaLarga: false, largo: 0.78, pantalon: '#bfae88', calzado: '#5b3a22',
    fajin: '#2f5a8a', fajinCola: true, tocado: 'turbante', colorTocado: '#efe6cf', colorTocado2: '#c9bd9f', colaTurbante: true,
    barba: 'bigote', colorBarba: '#2a1a12',
  };
  T.yusuf = Object.assign({}, yusufBase, { anims: ANIM_JUGADOR });
  T.yusufForja = Object.assign({}, yusufBase, { delantal: '#6a4428', arma: { tipo: 'martillo' }, anims: ['quieto', 'andar', 'correr', 'saltar', 'caer', 'aterrizar', 'martillar', 'golpeMartillo', 'fuelle', 'hablar', 'senalar', 'beber', 'cargar', 'rodar', 'herido'] });
  T.yusufMadera = Object.assign({}, yusufBase, { arma: { tipo: 'madera' }, anims: ANIM_JUGADOR });
  T.yusufSoldado = Object.assign({}, yusufBase, {
    tunica: '#33507a', mangaLarga: true, largo: 0.82, tiraz: '#d9a521', pantalon: '#cbbd9a', vendas: '#a89470',
    fajin: '#d9a521', laminar: '#7a5f43', tocado: 'conico', turbanteCasco: true, colorTocado: '#efe6cf', colorCasco: '#a9aeb3',
    arma: { tipo: 'espada', guarnicion: '#d4a73a', acero: '#d7dce0' },
    escudo: { tipo: 'redondo', color: '#8a3b26', color2: '#a14a2c', umbo: '#d4a73a' },
    anims: ANIM_JUGADOR,
  });
  T.yusufCivilEspada = Object.assign({}, yusufBase, { arma: { tipo: 'espada', guarnicion: '#d4a73a', acero: '#d7dce0' }, anims: ANIM_JUGADOR });
  T.cronista = {
    nombre: 'Yusuf, anciano', piel: '#9c6844', pelo: '#ddd6ca', tunica: '#2b3f5f', largo: 1.3, pantalon: '#2b3f5f',
    tocado: 'turbante', colorTocado: '#f3eee2', barba: 'larga', colorBarba: '#e8e2d6', fajin: '#8a6a2a',
    arma: { tipo: 'pergamino' }, anims: ['sentado', 'escribir', 'quieto', 'hablar'],
  };

  // ---------------------------------------------------------------- familia y vecinos
  T.ibrahim = {
    nombre: 'Ibrahim', piel: PIEL.egipcioOsc, pelo: '#4a3a2e', escala: 1.04, panza: 1.25, hombros: 1.2,
    tunica: '#6e6656', mangaLarga: false, largo: 0.85, pantalon: '#5b5446', calzado: '#3e2717',
    delantal: '#5e3b20', fajin: '#3b2a1b', tocado: 'gorro', colorTocado: '#7a2f22',
    barba: 'larga', colorBarba: '#8d877e', arma: { tipo: 'martillo' },
    anims: ['quieto', 'andar', 'hablar', 'martillar', 'brazosCruzados', 'senalar', 'manosAtras', 'sentado', 'fuelle', 'arrodillado', 'saludar'],
  };
  T.ibrahimEspada = Object.assign({}, T.ibrahim, { delantal: null, tunica: '#5b5446', arma: { tipo: 'espada', guarnicion: '#d4a73a', acero: '#d7dce0' }, anims: ['quieto', 'hablar', 'senalar', 'brazosCruzados', 'andar', 'sentado'] });
  T.ibrahimNoche = Object.assign({}, T.ibrahim, { arma: null, anims: ['quieto', 'hablar', 'senalar', 'brazosCruzados', 'manosAtras', 'andar', 'sentado', 'saludar'] });
  T.nur = {
    nombre: 'Nur', piel: PIEL.egipcioClaro, pelo: '#1a100b', escala: 0.93, tunica: '#ded0ae', largo: 1.32, vuelo: 1.2, mangaLarga: true,
    pantalon: '#ded0ae', calzado: '#7a3b2a', fajin: '#b8902f', tocado: 'velo', colorTocado: '#7a3b5a', colorTocado2: '#5e2b45',
    bordeFalda: '#7a3b5a', arma: { tipo: 'pergamino' }, anims: ['quieto', 'andar', 'hablar', 'senalar', 'saludar', 'manosAtras', 'correr', 'rezarManos'],
  };
  T.abuSalim = {
    nombre: 'Abu Salim', piel: PIEL.egipcioOsc, pelo: '#2a1a12', tunica: '#7c5c3c', largo: 0.75, mangaLarga: false,
    pantalon: '#a08a68', calzado: '#3a2414', tocado: 'turbante', colorTocado: '#d8cba8', barba: 'corta', colorBarba: '#9a948a',
    fajin: '#4a6a3a', arma: { tipo: 'odre' }, anims: ['quieto', 'andar', 'hablar', 'saludar', 'senalar', 'beber'],
  };
  T.hakawati = {
    nombre: 'El hakawati', piel: '#9a6440', pelo: '#e4ded2', tunica: '#5a3e6a', largo: 1.35, pantalon: '#5a3e6a',
    tocado: 'turbante', colorTocado: '#f2ede0', barba: 'larga', colorBarba: '#e4ded2', fajin: '#b8902f', tiraz: '#b8902f',
    arma: { tipo: 'baston' }, anims: ['sentado', 'sentadoHablar', 'quieto', 'hablar', 'senalar'],
  };
  T.musico = {
    nombre: 'Músico', piel: PIEL.egipcio, pelo: '#21140e', tunica: '#8a3a2a', largo: 1.0, pantalon: '#d2c4a2',
    tocado: 'turbante', colorTocado: '#e6dcc4', barba: 'corta', fajin: '#2f5a8a', arma: { tipo: 'oud' }, anims: ['tocarOud', 'sentado', 'hablar'],
  };
  T.pregonero = {
    nombre: 'Pregonero', piel: PIEL.egipcio, pelo: '#21140e', tunica: '#c9a227', largo: 1.05, tiraz: '#7a2f22', pantalon: '#e8dcc0',
    tocado: 'turbante', colorTocado: '#f5efe0', barba: 'corta', fajin: '#7a2f22', arma: { tipo: 'pergamino' },
    anims: ['quieto', 'hablar', 'senalar', 'gritar', 'andar'],
  };
  T.nino = {
    nombre: 'Amr', piel: PIEL.egipcio, pelo: '#1b100b', escala: 0.7, cabezaEsc: 1.25, tunica: '#c8b07a', largo: 0.9, mangaLarga: false,
    pantalon: '#c8b07a', calzado: '#6a4a2a', tocado: 'nino', anims: ['quieto', 'andar', 'correr', 'hablar', 'saltar', 'caer', 'saludar', 'senalar', 'aterrizar'],
  };
  T.nina = Object.assign({}, T.nino, { nombre: 'Niña', tunica: '#9a4a5a', tocado: 'velo', colorTocado: '#d9c79a', largo: 1.2 });

  // Mercaderes y vecinos (variantes con colores distintos)
  const vecinos = [
    ['mercader1', '#3a5f7a', '#e9dfc6', 'corta', PIEL.egipcio, 1.15],
    ['mercader2', '#7a4a2a', '#c9a227', 'larga', PIEL.egipcioOsc, 1.2],
    ['mercader3', '#4a6a3a', '#efe6cf', 'perilla', PIEL.egipcioClaro, 1.1],
    ['vecino1', '#b8a57c', '#efe6cf', 'corta', PIEL.egipcio, 0.85],
    ['vecino2', '#5a5a6a', '#d8cba8', 'bigote', PIEL.egipcioOsc, 0.8],
    ['vecino3', '#8a3a2a', '#e6dcc4', 'larga', PIEL.egipcio, 0.9],
  ];
  for (const [id, tun, tur, barba, piel, largo] of vecinos) {
    T[id] = {
      nombre: 'Vecino', piel, pelo: '#21140e', tunica: tun, largo, pantalon: '#cbbd9a', tocado: 'turbante', colorTocado: tur,
      barba, colorBarba: barba === 'larga' ? '#8f8a83' : '#21140e', fajin: '#2a2420', anims: ANIM_CIVIL.concat(['barrer', 'cargar', 'sentado', 'sentadoHablar']),
    };
  }
  T.vecina1 = { nombre: 'Vecina', piel: PIEL.egipcio, tunica: '#2f4a6a', largo: 1.35, vuelo: 1.2, pantalon: '#2f4a6a', tocado: 'velo', colorTocado: '#1e2a3a', calzado: '#3a2414', anims: ANIM_CIVIL.concat(['cargar', 'barrer']) };
  T.vecina2 = { nombre: 'Vecina', piel: PIEL.egipcioClaro, tunica: '#e2d6b8', largo: 1.35, vuelo: 1.2, pantalon: '#e2d6b8', tocado: 'velo', colorTocado: '#6a2a2a', calzado: '#3a2414', anims: ANIM_CIVIL.concat(['cargar', 'barrer']) };

  // ---------------------------------------------------------------- la corte
  T.sultan = {
    nombre: 'As-Salih Ayyub', piel: '#b07a52', pelo: '#2a1a12', tunica: '#e8dcc0', largo: 1.3, tiraz: '#d4a73a', pantalon: '#e8dcc0',
    tocado: 'turbante', colorTocado: '#f6f0e2', joya: '#3a8ac8', barba: 'corta', colorBarba: '#5a4a3a', fajin: '#2f5a8a',
    anims: ['yacer', 'quieto', 'hablar'],
  };
  T.shajar = {
    nombre: 'Shajar al-Durr', piel: '#c08a62', escala: 0.95, tunica: '#5a1e3a', largo: 1.38, vuelo: 1.25, pantalon: '#5a1e3a', tiraz: '#e0b448',
    tocado: 'velo', colorTocado: '#e8d8a8', colorTocado2: '#c8a860', bordeFalda: '#e0b448', fajin: '#e0b448', capa: '#2a1430', capaLargo: 1.1,
    anims: ['quieto', 'hablar', 'manosAtras', 'senalar', 'rezarManos', 'andar'],
  };
  T.medico = {
    nombre: 'Médico', piel: '#9a6440', pelo: '#d8d0c4', tunica: '#3a4a3a', largo: 1.3, pantalon: '#3a4a3a', tocado: 'turbante', colorTocado: '#e8e0cc',
    barba: 'larga', colorBarba: '#d8d0c4', anims: ['arrodillado', 'quieto', 'hablar'],
  };

  // ---------------------------------------------------------------- ejército del sultán
  T.sunqur = {
    nombre: 'Sunqur', piel: PIEL.turco, pelo: '#5a5048', escala: 1.05, hombros: 1.15, tunica: '#7a2c26', largo: 0.9, tiraz: '#d9a521',
    pantalon: '#3a3028', calzado: '#2e1e14', laminar: '#7f6a50', tocado: 'kalawta', colorTocado: '#f0e8d4', colorGorro: '#d9a521',
    barba: 'bigote', colorBarba: '#9a948a', fajin: '#2a2420', arma: { tipo: 'madera' },
    anims: ANIM_SOLDADO.concat(['manosAtras', 'parada', 'ataque2', 'ataque3', 'guardiaSinEscudo']),
  };
  T.baibars = {
    nombre: 'Baibars', piel: '#c89a74', pelo: '#3a2416', escala: 1.1, hombros: 1.2, tunica: '#1f3f6e', largo: 0.95, tiraz: '#e0b448',
    pantalon: '#2a2a33', calzado: '#1e140e', laminar: '#8d6c3c', tocado: 'kalawta', colorTocado: '#f4ecd8', colorGorro: '#e0b448',
    barba: 'corta', colorBarba: '#4a2a1a', ojo: '#9fc2d4', capa: '#5a1e1e', fajin: '#e0b448',
    arma: { tipo: 'espada', guarnicion: '#e0b448' }, anims: ANIM_SOLDADO.concat(['manosAtras', 'saludar']),
  };
  T.mameluco = {
    nombre: 'Mameluco', piel: PIEL.turco, pelo: '#2a1a12', tunica: '#9a3a2a', largo: 0.85, tiraz: '#d9a521', pantalon: '#3a3028', calzado: '#2e1e14',
    laminar: '#6e5a44', tocado: 'conico', turbanteCasco: true, colorTocado: '#efe6cf', barba: 'bigote', fajin: '#d9a521',
    arma: { tipo: 'espada' }, escudo: { tipo: 'redondo', color: '#2f5a8a', color2: '#3a6a9a', umbo: '#d4a73a' }, anims: ANIM_SOLDADO,
  };
  T.mamelucoArco = Object.assign({}, T.mameluco, { tunica: '#2f5a5a', escudo: null, arma: { tipo: 'arco' }, aljaba: true, anims: ['quieto', 'tensarArco', 'andar', 'hablar', 'brazosCruzados', 'manosAtras'] });
  T.recluta1 = {
    nombre: 'Hamid', piel: PIEL.egipcioOsc, pelo: '#1b100b', tunica: '#c9b48a', largo: 0.8, mangaLarga: false, pantalon: '#a89470', calzado: '#4a2c1c',
    gambeson: '#b3a079', tocado: 'turbante', colorTocado: '#e2d7bd', barba: 'corta', fajin: '#4a6a3a', arma: { tipo: 'lanza' },
    escudo: { tipo: 'rodela', color: '#7a5a3a' }, anims: ANIM_SOLDADO.concat(['sentado', 'sentadoHablar', 'manosAtras', 'arrodillado', 'tajoArriba']),
  };
  T.recluta2 = Object.assign({}, T.recluta1, { nombre: 'Recluta', piel: PIEL.egipcio, tunica: '#8a6a4a', gambeson: '#a68d68', colorTocado: '#cfc3a5', barba: 'bigote', fajin: '#7a2f22' });
  T.naffat = Object.assign({}, T.recluta1, { nombre: 'Naffat', tunica: '#4a3a2a', gambeson: '#6a5a44', colorTocado: '#8a7a5a', arma: null, escudo: null, anims: ['quieto', 'lanzar', 'hablar', 'andar', 'senalar', 'brazosCruzados'] });
  T.miliciano = {
    nombre: 'Vecino de Mansura', piel: PIEL.egipcioOsc, tunica: '#9a8a6a', largo: 0.8, mangaLarga: false, pantalon: '#9a8a6a', tocado: 'turbante', colorTocado: '#d8cba8',
    barba: 'corta', arma: { tipo: 'baston' }, anims: ['quieto', 'lanzar', 'gritar', 'hablar', 'andar', 'correr'],
  };

  // ---------------------------------------------------------------- francos (cruzados)
  T.sargento = {
    nombre: 'Sargento franco', piel: PIEL.franco, pelo: '#6a4a2a', malla: '#8d9196', mallaBrazos: true, pantalon: '#8d9196', calzado: '#3a2a1c',
    tunica: '#6d6a62', largo: 0.75, sobreveste: { color: '#2d4f86', largo: 0.72, emblema: 'flor', colorEmblema: '#d9b23a' },
    tocado: 'nasal', colorMalla: '#8d9196', barba: 'corta', colorBarba: '#6a4a2a',
    arma: { tipo: 'espada' }, escudo: { tipo: 'cometa', color: '#2d4f86', emblema: 'flor', colorEmblema: '#d9b23a' }, anims: ANIM_SOLDADO,
  };
  T.sargentoRojo = Object.assign({}, T.sargento, {
    sobreveste: { color: '#8c2a2a', largo: 0.72 }, escudo: { tipo: 'cometa', color: '#e2d8c0', franja: '#8c2a2a' }, barba: 'bigote', colorBarba: '#b07a3a', pelo: '#b07a3a',
  });
  T.sargentoVerde = Object.assign({}, T.sargento, {
    sobreveste: { color: '#3f6a3a', largo: 0.72, emblema: 'cruz', colorEmblema: '#e8e0c8' }, escudo: { tipo: 'cometa', color: '#3f6a3a', emblema: 'cruz', colorEmblema: '#e8e0c8' }, arma: { tipo: 'maza' }, piel: PIEL.francoRojo,
  });
  T.ballestero = {
    nombre: 'Ballestero', piel: PIEL.francoRojo, pelo: '#7a5a3a', gambeson: '#b9a57a', tunica: '#7a6a4a', largo: 0.7, pantalon: '#6a5a44', calzado: '#3a2a1c',
    tocado: 'nasal', colorMalla: '#8d9196', cofia: true, barba: 'bigote', colorBarba: '#7a5a3a', arma: { tipo: 'ballesta' }, anims: ANIM_TIRADOR,
  };
  T.caballero = {
    nombre: 'Caballero franco', piel: PIEL.franco, escala: 1.07, hombros: 1.15, malla: '#9a9ea3', pantalon: '#9a9ea3', calzado: '#2a2a2a',
    tunica: '#6d6a62', largo: 0.8, sobreveste: { color: '#d9c14a', largo: 0.85, emblema: 'leon', colorEmblema: '#8c2a2a' },
    tocado: 'yelmo', colorCasco: '#b0b4b8', cimera: '#8c2a2a', guantes: '#8d9196',
    arma: { tipo: 'espadaLarga' }, escudo: { tipo: 'cometa', color: '#d9c14a', emblema: 'leon', colorEmblema: '#8c2a2a' },
    anims: ANIM_SOLDADO.concat(['salto_golpe']),
  };
  T.templario = {
    nombre: 'Thibaut de Clermont', piel: PIEL.franco, escala: 1.13, hombros: 1.2, malla: '#9a9ea3', pantalon: '#9a9ea3', calzado: '#1e1e1e',
    tunica: '#6d6a62', largo: 0.8, sobreveste: { color: '#ece6d6', largo: 0.9, emblema: 'cruz', colorEmblema: '#b3262a' },
    tocado: 'yelmo', colorCasco: '#b6babe', cruzYelmo: '#b3262a', guantes: '#8d9196', capa: '#e6e0d0', capaLargo: 1.0,
    arma: { tipo: 'espadaLarga', guarnicion: '#8d9196' }, escudo: { tipo: 'cometa', color: '#ece6d6', emblema: 'cruz', colorEmblema: '#b3262a' },
    anims: ANIM_SOLDADO.concat(['salto_golpe', 'ataque2', 'guardiaSinEscudo', 'arrodillado']),
  };
  T.templarioSinEscudo = Object.assign({}, T.templario, { escudo: null, anims: T.templario.anims });
  T.templarioSinYelmo = Object.assign({}, T.templario, { tocado: 'cofia', colorMalla: '#9a9ea3', barba: 'corta', colorBarba: '#8a6a4a', pelo: '#8a6a4a', escudo: null, anims: ['arrodillado', 'yacer', 'hablar', 'quieto', 'muerte'] });

  // --------------------------------------------------------------- caché de sprites horneados
  const cache = {};
  IH.TRAJES = T;
  IH.sprite = function (id) {
    if (cache[id]) return cache[id];
    const traje = T[id];
    if (!traje) throw new Error('Traje desconocido: ' + id);
    const t0 = performance.now();
    cache[id] = IH.Esq.hornear(traje, IH.ANIMS, traje.anims);
    if (IH.DEPURAR) console.log('horneado', id, Math.round(performance.now() - t0) + ' ms');
    return cache[id];
  };
  IH.precargarSprites = function (ids) {
    for (const id of ids) IH.sprite(id);
  };
})();
