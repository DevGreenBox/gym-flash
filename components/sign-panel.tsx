"use client";

import { Cross } from "@/components/icons";

/**
 * Окно выбора картинки из базы — пиктограммы на лицевую или логотипа
 * на оборот. По эскизу заказчика от 08.10: окно прямо в шаге, а не
 * всплывающее; внутри подразделы («предметы», «профессии» и т. п.)
 * и полоса прокрутки. Поиск по картинкам был, но заказчик снял его
 * вместе с остальным поиском на сайте («поиск убираем отовсюду»).
 *
 * Высота окна постоянная, прокручивается только его содержимое: шаг
 * не растёт вместе с базой, и «Далее» под ним не уезжает. Полоса
 * прокрутки видна всегда — заказчик просил её прямо, а спрятанная
 * полоса не говорит, что внизу есть ещё.
 */
export type PanelItem = { id: string; label: string };

export function SignPanel({
  label,
  categories,
  value,
  onPick,
  none,
  tile,
  empty,
}: {
  /** подпись окна для чтения с экрана: «Пиктограмма», «Логотип оборота» */
  label: string;
  categories: { label: string; items: PanelItem[] }[];
  value: string | null;
  onPick: (id: string | null) => void;
  /** первая плитка — вариант без картинки: «Без знака», «Без логотипа» */
  none: string;
  /**
   * Что нарисовать в плитке. `caption: true` — подпись уже есть в самой
   * картинке, второй раз под ней её не печатаем.
   */
  tile: (id: string) => { node: React.ReactNode; caption: boolean };
  /** текст на случай, когда в базе пока ничего нет */
  empty: string;
}) {
  const пусто = categories.every((c) => !c.items.length);

  return (
    <div
      role="group"
      aria-label={label}
      className="overflow-hidden rounded-card border border-hairline"
    >
      <div className="panel-scroll h-[min(46vh,340px)] overflow-y-auto overscroll-contain p-4">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          <li>
            <Плитка выбран={value === null} onClick={() => onPick(null)} подпись={none}>
              <Cross className="size-6 text-ink/45" />
            </Плитка>
          </li>
        </ul>

        {categories.map((c) => (
          <section key={c.label} className="mt-6">
            <h3 className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
              {c.label}
            </h3>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {c.items.map((it) => {
                const t = tile(it.id);
                return (
                  <li key={it.id}>
                    <Плитка
                      выбран={value === it.id}
                      onClick={() => onPick(it.id)}
                      подпись={it.label}
                      подписьВРисунке={t.caption}
                    >
                      {t.node}
                    </Плитка>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {пусто ? (
          <p className="mt-6 max-w-[46ch] text-[0.875rem] leading-relaxed text-ink/65">
            {empty}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Плитка базы. Картинка — маской: файлы белые, для металла, а на бумаге
 * им нужен цвет текста плитки. Поле картинки — вся ширина плитки и 64 px
 * в высоту, рисунок вписывается в него целиком: широкий логотип
 * не вылезает на соседей, узкий знак встаёт по центру.
 */
export function MaskArt({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="block h-16 w-full bg-current"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

function Плитка({
  выбран,
  onClick,
  подпись,
  подписьВРисунке = false,
  children,
}: {
  выбран: boolean;
  onClick: () => void;
  подпись: string;
  подписьВРисунке?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={выбран}
      className={`grid h-full min-h-28 w-full cursor-pointer place-items-center content-center gap-2 rounded-field border px-2 py-3 transition-colors duration-300 ${
        выбран
          ? "border-ink text-ink"
          : "border-hairline text-ink/70 hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
      <span
        className={
          подписьВРисунке ? "sr-only" : "text-center text-[0.75rem] leading-tight"
        }
      >
        {подпись}
      </span>
    </button>
  );
}
