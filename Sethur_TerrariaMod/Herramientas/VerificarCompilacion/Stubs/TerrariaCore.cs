// API "stub" de Terraria (vanilla) con las firmas que usa el mod.
using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using ReLogic.Content;
using Terraria.DataStructures;
using Terraria.GameContent.ItemDropRules;
using Terraria.Graphics.CameraModifiers;
using Terraria.ID;
using Terraria.Localization;
using Terraria.ModLoader;
using Terraria.Utilities;

namespace Terraria
{
	public class Tile
	{
		public bool HasUnactuatedTile { get; set; }
		public ushort TileType { get; set; }
	}

	/// <summary>Mundo de prueba: suelo sólido plano a partir de la fila 1000.</summary>
	public class Tilemap
	{
		public Tile this[int x, int y] => new Tile { HasUnactuatedTile = y >= 1000, TileType = 1 };
	}

	public class Main
	{
		public static UnifiedRandom rand = new UnifiedRandom();
		public static int netMode;
		public static bool dedServ;
		public static bool expertMode;
		public static bool masterMode;
		public static Player[] player = new Player[256];
		public static NPC[] npc = new NPC[201];
		public static Projectile[] projectile = new Projectile[1001];
		public const int maxNPCs = 200;
		public const int maxPlayers = 255;
		public static int myPlayer;
		public static Vector2 screenPosition;
		public static SpriteBatch spriteBatch;
		public static uint GameUpdateCount;
		public static Tilemap tile = new Tilemap();
		public static int maxTilesX, maxTilesY;
		public static bool[] tileSolid = new bool[1000];
		public static bool[] tileSolidTop = new bool[1000];
		public static int[] npcFrameCount = new int[1000];
		public static int[] projFrames = new int[1000];
		public static bool[] projPet = new bool[1000];
		public static bool[] buffNoSave = new bool[1000];
		public static bool[] buffNoTimeDisplay = new bool[1000];
		public static IEnumerable<NPC> ActiveNPCs { get { foreach (var n in npc) if (n != null && n.active) yield return n; } }
		public static IEnumerable<Projectile> ActiveProjectiles { get { foreach (var p in projectile) if (p != null && p.active) yield return p; } }
		public static Main instance = new Main();
		public static Vector2 MouseWorld;
		public CameraModifierStack CameraModifiers = new CameraModifierStack();
		public static void NewText(string newText, Color color) { Harness.Messages.Add("SP:" + newText); }
	}

	public static class Utils
	{
		public static T Clamp<T>(T value, T min, T max) where T : IComparable<T> => value.CompareTo(min) < 0 ? min : (value.CompareTo(max) > 0 ? max : value);
		public static Vector2 SafeNormalize(this Vector2 v, Vector2 defaultValue) { float l = v.Length(); return l > 0 ? v / l : defaultValue; }
		public static Vector2 RotatedBy(this Vector2 v, double radians, Vector2 center = default)
		{
			float c = (float)Math.Cos(radians), s = (float)Math.Sin(radians);
			Vector2 d = v - center;
			return new Vector2(d.X * c - d.Y * s, d.X * s + d.Y * c) + center;
		}
		public static float ToRotation(this Vector2 v) => (float)Math.Atan2(v.Y, v.X);
		public static Vector2 ToRotationVector2(this float r) => new Vector2((float)Math.Cos(r), (float)Math.Sin(r));
		public static Vector2 Size(this Texture2D t) => new Vector2(t.Width, t.Height);
		public static Vector2 Size(this Rectangle r) => new Vector2(r.Width, r.Height);
		public static Vector2 TopLeft(this Rectangle r) => new Vector2(r.X, r.Y);
		public static float NextFloat(this UnifiedRandom r) => (float)r.NextDouble();
		public static float NextFloat(this UnifiedRandom r, float min, float max) => min + (max - min) * (float)r.NextDouble();
		public static Vector2 NextVector2Circular(this UnifiedRandom r, float w, float h) => new Vector2(r.NextFloat(-w, w), r.NextFloat(-h, h));
		public static Vector2 NextVector2CircularEdge(this UnifiedRandom r, float w, float h) => new Vector2(w, h);
		public static bool NextBool(this UnifiedRandom r) => r.Next(2) == 0;
		public static bool NextBool(this UnifiedRandom r, int chance) => r.Next(chance) == 0;
		public static void WriteFlags(this BinaryWriter w, bool b0, bool b1 = false, bool b2 = false, bool b3 = false, bool b4 = false, bool b5 = false, bool b6 = false, bool b7 = false) { }
		public static void ReadFlags(this BinaryReader r, out bool b0) { b0 = false; }
	}

	public class Entity
	{
		public Vector2 position;
		public Vector2 velocity;
		public int width, height;
		public bool active;
		public int whoAmI;
		public int direction = 1;
		public int spriteDirection = 1;
		public Vector2 Center { get => position + new Vector2(width / 2f, height / 2f); set => position = value - new Vector2(width / 2f, height / 2f); }
		public Vector2 Bottom { get => position + new Vector2(width / 2f, height); set => position = value - new Vector2(width / 2f, height); }
		public Vector2 Size => new Vector2(width, height);
		public Rectangle Hitbox => new Rectangle((int)position.X, (int)position.Y, width, height);
		public IEntitySource GetSource_FromThis(string context = null) => null;
	}

	public class NPC : Entity
	{
		public struct HitInfo { public int Damage; public int HitDirection; public bool Crit; }

		public float[] ai = new float[4];
		public float[] localAI = new float[4];
		public int life, lifeMax, defense, damage, defDamage;
		public float knockBackResist;
		public bool noGravity, noTileCollide, lavaImmune, boss, netAlways, netUpdate, dontTakeDamage;
		public int value2;
		public float value;
		public float npcSlots;
		public int aiStyle;
		public int target;
		public int alpha;
		public float Opacity => 1f - alpha / 255f;
		public Rectangle frame;
		public float gfxOffY;
		public Vector2[] oldPos = new Vector2[10];
		public bool IsABestiaryIconDummy;
		public int type;
		public ModNPC ModNPC;
		public bool[] buffImmune = new bool[400];
		public Terraria.Audio.SoundStyle? HitSound;
		public Terraria.Audio.SoundStyle? DeathSound;
		public double frameCounter;
		public void TargetClosest(bool faceTarget = true) { target = 0; }
		public void SpawnWithHigherTime(int multiplier) { }
		public void EncourageDespawn(int ticks) { }
		public static bool AnyNPCs(int type) { foreach (var n in Main.ActiveNPCs) if (n.type == type) return true; return false; }
		public static void SpawnOnPlayer(int plr, int Type) { }
		public void SetEventFlagCleared(ref bool eventFlag, int gameEventId) { eventFlag = true; }
		public void checkDead()
		{
			if (life > 0) return;
			if (ModNPC != null && !ModNPC.CheckDead()) return;
			active = false;
			ModNPC?.OnKill();
		}
		public bool CanBeChasedBy(object attacker = null, bool ignoreDontTakeDamage = false) => true;
		public IEntitySource GetSource_FromAI(string context = null) => null;
	}

	public class Projectile : Entity
	{
		public float[] ai = new float[3];
		public float[] localAI = new float[3];
		public int timeLeft, damage, penetrate, aiStyle, frame, frameCounter, owner, type, extraUpdates, alpha, minionPos;
		public bool friendly, hostile, tileCollide, ignoreWater, minion, usesLocalNPCImmunity, netImportant;
		public float rotation, minionSlots, knockBack;
		public int localNPCHitCooldown;
		public Vector2[] oldPos = new Vector2[10];
		public DamageClass DamageType;
		public ModProjectile ModProjectile;
		public bool netUpdate;
		public void Kill()
		{
			if (!active) return;
			active = false;
			ModProjectile?.OnKill(timeLeft);
		}

		public static int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner = 255, float ai0 = 0f, float ai1 = 0f, float ai2 = 0f)
		{
			Harness.ProjectileSpawns.Add((Main.netMode, Type));
			int slot = -1;
			for (int i = 0; i < Main.projectile.Length; i++)
				if (Main.projectile[i] == null || !Main.projectile[i].active) { slot = i; break; }
			if (slot < 0) return Main.projectile.Length - 1;
			var p = new Projectile { active = true, whoAmI = slot, type = Type, damage = Damage, knockBack = KnockBack, owner = Owner };
			var mp = (ModProjectile)Activator.CreateInstance(StubRegistry.ProjTypes[Type - 1]);
			mp.Projectile = p;
			p.ModProjectile = mp;
			mp.SetDefaults();
			p.Center = position;
			p.velocity = velocity;
			p.ai[0] = ai0; p.ai[1] = ai1; p.ai[2] = ai2;
			Main.projectile[slot] = p;
			return slot;
		}
	}

	public class Player : Entity
	{
		public bool dead;
		public int[] ownedProjectileCounts = new int[1000];
		public int[] buffTime = new int[44];
		public bool HasMinionAttackTargetNPC => false;
		public int MinionAttackTargetNPC;
		private StatModifier dmg;
		private float crit;
		public bool HasBuff(int type) => false;
		public void AddBuff(int type, int time) { }
		public void ClearBuff(int type) { }
		public void DelBuff(int index) { }
		public void LimitPointToPlayerReachableArea(ref Vector2 pos) { }
		public ref StatModifier GetDamage(DamageClass c) => ref dmg;
		public ref float GetCritChance(DamageClass c) => ref crit;
		public static int FindClosest(Vector2 Position, int Width, int Height) => 0;
		public Player() { width = 20; height = 42; }
	}

	public struct StatModifier
	{
		public static StatModifier operator +(StatModifier m, float add) => m;
	}

	public class Item : Entity
	{
		public const int CommonMaxStack = 9999;
		public int damage, crit, mana, useTime, useAnimation, useStyle, maxStack, value, rare, shoot, buffType, ResearchUnlockCount;
		public float knockBack, shootSpeed;
		public bool consumable, noMelee, noUseGraphic, autoReuse, accessory, vanity, expert;
		public DamageClass DamageType;
		public Terraria.Audio.SoundStyle? UseSound;
		public static int sellPrice(int platinum = 0, int gold = 0, int silver = 0, int copper = 0) => 0;
		public static int buyPrice(int platinum = 0, int gold = 0, int silver = 0, int copper = 0) => 0;
	}

	public class Dust
	{
		public bool noGravity;
		public static Dust NewDustPerfect(Vector2 Position, int Type, Vector2? Velocity = null, int Alpha = 0, Color newColor = default, float Scale = 1f) => new Dust();
		public static Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX = 0f, float SpeedY = 0f, int Alpha = 0, Color newColor = default, float Scale = 1f) => new Dust();
	}

	public static class Lighting
	{
		public static void AddLight(Vector2 position, float r, float g, float b) { }
	}

	public static class Collision
	{
		public static bool CheckAABBvLineCollision(Vector2 objectPosition, Vector2 objectDimensions, Vector2 lineStart, Vector2 lineEnd, float lineWidth, ref float collisionPoint) => false;
		public static bool CanHitLine(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2) => true;
	}

	public static class WorldGen
	{
		public static bool InWorld(int x, int y, int fluff = 0) => true;
	}

	public static class NetMessage
	{
		public static void SendData(int msgType, int remoteClient = -1, int ignoreClient = -1, NetworkText text = null, int number = 0, float number2 = 0f, float number3 = 0f, float number4 = 0f, int number5 = 0, int number6 = 0, int number7 = 0) { }
	}

	public static class ContentSamples
	{
		public static class CreativeHelper
		{
			public enum ItemGroup { BossSpawners, Other }
		}
	}
}

namespace Terraria.Utilities
{
	public class UnifiedRandom
	{
		private readonly System.Random r = new System.Random(2024);
		public int Next(int max) => r.Next(max);
		public int Next(int min, int max) => r.Next(min, max);
		public double NextDouble() => r.NextDouble();
	}
}

namespace Terraria.DataStructures
{
	public interface IEntitySource { }
	public class EntitySource_ItemUse_WithAmmo : IEntitySource { }
}

namespace Terraria.Audio
{
	public struct SoundStyle { }

	public static class SoundEngine
	{
		public static void PlaySound(in SoundStyle style, Vector2? position = null) { }
	}
}

namespace Terraria.Graphics.CameraModifiers
{
	public interface ICameraModifier { }

	public class PunchCameraModifier : ICameraModifier
	{
		public PunchCameraModifier(Vector2 startPosition, Vector2 direction, float strength, float vibrationCyclesPerSecond, int frames, float distanceFalloff = -1f, string uniqueIdentity = null) { }
	}

	public class CameraModifierStack
	{
		public void Add(ICameraModifier modifier) { }
	}
}

namespace Terraria.Localization
{
	public class NetworkText
	{
		public string Key;
		public static NetworkText FromKey(string key, params object[] substitutions) => new NetworkText { Key = key };
	}

	public static class Language
	{
		public static string GetTextValue(string key) => key;
	}
}

namespace Terraria.Chat
{
	public static class ChatHelper
	{
		public static void BroadcastChatMessage(NetworkText text, Color color, int excludedPlayer = -1) { Harness.Messages.Add("SRV:" + text.Key); }
	}
}

namespace Terraria.GameContent
{
	public static class TextureAssets
	{
		public static Asset<Texture2D>[] Npc = new Asset<Texture2D>[1000];
		public static Asset<Texture2D>[] Projectile = new Asset<Texture2D>[1000];
		public static Asset<Texture2D> MagicPixel;
	}
}

namespace Terraria.GameContent.Bestiary
{
	public interface IBestiaryInfoElement { }
	public class BestiaryDatabase { }
	public class BestiaryEntry { public List<IBestiaryInfoElement> Info = new List<IBestiaryInfoElement>(); }
	public class MoonLordPortraitBackgroundProviderBestiaryInfoElement : IBestiaryInfoElement { }
	public class FlavorTextBestiaryInfoElement : IBestiaryInfoElement { public FlavorTextBestiaryInfoElement(string key) { } }
}

namespace Terraria.GameContent.ItemDropRules
{
	public interface IItemDropRule { }
	public interface IItemDropRuleCondition { }
	public interface IItemDropRuleChainAttempt { }

	public class LeadingConditionRule : IItemDropRule
	{
		public LeadingConditionRule(IItemDropRuleCondition condition) { }
		public IItemDropRuleChainAttempt OnSuccess(IItemDropRule rule) => null;
	}

	public static class Conditions
	{
		public class NotExpert : IItemDropRuleCondition { }
	}

	public static class ItemDropRule
	{
		public static IItemDropRule Common(int itemId, int chanceDenominator = 1, int minimumDropped = 1, int maximumDropped = 1) => null;
		public static IItemDropRule NotScalingWithLuck(int itemId, int chanceDenominator = 1, int minimumDropped = 1, int maximumDropped = 1) => null;
		public static IItemDropRule OneFromOptionsNotScalingWithLuck(int chanceDenominator, params int[] options) => null;
		public static IItemDropRule BossBag(int itemId) => null;
		public static IItemDropRule CoinsBasedOnNPCValue(int npcId) => null;
	}
}
