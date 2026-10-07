/* Crónicas: la historia real detrás del juego. Se desbloquean al encontrarlas o al vivir
 * ciertos momentos, y se leen desde el menú. Fechas y datos según las fuentes de la época
 * (Joinville, al-Maqrizi, Ibn Wasil) y la historiografía actual.
 */
'use strict';
(function () {
  const C = (IH.CRONICAS = IH.CRONICAS || {});

  C.al_qahira = {
    titulo: 'Al-Qahira, «la Victoriosa»',
    fecha: '969 d. C. · 358 H.',
    pista: 'En las calles de El Cairo.',
    texto: 'El Cairo nació en el año 969, cuando el general *Yawhar al-Siqilli* levantó una ciudad amurallada para el califa fatimí *al-Muizz*, junto a la vieja Fustat. La llamaron *al-Qahira*, «la Victoriosa». Doscientos ochenta años después, en tiempos de Yusuf, es una de las mayores ciudades del mundo: cientos de miles de almas, mercados especializados por oficios —herreros, caldereros, libreros, especieros— y una vida que no se detiene ni de noche.',
  };
  C.bab_zuwayla = {
    titulo: 'Bab Zuwayla',
    fecha: '1092 d. C.',
    pista: 'Junto a la gran puerta del sur.',
    texto: 'Puerta meridional de la ciudad fatimí, reconstruida en piedra en 1092 por el visir *Badr al-Yamali*. Debe su nombre a los soldados bereberes de la tribu *Zuwayla*. Sus dos torres semicirculares eran de las más sólidas de Egipto.\n\nSi la visitas hoy, verás sobre ella dos alminares esbeltos: no existían en tiempos de Yusuf. Los añadió el sultán *al-Muayyad Shayj* hacia 1420, para su mezquita vecina.',
  };
  C.qasaba = {
    titulo: 'Bayn al-Qasrayn',
    fecha: 'Siglos X–XIII',
    pista: 'En la calle mayor de El Cairo.',
    texto: 'La gran calle de El Cairo —la *Qasaba*— atravesaba la ciudad de norte a sur, de Bab al-Futuh a Bab Zuwayla. En su centro se alzaban los dos palacios de los califas fatimíes: de ahí el nombre del lugar, *Bayn al-Qasrayn*, «entre los dos palacios». En 1243 el sultán *as-Salih Ayyub* levantó allí su madrasa, la *Salihiyya*, sobre las ruinas del palacio oriental.',
  };
  C.acero = {
    titulo: 'El oficio del herrero',
    fecha: 'Egipto medieval',
    pista: 'En la forja de Ibrahim.',
    texto: 'Los herreros de El Cairo trabajaban hierro de las minas de Egipto y de Siria, y acero de crisol traído de la India y del Jorasán, el famoso *acero de Damasco*, con sus aguas onduladas. Una buena hoja exigía calentar, martillar, doblar y templar muchas veces. El temple se juzgaba a ojo, por el color del metal al rojo: no había termómetros, solo la experiencia de toda una vida.\n\nLas espadas de la época de Yusuf aún eran mayoritariamente *rectas y de doble filo*; los sables curvos se generalizarían más tarde.',
  };
  C.usama = {
    titulo: 'Usama ibn Munqidh',
    fecha: '1095–1188',
    pista: 'Un libro prestado.',
    texto: 'Emir sirio, guerrero y poeta, Usama vivió las primeras cruzadas y conoció de cerca a los francos: luchó contra ellos y también fue su huésped. En su vejez escribió el *Kitab al-Itibar*, «el libro de las lecciones», lleno de anécdotas sobre la caballería, la caza, la medicina y las extrañas costumbres de los cruzados. Es uno de los testimonios más vivos de la época.',
  };
  C.aguadores = {
    titulo: 'Los aguadores',
    fecha: 'Siglos X–XIX',
    pista: 'Habla con quien lleva el agua.',
    texto: 'El Cairo no tenía cañerías para todos: el agua del Nilo llegaba a las casas a lomos de camellos y burros, o a la espalda de los *saqqa*, los aguadores, con sus odres de piel de cabra. Recorrían las calles anunciándose con un tintineo de vasos de latón. Dar de beber al sediento se consideraba una obra piadosa; por eso los ricos fundaban fuentes públicas.',
  };
  C.saladino = {
    titulo: 'Salah ad-Din',
    fecha: '1138–1193',
    pista: 'Escucha al cuentacuentos.',
    texto: 'Yusuf ibn Ayyub, *Salah ad-Din* —Saladino para los francos—, era un oficial kurdo que llegó a sultán de Egipto y Siria. En 1187 aplastó a los cruzados en *Hattin* y recuperó Jerusalén tras 88 años de dominio franco. Mandó construir la *Ciudadela* de El Cairo sobre la colina del Muqattam. Su familia, los *ayyubíes*, todavía gobierna Egipto en 1249: el sultán as-Salih Ayyub es su sobrino nieto.',
  };
  C.cuentacuentos = {
    titulo: 'Los cuentacuentos',
    fecha: 'Edad Media',
    pista: 'Escucha al cuentacuentos.',
    texto: 'En plazas y portales, los narradores profesionales —los *qussas*— recitaban gestas de héroes como Antar o del rey Baybars, historias de profetas y aventuras maravillosas. Muchos de esos relatos acabarían en colecciones como *Las mil y una noches*, cuyas versiones egipcias se formaron precisamente en El Cairo de los siglos siguientes.',
  };
  C.ayyubies = {
    titulo: 'El sultán as-Salih Ayyub',
    fecha: 'Reinó en Egipto 1240–1249',
    pista: 'Escucha la proclama.',
    texto: 'Nieto de al-Adil, hermano de Saladino. Desconfiado tras años de guerras familiares, as-Salih se rodeó de un ejército propio de jóvenes esclavos turcos —los *mamelucos*— a los que acuarteló en la isla de *Rawda*, en el Nilo. Cuando los cruzados desembarcaron en 1249, el sultán estaba ya gravemente enfermo; aun así se hizo llevar en litera hasta Mansura para dirigir la defensa.',
  };
  C.mamelucos = {
    titulo: 'Los mamelucos',
    fecha: 'Siglo XIII',
    pista: 'Observa a los soldados del sultán.',
    texto: '*Mamluk* significa «poseído»: eran esclavos comprados de niños en las estepas al norte del mar Negro —sobre todo *kipchaks*—, convertidos al islam y entrenados durante años como jinetes arqueros de élite. Al terminar su formación eran liberados, pero conservaban una lealtad feroz a su señor y a sus compañeros. Los de as-Salih se llamaban *Bahriyya*, «los del río», por su cuartel en una isla del Nilo. Un egipcio libre como Yusuf no podía ser mameluco: servía junto a ellos.',
  };
  C.damieta = {
    titulo: 'La caída de Damieta',
    fecha: '5–6 de junio de 1249',
    pista: 'Escucha la proclama.',
    texto: 'La flota de Luis IX apareció frente a Damieta el 4 de junio de 1249. Al día siguiente los cruzados desembarcaron en la playa y, para asombro de todos, la guarnición abandonó la ciudad durante la noche. Damieta cayó casi sin lucha. El sultán, furioso, mandó ahorcar a más de cincuenta oficiales por cobardía. Luis decidió esperar en la ciudad a que bajara la crecida del Nilo antes de avanzar hacia El Cairo.',
  };
  C.luis_ix = {
    titulo: 'Luis IX de Francia',
    fecha: '1214–1270',
    pista: 'Avanza en la historia.',
    texto: 'Rey de Francia, profundamente devoto, tomó la cruz en 1244 tras una grave enfermedad. Partió del puerto de *Aigues-Mortes* en agosto de 1248, invernó en Chipre y desembarcó en Egipto: conquistar El Cairo, pensaba, era la llave para recuperar Jerusalén. Su biógrafo y compañero, el senescal *Jean de Joinville*, dejó la crónica más detallada de la campaña.',
  };
  C.infanteria = {
    titulo: 'Los que luchaban a pie',
    fecha: 'Ejércitos ayyubíes',
    pista: 'En el maydan.',
    texto: 'La gloria se la llevaban los jinetes mamelucos y los de la *halqa* —la caballería de hombres libres—, pero los ejércitos del sultán también necesitaban gente a pie: arqueros, lanceros, zapadores, *naffatun* que lanzaban fuego y voluntarios de las ciudades. En Mansura fueron decisivos los propios vecinos, que desde las azoteas arrojaron piedras y vigas sobre los caballeros francos atrapados en las calles.',
  };
  C.maydan = {
    titulo: 'El maydan y la furusiyya',
    fecha: 'Siglo XIII',
    pista: 'En el campo de entrenamiento.',
    texto: 'Al pie de la Ciudadela se extendían los *maydanes*, grandes explanadas donde los soldados se ejercitaban en la *furusiyya*: el arte del jinete. Tiro con arco a caballo, lanza, espada, polo y carreras. Los mamelucos entrenaban a diario durante años; los tratados de furusiyya de la época son verdaderos manuales técnicos, con ejercicios, posturas y hasta cuidados veterinarios.',
  };
  C.shajar = {
    titulo: 'Shajar al-Durr',
    fecha: '¿?–1257',
    pista: 'Avanza en la historia.',
    texto: '«Árbol de perlas». De origen turco o armenio, fue esclava y después esposa de as-Salih Ayyub. Cuando el sultán murió en plena guerra —el 22 de noviembre de 1249—, ella ocultó su muerte: firmaba las órdenes en su nombre y mantenía la apariencia de que seguía enfermo en su tienda. Así evitó que el ejército se desmoronara frente a los cruzados. En 1250 se convertiría en sultana de Egipto, algo insólito en el mundo islámico medieval.',
  };
  C.bahr = {
    titulo: 'El Bahr al-Saghir',
    fecha: 'Diciembre de 1249 – febrero de 1250',
    pista: 'En el campamento de Mansura.',
    texto: 'El «río pequeño» era un canal del Nilo que separaba a los dos ejércitos frente a Mansura. Durante semanas los cruzados intentaron construir una calzada de tierra para cruzarlo, protegida por torres de madera; los egipcios la deshacían cavando la orilla contraria y la bombardeaban con *fuego griego*. Joinville cuenta que el fuego cruzaba la noche «como un dragón que volase por el aire».',
  };
  C.naft = {
    titulo: 'El fuego griego',
    fecha: 'Siglos VII–XIV',
    pista: 'Habla con el naffat.',
    texto: 'Los ejércitos musulmanes heredaron de Bizancio el arte del fuego líquido. Los *naffatun* mezclaban nafta —petróleo— con resinas y otras sustancias secretas, y la lanzaban en ollas de barro o con catapultas. Ardía incluso sobre el agua y era muy difícil de apagar. Se decía que solo el vinagre, la arena o la orina lo sofocaban.',
  };
  C.baibars = {
    titulo: 'Baibars al-Bunduqdari',
    fecha: 'c. 1223–1277',
    pista: 'Avanza en la historia.',
    texto: 'Kipchak de las estepas, vendido como esclavo de niño. Las crónicas lo describen alto, de voz poderosa, con un ojo azul marcado por una mancha blanca. Su apodo viene de su primer amo, un *bunduqdar* (ballestero). En Mansura, siendo uno de los jefes de los Bahriyya, tendió la trampa que destruyó a la vanguardia cruzada. Años después sería sultán y uno de los guerreros más temidos de su siglo.',
  };
  C.mansura = {
    titulo: 'La batalla de Mansura',
    fecha: '8 de febrero de 1250',
    pista: 'Sobrevive a la batalla.',
    texto: 'Al amanecer, guiados por un lugareño que les mostró un vado, los cruzados cruzaron el canal. *Roberto de Artois*, hermano del rey, sorprendió el campamento egipcio y mató a su comandante, *Fajr al-Din*, que según las crónicas estaba en el baño. Luego, desobedeciendo las órdenes, se lanzó con los templarios dentro de Mansura. Allí lo esperaban los mamelucos: las calles estrechas anularon a los caballeros. Roberto murió y los templarios perdieron casi a todos sus hombres.',
  };
  C.templarios = {
    titulo: 'Los templarios',
    fecha: '1120–1312',
    pista: 'Enfréntate a un caballero del Temple.',
    texto: 'La Orden del Temple nació en Jerusalén para proteger a los peregrinos y se convirtió en la fuerza militar más disciplinada de los estados cruzados. Monjes y caballeros a la vez, vestían manto blanco con cruz roja y tenían prohibido retirarse mientras su estandarte siguiera en pie. En Mansura, según contó el propio maestre de la orden, el Temple perdió unos 280 jinetes: apenas un puñado logró escapar.',
  };
  C.tablkhana = {
    titulo: 'La tablkhana',
    fecha: 'Ejércitos ayyubíes y mamelucos',
    pista: 'Escucha a los tambores.',
    texto: 'La banda militar de timbales (*naqqara*), tambores (*tabl*), trompetas largas (*nafir*) y címbalos. Tener tablkhana propia era un privilegio de rango: un «emir de tablkhana» mandaba a unos cuarenta jinetes. Su estruendo daba órdenes en la batalla, animaba a los propios y aterraba al enemigo. Los cristianos adoptaron sus timbales: en castellano, la *nácara* —un timbal de la caballería— toma su nombre del árabe *naqqara*.',
  };
  C.mongoles = {
    titulo: 'Los jinetes del este',
    fecha: '1206–1260',
    pista: 'Termina el Prólogo.',
    texto: 'Mientras francos y egipcios combatían en el Nilo, un imperio sin precedentes crecía en las estepas. Los mongoles de Gengis Kan y sus herederos habían conquistado China, Persia y Rusia. En 1258 *Hulagu* tomaría Bagdad, mataría al califa y arrasaría la ciudad más sabia del mundo. Su siguiente objetivo sería Siria… y después, Egipto.',
  };
})();
