# Sethur, el Faraón Olvidado — mod de Terraria (tModLoader)

Mod completo `ForgottenPharaoh` para **tModLoader 1.4.4 (estable)** en C#. Añade a **Sethur, el Faraón Olvidado**, un jefe
inspirado en el Antiguo Egipto (cabeza de chacal tipo Anubis, armadura negra y dorada con gemas azules, bastón solar,
arena dorada y energía solar) con **dificultad de Hardmode desde el primer minuto** y una invocación baratísima:

> **Ídolo del Faraón Olvidado** (`SethurSummon`) = **5 bloques de madera (cualquier tipo) + Mesa de trabajo**.

```
Sethur_TerrariaMod/
├── ForgottenPharaoh/          ← EL MOD (copiar esta carpeta a ModSources)
├── Herramientas/
│   ├── sprites/               ← generador de todos los sprites (Python + Pillow + NumPy)
│   ├── VerificarCompilacion/  ← compilación + simulador de combate sin tModLoader (dotnet)
│   └── verificar_recursos.py  ← comprueba texturas y claves de localización
└── README.md
```

## 1. Instalación y compilación

1. Instala **tModLoader** (Steam → *Terraria* → DLC gratuito *tModLoader*) en la versión estable 1.4.4 y ábrelo una vez.
2. Copia la carpeta `ForgottenPharaoh/` a tu carpeta `ModSources`:
   - Windows: `Documentos\My Games\Terraria\tModLoader\ModSources\`
   - Linux: `~/.local/share/Terraria/tModLoader/ModSources/`
   - macOS: `~/Library/Application Support/Terraria/tModLoader/ModSources/`
3. En tModLoader: **Workshop → Develop Mods → Build + Reload** junto a *ForgottenPharaoh* (también puedes abrir
   `ForgottenPharaoh.csproj` en Visual Studio / Rider / VS Code y compilar; el `.csproj` importa el `tModLoader.targets`
   que tModLoader genera en `ModSources` la primera vez que abres *Develop Mods*).
4. Entra en un mundo (Classic, Expert o Master, un jugador o multijugador), fabrica el Ídolo en una **mesa de trabajo**
   (5 bloques de madera) y úsalo.

Localización incluida: **español (es-ES)** e **inglés (en-US)**.

## 2. Qué incluye

### El jefe: Sethur
| | Classic | Expert | Master |
|---|---|---|---|
| Vida | **45.000** | **60.000** | **90.000** |
| Defensa | 38 | 46 | 54 |
| Daño de contacto base | 70 (×2 / ×3 nativo del juego) | | |
| Descansos entre ataques | 100% | −12% | −24% |
| Proyectiles extra / velocidad | +0 / ×1,0 | +1 / ×1,1 | +2 / ×1,2 |

La vida y la defensa se asignan de forma **absoluta** en `ApplyDifficultyAndPlayerScaling` (el juego lo llama *después*
de aplicar su multiplicador nativo), por lo que **no se multiplica dos veces**; solo se aplica el factor `balance` del
juego (escalado por número de jugadores). Todos los números de balance están en `Common/Utilities/SethurBalance.cs`.

El reto viene de los patrones, no de la vida: **todo ataque se telegrafía** (postura + marcas en el suelo, líneas,
anillos o brillo creciente) y el daño de contacto solo existe en zarpazo y embestida.

| Fase | Umbral | Ataques |
|---|---|---|
| 1 · El despertar del faraón | 100% | Flota siguiendo al jugador y cambia de lado · **Columnas de arena** · **Discos solares** (persecución moderada) · **Zarpazo** si el jugador se acerca |
| 2 · La tormenta del desierto | ≤ 75% | Más rápido · **Manos de arena** · **Tornados** por el suelo · alterna ataques a distancia con **embestidas** (2–4) |
| 3 · El juicio solar | ≤ 40% | Halo más brillante · **Rayo de juicio** (carga larga y visible + línea de aviso + barrido) · **Obeliscos flotantes** que disparan · **Explosiones solares** con zonas circulares |
| 4 · El dios olvidado | ≤ 15% | Todo lo anterior en una **secuencia final** encadenada con descansos mínimos y una ventana de descanso larga al terminarla · velocidad ↑ · efectos **dorado y azul intenso** |

Cada cambio de fase es una transición invulnerable con animación (32 fotogramas), onda de choque, mensaje de chat y
limpieza de proyectiles. La muerte es **en dos tiempos**: al llegar a 0 de vida arranca la animación de muerte
(desintegración progresiva en polvo dorado) y solo al terminar muere de verdad (botín + progresión).

### Recompensas
| Objeto | Tipo | Notas |
|---|---|---|
| Máscara de Sethur | Vanidad (con textura de equipo propia) | 1/7 |
| **Bastón del Desierto** | Invocación, 34 de daño | Convoca un Espíritu de Arena que dispara |
| **Hoz del Faraón** | Cuerpo a cuerpo, 46 de daño | Cada golpe lanza una onda creciente (60% del daño) |
| **Disco Solar** | A distancia, 42 de daño | Bumerán, máx. 2 a la vez |
| **Fragmento Real** | Material | 12–18 por victoria |
| Amuleto Real | Accesorio opcional | +6% daño, +4% crítico (10 Fragmentos + 6 Barras de oro, yunque) |
| Bolsa del tesoro | Expert/Master | Mismo botín |

Una de las tres armas está garantizada pero ninguna es obligatoria para progresar, y las estadísticas son moderadas a
propósito para no romper el equilibrio.

### Progresión y multijugador
- Progresión **propia** (`SethurWorldSystem.downedSethur`): se guarda en el mundo (`TagCompound`) y se sincroniza con los
  clientes (`NetSend`/`NetReceive`). No se modifica ningún `NPC.downedBoss*` de vanilla.
- IA con **máquina de estados sincronizada** en `NPC.ai[]` + `SendExtraAI`/`ReceiveExtraAI`. Solo el servidor (o el
  jugador en solitario) decide estados y crea proyectiles; los clientes ejecutan únicamente lo visual → **no hay
  proyectiles duplicados**. Los proyectiles son deterministas a partir de sus `ai[]`.
- El Ídolo funciona en multijugador (`NPCID.Sets.MPAllowedEnemies` + `MessageID.SpawnBossUseLicenseStartEvent`).

## 3. Sprites y animaciones

Todos los sprites son **pixel art real con transparencia real (alfa 0/255)**, no marcadores de posición vacíos. Se generan
de forma procedural a partir de un modelo del personaje (cabeza de chacal como mini-modelo 3D proyectado, torso, gorguera
*usekh*, brazos con cinemática inversa, bastón solar, telas y arena animadas), con sombreado por biseles de 5 tonos, contorno
y *dithering* tipo pixel art. Cada fotograma se dibuja de verdad (el jefe **no** usa una imagen estática gigante).

Hojas de animación del jefe (`Content/NPCs/Sethur/Anim/`, celdas de **224×256 px**, rejilla de 8 columnas, **2 px de
separación**, el jefe mira a la derecha y se refleja al mirar a la izquierda):

| Hoja | Fotogramas | Uso |
|---|---|---|
| `SethurIdle` | 32 | Flotar (bucle perfecto) |
| `SethurMove` | 24 | Movimiento y embestida |
| `SethurTurn` | 16 | Giro (se reproduce al revés para girar al otro lado) |
| `SethurClaw` | 24 | Zarpazo (con estela) |
| `SethurSandRain` | 24 | Columnas de arena, manos del desierto |
| `SethurSolarDisc` | 24 | Discos solares, explosiones solares |
| `SethurSolarRay` | 32 | Carga (0–20) y disparo (21–31) del rayo |
| `SethurObelisk` | 24 | Obeliscos, tornados |
| `SethurTransition` | 32 | Transición de fase |
| `SethurHurt` | 24 | Recibir daño (solo cuando está tranquilo) |
| `SethurDeath` | 24 | Muerte con disolución en polvo dorado |

`Main.npcFrameCount[Type] = 1` (la textura del NPC, `SethurBoss.png`, es el retrato del bestiario). `FindFrame()` /
`ComputeAnimation()` eligen cada tick **(animación, fotograma)** a partir del estado sincronizado y `PreDraw` recorta ese
fotograma de su hoja con `GetFrameRect`; cada fotograma lleva además **anclajes** (cabeza, orbe del báculo, pecho)
generados con los sprites (`SethurFrameData.cs`) que usan el halo, el rayo y los proyectiles. El halo solar, los
fragmentos orbitales, los resplandores y las telegrafías se dibujan por código con mezcla aditiva (cambian por fase).

Efectos: arena que responde al movimiento, polvo en erupciones y golpes del báculo, brillos y explosiones solares,
estelas de embestida, temblor de pantalla, sonidos de vanilla (`SoundID`) y música de vanilla (`MusicID.Boss3`).

### Archivos gráficos que conviene sustituir si un artista hace los definitivos
Mantén **nombre, dimensiones y número de fotogramas** (apilados en vertical salvo las hojas del jefe) y no hará falta
tocar código:

| Ruta (dentro de `ForgottenPharaoh/`) | Tamaño | Fotogramas |
|---|---|---|
| `Content/NPCs/Sethur/Anim/Sethur*.png` (11 hojas) | 1806 × (514…1030) | ver tabla anterior |
| `Content/NPCs/Sethur/SethurBoss.png`, `SethurBoss_Head_Boss.png` | 224×256, 40×40 | 1 |
| `Content/Projectiles/Boss/SethurSandColumn.png` | 64×1792 | 8 de 64×224 |
| `…/SethurSandHand.png` · `SethurTornado.png` | 96×896 · 80×1152 | 8 · 8 |
| `…/SethurSolarDisc.png` · `SethurObelisk.png` · `SethurObeliskBolt.png` | 48×192 · 36×336 · 24×96 | 4 · 4 · 4 |
| `…/SethurSolarBlast.png` · `SethurClawSlash.png` | 160×1280 · 128×768 | 8 · 6 |
| `Content/Projectiles/Weapons/*.png` (4) | ver carpeta | 4 cada uno |
| `Content/Items/*.png` + `SethurMask_Head.png` | 40×1120 (20 fotogramas de 40×56) | — |
| `Content/Buffs/SandSpiritBuff.png`, `icon.png` (80×80), `icon_workshop.png` (512×512) | | |
| `Assets/Textures/SethurHalo/Glow/Ring/Beam/Flare/Shard.png` | efectos por código | |

Para **regenerar** todos los sprites desde cero:
```bash
cd Sethur_TerrariaMod/Herramientas/sprites
python3 generar_boss.py   ../../ForgottenPharaoh      # 11 hojas del jefe + SethurFrameData.cs (~90 s)
python3 generar_extras.py ../../ForgottenPharaoh      # proyectiles, objetos, UI, efectos
```
(requiere `pip install pillow numpy`). Los parámetros de cada animación están en `sprites/anims.py`.

## 4. Verificación realizada

En el entorno donde se desarrolló **no hay tModLoader ni Terraria**, así que el mod **no se ha podido ejecutar en el
juego**. Lo que sí se ha comprobado automáticamente (todo reproducible):

```bash
cd Sethur_TerrariaMod/Herramientas
python3 verificar_recursos.py                       # texturas, hojas y localización de las 23 clases
cd VerificarCompilacion && dotnet run               # compila los 34 .cs del mod y simula 3 combates completos
```
- **Compilación** de todos los `.cs` con .NET 8 contra un *API stub* de tModLoader/Terraria/XNA cuyas firmas de
  `ModNPC`/`ModProjectile`/`ModItem` están copiadas del código fuente oficial de tModLoader. Detecta errores de sintaxis,
  tipos, variables y sobrecargas; **no** sustituye a compilar con tModLoader real.
- **Simulador sin cabeza** que ejecuta la IA real del jefe y de sus 9 proyectiles hostiles en tres combates completos:
  un jugador Classic, un jugador Expert y servidor + cliente Master. Resultado: sin excepciones; se alcanzan las 4 fases
  con exactamente 3 transiciones; entre las tres corridas se usan los 9 ataques y los 9 proyectiles; muerte en dos tiempos (≥ 150 ticks) y `downedSethur` marcado; **el cliente nunca
  crea proyectiles**; **0 desincronizaciones** de estado servidor/cliente; ida y vuelta de `SendExtraAI`/`ReceiveExtraAI`
  idéntica; mensajes de chat correctos en SP (`Main.NewText`) y servidor (`ChatHelper`).
- **Vida/defensa** por dificultad (45.000/60.000/90.000) incluso simulando que el juego ya multiplicó `lifeMax`.
- **Receta**: `[Group:Wood×5, Tile:WorkBenches]` — exactamente 5 bloques de madera (grupo de madera = cualquier tipo) y una
  mesa de trabajo, sin ingredientes ni estaciones adicionales.

Lo que **no** está verificado y debes probar en el juego: el aspecto final de los efectos aditivos, la sensación de los
tiempos/daños (todo ajustable en `SethurBalance.cs` y en los tiempos de `SethurBoss.Attacks.cs`), el transporte real de
red y el comportamiento de las IDs de vanilla usadas (sonidos, polvo). Si tModLoader marca algún error de compilación
por una diferencia de API entre versiones, suele ser un nombre/firma puntual y fácil de ajustar.

## 5. Notas de diseño y límites conocidos
- El concept art mostraba momias, un pergamino de magia y un "Alma del Desierto"; no estaban en las especificaciones
  escritas y **no se han implementado**. Tampoco hay trofeo/reliquia/mascota.
- El daño de los proyectiles hostiles se entrega como valor base porque el juego lo multiplica al golpear (×2 Expert,
  ×3 Master); `SethurBalance.ProjectileDamage` lo compensa (~1,6× y ~2,1× el de Classic).
- Sonido y música usan recursos existentes de Terraria (sin dependencias de archivos de audio inexistentes).
