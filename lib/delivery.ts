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

/**
 * Способ получения — правка заказчика от 08.10 (корзина): СДЭК или
 * самовывоз. При СДЭК выбирают вид доставки и вводят её данные; расчёт
 * становится доступен, когда данные заполнены.
 */
export type DeliveryMethod = "cdek" | "pickup";
export type CdekType = "pvz" | "postamat" | "door";

export type Delivery = {
  method: DeliveryMethod;
  cdekType: CdekType;
  city: string;
  /** адрес или код пункта выдачи / постамата */
  point: string;
  /** улица, дом, квартира — для курьера */
  address: string;
};

export const CDEK_TYPES: { id: CdekType; label: string }[] = [
  { id: "pvz", label: "До пункта выдачи" },
  { id: "postamat", label: "До постамата" },
  { id: "door", label: "Курьером до двери" },
];

/** Карта пунктов выдачи СДЭК — найти свой пункт и его адрес. */
export const CDEK_MAP = "https://www.cdek.ru/ru/offices";

/**
 * Самовывоз — пункт выдачи СДЭК, адрес от заказчика (08.10). У заказчика
 * «ул. Р.Зорго» — описка: в Ростове-на-Дону улица Зорге (Рихарда Зорге),
 * по ней и ищет карта.
 */
const PICKUP_QUERY = "Ростов-на-Дону, улица Зорге, 58";

export const PICKUP = {
  name: "Пункт выдачи СДЭК",
  // неразрывные пробелы: «д.» и номер не расходятся по строкам
  address: "г.\u00a0Ростов-на-Дону, ул.\u00a0Р.\u00a0Зорге, д.\u00a058",
  /** открыть в Google Картах — на телефоне откроется приложение */
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PICKUP_QUERY)}`,
  /** встроенная карта: без ключа API, обычной ссылкой Google, по-русски */
  embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(PICKUP_QUERY)}&z=16&hl=ru&output=embed`,
};

export const PICKUP_ADDRESS: string | null = `${PICKUP.name}: ${PICKUP.address}`;

export const EMPTY_DELIVERY: Delivery = {
  method: "cdek",
  cdekType: "pvz",
  city: "",
  point: "",
  address: "",
};

/** Данных хватает для расчёта: город и пункт или адрес — по виду доставки. */
export function deliveryReady(d: Delivery): boolean {
  if (d.method !== "cdek") return false;
  const куда = d.cdekType === "door" ? d.address : d.point;
  return Boolean(d.city.trim() && куда.trim());
}

/** Строка для накладной: как и куда едет заказ. */
export function describeDelivery(d: Delivery): string {
  if (d.method === "pickup") {
    return `Самовывоз: ${PICKUP_ADDRESS ?? "Ростов-на-Дону, адрес уточняется"}`;
  }
  const вид = CDEK_TYPES.find((t) => t.id === d.cdekType)?.label.toLowerCase();
  const куда = d.cdekType === "door" ? d.address : d.point;
  return `СДЭК, ${вид}: ${d.city}, ${куда}`;
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
