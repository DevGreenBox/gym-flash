import type { Metadata, Viewport } from "next";
import { Golos_Text, Playpen_Sans, Prata } from "next/font/google";

import { MessengerFab } from "@/components/messenger-fab";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

import "./globals.css";

// Заголовки — дидон с высоким контрастом: художественная гимнастика про
// грацию, а не про спортивный гротеск. Один вес дисциплинирует.
const prata = Prata({
  subsets: ["cyrillic", "latin"],
  weight: ["400"],
  variable: "--font-prata",
  display: "swap",
});

// Текст и интерфейс — гарнитура, нарисованная от кириллицы, а не с латиницы.
const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  variable: "--font-golos",
  display: "swap",
});

// Гравировка. Segoe Print с сайта убран совсем, и не только из-за лицензии:
// он есть только на Windows, и флешка выглядела бы по-разному в зависимости
// от того, с чего человек зашёл. Конструктор показывает будущую покупку —
// она обязана быть одинаковой везде.
//
// Playpen Sans — ближайший по скелету из тех, что имеют кириллицу и живой
// жирный: буквы прямые, не связаны, той же ширины, что на гравировке.
// Сравнение с фотографией партии — в docs/шрифт-гравировки.md. Вес пришпилен
// к 600: гарнитура переменная, но нужен один вес, и статический экземпляр
// весит меньше.
const playpen = Playpen_Sans({
  subsets: ["cyrillic", "latin"],
  weight: "600",
  variable: "--font-playpen",
  display: "swap",
});

const title = `${site.name} — именные флешки для художественной гимнастики`;
const description =
  "Металлическая флешка с лазерной гравировкой: фамилия, имя, год и знак предмета. Семь цветов корпуса, кольцо с карабином, изготовление от одного дня. Ростов-на-Дону, доставка по России.";

export const metadata: Metadata = {
  // TODO(client): боевой домен — от него считаются абсолютные адреса картинок
  metadataBase: new URL("https://personal-flash.ru"),
  title: {
    default: title,
    // раздел подставляет своё имя: «Доставка — Personal Flash»
    template: `%s — ${site.name}`,
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.legal }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    url: "/",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  // Сайт ещё не сдан заказчику — в поиск его пускать рано.
  robots: { index: false, follow: false },
};

/* Цвет строки браузера на телефоне: без него системная полоса остаётся
   белой или чёрной и обрывает молочную бумагу ровно на кромке экрана. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#faf9f7" },
  ],
};

/**
 * Кто мы такие — машиночитаемо. Только то, что заказчик дал: имя, лицо,
 * город, телефон, почта. Ни рейтингов, ни часов работы, ни цен —
 * их нам не давали, а размеченная выдумка хуже её отсутствия.
 */
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  legalName: site.legal,
  url: "https://personal-flash.ru",
  email: site.email,
  telephone: site.phoneHref.replace("tel:", ""),
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "RU" },
  description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${golos.variable} ${prata.variable} ${playpen.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
        />
        <a
          href="#main"
          /* поля — только в фокусе: рядом с `sr-only` они раздували
             спрятанную ссылку до 41×25 и она перехватывала нажатие
             в левом верхнем углу, поверх логотипа */
          className="sr-only rounded-pill bg-ink text-[0.875rem] text-paper focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-70 focus:px-5 focus:py-3"
        >
          Перейти к содержимому
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <MessengerFab />
      </body>
    </html>
  );
}
