import РАЗМЕРЫ from "@/lib/logos.json";

/**
 * Базы логотипов для оборота — у каждого вида флешек своя, как и база
 * пиктограмм: конструкторы одинаковые, различаются только картинки
 * (правка заказчика от 08.10). Картинка встаёт по центру зоны 28 × 15 мм
 * («расположение по центру данной области» — файл заказчика).
 *
 * Пока в базах четыре образца из того же файла, разложенные по смыслу:
 * клубы — гимнастике, школа — учёбе, город — подарку. Нарисованы
 * в натуральную величину, поэтому размер на металле — размер из файла
 * (`logos.json`, собирает `scripts/prepare-signs.py`). Подразделы
 * назвали мы — по самим картинкам.
 * TODO(client): базы логотипов для каждого вида с разбивкой на подразделы.
 */
export type Logo = { id: string; label: string };
type LogoBase = { label: string; items: Logo[] }[];

export const LOGO_BASES: Record<string, LogoBase> = {
  gymnastics: [
    {
      label: "Спортивные клубы",
      items: [
        { id: "diamond", label: "СК DiaMond" },
        { id: "trudovye-rezervy", label: "Трудовые резервы" },
      ],
    },
  ],
  study: [{ label: "Школы", items: [{ id: "kinder-study", label: "Kinder Study" }] }],
  gift: [{ label: "Города", items: [{ id: "moscow", label: "Москва" }] }],
};

// групповая программа и другие виды спорта — пока с базой клубов,
// как у личной программы
export const logoBase = (base: string): LogoBase =>
  LOGO_BASES[base] ?? LOGO_BASES.gymnastics;

/**
 * Все логотипы всех баз — для подписей и проверки сохранённого.
 * Порядок — как в ссылках «поделиться» третьей версии: логотип там
 * хранится номером.
 */
const ВСЕ: Logo[] = ["gymnastics", "study", "gift"].flatMap((b) =>
  LOGO_BASES[b].flatMap((c) => c.items),
);
const МЕСТА: Record<string, { w: number; h: number }> = РАЗМЕРЫ;

export const isLogo = (id: unknown): id is string =>
  typeof id === "string" && ВСЕ.some((l) => l.id === id);

export const logoLabel = (id: string | null | undefined) =>
  ВСЕ.find((l) => l.id === id)?.label ?? null;

/** Растр для металла, вектор для окна выбора и размер на металле, мм. */
export const logoArt = (id: string | null | undefined) =>
  id && МЕСТА[id]
    ? {
        png: `/logos/${id}.png`,
        svg: `/logos/${id}.svg`,
        w: МЕСТА[id].w,
        h: МЕСТА[id].h,
      }
    : null;

/** Порядковый номер в базе — для короткой ссылки «поделиться». */
export const logoIndex = (id: string | null | undefined) =>
  ВСЕ.findIndex((l) => l.id === id);
export const logoAt = (i: unknown) =>
  typeof i === "number" && ВСЕ[i] ? ВСЕ[i].id : null;
