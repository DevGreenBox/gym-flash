"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DrivePair, DriveSummary } from "@/components/drive-pair";
import { ArrowRight, Cross, Minus, Plus } from "@/components/icons";
import type { Order } from "@/components/invoice";
import { Invoice } from "@/components/invoice";
import { IncomingOrder, ShareOrder } from "@/components/share-order";
import type { CartItem } from "@/lib/cart";
import {
  clearCart,
  removeFromCart,
  setQty,
  totalQty,
  updateLines,
  useCart,
} from "@/lib/cart";
import { DeliveryPicker } from "@/components/delivery-picker";
import {
  EMPTY_DELIVERY,
  invoiceNumber,
  type Delivery,
  type Quote,
} from "@/lib/delivery";
import { FORMS_ARE_MOCKED, SPEC, resolveColor } from "@/lib/site";

export default function CartPage() {
  const items = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery>(EMPTY_DELIVERY);
  const [расчёт, setРасчёт] = useState<Quote | null>(null);
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
        <IncomingOrder />
        <p className="max-w-[42ch] text-[1.0625rem] leading-relaxed text-ink/65">
          Соберите флешку в конструкторе.
        </p>
        <Link
          /* конструктора на главной больше нет: экран выбора ведёт
             в тот, что нужен — гимнастика, учёба или подарок */
          href="/constructors"
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
      <IncomingOrder />
      {/* Сетка здесь включается с той же ширины, с какой расставлены
          колонки. С `grid12` двенадцать колонок появлялись с 768, а
          `lg:col-span-*` — только с 1024: между ними список и форма
          получали по одной колонке из двенадцати и налезали друг на друга. */}
      <div className="grid12-lg">
        <ul className="lg:col-span-7">
          {items.map((item) => (
            <CartRow key={item.id} item={item} />
          ))}

          <li className="border-t border-hairline pt-6">
            <button
              type="button"
              onClick={clearCart}
              className="tap cursor-pointer text-[0.8125rem] text-ink/65 transition-colors duration-150 hover:text-ink"
            >
              Очистить корзину
            </button>
            <ShareOrder items={items} />
          </li>
        </ul>

        {/* пока колонок нет, форма идёт под списком — и отбивается от него
            сама: межколонник в потоке блоков не работает */}
        <div className="max-lg:mt-12 lg:col-span-5">
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
                delivery,
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

            {/* правка заказчика от 08.10: «Фамилия и имя» вместо «Имя»,
                город ушёл в доставку — он нужен только СДЭК */}
            <Field name="name" label="Фамилия и имя" required />
            <Field name="phone" label="Телефон" type="tel" required />
            <DeliveryPicker
              value={delivery}
              onChange={setDelivery}
              count={count}
              result={расчёт}
              onResult={setРасчёт}
            />
            {/* Итоги — сразу за доставкой (правка заказчика от 08.10:
                комментария больше нет, оплата «при получении» снята).
                «Итого» появляется, когда доставка выбрана или посчитана. */}
            <div className="space-y-1.5 border-t border-hairline pt-5 text-[0.8125rem]">
              <Row k="Флешек" v={String(count)} />
              <Row k="Стоимость" v="уточняется" muted />
              <Row
                k="Доставка"
                v={
                  delivery.method === "pickup"
                    ? "самовывоз"
                    : расчёт
                      ? расчёт.ok
                        ? `${расчёт.rub} ₽`
                        : расчёт.reason
                      : "рассчитайте выше"
                }
                muted={delivery.method === "cdek" && !расчёт?.ok}
              />
              {delivery.method === "pickup" || расчёт ? (
                <div className="flex justify-between border-t border-hairline pt-2.5 text-[0.9375rem] font-medium">
                  <span>Итого</span>
                  {/* TODO(client): цена флешки — тогда итог сложится
                      из стоимости и доставки сам */}
                  <span className="text-ink/65">уточняется</span>
                </div>
              ) : null}
            </div>

            {/* Согласия — обязательные: без них заявка не уходит.
                TODO(client): тексты политики обработки персональных данных
                и публичной оферты — тогда названия станут ссылками. */}
            <div className="space-y-3">
              <Согласие>
                Я даю согласие на обработку моих персональных данных
                на условиях Политики обработки персональных данных.
              </Согласие>
              <Согласие>
                Я принимаю условия публичной оферты (договора купли-продажи).
              </Согласие>
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
 * Строка заявки — как предпросмотр в конструкторе (эскиз заказчика
 * от 08.10): обе стороны флешки сразу и список выбранного. Надпись
 * правится на месте: в комплекте из семи флешек опечатка в одной
 * не должна означать пересборку всего заказа.
 */
function CartRow({ item }: { item: CartItem }) {
  const [edit, setEdit] = useState(false);
  const color = resolveColor(item.colorId, item.customHex);

  return (
    <li className="grid gap-5 border-t border-hairline py-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:items-center">
      <div
        className="rounded-field px-3 py-2"
        style={{
          background: `color-mix(in oklab, ${color.hex} 12%, var(--color-paper))`,
        }}
      >
        <DrivePair item={item} />
      </div>

      <div className="min-w-0">
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
        ) : null}

        <DriveSummary item={item} className={edit ? "mt-4" : ""} />

        {/* правка надписи, количество и удаление — одной строкой под списком */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setEdit((v) => !v)}
            className="tap draw-line cursor-pointer text-[0.8125rem] text-ink/70"
          >
            {edit ? "Готово" : "Изменить надпись"}
          </button>
          <div className="flex items-center gap-3">
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
        </div>
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

/** Обязательная галочка согласия: подпись — вся строка, не только квадрат. */
function Согласие({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[0.8125rem] leading-snug text-ink/80">
      <input
        type="checkbox"
        required
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-ink)]"
      />
      <span>{children}</span>
    </label>
  );
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
