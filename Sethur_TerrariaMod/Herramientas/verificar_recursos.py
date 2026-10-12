#!/usr/bin/env python3
"""
verificar_recursos.py - Comprueba, sin necesitar tModLoader, que cada clase de contenido del mod tiene:
  * su textura (por convencion: namespace + nombre de clase, o la ruta de la propiedad Texture sobrescrita),
  * las claves de localizacion en en-US y es-ES,
  * texturas multi-fotograma con altura divisible entre Main.projFrames,
  * texturas y hojas referenciadas por ruta en el codigo (ModContent.Request / CustomTexturePath / BossHead).
Uso: python3 verificar_recursos.py [carpeta_del_mod]
"""
import os
import re
import sys
from PIL import Image

root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "ForgottenPharaoh"))
MOD = "ForgottenPharaoh"
errors, ok = [], 0


def fail(msg):
    errors.append(msg)


def png(rel):
    return os.path.join(root, rel.replace("/", os.sep) + ".png")


# ---- leer localizacion (claves planas de la jerarquia hjson simple)
def hjson_keys(path):
    keys = set()
    stack = []
    for line in open(path, encoding="utf-8"):
        t = line.rstrip("\n")
        m = re.match(r"^\s*([A-Za-z0-9_]+):\s*\{\s*$", t)
        if m:
            stack.append(m.group(1))
            continue
        if re.match(r"^\s*\}\s*$", t):
            if stack:
                stack.pop()
            continue
        m = re.match(r"^\s*([A-Za-z0-9_]+):", t)
        if m:
            full = ".".join(stack + [m.group(1)])
            prefix = "Mods.%s." % MOD
            keys.add(full[len(prefix):] if full.startswith(prefix) else full)
    return keys


loc = {}
for lang in ("en-US", "es-ES"):
    p = os.path.join(root, "Localization", "%s_Mods.%s.hjson" % (lang, MOD))
    loc[lang] = hjson_keys(p) if os.path.exists(p) else set()
    if not loc[lang]:
        fail("Falta el archivo de localizacion %s" % lang)

# ---- recorrer clases
classes = []
for dp, _, fs in os.walk(root):
    for f in fs:
        if not f.endswith(".cs"):
            continue
        src = open(os.path.join(dp, f), encoding="utf-8").read()
        for ns in re.findall(r"namespace\s+([\w\.]+)", src)[:1]:
            for m in re.finditer(r"public\s+(?:sealed\s+|partial\s+)*class\s+(\w+)\s*:\s*([\w<>, ]+)", src):
                base = m.group(2)
                kind = next((k for k in ("ModNPC", "ModProjectile", "ModItem", "ModBuff") if re.search(r"\b%s\b" % k, base)), None)
                if kind:
                    tex_override = None
                    mo = re.search(r"override string Texture\s*=>\s*\"([^\"]+)\"", src)
                    if mo and kind == "ModProjectile":
                        tex_override = mo.group(1)
                    frames = re.search(r"Main\.projFrames\[Type\]\s*=\s*(\w+|\d+)", src)
                    consts = dict(re.findall(r"const\s+int\s+(\w+)\s*=\s*(\d+)", src))
                    nframes = None
                    if frames:
                        v = frames.group(1)
                        nframes = int(v) if v.isdigit() else int(consts.get(v, 0)) or None
                    classes.append((ns, m.group(1), kind, tex_override, nframes, f))

seen = set()
for ns, name, kind, tex_override, nframes, f in classes:
    if (ns, name) in seen:
        continue
    seen.add((ns, name))
    rel_ns = ns.split(".", 1)[1].replace(".", "/") if ns.startswith(MOD + ".") else ns.replace(".", "/")
    tex_rel = tex_override.split("/", 1)[1] if tex_override else rel_ns + "/" + name
    p = png(tex_rel)
    if not os.path.exists(p):
        fail("%s %s: falta la textura %s" % (kind, name, os.path.relpath(p, root)))
    else:
        ok += 1
        if kind == "ModProjectile" and nframes and not tex_override:
            h = Image.open(p).size[1]
            if h % nframes:
                fail("%s: alto %d no es divisible entre %d fotogramas" % (name, h, nframes))
    cat = {"ModNPC": "NPCs", "ModProjectile": "Projectiles", "ModItem": "Items", "ModBuff": "Buffs"}[kind]
    k = "%s.%s.DisplayName" % (cat, name)
    for lang in loc:
        if k not in loc[lang]:
            fail("Localizacion %s: falta Mods.%s.%s" % (lang, MOD, k))
        if kind == "ModItem" and "%s.%s.Tooltip" % (cat, name) not in loc[lang]:
            fail("Localizacion %s: falta Mods.%s.%s.%s.Tooltip" % (lang, MOD, cat, name))
        if kind == "ModBuff" and "%s.%s.Description" % (cat, name) not in loc[lang]:
            fail("Localizacion %s: falta Mods.%s.%s.%s.Description" % (lang, MOD, cat, name))

# equipo de cabeza, cabeza de jefe
for rel in ("Content/Items/SethurMask_Head", "Content/NPCs/Sethur/SethurBoss_Head_Boss", "Content/NPCs/Sethur/SethurBoss", "icon"):
    if not os.path.exists(png(rel)):
        fail("Falta %s.png" % rel)
    else:
        ok += 1
mh = Image.open(png("Content/Items/SethurMask_Head"))
if mh.size != (40, 1120):
    fail("SethurMask_Head.png debe medir 40x1120 (20 fotogramas de 40x56), mide %s" % (mh.size,))

# rutas pedidas por codigo
code = ""
for dp, _, fs in os.walk(root):
    for f in fs:
        if f.endswith(".cs"):
            code += open(os.path.join(dp, f), encoding="utf-8").read()
for path in set(re.findall(r"\"ForgottenPharaoh/([^\"]+)\"", code)):
    if path.endswith("/") or "Bestiary" in path or "Messages" in path:
        continue
    if not os.path.exists(png(path)):
        fail("El codigo pide la textura %s que no existe" % path)
    else:
        ok += 1
for name in re.findall(r"\"(Sethur\w+)\"", re.search(r"SheetNames =\s*\{(.*?)\};", code, re.S).group(1)):
    p = png("Content/NPCs/Sethur/Anim/" + name)
    if not os.path.exists(p):
        fail("Falta la hoja de animacion %s" % name)
    else:
        ok += 1
for name in ("SethurHalo", "SethurGlow", "SethurRing", "SethurBeam", "SethurFlare", "SethurShard"):
    if not os.path.exists(png("Assets/Textures/" + name)):
        fail("Falta Assets/Textures/%s.png" % name)

# claves de mensajes usadas en codigo
for key in set(re.findall(r"Mods\.ForgottenPharaoh\.Messages\.(\w+)\"\s*[,)]", code)):
    for lang in loc:
        if ("Messages." + key) not in loc[lang]:
            fail("Localizacion %s: falta Messages.%s" % (lang, key))
for lang in loc:
    for k in ("Messages.SethurPhase2", "Messages.SethurPhase3", "Messages.SethurPhase4", "Bestiary.SethurBoss"):
        if k not in loc[lang]:
            fail("Localizacion %s: falta %s" % (lang, k))

print("Clases de contenido revisadas: %d | texturas/recursos correctos: %d" % (len(seen), ok))
if errors:
    print("\nERRORES (%d):" % len(errors))
    for e in errors:
        print("  - " + e)
    sys.exit(1)
print("OK: todas las texturas, hojas y claves de localizacion existen.")
