/**
 * Что показывает флешка, пока не тронули ни одного поля. Пример — с чертежа
 * заказчика, в заказ он не подставляется.
 *
 * Как только человек вписал хоть строку, пример исчезает целиком: чужие имя
 * и год рядом со своей фамилией — не подсказка, а мусор на гравировке.
 * Пустая строка остаётся пустой, и такой же уходит в корзину.
 */
export const FALLBACK = ["Иванова", "Амелия", "2017"] as const;

export type Lines = [string, string, string];

export const isUntouched = (lines: readonly string[]) =>
  lines.every((l) => !l.trim());

export const shownLines = (lines: readonly string[]): Lines =>
  isUntouched(lines)
    ? [...FALLBACK]
    : [lines[0] ?? "", lines[1] ?? "", lines[2] ?? ""];
