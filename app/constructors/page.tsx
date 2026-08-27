import type { Metadata } from "next";
import Link from "next/link";

import { Cta } from "@/components/cta";
import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight } from "@/components/icons";
import { pageMeta } from "@/lib/meta";
import { CATEGORIES, colorById } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Выберите конструктор",
  description:
    "Флешка одна и та же, отличается набор шагов: со знаком вида для гимнастики и без него — для учёбы и подарка.",
  path: "/constructors",
});

/**
 * Промежуточный экран выбора.
 *
 * Раньше призыв в конце раздела вёл сразу в один конструктор — тот,
 * что стоит на главной. Конструкторов несколько, и человек, дочитавший
 * «Доставку», не обязан попадать именно в гимнастический: выбор за ним,
 * а не за вёрсткой.
 *
 * Экран обязан объяснять разницу, иначе он превращается в лишний щелчок
 * перед тем же действием. Разница здесь честная и одна: набор шагов.
 */
export default function Page() {
  return (
    <>
      <section className="section">
        <div className="shell">
          <h1 className="max-w-[18ch] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.04] font-normal tracking-[-0.03em] text-balance">
            Выберите конструктор
          </h1>
          <p className="mt-[clamp(20px,2.5vw,32px)] max-w-[54ch] text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-balance">
            Флешка везде одна и та же — корпус, гравировка, кольцо с карабином.
            Отличается набор шагов: знак вида нужен гимнастике и мешает всем
            остальным.
          </p>

          <ul className="mt-[clamp(36px,4.5vw,64px)] grid gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3">
            {CATEGORIES.map((c, i) => {
              const color = colorById(c.preview.colorId);
              return (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="group flex h-full flex-col rounded-card border border-hairline p-5 transition-colors duration-300 hover:border-ink/25"
                  >
                    <div
                      className="rounded-field px-4 py-7"
                      style={{
                        background: `color-mix(in oklab, ${color.hex} 10%, var(--color-paper))`,
                      }}
                    >
                      <FlashDrive
                        priority={i === 0}
                        color={color.hex}
                        apparatusId={c.preview.apparatusId}
                        lines={c.preview.lines}
                        chain={false}
                        className="w-full drop-shadow-[0_12px_20px_rgba(17,17,16,0.14)] transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-1.5"
                      />
                    </div>

                    <h2 className="mt-6 font-display text-[1.35rem] leading-[1.15] tracking-[-0.02em]">
                      {c.label}
                    </h2>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink/70">
                      {c.difference}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] text-ink/65 transition-colors duration-300 group-hover:text-ink">
                      Открыть
                      <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Cta />
    </>
  );
}
