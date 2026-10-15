# SPDX-License-Identifier: Apache-2.0
"""make.py — the picture fixtures for bin/test-cadcraft.mjs § Pictures (0.5 WL.13/14). Run: python3 make.py (Pillow).
Each picture is 40 × 30 pixels in four quadrants: top-left red, top-right green, bottom-left blue, bottom-right white;
the RGBA and palette ones have a fully transparent bottom-right instead of white."""
from PIL import Image

W, H = 40, 30
Q = {'tl': (220, 30, 30), 'tr': (30, 180, 60), 'bl': (40, 60, 220), 'br': (255, 255, 255)}

def quad(x, y):
    return Q[('t' if y < H // 2 else 'b') + ('l' if x < W // 2 else 'r')]

rgb = Image.new('RGB', (W, H))
for y in range(H):
    for x in range(W):
        rgb.putpixel((x, y), quad(x, y))
rgb.save('quad-rgb.png', optimize=True)          # Pillow picks the filters per row (adaptive)
rgb.save('quad.jpg', quality=95)
rgb.convert('L').save('quad-grey.png')
rgba = rgb.convert('RGBA')
for y in range(H // 2, H):
    for x in range(W // 2, W):
        rgba.putpixel((x, y), (255, 255, 255, 0))
rgba.save('quad-rgba.png')
pal = rgb.convert('P', palette=Image.ADAPTIVE, colors=4)
ix = pal.getpixel((W - 1, H - 1))
pal.save('quad-palette.png', transparency=ix)
