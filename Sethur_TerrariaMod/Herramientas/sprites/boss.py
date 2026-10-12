"""
boss.py - Sethur, el Faraon Olvidado: modelo de partes + renderizado de una pose a un fotograma.

Lienzo de celda: 192 x 224 px. El jefe mira a la DERECHA (en el juego se refleja para mirar a la izquierda).
Todo se dibuja en coordenadas de lienzo; el torso usa un marco local con origen en la cintura.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

from gfx import (BLACK, BLUE, CLOTH, GOLD, GOLD_OLD, EYE, SAND, Canvas, Ramp, Xf, ellipse_pts, mix, stroke_poly,
                 outline_pass, over, new_layer, dither_glow, dots, lerp, smooth, OUTLINE)
from head import draw_head

CELL_W, CELL_H = 224, 256
WAIST = (112.0, 154.0)           # cintura en reposo (px de la celda)


@dataclass
class Pose:
    bob: float = 0.0
    sway: float = 0.0
    lean: float = 0.0               # grados, + = hacia delante
    yaw: float = 0.62               # radianes
    pitch: float = 0.0
    roll: float = 0.0
    mouth: float = 0.0
    eye_glow: float = 0.7
    head_dx: float = 0.0
    head_dy: float = 0.0
    # brazo lejano (derecha de la imagen, sostiene el baston)
    far_hand: tuple = (60.0, -2.0)
    far_bend: int = 1
    far_state: str = "grip"
    far_rot: float = 0.0
    # brazo cercano (izquierda de la imagen, por delante del torso)
    near_hand: tuple = (-52.0, 22.0)
    near_bend: int = -1
    near_state: str = "open"
    near_rot: float = 0.0
    near_front: bool = True
    # baston
    staff: bool = True
    staff_a: float = 172.0          # angulo absoluto (180 = vertical hacia arriba)
    staff_glow: float = 0.6
    staff_hold: float = 0.0         # desplazamiento a lo largo del baston al agarrarlo
    staff_pos: tuple = None         # si no es None, posicion absoluta del agarre (px de la celda)
    # tela
    cloth_t: float = 0.0
    cloth_amp: float = 1.0
    cloth_drift: float = 0.0
    cloth_len: float = 0.86
    cloth_lift: float = 0.0
    cloak_flare: float = 0.0
    gem: float = 0.6
    theme: str = "gold"
    shake: tuple = (0.0, 0.0)
    extra_back: list = field(default_factory=list)    # callbacks (layer) dibujados detras
    extra_front: list = field(default_factory=list)   # callbacks (layer) dibujados delante
    crack: float = 0.0              # grietas doradas (muerte)
    body_rot: float = 0.0


# ----------------------------------------------------------------------------- utilidades
def adir(a):
    r = math.radians(a)
    return (math.sin(r), math.cos(r))


def ang_of(dx, dy):
    return math.degrees(math.atan2(dx, dy))


def ik(S, T, l1, l2, bend):
    dx, dy = T[0] - S[0], T[1] - S[1]
    d = math.hypot(dx, dy)
    d = max(abs(l1 - l2) + 0.5, min(l1 + l2 - 0.5, d))
    base = math.atan2(dy, dx)
    cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
    A = math.acos(max(-1.0, min(1.0, cosA)))
    a_up = base + A * bend
    E = (S[0] + math.cos(a_up) * l1, S[1] + math.sin(a_up) * l1)
    Tn = (S[0] + dx / max(1e-6, math.hypot(dx, dy)) * d, S[1] + dy / max(1e-6, math.hypot(dx, dy)) * d)
    a1 = ang_of(E[0] - S[0], E[1] - S[1])
    a2 = ang_of(Tn[0] - E[0], Tn[1] - E[1])
    return E, Tn, a1, a2


def wave(t, k, phase=0.0):
    return math.sin(t * k + phase)


# ----------------------------------------------------------------------------- partes
def draw_strand(cv, x0, y0, length, w0, t, amp, drift, ramp, phase, waves=1.0, tone=0, ow=1.0, teeth=True, k=0.8):
    """Tira de tela/arena: poligono con ondulacion y punta desgarrada."""
    n = 16
    left, right = [], []
    for i in range(n + 1):
        s = i / n
        dx = amp * math.sin(phase + 4.2 * s * waves - t) * (s ** 1.1) * (0.55 + 0.45 * s) + drift * (s ** 1.4)
        y = y0 + length * s
        x = x0 + dx
        w = w0 * (1.0 - 0.80 * s ** 1.15)
        # desgarro en la punta
        if teeth and s > 0.8:
            w *= 0.9 + 0.35 * math.sin(i * 2.3 + phase)
        left.append((x - w / 2, y))
        right.append((x + w / 2, y))
    # punta en pico irregular
    tip = (x0 + dx + 0.6 * math.sin(phase * 3.0), y0 + length * (1.0 + 0.05))
    poly = left + [tip] + right[::-1]
    return cv.shape(poly, ramp, k=k, tone=tone, ow=ow)


def draw_cloth(cv, T, p: Pose, back: bool):
    """Tela y arena que sustituyen las piernas + capa trasera. T = Xf del torso (cintura)."""
    t = p.cloth_t
    amp = 6.0 * p.cloth_amp
    L = p.cloth_len
    if back:
        # capas laterales (capa rasgada desde los hombros)
        for side in (-1, 1):
            for j in range(4):
                x0 = side * (30 + j * 7.5)
                y0 = -40 - p.cloak_flare * 6
                length = (62 + 14 * (3 - j)) * L * (1 + 0.15 * p.cloak_flare)
                pt0 = T.pt(x0, y0)
                ph = j * 1.3 + (0.9 if side > 0 else 0)
                drift_local = side * (6 + 7 * j + p.cloak_flare * 13) + p.cloth_drift * 0.6
                cv_ramp = CLOTH if (j % 2 == 0) else CLOTH.tinted(SAND, 0.45)
                draw_strand(cv, pt0[0], pt0[1], length, 15 - j * 1.4, t, amp * (0.9 + 0.2 * j), drift_local, cv_ramp, ph, waves=1.1,
                            tone=-1 if j > 1 else 0, k=0.9)
        # tiras oscuras traseras de la cola
        for j in range(5):
            x0 = (j - 2) * 13
            pt0 = T.pt(x0, 18)
            draw_strand(cv, pt0[0], pt0[1], (86 - abs(j - 2) * 8) * L, 13, t, amp * 1.1, p.cloth_drift * 0.9 + (j - 2) * 3, CLOTH.tinted(SAND, 0.6), j * 1.9 + 0.5,
                        waves=1.2, tone=-1)
    else:
        for j in range(7):
            x0 = (j - 3) * 9.0
            order = abs(j - 3)
            pt0 = T.pt(x0, 24 - order * 1.0)
            length = (72 - order * 7 + (3 if j % 2 else -3)) * L
            ramp = CLOTH if j % 2 == 0 else CLOTH.tinted(SAND, 0.4)
            draw_strand(cv, pt0[0], pt0[1], length, 11.5 - order * 0.5, t, amp * (0.7 + 0.12 * order), p.cloth_drift * (0.7 + 0.1 * order) + (j - 3) * 2.2,
                        ramp, j * 1.1, waves=1.3, tone=0 if j % 2 == 0 else -1)


def draw_kilt(cv, T, p):
    # shendyt: faldon negro con ribetes dorados
    pts = [(-19, -2), (19, -2), (26, 36), (0, 44), (-26, 36)]
    sh = cv.shape(T(pts), BLACK, k=1.2, decor=None)
    # pliegues dorados
    def decor(s):
        for i in range(-3, 4):
            x = i * 6.5
            a = T.pt(x * 0.75, 4)
            b = T.pt(x * 1.2, 40 - abs(i) * 1.2)
            s.clip_line(a, b, 0.9, GOLD_OLD.shadow)
        for i in range(-3, 4):
            x = i * 6.5 + 3.2
            s.clip_line(T.pt(x * 0.75, 4), T.pt(x * 1.2, 38), 0.6, BLACK.shadow)
    cv.shape(T(pts), BLACK, k=1.2, decor=decor)
    # ribete inferior dorado en V
    hem = [(-26, 36), (0, 44), (26, 36), (26, 31), (0, 39), (-26, 31)]
    cv.shape(T(hem), GOLD, k=0.7, ow=0.6)
    # triangulo central (delantal)
    ap = [(-7, 0), (7, 0), (4, 30), (0, 40), (-4, 30)]
    def decor2(s):
        s.clip_poly(T([(-2, 6), (2, 6), (1.2, 32), (-1.2, 32)]), BLUE.mid)
    cv.shape(T(ap), GOLD_OLD, k=0.8, decor=decor2)


def draw_belt(cv, T, p):
    belt = [(-20, -8), (20, -8), (19, 4), (-19, 4)]
    def decor(s):
        for i in range(-3, 4):
            s.clip_poly(T([(i * 5.4 - 1.2, -8), (i * 5.4 + 1.2, -8), (i * 5.4 + 1.2, 4), (i * 5.4 - 1.2, 4)]), GOLD.shadow)
    cv.shape(T(belt), GOLD, k=0.9, decor=decor)
    gem_c = (0, -2)
    gem = [(0, -9), (6, -2), (0, 5), (-6, -2)]
    cv.shape(T(gem), GOLD, k=0.6, ow=0.6)
    inner = [(0, -6.5), (3.8, -2), (0, 2.5), (-3.8, -2)]
    cv.shape(T(inner), BLUE, k=0.5, ow=0.0)


def draw_torso(cv, T, p, yawn):
    cx = 2.5 * yawn
    # abdomen: placas segmentadas
    for i in range(3):
        y = -10 - i * 8
        half = 14 + i * 1.8
        seg = [(-half, y), (half, y), (half + 1.5, y - 8), (-half - 1.5, y - 8)]
        def decor(s, i=i, y=y, half=half):
            s.clip_poly(T([(-half - 2, y - 1.4), (half + 2, y - 1.4), (half + 2, y), (-half - 2, y)]), GOLD_OLD.mid)
            s.clip_poly(T([(-half - 2, y - 8), (half + 2, y - 8), (half + 2, y - 7.2), (-half - 2, y - 7.2)]), GOLD_OLD.light)
        cv.shape(T(seg), BLACK, k=0.8, decor=decor)
    # peto
    chest = [(-18, -26), (-25, -34), (-32, -42), (-14, -50), (0, -47), (14, -50), (32, -42), (25, -34), (18, -26), (0, -22)]
    def decor_chest(s):
        # costillas doradas
        for sgn in (-1, 1):
            for j in range(3):
                y = -30 - j * 5
                s.clip_line(T.pt(sgn * 3, y + 2), T.pt(sgn * (14 + j * 1.5), y - 1.5), 1.1, GOLD_OLD.mid)
    cv.shape(T(chest), BLACK, k=1.5, decor=decor_chest)
    # gema central
    gx = cx
    gem_outer = [(gx, -30), (gx + 7.2, -20.5), (gx, -8.5), (gx - 7.2, -20.5)]
    cv.shape(T(gem_outer), GOLD, k=0.7, ow=0.7)
    gem_in = [(gx, -27.6), (gx + 4.9, -20.5), (gx, -11), (gx - 4.9, -20.5)]
    glow = p.gem
    ramp = BLUE if p.theme == "gold" else Ramp("#1a4a8a", "#2a7ad0", "#6cd0ff", "#c8f2ff", "#ffffff")
    def gem_decor(s):
        s.clip_poly(T([(gx, -27.6), (gx + 2.0, -22.5), (gx, -19.5), (gx - 3.0, -23)]), ramp.hi if glow > 0.55 else ramp.light)
        s.clip_poly(T([(gx, -20.5), (gx + 4.9, -20.5), (gx, -11)]), ramp.shadow)
    cv.shape(T(gem_in), ramp, k=0.7, ow=0.0, decor=gem_decor)


def ucurve(cx, half_w, y_sh, y_bot, n=19, p=1.9):
    pts = []
    for i in range(n):
        a = -1 + 2 * i / (n - 1)
        pts.append((cx + a * half_w, y_sh + (y_bot - y_sh) * (1 - abs(a) ** p)))
    return pts


def draw_collar(cv, T, p, yawn):
    """Gorguera usekh: bandas en U (oro / lapislazuli / oro) con cuentas."""
    cx = 2.0 * yawn
    C = [ucurve(cx, 35, -44, -29), ucurve(cx, 31, -47, -34), ucurve(cx, 27.5, -49, -38), ucurve(cx, 24.2, -50, -40.5)]
    ramps = [GOLD, BLUE, GOLD]
    for i in range(3):
        band = C[i] + C[i + 1][::-1]
        cv.shape(T(band), ramps[i], k=0.8, ow=0.7 if i == 0 else 0.4)
    # cuentas doradas sobre la banda azul
    mid = ucurve(cx, 29.3, -48, -36, n=15)
    for (x, y) in mid[1:-1]:
        pt = T.pt(x, y)
        cv.fill(ellipse_pts(pt[0], pt[1], 1.25, 1.25, 8), GOLD.hi)
    # puntas colgantes doradas (flecos) en la banda exterior
    for i in range(-4, 5):
        a = i / 4.5
        x = cx + a * 33
        y = -44 + (-29 + 44) * (1 - abs(a) ** 1.9)
        ptA = T.pt(x - 2.0, y - 1)
        ptB = T.pt(x + 2.0, y - 1)
        ptC = T.pt(x, y + 4.2)
        cv.shape([ptA, ptB, ptC], GOLD, k=0.4, ow=0.5)


def draw_pauldron(cv, T, side, p, scale=1.0):
    cx, cy = side * 33, -45
    ptc = T.pt(cx, cy)
    ang = T.a
    # base dorada + placa negra + gema
    gold = ellipse_pts(ptc[0], ptc[1], 16.5 * scale, 11.5 * scale, 28, math.radians(-ang + side * 20))
    cv.shape(gold, GOLD, k=1.0, ow=1.0)
    blk = ellipse_pts(ptc[0], ptc[1] + 0.5, 14 * scale, 9.5 * scale, 28, math.radians(-ang + side * 20))
    cv.shape(blk, BLACK, k=1.2, ow=0.6)
    # placas escalonadas
    for j, r in enumerate((10, 6)):
        e = ellipse_pts(ptc[0] + side * (j * 1.5), ptc[1] + 2 + j * 2.5, r * scale, (r - 3) * scale, 20, math.radians(-ang + side * 20))
        cv.shape(e, BLACK, k=0.8, ow=0.5)
    # cresta dorada exterior
    bx, by = T.pt(cx + side * 13, cy - 3)
    cv.shape([(bx - side * 3.0, by + 3), (bx + side * 3.4, by + 4), (bx + side * 6.5, by - 5)], GOLD, k=0.5, ow=0.6)
    gem = ellipse_pts(ptc[0] + side * 1, ptc[1] + 1, 3.2 * scale, 4.0 * scale, 12)
    cv.shape(gem, BLUE, k=0.5, ow=0.6)


def draw_hand(cv, W, a_fore, rot, state, side, gold_nails=True, scale=1.0):
    """Mano con garras. W = punto de la muneca (lienzo). state: open / claw / fist / grip / point."""
    xf = Xf(W[0], W[1], a_fore + rot)
    # palma
    palm = [(-5.5, -1), (5.5, -1), (6.5, 10), (-6.5, 10)]
    cv.shape(xf(palm), BLACK, k=0.8)
    spread, curl, nlen = {"open": (26, 12, 1.0), "claw": (34, 46, 1.15), "fist": (6, 82, 0.9),
                          "grip": (3, 70, 0.9), "point": (10, 30, 1.0), "spread": (40, 6, 1.0)}.get(state, (20, 20, 1.0))
    for i in range(4):
        base = (i - 1.5) * spread / 3.0
        bx = (i - 1.5) * 3.9
        pts = [(bx, 9.5)]
        a = base
        cx_, cy_ = bx, 9.5
        seglens = [6.4, 5.6, 4.6]
        for j, sl in enumerate(seglens):
            a += curl * (0.45 + 0.35 * j) * (1 if side > 0 else 1) * 0.5 * (1.0 if j else 0.7)
            if state == "point" and i == 1:
                a = base * 0.3
            cx_ += math.sin(math.radians(a)) * sl
            cy_ += math.cos(math.radians(a)) * sl
            pts.append((cx_, cy_))
        cv.shape(xf(stroke_poly(pts, 3.6, 2.2)), BLACK, k=0.45, ow=0.55)
        # garra dorada
        ex, ey = pts[-1]
        da = math.radians(a)
        claw = [(ex - 1.5 * math.cos(da), ey + 1.5 * math.sin(da)), (ex + 1.5 * math.cos(da), ey - 1.5 * math.sin(da)),
                (ex + math.sin(da) * 5.6 * nlen, ey + math.cos(da) * 5.6 * nlen)]
        cv.shape(xf(claw), GOLD, k=0.35, ow=0.5)
    # pulgar
    ta = -40 * side + 10
    tx0, ty0 = side * -5.5, 3.5
    tpts = [(tx0, ty0), (tx0 + math.sin(math.radians(ta)) * 5, ty0 + math.cos(math.radians(ta)) * 5), (tx0 + math.sin(math.radians(ta - 20)) * 9, ty0 + math.cos(math.radians(ta - 20)) * 9)]
    cv.shape(xf(stroke_poly(tpts, 3.6, 2.4)), BLACK, k=0.4, ow=0.55)


def draw_arm(cv, S, hand, bend, state, hand_rot, side, ramp_gold=GOLD):
    """Brazo de 2 huesos con IK. Devuelve la posicion de la muneca y los angulos."""
    L1, L2 = 33.0, 31.0
    E, Wr, a1, a2 = ik(S, hand, L1, L2, bend)
    # brazo superior (negro con banda dorada)
    up = Xf(S[0], S[1], a1)
    pts = [(-7.2, -3), (7.2, -3), (6.0, L1 + 2), (-6.0, L1 + 2)]
    def d_up(s):
        s.clip_poly(up([(-8, 21), (8, 21), (8, 25), (-8, 25)]), GOLD_OLD.mid)
        s.clip_poly(up([(-8, 21), (8, 21), (8, 22.2), (-8, 22.2)]), GOLD.hi)
    cv.shape(up(pts), BLACK, k=1.0, decor=d_up)
    # codo
    cv.shape(ellipse_pts(E[0], E[1], 6.4, 6.4, 14), BLACK, k=0.7, ow=0.7)
    cv.shape(ellipse_pts(E[0], E[1], 3.0, 3.0, 10), GOLD, k=0.4, ow=0.4)
    # antebrazo con brazal dorado
    fo = Xf(E[0], E[1], a2)
    fpts = [(-5.8, -2), (5.8, -2), (5.2, L2 + 1), (-5.2, L2 + 1)]
    def d_fo(s):
        s.clip_poly(fo([(-9, 10), (9, 10), (9, 30), (-9, 30)]), GOLD.mid)
        for yy, rr in ((13, BLUE), (19.5, BLUE), (26, BLUE)):
            s.clip_poly(fo([(-9, yy), (9, yy), (9, yy + 2.4), (-9, yy + 2.4)]), rr.mid)
        s.clip_poly(fo([(-9, 10), (9, 10), (9, 11.4), (-9, 11.4)]), GOLD.hi)
    brz = [(-7.2, 9), (7.2, 9), (6.8, 31), (-6.8, 31)]
    cv.shape(fo(fpts), BLACK, k=0.9)
    cv.shape(fo(brz), GOLD, k=0.8, decor=d_fo)
    draw_hand(cv, Wr, a2, hand_rot, state, side)
    return Wr, a2


def draw_staff(cv, grip, a, glow, theme, hold=0.0):
    """Baston solar. 'grip' = punto de agarre en el lienzo; a = angulo absoluto del eje (180 vertical).
    hold>0 = agarra el baston mas cerca de la corona (sube el agarre por el fuste)."""
    dx, dy = adir(a)
    xf = Xf(grip[0] - dx * hold, grip[1] - dy * hold, a)
    # eje local +y apunta hacia la punta (a=180 => hacia arriba)
    # fuste dorado
    shaft = [(-2.6, -34), (2.6, -34), (2.2, 62), (-2.2, 62)]
    def d_shaft(s):
        y = -34
        i = 0
        while y < 62:
            s.clip_poly(xf([(-4, y), (4, y), (4, y + 2.2), (-4, y + 2.2)]), GOLD_OLD.shadow)
            y += 7.5
        s.clip_poly(xf([(-4, 36), (4, 36), (4, 40), (-4, 40)]), BLUE.mid)
        s.clip_poly(xf([(-4, -34), (4, -34), (4, -28), (-4, -28)]), GOLD.hi)
    cv.shape(xf(shaft), GOLD, k=0.7, decor=d_shaft)
    # contrapeso inferior
    cv.shape(xf([(-3.4, -36), (3.4, -36), (0, -46)]), GOLD, k=0.5, ow=0.6)
    # anillos antes de la corona
    for yy in (54, 60):
        cv.shape(xf([(-4.6, yy), (4.6, yy), (4.6, yy + 2.6), (-4.6, yy + 2.6)]), GOLD, k=0.4, ow=0.5)
    # gema azul
    cv.shape(xf([(0, 65), (4.2, 71), (0, 78), (-4.2, 71)]), BLUE, k=0.5, ow=0.7)
    # corona: media luna
    c0 = xf.pt(0, 88)
    outer = []
    inner = []
    for i in range(0, 21):
        t = math.radians(-35 + i * (250 / 20.0))      # arco de 250 grados abierto hacia arriba
        outer.append(xf.pt(math.sin(t) * 17.5, 88 - math.cos(t) * 17.5 + 2))
    for i in range(20, -1, -1):
        t = math.radians(-35 + i * (250 / 20.0))
        inner.append(xf.pt(math.sin(t) * 12.5, 88 - math.cos(t) * 12.5 + 4.5))
    cv.shape(outer + inner, GOLD, k=0.8)
    # disco solar
    orb = xf.pt(0, 90)
    o_ramp = EYE if theme == "gold" else Ramp("#0a3a6a", "#2a8ad8", "#8fe0ff", "#d8f8ff", "#ffffff")
    cv.shape(ellipse_pts(orb[0], orb[1], 8.8, 8.8, 20), o_ramp, k=1.0, ow=0.8, bands=True, tone=0 if glow < 0.5 else 1)
    return orb


def torso_xf(p: Pose):
    wx = WAIST[0] + p.sway + p.shake[0]
    wy = WAIST[1] + p.bob + p.shake[1]
    return Xf(wx, wy, -(p.lean + p.body_rot))


def build_pose_figure(p: Pose):
    """Dibuja todas las capas segun la pose. Devuelve (canvas, anclajes)."""
    cv = Canvas(CELL_W, CELL_H)
    yawn = p.yaw / 0.62
    T = torso_xf(p)
    wx, wy = T.ox, T.oy
    anchors = {}

    for fn in p.extra_back:
        fn(cv)

    # --- capa trasera: capas laterales + tiras traseras
    draw_cloth(cv, T, p, back=True)

    # --- brazo lejano y baston (detras del torso)
    S_far = T.pt(33 * (0.92), -42)
    S_near = T.pt(-33 * (1.04), -42)
    far_t = T.pt(*p.far_hand)
    wr_far, a_far = None, None
    if p.staff:
        grip = T.pt(*p.staff_pos) if p.staff_pos is not None else far_t
        orb = draw_staff(cv, grip, p.staff_a, p.staff_glow, p.theme, p.staff_hold)
        anchors["orb"] = orb
        anchors["grip"] = grip
    wr_far, a_far = draw_arm(cv, S_far, far_t, p.far_bend, p.far_state, p.far_rot, 1)
    anchors["far_hand"] = wr_far

    # --- cola de tela delantera, falda, cinturon, torso
    draw_cloth(cv, T, p, back=False)
    draw_kilt(cv, T, p)
    draw_belt(cv, T, p)
    draw_torso(cv, T, p, yawn)
    draw_collar(cv, T, p, yawn)
    draw_pauldron(cv, T, 1, p, 0.9)

    # cuello
    neck = [(-10, -46), (10, -46), (8.5, -62), (-8.5, -62)]
    cv.shape(T(neck), BLACK, k=0.8)

    # --- cabeza
    hx, hy = T.pt(p.head_dx + 5.5 * yawn, -74 + p.head_dy)
    info = draw_head(cv, hx, hy, yaw=p.yaw, pitch=p.pitch, roll=p.roll + (-p.lean - p.body_rot) * -0.0, scale=1.0, mouth=p.mouth,
                     eye_glow=p.eye_glow, theme=p.theme)
    anchors["head"] = (hx, hy)
    anchors["nose"] = info["nose"]
    anchors["eye"] = info["eye"]

    # --- hombrera izquierda (cercana) y brazo cercano (delante)
    draw_pauldron(cv, T, -1, p, 1.0)
    near_t = T.pt(*p.near_hand)
    wr_near, a_near = draw_arm(cv, S_near, near_t, p.near_bend, p.near_state, p.near_rot, -1)
    anchors["near_hand"] = wr_near
    anchors["waist"] = (wx, wy)
    anchors["chest"] = T.pt(0, -34)

    for fn in p.extra_front:
        fn(cv)
    return cv, anchors


def render_frame(p: Pose, back=None, front=None, tint=None, dissolve=None, outline=True, crack=0.0):
    """Pose -> (RGBA 224x240, anclajes).
    back(layer, anchors, fig)  : FX detras de la figura (resplandores)
    front(layer, anchors, fig) : FX delante (particulas, destellos)
    tint=(color, amount)       : mezcla la figura hacia un color (destello de dano)
    dissolve=(amount, seed)    : desintegracion en particulas doradas (muerte)"""
    from gfx import tint as tint_fn
    cv, anchors = build_pose_figure(p)
    fig = cv.to_array()
    if outline:
        outline_pass(fig)
    if crack and crack > 0:
        from fx import crack_lines
        crack_lines(fig, crack, 5)
    if tint and tint[1] > 0:
        tint_fn(fig, tint[0], tint[1])
    layer_front = new_layer(CELL_W, CELL_H)
    if dissolve is not None and dissolve[0] > 0:
        from fx import dissolve_pixels
        fig, dust = dissolve_pixels(fig, dissolve[0], dissolve[1])
        over(layer_front, dust)
    out = new_layer(CELL_W, CELL_H)
    if back:
        back(out, anchors, fig)
    over(out, fig)
    if front:
        front(layer_front, anchors, fig)
    over(out, layer_front)
    return out, anchors
