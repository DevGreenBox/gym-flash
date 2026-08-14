"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Bag, Cross } from "@/components/icons";
import { Logo } from "@/components/logo";
import { totalQty, useCart } from "@/lib/cart";
import { HEADER_NAV, NAV, site } from "@/lib/site";

export function SiteHeader() {
  const count = totalQty(useCart());
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // клавиатура: фокус входит в панель и возвращается на бургер при закрытии
    const burger = burgerRef.current;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Пока панель открыта, всё остальное на странице выключено: без этого
    // Tab после последнего пункта уходил на кнопки под панелью — на экране
    // их не видно, а фокус там. `inert` убирает ветку и из обхода, и из
    // чтения с экрана, поэтому ловушку фокуса писать не нужно.
    const behind = [...document.body.children].filter(
      (el) => el.id !== "site-menu",
    );
    behind.forEach((el) => el.setAttribute("inert", ""));
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      behind.forEach((el) => el.removeAttribute("inert"));
      burger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-paper/85 backdrop-blur-md">
        {/* прочитанная часть страницы — считает браузер по своей прокрутке */}
        <span aria-hidden className="read-progress" />

        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label={site.name}>
            <Logo className="text-[1.0625rem]" />
          </Link>

          {/* Разделы посередине. Полные названия сюда не влезают ни на одном
              экране, поэтому в строке короткие подписи; ниже 1024 строка
              уступает место бургеру. */}
          <nav className="hidden lg:block" aria-label="Разделы сайта">
            <ul className="flex items-center gap-5 xl:gap-7">
              {HEADER_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`draw-line text-[0.8125rem] transition-colors duration-300 hover:text-ink ${
                        active ? "text-ink" : "text-ink/65"
                      }`}
                    >
                      {item.short}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="inline-flex h-10 items-center gap-2 rounded-pill bg-ink pr-4 pl-3.5 text-[0.8125rem] font-medium text-paper transition-transform duration-150 hover:-translate-y-px"
            >
              <Bag className="size-4" />
              <span className="hidden sm:inline">Корзина</span>
              {/* счётчик на бумаге, а не на --brand: из семи цветов корпуса
                  часть не даёт AA ни с тёмным текстом, ни со светлым */}
              <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-paper px-1 text-[0.6875rem] font-semibold text-ink">
                {count}
              </span>
            </Link>

            <button
              ref={burgerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={open}
              aria-controls="site-menu"
              className="grid size-10 cursor-pointer place-items-center rounded-pill border border-hairline transition-colors duration-150 hover:border-ink/40 lg:hidden"
            >
              <span className="flex w-4 flex-col gap-[3px]">
                <span className="h-[1.5px] w-full bg-ink" />
                <span className="h-[1.5px] w-full bg-ink" />
                <span className="h-[1.5px] w-full bg-ink" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Разделы сайта"
          className="fixed inset-0 z-60 bg-paper"
        >
          <div className="shell flex h-16 items-center justify-between">
            <Logo className="text-[1.0625rem]" />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
              className="grid size-10 cursor-pointer place-items-center rounded-pill border border-hairline transition-colors duration-150 hover:border-ink/40"
            >
              <Cross className="size-4" />
            </button>
          </div>

          <nav className="shell mt-8 overflow-y-auto pb-16">
            <ul className="grid gap-1 md:grid-cols-2 md:gap-x-16">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-baseline gap-4 border-b py-4 text-[clamp(1.25rem,2.6vw,1.75rem)] font-normal tracking-[-0.02em] transition-colors duration-150 hover:text-ink ${
                        active
                          ? "border-ink text-ink"
                          : "border-hairline text-ink/65"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-[0.875rem] text-ink/65">
              <a href={site.phoneHref} className="hover:text-ink">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="hover:text-ink">
                {site.email}
              </a>
              <span>{site.city}</span>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
