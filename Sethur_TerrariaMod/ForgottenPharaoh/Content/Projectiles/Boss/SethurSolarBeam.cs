using System;
using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.NPCs.Sethur;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Terraria;
using Terraria.Audio;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Boss
{
	/// <summary>
	/// Rayo de juicio. Nace en el orbe del báculo y BARRE un arco: ángulo(t) = ai[1] + ai[2] * t.
	/// ai[0] = índice del NPC Sethur, ai[1] = ángulo inicial (rad), ai[2] = velocidad de barrido (rad/tick, con signo).
	/// Como todo es determinista a partir de esos tres valores y de timeLeft, no hace falta sincronizar nada más.
	/// Usa la textura de efectos del rayo (no tiene sprite propio).
	/// </summary>
	public class SethurSolarBeam : ModProjectile, ISethurHostile
	{
		public override string Texture => "ForgottenPharaoh/Assets/Textures/SethurBeam";

		private const float BeamLength = 1500f;
		private const float BeamWidth = 34f;
		private static int Duration => SethurBoss.SethurBeamDuration;

		private int Elapsed => Duration - Projectile.timeLeft;
		private float Angle => Projectile.ai[1] + Projectile.ai[2] * Elapsed;
		private Vector2 Direction => Angle.ToRotationVector2();

		/// <summary>Anchura relativa: entra en 8 ticks y se cierra en los últimos 12.</summary>
		private float Fade
		{
			get
			{
				int t = Elapsed;
				float f = Utils.Clamp(t / 8f, 0f, 1f);
				if (t > Duration - 12)
					f *= Utils.Clamp((Duration - t) / 12f, 0f, 1f);
				return f;
			}
		}

		public override void SetStaticDefaults()
		{
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 2000;
		}

		public override void SetDefaults()
		{
			Projectile.width = 16;
			Projectile.height = 16;
			Projectile.hostile = true;
			Projectile.friendly = false;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.penetrate = -1;
			Projectile.timeLeft = Duration;
			Projectile.aiStyle = -1;
			CooldownSlot = ImmunityCooldownID.Bosses;
		}

		public override void AI()
		{
			int npcIndex = (int)Projectile.ai[0];
			if (SethurBoss.ProjectilesShouldVanish || npcIndex < 0 || npcIndex >= Main.maxNPCs || !Main.npc[npcIndex].active
				|| !(Main.npc[npcIndex].ModNPC is SethurBoss boss) || boss.State != SethurState.SolarRay)
			{
				Projectile.Kill();
				return;
			}

			// el rayo sigue el orbe del báculo
			Projectile.Center = boss.GetAnchorWorld(SethurAnimations.AnchorOrb);

			if (Elapsed == 1 && !Main.dedServ)
				SoundEngine.PlaySound(SoundID.Item122, Projectile.Center);

			// luz a lo largo del rayo y chispas (poco frecuentes)
			Vector2 dir = Direction;
			for (float d = 0f; d < BeamLength; d += 160f)
				Lighting.AddLight(Projectile.Center + dir * d, 1f * Fade, 0.8f * Fade, 0.35f * Fade);

			if (!Main.dedServ && Elapsed % 2 == 0)
			{
				Vector2 p = Projectile.Center + dir * Main.rand.NextFloat(40f, 900f);
				Dust dust = Dust.NewDustPerfect(p + Main.rand.NextVector2Circular(14f, 14f), SethurDust.Gold, Main.rand.NextVector2Circular(2f, 2f), 0, default, 1.3f);
				dust.noGravity = true;
			}
		}

		public override bool? CanDamage() => Elapsed >= 6 ? null : false;

		public override bool? Colliding(Rectangle projHitbox, Rectangle targetHitbox)
		{
			float w = BeamWidth * Fade;
			if (w < 4f)
				return false;
			float point = 0f;
			Vector2 start = Projectile.Center;
			Vector2 end = start + Direction * BeamLength;
			return Collision.CheckAABBvLineCollision(targetHitbox.TopLeft(), targetHitbox.Size(), start, end, w, ref point);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D beam = SethurAssets.Beam;
			SpriteBatch sb = Main.spriteBatch;
			float fade = Fade;
			if (fade <= 0.01f)
				return false;

			Vector2 start = Projectile.Center - Main.screenPosition;
			float rot = Angle;
			Vector2 dir = Direction;
			float scaleY = BeamWidth * 1.9f * fade / beam.Height;
			float scroll = (Elapsed * 14f) % beam.Width;
			Color color = SethurHelpers.Additive(Color.White, fade);

			for (float x = -scroll; x < BeamLength; x += beam.Width)
			{
				float segStart = Math.Max(0f, x);
				float segEnd = Math.Min(BeamLength, x + beam.Width);
				int srcX = (int)(segStart - x);
				int srcW = (int)(segEnd - segStart);
				if (srcW <= 0)
					continue;
				sb.Draw(beam, start + dir * segStart, new Rectangle(srcX, 0, srcW, beam.Height), color, rot, new Vector2(0f, beam.Height / 2f), new Vector2(1f, scaleY), SpriteEffects.None, 0f);
			}

			// orbe de origen
			Texture2D flare = SethurAssets.Flare;
			float pulse = 1f + 0.15f * (float)Math.Sin(Elapsed * 0.6f);
			sb.Draw(flare, start, null, SethurHelpers.Additive(SethurHelpers.SunColor, fade), Elapsed * 0.08f, flare.Size() / 2f, 1.5f * fade * pulse, SpriteEffects.None, 0f);
			return false;
		}
	}
}
