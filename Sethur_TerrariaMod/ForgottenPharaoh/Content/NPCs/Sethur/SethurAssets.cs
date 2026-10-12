using Microsoft.Xna.Framework.Graphics;
using ReLogic.Content;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.NPCs.Sethur
{
	/// <summary>Texturas de efectos compartidas (halo, brillo, anillo, rayo, destello, fragmentos), cargadas bajo demanda.</summary>
	public static class SethurAssets
	{
		private const string Dir = "ForgottenPharaoh/Assets/Textures/";

		private static Asset<Texture2D> halo, glow, ring, beam, flare, shard;

		private static Asset<Texture2D> Req(string name)
		{
			return ModContent.Request<Texture2D>(Dir + name);
		}

		/// <summary>Disco solar con anillos y rayos (192x192).</summary>
		public static Texture2D Halo => (halo ??= Req("SethurHalo")).Value;

		/// <summary>Brillo suave con alfa real (128x128), para mezcla aditiva.</summary>
		public static Texture2D Glow => (glow ??= Req("SethurGlow")).Value;

		/// <summary>Anillo de aviso con marcas (128x128).</summary>
		public static Texture2D Ring => (ring ??= Req("SethurRing")).Value;

		/// <summary>Segmento repetible del rayo solar (96x48).</summary>
		public static Texture2D Beam => (beam ??= Req("SethurBeam")).Value;

		/// <summary>Orbe con rayos (64x64): inicio/impacto del rayo y carga del báculo.</summary>
		public static Texture2D Flare => (flare ??= Req("SethurFlare")).Value;

		/// <summary>Fragmentos de obelisco en órbita (3 fotogramas verticales de 24x40).</summary>
		public static Texture2D Shard => (shard ??= Req("SethurShard")).Value;

		public static void Unload()
		{
			halo = glow = ring = beam = flare = shard = null;
		}
	}
}
