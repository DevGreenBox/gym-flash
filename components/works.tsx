"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { DrivePair } from "@/components/drive-pair";
import { FlashDrive } from "@/components/flash-drive";
import { ArrowRight } from "@/components/icons";
import { Media } from "@/components/media";
import { colorById } from "@/lib/site";
import type { Engraving, Work } from "@/lib/works";
import { WORK_GROUPS } from "@/lib/works";

/**
 * «Примеры работ» по эскизу заказчика от 08.10: три блока по направлениям,
 * в каждом — карусель работ и «Создай свою флешку».
 *
 * Карусель листается сама, как лента направлений на главной: шаг раз
 * в пять секунд, пока блок на экране; под курсором, пальцем и фокусом —
 * стоит; при `prefers-reduced-motion` — не листается вовсе. На широком
 * экране рядом стрелки, на телефоне — палец.
 */
export function WorkGroups({ home = false }: { home?: boolean }) {
  // Один и тот же блок стоит на странице «Примеры работ» и на главной
  // (правка заказчика от 08.10). На главной у него свой заголовок
  // и межблочный отступ; на странице заголовок — сама страница.
  const Заголовок = home ? "h3" : "h2";
  return (
    <section
      className={
        home
          ? "section"
          : /* блок принадлежит заголовку страницы: отступ — как между
               заголовком и его блоком, иначе примечание висит в пустоте */
            "pt-[clamp(28px,3.5vw,52px)]"
      }
    >
      <div className="shell">
        {home ? (
          <h2 className="text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.06] font-normal tracking-[-0.02em]">
            Примеры работ
          </h2>
        ) : null}
        <p className={`text-[0.8125rem] text-ink/65 ${home ? "mt-4" : ""}`}>
          Фамилии в примерах вымышленные.
        </p>
        {WORK_GROUPS.map((g) => (
          <WorkGroup key={g.id} {...g} Заголовок={Заголовок} />
        ))}
      </div>
    </section>
  );
}

const EVERY = 5000;

function WorkGroup({
  title,
  href,
  works,
  Заголовок,
}: {
  title: string;
  href: string;
  works: Work[];
  /** h2 на странице работ, h3 — на главной, под общим заголовком блока */
  Заголовок: "h2" | "h3";
}) {
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState(false);

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

  // листаем только то, что видно: три карусели на странице
  // не должны крутиться за краем экрана
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Шаг — до следующего кадра по его левому краю; в конце — к началу. */
  const step = useCallback((dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (dir === 1 && el.scrollLeft >= max - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const cards = [...el.children] as HTMLElement[];
    const stops = cards.map((c) => Math.min(c.offsetLeft - cards[0].offsetLeft, max));
    const here = stops.reduce((best, x, i) => (x <= el.scrollLeft + 4 ? i : best), 0);
    const next = Math.min(Math.max(here + dir, 0), stops.length - 1);
    el.scrollTo({ left: stops[next], behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paused || !seen) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = rail.current;
    if (!el || el.scrollWidth <= el.clientWidth + 4) return;
    const id = setInterval(() => step(1), EVERY);
    return () => clearInterval(id);
  }, [paused, seen, step]);

  const листается = !(edge.start && edge.end);

  return (
    <div className="mt-[clamp(32px,4vw,56px)] border-t border-hairline pt-8">
      <div className="flex items-end justify-between gap-6">
        {/* шрифт задан явно: стили сайта дают дидон только h1 и h2,
            а на главной заголовок направления — h3 */}
        <Заголовок className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">
          {title}
        </Заголовок>
        {листается ? (
          <div className="hidden gap-2 lg:flex">
            <Arrow dir={-1} disabled={edge.start} onClick={() => step(-1)} label="Назад" />
            <Arrow dir={1} disabled={edge.end} onClick={() => step(1)} label="Вперёд" />
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
        aria-label={`Примеры работ: ${title.toLowerCase()}`}
        className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {works.map((w) => (
          <li key={w.label} className={`shrink-0 snap-start last:snap-end ${ФОРМА[w.shape]}`}>
            <WorkFrame work={w} />
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="group mt-6 inline-flex h-12 items-center gap-2.5 rounded-pill border border-ink px-6 text-[0.875rem] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper"
      >
        Создай свою флешку
        <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
      </Link>
    </div>
  );
}

/** Высота кадров одна, ширина — от формы: так карусель и выглядит на эскизе. */
const ФОРМА: Record<Work["shape"], string> = {
  wide: "h-[clamp(220px,26vw,340px)] aspect-[16/10]",
  tall: "h-[clamp(220px,26vw,340px)] aspect-[3/4]",
  square: "h-[clamp(220px,26vw,340px)] aspect-square",
};

const РАТИО: Record<Work["shape"], string> = { wide: "16/10", tall: "3/4", square: "1/1" };

/**
 * Кадр работы. Снимок, если он есть, закрывает кадр целиком; пока его
 * нет — флешки с примерной гравировкой на подложке цвета корпуса.
 */
function WorkFrame({ work }: { work: Work }) {
  if (work.photo) {
    return (
      <Media
        media={work.photo}
        label={work.label}
        ratio={РАТИО[work.shape]}
        className="h-full"
        sizes="(min-width: 1024px) 30vw, 70vw"
      />
    );
  }

  const s = work.scene;
  const первая = s.kind === "stack" ? s.drives[0] : s.drive;
  const цвет = colorById(первая.colorId).hex;

  return (
    <div
      role="img"
      aria-label={`Пример: ${work.label}`}
      className="grid size-full place-items-center overflow-hidden rounded-card px-[8%]"
      style={{ background: `color-mix(in oklab, ${цвет} 11%, var(--color-paper))` }}
    >
      {s.kind === "pair" ? (
        <DrivePair item={s.drive} className="w-full" />
      ) : s.kind === "one" ? (
        <div className="w-full -rotate-[8deg]">
          <Drive e={s.drive} />
        </div>
      ) : (
        /* столбик уже кадра: четыре флешки комплекта влезают в вертикальный
           кадр с полями и на телефоне, и на широком экране */
        <div className="flex w-[78%] flex-col justify-center gap-2.5">
          {s.drives.map((d, i) => (
            <Drive key={i} e={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function Drive({ e }: { e: Engraving }) {
  return (
    <FlashDrive
      color={colorById(e.colorId).hex}
      apparatusId={e.apparatusId}
      lines={e.lines}
      back={e.back}
      backLogo={e.backLogo ?? null}
      className="w-full drop-shadow-[0_10px_16px_rgba(17,17,16,0.14)]"
    />
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
