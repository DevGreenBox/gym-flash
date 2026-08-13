import type { Metadata } from "next";

import { Constructor } from "@/components/constructor";
import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";

const section = SECTIONS.study;

export const metadata: Metadata = {
  title: section.title,
  openGraph: { title: section.title },
};

export default function Page() {
  return (
    <SectionPage section={section} cta={false}>
      <Constructor heading="Соберите свою флешку" />
    </SectionPage>
  );
}
