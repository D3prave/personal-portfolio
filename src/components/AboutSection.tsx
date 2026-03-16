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
          <div className="about-story-column">
            <article
              className="panel about-contracts reveal"
              style={{ ["--reveal-delay" as string]: "40ms" }}
            >
              <p className="list-title">Current contracts</p>
              <div className="contract-list" aria-label="Current technical roles">
                {about.currentContracts.map((contract, index) => (
                  <div key={contract.detail} className="contract-row">
                    <span className="contract-row-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="contract-row-content">
                      <span className="contract-row-title">{contract.title}</span>
                      <span className="contract-row-detail">{contract.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article
              className="panel about-story reveal"
              style={{ ["--reveal-delay" as string]: "60ms" }}
            >
              <div className="text-stack">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>

          <div className="about-rail">
            {about.focusAreas.map((item, index) => (
              <article
                key={item.title}
                className={`panel about-node reveal ${index % 2 === 1 ? "about-node--offset" : ""}`}
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
              className="panel interest-card reveal"
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
