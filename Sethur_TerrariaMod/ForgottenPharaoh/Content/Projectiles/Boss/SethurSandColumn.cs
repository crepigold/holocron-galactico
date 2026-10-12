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
	/// Pinchos de arena dorada que brotan del suelo.
	/// ai[0] = retardo (ticks de aviso antes de brotar), ai[1] = edad. Center = punto de contacto con el suelo.
	/// Aviso: runa en el suelo que se intensifica y granos de arena que saltan -> brota -> se derrumba.
	/// </summary>
	public class SethurSandColumn : ModProjectile, ISethurHostile
	{
		private const int Frames = 8;
		private const int FrameW = 64;
		private const int FrameH = 224;
		private static readonly int[] Heights = { 30, 84, 150, 204, 214, 214, 178, 86 };

		public ref float Delay => ref Projectile.ai[0];
		public ref float Age => ref Projectile.ai[1];

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 700;
		}

		public override void SetDefaults()
		{
			Projectile.width = 44;
			Projectile.height = 20;
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
				if (!Main.dedServ && Age % 5f == 0f)
				{
					Dust d = Dust.NewDustPerfect(Projectile.Center + new Vector2(Main.rand.NextFloat(-22f, 22f), -2f), SethurDust.Sand,
						new Vector2(Main.rand.NextFloat(-0.6f, 0.6f), Main.rand.NextFloat(-3f, -1f)), 0, default, 1.1f);
					d.noGravity = true;
				}
				return;
			}

			if (t == 0f)
			{
				if (!Main.dedServ)
					SoundEngine.PlaySound(SoundID.Item45, Projectile.Center);
				SethurHelpers.Shake(Projectile.Center, 4f, 8, 700f);
				SethurHelpers.GoldBurst(Projectile.Center, 10, 5f, 1.5f, SethurDust.Sand);
				SethurHelpers.GoldBurst(Projectile.Center, 6, 5f, 1.4f);
			}

			if (t < 8f) Projectile.frame = (int)(t / 2f);
			else if (t < 30f) Projectile.frame = 4 + ((int)(t / 4f) % 2);
			else if (t < 38f) Projectile.frame = 6;
			else if (t < 46f) Projectile.frame = 7;
			else
			{
				Projectile.Kill();
				return;
			}

			Lighting.AddLight(Projectile.Center - new Vector2(0f, 60f), 0.9f, 0.65f, 0.25f);
		}

		public override bool? CanDamage()
		{
			float t = Age - Delay;
			return (t >= 3f && t < 40f) ? null : false;
		}

		public override void ModifyDamageHitbox(ref Rectangle hitbox)
		{
			int h = (int)(Heights[Utils.Clamp(Projectile.frame, 0, Frames - 1)] * 0.92f);
			hitbox = new Rectangle((int)Projectile.Center.X - 21, (int)Projectile.Center.Y - h, 42, h);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			Vector2 ground = Projectile.Center - Main.screenPosition;
			float t = Age - Delay;
			SpriteBatch sb = Main.spriteBatch;

			if (t < 0f)
			{
				// aviso: runa plana en el suelo que se intensifica
				float k = Utils.Clamp(Age / Delay, 0f, 1f);
				Texture2D ring = SethurAssets.Ring;
				float pulse = 1f + 0.12f * (float)System.Math.Sin(Age * 0.5f);
				sb.Draw(ring, ground, null, SethurHelpers.Additive(SethurHelpers.SunColor, 0.25f + 0.75f * k), 0f, ring.Size() / 2f, new Vector2(0.5f, 0.12f) * pulse, SpriteEffects.None, 0f);
				sb.Draw(ring, ground, null, SethurHelpers.Additive(SethurHelpers.GoldColor, 0.5f * k), 0f, ring.Size() / 2f, new Vector2(0.5f * (1f - k) + 0.2f, 0.12f * (1f - k) + 0.05f), SpriteEffects.None, 0f);
				// pequeño montículo que crece
				Rectangle src0 = new Rectangle(0, 0, FrameW, FrameH);
				sb.Draw(tex, ground, src0, Color.White * (0.35f * k), 0f, new Vector2(FrameW / 2f, FrameH - 4f), 0.5f, SpriteEffects.None, 0f);
				return false;
			}

			Rectangle src = new Rectangle(0, Projectile.frame * FrameH, FrameW, FrameH);
			float fade = t > 36f ? 1f - (t - 36f) / 10f : 1f;
			sb.Draw(tex, ground, src, Color.White * fade, 0f, new Vector2(FrameW / 2f, FrameH - 4f), 1f, SpriteEffects.None, 0f);
			// brillo cálido en la base
			Texture2D glow = SethurAssets.Glow;
			sb.Draw(glow, ground - new Vector2(0f, 8f), null, SethurHelpers.Additive(SethurHelpers.GoldColor, 0.6f * fade), 0f, glow.Size() / 2f, new Vector2(0.9f, 0.4f), SpriteEffects.None, 0f);
			return false;
		}
	}
}
