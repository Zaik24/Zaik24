#!/usr/bin/env python3
"""
Genera imágenes PLACEHOLDER con paleta golden hour para public/assets/img/.
Reemplázalas por las fotos definitivas (ver public/assets/img/README.md) y
luego ejecuta `npm run images` para regenerar las versiones WebP.

Uso: python3 scripts/dev/make-placeholders.py public/assets
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# nombre: (ancho, alto, escena, semilla)
IMAGES = {
    "living-sunset.jpg": (1200, 1200, "interior", 1),
    "barrio-aereo.jpg": (1800, 820, "aereo", 2),
    "casa-piscina.jpg": (1400, 900, "piscina", 3),
    "cocina.jpg": (1100, 900, "cocina", 4),
    "agente.jpg": (1200, 1500, "agente", 5),
    "comprar.jpg": (1400, 1050, "interior", 6),
    "vender.jpg": (1400, 1050, "casa", 7),
    "alquilar.jpg": (1400, 1050, "torre", 8),
    "hipoteca.jpg": (1400, 1050, "escritorio", 9),
    "administracion.jpg": (1400, 1050, "torre", 10),
    "construccion.jpg": (1400, 1050, "obra", 11),
}


def grad(h, w, stops):
    y = np.linspace(0, 1, h)[:, None]
    out = np.zeros((h, w, 3), np.float32)
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        t = np.clip((y - p0) / (p1 - p0), 0, 1)[..., None]
        m = ((y >= p0) & (y <= p1))[..., None]
        out = np.where(m, np.array(c0) * (1 - t) + np.array(c1) * t, out)
    return out


def sun(img, cx, cy, r, strength=1.0):
    h, w, _ = img.shape
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    glow = np.exp(-(d / (r * 6)) ** 2)[..., None] * 0.55 * strength
    core = np.clip(1 - (d - r) / 3, 0, 1)[..., None] * strength
    img = img * (1 - glow) + np.array([255, 214, 150]) * glow
    return img * (1 - core) + np.array([255, 246, 220]) * core


def scene(w, h, kind, seed):
    r = np.random.default_rng(seed)
    sky = [(0, (92, 120, 170)), (0.45, (238, 170, 120)), (0.62, (252, 206, 150)), (1, (236, 186, 140))]
    img = grad(h, w, sky)
    hz = int(h * 0.58)
    img = sun(img, w * (0.55 + 0.3 * r.random()), hz - h * 0.04, max(w, h) * 0.025)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im, "RGBA")
    # colinas al horizonte
    pts = [(0, hz)] + [(x, hz - 18 - 22 * np.sin(x / w * 7 + seed)) for x in range(0, w + 40, 40)] + [(w, h), (0, h)]
    d.polygon(pts, fill=(150, 108, 110, 150))

    if kind in ("interior", "cocina"):
        floor = Image.fromarray(grad(h - hz, w, [(0, (214, 170, 120)), (1, (176, 128, 84))]).astype(np.uint8))
        im.paste(floor, (0, hz))
        d = ImageDraw.Draw(im, "RGBA")
        for k in range(1, 4):  # perfiles del ventanal
            x = int(w * k / 4)
            d.rectangle((x - 5, 0, x + 5, hz), fill=(40, 34, 30, 255))
        d.rectangle((0, hz - 6, w, hz + 4), fill=(60, 48, 40, 255))
        d.rectangle((0, 0, w, int(h * 0.06)), fill=(236, 226, 214, 255))
        if kind == "interior":
            d.rounded_rectangle((w * 0.1, hz + h * 0.12, w * 0.62, hz + h * 0.27), 26, fill=(242, 232, 216, 255))
            d.rounded_rectangle((w * 0.1, hz + h * 0.06, w * 0.22, hz + h * 0.27), 22, fill=(232, 220, 202, 255))
            d.ellipse((w * 0.66, hz + h * 0.2, w * 0.86, hz + h * 0.26), fill=(150, 108, 72, 255))
        else:
            d.rectangle((w * 0.12, hz + h * 0.05, w * 0.8, hz + h * 0.32), fill=(226, 206, 180, 255))
            d.rectangle((w * 0.12, hz + h * 0.05, w * 0.8, hz + h * 0.08), fill=(246, 234, 216, 255))
            for k in range(3):
                x = w * (0.3 + k * 0.18)
                d.line((x, 0, x, h * 0.2), fill=(80, 64, 50, 255), width=3)
                d.pieslice((x - 40, h * 0.18, x + 40, h * 0.26), 180, 360, fill=(220, 196, 160, 255))
        # luz rasante
        light = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(light).polygon([(w * 0.3, hz), (w * 0.62, hz), (w * 0.95, h), (w * 0.45, h)], fill=(255, 220, 160, 70))
        im = Image.alpha_composite(im.convert("RGBA"), light.filter(ImageFilter.GaussianBlur(30))).convert("RGB")
    elif kind == "aereo":
        d.rectangle((0, hz, w, h), fill=(70, 90, 60, 255))
        for k in range(46):
            x, y = r.random() * w, hz + r.random() * (h - hz)
            bw, bh = 80 + r.random() * 160, 50 + r.random() * 80
            d.rectangle((x, y, x + bw, y + bh), fill=(150 + int(r.random() * 40), 80, 64, 255))
            d.rectangle((x, y, x + bw, y + 10), fill=(60, 70, 96, 255))
            for j in range(int(bw // 26)):
                d.rectangle((x + 8 + j * 26, y + 22, x + 18 + j * 26, y + 36), fill=(255, 200, 120, 255))
        for k in range(40):
            x, y = r.random() * w, hz + r.random() * (h - hz)
            s = 20 + r.random() * 40
            d.ellipse((x - s, y - s, x + s, y + s), fill=(80 + int(r.random() * 60), 120, 60, 230))
    elif kind in ("piscina", "casa"):
        d.rectangle((0, hz, w, h), fill=(96, 110, 70, 255))
        x0, x1, y0 = w * 0.32, w * 0.86, hz - h * 0.22
        d.rectangle((x0, y0, x1, y0 + 14), fill=(40, 36, 34, 255))
        d.rectangle((x0 + 10, y0 + 14, x1 - 10, hz + 20), fill=(60, 50, 44, 255))
        for k in range(5):
            xx = x0 + 30 + k * (x1 - x0 - 60) / 5
            d.rectangle((xx, y0 + 34, xx + (x1 - x0) / 6, hz + 10), fill=(255, 196, 120, 255))
        if kind == "casa":
            d.polygon([(x0 - 20, y0 + 2), ((x0 + x1) / 2, y0 - h * 0.14), (x1 + 20, y0 + 2)], fill=(70, 60, 56, 255))
            d.rectangle((0, hz + h * 0.12, w, h), fill=(84, 130, 60, 255))
        else:
            pool = grad(h - hz - int(h * 0.1), w, [(0, (250, 170, 110)), (1, (60, 90, 120))]).astype(np.uint8)
            im.paste(Image.fromarray(pool), (0, hz + int(h * 0.1)))
            d = ImageDraw.Draw(im, "RGBA")
            d.rectangle((0, hz + h * 0.08, w, hz + h * 0.1), fill=(200, 190, 180, 255))
    elif kind == "torre":
        d.rectangle((0, hz, w, h), fill=(70, 80, 70, 255))
        bx0, bx1 = w * 0.38, w * 0.86
        d.rectangle((bx0, h * 0.12, bx1, h), fill=(58, 60, 70, 255))
        for fy in range(int(h * 0.15), h, 70):
            d.rectangle((bx0 - 10, fy + 48, bx1 + 10, fy + 54), fill=(200, 196, 190, 255))
            for fx in range(int(bx0 + 14), int(bx1 - 40), 60):
                c = (255, 196, 120, 255) if r.random() > 0.35 else (90, 100, 130, 255)
                d.rectangle((fx, fy, fx + 46, fy + 44), fill=c)
        for k in range(8):
            x = w * 0.05 + k * 60
            hgt = h * (0.2 + 0.25 * r.random())
            d.rectangle((x, hz - hgt, x + 40, hz), fill=(90, 90, 120, 200))
    elif kind == "escritorio":
        d.rectangle((0, int(h * 0.62), w, h), fill=(112, 70, 44, 255))
        d.polygon([(w * 0.1, h * 0.86), (w * 0.5, h * 0.86), (w * 0.44, h * 0.66), (w * 0.16, h * 0.66)], fill=(30, 30, 34, 255))
        d.rectangle((w * 0.16, h * 0.38, w * 0.44, h * 0.66), fill=(24, 24, 28, 255))
        d.rectangle((w * 0.52, h * 0.5, w * 0.68, h * 0.64), fill=(240, 236, 228, 255))
        d.polygon([(w * 0.5, h * 0.5), (w * 0.6, h * 0.42), (w * 0.7, h * 0.5)], fill=(90, 74, 66, 255))
        d.rounded_rectangle((w * 0.78, h * 0.5, w * 0.86, h * 0.64), 10, fill=(236, 228, 216, 255))
    elif kind == "obra":
        d.rectangle((0, hz, w, h), fill=(130, 100, 80, 255))
        bx0, bx1 = w * 0.36, w * 0.92
        for fy in range(int(h * 0.32), int(hz + h * 0.2), 64):
            d.rectangle((bx0, fy, bx1, fy + 10), fill=(70, 66, 64, 255))
        for fx in range(int(bx0), int(bx1), 90):
            d.rectangle((fx, h * 0.32, fx + 10, hz + h * 0.2), fill=(70, 66, 64, 255))
        cx = w * 0.42
        d.rectangle((cx, h * 0.1, cx + 16, hz), fill=(200, 120, 40, 255))
        d.rectangle((w * 0.12, h * 0.1, w * 0.9, h * 0.1 + 12), fill=(200, 120, 40, 255))
        d.line((w * 0.8, h * 0.11, w * 0.8, h * 0.34), fill=(40, 40, 40, 255), width=3)
    elif kind == "agente":
        im = Image.fromarray(grad(h, w, [(0, (232, 222, 206)), (1, (198, 178, 152))]).astype(np.uint8))
        d = ImageDraw.Draw(im, "RGBA")
        d.rectangle((w * 0.62, 0, w, h * 0.55), fill=(244, 230, 206, 255))
        for k in range(1, 3):
            d.rectangle((w * 0.62 + k * w * 0.12, 0, w * 0.62 + k * w * 0.12 + 6, h * 0.55), fill=(120, 100, 84, 255))
        d.rectangle((0, h * 0.18, w * 0.18, h * 0.2), fill=(130, 96, 70, 255))
        d.rectangle((0, h * 0.36, w * 0.18, h * 0.38), fill=(130, 96, 70, 255))
        cx = w * 0.48
        d.ellipse((cx - 180, h * 0.08, cx + 180, h * 0.48), fill=(92, 62, 44, 255))  # cabello
        d.ellipse((cx - 110, h * 0.13, cx + 110, h * 0.36), fill=(226, 184, 154, 255))  # rostro
        d.rounded_rectangle((cx - 300, h * 0.42, cx + 300, h * 1.05), 140, fill=(242, 236, 224, 255))  # blazer
        d.rectangle((cx - 90, h * 0.44, cx + 90, h * 0.72), fill=(252, 252, 250, 255))
        d.rectangle((cx - 210, h * 0.74, cx + 210, h * 1.0), fill=(196, 168, 140, 255))
        d.rounded_rectangle((cx + 150, h * 0.5, cx + 230, h * 0.8), 12, fill=(30, 30, 32, 255))

    im = im.filter(ImageFilter.GaussianBlur(1.4))
    arr = np.asarray(im).astype(np.float32)
    # viñeta + grano
    yy, xx = np.mgrid[0:h, 0:w]
    v = 1 - 0.22 * (((xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2) * 2)
    arr = arr * v[..., None] + (r.random((h, w, 1)) - 0.5) * 8
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return im


def label(im, text):
    d = ImageDraw.Draw(im, "RGBA")
    f = ImageFont.truetype(FONT, max(14, im.width // 70))
    pad = 12
    tw = d.textlength(text, font=f)
    d.rounded_rectangle((pad, im.height - pad - f.size - 16, pad + tw + 24, im.height - pad), 999, fill=(17, 17, 17, 150))
    d.text((pad + 12, im.height - pad - f.size - 9), text, font=f, fill=(255, 255, 255, 230))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "public/assets"
    os.makedirs(os.path.join(out, "img"), exist_ok=True)
    for name, (w, h, kind, seed) in IMAGES.items():
        im = scene(w, h, kind, seed)
        label(im, f"PLACEHOLDER · {name}")
        im.save(os.path.join(out, "img", name), quality=82, optimize=True, progressive=True)
        print("  ", name)


if __name__ == "__main__":
    main()
