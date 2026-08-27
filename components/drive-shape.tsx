import { SPEC } from "@/lib/site";

/**
 * Силуэт корпуса — строго по чертежу заказчика.
 *
 * На схеме корпус нарисован капсулой: 50 × 17 мм, торцы скруглены
 * по половине высоты. Чёрный колпачок не приставлен сбоку, а вписан
 * в это же скругление — он часть капсулы, а не отдельная деталь.
 * Прежняя модель была прямоугольником со слабым скруглением углов,
 * и торцы у неё выглядели рублеными.
 *
 * Ширина колпачка замерена по фотографии партии: пластина 195 px
 * на 50 мм даёт 3,90 px/мм, чёрное слева — 5,4 мм.
 */
export const КОЛПАЧОК = 5.4;
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

/** Чёрный колпачок: та же капсула, обрезанная по своей ширине. */
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
    </>
  );
}
