import type { Metadata } from "next";

import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";
import { sectionMeta } from "@/lib/meta";

const section = SECTIONS.reviews;

export const metadata: Metadata = sectionMeta(section);

export default function Page() {
  return <SectionPage section={section} />;
}
