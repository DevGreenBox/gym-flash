import type { Metadata } from "next";

import { Constructor } from "@/components/constructor";
import { SECTIONS } from "@/lib/content";
import { pageMeta } from "@/lib/meta";

const section = SECTIONS.gymnastics;

/* «Личная программа» — один из трёх конструкторов направления
   «Для тренировок и выступлений» (правка заказчика от 08.10);
   адрес прежний, чтобы не сломать присланные ссылки на сборки */
export const metadata: Metadata = pageMeta({
  title: "Личная программа",
  description: section.meta,
  path: "/gymnastics",
});

/**
 * Раздел — сам конструктор, без вступительного разворота: в шапке он так
 * и называется, и человек приходит сюда собирать, а не читать. Тексты
 * раздела остались в `lib/content.ts` — если понадобятся, вернуть их
 * можно одной строкой.
 */
export default function Page() {
  // конструктор здесь — всё содержание страницы, и его превью первое
  // изображение: без приоритета браузер брал его в общей очереди
  return <Constructor headingAs="h1" priority />;
}
