import Link from "next/link";

import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight } from "@/components/icons";
import { FALLBACK } from "@/lib/engraving-view";
import { DEFAULT_COLOR_FOR, colorById } from "@/lib/site";

/* Цвет здесь свой, а не `--brand`: блок стоит на всех разделах, а `--brand`
   на них меняется вслед за конструктором — подложка уезжала бы от флешки. */
const CTA_COLOR = colorById(DEFAULT_COLOR_FOR.hoop).hex;

/**
 * Конец страницы — место, где человек уже всё прочитал. Дальше либо
 * действие, либо уход, поэтому здесь стоит одно: дверь в конструктор.
 *
 * Флешка рядом с кнопкой не украшение: на сайте товар главный, и обещание
 * «соберите свою» должно показывать, что именно собирают.
 */
export function Cta() {
  return (
    <section className="section">
      <div className="shell">
        <div
          className="grid12 items-center rounded-card px-[clamp(24px,4vw,64px)] py-[clamp(32px,4vw,56px)]"
          style={{
            background: `color-mix(in oklab, ${CTA_COLOR} 10%, var(--color-paper))`,
          }}
        >
          <div className="md:col-span-6">
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
              Соберите свою флешку
            </h2>
            <p className="mt-4 max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink/70">
              Имя, предмет и цвет — сразу видно, как получится.
            </p>
            {/* не в конкретный конструктор, а на экран выбора:
                конструкторов несколько, и человек, дочитавший «Доставку»,
                не обязан попадать именно в гимнастический */}
            <Link
              href="/constructors"
              className="group mt-8 inline-flex h-13 items-center gap-2.5 rounded-pill bg-ink px-7 text-[0.9375rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
            >
              Открыть конструктор
              <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </Link>
          </div>

          <div className="mt-10 md:col-span-5 md:col-start-8 md:mt-0">
            <FlashDrive
              color={CTA_COLOR}
              apparatusId="hoop"
              lines={FALLBACK as unknown as [string, string, string]}
              className="w-full drop-shadow-[0_18px_30px_rgba(17,17,16,0.16)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
