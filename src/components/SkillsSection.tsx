import {
  Suspense,
  lazy,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SectionContent, SkillGroup, StackCloudContent } from "../types/portfolio";
import type { PerformanceMode } from "../types/ui";
import { SectionIntro } from "./SectionIntro";
import { SkillVisual } from "./SkillVisual";

const LazyStackCloud = lazy(async () => {
  const module = await import("./StackCloud");

  return {
    default: module.StackCloud,
  };
});

function StackCloudPlaceholder() {
  return (
    <div className="stack-cloud-stage stack-cloud-stage--placeholder" aria-hidden="true">
      <div className="stack-cloud-placeholder-grid">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className="stack-cloud-placeholder-pill" />
        ))}
      </div>
    </div>
  );
}

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
  const cloudPanelRef = useRef<HTMLElement>(null);
  const [shouldLoadCloud, setShouldLoadCloud] = useState(false);

  useEffect(() => {
    if (shouldLoadCloud) {
      return;
    }

    const panel = cloudPanelRef.current;

    if (!panel || typeof window === "undefined") {
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      startTransition(() => {
        setShouldLoadCloud(true);
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        startTransition(() => {
          setShouldLoadCloud(true);
        });
        observer.disconnect();
      },
      {
        rootMargin: "260px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(panel);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadCloud]);

  return (
    <section className="section section-reveal reveal" id={section.id}>
      <div className="container">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <article
          ref={cloudPanelRef}
          className="panel stack-cloud-panel reveal hover-spotlight"
          style={{ ["--reveal-delay" as string]: "40ms" }}
        >
          <div className="stack-cloud-copy">
            <p className="stack-cloud-eyebrow">{cloud.eyebrow}</p>
            <h3>{cloud.title}</h3>
            <p>{cloud.description}</p>
          </div>
          {shouldLoadCloud ? (
            <Suspense fallback={<StackCloudPlaceholder />}>
              <LazyStackCloud items={cloud.items} performanceMode={performanceMode} />
            </Suspense>
          ) : (
            <StackCloudPlaceholder />
          )}
        </article>

        <div className="skills-grid">
          {skillGroups.map((group, index) => (
            <article
              key={group.title}
              className="panel skill-group reveal hover-spotlight"
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
