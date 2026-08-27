"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Copy, Cross } from "@/components/icons";
import type { Item } from "@/lib/engraving";
import { replaceItems } from "@/lib/engraving";
import { FONTS } from "@/lib/site";
import {
  clearDraft,
  draftLink,
  draftSnapshot,
  incomingServerSnapshot,
  subscribeDraft,
} from "@/lib/share";

/**
 * Передача незавершённой сборки.
 *
 * Корзина уже уезжает ссылкой, но до корзины дело доходит не всегда:
 * тренер набирает комплект на группу и хочет показать его родителям
 * до того, как что-то заказано. Здесь та же ссылка, только адресом
 * остаётся конструктор, а не корзина.
 *
 * Само сохранение делать не нужно — сборка и так лежит в `localStorage`
 * и переживает закрытие вкладки. Ссылка нужна, чтобы переложить её
 * в чужой браузер.
 */
export function ShareDraft({ items }: { items: Item[] }) {
  const path = usePathname();
  const [state, setState] = useState<"idle" | "done" | "long">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2600);
    return () => clearTimeout(t);
  }, [state]);

  // сборка без единой фамилии — ещё не сборка, показывать нечего
  const готово = items.some((it) => it.lines[0].trim());

  const share = async () => {
    const url = draftLink(items, location.origin, path);
    if (!url) return setState("long");
    try {
      await navigator.clipboard.writeText(url);
      setState("done");
    } catch {
      setState("long");
    }
  };

  if (!готово) return null;

  return (
    <button
      type="button"
      onClick={share}
      className="tap draw-line mt-5 inline-flex cursor-pointer items-center gap-2 py-1.5 text-[0.8125rem] text-ink/65 transition-colors duration-300 hover:text-ink"
    >
      <Copy className="size-4" />
      <span aria-live="polite">
        {state === "done"
          ? "Ссылка на сборку скопирована"
          : state === "long"
            ? "Сборка слишком большая для ссылки"
            : "Поделиться сборкой"}
      </span>
    </button>
  );
}

/** Сборка, пришедшая ссылкой: спрашиваем, прежде чем занять конструктор. */
export function IncomingDraft() {
  const draft = useSyncExternalStore(
    subscribeDraft,
    draftSnapshot,
    incomingServerSnapshot,
  );
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 5000);
    return () => clearTimeout(t);
  }, [note]);

  if (note) {
    return (
      <p
        aria-live="polite"
        className="mb-6 rounded-card border border-hairline px-5 py-4 text-[0.875rem] text-ink/70"
      >
        {note}
      </p>
    );
  }

  if (!draft) return null;

  return (
    <div
      className="mb-8 rounded-card px-[clamp(20px,3vw,32px)] py-[clamp(20px,3vw,28px)]"
      style={{
        background: "color-mix(in oklab, var(--brand) 9%, var(--color-paper))",
      }}
    >
      <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
        Сборка по ссылке
      </p>
      <p className="mt-3 text-[1.0625rem]">
        Вам прислали незавершённую сборку: {draft.length}{" "}
        {draft.length === 1 ? "флешка" : "флешки"}. Открыть её в конструкторе?
        Ваша текущая сборка будет заменена.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            // у корзинной записи гарнитура необязательна, у сборки —
            // обязательна: разбор ссылки её всегда проставляет, но тип
            // об этом не знает, поэтому подстраховываемся значением по умолчанию
            replaceItems(
              draft.map((it) => ({
                lines: it.lines,
                colorId: it.colorId,
                customHex: it.customHex,
                apparatusId: it.apparatusId,
                fontId: it.fontId ?? FONTS[0].id,
              })),
            );
            clearDraft();
            setNote("Сборка открыта");
          }}
          className="inline-flex h-11 cursor-pointer items-center rounded-pill bg-ink px-5 text-[0.8125rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
        >
          Открыть сборку
        </button>
        <button
          type="button"
          onClick={clearDraft}
          aria-label="Не открывать присланную сборку"
          className="grid size-11 cursor-pointer place-items-center rounded-pill border border-hairline text-ink/65 transition-colors duration-300 hover:border-ink/40 hover:text-ink"
        >
          <Cross className="size-4" />
        </button>
      </div>
    </div>
  );
}
