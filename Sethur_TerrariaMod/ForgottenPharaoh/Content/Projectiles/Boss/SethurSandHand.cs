using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.NPCs.Sethur;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Terraria;
using Terraria.Audio;
using Terraria.GameContent;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Boss
{
	/// <summary>
	/// Mano de arena gigante que emerge del suelo, se cierra y se deshace.
	/// ai[0] = retardo de aviso, ai[1] = edad. Center = punto de contacto con el suelo.
	/// Solo hace daño mientras agarra (fotogramas 3-5).
	/// </summary>
	public class SethurSandHand : ModProjectile, ISethurHostile
	{
		private const int Frames = 8;
		private const int FrameW = 96;
		private const int FrameH = 112;

		public ref float Delay => ref Projectile.ai[0];
		public ref float Age => ref Projectile.ai[1];

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 500;
		}

		public override void SetDefaults()
		{
			Projectile.width = 56;
			Projectile.height = 24;
			Projectile.hostile = true;
			Projectile.friendly = false;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.penetrate = -1;
			Projectile.timeLeft = 400;
			Projectile.aiStyle = -1;
			CooldownSlot = ImmunityCooldownID.Bosses;
		}

		public override void AI()
		{
			if (SethurBoss.ProjectilesShouldVanish)
			{
				Projectile.Kill();
				return;
			}

			Age++;
			Projectile.timeLeft = 5;
			float t = Age - Delay;

			if (t < 0f)
			{
				Projectile.frame = 0;
				if (!Main.dedServ && Age % 6f == 0f)
				{
					Dust d = Dust.NewDustPerfect(Projectile.Center + new Vector2(Main.rand.NextFloat(-26f, 26f), -2f), SethurDust.Sand,
						new Vector2(Main.rand.NextFloat(-0.5f, 0.5f), Main.rand.NextFloat(-2.5f, -0.8f)), 0, default, 1.2f);
					d.noGravity = true;
				}
				return;
			}

			if (t == 0f)
			{
				if (!Main.dedServ)
					SoundEngine.PlaySound(SoundID.Item70, Projectile.Center);
				SethurHelpers.GoldBurst(Projectile.Center, 12, 5f, 1.5f, SethurDust.Sand);
			}

			if (t < 10f) Projectile.frame = Utils.Clamp((int)(t / 2.5f), 0, 3);
			else if (t < 32f) Projectile.frame = t < 18f ? 3 : (t < 24f ? 4 : 5);
			else if (t < 40f) Projectile.frame = 6;
			else if (t < 48f) Projectile.frame = 7;
			else
			{
				Projectile.Kill();
				return;
			}

			if (t == 18f)
				SethurHelpers.Shake(Projectile.Center, 5f, 8, 700f);
		}

		public override bool? CanDamage()
		{
			float t = Age - Delay;
			return (t >= 8f && t < 32f) ? null : false;
		}

		public override void ModifyDamageHitbox(ref Rectangle hitbox)
		{
			float t = Age - Delay;
			int h = t < 14f ? 70 : 96;
			hitbox = new Rectangle((int)Projectile.Center.X - 30, (int)Projectile.Center.Y - h, 60, h);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			Vector2 ground = Projectile.Center - Main.screenPosition;
			float t = Age - Delay;
			SpriteBatch sb = Main.spriteBatch;

			if (t < 0f)
			{
				float k = Utils.Clamp(Age / Delay, 0f, 1f);
				Texture2D ring = SethurAssets.Ring;
				float pulse = 1f + 0.12f * (float)System.Math.Sin(Age * 0.45f);
				sb.Draw(ring, ground, null, SethurHelpers.Additive(SethurHelpers.SunColor, 0.25f + 0.75f * k), 0f, ring.Size() / 2f, new Vector2(0.62f, 0.15f) * pulse, SpriteEffects.None, 0f);
				sb.Draw(ring, ground, null, SethurHelpers.Additive(SethurHelpers.GoldColor, 0.5f * k), 0f, ring.Size() / 2f, new Vector2(0.62f * (1f - k) + 0.25f, 0.15f * (1f - k) + 0.06f), SpriteEffects.None, 0f);
				return false;
			}

			Rectangle src = new Rectangle(0, Projectile.frame * FrameH, FrameW, FrameH);
			float fade = t > 40f ? 1f - (t - 40f) / 8f : 1f;
			sb.Draw(tex, ground, src, Color.White * fade, 0f, new Vector2(FrameW / 2f, FrameH - 3f), 1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
