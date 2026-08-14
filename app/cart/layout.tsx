import type { Metadata } from "next";

import { pageMeta } from "@/lib/meta";

/**
 * Метаданные лежат в обёртке, потому что сама корзина — клиентский
 * компонент: она читает заказ из `localStorage`, а такие страницы
 * экспортировать `metadata` не могут.
 */
export const metadata: Metadata = pageMeta({
  title: "Корзина",
  description:
    "Флешки, собранные в конструкторе: надпись, шрифт, предмет и цвет каждой. Отсюда уходит заявка.",
  path: "/cart",
});

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
