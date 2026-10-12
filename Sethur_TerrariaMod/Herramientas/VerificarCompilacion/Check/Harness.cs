// Simulador sin cabeza: ejecuta la IA REAL de Sethur y de sus proyectiles contra el API stub.
// Comprueba: ausencia de excepciones, alcance de las 4 fases, uso de los 9 ataques, muerte en dos tiempos,
// sincronización servidor/cliente (ai[] + SendExtraAI/ReceiveExtraAI), que el cliente NUNCA cree proyectiles,
// la receta del Ídolo y los valores de vida por dificultad.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ForgottenPharaoh.Common.Systems;
using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.Items;
using ForgottenPharaoh.Content.NPCs.Sethur;
using ForgottenPharaoh.Content.Projectiles.Boss;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.ID;
using Terraria.ModLoader;

public static class Harness
{
	public static readonly List<string> Messages = new List<string>();
	public static readonly List<(int netMode, int type)> ProjectileSpawns = new List<(int, int)>();

	static int failures;
	static void Check(bool cond, string what)
	{
		Console.WriteLine((cond ? "  [OK]   " : "  [FALLO] ") + what);
		if (!cond) failures++;
	}

	public static int RunAll()
	{
		Console.WriteLine("== Receta del Ídolo ==");
		RecipeCheck();
		Console.WriteLine("== Vida y defensa por dificultad (sin doble multiplicación) ==");
		BalanceCheck();
		Console.WriteLine("== Serialización de SendExtraAI/ReceiveExtraAI ==");
		ExtraAiRoundTrip();
		var seen = new HashSet<SethurState>();
		var seenProj = new HashSet<string>();
		Console.WriteLine("== Simulación: un jugador (Classic) ==");
		Simulate(false, 0, 9000, 14, seen, seenProj);
		Console.WriteLine("== Simulación: un jugador (Expert) ==");
		Simulate(false, 1, 9000, 10, seen, seenProj);
		Console.WriteLine("== Simulación: servidor + cliente (Master) ==");
		Simulate(true, 2, 9000, 14, seen, seenProj);
		Console.WriteLine("== Cobertura acumulada de las 3 simulaciones ==");
		foreach (var s in new[] { SethurState.SandColumns, SethurState.SolarDiscs, SethurState.ClawStrike, SethurState.DesertHands, SethurState.SandTornado, SethurState.Dash, SethurState.SolarRay, SethurState.Obelisks, SethurState.SolarBlasts })
			Check(seen.Contains(s), "se ejecuta el ataque " + s);
		foreach (var n in new[] { "SethurSandColumn", "SethurSandHand", "SethurTornado", "SethurSolarDisc", "SethurSolarBeam", "SethurSolarBlast", "SethurObelisk", "SethurObeliskBolt", "SethurClawSlash" })
			Check(seenProj.Contains(n), "se crean proyectiles " + n);
		Console.WriteLine(failures == 0 ? "\nTODO CORRECTO" : "\nFALLOS: " + failures);
		return failures == 0 ? 0 : 1;
	}

	// ------------------------------------------------------------------------------------------ receta
	static void RecipeCheck()
	{
		Recipe.All.Clear();
		var item = (ModItem)Activator.CreateInstance(typeof(SethurSummon));
		item.AddRecipes();
		Check(Recipe.All.Count == 1, "el Ídolo registra exactamente 1 receta");
		var log = Recipe.All[0].Log;
		Console.WriteLine("      receta = [" + string.Join(", ", log) + "]");
		Check(log.Count == 2, "la receta tiene solo 2 elementos: ingredientes + estación");
		Check(log.Contains("Group:" + RecipeGroupID.Wood + "x5"), "5 bloques de madera (grupo de madera: cualquier tipo)");
		Check(log.Contains("Tile:" + TileID.WorkBenches), "estación: mesa de trabajo (WorkBenches)");
		Check(!log.Any(l => l.StartsWith("Item")), "sin ingredientes extra (monedas, objetos de Hardmode, etc.)");
		var s = (ModItem)item;
		s.SetDefaults();
		Check(s.Item.consumable, "es consumible");
		Check(!NPC.AnyNPCs(ModContent.NPCType<SethurBoss>()) && s.CanUseItem(new Player()), "se puede usar si Sethur no existe");
	}

	// ------------------------------------------------------------------------------------------ balance
	static void BalanceCheck()
	{
		foreach (var (name, expert, master, life, def) in new[] { ("Classic", false, false, 45000, 38), ("Expert", true, false, 60000, 46), ("Master", true, true, 90000, 54) })
		{
			Main.expertMode = expert; Main.masterMode = master;
			var npc = new NPC();
			var boss = new SethurBoss { NPC = npc };
			npc.ModNPC = boss;
			boss.SetDefaults();
			npc.life = 0;                                  // el juego aún no ha inicializado la vida
			// simula que el juego ya multiplicó lifeMax por su multiplicador nativo (x2 Expert, x3 Master)
			npc.lifeMax = life * (master ? 3 : expert ? 2 : 1) / (master ? 1 : 1);
			boss.ApplyDifficultyAndPlayerScaling(1, 1f, 1f);
			Check(npc.lifeMax == life && npc.life == life, name + ": vida = " + npc.lifeMax + " (esperado " + life + ")");
			Check(npc.defense == def, name + ": defensa = " + npc.defense);
			boss.ApplyDifficultyAndPlayerScaling(3, 1.4f, 1f);
			Check(npc.lifeMax == (int)(life * 1.4f), name + ": con 3 jugadores aplica solo el factor 'balance' del juego -> " + npc.lifeMax);
		}
		Main.expertMode = false; Main.masterMode = false;
	}

	// ------------------------------------------------------------------------------------------ extra AI
	static void ExtraAiRoundTrip()
	{
		var a = NewBoss(out _);
		var b = NewBoss(out _);
		var f = typeof(SethurBoss).GetFields(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
		void Set(string n, object v) => typeof(SethurBoss).GetField(n, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance).SetValue(a, v);
		Set("lockedTarget", new Vector2(123.5f, -45.25f)); Set("aimAngle", 1.2345f); Set("comboIndex", 5); Set("lastAttack", 7); Set("dashesLeft", 3); Set("sideSign", -1);
		var ms = new MemoryStream();
		a.SendExtraAI(new BinaryWriter(ms));
		ms.Position = 0;
		b.ReceiveExtraAI(new BinaryReader(ms));
		object Get(string n) => typeof(SethurBoss).GetField(n, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance).GetValue(b);
		Check((Vector2)Get("lockedTarget") == new Vector2(123.5f, -45.25f) && (float)Get("aimAngle") == 1.2345f && (int)Get("comboIndex") == 5
			&& (int)Get("lastAttack") == 7 && (int)Get("dashesLeft") == 3 && (int)Get("sideSign") == -1, "los 6 campos extra se envían y reciben idénticos");
	}

	// ------------------------------------------------------------------------------------------ simulación
	static bool staticDone;
	static SethurBoss NewBoss(out NPC npc)
	{
		npc = new NPC { active = true };
		var boss = new SethurBoss { NPC = npc };
		npc.ModNPC = boss;
		npc.type = boss.Type;
		if (!staticDone) { boss.SetStaticDefaults(); staticDone = true; }   // el juego lo llama una sola vez por tipo
		boss.SetDefaults();
		boss.ApplyDifficultyAndPlayerScaling(1, 1f, 1f);
		npc.life = npc.lifeMax;
		return boss;
	}

	static void Simulate(bool multiplayer, int tier, int maxTicks, int dmgPerTick, HashSet<SethurState> seenStates, HashSet<string> seenProjectiles)
	{
		Main.expertMode = tier >= 1; Main.masterMode = tier >= 2;
		Main.maxTilesX = 8400; Main.maxTilesY = 2400;
		Main.tileSolid[1] = true;
		for (int i = 0; i < Main.player.Length; i++) Main.player[i] = new Player { active = false };
		for (int i = 0; i < Main.projectile.Length; i++) Main.projectile[i] = null;
		for (int i = 0; i < Main.npc.Length; i++) Main.npc[i] = null;
		Messages.Clear(); ProjectileSpawns.Clear(); SethurWorldSystem.downedSethur = false;
		var pl = Main.player[0];
		pl.active = true; pl.whoAmI = 0;
		pl.Center = new Vector2(67200f, 15900f);

		Main.netMode = multiplayer ? NetmodeID.Server : NetmodeID.SinglePlayer;
		SethurBoss server = NewBoss(out NPC serverNpc);
		serverNpc.whoAmI = 0; serverNpc.type = server.Type;
		serverNpc.Center = pl.Center + new Vector2(0, -420f);
		Main.npc[0] = serverNpc;
		SethurBoss client = null; NPC clientNpc = null;
		if (multiplayer) { client = NewBoss(out clientNpc); clientNpc.whoAmI = 1; clientNpc.type = client.Type; }

		var stateTicks = new Dictionary<SethurState, int>();
		var stateEntered = new Dictionary<SethurState, int>();
		var firstTickOfPhase = new Dictionary<int, int>();
		var projKinds = new Dictionary<string, int>();
		SethurState prev = SethurState.Dying;
		int clientDesync = 0, tick = 0, maxProj = 0;
		float maxSpeed = 0f;
		bool dead = false;
		var rng = new Random(12345);
		var seq = new List<string>();

		for (tick = 1; tick <= maxTicks * 4 && !dead; tick++)
		{
			Main.GameUpdateCount++;
			// el jugador camina de un lado a otro sobre el suelo
			pl.velocity = new Vector2((float)Math.Sin(tick / 110.0) * 3.2f, 0f);
			pl.position += pl.velocity;
			pl.direction = pl.velocity.X >= 0 ? 1 : -1;

			// --- servidor / un jugador
			Main.netMode = multiplayer ? NetmodeID.Server : NetmodeID.SinglePlayer;
			if (serverNpc.active)
			{
				if (!serverNpc.dontTakeDamage && (tick % 2 == 0))
				{
					serverNpc.life -= dmgPerTick;
					server.HitEffect(new NPC.HitInfo { Damage = dmgPerTick * 2 });
					if (serverNpc.life <= 0) serverNpc.checkDead();
				}
				if (serverNpc.active)
				{
					server.AI();
					server.FindFrame(1);
					serverNpc.position += serverNpc.velocity;
				}
			}
			if (!serverNpc.active) { dead = true; }

			var st = server.State;
			if (st != prev) { stateEntered[st] = stateEntered.GetValueOrDefault(st) + 1; prev = st; if (st != SethurState.Reposition) seq.Add("F" + (server.Phase + 1) + ":" + st); }
			stateTicks[st] = stateTicks.GetValueOrDefault(st) + 1;
			if (!firstTickOfPhase.ContainsKey(server.Phase)) firstTickOfPhase[server.Phase] = tick;
			maxSpeed = Math.Max(maxSpeed, serverNpc.velocity.Length());
			if (float.IsNaN(serverNpc.position.X) || float.IsNaN(serverNpc.position.Y)) throw new Exception("posición NaN en tick " + tick);

			// --- cliente: recibe el estado sincronizado y ejecuta su IA con netMode = cliente
			if (multiplayer && !dead)
			{
				for (int i = 0; i < 4; i++) clientNpc.ai[i] = serverNpc.ai[i];
				clientNpc.life = serverNpc.life; clientNpc.lifeMax = serverNpc.lifeMax;
				clientNpc.position = serverNpc.position; clientNpc.velocity = serverNpc.velocity;
				clientNpc.direction = serverNpc.direction; clientNpc.target = serverNpc.target;
				var ms = new MemoryStream();
				server.SendExtraAI(new BinaryWriter(ms));
				ms.Position = 0;
				client.ReceiveExtraAI(new BinaryReader(ms));
				Main.netMode = NetmodeID.MultiplayerClient;
				client.AI();
				client.FindFrame(1);
				if (client.State != server.State && !(server.State == SethurState.Dying)) clientDesync++;
			}

			// --- proyectiles (los simula el servidor / un jugador; en MP los clientes los ejecutan igual pero aquí basta uno)
			Main.netMode = multiplayer ? NetmodeID.Server : NetmodeID.SinglePlayer;
			int live = 0;
			foreach (var p in Main.ActiveProjectiles.ToList())
			{
				live++;
				p.ModProjectile.AI();
				p.position += p.velocity;
				p.timeLeft--;
				if (p.timeLeft <= 0) p.Kill();
			}
			maxProj = Math.Max(maxProj, live);
		}

		foreach (var sp in ProjectileSpawns)
		{
			string n = StubRegistry.ProjTypes[sp.type - 1].Name;
			projKinds[n] = projKinds.GetValueOrDefault(n) + 1;
		}

		Console.WriteLine("  ticks simulados: " + tick + " | boss muerto: " + dead + " | proyectiles máx. simultáneos: " + maxProj + " | vel. máx. del jefe: " + maxSpeed.ToString("0.0"));
		Console.WriteLine("  estados (entradas): " + string.Join(", ", stateEntered.OrderBy(k => (int)k.Key).Select(k => k.Key + "=" + k.Value)));
		Console.WriteLine("  fase alcanzada por tick: " + string.Join(", ", firstTickOfPhase.OrderBy(k => k.Key).Select(k => "F" + (k.Key + 1) + "@" + k.Value)));
		Console.WriteLine("  proyectiles creados: " + string.Join(", ", projKinds.OrderBy(k => k.Key).Select(k => k.Key + "=" + k.Value)));
		Console.WriteLine("  secuencia: " + string.Join(" ", seq));
		Console.WriteLine("  mensajes: " + string.Join(" | ", Messages));

		Check(dead, "el jefe termina muriendo tras la secuencia de muerte");
		Check(SethurWorldSystem.downedSethur, "OnKill marca la progresión propia (downedSethur) y no toca vanilla");
		Check(stateTicks.GetValueOrDefault(SethurState.Dying) >= SethurBoss.DeathDuration, "pasa >= " + SethurBoss.DeathDuration + " ticks en la animación de muerte antes de morir (muerte en dos tiempos)");
		Check(firstTickOfPhase.Count == 4, "se alcanzan las 4 fases (75%, 40%, 15%)");
		Check(stateEntered.GetValueOrDefault(SethurState.PhaseTransition) == 3, "3 transiciones de fase (una por umbral)");
		foreach (var kv in stateEntered) if (kv.Value > 0) seenStates.Add(kv.Key);
		foreach (var kv in projKinds) seenProjectiles.Add(kv.Key);
		Check(stateEntered.Count(kv => kv.Key >= SethurState.SandColumns && kv.Key <= SethurState.SolarBlasts && kv.Value > 0) >= 7, "en esta corrida se usan al menos 7 de los 9 ataques distintos");
		Check(maxSpeed < 60f, "la velocidad del jefe se mantiene acotada (< 60 px/tick)");
		Check(Messages.Any(m => m.Contains("SethurAwakens")), "muestra el mensaje de inicio del combate");
		Check(Messages.Any(m => m.Contains("SethurPhase4")), "anuncia la fase final");
		if (multiplayer)
		{
			Check(ProjectileSpawns.All(sp => sp.netMode != NetmodeID.MultiplayerClient), "el CLIENTE nunca crea proyectiles (cero duplicados)");
			Check(clientDesync == 0, "el estado del cliente coincide con el del servidor en todos los ticks (desincronizaciones: " + clientDesync + ")");
			Check(Messages.All(m => m.StartsWith("SRV:")), "en servidor los mensajes se emiten por difusión de chat (no por NewText)");
		}
		else
		{
			Check(Messages.All(m => m.StartsWith("SP:")), "en un jugador los mensajes salen por Main.NewText");
		}
	}
}

public static class Program
{
	public static int Main(string[] args) => Harness.RunAll();
}
