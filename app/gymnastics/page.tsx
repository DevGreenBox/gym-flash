import type { Metadata } from "next";

import { Constructor } from "@/components/constructor";
import { SECTIONS } from "@/lib/content";

const section = SECTIONS.gymnastics;

export const metadata: Metadata = {
  title: section.title,
  openGraph: { title: section.title },
};

/**
 * Раздел — сам конструктор, без вступительного разворота: в шапке он так
 * и называется, и человек приходит сюда собирать, а не читать. Тексты
 * раздела остались в `lib/content.ts` — если понадобятся, вернуть их
 * можно одной строкой.
 */
export default function Page() {
  return <Constructor headingAs="h1" />;
}
