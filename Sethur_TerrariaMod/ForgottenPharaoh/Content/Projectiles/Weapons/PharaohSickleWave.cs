using ForgottenPharaoh.Common.Utilities;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Terraria;
using Terraria.GameContent;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Weapons
{
	/// <summary>Onda creciente dorada lanzada por la Hoz del Faraón al blandirla. Atraviesa hasta 3 enemigos.</summary>
	public class PharaohSickleWave : ModProjectile
	{
		private const int Frames = 4;
		private const int Lifetime = 34;

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
		}

		public override void SetDefaults()
		{
			Projectile.width = 60;
			Projectile.height = 60;
			Projectile.friendly = true;
			Projectile.hostile = false;
			Projectile.DamageType = DamageClass.Melee;
			Projectile.penetrate = 3;
			Projectile.timeLeft = Lifetime;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.extraUpdates = 1;
			Projectile.aiStyle = -1;
			Projectile.usesLocalNPCImmunity = true;
			Projectile.localNPCHitCooldown = 16;
		}

		public override void AI()
		{
			Projectile.rotation = Projectile.velocity.ToRotation();
			Projectile.frame = Utils.Clamp((int)((Lifetime - Projectile.timeLeft) * Frames / (float)Lifetime), 0, Frames - 1);
			Projectile.velocity *= 0.99f;
			Lighting.AddLight(Projectile.Center, 0.8f, 0.6f, 0.2f);
			if (!Main.dedServ && Main.rand.NextBool(3))
			{
				Dust d = Dust.NewDustPerfect(Projectile.Center + Main.rand.NextVector2Circular(20f, 20f), SethurDust.Gold, Vector2.Zero, 0, default, 1.1f);
				d.noGravity = true;
			}
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			int fh = tex.Height / Frames;
			Rectangle src = new Rectangle(0, Projectile.frame * fh, tex.Width, fh);
			float fade = Projectile.timeLeft < 8 ? Projectile.timeLeft / 8f : 1f;
			Main.spriteBatch.Draw(tex, Projectile.Center - Main.screenPosition, src, Color.White * fade, Projectile.rotation, new Vector2(88f, fh / 2f), 0.85f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
