"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight, Cross, Minus, Plus } from "@/components/icons";
import type { Order } from "@/components/invoice";
import { Invoice } from "@/components/invoice";
import type { CartItem } from "@/lib/cart";
import {
  clearCart,
  removeFromCart,
  setQty,
  totalQty,
  updateLines,
  useCart,
} from "@/lib/cart";
import { invoiceNumber, quote } from "@/lib/delivery";
import {
  apparatusLabel,
  FORMS_ARE_MOCKED,
  SPEC,
  fontById,
  resolveColor,
} from "@/lib/site";

export default function CartPage() {
  const items = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [sending, setSending] = useState(false);
  const count = totalQty(items);

  // Цвет страницы задаёт первая флешка в заявке — иначе шапка и логотип
  // светились бы цветом, которого в корзине нет.
  useEffect(() => {
    if (!items[0]) return;
    document.documentElement.style.setProperty(
      "--brand",
      resolveColor(items[0].colorId, items[0].customHex).hex,
    );
  }, [items]);

  if (order) {
    return (
      <Shell title="Заявка отправлена">
        <p className="no-print max-w-[46ch] text-[1.0625rem] leading-relaxed text-ink/70">
          Заявка у нас. Свяжемся, чтобы подтвердить гравировку и посчитать
          доставку.
        </p>
        <p className="no-print mt-4 text-[0.8125rem] text-ink/65">
          Сайт ещё не подключён к почте — заявка никуда не ушла.
        </p>

        <div className="mt-9 md:max-w-[760px]">
          <Invoice order={order} />
        </div>

        <div className="no-print mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-pill bg-ink px-6 text-[0.875rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
          >
            Печать накладной
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2.5 rounded-pill border border-hairline px-6 text-[0.875rem] font-medium transition-colors duration-300 hover:border-ink/40"
          >
            На главную
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  if (items.length === 0) {
    return (
      <Shell title="В корзине пусто">
        <p className="max-w-[42ch] text-[1.0625rem] leading-relaxed text-ink/65">
          Соберите флешку в конструкторе.
        </p>
        <Link
          href="/#constructor"
          className="mt-9 inline-flex h-12 items-center gap-2.5 rounded-pill bg-ink px-6 text-[0.875rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
        >
          К конструктору
          <ArrowRight className="size-4" />
        </Link>
      </Shell>
    );
  }

  return (
    <Shell title="Корзина" subtitle={`${count} ${plural(count)} в заявке`}>
      <div className="grid12">
        <ul className="lg:col-span-7">
          {items.map((item) => (
            <CartRow key={item.id} item={item} />
          ))}

          <li className="border-t border-hairline pt-6">
            <button
              type="button"
              onClick={clearCart}
              className="cursor-pointer text-[0.8125rem] text-ink/65 transition-colors duration-150 hover:text-ink"
            >
              Очистить корзину
            </button>
          </li>
        </ul>

        <div className="lg:col-span-5">
          <form
            className="space-y-7 rounded-card border border-hairline p-[clamp(24px,3vw,40px)]"
            onSubmit={(e) => {
              e.preventDefault();
              if (sending) return; // двойной клик не отправит заявку дважды
              setSending(true);
              const data = Object.fromEntries(new FormData(e.currentTarget));
              const now = new Date();
              const made = {
                number: invoiceNumber(now),
                date: now,
                name: String(data.name ?? ""),
                phone: String(data.phone ?? ""),
                city: String(data.city ?? ""),
                comment: String(data.comment ?? ""),
                items,
              };
              // TODO(client): адрес почты и приём заявок
              if (FORMS_ARE_MOCKED) console.info("Заявка:", made);
              clearCart();
              setOrder(made);
            }}
          >
            <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
              Оформление
            </p>

            <Field name="name" label="Имя" required />
            <Field name="phone" label="Телефон" type="tel" required />
            <Field name="city" label="Город доставки" required />
            <label className="field block">
              <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
                Комментарий
              </span>
              <textarea
                name="comment"
                rows={2}
                className="mt-2 w-full resize-none border-b border-hairline bg-transparent pb-2.5 text-[1.0625rem] outline-none"
              />
            </label>

            <div className="space-y-1.5 border-t border-hairline pt-5 text-[0.8125rem]">
              <Row k="Флешек" v={String(count)} />
              <Row k="Стоимость" v="уточняется" muted />
              <DeliveryRow count={count} />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-pill bg-ink px-6 text-[0.875rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px disabled:cursor-wait disabled:opacity-60"
            >
              {sending ? "Отправляем…" : "Отправить заявку"}
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </Shell>
  );
}

/**
 * Строка заявки. Надпись правится на месте: в комплекте из семи флешек
 * опечатка в одной не должна означать пересборку всего заказа.
 */
function CartRow({ item }: { item: CartItem }) {
  const [edit, setEdit] = useState(false);
  const color = resolveColor(item.colorId, item.customHex);
  const apparatus = apparatusLabel(item.apparatusId);

  return (
    <li className="flex flex-wrap items-center gap-5 border-t border-hairline py-6">
      {/* на телефоне превью узкое: при 200 px рядом с ним не оставалось
          места под надпись, и строка разваливалась на четыре этажа */}
      <div
        className="w-[112px] shrink-0 rounded-field px-3 py-4 sm:w-[200px] sm:px-4 sm:py-5"
        style={{
          background: `color-mix(in oklab, ${color.hex} 12%, var(--color-paper))`,
        }}
      >
        <FlashDrive
          color={color.hex}
          apparatusId={item.apparatusId}
          lines={item.lines}
          fontId={item.fontId}
          chain={false}
          className="w-full"
        />
      </div>

      <div className="min-w-0 flex-1">
        {edit ? (
          <div className="flex flex-wrap gap-3">
            {item.lines.map((line, i) => (
              <label key={i} className="field block w-[8.5rem]">
                <span className="sr-only">{["Фамилия", "Имя", "Год"][i]}</span>
                <input
                  value={line}
                  autoFocus={i === 0}
                  maxLength={SPEC.charsPerLine}
                  aria-label={["Фамилия", "Имя", "Год"][i]}
                  onChange={(e) => {
                    const next = [...item.lines] as CartItem["lines"];
                    next[i] = e.target.value.slice(0, SPEC.charsPerLine);
                    updateLines(item.id, next);
                  }}
                  className="w-full border-b border-hairline bg-transparent pb-1.5 text-[0.9375rem] outline-none"
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="text-[1.0625rem] leading-snug">
            {item.lines.filter(Boolean).join(" · ")}
          </p>
        )}

        <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-[0.8125rem] text-ink/70">
          <span>
            {color.name}
            {` · ${apparatus.toLowerCase()}`}
            {` · ${fontById(item.fontId).label.toLowerCase()}`}
          </span>
          <button
            type="button"
            onClick={() => setEdit((v) => !v)}
            className="draw-line cursor-pointer"
          >
            {edit ? "Готово" : "Изменить надпись"}
          </button>
        </p>
      </div>

      {/* количество и удаление идут одной строкой: на телефоне она своя,
          на широком экране встаёт в общий ряд */}
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
        <div className="inline-flex h-10 items-center gap-1 rounded-pill border border-hairline px-1.5">
          <button
            type="button"
            onClick={() => setQty(item.id, item.qty - 1)}
            aria-label="Убрать одну"
            className="grid size-8 cursor-pointer place-items-center rounded-pill text-ink/65 transition-colors duration-150 hover:text-ink"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center text-[0.875rem] tabular-nums">
            {item.qty}
          </span>
          <button
            type="button"
            onClick={() => setQty(item.id, item.qty + 1)}
            aria-label="Добавить одну"
            className="grid size-8 cursor-pointer place-items-center rounded-pill text-ink/65 transition-colors duration-150 hover:text-ink"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeFromCart(item.id)}
          aria-label="Удалить из корзины"
          className="grid size-10 cursor-pointer place-items-center rounded-pill text-ink/65 transition-colors duration-150 hover:text-ink"
        >
          <Cross className="size-4" />
        </button>
      </div>
    </li>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <div className="shell">
        <h1 className="text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.04] font-normal tracking-[-0.03em]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-[0.875rem] text-ink/65">{subtitle}</p>
        ) : null}
        <div className="mt-[clamp(32px,4vw,64px)]">{children}</div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field block">
      <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border-b border-hairline bg-transparent pb-2.5 text-[1.0625rem] outline-none"
      />
    </label>
  );
}

/** Доставку считает `lib/delivery.ts`; пока нет тарифов — говорит почему. */
function DeliveryRow({ count }: { count: number }) {
  const [city, setCity] = useState("");
  useEffect(() => {
    const el = document.querySelector<HTMLInputElement>('input[name="city"]');
    if (!el) return;
    const on = () => setCity(el.value);
    el.addEventListener("input", on);
    return () => el.removeEventListener("input", on);
  }, []);
  const d = quote(city, count);
  return <Row k="Доставка" v={d.ok ? `${d.rub} ₽` : d.reason} muted={!d.ok} />;
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/65">{k}</span>
      <span className={muted ? "text-ink/65" : ""}>{v}</span>
    </div>
  );
}

const plural = (n: number) => {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return "флешка";
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return "флешки";
  return "флешек";
};
