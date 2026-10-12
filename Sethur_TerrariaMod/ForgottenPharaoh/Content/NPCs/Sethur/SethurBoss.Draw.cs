using System;
using ForgottenPharaoh.Common.Utilities;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using ReLogic.Content;
using Terraria;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.NPCs.Sethur
{
	/// <summary>
	/// Animación y dibujo. El jefe NO dibuja una hoja entera: cada tick se elige (animación, fotograma) en
	/// ComputeAnimation() a partir del estado sincronizado, y PreDraw recorta ese fotograma de su hoja.
	/// Los sprites miran a la derecha; para mirar a la izquierda se reflejan (salvo la animación de giro).
	/// </summary>
	public partial class SethurBoss
	{
		public const float DrawScale = 1f;

		// ---- estado visual local (no se sincroniza: se deduce del estado sincronizado)
		private int animTick;
		private int hitFlash;
		private int hurtTicks;
		private int hurtCooldown;
		private int turnTicks;
		private bool turnToRight;
		private bool moving;

		public SethurAnim CurAnim { get; private set; } = SethurAnim.Idle;
		public int CurFrame { get; private set; }

		/// <summary>Se refleja el sprite cuando mira a la izquierda; la animación de giro ya incluye ambos sentidos.</summary>
		public bool DrawFlipped => NPC.spriteDirection == -1 && CurAnim != SethurAnim.Turn;

		// ================================================================== animación
		private static int Scale(float t, int duration, int frames)
		{
			return Utils.Clamp((int)(t / duration * frames), 0, frames - 1);
		}

		/// <summary>Elige animación y fotograma a partir del estado, el temporizador y la velocidad.</summary>
		private void ComputeAnimation()
		{
			SethurAnim anim = SethurAnim.Idle;
			int frame = 0;
			float t = Timer;

			switch (State)
			{
				case SethurState.Intro:
					anim = SethurAnim.Idle;
					frame = (animTick / 2) % 32;
					break;

				case SethurState.Reposition:
				{
					float speed = NPC.velocity.Length();
					if (speed > 3.4f)
						moving = true;
					else if (speed < 2.2f)
						moving = false;
					if (moving)
					{
						anim = SethurAnim.Move;
						frame = (animTick / 2) % 24;
					}
					else
					{
						anim = SethurAnim.Idle;
						frame = (animTick / 2) % 32;
					}
					break;
				}

				case SethurState.SandColumns: anim = SethurAnim.SandRain; frame = Scale(t, ColumnsDuration, 24); break;
				case SethurState.DesertHands: anim = SethurAnim.SandRain; frame = Scale(t, HandsDuration, 24); break;
				case SethurState.SolarDiscs: anim = SethurAnim.SolarDisc; frame = Scale(t, DiscsDuration, 24); break;
				case SethurState.SolarBlasts: anim = SethurAnim.SolarDisc; frame = Scale(t, BlastsDuration, 24); break;
				case SethurState.ClawStrike: anim = SethurAnim.Claw; frame = Scale(t, ClawDuration, 24); break;
				case SethurState.SandTornado: anim = SethurAnim.Obelisk; frame = Scale(t, TornadoDuration, 24); break;
				case SethurState.Obelisks: anim = SethurAnim.Obelisk; frame = Scale(t, ObeliskDuration, 24); break;
				case SethurState.Dash: anim = SethurAnim.Move; frame = animTick % 24; break;

				case SethurState.SolarRay:
					anim = SethurAnim.SolarRay;
					frame = t < RayChargeEnd ? (int)(t * 21f / RayChargeEnd) : 21 + ((int)(t - RayChargeEnd) / 3) % 11;
					break;

				case SethurState.PhaseTransition: anim = SethurAnim.Transition; frame = Scale(t, TransitionDuration, 32); break;
				case SethurState.Dying: anim = SethurAnim.Death; frame = Scale(t, DeathDuration, 24); break;
			}

			// giro y daño solo se muestran cuando el jefe está tranquilo (no interrumpen ataques telegrafiados)
			if (State == SethurState.Reposition)
			{
				if (turnTicks > 0)
				{
					anim = SethurAnim.Turn;
					int idx = Utils.Clamp(16 - turnTicks, 0, 15);
					frame = turnToRight ? idx : 15 - idx;
				}
				else if (hurtTicks > 0)
				{
					anim = SethurAnim.Hurt;
					frame = Utils.Clamp(24 - hurtTicks, 0, 23);
				}
			}

			CurAnim = anim;
			CurFrame = Utils.Clamp(frame, 0, SethurAnimations.FrameCount[(int)anim] - 1);
		}

		public override void FindFrame(int frameHeight)
		{
			// El fotograma real lo elige ComputeAnimation(); aquí solo mantenemos NPC.frame válido (retrato, 1 fotograma)
			// y refrescamos la selección para que el dibujo use siempre el valor más reciente.
			ComputeAnimation();
			NPC.frame.Y = 0;
		}

		/// <summary>Posición en el mundo de un anclaje del fotograma actual (cabeza, orbe del báculo, pecho, mano), con reflejo.</summary>
		public Vector2 GetAnchorWorld(int anchor)
		{
			Vector2 a = SethurAnimations.GetAnchor(CurAnim, CurFrame, anchor);
			float x = a.X - SethurAnimations.CellAnchorX;
			if (DrawFlipped)
				x = -x;
			return NPC.Center + new Vector2(x, a.Y - SethurAnimations.CellAnchorY) * DrawScale + new Vector2(0f, NPC.gfxOffY);
		}

		// ================================================================== golpes y efectos ambientales
		public override void HitEffect(NPC.HitInfo hit)
		{
			if (Main.netMode == NetmodeID.Server)
				return;

			hitFlash = 7;
			if (State == SethurState.Reposition && hurtCooldown <= 0 && turnTicks <= 0 && hit.Damage >= 40)
			{
				hurtTicks = 24;
				hurtCooldown = 150;
			}

			int n = Utils.Clamp(2 + hit.Damage / 90, 2, 8);
			for (int i = 0; i < n; i++)
			{
				Dust d = Dust.NewDustDirect(NPC.position, NPC.width, NPC.height, SethurDust.Sand, Main.rand.NextFloat(-2f, 2f), Main.rand.NextFloat(-3f, 1f), 0, default, 1.3f);
				d.noGravity = true;
			}
		}

		private void AmbientEffects()
		{
			if (Main.dedServ)
				return;

			Color c = PhaseColor();
			Lighting.AddLight(NPC.Center, c.R / 255f * 0.9f, c.G / 255f * 0.75f, c.B / 255f * 0.45f);

			// arena que se desprende de la tela inferior (poco frecuente: barato)
			if (animTick % 5 == 0 && NPC.Opacity > 0.4f)
			{
				Vector2 pos = NPC.Bottom + new Vector2(Main.rand.NextFloat(-26f, 26f), Main.rand.NextFloat(-30f, 20f));
				Dust d = Dust.NewDustPerfect(pos, SethurDust.Sand, new Vector2(NPC.velocity.X * -0.15f, Main.rand.NextFloat(0.4f, 1.4f)), 0, default, 1.1f);
				d.noGravity = true;
			}

			// la arena responde al movimiento: estela cuando va rápido (embestidas, reposicionamientos)
			float speed = NPC.velocity.Length();
			if (speed > 6f && animTick % 2 == 0)
			{
				Dust d = Dust.NewDustPerfect(NPC.Center + Main.rand.NextVector2Circular(30f, 50f), SethurDust.Sand, -NPC.velocity * 0.25f, 0, default, 1.3f);
				d.noGravity = true;
			}

			// chispas del halo, más intensas en las fases tardías
			if (animTick % 8 == 0 && Phase >= 1)
			{
				Vector2 head = GetAnchorWorld(SethurAnimations.AnchorHead);
				Dust d = Dust.NewDustPerfect(head + Main.rand.NextVector2CircularEdge(46f, 46f), Phase >= 3 ? SethurDust.Blue : SethurDust.Gold,
					Main.rand.NextVector2Circular(0.6f, 0.6f), 0, default, 1.1f);
				d.noGravity = true;
			}
		}

		// ================================================================== dibujo
		public Color PhaseColor()
		{
			switch (Phase)
			{
				case 0: return SethurHelpers.GoldColor;
				case 1: return new Color(255, 178, 70);
				case 2: return SethurHelpers.SunColor;
				default:
					// fase final: dorado y azul intenso
					return Color.Lerp(SethurHelpers.GoldColor, SethurHelpers.BlueColor, 0.5f + 0.5f * (float)Math.Sin(animTick * 0.05f));
			}
		}

		/// <summary>Cuánto se intensifica el resplandor por cargas de ataque (rayo, transición, muerte).</summary>
		private float ChargeBoost()
		{
			switch (State)
			{
				case SethurState.SolarRay:
					return Timer < RayChargeEnd ? MathHelper.SmoothStep(0f, 1f, Timer / RayChargeEnd) : (Timer < RayFireEnd ? 1f : 0.4f);
				case SethurState.PhaseTransition:
					return Math.Max(0f, 1f - Math.Abs(Timer - 40f) / 40f);
				case SethurState.SolarDiscs:
					return Timer < 36f ? Timer / 36f * 0.7f : 0.2f;
				case SethurState.SolarBlasts:
					return Timer < 40f ? Timer / 40f * 0.7f : 0.2f;
				case SethurState.SandColumns:
				case SethurState.DesertHands:
					return Timer > 20f && Timer < 60f ? 0.5f : 0.1f;
				default:
					return 0f;
			}
		}

		public override bool PreDraw(SpriteBatch spriteBatch, Vector2 screenPos, Color drawColor)
		{
			// Bestiario: solo el retrato estático
			if (NPC.IsABestiaryIconDummy)
			{
				Texture2D portrait = Terraria.GameContent.TextureAssets.Npc[Type].Value;
				spriteBatch.Draw(portrait, NPC.Center - screenPos, null, Color.White, 0f, new Vector2(portrait.Width / 2f, SethurAnimations.CellAnchorY), 0.9f, SpriteEffects.None, 0f);
				return false;
			}

			SethurAnim anim = CurAnim;
			Texture2D sheet = SethurAnimations.GetSheet(anim);
			Rectangle src = SethurAnimations.GetFrameRect(anim, CurFrame);
			SpriteEffects fx = DrawFlipped ? SpriteEffects.FlipHorizontally : SpriteEffects.None;
			Vector2 origin = new Vector2(SethurAnimations.CellAnchorX, SethurAnimations.CellAnchorY);
			Vector2 pos = NPC.Center - screenPos + new Vector2(0f, NPC.gfxOffY);
			float opacity = NPC.Opacity;
			Color body = Color.Lerp(drawColor, Color.White, 0.72f) * opacity;
			Color phaseColor = PhaseColor();
			float boost = ChargeBoost();
			float t = animTick;

			// ---------------- detrás del cuerpo: halo solar, fragmentos traseros, telegrafías, postimágenes
			DrawHalo(spriteBatch, screenPos, phaseColor, boost, opacity, t);
			DrawShards(spriteBatch, screenPos, opacity, t, false);
			DrawTelegraphs(spriteBatch, screenPos);

			if (State == SethurState.Dash && Timer >= 36f && Timer < 72f)
			{
				for (int i = 1; i < 9; i++)
				{
					Vector2 old = NPC.oldPos[i] + NPC.Size / 2f;
					if (old == Vector2.Zero || NPC.oldPos[i] == Vector2.Zero)
						continue;
					float k = 1f - i / 9f;
					spriteBatch.Draw(sheet, old - screenPos, src, SethurHelpers.Additive(phaseColor, 0.55f * k * opacity), 0f, origin, DrawScale, fx, 0f);
				}
			}

			// ---------------- cuerpo
			spriteBatch.Draw(sheet, pos, src, body, 0f, origin, DrawScale, fx, 0f);

			// resplandor propio que crece con las fases (aditivo, mismo fotograma)
			float glowAmt = Phase * 0.09f + boost * 0.18f;
			if (glowAmt > 0.01f)
				spriteBatch.Draw(sheet, pos, src, SethurHelpers.Additive(phaseColor, glowAmt * opacity), 0f, origin, DrawScale, fx, 0f);

			// destello al recibir un golpe
			if (hitFlash > 0)
				spriteBatch.Draw(sheet, pos, src, SethurHelpers.Additive(Color.White, hitFlash / 7f * 0.55f * opacity), 0f, origin, DrawScale, fx, 0f);

			// ---------------- delante del cuerpo: orbe del báculo, fragmentos delanteros
			DrawOrbFlare(spriteBatch, screenPos, phaseColor, boost, opacity, t);
			DrawShards(spriteBatch, screenPos, opacity, t, true);

			return false;
		}

		private void DrawHalo(SpriteBatch sb, Vector2 screenPos, Color phaseColor, float boost, float opacity, float t)
		{
			Vector2 head = GetAnchorWorld(SethurAnimations.AnchorHead) - screenPos;
			Texture2D halo = SethurAssets.Halo;
			Texture2D glow = SethurAssets.Glow;
			Vector2 hOrigin = halo.Size() / 2f;
			float pulse = 1f + 0.05f * (float)Math.Sin(t * 0.07f);
			float scale = (0.72f + 0.07f * Phase + 0.25f * boost) * pulse;
			float intensity = (0.85f + 0.10f * Phase + 0.5f * boost) * opacity;

			// brillo suave de fondo
			sb.Draw(glow, head, null, SethurHelpers.Additive(phaseColor, 0.55f * intensity), 0f, glow.Size() / 2f, 1.5f + boost, SpriteEffects.None, 0f);
			// disco solar giratorio
			sb.Draw(halo, head, null, SethurHelpers.Additive(SethurHelpers.GoldColor, intensity), t * 0.004f, hOrigin, scale, SpriteEffects.None, 0f);
			// anillo exterior contrarrotatorio (fases 3-4); en la fase final, azul intenso
			if (Phase >= 2)
			{
				Color ringColor = Phase >= 3 ? SethurHelpers.BlueColor : SethurHelpers.SunColor;
				sb.Draw(halo, head, null, SethurHelpers.Additive(ringColor, intensity * 0.65f), -t * 0.006f, hOrigin, scale * 1.28f, SpriteEffects.None, 0f);
			}
		}

		private void DrawOrbFlare(SpriteBatch sb, Vector2 screenPos, Color phaseColor, float boost, float opacity, float t)
		{
			Vector2 orb = GetAnchorWorld(SethurAnimations.AnchorOrb) - screenPos;
			Texture2D flare = SethurAssets.Flare;
			float scale = 0.42f + 0.06f * (float)Math.Sin(t * 0.12f) + boost * 1.6f;
			if (State == SethurState.SolarRay && Timer >= RayChargeEnd && Timer < RayFireEnd)
				scale = 1.5f + 0.15f * (float)Math.Sin(t * 0.5f);
			sb.Draw(flare, orb, null, SethurHelpers.Additive(phaseColor, 0.7f * opacity), t * 0.03f, flare.Size() / 2f, scale, SpriteEffects.None, 0f);
		}

		private void DrawShards(SpriteBatch sb, Vector2 screenPos, float opacity, float t, bool front)
		{
			Texture2D shard = SethurAssets.Shard;
			int frameH = shard.Height / 3;
			int count = 3 + Phase;
			Vector2 center = GetAnchorWorld(SethurAnimations.AnchorChest) - screenPos;
			for (int i = 0; i < count; i++)
			{
				float a = t * 0.022f * (1f + 0.1f * Phase) + i * MathHelper.TwoPi / count;
				bool isFront = Math.Sin(a) > 0.0;
				if (isFront != front)
					continue;
				Vector2 off = new Vector2((float)Math.Cos(a) * 98f, (float)Math.Sin(a) * 40f - 22f + (float)Math.Sin(t * 0.05f + i) * 4f);
				Rectangle fr = new Rectangle(0, ((animTick / 8 + i) % 3) * frameH, shard.Width, frameH);
				float s = front ? 1f : 0.82f;
				sb.Draw(shard, center + off, fr, Color.White * (opacity * (front ? 1f : 0.75f)), 0.12f * (float)Math.Sin(t * 0.04f + i), new Vector2(shard.Width / 2f, frameH / 2f), s, SpriteEffects.None, 0f);
			}
		}

		/// <summary>Líneas y arcos que avisan de embestida, rayo y zarpazo antes de que hagan daño.</summary>
		private void DrawTelegraphs(SpriteBatch sb, Vector2 screenPos)
		{
			Color warn = new Color(255, 120, 60);

			if (State == SethurState.Dash && Timer >= 22f && Timer < 40f)
			{
				float k = (Timer - 22f) / 18f;
				Vector2 a = NPC.Center - screenPos;
				Vector2 b = a + aimAngle.ToRotationVector2() * 1000f;
				SethurHelpers.DrawLine(sb, a, b, SethurHelpers.Additive(warn, 0.22f * k), 34f * (1.1f - 0.4f * k));
				SethurHelpers.DrawLine(sb, a, b, SethurHelpers.Additive(SethurHelpers.SunColor, 0.8f * k), 3f);
			}

			if (State == SethurState.SolarRay && Timer >= 44f && Timer < RayChargeEnd)
			{
				float k = (Timer - 44f) / (RayChargeEnd - 44f);
				GetRaySweep(out float start, out float end);
				Vector2 o = GetAnchorWorld(SethurAnimations.AnchorOrb) - screenPos;
				SethurHelpers.DrawLine(sb, o, o + start.ToRotationVector2() * 1500f, SethurHelpers.Additive(SethurHelpers.SunColor, 0.9f * k), 3f);
				SethurHelpers.DrawLine(sb, o, o + start.ToRotationVector2() * 1500f, SethurHelpers.Additive(warn, 0.25f * k), 22f);
				SethurHelpers.DrawLine(sb, o, o + end.ToRotationVector2() * 1500f, SethurHelpers.Additive(warn, 0.5f * k), 2f);
			}

			if (State == SethurState.ClawStrike && Timer >= 8f && Timer < 28f && NPC.target >= 0 && NPC.target < 255)
			{
				float k = Math.Min(1f, (Timer - 8f) / 14f);
				float ang = Timer >= 18f ? aimAngle : (Main.player[NPC.target].Center - NPC.Center).ToRotation();
				Texture2D slash = ModContent.Request<Texture2D>("ForgottenPharaoh/Content/Projectiles/Boss/SethurClawSlash").Value;
				int fh = slash.Height / 6;
				Rectangle fr = new Rectangle(0, 3 * fh, slash.Width, fh);
				Vector2 at = NPC.Center + ang.ToRotationVector2() * 20f - screenPos;
				sb.Draw(slash, at, fr, SethurHelpers.Additive(warn, 0.55f * k), ang, new Vector2(14f, fh / 2f), 1f, SpriteEffects.None, 0f);
			}
		}
	}
}
