import type { Metadata } from "next";
import Link from "next/link";

import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight } from "@/components/icons";
import { pageMeta } from "@/lib/meta";
import { TRAINING, colorById } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Для тренировок и выступлений",
  description:
    "Конструкторы флешек для тренировок и выступлений: личная программа, групповая программа, другие виды спорта.",
  path: "/training",
});

/**
 * Выбор конструктора внутри «Для тренировок и выступлений» — правка
 * заказчика от 08.10. Сюда ведут меню, карточка направления на главной
 * и «Создай свою флешку» в «Примерах работ»; учёба и подарок ведут
 * сразу в свои конструкторы.
 */
export default function Page() {
  return (
    <section className="section">
      <div className="shell">
        <h1 className="max-w-[18ch] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.04] font-normal tracking-[-0.03em] text-balance">
          Для тренировок и выступлений
        </h1>

        <ul className="mt-[clamp(36px,4.5vw,64px)] grid gap-x-[var(--gutter)] gap-y-10 md:grid-cols-3">
          {TRAINING.map((t, i) => {
            const color = colorById(t.preview.colorId);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
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
                      apparatusId={t.preview.apparatusId}
                      lines={t.preview.lines}
                      className="w-full drop-shadow-[0_12px_20px_rgba(17,17,16,0.14)] transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-1.5"
                    />
                  </div>

                  <h2 className="mt-6 font-display text-[1.35rem] leading-[1.15] tracking-[-0.02em]">
                    {t.label}
                  </h2>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.8125rem] text-ink/65 transition-colors duration-300 group-hover:text-ink">
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
  );
}
