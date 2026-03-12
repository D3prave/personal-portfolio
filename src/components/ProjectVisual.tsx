import type { Project } from "../types/portfolio";

interface ProjectVisualProps {
  visual: Project["visual"];
  primary?: boolean;
}

export function ProjectVisual({
  visual,
  primary = false,
}: ProjectVisualProps) {
  return (
    <div
      className={`project-visual project-visual--${visual} ${primary ? "project-visual--primary" : ""}`}
      aria-hidden="true"
    >
      {visual === "graph" && (
        <svg viewBox="0 0 100 56" className="project-visual-svg">
          <path d="M10 42L32 18L52 28L72 12L90 24" />
          <path d="M16 16L34 30L58 18L78 40L92 30" />
          <circle cx="10" cy="42" r="2.5" />
          <circle cx="32" cy="18" r="2.5" />
          <circle cx="52" cy="28" r="2.5" />
          <circle cx="72" cy="12" r="2.5" />
          <circle cx="90" cy="24" r="2.5" />
          <circle cx="16" cy="16" r="2" />
          <circle cx="34" cy="30" r="2" />
          <circle cx="58" cy="18" r="2" />
          <circle cx="78" cy="40" r="2" />
          <circle cx="92" cy="30" r="2" />
        </svg>
      )}

      {visual === "booking" && (
        <div className="project-visual-booking">
          <div className="project-visual-calendar">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className={index === 2 || index === 5 || index === 9 ? "is-active" : undefined}
              />
            ))}
          </div>
          <div className="project-visual-occupancy">
            <span style={{ width: "74%" }} />
            <span style={{ width: "51%" }} />
            <span style={{ width: "88%" }} />
          </div>
        </div>
      )}

      {visual === "route" && (
        <svg viewBox="0 0 100 56" className="project-visual-svg project-visual-svg--route">
          <path d="M8 38C18 14 38 14 44 28S62 50 88 14" />
          <circle cx="8" cy="38" r="2.6" />
          <circle cx="28" cy="18" r="2.1" />
          <circle cx="44" cy="28" r="2.4" />
          <circle cx="64" cy="42" r="2.1" />
          <circle cx="88" cy="14" r="2.8" />
        </svg>
      )}

      {visual === "analytics" && (
        <div className="project-visual-analytics">
          <div className="project-visual-bars">
            <span style={{ height: "34%" }} />
            <span style={{ height: "62%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "82%" }} />
            <span style={{ height: "58%" }} />
          </div>
          <svg viewBox="0 0 100 32" className="project-visual-svg project-visual-svg--analytics">
            <path d="M4 24L22 18L36 20L56 10L74 14L96 6" />
          </svg>
        </div>
      )}

      {visual === "media" && (
        <div className="project-visual-media">
          <div className="project-visual-posters">
            <span />
            <span />
            <span />
          </div>
          <div className="project-visual-stars">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
