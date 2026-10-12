using System;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.Chat;
using Terraria.Graphics.CameraModifiers;
using Terraria.ID;
using Terraria.Localization;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Common.Utilities
{
	/// <summary>Identificadores de polvo usados por el mod (todos existen en vanilla).</summary>
	public static class SethurDust
	{
		public const int Gold = DustID.GoldFlame;
		public const int Fire = DustID.Torch;
		public const int Smoke = DustID.Smoke;
		public const int Blue = DustID.BlueTorch;
		public const int Sand = 32;   // polvo de arena de vanilla
	}

	/// <summary>Utilidades compartidas por el jefe, sus proyectiles y los objetos.</summary>
	public static class SethurHelpers
	{
		public static readonly Color GoldColor = new Color(255, 200, 80);
		public static readonly Color SunColor = new Color(255, 230, 140);
		public static readonly Color BlueColor = new Color(90, 170, 255);
		public static readonly Color SandColor = new Color(232, 190, 110);

		/// <summary>
		/// Color para mezcla ADITIVA sin cambiar el estado del SpriteBatch: Terraria usa alfa premultiplicado,
		/// así que un Color con alfa 0 se suma al fondo en lugar de taparlo.
		/// </summary>
		public static Color Additive(Color c, float intensity = 1f)
		{
			intensity = MathHelper.Clamp(intensity, 0f, 4f);
			return new Color((int)Math.Min(255f, c.R * intensity), (int)Math.Min(255f, c.G * intensity), (int)Math.Min(255f, c.B * intensity), 0);
		}

		// ------------------------------------------------------------------ suelo
		public static bool IsSolidTile(int x, int y)
		{
			if (!WorldGen.InWorld(x, y, 10))
				return false;
			Tile t = Main.tile[x, y];
			return t.HasUnactuatedTile && (Main.tileSolid[t.TileType] || Main.tileSolidTop[t.TileType]);
		}

		/// <summary>
		/// Punto de suelo (borde superior del primer bloque sólido) bajo la columna x, buscando desde nearY.
		/// Si nearY está dentro de un bloque sólido, primero sube hasta salir de él (pendientes y colinas).
		/// Si no hay suelo, devuelve un punto algo por debajo de nearY.
		/// </summary>
		public static Vector2 GroundPoint(float worldX, float nearY)
		{
			int tx = Utils.Clamp((int)(worldX / 16f), 12, Main.maxTilesX - 12);
			int ty = Utils.Clamp((int)(nearY / 16f), 12, Main.maxTilesY - 12);
			int up = 0;
			while (up < 24 && IsSolidTile(tx, ty))
			{
				ty--;
				up++;
			}
			for (int i = 0; i < 90; i++)
			{
				if (IsSolidTile(tx, ty + i))
					return new Vector2(worldX, (ty + i) * 16f);
			}
			return new Vector2(worldX, nearY + 96f);
		}

		// ------------------------------------------------------------------ geometría
		public static bool CircleIntersectsRect(Vector2 center, float radius, Rectangle rect)
		{
			float cx = MathHelper.Clamp(center.X, rect.Left, rect.Right);
			float cy = MathHelper.Clamp(center.Y, rect.Top, rect.Bottom);
			float dx = center.X - cx;
			float dy = center.Y - cy;
			return dx * dx + dy * dy <= radius * radius;
		}

		/// <summary>Posición futura estimada del jugador (limitada para no volverse injusta).</summary>
		public static Vector2 Predict(Player p, float ticks, float maxOffset = 260f)
		{
			Vector2 off = p.velocity * ticks;
			if (off.Length() > maxOffset)
				off = off.SafeNormalize(Vector2.Zero) * maxOffset;
			return p.Center + off;
		}

		// ------------------------------------------------------------------ mensajes
		/// <summary>Muestra un mensaje de chat (localizado) a todos los jugadores, correcto en SP y multijugador.</summary>
		public static void Announce(string localizationKey, Color color)
		{
			if (Main.netMode == NetmodeID.SinglePlayer)
				Main.NewText(Language.GetTextValue(localizationKey), color);
			else if (Main.netMode == NetmodeID.Server)
				ChatHelper.BroadcastChatMessage(NetworkText.FromKey(localizationKey), color);
		}

		// ------------------------------------------------------------------ efectos
		public static void Shake(Vector2 center, float strength, int frames = 20, float range = 1400f)
		{
			if (Main.dedServ)
				return;
			Vector2 dir = Main.rand.NextFloat(0f, MathHelper.TwoPi).ToRotationVector2();
			Main.instance.CameraModifiers.Add(new PunchCameraModifier(center, dir, strength, 6f, frames, range, "ForgottenPharaohShake"));
		}

		public static void GoldBurst(Vector2 pos, int count, float speed, float scale = 1.3f, int dustType = SethurDust.Gold)
		{
			if (Main.dedServ)
				return;
			for (int i = 0; i < count; i++)
			{
				Dust d = Dust.NewDustPerfect(pos, dustType, Main.rand.NextVector2Circular(speed, speed), 0, default, scale);
				d.noGravity = true;
			}
		}

		public static void DustRing(Vector2 center, float radius, int count, int dustType, float outwardSpeed = 0f, float scale = 1.4f)
		{
			if (Main.dedServ)
				return;
			for (int i = 0; i < count; i++)
			{
				Vector2 dir = (MathHelper.TwoPi * i / count).ToRotationVector2();
				Dust d = Dust.NewDustPerfect(center + dir * radius, dustType, dir * outwardSpeed, 0, default, scale);
				d.noGravity = true;
			}
		}

		/// <summary>Dibuja una línea fina (telegrafía) con el pixel mágico del juego.</summary>
		public static void DrawLine(Microsoft.Xna.Framework.Graphics.SpriteBatch sb, Vector2 start, Vector2 end, Color color, float thickness)
		{
			Vector2 diff = end - start;
			float len = diff.Length();
			if (len < 1f)
				return;
			var pixel = Terraria.GameContent.TextureAssets.MagicPixel.Value;
			sb.Draw(pixel, start, new Rectangle(0, 0, 1, 1), color, diff.ToRotation(), new Vector2(0f, 0.5f), new Vector2(len, thickness), Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0f);
		}

		/// <summary>Elimina todos los proyectiles hostiles de Sethur (cambio de fase, muerte).</summary>
		public static void ClearBossProjectiles(Mod mod)
		{
			foreach (Projectile p in Main.ActiveProjectiles)
			{
				if (p.ModProjectile != null && p.ModProjectile.Mod == mod && p.ModProjectile is Content.Projectiles.Boss.ISethurHostile)
					p.Kill();
			}
		}
	}
}
