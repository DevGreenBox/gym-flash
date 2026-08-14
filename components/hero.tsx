import { getImageProps } from "next/image";
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
const HERO = ["hero-1", "hero-2", "hero-3"];

/**
 * Телефону достаётся свой кадр, а не тот же самый.
 *
 * Все три сцены сняты широко: предмет по краям, середина пустая. В окне
 * телефона широкий кадр обрезался ровно до середины — до пустой стены,
 * растянутой в два с половиной раза, и первый экран выглядел грязным.
 * Вертикальные кадры вырезаны по стороне с предметом (`prepare-hero.py`),
 * и телефон показывает книги, обруч и коробку, а не стену.
 *
 * `<picture>` вместо двух картинок с переключением по классу: браузер
 * скачивает только тот кадр, который покажет.
 */
/* Телефон получает кадр чуть скромнее окна: 1080 px вместо 1200 при
   тройной плотности. Меньше брать нельзя — на 830 px браузер растягивает
   кадр в полтора раза сам, и первый экран снова мутнеет; больше незачем —
   настоящей детали в вертикальном вырезе всё равно 677 px. */
const SIZES = { мобильный: "90vw", широкий: "100vw" };

function Frame({ name, priority }: { name: string; priority: boolean }) {
  const common = { alt: "", priority };
  const {
    props: { srcSet: wide },
  } = getImageProps({
    ...common,
    sizes: SIZES.широкий,
    src: `/photo/${name}.jpg`,
    width: 2400,
    height: 1351,
  });
  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({
    ...common,
    sizes: SIZES.мобильный,
    src: `/photo/${name}-tall.jpg`,
    width: 1356,
    height: 1882,
  });

  return (
    <picture>
      {/* `sizes` нужен каждому источнику свой: на <img> он до <source>
          не достаёт, и браузер молча считает по 100vw — из-за этого
          телефон тянул кадр вдвое тяжелее нужного */}
      <source media="(min-width: 768px)" srcSet={wide} sizes={SIZES.широкий} />
      <source srcSet={tall} sizes={SIZES.мобильный} />
      {/* разметку тега даёт getImageProps — оптимизация и srcset те же,
          что у <Image>, просто кадра два и выбирает между ними <picture> */}
      <img
        {...rest}
        alt=""
        /* второй и третий кадры нужны на шестой и двенадцатой секунде,
           поэтому в очереди они уступают: иначе три фотографии тянутся
           разом и первая — та, что видна сразу, — приходит последней */
        fetchPriority={priority ? "high" : "low"}
        className="hero-photo absolute inset-0 size-full object-cover object-[center_38%]"
      />
    </picture>
  );
}

export function Hero() {
  return (
    <section className="hero relative isolate overflow-hidden">
      {/* Кадр на каждое обещание: фон меняется вместе со строкой.
          Замерено под завесой: самая тёмная точка под заголовком даёт
          8,9 : 1 на первом кадре, 9,0 на втором и 9,2 на третьем. */}
      {HERO.map((name, i) => (
        <span key={name} aria-hidden className="hero-frame absolute inset-0 -z-20">
          <Frame name={name} priority={i === 0} />
        </span>
      ))}

      {/* завеса: молочный к центру и вниз, чтобы текст читался на любом
          кадре. Сила задана в стилях: на телефоне она своя — там кадр
          вырезан по предмету и под текстом стоит не пустая стена */}
      <div aria-hidden className="hero-veil absolute inset-0 -z-10" />

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
