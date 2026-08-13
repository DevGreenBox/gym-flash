#!/usr/bin/env python3
"""
Готовит фоны первого экрана из исходников в assets/.

Из каждого исходника выходит два кадра:

  hero-N.jpg       — широкий, для планшета и десктопа;
  hero-N-tall.jpg  — вертикальный, для телефона.

Вертикальный нужен потому, что все три сцены построены одинаково: интерес
стоит по краям кадра, а середина пустая. В портретном окне телефона широкий
кадр обрезался до этой самой середины — пустой стены, увеличенной в два
с половиной раза. Поэтому вырез берётся не по центру, а по той стороне,
где лежит предмет: книги, обруч с лентой, коробка с шёлком.

Вертикальный кадр увеличивается заранее и хорошим фильтром: телефон
с тройной плотностью просит 1170 пикселей ширины, а в исходнике на этот
вырез приходится 677. Увеличить придётся в любом случае — вопрос лишь
в том, сделает это Lanczos один раз при сборке или браузер каждый раз
на лету поверх сжатого JPEG.

Больше исходного взять неоткуда: оригиналы съёмки не сохранились,
в assets/ лежат кадры 1672×941.

Запуск: python3 scripts/prepare-hero.py
"""

import pathlib

from PIL import Image

OUT = pathlib.Path("public/photo")

WIDE = (2400, 1351)
# доля ширины к высоте у вертикального кадра: окно первого экрана
# на телефонах держится в пределах 0,70—0,80, берём середину
TALL_RATIO = 0.72
TALL_SCALE = 2  # запас над теми 1200 px, что запрашивает тройная плотность

# сторона выреза выбрана по предмету, а не по красоте: на первом экране
# фон обязан говорить о том же, о чём заголовок над ним
FRAMES = [
    ("hero-study.png", "hero-1", "left"),  # «Сохрани момент» — книги и карандаши
    ("hero-gym.png", "hero-2", "right"),  # «Музыка твоей победы» — обруч и лента
    ("hero-gift.png", "hero-3", "left"),  # «Подари впечатления» — коробка и шёлк
]


def tall(im: Image.Image, side: str) -> Image.Image:
    h = im.height
    w = round(h * TALL_RATIO)
    x = 0 if side == "left" else im.width - w
    cut = im.crop((x, 0, x + w, h))
    return cut.resize((w * TALL_SCALE, h * TALL_SCALE), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src, name, side in FRAMES:
        im = Image.open(pathlib.Path("assets") / src).convert("RGB")

        wide = im.resize(WIDE, Image.LANCZOS)
        wide.save(OUT / f"{name}.jpg", quality=86, optimize=True, progressive=True)

        t = tall(im, side)
        t.save(OUT / f"{name}-tall.jpg", quality=88, optimize=True, progressive=True)

        print(f"{name}: {wide.size[0]}×{wide.size[1]} и {t.size[0]}×{t.size[1]} ({side})")


if __name__ == "__main__":
    main()
