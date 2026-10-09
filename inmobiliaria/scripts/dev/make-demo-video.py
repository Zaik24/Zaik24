#!/usr/bin/env python3
"""
Genera un video DEMO para el hero (cielo + nubes + edificio que emerge).
Solo sirve como reemplazo temporal hasta tener el video definitivo.

Uso:  python3 scripts/dev/make-demo-video.py <carpeta-temporal> public/assets
Requiere: numpy, Pillow, ffmpeg.
Salida:   public/assets/hero.mp4 y public/assets/hero-poster.jpg
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1920, 1080
FPS = 24
N = 120  # 5 s
rng = np.random.default_rng(7)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def fbm(h, w, base=(4, 7), octaves=5, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    gh, gw = base
    for _ in range(octaves):
        g = r.random((gh, gw)).astype(np.float32)
        img = Image.fromarray(g, mode="F").resize((w, h), Image.BICUBIC)
        out += np.asarray(img) * amp
        total += amp
        amp *= 0.5
        gh, gw = gh * 2, gw * 2
    out /= total
    out = (out - out.min()) / (out.max() - out.min())
    return out


# ---------------------------------------------------------------- cielo
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
ny, nx = yy / H, xx / W


def sky(t):
    top = np.array([118, 163, 212], np.float32)
    mid = np.array([186, 212, 236], np.float32)
    low = np.array([232, 226, 224], np.float32)
    a = smoothstep(0.0, 0.55, ny)[..., None]
    b = smoothstep(0.45, 1.0, ny)[..., None]
    c = top * (1 - a) + mid * a
    c = c * (1 - b) + low * b
    # resplandor cálido abajo a la izquierda (golden hour)
    d = np.sqrt(((nx - 0.12) * 1.25) ** 2 + (ny - 1.05) ** 2)
    glow = (1 - smoothstep(0.0, 0.85, d))[..., None] * (0.55 + 0.3 * t)
    warm = np.array([246, 172, 122], np.float32)
    return c * (1 - glow) + warm * glow


# ---------------------------------------------------------------- nubes
HH, HW = H // 2, W // 2
PAD = 260
noise_back = fbm(HH + PAD, HW + PAD * 2, base=(3, 6), seed=11)
noise_front = fbm(HH + PAD, HW + PAD * 2, base=(3, 5), seed=23)
detail = fbm(HH + PAD, HW + PAD * 2, base=(12, 22), octaves=3, seed=5)


def crop(n, ox, oy):
    ox, oy = int(round(ox)), int(round(oy))
    return n[oy:oy + HH, ox:ox + HW]


def up(a):
    return np.asarray(Image.fromarray(a.astype(np.float32), mode="F").resize((W, H), Image.BILINEAR))


hy, hx = np.mgrid[0:HH, 0:HW].astype(np.float32)
hny, hnx = hy / HH, hx / HW
edge = np.abs(hnx - 0.5) * 2  # 0 centro, 1 bordes


def clouds(t):
    # capa trasera: bordes y parte baja, despejada al centro-arriba (legibilidad del titular)
    nb = crop(noise_back, PAD + 70 * t, 40) * 0.8 + crop(detail, PAD + 110 * t, 40) * 0.2
    wb = np.clip(0.18 + 0.95 * edge ** 1.6 + 0.55 * smoothstep(0.35, 1.0, hny), 0, 1)
    wb *= 1 - 0.75 * (1 - smoothstep(0.0, 0.42, hny)) * (1 - edge)
    back = smoothstep(0.4, 0.7, nb * (0.55 + 0.6 * wb)) * wb
    # capa delantera: niebla sobre la base del edificio, se abre con el scroll
    nf_l = crop(noise_front, PAD - 120 * t, 10)
    nf_r = crop(noise_front, PAD + 120 * t, 10)
    nf = np.where(hnx < 0.5, nf_l, nf_r) * 0.82 + crop(detail, PAD - 60 * t, 120) * 0.18
    wf = smoothstep(0.55, 0.95, hny) * (0.65 + 0.35 * edge)
    thr = 0.3 + 0.3 * t
    front = smoothstep(thr, thr + 0.22, nf) * wf
    # sombreado: la parte alta de cada nube más luminosa
    shade_b = np.clip(nb * 1.25, 0, 1)
    shade_f = np.clip(nf * 1.2, 0, 1)
    return up(back), up(front), up(shade_b), up(shade_f)


def cloud_color(shade, t):
    lit = np.array([252, 251, 250], np.float32)
    shadow = np.array([196, 204, 222], np.float32)
    s = shade[..., None]
    col = shadow * (1 - s) + lit * s
    d = np.sqrt(((nx - 0.1) * 1.2) ** 2 + (ny - 1.0) ** 2)
    warm = (1 - smoothstep(0.0, 0.8, d))[..., None] * (0.55 + 0.25 * t)
    return col * (1 - warm) + np.array([250, 196, 160], np.float32) * warm


# ---------------------------------------------------------------- edificio
BH = 1500  # lienzo más alto que el cuadro para poder escalar


def brick(draw_img, box, base, seed):
    x0, y0, x1, y1 = box
    r = np.random.default_rng(seed)
    w, h = x1 - x0, y1 - y0
    tex = np.ones((h, w, 3), np.float32) * np.array(base, np.float32)
    rows = (np.arange(h) // 9) % 2
    lines = (np.arange(h) % 9 == 0)[:, None]
    tex *= (1 - 0.10 * lines[..., None])
    tex *= (0.94 + 0.12 * r.random((h, w, 1)))
    tex *= (0.97 + 0.03 * rows[:, None, None])
    draw_img.paste(Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)), (x0, y0))


def glass(img, box, t_lit, seed, frame=(36, 42, 52), cols=4, rows=2, mullion=10):
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=frame)
    pw = (x1 - x0 - mullion * (cols + 1)) / cols
    ph = (y1 - y0 - mullion * (rows + 1)) / rows
    r = np.random.default_rng(seed)
    for i in range(cols):
        for j in range(rows):
            px0 = int(x0 + mullion + i * (pw + mullion))
            py0 = int(y0 + mullion + j * (ph + mullion))
            px1, py1 = int(px0 + pw), int(py0 + ph)
            gh = py1 - py0
            g = np.linspace(0, 1, gh)[:, None]
            skyc = np.array([120, 150, 200]) * (1 - g) + np.array([238, 170, 130]) * g
            lit = np.array([255, 196, 120]) * (0.85 + 0.15 * r.random())
            c = skyc * (1 - t_lit) + lit * t_lit
            pane = np.repeat(c[:, None, :], px1 - px0, axis=1)
            # reflejo diagonal
            yy_, xx_ = np.mgrid[0:gh, 0:px1 - px0]
            refl = np.clip(1 - np.abs((xx_ - yy_ * 0.6) - (px1 - px0) * 0.35) / 30, 0, 1) * 0.18
            pane = pane * (1 - refl[..., None]) + 255 * refl[..., None]
            img.paste(Image.fromarray(np.clip(pane, 0, 255).astype(np.uint8)), (px0, py0))


def foliage(layer, cx, cy, rx, ry, n, seed):
    r = np.random.default_rng(seed)
    d = ImageDraw.Draw(layer)
    for k in range(n):
        a = r.random() * np.pi * 2
        rr = r.random() ** 0.7
        x = cx + np.cos(a) * rx * rr
        y = cy + np.sin(a) * ry * rr - abs(np.sin(a)) * ry * 0.2
        s = 3 + r.random() * 9
        lightness = r.random()
        sunlit = x < cx  # lado iluminado hacia el sol (izquierda)
        if sunlit and lightness > 0.45:
            col = (int(170 + 60 * lightness), int(150 + 40 * lightness), int(60 + 30 * lightness))
        else:
            col = (int(70 + 60 * lightness), int(85 + 50 * lightness), int(40 + 25 * lightness))
        d.ellipse([x - s, y - s, x + s, y + s], fill=col + (255,))


def building(t_lit):
    img = Image.new("RGBA", (W, BH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # ático
    brick(img, (640, 575, 1330, 830), (196, 160, 150), 1)
    d.rectangle((630, 566, 1340, 582), fill=(150, 112, 102))
    d.rectangle((770, 655, 1025, 672), fill=(160, 124, 112))
    # terraza interior cálida
    inner = np.zeros((128, 225, 3), np.float32)
    g = np.linspace(0, 1, 128)[:, None, None]
    inner[:] = (np.array([120, 74, 40]) * (1 - g) + np.array([205, 140, 80]) * g)
    inner *= 0.75 + 0.35 * t_lit
    img.paste(Image.fromarray(np.clip(inner, 0, 255).astype(np.uint8)), (790, 690))
    for k in range(5):
        x = 830 + k * 40
        r_ = 4 + 2 * t_lit
        d.ellipse([x - r_, 745 - r_, x + r_, 745 + r_], fill=(255, 226, 170))
    # ventanal derecho
    d.rectangle((1050, 640, 1330, 650), fill=(150, 112, 102))
    glass(img, (1070, 652, 1322, 840), t_lit * 0.8, 3, cols=4, rows=2)
    # planta inferior
    d.rectangle((345, 832, 1560, 860), fill=(156, 118, 106))
    d.rectangle((360, 860, 1545, 878), fill=(178, 140, 128))
    brick(img, (365, 878, 1540, BH), (200, 166, 156), 2)
    for k in range(9):
        x0 = 380 + k * 128
        glass(img, (x0, 905, x0 + 112, 1180), t_lit * (0.5 + 0.5 * ((k * 7) % 3 == 0)), 10 + k, cols=1, rows=2, mullion=8)
    # vegetación de la terraza
    leaves = Image.new("RGBA", (W, BH), (0, 0, 0, 0))
    foliage(leaves, 560, 745, 190, 70, 2600, 4)
    foliage(leaves, 720, 760, 90, 40, 700, 5)
    foliage(leaves, 1420, 760, 85, 60, 1100, 6)
    foliage(leaves, 1500, 790, 40, 25, 300, 8)
    leaves = leaves.filter(ImageFilter.GaussianBlur(1.2))
    img.alpha_composite(leaves)
    # barandal de vidrio
    rail = Image.new("RGBA", (W, BH), (0, 0, 0, 0))
    ImageDraw.Draw(rail).rectangle((395, 790, 1530, 832), fill=(170, 200, 230, 120))
    ImageDraw.Draw(rail).rectangle((395, 788, 1530, 791), fill=(225, 238, 248, 200))
    img.alpha_composite(rail)
    return np.asarray(img).astype(np.float32)


print("Dibujando edificio…", flush=True)
B_DAY = building(0.0)
B_DUSK = building(1.0)
grain = (rng.random((H, W, 1)).astype(np.float32) - 0.5) * 6


def frame(i):
    t = i / (N - 1)
    e = t * t * (3 - 2 * t)
    base = sky(e)
    back, front, sb, sf = clouds(e)
    img = base * (1 - back[..., None]) + cloud_color(sb, e) * back[..., None]
    # edificio: zoom suave anclado en su remate superior
    lit = smoothstep(0.35, 1.0, e)
    b = B_DAY * (1 - lit) + B_DUSK * lit
    s = 1.0 + 0.2 * e
    ax, ay = W / 2, 572
    ty = 18 * (1 - e)  # sube unos píxeles
    pil = Image.fromarray(np.clip(b, 0, 255).astype(np.uint8), "RGBA")
    pil = pil.transform((W, H), Image.AFFINE, (1 / s, 0, ax - ax / s, 0, 1 / s, ay - (ay + ty) / s), resample=Image.BILINEAR)
    bl = np.asarray(pil).astype(np.float32)
    a = bl[..., 3:4] / 255
    img = img * (1 - a) + bl[..., :3] * a
    # neblina atmosférica en la base
    haze = (smoothstep(0.7, 1.0, ny) * 0.25 * (1 - 0.5 * e))[..., None]
    img = img * (1 - haze) + np.array([240, 228, 222]) * haze
    img = img * (1 - front[..., None]) + cloud_color(sf, e) * front[..., None]
    img += grain
    return np.clip(img, 0, 255).astype(np.uint8)


def main():
    tmp, out = sys.argv[1], sys.argv[2]
    os.makedirs(tmp, exist_ok=True)
    os.makedirs(out, exist_ok=True)
    for i in range(N):
        Image.fromarray(frame(i)).save(os.path.join(tmp, f"f_{i:04d}.png"), compress_level=1)
        if i % 10 == 0:
            print(f"  fotograma {i}/{N}", flush=True)
    Image.open(os.path.join(tmp, "f_0000.png")).convert("RGB").save(
        os.path.join(out, "hero-poster.jpg"), quality=78, optimize=True, progressive=True)
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(tmp, "f_%04d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "slow", "-movflags", "+faststart",
        os.path.join(out, "hero.mp4")], check=True)
    print("Listo:", os.path.join(out, "hero.mp4"))


if __name__ == "__main__":
    main()
