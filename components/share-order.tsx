"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Bag, Copy, Cross } from "@/components/icons";
import { addToCart, clearCart, useCart } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";
import {
  clearIncoming,
  incomingBroken,
  incomingServerSnapshot,
  incomingSnapshot,
  orderLink,
  subscribeIncoming,
} from "@/lib/share";
import { apparatusLabel, resolveColor } from "@/lib/site";

/** Сколько флешек и в каких цветах — чтобы понять, что именно прислали. */
function summary(items: Omit<CartItem, "id">[]) {
  const total = items.reduce((n, i) => n + i.qty, 0);
  const parts = items
    .slice(0, 3)
    .map(
      (i) =>
        `${resolveColor(i.colorId, i.customHex).name.toLowerCase()}${
          i.apparatusId ? ` · ${apparatusLabel(i.apparatusId).toLowerCase()}` : ""
        }`,
    );
  return {
    total,
    состав: parts.join(", ") + (items.length > 3 ? " и другие" : ""),
  };
}

/**
 * «Скопировать ссылку на заказ» — весь собранный заказ внутри адреса.
 *
 * Тренер собирает комплект на группу и отправляет ссылку родителям;
 * мама собирает флешку дочери и скидывает мужу — открыв ссылку, он
 * видит ту же корзину, ничего не набирая заново.
 */
export function ShareOrder({ items }: { items: CartItem[] }) {
  const [state, setState] = useState<"idle" | "done" | "long">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2600);
    return () => clearTimeout(t);
  }, [state]);

  const share = async () => {
    const url = orderLink(items, location.origin);
    // адрес длиннее полутора тысяч символов часть почтовых клиентов рвёт
    if (!url) return setState("long");
    try {
      await navigator.clipboard.writeText(url);
      setState("done");
    } catch {
      setState("long");
    }
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={share}
        className="tap draw-line inline-flex cursor-pointer items-center gap-2 py-1.5 text-[0.8125rem] text-ink/65 transition-colors duration-300 hover:text-ink"
      >
        <Copy className="size-4" />
        <span aria-live="polite">
          {state === "done"
            ? "Ссылка скопирована"
            : state === "long"
              ? "Заказ слишком большой для ссылки"
              : "Скопировать ссылку на заказ"}
        </span>
      </button>
      <p className="mt-2 max-w-[42ch] text-[0.75rem] text-ink/65">
        Кто откроет ссылку, увидит эту же корзину — с надписями, шрифтом
        и цветом каждой флешки.
      </p>
    </div>
  );
}

/**
 * Заказ, пришедший ссылкой.
 *
 * Спрашиваем всегда, даже когда своя корзина пуста: подставить чужой
 * заказ молча — значит решить за человека, а он мог открыть ссылку
 * просто посмотреть. Кнопка «Открыть» стоит первой, лишнего движения
 * это не добавляет.
 */
export function IncomingOrder() {
  const mine = useCart();
  const incoming = useSyncExternalStore(
    subscribeIncoming,
    incomingSnapshot,
    incomingServerSnapshot,
  );
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 6000);
    return () => clearTimeout(t);
  }, [note]);

  const принять = (замена: boolean) => {
    if (!incoming) return;
    if (замена) clearCart();
    incoming.forEach(addToCart);
    clearIncoming();
    setNote(
      замена ? "Открыт присланный заказ" : "Присланные флешки добавлены к вашим",
    );
  };

  if (note) {
    return (
      <p
        aria-live="polite"
        className="mb-8 rounded-card border border-hairline px-5 py-4 text-[0.875rem] text-ink/70"
      >
        {note}
      </p>
    );
  }

  if (!incoming) {
    return incomingBroken() ? (
      <p className="mb-8 rounded-card border border-hairline px-5 py-4 text-[0.875rem] text-ink/70">
        Ссылка на заказ не читается — попросите прислать новую.
      </p>
    ) : null;
  }

  const { total, состав } = summary(incoming);
  const своиЕсть = mine.length > 0;

  return (
    <div
      className="mb-9 rounded-card px-[clamp(20px,3vw,32px)] py-[clamp(20px,3vw,28px)]"
      style={{
        background: "color-mix(in oklab, var(--brand) 9%, var(--color-paper))",
      }}
    >
      <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
        Заказ по ссылке
      </p>
      <p className="mt-3 text-[1.0625rem]">
        Вам прислали {total} {total === 1 ? "флешку" : "флешки"}: {состав}.
      </p>
      {своиЕсть ? (
        <p className="mt-2 text-[0.8125rem] text-ink/65">
          В вашей корзине уже есть свои — выберите, что делать.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => принять(true)}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill bg-ink px-5 text-[0.8125rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
        >
          <Bag className="size-4" />
          {своиЕсть ? "Открыть присланный" : "Открыть заказ"}
        </button>
        {своиЕсть ? (
          <button
            type="button"
            onClick={() => принять(false)}
            className="inline-flex h-11 cursor-pointer items-center rounded-pill border border-hairline px-5 text-[0.8125rem] font-medium transition-colors duration-300 hover:border-ink/40"
          >
            Добавить к моим
          </button>
        ) : null}
        <button
          type="button"
          onClick={clearIncoming}
          aria-label="Не открывать присланный заказ"
          className="grid size-11 cursor-pointer place-items-center rounded-pill border border-hairline text-ink/65 transition-colors duration-300 hover:border-ink/40 hover:text-ink"
        >
          <Cross className="size-4" />
        </button>
      </div>
    </div>
  );
}
