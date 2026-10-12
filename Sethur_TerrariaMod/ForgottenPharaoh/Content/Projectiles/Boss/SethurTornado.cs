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
	/// Tornado de arena que avanza pegado al suelo. ai[0] = velocidad horizontal con signo, ai[1] = edad.
	/// Nace pequeño y sin daño (24 ticks), crece, avanza ~5 segundos y se disipa.
	/// </summary>
	public class SethurTornado : ModProjectile, ISethurHostile
	{
		private const int Frames = 8;
		private const int FrameW = 80;
		private const int FrameH = 144;
		private const int Lifetime = 360;

		public ref float Speed => ref Projectile.ai[0];
		public ref float Age => ref Projectile.ai[1];

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 400;
		}

		public override void SetDefaults()
		{
			Projectile.width = 50;
			Projectile.height = 130;
			Projectile.hostile = true;
			Projectile.friendly = false;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.penetrate = -1;
			Projectile.timeLeft = Lifetime + 10;
			Projectile.aiStyle = -1;
			CooldownSlot = ImmunityCooldownID.Bosses;
		}

		private float Grow
		{
			get
			{
				float g = Utils.Clamp(Age / 30f, 0.15f, 1f);
				if (Age > Lifetime - 24f)
					g *= Utils.Clamp((Lifetime - Age) / 24f, 0f, 1f);
				return g;
			}
		}

		public override void AI()
		{
			if (SethurBoss.ProjectilesShouldVanish)
			{
				Projectile.Kill();
				return;
			}

			Age++;
			if (Age == 1f && !Main.dedServ)
				SoundEngine.PlaySound(SoundID.Item45, Projectile.Center);
			if (Age >= Lifetime)
			{
				Projectile.Kill();
				return;
			}

			// avanza en horizontal y se pega al suelo
			Projectile.velocity = new Vector2(Speed * Utils.Clamp(Age / 30f, 0.3f, 1f), 0f);
			Vector2 g = SethurHelpers.GroundPoint(Projectile.Center.X, Projectile.Bottom.Y - 60f);
			float targetY = g.Y - Projectile.height + 4f;
			Projectile.position.Y += (targetY - Projectile.position.Y) * 0.25f;

			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 3)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}

			if (!Main.dedServ && Age % 4f == 0f)
			{
				Dust d = Dust.NewDustPerfect(Projectile.Bottom + new Vector2(Main.rand.NextFloat(-30f, 30f), -4f), SethurDust.Sand,
					new Vector2(-Speed * 0.3f, Main.rand.NextFloat(-3f, -1f)), 0, default, 1.2f);
				d.noGravity = true;
			}
			Lighting.AddLight(Projectile.Center, 0.5f, 0.38f, 0.15f);
		}

		public override bool? CanDamage() => Age >= 24f ? null : false;

		public override void ModifyDamageHitbox(ref Rectangle hitbox)
		{
			float g = Grow;
			int w = (int)(50f * g);
			int h = (int)(130f * g);
			hitbox = new Rectangle((int)Projectile.Center.X - w / 2, (int)Projectile.Bottom.Y - h, w, h);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			Rectangle src = new Rectangle(0, Projectile.frame * FrameH, FrameW, FrameH);
			float g = Grow;
			Vector2 pos = new Vector2(Projectile.Center.X, Projectile.Bottom.Y + 2f) - Main.screenPosition;
			Main.spriteBatch.Draw(tex, pos, src, Color.White * (0.35f + 0.65f * g), 0f, new Vector2(FrameW / 2f, FrameH - 6f), g, Projectile.velocity.X < 0f ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0f);
			return false;
		}
	}
}
