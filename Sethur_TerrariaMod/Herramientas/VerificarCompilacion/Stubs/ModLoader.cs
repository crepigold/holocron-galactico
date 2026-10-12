// API "stub" de Terraria.ModLoader. Las firmas de los hooks virtuales de ModNPC/ModProjectile/ModItem
// están copiadas del código fuente oficial de tModLoader (patches/tModLoader/Terraria/ModLoader/Mod*.cs).
using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using ReLogic.Content;
using Terraria.DataStructures;
using Terraria.GameContent.Bestiary;
using Terraria.GameContent.ItemDropRules;
using Terraria.ModLoader.IO;

namespace Terraria.ModLoader
{
	public class Mod { }

	public enum EquipType { Head, Body, Legs }

	[System.AttributeUsage(System.AttributeTargets.Class)]
	public class AutoloadEquipAttribute : System.Attribute { public AutoloadEquipAttribute(params EquipType[] types) { } }

	[System.AttributeUsage(System.AttributeTargets.Class)]
	public class AutoloadBossHeadAttribute : System.Attribute { }

	public class DamageClass
	{
		public static DamageClass Generic, Melee, Ranged, Summon;
	}

	public abstract class ModType
	{
		public Mod Mod { get; set; }
		public string Name { get; }
		public virtual void Load() { }
		public virtual void Unload() { }
	}

	public static class StubRegistry
	{
		public static readonly List<Type> NpcTypes = new List<Type>(), ProjTypes = new List<Type>(), ItemTypes = new List<Type>(), BuffTypes = new List<Type>();
		public static int IdOf(List<Type> list, Type t) { int i = list.IndexOf(t); if (i < 0) { list.Add(t); i = list.Count - 1; } return i + 1; }
	}

	public static class ModContent
	{
		public static int NPCType<T>() where T : ModNPC => StubRegistry.IdOf(StubRegistry.NpcTypes, typeof(T));
		public static int ProjectileType<T>() where T : ModProjectile => StubRegistry.IdOf(StubRegistry.ProjTypes, typeof(T));
		public static int ItemType<T>() where T : ModItem => StubRegistry.IdOf(StubRegistry.ItemTypes, typeof(T));
		public static int BuffType<T>() where T : ModBuff => StubRegistry.IdOf(StubRegistry.BuffTypes, typeof(T));
		public static Asset<T> Request<T>(string path, AssetRequestMode mode = AssetRequestMode.AsyncLoad) where T : class => null;
	}

	public abstract class ModNPC : ModType
	{
		public NPC NPC { get; set; }
		public int Type => StubRegistry.IdOf(StubRegistry.NpcTypes, GetType());
		public int Music { get; set; }
		public virtual string Texture => "";
		public virtual string BossHeadTexture => "";
		public virtual void SetStaticDefaults() { }
		public virtual void SetDefaults() { }
		public virtual void ApplyDifficultyAndPlayerScaling(int numPlayers, float balance, float bossAdjustment) { }
		public virtual void SetBestiary(BestiaryDatabase database, BestiaryEntry bestiaryEntry) { }
		public virtual void AI() { }
		public virtual void SendExtraAI(BinaryWriter writer) { }
		public virtual void ReceiveExtraAI(BinaryReader reader) { }
		public virtual void FindFrame(int frameHeight) { }
		public virtual void HitEffect(NPC.HitInfo hit) { }
		public virtual bool CheckDead() => true;
		public virtual void OnKill() { }
		public virtual void ModifyNPCLoot(NPCLoot npcLoot) { }
		public virtual void BossLoot(ref int potionType) { }
		public virtual bool CanHitPlayer(Player target, ref int cooldownSlot) => true;
		public virtual bool PreDraw(SpriteBatch spriteBatch, Vector2 screenPos, Color drawColor) => true;
	}

	public abstract class ModProjectile : ModType
	{
		public Projectile Projectile { get; set; }
		public int Type => StubRegistry.IdOf(StubRegistry.ProjTypes, GetType());
		public int AIType { get; set; }
		public int CooldownSlot;
		public virtual string Texture => "";
		public virtual void SetStaticDefaults() { }
		public virtual void SetDefaults() { }
		public virtual void AI() { }
		public virtual void OnKill(int timeLeft) { }
		public virtual bool? CanCutTiles() => null;
		public virtual bool? CanDamage() => null;
		public virtual bool MinionContactDamage() => false;
		public virtual void ModifyDamageHitbox(ref Rectangle hitbox) { }
		public virtual bool? Colliding(Rectangle projHitbox, Rectangle targetHitbox) => null;
		public virtual bool PreDraw(ref Color lightColor) => true;
	}

	public abstract class ModItem : ModType
	{
		public Item Item { get; set; } = new Item();
		public int Type => StubRegistry.IdOf(StubRegistry.ItemTypes, GetType());
		public virtual void SetStaticDefaults() { }
		public virtual void SetDefaults() { }
		public virtual void AddRecipes() { }
		public virtual bool CanUseItem(Player player) => true;
		public virtual bool? UseItem(Player player) => null;
		public virtual void ModifyResearchSorting(ref ContentSamples.CreativeHelper.ItemGroup itemGroup) { }
		public virtual bool CanRightClick() => false;
		public virtual void ModifyItemLoot(ItemLoot itemLoot) { }
		public virtual void ModifyShootStats(Player player, ref Vector2 position, ref Vector2 velocity, ref int type, ref int damage, ref float knockback) { }
		public virtual bool Shoot(Player player, EntitySource_ItemUse_WithAmmo source, Vector2 position, Vector2 velocity, int type, int damage, float knockback) => true;
		public virtual void MeleeEffects(Player player, Rectangle hitbox) { }
		public virtual void UpdateAccessory(Player player, bool hideVisual) { }
		public Recipe CreateRecipe(int amount = 1) => new Recipe();
	}

	public abstract class ModBuff : ModType
	{
		public int Type => StubRegistry.IdOf(StubRegistry.BuffTypes, GetType());
		public virtual void SetStaticDefaults() { }
		public virtual void Update(Player player, ref int buffIndex) { }
	}

	public abstract class ModSystem : ModType
	{
		public virtual void ClearWorld() { }
		public virtual void SaveWorldData(TagCompound tag) { }
		public virtual void LoadWorldData(TagCompound tag) { }
		public virtual void NetSend(BinaryWriter writer) { }
		public virtual void NetReceive(BinaryReader reader) { }
	}

	public class Recipe
	{
		public static readonly List<Recipe> All = new List<Recipe>();
		public readonly List<string> Log = new List<string>();
		public Recipe AddRecipeGroup(int recipeGroupId, int stack = 1) { Log.Add("Group:" + recipeGroupId + "x" + stack); return this; }
		public Recipe AddTile(int tileId) { Log.Add("Tile:" + tileId); return this; }
		public Recipe AddIngredient<T>(int stack = 1) where T : ModItem { Log.Add("Item:" + typeof(T).Name + "x" + stack); return this; }
		public Recipe AddIngredient(int itemId, int stack = 1) { Log.Add("ItemId:" + itemId + "x" + stack); return this; }
		public Recipe Register() { All.Add(this); return this; }
	}

	public class ItemLoot { public void Add(IItemDropRule rule) { } }
	public class NPCLoot { public void Add(IItemDropRule rule) { } }
}

namespace Terraria.ModLoader.IO
{
	public class TagCompound
	{
		public object this[string key] { get => null; set { } }
		public bool ContainsKey(string key) => false;
	}
}
