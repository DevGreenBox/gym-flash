import type { MediaSrc } from "@/components/media";

/**
 * «Примеры работ» — по эскизу заказчика от 08.10 (стр. 7): три блока
 * по направлениям, в каждом карусель фотографий работ и «Создай свою
 * флешку».
 *
 * Снимков выполненных заказов пока нет. Где в кадре товар, мы рисуем его
 * вектором, а не ставим серый экран: у каждой работы есть `photo` — пока
 * `null`, и тогда кадр собирается из флешек с примерной гравировкой.
 * Пришлёт заказчик съёмку — она встанет в `photo` и займёт кадр целиком;
 * разметку трогать не придётся.
 *
 * Форма кадра задана здесь, а не подогнана под снимок: в карусели кадры
 * разной ширины при одной высоте — горизонтальные, вертикальные
 * и квадратные, как на эскизе.
 *
 * Фамилии — заведомо примерные; на странице это сказано прямо.
 * TODO(client): снимки выполненных заказов по направлениям.
 */
export type WorkShape = "wide" | "tall" | "square";

export type Engraving = {
  colorId: string;
  apparatusId: string | null;
  lines: [string, string, string];
  back?: [string, string, string];
  backLogo?: string | null;
};

export type Work = {
  shape: WorkShape;
  /** что на кадре — для чтения с экрана и подписи к будущему снимку */
  label: string;
  photo: MediaSrc;
  /**
   * Чем кадр заполнен до съёмки: одна флешка, обе стороны одной флешки
   * или несколько флешек столбиком — как лежат комплекты на фото партии.
   */
  scene:
    | { kind: "one"; drive: Engraving }
    | { kind: "pair"; drive: Engraving }
    | { kind: "stack"; drives: Engraving[] };
};

const е = (
  colorId: string,
  apparatusId: string | null,
  lines: [string, string, string],
  extra: Partial<Engraving> = {},
): Engraving => ({ colorId, apparatusId, lines, ...extra });

export const WORK_GROUPS: {
  id: string;
  title: string;
  /** куда ведёт «Создай свою флешку»: конструктор этого направления */
  href: string;
  works: Work[];
}[] = [
  {
    id: "gymnastics",
    title: "Для тренировок и выступлений",
    // на выбор из трёх конструкторов направления, как карточка на главной
    href: "/training",
    works: [
      {
        shape: "wide",
        label: "Флешка с обеих сторон: обруч, клуб на обороте",
        photo: null,
        scene: {
          kind: "pair",
          drive: е("red", "hoop", ["Иванова", "Амелия", "2017"], { backLogo: "diamond" }),
        },
      },
      {
        shape: "tall",
        label: "Комплект на сезон",
        photo: null,
        scene: {
          kind: "stack",
          drives: [
            е("lime", "bp", ["Соколова", "Вероника", "2019"]),
            е("red", "hoop", ["Соколова", "Вероника", "2019"]),
            е("violet", "ball", ["Соколова", "Вероника", "2019"]),
            е("blue", "clubs", ["Соколова", "Вероника", "2019"]),
          ],
        },
      },
      {
        shape: "square",
        label: "Лента",
        photo: null,
        scene: { kind: "one", drive: е("fuchsia", "ribbon", ["Мельник", "Ярослава", "2015"]) },
      },
      {
        shape: "wide",
        label: "Скакалка, на обороте — клуб",
        photo: null,
        scene: {
          kind: "pair",
          drive: е("bronze", "rope", ["Абдуллаева", "Сафия", "2020"], {
            backLogo: "trudovye-rezervy",
          }),
        },
      },
      {
        shape: "square",
        label: "Для тренировок",
        photo: null,
        scene: { kind: "one", drive: е("black", "training", ["Черных", "Владислава", "2018"]) },
      },
    ],
  },
  {
    id: "study",
    title: "Для учёбы, работы, хобби",
    href: "/study#constructor",
    works: [
      {
        shape: "wide",
        label: "Флешка с обеих сторон: школа на обороте",
        photo: null,
        scene: {
          kind: "pair",
          drive: е("blue", "study", ["Петров", "Артём", "5 «Б»"], { backLogo: "kinder-study" }),
        },
      },
      {
        shape: "square",
        label: "Для учёбы",
        photo: null,
        scene: { kind: "one", drive: е("violet", "study", ["Смирнова", "Анна", "11 «А»"]) },
      },
      {
        shape: "tall",
        label: "Флешки для класса",
        photo: null,
        scene: {
          kind: "stack",
          drives: [
            е("blue", "study", ["Петров", "Артём", "5 «Б»"]),
            е("lime", "study", ["Орлова", "Мария", "5 «Б»"]),
            е("bronze", "study", ["Ким", "Даниил", "5 «Б»"]),
          ],
        },
      },
    ],
  },
  {
    id: "gift",
    title: "Памятный подарок",
    href: "/gift#constructor",
    works: [
      {
        shape: "wide",
        label: "Подарок с обеих сторон: город на обороте",
        photo: null,
        scene: {
          kind: "pair",
          drive: е("bronze", "gift", ["Маме", "с любовью", "2026"], { backLogo: "moscow" }),
        },
      },
      {
        shape: "tall",
        label: "Подарки к празднику",
        photo: null,
        scene: {
          kind: "stack",
          drives: [
            е("fuchsia", "gift", ["Бабушке", "от внуков", "2026"]),
            е("black", "gift", ["Папе", "23 февраля", "2026"]),
            е("lime", "gift", ["Тренеру", "спасибо!", "2026"]),
          ],
        },
      },
      {
        shape: "square",
        label: "Памятный подарок",
        photo: null,
        scene: { kind: "one", drive: е("red", "gift", ["Анне", "с юбилеем", "2026"]) },
      },
    ],
  },
];
