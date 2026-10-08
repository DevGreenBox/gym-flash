import Link from "next/link";

import { CopyLine } from "@/components/copy-line";
import { Logo } from "@/components/logo";
import { Messengers } from "@/components/messengers";
import { Subscribe } from "@/components/subscribe";
import { NAV, site } from "@/lib/site";

/**
 * Подвал — по правке заказчика от 08.10 (раздел 5). На телефоне колонки
 * встают друг под друга ровно в том порядке, что на эскизе: знак и город →
 * связь (телефон, мессенджеры, «Позвонить») → рассылка → реквизиты
 * (ИП, ИНН) → разделы. Почты и «Написать письмо» здесь больше нет —
 * адрес остался на странице «Контакты».
 *
 * Отдельной полосы «Связаться с нами» над подвалом нет: она повторяла
 * бы то же самое этажом выше.
 */
export function SiteFooter() {
  return (
    <footer className="section-ruled">
      {/* снизу хватает трети ритма: полтораста пустоты под реквизитами
          читаются как обрыв вёрстки, а не как воздух */}
      <div className="shell grid12 gap-y-12 pb-[calc(var(--section)/2.6)]">
        <div className="md:col-span-4">
          <Logo className="text-[1.35rem]" />
          <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink/70">
            {site.city}
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            Связаться с нами
          </p>
          {/* Номер — ссылка и копирование рядом. Ссылка нужна телефону,
              копирование — компьютеру: там `tel:` часто ни к чему
              не привязан, и нажатие внешне не делает ничего. */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <a
              href={site.phoneHref}
              className="draw-line font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-none tracking-[-0.02em]"
            >
              {site.phone}
            </a>
            <CopyLine value={site.phone} label="номер телефона" />
          </div>

          {/* сначала мессенджеры, под ними «Позвонить» — порядок с эскиза */}
          <Messengers className="mt-6" />
          <a
            href={site.phoneHref}
            className="mt-3 inline-flex h-11 items-center rounded-pill bg-ink px-5 text-[0.8125rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
          >
            Позвонить
          </a>

          <p className="mt-10 text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            Рассылка
          </p>
          <Subscribe />
        </div>

        <div className="md:col-span-3 md:col-start-10">
          {/* реквизиты — над разделами, как стрелкой на эскизе */}
          <p className="text-[0.8125rem] leading-relaxed text-ink/70">
            {site.legal}
            <br />
            ИНН {site.inn}
          </p>

          <nav className="mt-8">
            <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
              Разделы
            </p>
            {/* шаг списка на телефоне крупнее: ссылки идут подряд, и растягивать
                им невидимую зону нельзя — соседние наложились бы друг на друга */}
            <ul className="mt-5 grid gap-2 text-[0.8125rem] text-ink/70 max-lg:gap-0">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="draw-line inline-block py-1.5 transition-colors duration-300 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
