"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight } from "@/components/icons";
import { CATEGORIES, colorById } from "@/lib/site";

/**
 * Направления лентой: флешка стоит над своим текстом, по одному шагу
 * за нажатие. Стрелки гаснут, когда листать больше некуда — на широком
 * экране помещаются все три, и обе стрелки выключены сразу.
 * Автопрокрутка раз в пять секунд, останавливается под курсором,
 * под пальцем и при `prefers-reduced-motion`.
 */
const EVERY = 5000;

export function Directions() {
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [measure]);

  const step = useCallback((dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const cards = [...el.children] as HTMLElement[];
    if (!cards.length) return;
    const max = el.scrollWidth - el.clientWidth;
    const at = el.scrollLeft;
    /* Шаг считается по самим карточкам, а не по «ширина плюс отступ».
       Арифметика верна, только пока лента стоит ровно на границе
       карточки; палец останавливает её где угодно, и следующий шаг
       промахивался мимо — на телефоне это читалось как «не листает».
       Последняя остановка упирается в конец ленты: её левый край
       дальше, чем лента может доехать. */
    const stops = cards.map((c) =>
      Math.min(c.offsetLeft - cards[0].offsetLeft, max),
    );
    if (dir === 1 && at >= max - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" }); // круг автопрокрутки
      return;
    }
    // где стоим: ближайшая остановка слева от текущего положения
    const here = stops.reduce((best, x, i) => (x <= at + 4 ? i : best), 0);
    const next = Math.min(Math.max(here + dir, 0), stops.length - 1);
    el.scrollTo({ left: stops[next], behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paused) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = rail.current;
    // на широком экране лента не прокручивается — крутить нечего
    if (still || !el || el.scrollWidth <= el.clientWidth + 4) return;
    const id = setInterval(() => step(1), EVERY);
    return () => clearInterval(id);
  }, [paused, step, edge]);

  return (
    <section className="section">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="rule text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
              Направления
            </p>
            <h2 className="mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.06] font-normal tracking-[-0.02em]">
              Зачем нужна именная флешка
            </h2>
          </div>

          {/* Когда листать нечего, двух погашенных кнопок в углу быть
              не должно — но условие берём из вёрстки, а не из замера.
              Ниже `lg` карточка шире трети ленты и лента листается
              всегда, от `lg` три карточки встают ровно по ширине.
              Замером это решалось после гидратации: кнопки появлялись
              задним числом, строка переносилась, и всё, что ниже,
              съезжало вниз. Из-за этого кнопка героя не доводила
              до конструктора — прыжок случался до сдвига. */}
          <div className="flex gap-2 lg:hidden">
            <Arrow
              dir={-1}
              disabled={edge.start}
              onClick={() => step(-1)}
              label="Назад"
            />
            <Arrow
              dir={1}
              disabled={edge.end}
              onClick={() => step(1)}
              label="Вперёд"
            />
          </div>
        </div>

        <ul
          ref={rail}
          onScroll={measure}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onPointerDown={() => setPaused(true)}
          className="mt-[clamp(28px,3.5vw,52px)] flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((c) => (
            <li
              key={c.href}
              /* Последняя карточка привязывается концом, а не началом:
                 её начало лежит дальше, чем лента вообще может доехать,
                 и при `mandatory` движок отбрасывал ленту на предыдущую
                 точку — до третьей карточки было не долистать. */
              className="w-[min(78vw,340px)] shrink-0 snap-start last:snap-end lg:w-[calc((100%-2rem)/3)]"
            >
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-card border border-hairline p-5 transition-colors duration-300 hover:border-ink/25"
              >
                {/* флешка выровнена по тексту: та же ширина, тот же край */}
                <div
                  className="rounded-field px-4 py-7"
                  style={{
                    background: `color-mix(in oklab, ${colorById(c.preview.colorId).hex} 10%, var(--color-paper))`,
                  }}
                >
                  <FlashDrive
                    color={colorById(c.preview.colorId).hex}
                    apparatusId={c.preview.apparatusId}
                    lines={c.preview.lines}
                    /* флешка приподнимается над своей подложкой — карточка
                       отвечает на курсор предметом, а не рамкой */
                    className="w-full drop-shadow-[0_12px_20px_rgba(17,17,16,0.14)] transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-1.5"
                  />
                </div>

                <h3 className="mt-6 font-display text-[1.35rem] leading-[1.15] tracking-[-0.02em]">
                  {c.label}
                </h3>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink/70">
                  {c.note}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] text-ink/65 transition-colors duration-300 group-hover:text-ink">
                  Подробнее
                  <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Arrow({
  dir,
  disabled,
  onClick,
  label,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-11 cursor-pointer place-items-center rounded-pill border border-hairline transition-colors duration-300 hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-hairline"
    >
      <ArrowRight className={`size-4 ${dir === -1 ? "rotate-180" : ""}`} />
    </button>
  );
}
