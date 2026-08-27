#!/usr/bin/env python3
"""
Готовит логотип бренда из вектора заказчика.

Исходник: assets/logo-source.pdf («Лого Personal Flash СТРОКА.pdf»,
CorelDRAW 2022). На выходе два файла:

  public/logo.svg        — цвет `currentColor`, для сайта;
  public/logo-white.svg  — белый, для гравировки на металле.

Что делается по пути:
  1. PDF переводится в SVG (pdftocairo из poppler-utils);
  2. холст A4 обрезается по фактическим границам знака — они сняты
     замером в браузере: 12,25 / 100,07 / 566,24 / 67,96;
  3. точность координат режется до сотых — знак рисуется в 68 единиц
     высотой, восьми знаков после запятой там не нужно;
  4. цвет заменяется на `currentColor`, чтобы логотип красился строкой,
     в которой стоит.

Матрица переворота по Y из исходника обязана сохраниться: в PDF начало
координат внизу, и без неё знак встаёт вверх ногами.

Запуск: python3 scripts/prepare-logo.py
Требует: sudo apt-get install poppler-utils
"""

import pathlib
import re
import subprocess
import tempfile

SRC = pathlib.Path("assets/logo-source.pdf")
OUT = pathlib.Path("public")
VIEWBOX = "12.25 100.07 566.24 67.96"


def сжать(d: str) -> str:
    return re.sub(
        r"-?\d+\.\d+",
        lambda m: f"{float(m.group()):.2f}".rstrip("0").rstrip("."),
        d,
    )


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        svg = pathlib.Path(tmp) / "logo.svg"
        subprocess.run(["pdftocairo", "-svg", str(SRC), str(svg)], check=True)
        src = svg.read_text()

    paths = re.findall(r'<path[^>]*?\sd="([^"]+)"', src)
    matrix = re.search(r'transform="(matrix\([^"]+\))"', src).group(1)
    тела = "".join(f'<path d="{сжать(p)}"/>' for p in paths)

    def собрать(цвет: str) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VIEWBOX}" '
            'role="img" aria-label="Personal Flash">'
            f'<g transform="{matrix}" fill="{цвет}" fill-rule="evenodd" '
            f'stroke="{цвет}" stroke-width="0.216" stroke-linejoin="miter" '
            'stroke-miterlimit="22.93">' + тела + "</g></svg>"
        )

    (OUT / "logo.svg").write_text(собрать("currentColor"))
    (OUT / "logo-white.svg").write_text(собрать("#fff"))
    print(f"контуров: {len(paths)} · {len(собрать('currentColor')) // 1024} КБ")


if __name__ == "__main__":
    main()
