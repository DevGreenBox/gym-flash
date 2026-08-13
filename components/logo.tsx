import { site } from "@/lib/site";

/**
 * Логотип заказчика, пересобранный под систему сайта: та же структура
 * (вордмарк + подпись + знак флешки), но красный заменён на цвет выбранной
 * флешки — второго акцента на странице нет.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-grid leading-none ${className ?? ""}`}>
      <span className="flex items-center gap-[0.45em]">
        <span className="text-[1em] font-extrabold tracking-[-0.02em] uppercase">
          {site.name}
        </span>
        <svg
          viewBox="0 0 30 16"
          className="h-[0.72em] w-auto shrink-0"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 3.6a2.6 2.6 0 0 1 2.6-2.6h16.2a2.6 2.6 0 0 1 2.6 2.6v8.8a2.6 2.6 0 0 1-2.6 2.6H3.6A2.6 2.6 0 0 1 1 12.4z" />
          <path d="M22.4 5.4h6.2M22.4 10.6h6.2" />
        </svg>
      </span>
      <span className="mt-[0.42em] text-[0.53em] font-semibold tracking-[0.24em] text-ink/65 uppercase">
        {site.tagline}
      </span>
    </span>
  );
}
