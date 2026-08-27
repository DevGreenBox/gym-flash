/**
 * Место под фотографию. Своих снимков у нас нет, стоки ставить нельзя —
 * до съёмки здесь серый экран, который честно говорит, чего не хватает.
 * В герое подпись уходит в угол, чтобы не лезть под текст.
 */
export function Placeholder({
  label,
  corner,
  className,
  style,
}: {
  label: string;
  corner?: boolean;
  className?: string;
  /** пропорция окна приходит отсюда: у блока она своя, а не из класса */
  style?: React.CSSProperties;
}) {
  return (
    <div
      // без `relative`: у Tailwind оно перебивает `absolute` из className
      style={style}
      className={`bg-silver ${corner ? "" : "grid place-items-center"} ${className ?? ""}`}
      role="img"
      aria-label={`Место под фотографию: ${label}`}
    >
      <span
        className={`text-[0.6875rem] font-semibold tracking-[0.18em] text-ink/70 uppercase ${
          corner ? "absolute bottom-5 left-5" : "px-6 text-center"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
