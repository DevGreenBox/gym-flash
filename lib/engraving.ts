"use client";

import { useSyncExternalStore } from "react";

import {
  ALL_SIGNS,
  COLORS,
  CUSTOM_COLOR,
  DEFAULT_COLOR_FOR,
  FONTS,
  ICON_BASES,
  isHex,
} from "@/lib/site";
import { isLogo } from "@/lib/logos";

/**
 * Флешки, которые человек собирает прямо сейчас. Их может быть несколько:
 * у гимнастки на сезон нужен комплект, и у каждой позиции своя надпись,
 * свой предмет и свой цвет.
 *
 * Собранное переживает перезагрузку: комплект на семь предметов набирается
 * не за минуту, и потерять его из-за случайно закрытой вкладки нельзя.
 * Хранится там же, где корзина, — в `localStorage` этого браузера; на сервер
 * ничего не уходит, пока человек не отправит заявку.
 *
 * Набор у каждого вида флешек свой (правка заказчика от 08.10: конструкторы
 * одинаковые, различаются только базы картинок). Флешка для учёбы не должна
 * появляться в гимнастическом комплекте с обручем на лицевой — и наоборот.
 * Гимнастика живёт под прежним ключом, поэтому собранные до правки
 * комплекты не теряются; учёба и подарок начинают с чистого листа.
 */

export type Item = {
  id: string;
  lines: [string, string, string];
  /**
   * Оборотная сторона: чертёж требует гравировку в одну, две или три
   * строки в зоне 28 × 15 мм. Пустые строки в раскладке не участвуют,
   * как и на лицевой.
   */
  back: [string, string, string];
  /**
   * Логотип на обороте — из базы, по центру зоны 28 × 15 мм. Зона одна
   * на надпись и логотип, поэтому выбранный логотип встаёт вместо
   * надписи; строки при этом не стираются — убрал логотип, надпись
   * вернулась.
   */
  backLogo: string | null;
  colorId: string;
  /** свой оттенок вне палитры; значим только при colorId === CUSTOM_COLOR */
  customHex?: string;
  /** null — гравировка без знака: три строки на всю пластину */
  apparatusId: string | null;
  fontId: string;
};

/** Убранная позиция ждёт здесь: удаление должно быть обратимым. */
type Trash = { item: Item; at: number };

type State = { items: Item[]; trash: Trash | null };

/** Гимнастика — под прежним ключом: её комплекты собраны до правки. */
const ключ = (base: string) =>
  base === "gymnastics" ? "gym-flash-engraving" : `gym-flash-engraving-${base}`;

function создать(base: string) {
  const KEY = ключ(base);
  const старт = (ICON_BASES[base] ?? ICON_BASES.gymnastics).start;

  let seq = 0;
  const чистая = (id = `d${++seq}`): Item => ({
    id,
    lines: ["", "", ""],
    back: ["", "", ""],
    backLogo: null,
    colorId: старт.colorId,
    apparatusId: старт.apparatusId,
    fontId: FONTS[0].id,
  });

  /** Снимок для сервера: один и тот же объект, иначе React зациклит рендер. */
  const initial: State = { items: [чистая("d0")], trash: null };

  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  /**
   * Чтение с проверкой: в хранилище мог остаться комплект, собранный до того,
   * как заказчик поменял список предметов или цветов. Позиции с неизвестными
   * значениями не показываем — лучше начать с чистой, чем гравировать то,
   * чего в производстве нет.
   */
  function read(): Item[] {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(parsed)) return [чистая("d0")];

      const items = parsed.flatMap((it): Item[] => {
        if (!it || typeof it !== "object") return [];
        const { id, lines, colorId, customHex, apparatusId, fontId } =
          it as Record<string, unknown>;
        if (typeof id !== "string") return [];
        const withIcon =
          apparatusId === null || ALL_SIGNS.some((a) => a.id === apparatusId);
        if (!withIcon) return [];
        // свой оттенок принимаем только вместе с разобранным HEX: «custom»
        // без цвета — это позиция без цвета вообще
        const custom =
          colorId === CUSTOM_COLOR && isHex(customHex as string)
            ? (customHex as string)
            : undefined;
        if (!custom && !COLORS.some((c) => c.id === colorId)) return [];
        if (!Array.isArray(lines) || lines.length !== 3) return [];
        if (!lines.every((l) => typeof l === "string")) return [];
        const back = Array.isArray((it as Record<string, unknown>).back)
          ? ((it as Record<string, unknown>).back as unknown[])
          : [];
        return [
          {
            id,
            lines: lines as Item["lines"],
            // оборот появился позже: у наборов, собранных до него, поля нет
            back: [0, 1, 2].map((i) =>
              typeof back[i] === "string" ? (back[i] as string) : "",
            ) as Item["lines"],
            // логотип оборота появился позже: у старых наборов его нет
            backLogo: isLogo((it as Record<string, unknown>).backLogo)
              ? ((it as Record<string, unknown>).backLogo as string)
              : null,
            colorId: colorId as string,
            ...(custom ? { customHex: custom } : {}),
            apparatusId: apparatusId as string | null,
            // гарнитура появилась позже цвета и предмета: у комплектов,
            // собранных до неё, поля просто нет — ставим ту, что была
            fontId: FONTS.some((f) => f.id === fontId)
              ? (fontId as string)
              : FONTS[0].id,
          },
        ];
      });

      if (!items.length) return [чистая("d0")];
      // счётчик продолжаем с наибольшего номера, а не с длины: после удалений
      // в списке остаются дыры, и по длине новый идентификатор совпал бы
      // с уже занятым
      seq = items.reduce((m, it) => Math.max(m, Number(it.id.slice(1)) || 0), 0);
      return items;
    } catch {
      return [чистая("d0")];
    }
  }

  function write(items: Item[]) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // приватный режим или переполнение — комплект живёт до перезагрузки
    }
  }

  function subscribe(listener: () => void) {
    if (!loaded) {
      loaded = true;
      state = { items: read(), trash: null };
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useEngraving() {
    return useSyncExternalStore(
      subscribe,
      () => state,
      () => initial,
    );
  }

  function commit(items: Item[], trash: Trash | null = state.trash) {
    state = { items, trash };
    write(items);
    listeners.forEach((l) => l());
  }

  const patch = (id: string, next: Partial<Item>) =>
    commit(state.items.map((it) => (it.id === id ? { ...it, ...next } : it)));

  return {
    useEngraving,

    setLine(id: string, i: number, value: string, max: number) {
      const item = state.items.find((it) => it.id === id);
      if (!item) return;
      const lines = [...item.lines] as Item["lines"];
      lines[i] = value.slice(0, max);
      patch(id, { lines });
    },

    /** Логотип оборота: `null` — без логотипа, на обороте надпись. */
    setBackLogo(id: string, backLogo: string | null) {
      patch(id, { backLogo });
    },

    /** Строка оборота правится так же, как лицевая: по одной. */
    setBackLine(id: string, i: number, value: string, max: number) {
      const it = state.items.find((x) => x.id === id);
      if (!it) return;
      const back = [...it.back] as Item["back"];
      back[i] = value.slice(0, max);
      patch(id, { back });
    },

    setColor(id: string, colorId: string) {
      patch(id, { colorId, customHex: undefined });
    },

    /** Свой оттенок: подменяет и выбор из палитры, и подстановку под предмет. */
    setCustomColor(id: string, hex: string) {
      if (!isHex(hex)) return;
      patch(id, { colorId: CUSTOM_COLOR, customHex: hex });
    },

    setFont(id: string, fontId: string) {
      patch(id, { fontId });
    },

    /**
     * Предмет тянет за собой свой цвет — как в комплекте на фотографии.
     * Цвет «свой» есть только у предметов гимнастики; у знаков учёбы
     * и подарка его нет, там выбранный цвет остаётся.
     *
     * `withColor: false` — когда предмет листают тычком по знаку на металле:
     * там человек перебирает знаки, а не подбирает цвет, и подмена корпуса
     * под каждым нажатием сбивает уже выбранный оттенок.
     */
    setApparatus(id: string, apparatusId: string | null, withColor = true) {
      const цвет = apparatusId ? DEFAULT_COLOR_FOR[apparatusId] : undefined;
      patch(
        id,
        withColor && цвет ? { apparatusId, colorId: цвет } : { apparatusId },
      );
    },

    /**
     * «+» в ленте — копия предыдущей флешки, со всем, что на ней настроено,
     * включая оборот (правка заказчика от 08.10; отдельной кнопки
     * «Дублировать» больше нет). Копия встаёт в конец ленты, рядом с «+».
     * Возвращает идентификатор — конструктор сразу открывает новую позицию,
     * иначе после нажатия ничего заметного не происходит.
     */
    addItem(): string {
      const last = state.items[state.items.length - 1];
      const copy: Item = {
        ...last,
        id: `d${++seq}`,
        lines: [...last.lines],
        back: [...last.back],
      };
      commit([...state.items, copy]);
      return copy.id;
    },

    /** Удаление обратимо: позиция уходит в корзину отмены вместе со своим местом. */
    removeItem(id: string) {
      if (state.items.length < 2) return;
      const at = state.items.findIndex((it) => it.id === id);
      if (at < 0) return;
      commit(
        state.items.filter((it) => it.id !== id),
        { item: state.items[at], at },
      );
    },

    undoRemove(): string | null {
      const trash = state.trash;
      if (!trash) return null;
      const next = [...state.items];
      next.splice(Math.min(trash.at, next.length), 0, trash.item);
      commit(next, null);
      return trash.item.id;
    },

    forgetRemoved() {
      if (state.trash) commit(state.items, null);
    },

    /** Начать заново: одна пустая позиция. */
    resetEngraving() {
      commit([чистая()], null);
    },

    /**
     * Открыть сборку, присланную ссылкой. Номера позиций выдаются заново:
     * они уникальны внутри этого браузера, а не внутри ссылки, и чужие
     * пересеклись бы с уже существующими.
     */
    replaceItems(items: Omit<Item, "id">[]) {
      if (!items.length) return;
      commit(
        items.map((it) => ({ ...it, id: `d${++seq}` })),
        null,
      );
    },
  };
}

export type EngravingStore = ReturnType<typeof создать>;

const хранилища = new Map<string, EngravingStore>();

/** Набор флешек одного вида — один и тот же объект на всё время жизни вкладки. */
export function engraving(base: string): EngravingStore {
  let store = хранилища.get(base);
  if (!store) {
    store = создать(base);
    хранилища.set(base, store);
  }
  return store;
}
