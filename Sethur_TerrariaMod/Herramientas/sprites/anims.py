"""
anims.py - Las 11 animaciones del jefe. Cada una es una funcion (i, n) -> kwargs de render_frame.

Convenciones: u = i/n en [0,1). Las animaciones en bucle usan solo senos con ciclos enteros para cerrar sin salto.
Coordenadas de manos: espacio local del torso (origen = cintura, +x = delante, y negativa = arriba).
"""
from __future__ import annotations

import math

from boss import Pose, torso_xf, WAIST, CELL_W, CELL_H, adir
from fx import (GOLD_FX, BLUE_FX, SAND_FX, motes, disc, ring, arc_trail, column, sparkle, radial_rays, crack_lines, put, put_sq)
from gfx import dither_glow, lerp, smooth

S = math.sin
C = math.cos
TAU = 2 * math.pi

REST_FAR = (60.0, -2.0)
REST_NEAR = (-52.0, 22.0)


def clamp01(x):
    return max(0.0, min(1.0, x))


def seg(u, a, b):
    """progreso 0..1 de u dentro de [a,b]"""
    return clamp01((u - a) / (b - a))


def ease_out(t):
    return 1 - (1 - t) ** 3


def ease_in(t):
    return t ** 3


def mixp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def fxset(**kw):
    return kw


# ----------------------------------------------------------------------------- FX comunes
def make_back(glow=0.6, theme="gold", extra=None):
    colors = GOLD_FX if theme == "gold" else BLUE_FX

    def back(layer, anchors, fig):
        if "orb" in anchors:
            ox, oy = anchors["orb"]
            r = 17 + 14 * glow
            dither_glow(layer, ox, oy, r, colors[2], strength=0.35 + 0.55 * glow, power=1.7, ramp=[colors[3], colors[2], colors[1]])
        if extra:
            extra(layer, anchors, fig)
    return back


def make_front(u, seed, motes_n=26, theme="gold", up_box=None, extra=None, orb_sparkle=True, glow=0.6):
    colors = GOLD_FX if theme == "gold" else BLUE_FX

    def front(layer, anchors, fig):
        # arena cayendo desde la tela inferior
        motes(layer, u, seed, motes_n, (56, 150, 170, 236), SAND_FX, up=False, cycles=1, sway=3.5, size2=0.2)
        # chispas ascendentes alrededor del baston
        if "orb" in anchors:
            ox, oy = anchors["orb"]
            motes(layer, u, seed + 7, 7, (ox - 18, oy - 30, ox + 18, oy + 22), colors, up=True, cycles=1, sway=4)
            if orb_sparkle and glow > 0.5:
                sparkle(layer, ox + 5, oy - 5, 2, colors[1], colors[0])
        if extra:
            extra(layer, anchors, fig)
    return front


def head_pos(p):
    T = torso_xf(p)
    return T.pt(5.5 * (p.yaw / 0.62) + p.head_dx, -74 + p.head_dy)


# ----------------------------------------------------------------------------- 1. IDLE (32)
def idle(i, n, theme="gold"):
    u = i / n
    ph = TAU * u
    p = Pose(
        bob=4.0 * S(ph), sway=1.2 * S(ph + 1.0), lean=1.4 * S(ph + 0.4),
        cloth_t=ph, cloth_amp=1.0, cloth_drift=2.5 * S(ph + 2.0),
        far_hand=(REST_FAR[0] + 1.5 * S(ph + 0.6), REST_FAR[1] + 3.0 * S(ph + 0.2)),
        near_hand=(REST_NEAR[0] + 2.0 * S(ph + 1.4), REST_NEAR[1] + 4.0 * S(ph + 2.0)),
        staff_a=172 + 2.2 * S(ph + 0.5), head_dy=0.8 * S(ph - 0.4), roll=1.0 * S(ph + 0.9),
        eye_glow=0.75 + 0.2 * S(2 * ph), gem=0.55 + 0.4 * S(ph), staff_glow=0.55 + 0.4 * S(2 * ph + 0.5), theme=theme)
    g = p.staff_glow
    return dict(p=p, back=make_back(g, theme), front=make_front(u, 11, 26, theme, glow=g))


# ----------------------------------------------------------------------------- 2. MOVIMIENTO (24)
def move(i, n, theme="gold"):
    u = i / n
    ph = TAU * u
    p = Pose(
        bob=3.5 * S(ph), lean=10 + 2 * S(2 * ph), sway=2 * S(ph + 0.5),
        cloth_t=2 * ph, cloth_amp=1.7, cloth_drift=-30 + 5 * S(ph), cloth_len=0.84, cloak_flare=0.55 + 0.1 * S(ph),
        far_hand=(68 + 2 * S(ph), -10 + 2 * S(2 * ph)), staff_a=181 + 3 * S(ph),
        near_hand=(-66, 4 + 3 * S(2 * ph)), near_state="open", head_dx=4, pitch=-0.05, roll=2 * S(ph),
        eye_glow=0.85, gem=0.7, staff_glow=0.7 + 0.2 * S(2 * ph), theme=theme)

    def extra(layer, anchors, fig):
        # estelas de arena hacia atras
        motes(layer, u, 31, 20, (10, 70, 120, 220), SAND_FX, up=False, cycles=2, sway=2, drift=-26)
    return dict(p=p, back=make_back(p.staff_glow, theme), front=make_front(u, 13, 14, theme, extra=extra, glow=p.staff_glow))


# ----------------------------------------------------------------------------- 3. GIRO (16)
def turn(i, n, theme="gold"):
    u = i / (n - 1)
    s = smooth(u)
    yaw = lerp(-0.62, 0.62, s)
    px_ = lerp(-60.0, 60.0, s)
    py_ = -2 - 22 * S(math.pi * s)
    staff_a = lerp(188.0, 172.0, s)
    # la mano izquierda sostiene el baston al principio, la derecha al final
    wl = 1 - smooth(seg(u, 0.25, 0.55))          # peso mano izquierda sobre el baston
    wr = smooth(seg(u, 0.45, 0.75))              # peso mano derecha sobre el baston
    sp = (px_, py_)
    near_t = mixp(REST_NEAR, (sp[0] - 8, sp[1] + 10), wl)
    far_t = mixp((-REST_NEAR[0], REST_NEAR[1]), (sp[0] + 8, sp[1] + 8), wr)
    p = Pose(
        yaw=yaw, bob=-6 * S(math.pi * s) + 1.5 * S(TAU * u), lean=3 * S(TAU * u), sway=0,
        cloth_t=TAU * u * 1.0, cloth_amp=1.8, cloth_drift=-18 * S(math.pi * (s * 2 - 1)) * 0 + 14 * C(math.pi * s), cloak_flare=0.8 * S(math.pi * s),
        far_hand=far_t, far_state="grip" if wr > 0.6 else "open",
        near_hand=near_t, near_state="grip" if wl > 0.6 else "open",
        staff_pos=sp, staff_a=staff_a, head_dx=0, roll=-4 * S(math.pi * s) * (1 if u < 0.5 else -1),
        eye_glow=0.9, gem=0.7, staff_glow=0.7 + 0.2 * S(math.pi * s), theme=theme)
    return dict(p=p, back=make_back(p.staff_glow, theme), front=make_front(u, 17, 22, theme, glow=p.staff_glow))


# ----------------------------------------------------------------------------- 4. ATAQUE CON GARRAS (24)
def claw(i, n, theme="gold"):
    u = i / n
    # angulo de la mano cercana alrededor del hombro (0=abajo, 90=delante, 180=arriba, 270=atras)
    wind = smooth(seg(u, 0.0, 0.40))
    strike = ease_out(seg(u, 0.46, 0.66))
    rec = smooth(seg(u, 0.66, 1.0))
    if u < 0.46:
        phi = lerp(344.0, 236.0, wind)
    elif u < 0.66:
        phi = lerp(236.0, 20.0 - 360.0 + 360.0 - 360.0, strike) if False else lerp(236.0, 20.0, strike)
    else:
        phi = lerp(20.0, -16.0, rec)
    R = 62.0 if u < 0.7 else lerp(62.0, 66.0, rec)
    S0 = (-34.0 * 1.04, -42.0)
    hand = (S0[0] + R * math.sin(math.radians(phi)), S0[1] + R * math.cos(math.radians(phi)))
    lean = lerp(0, -12, wind) if u < 0.46 else (lerp(-12, 14, strike) if u < 0.66 else lerp(14, 0, rec))
    sway = lerp(0, -6, wind) if u < 0.46 else (lerp(-6, 12, strike) if u < 0.66 else lerp(12, 0, rec))
    shake = (1.2 * S(i * 3.1) if 0.38 < u < 0.46 else 0.0, 0.0)
    mouth = lerp(0, 0.5, wind) if u < 0.46 else (0.9 if u < 0.7 else lerp(0.9, 0, rec))
    p = Pose(
        lean=lean, sway=sway, shake=shake, bob=-3 * S(math.pi * u),
        near_hand=hand, near_state="claw", near_rot=-20 + 40 * strike if 0.46 < u < 0.7 else 0,
        far_hand=(REST_FAR[0] - 8 * wind * (1 - rec), REST_FAR[1] + 10 * wind), staff_a=172 + 12 * wind * (1 - rec),
        cloth_t=TAU * u * 2, cloth_amp=1.5, cloth_drift=lerp(0, 18, wind) if u < 0.46 else lerp(18, -22, strike) if u < 0.66 else lerp(-22, 0, rec),
        pitch=lerp(0, 0.12, wind) if u < 0.46 else 0.0, eye_glow=1.0, mouth=mouth, head_dx=lerp(0, -3, wind) if u < 0.46 else 5 * strike,
        gem=0.8, staff_glow=0.5, theme=theme)

    def extra(layer, anchors, fig):
        if 0.46 <= u < 0.80:
            T = torso_xf(p)
            sh = T.pt(*S0)
            f = (u - 0.46) / 0.34
            cur = phi
            start = min(236.0, cur + 150.0) if u < 0.66 else 20.0 + 150 * (1 - rec) * 0
            # arco desde 'start' hasta la posicion actual
            a_cur = 90 - cur
            a_start = 90 - min(236.0, cur + 130.0)
            fade = 1.0 if u < 0.66 else max(0.0, 1 - (u - 0.66) / 0.14)
            if fade > 0:
                arc_trail(layer, sh[0], sh[1], R + 8, a_start, a_cur, 1.5, 9.0 * fade + 1, GOLD_FX)
                arc_trail(layer, sh[0], sh[1], R - 1, a_start + 20, a_cur, 1.0, 5.0 * fade + 1, GOLD_FX[:3] + GOLD_FX[:2])
    return dict(p=p, back=make_back(p.staff_glow, theme), front=make_front(u, 19, 14, theme, extra=extra, glow=0.5))


# ----------------------------------------------------------------------------- 5. LLUVIA DE ARENA (24)
def sandrain(i, n, theme="gold"):
    u = i / n
    raise_ = smooth(seg(u, 0.0, 0.25))
    charge = seg(u, 0.25, 0.55)
    slam = ease_out(seg(u, 0.55, 0.70))
    rec = smooth(seg(u, 0.70, 1.0))
    up_pos = (48.0, -50.0)
    down_pos = (32.0, 8.0)
    if u < 0.55:
        far = mixp(REST_FAR, up_pos, raise_)
        sa = lerp(172, 182, raise_)
    elif u < 0.70:
        far = mixp(up_pos, down_pos, slam)
        sa = lerp(182, 50, slam)
    else:
        far = mixp(down_pos, REST_FAR, rec)
        sa = lerp(50, 172, rec)
    hold = lerp(0, 24, raise_) if u < 0.70 else lerp(24, 0, rec)
    trem = 1.0 * S(i * 4.1) * (1 if 0.25 < u < 0.55 else 0)
    glow = 0.6 + 0.4 * (raise_ if u < 0.55 else 1 - rec) + 0.0
    near = mixp(REST_NEAR, (-58, -36), raise_) if u < 0.70 else mixp((-58, -36), REST_NEAR, rec)
    p = Pose(
        bob=-8 * (raise_ if u < 0.55 else (1 - slam if u < 0.7 else 0)) + 6 * slam * (1 if u < 0.7 else 1 - rec) + 1.5 * S(TAU * u * 2),
        lean=lerp(0, -5, raise_) if u < 0.55 else lerp(-5, 13, slam) if u < 0.70 else lerp(13, 0, rec),
        far_hand=(far[0] + trem, far[1]), staff_a=sa, staff_hold=hold, near_hand=near, near_state="spread",
        cloth_t=TAU * u * 2, cloth_amp=1.6, cloak_flare=1.0 * (raise_ if u < 0.7 else 1 - rec), cloth_lift=1.0,
        cloth_drift=lerp(0, 8, charge) if u < 0.7 else 0,
        pitch=0.16 * (raise_ if u < 0.55 else 1 - slam if u < 0.7 else 0),
        mouth=0.4 * charge if u < 0.7 else 0.0, eye_glow=1.0, gem=0.6 + 0.4 * charge, staff_glow=min(1.0, glow), theme=theme)

    def extra(layer, anchors, fig):
        ox, oy = anchors["orb"]
        if 0.2 <= u < 0.60:
            # anillos de energia que convergen en el orbe
            for k in range(3):
                f = ((u * 3.0 + k / 3.0) % 1.0)
                ring(layer, ox, oy, 20 * (1 - f) + 6, GOLD_FX[1:], thick=1, fade=0.4 + 0.5 * (1 - f))
        if 0.55 <= u < 0.82:
            f = (u - 0.55) / 0.27
            # destello y lluvia de granos desde el orbe
            disc(layer, ox, oy, 12 * (1 - f * 0.6), GOLD_FX[:4])
            for k in range(14):
                a = k * 0.9 + 0.3
                x = ox + (k % 5 - 2) * 8 + 10 * f
                y = oy + 6 + f * 70 * (0.6 + 0.4 * ((k * 7) % 5) / 4) + (k % 3) * 6
                put_sq(layer, x, y, 2 if k % 3 == 0 else 1, GOLD_FX[(k + int(f * 4)) % 4])
        # remolino de arena a su alrededor (suben en espiral)
        if 0.1 <= u < 0.72:
            motes(layer, u, 41, 22, (50, 70, 175, 220), SAND_FX, up=True, cycles=2, sway=7)
    return dict(p=p, back=make_back(p.staff_glow, theme), front=make_front(u, 23, 10, theme, extra=extra, glow=p.staff_glow))


# ----------------------------------------------------------------------------- 6. DISCOS SOLARES (24)
def solardisc(i, n, theme="gold"):
    u = i / n
    charge = smooth(seg(u, 0.0, 0.42))
    thrust = ease_out(seg(u, 0.42, 0.56))
    rec = smooth(seg(u, 0.56, 1.0))
    hold_p = (34.0, -34.0)
    fire = (38.0, -34.0)
    if u < 0.42:
        far = mixp(REST_FAR, hold_p, charge)
        sa = lerp(172, 154, charge)
    elif u < 0.56:
        far = mixp(hold_p, fire, thrust)
        sa = lerp(154, 146, thrust)
    else:
        far = mixp(fire, REST_FAR, rec)
        sa = lerp(146, 172, rec)
    hold = lerp(0, 18, charge) if u < 0.56 else lerp(18, 0, rec)
    near = mixp(REST_NEAR, (28, -18), charge) if u < 0.56 else mixp((28, -18), REST_NEAR, rec)
    p = Pose(
        lean=lerp(0, -4, charge) if u < 0.42 else lerp(-4, 11, thrust) if u < 0.56 else lerp(11, 0, rec),
        sway=lerp(0, -3, charge) if u < 0.42 else lerp(-3, 3, thrust) if u < 0.56 else lerp(3, 0, rec),
        bob=-4 * charge * (1 - rec) + 1.2 * S(TAU * u * 2),
        far_hand=far, staff_a=sa, staff_hold=hold, near_hand=near, near_state="spread", near_rot=0,
        cloth_t=TAU * u * 2, cloth_amp=1.4, cloth_drift=lerp(0, 10, charge) if u < 0.56 else lerp(10, -16, thrust) if u < 0.62 else lerp(-16, 0, rec),
        cloak_flare=0.5 * (charge if u < 0.56 else 1 - rec), mouth=0.3 * charge if u < 0.56 else 0, eye_glow=1.0, gem=0.6 + 0.4 * charge,
        staff_glow=0.6 + 0.4 * charge if u < 0.56 else 1 - 0.4 * rec, head_dx=3 * thrust, theme=theme)

    def extra(layer, anchors, fig):
        ox, oy = anchors["orb"]
        if u < 0.45:
            for k in range(3):
                f = ((u * 4.0 + k / 3.0) % 1.0)
                ring(layer, ox, oy, 24 * (1 - f) + 5, GOLD_FX[1:], thick=1, fade=0.35 + 0.5 * (1 - f))
            disc(layer, ox, oy, 5 + 7 * charge, GOLD_FX[:3])
        if 0.42 <= u < 0.70:
            f = (u - 0.42) / 0.28
            disc(layer, ox, oy, 11 * (1 - f) + 3, GOLD_FX[:4])
            radial_rays(layer, ox, oy, 10 * (1 - f) + 3, 18 * (1 - f * 0.5) + 5, 8, 0.4 + f, GOLD_FX[:3])
            sparkle(layer, ox, oy, int(6 * (1 - f)) + 2, GOLD_FX[1], GOLD_FX[0])
    return dict(p=p, back=make_back(p.staff_glow, theme), front=make_front(u, 29, 12, theme, extra=extra, glow=p.staff_glow))


# ----------------------------------------------------------------------------- 7. RAYO SOLAR (32)
def solarray(i, n, theme="gold"):
    u = i / n
    charge = smooth(seg(u, 0.0, 0.60))
    fire = seg(u, 0.66, 1.0)
    firing = u >= 0.66
    G = (0.0, -26.0)
    d = adir(126.0)
    far = G
    near = (G[0] - d[0] * 18, G[1] - d[1] * 18)
    shake_amp = 1.6 if firing and u < 0.96 else 0.0
    p = Pose(
        bob=-12 * charge * (1 if not firing else 1 - 0.3 * fire) + 1.2 * S(TAU * u * 3) * (0 if firing else 1),
        lean=lerp(0, -7, charge) if not firing else lerp(-7, -12, ease_out(min(1, fire * 3))) * (1 - 0.5 * smooth(seg(u, 0.9, 1.0))),
        shake=(shake_amp * (1 if i % 2 else -1), shake_amp * 0.5 * (1 if i % 3 else -1)),
        far_hand=far, near_hand=near, far_state="grip", near_state="grip", staff_pos=(G[0], G[1]), staff_a=126.0, staff_hold=10.0,
        cloth_t=TAU * u * 3, cloth_amp=1.8, cloak_flare=charge, cloth_lift=1.0, cloth_drift=lerp(0, 12, charge) if not firing else -16 * fire,
        pitch=0.16 * charge, mouth=0.9 * charge, eye_glow=1.0, gem=0.5 + 0.5 * charge, staff_glow=1.0, head_dx=3 * charge, theme=theme)

    def extra(layer, anchors, fig):
        ox, oy = anchors["orb"]
        colors = GOLD_FX if theme == "gold" else BLUE_FX
        if not firing:
            r = 5 + 12 * charge
            for k in range(4):
                f = ((u * 5.0 + k / 4.0) % 1.0)
                ring(layer, ox, oy, 30 * (1 - f) + r * 0.6, colors[1:], thick=1, fade=0.3 + 0.55 * (1 - f))
            disc(layer, ox, oy, r, colors[:4])
            if charge > 0.35:
                sparkle(layer, ox, oy, int(2 + 6 * charge), colors[1], colors[0])
        else:
            pulse = 1 + 0.12 * S(TAU * u * 6)
            r = 16 * pulse
            disc(layer, ox, oy, r, colors[:4])
            radial_rays(layer, ox, oy, r * 0.6, r * 1.4, 10, u * 6.0, colors[:3])
            sparkle(layer, ox, oy, 7, colors[1], colors[0])
            # fogonazo del rayo: estela inicial hacia delante
            for k in range(0, 36):
                x = ox + k
                if x >= CELL_W:
                    break
                wv = max(1, int(5 - k * 0.12))
                for yy in range(-wv, wv + 1):
                    c = colors[0] if abs(yy) <= wv // 2 else colors[1]
                    put(layer, x, oy + yy + (k * 0.25), c)

    return dict(p=p, back=make_back(1.0, theme), front=make_front(u, 37, 10, theme, extra=extra, glow=1.0))


# ----------------------------------------------------------------------------- 8. INVOCACION DE OBELISCOS (24)
def obelisk(i, n, theme="gold"):
    u = i / n
    up = smooth(seg(u, 0.0, 0.32))
    down = smooth(seg(u, 0.68, 1.0))
    k = up * (1 - down)
    far_up = (52.0, -54.0)
    near_up = (-56.0, -60.0)
    p = Pose(
        bob=-6 * k + 1.5 * S(TAU * u * 2), lean=-3 * k,
        far_hand=mixp(REST_FAR, far_up, k), staff_a=lerp(172, 181, k), staff_hold=26 * k, near_hand=mixp(REST_NEAR, near_up, k), near_state="spread", far_state="grip",
        cloth_t=TAU * u * 2, cloth_amp=1.6, cloak_flare=k, cloth_lift=1.0, cloth_drift=0, pitch=0.18 * k, mouth=0.35 * k, eye_glow=1.0,
        gem=0.6 + 0.4 * k, staff_glow=0.6 + 0.4 * k, theme=theme)

    def extra(layer, anchors, fig):
        ox, oy = anchors["orb"]
        if 0.25 < u < 0.78:
            f = seg(u, 0.25, 0.78)
            # destellos y pilares de luz desde las manos
            nh = anchors["near_hand"]
            for (hx, hy) in (nh,):
                column(layer, hx, hy - 38 * f, hy + 2, 2 + 1.5 * S(math.pi * f), GOLD_FX)
            sparkle(layer, ox - 7, oy - 10, 3, GOLD_FX[1], GOLD_FX[0])
            for kk in range(5):
                a = u * 5 + kk * 1.256
                put_sq(layer, ox + math.cos(a) * 22, oy + math.sin(a) * 9, 2, GOLD_FX[(kk) % 3])
        motes(layer, u, 53, 16, (44, 50, 180, 200), GOLD_FX, up=True, cycles=2, sway=6)
    return dict(p=p, back=make_back(p.staff_glow, theme), front=make_front(u, 43, 12, theme, extra=extra, glow=p.staff_glow))


# ----------------------------------------------------------------------------- 9. TRANSICION DE FASE (32)
def transition(i, n, theme="gold"):
    u = i / n
    curl = smooth(seg(u, 0.0, 0.28))
    burst = ease_out(seg(u, 0.30, 0.46))
    settle = smooth(seg(u, 0.55, 1.0))
    cross_far = (-12.0, -30.0)
    cross_near = (14.0, -28.0)
    wide_far = (76.0, -46.0)
    wide_near = (-76.0, -44.0)
    if u < 0.30:
        far = mixp(REST_FAR, cross_far, curl)
        near = mixp(REST_NEAR, cross_near, curl)
        lean = lerp(0, 14, curl)
        bob = 6 * curl + 1.5 * S(i * 3.7)
        sa = lerp(172, 100, curl)
        sp = None
    elif u < 0.55:
        far = mixp(cross_far, wide_far, burst)
        near = mixp(cross_near, wide_near, burst)
        lean = lerp(14, -12, burst)
        bob = lerp(6, -18, burst)
        sa = lerp(100, 176, burst)
    else:
        far = mixp(wide_far, REST_FAR, settle)
        near = mixp(wide_near, REST_NEAR, settle)
        lean = lerp(-12, 0, settle)
        bob = lerp(-18, 0, settle) + 3 * S(TAU * seg(u, 0.55, 1.0))
        sa = lerp(176, 172, settle)
    flash = max(0.0, 1 - abs(u - 0.40) / 0.07)
    p = Pose(
        bob=bob, lean=lean, far_hand=far, near_hand=near, staff_a=sa, near_state="spread", far_state="grip",
        cloth_t=TAU * u * 3, cloth_amp=1.4 + 1.2 * burst * (1 - settle), cloak_flare=1.0 if 0.28 < u < 0.7 else (curl if u < 0.28 else 1 - settle),
        cloth_lift=1.0, pitch=0.2 * burst * (1 - settle), mouth=0.9 * burst * (1 - settle), eye_glow=1.0, gem=1.0, staff_glow=1.0,
        shake=(1.5 * S(i * 5.3) * (1 if u < 0.30 else 0), 0.0), theme=theme)

    def extra(layer, anchors, fig):
        hx, hy = anchors["chest"]
        colors = GOLD_FX if theme == "gold" else BLUE_FX
        if u < 0.30:
            for k in range(3):
                f = ((u * 5.0 + k / 3.0) % 1.0)
                ring(layer, hx, hy, 60 * (1 - f) + 10, colors[1:], thick=1, fade=0.25 + 0.5 * (1 - f))
        if 0.28 <= u < 0.8:
            f = seg(u, 0.30, 0.8)
            for k in range(3):
                ff = clamp01(f * 1.3 - k * 0.14)
                if 0 < ff < 1:
                    ring(layer, hx, hy, 12 + 84 * ff, colors[:4], thick=3 if ff < 0.5 else 2, fade=1.0 - ff * 0.85, squash=0.9)
            radial_rays(layer, hx, hy, 14 + 36 * f, 24 + 66 * f, 12, 0.3 + f * 0.6, colors[:3])
            motes(layer, u, 61, 30, (30, 20, 195, 200), colors, up=True, cycles=2, sway=12)
        if flash > 0:
            dither_glow(layer, hx, hy, 30 + 38 * flash, colors[2], strength=1.0, power=0.9, ramp=[colors[3], colors[2], colors[1], colors[0]])
            disc(layer, hx, hy, 6 + 12 * flash, colors[:3])
    return dict(p=p, back=make_back(1.0, theme), front=make_front(u, 47, 12, theme, extra=extra, glow=1.0), tint=((255, 244, 214), 0.5 * flash))


# ----------------------------------------------------------------------------- 10. RECIBIR DANO (24)
def hurt(i, n, theme="gold"):
    u = i / n
    e = math.exp(-3.4 * u) * C(TAU * 1.2 * u)
    a = abs(e)
    p = Pose(
        lean=-17 * e, sway=-10 * e, bob=-3 * a + 2 * S(TAU * u), shake=(2.0 * S(i * 4.0) * math.exp(-5 * u), 0.0),
        far_hand=(REST_FAR[0] + 14 * e, REST_FAR[1] - 12 * a), near_hand=(REST_NEAR[0] - 14 * a, REST_NEAR[1] - 18 * a), near_state="spread",
        staff_a=172 + 14 * e, roll=-12 * e, pitch=-0.28 * e, mouth=0.9 * a, head_dx=-4 * e, eye_glow=1.0 if u < 0.3 else 0.7,
        cloth_t=TAU * u * 2, cloth_amp=1.0 + 1.6 * a, cloth_drift=20 * e, cloak_flare=0.8 * a, gem=1.0 if u < 0.3 else 0.6, staff_glow=0.9, theme=theme)
    white = u < 0.09
    col = (255, 246, 232) if white else (255, 84, 60)
    fl = (0.62 - u * 3.0) if white else max(0.0, 0.42 - (u - 0.09) * 1.9)

    def extra(layer, anchors, fig):
        hx, hy = anchors["chest"]
        if u < 0.35:
            f = u / 0.35
            for k in range(7):
                a_ = k * 0.9 + 0.4
                r = 16 + f * 40
                put_sq(layer, hx + math.cos(a_) * r, hy + math.sin(a_) * r * 0.9, 2 if k % 2 else 1, GOLD_FX[k % 3])
    return dict(p=p, back=make_back(0.7, theme), front=make_front(u, 59, 12, theme, extra=extra), tint=(col, max(0.0, fl)))


# ----------------------------------------------------------------------------- 11. MUERTE (24)
def death(i, n, theme="gold"):
    u = i / (n - 1)
    conv = seg(u, 0.0, 0.30)
    crack = smooth(seg(u, 0.10, 0.55))
    fall = smooth(seg(u, 0.20, 0.60))
    diss = smooth(seg(u, 0.38, 1.0))
    shk = 2.4 * (1 - seg(u, 0.5, 0.8)) * (1 if u < 0.8 else 0)
    p = Pose(
        lean=lerp(0, -14, conv) + 5 * S(i * 2.2) * (1 - fall) - 4 * fall, sway=-4 * fall,
        bob=10 * fall + 1.5 * S(i * 2.7), shake=(shk * (1 if i % 2 else -1), 0.0),
        far_hand=mixp(REST_FAR, (66, 38), fall), near_hand=mixp(REST_NEAR, (-60, 44), fall), far_state="open", near_state="spread",
        staff_a=lerp(172, 232, fall), staff_pos=(lerp(REST_FAR[0], 80, fall), lerp(REST_FAR[1], 60, fall)),
        pitch=lerp(0, 0.30, conv), roll=lerp(0, 6, conv), mouth=lerp(0.2, 1.0, conv), eye_glow=1.0 if u < 0.5 else 1 - seg(u, 0.5, 0.9),
        cloth_t=TAU * u * 3, cloth_amp=1.3, cloth_drift=lerp(0, 14, fall), cloak_flare=0.6 * (1 - fall), gem=1.0 - 0.8 * seg(u, 0.4, 0.9),
        staff_glow=1.0 - 0.7 * seg(u, 0.3, 0.9), theme=theme, crack=crack)

    def extra(layer, anchors, fig):
        hx, hy = anchors["chest"]
        if u < 0.5:
            f = u / 0.5
            for k in range(5):
                a_ = k * 1.256 + u * 3
                r = 14 + f * 38
                sparkle(layer, hx + math.cos(a_) * r, hy + math.sin(a_) * r * 0.8, 2, GOLD_FX[1], GOLD_FX[0])
    # el polvo extra se compone en dissolve; las grietas se aplican a la figura via 'crack' en render
    return dict(p=p, back=make_back(max(0.0, 1 - u * 1.3), theme), front=make_front(u, 67, int(14 * (1 - diss)), theme, extra=extra, orb_sparkle=False),
                dissolve=(diss, 77), crack=crack)


ANIMS = {
    # nombre: (funcion, frames, bucle)
    "Idle": (idle, 32, True),
    "Move": (move, 24, True),
    "Turn": (turn, 16, False),
    "Claw": (claw, 24, False),
    "SandRain": (sandrain, 24, False),
    "SolarDisc": (solardisc, 24, False),
    "SolarRay": (solarray, 32, False),
    "Obelisk": (obelisk, 24, False),
    "Transition": (transition, 32, False),
    "Hurt": (hurt, 24, False),
    "Death": (death, 24, False),
}
