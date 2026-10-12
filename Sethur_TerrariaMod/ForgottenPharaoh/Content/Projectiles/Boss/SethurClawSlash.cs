using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.NPCs.Sethur;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Terraria;
using Terraria.GameContent;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Projectiles.Boss
{
	/// <summary>
	/// Tajo creciente del zarpazo. Se mueve hacia delante y dura 22 ticks. ai[0] = ángulo de lanzamiento (rad).
	/// Center = vértice (punta de avance) del creciente; la colisión usa varios círculos a lo largo del arco.
	/// </summary>
	public class SethurClawSlash : ModProjectile, ISethurHostile
	{
		private const int Frames = 6;
		private const int Lifetime = 22;
		private const float ArcRadius = 77f;
		private const float OriginX = 91f;     // vértice del creciente dentro del fotograma (el centro del arco está en x=14)

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 300;
		}

		public override void SetDefaults()
		{
			Projectile.width = 40;
			Projectile.height = 40;
			Projectile.hostile = true;
			Projectile.friendly = false;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.penetrate = -1;
			Projectile.timeLeft = Lifetime;
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

			Projectile.rotation = Projectile.velocity.ToRotation();
			Projectile.frame = Utils.Clamp((int)((Lifetime - Projectile.timeLeft) * Frames / (float)Lifetime), 0, Frames - 1);
			Projectile.velocity *= 0.985f;
			Lighting.AddLight(Projectile.Center, 0.9f, 0.7f, 0.25f);

			if (!Main.dedServ && Projectile.timeLeft % 3 == 0)
			{
				Vector2 dir = Projectile.rotation.ToRotationVector2();
				Dust d = Dust.NewDustPerfect(Projectile.Center - dir * ArcRadius + dir.RotatedBy(Main.rand.NextFloat(-0.8f, 0.8f)) * ArcRadius, SethurDust.Gold, Vector2.Zero, 0, default, 1.2f);
				d.noGravity = true;
			}
		}

		public override bool? Colliding(Rectangle projHitbox, Rectangle targetHitbox)
		{
			Vector2 dir = Projectile.rotation.ToRotationVector2();
			Vector2 arcCenter = Projectile.Center - dir * ArcRadius;
			for (int i = -3; i <= 3; i++)
			{
				Vector2 p = arcCenter + dir.RotatedBy(i * 0.17f) * ArcRadius;
				if (SethurHelpers.CircleIntersectsRect(p, 22f, targetHitbox))
					return true;
			}
			return false;
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			int fh = tex.Height / Frames;
			Rectangle src = new Rectangle(0, Projectile.frame * fh, tex.Width, fh);
			float fade = Projectile.timeLeft < 6 ? Projectile.timeLeft / 6f : 1f;
			Main.spriteBatch.Draw(tex, Projectile.Center - Main.screenPosition, src, Color.White * fade, Projectile.rotation, new Vector2(OriginX, fh / 2f), 1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
