"use client";

import { useSyncExternalStore } from "react";

import {
  APPARATUS,
  COLORS,
  CUSTOM_COLOR,
  DEFAULT_COLOR_FOR,
  FONTS,
  isHex,
} from "@/lib/site";

/**
 * Флешки, которые человек собирает прямо сейчас. Их может быть несколько:
 * у гимнастки на сезон нужен комплект, и у каждой позиции своя надпись,
 * свой предмет и свой цвет.
 *
 * Собранное переживает перезагрузку: комплект на семь предметов набирается
 * не за минуту, и потерять его из-за случайно закрытой вкладки нельзя.
 * Хранится там же, где корзина, — в `localStorage` этого браузера; на сервер
 * ничего не уходит, пока человек не отправит заявку.
 */

export type Item = {
  id: string;
  lines: [string, string, string];
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

const KEY = "gym-flash-engraving";

let seq = 0;
const blank = (
  apparatusId = "hoop",
  lines?: Item["lines"],
  fontId = FONTS[0].id,
): Item => ({
  id: `d${++seq}`,
  lines: lines ? ([...lines] as Item["lines"]) : ["", "", ""],
  colorId: DEFAULT_COLOR_FOR[apparatusId],
  apparatusId,
  fontId,
});

const first = (): Item => ({
  id: "d0",
  lines: ["", "", ""],
  colorId: "red",
  apparatusId: "hoop",
  fontId: FONTS[0].id,
});

/** Снимок для сервера: один и тот же объект, иначе React зациклит рендер. */
const initial: State = { items: [first()], trash: null };

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
    if (!Array.isArray(parsed)) return [first()];

    const items = parsed.flatMap((it): Item[] => {
      if (!it || typeof it !== "object") return [];
      const { id, lines, colorId, customHex, apparatusId, fontId } =
        it as Record<string, unknown>;
      if (typeof id !== "string") return [];
      const withIcon = apparatusId === null || APPARATUS.some((a) => a.id === apparatusId);
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
      return [
        {
          id,
          lines: lines as Item["lines"],
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

    if (!items.length) return [first()];
    // счётчик продолжаем с наибольшего номера, а не с длины: после удалений
    // в списке остаются дыры, и по длине новый идентификатор совпал бы
    // с уже занятым
    seq = items.reduce((m, it) => Math.max(m, Number(it.id.slice(1)) || 0), 0);
    return items;
  } catch {
    return [first()];
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

export function useEngraving() {
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

export function setLine(id: string, i: number, value: string, max: number) {
  const item = state.items.find((it) => it.id === id);
  if (!item) return;
  const lines = [...item.lines] as Item["lines"];
  lines[i] = value.slice(0, max);
  patch(id, { lines });
}

export function setColor(id: string, colorId: string) {
  patch(id, { colorId, customHex: undefined });
}

/** Свой оттенок: подменяет и выбор из палитры, и подстановку под предмет. */
export function setCustomColor(id: string, hex: string) {
  if (!isHex(hex)) return;
  patch(id, { colorId: CUSTOM_COLOR, customHex: hex });
}

export function setFont(id: string, fontId: string) {
  patch(id, { fontId });
}

/**
 * Предмет тянет за собой свой цвет — как в комплекте на фотографии.
 *
 * `withColor: false` — когда предмет листают тычком по знаку на металле:
 * там человек перебирает знаки, а не подбирает цвет, и подмена корпуса
 * под каждым нажатием сбивает уже выбранный оттенок.
 */
export function setApparatus(
  id: string,
  apparatusId: string | null,
  withColor = true,
) {
  // у «без знака» своего цвета нет — оставляем выбранный
  patch(
    id,
    withColor && apparatusId
      ? { apparatusId, colorId: DEFAULT_COLOR_FOR[apparatusId] }
      : { apparatusId },
  );
}

/**
 * Следующая флешка наследует надпись: гимнастка одна, предметов много.
 * Возвращает идентификатор — конструктор сразу открывает новую позицию,
 * иначе после нажатия ничего заметного не происходит.
 */
export function addItem(): string {
  const last = state.items[state.items.length - 1];
  const taken = new Set(state.items.map((it) => it.apparatusId));
  const next = APPARATUS.find((a) => !taken.has(a.id)) ?? APPARATUS[0];
  const made = blank(next.id, last?.lines, last?.fontId);
  commit([...state.items, made]);
  return made.id;
}

/**
 * Копия позиции встаёт сразу за оригиналом: у второй дочери те же предметы
 * и другое имя — быстрее поправить одну строку, чем собирать заново.
 */
export function duplicateItem(id: string): string {
  const at = state.items.findIndex((it) => it.id === id);
  if (at < 0) return id;
  const src = state.items[at];
  const copy: Item = { ...src, id: `d${++seq}`, lines: [...src.lines] };
  const next = [...state.items];
  next.splice(at + 1, 0, copy);
  commit(next);
  return copy.id;
}

/** Удаление обратимо: позиция уходит в корзину отмены вместе со своим местом. */
export function removeItem(id: string) {
  if (state.items.length < 2) return;
  const at = state.items.findIndex((it) => it.id === id);
  if (at < 0) return;
  commit(
    state.items.filter((it) => it.id !== id),
    { item: state.items[at], at },
  );
}

export function undoRemove(): string | null {
  const trash = state.trash;
  if (!trash) return null;
  const next = [...state.items];
  next.splice(Math.min(trash.at, next.length), 0, trash.item);
  commit(next, null);
  return trash.item.id;
}

export function forgetRemoved() {
  if (state.trash) commit(state.items, null);
}

/** Начать заново: одна пустая позиция. */
export function resetEngraving() {
  commit([blank()], null);
}
