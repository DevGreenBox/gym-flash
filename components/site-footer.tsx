import Link from "next/link";

import { CopyLine } from "@/components/copy-line";
import { Logo } from "@/components/logo";
import { Messengers } from "@/components/messengers";
import { NAV, site } from "@/lib/site";

/**
 * Всё, чем можно связаться, живёт здесь — отдельной полосы «Связаться
 * с нами» над подвалом больше нет: она повторяла то же самое этажом выше.
 */
export function SiteFooter() {
  return (
    <footer className="section-ruled">
      {/* снизу хватает трети ритма: полтораста пустоты под реквизитами
          читаются как обрыв вёрстки, а не как воздух */}
      <div className="shell grid12 pb-[calc(var(--section)/2.6)]">
        <div className="md:col-span-4">
          <Logo className="text-[1.35rem]" />
          <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink/70">
            {site.city}
            <br />
            {site.legal}
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            Связаться с нами
          </p>
          {/* Номер и почта — ссылка и копирование рядом. Ссылка нужна
              телефону, копирование — компьютеру: там `tel:` и `mailto:`
              часто ни к чему не привязаны, и нажатие внешне не делает
              ничего. Кнопка кладёт значение в буфер и говорит об этом. */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <a
              href={site.phoneHref}
              className="draw-line font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-none tracking-[-0.02em]"
            >
              {site.phone}
            </a>
            <CopyLine value={site.phone} label="номер телефона" />
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <a
              href={`mailto:${site.email}`}
              className="draw-line text-[1.0625rem]"
            >
              {site.email}
            </a>
            <CopyLine value={site.email} label="адрес почты" />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={site.phoneHref}
              className="inline-flex h-11 items-center rounded-pill bg-ink px-5 text-[0.8125rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
            >
              Позвонить
            </a>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex h-11 items-center rounded-pill border border-hairline px-5 text-[0.8125rem] font-medium transition-colors duration-300 hover:border-ink/40"
            >
              Написать письмо
            </a>
          </div>
          {/* мессенджеры отдельным рядом под кнопками: ряд свёрстан
              на своё место, ссылки в него встанут без перевёрстки */}
          <Messengers className="mt-4" />
        </div>

        <nav className="md:col-span-3 md:col-start-10">
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
    </footer>
  );
}
