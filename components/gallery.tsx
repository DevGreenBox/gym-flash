"use client";

import { useState } from "react";

import { FlashDrive } from "@/components/flash-drive";
import { ApparatusIcon } from "@/components/icons";
import { APPARATUS, DEFAULT_COLOR_FOR, colorById } from "@/lib/site";

/**
 * Раскладка гравировок с фильтром по предмету. Рисуется вектором, поэтому
 * работает без единой фотографии и показывает ровно то, что уйдёт на станок.
 * Фамилии — заведомо демонстрационные: это не портфолио выполненных заказов,
 * о чём прямо сказано в подписи под разделом.
 */
const SAMPLES: { lines: [string, string, string]; apparatusId: string }[] = [
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "bp" },
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "hoop" },
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "ball" },
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "clubs" },
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "ribbon" },
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "rope" },
  { lines: ["Иванова", "Амелия", "2017"], apparatusId: "training" },
  { lines: ["Соколова", "Вероника", "2019"], apparatusId: "hoop" },
  { lines: ["Соколова", "Вероника", "2019"], apparatusId: "ribbon" },
  { lines: ["Мельник", "Ярослава", "2015"], apparatusId: "clubs" },
  { lines: ["Мельник", "Ярослава", "2015"], apparatusId: "rope" },
  { lines: ["Абдуллаева", "Сафия", "2020"], apparatusId: "ball" },
  { lines: ["Абдуллаева", "Сафия", "2020"], apparatusId: "bp" },
  { lines: ["Черных", "Владислава", "2018"], apparatusId: "training" },
  { lines: ["Черных", "Владислава", "2018"], apparatusId: "hoop" },
  { lines: ["Гаспарян", "Милана", "2021"], apparatusId: "ribbon" },
];

export function Gallery() {
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter
    ? SAMPLES.filter((s) => s.apparatusId === filter)
    : SAMPLES;

  return (
    <section className="section">
      <div className="shell">
        <div className="flex flex-wrap items-baseline justify-between gap-6 border-t border-hairline pt-8">
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            По предметам
          </p>
          <p aria-live="polite" className="text-[0.8125rem] text-ink/65">
            {/* оговорка остаётся: фамилии здесь придуманы, и выдавать
                раскладку за портфолио выполненных заказов нельзя */}
            Фамилии для примера · {shown.length} из {SAMPLES.length}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={`chip inline-flex h-10 cursor-pointer items-center rounded-pill border px-4 text-[0.8125rem] transition-colors duration-300 ${
              filter === null
                ? "border-ink text-paper"
                : "border-hairline text-ink/70 hover:text-ink"
            }`}
          >
            Все
          </button>
          {APPARATUS.map((a) => {
            const active = filter === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setFilter(active ? null : a.id)}
                aria-pressed={active}
                className={`chip inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill border px-3.5 text-[0.8125rem] transition-colors duration-300 ${
                  active
                    ? "border-ink text-paper"
                    : "border-hairline text-ink/70 hover:text-ink"
                }`}
              >
                <ApparatusIcon id={a.id} className="size-4" />
                {a.label}
              </button>
            );
          })}
        </div>

        <ul className="mt-[clamp(28px,3.5vw,52px)] grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s, i) => {
            const color = colorById(DEFAULT_COLOR_FOR[s.apparatusId]);
            return (
              <li key={`${s.lines[0]}-${s.apparatusId}-${i}`} className="group">
                <div
                  className="rounded-card px-4 py-8"
                  style={{
                    background: `color-mix(in oklab, ${color.hex} 10%, var(--color-paper))`,
                  }}
                >
                  <FlashDrive
                    /* первая карточка раскладки — самый крупный элемент
                       страницы; остальные пятнадцать грузятся обычной
                       очередью, иначе они перебивают её же */
                    priority={i === 0}
                    color={color.hex}
                    apparatusId={s.apparatusId}
                    lines={s.lines}
                    chain={false}
                    /* сетка перестаёт быть таблицей картинок: под курсором
                       флешка отделяется от подложки, как предмет от стола */
                    className="w-full drop-shadow-[0_12px_20px_rgba(17,17,16,0.14)] transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-1.5"
                  />
                </div>
                <p className="mt-3 text-[0.8125rem] text-ink/65">
                  {color.name} ·{" "}
                  {APPARATUS.find((a) => a.id === s.apparatusId)?.label}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
