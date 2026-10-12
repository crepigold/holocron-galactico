using System.IO;
using ForgottenPharaoh.Content.NPCs.Sethur;
using Terraria;
using Terraria.ModLoader;
using Terraria.ModLoader.IO;

namespace ForgottenPharaoh.Common.Systems
{
	/// <summary>
	/// Progresión propia del mod: no toca ningún flag NPC.downedBoss* de vanilla.
	/// Se guarda en el mundo (TagCompound) y se sincroniza con los clientes (NetSend/NetReceive).
	/// Se marca en SethurBoss.OnKill con NPC.SetEventFlagCleared (que además envía MessageID.WorldData).
	/// </summary>
	public class SethurWorldSystem : ModSystem
	{
		public static bool downedSethur = false;

		public override void ClearWorld()
		{
			downedSethur = false;
		}

		public override void SaveWorldData(TagCompound tag)
		{
			if (downedSethur)
				tag["downedSethur"] = true;
		}

		public override void LoadWorldData(TagCompound tag)
		{
			downedSethur = tag.ContainsKey("downedSethur");
		}

		public override void NetSend(BinaryWriter writer)
		{
			writer.WriteFlags(downedSethur);
		}

		public override void NetReceive(BinaryReader reader)
		{
			reader.ReadFlags(out downedSethur);
		}

		public override void Unload()
		{
			SethurAnimations.Unload();
			SethurAssets.Unload();
		}
	}
}
