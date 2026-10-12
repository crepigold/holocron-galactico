"""
gfx.py - Motor de pixel art por supersampling para los sprites de Sethur.

Idea: todas las formas se dibujan como poligonos "duros" (sin antialias) a SSx la
resolucion final y luego se muestrea el centro de cada bloque SSxSS. El resultado son
bordes nitidos con aspecto de pixel art, pero con la precision geometrica de un
dibujo vectorial (rotaciones, deformaciones de tela, etc. sin perder calidad).

El sombreado se hace con "biseles": cada forma se pinta con 5 tonos (profundo, sombra,
base, luz, brillo) desplazando su propia mascara respecto a la fuente de luz.
"""
from __future__ import annotations

import math
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SS = 3                       # factor de supersampling
OUTLINE = (12, 7, 18)        # color del contorno exterior


# ----------------------------------------------------------------------------- color
def rgb(h):
    if isinstance(h, tuple):
        return h
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    a, b = rgb(a), rgb(b)
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


class Ramp:
    """5 tonos: profundo, sombra, base, luz, brillo."""

    def __init__(self, deep, shadow, mid, light, hi):
        self.c = [rgb(x) for x in (deep, shadow, mid, light, hi)]

    deep = property(lambda s: s.c[0])
    shadow = property(lambda s: s.c[1])
    mid = property(lambda s: s.c[2])
    light = property(lambda s: s.c[3])
    hi = property(lambda s: s.c[4])

    def tone(self, i):
        return self.c[max(0, min(4, i))]

    def tinted(self, other, t):
        return Ramp(*[mix(a, b, t) for a, b in zip(self.c, other.c)])


GOLD = Ramp("#3b1d07", "#7d4510", "#d38c1d", "#f8c34f", "#fff3bd")
GOLD_OLD = Ramp("#2b1605", "#5f330c", "#a8680f", "#d79d2d", "#f6d374")
BLACK = Ramp("#06050a", "#0f0d17", "#1d1a2b", "#312d49", "#59537c")
BLUE = Ramp("#06133a", "#0e2e78", "#1d62c8", "#4eaaf2", "#d6f1ff")
CLOTH = Ramp("#4f321a", "#93683a", "#d6b374", "#f1dca4", "#fff7d8")
SAND = Ramp("#46290d", "#895720", "#c58a39", "#ebbb5b", "#ffe59d")
EYE = Ramp("#8a4a00", "#ffae12", "#ffe066", "#fff7c4", "#ffffff")
RED = Ramp("#2a0606", "#6d1010", "#b32020", "#e8503a", "#ffb09a")
STONE = Ramp("#1a1208", "#3d2c14", "#6e5230", "#9c7a48", "#d1b27a")
BONE = Ramp("#3a2c1c", "#7c6444", "#c6aa7c", "#e8d6a8", "#fff6dc")


# ----------------------------------------------------------------------------- transform
class Xf:
    """Transformacion 2D local->lienzo. Convencion de angulo 'a' (grados):
    a=0 apunta hacia abajo (+y local), a=90 apunta hacia delante (+x), a=180 hacia arriba."""

    def __init__(self, ox=0.0, oy=0.0, a=0.0, sx=1.0, sy=1.0):
        self.ox, self.oy, self.a, self.sx, self.sy = ox, oy, a, sx, sy
        r = math.radians(a)
        self.c, self.s = math.cos(r), math.sin(r)

    def pt(self, x, y):
        x *= self.sx
        y *= self.sy
        return (self.ox + x * self.c + y * self.s, self.oy - x * self.s + y * self.c)

    def __call__(self, pts):
        return [self.pt(x, y) for x, y in pts]

    def child(self, lx, ly, a=0.0, sx=1.0, sy=1.0):
        ox, oy = self.pt(lx, ly)
        return Xf(ox, oy, self.a + a, self.sx * sx, self.sy * sy)

    def dir(self, a_local):
        """vector unitario (en lienzo) para un angulo local."""
        r = math.radians(self.a + a_local)
        return (math.sin(r), math.cos(r))


# ----------------------------------------------------------------------------- formas
def ellipse_pts(cx, cy, rx, ry, n=36, rot=0.0):
    out = []
    cr, sr = math.cos(rot), math.sin(rot)
    for i in range(n):
        t = 2 * math.pi * i / n
        x, y = rx * math.cos(t), ry * math.sin(t)
        out.append((cx + x * cr - y * sr, cy + x * sr + y * cr))
    return out


def stroke_poly(pts, w0, w1=None):
    """Polilinea con grosor variable -> poligono (lista de puntos)."""
    if w1 is None:
        w1 = w0
    n = len(pts)
    left, right = [], []
    for i, (x, y) in enumerate(pts):
        if i == 0:
            dx, dy = pts[1][0] - x, pts[1][1] - y
        elif i == n - 1:
            dx, dy = x - pts[i - 1][0], y - pts[i - 1][1]
        else:
            dx, dy = pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]
        l = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / l, dx / l
        w = (w0 + (w1 - w0) * i / max(1, n - 1)) / 2
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    return left + right[::-1]


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


# ----------------------------------------------------------------------------- lienzo
class Shape:
    """Mascara de una forma ya pintada, para poder decorarla recortando."""

    def __init__(self, cv, mask, off):
        self.cv, self.mask, self.off = cv, mask, off

    def _layer(self):
        return Image.new("L", self.mask.size, 0)

    def clip_poly(self, pts, color):
        ss = self.cv.ss
        lay = self._layer()
        ImageDraw.Draw(lay).polygon([(x * ss - self.off[0], y * ss - self.off[1]) for x, y in pts], fill=255)
        lay = ImageChops.multiply(lay, self.mask)
        self.cv._paste(lay, self.off, color)

    def clip_ellipse(self, cx, cy, rx, ry, color, rot=0.0):
        self.clip_poly(ellipse_pts(cx, cy, rx, ry, 24, rot), color)

    def clip_line(self, p0, p1, w, color):
        ss = self.cv.ss
        lay = self._layer()
        ImageDraw.Draw(lay).line(
            [(p0[0] * ss - self.off[0], p0[1] * ss - self.off[1]), (p1[0] * ss - self.off[0], p1[1] * ss - self.off[1])],
            fill=255, width=max(1, int(round(w * ss))))
        lay = ImageChops.multiply(lay, self.mask)
        self.cv._paste(lay, self.off, color)


class Canvas:
    def __init__(self, w, h, ss=SS):
        self.w, self.h, self.ss = w, h, ss
        self.img = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))

    # -- utilidades internas
    def _bbox(self, pts, pad):
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0 = int(math.floor(min(xs) * self.ss)) - pad
        y0 = int(math.floor(min(ys) * self.ss)) - pad
        x1 = int(math.ceil(max(xs) * self.ss)) + pad
        y1 = int(math.ceil(max(ys) * self.ss)) + pad
        return x0, y0, x1, y1

    def _paste(self, mask, off, color):
        x0, y0 = off
        if len(color) == 3:
            color = tuple(color) + (255,)
        # recorte a los limites del lienzo
        W, H = self.img.size
        mw, mh = mask.size
        cx0, cy0 = max(0, -x0), max(0, -y0)
        cx1, cy1 = min(mw, W - x0), min(mh, H - y0)
        if cx1 <= cx0 or cy1 <= cy0:
            return
        if (cx0, cy0, cx1, cy1) != (0, 0, mw, mh):
            mask = mask.crop((cx0, cy0, cx1, cy1))
        self.img.paste(color, (x0 + cx0, y0 + cy0, x0 + cx1, y0 + cy1), mask)

    def poly_mask(self, pts, pad):
        x0, y0, x1, y1 = self._bbox(pts, pad)
        m = Image.new("L", (max(1, x1 - x0), max(1, y1 - y0)), 0)
        ss = self.ss
        ImageDraw.Draw(m).polygon([(p[0] * ss - x0, p[1] * ss - y0) for p in pts], fill=255)
        return m, (x0, y0)

    # -- pintura
    def fill(self, pts, color):
        m, off = self.poly_mask(pts, 2)
        self._paste(m, off, color)
        return Shape(self, m, off)

    def shape(self, pts, ramp, k=1.0, light=(-0.62, -0.78), outline=OUTLINE, ow=1.0, bands=True, tone=0, decor=None):
        """Forma con contorno propio + biseles de luz y sombra (k = grosor del bisel en px finales).
        Si se pasa 'decor(shape)', se ejecuta tras el relleno base y el sombreado pasa a modo overlay
        (oscurece/aclara lo ya pintado) para conservar las franjas/decoraciones."""
        ss = self.ss
        pad = int((ow + 4.2 * k + 2) * ss)
        m, off = self.poly_mask(pts, pad)
        if outline is not None and ow > 0:
            n = max(1, int(round(ow * ss)))
            self._paste(m.filter(ImageFilter.MaxFilter(2 * n + 1)), off, outline)
        self._paste(m, off, ramp.tone(2 + tone))
        sh = Shape(self, m, off)
        if decor is not None:
            decor(sh)
        if bands:
            lx, ly = light
            kk = k * ss

            def shifted(mult, sign):
                dx = int(round(lx * kk * mult)) * sign
                dy = int(round(ly * kk * mult)) * sign
                return ImageChops.offset(m, dx, dy)

            if decor is None:
                for mult, i in ((2.7, 1), (1.25, 0)):
                    self._paste(ImageChops.subtract(m, shifted(mult, 1)), off, ramp.tone(i + tone))
                for mult, i in ((1.2, 3), (0.55, 4)):
                    self._paste(ImageChops.subtract(m, shifted(mult, -1)), off, ramp.tone(i + tone))
            else:
                dark, lite = ramp.deep, ramp.hi
                for mult, a in ((2.7, 0.30), (1.25, 0.32)):
                    b = ImageChops.subtract(m, shifted(mult, 1)).point(lambda v, a=a: int(v * a))
                    self._paste(b, off, dark)
                for mult, a in ((1.2, 0.22), (0.55, 0.30)):
                    b = ImageChops.subtract(m, shifted(mult, -1)).point(lambda v, a=a: int(v * a))
                    self._paste(b, off, lite)
        return sh

    def ellipse(self, cx, cy, rx, ry, ramp, rot=0.0, **kw):
        n = max(20, int(max(rx, ry) * 3))
        return self.shape(ellipse_pts(cx, cy, rx, ry, n, rot), ramp, **kw)

    def line(self, pts, w0, ramp, w1=None, **kw):
        return self.shape(stroke_poly(pts, w0, w1), ramp, **kw)

    # -- salida
    def to_array(self):
        ss = self.ss
        a = np.asarray(self.img)
        c = ss // 2
        px = a[c::ss, c::ss, :].copy()
        px[..., 3] = np.where(px[..., 3] >= 128, 255, 0)
        px[px[..., 3] == 0] = 0
        return px


# ----------------------------------------------------------------------------- post-proceso (resolucion final)
BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], dtype=np.float32) / 16.0
BAYER8 = None


def _bayer8():
    global BAYER8
    if BAYER8 is None:
        b = np.array([[0, 2], [3, 1]], dtype=np.float32)
        for _ in range(2):
            b = np.block([[4 * b, 4 * b + 2], [4 * b + 3, 4 * b + 1]])
        BAYER8 = (b + 0.5) / 64.0
    return BAYER8


def _blend_over(dst, ys, xs, color, mask):
    """Pinta pixeles de 'color' donde mask (bool) sobre dst (alpha binario)."""
    c = np.array(list(color[:3]) + [255], dtype=np.uint8)
    dst[ys, xs][mask] = c


def outline_pass(px, color=OUTLINE):
    a = px[..., 3] > 0
    n = np.zeros_like(a)
    n[1:, :] |= a[:-1, :]
    n[:-1, :] |= a[1:, :]
    n[:, 1:] |= a[:, :-1]
    n[:, :-1] |= a[:, 1:]
    edge = n & ~a
    px[edge] = (color[0], color[1], color[2], 255)
    return px


def over(base, top):
    """Compone 'top' sobre 'base' (ambos RGBA uint8 con alpha binario)."""
    m = top[..., 3] > 0
    base[m] = top[m]
    return base


def new_layer(w, h):
    return np.zeros((h, w, 4), dtype=np.uint8)


def dither_glow(layer, cx, cy, r, color, strength=1.0, power=1.5, ramp=None, inner=0.0, squash=1.0):
    """Resplandor radial con dithering Bayer (alpha binario). 'ramp' opcional: lista de colores del
    borde hacia el centro."""
    h, w = layer.shape[:2]
    x0, x1 = int(max(0, cx - r - 1)), int(min(w, cx + r + 2))
    y0, y1 = int(max(0, cy - r * squash - 1)), int(min(h, cy + r * squash + 2))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.sqrt(((xx - cx) / r) ** 2 + ((yy - cy) / (r * squash)) ** 2)
    a = np.clip(1.0 - d, 0, 1) ** power * strength
    if inner > 0:
        a = np.where(d < inner, 1.0, a)
    th = _bayer8()[(yy % 8), (xx % 8)]
    on = a > th
    if ramp is None:
        layer[y0:y1, x0:x1][on] = (color[0], color[1], color[2], 255)
    else:
        idx = np.clip(((1 - d) * len(ramp)).astype(int), 0, len(ramp) - 1)
        for i, col in enumerate(ramp):
            sel = on & (idx == i)
            layer[y0:y1, x0:x1][sel] = (col[0], col[1], col[2], 255)


def dots(layer, pts, colors):
    """Pixeles sueltos. pts: [(x,y,size,colorIndex)]"""
    h, w = layer.shape[:2]
    for x, y, s, ci in pts:
        c = colors[ci % len(colors)]
        xi, yi = int(round(x)), int(round(y))
        for dy in range(s):
            for dx in range(s):
                px_, py_ = xi + dx, yi + dy
                if 0 <= px_ < w and 0 <= py_ < h:
                    layer[py_, px_] = (c[0], c[1], c[2], 255)


def line_px(layer, p0, p1, color, thick=1):
    """Linea de pixeles (Bresenham) con grosor."""
    h, w = layer.shape[:2]
    x0, y0 = int(round(p0[0])), int(round(p0[1]))
    x1, y1 = int(round(p1[0])), int(round(p1[1]))
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx + dy
    c = (color[0], color[1], color[2], 255)
    while True:
        for oy in range(thick):
            for ox in range(thick):
                xx, yy = x0 + ox, y0 + oy
                if 0 <= xx < w and 0 <= yy < h:
                    layer[yy, xx] = c
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x0 += sx
        if e2 <= dx:
            err += dx
            y0 += sy


def tint(px, color, amount):
    """Mezcla los pixeles opacos hacia 'color' (para destellos de dano)."""
    m = px[..., 3] > 0
    for i in range(3):
        ch = px[..., i].astype(np.float32)
        ch[m] = ch[m] + (color[i] - ch[m]) * amount
        px[..., i] = np.clip(ch, 0, 255).astype(np.uint8)
    return px


def to_image(px):
    return Image.fromarray(px, "RGBA")
