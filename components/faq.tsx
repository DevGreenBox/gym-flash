/**
 * Частые вопросы рядом с формой: на половину из них человек находит ответ
 * сам и не пишет. Отвечаем только тем, что знаем — цены, сроки и объём
 * памяти сюда не попали, их заказчик не давал.
 *
 * Раскрывается штатным `<details>`: работает без JavaScript, доступно
 * с клавиатуры, читается скринридером как «раскрыто / свёрнуто».
 */
const QUESTIONS = [
  {
    q: "Можно заказать один комплект на семь предметов?",
    a: "Да, для этого в конструкторе есть кнопка «Собрать комплект»: по флешке на каждый предмет, надпись одна, цвета — как в комплекте на фотографии.",
  },
  {
    q: "Можно поменять надпись после заказа?",
    a: "Пока заявка не подтверждена — да. В корзине у каждой флешки есть «Изменить надпись», а после отправки напишите или позвоните.",
  },
  {
    q: "Куда доставляете?",
    a: "По России и ближайшему зарубежью, транспортной компанией СДЭК. Стоимость считается после заявки.",
  },
];

export function Faq() {
  return (
    /* тянется на высоту формы: вопросы распределяются по колонке,
       а не жмутся к её верху. Рамка и подложка — те же, что у формы,
       только лавандовые: блок «Связь» читается одной парой, а не формой
       и списком рядом с ней. */
    <div className="flex w-full flex-col rounded-card border border-hairline bg-[color-mix(in_oklab,var(--color-lavender)_12%,var(--color-paper))] p-[clamp(24px,3vw,40px)]">
      <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
        Частые вопросы
      </p>

      <ul className="mt-5 flex flex-1 flex-col border-t border-hairline">
        {QUESTIONS.map((item) => (
          <li key={item.q} className="flex flex-1 flex-col border-b border-hairline">
            <details className="group flex flex-1 flex-col justify-center">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 py-4 text-[0.9375rem] leading-snug transition-colors duration-300 hover:text-ink/70 [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{item.q}</span>
                {/* плюс превращается в минус поворотом, а не подменой знака */}
                <span
                  aria-hidden
                  className="relative mt-1 size-3 shrink-0 text-ink/65"
                >
                  <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-current" />
                  <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 rotate-90 bg-current transition-transform duration-300 ease-out group-open:rotate-0" />
                </span>
              </summary>
              <p className="pb-5 text-[0.875rem] leading-relaxed text-ink/70">
                {item.a}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
