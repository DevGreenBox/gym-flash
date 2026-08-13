import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Рядом лежит внешний pnpm-workspace, поэтому корень указываем явно —
  // иначе Turbopack выбирает родительскую папку.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  // Значок Next в левом нижнем углу перехватывает нажатия по тому, что под
  // ним. На макете, который смотрит заказчик, там оказывается минус
  // в счётчике количества, и кнопка «не работает».
  devIndicators: false,

  // Макет смотрят не с localhost, а через прокси Coder. Без этого списка
  // Next блокирует свои dev-ресурсы как запрос с чужого origin, канал
  // обновления не поднимается, страница остаётся без гидратации —
  // разметка есть, обработчиков нет, ни одна кнопка не отвечает.
  allowedDevOrigins: [
    "3007--main--novi--albert.devgreenboxweb.ru",
    "*.devgreenboxweb.ru",
  ],
};

export default nextConfig;
