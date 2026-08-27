import Image from "next/image";

import { Placeholder } from "@/components/placeholder";

/**
 * Место под съёмку — одно на весь сайт.
 *
 * Заказчику не нужно подгонять снимки под пиксели: блок принимает любые
 * пропорции. Две повадки, и обе нужны:
 *
 * - `окно` — у блока своя пропорция, снимок закрывает её и обрезается
 *   по краям. Так живут широкие полосы, где важен ритм страницы,
 *   а не полнота кадра.
 * - `поток` — пропорция берётся у самого снимка, высота идёт следом.
 *   Так живёт раскладка работ: вертикальная флешка и кадр с семёркой
 *   в ряд занимают разную высоту, и это нормально.
 *
 * Видео и GIF идут тем же путём: `video` с `poster` вместо `img`.
 * Микроанимация — это короткое видео без звука, зациклённое; отдельного
 * блока под неё не нужно.
 *
 * Когда снимка ещё нет, на его месте стоит честный серый экран
 * с подписью, чего не хватает, — выдумывать сток нельзя.
 */
export type MediaSrc =
  | { тип: "фото"; src: string; alt: string; w: number; h: number }
  | { тип: "видео"; src: string; poster?: string; alt: string; w: number; h: number }
  | null;

export function Media({
  media,
  label,
  вид = "окно",
  ratio = "16/9",
  sizes = "100vw",
  priority = false,
  className = "",
}: {
  media: MediaSrc;
  /** что здесь будет, если съёмки ещё нет */
  label: string;
  вид?: "окно" | "поток";
  /** пропорция окна; в потоке не используется */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const рамка = `overflow-hidden rounded-card ${className}`;

  if (!media) {
    return (
      <Placeholder
        label={label}
        className={рамка}
        style={{ aspectRatio: вид === "окно" ? ratio : "4/3" }}
      />
    );
  }

  const style = вид === "окно" ? { aspectRatio: ratio } : undefined;

  return (
    <div className={`relative ${рамка}`} style={style}>
      {media.тип === "видео" ? (
        <video
          src={media.src}
          poster={media.poster}
          aria-label={media.alt}
          muted
          loop
          playsInline
          autoPlay
          width={media.w}
          height={media.h}
          className={
            вид === "окно" ? "absolute inset-0 size-full object-cover" : "w-full"
          }
        />
      ) : (
        <Image
          src={media.src}
          alt={media.alt}
          {...(вид === "окно"
            ? { fill: true, className: "object-cover" }
            : { width: media.w, height: media.h, className: "h-auto w-full" })}
          sizes={sizes}
          priority={priority}
        />
      )}
    </div>
  );
}
