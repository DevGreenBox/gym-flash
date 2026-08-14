import { Chat, Send } from "@/components/icons";
import { MESSENGERS } from "@/lib/site";

const ICON: Record<string, typeof Send> = { telegram: Send, max: Chat };

/**
 * «Связаться с нами» — мессенджеры рядом с корзиной и в подвале.
 *
 * Ссылок заказчик пока не дал. Кнопка всё равно стоит на своём месте,
 * но неактивной и с подписью «скоро»: выдуманный адрес чата уводит
 * человека в никуда, а спрятанная кнопка ломает ряд, под который
 * свёрстан и подвал, и шапка. Как только ссылки появятся в `lib/site.ts`,
 * кнопки оживут сами.
 */
export function Messengers({
  compact = false,
  className = "",
}: {
  /** в шапке — только значки, подписи туда не помещаются */
  compact?: boolean;
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {MESSENGERS.map((m) => {
        const Icon = ICON[m.id] ?? Chat;
        const label = compact ? m.label : m.label;
        const inner = (
          <>
            <Icon className="size-4" />
            {!compact ? label : null}
          </>
        );
        const shape = compact
          ? "grid size-10 place-items-center rounded-pill border"
          : "inline-flex h-10 items-center gap-2 rounded-pill border px-4 text-[0.8125rem]";

        return (
          <li key={m.id}>
            {m.href ? (
              <a
                href={m.href}
                target="_blank"
                rel="noreferrer"
                aria-label={compact ? `Написать в ${m.label}` : undefined}
                className={`${shape} border-hairline transition-colors duration-300 hover:border-ink/40 hover:text-ink`}
              >
                {inner}
              </a>
            ) : (
              <span
                aria-disabled="true"
                title={`${m.label} — ссылка уточняется`}
                className={`${shape} cursor-default border-dashed border-hairline text-ink/45`}
              >
                {inner}
                {!compact ? (
                  <span className="text-[0.6875rem] text-ink/45">скоро</span>
                ) : (
                  <span className="sr-only">{`${m.label} — ссылка уточняется`}</span>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
