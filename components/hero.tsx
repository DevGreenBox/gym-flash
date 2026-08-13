import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";

/**
 * Первый экран минималистичный и центрированный: фон, две строки и одна
 * кнопка. Выбор цвета, предмета и надписи ждёт в конструкторе — здесь
 * человеку нужно понять, куда он попал, и нажать один раз.
 *
 * Текст лежит на фотографии, поэтому под ним стоит завеса молочного:
 * самая тёмная точка центра кадра — 104 из 255, под завесой она даёт
 * 8,9 : 1 к графиту, то есть заголовок читается везде.
 */
/**
 * Три кадра под три строки заголовка. Порядок общий с `.hero-swipe`
 * в `globals.css`: «Сохрани момент» — учёба, «Музыка твоей победы» —
 * гимнастика, «Подари впечатления» — подарок.
 */
const HERO = ["/photo/hero-1.jpg", "/photo/hero-2.jpg", "/photo/hero-3.jpg"];

export function Hero() {
  return (
    <section className="hero relative isolate overflow-hidden">
      {/* Кадр на каждое обещание: фон меняется вместе со строкой.
          Замерено под завесой: самая тёмная точка под заголовком даёт
          8,9 : 1 на первом кадре, 9,0 на втором и 9,2 на третьем. */}
      {HERO.map((src, i) => (
        <span key={i} aria-hidden className="hero-frame absolute inset-0 -z-20">
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="hero-photo object-cover object-[center_38%]"
          />
        </span>
      ))}

      {/* завеса: молочный к центру и вниз, чтобы текст читался на любом кадре */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(76% 82% at 50% 50%, color-mix(in oklab, var(--color-paper) 68%, transparent), color-mix(in oklab, var(--color-paper) 22%, transparent) 74%), linear-gradient(to bottom, transparent 62%, var(--color-paper))",
        }}
      />

      {/* Текст стоит ровно посередине кадра — и по ширине, и по высоте.
          Поле фотографии под кнопкой работает межблочным отступом:
          следующий блок своего сверху не добавляет. */}
      <div className="rise shell flex min-h-[min(70vh,560px)] flex-col items-center justify-center py-[clamp(56px,10vw,140px)] text-center md:min-h-[min(84vh,700px)]">
        {/* Три обещания сменяют друг друга сами, по три секунды каждое.
            Смену считает браузер: ни таймера, ни клиентского компонента —
            первый экран остаётся серверным и грузится без JavaScript. */}
        <h1 className="hero-swipe grid max-w-[16ch] text-[clamp(2.6rem,6.4vw,5rem)] leading-[1.02] tracking-[-0.02em] text-balance">
          <span>Сохрани момент</span>
          <span>Музыка твоей победы</span>
          <span>Подари впечатления</span>
        </h1>

        <p className="mt-8 max-w-[36ch] text-[1.0625rem] leading-[1.65] text-ink/70">
          Флешки для художественной гимнастики
          <br className="hidden sm:block" /> с персональной гравировкой
        </p>

        <Link
          href="#constructor"
          className="group mt-11 inline-flex h-13 items-center gap-2.5 rounded-pill bg-ink px-7 text-[0.9375rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
        >
          Выбрать свою флешку
          <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
        </Link>
      </div>
    </section>
  );
}
