import type { Project, SectionContent } from "../types/portfolio";
import { ProjectCard } from "./ProjectCard";
import { SectionIntro } from "./SectionIntro";

interface ProjectsSectionProps {
  section: SectionContent;
  projects: Project[];
  highlightFirst?: boolean;
}

export function ProjectsSection({
  section,
  projects,
  highlightFirst = false,
}: ProjectsSectionProps) {
  const gridClassName = highlightFirst
    ? "projects-stack projects-stack--featured"
    : `projects-grid projects-grid--standard ${
        projects.length <= 2 ? "projects-grid--centered" : ""
      }`.trim();

  return (
    <section className="section section-reveal reveal" id={section.id}>
      <div className="container">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <div className={gridClassName}>
          {projects.map((project, index) => (
              <ProjectCard
                key={project.name}
                project={project}
                index={index}
                primary={highlightFirst && index === 0}
                featured={highlightFirst}
                delay={index * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
