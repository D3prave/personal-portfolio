import type { ExperienceItem, SectionContent } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";
import { TimelineItem } from "./TimelineItem";

interface ExperienceSectionProps {
  section: SectionContent;
  experience: ExperienceItem[];
}

export function ExperienceSection({
  section,
  experience,
}: ExperienceSectionProps) {
  return (
    <section className="section section-reveal reveal" id={section.id}>
      <div className="container">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="timeline">
          {experience.map((item, index) => (
            <TimelineItem
              key={`${item.organization}-${item.title}`}
              item={item}
              delay={index * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
