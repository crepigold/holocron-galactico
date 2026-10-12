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
	/// Disco solar que persigue al jugador de forma moderada (giro limitado) durante ~2 s y luego sigue recto acelerando.
	/// ai[0] = índice del jugador objetivo. localAI[0] = edad (cada máquina la cuenta por su cuenta).
	/// </summary>
	public class SethurSolarDisc : ModProjectile, ISethurHostile
	{
		private const int Frames = 4;
		private const int HomingTicks = 110;

		public ref float Age => ref Projectile.localAI[0];

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.TrailCacheLength[Type] = 8;
			ProjectileID.Sets.TrailingMode[Type] = 2;
		}

		public override void SetDefaults()
		{
			Projectile.width = 30;
			Projectile.height = 30;
			Projectile.hostile = true;
			Projectile.friendly = false;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.penetrate = -1;
			Projectile.timeLeft = 330;
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
			int idx = (int)Projectile.ai[0];
			if (Age < HomingTicks && idx >= 0 && idx < Main.maxPlayers && Main.player[idx].active && !Main.player[idx].dead)
			{
				// giro limitado por tick: moderado, se puede esquivar cambiando de dirección
				float maxTurn = 0.026f + 0.004f * SethurBalance.Tier;
				float current = Projectile.velocity.ToRotation();
				float desired = (Main.player[idx].Center - Projectile.Center).ToRotation();
				float diff = MathHelper.WrapAngle(desired - current);
				Projectile.velocity = Projectile.velocity.RotatedBy(MathHelper.Clamp(diff, -maxTurn, maxTurn));
			}
			else if (Projectile.velocity.Length() < 15f)
			{
				Projectile.velocity *= 1.012f;
			}

			Projectile.rotation += 0.32f;
			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 3)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}

			if (!Main.dedServ && Age % 3f == 0f)
			{
				Dust d = Dust.NewDustPerfect(Projectile.Center, SethurDust.Gold, Projectile.velocity * -0.1f + Main.rand.NextVector2Circular(0.6f, 0.6f), 0, default, 1.2f);
				d.noGravity = true;
			}
			Lighting.AddLight(Projectile.Center, 1f, 0.75f, 0.3f);
		}

		public override void OnKill(int timeLeft)
		{
			if (Main.dedServ)
				return;
			SoundEngine.PlaySound(SoundID.Item10, Projectile.Center);
			SethurHelpers.GoldBurst(Projectile.Center, 10, 5f, 1.4f);
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			int fh = tex.Height / Frames;
			Rectangle src = new Rectangle(0, Projectile.frame * fh, tex.Width, fh);
			Vector2 origin = new Vector2(tex.Width / 2f, fh / 2f);
			SpriteBatch sb = Main.spriteBatch;

			// estela
			for (int i = Projectile.oldPos.Length - 1; i >= 1; i--)
			{
				if (Projectile.oldPos[i] == Vector2.Zero)
					continue;
				float k = 1f - i / (float)Projectile.oldPos.Length;
				sb.Draw(tex, Projectile.oldPos[i] + Projectile.Size / 2f - Main.screenPosition, src, SethurHelpers.Additive(SethurHelpers.GoldColor, 0.55f * k), Projectile.rotation, origin, 0.6f + 0.4f * k, SpriteEffects.None, 0f);
			}

			Texture2D glow = SethurAssets.Glow;
			Vector2 pos = Projectile.Center - Main.screenPosition;
			sb.Draw(glow, pos, null, SethurHelpers.Additive(SethurHelpers.GoldColor, 0.8f), 0f, glow.Size() / 2f, 0.55f, SpriteEffects.None, 0f);
			sb.Draw(tex, pos, src, Color.White, Projectile.rotation, origin, 1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
