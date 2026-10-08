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
    "Флешки, собранные в конструкторе: обе стороны каждой — надпись, пиктограмма, цвет, оборот. Отсюда уходит заявка.",
  path: "/cart",
});

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
