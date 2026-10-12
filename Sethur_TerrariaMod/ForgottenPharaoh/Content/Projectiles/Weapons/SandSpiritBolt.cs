using ForgottenPharaoh.Common.Utilities;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Terraria;
using Terraria.GameContent;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Weapons
{
	/// <summary>Proyectil de arena disparado por el Espíritu de Arena (minion).</summary>
	public class SandSpiritBolt : ModProjectile
	{
		private const int Frames = 4;

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
		}

		public override void SetDefaults()
		{
			Projectile.width = 12;
			Projectile.height = 12;
			Projectile.friendly = true;
			Projectile.hostile = false;
			Projectile.DamageType = DamageClass.Summon;
			Projectile.penetrate = 2;
			Projectile.timeLeft = 110;
			Projectile.extraUpdates = 1;
			Projectile.tileCollide = true;
			Projectile.ignoreWater = true;
			Projectile.aiStyle = -1;
		}

		public override void AI()
		{
			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 4)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}
			Projectile.rotation = Projectile.velocity.ToRotation();
			Lighting.AddLight(Projectile.Center, 0.5f, 0.38f, 0.15f);
			if (!Main.dedServ && Main.rand.NextBool(3))
			{
				Dust d = Dust.NewDustPerfect(Projectile.Center, SethurDust.Sand, Projectile.velocity * -0.1f, 0, default, 1f);
				d.noGravity = true;
			}
		}

		public override void OnKill(int timeLeft)
		{
			if (Main.dedServ)
				return;
			SethurHelpers.GoldBurst(Projectile.Center, 6, 3f, 1.1f, SethurDust.Sand);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			int fh = tex.Height / Frames;
			Rectangle src = new Rectangle(0, Projectile.frame * fh, tex.Width, fh);
			Main.spriteBatch.Draw(tex, Projectile.Center - Main.screenPosition, src, Color.White, Projectile.rotation, new Vector2(tex.Width / 2f, fh / 2f), 1.1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
