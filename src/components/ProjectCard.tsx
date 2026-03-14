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
  const hasLinks = Boolean(project.repoUrl || project.liveUrl);
  const hasMedia = Boolean(project.media);
  const mediaVariantClassName = hasMedia
    ? `project-card--media-${project.media?.cardVariant ?? "default"}`
    : "";

  return (
    <article
      className={`project-card reveal hover-spotlight ${primary ? "project-card--primary" : "project-card--secondary"} ${featured ? "project-card--featured" : ""} ${hasMedia ? "project-card--has-media" : ""} ${mediaVariantClassName}`}
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

          <ProjectVisual
            visual={project.visual}
            media={project.media}
            primary={primary}
            projectName={project.name}
          />
        </div>

        <div className="project-body">
          <p className="project-description">{project.description}</p>

          {project.proof?.length ? (
            <div className="project-proof" aria-label={`${project.name} proof points`}>
              {project.proof.map((item) => (
                <article key={`${item.value}-${item.label}`} className="project-proof-card">
                  <span className="project-proof-value">{item.value}</span>
                  <span className="project-proof-label">{item.label}</span>
                </article>
              ))}
            </div>
          ) : null}

          {hasLinks ? (
            <div className="project-actions" aria-label={`${project.name} links`}>
              {project.repoUrl ? (
                <a
                  className="button-link button-link--secondary project-action-link"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository
                </a>
              ) : null}

              {project.liveUrl ? (
                <a
                  className="button-link button-link--primary project-action-link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo
                </a>
              ) : null}
            </div>
          ) : null}

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
