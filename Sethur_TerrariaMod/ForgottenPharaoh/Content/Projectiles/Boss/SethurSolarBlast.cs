using System;
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
	/// Explosión solar con zona de peligro circular bien definida.
	/// ai[0] = ticks de aviso, ai[1] = radio (px), ai[2] = edad.
	/// Aviso: anillo exterior fijo (límite exacto del daño) + anillo interior que se expande hasta él + relleno que se intensifica.
	/// </summary>
	public class SethurSolarBlast : ModProjectile, ISethurHostile
	{
		private const int Frames = 8;
		private const int ExplodeTicks = 16;
		private const int DamageTicks = 10;

		public float Warn => Projectile.ai[0];
		public float Radius => Projectile.ai[1];
		public ref float Age => ref Projectile.ai[2];

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 400;
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
			float t = Age - Warn;

			if (t < 0f)
			{
				Lighting.AddLight(Projectile.Center, 0.4f, 0.3f, 0.1f);
				return;
			}

			if (t == 0f)
			{
				if (!Main.dedServ)
					SoundEngine.PlaySound(SoundID.Item14, Projectile.Center);
				SethurHelpers.Shake(Projectile.Center, 7f, 10, 900f);
				SethurHelpers.DustRing(Projectile.Center, Radius * 0.9f, 28, SethurDust.Gold, 2f, 1.6f);
				SethurHelpers.GoldBurst(Projectile.Center, 16, 9f, 1.7f);
			}

			Projectile.frame = Utils.Clamp((int)(t / 2f), 0, Frames - 1);
			Lighting.AddLight(Projectile.Center, 1.2f, 0.9f, 0.4f);

			if (t >= ExplodeTicks)
				Projectile.Kill();
		}

		public override bool? CanDamage()
		{
			float t = Age - Warn;
			return (t >= 0f && t < DamageTicks) ? null : false;
		}

		/// <summary>Colisión circular exacta con el radio de la zona avisada.</summary>
		public override bool? Colliding(Rectangle projHitbox, Rectangle targetHitbox)
		{
			float t = Age - Warn;
			float r = Radius * (t < 3f ? 0.85f : 1f);
			return SethurHelpers.CircleIntersectsRect(Projectile.Center, r, targetHitbox);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			SpriteBatch sb = Main.spriteBatch;
			Vector2 pos = Projectile.Center - Main.screenPosition;
			float t = Age - Warn;
			Texture2D ring = SethurAssets.Ring;
			Texture2D glow = SethurAssets.Glow;
			Vector2 ringOrigin = ring.Size() / 2f;
			float ringScale = Radius / 62f;       // el aro de la textura tiene 62 px de radio

			if (t < 0f)
			{
				float k = Utils.Clamp(Age / Warn, 0f, 1f);
				float pulse = 0.85f + 0.15f * (float)Math.Sin(Age * 0.5f);
				// relleno de la zona
				sb.Draw(glow, pos, null, SethurHelpers.Additive(new Color(255, 120, 50), 0.15f + 0.45f * k), 0f, glow.Size() / 2f, Radius / 64f * 1.05f, SpriteEffects.None, 0f);
				// límite exacto del daño
				sb.Draw(ring, pos, null, SethurHelpers.Additive(new Color(255, 190, 90), (0.55f + 0.45f * k) * pulse), Age * 0.01f, ringOrigin, ringScale, SpriteEffects.None, 0f);
				// anillo interior que se expande hasta el límite
				sb.Draw(ring, pos, null, SethurHelpers.Additive(SethurHelpers.SunColor, 0.8f * k), -Age * 0.02f, ringOrigin, ringScale * (0.15f + 0.85f * k), SpriteEffects.None, 0f);
				return false;
			}

			Texture2D tex = TextureAssets.Projectile[Type].Value;
			int fh = tex.Height / Frames;
			Rectangle src = new Rectangle(0, Projectile.frame * fh, tex.Width, fh);
			float scale = Radius / 76f;
			float fade = 1f - Utils.Clamp((t - 8f) / 8f, 0f, 1f) * 0.6f;
			sb.Draw(tex, pos, src, Color.White * fade, 0f, new Vector2(tex.Width / 2f, fh / 2f), scale, SpriteEffects.None, 0f);
			return false;
		}
	}
}
