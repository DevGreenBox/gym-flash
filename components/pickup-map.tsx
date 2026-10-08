import { ArrowRight } from "@/components/icons";
import { PICKUP } from "@/lib/delivery";

/**
 * Самовывоз на карте — правка заказчика от 08.10: адрес и под ним карта
 * со ссылкой на Google Карты. Карта встроена обычной ссылкой Google,
 * без ключа API, и грузится, только когда до неё долистали.
 */
export function PickupMap({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p
        className={
          compact
            ? "text-[0.9375rem] leading-relaxed"
            : "text-[1.0625rem] leading-relaxed"
        }
      >
        {PICKUP.name}
        <span className="block text-ink/70">{PICKUP.address}</span>
      </p>
      <iframe
        src={PICKUP.embedUrl}
        title={`Карта: ${PICKUP.name}, ${PICKUP.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`mt-4 w-full rounded-field border border-hairline bg-silver ${
          compact ? "aspect-[4/3]" : "aspect-[16/10]"
        }`}
      />
      <a
        href={PICKUP.mapUrl}
        target="_blank"
        rel="noreferrer"
        className="draw-line group mt-3 inline-flex items-center gap-2 text-[0.8125rem] text-ink/80"
      >
        Открыть в Google Картах
        <ArrowRight className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </a>
    </div>
  );
}
