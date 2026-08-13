import { AskForm } from "@/components/ask-form";
import { Faq } from "@/components/faq";
import { Constructor } from "@/components/constructor";
import { Cta } from "@/components/cta";
import { Directions } from "@/components/directions";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <>
      <Hero />
      <Directions />
      <Constructor />

      {/* ——— Вопросы ——— */}
      <section id="ask" className="scroll-mt-20 section">
        <div className="shell">
          <p className="rule text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            Связь
          </p>
          <h2 className="mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.06] font-normal tracking-[-0.02em]">
            Спросите до заказа
          </h2>
          <div className="mt-[clamp(28px,3.5vw,52px)] grid12 items-stretch">
            <div className="md:col-span-7">
              <AskForm />
            </div>
            {/* половина вопросов снимается здесь и до письма не доходит */}
            <div className="flex md:col-span-5">
              <Faq />
            </div>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
