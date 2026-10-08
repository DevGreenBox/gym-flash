import type { Metadata } from "next";

import { Constructor } from "@/components/constructor";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  title: "Другие виды спорта",
  description:
    "Конструктор флешек для других видов спорта: надпись, пиктограмма и цвет на лицевой стороне, надпись или логотип на обороте.",
  path: "/sport",
});

/** Другие виды спорта — тот же конструктор, свой набор флешек и базы. */
export default function Page() {
  return (
    <Constructor
      base="sport"
      headingAs="h1"
      heading="Флешки для других видов спорта"
      priority
    />
  );
}
