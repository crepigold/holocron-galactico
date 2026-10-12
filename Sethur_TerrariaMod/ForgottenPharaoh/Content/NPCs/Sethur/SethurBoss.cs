using System;
using System.Collections.Generic;
using ForgottenPharaoh.Common.Systems;
using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.Items;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.Audio;
using Terraria.GameContent.Bestiary;
using Terraria.GameContent.ItemDropRules;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.NPCs.Sethur
{
	/// <summary>Estados de la máquina de estados del jefe (se guarda en NPC.ai[0], por lo que se sincroniza).</summary>
	public enum SethurState
	{
		Intro = 0,
		Reposition = 1,       // flotar / descansar entre ataques
		SandColumns = 2,
		SolarDiscs = 3,
		ClawStrike = 4,
		DesertHands = 5,
		SandTornado = 6,
		Dash = 7,
		SolarRay = 8,
		Obelisks = 9,
		SolarBlasts = 10,
		PhaseTransition = 11,
		Dying = 12
	}

	/// <summary>
	/// Sethur, el Faraón Olvidado. Jefe de 4 fases con dificultad de Hardmode, invocable desde el inicio de la partida.
	///
	/// Organización (clase parcial):
	///   SethurBoss.cs          propiedades, SetDefaults, botín, escalado de dificultad, sincronización extra, muerte
	///   SethurBoss.AI.cs       máquina de estados, fases y movimiento
	///   SethurBoss.Attacks.cs  cada ataque con su línea de tiempo y telegrafía
	///   SethurBoss.Draw.cs     animación (FindFrame), dibujo por capas y efectos visuales
	///
	/// Sincronización multijugador: toda decisión (cambio de estado, objetivo fijado, creación de proyectiles) la toma
	/// únicamente el servidor / un solo jugador; los clientes reciben NPC.ai[] y los datos de SendExtraAI cuando se llama
	/// a NPC.netUpdate, y ejecutan localmente solo lo visual (temporizadores, partículas, sonido, animación).
	/// </summary>
	[AutoloadBossHead]
	public partial class SethurBoss : ModNPC
	{
		public override void SetStaticDefaults()
		{
			// Los fotogramas reales viven en las hojas de animación (ver SethurAnimations); la textura del NPC es el retrato.
			Main.npcFrameCount[Type] = 1;

			NPCID.Sets.MPAllowedEnemies[Type] = true;      // permite invocarlo en multijugador desde el objeto
			NPCID.Sets.BossBestiaryPriority.Add(Type);

			NPCID.Sets.SpecificDebuffImmunity[Type][BuffID.Confused] = true;
			NPCID.Sets.SpecificDebuffImmunity[Type][BuffID.Poisoned] = true;
			NPCID.Sets.SpecificDebuffImmunity[Type][BuffID.OnFire] = true;

			// Estela de posiciones anteriores (postimágenes de la embestida)
			NPCID.Sets.TrailCacheLength[Type] = 10;
			NPCID.Sets.TrailingMode[Type] = 3;

			NPCID.Sets.NPCBestiaryDrawModifiers drawModifiers = new NPCID.Sets.NPCBestiaryDrawModifiers()
			{
				CustomTexturePath = "ForgottenPharaoh/Content/NPCs/Sethur/SethurBoss",
				PortraitScale = 0.7f,
				PortraitPositionYOverride = 10f,
			};
			NPCID.Sets.NPCBestiaryDrawOffset.Add(Type, drawModifiers);

			if (!Main.dedServ)
				SethurAnimations.Preload();
		}

		public override void SetDefaults()
		{
			NPC.width = 84;
			NPC.height = 150;
			NPC.damage = SethurBalance.ContactDamage;
			NPC.defense = SethurBalance.DefenseClassic;
			NPC.lifeMax = SethurBalance.LifeClassic;
			NPC.HitSound = SoundID.NPCHit4;
			NPC.DeathSound = SoundID.NPCDeath1;
			NPC.knockBackResist = 0f;
			NPC.noGravity = true;
			NPC.noTileCollide = true;
			NPC.lavaImmune = true;
			NPC.value = Item.buyPrice(gold: 25);
			NPC.SpawnWithHigherTime(30);
			NPC.boss = true;
			NPC.npcSlots = 15f;          // ocupa huecos de aparición: evita enemigos aleatorios durante el combate
			NPC.aiStyle = -1;            // IA propia
			NPC.netAlways = true;        // posición y temporizadores sincronizados cada tick (jefe grande y rápido)
			Music = MusicID.Boss3;
		}

		public override void SetBestiary(BestiaryDatabase database, BestiaryEntry bestiaryEntry)
		{
			bestiaryEntry.Info.AddRange(new List<IBestiaryInfoElement>
			{
				new MoonLordPortraitBackgroundProviderBestiaryInfoElement(),
				new FlavorTextBestiaryInfoElement("Mods.ForgottenPharaoh.Bestiary.SethurBoss")
			});
		}

		/// <summary>
		/// El juego llama a este método DESPUÉS de aplicar su multiplicador nativo de dificultad a lifeMax/damage.
		/// Para no multiplicar dos veces, la vida y la defensa se fijan aquí de forma absoluta por dificultad
		/// (Classic 45.000 / Expert 60.000 / Master 90.000) y solo se aplica 'balance' (escalado por jugadores).
		/// </summary>
		public override void ApplyDifficultyAndPlayerScaling(int numPlayers, float balance, float bossAdjustment)
		{
			// si aún no se ha inicializado la vida (life == 0) o está al máximo, el jefe nace con la vida completa
			float ratio = (NPC.lifeMax > 0 && NPC.life > 0) ? Math.Min(1f, NPC.life / (float)NPC.lifeMax) : 1f;
			NPC.lifeMax = (int)(SethurBalance.TargetLife * balance);
			NPC.life = (int)(NPC.lifeMax * ratio);
			NPC.defense = SethurBalance.TargetDefense;
		}

		// ------------------------------------------------------------------ botín
		public override void ModifyNPCLoot(NPCLoot npcLoot)
		{
			// Orden de vanilla para el bestiario: modo Classic, Expert (bolsa) y Master
			LeadingConditionRule notExpertRule = new LeadingConditionRule(new Conditions.NotExpert());

			// Máscara: 1/7. Un arma (de las 3) garantizada, no obligatoria para progresar. Fragmentos Reales: 12-18.
			notExpertRule.OnSuccess(ItemDropRule.Common(ModContent.ItemType<SethurMask>(), 7));
			notExpertRule.OnSuccess(ItemDropRule.OneFromOptionsNotScalingWithLuck(1,
				ModContent.ItemType<PharaohSickle>(),
				ModContent.ItemType<DesertStaff>(),
				ModContent.ItemType<SolarDisc>()));
			notExpertRule.OnSuccess(ItemDropRule.Common(ModContent.ItemType<RoyalFragment>(), 1, 12, 18));
			npcLoot.Add(notExpertRule);

			// En Expert/Master todo sale de la bolsa del tesoro (ver SethurBossBag)
			npcLoot.Add(ItemDropRule.BossBag(ModContent.ItemType<SethurBossBag>()));
		}

		public override void BossLoot(ref int potionType)
		{
			potionType = ItemID.GreaterHealingPotion;
		}

		public override void OnKill()
		{
			// Progresión propia (no se toca ningún downedBoss de vanilla). SetEventFlagCleared envía WorldData en MP.
			NPC.SetEventFlagCleared(ref SethurWorldSystem.downedSethur, -1);
		}

		// ------------------------------------------------------------------ muerte en dos tiempos
		/// <summary>
		/// Al llegar a 0 de vida NO muere: arranca la animación de muerte (desintegración en polvo dorado) y solo
		/// cuando termina (Aux = 1) se permite la muerte real, con su botín y su evento de progresión.
		/// </summary>
		public override bool CheckDead()
		{
			if (State == SethurState.Dying && Aux >= 1f)
				return true;

			if (State != SethurState.Dying)
			{
				State = SethurState.Dying;
				Timer = 0f;
				Aux = 0f;
				NPC.life = 1;
				NPC.dontTakeDamage = true;
				NPC.velocity *= 0.3f;
				NPC.netUpdate = true;
			}
			return false;
		}

		// ------------------------------------------------------------------ daño por contacto
		public override bool CanHitPlayer(Player target, ref int cooldownSlot)
		{
			cooldownSlot = ImmunityCooldownID.Bosses;   // evita que el daño de otras fuentes anule sus golpes
			return ContactDamageActive;
		}

		// ------------------------------------------------------------------ sincronización extra
		public override void SendExtraAI(System.IO.BinaryWriter writer)
		{
			writer.Write(lockedTarget.X);
			writer.Write(lockedTarget.Y);
			writer.Write(aimAngle);
			writer.Write((byte)comboIndex);
			writer.Write((byte)lastAttack);
			writer.Write((byte)dashesLeft);
			writer.Write((sbyte)sideSign);
		}

		public override void ReceiveExtraAI(System.IO.BinaryReader reader)
		{
			lockedTarget = new Vector2(reader.ReadSingle(), reader.ReadSingle());
			aimAngle = reader.ReadSingle();
			comboIndex = reader.ReadByte();
			lastAttack = reader.ReadByte();
			dashesLeft = reader.ReadByte();
			sideSign = reader.ReadSByte();
		}
	}
}
