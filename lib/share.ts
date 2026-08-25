import type { CartItem } from "@/lib/cart";
import {
  APPARATUS,
  COLORS,
  CUSTOM_COLOR,
  FONTS,
  SPEC,
  isHex,
} from "@/lib/site";

/**
 * Ссылка на собранный заказ.
 *
 * Сервера у сайта нет: корзина живёт в `localStorage` того браузера,
 * где её собрали. Значит, короткой ссылки вида «/o/7f3a» быть не может —
 * по такому адресу серверу нечего было бы отдать. Заказ едет внутри
 * самой ссылки, а браузер на той стороне разбирает его обратно.
 *
 * Формат намеренно позиционный, без имён полей: `{"colorId":"violet"}`
 * в адресной строке — это двадцать символов на то, что помещается
 * в один. Первое число — версия: старые ссылки не должны ломаться,
 * когда формат изменится.
 */
const VERSION = 1;

/** Дальше этого адрес перестаёт открываться частью почтовых клиентов. */
export const MAX_LINK = 1800;

type Tuple = (string | number)[];

const b64url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const unb64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(
    Uint8Array.from(bin, (c) => c.charCodeAt(0)),
  );
};

export function encodeOrder(items: CartItem[]): string {
  const tuples: Tuple[] = items.map((it) => {
    const c = COLORS.findIndex((x) => x.id === it.colorId);
    const a = APPARATUS.findIndex((x) => x.id === it.apparatusId);
    const f = Math.max(
      0,
      FONTS.findIndex((x) => x.id === it.fontId),
    );
    const base: Tuple = [c, a, f, ...it.lines, it.qty];
    // свой оттенок — единственное, что не сводится к номеру в палитре
    return c === -1 && isHex(it.customHex) ? [...base, it.customHex] : base;
  });
  return b64url(JSON.stringify([VERSION, tuples]));
}

/**
 * Разбор с проверкой каждого поля. Ссылку может прислать кто угодно
 * и она могла пролежать в переписке полгода: за это время у заказчика
 * мог поменяться список цветов или предметов. Позиция, которую нечем
 * изготовить, в корзину не попадает — лучше потерять строку, чем
 * отправить в работу то, чего в производстве нет.
 */
export function decodeOrder(code: string): Omit<CartItem, "id">[] | null {
  try {
    const parsed: unknown = JSON.parse(unb64url(code));
    if (!Array.isArray(parsed) || parsed[0] !== VERSION) return null;
    const rows = parsed[1];
    if (!Array.isArray(rows) || !rows.length) return null;

    const items = rows.flatMap((row): Omit<CartItem, "id">[] => {
      if (!Array.isArray(row) || row.length < 7) return [];
      const [c, a, f, l1, l2, l3, q, hex] = row as (string | number)[];
      if (typeof c !== "number" || typeof a !== "number") return [];
      if (typeof f !== "number" || !FONTS[f]) return [];

      const custom = c === -1 && isHex(hex as string) ? (hex as string) : null;
      if (c !== -1 && !COLORS[c]) return [];
      if (c === -1 && !custom) return [];

      if (a !== -1 && !APPARATUS[a]) return [];
      const lines = [l1, l2, l3];
      if (!lines.every((l) => typeof l === "string")) return [];
      if (lines.some((l) => (l as string).length > SPEC.charsPerLine)) return [];
      if (!(l1 as string).trim()) return [];

      const qty = typeof q === "number" ? Math.round(q) : 0;
      if (!(qty >= 1 && qty <= 99)) return [];

      return [
        {
          colorId: custom ? CUSTOM_COLOR : COLORS[c].id,
          ...(custom ? { customHex: custom } : {}),
          apparatusId: a === -1 ? null : APPARATUS[a].id,
          fontId: FONTS[f].id,
          lines: lines as [string, string, string],
          qty,
        },
      ];
    });

    return items.length ? items : null;
  } catch {
    return null;
  }
}

/** Полный адрес для отправки. Пустой заказ ссылки не заслуживает. */
export function orderLink(items: CartItem[], origin: string): string | null {
  if (!items.length) return null;
  const url = `${origin}/cart?z=${encodeOrder(items)}`;
  return url.length > MAX_LINK ? null : url;
}

/* ——— Присланный заказ ———————————————————————————————————————————————
 *
 * Адрес читается один раз за загрузку и тут же вычищается: обновление
 * страницы не должно открывать присланный заказ второй раз. Хранилище
 * здесь то же по устройству, что у корзины, — `useSyncExternalStore`
 * вместо чтения в эффекте: состояние, посчитанное при первом рендере,
 * не заставляет React рисовать страницу дважды.
 */
let incoming: Omit<CartItem, "id">[] | null | undefined;
let broken = false;
const listeners = new Set<() => void>();

function readIncoming() {
  try {
    const code = new URLSearchParams(location.search).get("z");
    if (!code) return null;
    history.replaceState(null, "", location.pathname);
    const order = decodeOrder(code);
    broken = order === null;
    return order;
  } catch {
    return null;
  }
}

export function subscribeIncoming(listener: () => void) {
  listeners.add(listener);
  // Читаем после подписки и будим слушателей отдельным тактом: снимок
  // React спрашивает раньше, чем подписывается, и значение, положенное
  // молча, осталось бы непоказанным до следующей перерисовки.
  if (incoming === undefined) {
    incoming = readIncoming();
    queueMicrotask(() => listeners.forEach((l) => l()));
  }
  return () => listeners.delete(listener);
}

export const incomingSnapshot = () => incoming ?? null;
/** На сервере присланного заказа нет и быть не может: адрес читает браузер. */
export const incomingServerSnapshot = () => null;
/** Ссылка была, но не разобралась, — об этом стоит сказать словом. */
export const incomingBroken = () => broken;

export function clearIncoming() {
  incoming = null;
  broken = false;
  listeners.forEach((l) => l());
}
