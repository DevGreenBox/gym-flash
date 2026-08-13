"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { FlashDrive } from "@/components/flash-drive";
import {
  ApparatusIcon,
  ArrowRight,
  Bag,
  Copy,
  Cross,
  Minus,
  Plus,
} from "@/components/icons";
import { addToCart, totalQty, useCart } from "@/lib/cart";
import measures from "@/lib/drive-measures.json";
import type { Item } from "@/lib/engraving";
import {
  addItem,
  duplicateItem,
  forgetRemoved,
  removeItem,
  resetEngraving,
  setApparatus,
  setColor,
  setCustomColor,
  setFont,
  setLine,
  undoRemove,
  useEngraving,
} from "@/lib/engraving";
import { FALLBACK, shownLines } from "@/lib/engraving-view";
import {
  APPARATUS,
  COLORS,
  CUSTOM_COLOR,
  DEFAULT_COLOR_FOR,
  FONTS,
  SPEC,
  apparatusLabel,
  colorById,
  fontById,
  mm,
  resolveColor,
} from "@/lib/site";

/** Год — четыре цифры, остальные строки — до предела пластины. */
const FIELDS = [
  {
    label: "Фамилия",
    hint: FALLBACK[0],
    max: SPEC.charsPerLine,
    digits: false,
  },
  { label: "Имя", hint: FALLBACK[1], max: SPEC.charsPerLine, digits: false },
  { label: "Год", hint: FALLBACK[2], max: 4, digits: true },
] as const;

/** Настройки идут шагами в этом порядке; подписи же стоят на вкладках. */
const STEPS = [
  { title: "Надпись" },
  { title: "Шрифт" },
  { title: "Предмет" },
  { title: "Оттенок" },
];

/**
 * Окно в ленте заказа. Ширина считается от ленты, а не задана в пикселях:
 * четыре окна в кадре на телефоне и на среднем экране, пять на широком.
 * Целое число — обязательное условие: обрезанная пополам ячейка читается
 * как «не влезло», а не как «листается дальше». Межколонник в вычитании
 * повторяет `gap` ленты: 8 px до 1024 и 12 px после.
 */
const TILE =
  "shrink-0 snap-start w-[calc((100%-24px)/4)] lg:w-[calc((100%-36px)/4)] xl:w-[calc((100%-48px)/5)]";

/**
 * Семь полей анодирования жёсткими стопами — промежуточных цветов нет,
 * и оттенки те же, что на корпусе: полоса показывает товар, а не намёк
 * на него.
 */
const STRIP = `linear-gradient(to right, ${COLORS.map(
  (c, i) =>
    `${c.hex} ${(i / COLORS.length) * 100}% ${((i + 1) / COLORS.length) * 100}%`,
).join(", ")})`;

/**
 * Цвет, пригодный для интерфейса: свой оттенок можно выбрать почти белым,
 * и фокусная рамка на молочной бумаге тогда исчезает. Затемняем, пока
 * не наберётся 3 : 1 — порог для нетекстовых элементов по AA.
 */
function readableOnPaper(hex: string) {
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const paper = lum([250, 248, 247]);
  const n = parseInt(hex.slice(1), 16);
  let ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255];

  for (let i = 0; i < 24; i++) {
    if ((paper + 0.05) / (lum(ch) + 0.05) >= 3) break;
    ch = ch.map((c) => Math.round(c * 0.9));
  }
  return `rgb(${ch.join(" ")})`;
}

export function Constructor({
  heading = "Соберите комплект на сезон",
  headingAs: Heading = "h2",
}: {
  /** «комплект на сезон» — про гимнастику; в учёбе и подарке заголовок свой */
  heading?: string;
  /** h1 — когда конструктор и есть содержание страницы */
  headingAs?: "h1" | "h2";
} = {}) {
  const { items, trash } = useEngraving();
  const [added, setAdded] = useState<null | string>(null);
  const [qty, setQty] = useState(1);

  // В работе всегда одна флешка. Разворачивать их все вниз страницы нельзя:
  // комплект на семь предметов растянул бы главную на семь экранов, и до
  // корзины пришлось бы листать мимо шести уже настроенных позиций.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const active = items.find((it) => it.id === pickedId) ?? items[0];

  // Отмена живёт двенадцать секунд: столько нужно, чтобы понять, что убрал
  // не ту флешку, и не столько, чтобы полоса осталась висеть навсегда.
  useEffect(() => {
    if (!trash) return;
    const t = setTimeout(forgetRemoved, 12000);
    return () => clearTimeout(t);
  }, [trash]);

  // заказ не уходит из-за конкретной позиции — её и называем
  const missing = items.find((it) => !it.lines[0].trim());
  const ready = !missing;
  const inCart = totalQty(useCart());

  // Цвет открытой флешки — единственный цвет на странице, его видят
  // и шапка, и подвал, поэтому он живёт на :root.
  //
  // `--brand-ui` — тот же цвет, затемнённый до 3 : 1 с бумагой. Им рисуются
  // фокусная рамка и полоса прочитанного: свой оттенок может быть выбран
  // почти белым, и рамка фокуса на бумаге просто исчезла бы.
  const brand = resolveColor(active.colorId, active.customHex).hex;
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--brand", brand);
    root.setProperty("--brand-ui", readableOnPaper(brand));
  }, [brand]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(null), 4000);
    return () => clearTimeout(t);
  }, [added]);

  const addAll = () => {
    items.forEach((it) =>
      addToCart({
        colorId: it.colorId,
        customHex: it.customHex,
        apparatusId: it.apparatusId,
        fontId: it.fontId,
        lines: shownLines(it.lines),
        qty,
      }),
    );
    const total = items.length * qty;
    setAdded(total > 1 ? `Добавлено: ${total}` : "Добавлено");
  };

  /** Комплект на сезон: по флешке на каждый предмет, цвета — как на фото. */
  const addSet = () => {
    APPARATUS.forEach((a) =>
      addToCart({
        colorId: DEFAULT_COLOR_FOR[a.id],
        apparatusId: a.id,
        fontId: active.fontId,
        lines: shownLines(active.lines),
        qty: 1,
      }),
    );
    setAdded(`Добавлено: ${APPARATUS.length}`);
  };

  /** Убрали открытую — открываем соседнюю, а не выбрасываем в начало. */
  const drop = (id: string) => {
    const at = items.findIndex((it) => it.id === id);
    const neighbour = items[at + 1] ?? items[at - 1];
    removeItem(id);
    if (id === active.id && neighbour) setPickedId(neighbour.id);
  };

  /**
   * Управление заказом переехало в колонку настроек, под шаги: внизу
   * страницы оно стояло в отрыве от того, что настраивают, а справа
   * под панелью шагов пустовало полколонки.
   */
  const order = (
    <div className="mt-8 border-t border-hairline pt-7">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center gap-1 rounded-pill border border-hairline px-1.5">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Убрать один комплект"
            className="grid size-9 cursor-pointer place-items-center rounded-pill text-ink/65 transition-colors duration-150 hover:text-ink"
          >
            <Minus className="size-4" />
          </button>
          <input
            value={qty}
            onChange={(e) =>
              setQty(
                Math.min(
                  99,
                  Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1),
                ),
              )
            }
            inputMode="numeric"
            aria-label="Сколько раз повторить"
            className="h-9 w-9 bg-transparent text-center text-[0.9375rem] tabular-nums outline-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Добавить один комплект"
            className="grid size-9 cursor-pointer place-items-center rounded-pill text-ink/65 transition-colors duration-150 hover:text-ink"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={addAll}
          className="inline-flex h-12 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-pill bg-ink px-6 text-[0.875rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
        >
          <Bag className="size-4" />
          {items.length > 1 ? `В корзину: ${items.length}` : "В корзину"}
        </button>
      </div>

      <Link
        href="/cart"
        className="draw-line tap mt-5 inline-flex items-center gap-2 text-[0.875rem]"
      >
        <Bag className="size-4" />
        {inCart > 0 ? `В корзине: ${inCart}` : "Перейти в корзину"}
        <ArrowRight className="size-4" />
      </Link>

      <p
        aria-live="polite"
        className="mt-5 flex flex-wrap items-baseline gap-x-3 text-[0.8125rem] text-ink/70"
      >
        {added ? (
          <span>{added}</span>
        ) : missing ? (
          /* не просто «впишите фамилию»: кнопка ведёт в ту самую
                   позицию, из-за которой заказ не уходит */
          <button
            type="button"
            onClick={() => setPickedId(missing.id)}
            className="draw-line tap cursor-pointer"
          >
            Впишите фамилию в позиции{" "}
            {String(items.indexOf(missing) + 1).padStart(2, "0")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              resetEngraving();
              setPickedId(null);
              setQty(1);
            }}
            className="draw-line tap cursor-pointer text-ink/65"
          >
            Начать заново
          </button>
        )}
      </p>

      <p className="mt-5 text-[0.75rem] text-ink/65">
        Цена и минимальный заказ — уточняются.
      </p>
    </div>
  );

  return (
    <section id="constructor" className="scroll-mt-20 section">
      <div className="shell">
        {/* без ограничения по ширине: «Соберите комплект на сезон» должно
            стоять одной строкой, 46ch резали его пополам */}
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/65 uppercase">
            Конструктор
          </p>
          <Heading className="mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.06] font-normal tracking-[-0.02em]">
            {heading}
          </Heading>
        </div>

        <DriveItem
          key={active.id}
          item={active}
          n={items.findIndex((it) => it.id === active.id)}
          items={items}
          onPick={setPickedId}
          onAdd={() => setPickedId(addItem())}
          onDuplicate={() => setPickedId(duplicateItem(active.id))}
          onRemove={() => drop(active.id)}
          onRemoveItem={drop}
          onBuildSet={addSet}
          canBuildSet={!!active.lines[0].trim()}
          order={order}
        />

        {/* Убранную позицию можно вернуть на её место со всей настройкой:
            семь флешек собираются не за минуту, и одно неверное нажатие
            не должно стоить всей работы. */}
        {trash ? (
          <div
            role="status"
            className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-card border border-hairline p-4"
          >
            <p className="text-[0.875rem]">
              Убрана флешка: {apparatusLabel(trash.item.apparatusId)}
              {trash.item.lines[0].trim() ? ` · ${trash.item.lines[0]}` : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                const back = undoRemove();
                if (back) setPickedId(back);
              }}
              className="inline-flex h-10 cursor-pointer items-center rounded-pill border border-ink px-5 text-[0.8125rem] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              Вернуть
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Одна флешка: превью слева, три шага справа. Своё состояние, свои хуки. */
function DriveItem({
  item,
  n,
  items,
  onPick,
  onAdd,
  onDuplicate,
  onRemove,
  onRemoveItem,
  onBuildSet,
  canBuildSet,
  order,
}: {
  item: Item;
  n: number;
  items: Item[];
  onPick: (id: string) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onRemoveItem: (id: string) => void;
  onBuildSet: () => void;
  canBuildSet: boolean;
  /** нижняя часть заказа: количество, корзина, примечание */
  order: React.ReactNode;
}) {
  const total = items.length;
  const [focused, setFocused] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const fieldRefs = useRef<(HTMLInputElement | null)[]>([]);
  const apparatusRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Идентификаторы связывают вкладку с её панелью. У каждой позиции свои:
  // на странице может быть открыт только один набор, но `id` обязан быть
  // уникальным в документе.
  const uid = useId();
  const tabId = `${uid}-tab`;
  const paneId = `${uid}-pane`;

  /**
   * Клик по строке гравировки ведёт в её поле. Если открыт другой шаг,
   * сначала переключаемся на «Надпись» и ждём перерисовки: у скрытой
   * панели `visibility: hidden`, и фокус на неё не встаёт.
   */
  const pending = useRef<number | null>(null);

  useEffect(() => {
    if (step !== 0 || pending.current === null) return;
    fieldRefs.current[pending.current]?.focus({ preventScroll: true });
    pending.current = null;
  }, [step]);

  /** Вкладки — одна остановка таба, внутри ходят стрелками. */
  const onTabsKey = (e: React.KeyboardEvent) => {
    const d: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const move = d[e.key];
    if (move === undefined && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? STEPS.length - 1
          : (step + move + STEPS.length) % STEPS.length;
    setStep(next);
    tabsRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  const color = resolveColor(item.colorId, item.customHex);
  const font = fontById(item.fontId);
  const shown = shownLines(item.lines);
  const colorIndex = COLORS.findIndex((c) => c.id === item.colorId);
  const apparatus = apparatusLabel(item.apparatusId);

  /**
   * Группа предметов объявлена радиогруппой — значит и вести себя должна
   * как радиогруппа: в табе она одна остановка, внутри ходят стрелками.
   * Семь отдельных остановок таба на одном выборе — это обещание,
   * которого разметка не выполняла.
   */
  const onApparatusKey = (e: React.KeyboardEvent) => {
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    const d = step[e.key];
    if (d === undefined && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();

    // восьмой вариант — «без знака», он идёт последним в ряду
    const ids: (string | null)[] = [...APPARATUS.map((a) => a.id), null];
    const now = ids.indexOf(item.apparatusId);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? ids.length - 1
          : (now + d + ids.length) % ids.length;

    setApparatus(item.id, ids[next]);
    apparatusRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [next]?.focus();
  };

  /**
   * Тычок по знаку на пластине ставит следующий предмет по кругу — и только
   * его: цвет корпуса остаётся выбранный. Перебирая знаки, человек смотрит
   * на знаки, и подмена оттенка под каждым нажатием сбивала бы уже
   * найденный цвет.
   */
  const cycleApparatus = () => {
    const now = APPARATUS.findIndex((a) => a.id === item.apparatusId);
    setApparatus(item.id, APPARATUS[(now + 1) % APPARATUS.length].id, false);
  };

  const focusField = (i: number) => {
    fieldRefs.current[i]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
    if (step === 0) {
      fieldRefs.current[i]?.focus({ preventScroll: true });
      return;
    }
    pending.current = i;
    setStep(0);
  };

  // конструктор — один блок, а не заголовок и отдельная от него форма
  return (
    <div className="mt-[clamp(28px,3.5vw,52px)]">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="flex items-baseline gap-3">
          <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 tabular-nums">
            {String(n + 1).padStart(2, "0")}
            <span className="font-normal">
              {" "}
              / {String(total).padStart(2, "0")}
            </span>
          </span>
          <span className="text-[1.0625rem] font-medium">
            {apparatus} · {color.name}
          </span>
        </p>
        <div className="flex items-center gap-5">
          {/* у второй дочери те же предметы и другое имя: копия быстрее,
              чем собирать позицию заново */}
          <button
            type="button"
            onClick={onDuplicate}
            className="tap inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-ink/65 transition-colors duration-300 hover:text-ink"
          >
            <Copy className="size-4" />
            Дублировать
          </button>
          {total > 1 ? (
            <button
              type="button"
              onClick={onRemove}
              className="tap inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-ink/65 transition-colors duration-300 hover:text-ink"
            >
              <Cross className="size-4" />
              Убрать
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid12-lg">
        {/* Превью едет за человеком на любом экране. На телефоне это узкая
            полоса под шапкой: без неё фамилию вводишь вслепую — поля ниже,
            флешка выше края экрана. Полоса низкая намеренно, чтобы под ней
            оставались видны те настройки, которые сейчас правишь. */}
        {/* Превью и лента окон едут вместе одной панелью. Порознь их держать
            нельзя: липкое превью наезжало бы на ленту, стоящую под ним.
            Волосок снизу — край панели: без него она просто обрезает строку,
            которая под неё заезжает. */}
        <div className="sticky top-16 z-20 -mx-5 border-b border-hairline bg-paper pb-2 lg:top-24 lg:z-auto lg:col-span-6 lg:mx-0 lg:border-b-0 lg:bg-transparent lg:pb-0">
          <div
            /* окно ниже прежнего: под ним теперь стоит лента, и панель
               целиком должна помещаться в экран, иначе окна не видно */
            className="grid place-items-center px-5 py-3 transition-[background-color] duration-500 ease-[var(--ease-soft)] lg:min-h-[min(46vh,420px)] lg:rounded-card lg:px-10 lg:py-8"
            style={{
              background: `color-mix(in oklab, ${color.hex} 11%, var(--color-paper))`,
            }}
          >
            {/* Подвески здесь нет намеренно: цепочка и кольцо съедали
                половину ширины, а смотреть надо на гравировку. */}
            {/* на телефоне флешка ужата: полоса в полную ширину заняла бы
                треть экрана и накрыла бы то, что человек в этот момент правит */}
            <div className="relative w-full max-w-[286px] lg:max-w-none">
              <FlashDrive
                color={color.hex}
                apparatusId={item.apparatusId}
                lines={shown}
                fontId={item.fontId}
                chain={false}
                className="drop-shadow-[0_22px_36px_rgba(17,17,16,0.18)]"
              />

              {/* Гравировка кликабельна: тычешь в строку на металле —
                  попадаешь в её поле, тычешь в знак — в выбор предмета.
                  Поле в фокусе подсвечивает свою строку, и наоборот. */}
              <div
                className="absolute"
                style={{
                  left: `${measures.solo.plate.left}%`,
                  top: `${measures.solo.plate.top}%`,
                  width: `${measures.solo.plate.width}%`,
                  height: `${measures.solo.plate.height}%`,
                }}
              >
                <div className="flex h-full">
                  <div className="flex h-full flex-[66.9] flex-col">
                    {FIELDS.map((f, i) => (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() => focusField(i)}
                        aria-label={`Изменить: ${f.label.toLowerCase()}`}
                        className={`flex-1 cursor-text rounded-[3px] transition-colors duration-200 hover:bg-white/15 ${
                          focused === i ? "bg-white/15" : ""
                        }`}
                      />
                    ))}
                  </div>
                  {/* Знак листается прямо на металле: каждый тычок ставит
                      следующий предмет по кругу. Ходить в чипсы справа
                      ради того же выбора незачем — они остаются для
                      прямого попадания и для клавиатуры. Без знака зоны
                      нет: нажимать не на что. */}
                  {item.apparatusId ? (
                    <button
                      type="button"
                      onClick={cycleApparatus}
                      aria-label={`Предмет: ${apparatus}. Нажмите, чтобы поставить следующий`}
                      className="my-1 mr-1 flex-[23] cursor-pointer rounded-[3px] transition-colors duration-200 hover:bg-white/15"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 lg:px-0">
            <DriveRail
              items={items}
              activeId={item.id}
              onPick={onPick}
              onAdd={onAdd}
              onRemove={onRemoveItem}
            />
          </div>

          <p className="mt-5 hidden text-[0.75rem] leading-relaxed text-ink/65 lg:block">
            {/* про гарнитуру здесь больше не пишем: она стала выбором
                в двух шагах отсюда, и подпись противоречила бы ему */}
            Пластина {mm(SPEC.plate)} · поле текста {mm(SPEC.textField)} · поле
            знака {mm(SPEC.iconField)}.
          </p>
        </div>

        {/* отступ на телефоне — свой: ниже 1024 сетки нет, и межколонник
            её не отбивает. На широком экране колонка перекрывает обе строки
            левой половины — превью сверху, лента окон под ним. */}
        {/* Настройки идут шагами, а не столбиком: четыре развёрнутых раздела
            тянули правую колонку на семьсот пикселей и заставляли листать
            мимо уже пройденного. Высота столбика теперь стоит по самому
            высокому шагу и не прыгает при переходе — «Далее» не убегает
            из-под пальца. */}
        <div className="mt-8 lg:col-span-5 lg:col-start-8 lg:mt-0">
          {/* Порядок шагов: надпись → шрифт → предмет → оттенок. Человек
              приходит вписать имя, а не подбирать цвет: сначала то, ради
              чего он здесь, потом чем это набрано, потом на чём, и только
              в конце — какого цвета корпус. */}
          <div
            role="tablist"
            aria-label="Настройки флешки"
            ref={tabsRef}
            onKeyDown={onTabsKey}
            /* шаг между рядами на телефоне крупнее: вкладки переносятся
               на две строки, и расширенные зоны нажатия соседних рядов
               иначе накладываются друг на друга */
            className="flex flex-wrap gap-x-5 gap-y-2 border-b border-hairline pb-4 max-lg:gap-y-6"
          >
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                id={`${tabId}-${i}`}
                aria-selected={step === i}
                aria-controls={`${paneId}-${i}`}
                tabIndex={step === i ? 0 : -1}
                onClick={() => setStep(i)}
                className={`tap inline-flex cursor-pointer items-baseline gap-2 text-[0.9375rem] transition-colors duration-300 ${
                  step === i ? "text-ink" : "text-ink/65 hover:text-ink"
                }`}
              >
                {/* номера сняты на телефоне: с ними ряд не влезает в строку
                    и переносится, а панель шагов и так занимает четверть
                    экрана. Слово важнее номера */}
                <span className="hidden text-[0.6875rem] font-semibold tabular-nums lg:inline">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </button>
            ))}
          </div>

          <div className="mt-7 grid">
            <div
              role="tabpanel"
              id={`${paneId}-0`}
              aria-labelledby={`${tabId}-0`}
              className={`col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-[var(--ease-soft)] ${
                step === 0
                  ? "translate-x-0 opacity-100"
                  : `pointer-events-none invisible opacity-0 ${
                      step > 0 ? "-translate-x-3" : "translate-x-3"
                    }`
              }`}
            >
              <Step>
                <div className="space-y-6">
                  {FIELDS.map((f, i) => (
                    <label key={f.label} className="field block">
                      <span className="flex items-baseline justify-between text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
                        {f.label}
                        <span className="font-normal tracking-normal tabular-nums">
                          {item.lines[i].length}/{f.max}
                        </span>
                      </span>
                      <input
                        ref={(el) => {
                          fieldRefs.current[i] = el;
                        }}
                        value={item.lines[i]}
                        onChange={(e) =>
                          setLine(
                            item.id,
                            i,
                            f.digits
                              ? e.target.value.replace(/\D/g, "")
                              : e.target.value,
                            f.max,
                          )
                        }
                        onFocus={() => setFocused(i)}
                        onBlur={() => setFocused(null)}
                        placeholder={f.hint}
                        inputMode={f.digits ? "numeric" : "text"}
                        maxLength={f.max}
                        autoComplete="off"
                        /* подъезжая к полю, браузер оставляет место под липкой
                         полосой с флешкой, а не прячет поле под неё */
                        className="mt-2 w-full scroll-mt-[190px] border-b border-hairline bg-transparent pb-2.5 text-[1.25rem] outline-none placeholder:text-ink/65 lg:scroll-mt-28"
                      />
                    </label>
                  ))}
                </div>
              </Step>
            </div>
            <div
              role="tabpanel"
              id={`${paneId}-1`}
              aria-labelledby={`${tabId}-1`}
              className={`col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-[var(--ease-soft)] ${
                step === 1
                  ? "translate-x-0 opacity-100"
                  : `pointer-events-none invisible opacity-0 ${
                      step > 1 ? "-translate-x-3" : "translate-x-3"
                    }`
              }`}
            >
              <Step note={font.note}>
                <div
                  role="radiogroup"
                  aria-label="Шрифт"
                  className="flex flex-wrap gap-2"
                >
                  {FONTS.map((f) => {
                    const on = f.id === item.fontId;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setFont(item.id, f.id)}
                        className={`chip inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-pill border px-4 text-[0.8125rem] transition-colors duration-300 ${
                          on
                            ? "border-ink text-paper"
                            : "border-hairline text-ink/70 hover:text-ink"
                        }`}
                      >
                        {/* образец набран самой гарнитурой: слово «антиква»
                          ничего не показывает, а «Аа» показывает */}
                        <span
                          aria-hidden
                          className="text-[1.125rem] leading-none"
                          style={{ fontFamily: f.css, fontWeight: f.weight }}
                        >
                          Аа
                        </span>
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[0.75rem] text-ink/65">
                  Кегль подбирается под длину строки — надпись не выходит за
                  пластину.
                </p>
              </Step>
            </div>
            <div
              role="tabpanel"
              id={`${paneId}-2`}
              aria-labelledby={`${tabId}-2`}
              className={`col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-[var(--ease-soft)] ${
                step === 2
                  ? "translate-x-0 opacity-100"
                  : `pointer-events-none invisible opacity-0 ${
                      step > 2 ? "-translate-x-3" : "translate-x-3"
                    }`
              }`}
            >
              <Step note={apparatus}>
                <div
                  ref={apparatusRef}
                  role="radiogroup"
                  aria-label="Предмет"
                  onKeyDown={onApparatusKey}
                  className="flex flex-wrap gap-2"
                >
                  {APPARATUS.map((a) => {
                    const active = a.id === item.apparatusId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => setApparatus(item.id, a.id)}
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

                  {/* Без знака: остаются три строки на всю пластину. Нужно
                      тем, кому знак предмета не нужен — учёба, подарок. */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={item.apparatusId === null}
                    tabIndex={item.apparatusId === null ? 0 : -1}
                    onClick={() => setApparatus(item.id, null)}
                    className={`chip inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill border px-3.5 text-[0.8125rem] transition-colors duration-300 ${
                      item.apparatusId === null
                        ? "border-ink text-paper"
                        : "border-hairline text-ink/70 hover:text-ink"
                    }`}
                  >
                    <Cross className="size-4" />
                    Без знака
                  </button>
                </div>
                <p className="mt-3 text-[0.75rem] text-ink/65">
                  Цвет подставляется под предмет. Без знака остаются только три
                  строки.
                </p>
              </Step>
            </div>
            <div
              role="tabpanel"
              id={`${paneId}-3`}
              aria-labelledby={`${tabId}-3`}
              className={`col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-[var(--ease-soft)] ${
                step === 3
                  ? "translate-x-0 opacity-100"
                  : `pointer-events-none invisible opacity-0 ${
                      step > 3 ? "-translate-x-3" : "translate-x-3"
                    }`
              }`}
            >
              <Step note={`${color.name} · ${color.hex}`}>
                {/* Полоса вместо кружков: цвет выбирается движением, как в пипетке.
                  Стопы жёсткие — промежуточных оттенков анодирования не бывает. */}
                <input
                  type="range"
                  min={0}
                  max={COLORS.length - 1}
                  step={1}
                  value={Math.max(0, colorIndex)}
                  onChange={(e) =>
                    setColor(item.id, COLORS[+e.target.value].id)
                  }
                  aria-label="Цвет корпуса"
                  /* полоса остаётся про палитру: при своём оттенке она называет
                   поле под ползунком, а сам оттенок объявлен подписью шага */
                  aria-valuetext={COLORS[Math.max(0, colorIndex)].name}
                  className="color-strip"
                  style={
                    {
                      background: STRIP,
                      "--pick": color.hex,
                    } as React.CSSProperties
                  }
                />

                {/* Своё окно цвета — штатное системное: браузер открывает
                  привычную палитру с RGB и пипеткой, писать её заново незачем.
                  Оговорка рядом обязательна: семь полей — это то, что цех
                  точно умеет, произвольный оттенок так не анодируется. */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <label
                    className={`inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-pill border px-3.5 text-[0.8125rem] transition-colors duration-300 ${
                      item.colorId === CUSTOM_COLOR
                        ? "border-ink"
                        : "border-hairline text-ink/70 hover:text-ink"
                    }`}
                  >
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => setCustomColor(item.id, e.target.value)}
                      aria-label="Свой цвет корпуса"
                      className="size-6 cursor-pointer rounded-pill border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                    />
                    Свой цвет
                  </label>
                  <p className="text-[0.75rem] text-ink/65">
                    Вне палитры анодирования — возможность уточняется.
                  </p>
                </div>

                {/* Комплект собирается здесь, под палитрой: одна кнопка вместо
                  семи проходов по конструктору. Оттенки стоят прямо на ней —
                  видно, что именно приедет. */}
                <div className="mt-9 border-t border-hairline pt-7">
                  <button
                    type="button"
                    disabled={!canBuildSet}
                    onClick={onBuildSet}
                    className="group inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-pill border border-ink px-5 text-[0.875rem] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-hairline disabled:text-ink/65"
                  >
                    Собрать комплект
                    <span aria-hidden className="flex -space-x-1">
                      {APPARATUS.map((a) => (
                        <span
                          key={a.id}
                          className="size-3.5 rounded-pill ring-1 ring-paper transition-[box-shadow] duration-300 group-hover:ring-ink"
                          style={{
                            background: colorById(DEFAULT_COLOR_FOR[a.id]).hex,
                          }}
                        />
                      ))}
                    </span>
                  </button>
                  <p className="mt-3 text-[0.75rem] text-ink/65">
                    По флешке на каждый предмет, надпись — как у открытой.
                  </p>
                </div>
              </Step>
            </div>
          </div>

          {/* На последнем шаге «Далее» некуда: дальше идут количество
              и корзина, они стоят под всем блоком. */}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="group mt-8 inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-pill border border-ink px-6 text-[0.875rem] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              Далее: {STEPS[step + 1].title.toLowerCase()}
              <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
            </button>
          ) : null}

          {order}
        </div>
      </div>
    </div>
  );
}

/**
 * Лента окон под превью: все собранные флешки видно сразу, в работе — одна.
 * Разворачивать позиции вниз страницы нельзя — комплект на семь предметов
 * растянул бы главную на семь экранов.
 *
 * Листается, когда окна перестают помещаться; пока помещаются, стрелок нет —
 * две погашенные кнопки в углу это управление без управляемого.
 */
function DriveRail({
  items,
  activeId,
  onPick,
  onAdd,
  onRemove,
}: {
  items: Item[];
  activeId: string;
  onPick: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true, scrolls: false });

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
  }, [measure, items.length]);

  // открытая флешка подъезжает в поле зрения сама: без этого после
  // «дублировать» новое окно оставалось бы за краем ленты
  useEffect(() => {
    const el = rail.current;
    // когда лента влезла целиком, подвозить нечего: `scrollIntoView` в этом
    // случае сдвигал её на поле под кольцо, и кольцо срезалось слева
    if (!el || el.scrollWidth <= el.clientWidth + 4) return;
    el.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId, items.length]);

  /**
   * Листаем ровно на страницу. Окна нарезаны так, что их целое число
   * заполняет ширину ленты без остатка, поэтому следующая страница
   * начинается через `clientWidth + межколонник` — и половинок окон
   * на краю не остаётся.
   */
  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: (el.clientWidth + gap) * dir, behavior: "smooth" });
  };

  return (
    <div className="mt-3 lg:mt-6">
      {/* На телефоне заголовок и стрелки не нужны: счёт «07 / 07» уже стоит
          над превью, а лента листается пальцем. Экономия там дороже. */}
      <div className="hidden items-baseline justify-between gap-4 lg:flex">
        <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
          Флешки в заказе · {items.length}
        </p>
        {edge.scrolls ? (
          <div className="flex gap-2">
            <RailArrow
              dir={-1}
              disabled={edge.start}
              onClick={() => step(-1)}
              label="Предыдущие флешки"
            />
            <RailArrow
              dir={1}
              disabled={edge.end}
              onClick={() => step(1)}
              label="Следующие флешки"
            />
          </div>
        ) : null}
      </div>

      <ul
        ref={rail}
        onScroll={measure}
        /* Поле в 6 px по кругу — под кольцо активного окна: оно выходит
           за плитку на 4 px, а `overflow-x` режет всё, что вылезло за
           границу. Отрицательные внешние поля возвращают ленту на место,
           так что окна по-прежнему стоят вровень с превью. */
        className="-mx-1.5 flex snap-x snap-mandatory scroll-p-1.5 gap-2 overflow-x-auto scroll-smooth p-1.5 lg:mt-3 lg:gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => {
          const c = resolveColor(it.colorId, it.customHex);
          const on = it.id === activeId;
          return (
            <li key={it.id} className={`${TILE} group/tile relative`}>
              <button
                type="button"
                onClick={() => onPick(it.id)}
                aria-current={on}
                aria-label={`Флешка ${i + 1}: ${apparatusLabel(
                  it.apparatusId,
                )}, ${c.name}`}
                /* активное окно — кольцо, как у свотча цвета: на сайте
                   одно выделение на элемент, и это оно */
                className={`grid w-full cursor-pointer gap-2 rounded-field px-3 pt-4 pb-2.5 transition-shadow duration-240 ease-[var(--ease-soft)] ${
                  on
                    ? "shadow-[0_0_0_3px_var(--color-paper),0_0_0_4px_var(--color-ink)]"
                    : "shadow-[0_0_0_1px_var(--color-hairline)] hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-ink)_40%,transparent)]"
                }`}
                style={{
                  background: `color-mix(in oklab, ${c.hex} 11%, var(--color-paper))`,
                }}
              >
                <FlashDrive
                  color={c.hex}
                  apparatusId={it.apparatusId}
                  lines={shownLines(it.lines)}
                  fontId={it.fontId}
                  chain={false}
                  className="w-full"
                />
                <span
                  /* не `ink/65`, как везде: подложка окна подкрашена цветом
                     корпуса, и на ней обычный порог даёт 4,36 против 4,5 */
                  className={`hidden truncate text-[0.6875rem] lg:block ${on ? "text-ink" : "text-ink/80"}`}
                >
                  {String(i + 1).padStart(2, "0")}{" "}
                  {apparatusLabel(it.apparatusId)}
                </span>
              </button>

              {/* Крестик прямо на окне: искать «Убрать» в заголовке ради
                  лишней флешки — лишний путь. Кнопка стоит соседом,
                  а не внутри плитки: кнопка в кнопке невалидна,
                  и нажатие уходило бы обеим. */}
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemove(it.id)}
                  aria-label={`Убрать флешку ${i + 1}`}
                  /* виден всегда: крестик, который появляется на наведении,
                     всё равно надо найти — а смысл был в обратном */
                  className="absolute top-1 right-1 grid size-6 cursor-pointer place-items-center rounded-pill bg-paper/60 text-ink/65 transition-colors duration-200 hover:bg-paper hover:text-ink"
                >
                  <Cross className="size-3.5" />
                </button>
              ) : null}
            </li>
          );
        })}

        <li className={TILE}>
          <button
            type="button"
            onClick={onAdd}
            aria-label="Добавить ещё флешку"
            className="grid h-full w-full cursor-pointer place-items-center gap-1.5 rounded-field border border-dashed border-ink/25 px-3 pt-4 pb-2.5 text-ink/65 transition-colors duration-300 hover:border-ink/50 hover:text-ink"
          >
            <Plus className="size-5" />
            <span className="hidden text-[0.6875rem] lg:block">Добавить</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

function RailArrow({
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
      className="grid size-9 cursor-pointer place-items-center rounded-pill border border-hairline transition-colors duration-300 hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-hairline"
    >
      <ArrowRight className={`size-3.5 ${dir === -1 ? "rotate-180" : ""}`} />
    </button>
  );
}

/**
 * Тело шага. Название несёт вкладка, поэтому внутри его нет — остаётся
 * только пояснение: что сейчас выбрано или чем шаг отличается.
 */
function Step({
  note,
  children,
}: {
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {note ? (
        <p className="mb-5 text-[0.8125rem] text-ink/65">{note}</p>
      ) : null}
      {children}
    </div>
  );
}
