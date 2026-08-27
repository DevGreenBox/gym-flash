/**
 * Данные проекта. Всё, чего нам не дал заказчик, помечено TODO(client)
 * и на сайте показывается заглушкой — придумывать цифры нельзя.
 */

export const FORMS_ARE_MOCKED = true; // заявка никуда не уходит, пишем в консоль
export const PRICES_ARE_UNKNOWN = true; // TODO(client): прайс и минимальный заказ

/** Контакты — настоящие, со страницы «Контакты» в макете заказчика. */
export const site = {
  name: "Personal Flash",
  tagline: "Именные флешки",
  phone: "+7 918 570 37 28",
  phoneHref: "tel:+79185703728",
  email: "personal_flash@mail.ru",
  city: "Ростов-на-Дону",
  legal: "ИП Андеев В. А.",
  whatsapp: null, // TODO(client): номер или ссылка на чат
  /**
   * Чат по номеру — штатная ссылка Telegram: `t.me/+` и номер в между-
   * народном виде. Отдельного адреса не требуется, но в настройках
   * приватности должно быть разрешено находить по номеру телефона,
   * иначе ссылка откроет пустой поиск.
   * TODO(client): проверить, что номер ищется, или прислать @имя канала.
   */
  telegram: "https://t.me/+79185703728",
  /**
   * TODO(client): ссылка из приложения — «Профиль → Поделиться»,
   * вида `max.ru/u/…` или `max.ru/имя`. Открыть чат по одному номеру
   * MAX не умеет: поиск по номеру там есть, а ссылки на него нет,
   * и собрать её из телефона неоткуда.
   */
  max: null,
};

/**
 * Мессенджеры для строки «Связаться с нами». Пока ссылки нет, кнопка
 * показывается неактивной с честной подписью: выдуманный адрес чата
 * уводит человека в никуда, а убрать кнопку — значит потерять место,
 * которое заказчик просил под неё оставить.
 */
export const MESSENGERS: { id: string; label: string; href: string | null }[] = [
  { id: "telegram", label: "Telegram", href: site.telegram },
  { id: "max", label: "MAX", href: site.max },
];

/**
 * `short` — подпись для строки в шапке: полные названия разделов туда
 * не помещаются ни на одном экране. В меню, подвале и заголовках страниц
 * работает `label`.
 */
export const NAV = [
  { href: "/", label: "Главная", short: "Главная" },
  { href: "/about", label: "О нас", short: "О нас" },
  {
    href: "/gymnastics",
    label: "Для художественной гимнастики",
    short: "Конструктор",
  },
  { href: "/study", label: "Для учёбы", short: "Учёба" },
  { href: "/gift", label: "Памятный подарок", short: "Подарок" },
  { href: "/delivery", label: "Доставка", short: "Доставка" },
  { href: "/reviews", label: "Отзывы и рекомендации", short: "Отзывы" },
  { href: "/prices", label: "Цены", short: "Цены" },
  { href: "/gallery", label: "Примеры работ", short: "Работы" },
  { href: "/contacts", label: "Контакты", short: "Контакты" },
];

/**
 * В шапке «Главная» не нужна — её держит логотип. «Учёба» и «Подарок»
 * сняты со строки: строка короче — каждый оставшийся пункт заметнее,
 * а сами разделы остались в меню и в подвале.
 */
const NOT_IN_HEADER = ["/", "/study", "/gift"];
export const HEADER_NAV = NAV.filter((i) => !NOT_IN_HEADER.includes(i.href));

/**
 * Три направления с главной страницы макета. `preview` рисуется вектором:
 * пока нет съёмки, честнее показать настоящую гравировку, чем серый экран.
 * Надписи — очевидно демонстрационные, за реальные заказы не выдаются.
 */
export const CATEGORIES = [
  {
    href: "/gymnastics",
    label: "Для художественной гимнастики",
    note: "Вид видно по знаку на лицевой стороне, переворачивать не нужно",
    /** чем этот конструктор отличается от соседних — для экрана выбора */
    difference: "Три строки и знак вида: обруч, мяч, булавы, лента, скакалка, Б/П или знак для тренировок.",
    preview: {
      colorId: "red",
      apparatusId: "hoop" as string | null,
      lines: ["Иванова", "Амелия", "2017"] as [string, string, string],
    },
  },
  {
    href: "/study",
    label: "Для учёбы",
    note: "Имя и класс на корпусе — видно, чья это флешка",
    difference: "Три строки без знака вида: фамилия, имя и класс.",
    preview: {
      colorId: "blue",
      apparatusId: null as string | null,
      lines: ["Петров", "Артём", "5 «Б»"] as [string, string, string],
    },
  },
  {
    href: "/gift",
    label: "Памятный подарок",
    note: "Дата и повод остаются на металле",
    difference: "Три строки без знака вида: имя, повод и дата.",
    preview: {
      colorId: "bronze",
      apparatusId: null as string | null,
      lines: ["Маме", "с любовью", "2026"] as [string, string, string],
    },
  },
];

/** Цвета анодирования сняты глазом с фотографии. TODO(client): точные значения. */
export type Color = { id: string; name: string; hex: string };

export const COLORS: Color[] = [
  { id: "lime", name: "Лайм", hex: "#9DBF3C" },
  { id: "red", name: "Красный", hex: "#C0332B" },
  { id: "violet", name: "Фиолетовый", hex: "#6C2E8E" },
  { id: "blue", name: "Синий", hex: "#1B6BA8" },
  { id: "fuchsia", name: "Фуксия", hex: "#C2226E" },
  { id: "bronze", name: "Бронза", hex: "#C87A22" },
  { id: "black", name: "Чёрный", hex: "#1C1C1C" },
];

/** Предметы художественной гимнастики — ровно те, что выгравированы на фото. */
export type Apparatus = { id: string; label: string };

export const APPARATUS: Apparatus[] = [
  { id: "bp", label: "Б/П" },
  { id: "hoop", label: "Обруч" },
  { id: "ball", label: "Мяч" },
  { id: "clubs", label: "Булавы" },
  { id: "ribbon", label: "Лента" },
  { id: "rope", label: "Скакалка" },
  { id: "training", label: "Для тренировок" },
];

/**
 * Гравировка без знака: остаются только три строки, и поле текста занимает
 * всю пластину. На фотографии партии такие тоже есть — на них просто нет
 * предмета, а не «предмет неизвестен».
 */
export const apparatusLabel = (id: string | null) =>
  APPARATUS.find((a) => a.id === id)?.label ?? "Без знака";

/** Пара «предмет — цвет» с фотографии: подставляется, когда меняешь предмет. */
export const DEFAULT_COLOR_FOR: Record<string, string> = {
  bp: "lime",
  hoop: "red",
  ball: "violet",
  clubs: "blue",
  ribbon: "fuchsia",
  rope: "bronze",
  training: "black",
};

/**
 * Размеры с чертежа заказчика от 27.08, миллиметры. Отклонения
 * не принимаются, поэтому здесь только числа с чертежа; всё
 * производное считается из них в `flash-drive.tsx`.
 *
 * Арифметика сходится: 32 + 1,5 + 11,5 = 45 — ровно поле гравировки,
 * а 15 + 1 + 1 = 17 — высота корпуса.
 */
export const SPEC = {
  /** корпус (цветная пластина) по длине и высоте */
  plate: 50,
  plateH: 17,
  /** поле гравировки внутри корпуса */
  field: 45,
  fieldH: 15,
  /** Зона 1 — надпись */
  textField: 32,
  /** промежуток между зонами */
  gap: 1.5,
  /** Зона 2 — пиктограмма с подписью */
  iconField: 11.5,
  lines: 3,
  charsPerLine: 14,
};

/**
 * Базы пиктограмм — по одной на вид флешки, как требует чертёж.
 *
 * У гимнастики база готова: это те же семь знаков, что выгравированы
 * на партии. У подарка и учёбы баз пока нет, и придумывать их нельзя —
 * там доступен только вариант без знака, а окно выбора честно говорит,
 * чего ждёт.
 *
 * TODO(client): файлы пиктограмм для подарка и учёбы, разбитые
 * на категории, — SVG или PNG с прозрачностью в коробе 15 × 11,5 мм.
 */
export type IconBase = {
  label: string;
  categories: { label: string; items: Apparatus[] }[];
};

export const ICON_BASES: Record<string, IconBase> = {
  gymnastics: {
    label: "Художественная гимнастика",
    categories: [{ label: "Предметы", items: APPARATUS }],
  },
  gift: { label: "Подарок", categories: [] },
  study: { label: "Учёба", categories: [] },
};

/**
 * Гарнитура гравировки — одна.
 *
 * Первым в стопке стоит сам Segoe Print, и это законно: в `font-family`
 * шрифт только называется по имени, а берётся тот, что уже установлен
 * у посетителя. Файл никому не передаётся — запрещена лицензией именно
 * раздача файла, то есть `@font-face` с выкладкой шрифта на сервер.
 * На Windows Segoe Print стоит из коробки, и там превью показывает
 * настоящую гравировку без единой копейки за лицензию.
 *
 * Второй в стопке — Neucha: ближайший кириллический печатный почерк.
 * Её видят те, у кого Segoe Print нет: телефоны, макбуки, Linux.
 * Сравнение с фотографией партии — в docs/шрифт-гравировки.md.
 *
 * Вес 700: чертёж требует «Segoe Print Жирный». На Windows возьмётся
 * настоящее жирное начертание, у замены браузер утолщит сам.
 *
 * TODO(client): веб-лицензия Segoe Print нужна, только если хочется,
 * чтобы настоящую гравировку видели и на телефонах.
 */
export const FONTS = [
  {
    id: "print",
    label: "Segoe Print",
    note: "как на производстве",
    css: '"Segoe Print", var(--font-neucha), cursive',
    weight: 700,
    em: 0.5,
  },
];

/** Сжатие гравировки по горизонтали — требование чертежа. */
export const SQUEEZE = 0.5;

export const fontById = (id: string | undefined) =>
  FONTS.find((f) => f.id === id) ?? FONTS[0];

export const colorById = (id: string) =>
  COLORS.find((c) => c.id === id) ?? COLORS[0];

/**
 * Свой цвет вне палитры анодирования.
 *
 * TODO(client): семь цветов сняты с фотографии партии — это то, что цех
 * точно умеет. Произвольный оттенок так не гравируется: анодирование идёт
 * готовыми ваннами, и «любой RGB» цеху обещать нельзя. В интерфейсе это
 * сказано прямо, в накладную уходит HEX — подтвердить с производством,
 * какие оттенки вообще возможны под заказ.
 */
export const CUSTOM_COLOR = "custom";

export const isHex = (v: string | undefined): v is string =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

export const resolveColor = (id: string, hex?: string): Color =>
  id === CUSTOM_COLOR && isHex(hex)
    ? { id: CUSTOM_COLOR, name: "Свой цвет", hex }
    : colorById(id);

/** Миллиметры по-русски: запятая и два знака, как на чертеже. */
export const mm = (n: number) => `${n.toFixed(2).replace(".", ",")} мм`;
