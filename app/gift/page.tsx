import type { Metadata } from "next";

import { Constructor } from "@/components/constructor";
import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";
import { sectionMeta } from "@/lib/meta";

const section = SECTIONS.gift;

export const metadata: Metadata = sectionMeta(section);

export default function Page() {
  return (
    <SectionPage section={section} cta={false}>
      <Constructor heading="Соберите подарок" />
    </SectionPage>
  );
}
