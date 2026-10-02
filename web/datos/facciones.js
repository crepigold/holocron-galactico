/*
  HOLOCRÓN GALÁCTICO — Códice de Facciones
  src: 'O' Original web · 'A' Autor 2026 · 'P' Propuesta. {llaves} = detalle propuesto.
*/
window.LORE = window.LORE || {};

LORE.facciones = [
  /* ============================================================ RILUR */
  {
    id: 'rilur',
    nombre: 'Imperio de Rilur',
    color: '#ef4444',
    estado: 'En Reconstrucción',
    poder: 25,
    lema: '{«Orden y poder»}',
    capital: 'Rilur Prime',
    gobierno: 'Imperio hereditario. Desde Reus comparte el poder con un Parlamento. {Los Moffs gobiernan las regiones con flotas propias.}',
    resumenActual: 'Bajo el nuevo Emperador Arlik, el Imperio ha entrado en una nueva fase de reconstrucción forzada. Arlik está purgando a los comandantes desleales y consolidando las legiones bajo su mando directo. Aunque la estabilidad es frágil y las conspiraciones persisten, su victoria en Uxal ha demostrado su capacidad para imponer el orden por la fuerza.',
    codice: 'Fundado sobre los principios de orden y poder, el Imperio de Rilur ha sido la fuerza dominante durante siglos. Su poderío militar se basaba en la producción masiva de clones y droides. Tras una serie de guerras devastadoras y crisis de liderazgo, el imperio es una sombra de lo que fue, con su estructura central colapsada y sus territorios exteriores en rebelión abierta. Su legado es de tiranía, pero también de una paz impuesta que muchos ahora echan de menos.',
    historia: [
      { titulo: 'Siglos de dominio', texto: 'Rilur fue la fuerza dominante de la galaxia durante siglos, construida sobre el orden y el poder. {Su dinastía llevaba generaciones en el trono cuando lo heredó Sarkon, el emperador con el que empieza la saga.}' },
      { titulo: 'La era del Reactor Oscuro', texto: 'Rilur logró crear el Reactor Oscuro {en Raqut}. Le daba energía y recursos casi ilimitados a un coste casi nulo, lo que le permitió mantener ejércitos masivos de clones y droides prácticamente gratis y extenderse por toda la galaxia. Su energía alterada desafinaba la Sintonía del universo y potenciaba a los Nighul.' },
      { titulo: 'Las Galaxias Fragmentadas', texto: 'Avance imparable. A pesar de la derrota de Lord Veylan en Orion-34, Rilur conquista el este entero, absorbe Dubitsa e impone a Vinica un tratado humillante. Empieza la paz impuesta.' },
      { titulo: 'La primera crisis', texto: 'Los rebeldes destruyen la mega-instalación de Rilit. El Emperador desata a los Nighul y muere en un duelo contra Kemet. {Korvan, Gran Mariscal, ocupa el trono.} Cinco años después, Kefra destruye el Reactor Oscuro.' },
      { titulo: 'El desastre de Andalus', texto: 'Sin reactor, el Emperador invade la galaxia de Andalus. Es una masacre: casi nadie vuelve, Rilur pierde gran parte de su ejército y despierta a un enemigo temible. A la contraofensiva brutal le sigue una guerra civil galáctica total.' },
      { titulo: 'Las reformas de Reus', texto: 'Reus firma la paz, sustituye el reactor por energía limpia y crea un Parlamento. Rilur se democratiza un poco y reaviva la luz entre inestabilidades internas y externas. La industria renace y los Nighul siguen siendo una élite prestigiosa.' },
      { titulo: 'La Última Gran Guerra', texto: 'Reus muere ganando tiempo frente a Andalus. Ublek repele la invasión, derrota a Vakel y a Muwiya, y lidera a Rilur dentro de la Coalición Definitiva contra Rahman. Sobrevive gravemente herido y muere años después sin heredero.' },
      { titulo: 'Interregno y Arlik', texto: 'Moffs y almirantes compiten por el trono mientras las regiones lejanas declaran su autonomía. Arlik, hijo bastardo de Ublek, vuelve con una legión secreta, vence en Uxal y empieza una guerra por el dominio total del Imperio.' }
    ],
    gobernantes: [
      { nombre: '{Sarkon}', titulo: 'el Primer Emperador', periodo: '… – 18 DO', nota: 'Era del Reactor Oscuro. Muere en duelo con Kemet.' },
      { nombre: '{Korvan}', titulo: '{el Implacable}', periodo: '18 – 33 DO', nota: 'Sucesor distinto. Invade Andalus y muere por sus heridas.' },
      { nombre: 'Reus', titulo: '{el Reformador}', periodo: '33 – {55} DO', nota: 'Hijo de Korvan. Paz, energía limpia y Parlamento. Muere en sacrificio.' },
      { nombre: 'Ublek', titulo: '{el Defensor}', periodo: '{55 – 64} DO', nota: 'Hijo de Reus. Vence a Andalus y muere años después por sus heridas.' },
      { nombre: 'Interregno', titulo: 'Moffs y almirantes', periodo: '{64 – 67} DO', nota: 'Trono vacío. Imperio fragmentado.' },
      { nombre: 'Arlik', titulo: 'el Heredero Bastardo', periodo: '{67} DO – presente', nota: 'Hijo no reconocido de Ublek. Emperador guerrero.' }
    ],
    ejercito: [
      { nombre: 'Clones', texto: 'Producción masiva. En la era del reactor costaban casi nada. Los mejores clones podían ser seleccionados para convertirse en Nighul.' },
      { nombre: 'Droides', texto: 'Ejércitos de droides en cantidades enormes. Con el reactor se reponían en semanas; sin él, cada pérdida pesa.' },
      { nombre: 'Legiones', texto: 'Unidad básica del ejército imperial. Arlik las está concentrando bajo su mando directo.' },
      { nombre: 'Nizarios', texto: 'La élite del ejército de Rilur. Junto a los Nighul son el orgullo del Imperio.' },
      { nombre: 'Nighul', texto: 'La élite de la élite: cada uno equivale a cien Nizarios. Son guerreros y clones de selección genética, con un entrenamiento intenso e inhumano y años de veteranía. El Reactor Oscuro los unía mental y energéticamente y potenciaba sus poderes arcanos. Sin él no son lo que eran, pero siguen siendo temidos. También son los mejores científicos, filósofos e ingenieros de la galaxia.' },
      { nombre: 'Flotas y almirantes', texto: 'Armadas imperiales. En el interregno, cada almirante actuaba como un señor independiente.' }
    ],
    cultura: 'Orden, jerarquía y prestigio militar. Rilur admira a sus Nighul y Nizarios como guerreros y como sabios. {Existe una nostalgia extendida por la paz impuesta, cuando la energía del reactor era barata y la galaxia estaba en orden.} Desde Reus convive una tradición parlamentaria joven y frágil.',
    relaciones: [
      { con: 'dubitsa', tipo: 'Rival', texto: 'La conquistó en el Tomo I y luchó a su lado en la Coalición Definitiva. Hoy Dubitsa observa su caos con ambición.' },
      { con: 'vinica', tipo: 'Tensa', texto: 'Enemiga histórica, sometida con la Paz de Hierro. Aliada en la Coalición.' },
      { con: 'andalus', tipo: 'Enemigo', texto: 'Enemigo mortal desde la invasión del Tomo IV. Mató a Muwiya y derrotó a Rahman.' },
      { con: 'principados', tipo: 'Desconfianza', texto: 'Los conquistó en el Tomo I y hoy los teme unidos.' },
      { con: 'sintonia', tipo: 'Enemigo histórico', texto: 'Los Caballeros mataron al Primer Emperador y destruyeron el reactor, pero lucharon junto a Ublek en Turonis.' }
    ],
    jugabilidad: 'Hordas y élites. Producción masiva de clones y droides (casi gratis en la era del reactor y cara después), Nizarios como infantería de élite y Nighul como unidades heroicas que valen por cien. Mecánica de legitimidad (Parlamento, ejército, Moffs) en la era de Arlik.',
    ganchos: [
      'La guerra de Arlik contra los Moffs rebeldes.',
      'Una campaña en la era del reactor, con la economía «infinita» como mecánica.',
      '¿Quedan secretos del Reactor Oscuro en las ruinas de Raqut?'
    ]
  },

  /* ============================================================ DUBITSA */
  {
    id: 'dubitsa',
    nombre: 'Imperio de Dubitsa',
    color: '#f59e0b',
    estado: 'Ascendente',
    poder: 35,
    lema: '{«El saber es la primera muralla»}',
    capital: 'Dubitsa Prime (ciudad de Instantinopla)',
    gobierno: 'Imperio de la dinastía de los Teosio. Sociedad muy organizada. {Las universidades tienen voz en el consejo imperial.}',
    resumenActual: 'Bajo el Emperador Teosio III, Dubitsa florece. Sus guerreros de élite Pretoni son numerosos y leales, su industria es poderosa y sus universidades salvaguardan el conocimiento. Observa el caos de Rilur con ambición calculadora.',
    codice: 'Una civilización ancestral centrada en la ciencia, la filosofía y el combate disciplinado. Aniquilados y absorbidos por Rilur, resurgieron de las cenizas durante la guerra civil. Liderados por el Emperador Teosio III, su sociedad está altamente organizada. Sus guerreros Pretoni son una fuerza de élite temida en toda la galaxia. Dubitsa valora el conocimiento y la estrategia por encima de la fuerza bruta, y se posiciona para llenar el vacío de poder dejado por Rilur.',
    historia: [
      { titulo: 'La civilización ancestral', texto: 'Ciencia, filosofía y combate disciplinado. Sus universidades, {con centro en Instantinopla,} son las guardianas del saber de la galaxia.' },
      { titulo: 'La coalición de Lolop', texto: 'Se une a Vinica y a los Caballeros de la Sintonía contra el expansionismo de Rilur en la Batalla de Orion-34.' },
      { titulo: 'La aniquilación', texto: 'Tras Lolop, el este cae y Rilur aniquila y absorbe Dubitsa. {Su dinastía es derrocada y los Pretoni pasan a la clandestinidad.}' },
      { titulo: 'El renacer', texto: 'Durante la guerra civil, Dubitsa resurge de sus cenizas. Teosio II restaura el imperio {y reabre las universidades}.' },
      { titulo: 'La tregua', texto: 'Reus firma la paz con Dubitsa y reconoce sus fronteras {(Tregua de Instantinopla)}.' },
      { titulo: 'Caída y liberación', texto: 'Muwiya conquista Dubitsa Prime en la Última Gran Guerra. La Coalición Definitiva la libera y Dubitsa combate en primera línea contra Rahman.' },
      { titulo: 'El ascenso', texto: 'Con Teosio III, Dubitsa es la potencia más fuerte de la galaxia y se prepara para ocupar el vacío que deja Rilur.' }
    ],
    gobernantes: [
      { nombre: '{La antigua dinastía}', titulo: '', periodo: '… – 1 DO', nota: 'Derrocada al caer el este.' },
      { nombre: 'Ocupación de Rilur', titulo: '', periodo: '1 – {c. 30} DO', nota: 'Dubitsa absorbida por el Imperio.' },
      { nombre: 'Teosio II', titulo: 'el Restaurador', periodo: '{c. 30 – 62} DO', nota: 'Restaura Dubitsa y lucha en la Coalición Definitiva.' },
      { nombre: 'Teosio III', titulo: '', periodo: '{62} DO – presente', nota: 'Hijo de Teosio II. Dubitsa en ascenso.' }
    ],
    ejercito: [
      { nombre: 'Pretoni', texto: 'Guerreros de élite temidos en toda la galaxia, numerosos y leales. {Son soldados formados en las academias, tan entrenados en estrategia como en combate.}' },
      { nombre: '{Flota de Instantinopla}', texto: '{Armada moderna, apoyada por una industria poderosa.}' },
      { nombre: '{Ingenieros de las universidades}', texto: '{La ciencia dubitsana aplicada a la guerra: tecnología superior en lugar de números.}' }
    ],
    cultura: 'Valoran el conocimiento y la estrategia por encima de la fuerza bruta. Su sociedad está muy organizada. {Su memoria colectiva está marcada por haber sido aniquilados dos veces y haber renacido otras dos.}',
    relaciones: [
      { con: 'rilur', tipo: 'Rival', texto: 'Antiguo conquistador. Hoy Dubitsa aspira a sustituirlo.' },
      { con: 'vinica', tipo: 'Aliada', texto: 'Compañera de coalición en Lolop y en Turonis.' },
      { con: 'andalus', tipo: 'Enemigo', texto: 'Muwiya conquistó su capital.' },
      { con: 'principados', tipo: 'Vecinos', texto: '{Vecinos del este. Dubitsa quiere influir sobre la Unión.}' },
      { con: 'sintonia', tipo: 'Respeto', texto: 'Aliados en Lolop.' }
    ],
    jugabilidad: 'Tecnología y estrategia. Unidades caras pero superiores, investigación rápida gracias a las universidades y Pretoni como élite disciplinada. Funciona mejor a largo plazo.',
    ganchos: [
      'El juego de Teosio III para ocupar el vacío de Rilur.',
      'La resistencia clandestina de los Pretoni durante la ocupación.',
      'El asedio y la liberación de Instantinopla.'
    ]
  },

  /* ============================================================ VINICA */
  {
    id: 'vinica',
    nombre: 'República de Vinica',
    color: '#3b82f6',
    estado: 'Reconstructiva',
    poder: 20,
    lema: '{«Libertad, comercio y palabra»}',
    capital: 'Vinica Prime',
    gobierno: 'Democracia interestelar gobernada por un Senado. {Un Canciller elegido por el Senado dirige el ejecutivo.}',
    resumenActual: 'Optando por la paz y la prosperidad, Vinica se ha desmilitarizado en gran medida para centrarse en la reconstrucción y el comercio. Su Senado cree que la fortaleza económica es la mejor defensa, una postura vista como ingenua por otros.',
    codice: 'Una democracia interestelar que valora la libertad, el comercio y la diplomacia. Fue casi destruida por Rilur, sobreviviendo gracias a alianzas desesperadas y tratados humillantes. En la era actual, ha apostado fuertemente por la desmilitarización y la reconstrucción económica. Mientras sus rutas comerciales florecen, su capacidad para defenderse es cuestionada por sus vecinos más militaristas.',
    historia: [
      { titulo: 'La república comercial', texto: 'Libertad, comercio y diplomacia. {Sus rutas conectaban el oeste galáctico con el núcleo.}' },
      { titulo: 'La alianza desesperada', texto: 'Ante el avance de Rilur, forja una alianza con los Caballeros de la Sintonía y con Dubitsa.' },
      { titulo: 'El tratado humillante', texto: 'Tras la caída del este, firma un tratado humillante para sobrevivir {(la Paz de Hierro): cede territorio, limita su flota y paga tributo.}' },
      { titulo: 'La liberación', texto: 'Kefra destruye el Reactor Oscuro y su campaña libera Vinica Prime y Polus-12.' },
      { titulo: 'Fortalecida en el caos', texto: 'Se refuerza durante la guerra civil y firma la tregua con Reus.' },
      { titulo: 'La Coalición Definitiva', texto: 'Lucha junto a Dubitsa y Rilur contra Rahman. {El pacto de la Coalición se firma en Vinica Prime.}' },
      { titulo: 'La apuesta por la paz', texto: 'Se desmilitariza para centrarse en la reconstrucción y el comercio. Sus rutas florecen y su defensa está en duda.' }
    ],
    gobernantes: [
      { nombre: 'Senado de Vinica', titulo: '', periodo: 'Toda la historia', nota: '{Los nombres de los cancilleres están pendientes.}' }
    ],
    ejercito: [
      { nombre: '{Flota republicana}', texto: '{Fue clave en Lolop y en Turonis. Hoy está muy reducida.}' },
      { nombre: '{Fábricas de Polus-12}', texto: '{El gran mundo industrial de la República abasteció a la rebelión y a la Coalición.}' }
    ],
    cultura: 'Libertad, comercio y diplomacia. Su Senado cree que la fortaleza económica es la mejor defensa. {Conserva una memoria amarga de la Paz de Hierro y una gratitud profunda hacia Kefra.}',
    relaciones: [
      { con: 'rilur', tipo: 'Tensa', texto: 'Casi la destruyó, pero fue su aliada contra Andalus.' },
      { con: 'dubitsa', tipo: 'Aliada', texto: 'Compañera de coalición. Hoy la mira con cautela.' },
      { con: 'sintonia', tipo: 'Aliada histórica', texto: 'Fue la primera potencia en aliarse con los Caballeros.' },
      { con: 'andalus', tipo: 'Amenaza', texto: 'Sus piratas acechan las rutas comerciales de Vinica.' },
      { con: 'principados', tipo: 'Comercio', texto: '{Socios comerciales.}' }
    ],
    jugabilidad: 'Economía y diplomacia. Comercio muy fuerte y alianzas. Su ejército es pequeño, pero puede comprar defensa (mercenarios, flota de reserva). Vulnerable si la sorprenden.',
    ganchos: [
      'Proteger las rutas comerciales de los piratas de Andalus.',
      'El debate en el Senado sobre volver a rearmarse.',
      'La liberación de Vinica Prime contada desde dentro.'
    ]
  },

  /* ============================================================ PRINCIPADOS */
  {
    id: 'principados',
    nombre: 'Principados del Este',
    color: '#10b981',
    estado: 'Unificados',
    poder: 15,
    lema: '{«Muchos estandartes, una sola bandera»}',
    capital: 'Unión del Este',
    gobierno: 'Confederación de sistemas antes independientes, sin un mando centralizado. {Hay un Consejo de Príncipes con sede en la Unión del Este.}',
    resumenActual: 'Antiguos rivales, estos principados se han unido bajo una sola bandera para asegurar su supervivencia. Su poder militar combinado es considerable, pero carecen de una doctrina y un liderazgo centralizados, lo que los hace impredecibles.',
    codice: 'Una confederación de sistemas estelares anteriormente independientes y a menudo enfrentados entre sí. La amenaza constante de los grandes imperios los forzó a una unificación pragmática. Su fuerza reside en su diversidad y adaptabilidad, pero su debilidad es la falta de un mando centralizado. Son un poder emergente e impredecible en la escena galáctica.',
    historia: [
      { titulo: 'Siglos de rivalidad', texto: 'Sistemas independientes que a menudo luchaban entre sí.' },
      { titulo: 'La caída del este', texto: 'En el Tomo I, el este galáctico cae ante Rilur {y los principados son conquistados uno por uno}.' },
      { titulo: '{La libertad recuperada}', texto: '{Recuperan la independencia en la guerra civil del Tomo IV, pero vuelven a sus viejas rivalidades.}' },
      { titulo: 'La unificación', texto: 'La amenaza constante de los grandes imperios los obliga a una unificación pragmática {después de la Última Gran Guerra}.' }
    ],
    gobernantes: [
      { nombre: '{Consejo de Príncipes}', titulo: '', periodo: '{c. 59} DO – presente', nota: '{Los nombres de los príncipes están pendientes.}' }
    ],
    ejercito: [
      { nombre: '{Ejércitos de los principados}', texto: '{Cada principado mantiene sus propias tropas y doctrinas. Juntas suman una fuerza considerable, pero no siempre coordinada.}' }
    ],
    cultura: 'Diversidad y adaptabilidad. {Mantienen identidades locales muy fuertes y desconfían de cualquier poder central, incluido el suyo propio.}',
    relaciones: [
      { con: 'rilur', tipo: 'Miedo', texto: 'Su antiguo conquistador.' },
      { con: 'dubitsa', tipo: 'Vecinos', texto: '{La potencia vecina más peligrosa.}' },
      { con: 'andalus', tipo: 'Enemigo', texto: '{Sus rutas sufren a los piratas.}' },
      { con: 'vinica', tipo: 'Comercio', texto: '{Socios comerciales.}' }
    ],
    jugabilidad: 'Facción modular: cada principado aporta unidades distintas. Mucha adaptabilidad, pero la coordinación y la moral son variables por la falta de un mando central. Imprevisible tanto en manos de la IA como del jugador.',
    ganchos: [
      '¿Quién intentará convertirse en el primer gran príncipe de la Unión?',
      'Los principados como bisagra entre Dubitsa y Rilur.'
    ]
  },

  /* ============================================================ ANDALUS */
  {
    id: 'andalus',
    nombre: 'Gaziato de Andalus',
    color: '#8b5cf6',
    estado: 'Dispersos',
    poder: 5,
    lema: '{«Volveremos a la tierra de nuestros padres»}',
    capital: 'Portus (antigua capital en esta galaxia) · galaxia de Andalus (su origen)',
    gobierno: 'Poder teocrático-militar. Lo gobierna el Emperador de Andalus, que tiene numerosos hijos. {Su título es el de Gran Gazi.} {Muwiya proclamó el Gaziato en Portus como el dominio de Andalus en esta galaxia.}',
    resumenActual: 'Tras la derrota de la Expedición de Venganza, el poder de Andalus en esta galaxia se ha reducido a flotas piratas y enclaves aislados. Ya no son una amenaza unificada, pero siguen siendo una molestia peligrosa en las rutas comerciales.',
    codice: 'Originarios de otra galaxia, los Hijos de Andalus invadieron con un fervor teocrático-militar para "recuperar" territorios ancestrales. Liderados por figuras carismáticas como Muwiya y Rahman, su poder militar era formidable. Tras la catastrófica derrota de su Expedición de Venganza, su imperio en esta galaxia se ha desintegrado en facciones piratas y señores de la guerra, aunque su ideología y su rencor perduran.',
    historia: [
      { titulo: '{Los antepasados}', texto: '{Hace muchos siglos, los antepasados de Andalus vivieron en esta galaxia, con Portus como capital. Se marcharon por el Paso del Vacío, y sus libros sagrados prometen el regreso.} De ahí su reivindicación de los «territorios ancestrales».' },
      { titulo: 'La invasión de Rilur', texto: 'Rilur invade la galaxia de Andalus en el Tomo IV. Es una masacre para el Imperio: casi nadie vuelve. Andalus descubre el camino y gana un rencor nuevo.' },
      { titulo: 'La invasión de Muwiya', texto: 'Los Hijos de Andalus invaden liderados por el General Muwiya. {Proclama el Gaziato en Portus.} Conquista Dubitsa Prime y empuja a Reus al sacrificio.' },
      { titulo: 'La muerte de Muwiya', texto: 'Ublek derrota a Vakel y a Muwiya, que muere. Su muerte es la causa de la Expedición de Venganza.' },
      { titulo: 'La Expedición de Venganza', texto: 'El Príncipe Rahman, hijo del Emperador de Andalus, llega para vengar a Muwiya. Es derrotado por la Coalición Definitiva {en Turonis}.' },
      { titulo: 'La dispersión', texto: 'El imperio de Andalus en esta galaxia se desintegra en facciones piratas y señores de la guerra. Su ideología y su rencor perduran.' }
    ],
    gobernantes: [
      { nombre: 'Emperador de Andalus', titulo: '{Gran Gazi}', periodo: 'En su galaxia', nota: '{Su nombre está pendiente.} Tiene numerosos hijos, entre ellos Rahman y Alid.' },
      { nombre: 'Muwiya', titulo: 'General', periodo: '{52 – 56} DO', nota: 'Lidera la invasión. {Proclama el Gaziato en Portus.}' },
      { nombre: 'Rahman', titulo: 'Príncipe', periodo: '{56 – 58} DO', nota: 'Lidera la Expedición de Venganza.' }
    ],
    ejercito: [
      { nombre: 'Hijos de Andalus', texto: 'Ejércitos movidos por un fervor teocrático-militar. Su poder militar era formidable.' },
      { nombre: '{Flotas del Vacío}', texto: '{Armadas que cruzan el Paso del Vacío. Son rápidas y difíciles de contener.}' },
      { nombre: 'Señores de la guerra y piratas', texto: 'Los restos actuales: flotas piratas y enclaves aislados que atacan las rutas comerciales.' }
    ],
    cultura: 'Teocrática y militar, con una ideología de retorno a los territorios ancestrales. {El honor y la venganza son deberes sagrados.} Su rencor perdura incluso tras la derrota.',
    relaciones: [
      { con: 'rilur', tipo: 'Enemigo mortal', texto: 'Invadió su galaxia y mató a Muwiya.' },
      { con: 'dubitsa', tipo: 'Enemigo', texto: 'Conquistó su capital y la perdió.' },
      { con: 'vinica', tipo: 'Presa', texto: 'Sus piratas atacan las rutas vinicanas.' },
      { con: 'principados', tipo: 'Presa', texto: '{Atacan sus rutas.}' }
    ],
    jugabilidad: 'Fervor y movilidad. Ataques rápidos, moral alta y refuerzos que llegan del Vacío. En el presente funcionan como facción de saqueo (piratas y señores de la guerra).',
    ganchos: [
      'Los señores de la guerra piratas que siguen en las rutas.',
      'La campaña de venganza del Príncipe Alid (en segundo plano).',
      '¿Volverá el Emperador de Andalus con un tercer ejército?'
    ]
  },

  /* ============================================================ SINTONÍA */
  {
    id: 'sintonia',
    nombre: 'Caballeros de la Sintonía',
    color: '#9ca3af',
    estado: 'Casi extintos',
    poder: null,
    alias: 'También llamados Caballeros Ocultos (en notas antiguas, «Oscultos»)',
    lema: '{«Afinar, no dominar»}',
    capital: 'Riqtom, Santuario de la Sintonía',
    gobierno: 'Orden monástica de maestros y discípulos. No busca el poder político.',
    resumenActual: 'Casi extintos. {Su último gran maestro conocido, Kefra, desapareció en Turonis.} Riqtom sigue siendo su santuario.',
    codice: 'Una orden ancestral de monjes guerreros que buscan el equilibrio en la Sintonía Universal, la energía que conecta todas las cosas. Casi extintos, su legado pervive a través de figuras legendarias como Saelen Vharr, Kemet y, más recientemente, Kefra, el Guardián del Bosque. No buscan poder político, sino que intervienen en momentos críticos para evitar que la galaxia caiga en una oscuridad total.',
    historia: [
      { titulo: 'La orden ancestral', texto: 'Monjes guerreros que buscan el equilibrio en la Sintonía Universal. Su propia sintonía se basa en la sintonía del universo.' },
      { titulo: 'La disonancia', texto: 'La energía alterada del Reactor Oscuro desafina la Sintonía del universo. Por eso la orden se une a Vinica y Dubitsa contra el expansionismo de Rilur, en Lolop.' },
      { titulo: 'Saelen Vharr', texto: 'El maestro vence a Lord Veylan en la Batalla de Orion-34. {La orden queda diezmada y se refugia en Riqtom.}' },
      { titulo: 'Kemet', texto: 'El legendario Kemet lidera el contraataque y muere en duelo con el Emperador. Envía a su discípulo Raqid a buscar al Guardián del Bosque.' },
      { titulo: 'Kefra', texto: 'Raqid encuentra a Kefra en Arcados. Kefra se entrena en otro plano, destruye el Reactor Oscuro, libera Vinica, inicia la guerra civil, lucha en Turonis y desaparece.' }
    ],
    gobernantes: [
      { nombre: 'Saelen Vharr', titulo: 'Maestro', periodo: '… – {c. 8} DO', nota: 'Vencedor de Orion-34.' },
      { nombre: 'Kemet', titulo: 'el Legendario', periodo: '{8} – 18 DO', nota: '{Discípulo de Saelen.} Muere con el Emperador.' },
      { nombre: 'Raqid', titulo: '', periodo: '18 DO – …', nota: 'Discípulo de Kemet. {Sobrevive a Raqut.}' },
      { nombre: 'Kefra', titulo: 'el Guardián del Bosque', periodo: '23 – {58} DO', nota: 'Desaparece en Turonis.' }
    ],
    ejercito: [
      { nombre: 'Caballeros', texto: 'Muy pocos, pero decisivos. Intervienen en momentos críticos.' },
      { nombre: '{Poderes de la Sintonía}', texto: '{Percibir la energía universal, combatir con capacidades potenciadas y, los más dotados, entrar en el otro plano (el Plano de la Resonancia).}' }
    ],
    cultura: 'Equilibrio por encima del poder. Viven ocultos {(de ahí el nombre de Caballeros Ocultos)}. No buscan poder político. {La relación entre maestro y discípulo es sagrada.}',
    relaciones: [
      { con: 'vinica', tipo: 'Aliada histórica', texto: 'Su primera alianza política en siglos.' },
      { con: 'dubitsa', tipo: 'Aliada', texto: 'Juntos en Lolop.' },
      { con: 'rilur', tipo: 'Enemigo histórico', texto: 'Por el Reactor Oscuro y los Nighul. Combatieron a su lado en Turonis.' },
      { con: 'andalus', tipo: 'Enemigo', texto: 'Kefra luchó contra Rahman.' }
    ],
    jugabilidad: 'Unidades de héroe escasas y decisivas. No controlan territorio: intervienen como evento o como aliado en momentos críticos.',
    ganchos: [
      'La búsqueda de Kefra: ¿está vivo?',
      'Reconstruir la orden en Riqtom.',
      'El otro plano como escenario jugable.'
    ]
  }
];
