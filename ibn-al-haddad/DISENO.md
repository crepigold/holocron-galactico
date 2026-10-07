# Ibn al-Haddad — Documento de diseño

## Visión

Una saga de acción en 2D que cuenta, desde los ojos de un egipcio corriente, los cincuenta años que cambiaron el Mediterráneo oriental: la última gran cruzada contra Egipto, el nacimiento del sultanato mameluco, la primera derrota de los mongoles y la caída de los estados cruzados.

**Tres pilares**

1. **Una historia contada con calma.** Cinemáticas que se toman su tiempo para explicar el contexto, narradas por el propio protagonista ya anciano. El jugador nunca debería perderse en la historia, aunque no sepa nada de la época.
2. **Combate de paciencia.** El arma del protagonista se llama *Sabr* («paciencia»), y el sistema de combate premia lo mismo: leer al enemigo, bloquear, **parar a tiempo** y castigar. Pocos enemigos, cada uno peligroso.
3. **Historia real, bien contada.** Fechas, lugares y personajes verdaderos; los inventados encajan en los huecos que deja la documentación. Las *Crónicas* coleccionables cuentan lo que pasó de verdad.

**Público:** jugadores de aventuras de acción 2D (*Blasphemous*, *Hollow Knight*, *Katana Zero*, *The Last Faith*) y aficionados a la historia (*Assassin's Creed*, *Kingdom Come*). Público hispanohablante primero, internacional después.

## Personajes

| Personaje | Tipo | Papel |
|---|---|---|
| **Yusuf ibn Ibrahim al-Haddad** | Ficticio | Protagonista. Unos 18 años en 1249. Egipcio libre, no mameluco: sirve junto a ellos sin ser uno de ellos. Narra la historia en 1300, con casi 70 años. |
| **Ibrahim al-Haddad** | Ficticio | Su padre, herrero de la calle de los herreros, cerca de Bab Zuwayla. Forja la espada *Sabr*. |
| **Nur** | Ficticia | Hija del librero vecino. Enseñó a leer a Yusuf. Las cartas que él le escribe son el hilo emocional de la saga (y el origen de la crónica). |
| **Hamid** | Ficticio | Pescador de Damieta que lo perdió todo con la cruzada. Compañero de armas. |
| **Amr** | Ficticio | Niño de la calle que sueña con ser emir. Volverá. |
| **Sunqur** | Ficticio | Viejo instructor mameluco del maydan. |
| **Baibars al-Bunduqdari** | Histórico | Emir de los Bahriyya; futuro sultán. Mentor ambiguo y temible de Yusuf. |
| **Shajar al-Durr** | Histórica | Esposa de as-Salih Ayyub; oculta su muerte y llega a sultana. |
| **Thibaut de Clermont** | Ficticio | Caballero templario, jefe del Prólogo. Si Yusuf le perdona, puede reaparecer. |
| As-Salih Ayyub, Luis IX, Roberto de Artois, Fajr al-Din, Turanshah | Históricos | Aparecen o se mencionan en las cinemáticas. |

## Estructura de la saga (propuesta)

| Capítulo | Años | Contenido | Mecánica nueva |
|---|---|---|---|
| **I · Prólogo — El hijo del herrero** ✅ | 1249–1250 | El Cairo, Mansura, la trampa de Baibars. | Combate básico, parada, forja. |
| **II · Los jinetes del fin del mundo** | 1258–1260 | Refugiados de Bagdad llegan a El Cairo; los embajadores de Hulagu; la marcha a Palestina; **Ain Jalut** (3 de septiembre de 1260), la primera gran derrota mongola. Baibars mata a Qutuz y se hace sultán. | Combate a caballo y tiro con arco; enemigos mongoles (arqueros montados, retiradas fingidas). |
| **III · El león de Egipto** | 1260–1268 | Yusuf al servicio de Baibars: el correo de palomas, el espionaje en las ciudades francas, Cesarea, Safed y la caída de **Antioquía** (1268). | Sigilo e infiltración; escalada de murallas. |
| **IV · El Krak** | 1271 | El asedio del **Krak de los Caballeros**. | Asedios: minas, catapultas, fuego griego. |
| **V · Las murallas de Acre** | 1291 | Yusuf, ya veterano, en la caída de **Acre**, fin de los estados cruzados. Reencuentros. | Batalla a gran escala; decisiones finales. |
| **Epílogo** | 1300 | El presente del cronista: los mongoles de Ghazan vuelven a amenazar Siria. | — |

**La forja como hogar.** Entre capítulos, Yusuf vuelve a la forja de su padre (después, la suya propia): allí se mejora *Sabr*, se leen las cartas de Nur y se desbloquean técnicas.

## Sistemas

- **Combate:** combo de 3 golpes, golpe fuerte que rompe guardias, ataque aéreo, bloqueo con aguante, **parada** con ventana de 0,2 s que aturde al enemigo y convierte el siguiente golpe en contraataque crítico, voltereta con invulnerabilidad. Los ataques con brillo rojo no se pueden bloquear. Los enemigos se turnan para atacar (como mucho dos a la vez) y los pesados tienen «aplomo».
- **Curación:** el odre de agua, con tres usos que se rellenan en pozos y hogueras.
- **Progresión (para los capítulos siguientes):** mejoras de *Sabr* en la forja (filo, temple, peso), técnicas de *furusiyya* aprendidas de maestros y objetos de equipo (escudo, armadura laminar, arco).
- **Decisiones:** pequeñas elecciones de diálogo que cambian líneas futuras y una decisión moral por capítulo (en el Prólogo: perdonar o no a Thibaut).
- **Crónicas:** enciclopedia histórica coleccionable que se conserva entre partidas.

## Dirección de arte y sonido

- **Pixel art a 640×360**, escalado nítido a cualquier resolución. Paleta cálida (arena, ocre, añil, almagre) para Egipto; fría y gris para los francos; rojo y negro para los mongoles.
- **Luz como narradora:** la fragua, las hogueras y los faroles iluminan dinámicamente las escenas.
- **Música:** instrumentos y escalas de la época, con un tema por lugar y por bando (el canto llano para los cruzados, el canto difónico para los mongoles).

## Rigor histórico

Licencias y cuidados que ya se han tomado:

- Yusuf no puede ser mameluco (eran esclavos comprados de niño en las estepas); por eso sirve en la infantería, que en Mansura fue real e importante.
- Bab Zuwayla sin sus alminares (son de 1415–1420); nada de café (llegó dos siglos después); espadas rectas.
- La muerte del sultán (22 de noviembre de 1249), su ocultación, el vado traicionado, la muerte de Fajr al-Din en el baño y la trampa en las calles son hechos documentados.
- Los personajes de ficción se mueven en los huecos de las fuentes y nunca cambian el resultado de los hechos.

## Hacia una versión comercial: sugerencias

1. **Voz en off del narrador** (español e inglés). Es lo que más subiría la calidad percibida de las cinemáticas.
2. **Inglés** como segundo idioma: imprescindible para vender en Steam. El texto ya está separado en los archivos de `js/capitulos/`; el siguiente paso sería extraerlo a tablas de traducción.
3. **Un artista de pixel art** para retocar retratos y las láminas clave de las cinemáticas. El sistema actual sirve de base y de guía de estilo.
4. **Un compositor** que grabe los temas con instrumentos reales, usando como maqueta la música sintetizada actual.
5. **Página de Steam con «Próximamente» lo antes posible**, para acumular listas de deseos; una demo con el Prólogo para el *Steam Next Fest*.
6. **Pruebas con jugadores** para ajustar la dificultad de Mansura y el ritmo de las cinemáticas.

## Preguntas abiertas

1. ¿Te gusta el título **«Ibn al-Haddad: El hijo del herrero»**, o prefieres otro?
2. ¿Venta **por capítulos** (episódica) o un juego completo con todos?
3. ¿Quieres **voz en off** para el narrador? ¿Quién la grabaría?
4. ¿Añadimos ya el **inglés**?
5. ¿El arte se queda en este pixel art procedural o prefieres contratar a un artista para la versión final?
6. ¿Qué tono buscas para la violencia? Hoy es moderada, con la sangre desactivable.
7. ¿Te convencen los capítulos propuestos (Ain Jalut, Antioquía, el Krak, Acre)? ¿Quieres algún momento o personaje concreto?
8. ¿Para qué plataformas? Steam y Steam Deck ya están cubiertas; Switch o móvil requerirían más trabajo.
