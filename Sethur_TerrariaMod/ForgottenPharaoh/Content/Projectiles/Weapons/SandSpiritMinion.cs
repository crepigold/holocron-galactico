using System;
using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.Buffs;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.Audio;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Weapons
{
	/// <summary>
	/// Espíritu de Arena: minion volador que flota junto al jugador y dispara proyectiles de arena a los enemigos.
	/// Estructura basada en el minion simple oficial de tModLoader (ExampleSimpleMinion).
	/// Solo el dueño del proyectil crea los disparos (Projectile.owner == Main.myPlayer) -> sin duplicados en multijugador.
	/// </summary>
	public class SandSpiritMinion : ModProjectile
	{
		private const int Frames = 4;
		private const float AttackRange = 700f;
		private const int ShootCooldown = 44;

		public ref float ShootTimer => ref Projectile.localAI[0];

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.MinionTargettingFeature[Type] = true;
			Main.projPet[Type] = true;
			ProjectileID.Sets.MinionSacrificable[Type] = true;
			ProjectileID.Sets.CultistIsResistantTo[Type] = true;
		}

		public sealed override void SetDefaults()
		{
			Projectile.width = 30;
			Projectile.height = 40;
			Projectile.tileCollide = false;
			Projectile.friendly = true;
			Projectile.minion = true;
			Projectile.DamageType = DamageClass.Summon;
			Projectile.minionSlots = 1f;
			Projectile.penetrate = -1;
		}

		public override bool? CanCutTiles() => false;

		public override bool MinionContactDamage() => false;   // no daña por contacto: dispara

		public override void AI()
		{
			Player owner = Main.player[Projectile.owner];
			if (!CheckActive(owner))
				return;

			GeneralBehavior(owner, out Vector2 vectorToIdle, out float distanceToIdle);
			SearchForTargets(owner, out bool foundTarget, out float distanceFromTarget, out Vector2 targetCenter);
			Movement(foundTarget, targetCenter, distanceToIdle, vectorToIdle);
			Shooting(foundTarget, distanceFromTarget, targetCenter);
			Visuals();
		}

		private bool CheckActive(Player owner)
		{
			if (owner.dead || !owner.active)
			{
				owner.ClearBuff(ModContent.BuffType<SandSpiritBuff>());
				return false;
			}
			if (owner.HasBuff(ModContent.BuffType<SandSpiritBuff>()))
				Projectile.timeLeft = 2;
			return true;
		}

		private void GeneralBehavior(Player owner, out Vector2 vectorToIdlePosition, out float distanceToIdlePosition)
		{
			Vector2 idlePosition = owner.Center;
			idlePosition.Y -= 54f;
			idlePosition.X += (14 + Projectile.minionPos * 42) * -owner.direction;

			vectorToIdlePosition = idlePosition - Projectile.Center;
			distanceToIdlePosition = vectorToIdlePosition.Length();

			if (Main.myPlayer == owner.whoAmI && distanceToIdlePosition > 2000f)
			{
				Projectile.position = idlePosition;
				Projectile.velocity *= 0.1f;
				Projectile.netUpdate = true;
			}

			// evita que se solapen con otros minions
			float overlapVelocity = 0.04f;
			foreach (Projectile other in Main.ActiveProjectiles)
			{
				if (other.whoAmI != Projectile.whoAmI && other.owner == Projectile.owner
					&& Math.Abs(Projectile.position.X - other.position.X) + Math.Abs(Projectile.position.Y - other.position.Y) < Projectile.width)
				{
					Projectile.velocity.X += Projectile.position.X < other.position.X ? -overlapVelocity : overlapVelocity;
					Projectile.velocity.Y += Projectile.position.Y < other.position.Y ? -overlapVelocity : overlapVelocity;
				}
			}
		}

		private void SearchForTargets(Player owner, out bool foundTarget, out float distanceFromTarget, out Vector2 targetCenter)
		{
			distanceFromTarget = AttackRange;
			targetCenter = Projectile.position;
			foundTarget = false;

			if (owner.HasMinionAttackTargetNPC)
			{
				NPC npc = Main.npc[owner.MinionAttackTargetNPC];
				float between = Vector2.Distance(npc.Center, Projectile.Center);
				if (between < 2000f)
				{
					distanceFromTarget = between;
					targetCenter = npc.Center;
					foundTarget = true;
				}
			}

			if (!foundTarget)
			{
				foreach (NPC npc in Main.ActiveNPCs)
				{
					if (!npc.CanBeChasedBy())
						continue;
					float between = Vector2.Distance(npc.Center, Projectile.Center);
					bool closest = Vector2.Distance(Projectile.Center, targetCenter) > between;
					bool inRange = between < distanceFromTarget;
					bool lineOfSight = Collision.CanHitLine(Projectile.position, Projectile.width, Projectile.height, npc.position, npc.width, npc.height);
					if (((closest && inRange) || !foundTarget) && lineOfSight)
					{
						distanceFromTarget = between;
						targetCenter = npc.Center;
						foundTarget = true;
					}
				}
			}
		}

		private void Movement(bool foundTarget, Vector2 targetCenter, float distanceToIdlePosition, Vector2 vectorToIdlePosition)
		{
			float speed = 9f;
			float inertia = 22f;

			if (foundTarget)
			{
				// mantiene distancia de tiro (~190 px) sobre el objetivo
				Vector2 desired = targetCenter + new Vector2(Projectile.Center.X < targetCenter.X ? -190f : 190f, -90f);
				Vector2 dir = desired - Projectile.Center;
				if (dir.Length() > 24f)
				{
					dir.Normalize();
					Projectile.velocity = (Projectile.velocity * (inertia - 1f) + dir * speed) / inertia;
				}
				else
				{
					Projectile.velocity *= 0.92f;
				}
			}
			else
			{
				if (distanceToIdlePosition > 600f)
				{
					speed = 12f;
					inertia = 60f;
				}
				else
				{
					speed = 4f;
					inertia = 80f;
				}

				if (distanceToIdlePosition > 20f)
				{
					vectorToIdlePosition.Normalize();
					vectorToIdlePosition *= speed;
					Projectile.velocity = (Projectile.velocity * (inertia - 1f) + vectorToIdlePosition) / inertia;
				}
				else if (Projectile.velocity == Vector2.Zero)
				{
					Projectile.velocity.X = -0.15f;
					Projectile.velocity.Y = -0.05f;
				}
			}
		}

		private void Shooting(bool foundTarget, float distanceFromTarget, Vector2 targetCenter)
		{
			ShootTimer++;
			if (!foundTarget || ShootTimer < ShootCooldown || distanceFromTarget > AttackRange)
				return;

			ShootTimer = 0f;
			if (Projectile.owner == Main.myPlayer)
			{
				Vector2 vel = (targetCenter - Projectile.Center).SafeNormalize(Vector2.UnitX) * 12f;
				Projectile.NewProjectile(Projectile.GetSource_FromThis(), Projectile.Center, vel, ModContent.ProjectileType<SandSpiritBolt>(),
					Projectile.damage, Projectile.knockBack, Projectile.owner);
			}
			if (!Main.dedServ)
				SoundEngine.PlaySound(SoundID.Item17, Projectile.Center);
		}

		private void Visuals()
		{
			Projectile.rotation = Projectile.velocity.X * 0.03f;
			Projectile.spriteDirection = Projectile.velocity.X >= 0f ? 1 : -1;

			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 6)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}

			Lighting.AddLight(Projectile.Center, 0.6f, 0.45f, 0.18f);
			if (!Main.dedServ && Main.rand.NextBool(8))
			{
				Dust d = Dust.NewDustPerfect(Projectile.Bottom + new Vector2(Main.rand.NextFloat(-8f, 8f), -6f), SethurDust.Sand, new Vector2(0f, 0.6f), 0, default, 1f);
				d.noGravity = true;
			}
		}
	}
}
