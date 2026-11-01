"""Repaints the car pack's baked body textures into the app's colour palette.

Usage: python paint.py <pack dir> <out dir>   ->  <out>/<colour>/Body_N_baseColor.png
Paint is found by hue on coloured cars and by brightness on the black SUV, then re-tinted with the
original shading kept (value ratio), so panel lines and AO survive.
"""
import sys
import numpy as np
from pathlib import Path
from PIL import Image

# keep in sync with VEHICLE_COLORS in packages/core and the swatches in apps/mobile constants/vehicles.ts
COLORS = {
    'white': (236, 236, 232), 'silver': (138, 142, 150), 'graphite': (78, 82, 90), 'black': (22, 22, 26),
    'red': (170, 24, 30), 'blue': (28, 70, 160), 'green': (34, 92, 60), 'beige': (196, 176, 140),
}
# body style -> texture of its body in the pack (see PACK_BODIES in scene.js)
TEXTURES = {'sedan': 'Body_5', 'hatchback': 'Body_1', 'suv': 'Body_7', 'pickup': 'Body_4', 'van': 'Body_2', 'coupe': 'Body_6'}


def paint_mask(rgb):
    hsv = np.asarray(Image.fromarray((rgb * 255).astype(np.uint8)).convert('HSV')).astype(np.float32) / 255
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    colored = (s > 0.35) & (v > 0.12)
    if colored.mean() > 0.05:
        hue = np.median(h[colored])
        dh = np.minimum(abs(h - hue), 1 - abs(h - hue))
        mask = np.clip((s - 0.18) / 0.2, 0, 1) * np.clip((0.09 - dh) / 0.04, 0, 1)
    else:  # neutral (black) paint: mid-dark greys, not black trim or bright chrome/lights
        # the SUV's paint sits around v=0.11, its black trim around 0.04
        mask = np.clip((v - 0.045) / 0.02, 0, 1) * np.clip((0.5 - v) / 0.1, 0, 1) * (s < 0.2)
    return mask, v


def main(pack, out):
    for style, name in TEXTURES.items():
        src = np.asarray(Image.open(Path(pack) / 'textures' / f'{name}_baseColor.png').convert('RGB')).astype(np.float32) / 255
        mask, v = paint_mask(src)
        ref = np.median(v[mask > 0.5])
        shade = np.clip(v / ref, 0, 1.5)[..., None]
        for colour, rgb in COLORS.items():
            tinted = np.clip(np.array(rgb, np.float32)[None, None] / 255 * shade, 0, 1)
            res = src * (1 - mask[..., None]) + tinted * mask[..., None]
            d = Path(out) / colour
            d.mkdir(parents=True, exist_ok=True)
            Image.fromarray((res * 255).astype(np.uint8)).save(d / f'{name}_baseColor.png')
        print('painted', style)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
