"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { apparatusShape } from "@/components/icons";
import measures from "@/lib/drive-measures.json";
import { APPARATUS, SPEC, SQUEEZE, fontById } from "@/lib/site";

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
 * те же, что на чертеже заказчика от 27.08.
 */

/*
 * Чертёж, миллиметры. Всё производное считается здесь, чтобы на схеме
 * и в коде стояли одни и те же числа:
 *
 *   корпус 50 × 17, поле гравировки 45 × 15 — по центру корпуса,
 *   значит поля по 2,5 слева и справа и по 1 сверху и снизу;
 *   Зона 2 прижата к правому краю поля, Зона 1 — к левому,
 *   между ними 1,5.
 *
 *   2,5 ── Зона 1 (32) ── 34,5 ─1,5─ 36 ── Зона 2 (11,5) ── 47,5
 */
const FIELD_L = (SPEC.plate - SPEC.field) / 2;
const FIELD_R = FIELD_L + SPEC.field;
const FIELD_T = (SPEC.plateH - SPEC.fieldH) / 2;
const MID_Y = SPEC.plateH / 2;
const ZONE2_L = FIELD_R - SPEC.iconField;
const ZONE2_MID = ZONE2_L + SPEC.iconField / 2;
const ZONE1_L = ZONE2_L - SPEC.gap - SPEC.textField;
const ZONE1_MID = ZONE1_L + SPEC.textField / 2;
/** без знака надпись остаётся 32 мм и встаёт по центру поля гравировки */
const WIDE_MID = SPEC.plate / 2;

/**
 * Кегль: три строки должны уложиться в 15 мм высоты зоны. Шаг строки
 * берём 5 мм — ровно треть зоны, кегль чуть меньше шага, чтобы соседние
 * строки не сцеплялись выносными.
 */
const LINE_STEP = SPEC.fieldH / SPEC.lines;
const BASE_SIZE = LINE_STEP * 0.86;
/** Впадина под палец: на изделии она заметно крупнее заклёпки. */
const DIMPLE_R = 3;
const LABEL_SIZE = 2.4; // кегль подписи предмета, мм
const TILT = (7 * Math.PI) / 180; // наклон подписи, как на фотографии партии
const PROBE_Y = -20; // базовая линия невидимого дубля, за пределами пластины

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
  side = "front",
  back,
}: {
  color: string;
  /** null — гравировка без знака: поле текста занимает всю пластину */
  apparatusId: string | null;
  lines: readonly [string, string, string];
  /** строки оборотной стороны; показываются при side="back" */
  back?: readonly [string, string, string];
  /** гарнитура гравировки; по умолчанию рукописная, как в текущих партиях */
  fontId?: string;
  className?: string;
  showLabel?: boolean;
  /** false — корпус без подвески: для миниатюр, где цепочка съедает ширину */
  chain?: boolean;
  priority?: boolean;
  /**
   * Какую сторону показывать. Корпус один и тот же, поэтому оборот —
   * это тот же снимок, отражённый по горизонтали: колпачок уходит
   * на другой край, как и на изделии. Гравировка у сторон разная.
   */
  side?: "front" | "back";
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
  const [squeeze, setSqueeze] = useState(SQUEEZE);
  const key = `${lines.join("|")}|${(back ?? []).join("|")}|${side}|${font.id}`;

  useEffect(() => {
    // `getBBox()` возвращает габарит до собственного преобразования группы,
    // поэтому меряем набор в натуральную ширину и сжимаем сами
    const w = probe.current?.getBBox().width ?? 0;
    if (!w) return;
    /* Чертёж: «шрифт дополнительно сжимается до размера в 32 мм».
       Именно сжимается — кегль не трогаем. Уменьшать кегль нельзя:
       три строки обязаны занимать те же 15 мм по высоте, а строка
       с длинной фамилией — стоять вровень с остальными. */
    const зона = side === "back" ? SPEC.backField : SPEC.textField;
    setSqueeze(Math.min(SQUEEZE, зона / w));
  }, [key, side]);

  const size = BASE_SIZE;
  const label = APPARATUS.find((a) => a.id === apparatusId)?.label ?? "";
  const textMid = apparatusId ? ZONE1_MID : WIDE_MID;

  /* Пустые строки в раскладке не участвуют: чертёж требует центровать
     надпись по зоне, сколько бы строк ни было заполнено. Две строки
     встают вокруг середины, одна — ровно в середину. */
  const источник = side === "back" ? (back ?? ["", "", ""]) : lines;
  const filled = источник.filter((l) => l.trim());
  const rows = filled.length ? filled : [""];
  const firstY = MID_Y - ((rows.length - 1) * LINE_STEP) / 2;

  /* Зона 2 — короб 11,5 × 15, и по чертежу в него целиком помещается
     пиктограмма. На изделии знак идёт вместе со своей подписью одним
     клеймом, поэтому и здесь они делят один короб: знак сверху во всю
     ширину зоны, подпись под ним. Без подписи знак встаёт по центру. */
  const ICON_BOX = SPEC.iconField - 1.4;
  const ICON_Y = showLabel ? FIELD_T + 0.5 : MID_Y - ICON_BOX / 2;
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
      {/* Маска пластины указана в стилях, поэтому браузер узнаёт о ней
          последним и на медленном канале красит корпус через секунду
          после самой флешки. Там, где флешка — главное изображение
          страницы, просим маску заранее: без этого цветное пятно
          дорисовывалось так поздно, что отрисовка страницы засчитывалась
          по нему (замерено 3,5 с против 1,8 с у самой флешки). */}
      {priority ? (
        <link rel="preload" as="image" href={mask} fetchPriority="high" />
      ) : null}

      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 90vw, 640px"
        className={`object-contain ${side === "back" ? "-scale-x-100" : ""}`}
      />

      {/* цвет корпуса — только по пластине, режимом умножения */}
      <span
        aria-hidden
        className={`drive-tint pointer-events-none absolute inset-0 mix-blend-multiply ${
          side === "back" ? "-scale-x-100" : ""
        }`}
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
        viewBox={`0 0 ${SPEC.plate} ${SPEC.plateH}`}
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
          {источник.map((line, i) => (
            <text key={i} x={0} y={PROBE_Y} fontSize={BASE_SIZE}>
              {line}
            </text>
          ))}
        </g>

        {side === "front" ? (
          <FrontEngraving
            rows={rows}
            firstY={firstY}
            size={size}
            squeeze={squeeze}
            textMid={textMid}
            font={font}
          />
        ) : (
          <BackEngraving
            rows={rows}
            firstY={firstY}
            size={size}
            squeeze={squeeze}
            font={font}
          />
        )}

        {side === "front" && apparatusId ? (
          <>
            {/* Знак и подпись стоят одним столбиком: знак 7,2 мм, под ним
                1,2 мм воздуха и строка. Раньше знак был крупнее, а подпись
                падала к нижнему краю пластины — между ними зияло, и подпись
                читалась приклеенной к торцу, а не к своему знаку. */}
            <g
              /* Знак строго внутри Зоны 2 — 11,5 мм по ширине. Под ним
                 остаётся место на подпись; без подписи знак встаёт
                 по центру зоны и занимает её целиком по ширине. */
              transform={`translate(${ZONE2_MID - ICON_BOX / 2} ${ICON_Y}) scale(${ICON_BOX / 24})`}
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

        {side === "front" && apparatusId && showLabel && label ? (
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
  /* Нижний край зоны минус запас: подпись стоит под знаком и не выходит
     за поле гравировки, сколько бы строк в ней ни было. */
  const first = SPEC.plateH - (SPEC.plateH - SPEC.fieldH) / 2 - 1.1 - (lines.length - 1) * step;

  const rows = (fill: string, opacity: string, dy: number) =>
    lines.map((line, i) => (
      <text
        key={line + i}
        x={ZONE2_MID}
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
          <text key={i} x={ZONE2_MID} y={PROBE_Y} fontSize={LABEL_SIZE}>
            {line}
          </text>
        ))}
      </g>

      <g
        style={{ fontFamily: font.css, fontWeight: font.weight }}
        transform={`rotate(-7 ${ZONE2_MID} ${pivot})`}
      >
        {rows("#000", "0.32", 0.2)}
        {rows("#fff", "0.96", 0)}
      </g>
    </>
  );
}

/** Надпись лицевой стороны: Зона 1, сжатие 50 %, центровка по зоне. */
function FrontEngraving({
  rows,
  firstY,
  size,
  squeeze,
  textMid,
  font,
}: {
  rows: string[];
  firstY: number;
  size: number;
  squeeze: number;
  textMid: number;
  font: ReturnType<typeof fontById>;
}) {
  return (
    <g
      style={{ fontFamily: font.css, fontWeight: font.weight }}
      transform={`translate(${textMid} 0) scale(${squeeze} 1)`}
    >
      {rows.map((line, i) => {
        const y = firstY + i * LINE_STEP;
        return (
          <g key={i}>
            <text
              x={0}
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
              x={0}
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
  );
}

/**
 * Оборотная сторона.
 *
 * Чертёж: зона гравировки 28 × 15 мм, левый край выровнен по зелёной
 * пунктирной линии — той же, что задаёт левый край поля на лицевой.
 * Центровка «аналогична центровке лицевой»: строки стоят по центру
 * зоны и по горизонтали, и по вертикали, сколько бы их ни было
 * заполнено — одна, две или три.
 *
 * Ось поворотного механизма и логотип у колпачка — не гравировка,
 * а сам предмет: они взяты с фотографий изделия и потому нарисованы
 * всегда.
 */
function BackEngraving({
  rows,
  firstY,
  size,
  squeeze,
  font,
}: {
  rows: string[];
  firstY: number;
  size: number;
  squeeze: number;
  font: ReturnType<typeof fontById>;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const зонаЦентр = FIELD_L + SPEC.backField / 2;
  const свободно = FIELD_R - (FIELD_L + SPEC.backField);
  const осьX = FIELD_L + SPEC.backField + свободно * 0.32;
  const логоX = FIELD_R - 4.4;

  return (
    <g>
      {/* Впадина под палец — ею флешку выдвигают. Это не гравировка
          и не кружок: металл вдавлен, поэтому верх внутри в тени,
          а низ ловит свет. Снаружи по нижнему краю идёт тонкий блик —
          кромка, поднятая вокруг углубления. */}
      <defs>
        <radialGradient id={`${uid}-dimple`} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.30" />
          <stop offset="52%" stopColor="#000" stopOpacity="0.13" />
          <stop offset="86%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.30" />
        </radialGradient>
      </defs>

      <circle cx={осьX} cy={MID_Y} r={DIMPLE_R} fill={`url(#${uid}-dimple)`} />
      {/* верхняя дуга — тень от кромки, нижняя — блик на дне */}
      <path
        d={`M ${осьX - DIMPLE_R * 0.94} ${MID_Y - DIMPLE_R * 0.2}
            A ${DIMPLE_R} ${DIMPLE_R} 0 0 1 ${осьX + DIMPLE_R * 0.94} ${MID_Y - DIMPLE_R * 0.2}`}
        fill="none"
        stroke="#000"
        strokeOpacity="0.34"
        strokeWidth="0.28"
        strokeLinecap="round"
      />
      <path
        d={`M ${осьX - DIMPLE_R * 0.9} ${MID_Y + DIMPLE_R * 0.3}
            A ${DIMPLE_R} ${DIMPLE_R} 0 0 0 ${осьX + DIMPLE_R * 0.9} ${MID_Y + DIMPLE_R * 0.3}`}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="0.3"
        strokeLinecap="round"
      />

      <g transform={`translate(${логоX} ${MID_Y})`}>
        {["PERSONAL", "FLASH"].map((w, i) => (
          <text
            key={w}
            x={0}
            y={i ? 1.3 : -0.9}
            fontSize={1.9}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fillOpacity="0.9"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {w}
          </text>
        ))}
      </g>

      <g
        style={{ fontFamily: font.css, fontWeight: font.weight }}
        transform={`translate(${зонаЦентр} 0) scale(${squeeze} 1)`}
      >
        {rows.map((line, i) => {
          const y = firstY + i * LINE_STEP;
          return (
            <g key={i}>
              <text
                x={0}
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
                x={0}
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
    </g>
  );
}
