import type { Metadata } from "next";

import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";
import { sectionMeta } from "@/lib/meta";

const section = SECTIONS.delivery;

export const metadata: Metadata = sectionMeta(section);

export default function Page() {
  return (
    <SectionPage section={section}>
      <section className="section">
        <div className="shell">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.08] font-normal tracking-[-0.02em]">
            Пункты выдачи
          </h2>

          {/* TODO(client): виджет выбора ПВЗ СДЭК — нужен договор и ключ API */}
          <div className="mt-[clamp(28px,3.5vw,52px)] md:max-w-[720px]">
            <div className="grid aspect-[16/10] place-items-center rounded-card border border-dashed border-ink/20 px-8 text-center">
              <p className="text-[0.875rem] text-ink/65">
                Карта пунктов выдачи — уточняется.
              </p>
            </div>
            <p className="mt-4 text-[0.75rem] text-ink/65">
              Стоимость считается после заявки.
            </p>
          </div>
        </div>
      </section>
    </SectionPage>
  );
}
