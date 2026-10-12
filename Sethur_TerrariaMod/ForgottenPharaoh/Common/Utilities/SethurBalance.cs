using Terraria;

namespace ForgottenPharaoh.Common.Utilities
{
	/// <summary>
	/// Todos los números de balance de Sethur en un único sitio.
	///
	/// Vida:     Classic 45.000 / Expert 60.000 / Master 90.000. Los valores se asignan de forma ABSOLUTA en
	///           SethurBoss.ApplyDifficultyAndPlayerScaling (que el juego llama DESPUÉS de aplicar su multiplicador
	///           nativo), de modo que no se multiplican dos veces. Solo se aplica el factor 'balance' del juego, que
	///           es el escalado por número de jugadores.
	/// Daño:     el daño de contacto (NPC.damage) lo escala el juego (x2 Expert, x3 Master). El daño de proyectiles
	///           hostiles también lo multiplica el juego al golpear, por eso se entrega un valor base reducido en
	///           Expert/Master (ver ProjectileDamage).
	/// Patrones: más proyectiles, más velocidad y descansos más cortos según la dificultad (Tier).
	/// </summary>
	public static class SethurBalance
	{
		// ---- vida y defensa por dificultad
		public const int LifeClassic = 45000;
		public const int LifeExpert = 60000;
		public const int LifeMaster = 90000;

		public const int DefenseClassic = 38;
		public const int DefenseExpert = 46;
		public const int DefenseMaster = 54;

		/// <summary>Daño de contacto base (Classic). El juego lo multiplica en Expert/Master.</summary>
		public const int ContactDamage = 70;

		// ---- umbrales de fase (fracción de vida)
		public const float Phase2Threshold = 0.75f;   // La tormenta del desierto
		public const float Phase3Threshold = 0.40f;   // El juicio solar
		public const float Phase4Threshold = 0.15f;   // El dios olvidado

		/// <summary>0 = Classic, 1 = Expert, 2 = Master.</summary>
		public static int Tier => Main.masterMode ? 2 : (Main.expertMode ? 1 : 0);

		/// <summary>Multiplicador de velocidad de proyectiles y movimiento.</summary>
		public static float Speed => 1f + 0.10f * Tier;

		/// <summary>Multiplicador de los tiempos de descanso entre ataques (menor = más agresivo).</summary>
		public static float RestScale => 1f - 0.12f * Tier;

		/// <summary>Proyectiles extra por ataque según la dificultad.</summary>
		public static int ExtraProjectiles => Tier;

		/// <summary>Vida objetivo de la dificultad actual.</summary>
		public static int TargetLife => Main.masterMode ? LifeMaster : (Main.expertMode ? LifeExpert : LifeClassic);

		/// <summary>Defensa objetivo de la dificultad actual.</summary>
		public static int TargetDefense => Main.masterMode ? DefenseMaster : (Main.expertMode ? DefenseExpert : DefenseClassic);

		/// <summary>
		/// Daño que hay que pasar a Projectile.NewProjectile. Classic: el valor tal cual. Expert/Master: el juego
		/// multiplica el daño de los proyectiles hostiles (x2 / x3), así que se baja la base para que el golpe efectivo
		/// sea ~1,6x (Expert) y ~2,1x (Master) el de Classic en lugar de 2x/3x.
		/// </summary>
		public static int ProjectileDamage(int classicDamage)
		{
			float factor = Main.masterMode ? 0.70f : (Main.expertMode ? 0.80f : 1f);
			return (int)(classicDamage * factor);
		}

		// ---- daño base (Classic) de cada ataque
		public const int DmgSandColumn = 62;
		public const int DmgSandHand = 70;
		public const int DmgTornado = 55;
		public const int DmgSolarDisc = 58;
		public const int DmgBeam = 82;
		public const int DmgSolarBlast = 88;
		public const int DmgObeliskBolt = 52;
		public const int DmgClawSlash = 76;

		/// <summary>Descanso base (ticks) entre ataques en cada fase (0..3).</summary>
		public static readonly int[] BaseRest = { 78, 58, 44, 16 };

		/// <summary>Descanso largo tras completar la secuencia final de la fase 4 (ventana para recuperarse).</summary>
		public const int FinalSequenceRest = 110;
	}
}
