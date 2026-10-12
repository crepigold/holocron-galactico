// Constantes de Terraria.ID usadas por el mod (nombres de vanilla).
using System.Collections.Generic;
using Terraria.Audio;

namespace Terraria.ID
{
	public static class NPCID
	{
		public static class Sets
		{
			public static bool[] MPAllowedEnemies = new bool[1000];
			public static List<int> BossBestiaryPriority = new List<int>();
			public static bool[][] SpecificDebuffImmunity = MakeJagged();
			static bool[][] MakeJagged() { var a = new bool[1000][]; for (int i = 0; i < a.Length; i++) a[i] = new bool[400]; return a; }
			public static int[] TrailCacheLength = new int[1000];
			public static int[] TrailingMode = new int[1000];
			public static Dictionary<int, NPCBestiaryDrawModifiers> NPCBestiaryDrawOffset = new Dictionary<int, NPCBestiaryDrawModifiers>();

			public struct NPCBestiaryDrawModifiers
			{
				public string CustomTexturePath;
				public float PortraitScale;
				public float PortraitPositionYOverride;
			}
		}
	}

	public static class ProjectileID
	{
		public const short EnchantedBoomerang = 0;

		public static class Sets
		{
			public static int[] TrailCacheLength = new int[1000];
			public static int[] TrailingMode = new int[1000];
			public static int[] DrawScreenCheckFluff = new int[1000];
			public static bool[] MinionTargettingFeature = new bool[1000];
			public static bool[] MinionSacrificable = new bool[1000];
			public static bool[] CultistIsResistantTo = new bool[1000];
		}
	}

	public static class ProjAIStyleID
	{
		public const int Boomerang = 3;
	}

	public static class ItemID
	{
		public const short GreaterHealingPotion = 0;
		public const short GoldBar = 1;

		public static class Sets
		{
			public static int[] SortingPriorityBossSpawns = new int[10000];
			public static bool[] BossBag = new bool[10000];
			public static bool[] PreHardmodeLikeBossBag = new bool[10000];
			public static bool[] GamepadWholeScreenUseRange = new bool[10000];
			public static bool[] LockOnIgnoresCollision = new bool[10000];
			public static float[] StaffMinionSlotsRequired = new float[10000];
		}
	}

	public static class BuffID
	{
		public const int Confused = 1, Poisoned = 2, OnFire = 3;
	}

	public static class DustID
	{
		public const short Torch = 6, Smoke = 31, BlueTorch = 59, GoldFlame = 158;
	}

	public static class MusicID
	{
		public const int Boss3 = 1;
	}

	public static class ItemRarityID
	{
		public const int Blue = 1, Pink = 5, Purple = 11;
	}

	public static class ItemUseStyleID
	{
		public const int Swing = 1, HoldUp = 4;
	}

	public static class TileID
	{
		public const ushort WorkBenches = 18, Anvils = 16;
	}

	public static class RecipeGroupID
	{
		public const int Wood = 0;
	}

	public static class ImmunityCooldownID
	{
		public const int Bosses = 3;
	}

	public static class NetmodeID
	{
		public const int SinglePlayer = 0, MultiplayerClient = 1, Server = 2;
	}

	public static class MessageID
	{
		public const int SpawnBossUseLicenseStartEvent = 61;
	}

	public static class SoundID
	{
		public static readonly SoundStyle Roar, Item1, Item8, Item9, Item10, Item14, Item17, Item20, Item44, Item45, Item70, Item71, Item72, Item88, Item122;
		public static readonly SoundStyle NPCHit4, NPCDeath1;
	}
}
