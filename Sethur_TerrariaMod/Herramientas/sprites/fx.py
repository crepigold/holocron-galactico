"""
fx.py - Efectos pixel (resolucion final): particulas en bucle perfecto, anillos, arcos, columnas, brillos, disolucion.
Todos los efectos usan alpha binario + dithering Bayer para mantener la estetica pixel art.
"""
from __future__ import annotations

import math
import numpy as np

from gfx import _bayer8

GOLD_FX = [(255, 249, 205), (255, 224, 116), (248, 178, 52), (208, 120, 24), (132, 66, 12)]
BLUE_FX = [(238, 251, 255), (152, 224, 255), (72, 164, 242), (32, 94, 196), (14, 44, 116)]
SAND_FX = [(255, 236, 170), (240, 200, 110), (214, 160, 70), (170, 114, 44), (110, 70, 28)]
RED_FX = [(255, 235, 210), (255, 170, 120), (232, 90, 60), (170, 40, 30), (100, 16, 16)]


def put(layer, x, y, c):
    xi, yi = int(round(x)), int(round(y))
    h, w = layer.shape[:2]
    if 0 <= xi < w and 0 <= yi < h:
        layer[yi, xi] = (c[0], c[1], c[2], 255)


def put_sq(layer, x, y, s, c):
    for dy in range(s):
        for dx in range(s):
            put(layer, x + dx, y + dy, c)


def motes(layer, u, seed, n, box, colors, up=True, cycles=1, sway=3.0, size2=0.3, drift=0.0):
    """Granos de arena/luz que suben o bajan. Bucle perfecto en u in [0,1)."""
    rng = np.random.RandomState(seed)
    x0, y0, x1, y1 = box
    for _ in range(n):
        bx = rng.uniform(x0, x1)
        ph = rng.uniform(0, 1)
        cyc = int(rng.choice([1, 1, 2])) * cycles
        sw = rng.uniform(0.3, 1.0) * sway
        sp = rng.uniform(0, 6.2832)
        size = 2 if rng.rand() < size2 else 1
        f = (ph + u * cyc) % 1.0
        if f > 0.96:
            continue
        y = (y1 - f * (y1 - y0)) if up else (y0 + f * (y1 - y0))
        x = bx + sw * math.sin(sp + 6.2832 * u * cyc) + drift * f
        ci = min(len(colors) - 1, int(f * len(colors) * (1.0 if up else 1.0)))
        put_sq(layer, x, y, size, colors[ci])


def disc(layer, cx, cy, r, colors, squash=1.0):
    """Disco relleno con rampa radial (sin dithering): borde = colors[-1], centro = colors[0]."""
    h, w = layer.shape[:2]
    x0, x1 = int(max(0, cx - r - 1)), int(min(w, cx + r + 2))
    y0, y1 = int(max(0, cy - r * squash - 1)), int(min(h, cy + r * squash + 2))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.sqrt(((xx - cx) / r) ** 2 + ((yy - cy) / (r * squash)) ** 2)
    inside = d <= 1.0
    idx = np.clip((d * len(colors)).astype(int), 0, len(colors) - 1)
    for i, c in enumerate(colors):
        sel = inside & (idx == i)
        layer[y0:y1, x0:x1][sel] = (c[0], c[1], c[2], 255)


def ring(layer, cx, cy, r, colors, thick=2, fade=1.0, squash=1.0, a0=0.0, a1=360.0, seed=0):
    """Anillo pixel. colors[0]=exterior..; fade<1 -> dithering."""
    if r < 0.5:
        return
    n = max(24, int(2 * math.pi * r * 1.6))
    bay = _bayer8()
    for i in range(n):
        a = math.radians(a0 + (a1 - a0) * i / n)
        for t in range(thick):
            rr = r - t * 0.9
            x = cx + math.cos(a) * rr
            y = cy + math.sin(a) * rr * squash
            if fade < 1.0:
                if bay[int(round(y)) % 8, int(round(x)) % 8] >= fade:
                    continue
            put(layer, x, y, colors[min(len(colors) - 1, t * len(colors) // max(1, thick))])


def arc_trail(layer, cx, cy, r, a0, a1, w0, w1, colors, squash=1.0, steps=None):
    """Arco relleno con grosor decreciente (estela de un zarpazo). Angulos en grados; w0 al inicio, w1 al final.
    Se rasteriza con pasos finos y rayos radiales para que no queden huecos."""
    length = abs(math.radians(a1 - a0)) * max(r, 1)
    steps = steps or int(length * 2.2) + 4
    for i in range(steps + 1):
        f = i / steps
        a = math.radians(a0 + (a1 - a0) * f)
        w = w0 + (w1 - w0) * f
        if w < 0.6:
            continue
        n = int(w * 2.2) + 1
        for k in range(n):
            off = (k / max(1, n - 1) - 0.5) * w
            x = cx + math.cos(a) * (r + off)
            y = cy + math.sin(a) * (r + off) * squash
            edge = abs(off) / (w / 2.0 + 1e-6)
            ci = min(len(colors) - 1, int(edge * 2.4 + f * 1.4))
            put(layer, x, y, colors[ci])


def column(layer, x, y_top, y_bot, w, colors, dither_edge=True, seed=1):
    """Columna vertical de luz con nucleo claro y bordes dithered."""
    h, wl = layer.shape[:2]
    bay = _bayer8()
    for y in range(int(max(0, y_top)), int(min(h, y_bot))):
        for dx in range(-int(w), int(w) + 1):
            d = abs(dx) / max(1.0, w)
            xx = int(round(x + dx))
            if not (0 <= xx < wl):
                continue
            if d > 0.6 and bay[y % 8, xx % 8] < (d - 0.6) * 2.4:
                continue
            ci = min(len(colors) - 1, int(d * len(colors)))
            layer[y, xx] = (colors[ci][0], colors[ci][1], colors[ci][2], 255)


def sparkle(layer, x, y, size, color, core=None):
    core = core or color
    xi, yi = int(round(x)), int(round(y))
    put(layer, xi, yi, core)
    for k in range(1, size + 1):
        c = color if k < size else color
        for dx, dy in ((k, 0), (-k, 0), (0, k), (0, -k)):
            put(layer, xi + dx, yi + dy, c)
    if size >= 3:
        for dx, dy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
            put(layer, xi + dx, yi + dy, color)


def radial_rays(layer, cx, cy, r0, r1, n, rot, colors, thick=1):
    for i in range(n):
        a = rot + 2 * math.pi * i / n
        steps = int(r1 - r0)
        for s in range(steps):
            rr = r0 + s
            ci = min(len(colors) - 1, int(s / max(1, steps) * len(colors)))
            put(layer, cx + math.cos(a) * rr, cy + math.sin(a) * rr, colors[ci])


def glow_back(layer, cx, cy, r, strength, colors=GOLD_FX, power=1.4):
    from gfx import dither_glow
    dither_glow(layer, cx, cy, r, colors[2], strength=strength, power=power, ramp=colors[::-1][:4] + [colors[0]] if False else None)


def crack_lines(fig, amount, seed, color=(255, 214, 110)):
    """Grietas doradas brillantes (2 px) sobre los pixeles de la figura, para la muerte."""
    if amount <= 0:
        return fig
    rng = np.random.RandomState(seed)
    h, w = fig.shape[:2]
    ys, xs = np.nonzero(fig[..., 3] > 0)
    if len(xs) == 0:
        return fig
    hot = (255, 247, 205)
    for n in range(int(14 * amount) + 4):
        i = rng.randint(len(xs))
        x, y = float(xs[i]), float(ys[i])
        a = rng.uniform(0, 6.28)
        for s in range(int(rng.uniform(14, 42) * amount) + 5):
            a += rng.uniform(-0.55, 0.55)
            x += math.cos(a) * 1.15
            y += math.sin(a) * 1.15
            xi, yi = int(round(x)), int(round(y))
            for ox, oy in ((0, 0), (1, 0), (0, 1)):
                px_, py_ = xi + ox, yi + oy
                if 0 <= px_ < w and 0 <= py_ < h and fig[py_, px_, 3] > 0:
                    fig[py_, px_, :3] = hot if (ox == 0 and oy == 0) else color
    return fig


def dissolve_pixels(fig, amount, seed):
    """Desintegra la figura: los pixeles desaparecen de abajo arriba (con ruido) y se convierten en polvo dorado."""
    h, w = fig.shape[:2]
    rng = np.random.RandomState(seed)
    noise = rng.rand(h, w)
    sel = rng.rand(h, w)
    n2 = rng.rand(h, w)
    yy = np.arange(h)[:, None] / float(h)
    thr = 0.58 * (1.0 - yy) + 0.42 * noise
    a = amount * 1.12
    alive = fig[..., 3] > 0
    gone = alive & (a > thr)
    out = fig.copy()
    out[gone] = 0
    dust = np.zeros_like(fig)
    delta = a - thr
    band = alive & (delta > 0) & (delta < 0.30) & (sel < 0.33)
    ys, xs = np.nonzero(band)
    for y, x in zip(ys, xs):
        d = delta[y, x]
        ny = int(round(y - d * 85 - 2))
        nx = int(round(x + (n2[y, x] - 0.35) * 18 + d * 34))
        if 0 <= nx < w and 0 <= ny < h:
            ci = min(len(SAND_FX) - 1, int(d / 0.30 * len(GOLD_FX)))
            c = GOLD_FX[ci] if (x + y) % 3 else SAND_FX[ci]
            dust[ny, nx] = (c[0], c[1], c[2], 255)
    return out, dust
