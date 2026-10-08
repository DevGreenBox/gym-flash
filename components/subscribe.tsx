"use client";

import { useId, useState } from "react";

import { ArrowRight } from "@/components/icons";
import { FORMS_ARE_MOCKED } from "@/lib/site";

/**
 * Рассылка в подвале — по правке заказчика от 08.10 (раздел 5): новинки
 * и акции приходят в мессенджер, а не на почту. Поэтому поля для адреса
 * нет: только согласие и кнопка. Без отметки кнопка не отправит —
 * подписка без согласия ничего не стоит.
 *
 * TODO(client): канал или бот рассылки в MAX и Telegram — пока подписка
 * никуда не уходит, и блок говорит об этом прямо.
 */
export function Subscribe() {
  const [sent, setSent] = useState(false);
  const id = useId();

  if (sent) {
    return (
      <p className="mt-4 text-[0.9375rem] leading-relaxed">
        Готово — новинки и акции придут в мессенджер.
        <span className="mt-1 block text-[0.8125rem] text-ink/65">
          Сайт ещё не подключён к рассылке — подписка никуда не ушла.
        </span>
      </p>
    );
  }

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (FORMS_ARE_MOCKED) console.info("Подписка: новинки и акции в мессенджеры");
        setSent(true);
      }}
    >
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 text-[0.875rem] leading-snug text-ink/80"
      >
        <input
          id={id}
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--color-ink)]"
        />
        Информация о новинках и акциях в мессенджеры
      </label>
      <button
        type="submit"
        className="group mt-4 inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-pill bg-ink px-5 text-[0.8125rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
      >
        Подписаться
        <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
      </button>
    </form>
  );
}
