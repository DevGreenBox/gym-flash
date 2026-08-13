import type { Metadata } from "next";

import { Gallery } from "@/components/gallery";
import { SectionPage } from "@/components/section-page";
import { SECTIONS } from "@/lib/content";

const section = SECTIONS.gallery;

export const metadata: Metadata = {
  title: section.title,
  openGraph: { title: section.title },
};

export default function Page() {
  return (
    <SectionPage section={section}>
      <Gallery />
    </SectionPage>
  );
}
