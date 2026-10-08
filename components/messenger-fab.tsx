"use client";

import { Chat, Send } from "@/components/icons";
import { MESSENGERS } from "@/lib/site";

const ICON: Record<string, typeof Send> = { telegram: Send, max: Chat };

/**
 * Постоянный переход в мессенджер.
 *
 * По эскизам заказчика от 08.10: подпись «Есть вопросы?» и рядом сразу
 * оба мессенджера — MAX и Telegram, без раскрытия по нажатию. Круглый
 * значок без слов читался как «MAX», и второго мессенджера никто
 * не находил; спрятанный за нажатием — тоже.
 *
 * На широком экране мессенджеры стоят в шапке, а шапка липкая — они
 * и так под рукой на любой прокрутке. На телефоне в строку 390 px
 * логотип, значки, корзина и бургер не помещаются, поэтому здесь
 * отдельный блок в углу: он не зависит от того, где человек находится
 * на странице.
 *
 * Угол правый нижний — там его ищет большой палец, и там он не спорит
 * с липкой панелью конструктора, которая живёт под шапкой сверху.
 * Ниже сидит на системном отступе (`safe-area`), иначе на айфоне
 * кнопки встают на полосу жестов.
 */
export function MessengerFab() {
  const живые = MESSENGERS.filter((m) => m.href);

  // ни одной ссылки — вести некуда, и висеть в углу незачем
  if (!живые.length) return null;

  return (
    <div
      role="group"
      aria-label="Есть вопросы? Напишите нам"
      className="no-print fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-2 md:hidden"
    >
      {/* подпись — не кнопка: нажимают значок нужного мессенджера */}
      <span
        aria-hidden
        className="rounded-pill border border-hairline bg-paper px-4 py-2.5 text-[0.875rem] font-medium shadow-[0_10px_24px_rgba(17,17,16,0.12)]"
      >
        Есть вопросы?
      </span>
      {живые.map((m) => {
        const I = ICON[m.id] ?? Chat;
        return (
          <a
            key={m.id}
            href={m.href!}
            target="_blank"
            rel="noreferrer"
            aria-label={`Написать в ${m.label}`}
            className="grid size-12 place-items-center rounded-pill bg-ink text-paper shadow-[0_12px_28px_rgba(17,17,16,0.28)] transition-transform duration-150 active:scale-95"
          >
            <I className="size-5" />
          </a>
        );
      })}
    </div>
  );
}
