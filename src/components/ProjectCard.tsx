import type { Project } from "../types/portfolio";
import { ProjectVisual } from "./ProjectVisual";

interface ProjectCardProps {
  project: Project;
  index?: number;
  primary?: boolean;
  featured?: boolean;
  delay?: number;
}

export function ProjectCard({
  project,
  index = 0,
  primary = false,
  featured = false,
  delay = 0,
}: ProjectCardProps) {
  return (
    <article
      className={`project-card reveal hover-spotlight ${primary ? "project-card--primary" : "project-card--secondary"} ${featured ? "project-card--featured" : ""}`}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      <div className="project-layout">
        <div className="project-overview">
          <div className="project-topline">
            <div className="badge-row">
              {project.badges.map((badge) => (
                <span key={badge} className="badge">
                  {badge}
                </span>
              ))}
            </div>
            <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
          </div>

          <header className="project-header">
            <h3 className="project-name">{project.name}</h3>
            <p className="project-emphasis">{project.emphasis}</p>
            <p className="project-summary">{project.summary}</p>
          </header>

          <ProjectVisual visual={project.visual} primary={primary} />
        </div>

        <div className="project-body">
          <p className="project-description">{project.description}</p>

          <div className="project-meta">
            <div>
              <p className="list-title">Highlights</p>
              <ul className="project-highlights">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="list-title">Tech Stack</p>
              <div className="tech-list">
                {project.tech.map((item) => (
                  <span key={item} className="tech-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
