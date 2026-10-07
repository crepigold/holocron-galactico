/* Capítulo I · Prólogo — cinemáticas.
 * Narra Yusuf ya anciano, en el año 1300, desde su escritorio de cronista.
 * Cada frase se escribe con calma y se mantiene en pantalla el tiempo de lectura.
 */
'use strict';
(function () {
  const C = (IH.CINEMATICAS = IH.CINEMATICAS || {});

  const MAPA_BASE = {
    regiones: ['egipto', 'siria', 'mediterraneo', 'iraq', 'anatolia', 'arabia', 'ultramar', 'negro', 'rojo'],
    ciudades: ['cairo', 'alejandria', 'damieta', 'jerusalen', 'acre', 'damasco', 'alepo', 'bagdad', 'constantinopla'],
  };

  // ------------------------------------------------------------------ INTRODUCCIÓN
  C.intro = {
    musica: 'cronista',
    ambiente: 'interior',
    planos: [
      {
        lamina: 'escritorio',
        camara: { x0: 10, x1: 0 },
        rotulo: 'El Cairo, año 700 de la Hégira',
        rotuloSub: '1300 de la era cristiana',
        texto: [
          'Dicen que la memoria de un viejo es como el Nilo en verano: crece, se desborda y lo cubre todo, lo verdadero y lo que no lo es.',
          'Por eso escribo. Para que la tinta guarde lo que mi memoria ya empieza a confundir.',
          'Me llamo *Yusuf ibn Ibrahim*. En los mercados me llaman *Ibn al-Haddad*: el hijo del herrero.',
          'He servido a cinco sultanes. He visto arder ciudades y caer reyes. He visto al mundo entero temblar ante los jinetes del este… y he visto cómo se les detenía.',
          'Pero toda historia empieza en algún lugar. La mía empieza en el año 647 de la Hégira —1249, según la cuenta de los francos— con el sonido de un martillo.',
        ],
        sfx: [{ t: 0.5, id: 'pluma' }],
      },
      {
        lamina: 'negro',
        titulo: { antes: 'CAPÍTULO I', texto: 'Prólogo', sub: 'El hijo del herrero', arabe: 'ابن الحداد', dur: 7.5 },
        estribillo: 'capitulo',
        barras: false,
        vineta: false,
      },
      {
        lamina: 'mapa',
        camara: { x0: 520, y0: 250, x1: 470, y1: 230 },
        mapa: Object.assign({}, MAPA_BASE, { resaltar: ['cairo'], fecha: '1249', zonas: [{ t0: 3, color: '#d4a73a', puntos: [[30.5, 28.5, 3.2], [31.5, 30.5, 1.6], [35.5, 32.5, 1.8], [37, 34.5, 2]] }] }),
        texto: [
          'En aquel tiempo, Egipto era el corazón del mundo. Por sus puertos pasaban las especias de la India, el oro de África y la seda de China.',
          'Lo gobernaba el sultán *as-Salih Ayyub*, de la familia del gran *Salah ad-Din*, el que sesenta años antes había arrebatado Jerusalén a los cruzados.',
          'Sus dominios iban del Nilo a Damasco. Pero los ayyubíes llevaban años peleándose entre ellos, primos contra primos, y el sultán ya no se fiaba de nadie.',
        ],
      },
      {
        lamina: 'mapa',
        camara: { x0: 470, y0: 30, x1: 520, y1: 200 },
        mapa: Object.assign({}, MAPA_BASE, { regiones: MAPA_BASE.regiones.concat(['estepas']), resaltar: ['cairo'], rutas: [{ id: 'esclavos', t0: 1.5, dur: 8, color: '#b8902f', flecha: true }] }),
        texto: [
          'Así que compró su propio ejército. Miles de muchachos traídos de las estepas del norte, al otro lado del mar Negro: *kipchaks*, turcos, criados desde niños para la guerra.',
          'Los llamaban *mamelucos*: «los poseídos». Esclavos que, al terminar su adiestramiento, eran liberados… y que solo debían lealtad a su señor y a sus hermanos de armas.',
          'El sultán los acuarteló en una isla del Nilo. Por eso los llamaron *Bahriyya*: los del río. Eran los mejores jinetes del mundo. Y lo sabían.',
        ],
      },
      {
        lamina: 'mapa',
        musica: 'cruzados',
        camara: { x0: 0, y0: 60, x1: 420, y1: 230 },
        mapa: { regiones: ['francia', 'mediterraneo', 'egipto', 'ultramar'], ciudades: ['aigues', 'roma', 'limasol', 'damieta', 'cairo', 'acre'], resaltar: ['aigues', 'damieta'], rutas: [{ id: 'cruzada', t0: 4, dur: 16, barco: true }, { id: 'chipreDamieta', t0: 21, dur: 5, barco: true }], fecha: '1248' },
        texto: [
          'Mientras tanto, al otro lado del mar, el rey de los francos, *Luis*, había tomado la cruz.',
          'Había jurado conquistar Egipto. Los francos decían que El Cairo era la llave de Jerusalén: quien tuviera el Nilo, tendría la Ciudad Santa.',
          'En el verano de 1248 zarpó de un puerto llamado *Aigues-Mortes* con miles de caballeros, peones y ballesteros. Pasó el invierno en Chipre, esperando.',
        ],
      },
      {
        lamina: 'flota',
        ambiente: 'mar',
        camara: { x0: 340, x1: 0 },
        rotulo: 'Damieta',
        rotuloSub: 'Junio de 1249',
        sfx: [{ t: 1, id: 'campana', opc: { vol: 0.5 } }, { t: 9, id: 'campana', opc: { vol: 0.4, frec: 174 } }],
        texto: [
          'Y en junio de 1249, el mar frente a *Damieta* se llenó de velas. Cientos de naves. Los que las vieron desde las murallas decían que no se veía el agua.',
          'Los francos desembarcaron en la playa bajo una lluvia de flechas. Esa misma noche, la guarnición de Damieta huyó presa del pánico.',
          'La ciudad que debía resistir un año cayó en un solo día. El sultán, furioso, mandó ahorcar a medio centenar de sus oficiales.',
        ],
      },
      {
        lamina: 'sultan',
        estilo: 'arriba',
        musica: 'cronista',
        ambiente: 'interior',
        camara: { x0: 0, x1: 60 },
        texto: [
          'Pero el sultán tenía un enemigo peor que los francos: su propio cuerpo. Una llaga en la pierna lo consumía desde hacía meses.',
          'Aun así se hizo llevar en litera hasta *Mansura*, a medio camino entre Damieta y El Cairo, y ordenó reunir a todo hombre capaz de empuñar un arma.',
          'Los francos esperaban en Damieta a que bajara la crecida del Nilo. Llegó el otoño. Y con él, la llamada a las armas llegó a El Cairo.',
        ],
      },
      {
        lamina: 'cairoPanorama',
        musica: 'cairo',
        fundidoMusica: 4,
        ambiente: 'ciudad',
        camara: { x0: 0, x1: 860 },
        rotulo: 'Al-Qahira · El Cairo',
        rotuloSub: 'Otoño de 1249',
        texto: [
          '*Al-Qahira*. La Victoriosa. Cientos de miles de almas entre el Nilo y las colinas del Muqattam, donde la *Ciudadela* de Salah ad-Din vigilaba la ciudad.',
          'Abajo, en los callejones, la vida seguía como si la guerra fuera un rumor lejano: mercaderes, aguadores, sabios, mendigos y ladrones.',
          'Y cerca de la puerta de *Bab Zuwayla*, en la calle de los herreros, el fuego de una forja no se apagaba nunca.',
          'Era la forja de mi padre.',
        ],
      },
    ],
    siguiente: { escena: 'zona', params: { zona: 'forja', entrada: 'inicio' }, fundido: 2 },
  };

  // ------------------------------------------------------------------ ESA NOCHE
  C.noche = {
    musica: 'despedida',
    ambiente: 'viento',
    planos: [
      {
        lamina: 'cairoTitulo',
        camara: { x0: 700, x1: 300 },
        texto: [
          'Volví a casa con el corazón golpeándome el pecho como el martillo de mi padre.',
          'Había ensayado mil veces las palabras por el camino. Al final, no me hizo falta ninguna.',
        ],
      },
    ],
    siguiente: { escena: 'zona', params: { zona: 'forjaNoche', entrada: 'inicio' }, fundido: 1.5 },
  };

  // ------------------------------------------------------------------ LA PARTIDA Y EL INVIERNO EN MANSURA
  C.partida = {
    musica: 'maydan',
    ambiente: 'ciudad',
    planos: [
      {
        lamina: 'columna',
        estilo: 'arriba',
        camara: { x0: 80, x1: 260 },
        rotulo: 'Bab al-Futuh',
        rotuloSub: 'Noviembre de 1249',
        sfx: [{ t: 2, id: 'cuerno', opc: { vol: 0.5 } }, { t: 4, id: 'multitud', opc: { vol: 0.5 } }],
        texto: [
          'Tres días después salimos por *Bab al-Futuh*, la Puerta de las Conquistas, camino del norte.',
          'Las mujeres lanzaban sus gritos de júbilo desde las azoteas. Los niños corrían junto a los caballos. Yo buscaba entre la gente un velo de color ciruela… y lo encontré.',
          'Nunca había salido de El Cairo. No sabía que, cuando volviera, ya no sería la misma ciudad. Ni yo el mismo hombre.',
        ],
      },
      {
        lamina: 'marcha',
        musica: 'campamento',
        ambiente: 'viento',
        camara: { x0: 0, x1: 300 },
        texto: [
          'Marchamos siete días junto al Nilo, entre palmerales y aldeas que nos daban pan y nos miraban con miedo.',
          'A mí me pusieron con los de a pie: los que no éramos mamelucos ni hijos de emires. Arqueros de aldea, barqueros, artesanos con lanzas prestadas.',
        ],
      },
      {
        lamina: 'mapa',
        musica: 'tension',
        camara: { x0: 360, y0: 262, x1: 400, y1: 280 },
        mapa: { regiones: ['egipto', 'mediterraneo'], ciudades: ['cairo', 'mansura', 'damieta', 'alejandria'], resaltar: ['mansura'], rutas: [{ id: 'ejercito', t0: 1, dur: 5, color: '#2a6a3a', flecha: true }, { id: 'marchaLuis', t0: 7, dur: 6, color: '#a8221e', flecha: true }], fecha: 'Nov. 1249', desplazar: { mansura: [16, 22], damieta: [12, -14] } },
        texto: [
          'El 20 de noviembre, los francos salieron por fin de Damieta y avanzaron río arriba, hacia nosotros.',
          'Dos días después, en su tienda de Mansura… el sultán as-Salih Ayyub murió.',
        ],
      },
      {
        lamina: 'sultan',
        estilo: 'arriba',
        musica: 'despedida',
        ambiente: 'interior',
        camara: { x0: 80, x1: 40 },
        texto: [
          'Si el ejército se hubiera enterado, se habría deshecho como el barro en la crecida. Pero su esposa, *Shajar al-Durr* —«Árbol de perlas»—, no lo permitió.',
          'Ocultó el cuerpo. Siguió llevando comida a la tienda del sultán y firmando órdenes con su nombre. Durante semanas, los soldados creímos que nuestro señor seguía vivo.',
          'Yo no lo supe hasta mucho después. Hay mentiras que salvan reinos.',
        ],
      },
      {
        lamina: 'campamentos',
        musica: 'campamento',
        ambiente: 'noche',
        camara: { x0: 0, x1: 260 },
        rotulo: 'Mansura',
        rotuloSub: 'Diciembre de 1249 · Febrero de 1250',
        texto: [
          'Los francos llegaron a la orilla del *Bahr al-Saghir*, el canal que protegía Mansura, y allí se detuvieron. Nosotros, en la otra orilla.',
          'Durante semanas intentaron construir una calzada para cruzar. De noche, nuestros *naffatun* les lanzaban fuego griego, que atravesaba el cielo como un dragón.',
          'Así pasamos el invierno: mirándonos a través del agua y contando las hogueras del enemigo.',
        ],
      },
    ],
    siguiente: { escena: 'zona', params: { zona: 'campamento', entrada: 'inicio', traje: 'yusufSoldado' }, fundido: 1.5 },
  };

  // ------------------------------------------------------------------ EL VADO (8 de febrero de 1250)
  C.vado = {
    musica: 'tension',
    ambiente: 'rio',
    planos: [
      {
        lamina: 'vado',
        camara: { x0: 0, x1: 240 },
        rotulo: '8 de febrero de 1250',
        rotuloSub: 'Antes del amanecer',
        texto: [
          'Un traidor —nunca supimos su nombre— enseñó a los francos un vado en el canal, a cambio de quinientas monedas de oro.',
          'Cruzaron antes del alba, entre la niebla. La vanguardia la mandaba el hermano del rey, *Roberto de Artois*, con los caballeros del Temple.',
        ],
      },
      {
        lamina: 'negro',
        estilo: 'centro',
        sfx: [{ t: 0.5, id: 'cuerno', opc: { vol: 0.6, frec: 110 } }, { t: 1.5, id: 'multitud', opc: { vol: 0.7 } }, { t: 4, id: 'choque', opc: { vol: 0.5 } }],
        texto: [
          'Cayeron sobre nuestro campamento mientras dormíamos. El emir *Fajr al-Din*, nuestro comandante, salió del baño con la barba a medio teñir de alheña. Lo mataron allí mismo.',
          'Debieron detenerse. Esperar a su rey. Pero Roberto vio las puertas abiertas de Mansura… y quiso la gloria para él solo.',
        ],
      },
      {
        lamina: 'presentacion',
        musica: 'jefe',
        presentacion: { retrato: 'baibars', nombre: 'Baibars', arabe: 'بيبرس', epiteto: '«al-Bunduqdari». Emir de los mamelucos Bahriyya. Nadie lo sabía aún, pero aquel hombre iba a cambiar la historia de Egipto.' },
        texto: [
          'Entonces un emir de los Bahriyya, un kipchak alto con voz de trueno, tomó el mando. Se llamaba *Baibars*.',
          'Su orden fue la más extraña que he oído en toda mi vida: «Abrid las puertas. Dejadles entrar».',
        ],
      },
    ],
    siguiente: { escena: 'zona', params: { zona: 'mansura', entrada: 'inicio', traje: 'yusufSoldado' }, fundido: 1.2 },
  };

  // ------------------------------------------------------------------ EPÍLOGO
  C.epilogo = {
    musica: 'despedida',
    ambiente: 'viento',
    planos: [
      {
        lamina: 'ruinas',
        estilo: 'arriba',
        camara: { x0: 0, x1: 160 },
        rotulo: 'Mansura',
        rotuloSub: 'La tarde del 8 de febrero de 1250',
        texto: [
          'Al caer la tarde, las calles de Mansura eran un cementerio de hierro. Roberto de Artois murió en una casa, defendiéndose hasta el final. De los templarios que entraron, apenas escaparon unos pocos.',
          'El rey Luis resistió junto al canal. Pero había perdido la flor de su caballería, y el Nilo, que había venido a conquistar, empezó a conquistarle a él.',
        ],
      },
      {
        lamina: 'mapa',
        musica: 'cronista',
        camara: { x0: 400, y0: 280, x1: 370, y1: 270 },
        mapa: { regiones: ['egipto', 'mediterraneo'], ciudades: ['cairo', 'mansura', 'damieta'], resaltar: ['damieta', 'mansura'], fecha: 'Abril de 1250', desplazar: { mansura: [16, 22], damieta: [12, -14] } },
        texto: [
          'El hambre y la fiebre diezmaron a los francos durante semanas. En abril intentaron retirarse a Damieta. En *Fariskur* los alcanzamos.',
          'El propio rey de Francia fue hecho prisionero y encerrado en una casa de Mansura. Su rescate costó una fortuna… y la devolución de Damieta.',
        ],
      },
      {
        lamina: 'negro',
        estilo: 'centro',
        texto: [
          'Pero aquella victoria tuvo un precio que nadie esperaba. El nuevo sultán, *Turanshah*, despreció a los mamelucos que le habían salvado el trono. Ellos lo mataron a orillas del Nilo.',
          '*Shajar al-Durr* fue proclamada sultana. Y los mamelucos, los esclavos del río, comprendieron que ya no necesitaban amos.',
          'Había empezado una nueva era. Y yo, el hijo del herrero, estaba dentro de ella.',
        ],
      },
      {
        lamina: 'estepa',
        musica: 'mongoles',
        ambiente: 'viento',
        camara: { x0: 0, x1: 260 },
        rotulo: 'Las estepas del este',
        texto: [
          'Pero muy lejos, más allá de Bagdad, más allá de los ríos y de las montañas, se estaba levantando una tormenta.',
          'Jinetes que no conocían la derrota. Un imperio que ya cubría medio mundo y que solo obedecía al Cielo Eterno.',
        ],
      },
      {
        lamina: 'bagdad',
        camara: { x0: 0, x1: 160 },
        rotulo: 'Bagdad',
        rotuloSub: 'Febrero de 1258',
        sfx: [{ t: 1, id: 'fuego', opc: { vol: 0.6 } }, { t: 5, id: 'trueno', opc: { vol: 0.4 } }],
        texto: [
          'Ocho años después, los mongoles de *Hulagu* arrasaron Bagdad, la ciudad de los califas. Dicen que el Tigris bajó negro por la tinta de los libros… y rojo por la sangre.',
          'Y entonces miraron hacia Egipto.',
        ],
      },
      {
        lamina: 'negro',
        titulo: { antes: 'FIN DEL PRÓLOGO', texto: 'Capítulo II', sub: 'Los jinetes del fin del mundo  ·  próximamente', dur: 9 },
        estribillo: 'capitulo',
        barras: false,
        vineta: false,
      },
    ],
    siguiente() {
      IH.desbloquearCronica('mongoles');
      IH.partida.banderas.prologoCompletado = true;
      IH.logro('PROLOGO');
      IH.guardar();
      IH.cambiarEscena('titulo', { creditos: true, directo: true }, { fundido: 2 });
    },
  };
})();
