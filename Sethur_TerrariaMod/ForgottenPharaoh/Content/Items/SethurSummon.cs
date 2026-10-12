using ForgottenPharaoh.Content.NPCs.Sethur;
using Terraria;
using Terraria.Audio;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Items
{
	/// <summary>
	/// Ídolo del Faraón Olvidado (SethurSummon): invoca a Sethur.
	/// Consumible, sin requisitos de progresión, fabricable desde el principio: 5 bloques de madera (cualquier tipo)
	/// en una mesa de trabajo. No funciona si Sethur ya está vivo.
	/// </summary>
	public class SethurSummon : ModItem
	{
		public override void SetStaticDefaults()
		{
			Item.ResearchUnlockCount = 3;
			ItemID.Sets.SortingPriorityBossSpawns[Type] = 12;   // ayuda al ordenar el inventario
		}

		public override void SetDefaults()
		{
			Item.width = 28;
			Item.height = 34;
			Item.maxStack = Item.CommonMaxStack;
			Item.value = Item.sellPrice(copper: 20);
			Item.rare = ItemRarityID.Blue;
			Item.useAnimation = 30;
			Item.useTime = 30;
			Item.useStyle = ItemUseStyleID.HoldUp;
			Item.consumable = true;
		}

		public override void ModifyResearchSorting(ref ContentSamples.CreativeHelper.ItemGroup itemGroup)
		{
			itemGroup = ContentSamples.CreativeHelper.ItemGroup.BossSpawners;
		}

		public override bool CanUseItem(Player player)
		{
			// Mismo chequeo que hace el servidor al recibir MessageID.SpawnBoss...: no invocar si ya existe
			return !NPC.AnyNPCs(ModContent.NPCType<SethurBoss>());
		}

		public override bool? UseItem(Player player)
		{
			if (player.whoAmI == Main.myPlayer)
			{
				SoundEngine.PlaySound(SoundID.Roar, player.position);

				int type = ModContent.NPCType<SethurBoss>();
				if (Main.netMode != NetmodeID.MultiplayerClient)
				{
					// un jugador: se crea directamente (el mensaje de inicio lo emite la propia IA del jefe)
					NPC.SpawnOnPlayer(player.whoAmI, type);
				}
				else
				{
					// multijugador: se solicita al servidor (requiere NPCID.Sets.MPAllowedEnemies, ver SethurBoss)
					NetMessage.SendData(MessageID.SpawnBossUseLicenseStartEvent, number: player.whoAmI, number2: type);
				}
			}
			return true;
		}

		/// <summary>Receta: EXACTAMENTE 5 bloques de madera (cualquier tipo) + mesa de trabajo. Sin nada más.</summary>
		public override void AddRecipes()
		{
			CreateRecipe()
				.AddRecipeGroup(RecipeGroupID.Wood, 5)   // grupo "Wood": madera normal, boreal, caoba, ébano, sombra, palmera, perlada, ceniza...
				.AddTile(TileID.WorkBenches)
				.Register();
		}
	}
}
