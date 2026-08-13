import type { Metadata } from "next";
import { Caveat, Golos_Text, Prata } from "next/font/google";

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

// Подмена Segoe Print Bold: у оригинала нет веб-лицензии.
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["700"],
  variable: "--font-caveat",
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
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  // Сайт ещё не сдан заказчику — в поиск его пускать рано.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${golos.variable} ${prata.variable} ${caveat.variable}`}
    >
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only rounded-pill bg-ink px-5 py-3 text-[0.875rem] text-paper focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-70"
        >
          Перейти к содержимому
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
