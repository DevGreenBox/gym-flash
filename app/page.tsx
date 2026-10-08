import { AskForm } from "@/components/ask-form";
import { Faq } from "@/components/faq";
import { Directions } from "@/components/directions";
import { Hero } from "@/components/hero";
import { WorkGroups } from "@/components/works";

/**
 * Главная по эскизу заказчика от 08.10: карусель → «Создай свою флешку»
 * → примеры работ (те же карусели, что на их странице) → частые вопросы
 * → контакты. Конструктора на главной нет — в эскизе
 * он зачёркнут: в конструкторы ведёт блок направлений, у каждого
 * направления свой. Призыва в конце тоже нет — он повторял бы
 * «Создай свою флешку» двумя экранами ниже.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Directions />
      <WorkGroups home />

      {/* ——— Вопросы и связь ———
          Сначала ответы, потом форма: в эскизе «Частые вопросы» стоят
          перед контактами. На телефоне пара встаёт в том же порядке.
          TODO(client): блок контактов — по разделу 5, пока его место
          держит форма вопроса. */}
      <section id="ask" className="scroll-mt-20 section">
        <div className="shell">
          <p className="rule text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            Связь
          </p>
          <h2 className="mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.06] font-normal tracking-[-0.02em]">
            Спросите до заказа
          </h2>
          <div className="mt-[clamp(28px,3.5vw,52px)] grid12 items-stretch">
            {/* половина вопросов снимается здесь и до письма не доходит */}
            <div className="flex md:col-span-5">
              <Faq />
            </div>
            <div className="md:col-span-7">
              <AskForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
