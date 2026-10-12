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
	/// <summary>Proyectil de energía azul disparado por los obeliscos. Rápido, recto, desaparece al tocar un bloque.</summary>
	public class SethurObeliskBolt : ModProjectile, ISethurHostile
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
			Projectile.width = 16;
			Projectile.height = 16;
			Projectile.hostile = true;
			Projectile.friendly = false;
			Projectile.tileCollide = true;
			Projectile.ignoreWater = true;
			Projectile.penetrate = 1;
			Projectile.timeLeft = 260;
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

			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 4)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}
			Projectile.rotation += 0.2f;
			Lighting.AddLight(Projectile.Center, 0.2f, 0.45f, 1f);

			if (!Main.dedServ && Main.rand.NextBool(3))
			{
				Dust d = Dust.NewDustPerfect(Projectile.Center, SethurDust.Blue, Projectile.velocity * -0.08f, 0, default, 1.1f);
				d.noGravity = true;
			}
		}

		public override void OnKill(int timeLeft)
		{
			if (Main.dedServ)
				return;
			SoundEngine.PlaySound(SoundID.Item10, Projectile.Center);
			SethurHelpers.GoldBurst(Projectile.Center, 8, 4f, 1.3f, SethurDust.Blue);
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
				sb.Draw(tex, Projectile.oldPos[i] + Projectile.Size / 2f - Main.screenPosition, src, SethurHelpers.Additive(SethurHelpers.BlueColor, 0.5f * k), Projectile.rotation, origin, 0.5f + 0.5f * k, SpriteEffects.None, 0f);
			}
			sb.Draw(tex, Projectile.Center - Main.screenPosition, src, Color.White, Projectile.rotation, origin, 1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
