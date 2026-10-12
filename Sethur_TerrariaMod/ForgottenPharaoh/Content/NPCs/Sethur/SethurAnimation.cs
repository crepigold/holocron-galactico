using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using ReLogic.Content;
using Terraria;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.NPCs.Sethur
{
	/// <summary>Las 11 animaciones del jefe. Cada una es una hoja de sprites independiente (ver SethurFrameData).</summary>
	public enum SethurAnim
	{
		Idle = 0,         // 32 fotogramas, bucle
		Move = 1,         // 24, bucle
		Turn = 2,         // 16 (izquierda -> derecha; al revés para girar a la izquierda)
		Claw = 3,         // 24
		SandRain = 4,     // 24
		SolarDisc = 5,    // 24
		SolarRay = 6,     // 32
		Obelisk = 7,      // 24
		Transition = 8,   // 32
		Hurt = 9,         // 24
		Death = 10        // 24
	}

	/// <summary>
	/// Gestión de las hojas de animación: carga de texturas, rectángulo de cada fotograma y anclajes
	/// (cabeza, orbe del bastón, pecho, mano) generados junto a los sprites.
	/// Las hojas usan una rejilla de SethurFrameData.Columns columnas, celdas de CellWidth x CellHeight y
	/// SethurFrameData.Gutter px de separación entre celdas.
	/// </summary>
	public static class SethurAnimations
	{
		public const int AnimCount = 11;
		public const int AnchorHead = 0;
		public const int AnchorOrb = 1;
		public const int AnchorChest = 2;
		public const int AnchorNearHand = 3;

		/// <summary>Punto de la celda que coincide con NPC.Center (el centro del torso).</summary>
		public const float CellAnchorX = SethurFrameData.CellWidth / 2f;
		public const float CellAnchorY = 104f;

		public static readonly int[] FrameCount = { 32, 24, 16, 24, 24, 24, 32, 24, 32, 24, 24 };

		private static readonly string[] SheetNames =
		{
			"SethurIdle", "SethurMove", "SethurTurn", "SethurClaw", "SethurSandRain", "SethurSolarDisc",
			"SethurSolarRay", "SethurObelisk", "SethurTransition", "SethurHurt", "SethurDeath"
		};

		private const string SheetPath = "ForgottenPharaoh/Content/NPCs/Sethur/Anim/";

		private static Asset<Texture2D>[] sheets;

		/// <summary>Pide todas las hojas en segundo plano (llamar una vez, en cliente).</summary>
		public static void Preload()
		{
			if (Main.dedServ || sheets != null)
				return;
			sheets = new Asset<Texture2D>[AnimCount];
			for (int i = 0; i < AnimCount; i++)
				sheets[i] = ModContent.Request<Texture2D>(SheetPath + SheetNames[i], AssetRequestMode.AsyncLoad);
		}

		public static Texture2D GetSheet(SethurAnim anim)
		{
			if (sheets == null)
				Preload();
			return sheets[(int)anim].Value;
		}

		public static void Unload()
		{
			sheets = null;
		}

		/// <summary>Rectángulo del fotograma 'frame' dentro de la hoja de 'anim'.</summary>
		public static Rectangle GetFrameRect(SethurAnim anim, int frame)
		{
			frame = Utils.Clamp(frame, 0, FrameCount[(int)anim] - 1);
			int col = frame % SethurFrameData.Columns;
			int row = frame / SethurFrameData.Columns;
			int stepX = SethurFrameData.CellWidth + SethurFrameData.Gutter;
			int stepY = SethurFrameData.CellHeight + SethurFrameData.Gutter;
			return new Rectangle(col * stepX, row * stepY, SethurFrameData.CellWidth, SethurFrameData.CellHeight);
		}

		private static short[] AnchorTable(SethurAnim anim)
		{
			switch (anim)
			{
				case SethurAnim.Idle: return SethurFrameData.IdleAnchors;
				case SethurAnim.Move: return SethurFrameData.MoveAnchors;
				case SethurAnim.Turn: return SethurFrameData.TurnAnchors;
				case SethurAnim.Claw: return SethurFrameData.ClawAnchors;
				case SethurAnim.SandRain: return SethurFrameData.SandRainAnchors;
				case SethurAnim.SolarDisc: return SethurFrameData.SolarDiscAnchors;
				case SethurAnim.SolarRay: return SethurFrameData.SolarRayAnchors;
				case SethurAnim.Obelisk: return SethurFrameData.ObeliskAnchors;
				case SethurAnim.Transition: return SethurFrameData.TransitionAnchors;
				case SethurAnim.Hurt: return SethurFrameData.HurtAnchors;
				default: return SethurFrameData.DeathAnchors;
			}
		}

		/// <summary>Anclaje (en px de celda) de un fotograma. anchor: AnchorHead/Orb/Chest/NearHand.</summary>
		public static Vector2 GetAnchor(SethurAnim anim, int frame, int anchor)
		{
			short[] table = AnchorTable(anim);
			frame = Utils.Clamp(frame, 0, FrameCount[(int)anim] - 1);
			int i = frame * 8 + anchor * 2;
			return new Vector2(table[i], table[i + 1]);
		}
	}
}
