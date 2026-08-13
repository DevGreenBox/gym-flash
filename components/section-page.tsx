import Link from "next/link";

import { Cta } from "@/components/cta";
import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight } from "@/components/icons";
import { Placeholder } from "@/components/placeholder";
import type { Section } from "@/lib/content";
import { FALLBACK } from "@/lib/engraving-view";
import { APPARATUS, DEFAULT_COLOR_FOR, colorById } from "@/lib/site";

/**
 * Разворот текстового раздела. Где текста заказчик не дал, вместо него стоит
 * честная строка «текст уточняется» — выдумывать описание нельзя. Но если
 * под заголовком идёт свой блок (раскладка работ, конструктор), раздел
 * не пустой, и заглушка там не нужна.
 */
export function SectionPage({
  section,
  children,
  cta = true,
}: {
  section: Section;
  children?: React.ReactNode;
  /** false — раздел заканчивается конструктором, второй призыв там лишний */
  cta?: boolean;
}) {
  const hasText =
    section.lead ||
    section.body ||
    section.chapters ||
    section.priceLink ||
    !children;

  return (
    <>
      <section className="section">
        {/* Товар стоит рядом с текстом, а не этажом ниже: половина разворота
            пустовала, а разговор о том, что помещается на корпус, читается
            только при виде самого корпуса. */}
        <div className="shell grid12">
          <div className="md:col-span-6">
            <h1 className="max-w-[18ch] text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.04] font-normal tracking-[-0.03em] text-balance">
              {section.title}
            </h1>

            {/* пустую обёртку не рисуем: без текста она оставляла между
                заголовком и следующим блоком отступ без содержимого */}
            {hasText ? (
              <div className="mt-[clamp(28px,3.5vw,52px)]">
                {section.lead ? (
                  <p className="text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-balance">
                    {section.lead}
                  </p>
                ) : section.body || section.chapters || children ? null : (
                  <p className="text-[1.0625rem] text-ink/65">
                    Текст раздела — уточняется.
                  </p>
                )}

                {section.body ? (
                  <div className="space-y-5 text-[0.9375rem] leading-relaxed text-ink/65 [&:not(:first-child)]:mt-7">
                    {section.body.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                ) : null}

                {section.priceLink ? (
                  <Link
                    href="/prices"
                    className="draw-line mt-8 inline-flex items-center gap-2.5 text-[0.9375rem]"
                  >
                    {section.priceLink}
                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          {section.preview ? (
            <div className="mt-12 md:col-span-5 md:col-start-8 md:mt-0">
              <div
                className="rounded-card px-[clamp(16px,2.5vw,32px)] py-[clamp(24px,3vw,40px)]"
                style={{
                  background:
                    "color-mix(in oklab, var(--brand) 9%, var(--color-paper))",
                }}
              >
                {section.preview === "set" ? (
                  <ul className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                    {APPARATUS.map((a) => (
                      <li key={a.id}>
                        <FlashDrive
                          color={colorById(DEFAULT_COLOR_FOR[a.id]).hex}
                          apparatusId={a.id}
                          lines={
                            FALLBACK as unknown as [string, string, string]
                          }
                          chain={false}
                          className="w-full drop-shadow-[0_10px_16px_rgba(17,17,16,0.14)] transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-1.5"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <FlashDrive
                    color={colorById(section.preview.colorId).hex}
                    apparatusId={section.preview.apparatusId}
                    lines={section.preview.lines}
                    className="w-full drop-shadow-[0_18px_30px_rgba(17,17,16,0.16)]"
                  />
                )}
              </div>
            </div>
          ) : null}

          {/* Главы идут в строку, а не столбиком: три коротких рассказа
              рядом видно целиком, а в колонке они вытягивались в полотно,
              которое читают только с начала. */}
          {section.chapters ? (
            <div className="mt-[clamp(40px,5vw,72px)] grid gap-x-[var(--gutter)] gap-y-10 md:col-span-12 md:grid-cols-3">
              {section.chapters.map((c) => (
                <div key={c.title} className="border-t border-hairline pt-5">
                  <h2 className="text-[1.0625rem] font-medium">{c.title}</h2>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/65">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {section.photo ? (
        <section className="section">
          <div className="shell">
            <Placeholder
              label={section.photo}
              className="aspect-[16/9] overflow-hidden rounded-card"
            />
          </div>
        </section>
      ) : null}

      {children}

      {cta ? <Cta /> : null}
    </>
  );
}
