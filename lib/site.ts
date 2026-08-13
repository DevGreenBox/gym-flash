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
  telegram: null, // TODO(client): ссылка на канал
};

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

/** Размеры с чертежа заказчика (assets/image 18.png), миллиметры. */
export const SPEC = {
  plate: 49.96,
  textField: 33.42,
  iconField: 11.5,
  font: "Segoe Print Bold",
  lines: 3,
  charsPerLine: 14,
};

/**
 * Гарнитуры гравировки.
 *
 * TODO(client): заказчик давал одну — Segoe Print Bold. Список ниже нужно
 * подтвердить с производством: станок гравирует тем, что в него загружено,
 * и выбор на сайте не должен обещать того, чего в цехе нет.
 *
 * Все три уже загружены страницей — новых килобайт выбор не стоит. Каждая
 * с кириллицей и с толстым штрихом: тонкие волосяные линии на металле
 * в этом размере пропадают.
 *
 * `em` — средняя ширина знака в долях кегля. По ней ужимается подпись
 * предмета в поле знака: словарь подписей закрытый (семь штук), и замер
 * по нему сходится. Строки гравировки считаются иначе — по фактической
 * ширине набора, там текст произвольный.
 */
export const FONTS = [
  {
    id: "hand",
    label: "Рукописный",
    note: "как в текущих партиях",
    css: "var(--font-caveat)",
    weight: 700,
    em: 0.42,
  },
  {
    id: "grotesk",
    label: "Прямой",
    note: "самый разборчивый издалека",
    css: "var(--font-golos)",
    weight: 600,
    em: 0.54,
  },
  {
    id: "antiqua",
    label: "Антиква",
    note: "для памятного подарка",
    css: "var(--font-prata)",
    weight: 400,
    // 0,58, а не 0,52: у Prata знак шире средней оценки, и «Скакалка»
    // с «Для тренировок» вылезали из поля знака на полмиллиметра
    em: 0.58,
  },
];

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
