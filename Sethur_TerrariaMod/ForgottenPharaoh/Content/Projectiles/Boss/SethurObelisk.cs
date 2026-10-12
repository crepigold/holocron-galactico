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
	/// Obelisco flotante que dispara proyectiles al jugador. No hace daño por contacto (solo sus disparos).
	/// ai[0] = índice del jugador, ai[1] = índice del obelisco (escalona los disparos), ai[2] = edad.
	/// Telegrafía cada disparo con un brillo azul creciente y un anillo que converge en la gema (últimos 24 ticks).
	/// SOLO el servidor / un jugador crea los disparos -> no se duplican.
	/// </summary>
	public class SethurObelisk : ModProjectile, ISethurHostile
	{
		private const int Frames = 4;
		private const int FrameW = 36;
		private const int FrameH = 84;
		private const int Lifetime = 470;
		private const int WarnTicks = 24;

		public ref float Age => ref Projectile.ai[2];
		private int Index => (int)Projectile.ai[1];
		private int Interval => 86 - 8 * SethurBalance.Tier;
		private int FirstShot => 64 + Index * 16;

		public override void SetStaticDefaults()
		{
			Main.projFrames[Type] = Frames;
			ProjectileID.Sets.DrawScreenCheckFluff[Type] = 600;
		}

		public override void SetDefaults()
		{
			Projectile.width = 30;
			Projectile.height = 76;
			Projectile.hostile = false;     // no daña por contacto
			Projectile.friendly = false;
			Projectile.tileCollide = false;
			Projectile.ignoreWater = true;
			Projectile.penetrate = -1;
			Projectile.timeLeft = Lifetime + 10;
			Projectile.aiStyle = -1;
			Projectile.netImportant = true;
		}

		/// <summary>Ticks que faltan para el próximo disparo (o -1 si aún no empezó).</summary>
		private int TicksToNextShot()
		{
			if (Age < FirstShot - WarnTicks)
				return FirstShot - (int)Age;
			int sinceFirst = (int)Age - FirstShot;
			if (sinceFirst < 0)
				return -sinceFirst;
			return Interval - (sinceFirst % Interval);
		}

		public override void AI()
		{
			if (SethurBoss.ProjectilesShouldVanish)
			{
				Projectile.Kill();
				return;
			}

			Age++;
			Projectile.velocity = Vector2.Zero;
			if (Age >= Lifetime)
			{
				Projectile.Kill();
				return;
			}

			Projectile.frameCounter++;
			if (Projectile.frameCounter >= 8)
			{
				Projectile.frameCounter = 0;
				Projectile.frame = (Projectile.frame + 1) % Frames;
			}

			if (Age == 1f && !Main.dedServ)
				SoundEngine.PlaySound(SoundID.Item88, Projectile.Center);

			Lighting.AddLight(Projectile.Center, 0.25f, 0.5f, 1f);

			// disparo
			if (Age >= FirstShot && (Age - FirstShot) % Interval == 0)
			{
				if (!Main.dedServ)
					SoundEngine.PlaySound(SoundID.Item72, Projectile.Center);
				if (Main.netMode != NetmodeID.MultiplayerClient)
				{
					int idx = (int)Projectile.ai[0];
					Player target = (idx >= 0 && idx < Main.maxPlayers && Main.player[idx].active && !Main.player[idx].dead) ? Main.player[idx] : Main.player[Player.FindClosest(Projectile.Center, 1, 1)];
					Vector2 aimPoint = SethurHelpers.Predict(target, 16f, 150f);
					Vector2 vel = (aimPoint - Projectile.Center).SafeNormalize(Vector2.UnitY) * ((8.2f + 0.6f * SethurBalance.Tier) * 1f);
					Projectile.NewProjectile(Projectile.GetSource_FromThis(), Projectile.Center + new Vector2(0f, -22f), vel, ModContent.ProjectileType<SethurObeliskBolt>(),
						Projectile.damage, 0f, Main.myPlayer);
				}
			}
		}

		public override bool PreDraw(ref Color lightColor)
		{
			Texture2D tex = TextureAssets.Projectile[Type].Value;
			SpriteBatch sb = Main.spriteBatch;
			float fadeIn = Utils.Clamp(Age / 30f, 0f, 1f);
			float fadeOut = Age > Lifetime - 25 ? Utils.Clamp((Lifetime - Age) / 25f, 0f, 1f) : 1f;
			float a = fadeIn * fadeOut;
			float bob = (float)Math.Sin(Age * 0.05f + Index) * 4f;
			Vector2 pos = Projectile.Center + new Vector2(0f, bob) - Main.screenPosition;
			Rectangle src = new Rectangle(0, Projectile.frame * FrameH, FrameW, FrameH);

			// telegrafía del disparo: brillo creciente + anillo que converge en la gema
			int next = TicksToNextShot();
			float warn = (next > 0 && next <= WarnTicks && Age >= FirstShot - WarnTicks) ? 1f - next / (float)WarnTicks : 0f;
			Texture2D glow = SethurAssets.Glow;
			Vector2 gem = pos + new Vector2(-1f, -22f);
			sb.Draw(glow, gem, null, SethurHelpers.Additive(SethurHelpers.BlueColor, (0.35f + 0.9f * warn) * a), 0f, glow.Size() / 2f, 0.55f + 0.5f * warn, SpriteEffects.None, 0f);
			if (warn > 0f)
			{
				Texture2D ring = SethurAssets.Ring;
				sb.Draw(ring, gem, null, SethurHelpers.Additive(SethurHelpers.BlueColor, warn * a), 0f, ring.Size() / 2f, 0.55f * (1f - warn) + 0.08f, SpriteEffects.None, 0f);
			}

			sb.Draw(tex, pos, src, Color.White * a, 0f, new Vector2(FrameW / 2f, FrameH / 2f), 1f, SpriteEffects.None, 0f);
			return false;
		}
	}
}
