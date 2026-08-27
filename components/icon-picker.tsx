"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { ApparatusIcon, Cross } from "@/components/icons";
import { ICON_BASES } from "@/lib/site";

/**
 * Выбор пиктограммы — всплывающим окном, как требует чертёж.
 *
 * Строкой чипсов это не сделать: у подарка и учёбы базы разбиты
 * на категории, а знаков в них будет не семь, а десятки. Окно даёт
 * им место и не растит панель настроек.
 *
 * Пока окно открыто, остальная страница выключена через `inert`:
 * это и обход с клавиатуры, и чтение с экрана, и ловушку фокуса
 * писать не нужно.
 *
 * Окно уходит порталом в `body`, и обе причины серьёзные. Появление
 * разделов идёт анимацией прозрачности, а она заводит свой слой —
 * внутри него никакой `z-index` не поднимет окно над шапкой. И `inert`
 * гасит соседей окна по `body`: пока окно лежало внутри страницы,
 * гасился и родитель окна, то есть само окно.
 */
export function IconPicker({
  base,
  value,
  onPick,
  onClose,
}: {
  /** какая база: ключ из ICON_BASES */
  base: string;
  value: string | null;
  onPick: (id: string | null) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const данные = ICON_BASES[base] ?? ICON_BASES.gymnastics;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const behind = [...document.body.children].filter(
      (el) => el.id !== "icon-picker",
    );
    behind.forEach((el) => el.setAttribute("inert", ""));
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [onClose]);

  const выбрать = (id: string | null) => {
    onPick(id);
    onClose();
  };

  return createPortal(
    <div
      id="icon-picker"
      role="dialog"
      aria-modal="true"
      aria-label={`Знак вида: ${данные.label}`}
      className="fixed inset-x-0 top-0 z-70 flex h-[100dvh] flex-col bg-paper"
    >
      <div className="shell flex h-16 shrink-0 items-center justify-between border-b border-hairline">
        <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
          Знак вида · {данные.label}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Закрыть выбор знака"
          className="grid size-10 cursor-pointer place-items-center rounded-pill border border-hairline transition-colors duration-150 hover:border-ink/40"
        >
          <Cross className="size-4" />
        </button>
      </div>

      <div className="shell min-h-0 flex-1 overflow-y-auto overscroll-contain py-8">
        {/* «Без знака» стоит первым и всегда: чертёж требует вариант
            с пиктограммой и без в каждом конструкторе */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Плитка
            выбран={value === null}
            onClick={() => выбрать(null)}
            подпись="Без знака"
          >
            <Cross className="size-7 text-ink/45" />
          </Плитка>
        </div>

        {данные.categories.map((c) => (
          <section key={c.label} className="mt-9 first:mt-6">
            <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
              {c.label}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {c.items.map((a) => (
                <li key={a.id}>
                  <Плитка
                    выбран={value === a.id}
                    onClick={() => выбрать(a.id)}
                    подпись={a.label}
                  >
                    <ApparatusIcon id={a.id} className="size-7" />
                  </Плитка>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {данные.categories.length === 0 ? (
          <p className="mt-8 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink/65">
            База знаков для этого вида флешек ещё не собрана — заказчик
            присылает файлы и разбивку по категориям. Пока доступен
            вариант без знака: три строки занимают всю пластину.
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function Плитка({
  выбран,
  onClick,
  подпись,
  children,
}: {
  выбран: boolean;
  onClick: () => void;
  подпись: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={выбран}
      className={`grid w-full cursor-pointer place-items-center gap-2 rounded-card border px-4 py-6 transition-colors duration-300 ${
        выбран
          ? "border-ink"
          : "border-hairline text-ink/70 hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
      <span className="text-[0.8125rem]">{подпись}</span>
    </button>
  );
}

