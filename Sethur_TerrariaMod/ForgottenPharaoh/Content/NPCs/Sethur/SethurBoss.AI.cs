using System;
using System.Collections.Generic;
using ForgottenPharaoh.Common.Utilities;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.Audio;
using Terraria.ID;

namespace ForgottenPharaoh.Content.NPCs.Sethur
{
	public partial class SethurBoss
	{
		// ================================================================== estado sincronizado (NPC.ai)
		public SethurState State
		{
			get => (SethurState)(int)NPC.ai[0];
			set => NPC.ai[0] = (int)value;
		}

		/// <summary>Ticks transcurridos dentro del estado actual.</summary>
		public ref float Timer => ref NPC.ai[1];

		/// <summary>Fase de combate 0..3 (1: despertar, 2: tormenta, 3: juicio solar, 4: dios olvidado).</summary>
		public int Phase
		{
			get => (int)NPC.ai[2];
			set => NPC.ai[2] = value;
		}

		/// <summary>Parámetro auxiliar del estado: fase destino en la transición, sentido del barrido del rayo, etc.</summary>
		public ref float Aux => ref NPC.ai[3];

		// ================================================================== datos extra sincronizados (SendExtraAI)
		private Vector2 lockedTarget;   // punto fijado (embestida)
		private float aimAngle;         // ángulo fijado (garras, rayo, embestida)
		private int comboIndex;         // posición en la secuencia final (fase 4)
		private int lastAttack;         // último ataque, para no repetir
		private int dashesLeft;         // embestidas restantes
		private int sideSign = 1;       // lado del jugador en el que flota el jefe (+1 derecha, -1 izquierda)

		// ================================================================== datos locales (solo visuales / temporizadores propios)
		private int clawCooldown;

		private bool ServerSide => Main.netMode != NetmodeID.MultiplayerClient;

		private static readonly SethurState[] FinalSequence =
		{
			SethurState.SolarDiscs, SethurState.SolarBlasts, SethurState.Dash, SethurState.SolarRay,
			SethurState.Obelisks, SethurState.SandColumns, SethurState.DesertHands, SethurState.SandTornado
		};

		/// <summary>El daño por contacto solo existe en los instantes de garra y embestida (todo lo demás es telegrafiado).</summary>
		public bool ContactDamageActive
		{
			get
			{
				switch (State)
				{
					case SethurState.ClawStrike: return Timer >= 26f && Timer < 38f;
					case SethurState.Dash: return Timer >= 40f && Timer < 64f;
					default: return false;
				}
			}
		}

		// ================================================================== bucle principal
		public override void AI()
		{
			animTick++;
			if (hitFlash > 0) hitFlash--;
			if (hurtTicks > 0) hurtTicks--;
			if (hurtCooldown > 0) hurtCooldown--;
			if (turnTicks > 0) turnTicks--;
			if (clawCooldown > 0) clawCooldown--;

			if (State == SethurState.Dying)
			{
				DoDying();
				ComputeAnimation();
				return;
			}

			// Objetivo: lo primero que debe hacer toda IA de jefe
			if (NPC.target < 0 || NPC.target >= 255 || Main.player[NPC.target].dead || !Main.player[NPC.target].active)
				NPC.TargetClosest();

			Player player = Main.player[NPC.target];
			if (player.dead || !player.active)
			{
				Despawn();
				ComputeAnimation();
				return;
			}

			NPC.dontTakeDamage = State == SethurState.Intro || State == SethurState.PhaseTransition;

			if (ServerSide)
				CheckPhase();

			switch (State)
			{
				case SethurState.Intro: DoIntro(player); break;
				case SethurState.Reposition: DoReposition(player); break;
				case SethurState.SandColumns: DoSandColumns(player); break;
				case SethurState.SolarDiscs: DoSolarDiscs(player); break;
				case SethurState.ClawStrike: DoClawStrike(player); break;
				case SethurState.DesertHands: DoDesertHands(player); break;
				case SethurState.SandTornado: DoSandTornado(player); break;
				case SethurState.Dash: DoDash(player); break;
				case SethurState.SolarRay: DoSolarRay(player); break;
				case SethurState.Obelisks: DoObelisks(player); break;
				case SethurState.SolarBlasts: DoSolarBlasts(player); break;
				case SethurState.PhaseTransition: DoPhaseTransition(player); break;
			}

			NPC.spriteDirection = NPC.direction;
			AmbientEffects();
			ComputeAnimation();
		}

		private void Despawn()
		{
			// Todos los jugadores han muerto: el jefe se retira hacia el cielo
			NPC.velocity.Y -= 0.35f;
			NPC.dontTakeDamage = true;
			NPC.EncourageDespawn(60);
		}

		// ================================================================== fases
		private void CheckPhase()
		{
			if (State == SethurState.PhaseTransition || State == SethurState.Intro || State == SethurState.Dying)
				return;

			float ratio = NPC.life / (float)NPC.lifeMax;
			int wanted = ratio <= SethurBalance.Phase4Threshold ? 3
				: ratio <= SethurBalance.Phase3Threshold ? 2
				: ratio <= SethurBalance.Phase2Threshold ? 1 : 0;

			if (wanted > Phase)
				StartTransition(wanted);
		}

		private void StartTransition(int newPhase)
		{
			SetState(SethurState.PhaseTransition);
			Aux = newPhase;                          // fase destino
			dashesLeft = 0;
			SethurHelpers.ClearBossProjectiles(Mod); // además, cada proyectil se elimina solo (ver SethurBoss.ProjectilesShouldVanish)
		}

		/// <summary>Cambia de estado y sincroniza. Solo debe llamarse en servidor / un jugador.</summary>
		private void SetState(SethurState s)
		{
			State = s;
			Timer = 0f;
			NPC.netUpdate = true;
		}

		private void EndAttack()
		{
			SetState(SethurState.Reposition);
		}

		// ================================================================== utilidades de movimiento
		/// <summary>Vuela suavemente hacia un punto (aceleración por inercia, velocidad limitada).</summary>
		private void Hover(Vector2 target, float maxSpeed, float inertia)
		{
			Vector2 to = target - NPC.Center;
			float dist = to.Length();
			Vector2 desired = dist > 1f ? to / dist * Math.Min(maxSpeed, dist * 0.09f) : Vector2.Zero;
			NPC.velocity = (NPC.velocity * (inertia - 1f) + desired) / inertia;
		}

		private float PhaseSpeed => (10f + 2.6f * Phase) * SethurBalance.Speed;
		private float PhaseInertia => 24f - 3.5f * Phase;

		private Vector2 HoverPoint(Player player, float sideDistance, float height)
		{
			return player.Center + new Vector2(sideSign * sideDistance, -height);
		}

		/// <summary>Orienta al jefe hacia el jugador con histéresis (evita parpadeos al cruzarse).</summary>
		private void FaceTarget(Player player)
		{
			float dx = player.Center.X - NPC.Center.X;
			if (Math.Abs(dx) > 56f)
			{
				int dir = dx > 0f ? 1 : -1;
				if (dir != NPC.direction)
				{
					if (State == SethurState.Reposition && turnTicks <= 0)
					{
						turnTicks = 16;
						turnToRight = dir > 0;
					}
					NPC.direction = dir;
				}
			}
		}

		private void Sound(SoundStyle style)
		{
			if (!Main.dedServ)
				SoundEngine.PlaySound(style, NPC.Center);
		}

		// ================================================================== introducción
		private void DoIntro(Player player)
		{
			Timer++;
			NPC.velocity *= 0.95f;
			NPC.alpha = (int)(255f * (1f - MathHelper.SmoothStep(0f, 1f, Timer / 60f)));
			NPC.direction = player.Center.X >= NPC.Center.X ? 1 : -1;

			if (Timer == 1f)
			{
				if (ServerSide)
					SethurHelpers.Announce("Mods.ForgottenPharaoh.Messages.SethurAwakens", SethurHelpers.GoldColor);
				Sound(SoundID.Roar);
				SethurHelpers.Shake(NPC.Center, 14f, 26);
			}

			if (Timer < 60f && Timer % 4f == 0f)
			{
				SethurHelpers.GoldBurst(NPC.Bottom + new Vector2(Main.rand.NextFloat(-30f, 30f), 20f), 4, 3f, 1.4f, SethurDust.Sand);
				SethurHelpers.GoldBurst(NPC.Center + Main.rand.NextVector2Circular(40f, 70f), 2, 2f, 1.2f);
			}

			if (Timer >= 84f)
			{
				NPC.alpha = 0;
				if (ServerSide)
				{
					sideSign = player.Center.X > NPC.Center.X ? -1 : 1;
					SetState(SethurState.Reposition);
				}
			}
		}

		// ================================================================== flotar / elegir ataque
		private int RestTicks()
		{
			if (lastAttack == 0)
				return 70;                                   // primer descanso tras aparecer o tras una transición de fase
			if (Phase >= 3 && comboIndex == 0 && lastAttack != 0)
				return SethurBalance.FinalSequenceRest;   // tras la secuencia final: ventana de descanso
			return Math.Max(10, (int)(SethurBalance.BaseRest[Math.Min(Phase, 3)] * SethurBalance.RestScale));
		}

		private void DoReposition(Player player)
		{
			Timer++;
			FaceTarget(player);

			// cambia de lado de vez en cuando (desplazamiento lateral y cambio de dirección)
			if (ServerSide && Timer % 170f == 169f)
			{
				sideSign = -sideSign;
				NPC.netUpdate = true;
			}

			Hover(HoverPoint(player, 300f + 36f * Phase, 150f + 18f * Phase), PhaseSpeed, PhaseInertia);

			// Si el jugador se acerca demasiado: zarpazo (con enfriamiento)
			if (ServerSide && Timer > 22f && clawCooldown <= 0 && Vector2.Distance(NPC.Center, player.Center) < 230f)
			{
				StartAttack(SethurState.ClawStrike);
				return;
			}

			if (ServerSide && Timer >= RestTicks())
				ChooseAttack(player);
		}

		private void ChooseAttack(Player player)
		{
			SethurState next;
			if (Phase >= 3)
			{
				// Fase final: secuencia fija encadenada con descansos mínimos
				next = FinalSequence[comboIndex % FinalSequence.Length];
				comboIndex = (comboIndex + 1) % FinalSequence.Length;
				if (next == SethurState.Obelisks && ObeliskCount() > 0)
					next = SethurState.SolarBlasts;
			}
			else
			{
				var pool = new List<SethurState>
				{
					SethurState.SandColumns, SethurState.SolarDiscs
				};
				float dist = Vector2.Distance(NPC.Center, player.Center);
				if (dist < 320f && clawCooldown <= 0)
				{
					pool.Add(SethurState.ClawStrike);
					pool.Add(SethurState.ClawStrike);
				}
				if (Phase >= 1)
				{
					pool.Add(SethurState.DesertHands);
					pool.Add(SethurState.SandTornado);
					pool.Add(SethurState.Dash);
					pool.Add(SethurState.Dash);
				}
				if (Phase >= 2)
				{
					pool.Add(SethurState.SolarRay);
					pool.Add(SethurState.SolarBlasts);
					if (ObeliskCount() == 0)
					{
						pool.Add(SethurState.Obelisks);
						pool.Add(SethurState.Obelisks);
					}
				}

				// no repetir el último ataque si hay alternativas
				var filtered = pool.FindAll(s => (int)s != lastAttack);
				if (filtered.Count > 0)
					pool = filtered;
				next = pool[Main.rand.Next(pool.Count)];
			}

			StartAttack(next);
		}

		private void StartAttack(SethurState s)
		{
			lastAttack = (int)s;
			if (s == SethurState.Dash)
				dashesLeft = Math.Min(4, 2 + Phase);
			if (s == SethurState.ClawStrike)
				clawCooldown = 160;
			SetState(s);
		}

		private int ObeliskCount()
		{
			return CountProjectiles<Projectiles.Boss.SethurObelisk>();
		}

		private static int CountProjectiles<T>() where T : Terraria.ModLoader.ModProjectile
		{
			int type = Terraria.ModLoader.ModContent.ProjectileType<T>();
			int n = 0;
			foreach (Projectile p in Main.ActiveProjectiles)
			{
				if (p.type == type)
					n++;
			}
			return n;
		}

		// ================================================================== transición de fase
		private const int TransitionDuration = 96;

		private void DoPhaseTransition(Player player)
		{
			Timer++;
			NPC.velocity *= 0.9f;
			FaceTarget(player);

			if (Timer == 1f)
			{
				Sound(SoundID.Roar);
				SethurHelpers.Shake(NPC.Center, 10f, 24);
			}
			if (Timer < 40f && Timer % 3f == 0f)
				SethurHelpers.DustRing(NPC.Center, 90f - Timer * 1.6f, 10, SethurDust.Gold, -2.2f, 1.2f);

			if (Timer == 40f)
			{
				// estallido: onda de choque de polvo dorado (y azul en la fase final)
				Sound(SoundID.Item122);
				SethurHelpers.Shake(NPC.Center, 24f, 34);
				int dust = (int)Aux >= 3 ? SethurDust.Blue : SethurDust.Gold;
				for (int ring = 0; ring < 3; ring++)
					SethurHelpers.DustRing(NPC.Center, 20f, 36, ring == 1 ? dust : SethurDust.Gold, 6f + ring * 4f, 1.7f);
				SethurHelpers.GoldBurst(NPC.Center, 40, 12f, 1.8f, SethurDust.Sand);
				if (ServerSide)
					SethurHelpers.Announce("Mods.ForgottenPharaoh.Messages.SethurPhase" + ((int)Aux + 1), (int)Aux >= 3 ? SethurHelpers.BlueColor : SethurHelpers.GoldColor);
			}

			if (Timer >= TransitionDuration && ServerSide)
			{
				Phase = (int)Aux;
				sideSign = player.Center.X > NPC.Center.X ? -1 : 1;
				comboIndex = 0;
				lastAttack = 0;
				SetState(SethurState.Reposition);
			}
		}

		// ================================================================== muerte
		public const int DeathDuration = 150;

		private void DoDying()
		{
			Timer++;
			NPC.dontTakeDamage = true;
			NPC.damage = 0;
			NPC.velocity = Vector2.Lerp(NPC.velocity, new Vector2(0f, 0.5f), 0.05f);

			if (Timer == 1f)
			{
				Sound(SoundID.Roar);
				SethurHelpers.Shake(NPC.Center, 18f, 40);
			}

			// convulsión: ráfagas de polvo dorado; después, desintegración progresiva
			if (!Main.dedServ && Timer % 5f == 0f)
			{
				float spread = 30f + Timer * 0.5f;
				SethurHelpers.GoldBurst(NPC.Center + Main.rand.NextVector2Circular(spread, spread * 1.3f), Timer < 60f ? 4 : 8, 4f + Timer * 0.04f, 1.4f);
				if (Timer > 50f)
					SethurHelpers.GoldBurst(NPC.Center + Main.rand.NextVector2Circular(60f, 90f), 5, 3f, 1.3f, SethurDust.Sand);
			}
			if (Timer % 24f == 0f && Timer < 120f)
			{
				Sound(SoundID.Item14);
				SethurHelpers.Shake(NPC.Center, 8f, 12);
			}

			if (Timer >= DeathDuration - 2)
			{
				SethurHelpers.GoldBurst(NPC.Center, 70, 14f, 2f);
				SethurHelpers.GoldBurst(NPC.Center, 40, 9f, 1.8f, SethurDust.Sand);
				SethurHelpers.DustRing(NPC.Center, 24f, 40, SethurDust.Gold, 8f, 1.8f);
			}

			if (Timer >= DeathDuration && ServerSide)
			{
				// Muerte real: CheckDead devuelve true porque Aux = 1
				Aux = 1f;
				NPC.dontTakeDamage = false;
				NPC.life = 0;
				NPC.checkDead();
			}
		}

		// ================================================================== vanish de proyectiles ligados al jefe
		private static uint vanishTick = uint.MaxValue;
		private static bool vanishValue;

		/// <summary>
		/// Verdadero si los proyectiles hostiles de Sethur deben desaparecer: no hay jefe vivo, está transformándose o muriendo.
		/// Cada máquina lo evalúa por su cuenta (sin paquetes extra) y se cachea una vez por tick.
		/// </summary>
		public static bool ProjectilesShouldVanish
		{
			get
			{
				if (vanishTick == Main.GameUpdateCount)
					return vanishValue;
				vanishTick = Main.GameUpdateCount;
				bool found = false;
				bool vanish = false;
				foreach (NPC n in Main.ActiveNPCs)
				{
					if (n.ModNPC is SethurBoss boss)
					{
						found = true;
						if (boss.State == SethurState.PhaseTransition || boss.State == SethurState.Dying)
							vanish = true;
					}
				}
				vanishValue = !found || vanish;
				return vanishValue;
			}
		}
	}
}
