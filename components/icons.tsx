import type { ReactElement } from "react";

/**
 * Знаки предметов срисованы со снимка партии (`assets/image 17.png`):
 * на металле у заказчика не пиктограммы из библиотеки, а узнаваемые
 * предметы — обруч ложится эллипсом, булавы скрещиваются, у ленты
 * видна палочка, у скакалки — ручки.
 *
 * Система координат 24×24, рисунок отцентрован в ней по обеим осям:
 * знак стоит на пластине точно под серединой подписи, и смещённая
 * внутри квадрата фигура сразу читается как перекос.
 */
const shapes: Record<string, ReactElement> = {
  // Б/П — гимнастка в прыжке: голова, корпус, руки и разножка
  bp: (
    <g>
      <circle cx="13.2" cy="4.3" r="2" />
      <path d="M12.7 6.4 10.6 12.3" />
      <path d="M12.4 8.4 5.2 7.1" />
      <path d="M13 8 19.4 4.2" />
      <path d="M10.6 12.3 5 19.8" />
      <path d="M10.6 12.3 19 16.4" />
    </g>
  ),
  // Обруч — кольцо в перспективе: шире, чем выше, с небольшим наклоном
  hoop: (
    <g>
      <ellipse cx="12" cy="12" rx="8.6" ry="6.3" transform="rotate(-16 12 12)" />
    </g>
  ),
  // Мяч — окружность и короткий блик в верхней четверти
  ball: (
    <g>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M6.6 8.6a6.6 6.6 0 0 1 4.8-2.9" />
    </g>
  ),
  // Булавы — накрест, головки сверху, ручки сходятся внизу
  clubs: (
    <g>
      <circle cx="8.4" cy="4.6" r="1.8" />
      <path d="M9.1 6.3 15.4 19.6" />
      <circle cx="15.6" cy="4.6" r="1.8" />
      <path d="M14.9 6.3 8.6 19.6" />
    </g>
  ),
  // Лента — палочка снизу слева и петля, уходящая вверх направо.
  // Сдвиг на 2,01: рисунок несимметричен, его габарит приходился
  // на 10,89 вместо 12 — знак стоял левее середины квадрата,
  // и подпись под ним выглядела съехавшей. Величина замерена, не на глаз.
  ribbon: (
    <g transform="translate(2.01 0)">
      <path d="M3.6 20.4 8.2 15.8" />
      <path d="M8.2 15.8c3.6 1.2 7.2-.6 8-3.6.8-2.8-1.2-5.2-3.6-4.8-2.2.4-3.2 2.6-1.8 4.2 1.2 1.4 3.4.8 3.6-.9" />
    </g>
  ),
  // Скакалка — петля троса и две ручки сверху
  rope: (
    <g>
      <path d="M6.6 4.6v2.8" />
      <path d="M17.4 4.6v2.8" />
      <path d="M6.6 7.4c-3 4.6-1.3 11.8 5.4 11.8s8.4-7.2 5.4-11.8" />
    </g>
  ),
  // Для тренировок — знак RG в рамке, как на чёрной флешке партии
  training: (
    <g>
      <rect x="2.6" y="6.4" width="18.8" height="11.2" rx="3.4" />
      <path d="M7.4 15V9.4h2.2a1.7 1.7 0 0 1 0 3.4H7.4" />
      <path d="m9.7 12.8 2 2.2" />
      <path d="M17.4 10.6a2.8 2.8 0 1 0 .3 3.6v-1.5h-1.6" />
    </g>
  ),
};

export function ApparatusIcon({
  id,
  className,
  strokeWidth = 1.75,
}: {
  id: string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[id] ?? shapes.bp}
    </svg>
  );
}

/** Та же группа без обёртки — для встраивания в SVG флешки. */
export function apparatusShape(id: string) {
  return shapes[id] ?? shapes.bp;
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function Cross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Minus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 12h12" />
    </svg>
  );
}

export function Plus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 12h12M12 6v12" />
    </svg>
  );
}

/** Два прямоугольника внахлёст: копия позиции. */
export function Copy({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14" />
    </svg>
  );
}

export function Bag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 7.5h15l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H7.2a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M8.6 10V6.4a3.4 3.4 0 0 1 6.8 0V10" />
    </svg>
  );
}
