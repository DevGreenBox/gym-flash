import type { Metadata } from "next";

import { SectionPage } from "@/components/section-page";
import { WorkGroups } from "@/components/works";
import { SECTIONS } from "@/lib/content";
import { sectionMeta } from "@/lib/meta";

const section = SECTIONS.gallery;

export const metadata: Metadata = sectionMeta(section);

/** По эскизу заказчика от 08.10: работы по направлениям, каруселями. */
export default function Page() {
  return (
    /* общего призыва в конце нет: у каждого направления своя кнопка
       «Создай свою флешку», а на эскизе заказчика его нет */
    <SectionPage section={section} cta={false}>
      <WorkGroups />
    </SectionPage>
  );
}
