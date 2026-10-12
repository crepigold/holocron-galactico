using ForgottenPharaoh.Content.NPCs.Sethur;
using Terraria;
using Terraria.GameContent.ItemDropRules;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Items
{
	/// <summary>Bolsa del tesoro de Sethur (Expert/Master). Replica el botín de Classic.</summary>
	public class SethurBossBag : ModItem
	{
		public override void SetStaticDefaults()
		{
			ItemID.Sets.BossBag[Type] = true;                // brillo en el mundo y cabecera correcta
			ItemID.Sets.PreHardmodeLikeBossBag[Type] = true; // no suelta armadura de desarrollador salvo semillas especiales
			Item.ResearchUnlockCount = 3;
		}

		public override void SetDefaults()
		{
			Item.maxStack = Item.CommonMaxStack;
			Item.consumable = true;
			Item.width = 34;
			Item.height = 36;
			Item.rare = ItemRarityID.Purple;
			Item.expert = true;
		}

		public override bool CanRightClick() => true;

		public override void ModifyItemLoot(ItemLoot itemLoot)
		{
			itemLoot.Add(ItemDropRule.NotScalingWithLuck(ModContent.ItemType<SethurMask>(), 7));
			itemLoot.Add(ItemDropRule.OneFromOptionsNotScalingWithLuck(1,
				ModContent.ItemType<PharaohSickle>(),
				ModContent.ItemType<DesertStaff>(),
				ModContent.ItemType<SolarDisc>()));
			itemLoot.Add(ItemDropRule.Common(ModContent.ItemType<RoyalFragment>(), 1, 14, 22));
			itemLoot.Add(ItemDropRule.CoinsBasedOnNPCValue(ModContent.NPCType<SethurBoss>()));
		}
	}
}
