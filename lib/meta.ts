import type { Metadata } from "next";

import type { Section } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * Метаданные раздела.
 *
 * Пишутся через одну функцию, потому что Next сливает метаданные сегментов
 * поверхностно: раздел, объявивший свой `openGraph`, затирает родительский
 * целиком. Разделы так и теряли картинку, тип и локаль — в мессенджере
 * ссылка на «Доставку» приходила голой строкой, а на главную — с обложкой.
 *
 * Описание — обещание страницы для поисковой выдачи и превью ссылки.
 * Своё у каждого раздела: одно описание на одиннадцать страниц поисковик
 * считает дублем, а человек в переписке — ошибкой.
 */
const OG_IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "Светлый зал художественной гимнастики: обруч, мяч и лента у стен",
};

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** адрес раздела от корня: от него считаются canonical и og:url */
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: site.name,
      url: path,
      title: `${title} — ${site.name}`,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${site.name}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** То же самое для раздела: заголовок, описание и адрес у него уже есть. */
export const sectionMeta = (section: Section): Metadata =>
  pageMeta({
    title: section.title,
    description: section.meta,
    path: `/${section.slug}`,
  });
