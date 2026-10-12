using ForgottenPharaoh.Common.Utilities;
using ForgottenPharaoh.Content.Projectiles.Weapons;
using Microsoft.Xna.Framework;
using Terraria;
using Terraria.DataStructures;
using Terraria.ID;
using Terraria.ModLoader;

namespace ForgottenPharaoh.Content.Items
{
	/// <summary>Hoz del Faraón (cuerpo a cuerpo): 46 de daño; cada golpe lanza además una onda creciente dorada (60% del daño).</summary>
	public class PharaohSickle : ModItem
	{
		public override void SetDefaults()
		{
			Item.damage = 46;
			Item.DamageType = DamageClass.Melee;
			Item.width = 52;
			Item.height = 52;
			Item.useTime = 24;
			Item.useAnimation = 24;
			Item.useStyle = ItemUseStyleID.Swing;
			Item.knockBack = 5.5f;
			Item.crit = 6;
			Item.value = Item.sellPrice(gold: 8);
			Item.rare = ItemRarityID.Pink;
			Item.UseSound = SoundID.Item1;
			Item.autoReuse = true;
			Item.shoot = ModContent.ProjectileType<PharaohSickleWave>();
			Item.shootSpeed = 11f;
		}

		public override bool Shoot(Player player, EntitySource_ItemUse_WithAmmo source, Vector2 position, Vector2 velocity, int type, int damage, float knockback)
		{
			Projectile.NewProjectile(source, position, velocity, type, (int)(damage * 0.6f), knockback, player.whoAmI);
			return false;
		}

		public override void MeleeEffects(Player player, Rectangle hitbox)
		{
			if (Main.rand.NextBool(3))
			{
				Dust d = Dust.NewDustDirect(new Vector2(hitbox.X, hitbox.Y), hitbox.Width, hitbox.Height, SethurDust.Gold, 0f, 0f, 0, default, 1.1f);
				d.noGravity = true;
			}
		}
	}
}
