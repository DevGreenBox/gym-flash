"use client";

import type { CartItem } from "@/lib/cart";
import {
  describeDelivery,
  formatDate,
  quote,
  type Delivery,
} from "@/lib/delivery";
import { logoLabel } from "@/lib/logos";
import { apparatusLabel, resolveColor, site } from "@/lib/site";

export type Order = {
  number: string;
  date: Date;
  name: string;
  phone: string;
  /** как и куда едет заказ — СДЭК с видом доставки или самовывоз */
  delivery: Delivery;
  items: CartItem[];
};

/**
 * Накладная — единственная часть «автоматической накладной», которую можно
 * сделать честно без службы доставки: бланк заказа для мастерской и клиента.
 * Номер, дата, стороны и построчная гравировка собираются сами, печать —
 * штатная браузерная (`window.print()`), стили печати в `globals.css`.
 *
 * Транспортная накладная СДЭК — это уже их бланк по их API: нужен договор,
 * ключ и адрес отправителя. Здесь для неё оставлено место.
 */
export function Invoice({ order }: { order: Order }) {
  const count = order.items.reduce((n, i) => n + i.qty, 0);
  // самовывоз не считается: везти нечего
  const del =
    order.delivery.method === "cdek"
      ? quote(order.delivery.city, count)
      : null;

  return (
    <div className="invoice rounded-card border border-hairline p-[clamp(24px,3vw,40px)]">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-5">
        <p className="font-display text-[1.5rem] tracking-[-0.02em]">
          Накладная {order.number}
        </p>
        <p className="text-[0.8125rem] text-ink/70">{formatDate(order.date)}</p>
      </div>

      <div className="grid gap-8 border-b border-hairline py-6 sm:grid-cols-2">
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
            Отправитель
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed">
            {site.legal}
            <br />
            {site.city}
            <br />
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
            Получатель
          </p>
          <p className="mt-2 text-[0.9375rem] leading-relaxed">
            {order.name}
            <br />
            {order.phone}
            <br />
            {describeDelivery(order.delivery)}
          </p>
        </div>
      </div>

      <table className="mt-6 w-full text-left text-[0.875rem]">
        <thead>
          <tr className="border-b border-hairline text-[0.6875rem] tracking-[0.14em] text-ink/65 uppercase">
            <th className="py-2 font-semibold">Гравировка</th>
            <th className="py-2 font-semibold">Пиктограмма</th>
            <th className="py-2 font-semibold">Цвет</th>
            <th className="py-2 font-semibold">Оборот</th>
            <th className="py-2 text-right font-semibold">Кол-во</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it) => (
            <tr key={it.id} className="border-b border-hairline align-top">
              <td className="py-3">{it.lines.filter(Boolean).join(" · ")}</td>
              <td className="py-3">{apparatusLabel(it.apparatusId)}</td>
              <td className="py-3">
                {/* свой оттенок уходит в цех числом, а не названием */}
                {resolveColor(it.colorId, it.customHex).name}
                {it.customHex ? ` ${it.customHex}` : ""}
              </td>
              {/* логотип главнее строк: зона одна, гравируется он */}
              <td className="py-3">
                {logoLabel(it.backLogo)
                  ? `логотип «${logoLabel(it.backLogo)}»`
                  : (it.back ?? []).filter((l) => l.trim()).join(" · ") || "—"}
              </td>
              <td className="py-3 text-right tabular-nums">{it.qty}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {/* шрифта в накладной нет: он один на все флешки
                (правка заказчика от 08.10) */}
            <td className="py-3 text-[0.9375rem]" colSpan={4}>
              Всего флешек
            </td>
            <td className="py-3 text-right text-[0.9375rem] tabular-nums">
              {count}
            </td>
          </tr>
        </tfoot>
      </table>

      <dl className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-[0.8125rem]">
        {del ? (
          <>
            <Row
              k="Вес отправления"
              v={del.grams ? `${del.grams} г` : "уточняется"}
            />
            <Row
              k="Доставка"
              v={del.ok ? `${del.rub} ₽` : del.reason}
              muted={!del.ok}
            />
          </>
        ) : (
          <Row k="Доставка" v="самовывоз" />
        )}
        <Row k="Стоимость заказа" v="уточняется" muted />
      </dl>

      <div className="mt-8 grid gap-8 text-[0.75rem] text-ink/65 sm:grid-cols-2">
        <p className="border-t border-hairline pt-2">Отгрузил</p>
        <p className="border-t border-hairline pt-2">Получил</p>
      </div>
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/65">{k}</dt>
      <dd className={muted ? "text-ink/65" : ""}>{v}</dd>
    </div>
  );
}
