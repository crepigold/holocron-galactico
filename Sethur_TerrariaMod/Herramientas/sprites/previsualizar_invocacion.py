#!/usr/bin/env python3
"""
previsualizar_invocacion.py - Simulacion de como se ve Sethur al invocarlo.

NO es una captura de Terraria: recompone, con los PNG REALES del mod (hojas de animacion, halo, brillo, destello,
fragmentos) y los anclajes de SethurFrameData.cs, lo que hacen SethurBoss.DoIntro() y SethurBoss.PreDraw():
  - aparicion con fundido (alpha 255 -> 0 en 60 ticks), animacion Idle de 32 fotogramas a 1 fotograma cada 2 ticks,
  - polvo dorado y de arena durante la intro, temblor de pantalla (PunchCameraModifier) y mensaje de chat,
  - halo solar giratorio + brillo + fragmentos orbitales + destello del orbe con mezcla aditiva.

Uso: python3 previsualizar_invocacion.py <carpeta_del_mod> <carpeta_salida>
"""
import math
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

MOD = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "ForgottenPharaoh"))
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "..", "Previsualizacion"))
os.makedirs(OUT, exist_ok=True)

W, H = 560, 360            # escena en pixeles de juego
GROUND = 300               # y del suelo
SCALE = 2
CELL_W, CELL_H, GUT, COLS = 224, 256, 2, 8
ANCHOR = (112.0, 104.0)    # SethurAnimations.CellAnchorX/Y (punto de la celda = NPC.Center)
rng = np.random.RandomState(7)


def load(rel):
    return np.array(Image.open(os.path.join(MOD, rel)).convert("RGBA"))


SHEET = load("Content/NPCs/Sethur/Anim/SethurIdle.png")
HALO = load("Assets/Textures/SethurHalo.png")
GLOW = load("Assets/Textures/SethurGlow.png")
FLARE = load("Assets/Textures/SethurFlare.png")
SHARD = load("Assets/Textures/SethurShard.png")

# anclajes del C# generado: 8 valores por fotograma (cabeza, orbe, pecho, mano)
cs = open(os.path.join(MOD, "Content/NPCs/Sethur/SethurFrameData.cs"), encoding="utf-8").read()
ANCH = [int(v) for v in re.search(r"IdleAnchors = \{([^}]*)\}", cs).group(1).replace(" ", "").split(",")]


def idle_frame(i):
    c, r = i % COLS, i // COLS
    x0, y0 = c * (CELL_W + GUT), r * (CELL_H + GUT)
    return SHEET[y0:y0 + CELL_H, x0:x0 + CELL_W]


def anchor(i, k):
    return ANCH[i * 8 + k * 2], ANCH[i * 8 + k * 2 + 1]


# ------------------------------------------------------------------ fondo: desierto nocturno con eclipse
def make_background():
    bg = np.zeros((H, W, 3), dtype=np.float32)
    top, mid, hor = np.array([8, 7, 24]), np.array([40, 24, 58]), np.array([120, 62, 54])
    for y in range(GROUND):
        t = y / GROUND
        c = top + (mid - top) * min(1, t * 1.5) if t < 0.66 else mid + (hor - mid) * ((t - 0.66) / 0.34)
        bg[y, :] = c
    # estrellas
    for _ in range(140):
        x, y = rng.randint(0, W), rng.randint(0, int(GROUND * 0.7))
        bg[y, x] = np.array([200, 200, 230]) * rng.uniform(0.4, 1)
    img = Image.fromarray(bg.astype(np.uint8), "RGB").convert("RGBA")
    d = ImageDraw.Draw(img)
    # eclipse
    cx, cy = 470, 62
    for r, a in ((34, 22), (28, 40), (24, 80)):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 190, 80, a))
    d.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=(255, 214, 120, 255))
    d.ellipse([cx - 16, cy - 20, cx + 24, cy + 20], fill=(10, 8, 22, 255))
    # piramides y dunas lejanas
    d.polygon([(40, GROUND), (130, GROUND - 78), (230, GROUND)], fill=(46, 28, 52, 255))
    d.polygon([(380, GROUND), (470, GROUND - 56), (560, GROUND)], fill=(52, 30, 54, 255))
    d.polygon([(0, GROUND), (0, GROUND - 22), (90, GROUND - 14), (200, GROUND - 26), (320, GROUND - 12), (430, GROUND - 24), (560, GROUND - 14), (560, GROUND)], fill=(70, 38, 56, 255))
    # obeliscos
    for ox, oh in ((30, 70), (520, 84)):
        d.polygon([(ox - 7, GROUND), (ox + 7, GROUND), (ox + 4, GROUND - oh), (ox, GROUND - oh - 10), (ox - 4, GROUND - oh)], fill=(28, 20, 36, 255), outline=(150, 100, 40, 255))
    # antorchas
    for tx in (70, 495):
        d.rectangle([tx - 1, GROUND - 20, tx + 1, GROUND], fill=(60, 40, 30, 255))
        d.ellipse([tx - 3, GROUND - 28, tx + 3, GROUND - 19], fill=(255, 170, 40, 255))
    # suelo: arena + arenisca con ladrillos
    d.rectangle([0, GROUND, W, H], fill=(150, 112, 66, 255))
    d.rectangle([0, GROUND, W, GROUND + 3], fill=(206, 170, 100, 255))
    for y in range(GROUND + 4, H, 16):
        d.line([(0, y), (W, y)], fill=(98, 66, 40, 255))
        off = 0 if ((y - GROUND) // 16) % 2 == 0 else 16
        for x in range(off, W, 32):
            d.line([(x, y), (x, y + 16)], fill=(98, 66, 40, 255))
    arr = np.array(img).astype(np.float32)[..., :3]
    # ruido de arena
    arr[GROUND:, :] += rng.uniform(-9, 9, size=(H - GROUND, W, 1))
    return arr


def draw_player(canvas, ox, oy, raised):
    """Jugador de 20x42 px (estilo Terraria), mirando a la derecha."""
    img = Image.new("RGBA", (40, 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # piernas, torso, cabeza, pelo
    d.rectangle([14, 44, 19, 58], fill=(82, 56, 34, 255)); d.rectangle([21, 44, 26, 58], fill=(82, 56, 34, 255))
    d.rectangle([12, 28, 28, 45], fill=(46, 90, 170, 255))
    d.rectangle([14, 12, 26, 27], fill=(238, 184, 140, 255))
    d.rectangle([13, 9, 27, 15], fill=(96, 60, 28, 255)); d.rectangle([13, 12, 15, 22], fill=(96, 60, 28, 255))
    d.rectangle([21, 18, 22, 19], fill=(20, 20, 30, 255))
    if raised:   # brazo en alto sosteniendo el idolo
        d.rectangle([25, 14, 28, 34], fill=(238, 184, 140, 255))
        d.rectangle([24, 4, 31, 14], fill=(210, 150, 40, 255)); d.rectangle([26, 6, 29, 9], fill=(40, 80, 160, 255))
    else:
        d.rectangle([11, 30, 14, 44], fill=(238, 184, 140, 255))
    a = np.array(img).astype(np.float32)
    h, w = a.shape[:2]
    x0, y0 = ox - w // 2, oy - h
    m = a[..., 3:4] / 255.0
    canvas[y0:y0 + h, x0:x0 + w] = canvas[y0:y0 + h, x0:x0 + w] * (1 - m) + a[..., :3] * m


# ------------------------------------------------------------------ operaciones de mezcla como en el juego
def blend_normal(canvas, tex, cx, cy, alpha=1.0, flip=False):
    t = tex[:, ::-1] if flip else tex
    h, w = t.shape[:2]
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    xs0, ys0, xs1, ys1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if xs1 <= xs0 or ys1 <= ys0:
        return
    sub = t[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0].astype(np.float32)
    m = sub[..., 3:4] / 255.0 * alpha
    canvas[ys0:ys1, xs0:xs1] = canvas[ys0:ys1, xs0:xs1] * (1 - m) + sub[..., :3] * m


def add_tex(canvas, tex, cx, cy, color, inten, rot=0.0, scale=1.0):
    im = Image.fromarray(tex, "RGBA")
    w, h = im.size
    im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.BILINEAR).rotate(-math.degrees(rot), resample=Image.BILINEAR, expand=True)
    a = np.array(im).astype(np.float32)
    h2, w2 = a.shape[:2]
    x0, y0 = int(cx - w2 / 2), int(cy - h2 / 2)
    xs0, ys0, xs1, ys1 = max(0, x0), max(0, y0), min(W, x0 + w2), min(H, y0 + h2)
    if xs1 <= xs0 or ys1 <= ys0:
        return
    sub = a[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    canvas[ys0:ys1, xs0:xs1] = np.clip(canvas[ys0:ys1, xs0:xs1] + sub[..., :3] * (sub[..., 3:4] / 255.0) * (np.array(color, dtype=np.float32) / 255.0) * inten, 0, 255)


def add_dot(canvas, x, y, color, size, a):
    x, y = int(x), int(y)
    if 0 <= x < W - size and 0 <= y < H - size:
        canvas[y:y + size, x:x + size] = np.clip(canvas[y:y + size, x:x + size] + np.array(color, dtype=np.float32) * a, 0, 255)


# ------------------------------------------------------------------ simulacion
GOLD = (255, 200, 80)
SUN = (255, 230, 140)
SAND_DUST = (214, 170, 96)
GOLD_DUST = (255, 184, 52)


class Dust:
    def __init__(self, x, y, vx, vy, life, color, size):
        self.x, self.y, self.vx, self.vy, self.life, self.max, self.color, self.size = x, y, vx, vy, life, life, color, size


def burst(dusts, pos, count, speed, color):
    for _ in range(count):
        a = rng.uniform(0, 6.283)
        r = speed * math.sqrt(rng.uniform(0, 1))
        dusts.append(Dust(pos[0], pos[1], math.cos(a) * r, math.sin(a) * r, rng.randint(26, 46), color, rng.choice([2, 3])))


def render(tick, bg, dusts, state):
    """Un tick de la escena. tick = animTick (empieza en 1 cuando SethurBoss.AI se ejecuta por primera vez)."""
    cv = bg.copy()
    # sacudida de camara (PunchCameraModifier 14, 26 fotogramas)
    sh = (0, 0)
    if tick <= 26:
        k = 1 - tick / 26.0
        sh = (int(round(rng.uniform(-1, 1) * 9 * k)), int(round(rng.uniform(-1, 1) * 9 * k)))
    # jugador (usa el idolo los primeros ticks y luego mira al jefe)
    draw_player(cv, 205, GROUND, raised=tick < 32)

    opacity = 1.0 - 0.0
    alpha255 = 255 * (1 - (lambda t: t * t * (3 - 2 * t))(min(1.0, tick / 60.0)))
    opacity = 1 - alpha255 / 255.0
    npc = (340.0, 128.0)       # NPC.Center en la escena
    f = (tick // 2) % 32       # Idle: 1 fotograma cada 2 ticks
    cell_tl = (npc[0] - ANCHOR[0], npc[1] - ANCHOR[1])

    def to_scene(p):
        return cell_tl[0] + p[0], cell_tl[1] + p[1]

    head = to_scene(anchor(f, 0))
    orb = to_scene(anchor(f, 1))
    chest = to_scene(anchor(f, 2))
    t = float(tick)
    if opacity > 0.01:
        # --- halo solar + brillo (aditivo, fase 1)
        pulse = 1 + 0.05 * math.sin(t * 0.07)
        scale = 0.72 * pulse
        inten = 0.85 * opacity
        add_tex(cv, GLOW, head[0], head[1], (255, 200, 80), 0.55 * inten, 0, 1.5)
        add_tex(cv, HALO, head[0], head[1], GOLD, inten, t * 0.004, scale)
        # --- fragmentos traseros
        fh = SHARD.shape[0] // 3
        shards = []
        for i in range(3):
            a = t * 0.022 + i * 2 * math.pi / 3
            off = (math.cos(a) * 98, math.sin(a) * 40 - 22 + math.sin(t * 0.05 + i) * 4)
            shards.append((math.sin(a) > 0, chest[0] + off[0], chest[1] + off[1], i))
        for front, x, y, i in shards:
            if not front:
                blend_normal(cv, SHARD[((tick // 8 + i) % 3) * fh:((tick // 8 + i) % 3 + 1) * fh], x, y, 0.75 * opacity)
        # --- cuerpo
        blend_normal(cv, idle_frame(f), npc[0], npc[1] + (CELL_H / 2 - ANCHOR[1]), opacity)
        # --- destello del orbe (aditivo)
        add_tex(cv, FLARE, orb[0], orb[1], GOLD, 0.7 * opacity, t * 0.03, 0.42 + 0.06 * math.sin(t * 0.12))
        for front, x, y, i in shards:
            if front:
                blend_normal(cv, SHARD[((tick // 8 + i) % 3) * fh:((tick // 8 + i) % 3 + 1) * fh], x, y, opacity)

    # --- polvo (DoIntro: GoldBurst cada 4 ticks mientras Timer < 60) + arena de la tela
    if tick == 1:
        pass
    if tick < 60 and tick % 4 == 0:
        burst(dusts, (npc[0] + rng.uniform(-30, 30), npc[1] + 75 + 20), 4, 3.0, SAND_DUST)
        burst(dusts, (npc[0] + rng.uniform(-40, 40), npc[1] + rng.uniform(-70, 70)), 2, 2.0, GOLD_DUST)
    if tick % 5 == 0 and opacity > 0.4:
        dusts.append(Dust(npc[0] + rng.uniform(-26, 26), npc[1] + 75 + rng.uniform(-30, 20), 0, rng.uniform(0.4, 1.4), 60, SAND_DUST, 2))
    alive = []
    for d in dusts:
        d.x += d.vx; d.y += d.vy; d.vx *= 0.97; d.vy *= 0.97; d.life -= 1
        if d.life > 0:
            k = d.life / d.max
            add_dot(cv, d.x, d.y, d.color, d.size, 0.9 * k)
            add_dot(cv, d.x - 1, d.y - 1, d.color, d.size + 2, 0.18 * k)
            alive.append(d)
    dusts[:] = alive

    # luz calida del jefe sobre el suelo
    if opacity > 0.05:
        glow = np.zeros_like(cv)
        yy, xx = np.mgrid[GROUND - 30:GROUND + 20, 150:530]
        dd = np.sqrt(((xx - npc[0]) / 200.0) ** 2 + ((yy - (GROUND - 4)) / 28.0) ** 2)
        a = np.clip(1 - dd, 0, 1) ** 2 * 0.28 * opacity
        cv[GROUND - 30:GROUND + 20, 150:530] += a[..., None] * np.array([255, 170, 70], dtype=np.float32) * 0.5

    cv = np.clip(cv, 0, 255)
    if sh != (0, 0):
        cv = np.roll(np.roll(cv, sh[1], axis=0), sh[0], axis=1)
    return cv.astype(np.uint8)


def with_text(img, tick):
    im = Image.fromarray(img, "RGB").resize((W * SCALE, H * SCALE), Image.NEAREST)
    d = ImageDraw.Draw(im, "RGBA")
    if tick >= 1:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 22)
        msg = "¡Sethur, el Faraón Olvidado, despierta de su tumba!"
        a = 255 if tick < 200 else max(0, 255 - (tick - 200) * 8)
        d.text((22, im.height - 46), msg, font=font, fill=(0, 0, 0, a), stroke_width=0)
        d.text((20, im.height - 48), msg, font=font, fill=(255, 200, 80, a), stroke_width=1, stroke_fill=(30, 18, 4, a))
    return im


def main():
    bg = make_background()
    dusts = []
    frames, stills = [], {}
    TICKS = 270
    for tick in range(0, TICKS):
        img = render(tick, bg, dusts, None)
        if tick in (0, 12, 30, 48, 66, 90, 150, 230):
            stills[tick] = with_text(img, tick)
        if tick % 3 == 0:
            frames.append(with_text(img, tick))
    # GIF (paleta global para que pese poco y no parpadee)
    pal = frames[len(frames) // 2].quantize(colors=160, method=Image.Quantize.MEDIANCUT)
    q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    q[0].save(os.path.join(OUT, "invocacion_sethur.gif"), save_all=True, append_images=q[1:], duration=50, loop=0, optimize=False, disposal=1)
    # tira de fotogramas clave
    keys = [0, 30, 48, 66, 90, 230]
    thumbs = [stills[k].resize((560, 360), Image.NEAREST) for k in keys]
    sheet = Image.new("RGB", (560 * 3, 360 * 2), (0, 0, 0))
    labels = ["tick 0: el jugador usa el Ídolo", "tick 30: aparece con fundido y polvo dorado", "tick 48: el faraon se materializa",
              "tick 66: aparicion completa + halo solar", "tick 90: fin de la intro, empieza el combate", "tick 230: flotando (idle)"]
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 15)
    for i, t in enumerate(thumbs):
        sheet.paste(t, ((i % 3) * 560, (i // 3) * 360))
        d = ImageDraw.Draw(sheet)
        d.text(((i % 3) * 560 + 9, (i // 3) * 360 + 9), labels[i], font=font, fill=(0, 0, 0))
        d.text(((i % 3) * 560 + 8, (i // 3) * 360 + 8), labels[i], font=font, fill=(255, 230, 150))
    sheet.save(os.path.join(OUT, "invocacion_fotogramas.png"))
    print("GIF: %d fotogramas, %.1f MB" % (len(q), os.path.getsize(os.path.join(OUT, "invocacion_sethur.gif")) / 1e6))


if __name__ == "__main__":
    main()
