import type { Metadata } from "next";

import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";
import { sectionMeta } from "@/lib/meta";
import { FONTS, SPEC, mm } from "@/lib/site";

const section = SECTIONS.prices;

export const metadata: Metadata = sectionMeta(section);

/** Что известно точно — снято с чертежа заказчика. Остальное уточняется. */
const known = [
  { k: "Корпус", v: `${mm(SPEC.plate)} × ${mm(SPEC.plateH)}` },
  { k: "Поле гравировки", v: `${mm(SPEC.field)} × ${mm(SPEC.fieldH)}` },
  { k: "Поле текста", v: `${mm(SPEC.textField)}, ${SPEC.lines} строки` },
  { k: "Поле знака", v: mm(SPEC.iconField) },
  { k: "Шрифт гравировки", v: FONTS[0].label },
  { k: "Корпус", v: "Анодированный металл, 7 цветов" },
  { k: "Крепление", v: "Кольцо с карабином" },
];

const unknown = [
  "Цена за штуку",
  "Минимальный заказ",
  "Объём памяти",
  "Срок изготовления",
];

export default function Page() {
  return (
    <SectionPage section={section}>
      <section className="section-ruled">
        <div className="shell">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.08] font-normal tracking-[-0.02em]">
            Характеристики
          </h2>

          <dl className="mt-[clamp(28px,3.5vw,52px)] grid gap-x-[var(--gutter)] gap-y-5 md:grid-cols-3">
            {known.map((row) => (
              <div key={row.k} className="border-t border-hairline pt-4">
                <dt className="text-[0.75rem] text-ink/65">{row.k}</dt>
                <dd className="mt-1 text-[1.0625rem]">{row.v}</dd>
              </div>
            ))}
            {unknown.map((k) => (
              <div key={k} className="border-t border-hairline pt-4">
                <dt className="text-[0.75rem] text-ink/65">{k}</dt>
                <dd className="mt-1 text-[1.0625rem] text-ink/65">
                  уточняется
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </SectionPage>
  );
}
