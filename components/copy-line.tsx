"use client";

import { useEffect, useState } from "react";

import { Copy } from "@/components/icons";

/**
 * Телефон и почта: ссылка плюс копирование.
 *
 * `tel:` и `mailto:` — правильные ссылки, и на телефоне они открывают
 * звонилку и почту. На компьютере, где ни то, ни другое не привязано
 * к браузеру, нажатие внешне не делает ничего: человек решает, что
 * кнопка сломана, и уходит. Кнопка рядом кладёт номер в буфер и говорит
 * об этом словом — это работает везде и не ломает поведение на телефоне.
 */
export function CopyLine({
  value,
  label,
}: {
  /** что кладём в буфер: сам номер или адрес почты */
  value: string;
  /** для незрячих: «номер телефона», «адрес почты» */
  label: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 2000);
    return () => clearTimeout(t);
  }, [done]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
    } catch {
      // буфер закрыт настройками браузера — выделяем, чтобы скопировать руками
      const sel = getSelection();
      const node = document.createTextNode(value);
      document.body.append(node);
      const range = document.createRange();
      range.selectNode(node);
      sel?.removeAllRanges();
      sel?.addRange(range);
      setTimeout(() => node.remove(), 4000);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Скопировать ${label}`}
      /* поля по вертикали настоящие, а не только зона `.tap`: та работает
         лишь на узком экране, а мышью в строку в восемнадцать пикселей
         тоже целиться неудобно */
      className="tap draw-line -my-1.5 inline-flex cursor-pointer items-center gap-1.5 py-1.5 text-[0.75rem] text-ink/65 transition-colors duration-300 hover:text-ink"
    >
      <Copy className="size-3.5" />
      {/* подпись меняется на месте: отдельная всплывающая полоса ради
          двух слов — лишний слой, который ещё и перекрывает содержимое */}
      <span aria-live="polite">{done ? "Скопировано" : "Скопировать"}</span>
    </button>
  );
}
