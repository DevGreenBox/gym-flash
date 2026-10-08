import type { Metadata } from "next";

import { Constructor } from "@/components/constructor";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  title: "Групповая программа",
  description:
    "Конструктор флешек для групповой программы: надпись, пиктограмма и цвет на лицевой стороне, надпись или логотип на обороте.",
  path: "/group",
});

/** Групповая программа — тот же конструктор, свой набор флешек и базы. */
export default function Page() {
  return (
    <Constructor
      base="group"
      headingAs="h1"
      heading="Флешки для групповой программы"
      priority
    />
  );
}
