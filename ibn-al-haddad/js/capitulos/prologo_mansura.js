/* Capítulo I · Prólogo — Mansura, febrero de 1250.
 *
 *   campamento  La víspera: Hamid, el naffat, la carta a Nur y el encuentro con Baibars.
 *   mansura     La trampa de Baibars en las calles de Mansura: tres combates, un caballero
 *               y el jefe templario Thibaut de Clermont. Puntos de control con pozos.
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

  // ================================================================== EL CAMPAMENTO (noche del 7 de febrero de 1250)
  Z.campamento = {
    titulo: 'El campamento de Mansura',
    subtitulo: 'La víspera · 7 de febrero de 1250',
    ancho: 1800,
    fondo: { escena: 'campamento', opc: {} },
    musica: 'campamento',
    ambienteSonoro: 'campamento',
    tranquila: true,
    traje: 'yusufSoldado',
    colorPolvo: '#4a4234',
    vineta: 0.6,
    entradas: { inicio: { x: 130, dir: 1 } },
    salidas: [{ lado: 'der', x: 1790, si: () => false, bloqueo: 'El canal. Al otro lado, los francos. No es momento de nadar.' }],
    objetivo: (z) => (z.bandera('hamid') && z.bandera('baibars') ? 'Descansa en tu tienda' : 'Recorre el campamento'),
    poblar(z) {
      const P = IH.partida;
      if (P.aguaMax < 3) {
        P.aguaMax = 3;
        P.agua = 3;
      }
      z.objeto({ tipo: 'tiendaCampa', x: 82, color: '#5a5a6a', color2: '#6a3a3a', bandera: '#d9a521' });
      const tienda = z.objeto({ tipo: 'punto', x: 86, etiqueta: 'Dormir' });
      tienda.alInteractuar = (zz) => (function* () {
        if (!zz.bandera('hamid')) {
          yield zz.dialogo([['yusuf', 'Todavía no tengo sueño. Hamid estará junto al fuego, como cada noche.']]);
          return;
        }
        if (!zz.bandera('baibars')) {
          yield zz.dialogo([['yusuf', 'Hay movimiento al final del campamento, junto a los caballos. Mejor ver qué pasa antes de dormir.']]);
          return;
        }
        zz.cine(true);
        yield zz.mover('yusuf', 86, { anim: 'andar' });
        yield zz.narrar('Me dormí con la mano sobre la empuñadura de *Sabr*. Soñé con el martillo de mi padre.', 7);
        yield zz.fundido(1, 2);
        yield zz.cinematica('vado');
      })();
      const mesa = z.objeto({ tipo: 'mesaEscritura', x: 170, etiqueta: 'Escribir a Nur' });
      mesa.alInteractuar = (zz) => (function* () {
        zz.cine(true);
        yield zz.mover('yusuf', 182, { anim: 'andar' });
        zz.mirar('yusuf', -1);
        IH.audio.sfx('pluma');
        if (!zz.bandera('carta')) {
          zz.bandera('carta', true);
          yield zz.narrar('«Querida Nur: te escribo junto al fuego, con tu cálamo. Aquí el Nilo se parte en canales, y los francos están al otro lado de uno de ellos, tan cerca que de noche oímos sus campanas.»', 12);
          yield zz.narrar('«Los mamelucos nos miran por encima del hombro, pero comparten su pan. Hamid, un pescador de Damieta, se ha hecho mi amigo. Dile a mi padre que como bien. Es mentira, pero díselo.»', 12);
        } else {
          yield zz.narrar('«…y cuando vuelva, te enseñaré a templar el acero. Así estaremos empatados.»', 7);
        }
        zz.puntoControl('inicio');
        IH.notificar('Partida guardada · odre rellenado');
        zz.cine(false);
      })();
      // la hoguera de Hamid
      const fuego = z.objeto({ tipo: 'hoguera', x: 330, etiqueta: 'Descansar junto al fuego' });
      fuego.alInteractuar = (zz) => (function* () {
        zz.puntoControl('inicio');
        zz.jugador.vida = zz.jugador.vidaMax;
        IH.audio.sfx('curar');
        IH.notificar('Descansas junto al fuego · odre rellenado');
      })();
      const hamid = z.pnj({ traje: 'recluta1', x: 306, dir: 1, id: 'hamid', hablante: 'hamid', anim: 'sentado', mirar: false, marca: z.bandera('hamid') ? null : '!' });
      hamid.alHablar = (zz) => (function* () {
        if (zz.bandera('hamid')) {
          yield zz.dialogo([['hamid', IH.azar.elegir(['Duerme, Yusuf. Los francos están demasiado callados.', '¿Has visto cuántas hogueras tienen? Parecen las estrellas, pero al revés.', 'Cuando esto acabe, te llevaré a pescar al lago Manzala. Si sigue habiendo lago.'])]]);
          return;
        }
        hamid.marca = null;
        zz.cine(true);
        yield zz.mover('yusuf', 286, { anim: 'andar' });
        zz.mirar('yusuf', 1);
        yield zz.dialogo([
          ['hamid', 'Yusuf. Siéntate, anda. Queda un poco de pan… duro como la cabeza de un mameluco, pero pan.'],
          ['yusuf', '¿No duermes?'],
          ['hamid', 'Desde que salí de Damieta no duermo bien. Mi padre tenía una barca allí. Pescábamos mújoles en el lago.'],
          ['hamid', 'Cuando llegaron los francos, la guarnición huyó y nosotros con ella. Mi padre volvió a por las redes… No sé qué fue de él.', 'triste'],
        ]);
        const r = yield zz.eleccion(null, ['Lo encontraremos cuando recuperemos Damieta.', 'Lo siento, Hamid.', '(Sentarte a su lado en silencio)']);
        IH.partida.banderas.respuestaHamid = r;
        yield zz.dialogo([
          [['hamid', 'Ojalá tengas razón, hijo del herrero. Ojalá.'], ['hamid', 'Ya. Yo también.'], ['hamid', '…Gracias.']][r],
          ['hamid', '¿Y tú? ¿Por qué estás aquí? Tú no perdiste nada.'],
          ['yusuf', 'Todavía no. Por eso.'],
          ['hamid', '…Esa es una buena respuesta.', 'serio'],
          ['hamid', 'Duerme algo, Yusuf. Mañana o pasado, ya verás: va a pasar algo. Los francos están demasiado callados.'],
        ]);
        zz.bandera('hamid', true);
        zz.cine(false);
        zz.objetivo(zz.bandera('baibars') ? 'Descansa en tu tienda' : 'Recorre el campamento');
      })();
      z.pnj({ traje: 'recluta2', x: 354, dir: -1, anim: 'sentadoHablar', mirar: false, hablante: 'recluta', hablar: [['recluta', 'Dicen que el sultán está tan enfermo que ya no sale de su tienda. Que solo entra su mujer.'], ['recluta', 'Bah. Cosas de soldados aburridos.']] });
      // el naffat
      z.objeto({ tipo: 'tinaja', x: 530, color: '#3a3a3a', premio: false });
      z.objeto({ tipo: 'tinaja', x: 542, color: '#2a2a2a', premio: false });
      z.objeto({ tipo: 'tinaja', x: 554, color: '#3a3430', premio: false });
      const naffat = z.pnj({ traje: 'naffat', x: 585, dir: -1, id: 'naffat', hablante: 'naffat', anim: 'brazosCruzados', marca: tieneCronica('naft') ? null : '?' });
      naffat.alHablar = (zz) => (function* () {
        naffat.marca = null;
        if (tieneCronica('naft')) {
          yield zz.dialogo([['naffat', 'Una olla basta para un hombre. Dos, para una torre. Para un rey… todavía no lo he probado.']]);
          return;
        }
        zz.cine(true);
        yield zz.dialogo([
          ['naffat', '¡Eh, cuidado con esas ollas! Si tropiezas, mañana te recogemos con una cuchara.'],
          ['yusuf', '¿Qué hay dentro?'],
          ['naffat', 'Nafta de Persia, resina, azufre… y un par de secretos de mi abuelo. Arde hasta en el agua.'],
          ['naffat', '¿Quieres verlo? Mira hacia el canal.'],
        ]);
        naffat.dir = 1;
        naffat.animForzada = 'lanzar';
        naffat.poner('lanzar', true);
        yield 0.3;
        IH.audio.sfx('tajoFuerte', { vol: 0.5 });
        let t = 0;
        const x0 = naffat.x + 10, y0 = naffat.y - 44, x1 = 1450, y1 = 288;
        yield z.camaraA(1000, 1.6);
        yield IH.interpolar(1.6, (k) => {
          t = k;
          const px = U.lerp(x0, x1, k), py = U.lerp(y0, y1, k) - Math.sin(k * Math.PI) * 140;
          zz.particulas.emitir('fuego', px, py, 2, { fuerza: 0.3 });
        }, (k) => k);
        IH.audio.sfx('explosion', { x: x1 });
        zz.particulas.emitir('fuego', x1, y1, 30, { fuerza: 2, tam: 2 });
        zz.particulas.emitir('chispa', x1, y1, 20, { fuerza: 1.5 });
        const luz = { x: x1, y: y1 - 10, r: 140, color: '#ff8a3a', i: 1.2, parpadeo: 0.3 };
        zz.luces.push(luz);
        zz.sacudir(0.3);
        yield 1.5;
        luz.muerta = true;
        yield zz.camaraA(naffat.x, 1.2);
        zz.camaraSeguir();
        naffat.animForzada = null;
        naffat.dir = -1;
        yield zz.dialogo([['naffat', 'Los francos lo llaman «fuego griego». Nosotros lo llamamos trabajo.', 'alegre']]);
        IH.desbloquearCronica('naft');
        zz.cine(false);
      })();
      // tablkhana
      z.objeto({ tipo: 'tambores', x: 720 });
      z.objeto({ tipo: 'estandarte', x: 750, color: '#d9a521', emblema: 'texto', alto: 76 });
      z.pnj({ traje: 'mameluco', x: 700, dir: 1, anim: 'brazosCruzados', hablante: 'mameluco', hablar: (zz) => (function* () {
        yield zz.dialogo([['mameluco', 'Son los timbales de la tablkhana. Cuando suenen todos a la vez, no hará falta que nadie te diga lo que tienes que hacer.']]);
        IH.desbloquearCronica('tablkhana');
      })() });
      z.objeto({ tipo: 'maniqui', x: 860 });
      // arqueros y caballos
      z.objeto({ tipo: 'hoguera', x: 990 });
      z.pnj({ traje: 'mamelucoArco', x: 968, dir: 1, anim: 'brazosCruzados', hablante: 'mameluco', hablar: [['mameluco', 'Mañana, si cruzan, los recibiremos con flechas. Si no cruzan, pasado mañana. Aquí sobran flechas y falta paciencia.']] });
      z.pnj({ traje: 'recluta2', x: 1012, dir: -1, anim: 'sentado', mirar: false });
      z.objeto({ tipo: 'caballo', x: 1180, dir: 1, color: '#3a2a1a', silla: '#8a2a24' });
      z.objeto({ tipo: 'caballo', x: 1230, dir: -1, color: '#6a5a4a', silla: '#2f5a8a' });
      z.objeto({ tipo: 'caballo', x: 1280, dir: 1, color: '#d8d0c0', silla: '#d9a521' });
      // la orilla del canal
      z.pnj({ traje: 'mameluco', x: 1640, dir: 1, anim: 'quieto', mirar: false, hablante: 'mameluco', hablar: [['mameluco', 'Mira sus hogueras. Cada noche contamos más de mil.'], ['mameluco', 'Están construyendo una calzada para cruzar. Y cada mañana se la deshacemos. Así llevamos todo el invierno.']] });
      cronica(z, 'bahr', 1720);
      for (let i = 0; i < 6; i++) z.objeto({ tipo: 'farol', x: 240 + i * 260, y: 300 });
      // Baibars y su escolta (aparecen al acercarse)
      if (!z.bandera('baibars')) {
        z.pnj({ traje: 'baibars', x: 1500, dir: -1, id: 'baibars', hablante: 'baibars', anim: 'quieto', mirar: false, visible: false });
        z.pnj({ traje: 'mameluco', x: 1530, dir: -1, id: 'escolta1', anim: 'quieto', mirar: false, visible: false });
        z.pnj({ traje: 'mameluco', x: 1555, dir: -1, id: 'escolta2', anim: 'quieto', mirar: false, visible: false });
      }
    },
    disparadores: [
      {
        id: 'baibars',
        x: 1080,
        w: 60,
        si: (z) => !z.bandera('baibars'),
        guion: function* (z) {
          z.cine(true);
          const b = z.buscar('baibars'), e1 = z.buscar('escolta1'), e2 = z.buscar('escolta2');
          [b, e1, e2].forEach((e) => (e.visible = true));
          yield z.mover('yusuf', 1110, { anim: 'andar' });
          z.mirar('yusuf', 1);
          yield z.camaraA(1240, 1.5);
          yield [b.irA(1170, { vel: 40 }), e1.irA(1205, { vel: 40 }), e2.irA(1232, { vel: 40 })];
          b.dir = -1;
          yield 0.6;
          yield z.presentar({ retrato: 'baibars', nombre: 'Baibars', arabe: 'بيبرس', epiteto: '«al-Bunduqdari». Emir de los mamelucos Bahriyya, la guardia del sultán.', dur: 5.5 });
          yield z.dialogo([
            ['baibars', 'Tú. El de la espada nueva. Esa hoja no salió de la armería del sultán.'],
            ['yusuf', 'La forjó mi padre, emir. Ibrahim al-Haddad, de El Cairo.'],
            ['baibars', '*Sabr*… Paciencia. ¿Sabes leer, egipcio?'],
            ['yusuf', 'Me enseñó una amiga.'],
            ['baibars', 'Entonces lee esto en mi cara: los francos van a intentar cruzar. Quizá mañana, quizá dentro de un mes.'],
            ['baibars', 'Cuando ocurra, verás cosas que no entenderás. Recibirás órdenes que te parecerán locura. Obedécelas igual.', 'serio'],
            ['baibars', 'La paciencia que lleva tu espada… ojalá la tenga también quien la empuña.'],
          ]);
          IH.desbloquearCronica('baibars');
          z.bandera('baibars', true);
          yield [b.irA(1560, { vel: 46 }), e1.irA(1600, { vel: 46 }), e2.irA(1630, { vel: 46 })];
          [b, e1, e2].forEach((e) => (e.borrar = true));
          z.camaraSeguir();
          z.cine(false);
          z.objetivo(z.bandera('hamid') ? 'Descansa en tu tienda' : 'Habla con Hamid junto al fuego');
        },
      },
    ],
  };

  // ================================================================== LA BATALLA DE MANSURA (8 de febrero de 1250)
  Z.mansura = {
    titulo: 'Mansura',
    subtitulo: '8 de febrero de 1250 · La trampa',
    ancho: 3000,
    fondo: { escena: 'mansura', opc: { hora: 'amanecer' } },
    ambienteSonoro: 'batalla',
    ambiente: '#d0b8b8',
    traje: 'yusufSoldado',
    camaraArena: true,
    maxAtacantes: 2,
    colorPolvo: '#b8a080',
    entradas: { inicio: { x: 120, dir: 1 }, c1: { x: 820, dir: 1 }, c2: { x: 1620, dir: 1 }, c3: { x: 2320, dir: 1 } },
    solidos: [
      { x: 1131, y: 282, w: 18, h: 18 },
      { x: 1149, y: 266, w: 18, h: 34 },
      { x: 2016, y: 270, w: 26, h: 30 },
    ],
    plataformas: [
      { x: 1170, y: 250, w: 40 },
      { x: 1214, y: 220, w: 76 },
      { x: 1390, y: 196, w: 70 },
    ],
    objetivo: 'Abríos paso por las calles de Mansura',
    poblar(z, params) {
      const P = IH.partida;
      if (P.aguaMax < 3) {
        P.aguaMax = 3;
        P.agua = 3;
      }
      // estructuras
      z.objeto({ tipo: 'cajas', x: 1140, w: 18, h: 18 });
      z.objeto({ tipo: 'cajas', x: 1158, w: 18, h: 34 });
      z.objeto({ tipo: 'toldoPlat', x: 1190, y: 250, w: 40, color: '#8a2a2a' });
      z.objeto({ tipo: 'balcon', x: 1252, y: 220, w: 76 });
      z.objeto({ tipo: 'balcon', x: 1425, y: 196, w: 70 });
      z.objeto({ tipo: 'barricada', x: 2029 });
      z.objeto({ tipo: 'fuegoGrande', x: 1780 });
      z.objeto({ tipo: 'carro', x: 1745, carga: 'sacos' });
      z.objeto({ tipo: 'fuegoGrande', x: 2580 });
      z.objeto({ tipo: 'estandarte', x: 2930, color: '#ece6d6', emblema: 'cruz', alto: 80 });
      for (const [x, tr, d] of [[380, 'sargento', 1], [470, 'mameluco', -1], [990, 'sargentoRojo', 1], [1560, 'recluta2', -1], [1880, 'sargento', -1], [2200, 'mameluco', 1], [2700, 'mameluco', -1]]) z.objeto({ tipo: 'cuerpo', x, traje: tr, dir: d });
      z.objeto({ tipo: 'escombros', x: 640 });
      z.objeto({ tipo: 'escombros', x: 1350 });
      z.objeto({ tipo: 'escombros', x: 2460 });
      // pozos (puntos de control)
      for (const [x, ent] of [[860, 'c1'], [1650, 'c2'], [2340, 'c3']]) {
        const p = z.objeto({ tipo: 'pozo', x, etiqueta: 'Beber del pozo' });
        p.alInteractuar = (zz) => (function* () {
          zz.puntoControl(ent);
          zz.jugador.vida = Math.max(zz.jugador.vida, zz.jugador.vidaMax * 0.6);
          IH.audio.sfx('beber');
          IH.notificar('Punto de control · odre rellenado');
        })();
      }
      // vecinos de Mansura que arrojan piedras desde el balcón
      for (const x of [1405, 1440]) {
        z.pnj({
          traje: 'miliciano', x, y: 196, dir: -1, anim: 'lanzar', repetir: true, mirar: false, capa: 1,
          alLanzar(e) {
            const obj = z.enemigoMasCercano(e.x, 260);
            if (!obj) return;
            const t = 0.8;
            e.dir = Math.sign(obj.x - e.x) || e.dir;
            z.agregar(new IH.Proyectil(z, { x: e.x + e.dir * 6, y: e.y - 44, vx: (obj.x - e.x) / t, vy: (obj.y - 30 - (e.y - 44)) / t - 300 * t, dano: 4, dueno: 'jugador', tipo: 'piedra' }));
          },
        });
      }
      // Hamid y el oficial
      const pos = { inicio: 80, c1: 790, c2: 1590, c3: 2290 }[params.entrada || 'inicio'] || 80;
      z.pnj({ traje: 'recluta1', x: pos, dir: 1, id: 'hamid', hablante: 'hamid', anim: 'guardia', mirar: true, hablar: [['hamid', IH.azar.elegir(['¡Detrás de ti, Yusuf! ¡Siempre detrás!', 'Respira. Bloquea. Golpea. Como en el maydan.', '¡Por Damieta!'])]] });
      if (!z.bandera('mansuraInicio')) z.pnj({ traje: 'mameluco', x: 175, dir: -1, id: 'oficial', hablante: 'mameluco', anim: 'quieto', mirar: false });
      // escaramuza de fondo (ambiente)
      z.pnj({ traje: 'mameluco', x: 560, dir: 1, anim: 'ataque1', repetir: true, mirar: false, capa: -3, alGolpe: () => IH.audio.sfx('choque', { x: 575, vol: 0.25 }) });
      z.pnj({ traje: 'sargentoRojo', x: 588, dir: -1, anim: 'bloquear', mirar: false, capa: -3 });
    },
    alEntrar: function* (z) {
      if (z.bandera('mansuraInicio')) {
        IH.audio.musica(z.bandera('jefeVisto') ? 'jefe' : 'batalla');
        return;
      }
      IH.audio.musica('tension');
      z.cine(true);
      z.fundidoA = 1;
      yield z.fundido(0, 2);
      yield z.dialogo([['mameluco', 'Silencio. Escuchad.']]);
      IH.audio.sfx('caballo', { vol: 0.7 });
      yield 0.6;
      IH.audio.sfx('caballo', { vol: 0.8 });
      IH.audio.sfx('multitud', { vol: 0.4 });
      z.sacudir(0.2);
      yield 1.4;
      yield z.dialogo([
        ['mameluco', 'Los francos están dentro de la ciudad. Han entrado por la puerta del norte como si fuera suya. Buscan el palacio del sultán.'],
        ['hamid', '¿Y nosotros qué hacemos aquí, escondidos como ratas?', 'enfadado'],
        ['mameluco', 'Esperar. Es la orden de Baibars: nadie se mueve hasta que suene el nafir. Que entren todos. Que se metan hasta el fondo de la trampa.', 'serio'],
        ['yusuf', '(«Órdenes que te parecerán locura… Obedécelas igual».)'],
      ]);
      yield 2.5;
      IH.audio.sfx('cuerno', { vol: 0.9 });
      yield 0.9;
      IH.audio.sfx('cuerno', { vol: 0.9, frec: 110 });
      z.sacudir(0.4);
      yield 1;
      yield z.dialogo([['mameluco', '¡AHORA! ¡Cerrad las calles! ¡Que no salga ni uno! ¡Por Egipto!', 'enfadado']]);
      IH.audio.musica('batalla', { fundido: 0.5 });
      IH.audio.sfx('multitud', { vol: 0.8 });
      const of = z.buscar('oficial');
      if (of) {
        of.irA(z.ancho, { vel: 120, anim: 'correr' });
        setTimeout(() => (of.borrar = true), 4000);
      }
      z.bandera('mansuraInicio', true);
      z.puntoControl('inicio');
      z.cine(false);
      z.objetivo('Abríos paso por las calles de Mansura');
      IH.desbloquearCronica('mansura');
      IH.notificar(`Beber del odre: ${IH.entrada.etiqueta('curar')}  ·  Voltereta: ${IH.entrada.etiqueta('esquivar')}`, { vida: 7 });
    },
    disparadores: [
      {
        id: 'e1',
        x: 330,
        w: 40,
        si: (z) => !z.bandera('e1'),
        guion: function* (z) {
          z.arena(200, 790);
          z.objetivo('Acaba con los francos de la calle');
          IH.audio.sfx('grito', { x: 700 });
          yield z.oleada([
            { traje: 'sargento', tipo: 'sargento', x: 760, dir: -1 },
            { traje: 'sargentoRojo', tipo: 'sargento', x: 230, dir: 1 },
          ]);
          yield 0.6;
          z.bocadillo(z.buscar('hamid') || z.jugador, '¡Vienen más! ¡Por la derecha!', 2.5);
          yield z.oleada([
            { traje: 'sargentoVerde', tipo: 'sargentoMaza', x: 780, dir: -1 },
            { traje: 'sargento', tipo: 'sargento', x: 790, dir: -1, radioAlerta: 600 },
          ]);
          z.arena(null);
          z.bandera('e1', true);
          const h = z.buscar('hamid');
          if (h) h.irA(800, { vel: 90, anim: 'correr', final: 'guardia' });
          z.objetivo('Avanza hacia el centro de la ciudad');
          IH.notificar('Bebe en los pozos para guardar la partida y rellenar el odre');
        },
      },
      {
        id: 'e2',
        x: 980,
        w: 40,
        si: (z) => !z.bandera('e2'),
        guion: function* (z) {
          z.arena(900, 1520);
          z.objetivo('Sube al balcón y acaba con los ballesteros');
          z.bocadillo(z.jugador, '¡Ballesteros en el balcón! Tengo que subir por las cajas.', 3);
          const ol = z.oleada([
            { traje: 'ballestero', tipo: 'ballestero', x: 1236, y: 220, dir: -1, fijo: true, radioAlerta: 400 },
            { traje: 'ballestero', tipo: 'ballestero', x: 1272, y: 220, dir: -1, fijo: true, radioAlerta: 400 },
            { traje: 'sargento', tipo: 'sargento', x: 1460, dir: -1 },
          ]);
          yield 4;
          const ol2 = z.oleada([{ traje: 'sargentoRojo', tipo: 'sargento', x: 1500, dir: -1, radioAlerta: 700 }]);
          yield [ol, ol2];
          z.arena(null);
          z.bandera('e2', true);
          const h = z.buscar('hamid');
          if (h) {
            h.x = 1590;
            h.y = z.suelo;
          }
          z.bocadillo(z.jugador, 'Los vecinos luchan desde las azoteas… Mansura entera está en pie.', 3.5);
          IH.desbloquearCronica('infanteria');
        },
      },
      {
        id: 'e3',
        x: 1760,
        w: 40,
        si: (z) => !z.bandera('e3'),
        guion: function* (z) {
          z.arena(1680, 2260);
          z.cine(true);
          const c = z.enemigo({ traje: 'caballero', tipo: 'caballero', x: 2180, dir: -1, alerta: false, nombre: 'Caballero de la mesnada de Artois' });
          c.cambiarEstado('escena');
          yield z.camaraA(2050, 1.2);
          yield c.irA(2080, { vel: 50, anim: 'avanzar', final: 'guardia' });
          IH.audio.sfx('choque', { x: 2080, vol: 0.5 });
          z.bocadillo(c, 'Montjoie! Saint-Denis!', 2.5);
          yield 1.5;
          z.camaraSeguir();
          z.cine(false);
          c.alerta = true;
          c.cambiarEstado('combate');
          z.jefe = c;
          z.objetivo('Derrota al caballero franco');
          IH.audio.intensidad(1);
          const ol = z.oleada([]);
          ol.enemigos.push(c);
          yield 6;
          const ol2 = z.oleada([{ traje: 'sargentoRojo', tipo: 'sargento', x: 2240, dir: -1, radioAlerta: 700 }]);
          yield [ol, ol2];
          z.jefe = null;
          z.arena(null);
          z.bandera('e3', true);
          z.objetivo('Sigue hacia el palacio');
          const h = z.buscar('hamid');
          if (h) {
            h.x = 2290;
            h.y = z.suelo;
          }
        },
      },
      {
        id: 'jefe',
        x: 2450,
        w: 40,
        si: (z) => !z.bandera('jefeVencido'),
        guion: function* (z) {
          z.arena(2400, 2990);
          z.cine(true);
          const vista = z.bandera('jefeVisto');
          const t = z.enemigo({ traje: 'templario', tipo: 'templario', x: 2760, dir: -1, alerta: false, nombre: 'Thibaut de Clermont, caballero del Temple' });
          t.cambiarEstado('escena');
          t.persistente = true;
          if (!vista) {
            IH.audio.musica(null, { fundido: 1.5 });
            yield z.mover('yusuf', 2520, { anim: 'andar' });
            z.mirar('yusuf', 1);
            yield z.camaraA(2700, 2);
            const h = z.buscar('hamid');
            if (h) {
              h.x = z.cam.x + 10;
              yield h.irA(2700, { vel: 140, anim: 'correr' });
              h.animForzada = 'ataque1';
              h.poner('ataque1', true);
              t.poner('tajoArriba', true);
              yield 0.5;
              IH.audio.sfx('golpe', { x: 2700 });
              IH.audio.sfx('dolor', { x: 2700 });
              z.particulas.emitir('sangre', 2700, 270, 8);
              h.animForzada = 'herido';
              h.poner('herido', true);
              yield 0.4;
              h.animForzada = 'yacer';
              h.poner('muerte', true);
              yield 0.6;
              yield z.dialogo([['yusuf', '¡HAMID!', 'enfadado']]);
              t.poner('guardia');
            }
            yield z.dialogo([
              ['templario', '¿Otro más? Por la Santa Cruz… ¿cuántos muchachos tiene vuestro sultán?'],
              ['templario', 'Soy Thibaut de Clermont, caballero del Temple. Si has de morir hoy, que sea sabiendo a manos de quién.'],
              ['yusuf', 'Yusuf ibn Ibrahim. Hijo de herrero.'],
              ['templario', 'Un herrero… Entonces sabrás que todo hierro acaba cediendo al martillo.'],
              ['yusuf', 'Y que el buen acero no se apresura.'],
            ]);
            yield z.presentar({ retrato: 'templario', nombre: 'Thibaut de Clermont', epiteto: 'Caballero de la Orden del Temple. Cruzó el canal al alba con Roberto de Artois.', dur: 5 });
            z.bandera('jefeVisto', true);
            z.puntoControl('c3');
          } else {
            yield z.camaraA(2650, 1);
          }
          IH.audio.musica('jefe', { fundido: 0.3 });
          z.camaraSeguir();
          z.cine(false);
          t.alerta = true;
          t.cambiarEstado('combate');
          z.jefe = t;
          z.objetivo('Derrota a Thibaut de Clermont');
          // segunda fase: arroja el escudo
          t.alCambioFase = function () {
            t.fase = 2;
            t.def = Object.assign({}, t.def, { escudo: false, bloqueo: 0, pausa: [0.35, 0.9] });
            z.particulas.emitir('astilla', t.x - t.dir * 6, t.y - 30, 12, { color: '#ece6d6' });
            IH.audio.sfx('escudo', { x: t.x });
            t.cambiarTraje('templarioSinEscudo');
            z.bocadillo(t, '¡Basta de juegos! ¡Non nobis, Domine!', 3);
            z.sacudir(0.3);
            IH.camaraLenta(0.4, 0.6);
          };
          t.alMorir = () => {
            z.ejecutar(finBatalla(z, t), 'finBatalla');
          };
          yield () => z.bandera('jefeVencido');
        },
      },
    ],
  };

  function* finBatalla(z, t) {
    z.bandera('jefeVencido', true);
    z.jefe = null;
    z.cine(true);
    IH.audio.musica(null, { fundido: 2.5 });
    IH.audio.ambiente('viento');
    yield z.fundido(0.85, 0.25, '#fff4dc');
    t.visible = false;
    t.borrar = true;
    const k = z.pnj({ traje: 'templarioSinYelmo', x: t.x, dir: Math.sign(z.jugador.x - t.x) || -1, id: 'thibaut', anim: 'arrodillado', mirar: false });
    z.jugador.poner('guardia');
    yield z.fundido(0, 0.8, '#fff4dc');
    yield z.mover('yusuf', k.x + (z.jugador.x < k.x ? -30 : 30), { anim: 'andar', final: 'guardia' });
    z.mirar('yusuf', k);
    yield 1;
    yield z.dialogo([
      ['templarioCara', 'Bien… luchado… sarraceno.'],
      ['templarioCara', 'Vine a Egipto a ganarme el cielo. Parece que tendré que conformarme con este suelo.', 'triste'],
    ]);
    const r = yield z.eleccion('Thibaut de Clermont aguarda, de rodillas.', ['Perdonarle la vida', 'Darle el golpe de gracia']);
    IH.partida.banderas.thibautPerdonado = r === 0;
    if (r === 0) IH.logro('PIEDAD');
    if (r === 0) {
      z.jugador.poner('quieto');
      yield z.dialogo([
        ['yusuf', 'Mi padre me enseñó que la paciencia es el filo más duro. Levántate. Vivirás.'],
        ['templarioCara', '…Qué extraño sarraceno eres.'],
      ]);
    } else {
      yield z.fundido(1, 0.6);
      IH.audio.sfx('tajoFuerte');
      yield 0.4;
      IH.audio.sfx('golpe');
      k.borrar = true;
      yield 1;
      yield z.fundido(0, 1);
      yield z.dialogo([['narrador', 'Fue rápido. Es lo único que puedo decir en mi favor.']]);
    }
    // llega Baibars
    const b = z.pnj({ traje: 'baibars', x: z.ancho - 10, dir: -1, id: 'baibars', hablante: 'baibars', anim: 'quieto', mirar: false });
    const e1 = z.pnj({ traje: 'mameluco', x: z.ancho + 20, dir: -1, anim: 'quieto', mirar: false });
    const e2 = z.pnj({ traje: 'mameluco', x: z.ancho + 45, dir: -1, anim: 'quieto', mirar: false });
    IH.audio.musica('victoria', { fundido: 1 });
    yield [b.irA(k.x + 90, { vel: 60 }), e1.irA(k.x + 120, { vel: 60 }), e2.irA(k.x + 146, { vel: 60 })];
    z.mirar('yusuf', b);
    if (r === 0) {
      yield z.dialogo([
        ['baibars', 'El Temple no paga rescates, muchacho: su regla se lo prohíbe. Pero tú le has dado la vida, y no seré yo quien te deje por mentiroso.'],
        ['baibars', 'Llevadlo con los demás prisioneros.'],
      ]);
      yield [e1.irA(k.x + 14, { vel: 50 }), e2.irA(k.x + 34, { vel: 50 })];
      k.borrar = true;
      e1.irA(z.ancho + 40, { vel: 50 });
      e2.irA(z.ancho + 60, { vel: 50 });
    } else {
      yield z.dialogo([['baibars', 'Rápido y limpio. Bien.', 'serio']]);
    }
    yield z.dialogo([
      ['baibars', 'Esa espada… *Sabr*. Te vi en el campamento.'],
      ['baibars', 'Hoy hemos destrozado la vanguardia de los francos. Su rey sigue al otro lado del canal, pero ha perdido a su hermano y a sus mejores caballeros.'],
      ['baibars', 'Recuerda mi nombre, Yusuf ibn Ibrahim. Yo recordaré el tuyo.'],
    ]);
    IH.desbloquearCronica('templarios');
    yield b.irA(z.ancho + 30, { vel: 50 });
    b.borrar = true;
    // Hamid vive
    const h = z.buscar('hamid');
    if (h) {
      h.animForzada = null;
      h.animBase = 'arrodillado';
      h.poner('arrodillado');
      yield z.mover('yusuf', h.x + 26, { anim: 'correr', vel: 120 });
      z.mirar('yusuf', h);
      yield z.dialogo([
        ['hamid', 'Ay… Ese franco pegaba como una mula.', 'triste'],
        ['hamid', '¿Hemos… ganado?'],
        ['yusuf', 'Hoy sí, Hamid. Hoy sí.'],
      ]);
    }
    yield 1;
    yield z.fundido(1, 2.5);
    yield z.cinematica('epilogo');
  }
})();
