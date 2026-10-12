using ForgottenPharaoh.Content.Projectiles.Weapons;
using Terraria;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Buffs
{
	/// <summary>Mantiene vivo al Espíritu de Arena mientras exista; al pulsar el icono se despide al minion.</summary>
	public class SandSpiritBuff : ModBuff
	{
		public override void SetStaticDefaults()
		{
			Main.buffNoSave[Type] = true;
			Main.buffNoTimeDisplay[Type] = true;
		}

		public override void Update(Player player, ref int buffIndex)
		{
			if (player.ownedProjectileCounts[ModContent.ProjectileType<SandSpiritMinion>()] > 0)
			{
				player.buffTime[buffIndex] = 18000;
			}
			else
			{
				player.DelBuff(buffIndex);
				buffIndex--;
			}
		}
	}
}
