#!/usr/bin/env python3
"""
Готовит фактуру металла для модели флешки.

Силуэт корпуса рисуется вектором (`components/flash-drive-model.tsx`) —
модель поворотная, и собрать её обрезкой снимка нельзя. От снимка нужна
только шлифовка: `public/drive/plate.png` — прямоугольник пластины,
который в модели ложится на цвет умножением.

Что делает:
  1. обрезает по объекту, оставляя небольшое поле;
  2. сжимает чёрный колпачок по горизонтали до реальной доли (17 % длины
     пластины вместо 28 %, которые выдал генератор);
  3. кладёт два файла — с подвеской и без неё;
  4. печатает координаты пластины в процентах: их берёт компонент,
     чтобы положить цвет и гравировку ровно на металл.

Запуск: python3 scripts/prepare-drive.py
"""

import json
import pathlib

from PIL import Image

SRC = pathlib.Path("assets/drive-source.png")
OUT = pathlib.Path("public/drive")
MEASURES = pathlib.Path("lib/drive-measures.json")

PLATE_MM = 49.96
CAP_MM = 8.6  # с фотографии партии: колпачок — 17 % длины пластины
PAD = 8  # поле вокруг объекта, px


def object_box(im, alpha=60):
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > alpha:
                minx, maxx = min(minx, x), max(maxx, x)
                miny, maxy = min(miny, y), max(maxy, y)
    return minx, miny, maxx, maxy


def main():
    im = Image.open(SRC).convert("RGBA")
    px = im.load()
    minx, miny, maxx, maxy = object_box(im)

    # высота корпуса — по столбцу внутри металла
    probe = minx + int((maxx - minx) * 0.25)
    col = [y for y in range(im.size[1]) if px[probe, y][3] > 60]
    top, bot = col[0], col[-1]

    # граница «колпачок / металл»: первый светлый пиксель по средней строке
    cy = (top + bot) // 2
    cap_end = next(
        x
        for x in range(minx, maxx)
        if px[x, cy][3] > 200 and px[x, cy][0] > 140
    )

    # правый край пластины: там, где столбец перестаёт быть полной высоты
    plate_end = next(
        x - 1
        for x in range(cap_end + 100, maxx)
        if sum(1 for y in range(top, bot + 1) if px[x, y][3] > 60)
        < (bot - top + 1) * 0.45
    )

    plate_px = plate_end - cap_end + 1
    scale = plate_px / PLATE_MM  # px в миллиметре
    cap_target = round(CAP_MM * scale)
    cap_px = cap_end - minx

    print(f"пластина {plate_px} px = {PLATE_MM} мм  →  {scale:.2f} px/мм")
    print(f"корпус {bot - top + 1} px = {(bot - top + 1) / scale:.1f} мм")
    print(f"колпачок {cap_px} px = {cap_px / scale:.1f} мм → сжимаем до {CAP_MM} мм")

    # сжимаем колпачок и сдвигаем всё остальное влево
    shift = cap_px - cap_target
    cap = im.crop((minx, 0, cap_end, im.size[1])).resize(
        (cap_target, im.size[1]), Image.LANCZOS
    )
    rest = im.crop((cap_end, 0, im.size[0], im.size[1]))

    fixed = Image.new("RGBA", im.size, (0, 0, 0, 0))
    fixed.paste(cap, (minx, 0))
    fixed.paste(rest, (cap_end - shift, 0))

    box = (minx - PAD, miny - PAD, maxx - shift + PAD, maxy + PAD)
    full = fixed.crop(box)

    OUT.mkdir(parents=True, exist_ok=True)
    full.save(OUT / "base.png")

    # версия без подвески: режем сразу за ушком
    solo = fixed.crop((minx - PAD, top - PAD, plate_end - shift + PAD, bot + PAD))
    solo.save(OUT / "base-solo.png")

    # координаты пластины в процентах от каждого файла
    def rect(img_box, x0, x1):
        bw = img_box[2] - img_box[0]
        bh = img_box[3] - img_box[1]
        return {
            "left": round((x0 - img_box[0]) / bw * 100, 3),
            "width": round((x1 - x0) / bw * 100, 3),
            "top": round((top - img_box[1]) / bh * 100, 3),
            "height": round((bot - top + 1) / bh * 100, 3),
        }

    solo_box = (minx - PAD, top - PAD, plate_end - shift + PAD, bot + PAD)
    data = {
        "full": {
            "aspect": round(full.size[0] / full.size[1], 4),
            "plate": rect(box, minx + cap_target, plate_end - shift),
        },
        "solo": {
            "aspect": round(solo.size[0] / solo.size[1], 4),
            "plate": rect(solo_box, minx + cap_target, plate_end - shift),
        },
        "pxPerMm": round(scale, 3),
    }
    MEASURES.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    # маски пластины: цвет корпуса кладётся строго по ним
    def save_mask(img, img_box, name):
        mw, mh = img.size
        mask = Image.new("RGBA", (mw, mh), (0, 0, 0, 0))
        ip, mp = img.load(), mask.load()
        for y in range(mh):
            for x in range(mw):
                gx = x + img_box[0]
                if minx + cap_target <= gx <= plate_end - shift and ip[x, y][3] > 120:
                    mp[x, y] = (255, 255, 255, ip[x, y][3])
        mask.save(OUT / name)

    save_mask(full, box, "plate-mask.png")
    save_mask(solo, solo_box, "plate-mask-solo.png")

    # средний цвет пластины — по нему считается компенсация тонировки
    fpx = fixed.load()
    vals = [
        fpx[x, y][:3]
        for x in range(minx + cap_target + 20, plate_end - shift - 20, 4)
        for y in range(top + 12, bot - 12, 4)
    ]
    avg = [round(sum(v[i] for v in vals) / len(vals)) for i in range(3)]
    print("средний цвет пластины:", avg)
    print("файлы:", OUT / "base.png", OUT / "base-solo.png")
    print(json.dumps(data, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
