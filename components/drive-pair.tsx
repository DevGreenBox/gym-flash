import { FlashDrive } from "@/components/flash-drive";
import { logoLabel } from "@/lib/logos";
import { apparatusLabel, resolveColor } from "@/lib/site";

/**
 * Флешка с обеих сторон сразу — по эскизу заказчика от 08.10
 * («Вкладка Предпросмотр и в корзине»): лицевая и оборотная лежат
 * рядом, наискосок, обе с подвеской, без кнопок и переключателей.
 * Так смотрят итог в конструкторе и каждую позицию в корзине.
 *
 * Раскладка задана в долях ширины, а не подобрана на глаз: флешка
 * с подвеской занимает 62 % ширины и повёрнута на 22°; центры сторон —
 * на (33 %, 40 %) и (67 %, 60 %) рамки 2,2 : 1. При этом повёрнутые
 * коробки целиком в рамке, а между корпусами — больше толщины корпуса,
 * и они не наезжают друг на друга.
 */
type Engraving = {
  colorId: string;
  customHex?: string;
  apparatusId: string | null;
  fontId?: string;
  lines: readonly [string, string, string];
  back?: readonly [string, string, string];
  backLogo?: string | null;
};

const СТОРОНЫ = [
  { side: "front" as const, x: 33, y: 40, label: "Лицевая сторона" },
  { side: "back" as const, x: 67, y: 60, label: "Оборотная сторона" },
];

export function DrivePair({
  item,
  className,
}: {
  item: Engraving;
  className?: string;
}) {
  const color = resolveColor(item.colorId, item.customHex);
  return (
    <div className={`relative aspect-[2.2/1] w-full ${className ?? ""}`}>
      {СТОРОНЫ.map((s) => (
        <div
          key={s.side}
          className="absolute w-[62%] -translate-x-1/2 -translate-y-1/2 -rotate-[22deg]"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <FlashDrive
            color={color.hex}
            apparatusId={item.apparatusId}
            lines={item.lines as [string, string, string]}
            back={item.back}
            backLogo={item.backLogo ?? null}
            fontId={item.fontId}
            side={s.side}
            chain
            className="drop-shadow-[0_14px_22px_rgba(17,17,16,0.16)]"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Что выбрано — четыре строки, как на эскизе: надпись, пиктограмма,
 * цвет, оборот. Подвески в списке нет — она видна на картинке и одна
 * на все флешки. На обороте логотип главнее строк: зона одна, и если
 * выбран логотип, гравируется он.
 */
export function DriveSummary({
  item,
  className,
}: {
  item: Engraving;
  className?: string;
}) {
  const color = resolveColor(item.colorId, item.customHex);
  const надпись = item.lines.filter((l) => l.trim()).join(" ");
  const логотип = logoLabel(item.backLogo);
  const оборот = (item.back ?? []).filter((l) => l.trim()).join(" · ");

  const строки = [
    { k: "Надпись", v: надпись || "не заполнена" },
    { k: "Пиктограмма", v: apparatusLabel(item.apparatusId) },
    { k: "Цвет", v: color.name },
    { k: "Оборот", v: логотип ?? (оборот || "без гравировки") },
  ];

  return (
    <dl
      className={`divide-y divide-hairline border-y border-hairline text-[0.9375rem] ${className ?? ""}`}
    >
      {строки.map((r) => (
        <div key={r.k} className="flex items-baseline justify-between gap-5 py-3">
          <dt className="shrink-0 text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
            {r.k}
          </dt>
          <dd className="min-w-0 text-right break-words">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
