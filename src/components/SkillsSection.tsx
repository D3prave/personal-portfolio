import type { SectionContent, SkillGroup } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";
import { SkillVisual } from "./SkillVisual";

interface SkillsSectionProps {
  section: SectionContent;
  skillGroups: SkillGroup[];
}

export function SkillsSection({
  section,
  skillGroups,
}: SkillsSectionProps) {
  return (
    <section className="section" id={section.id}>
      <div className="container">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className="skills-grid">
          {skillGroups.map((group, index) => (
            <article
              key={group.title}
              className="panel skill-group reveal hover-spotlight"
              style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
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
