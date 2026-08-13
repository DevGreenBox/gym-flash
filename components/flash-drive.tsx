"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { apparatusShape } from "@/components/icons";
import measures from "@/lib/drive-measures.json";
import { APPARATUS, SPEC, fontById } from "@/lib/site";

/**
 * Флешка — снимок базовой модели (`public/drive/*.png`) плюс гравировка
 * вектором поверх. Металл, цепочка, карабин и кольцо взяты из растра, а всё,
 * что меняется — цвет корпуса и надпись, — рисуется на лету.
 *
 * Цвет кладётся режимом `multiply` через маску пластины: так он ложится
 * на металл как анодировка и сохраняет шлифовку и блик. Пластина в базе
 * серая со средней яркостью 179, поэтому цвет заранее осветляется
 * (`tint`), иначе всё уходило бы в темноту.
 *
 * Гравировка живёт в отдельном SVG с viewBox в миллиметрах — координаты
 * те же, что на чертеже заказчика: пластина 49,96 × 16,8 мм, поле текста
 * 33,42 мм, поле знака 11,50 мм.
 */

const PLATE_H = 16.8; // высота пластины, мм
const BASE_SIZE = 4.1; // кегль гравировки, мм — ниже опускаемся только по нужде
const LABEL_SIZE = 2.7; // кегль подписи предмета, мм
const TILT = (7 * Math.PI) / 180; // наклон подписи, как на фотографии партии
const PROBE_Y = -20; // базовая линия невидимого дубля, за пределами пластины
const MARGIN = 2.6; // поле от края пластины до гравировки
const TEXT_MID = MARGIN + SPEC.textField / 2;
/* граница полей — теперь только точка отсчёта для знака: разделяющий
   волосок с пластины снят */
const DIVIDER_X = MARGIN + SPEC.textField;
const ICON_MID = DIVIDER_X + SPEC.iconField / 2;
const WIDE_MID = SPEC.plate / 2;

/** Средняя яркость серой пластины в базовом снимке. */
const BASE_LUMA = 179 / 255;

/** Осветление под `multiply`: после умножения на металл вернётся исходный цвет. */
function tint(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.min(255, Math.round(c / BASE_LUMA)),
  );
  return `rgb(${ch.join(" ")})`;
}

export function FlashDrive({
  color,
  apparatusId,
  lines,
  fontId,
  className,
  showLabel = true,
  chain = true,
  priority,
}: {
  color: string;
  /** null — гравировка без знака: поле текста занимает всю пластину */
  apparatusId: string | null;
  lines: readonly [string, string, string];
  /** гарнитура гравировки; по умолчанию рукописная, как в текущих партиях */
  fontId?: string;
  className?: string;
  showLabel?: boolean;
  /** false — корпус без подвески: для миниатюр, где цепочка съедает ширину */
  chain?: boolean;
  priority?: boolean;
}) {
  const font = fontById(fontId);

  /**
   * Кегль подгоняется по фактической ширине набора, а не по числу знаков:
   * у прямого шрифта знак шире рукописного почти на треть, да и «Ш» вдвое
   * шире «г». Счёт по средней ширине проходил на обычных фамилиях
   * и разваливался на широких — надпись уезжала за пластину.
   *
   * Замер идёт на невидимом дубле, который всегда набран базовым кеглем:
   * если мерить видимый текст, каждое уменьшение меняло бы следующий замер
   * и подгонка не сходилась бы.
   */
  const probe = useRef<SVGGElement>(null);
  const [scale, setScale] = useState(1);
  const key = `${lines.join("|")}|${font.id}`;

  useEffect(() => {
    const w = probe.current?.getBBox().width ?? 0;
    const max = SPEC.textField - 1.2;
    setScale(w > max ? max / w : 1);
  }, [key]);

  const size = BASE_SIZE * scale;
  const label = APPARATUS.find((a) => a.id === apparatusId)?.label ?? "";
  const textMid = apparatusId ? TEXT_MID : WIDE_MID;
  const m = chain ? measures.full : measures.solo;
  const src = chain ? "/drive/base.png" : "/drive/base-solo.png";
  const mask = chain ? "/drive/plate-mask.png" : "/drive/plate-mask-solo.png";

  const plate = {
    left: `${m.plate.left}%`,
    top: `${m.plate.top}%`,
    width: `${m.plate.width}%`,
    height: `${m.plate.height}%`,
  };

  return (
    <div
      className={`relative isolate ${className ?? ""}`}
      style={{ aspectRatio: m.aspect }}
      role="img"
      aria-label={`Флешка${chain ? " на цепочке" : ""}, гравировка: ${lines
        .filter(Boolean)
        .join(", ")}${label ? `, предмет: ${label}` : ""}`}
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 90vw, 640px"
        className="object-contain"
      />

      {/* цвет корпуса — только по пластине, режимом умножения */}
      <span
        aria-hidden
        className="drive-tint pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          background: tint(color),
          maskImage: `url(${mask})`,
          WebkitMaskImage: `url(${mask})`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />

      {/* гравировка: координаты в миллиметрах с чертежа */}
      <svg
        aria-hidden
        viewBox={`0 0 ${SPEC.plate} ${PLATE_H}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute"
        style={plate}
      >
        {/* невидимый дубль для замера: всегда базовым кеглем */}
        <g
          ref={probe}
          aria-hidden
          style={{
            fontFamily: font.css,
            fontWeight: font.weight,
            visibility: "hidden",
          }}
        >
          {lines.map((line, i) => (
            <text key={i} x={textMid} y={-20} fontSize={BASE_SIZE}>
              {line}
            </text>
          ))}
        </g>

        <g style={{ fontFamily: font.css, fontWeight: font.weight }}>
          {lines.map((line, i) => {
            const y = 4.2 + i * 4.2;
            return (
              <g key={i}>
                <text
                  x={textMid}
                  y={y + 0.24}
                  fontSize={size}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000"
                  fillOpacity="0.34"
                >
                  {line}
                </text>
                <text
                  x={textMid}
                  y={y}
                  fontSize={size}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fillOpacity="0.96"
                >
                  {line}
                </text>
              </g>
            );
          })}
        </g>

        {apparatusId ? (
          <>
            {/* Знак и подпись стоят одним столбиком: знак 7,2 мм, под ним
                1,2 мм воздуха и строка. Раньше знак был крупнее, а подпись
                падала к нижнему краю пластины — между ними зияло, и подпись
                читалась приклеенной к торцу, а не к своему знаку. */}
            <g
              transform={`translate(${ICON_MID - 3.6} ${showLabel ? 2.2 : 4.4}) scale(${(showLabel ? 7.2 : 8) / 24})`}
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g
                stroke="#000"
                strokeOpacity="0.32"
                transform="translate(0 0.7)"
              >
                {apparatusShape(apparatusId)}
              </g>
              <g stroke="#fff" strokeOpacity="0.96">
                {apparatusShape(apparatusId)}
              </g>
            </g>
          </>
        ) : null}

        {apparatusId && showLabel && label ? (
          <LabelPlate label={label} font={font} />
        ) : null}
      </svg>
    </div>
  );
}

/**
 * Подпись предмета под знаком. На фотографии партии она набрана с лёгким
 * наклоном и всегда умещается в поле 11,50 мм: длинное «Для тренировок»
 * ломается на две строки, остальное ужимается по кеглю. Раньше «Скакалка»
 * вылезала за край пластины.
 */
function LabelPlate({
  label,
  font,
}: {
  label: string;
  font: ReturnType<typeof fontById>;
}) {
  const words = label.split(" ");
  const lines = words.length > 1 && label.length > 8 ? words : [label];

  /**
   * Кегль подписи, как и у строк гравировки, считается по фактической
   * ширине набора. Счёт по средней ширине знака здесь врал: у Caveat
   * «Скакалка» шире оценки на четверть, и подпись упиралась в торец.
   *
   * Наклон в семь градусов тоже занимает ширину: повёрнутая строка
   * занимает `cos·ширина + sin·высота`. Без этой поправки замер
   * показывал, что всё влезает, а на пластине не влезало —
   * `getBBox()` возвращает габарит до собственного поворота группы.
   */
  const probe = useRef<SVGGElement>(null);
  const [m, setM] = useState({ fit: 1, ascent: LABEL_SIZE * 0.72 });
  const key = `${label}|${font.id}`;

  useEffect(() => {
    const b = probe.current?.getBBox();
    if (!b) return;
    const turned = b.width * Math.cos(TILT) + LABEL_SIZE * Math.sin(TILT);
    const max = SPEC.iconField - 1;
    setM({
      fit: turned > max ? max / turned : 1,
      // насколько верх строки выше базовой линии: у каждой гарнитуры своя
      ascent: PROBE_Y - b.y,
    });
  }, [key]);

  const size = LABEL_SIZE * m.fit;
  const step = size * 1.05;
  const first = 12.8 - (lines.length - 1) * step;

  const rows = (fill: string, opacity: string, dy: number) =>
    lines.map((line, i) => (
      <text
        key={line + i}
        x={ICON_MID}
        y={first + i * step + dy}
        fontSize={size}
        textAnchor="middle"
        fill={fill}
        fillOpacity={opacity}
      >
        {line}
      </text>
    ));

  /**
   * Поворот идёт вокруг середины строки, а не вокруг базовой линии.
   * База лежит под буквами, и поворот вокруг неё сдвигал весь набор влево
   * на `sin(7°) × высоту` — у каждой гарнитуры на свою величину, отчего
   * подпись съезжала из-под знака по-разному в трёх шрифтах.
   */
  const pivot = first + ((lines.length - 1) * step - m.ascent * m.fit) / 2;

  return (
    <>
      {/* невидимый дубль для замера: всегда базовым кеглем и без поворота */}
      <g
        ref={probe}
        aria-hidden
        style={{
          fontFamily: font.css,
          fontWeight: font.weight,
          visibility: "hidden",
        }}
      >
        {lines.map((line, i) => (
          <text key={i} x={ICON_MID} y={PROBE_Y} fontSize={LABEL_SIZE}>
            {line}
          </text>
        ))}
      </g>

      <g
        style={{ fontFamily: font.css, fontWeight: font.weight }}
        transform={`rotate(-7 ${ICON_MID} ${pivot})`}
      >
        {rows("#000", "0.32", 0.2)}
        {rows("#fff", "0.96", 0)}
      </g>
    </>
  );
}
