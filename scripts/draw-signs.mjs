/**
 * Пиктограммы учёбы и подарка в стиле пиктограмм заказчика
 * (`assets/signs-source.pdf`): та же рамка 11,5 × 15 мм (32,559 × 42,469 пт),
 * залитый силуэт в ракурсе сверху, подпись снизу справа — жирная,
 * рукописная, узкая, с наклоном букв и подъёмом строки на 6°.
 *
 * Базы этих направлений заказчик не присылал: знаки нарисованы нами
 * по его просьбе от 08.10 — «в одном стиле, как в PDF». Пришлёт свои —
 * заменить файлы, а этот скрипт удалить.
 *
 * Подпись набрана Playpen Sans Bold — тем же шрифтом, которым сайт
 * заменяет Segoe Print (см. docs/шрифт-гравировки.md) — и переведена
 * в контуры: SVG внутри `<image>` шрифтов страницы не видит.
 *
 * У знака две части: силуэт и «дырки» — детали внутри силуэта.
 * На металле знак белый, а дырки вырезаны маской: сквозь них виден
 * цвет корпуса, как на гравировке.
 *
 * Запуск:
 *   npm i --prefix /tmp/ot opentype.js@1.3.4
 *   OPENTYPE=/tmp/ot/node_modules/opentype.js/dist/opentype.module.js \
 *     node scripts/draw-signs.mjs
 * Шрифт: assets/playpen-sans-700.ttf — Google Fonts, Playpen Sans 700,
 * подмножество с буквами подписей (`css2?family=Playpen+Sans:wght@700&text=…`).
 */
import fs from "node:fs";

const { default: opentype } = await import(process.env.OPENTYPE ?? "opentype.js");
const font = opentype.parse(fs.readFileSync("assets/playpen-sans-700.ttf").buffer);
const OUT = "public/signs";
const W = 32.559, H = 42.469;

// Подпись — как в PDF: высота прописных около 9 единиц рамки (3,2 мм),
// буквы узкие и с наклоном, строка поднимается вправо на 6°. Прижата
// к правому краю, правый конец базовой линии — на 37,4.
const CAP = (font.tables.os2.sCapHeight || font.unitsPerEm * 0.7) / font.unitsPerEm;
function caption(text) {
  const size = 9 / CAP;
  const raw = font.getPath(text, 0, 0, size);
  const bb = raw.getBoundingBox();
  const sx = Math.min(0.74, 30.6 / (bb.x2 - bb.x1));
  const t = `translate(${(W - 0.9).toFixed(2)} 37.4) rotate(-6) skewX(-10) scale(${sx.toFixed(3)} 1) translate(${(-bb.x2).toFixed(2)} 0)`;
  return `<path transform="${t}" d="${raw.toPathData(2)}"/>`;
}

const SIGNS = {
  study: {
    label: "Учёба",
    // раскрытая книга чуть сверху и с наклоном, как предметы в PDF:
    // два блока страниц сходятся к корешку, под ними обрез обложки
    body: (ink) => `
      <g transform="rotate(-7 16.3 16.5)">
        <path d="M16.3 9.6C12.2 7 7.2 7 3.4 9.1L1.6 22.4C5.9 20.6 11.6 20.8 16.3 23.5Z"/>
        <path d="M16.3 9.6C20.4 7 25.4 7 29.2 9.1L31 22.4C26.7 20.6 21 20.8 16.3 23.5Z"/>
        <path d="M1.4 24.2C6 22.5 11.4 22.8 16.3 25.6C21.2 22.8 26.6 22.5 31.2 24.2" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>
      </g>`,
    // корешок и строки на страницах
    holes: (c) => `
      <g transform="rotate(-7 16.3 16.5)" fill="none" stroke="${c}" stroke-linecap="round">
        <path d="M16.3 10.2V22.8" stroke-width="0.8"/>
        <g stroke-width="0.85">
          <path d="M5.4 12.1C8.4 11.1 11.2 11.2 13.6 12.4"/>
          <path d="M5 15.3C8 14.3 10.9 14.4 13.5 15.6"/>
          <path d="M4.6 18.5C7.6 17.5 10.6 17.6 13.4 18.8"/>
          <path d="M19 12.4C21.4 11.2 24.2 11.1 27.2 12.1"/>
          <path d="M19.1 15.6C21.7 14.4 24.6 14.3 27.6 15.3"/>
          <path d="M19.2 18.8C22 17.6 25 17.5 28 18.5"/>
        </g>
      </g>`,
  },
  gift: {
    label: "Подарок",
    // коробка в три четверти: перед, бок и крышка, бант двумя петлями
    body: (ink) => `
      <path d="M3.4 13.4L19.4 15.6V27.6L3.4 25.4Z"/>
      <path d="M19.4 15.6L29.4 12.4V24.4L19.4 27.6Z"/>
      <path d="M3.4 13.4L13.6 10.4L29.4 12.4L19.4 15.6Z"/>
      <g fill="none" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
        <path d="M16.4 12.4C12.6 7.4 8 7.6 9.4 10.4C10.4 12 13.6 12.4 16.4 12.4Z"/>
        <path d="M16.4 12.4C18.4 6.4 23.4 5.8 23 8.8C22.6 10.8 19.4 12 16.4 12.4Z"/>
      </g>`,
    // рёбра между гранями и лента крест-накрест через крышку
    holes: (c) => `
      <g fill="none" stroke="${c}" stroke-linejoin="round">
        <path d="M3.4 13.4L19.4 15.6L29.4 12.4M19.4 15.6V27.6" stroke-width="0.7"/>
        <path d="M11.4 14.5V26.5M8.5 11.9L24.4 14M11.4 14.5L21.4 11.4M24.4 14V26" stroke-width="1.9"/>
      </g>`,
  },
};

for (const [id, s] of Object.entries(SIGNS)) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">` +
    `<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="#fff"/>${s.holes("#000")}</mask>` +
    `<g fill="#fff" mask="url(#m)">${s.body("#fff")}</g>` +
    `<g fill="#fff">${caption(s.label)}</g></svg>`;
  fs.writeFileSync(`${OUT}/${id}.svg`, svg.replace(/\n\s*/g, ""));
  console.log(`${id}: ${Math.round(svg.length / 1024)} КБ`);
}
