/*
  HOLOCRÓN GALÁCTICO — Los Tomos
  -------------------------------------------------------------
  Convenciones de canon:
    base: 'O' = texto Original de la web (2025)
          'A' = decisión del Autor (respuestas del 2 oct 2026)
          'P' = Propuesta de reconstrucción (pendiente de aprobar)
    Dentro del texto, {entre llaves} = detalle propuesto.
  Calendario (propuesta): año 0 = Batalla de Orion-34.
    AO = antes de Orion · DO = después de Orion.
*/
window.LORE = window.LORE || {};

LORE.tomos = [
  /* ============================================================ TOMO I */
  {
    id: 'tomo-1',
    num: 'I',
    titulo: 'La Guerra de las Galaxias Fragmentadas',
    periodo: 'c. 12 AO – 1 DO',
    anios: [-12, 1],
    original: 'El Imperio de Rilur, con su poderío de clones y droides, avanza imparable. La República de Vinica forja una alianza desesperada con los Caballeros de la Sintonía. En la Batalla de Orion-34, el maestro Saelen Vharr derrota a Lord Veylan, pero la victoria es agridulce: el este galáctico, incluyendo Dubitsa, cae. Vinica firma un tratado humillante para sobrevivir.',
    sinopsis: 'El Reactor Oscuro da a Rilur ejércitos casi gratuitos y una expansión sin freno. Vinica, Dubitsa y los Caballeros de la Sintonía se unen y vencen en Lolop, pero el Imperio rodea el frente: el este cae entero y Vinica se rinde con un tratado humillante.',
    capitulos: [
      {
        titulo: 'El fuego de Raqut',
        base: 'A P',
        texto: `
Durante siglos, el Imperio de Rilur había sido la fuerza dominante de la galaxia. Su doctrina se resumía en dos principios que cualquier súbdito sabía recitar: orden y poder. Pero lo que convirtió a aquel imperio antiguo en una marea imparable no fue su doctrina, sino una máquina.

En el mundo de Raqut, {los científicos del Imperio, los mismos que más tarde formarían el núcleo de los Nighul,} lograron encender el Reactor Oscuro. Fuera de Rilur nadie llegó a comprender del todo cómo funcionaba. Lo que sí comprendió la galaxia fueron sus consecuencias: energía y recursos casi ilimitados a un coste casi nulo. Las fundiciones nunca se apagaban, los tanques de clonación trabajaban sin descanso y las cadenas de montaje fabricaban droides de combate por millones.

Un ejército que no cuesta nada no necesita volver a casa. Bajo el {Emperador Sarkon}, Rilur dejó de conquistar sistema a sistema y empezó a avanzar por frentes enteros. Las crónicas de la época describen cielos cubiertos de flotas de desembarco y mundos que se rendían en cuanto veían las legiones de clones en órbita, antes de que se disparara un solo tiro. Los cronistas llamarían a aquella época la Guerra de las Galaxias Fragmentadas: una galaxia rota en mil frentes, todos retrocediendo ante el mismo enemigo.

El reactor tuvo otra consecuencia, más silenciosa. Su energía no era limpia, sino alterada, y al extenderse por la galaxia alteraba también la Sintonía Universal, la energía que conecta todas las cosas. En el santuario de Riqtom, los Caballeros de la Sintonía la sintieron desafinarse como una cuerda tensada hasta el límite. Entonces comprendieron que aquello ya no era una guerra entre estados. Si nadie detenía a Rilur, el desequilibrio acabaría rompiendo algo que nadie podría reparar.`
      },
      {
        titulo: 'La alianza desesperada',
        base: 'O A P',
        texto: `
La República de Vinica fue la primera gran potencia que entendió que no podía ganar sola. Su Senado, acostumbrado a resolverlo todo con comercio y diplomacia, vio cómo sus rutas se cerraban una tras otra y cómo sus flotas de defensa caían ante un enemigo que reponía sus pérdidas en semanas.

La decisión que tomó entonces dividió a la República durante generaciones: Vinica pidió ayuda a los Caballeros de la Sintonía. La orden era antigua, reservada y desconfiaba de la política. Muchos la conocían por su otro nombre, los Caballeros Ocultos, porque rara vez se dejaban ver fuera de sus santuarios. Hacía siglos que unos monjes guerreros no aceptaban luchar al lado de un Senado.

Aceptaron porque el problema no era Vinica ni su libertad, sino el reactor. Los Caballeros que respondieron a la llamada iban encabezados por el maestro Saelen Vharr, {y a su lado combatía un discípulo joven y obstinado llamado Kemet}.

En el este, el Imperio de Dubitsa se unió también. Dubitsa era una civilización ancestral de científicos, filósofos y guerreros disciplinados, y sus estrategas habían hecho los cálculos: al ritmo de producción de Rilur, el este caería en una década. Así nació la coalición de Vinica, Dubitsa y la Sintonía contra el expansionismo de Rilur. Su objetivo era detener al Imperio en el único lugar donde todavía era posible: el sistema Orion-34, en el planeta Lolop.`
      },
      {
        titulo: 'Lolop',
        base: 'O A P',
        texto: `
{Orion-34 era el cruce de rutas entre el núcleo imperial y los mundos del este. Quien lo controlara controlaba el acceso a Dubitsa, a los principados orientales y a buena parte del comercio de Vinica.} Lolop, su planeta principal, fue el escenario de la mayor batalla de la época.

El ejército de Rilur estaba al mando de Lord Veylan, un señor de la guerra imperial {con fama de no haber perdido nunca una campaña}. Veylan no tenía poderes de la Sintonía ni los necesitaba. Tenía clones y droides suficientes para cubrir el planeta y la paciencia de quien sabe que el enemigo se agotará antes que él.

{La batalla duró semanas. Las flotas de Vinica y Dubitsa contuvieron el bloqueo orbital mientras, en la superficie, las legiones imperiales avanzaban sobre las posiciones de la coalición.} Fueron los Caballeros quienes rompieron el equilibrio: {Saelen Vharr dirigió un ataque directo contra el puesto de mando de Veylan, cruzando líneas que ninguna fuerza convencional habría podido atravesar.}

El duelo entre el maestro y el señor de la guerra se convirtió en leyenda. Saelen Vharr derrotó a Lord Veylan, {que no sobrevivió al combate}. Sin su comandante, el ejército imperial de Lolop se desmoronó. Esa noche se celebró en los campamentos de la coalición la primera gran victoria contra Rilur en una generación. {Los cronistas tomarían esa batalla como el año cero de su calendario.}`
      },
      {
        titulo: 'La caída del Este',
        base: 'O P',
        texto: `
La victoria duró lo que tardó Rilur en reponer sus pérdidas.

Mientras la coalición celebraba Lolop, el Reactor Oscuro seguía funcionando. {En pocos meses, las legiones destruidas en Orion-34 ya tenían reemplazo, y el Imperio cambió de estrategia: dejó de atacar el cruce que defendía la coalición y lo rodeó. Nuevas flotas cayeron sobre el este galáctico por rutas que nadie vigilaba.}

El este galáctico cayó entero. Los principados orientales, que nunca habían sabido unirse, fueron conquistados uno por uno. Dubitsa resistió más que ninguno, pero tampoco pudo sostenerse: Rilur aniquiló y absorbió la antigua civilización. {Sus universidades se cerraron, su dinastía fue derrocada y los Pretoni que sobrevivieron pasaron a la clandestinidad.}

Por eso la victoria de Lolop fue agridulce. Saelen Vharr había ganado la batalla, pero la coalición había perdido la guerra.`
      },
      {
        titulo: 'La Paz de Hierro',
        base: 'O P',
        texto: `
Sola y rodeada, la República de Vinica hizo lo único que le permitía seguir existiendo: firmó un tratado humillante para sobrevivir. {Los vinicanos lo llamarían la Paz de Hierro. Vinica conservó su Senado y su capital, pero cedió territorios, aceptó límites a su flota y empezó a pagar tributo al Imperio.} Muchos senadores lo consideraron una traición. Otros sostenían que era la única forma de que Vinica siguiera viva para la próxima guerra.

Los Caballeros de la Sintonía pagaron el precio más alto. {Habían perdido a la mayoría de sus miembros en la campaña, y Rilur los declaró enemigos del Imperio. Saelen Vharr se retiró al santuario de Riqtom con los pocos supervivientes y allí dedicó sus últimos años a formar a Kemet, convencido de que el reactor acabaría devorando la galaxia si nadie lo apagaba.}

Rilur había ganado. {Durante casi dos décadas} impuso una paz de orden y control. Más tarde, en tiempos de caos, muchos la echarían de menos.`
      }
    ],
    ficha: {
      facciones: ['rilur', 'vinica', 'dubitsa', 'sintonia', 'principados'],
      personajes: ['sarkon', 'saelen-vharr', 'veylan', 'kemet'],
      batallas: ['lolop'],
      territorio: 'Rilur conquista todo el este galáctico, incluidos Dubitsa y los principados orientales. Vinica sobrevive, pero reducida y convertida en tributaria.',
      muertes: 'Lord Veylan {(muere en el duelo)}. La mayoría de los Caballeros de la Sintonía. La antigua dinastía de Dubitsa {(derrocada)}.',
      lideres: 'Ninguno nuevo. Rilur sigue bajo {Sarkon}.',
      tecnologia: 'Reactor Oscuro en pleno funcionamiento: energía y recursos casi ilimitados, producción masiva de clones y droides.',
      consecuencias: 'Empieza la paz impuesta de Rilur. La orden queda casi extinta y oculta en Riqtom. Dubitsa desaparece como estado.'
    },
    lugares: ['raqut', 'lolop', 'riqtom', 'vinica-prime', 'dubitsa-prime', 'rilur-prime'],
    juegos: [
      'Campaña RTS de la Batalla de Lolop jugable desde los dos bandos: hordas de Rilur (con reactor, sus unidades cuestan casi nada) contra una coalición escasa pero cualificada.',
      'Misión de héroe: el asalto de Saelen Vharr al puesto de mando de Lord Veylan.'
    ]
  },

  /* ============================================================ TOMO II */
  {
    id: 'tomo-2',
    num: 'II',
    titulo: 'El Despertar del Guardián',
    periodo: 'c. 8 – 18 DO',
    anios: [8, 18],
    original: 'Una facción rebelde destruye una mega-instalación militar imperial, provocando la ira del Emperador. Introduce a su élite, los Nizghul. El legendario Kemet lidera un contraataque, venciendo al Emperador en un duelo mortal en el que ambos perecen. Antes de morir, Kemet envía a su discípulo Raqid a buscar al Guardián del Bosque.',
    notaOriginal: '«Nizghul» es una errata de «Nighul» (decisión del autor, 2026).',
    sinopsis: 'Bajo la paz impuesta, Kemet se convierte en leyenda. Una facción rebelde destruye la luna-forja de Rilit; el Emperador responde desatando a los Nighul. Kemet golpea el corazón del Imperio y muere junto al Emperador en un duelo. Su última orden: encontrar al Guardián del Bosque.',
    capitulos: [
      {
        titulo: 'Los años del orden',
        base: 'O P',
        texto: `
La paz de Rilur fue una paz vigilada. Los mundos conquistados recibían energía barata del Reactor Oscuro y, a cambio, aceptaban gobernadores imperiales, guarniciones de clones y patrullas de droides que no dormían nunca. Para muchos fue la época más estable que habían conocido. Para otros fue una jaula.

{Saelen Vharr murió en Riqtom hacia el año 8 DO.} Su discípulo Kemet heredó lo que quedaba de la orden: un puñado de caballeros, un santuario escondido y una misión imposible. Con los años, Kemet se convirtió en una leyenda. {Aparecía donde la opresión imperial era más dura, desaparecía antes de que llegaran las legiones y en cada mundo que visitaba dejaba una célula de resistencia.} Su discípulo más cercano era Raqid, {paciente y metódico, el único a quien Kemet confiaba sus dudas.}

{Esas dudas tenían que ver con una visión. La Sintonía, decía Kemet, había empezado a señalar a alguien que aún no sabía quién era: un guardián ligado a un bosque, capaz de hacer lo que ni él ni su maestro habían logrado.}`
      },
      {
        titulo: 'La forja de Rilit',
        base: 'O A P',
        texto: `
{En el año 18 DO,} una facción rebelde logró lo que parecía imposible. Su objetivo fue Rilit, la luna-forja convertida en la mayor instalación militar del Imperio: {astilleros, fábricas de droides y criaderos de clones alimentados directamente por la energía del reactor.}

{Los rebeldes, veteranos de Lolop, exiliados de Dubitsa y saboteadores formados por las células de Kemet, pasaron meses infiltrados entre los trabajadores de la luna. Cuando actuaron, lo hicieron sobre las conducciones de energía. La reacción en cadena destruyó la instalación y Rilit ardió durante días.}

Fue el golpe más duro que había recibido el Imperio desde Lolop, y no solo por las pérdidas materiales. {Por primera vez en dieciocho años, la galaxia vio que Rilur podía sangrar.} Y el Emperador montó en cólera.`
      },
      {
        titulo: 'Los Nighul',
        base: 'O A',
        texto: `
La respuesta del Emperador fue mostrar a la galaxia su élite: los Nighul.

Los Nighul eran la élite de la élite. Se elegían por selección genética entre los mejores guerreros y los mejores clones del Imperio, y pasaban por un entrenamiento intenso e inhumano. Los que lo superaban acumulaban años de veteranía antes de recibir el título. Un solo Nighul equivalía a cien Nizarios, y los Nizarios ya eran la élite del ejército.

Pero lo que los hacía de verdad temibles era su vínculo con el Reactor Oscuro. Su energía alterada los unía mental y energéticamente y potenciaba sus habilidades y sus poderes arcanos. {Combatían como un solo cuerpo y cada uno sabía lo que veían sus hermanos.} Los Caballeros usaban la Sintonía para buscar el equilibrio; el poder de los Nighul era esa misma Sintonía torcida por el reactor.

Además, no eran solo guerreros. Los Nighul eran también los mejores científicos, filósofos e ingenieros de la galaxia. De ahí su prestigio: junto a los Nizarios eran el orgullo de Rilur.

{Tras Rilit, el Emperador los lanzó contra los mundos sospechosos de rebeldía, y las células de resistencia cayeron una tras otra.}`
      },
      {
        titulo: 'El duelo',
        base: 'O P',
        texto: `
Kemet entendió que no podía ganar aquella guerra escondiéndose. {Si los Nighul seguían cazando, en un año no quedaría nadie a quien proteger.} Así que decidió golpear donde podía detenerlos: al propio Emperador.

El legendario Kemet lideró un contraataque que llegó {hasta Rilur Prime}. {Las crónicas no coinciden sobre cómo logró entrar en la ciudadela imperial. Unas hablan de traidores en la guardia; otras, de un asalto desesperado de los últimos caballeros.} Todas coinciden en el final: Kemet y el Emperador se enfrentaron cara a cara.

{El Emperador no era un anciano indefenso. Había sido el primero en unirse al reactor, y la energía alterada le daba una fuerza impropia de su edad.} Fue un duelo mortal. Kemet venció al Emperador, pero no salió con vida: los dos perecieron, y con ellos terminó una época.`
      },
      {
        titulo: 'La última orden',
        base: 'O A P',
        texto: `
Antes de morir, Kemet tuvo tiempo de dar una última orden. No fue un mensaje para la rebelión ni un plan de guerra, sino una misión para su discípulo Raqid: buscar al Guardián del Bosque.

La muerte del Emperador hundió el centro del Imperio en una crisis enorme. {No había un heredero preparado y el trono quedó en disputa. Durante unas semanas de caos, gobernadores y comandantes de legión se vigilaron unos a otros. Al final se impuso el más fuerte: Korvan, Gran Mariscal de los ejércitos imperiales, que ocupó el trono con el respaldo de las legiones y de los Nighul.}

{Korvan no era un visionario como su predecesor. Era un soldado duro e implacable, y heredaba un imperio que todavía conservaba el reactor. En Rilur Prime nadie imaginaba que la profecía de un caballero muerto acabaría con aquello.}

Raqid salió de la capital entre el humo del duelo. Tardaría cinco años en cumplir la orden.`
      }
    ],
    ficha: {
      facciones: ['rilur', 'sintonia'],
      personajes: ['kemet', 'raqid', 'sarkon', 'korvan', 'saelen-vharr'],
      batallas: ['rilit-sabotaje', 'duelo-rilur-prime'],
      territorio: 'Sin grandes cambios: Rilur sigue dominando. La luna-forja de Rilit queda destruida.',
      muertes: '{Saelen Vharr (c. 8 DO, de vejez).} Kemet y el Primer Emperador ({Sarkon}), en el duelo.',
      lideres: '{Korvan}, Gran Mariscal, se convierte en Emperador.',
      tecnologia: 'Aparecen en público los Nighul, vinculados al Reactor Oscuro.',
      consecuencias: 'Crisis en el centro imperial. Raqid empieza la búsqueda del Guardián del Bosque.'
    },
    lugares: ['rilit', 'rilur-prime', 'riqtom'],
    juegos: [
      'Misión de sigilo y sabotaje: infiltrarse en la luna-forja de Rilit y destruirla.',
      'Combate contra jefe: el duelo de Kemet contra el Emperador en la ciudadela de Rilur Prime.'
    ]
  },

  /* ============================================================ TOMO III */
  {
    id: 'tomo-3',
    num: 'III',
    titulo: 'El Guardián del Bosque',
    periodo: 'c. 23 – 26 DO',
    anios: [23, 26],
    original: 'Cinco años después, Raqid encuentra a Kefra, un joven con un poderoso vínculo con la Sintonía. Tras un entrenamiento acelerado en otro plano, Kefra regresa como un guerrero formidable. Destruye el Reactor Oscuro del Imperio y lidera una campaña rebelde que libera Vinica Prime, convirtiéndose en un símbolo de esperanza.',
    sinopsis: 'Raqid encuentra a Kefra en el mundo-bosque de Arcados. Tras entrenar en otro plano, Kefra destruye el Reactor Oscuro en Raqut. El Imperio pierde su fuente de poder, los Nighul quedan rotos y la rebelión libera Vinica Prime y Polus-12.',
    capitulos: [
      {
        titulo: 'Arcados',
        base: 'O A P',
        texto: `
Raqid buscó durante cinco años. Recorrió mundos ocupados y mundos olvidados con la única pista que le había dejado su maestro: un bosque, y alguien unido a él.

Lo encontró en Arcados, un mundo neutral del extremo noroeste de la galaxia, lejos de las rutas imperiales. {Arcados estaba cubierto de bosques tan antiguos que sus habitantes decían que los árboles tenían memoria.} Allí vivía Kefra, {un joven sin entrenamiento ni linaje conocido que nunca había visto a un caballero.}

{Raqid lo supo en cuanto lo vio. La Sintonía, desafinada en casi toda la galaxia por la energía del reactor, sonaba limpia alrededor de aquel muchacho.} El vínculo de Kefra con la Sintonía era {más poderoso que el de cualquier caballero que Raqid hubiera conocido, incluido Kemet}.`
      },
      {
        titulo: 'El otro plano',
        base: 'O P',
        texto: `
No había tiempo para un entrenamiento normal. {Formar a un caballero llevaba décadas, y la galaxia no tenía décadas.} Raqid hizo algo que la orden solo había intentado en contadas ocasiones: llevó a Kefra a entrenarse en otro plano.

{Los Caballeros lo llamaban el Plano de la Resonancia. Era un reflejo de la realidad hecho de Sintonía pura, al que solo se llegaba desde lugares donde la energía universal era muy intensa, como los bosques de Arcados o el santuario de Riqtom. Allí el tiempo no corría igual. Nadie supo nunca del todo qué vivió Kefra en aquel lugar, y él casi nunca hablaba de ello.}

Cuando regresó, ya no era un muchacho de los bosques, sino un guerrero formidable.`
      },
      {
        titulo: 'El corazón de Raqut',
        base: 'O A P',
        texto: `
{Kefra entendió algo que muchos rebeldes no veían: mientras el reactor siguiera funcionando, era inútil luchar contra los ejércitos de Rilur, porque el Imperio fabricaba una legión nueva por cada una que perdía.}

Su objetivo fue el Reactor Oscuro, en el mundo de Raqut. {Kefra y Raqid se infiltraron en el complejo guiados por la propia Sintonía, que allí se retorcía como una herida abierta. Lo defendían los Nighul, y Raqid se quedó atrás para contenerlos mientras Kefra avanzaba hacia el núcleo.}

Kefra destruyó el Reactor Oscuro.

Las consecuencias se sintieron en toda la galaxia a la vez. {Las fábricas de Rilur se detuvieron y los criaderos de clones se apagaron.} El Imperio perdió la energía casi ilimitada sobre la que había construido sus ejércitos. {Los Nighul, unidos al reactor en cuerpo y mente, sintieron que les arrancaban algo de dentro: muchos cayeron fulminados y otros perdieron la razón.} Los supervivientes seguían siendo guerreros temibles, pero nunca volverían a ser lo que habían sido.

{Raqid sobrevivió, aunque con heridas que nunca curaron del todo. En Riqtom, los últimos Caballeros sintieron que la Sintonía empezaba a afinarse de nuevo.}`
      },
      {
        titulo: 'Vinica libre',
        base: 'O A P',
        texto: `
Sin el reactor, el ejército imperial que ocupaba el oeste se quedó sin refuerzos. Kefra aprovechó el momento y lideró una campaña rebelde hacia Vinica Prime.

{La flota rebelde se formó con naves vinicanas escondidas desde la Paz de Hierro, voluntarios de los mundos liberados y antiguos oficiales de Dubitsa. La guarnición imperial de Vinica Prime, que llevaba años sin conocer la escasez, descubrió de golpe que los droides que perdía ya no se reponían.} Vinica Prime quedó liberada, y con ella Polus-12, el gran mundo industrial de la República, cuyas fábricas pasaron a abastecer a la rebelión.

{El Senado de Vinica volvió a reunirse en libertad.} En toda la galaxia se repetía el nombre de Kefra. El muchacho de Arcados se había convertido en un símbolo de esperanza, y la galaxia empezó a llamarlo con el título que Kemet había profetizado: el Guardián del Bosque.`
      }
    ],
    ficha: {
      facciones: ['sintonia', 'vinica', 'rilur'],
      personajes: ['raqid', 'kefra', 'korvan'],
      batallas: ['reactor-raqut', 'liberacion-vinica'],
      territorio: 'Se liberan Vinica Prime y Polus-12. El oeste galáctico sale del control imperial.',
      muertes: '{Gran parte de los Nighul mueren o enloquecen al caer el reactor.}',
      lideres: 'Kefra se convierte en líder rebelde y símbolo de la galaxia.',
      tecnologia: 'Destrucción del Reactor Oscuro. Se acaban la energía casi gratuita y la producción masiva de clones y droides.',
      consecuencias: 'Rilur ya no puede reponer sus ejércitos de la nada y tiene que buscar otra fuente de poder.'
    },
    lugares: ['arcados', 'raqut', 'vinica-prime', 'polus-12', 'riqtom'],
    juegos: [
      'RPG o acción: el viaje de Kefra desde Arcados, el entrenamiento en el otro plano y la infiltración en Raqut.',
      'Mecánica de mundo: al destruir el reactor cambian las reglas económicas del Imperio (antes y después de Raqut).'
    ]
  },

  /* ============================================================ TOMO IV */
  {
    id: 'tomo-4',
    num: 'IV',
    titulo: 'El Renacer del Imperio',
    periodo: 'c. 27 – 33 DO',
    anios: [27, 33],
    original: 'A pesar de las derrotas, Rilur resiste. El Emperador lanza una desastrosa invasión a la galaxia de Andalus, perdiendo millones de tropas. A su regreso, herido y furioso, lanza una contraofensiva brutal, mientras Kefra aprovecha para iniciar una guerra civil galáctica total. Dubitsa y Vinica se fortalecen en el caos.',
    sinopsis: 'Sin reactor, Korvan busca recursos fuera de la galaxia e invade Andalus. Es una masacre de la que casi nadie vuelve. Herido, desata una represión brutal; Kefra responde con una guerra civil galáctica total. Dubitsa renace bajo Teosio II y Vinica se fortalece.',
    capitulos: [
      {
        titulo: 'Rilur resiste',
        base: 'O P',
        texto: `
A pesar de las derrotas, Rilur resistió. Sin el reactor ya no podía fabricar ejércitos de la nada, pero {conservaba legiones veteranas, flotas enteras, a los Nizarios y a los Nighul que habían sobrevivido. Y tenía a Korvan.}

{El Emperador Korvan había pasado la vida en campaña y sabía gestionar la escasez. Recortó frentes, abandonó los mundos que no podía defender y concentró sus fuerzas en el núcleo.} Pero también sabía que un imperio de soldados sin energía barata se moría poco a poco. {Necesitaba algo que sustituyera al reactor, y lo buscó donde nadie se había atrevido a mirar: fuera de la galaxia.}`
      },
      {
        titulo: 'Más allá del Vacío',
        base: 'O A P',
        texto: `
{En el extremo oriental de la galaxia, más allá de las ruinas de Portus, se abría el Paso del Vacío, el único corredor conocido hacia la galaxia vecina.} Al otro lado vivían los Hijos de Andalus, un pueblo del que en Rilur solo se conocían leyendas: {que sus antepasados habían habitado esta galaxia, que Portus había sido su capital y que sus libros sagrados prometían el regreso.}

{Korvan creyó que la galaxia de Andalus era rica, estaba mal defendida y podía devolver al Imperio la energía y los recursos que había perdido.} Lanzó la invasión {con lo mejor que le quedaba}.

Fue una masacre. {La galaxia de Andalus no estaba indefensa: era el corazón de una potencia teocrático-militar que llevaba siglos preparándose para la guerra.} Rilur perdió millones de tropas. Casi nadie volvió con vida, y el Imperio perdió gran parte de su ejército en una sola campaña.

Korvan fue uno de los pocos que regresaron. Volvió herido y furioso, y con algo peor que una derrota: había despertado a un enemigo temible de otra galaxia {que ahora conocía el camino}.`
      },
      {
        titulo: 'La contraofensiva',
        base: 'O P',
        texto: `
Herido y humillado, Korvan no se retiró a recuperarse. Lanzó una contraofensiva brutal {contra los mundos rebeldes de su propia galaxia, como si necesitara demostrar que el Imperio seguía vivo.}

{Ordenó arrasar mundos enteros sospechosos de apoyar a Kefra y lanzó contra ellos a los últimos Nighul y a las legiones de Nizarios. Durante un tiempo pareció funcionar, pero cada mundo arrasado empujaba a otros dos a la rebelión.}`
      },
      {
        titulo: 'La guerra de todos',
        base: 'O A P',
        texto: `
Kefra vio la oportunidad que llevaba años esperando. Con el Imperio desangrado tras Andalus y volcado en una represión sin sentido, inició una guerra civil galáctica total. {Ya no era una rebelión en los márgenes: los mundos ocupados, las guarniciones descontentas y los pueblos absorbidos se levantaron a la vez.}

En el caos, dos potencias se fortalecieron. En el este, Dubitsa resurgió de sus cenizas. Teosio II, {descendiente de la antigua dinastía,} reunió a los Pretoni que habían sobrevivido en la clandestinidad, {recuperó Dubitsa Prime y reabrió las universidades de Instantinopla}. En el oeste, Vinica, libre desde la campaña de Kefra, {reconstruyó su flota} y se hizo más fuerte.

{Los principados del este también recuperaron su independencia, aunque enseguida volvieron a sus viejas rivalidades.}

{Al terminar la guerra civil, Rilur ya no era el amo de la galaxia. Era una potencia herida, rodeada de enemigos que habían aprendido a vencerla.}`
      }
    ],
    ficha: {
      facciones: ['rilur', 'andalus', 'sintonia', 'dubitsa', 'vinica', 'principados'],
      personajes: ['korvan', 'kefra', 'teosio-ii'],
      batallas: ['invasion-andalus', 'contraofensiva-korvan', 'guerra-civil'],
      territorio: 'Rilur pierde el este y el oeste. Dubitsa renace con Dubitsa Prime como capital. Vinica se refuerza y {los principados recuperan su independencia}.',
      muertes: 'Millones de soldados de Rilur en la galaxia de Andalus.',
      lideres: 'Teosio II restaura el Imperio de Dubitsa.',
      tecnologia: '{Paso del Vacío: el corredor intergaláctico hacia Andalus.}',
      consecuencias: 'Andalus descubre el camino hacia esta galaxia y alimenta su rencor. Rilur queda desangrado.'
    },
    lugares: ['portus', 'paso-vacio', 'dubitsa-prime', 'vinica-prime', 'rilur-prime'],
    juegos: [
      'Campaña trágica de supervivencia: la retirada de Korvan desde la galaxia de Andalus.',
      'Gran estrategia: la guerra civil galáctica con varias facciones jugables (Rilur, rebeldes de Kefra, Dubitsa, Vinica).'
    ]
  },

  /* ============================================================ TOMO V */
  {
    id: 'tomo-5',
    num: 'V',
    titulo: 'El Legado de la Luz',
    periodo: 'c. 33 – 52 DO',
    anios: [33, 52],
    original: 'El Emperador muere por sus heridas. Su hijo, Reus, asciende al trono y busca la paz. Firma una tregua con Dubitsa y Vinica, reestructura el Imperio hacia fuentes de energía limpias e introduce un sistema parlamentario. Una era de reconstrucción comienza, pero una nueva sombra se cierne desde el vacío.',
    sinopsis: 'Korvan muere de sus heridas. Su hijo Reus firma la paz, sustituye la energía del reactor por energía limpia y crea un Parlamento. Veinte años de reconstrucción, mientras al otro lado del Vacío Andalus prepara su regreso.',
    capitulos: [
      {
        titulo: 'La muerte de Korvan',
        base: 'O P',
        texto: `
{En el año 33 DO,} el Emperador murió por sus heridas. {Las que había traído de Andalus nunca llegaron a cerrar. Murió en Rilur Prime, rodeado de generales que ya discutían su sucesión.}

{Esta vez no hubo crisis.} Korvan tenía un hijo, Reus, y el trono pasó a él.`
      },
      {
        titulo: 'El emperador que buscó la paz',
        base: 'O P',
        texto: `
{Reus no se parecía a su padre. Había crecido entre guerras que Rilur ya no podía ganar y había visto volver de Andalus a los pocos supervivientes.} Al llegar al trono hizo lo que ningún emperador de Rilur había hecho: buscar la paz.

Firmó una tregua con Dubitsa y Vinica. {Se la llamó la Tregua de Instantinopla, porque se firmó en la capital renacida de Dubitsa. Rilur reconoció las fronteras de sus antiguos enemigos y estos, a cambio, dejaron de alimentar la guerra civil. Kefra, cuya guerra había hecho posible la tregua, la aceptó.}

{Muchos en Rilur, sobre todo en la élite militar, lo vieron como una rendición. Para Reus era la única manera de que el Imperio sobreviviera.}`
      },
      {
        titulo: 'Luz limpia',
        base: 'O A P',
        texto: `
Reus sabía que el poder de Rilur se había levantado sobre el Reactor Oscuro y que aquello no iba a volver. Por eso reorientó el Imperio hacia fuentes de energía limpias. {Las forjas de Rilit se reconstruyeron para funcionar con la nueva energía.}

Introdujo además un sistema parlamentario: por primera vez, el Emperador compartía el poder con un Parlamento. Rilur se democratizó un poco y la luz volvió a brillar en medio del caos y de las inestabilidades internas y externas, que nunca desaparecieron del todo. La industria del Imperio renació sobre bases nuevas.

Los Nighul también cambiaron. Sin el reactor ya no eran lo que habían sido, pero seguían siendo una élite prestigiosa y temida: guerreros y, al mismo tiempo, los mejores científicos, filósofos e ingenieros de la galaxia. {Con Reus dedicaron tanto esfuerzo a los laboratorios y las academias como a los campos de batalla.} Junto a los Nizarios, seguían siendo el orgullo de Rilur.

Comenzó una era de reconstrucción. {Durante casi veinte años, la galaxia conoció algo parecido a la paz.}`
      },
      {
        titulo: 'Una sombra en el Vacío',
        base: 'O A P',
        texto: `
{Kefra se retiró. Unos decían que había vuelto a los bosques de Arcados y otros que estaba en Riqtom, reconstruyendo una orden que tenía muy pocos miembros. El Guardián del Bosque dejó de ser un general para convertirse en una leyenda.}

Mientras tanto, al otro lado del Paso del Vacío, los Hijos de Andalus no habían olvidado. La invasión de Korvan les había enseñado el camino hacia la galaxia de sus antepasados, {y sus profetas lo interpretaron como una señal. Durante veinte años reunieron flotas y ejércitos.}

{En el año 52 DO, las estaciones de vigilancia de la frontera oriental dejaron de transmitir, una tras otra.} Una nueva sombra se cernía desde el vacío.`
      }
    ],
    ficha: {
      facciones: ['rilur', 'dubitsa', 'vinica', 'andalus'],
      personajes: ['korvan', 'reus', 'teosio-ii', 'kefra'],
      batallas: [],
      territorio: 'Las fronteras quedan congeladas por la {Tregua de Instantinopla}. Rilur reconoce a Dubitsa y Vinica.',
      muertes: '{Korvan (33 DO)}, por las heridas de Andalus.',
      lideres: 'Reus, Emperador de Rilur. Se crea el Parlamento de Rilur.',
      tecnologia: 'Energía limpia en lugar del reactor. Reconversión industrial. Los Nighul pasan a ser también científicos de academia.',
      consecuencias: 'Paz y reconstrucción, pero el ejército de Rilur queda reducido justo antes de la invasión de Andalus.'
    },
    lugares: ['rilur-prime', 'dubitsa-prime', 'rilit', 'riqtom', 'portus'],
    juegos: [
      'Juego de gestión o política: reformar Rilur con Reus entre el Parlamento, la élite militar y los Nighul.',
      'Misión de exploración: investigar el silencio de las estaciones de la frontera oriental (prólogo del Tomo VI).'
    ]
  },

  /* ============================================================ TOMO VI */
  {
    id: 'tomo-6',
    num: 'VI',
    titulo: 'La Última Gran Guerra Galáctica',
    periodo: 'c. 52 – 64 DO',
    anios: [52, 64],
    original: 'Los Hijos de Andalus invaden, liderados por el General Muwiya. Reus cae en un sacrificio para ganar tiempo. Su hijo Ublek toma el mando, repele a Andalus justo cuando una Expedición de Venganza liderada por el Príncipe Rahman llega. Dubitsa, Vinica y Rilur forman una Coalición Definitiva, derrotando a Rahman en una batalla apocalíptica. Ublek sobrevive, pero gravemente herido, y muere años después, dejando el trono vacío.',
    sinopsis: 'Muwiya invade, proclama el Gaziato en Portus y conquista Dubitsa Prime. Reus muere ganando tiempo. Ublek derrota a Vakel y a Muwiya. El Príncipe Rahman llega para vengarlo, y Dubitsa, Vinica, Rilur y Kefra lo derrotan en Turonis. Kefra desaparece y Ublek muere años después sin heredero.',
    capitulos: [
      {
        titulo: 'Los Hijos de Andalus',
        base: 'O A P',
        texto: `
Los Hijos de Andalus invadieron con un fervor teocrático-militar que la galaxia no había visto nunca. No venían a conquistar, decían, sino a recuperar territorios ancestrales.

Los lideraba el General Muwiya, un comandante carismático y brillante. {Su primer acto fue tomar Portus, la antigua capital de sus antepasados, y proclamar allí el Gaziato de Andalus, el dominio de los Hijos de Andalus en esta galaxia.} Desde Portus, sus ejércitos avanzaron hacia el oeste.

El primer gran golpe cayó sobre Dubitsa: Muwiya conquistó Dubitsa Prime. {Instantinopla cayó tras un asedio, y Teosio II tuvo que huir con lo que quedaba de su corte y de sus Pretoni.} El imperio que había renacido de sus cenizas perdía su corazón por segunda vez.`
      },
      {
        titulo: 'El sacrificio de Reus',
        base: 'O P',
        texto: `
{Rilur no estaba preparado. Veinte años de paz y de reformas habían reducido sus legiones, y los Hijos de Andalus avanzaban más rápido de lo que el Parlamento podía debatir.}

Reus tomó una decisión. {Reunió a la Guardia Imperial y a los Nighul que le eran leales y se plantó en Raqut, el mundo herido donde había estado el Reactor Oscuro y paso obligado hacia el núcleo del Imperio.} No buscaba ganar, sino ganar tiempo para que el Imperio reuniera sus fuerzas.

Lo consiguió. Reus cayó en un sacrificio que frenó a Andalus {durante semanas}. El emperador que había buscado la paz murió defendiendo lo que había construido.`
      },
      {
        titulo: 'Ublek',
        base: 'O A P',
        texto: `
Su hijo Ublek tomó el mando. {Se había formado en las academias reformadas por su padre y combinaba la disciplina de su abuelo Korvan con la visión de Reus.}

Lo primero que hizo fue proteger lo que Andalus quería destruir. Vakel, {uno de los generales de Muwiya,} se lanzó contra {las forjas de Rilit} para paralizar la industria del Imperio. Ublek lo estaba esperando, derrotó a Vakel {y aniquiló su ejército}.

Después pasó a la ofensiva y repelió a Andalus. {En la Segunda Batalla de Orion-34, en el mismo sistema donde Saelen Vharr había vencido a Lord Veylan medio siglo antes, las fuerzas de Ublek derrotaron al ejército principal de Muwiya.} Muwiya murió, {y para los Hijos de Andalus fue Ublek en persona quien lo mató}.

{Parecía que la guerra había terminado. En realidad, no había hecho más que empezar.}`
      },
      {
        titulo: 'La Expedición de Venganza',
        base: 'O A P',
        texto: `
La muerte de Muwiya llegó al otro lado del Vacío como una afrenta que había que lavar con sangre. Justo cuando Ublek terminaba de repeler la invasión, llegó la Expedición de Venganza.

La lideraba el Príncipe Rahman, {llamado «el Intrépido»,} uno de los numerosos hijos del Emperador de Andalus. {Su ejército era mayor y más fanático que el de Muwiya. Rahman reforzó Dubitsa Prime y Portus, que seguían en manos de Andalus, y lanzó su ofensiva hacia el corazón de la galaxia.}

{Esta vez, ninguna potencia podía enfrentarse a él sola.}`
      },
      {
        titulo: 'La Coalición Definitiva',
        base: 'O A P',
        texto: `
Por primera vez en la historia, Dubitsa, Vinica y Rilur lucharon en el mismo bando. Lo llamaron la Coalición Definitiva.

{El pacto se selló en Vinica Prime.} Teosio II aportó sus Pretoni {y el deseo de recuperar su capital}. {Vinica puso su flota y la producción de Polus-12.} Ublek llevó lo que quedaba de las legiones de Rilur, los Nizarios y los Nighul. Y en el momento más oscuro reapareció alguien a quien muchos daban por muerto: Kefra, el Guardián del Bosque, {con los pocos caballeros de la Sintonía que había reunido}.

El primer objetivo de la Coalición fue Dubitsa Prime. {Tras una campaña de varios meses,} la liberó y devolvió Instantinopla a Teosio II. {Dubitsa recuperó su corazón por segunda vez. Rahman no retrocedió: reunió todas sus fuerzas para jugárselo todo en una sola batalla.}`
      },
      {
        titulo: 'Turonis',
        base: 'O A P',
        texto: `
Los dos ejércitos chocaron en {Turonis, un mundo estratégico donde se cruzaban las rutas que iban de Portus al núcleo y al sur. Quien lo controlara decidiría hacia dónde se movía la guerra.} Era el lugar donde el avance de Andalus tenía que encontrarse con la Coalición.

Fue una batalla apocalíptica. {Las crónicas hablan de flotas tan numerosas que tapaban las estrellas y de una superficie que ardió durante días. Las legiones de Ublek sostuvieron el centro, los Pretoni de Teosio II atacaron por los flancos y la flota vinicana cortó los refuerzos de Andalus.} Kefra y sus caballeros combatieron donde la batalla era más dura.

La Coalición Definitiva derrotó a Rahman. {El Príncipe cayó en la batalla,} y con él se derrumbó la Expedición de Venganza.

Después nadie volvió a ver a Kefra. No se encontró su cuerpo ni nadie lo vio morir: simplemente desapareció. Hoy la galaxia sigue sin saber si el Guardián del Bosque está vivo.

Ublek sobrevivió, pero gravemente herido.`
      },
      {
        titulo: 'El trono vacío',
        base: 'O A P',
        texto: `
Tras la derrota, el poder de Andalus en esta galaxia se desintegró. {Portus quedó abandonada.} Lo que quedaba del Gaziato se dividió en flotas piratas y señores de la guerra que todavía hoy asaltan las rutas comerciales. Su ideología y su rencor siguen vivos. Entre los numerosos hijos del Emperador de Andalus hubo otros, como el Príncipe Alid, que llevaron campañas de venganza a esta galaxia; {su historia está por escribir}.

{Asustados por lo cerca que habían estado del desastre, los principados del este dejaron atrás sus rivalidades y se unieron bajo una sola bandera: la Unión del Este.}

{Teosio II murió hacia el año 62 DO, y le sucedió su hijo, Teosio III.}

Ublek gobernó algunos años más, pero nunca se recuperó de sus heridas. Murió {en el año 64 DO} sin un heredero reconocido y dejó el trono vacío.`
      }
    ],
    ficha: {
      facciones: ['andalus', 'rilur', 'dubitsa', 'vinica', 'sintonia', 'principados'],
      personajes: ['muwiya', 'reus', 'ublek', 'vakel', 'rahman', 'teosio-ii', 'kefra', 'alid', 'emperador-andalus'],
      batallas: ['caida-dubitsa-prime', 'guardia-raqut', 'rilit-vakel', 'orion-34-ii', 'liberacion-instantinopla', 'turonis'],
      territorio: 'Andalus llega a dominar Portus y Dubitsa Prime y lo pierde todo. Dubitsa recupera su capital. {Nace la Unión del Este.}',
      muertes: 'Reus (sacrificio). Muwiya. {Rahman (en Turonis).} {Teosio II (c. 62 DO).} Ublek, años después ({64 DO}). Kefra desaparece.',
      lideres: 'Ublek, Emperador de Rilur. {Teosio III, Emperador de Dubitsa.}',
      tecnologia: '{Las forjas de energía limpia de Rilit resultan decisivas.}',
      consecuencias: 'Andalus se reduce a piratas. El trono de Rilur queda vacío y empieza el interregno.'
    },
    lugares: ['portus', 'dubitsa-prime', 'raqut', 'rilit', 'lolop', 'vinica-prime', 'turonis', 'paso-vacio'],
    juegos: [
      'RTS de la Última Gran Guerra con cuatro bandos jugables y la Batalla de Turonis como gran final.',
      'Misión de defensa desesperada: aguantar en Raqut con Reus el tiempo necesario.',
      'Misterio que se puede mantener abierto: ¿qué le pasó a Kefra en Turonis?'
    ]
  },

  /* ============================================================ TOMO VII */
  {
    id: 'tomo-7',
    num: 'VII',
    titulo: 'El Heredero Bastardo',
    periodo: 'c. 64 – 68 DO',
    anios: [64, 68],
    original: 'Arlik, hijo no reconocido del Emperador Ublek, regresa del exilio bajo la guía de su mentor Nighul, Trok, decidido a reclamar el trono de Rilur. Con el apoyo de una legión secreta, se proclama heredero en la capital, logrando un respaldo débil del Parlamento y despertando la hostilidad de la élite militar. Para consolidar su legitimidad, lidera personalmente la campaña contra la rebelión en Uxal. Pese a la inferioridad numérica, su liderazgo y la ferocidad de sus Nighul y Nizarios le otorgan una victoria decisiva. Así comienza su transformación de exiliado a Emperador guerrero, abriendo una nueva guerra por el dominio total del Imperio.',
    sinopsis: 'Tras la muerte de Ublek, Moffs y almirantes se disputan el trono. Arlik, hijo bastardo de Ublek formado por el Nighul Trok, vuelve del exilio con una legión secreta, se proclama heredero y vence en Uxal. Empieza su guerra por el dominio total del Imperio.',
    capitulos: [
      {
        titulo: 'El interregno',
        base: 'O P',
        texto: `
La muerte de Ublek dejó a Rilur sin emperador y sin sucesor, y el Imperio se hundió en luchas internas. Moffs y almirantes se disputaron el trono vacío, {cada uno con sus propias flotas y legiones}. Las regiones lejanas fueron declarando su autonomía una tras otra. {El Parlamento que había creado Reus emitía decretos que nadie cumplía.}

El poder militar del Imperio seguía siendo enorme, pero estaba desorganizado y con la moral baja. {En el mundo de Uxal, la rebelión se convirtió en una guerra abierta.} Desde Instantinopla, Teosio III observaba el caos de Rilur con ambición calculadora.`
      },
      {
        titulo: 'El hijo no reconocido',
        base: 'O P',
        texto: `
Ublek había tenido un hijo al que nunca reconoció. Se llamaba Arlik.

{Su madre era una ingeniera Nighul, y el niño creció lejos de la corte, donde su existencia habría sido un escándalo y un peligro. Cuando Ublek murió y los Moffs empezaron a eliminar a cualquiera con derechos al trono, Arlik vivía en el exilio.} Allí lo protegía y lo formaba su mentor Nighul, Trok.

{Trok era un Nighul de la época del reactor, uno de los pocos que habían sobrevivido a su destrucción sin perder la razón. Enseñó a Arlik la tradición completa de los Nighul: el combate, pero también la ciencia, la filosofía y la ingeniería. Con él, Arlik aprendió a ser un guerrero y aprendió también por qué Rilur había caído tantas veces.}`
      },
      {
        titulo: 'La legión secreta',
        base: 'O P',
        texto: `
Arlik volvió del exilio guiado por Trok y decidido a reclamar el trono de Rilur. No volvió solo: lo respaldaba una legión secreta {de Nighul, Nizarios y veteranos de Turonis que nunca habían aceptado a los Moffs}.

Se proclamó heredero en la capital. El Parlamento le dio un apoyo débil, {porque prefería un emperador con la sangre de Ublek a un Moff con flota propia}. La élite militar reaccionó con hostilidad: {para los almirantes y los Moffs que llevaban años disputándose el trono, aquel bastardo era un usurpador.}

{Arlik sabía que la sangre no le bastaría. Necesitaba demostrar que podía gobernar.}`
      },
      {
        titulo: 'Uxal',
        base: 'O P',
        texto: `
Para consolidar su legitimidad, Arlik dirigió en persona la campaña contra la rebelión de Uxal, {el foco de inestabilidad más grave del Imperio}.

Llegó con muchas menos tropas que el enemigo. {Los rebeldes de Uxal contaban con el apoyo de varios Moffs que esperaban ver morir al pretendiente.} Pese a la inferioridad numérica, su liderazgo y la ferocidad de sus Nighul y Nizarios le dieron una victoria decisiva.

{La noticia de Uxal llegó a Rilur Prime antes que el propio Arlik y le dio lo que la sangre no había podido darle: autoridad.}`
      },
      {
        titulo: 'El Emperador guerrero',
        base: 'O',
        texto: `
Así empezó la transformación de Arlik de exiliado en Emperador guerrero. Bajo su mando, el Imperio entró en una nueva fase de reconstrucción forzada. Arlik está purgando a los comandantes desleales y concentrando las legiones bajo su mando directo. Su victoria en Uxal ha demostrado que puede imponer el orden por la fuerza, aunque la estabilidad sigue siendo frágil y las conspiraciones no han cesado.

La campaña de Uxal abrió una nueva guerra por el dominio total del Imperio. {Los Moffs que todavía controlan flotas no se rendirán sin luchar.} Fuera de Rilur, la galaxia observa.

Dubitsa, ascendente bajo Teosio III, espera su momento. Vinica, desmilitarizada, confía en el comercio. Los Principados del Este son fuertes, pero imprevisibles. Los restos de Andalus acechan en las rutas. Y quizá, en algún lugar, el Guardián del Bosque sigue vivo.

Aquí termina el último Tomo del Holocrón y empieza el presente: un frágil equilibrio de poder.`
      }
    ],
    ficha: {
      facciones: ['rilur', 'dubitsa'],
      personajes: ['arlik', 'trok', 'ublek', 'teosio-iii'],
      batallas: ['uxal'],
      territorio: 'Rilur está fragmentado entre Moffs, almirantes y regiones autónomas. Arlik recupera Uxal y el núcleo.',
      muertes: '{Moffs y comandantes eliminados en las purgas de Arlik.}',
      lideres: 'Arlik, Emperador de Rilur.',
      tecnologia: 'Siguen existiendo los Nighul, ya sin reactor: guerreros, científicos e ingenieros.',
      consecuencias: 'Empieza la guerra de Arlik por el dominio total del Imperio. Este es el presente del Holocrón.'
    },
    lugares: ['rilur-prime', 'uxal', 'dubitsa-prime'],
    juegos: [
      'Juego principal del presente: Arlik contra los Moffs, en un RPG táctico o un RTS de guerra civil imperial.',
      'Sistema de legitimidad: apoyo del Parlamento, del ejército y de los Nighul como recursos que hay que equilibrar.'
    ]
  }
];

LORE.epilogo = {
  titulo: 'El frágil equilibrio',
  texto: 'Tras la muerte del Emperador Ublek y el fin de la Expedición de Venganza de Andalus, la galaxia se encuentra en un frágil equilibrio de poder. Viejas tensiones resurgen y nuevas potencias maniobran en el vacío dejado por la guerra.',
  presente: '68 DO'
};
