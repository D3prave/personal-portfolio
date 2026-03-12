import type { SkillGroup } from "../types/portfolio";

interface SkillVisualProps {
  visual: SkillGroup["visual"];
}

export function SkillVisual({ visual }: SkillVisualProps) {
  return (
    <div className={`skill-visual skill-visual--${visual}`} aria-hidden="true">
      {visual === "network" && (
        <svg viewBox="0 0 100 48" className="skill-visual-svg">
          <path d="M10 34L28 16L48 24L70 10L90 18" />
          <path d="M14 18L34 30L58 18L84 34" />
          <circle cx="10" cy="34" r="2.4" />
          <circle cx="28" cy="16" r="2.4" />
          <circle cx="48" cy="24" r="2.4" />
          <circle cx="70" cy="10" r="2.4" />
          <circle cx="90" cy="18" r="2.4" />
        </svg>
      )}

      {visual === "wave" && (
        <svg viewBox="0 0 100 48" className="skill-visual-svg skill-visual-svg--wave">
          <path d="M0 28C12 14 24 14 36 28S60 42 76 22 92 8 100 14" />
          <path d="M0 38C12 24 24 24 36 38S60 52 76 32 92 18 100 24" />
        </svg>
      )}

      {visual === "stack" && (
        <div className="skill-visual-stack">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      {visual === "grid" && (
        <div className="skill-visual-grid">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className={index === 1 || index === 5 || index === 9 ? "is-active" : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
