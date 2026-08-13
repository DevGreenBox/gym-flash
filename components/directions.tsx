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
  // `scrolls: false` — лента влезла целиком, листать нечего
  const [edge, setEdge] = useState({ start: true, end: true, scrolls: false });
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft >= max - 4,
      scrolls: max > 4,
    });
  }, []);

  useEffect(() => {
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [measure]);

  const step = useCallback((dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const by = card ? card.offsetWidth + 16 : el.clientWidth;
    const max = el.scrollWidth - el.clientWidth;
    const at = el.scrollLeft;
    // Шаг равен карточке, а последний остаток пути короче — поэтому
    // перелёт упирается в конец ленты, а не считается её концом:
    // иначе последняя карточка недостижима. К началу возвращаемся,
    // только когда уже стоим в конце — это круг автопрокрутки.
    const next =
      dir === 1 && at >= max - 4
        ? 0
        : Math.min(Math.max(at + by * dir, 0), max);
    el.scrollTo({ left: next, behavior: "smooth" });
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

          {/* когда листать нечего, двух погашенных кнопок в углу быть
              не должно: это управление без управляемого */}
          {edge.scrolls ? (
            <div className="flex gap-2">
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
          ) : null}
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
                    chain={false}
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
