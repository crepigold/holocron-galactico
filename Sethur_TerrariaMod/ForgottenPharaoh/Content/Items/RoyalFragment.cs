using Terraria;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Items
{
	/// <summary>Fragmento Real: material de fabricación que suelta Sethur (se usa en el Amuleto Real).</summary>
	public class RoyalFragment : ModItem
	{
		public override void SetStaticDefaults()
		{
			Item.ResearchUnlockCount = 25;
		}

		public override void SetDefaults()
		{
			Item.width = 22;
			Item.height = 26;
			Item.maxStack = Item.CommonMaxStack;
			Item.value = Item.sellPrice(silver: 40);
			Item.rare = ItemRarityID.Pink;
		}
	}
}
