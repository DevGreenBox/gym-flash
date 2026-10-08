#!/usr/bin/env python3
"""
Вырезает пиктограммы предметов и логотипы оборота из файла заказчика.

Исходник: assets/signs-source.pdf («пиктограммы и обратная сторона.pdf»,
CorelDRAW 2022).

Пиктограммы. На листе каждая стоит в своей рамке 11,5 × 15 мм —
«расположение в границах», то есть ровно так, как знак ложится в Зону 2:

  public/signs/<id>.svg — белый вектор: маска для окна выбора;
  public/signs/<id>.png — растр для металла, без тени — правка
                          заказчика от 08.10;
  lib/signs.json        — где лежит рисунок относительно рамки Зоны 2.

Логотипы оборота. Под рамкой 28 × 15 мм — образцы «Москва», KINDER STUDY,
«Трудовые резервы», «СК DiaMond» («расположение по центру данной области»).
Нарисованы в натуральную величину, каждый вписан в 28 × 15 мм:

  public/logos/<id>.svg — белый вектор: маска для окна выбора;
  public/logos/<id>.png — растр для металла;
  lib/logos.json        — размер рисунка в миллиметрах.

Растр для металла — не прихоть. Контуры у заказчика обведены подробно
(у «Скакалки» 88 КБ одних координат), и галерея с шестнадцатью флешками
рисовала их втрое дольше, чем всю остальную страницу. Готовый PNG
браузер просто кладёт на место.

Что делается по пути:
  1. PDF переводится в SVG (pdftocairo из poppler-utils);
  2. из листа берутся элементы, чья опорная точка лежит в рамке
     или границах рисунка; рамка Зоны 2 не берётся — по чертежу
     заказчика она не гравируется; синие размерные стрелки и рамку
     зоны оборота отсекает фильтр по цвету — рисунок почти чёрный;
  3. матрицы родителей сворачиваются в одну на элемент, глифы подписей
     переносятся вместе со своими определениями;
  4. точность координат режется до сотых, цвет — белый;
  5. растры: знаки — шириной 480 px, логотипы — высотой 360 px
     (rsvg-convert из librsvg2-bin), затем палитра (pngquant).
     Знаки из public/signs переводятся все — и эти, и нарисованные
     `scripts/draw-signs.mjs`, поэтому тот запускается первым.

Рамки и границы рисунка сняты замером в браузере (`getBBox` в пунктах
листа). Шире рамки рисунок только у «Обруча»: хвост «р» уходит под рамку
на 0,3 мм — так в файле заказчика, обрезать его нельзя.

Запуск: python3 scripts/prepare-signs.py
Требует: sudo apt-get install poppler-utils librsvg2-bin pngquant
"""

import json
import pathlib
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET

SRC = pathlib.Path("assets/signs-source.pdf")
OUT = pathlib.Path("public/signs")
КАРТА = pathlib.Path("lib/signs.json")
OUT_LOGOS = pathlib.Path("public/logos")
КАРТА_ЛОГОТИПОВ = pathlib.Path("lib/logos.json")
ШИРИНА_PNG = 480  # Зона 2 на самой крупной флешке при тройной плотности
ВЫСОТА_PNG_ЛОГОТИПА = 360  # зона оборота 15 мм — та же плотность
PT = 25.4 / 72

# id: (рамка x, y, ш, в), (границы рисунка x, y, ш, в) — в пунктах листа
SIGNS = {
    "bp": ((97.434, 66.636, 32.559, 42.469), (97.434, 66.636, 32.559, 42.469)),
    "hoop": ((147.391, 66.23, 32.559, 42.469), (147.391, 66.229, 32.722, 43.307)),
    "ball": ((198.715, 66.648, 32.559, 42.469), (198.715, 66.648, 32.559, 42.469)),
    "clubs": ((246.645, 66.648, 32.559, 42.469), (246.645, 66.648, 32.56, 42.469)),
    "ribbon": ((295.692, 66.629, 32.559, 42.469), (295.692, 66.628, 32.56, 42.491)),
    "rope": ((348.789, 66.644, 32.559, 42.465), (348.789, 66.641, 32.559, 42.468)),
}

# id: границы рисунка x, y, ш, в — в пунктах листа
LOGOS = {
    "moscow": (109.85, 318.63, 79.27, 40.95),
    "kinder-study": (240.12, 320.87, 70.3, 42.47),
    "trudovye-rezervy": (346.97, 317.78, 47.69, 42.47),
    "diamond": (427.36, 325.35, 79.28, 33.72),
}

SVG = "http://www.w3.org/2000/svg"
XLINK = "http://www.w3.org/1999/xlink"
СВОЙСТВА = (
    "fill", "fill-rule", "fill-opacity", "stroke", "stroke-width",
    "stroke-opacity", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit",
)


def матрица(t: str | None) -> tuple[float, ...]:
    if not t:
        return (1, 0, 0, 1, 0, 0)
    m = re.match(r"matrix\(([^)]+)\)", t)
    if m:
        return tuple(float(v) for v in re.split(r"[ ,]+", m.group(1).strip()))
    m = re.match(r"translate\(([^)]+)\)", t)
    if m:
        v = [float(x) for x in re.split(r"[ ,]+", m.group(1).strip())]
        return (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
    raise ValueError(f"незнакомое преобразование: {t}")


def умножить(a, b):
    return (
        a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
        a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
        a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
    )


def точка(m, x, y):
    return (m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5])


def сжать(s: str) -> str:
    return re.sub(
        r"-?\d+\.\d+",
        lambda m: f"{float(m.group()):.2f}".rstrip("0").rstrip("."),
        s,
    )


def элементы(узел, m, свойства, out):
    """Обходит лист, копя матрицы и наследуемые свойства родителей."""
    for ребёнок in узел:
        тег = ребёнок.tag.split("}")[-1]
        if тег == "defs":
            continue
        своё = dict(свойства)
        for к in СВОЙСТВА:
            if ребёнок.get(к) is not None:
                своё[к] = ребёнок.get(к)
        мм = умножить(m, матрица(ребёнок.get("transform")))
        if тег in ("path", "use"):
            out.append((ребёнок, тег, мм, своё))
        элементы(ребёнок, мм, своё, out)


def опорная(эл, тег, m):
    if тег == "use":
        return точка(m, float(эл.get("x", 0)), float(эл.get("y", 0)))
    x, y = re.findall(r"-?\d+(?:\.\d+)?", эл.get("d"))[:2]
    return точка(m, float(x), float(y))


def это_рамка(эл, тег, свойства, m, рамка) -> bool:
    if тег != "path" or свойства.get("fill", "") != "none":
        return False
    x, y = опорная(эл, тег, m)
    углы = [(рамка[0], рамка[1]), (рамка[0] + рамка[2], рамка[1]),
            (рамка[0], рамка[1] + рамка[3]), (рамка[0] + рамка[2], рамка[1] + рамка[3])]
    команд = len(re.findall(r"[MLHVCZ]", эл.get("d")))
    return команд <= 6 and any(abs(x - ux) < 0.6 and abs(y - uy) < 0.6 for ux, uy in углы)


def тёмный(цвет: str | None) -> bool:
    """Рисунок заказчика почти чёрный; синие стрелки размеров — нет."""
    if цвет is None or цвет == "none":
        return True
    доли = [float(v) for v in re.findall(r"([\d.]+)%", цвет)]
    return len(доли) == 3 and all(v < 35 for v in доли)


def вырезать(все, глифы, область, границы, рамка: bool):
    """SVG из элементов листа, чья опорная точка лежит в области."""
    x0, y0, w, h = область
    тела, ссылки = [], []
    for эл, тег, m, свойства in все:
        px, py = опорная(эл, тег, m)
        if not (x0 - 3 < px < x0 + w + 3 and y0 - 3 < py < y0 + h + 3):
            continue
        if рамка and это_рамка(эл, тег, свойства, m, область):
            continue
        if not (тёмный(свойства.get("fill")) and тёмный(свойства.get("stroke"))):
            continue
        attrs = {к: "#fff" if к in ("fill", "stroke") and v != "none" else v
                 for к, v in свойства.items()}
        attrs["transform"] = "matrix(" + " ".join(f"{v:.4f}" for v in m) + ")"
        if тег == "path":
            attrs["d"] = сжать(эл.get("d"))
        else:
            ref = эл.get(f"{{{XLINK}}}href") or эл.get("href")
            ссылки.append(ref[1:])
            attrs["href"] = ref
            attrs["x"], attrs["y"] = эл.get("x", "0"), эл.get("y", "0")
        тела.append(f"<{тег} " + " ".join(f'{к}="{v}"' for к, v in attrs.items()) + "/>")

    defs = ""
    for ref in dict.fromkeys(ссылки):
        g = глифы[ref]
        пути = "".join(f'<path d="{сжать(p.get("d") or "")}"/>' for p in g.iter(f"{{{SVG}}}path"))
        defs += f'<g id="{ref}">{пути}</g>'

    файл = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(map(str, границы))}">'
        + (f"<defs>{defs}</defs>" if defs else "")
        + "".join(тела)
        + "</svg>"
    )
    return файл, len(тела)


def в_png(svg: str, куда: pathlib.Path, размер: list[str]) -> None:
    """Растр с палитрой: в рисунке один цвет и полутона краёв."""
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as f:
        f.write(svg)
    subprocess.run(["rsvg-convert", *размер, "-o", str(куда), f.name], check=True)
    pathlib.Path(f.name).unlink()
    subprocess.run(
        ["pngquant", "--force", "--skip-if-larger", "--quality", "70-95",
         "--ext", ".png", str(куда)],
        check=False,  # 99 — «не стало меньше», оставляем как есть
    )


def растр_знаков(рамки: dict) -> None:
    """PNG знаков для металла и карта положения рисунка в Зоне 2."""
    карта = {}
    for svg in sorted(OUT.glob("*.svg")):
        id_ = svg.stem
        текст = svg.read_text()
        x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', текст).group(1).split())
        рамка = рамки.get(id_, (x, y, w, h))  # у нарисованных рамка = холст
        в_png(текст, OUT / f"{id_}.png", ["-w", str(ШИРИНА_PNG)])
        рх, ру, рш, рв = рамка
        карта[id_] = {
            "x": round((x - рх) / рш, 4),
            "y": round((y - ру) / рв, 4),
            "w": round(w / рш, 4),
            "h": round(h / рв, 4),
        }
        print(f"{id_}.png: {(OUT / f'{id_}.png').stat().st_size // 1024} КБ")
    КАРТА.write_text(json.dumps(карта, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        svg = pathlib.Path(tmp) / "page.svg"
        subprocess.run(["pdftocairo", "-svg", str(SRC), str(svg)], check=True)
        дерево = ET.parse(svg)
    корень = дерево.getroot()
    глифы = {e.get("id"): e for e in корень.iter() if e.get("id")}

    все: list = []
    элементы(корень, (1, 0, 0, 1, 0, 0), {}, все)

    OUT.mkdir(exist_ok=True)
    for id_, (рамка, границы) in SIGNS.items():
        файл, n = вырезать(все, глифы, рамка, границы, рамка=True)
        (OUT / f"{id_}.svg").write_text(файл)
        print(f"{id_}: элементов {n} · {len(файл) // 1024} КБ")
    растр_знаков({id_: рамка for id_, (рамка, _) in SIGNS.items()})

    OUT_LOGOS.mkdir(exist_ok=True)
    размеры = {}
    for id_, границы in LOGOS.items():
        файл, n = вырезать(все, глифы, границы, границы, рамка=False)
        (OUT_LOGOS / f"{id_}.svg").write_text(файл)
        в_png(файл, OUT_LOGOS / f"{id_}.png", ["-h", str(ВЫСОТА_PNG_ЛОГОТИПА)])
        размеры[id_] = {"w": round(границы[2] * PT, 2), "h": round(границы[3] * PT, 2)}
        print(
            f"логотип {id_}: элементов {n} · {размеры[id_]['w']} × {размеры[id_]['h']} мм"
            f" · {(OUT_LOGOS / f'{id_}.png').stat().st_size // 1024} КБ"
        )
    КАРТА_ЛОГОТИПОВ.write_text(json.dumps(размеры, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
