import type { AboutContent } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";

interface AboutSectionProps {
  about: AboutContent;
}

export function AboutSection({ about }: AboutSectionProps) {
  return (
    <section className="section section-reveal reveal" id={about.id}>
      <div className="container">
        <SectionIntro
          eyebrow={about.eyebrow}
          title={about.title}
          description={about.description}
        />

        <div className="about-editorial">
          <article
            className="panel about-story reveal hover-spotlight"
            style={{ ["--reveal-delay" as string]: "40ms" }}
          >
            <div className="about-story-top">
              <p className="list-title">Current contracts</p>
              <div className="contract-band" aria-label="Current technical roles">
                {about.currentContracts.map((contract, index) => (
                  <article key={contract.detail} className="contract-pill">
                    <span className="contract-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="contract-copy">
                      <p className="contract-title">{contract.title}</p>
                      <p className="contract-detail">{contract.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="text-stack">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <div className="about-rail">
            {about.focusAreas.map((item, index) => (
              <article
                key={item.title}
                className={`panel about-node reveal hover-spotlight ${index % 2 === 1 ? "about-node--offset" : ""}`}
                style={{ ["--reveal-delay" as string]: `${90 + index * 80}ms` }}
              >
                <span className="about-node-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="interest-matrix">
          {about.interestTracks.map((track, index) => (
            <article
              key={track.title}
              className="panel interest-card reveal hover-spotlight"
              style={{
                ["--reveal-delay" as string]: `${190 + index * 90}ms`,
                ["--interest-level" as string]: `${track.level}%`,
              }}
            >
              <div className="interest-header">
                <div>
                  <p className="interest-title">{track.title}</p>
                  <p className="interest-emphasis">{track.emphasis}</p>
                </div>
                <span className="interest-level">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="interest-meter" aria-hidden="true">
                <span />
              </div>

              <p className="interest-copy">{track.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
