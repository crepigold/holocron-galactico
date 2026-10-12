using System;
using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.Projectiles.Boss;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.NPCs.Sethur
{
	/// <summary>
	/// Cada ataque tiene una línea de tiempo en ticks que casa con su animación (ver ComputeAnimation) y SIEMPRE
	/// telegrafía antes de hacer daño: postura del jefe + marcas en el suelo / líneas / anillos.
	/// Los proyectiles solo los crea el servidor (o el jugador en solitario) -> nunca hay proyectiles duplicados.
	/// </summary>
	public partial class SethurBoss
	{
		public const int ColumnsDuration = 108;
		public const int DiscsDuration = 78;
		public const int ClawDuration = 58;
		public const int HandsDuration = 112;
		public const int TornadoDuration = 92;
		public const int DashCycle = 70;
		public const int RayChargeEnd = 70;
		public const int RayFireEnd = 170;
		public const int RayDuration = 212;
		public const int ObeliskDuration = 92;
		public const int BlastsDuration = 100;

		private int NewBossProjectile<T>(Vector2 pos, Vector2 vel, int classicDamage, float ai0 = 0f, float ai1 = 0f, float ai2 = 0f) where T : ModProjectile
		{
			return Projectile.NewProjectile(NPC.GetSource_FromAI(), pos, vel, ModContent.ProjectileType<T>(),
				SethurBalance.ProjectileDamage(classicDamage), 0f, Main.myPlayer, ai0, ai1, ai2);
		}

		private void GentleHover(Player player)
		{
			Hover(HoverPoint(player, 250f + 20f * Phase, 165f), 5f * SethurBalance.Speed, 34f);
		}

		// ================================================================== 1. Columnas de arena (fase 1+)
		// Anim SandRain: levanta el báculo (0-24), carga (24-53), golpea (55). Las marcas aparecen en el suelo en el tick 24
		// y las columnas brotan en cadena desde el centro hacia fuera a partir del tick ~66.
		private void DoSandColumns(Player player)
		{
			Timer++;
			FaceTarget(player);
			GentleHover(player);

			if (Timer == 6f)
				Sound(SoundID.Item8);

			if (Timer == 24f && ServerSide)
			{
				int count = Utils.Clamp(5 + Phase + SethurBalance.Tier, 5, 10);
				float spacing = 118f;
				float centerX = player.Center.X + Utils.Clamp(player.velocity.X * 26f, -220f, 220f);
				for (int i = 0; i < count; i++)
				{
					int k = (i + 1) / 2 * (i % 2 == 0 ? -1 : 1);       // 0, -1, +1, -2, +2 ...
					float x = centerX + k * spacing + Main.rand.NextFloat(-14f, 14f);
					Vector2 ground = SethurHelpers.GroundPoint(x, player.Bottom.Y - 24f);
					float delay = 42f + Math.Abs(k) * 5f;              // los más lejanos brotan después: onda hacia fuera
					NewBossProjectile<SethurSandColumn>(ground, Vector2.Zero, SethurBalance.DmgSandColumn, delay);
				}
			}

			if (Timer == 56f)
			{
				// golpe del báculo: polvo y brillo en el orbe
				Sound(SoundID.Item14);
				SethurHelpers.Shake(NPC.Center, 6f, 12);
				SethurHelpers.GoldBurst(GetAnchorWorld(SethurAnimations.AnchorOrb), 14, 6f, 1.5f, SethurDust.Sand);
				SethurHelpers.GoldBurst(GetAnchorWorld(SethurAnimations.AnchorOrb), 8, 5f, 1.4f);
			}

			if (Timer >= ColumnsDuration && ServerSide)
				EndAttack();
		}

		// ================================================================== 2. Discos solares (fase 1+)
		// Anim SolarDisc: el orbe se carga con anillos convergentes (0-32) y se lanza en el tick 33.
		private void DoSolarDiscs(Player player)
		{
			Timer++;
			FaceTarget(player);
			GentleHover(player);

			if (Timer == 5f)
				Sound(SoundID.Item9);

			if (Timer == 33f)
			{
				Sound(SoundID.Item20);
				if (ServerSide)
				{
					Vector2 origin = GetAnchorWorld(SethurAnimations.AnchorOrb);
					int count = Math.Min(8, 3 + Phase + SethurBalance.ExtraProjectiles);
					Vector2 aim = (player.Center - origin).SafeNormalize(Vector2.UnitX * NPC.direction);
					float spread = 0.24f;
					float speed = (7.4f + 0.9f * Phase) * SethurBalance.Speed;
					for (int i = 0; i < count; i++)
					{
						float off = (i - (count - 1) / 2f) * spread;
						NewBossProjectile<SethurSolarDisc>(origin, aim.RotatedBy(off) * speed, SethurBalance.DmgSolarDisc, player.whoAmI);
					}
				}
				SethurHelpers.GoldBurst(GetAnchorWorld(SethurAnimations.AnchorOrb), 14, 6f, 1.5f);
			}

			if (Timer >= DiscsDuration && ServerSide)
				EndAttack();
		}

		// ================================================================== 3. Garras (cuando el jugador se acerca)
		// Anim Claw: preparación (0-25), golpe en el tick 26. El ángulo se fija en el tick 18 (da margen para esquivar).
		private void DoClawStrike(Player player)
		{
			Timer++;
			FaceTarget(player);

			if (Timer < 26f)
			{
				// se coloca a distancia de zarpazo del jugador, siempre desde su lado
				Vector2 toPlayer = (player.Center - NPC.Center).SafeNormalize(Vector2.UnitX * NPC.direction);
				Hover(player.Center - toPlayer * 175f, 11f * SethurBalance.Speed, 16f);

				if (Timer == 18f && ServerSide)
				{
					aimAngle = (player.Center - NPC.Center).ToRotation();
					NPC.netUpdate = true;
				}
			}
			else if (Timer == 26f)
			{
				Vector2 dir = aimAngle.ToRotationVector2();
				NPC.velocity = dir * (12f * SethurBalance.Speed);           // estocada
				Sound(SoundID.Item71);
				SethurHelpers.Shake(NPC.Center, 9f, 14);
				if (ServerSide)
					NewBossProjectile<SethurClawSlash>(NPC.Center + dir * 97f, dir * (13f * SethurBalance.Speed), SethurBalance.DmgClawSlash, aimAngle);
			}
			else
			{
				NPC.velocity *= 0.9f;
			}

			if (Timer >= ClawDuration && ServerSide)
				EndAttack();
		}

		// ================================================================== 4. Manos del desierto (fase 2+)
		private void DoDesertHands(Player player)
		{
			Timer++;
			FaceTarget(player);
			GentleHover(player);

			if (Timer == 6f)
				Sound(SoundID.Item8);

			if (Timer == 24f && ServerSide)
			{
				int count = Utils.Clamp(3 + Phase / 2 + SethurBalance.Tier, 3, 6);
				float centerX = player.Center.X + Utils.Clamp(player.velocity.X * 22f, -180f, 180f);
				for (int i = 0; i < count; i++)
				{
					int k = (i + 1) / 2 * (i % 2 == 0 ? -1 : 1);
					float x = centerX + k * (170f + Main.rand.NextFloat(-20f, 20f));
					Vector2 ground = SethurHelpers.GroundPoint(x, player.Bottom.Y - 24f);
					NewBossProjectile<SethurSandHand>(ground, Vector2.Zero, SethurBalance.DmgSandHand, 46f + i * 7f);
				}
			}

			if (Timer == 58f)
			{
				Sound(SoundID.Item14);
				SethurHelpers.Shake(NPC.Center, 6f, 12);
				SethurHelpers.GoldBurst(GetAnchorWorld(SethurAnimations.AnchorOrb), 14, 6f, 1.5f, SethurDust.Sand);
			}

			if (Timer >= HandsDuration && ServerSide)
				EndAttack();
		}

		// ================================================================== 5. Tornados de arena (fase 2+)
		// Anim Obelisk (brazos en alto). Dos tornados nacen lejos, a ambos lados, y avanzan por el suelo hacia el jugador.
		private void DoSandTornado(Player player)
		{
			Timer++;
			FaceTarget(player);
			GentleHover(player);

			if (Timer == 8f)
				Sound(SoundID.Item8);

			if (Timer == 30f)
			{
				Sound(SoundID.Item45);
				if (ServerSide)
				{
					float speed = (4.0f + 0.7f * Phase) * SethurBalance.Speed;
					int count = SethurBalance.Tier >= 2 ? 3 : 2;
					for (int i = 0; i < count; i++)
					{
						int side = i == 0 ? -1 : (i == 1 ? 1 : (Main.rand.NextBool() ? -1 : 1));
						float dist = i < 2 ? 560f : 900f;
						Vector2 ground = SethurHelpers.GroundPoint(player.Center.X + side * dist, player.Bottom.Y - 24f);
						NewBossProjectile<SethurTornado>(ground, Vector2.Zero, SethurBalance.DmgTornado, -side * speed);
					}
				}
			}

			if (Timer >= TornadoDuration && ServerSide)
				EndAttack();
		}

		// ================================================================== 6. Embestida (fase 2+)
		// Ciclo de 70 ticks: 0-22 se coloca al otro lado; 22 fija el objetivo; 22-40 línea de aviso; 40-62 embestida; 62-70 frena.
		private void DoDash(Player player)
		{
			Timer++;
			if (Timer < 22f)
			{
				FaceTarget(player);
				Hover(player.Center + new Vector2(sideSign * 440f, -90f), 18f * SethurBalance.Speed, 12f);
			}
			else if (Timer == 22f)
			{
				if (ServerSide)
				{
					lockedTarget = SethurHelpers.Predict(player, 12f, 200f);
					aimAngle = (lockedTarget - NPC.Center).ToRotation();
					NPC.netUpdate = true;
				}
			}

			if (Timer >= 22f && Timer < 40f)
				NPC.velocity *= 0.8f;

			if (Timer == 40f)
			{
				Sound(SoundID.Roar);
				float speed = (24f + 2f * Phase) * SethurBalance.Speed;
				NPC.velocity = aimAngle.ToRotationVector2() * speed;
				NPC.direction = NPC.velocity.X >= 0f ? 1 : -1;
			}

			if (Timer >= 40f && Timer < 62f)
			{
				if (Timer % 3f == 0f)
					SethurHelpers.GoldBurst(NPC.Center, 3, 3f, 1.4f, SethurDust.Sand);
			}
			else if (Timer >= 62f)
			{
				NPC.velocity *= 0.82f;
			}

			if (Timer >= DashCycle && ServerSide)
			{
				dashesLeft--;
				if (dashesLeft > 0)
				{
					sideSign = NPC.Center.X < player.Center.X ? -1 : 1;
					Timer = 0f;
					NPC.netUpdate = true;
				}
				else
				{
					EndAttack();
				}
			}
		}

		// ================================================================== 7. Rayo de juicio (fase 3+)
		// Anim SolarRay: carga larga y muy visible (0-70, el orbe crece y aparece la línea de aviso desde el tick 44),
		// el rayo barre durante 100 ticks (70-170) y hay 40 ticks de recuperación.
		private void DoSolarRay(Player player)
		{
			Timer++;
			FaceTarget(player);

			if (Timer < RayChargeEnd)
			{
				if (Timer < 40f)
					Hover(HoverPoint(player, 430f, 120f), 9f * SethurBalance.Speed, 20f);
				else
					NPC.velocity *= 0.9f;

				if (Timer == 6f)
					Sound(SoundID.Item9);

				if (Timer == 44f && ServerSide)
				{
					Vector2 orb = GetAnchorWorld(SethurAnimations.AnchorOrb);
					aimAngle = (player.Center - orb).ToRotation();
					Aux = Main.rand.NextBool() ? 1f : -1f;      // sentido del barrido
					NPC.netUpdate = true;
				}
			}
			else if (Timer == RayChargeEnd)
			{
				Sound(SoundID.Item122);
				SethurHelpers.Shake(NPC.Center, 12f, 22);
				if (ServerSide)
				{
					Vector2 orb = GetAnchorWorld(SethurAnimations.AnchorOrb);
					float sweep = Aux * (0.0105f + 0.0012f * Phase) * SethurBalance.Speed;
					float start = aimAngle - Aux * 0.55f;           // arranca antes del jugador y lo atraviesa
					NewBossProjectile<SethurSolarBeam>(orb, Vector2.Zero, SethurBalance.DmgBeam, NPC.whoAmI, start, sweep);
				}
			}
			else
			{
				NPC.velocity *= 0.92f;
			}

			if (Timer >= RayDuration && ServerSide)
				EndAttack();
		}

		/// <summary>Ángulo inicial y final del barrido, para dibujar la telegrafía.</summary>
		public void GetRaySweep(out float start, out float end)
		{
			float sweep = Aux * (0.0105f + 0.0012f * Phase) * SethurBalance.Speed;
			start = aimAngle - Aux * 0.55f;
			end = start + sweep * SethurBeamDuration;
		}

		public const int SethurBeamDuration = 100;

		// ================================================================== 8. Obeliscos flotantes (fase 3+)
		private void DoObelisks(Player player)
		{
			Timer++;
			FaceTarget(player);
			GentleHover(player);

			if (Timer == 8f)
				Sound(SoundID.Item8);

			if (Timer == 30f)
			{
				Sound(SoundID.Item88);
				if (ServerSide)
				{
					int count = 3 + (Phase >= 3 ? 1 : 0) + (SethurBalance.Tier >= 2 ? 1 : 0);
					for (int i = 0; i < count; i++)
					{
						float t = count == 1 ? 0.5f : i / (float)(count - 1);
						float angle = MathHelper.Lerp(-2.75f, -0.39f, t);     // arco por encima del jugador
						Vector2 pos = player.Center + angle.ToRotationVector2() * (330f + 20f * (i % 2));
						NewBossProjectile<SethurObelisk>(pos, Vector2.Zero, SethurBalance.DmgObeliskBolt, player.whoAmI, i);
					}
				}
			}

			if (Timer >= ObeliskDuration && ServerSide)
				EndAttack();
		}

		// ================================================================== 9. Explosiones solares (fase 3+)
		// Zonas circulares telegrafiadas con anillos: avisan ~55 ticks y luego explotan en cadena. La primera cae sobre
		// la posición prevista del jugador; el resto, repartidas con separación para dejar siempre pasillos seguros.
		private void DoSolarBlasts(Player player)
		{
			Timer++;
			FaceTarget(player);
			GentleHover(player);

			if (Timer == 5f)
				Sound(SoundID.Item9);

			if (Timer == 34f)
			{
				Sound(SoundID.Item20);
				if (ServerSide)
				{
					int count = Utils.Clamp(3 + Phase + SethurBalance.Tier, 4, 8);
					float radius = 108f;
					var centers = new System.Collections.Generic.List<Vector2>();
					centers.Add(SethurHelpers.Predict(player, 26f, 150f));
					int guard = 0;
					while (centers.Count < count && guard++ < 80)
					{
						Vector2 c = player.Center + Main.rand.NextVector2Circular(420f, 220f);
						bool ok = true;
						foreach (Vector2 other in centers)
						{
							if (Vector2.Distance(c, other) < radius * 1.55f)
							{
								ok = false;
								break;
							}
						}
						if (ok)
							centers.Add(c);
					}
					for (int i = 0; i < centers.Count; i++)
						NewBossProjectile<SethurSolarBlast>(centers[i], Vector2.Zero, SethurBalance.DmgSolarBlast, 54f + i * 8f, radius);
				}
			}

			if (Timer >= BlastsDuration && ServerSide)
				EndAttack();
		}
	}
}
