/**
 * Доставка и накладная.
 *
 * Тариф СДЭК считается по весу, габаритам и паре городов. Вес одной флешки
 * и договор со службой нам не давали, поэтому здесь стоит механизм, а не
 * выдуманные цифры: как только заказчик пришлёт вес и ключ API, расчёт
 * оживёт правкой одной таблицы — разметку и вызовы трогать не придётся.
 */

/** TODO(client): вес одной флешки с подвеской, граммы. */
export const DRIVE_WEIGHT_G: number | null = null;

/** TODO(client): вес упаковки, граммы. */
export const PACKAGE_WEIGHT_G: number | null = null;

/**
 * TODO(client): тарифы СДЭК. Ключ — город получателя, значение — рубли
 * за отправление до 500 г. Пока таблица пуста, расчёт честно отвечает,
 * что тарифа нет.
 */
export const TARIFFS: Record<string, number> = {};

export type Quote =
  | { ok: true; rub: number; grams: number }
  | { ok: false; reason: string; grams: number | null };

/** Вес отправления: флешки плюс упаковка. Null, пока веса не дали. */
export function weightOf(count: number): number | null {
  if (DRIVE_WEIGHT_G === null || PACKAGE_WEIGHT_G === null) return null;
  return DRIVE_WEIGHT_G * count + PACKAGE_WEIGHT_G;
}

/** Стоимость доставки. Пока нет договора и тарифов — отвечает почему. */
export function quote(city: string, count: number): Quote {
  const grams = weightOf(count);
  if (grams === null)
    return { ok: false, reason: "вес флешки уточняется", grams: null };

  const rub = TARIFFS[city.trim().toLowerCase()];
  if (rub === undefined)
    return { ok: false, reason: "тариф на этот город уточняется", grams };

  return { ok: true, rub, grams };
}

/** Номер накладной: PF-ГГММДД-NN, счётчик за день живёт в браузере. */
export function invoiceNumber(now: Date): string {
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const day = `${y}${m}${d}`;

  let n = 1;
  try {
    const raw = localStorage.getItem("gym-flash-invoice");
    const saved = raw ? JSON.parse(raw) : null;
    n = saved?.day === day ? saved.n + 1 : 1;
    localStorage.setItem("gym-flash-invoice", JSON.stringify({ day, n }));
  } catch {
    // приватный режим — номер начнётся заново, это не ошибка
  }

  return `PF-${day}-${String(n).padStart(2, "0")}`;
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
