/* Capítulo I · Prólogo — El Cairo, otoño de 1249.
 *
 *   forja       La forja de Ibrahim: fuelle, martillo y temple (tutorial de interacción).
 *   calles      La calle mayor hasta Bab Zuwayla: vecinos, mercado, aguador, cuentacuentos,
 *               la proclama del sultán y la persecución por los tejados (tutorial de salto).
 *   maydan      El campo de entrenamiento bajo la Ciudadela: entrega y combate con Sunqur
 *               (tutorial de combate: combo, golpe fuerte, bloqueo, parada y voltereta).
 *   forjaNoche  La despedida: Ibrahim entrega a Yusuf la espada «Sabr». Nur le regala un cálamo.
 */
'use strict';
(function () {
  const Z = (IH.ZONAS = IH.ZONAS || {});
  const U = IH.U;

  const tieneCronica = (id) => IH.partida.cronicas.includes(id);
  function cronica(z, id, x, y) {
    if (tieneCronica(id)) return;
    z.objeto({ tipo: 'cronica', x, y: y != null ? y : z.suelo, cronica: id });
  }

  // Salto de un personaje no jugador entre dos puntos (arco parabólico)
  function* saltar(z, e, x1, y1, dur = 0.45, alto = 26) {
    const x0 = e.x, y0 = e.y;
    e.saltando = true;
    e.dir = Math.sign(x1 - x0) || e.dir;
    e.poner('saltar');
    IH.audio.sfx('salto', { x: e.x, vol: 0.4 });
    yield IH.interpolar(dur, (k, kl) => {
      e.x = U.lerp(x0, x1, kl);
      e.y = U.lerp(y0, y1, kl) - Math.sin(kl * Math.PI) * alto;
      if (kl > 0.5) e.poner('caer');
    }, (k) => k);
    e.x = x1;
    e.y = y1;
    e.vy = 0;
    e.saltando = false;
    e.poner('quieto');
  }
  IH.saltarPNJ = saltar;

  // ================================================================== LA FORJA
  Z.forja = {
    titulo: 'La forja de Ibrahim',
    subtitulo: 'Calle de los herreros · El Cairo, otoño de 1249',
    ancho: 760,
    fondo: { escena: 'forja', opc: { fragua: 200, ventana: 470, estante: 330, armero: 90 } },
    musica: 'forja',
    ambienteSonoro: 'forja',
    tranquila: true,
    sinCombate: true,
    traje: 'yusufForja',
    colorPolvo: '#6a5646',
    vineta: 0.55,
    entradas: { inicio: { x: 560, dir: -1 }, desdeCalles: { x: 700, dir: -1 } },
    salidas: [
      { lado: 'der', x: 748, a: 'calles', entrada: 'desdeForja', si: (z) => z.bandera('forjaHecha'), bloqueo: 'Antes tengo que terminar el encargo de padre.' },
    ],
    objetivo: (z) => (z.bandera('forjaHecha') ? 'Lleva las espadas al maydan, bajo la Ciudadela' : null),
    poblar(z) {
      const hecha = z.bandera('forjaHecha');
      z.objeto({ tipo: 'fragua', x: 200, id: 'fragua', intensidad: z.bandera('fuego') ? 1 : 0.35 });
      const fuelle = z.objeto({ tipo: 'fuelle', x: 160, id: 'fuelle', etiqueta: 'Avivar el fuego', radioInteraccion: 30 });
      const yunque = z.objeto({ tipo: 'yunque', x: 292, id: 'yunque', etiqueta: 'Forjar', hierro: 0 });
      const cubo = z.objeto({ tipo: 'barril', x: 352, id: 'cubo', agua: true, etiqueta: 'Templar' });
      z.objeto({ tipo: 'taburete', x: 246 });
      const ib = z.pnj({ traje: 'ibrahim', x: 272, dir: 1, id: 'ibrahim', hablante: 'ibrahim', anim: hecha ? 'brazosCruzados' : 'martillar', mirar: hecha });
      ib.alHablar = (zz) => {
        if (!zz.bandera('fuego')) return [['ibrahim', 'El fuelle está a la izquierda de la fragua, hijo. ¿O se te ha olvidado en una noche?']];
        if (!zz.bandera('forjado')) return [['ibrahim', 'La pieza está en el yunque, al rojo. Golpea antes de que se enfríe.']];
        if (!zz.bandera('templado')) return [['ibrahim', 'Al agua, rápido. Pero no demasiado rápido.']];
        return [['ibrahim', IH.azar.elegir(['¿Aún aquí? Sunqur no esperará todo el día.', 'Ve con cuidado por el mercado. Y no te pares a escuchar cuentos.', 'El fardo pesa, ¿eh? Así pesa el trabajo honrado.'])]];
      };
      // fuelle
      fuelle.alInteractuar = (zz) => (function* () {
        if (zz.bandera('fuego')) {
          yield zz.dialogo([['yusuf', 'El fuego ya ruge. Con eso basta.']]);
          return;
        }
        zz.cine(true);
        zz.cineObj = 0;
        yield zz.mover('yusuf', 138, { anim: 'andar' });
        zz.jugador.dir = 1;
        yield zz.minijuego(IH.Minijuegos.Fuelle);
        zz.anim('yusuf', null);
        zz.jugador.poner('quieto');
        zz.bandera('fuego', true);
        const ibr = zz.buscar('ibrahim');
        ibr.animForzada = 'senalar';
        ibr.mirar = true;
        zz.mirar(ibr, zz.jugador);
        yield zz.dialogo([
          ['ibrahim', '¿Lo oyes? Así ruge el fuego cuando está contento. Ni blanco, que quema el acero, ni rojo, que no lo ablanda.'],
          ['ibrahim', 'Ahora ven al yunque. Yo sujeto con las tenazas y tú golpeas. Como siempre.'],
        ]);
        ibr.animForzada = null;
        ibr.animBase = 'quieto';
        zz.buscar('yunque').hierro = 1;
        zz.cine(false);
        zz.objetivo('Forja la hoja en el yunque');
      })();
      // yunque
      yunque.alInteractuar = (zz) => (function* () {
        if (!zz.bandera('fuego')) {
          yield zz.dialogo([['yusuf', 'Primero hay que avivar la fragua. Con el fuego dormido no se forja nada.']]);
          return;
        }
        if (zz.bandera('forjado')) {
          yield zz.dialogo([['yusuf', 'Esta ya está forjada. Falta templarla.']]);
          return;
        }
        zz.cine(true);
        zz.cineObj = 0;
        const ibr = zz.buscar('ibrahim');
        yield [zz.mover('yusuf', 310, { anim: 'andar' }), ibr.irA(268, { final: 'senalar', dir: 1 })];
        zz.jugador.dir = -1;
        ibr.animForzada = 'senalar';
        const r = yield zz.minijuego(IH.Minijuegos.Martillo, { golpes: 5 });
        IH.partida.banderas.calidadHoja = r;
        zz.bandera('forjado', true);
        zz.jugador.poner('quieto');
        yield 0.4;
        const linea = r >= 0.8 ? ['ibrahim', 'Mírala. Ni una onda torcida. Tienes buena mano, aunque te pases la noche leyendo.', 'alegre'] : r >= 0.5 ? ['ibrahim', 'No está mal. Un poco torcida aquí… se puede enderezar. Otra vez será.'] : ['ibrahim', 'Bueno… para clavar estacas servirá. Concéntrate, hijo: el acero nota cuando piensas en otra cosa.', 'serio'];
        yield zz.dialogo([linea, ['ibrahim', 'Al agua. Ya sabes cómo.']]);
        ibr.animForzada = null;
        zz.cine(false);
        zz.objetivo('Templa la hoja en el agua');
      })();
      // temple
      cubo.alInteractuar = (zz) => (function* () {
        if (!zz.bandera('forjado') || zz.bandera('templado')) {
          yield zz.dialogo([['yusuf', zz.bandera('templado') ? 'Agua turbia y negra de hollín. El trabajo está hecho.' : 'El agua del temple. Primero hay que forjar la pieza.']]);
          return;
        }
        zz.cine(true);
        zz.cineObj = 0;
        yield zz.mover('yusuf', 334, { anim: 'andar' });
        zz.jugador.dir = 1;
        zz.buscar('yunque').hierro = 0;
        const r = yield zz.minijuego(IH.Minijuegos.Temple);
        zz.bandera('templado', true);
        yield 0.8;
        const ibr = zz.buscar('ibrahim');
        zz.mirar(ibr, zz.jugador);
        const comentario = r === 'bien' ? ['ibrahim', 'Justo a tiempo. Del color de la granada madura. Así se hace.', 'alegre'] : r === 'pronto' ? ['ibrahim', 'Demasiado pronto: estaba casi blanca. Quedará dura… y quebradiza. Como mi suegro.'] : ['ibrahim', 'Tarde. Ya se había enfriado. Quedará blanda, pero no se romperá.'];
        yield zz.dialogo([
          comentario,
          ['ibrahim', 'Con esta son seis. Seis espadas para los soldados del sultán.'],
          ['yusuf', 'Padre… ¿es verdad lo que dicen en el mercado? ¿Que los francos han tomado Damieta?'],
          ['ibrahim', 'Es verdad. Damieta cayó en un solo día. La guarnición huyó antes de ver la cara al enemigo.', 'serio'],
          ['ibrahim', 'Ahora el sultán está en Mansura, enfermo, y los francos esperan a que baje el río para venir hacia aquí.'],
          ['yusuf', '¿Y si llegan a El Cairo?'],
          ['ibrahim', 'Entonces forjaremos más espadas. Es lo que hacemos los herreros, Yusuf. La guerra la hacen otros.'],
          ['ibrahim', 'Toma. Lleva el fardo al *maydan*, al pie de la Ciudadela. Pregunta por *Sunqur*, el viejo mameluco. Él me paga.'],
          ['ibrahim', 'Y no te entretengas con la hija del librero, que te conozco.', 'alegre'],
          ['yusuf', '¡Padre!'],
        ]);
        yield zz.fundido(1, 0.7);
        zz.jugador.cambiarTraje('yusuf');
        IH.partida.traje = 'yusuf';
        ibr.animBase = 'brazosCruzados';
        ibr.mirar = true;
        zz.bandera('forjaHecha', true);
        yield zz.fundido(0, 0.7);
        zz.cine(false);
        zz.objetivo('Lleva las espadas al maydan, bajo la Ciudadela');
        IH.guardar();
      })();
      // detalles
      const libro = z.objeto({ tipo: 'punto', x: 470, id: 'libro', etiqueta: 'Leer' });
      libro.alInteractuar = (zz) => (function* () {
        yield zz.dialogo([
          ['yusuf', 'El libro que me prestó Nur: las memorias de *Usama ibn Munqidh*, un emir sirio que luchó contra los francos hace más de cien años.'],
          ['yusuf', 'Cuenta que un médico franco curó una pierna enferma… cortándola de un hachazo. Y que el enfermo murió en el acto.'],
          ['yusuf', 'Pero también cuenta que había francos honrados, que cumplían su palabra. Usama no los odiaba. Los observaba.'],
        ]);
        IH.desbloquearCronica('usama');
      })();
      const armero = z.objeto({ tipo: 'punto', x: 112, id: 'armero', etiqueta: 'Mirar' });
      armero.alInteractuar = (zz) => (function* () {
        yield zz.dialogo([['yusuf', 'Las espadas de padre. Ninguna lleva su nombre: dice que el buen acero no necesita firma.']]);
      })();
      const ventana = z.objeto({ tipo: 'punto', x: 520, id: 'ventana', etiqueta: 'Asomarse' });
      ventana.alInteractuar = (zz) => (function* () {
        yield zz.dialogo([['yusuf', 'La calle de los herreros ya hierve de gente. Huele a carbón, a pan recién hecho y a estiércol de burro. Huele a casa.']]);
      })();
      cronica(z, 'acero', 60);
      // motas de polvo en el rayo de luz de la ventana
      z.def.actualizar = (zz, dt) => {
        if (Math.random() < dt * 6) zz.particulas.emitir('mota', 470 + U.lerp(-25, 60, Math.random()), U.lerp(140, 290, Math.random()), 1, { color: '#ffe8b0' });
      };
    },
    // rayo de luz de la ventana
    dibujarDelante(z, ctx, cx, cy) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#ffe8b0';
      ctx.beginPath();
      ctx.moveTo(472 - cx, 122 - cy);
      ctx.lineTo(508 - cx, 122 - cy);
      ctx.lineTo(600 - cx, 300 - cy);
      ctx.lineTo(540 - cx, 300 - cy);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
    alEntrar: function* (z) {
      if (z.bandera('forjaIntro')) return;
      z.bandera('forjaIntro', true);
      z.cine(true);
      z.fundidoA = 1;
      const ib = z.buscar('ibrahim');
      z.cam.objetivo = { x: 60, y: 0 };
      yield z.fundido(0, 3);
      yield 1.2;
      yield z.camaraA(400, 3);
      yield z.dialogo([
        ['ibrahim', '¡Yusuf! El sol ya está sobre los tejados y la fragua sigue medio dormida. ¿Piensas forjar con el aliento?'],
        ['yusuf', 'Ya voy, padre. Anoche Nur me tuvo leyendo hasta tarde.'],
      ]);
      ib.animBase = 'quieto';
      ib.mirar = true;
      z.mirar(ib, z.jugador);
      yield 0.4;
      yield z.dialogo([
        ['ibrahim', 'Leyendo… Las letras no templan el acero, hijo.'],
        ['ibrahim', 'Aviva el fuego. Tengo un encargo de seis espadas para los soldados de la Ciudadela, y a los soldados no se les hace esperar.', 'serio'],
      ]);
      z.camaraSeguir();
      z.cine(false);
      z.objetivo('Aviva el fuego con el fuelle');
      z.buscar('fuelle').marca = null;
    },
  };

  // ================================================================== LAS CALLES DE EL CAIRO
  const PUERTA = 2250;
  Z.calles = {
    titulo: 'La Qasaba',
    subtitulo: 'La gran calle de El Cairo',
    ancho: 2700,
    fondo: { escena: 'cairo', opc: { babZuwayla: PUERTA, semilla: 1249 } },
    musica: 'cairo',
    ambienteSonoro: 'ciudad',
    tranquila: true,
    sinCombate: true,
    entradas: { desdeForja: { x: 80, dir: 1 }, desdeMaydan: { x: 2660, dir: -1 }, inicio: { x: 80, dir: 1 } },
    solidos: [
      // carro volcado y cajas que cortan la calle: hay que pasar por arriba
      { x: 1641, y: 282, w: 18, h: 18 },
      { x: 1659, y: 266, w: 18, h: 34 },
      { x: 1750, y: 222, w: 100, h: 78 },
      { x: 1950, y: 236, w: 90, h: 64 },
      { x: 2040, y: 282, w: 18, h: 18 },
    ],
    plataformas: [
      { x: 1686, y: 254, w: 50 },
      { x: 1866, y: 206, w: 64 },
      { x: 2060, y: 262, w: 48 },
    ],
    salidas: [
      { lado: 'izq', x: 20, a: 'forja', entrada: 'desdeCalles' },
      { lado: 'der', x: 2690, a: 'maydan', entrada: 'inicio', si: (z) => z.bandera('espadasRecuperadas'), bloqueo: 'Antes tengo que recuperar el fardo de espadas.' },
    ],
    objetivo: (z) => (z.bandera('espadasRecuperadas') ? 'Cruza Bab Zuwayla y sube al maydan de la Ciudadela' : 'Lleva las espadas al maydan, bajo la Ciudadela'),
    poblar(z) {
      // estructuras visibles de la carrera por los tejados
      z.objeto({ tipo: 'cajas', x: 1650, w: 18, h: 18 });
      z.objeto({ tipo: 'cajas', x: 1668, w: 18, h: 34 });
      z.objeto({ tipo: 'toldoPlat', x: 1711, y: 254, w: 50, color: '#2f5a8a' });
      z.objeto({ tipo: 'tejado', x: 1800, y: 222, w: 100, color: '#cdb08a' });
      z.objeto({ tipo: 'balcon', x: 1898, y: 206, w: 64 });
      z.objeto({ tipo: 'tejado', x: 1995, y: 236, w: 90, color: '#c49c80' });
      z.objeto({ tipo: 'cajas', x: 2049, w: 18, h: 18 });
      z.objeto({ tipo: 'toldoPlat', x: 2084, y: 262, w: 48, color: '#c9a227' });
      z.objeto({ tipo: 'carro', x: 1610, carga: 'jarras' });
      // vecinos y mercado
      z.pnj({ traje: 'vecina1', x: 180, anim: 'barrer', patrulla: [140, 230], animAndar: 'andar', hablante: 'vecina', ladridos: ['¡Yusuf! Dile a tu padre que el martilleo empieza muy temprano.', 'Otra vez el polvo… ¡esta calle no tiene remedio!'], hablar: [['vecina', 'Tu padre trabaja como diez hombres, Yusuf. A ver si sales a él y no al vago de tu tío.']] });
      const nur = z.pnj({ traje: 'nur', x: 330, dir: -1, id: 'nur', hablante: 'nur', anim: 'quieto', marca: z.bandera('hablaNur') ? null : '!' });
      nur.alHablar = (zz) => (function* () {
        if (zz.bandera('hablaNur')) {
          yield zz.dialogo([['nur', IH.azar.elegir(['Ve, ve. Que Sunqur no te espere.', '¿Todavía aquí? Vas a llegar al maydan con la luna.', 'Cuando vuelvas, me lo cuentas todo. Con detalles.'])]]);
          return;
        }
        nur.marca = null;
        yield zz.dialogo([
          ['nur', '¡Yusuf! Hueles a carbón desde aquí.', 'alegre'],
          ['yusuf', 'Y tú a tinta. Estamos empatados.'],
          ['nur', '¿Has leído lo que te dejé? El libro de Usama.'],
        ]);
        const r = yield zz.eleccion(null, ['Sí. Es increíble lo que cuenta de los francos.', 'Todavía no… la fragua no me deja tiempo.']);
        if (r === 0) yield zz.dialogo([['nur', 'Lo sabía. Algún día escribirás tus propias memorias, ya verás. «Yusuf el herrero, sus aventuras y desventuras».', 'alegre'], ['yusuf', '¿Quién iba a leer las aventuras de un herrero?'], ['nur', 'Yo.']]);
        else yield zz.dialogo([['nur', 'Mentiroso. Tienes el libro abierto junto a la ventana desde hace tres días.', 'alegre'], ['yusuf', '…Por la página cuarenta.']]);
        yield zz.dialogo([
          ['nur', 'Mi padre dice que ha llegado un pregonero de la Ciudadela. Que va a leer algo en la plaza.', 'serio'],
          ['nur', 'La gente cuenta cosas horribles de Damieta… Ten cuidado, ¿quieres?'],
          ['yusuf', 'Solo voy a entregar unas espadas, Nur.'],
          ['nur', 'Eso dicen siempre los que acaban en las canciones.'],
        ]);
        zz.bandera('hablaNur', true);
      })();
      z.objeto({ tipo: 'puesto', x: 480, mercancia: 'especias', color: '#b8402a' });
      z.pnj({ traje: 'mercader2', x: 486, dir: -1, hablante: 'especiero', anim: 'quieto', ladridos: ['¡Pimienta de Malabar! ¡Canela de Ceilán!', '¡Jengibre, clavo, azafrán! ¡Lo mejor del Yemen!'], hablar: [['especiero', 'Las naves de Alejandría ya no zarpan, hijo. Dicen que los francos vigilan la costa.'], ['especiero', 'La pimienta ha doblado su precio en un mes. La guerra es mala para todos… salvo para los que venden pimienta.', 'alegre']] });
      z.objeto({ tipo: 'puesto', x: 600, mercancia: 'ceramica', color: '#2f5a8a' });
      z.pnj({ traje: 'mercader3', x: 606, dir: -1, hablante: 'alfarero', anim: 'brazosCruzados', hablar: [['alfarero', 'Mira, pero no toques, hijo del herrero. Tu padre hace espadas; yo hago cosas que se rompen.']] });
      z.objeto({ tipo: 'gato', x: 652, estado: 'sentado', dir: -1, color: '#c88a4a' });
      for (let i = 0; i < 3; i++) z.objeto({ tipo: 'tinaja', x: 630 + i * 11, color: i % 2 ? '#a8603a' : '#c87a4a' });
      const abu = z.pnj({ traje: 'abuSalim', x: 770, patrulla: [730, 830], vel: 24, hablante: 'abuSalim', id: 'abuSalim', marca: IH.partida.aguaMax > 0 ? null : '!', ladridos: ['¡Agua fresca del Nilo! ¡Agua para el sediento!', '¡Agua! ¡Que Dios premie a quien da de beber!'] });
      abu.alHablar = (zz) => (function* () {
        if (IH.partida.aguaMax > 0) {
          yield zz.dialogo([['abuSalim', '¿Ya tienes sed otra vez? Rellena el odre en cualquier pozo o junto a una hoguera del campamento, hijo.']]);
          return;
        }
        abu.marca = null;
        yield zz.dialogo([
          ['abuSalim', '¡Yusuf, hijo de Ibrahim! Tienes cara de sed. Toma, bebe.'],
          ['yusuf', 'Gracias, Abu Salim. ¿Qué te debo?'],
          ['abuSalim', 'Nada. Y quédate el odre: tengo diez. He oído que medio Cairo se va a ir a la guerra, y en la guerra el agua vale más que el oro.'],
          ['abuSalim', 'Bebe cuando estés herido y verás cómo te vuelve el alma al cuerpo.'],
        ]);
        IH.partida.aguaMax = 3;
        IH.partida.agua = 3;
        IH.audio.sfx('beber');
        IH.notificar('Has conseguido el odre de agua  ·  ' + IH.entrada.etiqueta('curar') + ' para beber y curarte', { vida: 5 });
        IH.desbloquearCronica('aguadores');
      })();
      z.objeto({ tipo: 'palomas', x: 900, y: z.suelo, n: 8 });
      // el cuentacuentos
      z.pnj({ traje: 'nino', x: 985, dir: 1, anim: 'quieto', mirar: false });
      z.pnj({ traje: 'nina', x: 1040, dir: -1, anim: 'quieto', mirar: false });
      const hk = z.pnj({ traje: 'hakawati', x: 1012, dir: -1, anim: 'sentadoHablar', hablante: 'hakawati', mirar: false, etiqueta: 'Escuchar', marca: tieneCronica('saladino') ? null : '?' });
      hk.alHablar = (zz) => (function* () {
        hk.marca = null;
        if (tieneCronica('saladino')) {
          yield zz.dialogo([['hakawati', 'Vuelve mañana, joven herrero. Mañana toca la historia de Antar y la bella Abla.']]);
          return;
        }
        yield zz.dialogo([
          ['hakawati', 'Acércate, joven herrero. ¿Conoces la historia del sultán que venció a la sed?'],
          ['hakawati', 'Fue hace sesenta años, en pleno verano. Los francos marchaban hacia Tiberíades bajo un sol que derretía el hierro de sus cotas.'],
          ['hakawati', '*Salah ad-Din* no les dio batalla. Les dio sed. Les cortó el paso a los pozos y prendió fuego a la hierba seca, y el humo les cegaba los ojos y les quemaba la garganta.'],
          ['hakawati', 'En los Cuernos de *Hattin*, al amanecer, los caballeros más orgullosos del mundo se rindieron por un sorbo de agua.'],
          ['hakawati', 'Tres meses después, Jerusalén volvió a nuestras manos. Y el sultán no permitió saqueos: dejó marchar a los cristianos que pudieron pagar su rescate… y a muchos que no pudieron.'],
          ['amr', '¡Otra! ¡Cuenta la de los elefantes!'],
          ['hakawati', 'Mañana, mañana. La garganta de un viejo también conoce la sed.'],
        ]);
        IH.desbloquearCronica('saladino');
        IH.desbloquearCronica('cuentacuentos');
      })();
      const musico = z.pnj({ traje: 'musico', x: 1150, dir: 1, anim: 'tocarOud', mirar: false, etiqueta: 'Escuchar' });
      musico.alHablar = [['narrador', 'El músico improvisa un *taqsim* en el maqam bayati. Las notas se cuelan entre el ruido del mercado como el agua entre las piedras.']];
      for (let i = 0; i < 3; i++) z.objeto({ tipo: 'gallina', x: 1220 + i * 30, min: 1200, max: 1330, dir: i % 2 ? 1 : -1, color: i === 1 ? '#a86a3a' : '#e8dcc8' });
      z.objeto({ tipo: 'burro', x: 1360, dir: -1, carga: true });
      z.objeto({ tipo: 'puesto', x: 1250, mercancia: 'fruta', color: '#3f6a3a' });
      z.pnj({ traje: 'vecino3', x: 1256, dir: -1, anim: 'quieto', ladridos: ['¡Dátiles de Medina, dulces como la miel!', '¡Higos! ¡Granadas! ¡Para el camino, para el corazón!'] });
      // el pregonero y la gente que escucha
      z.objeto({ tipo: 'cajas', x: 1530, w: 20, h: 14 });
      z.plataformas.push({ x: 1520, y: 286, w: 20 });
      const pg = z.pnj({ traje: 'pregonero', x: 1530, y: 286, dir: -1, id: 'pregonero', hablante: 'pregonero', anim: 'quieto', mirar: false });
      pg.alHablar = [['pregonero', '¡Al maydan de la Ciudadela, los que tengan valor! ¡Paga, pan y la gratitud del sultán!']];
      z.pnj({ traje: 'vecino1', x: 1450, dir: 1, anim: 'brazosCruzados', mirar: false, hablante: 'vecino', hablar: [['vecino', '¿La paga de un soldado? Mi cuñado volvió de Siria sin paga y sin una oreja.']] });
      z.pnj({ traje: 'vecino2', x: 1472, dir: 1, anim: 'quieto', mirar: false });
      z.pnj({ traje: 'vecina2', x: 1585, dir: -1, anim: 'quieto', mirar: false });
      z.pnj({ traje: 'mercader1', x: 1606, dir: -1, anim: 'manosAtras', mirar: false });
      // el pequeño ladrón
      const amr = z.pnj({ traje: 'nino', x: 1300, dir: 1, id: 'amr', hablante: 'amr', anim: 'quieto', visible: false, mirar: true });
      if (z.bandera('espadasRecuperadas')) amr.borrar = true;
      // soldados de patrulla
      for (const [x, p] of [[2160, [2140, 2520]], [2190, [2170, 2560]]]) {
        z.pnj({ traje: 'mameluco', x, patrulla: p, vel: 30, hablante: 'mameluco', ladridos: ['¡Paso! ¡Abrid paso a los soldados del sultán!', '¿Qué miras, chico?', 'Otro voluntario… Que Dios nos ayude.'], hablar: (zz) => (function* () {
          yield zz.dialogo([
            ['mameluco', '¿Qué quieres, egipcio? Si buscas pelea, has elegido mal día.'],
            ['yusuf', 'Llevo espadas para Sunqur, al maydan.'],
            ['mameluco', '¿Sunqur? Ese viejo lobo… Cruza la puerta y sube hacia la Ciudadela. Y no te quedes mirando: el maydan no es lugar para curiosos.'],
          ]);
          IH.desbloquearCronica('mamelucos');
        })() });
      }
      cronica(z, 'al_qahira', 250);
      cronica(z, 'qasaba', 1906, 206);
      cronica(z, 'bab_zuwayla', PUERTA - 60);
    },
    disparadores: [
      {
        id: 'proclama',
        x: 1370,
        w: 60,
        si: (z) => !z.bandera('espadasRecuperadas'),
        guion: function* (z) {
          z.cine(true);
          yield z.mover('yusuf', 1420, { anim: 'andar' });
          z.mirar('yusuf', 1);
          yield z.camaraA(1500, 2);
          const pg = z.buscar('pregonero');
          IH.audio.sfx('cuerno', { vol: 0.5 });
          pg.animForzada = 'gritar';
          yield 1.2;
          yield z.dialogo([
            ['pregonero', '¡Oíd, oíd, gentes de El Cairo! ¡Escuchad las palabras de nuestro señor, el sultán *al-Malik as-Salih Ayyub*!'],
            ['pregonero', '¡Los francos han desembarcado en Damieta con un ejército innumerable, y su rey jura que comerá dátiles en nuestras azoteas!'],
            ['pregonero', 'Nuestro señor el sultán aguarda al enemigo en *Mansura* con sus valientes mamelucos. ¡Pero el enemigo es mucho y el tiempo, poco!'],
            ['pregonero', '¡Todo hombre sano que sepa sostener un arma, que se presente en el *maydan* de la Ciudadela! ¡Habrá paga, pan y la gratitud del sultán!'],
          ]);
          pg.animForzada = 'hablar';
          IH.audio.sfx('multitud', { vol: 0.5 });
          yield z.dialogo([
            ['vecino', '¿La paga de un soldado? ¡Mi cuñado volvió de Siria sin paga y sin una oreja!'],
            ['vecina', '¡Que vayan los mamelucos, que para eso cobran!'],
            ['yusuf', '(Mansura… Medio Egipto está allí. Y el sultán, enfermo.)'],
          ]);
          IH.desbloquearCronica('damieta');
          IH.desbloquearCronica('ayyubies');
          pg.animForzada = null;
          // ¡el ladronzuelo!
          const amr = z.buscar('amr');
          amr.visible = true;
          amr.x = z.cam.x - 10;
          yield amr.irA(1412, { vel: 150, anim: 'correr' });
          IH.audio.sfx('rodar', { x: amr.x });
          z.jugador.poner('herido', true);
          z.bocadillo(amr, '¡Para el ejército del sultán!', 2);
          yield amr.irA(1600, { vel: 140, anim: 'correr' });
          z.mirar('yusuf', 1);
          yield z.dialogo([['yusuf', '¡Eh! ¡Esas espadas son del sultán! ¡Vuelve aquí, ladronzuelo!', 'enfadado']]);
          z.camaraSeguir();
          z.cine(false);
          z.objetivo('Atrapa al chico que ha robado el fardo de espadas');
          z.ejecutar(persecucion(z), 'persecucion', false);
        },
      },
    ],
  };

  // El chico corre por cajas, toldos y azoteas, y espera si Yusuf se queda atrás
  function* persecucion(z) {
    const amr = z.buscar('amr');
    const J = z.jugador;
    const cerca = (d = 70) => () => Math.abs(J.x - amr.x) < d && Math.abs(J.y - amr.y) < 60;
    const burla = (t) => z.bocadillo(amr, t, 2);
    yield amr.irA(1628, { vel: 120, anim: 'correr' });
    yield cerca(90);
    burla('¡Más rápido, herrero!');
    yield* saltar(z, amr, 1650, 282);
    yield* saltar(z, amr, 1668, 266);
    yield* saltar(z, amr, 1704, 254);
    yield cerca(60);
    yield* saltar(z, amr, 1765, 222, 0.5, 30);
    yield amr.irA(1835, { vel: 110, anim: 'correr' });
    yield cerca(70);
    burla('¡Ni los mamelucos me pillan a mí!');
    yield* saltar(z, amr, 1880, 206, 0.5, 26);
    yield amr.irA(1920, { vel: 110, anim: 'correr' });
    yield cerca(60);
    yield* saltar(z, amr, 1968, 236, 0.5, 18);
    yield amr.irA(2030, { vel: 110, anim: 'correr' });
    yield cerca(70);
    burla('¡Uf… pesan mucho estas espadas!');
    yield* saltar(z, amr, 2076, 262, 0.45, 16);
    yield* saltar(z, amr, 2125, 300, 0.45, 16);
    amr.poner('quieto');
    yield cerca(40);
    // atrapado
    z.cine(true);
    z.mirar(amr, J);
    yield z.mover('yusuf', amr.x - 22, { anim: 'andar' });
    z.mirar('yusuf', 1);
    yield z.dialogo([
      ['amr', '¡Vale, vale! ¡Me rindo! Toma tu fardo, hijo del herrero.'],
      ['yusuf', '¿Se puede saber qué pensabas hacer con seis espadas?'],
      ['amr', 'Ir a Mansura. Matar francos. Que el sultán me haga emir y me regale un caballo blanco.', 'alegre'],
      ['yusuf', '¿Cuántos años tienes?'],
      ['amr', 'Diez. Bueno… casi.'],
      ['yusuf', 'Entonces aún te faltan unos cuantos para ser emir. Vete a casa, Amr.'],
      ['amr', '¡Algún día seré más famoso que tú! ¡Ya lo verás!'],
    ]);
    z.bandera('espadasRecuperadas', true);
    yield amr.irA(1700, { vel: 140, anim: 'correr' });
    amr.borrar = true;
    z.cine(false);
    z.objetivo('Cruza Bab Zuwayla y sube al maydan de la Ciudadela');
    IH.guardar();
  }

  // ================================================================== EL MAYDAN
  Z.maydan = {
    titulo: 'El maydan de la Ciudadela',
    subtitulo: 'Donde se forjan los soldados',
    ancho: 1500,
    fondo: { escena: 'maydan', opc: {} },
    musica: 'maydan',
    ambienteSonoro: 'viento',
    colorPolvo: '#d8bc8a',
    entradas: { inicio: { x: 40, dir: 1 } },
    salidas: [{ lado: 'izq', x: 12, a: 'calles', entrada: 'desdeMaydan', si: (z) => !z.bandera('alistado') && !z.leccion, bloqueo: 'Sunqur me está mirando. No me voy a ir ahora.' }],
    solidos: [
      { x: 1416, y: 266, w: 12, h: 30, soloProyectil: true },
      { x: 1446, y: 266, w: 12, h: 30, soloProyectil: true },
    ],
    objetivo: (z) => (z.bandera('alistado') ? null : 'Entrega las espadas a Sunqur'),
    poblar(z) {
      z.objeto({ tipo: 'caballo', x: 150, dir: 1, color: '#5a3a22', silla: '#8a2a24' });
      z.objeto({ tipo: 'caballo', x: 205, dir: -1, color: '#c8b8a0', silla: '#2f5a8a' });
      z.objeto({ tipo: 'tambores', x: 300 });
      z.objeto({ tipo: 'estandarte', x: 330, color: '#d9a521', emblema: 'texto' });
      z.objeto({ tipo: 'armero', x: 420 });
      const sq = z.pnj({ traje: 'sunqur', x: 470, dir: -1, id: 'sunqur', hablante: 'sunqur', anim: 'manosAtras', marca: z.bandera('alistado') ? null : '!' });
      sq.alHablar = (zz) => entrenamiento(zz, sq);
      const m = z.objeto({ tipo: 'maniqui', x: 560, id: 'maniqui' });
      m.alGolpe = (o, g) => {
        if (z.alGolpeManiqui) z.alGolpeManiqui(g);
      };
      // reclutas practicando
      z.objeto({ tipo: 'maniqui', x: 724 });
      z.pnj({ traje: 'recluta1', x: 700, dir: 1, anim: 'ataque1', repetir: true, mirar: false, hablante: 'hamid', hablar: [['recluta', 'Mil golpes al día, dice Sunqur. Llevo seiscientos y no siento los brazos.']] });
      z.objeto({ tipo: 'maniqui', x: 844 });
      z.pnj({ traje: 'recluta2', x: 820, dir: 1, anim: 'tajoArriba', repetir: true, mirar: false });
      z.pnj({ traje: 'mameluco', x: 950, dir: 1, anim: 'ataque1', repetir: true, mirar: false, hablante: 'mameluco', alGolpe: () => IH.audio.sfx('choque', { x: 965, vol: 0.4 }), hablar: [['mameluco', '¿Quieres probar, egipcio? Ah, no. Primero Sunqur, luego los mayores.']] });
      z.pnj({ traje: 'mameluco', x: 978, dir: -1, anim: 'bloquear', mirar: false });
      // arqueros
      for (const x of [1160, 1210]) {
        const a = z.pnj({ traje: 'mamelucoArco', x, dir: 1, anim: 'tensarArco', mirar: false, hablante: 'mameluco', hablar: [['mameluco', 'Un mameluco dispara tres flechas en el tiempo en que un franco tensa su ballesta. Y a caballo.']] });
        a.tDisparo = U.lerp(1, 3, Math.random());
      }
      z.objeto({ tipo: 'diana', x: 1422 });
      z.objeto({ tipo: 'diana', x: 1452 });
      z.def.actualizar = (zz, dt) => {
        for (const e of zz.entidades) {
          if (e.traje !== 'mamelucoArco') continue;
          e.tDisparo -= dt;
          if (e.tDisparo <= 0) {
            e.tDisparo = U.lerp(2.2, 4, Math.random());
            IH.audio.sfx('arco', { x: e.x, vol: 0.6 });
            zz.agregar(new IH.Proyectil(zz, { x: e.x + 12, y: e.y - 38, vx: 360, vy: -6 + Math.random() * 6, dano: 0, dueno: 'decor', tipo: 'flecha' }));
          }
        }
      };
      cronica(z, 'maydan', 1060);
    },
  };

  // Entrega del fardo y entrenamiento con Sunqur
  function* entrenamiento(z, sq) {
    if (z.bandera('alistado')) {
      yield z.dialogo([['sunqur', 'Bab al-Futuh. Tres días. Al alba. Si llegas tarde, te mando de vuelta a la fragua a patadas.']]);
      return;
    }
    sq.marca = null;
    z.cine(true);
    yield z.mover('yusuf', 444, { anim: 'andar' });
    z.mirar('yusuf', 1);
    z.mirar(sq, -1);
    sq.animForzada = 'brazosCruzados';
    yield z.dialogo([
      ['sunqur', 'Hm. Otro muchacho de la ciudad que viene a ver a los soldados. ¿Te has perdido?'],
      ['yusuf', 'Traigo las espadas de mi padre, Ibrahim el herrero. Son para Sunqur.'],
      ['sunqur', 'Yo soy Sunqur. A ver…'],
    ]);
    IH.audio.sfx('choque', { x: sq.x, vol: 0.6 });
    yield 0.8;
    yield z.dialogo([
      ['sunqur', 'Buen acero. Tu padre sabe lo que hace. Dile que le pagaré cuando el sultán me pague a mí… es decir, nunca.', 'alegre'],
      ['sunqur', 'Es broma. Toma: diez dinares. Cuéntalos delante de él, que es desconfiado como todos los herreros.'],
      ['yusuf', 'Sunqur… El pregonero dice que el sultán necesita hombres.'],
      ['sunqur', '¿Y?'],
      ['yusuf', 'Quiero ir a Mansura.'],
      ['sunqur', '¿Tú? ¿Un egipcio de la calle de los herreros? Muchacho, a los mamelucos nos compraron en las estepas cuando teníamos tu edad, y llevamos diez años aprendiendo a matar.', 'serio'],
    ]);
    const r = yield z.eleccion(null, ['Sé usar un martillo. Una espada no puede ser tan distinta.', 'Mi ciudad está en peligro. No pienso quedarme mirando.', 'Por favor. Déjame intentarlo.']);
    IH.partida.banderas.motivoAlistamiento = r;
    const resp = [
      ['sunqur', '¿Que no es tan distinta? Ja. Un martillo no te devuelve el golpe, chico.', 'alegre'],
      ['sunqur', 'Eso dicen todos. Luego ven a un caballero franco cargando y se les olvida hasta cómo se llaman.', 'serio'],
      ['sunqur', 'Al menos eres educado. Eso ya es más de lo que puedo decir de la mitad de mis mamelucos.'],
    ][r];
    yield z.dialogo([resp, ['sunqur', 'Coge esa espada de madera. Veamos si eres tan bueno con ella como con la lengua.']]);
    yield z.fundido(1, 0.5);
    z.jugador.cambiarTraje('yusufMadera');
    z.jugador.armado = true;
    IH.partida.traje = 'yusufMadera';
    yield z.fundido(0, 0.5);
    z.cine(false);
    z.sinMuerte = true;
    // --- lección 1: combo
    z.leccion = 'combo';
    z.objetivo('Golpea al muñeco con un combo de tres golpes');
    IH.notificar(`Ataque: ${IH.entrada.etiqueta('atacar')}  ·  pulsa tres veces seguidas`, { vida: 6 });
    z.bocadillo(sq, 'Golpe, golpe y estocada. ¡Usa las caderas, no solo el brazo!', 4);
    let ok = false;
    z.alGolpeManiqui = (g) => {
      if (z.leccion === 'combo' && g.d === IH.ATAQUES_JUGADOR.ataque3) ok = true;
      if (z.leccion === 'fuerte' && g.d === IH.ATAQUES_JUGADOR.fuerte) ok = true;
    };
    yield () => ok;
    yield 0.5;
    z.bocadillo(sq, '¡Bien! Ahora con todo el cuerpo. Un golpe fuerte rompe la guardia del que se esconde tras un escudo.', 4.5);
    ok = false;
    z.leccion = 'fuerte';
    z.objetivo('Da un golpe fuerte al muñeco');
    IH.notificar(`Golpe fuerte: ${IH.entrada.etiqueta('fuerte')}`, { vida: 6 });
    yield () => ok;
    yield 0.8;
    // --- combate con Sunqur
    z.cine(true);
    yield z.dialogo([['sunqur', 'Muy bien. Los muñecos no se defienden. Ahora, conmigo.', 'serio']]);
    z.cine(false);
    sq.visible = false;
    sq.alHablar = null;
    const ins = z.enemigo({ traje: 'sunqur', tipo: 'instructor', x: sq.x, dir: -1, alerta: true, nombre: 'Sunqur', vidaMin: 1 });
    z.jefe = ins;
    let bloqueos = 0, paradas = 0, esquivas = 0, dano = 0;
    z.alResultadoGolpe = (res) => {
      if (res === 'bloqueo' || res === 'parada') bloqueos++;
      if (res === 'parada') paradas++;
      if (res === 'esquiva') esquivas++;
    };
    ins.alRecibir = (e, g, d) => {
      dano += d;
    };
    z.leccion = 'bloquear';
    z.objetivo('Bloquea dos golpes de Sunqur');
    IH.notificar(`Bloquear: mantén ${IH.entrada.etiqueta('bloquear')}`, { vida: 6 });
    z.bocadillo(ins, 'Levanta la guardia. ¡Que no te toque!', 3);
    yield () => bloqueos >= 2;
    z.leccion = 'parada';
    z.objetivo('Haz una parada: bloquea justo antes del golpe');
    IH.notificar('Parada: pulsa bloquear en el último instante', { vida: 7 });
    z.bocadillo(ins, 'Bloquear cansa. ¡Espera mi golpe y desvíalo en el último instante!', 4.5);
    yield () => paradas >= 1;
    z.bocadillo(ins, '¡Eso es! Si paras a tiempo, tu enemigo queda abierto. ¡Castígalo!', 3.5);
    yield 2.5;
    z.leccion = 'rodar';
    z.objetivo('Esquiva el golpe del brillo rojo rodando');
    IH.notificar(`Voltereta: ${IH.entrada.etiqueta('esquivar')}  ·  los golpes con brillo rojo no se pueden parar`, { vida: 7 });
    z.bocadillo(ins, 'Este no lo puedes parar. ¡Apártate!', 3);
    yield () => esquivas >= 1;
    z.leccion = 'atacar';
    dano = 0;
    z.objetivo('Golpea a Sunqur');
    z.bocadillo(ins, '¡Ahora ataca! ¡No te quedes mirando!', 3);
    yield () => dano >= 55;
    // fin del combate
    z.leccion = null;
    z.alResultadoGolpe = null;
    z.jefe = null;
    z.cine(true);
    ins.borrar = true;
    sq.x = ins.x;
    sq.dir = Math.sign(z.jugador.x - sq.x) || -1;
    sq.visible = true;
    sq.animForzada = 'quieto';
    z.jugador.poner('quieto');
    z.particulas.emitir('polvo', sq.x, sq.y, 6);
    yield 0.6;
    yield z.dialogo([
      ['sunqur', '¡Basta! ¡Basta ya, por las barbas de mi abuelo!', 'sorpresa'],
      ['sunqur', 'Tienes el pulso de un herrero y los pies de un bailarín. Torpe, lento, sin técnica ninguna… pero no te rindes.'],
      ['sunqur', 'Los mamelucos somos la espada del sultán. Pero una espada sola no gana una guerra: hacen falta manos. Muchas manos.'],
      ['sunqur', 'Preséntate dentro de tres días en *Bab al-Futuh*, al alba. Marcharás con la infantería. Te darán una lanza, un escudo y la paga de un soldado.'],
      ['yusuf', 'Gracias, Sunqur. No te arrepentirás.'],
      ['sunqur', 'Eso díselo a tu padre. Yo no tengo que llorarte.', 'serio'],
    ]);
    IH.desbloquearCronica('infanteria');
    z.bandera('alistado', true);
    z.sinMuerte = false;
    z.objetivo('Vuelve a casa');
    yield 0.6;
    yield z.fundido(1, 1.5);
    yield z.cinematica('noche');
  }

  // ================================================================== LA DESPEDIDA
  Z.forjaNoche = {
    titulo: null,
    ancho: 760,
    fondo: { escena: 'forja', opc: { hora: 'noche', fragua: 200, ventana: 470, estante: 330, armero: 90 } },
    musica: 'despedida',
    ambienteSonoro: 'interior',
    tranquila: true,
    sinCombate: true,
    hud: false,
    traje: 'yusuf',
    colorPolvo: '#6a5646',
    vineta: 0.7,
    entradas: { inicio: { x: 700, dir: -1 } },
    poblar(z) {
      z.objeto({ tipo: 'fragua', x: 200, id: 'fragua', intensidad: 0.4 });
      z.objeto({ tipo: 'fuelle', x: 160 });
      z.objeto({ tipo: 'yunque', x: 292 });
      z.objeto({ tipo: 'barril', x: 352, agua: true });
      z.pnj({ traje: 'ibrahimNoche', x: 252, dir: 1, id: 'ibrahim', hablante: 'ibrahim', anim: 'sentado', mirar: false });
      z.objeto({ tipo: 'farol', x: 600, y: 150 });
    },
    alEntrar: function* (z) {
      z.cine(true);
      z.fundidoA = 1;
      IH.partida.traje = 'yusuf';
      const ib = z.buscar('ibrahim');
      yield z.fundido(0, 2.5);
      yield z.mover('yusuf', 420, { anim: 'andar' });
      z.mirar('yusuf', -1);
      yield 1.2;
      yield z.dialogo([
        ['ibrahim', 'Llegas tarde. La sopa se ha enfriado dos veces.'],
        ['yusuf', 'Padre… tengo que decirte algo.'],
        ['ibrahim', 'Que te has alistado.'],
      ]);
      yield 1.5;
      yield z.dialogo([
        ['ibrahim', 'Sunqur vino esta tarde a pagar las espadas. Me lo contó todo.'],
        ['ibrahim', 'Dice que te mueves bien. Para ser hijo de un herrero.'],
      ]);
      const r = yield z.eleccion(null, ['Lo siento, padre. Debí decírtelo antes.', 'No podía quedarme mirando, padre.', 'Volveré. Te lo prometo.']);
      IH.partida.banderas.despedida = r;
      const resp = [
        [['ibrahim', 'No lo sientas. Un hombre que pide perdón por cumplir con su deber no ha entendido su deber.']],
        [['ibrahim', 'Lo sé. Tu madre tampoco podía quedarse mirando nada. Por eso me casé con ella.', 'alegre']],
        [['ibrahim', 'No prometas lo que no depende de ti, hijo. Prométeme solo que no harás tonterías.', 'triste']],
      ][r];
      yield z.dialogo(resp);
      // Ibrahim se levanta y va al armero
      ib.animBase = 'quieto';
      yield 0.8;
      yield ib.irA(112, { vel: 30 });
      ib.dir = -1;
      yield 1.2;
      IH.audio.sfx('pergamino');
      ib.cambiarTraje('ibrahimEspada');
      yield 0.6;
      yield ib.irA(392, { vel: 30, final: 'quieto', dir: 1 });
      z.mirar('yusuf', -1);
      yield z.dialogo([
        ['ibrahim', 'Toda mi vida he forjado espadas para que otros hombres fueran a la guerra.'],
        ['ibrahim', 'Nunca pensé que forjaría una para mi hijo.', 'triste'],
        ['ibrahim', 'La empecé cuando cumpliste quince años. Por si acaso. Los padres también sabemos leer, aunque no sea en los libros.'],
      ]);
      ib.animForzada = 'senalar';
      yield 1;
      IH.audio.sfx('parada', { vol: 0.35 });
      z.particulas.emitir('destello', 406, 268, 1, { r: 20 });
      ib.cambiarTraje('ibrahimNoche');
      ib.animForzada = null;
      z.jugador.cambiarTraje('yusufCivilEspada');
      IH.partida.traje = 'yusufCivilEspada';
      yield 1.2;
      yield z.dialogo([
        ['yusuf', 'Tiene algo grabado en la hoja…'],
        ['ibrahim', '*Sabr*. Paciencia.'],
        ['ibrahim', 'El buen acero no se apresura. Y el buen soldado tampoco. Los que corren hacia la muerte siempre la encuentran antes.'],
        ['ibrahim', 'Vuelve, Yusuf. Una espada se puede volver a forjar. Un hijo, no.', 'triste'],
      ]);
      yield 2;
      // Nur llama a la puerta
      IH.audio.sfx('puerta');
      yield 1;
      const nur = z.pnj({ traje: 'nur', x: 740, dir: -1, id: 'nur', hablante: 'nur', anim: 'quieto', mirar: false });
      yield nur.irA(468, { vel: 34 });
      z.mirar('yusuf', 1);
      nur.dir = -1;
      yield z.dialogo([
        ['nur', 'Perdona, Ibrahim. Ya sé que es tarde.'],
        ['ibrahim', 'Pasa, hija, pasa. Ya me iba a dormir… o a fingir que duermo.', 'alegre'],
      ]);
      yield ib.irA(160, { vel: 26, final: 'sentado', dir: 1 });
      yield z.dialogo([
        ['nur', 'Toda la calle lo sabe ya. El hijo del herrero se va con el ejército.'],
        ['nur', 'Toma. Un cálamo y papel de Samarcanda. El mejor que tenía mi padre.'],
        ['yusuf', 'Nur, no puedo aceptar…'],
        ['nur', 'Escríbeme. Ya sabes cómo: te enseñé yo.', 'serio'],
        ['nur', 'Y cuéntamelo todo. Lo bueno y lo malo. Si no vuelves… al menos quiero saber cómo era el mundo que viste.', 'triste'],
        ['yusuf', 'Volveré. Y te escribiré tanto que tendrás que comprarle papel a la competencia.'],
        ['nur', 'Más te vale.', 'alegre'],
      ]);
      yield nur.irA(740, { vel: 34 });
      nur.borrar = true;
      IH.audio.sfx('puerta');
      yield 1;
      yield z.narrar('Aquella noche ninguno de los dos durmió. Oí a mi padre trabajar en la fragua hasta el amanecer, aunque no había ningún encargo.', 9);
      yield z.fundido(1, 2);
      yield z.cinematica('partida');
    },
  };
})();
