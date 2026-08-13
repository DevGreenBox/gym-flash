import type { Metadata } from "next";

import { AskForm } from "@/components/ask-form";
import { Cta } from "@/components/cta";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Контакты" };

export default function Page() {
  return (
    <>
      <section className="section">
        <div className="shell grid12">
          <div className="md:col-span-6">
            <h1 className="text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.04] font-normal tracking-[-0.03em]">
              Контакты
            </h1>

            <dl className="mt-[clamp(32px,4vw,56px)] space-y-6">
              <Row k="Телефон">
                <a
                  href={site.phoneHref}
                  className="transition-colors duration-150 hover:text-ink/65"
                >
                  {site.phone}
                </a>
              </Row>
              <Row k="Почта">
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors duration-150 hover:text-ink/65"
                >
                  {site.email}
                </a>
              </Row>
              <Row k="Город">{site.city}</Row>
              <Row k="Реквизиты">{site.legal}</Row>
              <Row k="WhatsApp и Telegram">
                <span className="text-ink/65">уточняются</span>
              </Row>
            </dl>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <p className="rule text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
              Написать
            </p>
            <div className="mt-7">
              <AskForm />
            </div>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline pt-4">
      <dt className="text-[0.75rem] text-ink/65">{k}</dt>
      <dd className="mt-1 text-[1.25rem]">{children}</dd>
    </div>
  );
}
