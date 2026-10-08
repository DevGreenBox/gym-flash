"use client";

import {
  CDEK_MAP,
  CDEK_TYPES,
  deliveryReady,
  quote,
  type Delivery,
  type Quote,
} from "@/lib/delivery";
import { PickupMap } from "@/components/pickup-map";

/**
 * Доставка в оформлении — по правке заказчика от 08.10: СДЭК или
 * самовывоз. При СДЭК открывается выбор вида доставки (пункт выдачи,
 * постамат, курьер) и её данные; «Рассчитать доставку» включается,
 * когда данных хватает. При самовывозе — адрес, откуда забирать.
 *
 * Пунктов на карте здесь нет: виджет СДЭК требует договора и ключа.
 * Пока человек вписывает адрес или код пункта сам, а ссылка рядом
 * открывает карту пунктов на сайте СДЭК.
 * TODO(client): договор со СДЭК — виджет выбора пункта и расчёт по API.
 */
export function DeliveryPicker({
  value,
  onChange,
  count,
  result,
  onResult,
}: {
  value: Delivery;
  onChange: (d: Delivery) => void;
  count: number;
  /** посчитанная доставка; сбрасывается, как только меняются данные */
  result: Quote | null;
  onResult: (q: Quote | null) => void;
}) {
  const set = (patch: Partial<Delivery>) => {
    onChange({ ...value, ...patch });
    onResult(null);
  };
  const готово = deliveryReady(value);
  const кКурьеру = value.cdekType === "door";

  return (
    <fieldset className="space-y-5">
      <legend className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
        Доставка
      </legend>

      <div className="flex flex-wrap gap-2">
        <Выбор
          name="method"
          checked={value.method === "cdek"}
          onChange={() => set({ method: "cdek" })}
        >
          СДЭК
        </Выбор>
        <Выбор
          name="method"
          checked={value.method === "pickup"}
          onChange={() => set({ method: "pickup" })}
        >
          Самовывоз
        </Выбор>
      </div>

      {value.method === "cdek" ? (
        <div className="space-y-6 rounded-field border border-hairline p-4">
          <div
            role="radiogroup"
            aria-label="Вид доставки"
            className="flex flex-wrap gap-2"
          >
            {CDEK_TYPES.map((t) => (
              <Выбор
                key={t.id}
                name="cdekType"
                small
                checked={value.cdekType === t.id}
                onChange={() => set({ cdekType: t.id })}
              >
                {t.label}
              </Выбор>
            ))}
          </div>

          <Поле
            name="city"
            label="Город"
            value={value.city}
            onChange={(city) => set({ city })}
          />
          {кКурьеру ? (
            <Поле
              name="address"
              label="Адрес: улица, дом, квартира"
              value={value.address}
              onChange={(address) => set({ address })}
            />
          ) : (
            <div>
              <Поле
                name="point"
                label={
                  value.cdekType === "postamat"
                    ? "Адрес или код постамата"
                    : "Адрес или код пункта выдачи"
                }
                value={value.point}
                onChange={(point) => set({ point })}
              />
              <a
                href={CDEK_MAP}
                target="_blank"
                rel="noreferrer"
                className="draw-line mt-3 inline-block text-[0.8125rem] text-ink/70"
              >
                Найти пункт на карте СДЭК
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              disabled={!готово}
              onClick={() => onResult(quote(value.city, count))}
              className="inline-flex h-10 cursor-pointer items-center rounded-pill border border-ink px-4 text-[0.8125rem] font-medium transition-colors duration-300 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-hairline disabled:text-ink/45 disabled:hover:bg-transparent"
            >
              Рассчитать доставку
            </button>
            <p aria-live="polite" className="text-[0.8125rem] text-ink/70">
              {!готово
                ? кКурьеру
                  ? "Впишите город и адрес"
                  : "Впишите город и пункт"
                : result
                  ? result.ok
                    ? `Доставка: ${result.rub} ₽`
                    : `Доставка: ${result.reason}`
                  : null}
            </p>
          </div>
        </div>
      ) : (
        /* самовывоз — пункт выдачи СДЭК: адрес и карта под ним */
        <div className="rounded-field border border-hairline p-4">
          <PickupMap compact />
        </div>
      )}
    </fieldset>
  );
}

/** Вариант выбора — пилюлей; сам переключатель остаётся настоящим radio. */
function Выбор({
  name,
  checked,
  onChange,
  small = false,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center rounded-pill border transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--brand-ui,var(--brand))] ${
        small ? "h-9 px-3.5 text-[0.8125rem]" : "h-11 px-5 text-[0.9375rem]"
      } ${
        checked
          ? "border-ink bg-ink text-paper"
          : "border-hairline text-ink/75 hover:border-ink/40"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  );
}

function Поле({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="field block">
      <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-ink/65 uppercase">
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={
          name === "city"
            ? "address-level2"
            : name === "address"
              ? "street-address"
              : "off"
        }
        className="mt-2 w-full border-b border-hairline bg-transparent pb-2.5 text-[1.0625rem] outline-none"
      />
    </label>
  );
}
