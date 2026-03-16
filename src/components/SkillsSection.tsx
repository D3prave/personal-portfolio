import type { SectionContent, SkillGroup, StackCloudContent } from "../types/portfolio";
import type { PerformanceMode } from "../types/ui";
import { SectionIntro } from "./SectionIntro";
import { SkillVisual } from "./SkillVisual";
import { StackCloud } from "./StackCloud";

interface SkillsSectionProps {
  section: SectionContent;
  cloud: StackCloudContent;
  skillGroups: SkillGroup[];
  performanceMode: PerformanceMode;
}

export function SkillsSection({
  section,
  cloud,
  skillGroups,
  performanceMode,
}: SkillsSectionProps) {
  return (
    <section className="section section-reveal reveal" id={section.id}>
      <div className="container">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <article
          className="panel stack-cloud-panel reveal"
          style={{ ["--reveal-delay" as string]: "40ms" }}
        >
          <div className="stack-cloud-copy">
            <p className="stack-cloud-eyebrow">{cloud.eyebrow}</p>
            <h3>{cloud.title}</h3>
            <p>{cloud.description}</p>
          </div>
          <StackCloud items={cloud.items} performanceMode={performanceMode} />
        </article>

        <div className="skills-grid">
          {skillGroups.map((group, index) => (
            <article
              key={group.title}
              className="panel skill-group reveal"
              style={{ ["--reveal-delay" as string]: `${90 + index * 70}ms` }}
            >
              <div className="skill-group-topline">
                <span className="skill-group-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <SkillVisual visual={group.visual} />
              <ul className="skill-list">
                {group.items.map((item) => (
                  <li key={item} className="skill-item">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
