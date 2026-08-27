import { SPEC } from "@/lib/site";

/**
 * Силуэт корпуса — снят с чертежа заказчика пиксель в пиксель.
 *
 * Замер `assets/image 18.png`: корпус 287 × 99 px на 49,96 × 17 мм,
 * то есть 5,75 px/мм. Верх и низ идут ровной прямой от 282 до 532 px —
 * это плоские грани. Торцы выпирают ровно на 15 px = 2,6 мм и достигают
 * крайней точки на середине высоты. Значит торец — не полукруг
 * (радиус был бы 8,5 мм) и не скруглённый угол, а эллиптическая дуга:
 * 2,6 мм по горизонтали на 8,5 мм по вертикали.
 *
 * Такая же форма на фотографии партии — «подушка», а не капсула.
 *
 * Ширина колпачка замерена по той же фотографии: пластина 195 px
 * на 50 мм даёт 3,90 px/мм, чёрное слева — 5,4 мм.
 */
export const КОЛПАЧОК = 5.4;
/** Вылет торца по горизонтали. */
const КРАЙ = 2.6;
const КОЛЬЦО_R = 2.3;
const ПОЛЕ = 1;

export const ПЛАСТИНА_X = 0;
export const ПЛАСТИНА_Y = ПОЛЕ;

export const ХОЛСТ = {
  w: SPEC.plate + КОЛЬЦО_R * 2 + 1,
  h: SPEC.plateH + ПОЛЕ * 2,
};

/** Доли корпуса внутри холста — по ним кладутся зоны нажатия. */
export const ПЛАСТИНА_ДОЛИ = {
  left: (ПЛАСТИНА_X / ХОЛСТ.w) * 100,
  top: (ПЛАСТИНА_Y / ХОЛСТ.h) * 100,
  width: (SPEC.plate / ХОЛСТ.w) * 100,
  height: (SPEC.plateH / ХОЛСТ.h) * 100,
};

/** Контур корпуса: прямые верх и низ, торцы — эллиптические дуги. */
export const КОРПУС_D = (() => {
  const x = ПЛАСТИНА_X;
  const y = ПЛАСТИНА_Y;
  const w = SPEC.plate;
  const h = SPEC.plateH;
  const ry = h / 2;
  return [
    `M ${x + КРАЙ} ${y}`,
    `H ${x + w - КРАЙ}`,
    `A ${КРАЙ} ${ry} 0 0 1 ${x + w - КРАЙ} ${y + h}`,
    `H ${x + КРАЙ}`,
    `A ${КРАЙ} ${ry} 0 0 1 ${x + КРАЙ} ${y}`,
    "Z",
  ].join(" ");
})();

/** Кольцо: продето в дальний торец, поэтому наполовину уходит под корпус. */
export function DriveRing({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ededee" />
          <stop offset="52%" stopColor="#96969a" />
          <stop offset="100%" stopColor="#cfcfd3" />
        </linearGradient>
      </defs>
      <circle
        cx={SPEC.plate + КОЛЬЦО_R - 0.6}
        cy={ПОЛЕ + SPEC.plateH / 2}
        r={КОЛЬЦО_R}
        fill="none"
        stroke={`url(#${uid}-ring)`}
        strokeWidth="0.75"
      />
    </>
  );
}

/**
 * Чёрный колпачок — отдельная деталь, из которой выдвигается разъём.
 * Рисуется бруском и обрезается контуром корпуса, поэтому его левый
 * торец повторяет ту же дугу. По стыку идёт тонкая тень: на изделии
 * это шов двух деталей, без него чёрное читается как краска.
 */
export function DriveCap({ uid }: { uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#48484b" />
          <stop offset="38%" stopColor="#292a2c" />
          <stop offset="100%" stopColor="#131314" />
        </linearGradient>
      </defs>
      <rect
        x={ПЛАСТИНА_X}
        y={ПЛАСТИНА_Y}
        width={КОЛПАЧОК}
        height={SPEC.plateH}
        fill={`url(#${uid}-cap)`}
      />
      <rect
        x={ПЛАСТИНА_X + КОЛПАЧОК}
        y={ПЛАСТИНА_Y}
        width={0.35}
        height={SPEC.plateH}
        fill="#000"
        fillOpacity="0.3"
      />
    </>
  );
}
