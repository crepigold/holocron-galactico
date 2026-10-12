"""
generar_extras.py - Exporta sprites de proyectiles, objetos, UI y texturas de efectos a <mod>/...
Uso: python3 generar_extras.py <carpeta_del_mod>
Las rutas siguen la convencion de tModLoader: la textura de una clase = namespace + nombre de clase.
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extras as E
from boss import render_frame
from anims import ANIMS


def save(mod, rel, arr):
    path = os.path.join(mod, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(np.ascontiguousarray(arr), "RGBA").save(path, optimize=True)
    print("  %-62s %dx%d" % (rel, arr.shape[1], arr.shape[0]))


def anim(fn, n, **kw):
    return E.stack([fn(k, n, **kw) if kw else fn(k, n) for k in range(n)], vertical=True)


def main(mod):
    P = "Content/Projectiles"
    # ---- proyectiles hostiles del jefe
    save(mod, P + "/Boss/SethurSandColumn.png", anim(E.sand_column, 8))
    save(mod, P + "/Boss/SethurSandHand.png", anim(E.sand_hand, 8))
    save(mod, P + "/Boss/SethurTornado.png", anim(E.tornado, 8))
    save(mod, P + "/Boss/SethurSolarDisc.png", anim(E.solar_disc, 4))
    save(mod, P + "/Boss/SethurSolarBlast.png", anim(E.solar_blast, 8))
    save(mod, P + "/Boss/SethurObelisk.png", anim(E.obelisk, 4))
    save(mod, P + "/Boss/SethurObeliskBolt.png", anim(E.obelisk_bolt, 4))
    save(mod, P + "/Boss/SethurClawSlash.png", anim(E.claw_slash, 6))
    # ---- proyectiles del jugador
    save(mod, P + "/Weapons/PharaohSickleWave.png", E.stack([E.sickle_wave(k, 4) for k in range(4)], vertical=True))
    save(mod, P + "/Weapons/SolarDiscProjectile.png", anim(E.player_solar_disc, 4))
    save(mod, P + "/Weapons/SandSpiritMinion.png", anim(E.sand_spirit, 4))
    save(mod, P + "/Weapons/SandSpiritBolt.png", anim(E.sand_bolt, 4))
    # ---- buff
    save(mod, "Content/Buffs/SandSpiritBuff.png", E.buff_icon())
    # ---- objetos
    I = "Content/Items"
    save(mod, I + "/SethurSummon.png", E.item_summon())
    save(mod, I + "/SethurBossBag.png", E.item_bag())
    save(mod, I + "/SethurMask.png", E.item_mask())
    save(mod, I + "/SethurMask_Head.png", E.mask_head_texture())
    save(mod, I + "/DesertStaff.png", E.item_staff())
    save(mod, I + "/PharaohSickle.png", E.item_sickle())
    save(mod, I + "/SolarDisc.png", E.item_disc())
    save(mod, I + "/RoyalFragment.png", E.item_fragment())
    save(mod, I + "/RoyalAmulet.png", E.item_amulet())
    # ---- jefe: iconos del mapa/barra de vida
    save(mod, "Content/NPCs/Sethur/SethurBoss_Head_Boss.png", E.boss_head_icon())
    # ---- texturas de efectos (se cargan por ruta en codigo)
    T = "Assets/Textures"
    save(mod, T + "/SethurHalo.png", E.halo_texture())
    save(mod, T + "/SethurGlow.png", E.glow_texture())
    save(mod, T + "/SethurRing.png", E.ring_texture())
    save(mod, T + "/SethurBeam.png", E.beam_tile())
    save(mod, T + "/SethurFlare.png", E.flare(64))
    save(mod, T + "/SethurShard.png", anim(E.shard, 3))
    # ---- icono del mod (80x80) y del Workshop (512x512, escalado entero x6 + margen)
    icon = E.mod_icon()
    save(mod, "icon.png", icon)
    big = np.kron(icon, np.ones((6, 6, 1), dtype=np.uint8))
    ws = np.zeros((512, 512, 4), dtype=np.uint8)
    ws[16:496, 16:496] = big
    save(mod, "icon_workshop.png", ws)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "ForgottenPharaoh"))
