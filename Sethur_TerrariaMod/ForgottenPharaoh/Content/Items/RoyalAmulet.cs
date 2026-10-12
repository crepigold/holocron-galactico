using Terraria;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Items
{
	/// <summary>Amuleto Real (accesorio opcional): +6% de daño y +4% de probabilidad de crítico. Se fabrica con Fragmentos Reales.</summary>
	public class RoyalAmulet : ModItem
	{
		public override void SetDefaults()
		{
			Item.width = 28;
			Item.height = 32;
			Item.accessory = true;
			Item.value = Item.sellPrice(gold: 6);
			Item.rare = ItemRarityID.Pink;
		}

		public override void UpdateAccessory(Player player, bool hideVisual)
		{
			player.GetDamage(DamageClass.Generic) += 0.06f;
			player.GetCritChance(DamageClass.Generic) += 4f;
		}

		public override void AddRecipes()
		{
			CreateRecipe()
				.AddIngredient<RoyalFragment>(10)
				.AddIngredient(ItemID.GoldBar, 6)
				.AddTile(TileID.Anvils)
				.Register();
		}
	}
}
