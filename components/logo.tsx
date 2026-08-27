import { site } from "@/lib/site";

/**
 * Логотип бренда — настоящий, из вектора заказчика
 * (`Лого Personal Flash СТРОКА.pdf`, обрезан и облегчён в `public/logo.svg`).
 *
 * Рисуется маской, а не картинкой: `<img>` с внешним SVG живёт в своём
 * документе и `currentColor` из страницы не видит — логотип остался бы
 * чёрным везде, включая тёмные подложки. Маска красит его цветом текста,
 * а файл при этом один и кэшируется.
 *
 * Пропорция 566,24 : 67,96 взята из самого вектора: высота задаётся
 * кеглем строки, ширина считается от неё.
 */
const ОТНОШЕНИЕ = 566.24 / 67.96;

export function Logo({
  className,
  tagline = true,
}: {
  className?: string;
  /** подпись «Именные флешки» под строкой — она не часть логотипа */
  tagline?: boolean;
}) {
  return (
    <span className={`inline-grid leading-none ${className ?? ""}`}>
      <span
        role="img"
        aria-label={site.name}
        className="block bg-[currentColor]"
        style={{
          height: "1em",
          width: `${ОТНОШЕНИЕ}em`,
          maskImage: "url(/logo.svg)",
          WebkitMaskImage: "url(/logo.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
      {tagline ? (
        <span className="mt-[0.5em] text-[0.5em] font-semibold tracking-[0.24em] text-ink/65 uppercase">
          {site.tagline}
        </span>
      ) : null}
    </span>
  );
}
