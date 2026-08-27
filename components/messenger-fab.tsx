"use client";

import { useEffect, useRef, useState } from "react";

import { Chat, Cross, Send } from "@/components/icons";
import { MESSENGERS } from "@/lib/site";

const ICON: Record<string, typeof Send> = { telegram: Send, max: Chat };

/**
 * Постоянный переход в мессенджер.
 *
 * На широком экране мессенджеры стоят в шапке, а шапка липкая — они
 * и так под рукой на любой прокрутке. На телефоне в строку 390 px
 * логотип, значки, корзина и бургер не помещаются, поэтому здесь
 * отдельная кнопка в углу: она не зависит от того, где человек
 * находится на странице.
 *
 * Угол правый нижний — там его ищет большой палец, и там он не спорит
 * с липкой панелью конструктора, которая живёт под шапкой сверху.
 * Ниже сидит на системном отступе (`safe-area`), иначе на айфоне
 * кнопка встаёт на полосу жестов.
 */
export function MessengerFab() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const живые = MESSENGERS.filter((m) => m.href);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onTap = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onTap);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onTap);
    };
  }, [open]);

  // ни одной ссылки — кнопке некуда вести, и висеть в углу ей незачем
  if (!живые.length) return null;

  const один = живые.length === 1 ? живые[0] : null;
  const Значок = один ? (ICON[один.id] ?? Chat) : Chat;

  return (
    <div
      ref={box}
      className="no-print fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-2 md:hidden"
    >
      {/* раскрытый список: нужен, только когда мессенджеров несколько */}
      {open && !один
        ? живые.map((m) => {
            const I = ICON[m.id] ?? Chat;
            return (
              <a
                key={m.id}
                href={m.href!}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center gap-2 rounded-pill border border-hairline bg-paper px-4 text-[0.8125rem] font-medium shadow-[0_10px_24px_rgba(17,17,16,0.12)]"
              >
                <I className="size-4" />
                {m.label}
              </a>
            );
          })
        : null}

      {один ? (
        <a
          href={один.href!}
          target="_blank"
          rel="noreferrer"
          aria-label={`Написать в ${один.label}`}
          className="grid size-13 place-items-center rounded-pill bg-ink text-paper shadow-[0_12px_28px_rgba(17,17,16,0.28)] transition-transform duration-150 active:scale-95"
        >
          <Значок className="size-5" />
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Закрыть список мессенджеров" : "Написать нам"}
          className="grid size-13 cursor-pointer place-items-center rounded-pill bg-ink text-paper shadow-[0_12px_28px_rgba(17,17,16,0.28)] transition-transform duration-150 active:scale-95"
        >
          {open ? <Cross className="size-5" /> : <Значок className="size-5" />}
        </button>
      )}
    </div>
  );
}
