import type { Metadata } from "next";

import { Gallery } from "@/components/gallery";
import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";
import { sectionMeta } from "@/lib/meta";

const section = SECTIONS.gallery;

export const metadata: Metadata = sectionMeta(section);

export default function Page() {
  return (
    <SectionPage section={section}>
      <Gallery />
    </SectionPage>
  );
}
