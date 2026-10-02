/*
  HOLOCRÓN GALÁCTICO — Personajes
  {llaves} = detalle propuesto, pendiente de aprobación.
*/
window.LORE = window.LORE || {};

LORE.personajes = [
  {
    id: 'saelen-vharr', nombre: 'Saelen Vharr', titulos: 'Maestro de la Sintonía',
    faccion: 'sintonia', vida: '{c. 60 AO – c. 8 DO}', tomos: ['I', 'II'],
    rol: 'Héroe de Orion-34',
    bio: 'Maestro de los Caballeros de la Sintonía en la Guerra de las Galaxias Fragmentadas. Encabezó a los caballeros que se aliaron con Vinica y Dubitsa y derrotó a Lord Veylan en la Batalla de Orion-34, en Lolop. Fue una victoria agridulce: el este cayó igualmente. {Se retiró a Riqtom con los supervivientes y formó a Kemet hasta su muerte.}',
    destino: '{Muere de vejez en Riqtom, hacia el 8 DO.}'
  },
  {
    id: 'veylan', nombre: 'Lord Veylan', titulos: 'Señor de la guerra de Rilur',
    faccion: 'rilur', vida: '{… – 0 DO}', tomos: ['I'],
    rol: 'Antagonista del Tomo I',
    bio: 'Señor de la guerra del Imperio de Rilur, al mando de la ofensiva en Orion-34. No usaba la Sintonía: su poder eran los ejércitos de clones y droides que le daba el reactor. {Tenía fama de no haber perdido nunca una campaña.} Fue derrotado por Saelen Vharr en un duelo que se convirtió en leyenda.',
    destino: '{Muere en el duelo de Lolop.}'
  },
  {
    id: 'sarkon', nombre: '{Sarkon}', titulos: 'Primer Emperador, el Emperador Original',
    faccion: 'rilur', vida: '{… – 18 DO}', tomos: ['I', 'II'],
    rol: 'Emperador de la era del Reactor Oscuro',
    bio: 'El emperador de Rilur con el que empieza la saga. Bajo su reinado, el Reactor Oscuro llevó al Imperio a su máxima expansión. Tras la destrucción de Rilit presentó a su élite, los Nighul. {Fue el primero en unirse al reactor, lo que le daba una fuerza impropia de su edad.} Murió en un duelo contra Kemet, que pereció con él. Su muerte provocó una gran crisis en el centro del Imperio.',
    destino: 'Muere en duelo con Kemet ({18 DO}).'
  },
  {
    id: 'kemet', nombre: 'Kemet', titulos: 'el Legendario',
    faccion: 'sintonia', vida: '{c. 25 AO – 18 DO}', tomos: ['I', 'II'],
    rol: 'Héroe del Tomo II',
    bio: '{Discípulo de Saelen Vharr, combatió a su lado en Lolop.} Durante la paz impuesta se convirtió en una leyenda de la resistencia. Tras la destrucción de Rilit y la cacería de los Nighul, lideró un contraataque contra el corazón del Imperio y venció al Emperador en un duelo mortal en el que ambos murieron. Antes de morir envió a su discípulo Raqid a buscar al Guardián del Bosque.',
    destino: 'Muere en duelo con el Emperador ({18 DO}).'
  },
  {
    id: 'raqid', nombre: 'Raqid', titulos: 'Discípulo de Kemet',
    faccion: 'sintonia', vida: '{c. 7 AO – ?}', tomos: ['II', 'III'],
    rol: 'Mentor de Kefra',
    bio: 'Discípulo de Kemet. Cumplió su última orden: buscó durante cinco años al Guardián del Bosque y encontró a Kefra en Arcados. Lo llevó a entrenarse en otro plano. {Lo acompañó al asalto de Raqut y se quedó atrás conteniendo a los Nighul mientras Kefra destruía el reactor.}',
    destino: '{Sobrevive a Raqut con heridas graves. Su destino posterior está pendiente.}'
  },
  {
    id: 'kefra', nombre: 'Kefra', titulos: 'el Guardián del Bosque',
    faccion: 'sintonia', vida: '{c. 7 DO – desaparecido en 58 DO}', tomos: ['III', 'IV', 'V', 'VI'],
    rol: 'Protagonista de los Tomos III y IV',
    bio: 'Joven de Arcados con un vínculo poderoso con la Sintonía. Tras un entrenamiento acelerado en otro plano, destruyó el Reactor Oscuro y lideró la campaña rebelde que liberó Vinica Prime y Polus-12, convirtiéndose en símbolo de esperanza. Aprovechó el desastre de Andalus para iniciar una guerra civil galáctica total. {Tras la tregua se retiró.} Reapareció para luchar en la Coalición Definitiva contra Rahman y después desapareció.',
    destino: 'Desaparecido tras la batalla contra Rahman. No hay cuerpo ni testigos de su muerte.'
  },
  {
    id: 'korvan', nombre: '{Korvan}', titulos: '{Gran Mariscal}, Emperador de Rilur, {el Implacable}',
    faccion: 'rilur', vida: '{c. 32 AO – 33 DO}', tomos: ['II', 'III', 'IV', 'V'],
    rol: 'Emperador de los Tomos III–V',
    bio: 'El sucesor del Primer Emperador, de otra línea. {Era Gran Mariscal de los ejércitos y tomó el trono en la crisis posterior al duelo.} Perdió el reactor, resistió y lanzó una invasión desastrosa contra la galaxia de Andalus: casi nadie volvió. Regresó herido y furioso, desató una contraofensiva brutal y provocó la guerra civil total. Padre de Reus.',
    destino: 'Muere por sus heridas ({33 DO}).'
  },
  {
    id: 'reus', nombre: 'Reus', titulos: 'Emperador de Rilur, {el Reformador}',
    faccion: 'rilur', vida: '{c. 5 AO – 55 DO}', tomos: ['V', 'VI'],
    rol: 'El emperador de la paz',
    bio: 'Hijo de Korvan. Al heredar el trono buscó la paz: firmó una tregua con Dubitsa y Vinica, reorientó el Imperio hacia fuentes de energía limpias e introdujo un sistema parlamentario. Rilur se democratizó un poco y la luz volvió. Cuando invadieron los Hijos de Andalus, cayó en un sacrificio para ganar tiempo {en Raqut}.',
    destino: 'Muere en sacrificio ({55 DO}).'
  },
  {
    id: 'ublek', nombre: 'Ublek', titulos: 'Emperador de Rilur, {el Defensor}',
    faccion: 'rilur', vida: '{c. 15 – 64 DO}', tomos: ['VI', 'VII'],
    rol: 'Héroe del Tomo VI',
    bio: 'Hijo de Reus. Tomó el mando tras el sacrificio de su padre, derrotó al general Vakel {en Rilit}, repelió a Andalus y mató a Muwiya. Lideró a Rilur dentro de la Coalición Definitiva junto a Teosio II y Kefra, y derrotó al Príncipe Rahman. Sobrevivió gravemente herido. Tuvo un hijo al que nunca reconoció: Arlik.',
    destino: 'Muere años después por sus heridas ({64 DO}) y deja el trono vacío.'
  },
  {
    id: 'arlik', nombre: 'Arlik', titulos: 'el Heredero Bastardo, Emperador guerrero',
    faccion: 'rilur', vida: '{c. 40 DO – }', tomos: ['VII'],
    rol: 'Protagonista del presente',
    bio: 'Hijo no reconocido de Ublek. {Su madre era una ingeniera Nighul.} Creció en el exilio bajo la guía de su mentor Nighul, Trok. Volvió con una legión secreta, se proclamó heredero en la capital con un apoyo débil del Parlamento y la hostilidad de la élite militar, y aplastó la rebelión de Uxal pese a la inferioridad numérica. Hoy purga a los comandantes desleales y concentra las legiones bajo su mando.',
    destino: 'Vivo. Emperador de Rilur en guerra por el dominio total del Imperio.'
  },
  {
    id: 'trok', nombre: 'Trok', titulos: 'Mentor Nighul',
    faccion: 'rilur', vida: '{c. 20 AO – }', tomos: ['VII'],
    rol: 'Mentor de Arlik',
    bio: 'Nighul y mentor de Arlik, al que guió en el exilio y en su regreso. {Es un veterano de la época del reactor, uno de los pocos Nighul que sobrevivieron a su destrucción sin perder la razón. Enseñó a Arlik el combate, la ciencia, la filosofía y la ingeniería de los Nighul.}',
    destino: 'Vivo.'
  },
  {
    id: 'teosio-ii', nombre: 'Teosio II', titulos: 'Emperador de Dubitsa, el Restaurador',
    faccion: 'dubitsa', vida: '{c. 5 AO – 62 DO}', tomos: ['IV', 'V', 'VI'],
    rol: 'Restaurador de Dubitsa',
    bio: 'Restauró Dubitsa durante la guerra civil, reuniendo a los Pretoni que habían sobrevivido en la clandestinidad. {Firmó la tregua con Reus.} Perdió Dubitsa Prime ante Muwiya, se unió a la Coalición Definitiva con Ublek y Kefra, recuperó su capital y luchó contra Rahman. Padre de Teosio III.',
    destino: '{Muere hacia el 62 DO.}'
  },
  {
    id: 'teosio-iii', nombre: 'Teosio III', titulos: 'Emperador de Dubitsa',
    faccion: 'dubitsa', vida: '{c. 30 DO – }', tomos: ['VII'],
    rol: 'Soberano de la potencia en ascenso',
    bio: 'Hijo de Teosio II. Bajo su gobierno Dubitsa florece: Pretoni numerosos y leales, una industria poderosa y universidades que guardan el saber. Observa el caos de Rilur con ambición calculadora.',
    destino: 'Vivo.'
  },
  {
    id: 'muwiya', nombre: 'Muwiya', titulos: 'General de Andalus',
    faccion: 'andalus', vida: '{… – 56 DO}', tomos: ['VI'],
    rol: 'Antagonista del Tomo VI',
    bio: 'Figura carismática que lideró la invasión de los Hijos de Andalus. {Proclamó el Gaziato de Andalus en Portus.} Conquistó Dubitsa Prime y obligó a Reus a sacrificarse. Ublek lo derrotó y murió, y su muerte provocó la Expedición de Venganza.',
    destino: 'Muere frente a Ublek ({Segunda Batalla de Orion-34}).'
  },
  {
    id: 'vakel', nombre: 'Vakel', titulos: 'General de Andalus',
    faccion: 'andalus', vida: '{… – 55 DO?}', tomos: ['VI'],
    rol: 'Lugarteniente de Muwiya',
    bio: 'General de Andalus a las órdenes de Muwiya. Fue derrotado por Ublek {cuando intentaba destruir las forjas de Rilit}.',
    destino: '{Derrotado en Rilit. Pendiente decidir si murió o fue capturado.}'
  },
  {
    id: 'rahman', nombre: 'Rahman', titulos: 'Príncipe de Andalus, {«el Intrépido»}',
    faccion: 'andalus', vida: '{… – 58 DO}', tomos: ['VI'],
    rol: 'Antagonista final del Tomo VI',
    bio: 'Uno de los numerosos hijos del Emperador de Andalus. Lideró la Expedición de Venganza para vengar la muerte de Muwiya. La Coalición Definitiva (Dubitsa, Vinica y Rilur) lo derrotó en una batalla apocalíptica {en Turonis}.',
    destino: '{Muere en Turonis.}'
  },
  {
    id: 'alid', nombre: 'Alid', titulos: 'Príncipe de Andalus',
    faccion: 'andalus', vida: '¿?', tomos: ['VI'],
    rol: 'Personaje en segundo plano',
    bio: 'Probablemente uno de los numerosos hijos del Emperador de Andalus, que llevó alguna campaña de venganza a la galaxia de Rilur. El autor lo deja en segundo plano por ahora.',
    destino: 'Pendiente.'
  },
  {
    id: 'emperador-andalus', nombre: 'Emperador de Andalus', titulos: '{Gran Gazi}',
    faccion: 'andalus', vida: '¿?', tomos: ['IV', 'VI'],
    rol: 'Soberano de Andalus',
    bio: 'Gobernante de los Hijos de Andalus en su galaxia de origen. Tiene numerosos hijos, entre ellos los príncipes Rahman y Alid. {Su nombre está pendiente.}',
    destino: 'Vivo, en su galaxia.'
  }
];
