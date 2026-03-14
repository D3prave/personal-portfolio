import type { ExperienceItem } from "../types/portfolio";

interface TimelineItemProps {
  item: ExperienceItem;
  delay?: number;
}

export function TimelineItem({ item, delay = 0 }: TimelineItemProps) {
  const isCurrent = item.period === "Current";

  return (
    <article
      className="timeline-item reveal"
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      <div className={`timeline-card panel ${isCurrent ? "timeline-card--current" : ""}`}>
        <div className="timeline-topline">
          <div>
            <h3 className="timeline-title">{item.title}</h3>
            <p className="timeline-org">{item.organization}</p>
          </div>
          <span className={`timeline-period ${isCurrent ? "timeline-period--current" : ""}`}>
            {item.period}
          </span>
        </div>

        <p className="timeline-summary">{item.summary}</p>

        <ul className="timeline-bullets">
          {item.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
