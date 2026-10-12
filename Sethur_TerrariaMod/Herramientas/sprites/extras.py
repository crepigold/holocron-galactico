"""
extras.py - Sprites de proyectiles, objetos, UI y texturas de efectos del mod.
Todos son funciones que devuelven imagenes RGBA (numpy uint8) o listas de frames.
"""
from __future__ import annotations

import math

import numpy as np
from PIL import Image

from gfx import (BLACK, BLUE, CLOTH, GOLD, GOLD_OLD, EYE, SAND, STONE, RED, BONE, Canvas, Ramp, Xf, ellipse_pts, mix, stroke_poly,
                 outline_pass, over, new_layer, dither_glow, lerp, smooth, OUTLINE, _bayer8)
from head import draw_head
from fx import GOLD_FX, BLUE_FX, SAND_FX, motes, disc, ring, sparkle, radial_rays, put, put_sq, arc_trail

S = math.sin
C = math.cos
TAU = 2 * math.pi


def finish(cv, outline=True):
    px = cv.to_array()
    if outline:
        outline_pass(px)
    return px


def rng_of(seed):
    return np.random.RandomState(seed)


def stack(frames, vertical=True, gutter=0):
    h, w = frames[0].shape[:2]
    if vertical:
        out = np.zeros((len(frames) * (h + gutter) - gutter, w, 4), dtype=np.uint8)
        for i, f in enumerate(frames):
            out[i * (h + gutter):i * (h + gutter) + h] = f
    else:
        out = np.zeros((h, len(frames) * (w + gutter) - gutter, 4), dtype=np.uint8)
        for i, f in enumerate(frames):
            out[:, i * (w + gutter):i * (w + gutter) + w] = f
    return out



def catmull(points, n=8):
    """Spline Catmull-Rom por los puntos dados."""
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for j in range(n):
            t = j / n
            t2, t3 = t * t, t * t * t
            out.append((0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)))
    out.append(points[-1])
    return out


def grainy(px, seed, amount=0.22, grains=0.12):
    """Aspecto de arena: erosiona los bordes y suelta granos."""
    rng = rng_of(seed)
    a = px[..., 3] > 0
    n = np.zeros_like(a)
    n[1:, :] |= ~a[:-1, :]
    n[:-1, :] |= ~a[1:, :]
    n[:, 1:] |= ~a[:, :-1]
    n[:, :-1] |= ~a[:, 1:]
    edge = a & n
    h, w = a.shape
    rm = edge & (rng.rand(h, w) < amount)
    cols = px[a][:1]
    px[rm] = 0
    # granos fuera
    a2 = px[..., 3] > 0
    near = np.zeros_like(a2)
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            near |= np.roll(np.roll(a2, dy, 0), dx, 1)
    gr = near & ~a2 & (rng.rand(h, w) < grains * 0.5)
    ys, xs = np.nonzero(gr)
    for y, x in zip(ys, xs):
        c = SAND_FX[rng.randint(0, 4)]
        px[y, x] = (c[0], c[1], c[2], 255)
    return px


# ============================================================================= PROYECTILES HOSTILES
def sand_column(k, n=8, W=64, H=224):
    """Pinchos de arena dorada que brotan del suelo (pilar central + pinchos laterales). Anclado abajo."""
    heights = [30, 84, 150, 204, 214, 214, 178, 86]
    widths = [0.55, 0.78, 0.95, 1.0, 1.0, 1.0, 0.88, 0.7]
    h = heights[k]
    ws = widths[k]
    cv = Canvas(W, H)
    cx, base = W / 2, H - 4
    rng = rng_of(100 + k)

    def spike(x0, hh, bw, lean, ramp, k_=1.2):
        left, right = [], []
        steps = 18
        for i in range(steps + 1):
            f = i / steps
            y = base - hh * f
            half = bw * (1 - f) ** 1.55 + 0.6
            xo = x0 + lean * f ** 1.3
            jag = rng.uniform(-0.9, 0.9) * (1 - f)
            left.append((xo - half - jag, y))
            right.append((xo + half + jag, y))
        tip = (x0 + lean + 0.5, base - hh - 5)
        poly = left + [tip] + right[::-1]
        def decor(sh):
            for j in range(int(hh / 16) + 1):
                y = base - 6 - j * 16 - (k * 4) % 16
                sh.clip_poly([(x0 - bw - 4, y + 4), (x0 + bw + 4, y - 7), (x0 + bw + 4, y - 3.5), (x0 - bw - 4, y + 7.5)], ramp.light)
            sh.clip_poly([(x0 - bw * 0.2, base), (x0 + bw * 0.2, base), (x0 + lean, base - hh), (x0 + lean - 0.8, base - hh)], GOLD.hi)
            # base oscura (arena humeda)
            sh.clip_poly([(0, base - 9), (W, base - 9), (W, base + 2), (0, base + 2)], ramp.shadow)
        cv.shape(poly, ramp, k=k_, decor=decor)

    # pinchos laterales (detras), luego el principal
    spike(cx - 15 * ws, h * 0.52, 7.5 * ws, -8, SAND.tinted(GOLD_OLD, 0.2), 0.9)
    spike(cx + 16 * ws, h * 0.60, 8.0 * ws, 9, SAND.tinted(GOLD_OLD, 0.2), 0.9)
    spike(cx - 26 * ws, h * 0.30, 6.0 * ws, -9, SAND, 0.8)
    spike(cx + 27 * ws, h * 0.34, 6.0 * ws, 10, SAND, 0.8)
    spike(cx, h, 15.5 * ws, 2, SAND.tinted(GOLD, 0.35), 1.4)
    px = finish(cv)
    grainy(px, 700 + k, amount=0.12, grains=0.10)
    lay = new_layer(W, H)
    for i in range(int(6 + h / 14)):
        y = base - rng.uniform(0, h + 8)
        side = rng.choice([-1, 1])
        dx = side * (rng.uniform(10, 30) * ws + (base - y) * 0.06)
        put_sq(lay, cx + dx, y, 2 if rng.rand() < 0.25 else 1, GOLD_FX[rng.randint(0, 4)])
    if h > 60:
        sparkle(lay, cx + 2, base - h - 8, 3, GOLD_FX[1], GOLD_FX[0])
    over(px, lay)
    return px


def sand_hand(k, n=8, W=96, H=112):
    """Mano de arena gigante que emerge y se cierra. Anclada abajo."""
    g = min(1.0, k / 3.0)
    curl = smooth((k - 3.5) / 2.5)
    crumble = max(0.0, (k - 6) / 1.5)
    cv = Canvas(W, H)
    cx, base = W / 2, H - 3
    rise = 14 + 62 * g
    wrist_y = base - rise
    skin = CLOTH.tinted(SAND, 0.35)
    # monticulo
    cv.shape(ellipse_pts(cx, base, 36 + 6 * g, 9, 22), SAND, k=1.0)
    # antebrazo: curva suave con ancho decreciente
    path = catmull([(cx + 3, base - 2), (cx - 1, base - rise * 0.45), (cx + 1, wrist_y + 8)], 8)
    arm = stroke_poly(path, 34, 24)
    def arm_decor(sh):
        for j in range(5):
            y = base - 8 - j * 11
            sh.clip_poly([(cx - 22, y), (cx + 22, y - 3), (cx + 22, y - 1), (cx - 22, y + 2)], SAND.shadow)
    cv.shape(arm, skin, k=1.3, decor=arm_decor)
    # palma
    pc = (cx + 1, wrist_y - 7)
    palm = ellipse_pts(pc[0], pc[1], 20 - 4 * curl, 15 - 3 * curl, 26)
    cv.shape(palm, skin, k=1.2)
    # dedos: 3 falanges con nudillos
    for i in range(4):
        fx = pc[0] + (i - 1.5) * 9.2
        a = (i - 1.5) * (7 - 6 * curl)
        x, y = fx, pc[1] - 8
        ln = [14, 11.5, 9.5] if i in (1, 2) else [12, 10, 8]
        for j, l in enumerate(ln):
            a += curl * (36 + 14 * j) * 0.6
            x2 = x + math.sin(math.radians(a)) * l * (1 - 0.1 * curl)
            y2 = y - math.cos(math.radians(a)) * l * (1 - 0.5 * curl * (0.4 + j * 0.3))
            wd = 9.0 - j * 1.4
            cv.shape(stroke_poly([(x, y), (x2, y2)], wd, wd - 1.2), skin, k=0.8, ow=0.8)
            x, y = x2, y2
        # garra
        da = math.radians(a)
        cv.shape([(x - 2.2, y), (x + 2.2, y), (x + math.sin(da) * 6, y - math.cos(da) * 6 * (1 - 0.4 * curl))], GOLD, k=0.3, ow=0.5)
    # pulgar
    tpts = [(pc[0] - 15, pc[1] + 3), (pc[0] - 24 + 8 * curl, pc[1] - 6 + 4 * curl), (pc[0] - 28 + 14 * curl, pc[1] - 16 + 8 * curl)]
    for j in range(2):
        cv.shape(stroke_poly(tpts[j:j + 2], 9.5 - j * 1.6, 8.0 - j * 1.6), skin, k=0.8, ow=0.8)
    px = finish(cv)
    grainy(px, 800 + k, amount=0.16, grains=0.08)
    lay = new_layer(W, H)
    rng = rng_of(200 + k)
    for i in range(8 + int(16 * crumble)):
        x = cx + rng.uniform(-36, 36)
        y = base - rng.uniform(0, rise + 30)
        put_sq(lay, x, y + crumble * rng.uniform(4, 22), 2 if rng.rand() < 0.3 else 1, GOLD_FX[rng.randint(1, 5)])
    over(px, lay)
    if crumble > 0:
        m = rng.rand(H, W) < crumble * 0.85
        px[m & (px[..., 3] > 0)] = 0
    return px


def tornado(k, n=8, W=80, H=144):
    """Tornado de arena: embudo con borde ondulado y bandas en remolino que giran."""
    cv = Canvas(W, H)
    cx, base = W / 2, H - 6
    top = 10
    ph = TAU * k / n
    left, right = [], []
    steps = 26
    for i in range(steps + 1):
        f = i / steps
        y = base - f * (base - top)
        half = 5 + 31 * f ** 0.85
        off = 7 * S(f * 5.5 + ph) * (0.25 + f)
        wob = 1.6 * S(f * 17 + ph * 2)
        left.append((cx + off - half - wob, y))
        right.append((cx + off + half + wob, y))
    poly = left + right[::-1]
    def decor(sh):
        spacing = 15.0
        for j in range(-1, 12):
            y0 = base - ((j * spacing + (k / n) * spacing) % (base - top + 15))
            sh.clip_poly([(0, y0 + 6), (W, y0 - 6), (W, y0 - 2), (0, y0 + 10)], CLOTH.tinted(SAND, 0.2).light)
            sh.clip_poly([(0, y0 + 10), (W, y0 - 2), (W, y0 + 1), (0, y0 + 13)], SAND.shadow)
    cv.shape(poly, SAND, k=1.3, decor=decor)
    # boca del embudo: elipse oscura con borde claro
    topx = cx + 7 * S(5.5 + ph) * 1.25
    cv.shape(ellipse_pts(topx, top + 1, 36.5, 7.5, 28), CLOTH.tinted(SAND, 0.3), k=0.9)
    cv.shape(ellipse_pts(topx, top + 2, 29, 4.6, 24), SAND.tinted(GOLD_OLD, 0.5), k=0.6, ow=0.5, tone=-1)
    px = finish(cv)
    grainy(px, 900 + k, amount=0.14, grains=0.10)
    lay = new_layer(W, H)
    rng = rng_of(300)
    for i in range(22):
        f = rng.uniform(0, 1)
        a = (rng.uniform(0, 1) + k / n) % 1.0 * TAU
        y = base - f * (base - top)
        r = 8 + 36 * f
        put_sq(lay, cx + math.cos(a) * r + 5 * S(f * 5.5 + ph), y + math.sin(a) * 3, 2 if i % 4 == 0 else 1, SAND_FX[rng.randint(0, 4)])
    over(px, lay)
    return px


def solar_disc(k, n=4, S_=48):
    """Disco solar hostil: sierra de 8 dientes con anillo y orbe."""
    cv = Canvas(S_, S_)
    c = S_ / 2
    rot = k * (45.0 / n)
    teeth = []
    for i in range(16):
        a = math.radians(rot + i * 22.5)
        r = 21 if i % 2 == 0 else 14
        teeth.append((c + math.cos(a) * r, c + math.sin(a) * r))
    cv.shape(teeth, GOLD, k=1.0)
    cv.shape(ellipse_pts(c, c, 11.5, 11.5, 24), GOLD_OLD, k=0.9, ow=0.7)
    cv.shape(ellipse_pts(c, c, 8.0, 8.0, 20), EYE, k=0.9, ow=0.7)
    # gema central rotando
    gem = []
    for i in range(4):
        a = math.radians(rot * 2 + 90 * i)
        gem.append((c + math.cos(a) * 3.6, c + math.sin(a) * 3.6))
    cv.shape(gem, BLUE, k=0.4, ow=0.5)
    return finish(cv)


def beam_tile(W=96, H=48):
    """Segmento de rayo solar, repetible en horizontal."""
    px = new_layer(W, H)
    bay = _bayer8()
    cy = H / 2
    for x in range(W):
        for y in range(H):
            d = abs(y + 0.5 - cy) / (H / 2)
            flow = 0.5 + 0.5 * S((x / W) * TAU * 3 + d * 3)
            flow2 = 0.5 + 0.5 * S((x / W) * TAU * 6 - d * 5)
            a = 1.0 - d ** 1.4
            if a <= 0:
                continue
            thr = bay[y % 8, x % 8]
            if a * (0.82 + 0.18 * flow) < thr * 0.9 and d > 0.45:
                continue
            if d < 0.14 + 0.05 * flow:
                c = GOLD_FX[0]
            elif d < 0.32 + 0.06 * flow2:
                c = GOLD_FX[1]
            elif d < 0.55:
                c = GOLD_FX[2]
            elif d < 0.78:
                c = GOLD_FX[3]
            else:
                c = GOLD_FX[4]
            px[y, x] = (c[0], c[1], c[2], 255)
    return px


def flare(S_=64, seed=1, theme="gold"):
    """Orbe con rayos (inicio e impacto del rayo)."""
    colors = GOLD_FX if theme == "gold" else BLUE_FX
    lay = new_layer(S_, S_)
    c = S_ / 2
    dither_glow(lay, c, c, S_ / 2 - 1, colors[2], strength=1.0, power=1.2, ramp=[colors[3], colors[2], colors[1], colors[0]])
    radial_rays(lay, c, c, 8, S_ / 2 - 2, 12, 0.2, colors[:3])
    disc(lay, c, c, 11, colors[:4])
    sparkle(lay, c, c, 10, colors[1], colors[0])
    return lay


def solar_blast(k, n=8, S_=160):
    """Explosion solar: onda expansiva con aro, nucleo y rayos."""
    lay = new_layer(S_, S_)
    c = S_ / 2
    f = k / (n - 1)
    r = 14 + 62 * f ** 0.65
    thick = max(2, int(14 * (1 - f) + 2))
    core = max(0.0, 1 - f * 1.5)
    if core > 0:
        disc(lay, c, c, 8 + 40 * core, GOLD_FX[:4])
        dither_glow(lay, c, c, 40 + 36 * (1 - f), GOLD_FX[2], strength=0.9 * (1 - f * 0.7), power=1.1, ramp=[GOLD_FX[3], GOLD_FX[2], GOLD_FX[1]])
    ring(lay, c, c, r, GOLD_FX[:4], thick=thick, fade=1.0 - f * 0.4)
    ring(lay, c, c, r * 0.72, GOLD_FX[1:4], thick=max(1, thick // 2), fade=0.75 * (1 - f * 0.6))
    radial_rays(lay, c, c, r * 0.5, r * 1.18, 16, 0.2 + f * 0.5, GOLD_FX[:3])
    rng = rng_of(400 + k)
    for i in range(18):
        a = rng.uniform(0, TAU)
        rr = r * rng.uniform(0.5, 1.2)
        put_sq(lay, c + math.cos(a) * rr, c + math.sin(a) * rr, 2 if i % 3 == 0 else 1, GOLD_FX[rng.randint(0, 4)])
    return lay


def ring_texture(S_=128):
    """Aro de aviso con marcas (se tine por codigo)."""
    lay = new_layer(S_, S_)
    c = S_ / 2
    W_ = (255, 255, 255)
    G_ = (255, 226, 150)
    ring(lay, c, c, 62, [W_, G_], thick=2)
    ring(lay, c, c, 54, [G_], thick=1, fade=0.55)
    for i in range(16):
        a = i * TAU / 16
        L = 7 if i % 2 == 0 else 3
        for s in range(L):
            put(lay, c + math.cos(a) * (62 - 3 - s), c + math.sin(a) * (62 - 3 - s), W_ if i % 4 == 0 else G_)
    for i in range(8):
        a = i * TAU / 8 + TAU / 16
        put_sq(lay, c + math.cos(a) * 46 - 1, c + math.sin(a) * 46 - 1, 3, G_)
    return lay


def glow_texture(S_=128):
    """Brillo suave con alpha real (para mezcla aditiva)."""
    yy, xx = np.mgrid[0:S_, 0:S_].astype(np.float32)
    c = (S_ - 1) / 2
    d = np.sqrt((xx - c) ** 2 + (yy - c) ** 2) / (S_ / 2)
    a = np.clip(1 - d, 0, 1) ** 2.2
    out = np.zeros((S_, S_, 4), dtype=np.uint8)
    out[..., 0] = 255
    out[..., 1] = (236 - 36 * d).clip(0, 255).astype(np.uint8)
    out[..., 2] = (190 - 120 * d).clip(0, 255).astype(np.uint8)
    out[..., 3] = (a * 255).astype(np.uint8)
    return out


def halo_texture(S_=192):
    """Halo solar (disco + anillos + rayos). Se dibuja detras de la cabeza con mezcla aditiva y rota."""
    lay = new_layer(S_, S_)
    c = S_ / 2
    dither_glow(lay, c, c, 56, GOLD_FX[2], strength=1.0, power=0.8, ramp=[GOLD_FX[3], GOLD_FX[2], GOLD_FX[1], GOLD_FX[0]])
    disc(lay, c, c, 34, [GOLD_FX[0], GOLD_FX[1], GOLD_FX[1], GOLD_FX[2]])
    ring(lay, c, c, 44, GOLD_FX[:4], thick=3)
    ring(lay, c, c, 58, GOLD_FX[1:4], thick=2, fade=0.8)
    ring(lay, c, c, 80, GOLD_FX[2:4], thick=1, fade=0.5)
    radial_rays(lay, c, c, 46, 92, 16, 0.0, GOLD_FX[1:4])
    for i in range(8):
        a = i * TAU / 8
        put_sq(lay, c + math.cos(a) * 68 - 1, c + math.sin(a) * 68 - 1, 3, GOLD_FX[0])
    return lay


def obelisk(k, n=4, W=36, H=84):
    cv = Canvas(W, H)
    cx = W / 2
    top, bot = 10, H - 10
    half_b, half_t = 10.5, 6.0
    glow = 0.5 + 0.5 * S(TAU * k / n)
    # cara frontal oscura
    front = [(cx - half_b, bot), (cx + half_b * 0.55, bot), (cx + half_t * 0.55, top + 6), (cx - half_t, top + 6)]
    side = [(cx + half_b * 0.55, bot), (cx + half_b, bot - 2), (cx + half_t, top + 7), (cx + half_t * 0.55, top + 6)]
    tip = [(cx - half_t, top + 6), (cx + half_t * 0.55, top + 6), (cx + half_t * 0.2, top - 2), (cx - half_t * 0.5, top)]
    def front_decor(sh):
        # glifos brillantes
        for j in range(4):
            y = top + 22 + j * 11
            col = GOLD.hi if glow > 0.55 else GOLD.light
            sh.clip_poly([(cx - 3.8, y), (cx - 1, y), (cx - 1, y + 5), (cx - 3.8, y + 5)], col)
            sh.clip_poly([(cx + 0.5, y + 2), (cx + 3.5, y + 2), (cx + 3.5, y + 4), (cx + 0.5, y + 4)], col)
        sh.clip_poly([(cx - half_b, bot - 4), (cx + half_b, bot - 4), (cx + half_b, bot), (cx - half_b, bot)], GOLD.mid)
    cv.shape(side, BLACK.tinted(BLUE, 0.2), k=0.8, tone=-1)
    cv.shape(front, BLACK.tinted(BLUE, 0.15), k=1.1, decor=front_decor)
    cv.shape(tip, GOLD, k=0.7)
    # gema azul
    gem = [(cx - 1.5, top + 11), (cx + 2.2, top + 15), (cx - 1.5, top + 20), (cx - 5, top + 15)]
    cv.shape(gem, BLUE, k=0.5, ow=0.6)
    # base
    cv.shape([(cx - half_b - 3, bot), (cx + half_b + 3, bot), (cx + half_b + 2, bot + 5), (cx - half_b - 2, bot + 5)], GOLD_OLD, k=0.7, ow=0.8)
    px = finish(cv)
    lay = new_layer(W, H)
    dither_glow(lay, cx - 1, top + 15, 9, BLUE_FX[2], strength=0.6 + 0.3 * glow, power=1.4, ramp=[BLUE_FX[3], BLUE_FX[2]])
    out = new_layer(W, H)
    over(out, lay)
    over(out, px)
    return out


def obelisk_bolt(k, n=4, S_=24):
    lay = new_layer(S_, S_)
    c = S_ / 2
    pulse = 1 + 0.15 * S(TAU * k / n)
    dither_glow(lay, c, c, 10 * pulse, BLUE_FX[2], strength=1.0, power=1.0, ramp=[BLUE_FX[3], BLUE_FX[2], BLUE_FX[1]])
    disc(lay, c, c, 5 * pulse, BLUE_FX[:3])
    for i in range(4):
        a = TAU * (k / n) / 4 + i * TAU / 4
        put_sq(lay, c + math.cos(a) * 8, c + math.sin(a) * 8, 2, GOLD_FX[1])
    return lay


def claw_slash(k, n=6, S_=128, color="gold"):
    """Tajo creciente que avanza hacia la derecha (convexo hacia delante). k = fotograma."""
    lay = new_layer(S_, S_)
    f = k / (n - 1)
    cx, cy = 14, S_ / 2
    r = 74 + 6 * f
    span = 26 + 42 * smooth(min(1, f * 1.5))
    fade = 1.0 if f < 0.55 else max(0.12, 1 - (f - 0.55) / 0.45)
    cols = GOLD_FX if color == "gold" else BLUE_FX
    wmax = 3 + 15 * fade
    arc_trail(lay, cx, cy, r, -span, 0, 1.2, wmax, cols, steps=None)
    arc_trail(lay, cx, cy, r, span, 0, 1.2, wmax, cols, steps=None)
    arc_trail(lay, cx, cy, r - 2, -span * 0.7, span * 0.7, 2.0, 2.0, [cols[0], cols[0], cols[1]], steps=None)
    rng = rng_of(500 + k)
    for i in range(10):
        a = math.radians(rng.uniform(-span, span))
        rr = r + rng.uniform(-14, 22)
        put_sq(lay, cx + math.cos(a) * rr, cy + math.sin(a) * rr, 1 + (i % 3 == 0), cols[rng.randint(0, 3)])
    return lay


def shard(k, n=3, W=24, H=40):
    cv = Canvas(W, H)
    cx, cy = W / 2, H / 2
    p = 1 + 0.06 * S(TAU * k / n)
    d = [(cx, cy - 17 * p), (cx + 7, cy), (cx, cy + 17 * p), (cx - 7, cy)]
    def decor(sh):
        sh.clip_poly([(cx, cy - 17), (cx + 7, cy), (cx, cy)], GOLD.light)
        sh.clip_poly([(cx, cy - 7), (cx + 2.5, cy - 1), (cx, cy + 5), (cx - 2.5, cy - 1)], BLUE.mid)
        sh.clip_poly([(cx, cy - 6), (cx + 1.2, cy - 1), (cx, cy + 1), (cx - 1, cy - 2)], BLUE.hi)
    cv.shape(d, GOLD, k=0.8, decor=decor)
    return finish(cv)


# ============================================================================= ARMAS DEL JUGADOR / MINION
def player_solar_disc(k, n=4, S_=36):
    cv = Canvas(S_, S_)
    c = S_ / 2
    rot = k * (45.0 / n)
    teeth = []
    for i in range(16):
        a = math.radians(rot + i * 22.5)
        r = 16 if i % 2 == 0 else 10.5
        teeth.append((c + math.cos(a) * r, c + math.sin(a) * r))
    cv.shape(teeth, GOLD, k=0.9)
    cv.shape(ellipse_pts(c, c, 8, 8, 20), GOLD_OLD, k=0.7, ow=0.6)
    gem = [(c + math.cos(math.radians(rot * 2 + 90 * i)) * 4.4, c + math.sin(math.radians(rot * 2 + 90 * i)) * 4.4) for i in range(4)]
    cv.shape(gem, BLUE, k=0.4, ow=0.5)
    return finish(cv)


def sickle_wave(k, n=4, W=96, H=96):
    lay = claw_slash(min(5, k + 1), n=6, S_=128)
    return lay[16:112, 0:96].copy()


def sand_bolt(k, n=4, S_=16):
    lay = new_layer(S_, S_)
    c = S_ / 2
    dither_glow(lay, c, c, 7, SAND_FX[2], strength=1.0, power=1.0, ramp=[SAND_FX[1], SAND_FX[2], SAND_FX[3]])
    disc(lay, c, c, 3.4, SAND_FX[:2] + SAND_FX[1:3])
    a = TAU * k / n
    put_sq(lay, c + math.cos(a) * 5.2, c + math.sin(a) * 5.2, 1, GOLD_FX[0])
    return lay


def sand_spirit(k, n=4, W=40, H=52):
    """Minion: espiritu de arena con cabeza de chacal."""
    cv = Canvas(W, H)
    cx = W / 2
    bob = 1.6 * S(TAU * k / n)
    # cola de tela
    for j in range(3):
        x0 = cx + (j - 1) * 6
        pts = []
        for i in range(10):
            f = i / 9
            pts.append((x0 + 5 * S(k * TAU / n + f * 4 + j) * f, 24 + bob + f * 24))
        cv.shape(stroke_poly(pts, 7.5, 0.8), CLOTH.tinted(SAND, 0.4) if j == 1 else SAND, k=0.6, ow=0.7)
    draw_head(cv, cx + 1, 20 + bob, yaw=0.9, scale=0.34, mouth=0.0, show_ears=True, show_lappets=True)
    px = finish(cv)
    lay = new_layer(W, H)
    dither_glow(lay, cx + 1, 20 + bob, 14, GOLD_FX[2], strength=0.5, power=1.6, ramp=[GOLD_FX[3], GOLD_FX[2]])
    out = new_layer(W, H)
    over(out, lay)
    over(out, px)
    return out


def buff_icon(S_=32):
    cv = Canvas(S_, S_)
    draw_head(cv, 16, 18, yaw=0.9, scale=0.27)
    px = finish(cv)
    lay = new_layer(S_, S_)
    dither_glow(lay, 16, 17, 14, GOLD_FX[2], strength=0.55, power=1.3, ramp=[GOLD_FX[3], GOLD_FX[2]])
    out = new_layer(S_, S_)
    over(out, lay)
    over(out, px)
    return out


# ============================================================================= OBJETOS
def item_summon(W=32, H=40):
    """Idolo del Faraon Olvidado: busto de chacal dorado sobre pedestal."""
    cv = Canvas(W, H)
    cx = W / 2
    # pedestal
    cv.shape([(cx - 11, H - 3), (cx + 11, H - 3), (cx + 9, H - 11), (cx - 9, H - 11)], GOLD_OLD, k=0.8)
    cv.shape([(cx - 8, H - 11), (cx + 8, H - 11), (cx + 7, H - 14), (cx - 7, H - 14)], GOLD, k=0.6)
    gem = [(cx, H - 10), (cx + 2.4, H - 7), (cx, H - 4), (cx - 2.4, H - 7)]
    cv.shape(gem, BLUE, k=0.4, ow=0.5)
    draw_head(cv, cx + 1, 18, yaw=0.95, scale=0.36, show_lappets=True)
    px = finish(cv)
    lay = new_layer(W, H)
    dither_glow(lay, cx, 14, 15, GOLD_FX[2], strength=0.45, power=1.8, ramp=[GOLD_FX[3], GOLD_FX[2]])
    out = new_layer(W, H)
    over(out, lay)
    over(out, px)
    return out


def item_bag(W=34, H=36):
    cv = Canvas(W, H)
    cx = W / 2
    body = [(cx - 12, H - 4), (cx + 12, H - 4), (cx + 14, H - 13), (cx + 8, H - 24), (cx + 4, H - 27), (cx - 4, H - 27), (cx - 8, H - 24), (cx - 14, H - 13)]
    def decor(sh):
        # tira dorada y emblema
        sh.clip_poly([(0, H - 17), (W, H - 17), (W, H - 14), (0, H - 14)], GOLD.mid)
        sh.clip_poly([(0, H - 17), (W, H - 17), (W, H - 16), (0, H - 16)], GOLD.hi)
        sh.clip_poly(ellipse_pts(cx, H - 11, 5.2, 5.2, 14), GOLD.mid)
    cv.shape(body, CLOTH.tinted(SAND, 0.55), k=1.1, decor=decor)
    # emblema: gema azul
    cv.shape([(cx, H - 15.5), (cx + 3, H - 11), (cx, H - 6.5), (cx - 3, H - 11)], BLUE, k=0.4, ow=0.5)
    # cuello atado
    cv.shape([(cx - 6, H - 24), (cx + 6, H - 24), (cx + 5, H - 29), (cx - 5, H - 29)], SAND, k=0.7)
    cv.shape([(cx - 6.5, H - 28), (cx + 6.5, H - 28), (cx + 6, H - 31), (cx - 6, H - 31)], GOLD, k=0.5, ow=0.7)
    # picos del nudo
    cv.shape([(cx - 4, H - 30), (cx - 9, H - 35), (cx - 1, H - 31)], CLOTH, k=0.4, ow=0.6)
    cv.shape([(cx + 4, H - 30), (cx + 9, H - 35), (cx + 1, H - 31)], CLOTH, k=0.4, ow=0.6)
    return finish(cv)


def item_mask(W=30, H=34):
    cv = Canvas(W, H)
    draw_head(cv, W / 2 + 1, H / 2 + 5, yaw=0.5, scale=0.4, show_lappets=True)
    return finish(cv)


def mask_head_texture():
    """Textura de equipo (cabeza): 40x56 x 20 fotogramas, mascara de perfil mirando a la derecha."""
    FW, FH = 40, 56
    bob = {7: -2, 8: -2, 9: -2, 14: -2, 15: -2, 16: -2}
    frames = []
    base = None
    for i in range(20):
        cv = Canvas(FW, FH)
        draw_head(cv, 15.5, 21.0 + bob.get(i, 0), yaw=1.28, scale=0.47, show_lappets=False, ear_flick=0)
        frames.append(finish(cv))
    return stack(frames, vertical=True)


def item_staff(S_=44):
    """Baston del Desierto (invocacion): diagonal, corona solar arriba a la derecha."""
    cv = Canvas(S_, S_)
    x0, y0, x1, y1 = 5, S_ - 5, S_ - 14, 15
    cv.shape(stroke_poly([(x0, y0), (x1, y1)], 3.4), GOLD, k=0.7)
    # bandas
    for t in (0.25, 0.5, 0.75):
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        cv.shape(stroke_poly([(x - 2, y + 2), (x + 2, y - 2)], 4.4), GOLD_OLD, k=0.3, ow=0.5)
    cv.shape(stroke_poly([(x0 + (x1 - x0) * 0.35, y0 + (y1 - y0) * 0.35)] * 2 + [(x0 + (x1 - x0) * 0.4, y0 + (y1 - y0) * 0.4)], 4.0), BLUE, k=0.3, ow=0.5)
    # corona (creciente) + orbe
    cx, cy = x1 + 2, y1 - 2
    pts_o, pts_i = [], []
    for i in range(0, 17):
        t = math.radians(-35 + i * (250 / 16.0) + 45)
        pts_o.append((cx + math.sin(t) * 10, cy - math.cos(t) * 10))
    for i in range(16, -1, -1):
        t = math.radians(-35 + i * (250 / 16.0) + 45)
        pts_i.append((cx + math.sin(t) * 6.6, cy - math.cos(t) * 6.6 + 1.2))
    cv.shape(pts_o + pts_i, GOLD, k=0.6)
    cv.shape(ellipse_pts(cx + 1, cy - 1, 4.6, 4.6, 14), EYE, k=0.6, ow=0.6)
    px = finish(cv)
    lay = new_layer(S_, S_)
    dither_glow(lay, cx + 1, cy - 1, 12, GOLD_FX[2], strength=0.5, power=1.6, ramp=[GOLD_FX[3], GOLD_FX[2]])
    out = new_layer(S_, S_)
    over(out, lay)
    over(out, px)
    return out


def item_sickle(S_=52):
    """Hoz del Faraon (khopesh): mango dorado, guarda con gema azul y hoja curva."""
    cv = Canvas(S_, S_)
    # hoja: espina curva desde la guarda hacia arriba-derecha y punta que se curva hacia abajo
    spine = catmull([(21, 30), (27, 20), (35, 12), (44, 9), (49, 14)], 8)
    blade = stroke_poly(spine, 8.5, 1.4)
    def decor(sh):
        sh.clip_poly(stroke_poly(spine, 2.0, 0.6), GOLD.hi)
    cv.shape(blade, GOLD, k=0.9, decor=decor)
    # filo interior azulado
    inner = [(x - 0.5, y + 2.6) for x, y in spine[2:-3]]
    cv.shape(stroke_poly(inner, 1.2, 0.5), BLUE, k=0.2, ow=0.0)
    # mango
    cv.shape(stroke_poly([(7, S_ - 7), (21, 32)], 4.8), BLACK, k=0.7)
    for t in (0.18, 0.5, 0.82):
        x, y = 7 + 14 * t, S_ - 7 - (S_ - 7 - 32) * t
        cv.shape(stroke_poly([(x - 2.6, y + 2.2), (x + 2.6, y - 2.2)], 5.4), GOLD, k=0.3, ow=0.5)
    # guarda
    cv.shape([(17, 33), (23, 27), (27, 31), (21, 37)], GOLD, k=0.5, ow=0.7)
    cv.shape(ellipse_pts(22, 32, 2.2, 2.2, 10), BLUE, k=0.3, ow=0.4)
    # pomo
    cv.shape(ellipse_pts(6, S_ - 6, 3.0, 3.0, 10), GOLD, k=0.4, ow=0.6)
    return finish(cv)


def item_disc(S_=32):
    cv = Canvas(S_, S_)
    c = S_ / 2
    teeth = []
    for i in range(16):
        a = math.radians(i * 22.5)
        r = 14.6 if i % 2 == 0 else 9.4
        teeth.append((c + math.cos(a) * r, c + math.sin(a) * r))
    cv.shape(teeth, GOLD, k=0.9)
    cv.shape(ellipse_pts(c, c, 7.2, 7.2, 18), GOLD_OLD, k=0.7, ow=0.6)
    cv.shape([(c, c - 4.4), (c + 4.4, c), (c, c + 4.4), (c - 4.4, c)], BLUE, k=0.4, ow=0.5)
    return finish(cv)


def item_fragment(W=22, H=26):
    cv = Canvas(W, H)
    cx, cy = W / 2, H / 2
    d = [(cx + 1, cy - 11), (cx + 8, cy - 3), (cx + 5, cy + 10), (cx - 2, cy + 12), (cx - 8, cy + 3), (cx - 5, cy - 7)]
    def decor(sh):
        sh.clip_poly([(cx + 1, cy - 11), (cx + 8, cy - 3), (cx + 1, cy)], GOLD.light)
        sh.clip_poly([(cx - 5, cy - 7), (cx + 1, cy - 11), (cx + 1, cy), (cx - 8, cy + 3)], GOLD.hi)
        sh.clip_poly([(cx - 4, cy - 1), (cx + 2, cy - 3), (cx + 3, cy + 5), (cx - 2, cy + 7)], BLUE.mid)
        sh.clip_poly([(cx - 3, cy), (cx, cy - 1.5), (cx - 0.5, cy + 2)], BLUE.hi)
    cv.shape(d, GOLD, k=0.8, decor=decor)
    return finish(cv)


def item_amulet(W=28, H=32):
    cv = Canvas(W, H)
    cx = W / 2
    # cadena
    cv.shape(stroke_poly([(cx - 9, 2), (cx - 5, 9), (cx, 11), (cx + 5, 9), (cx + 9, 2)], 1.8), GOLD_OLD, k=0.3, ow=0.5)
    # escarabajo: cuerpo ovalado dorado con alas
    cv.shape(ellipse_pts(cx, 21, 9, 8.5, 24), GOLD, k=0.9)
    cv.shape(ellipse_pts(cx, 22, 6.2, 6.2, 20), GOLD_OLD, k=0.6, ow=0.5)
    cv.shape([(cx, 14), (cx + 4, 19), (cx, 26), (cx - 4, 19)], BLUE, k=0.5, ow=0.5)
    cv.shape([(cx - 4, 12.5), (cx, 10.5), (cx + 4, 12.5), (cx, 14.5)], GOLD, k=0.4, ow=0.5)
    return finish(cv)


def boss_head_icon(S_=40, phase2=False):
    cv = Canvas(S_, S_)
    draw_head(cv, 20.5, 24, yaw=0.45, scale=0.36, show_lappets=True)
    px = finish(cv)
    lay = new_layer(S_, S_)
    dither_glow(lay, 20, 20, 19, GOLD_FX[2], strength=0.7, power=1.1, ramp=[GOLD_FX[3], GOLD_FX[2], GOLD_FX[1]])
    out = new_layer(S_, S_)
    over(out, lay)
    over(out, px)
    return out


def mod_icon(S_=80):
    cv = Canvas(S_, S_)
    draw_head(cv, 40, 49, yaw=0.62, scale=0.78, show_lappets=True)
    px = finish(cv)
    lay = new_layer(S_, S_)
    dither_glow(lay, 40, 38, 38, GOLD_FX[2], strength=0.9, power=1.0, ramp=[GOLD_FX[3], GOLD_FX[2], GOLD_FX[1]])
    ring(lay, 40, 38, 33, GOLD_FX[:3], thick=1, fade=0.9)
    out = new_layer(S_, S_)
    over(out, lay)
    over(out, px)
    return out
