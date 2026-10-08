#!/usr/bin/env python3
"""
Готовит логотипы бренда из векторов заказчика (CorelDRAW 2022 → PDF).

Исходников два, у каждого своё место:

  assets/logo-source.pdf        («Лого Personal Flash СТРОКА.pdf»)
      «логотип в строчку» — для сайта:
        public/logo.svg             — цвет `currentColor`;
        public/logo-white.svg       — белый.

  assets/logo-flash-source.pdf  («Лого Personal Flash FINAL for FLASH.pdf»)
      «логотип для флешки» — две строки, вертикально, в натуральную
      величину: 4,97 × 8,99 мм. Для оборота флешки в конструкторе:
        public/logo-flash-white.svg — белый, как гравировка на металле.

Что делается по пути:
  1. PDF переводится в SVG (pdftocairo из poppler-utils);
  2. холст A4 обрезается по фактическим границам знака — они сняты
     замером в браузере (`getBBox` в координатах листа, пункты);
     у флешечного к ним добавлен полуштрих 0,11 с каждой стороны,
     иначе обводка контура срезается по краю;
  3. точность координат режется до сотых;
  4. цвет заменяется на нужный: `currentColor`, чтобы логотип красился
     строкой, в которой стоит, или белый для металла.

Матрица переворота по Y из исходника обязана сохраниться: в PDF начало
координат внизу, и без неё знак встаёт вверх ногами.

Запуск: python3 scripts/prepare-logo.py
Требует: sudo apt-get install poppler-utils
"""

import pathlib
import re
import subprocess
import tempfile

OUT = pathlib.Path("public")

ЛОГОТИПЫ = [
    {
        "src": pathlib.Path("assets/logo-source.pdf"),
        "viewbox": "12.25 100.07 566.24 67.96",
        "out": {"logo.svg": "currentColor", "logo-white.svg": "#fff"},
    },
    {
        "src": pathlib.Path("assets/logo-flash-source.pdf"),
        "viewbox": "330.71 461.33 14.31 25.70",
        "out": {"logo-flash-white.svg": "#fff"},
    },
]


def сжать(d: str) -> str:
    return re.sub(
        r"-?\d+\.\d+",
        lambda m: f"{float(m.group()):.2f}".rstrip("0").rstrip("."),
        d,
    )


def собрать(src: pathlib.Path, viewbox: str, out: dict[str, str]) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        svg = pathlib.Path(tmp) / "logo.svg"
        subprocess.run(["pdftocairo", "-svg", str(src), str(svg)], check=True)
        текст = svg.read_text()

    paths = re.findall(r'<path[^>]*?\sd="([^"]+)"', текст)
    matrix = re.search(r'transform="(matrix\([^"]+\))"', текст).group(1)
    тела = "".join(f'<path d="{сжать(p)}"/>' for p in paths)

    for имя, цвет in out.items():
        файл = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" '
            'role="img" aria-label="Personal Flash">'
            f'<g transform="{matrix}" fill="{цвет}" fill-rule="evenodd" '
            f'stroke="{цвет}" stroke-width="0.216" stroke-linejoin="miter" '
            'stroke-miterlimit="22.93">' + тела + "</g></svg>"
        )
        (OUT / имя).write_text(файл)
        print(f"{имя}: контуров {len(paths)} · {len(файл) // 1024} КБ")


def main() -> None:
    for л in ЛОГОТИПЫ:
        собрать(л["src"], л["viewbox"], л["out"])


if __name__ == "__main__":
    main()
