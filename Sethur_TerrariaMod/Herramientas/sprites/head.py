"""
head.py - Cabeza de chacal (Anubis) como mini-modelo 3D de caras planas, proyectada en
ortografico con rotacion de yaw/pitch. Asi la misma cabeza sirve para vista frontal,
3/4, perfil y para la animacion de giro, sin dibujar vistas a mano.

Espacio de cabeza: X lateral (+ a la derecha de la imagen en yaw 0), Y hacia abajo,
Z hacia delante (hacia el espectador en yaw 0). Origen = centro del craneo.
"""
from __future__ import annotations

import math
from gfx import (BLACK, BLUE, GOLD, GOLD_OLD, EYE, Ramp, Xf, ellipse_pts, mix, rgb, OUTLINE)


def rot(p, yaw, pitch):
    x, y, z = p
    cy, sy = math.cos(yaw), math.sin(yaw)
    x1 = x * cy + z * sy
    z1 = -x * sy + z * cy
    cp, sp = math.cos(pitch), math.sin(pitch)
    y2 = y * cp - z1 * sp
    z2 = y * sp + z1 * cp
    return (x1, y2, z2)


def hull(points):
    pts = sorted(set((round(x, 3), round(y, 3)) for x, y in points))
    if len(pts) <= 2:
        return pts

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lo = []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    up = []
    for p in reversed(pts):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0:
            up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def cross3(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def norm3(a):
    l = math.sqrt(dot3(a, a)) or 1.0
    return (a[0] / l, a[1] / l, a[2] / l)


LIGHT = norm3((-0.55, -0.65, 0.55))   # luz desde arriba-izquierda-delante (espacio de vista)

# patron del nemes: (alto en px, rampa)
NEMES_PATTERN = [(3.2, GOLD), (3.6, BLUE), (3.2, GOLD), (2.4, BLACK), (3.6, BLUE), (2.4, BLACK)]


class _Part:
    def __init__(self, name, pts, ramp, order=0.0, solid_center=None, k=0.9, post=None, cull=True, tone_shift=0, ow=1.0, bias=None):
        self.name, self.pts, self.ramp, self.order = name, pts, ramp, order
        self.solid_center, self.k, self.post, self.cull, self.tone_shift, self.ow = solid_center, k, post, cull, tone_shift, ow


def face_quad(a, b, c, d):
    return [a, b, c, d]


def frustum(base_c, bw, by0, by1, tip_c, tw, ty0, ty1):
    bx, by, bz = base_c
    tx, ty, tz = tip_c
    B = [(bx - bw, by + by0, bz), (bx + bw, by + by0, bz), (bx + bw, by + by1, bz), (bx - bw, by + by1, bz)]
    T = [(tx - tw, ty + ty0, tz), (tx + tw, ty + ty0, tz), (tx + tw, ty + ty1, tz), (tx - tw, ty + ty1, tz)]
    center = ((bx + tx) / 2, (by + (by0 + by1) / 2 + ty + (ty0 + ty1) / 2) / 2, (bz + tz) / 2)
    return [
        ("top", [B[0], B[1], T[1], T[0]]),
        ("right", [B[1], B[2], T[2], T[1]]),
        ("left", [B[0], T[0], T[3], B[3]]),
        ("tip", [T[0], T[1], T[2], T[3]]),
        ("bottom", [B[3], B[2], T[2], T[3]]),
    ], center


def quad_pt(q, u, v):
    """q = (TL,TR,BR,BL) en 3D; u horizontal 0..1, v vertical 0..1."""
    top = [q[0][i] + (q[1][i] - q[0][i]) * u for i in range(3)]
    bot = [q[3][i] + (q[2][i] - q[3][i]) * u for i in range(3)]
    return tuple(top[i] + (bot[i] - top[i]) * v for i in range(3))


def draw_head(cv, cx, cy, yaw=0.7, pitch=0.0, roll=0.0, scale=1.0, mouth=0.0, eye_glow=0.6,
              theme="gold", show_lappets=True, show_ears=True, lappet_swing=0.0, ear_flick=0.0,
              detail=1.0, return_info=False):
    """Dibuja la cabeza en el lienzo. cx,cy = posicion del centro del craneo en el lienzo.
    yaw en radianes (0 frontal, +0.7 = 3/4 mirando a la derecha). Devuelve info de anclajes."""
    rc, rs = math.cos(math.radians(roll)), math.sin(math.radians(roll))

    def P(p):
        x, y, z = rot(p, yaw, pitch)
        xr, yr = x * rc - y * rs, x * rs + y * rc
        return (cx + xr * scale, cy + yr * scale), z

    def P2(p):
        return P(p)[0]

    eye_ramp = EYE if theme == "gold" else Ramp("#06304a", "#1a8fd0", "#7fd8ff", "#d4f6ff", "#ffffff")
    parts = []

    # ---------------- tela trasera del nemes
    q_back = [(-16, -12, -13), (16, -12, -13), (21, 44, -11), (-21, 44, -11)]

    # ---------------- orejas
    def ear(sign):
        s = sign
        ear_pts = [(s * 6, -9, -2), (s * 17.5, -6, -3), (s * 18.5, -26, -4.5), (s * 15.5, -53 + ear_flick * s, -6.5),
                   (s * 10, -29, -3.5)]
        return ear_pts

    def ear_post(sign):
        def f(shape, ctx):
            s = sign
            inner = [(s * 8.2, -11, -1.8), (s * 14.8, -9, -2.8), (s * 15.6, -27, -4.2), (s * 14, -47 + ear_flick * s, -6), (s * 10.8, -29, -3)]
            shape.clip_poly([P2(p) for p in inner], GOLD.mid)
            inner2 = [(s * 9.4, -13, -1.8), (s * 13.4, -12, -2.6), (s * 14, -27, -4), (s * 13.2, -42 + ear_flick * s, -5.8), (s * 11.2, -29, -3)]
            shape.clip_poly([P2(p) for p in inner2], mix(GOLD.shadow, BLACK.shadow, 0.35))
            # borde dorado de la punta
            tip = [(s * 13.2, -45 + ear_flick * s, -6.2), (s * 15.5, -53 + ear_flick * s, -6.5), (s * 17.2, -43 + ear_flick * s, -5.5)]
            shape.clip_poly([P2(p) for p in tip], GOLD.light)
        return f

    if show_ears:
        for sgn in (-1, 1):
            parts.append(_Part("ear%+d" % sgn, ear(sgn), BLACK, order=-500, solid_center=(0, -20, -10), post=ear_post(sgn), cull=False))

    # ---------------- craneo (elipsoide) -> casco convexo
    sk_c, sk_r = (0.0, -3.0, -1.0), (15.5, 15.5, 14.5)
    pts3 = []
    for i in range(18):
        for j in range(36):
            th = math.pi * (i + 0.5) / 18
            ph = 2 * math.pi * j / 36
            pts3.append((sk_c[0] + sk_r[0] * math.sin(th) * math.cos(ph),
                         sk_c[1] + sk_r[1] * math.cos(th),
                         sk_c[2] + sk_r[2] * math.sin(th) * math.sin(ph)))
    sk_poly = hull([P2(p) for p in pts3])

    # ---------------- lappets
    lap = []
    if show_lappets:
        for sgn in (-1, 1):
            xs = sgn * 19.5
            sw = lappet_swing * 6
            q = [(xs - 4.6, -6, 2), (xs + 4.6, -6, 2), (xs + 5.4 + sw, 33, 3.5), (xs - 5.4 + sw, 33, 3.5)]
            lap.append((sgn, q))

    def lappet_post(q):
        def f(shape, ctx):
            v = 0.0
            i = 0
            total = 39.0
            y = 0.0
            while y < total:
                h, ramp = NEMES_PATTERN[i % len(NEMES_PATTERN)]
                v0, v1 = y / total, min(1.0, (y + h) / total)
                poly = [quad_pt(q, -0.1, v0), quad_pt(q, 1.1, v0), quad_pt(q, 1.1, v1), quad_pt(q, -0.1, v1)]
                shape.clip_poly([P2(p) for p in poly], ramp.mid)
                # linea de luz arriba de cada banda
                if h > 2.5:
                    poly2 = [quad_pt(q, -0.1, v0), quad_pt(q, 1.1, v0), quad_pt(q, 1.1, v0 + 0.8 / total), quad_pt(q, -0.1, v0 + 0.8 / total)]
                    shape.clip_poly([P2(p) for p in poly2], ramp.light)
                y += h
                i += 1
            # punta dorada
            poly = [quad_pt(q, -0.1, 0.9), quad_pt(q, 1.1, 0.9), quad_pt(q, 1.1, 1.1), quad_pt(q, -0.1, 1.1)]
            shape.clip_poly([P2(p) for p in poly], GOLD.mid)
            poly = [quad_pt(q, -0.1, 0.9), quad_pt(q, 1.1, 0.9), quad_pt(q, 1.1, 0.935), quad_pt(q, -0.1, 0.935)]
            shape.clip_poly([P2(p) for p in poly], GOLD.hi)
        return f

    for sgn, q in lap:
        parts.append(_Part("lappet%+d" % sgn, q, BLUE.tinted(BLACK, 0.5), order=10, solid_center=(sgn * 15.5, 20, -40),
                           post=lappet_post(q), cull=False, k=1.0))

    # ---------------- hocico (superior) e inferior (mandibula)
    up_faces, up_center = frustum((0, -1, 8), 8.4, -6.5, 6.5, (0, 3.2, 40), 3.6, -1.4, 5.4)
    jaw_open = math.radians(mouth * 22)
    # mandibula: rotada alrededor de un pivote (0,6,9) en X
    def jaw_rot(p):
        x, y, z = p
        py, pz = 6.0, 9.0
        dy, dz = y - py, z - pz
        c, s = math.cos(jaw_open), math.sin(jaw_open)
        return (x, py + dy * c - dz * s, pz + dy * s + dz * c)

    jw_faces, jw_center = frustum((0, 6.6, 7.5), 7.0, 0, 4.2, (0, 8.2, 35), 2.8, 0, 2.4)
    jw_faces = [(n, [jaw_rot(p) for p in f]) for n, f in jw_faces]
    jw_center = jaw_rot(jw_center)

    def face_part(name, f, center, ramp, order, k=0.8, post=None):
        parts.append(_Part(name, f, ramp, order=order, solid_center=center, k=k, post=post))

    for n, f in jw_faces:
        face_part("jaw_" + n, f, jw_center, BLACK, 20, 0.7)
    for n, f in up_faces:
        post = None
        if n == "top":
            def post(shape, ctx, f=f):
                # linea dorada central del hocico (marca de Anubis)
                a = quad_pt(f, 0.5, 0.05)
                b = quad_pt(f, 0.5, 0.95)
                shape.clip_line(P2(a), P2(b), 0.8, mix(GOLD.shadow, BLACK.mid, 0.4))
        face_part("up_" + n, f, up_center, BLACK, 30, 0.8, post)

    # ---------------- craneo (dibujo)
    def skull_post(shape, ctx):
        # bandas del nemes sobre el craneo, desde la frente hacia arriba
        top_y = P2((0, -18.5, 0))[1]
        y = 0.0
        i = 0
        base_y = P2((0, -6.0, 0))[1]
        # bandas hacia arriba empezando en la diadema
        yy = base_y - 3.2 * scale
        i = 0
        while yy > top_y - 8 * scale:
            h, ramp = NEMES_PATTERN[(i + 1) % len(NEMES_PATTERN)]
            hh = h * scale
            poly = [(cx - 40 * scale, yy - hh), (cx + 40 * scale, yy - hh), (cx + 40 * scale, yy), (cx - 40 * scale, yy)]
            shape.clip_poly(poly, ramp.mid)
            poly2 = [(cx - 40 * scale, yy - hh), (cx + 40 * scale, yy - hh), (cx + 40 * scale, yy - hh + 0.9 * scale), (cx - 40 * scale, yy - hh + 0.9 * scale)]
            shape.clip_poly(poly2, ramp.light)
            yy -= hh
            i += 1
        # diadema dorada
        d0 = P2((0, -9.6, 0))[1]
        d1 = P2((0, -5.4, 0))[1]
        shape.clip_poly([(cx - 40 * scale, d0), (cx + 40 * scale, d0), (cx + 40 * scale, d1), (cx - 40 * scale, d1)], GOLD.mid)
        shape.clip_poly([(cx - 40 * scale, d0), (cx + 40 * scale, d0), (cx + 40 * scale, d0 + 1.0 * scale), (cx - 40 * scale, d0 + 1.0 * scale)], GOLD.hi)
        shape.clip_poly([(cx - 40 * scale, d1 - 1.2 * scale), (cx + 40 * scale, d1 - 1.2 * scale), (cx + 40 * scale, d1), (cx - 40 * scale, d1)], GOLD.shadow)
        # sombreado por lado (lado opuesto a la luz)
        # (el biselado general ya aporta volumen)

    parts.append(_Part("skull", sk_poly, BLACK.tinted(BLUE, 0.15), order=0, solid_center=None, k=1.6, post=skull_post, cull=False))

    # ---------------- ojos (planos sobre la superficie del craneo)
    def eye_part(sgn):
        n = norm3((sgn * 0.62, 0.0, 0.78))
        u = norm3((sgn * -0.78, 0.0, 0.62))     # hacia atras/afuera (alejandose del hocico)
        v = (0.0, 1.0, 0.0)
        c = (sgn * 9.4, -4.2, 10.4)

        def E(a, b):
            a, b = a * 1.35, b * 1.35
            return (c[0] + u[0] * a + v[0] * b, c[1] + u[1] * a + v[1] * b, c[2] + u[2] * a + v[2] * b)
        # almendra (hacia el hocico = -u). a>0 hacia atras
        almond = [E(-4.6, 1.8), E(-1.8, -0.8), E(1.8, -2.1), E(5.4, -3.6), E(2.4, -0.3), E(-0.8, 1.9)]
        return n, E, almond

    for sgn in (-1, 1):
        n, E, almond = eye_part(sgn)
        nz = rot(n, yaw, pitch)[2]
        if nz > 0.08:
            def post(shape, ctx, E=E, nz=nz):
                # iris brillante
                iris = [E(-1.6, 0.9), E(-0.2, -0.6), E(1.6, -0.9), E(0.8, 0.6)]
                shape.clip_poly([P2(p) for p in iris], eye_ramp.hi if eye_glow > 0.5 else eye_ramp.light)
            far = (sgn * yaw) > 0
            eo = 25 if far else 40
            sock = [E(-6.6, 2.8), E(-2, -1.8), E(2, -3.4), E(7.6, -5.4), E(8.2, -2.4), E(3, 1.4), E(-1.6, 3.2)]
            parts.append(_Part("sock%+d" % sgn, sock, BLACK, order=eo - 0.8, k=0.3, cull=False, ow=0.0))
            parts.append(_Part("eye%+d" % sgn, almond, eye_ramp, order=eo, k=0.5, cull=False, post=post, ow=0.45))
            # kohl dorado: raya que se alarga hacia la oreja
            kohl = [E(5.4, -3.6), E(12.5, -7.0), E(12, -5.2), E(5.2, -2.0)]
            parts.append(_Part("kohl%+d" % sgn, kohl, GOLD, order=eo - 0.5, k=0.4, cull=False, ow=0.0))
            brow = [E(-4.2, -2.4), E(-1.0, -4.0), E(5.8, -5.4), E(6.2, -3.8), E(-0.6, -2.6), E(-3.8, -0.6)]
            parts.append(_Part("brow%+d" % sgn, brow, BLACK.tinted(BLUE, 0.3), order=eo - 0.6, k=0.4, cull=False, ow=0.0))

    # ---------------- gema de la frente (uraeus azul)
    gem_c = (0, -8.0, 14.6)
    gem = [(0, -13.5, 14.6), (3.4, -8.2, 14.6), (0, -3.0, 14.6), (-3.4, -8.2, 14.6)]
    if rot((0, 0, 1), yaw, pitch)[2] > 0.1:
        def gem_post(shape, ctx):
            hi = [(0, -12, 14.6), (1.6, -8.6, 14.6), (0, -7.4, 14.6), (-0.8, -9, 14.6)]
            shape.clip_poly([P2(p) for p in hi], BLUE.hi)
        parts.append(_Part("gem", gem, BLUE, order=50, k=0.55, cull=False, post=gem_post, ow=0.6))

    # ---------------- nariz
    nose_c = (0, 0.9, 40.2)
    # elipsoide pequeno -> hull
    npts = []
    for i in range(10):
        for j in range(16):
            th = math.pi * (i + 0.5) / 10
            ph = 2 * math.pi * j / 16
            npts.append((nose_c[0] + 4.0 * math.sin(th) * math.cos(ph), nose_c[1] + 3.2 * math.cos(th) + 1.0, nose_c[2] + 3.4 * math.sin(th) * math.sin(ph) - 1.0))
    parts.append(_Part("nose", hull([P2(p) for p in npts]), BLACK.tinted(BLUE, 0.2), order=60, k=0.8, cull=False, ow=0.8))

    # ---------------- evaluar visibilidad, orden de profundidad y dibujo
    items = []
    for part in parts:
        pts2, zs = [], []
        for p in part.pts:
            if len(p) == 3:
                (px, py), z = P(p)
                pts2.append((px, py))
                zs.append(z)
            else:
                pts2.append(p)
                zs.append(0.0)
        key = part.order + 0.01 * (sum(zs) / max(1, len(zs)))
        tone = part.tone_shift
        if len(part.pts[0]) == 3 and len(part.pts) >= 3:
            n = norm3(cross3(sub(part.pts[1], part.pts[0]), sub(part.pts[2], part.pts[0])))
            if part.solid_center is not None and part.cull:
                cen = tuple(sum(c) / len(part.pts) for c in zip(*part.pts))
                if dot3(n, sub(cen, part.solid_center)) < 0:
                    n = (-n[0], -n[1], -n[2])
                nv = rot(n, yaw, pitch)
                if nv[2] <= 0.02:
                    continue
            else:
                nv = rot(n, yaw, pitch)
                if nv[2] < 0:
                    nv = (-nv[0], -nv[1], -nv[2])
            d = dot3(nv, LIGHT)
            tone = (1 if d > 0.45 else (-1 if d < -0.05 else 0)) + part.tone_shift
            tone = max(-1, min(1, tone))
        items.append((key, part, pts2, tone))

    items.sort(key=lambda it: it[0])

    for key, part, pts2, tone in items:
        dec = (lambda sh, p=part: p.post(sh, None)) if part.post else None
        cv.shape(pts2, part.ramp, k=part.k * max(0.6, scale), tone=tone, ow=part.ow, decor=dec)

    info = {
        "nose": P2((0, 3, 41)),
        "eye": P2((7.5, -4, 11)),
        "crown": P2((0, -20, 0)),
        "center": (cx, cy),
        "jaw": P2((0, 8, 20)),
    }
    return info
