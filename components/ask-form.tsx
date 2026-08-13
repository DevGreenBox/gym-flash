"use client";

import { useState } from "react";

import { ArrowRight } from "@/components/icons";
import { FORMS_ARE_MOCKED } from "@/lib/site";

export function AskForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (sent) {
    return (
      <p className="rounded-card border border-hairline bg-[color-mix(in_oklab,var(--color-rose)_16%,var(--color-paper))] p-[clamp(24px,3vw,40px)] text-[1.125rem] leading-relaxed">
        Вопрос записан. Ответим на указанный контакт.
        <span className="mt-2 block text-[0.8125rem] text-ink/65">
          Сайт ещё не подключён к почте — вопрос никуда не ушёл.
        </span>
      </p>
    );
  }

  return (
    <form
      className="space-y-8 rounded-card border border-hairline bg-[color-mix(in_oklab,var(--color-rose)_16%,var(--color-paper))] p-[clamp(24px,3vw,40px)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (sending) return; // двойной клик не отправит вопрос дважды
        setSending(true);
        const data = Object.fromEntries(new FormData(e.currentTarget));
        // TODO(client): почта для заявок
        if (FORMS_ARE_MOCKED) console.info("Вопрос:", data);
        setSent(true);
      }}
    >
      <div className="grid gap-8 sm:grid-cols-2">
        <Field name="name" label="Как вас зовут" required />
        <Field name="contact" label="Телефон или почта" required />
      </div>
      <Field name="question" label="Вопрос" multiline />
      <button
        type="submit"
        disabled={sending}
        className="group inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-pill bg-ink px-6 text-[0.875rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px disabled:cursor-wait disabled:opacity-60"
      >
        {sending ? "Отправляем…" : "Отправить"}
        <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
      </button>
    </form>
  );
}

/**
 * Поле без рамки: серый волосок снизу, поверх которого на фокусе
 * дочерчивается чернильный (`.field` в globals.css).
 */
function Field({
  name,
  label,
  required,
  multiline,
}: {
  name: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const cls =
    "mt-2 w-full border-b border-hairline bg-transparent pb-2.5 text-[1.0625rem] outline-none";

  return (
    <label className="field block">
      <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
        {label}
      </span>
      {multiline ? (
        <textarea name={name} rows={2} className={`${cls} resize-none`} />
      ) : (
        <input name={name} required={required} className={cls} />
      )}
    </label>
  );
}
