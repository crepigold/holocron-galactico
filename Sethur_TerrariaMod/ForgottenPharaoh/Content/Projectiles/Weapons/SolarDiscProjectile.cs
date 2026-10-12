using ForgottenPharaoh.Common.Utilities;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Terraria;
using Terraria.GameContent;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Weapons
{
	/// <summary>Disco solar lanzado por el jugador: vuela como un bumerán (IA vanilla de bumerán) y regresa a su mano.</summary>
	public class SolarDiscProjectile : ModProjectile
	{
		private const int Frames = 4;

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.TrailCacheLength[Type] = 6;
			ProjectileID.Sets.TrailingMode[Type] = 2;
		}

		public override void SetDefaults()
		{
			Projectile.width = 30;
			Projectile.height = 30;
			Projectile.friendly = true;
			Projectile.hostile = false;
			Projectile.DamageType = DamageClass.Ranged;
			Projectile.penetrate = -1;
			Projectile.aiStyle = ProjAIStyleID.Boomerang;
			AIType = ProjectileID.EnchantedBoomerang;
			Projectile.tileCollide = true;
			Projectile.usesLocalNPCImmunity = true;
			Projectile.localNPCHitCooldown = 12;
		}

		public override void AI()
		{
			// la IA de bumerán de vanilla gestiona el vuelo y el regreso; aquí solo la animación y el brillo
			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 3)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}
			Lighting.AddLight(Projectile.Center, 0.9f, 0.7f, 0.25f);
			if (!Main.dedServ && Main.rand.NextBool(4))
			{
				Dust d = Dust.NewDustPerfect(Projectile.Center, SethurDust.Gold, Main.rand.NextVector2Circular(1f, 1f), 0, default, 1.1f);
				d.noGravity = true;
			}
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			int fh = tex.Height / Frames;
			Rectangle src = new Rectangle(0, Projectile.frame * fh, tex.Width, fh);
			Vector2 origin = new Vector2(tex.Width / 2f, fh / 2f);
			SpriteBatch sb = Main.spriteBatch;
			for (int i = Projectile.oldPos.Length - 1; i >= 1; i--)
			{
				if (Projectile.oldPos[i] == Vector2.Zero)
					continue;
				float k = 1f - i / (float)Projectile.oldPos.Length;
				sb.Draw(tex, Projectile.oldPos[i] + Projectile.Size / 2f - Main.screenPosition, src, SethurHelpers.Additive(SethurHelpers.GoldColor, 0.45f * k), Projectile.rotation, origin, 0.7f + 0.3f * k, SpriteEffects.None, 0f);
			}
			sb.Draw(tex, Projectile.Center - Main.screenPosition, src, Color.White, Projectile.rotation, origin, 1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
