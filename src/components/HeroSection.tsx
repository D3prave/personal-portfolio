import type { ContactItem, HeroContent } from "../types/portfolio";
import { HeroGraphScene } from "./HeroGraphScene";
import { SmoothAnchor } from "./SmoothAnchor";

interface HeroSectionProps {
  hero: HeroContent;
  contactLinks: ContactItem[];
}

export function HeroSection({ hero, contactLinks }: HeroSectionProps) {
  return (
    <section className="hero section" id="top">
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-description">{hero.description}</p>

          <div className="hero-signals">
            {hero.signals.map((signal, index) => (
              <article
                key={signal.label}
                className="signal-card reveal"
                style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}
              >
                <span className="signal-label">{signal.label}</span>
                <span className="signal-value">{signal.value}</span>
              </article>
            ))}
          </div>

          <div className="cta-row">
            {hero.ctas.map((cta) => (
              <SmoothAnchor
                key={cta.label}
                className={`button-link button-link--${cta.variant}`}
                href={cta.href}
              >
                {cta.label}
              </SmoothAnchor>
            ))}
          </div>

          <SmoothAnchor
            className="hero-scroll-hint reveal"
            href="#about"
            style={{ ["--reveal-delay" as string]: "220ms" }}
          >
            <span className="hero-scroll-icon" aria-hidden="true" />
            Explore profile
          </SmoothAnchor>

          <div className="hero-stats">
            {hero.stats.map((stat, index) => (
              <article
                key={stat.label}
                className="stat-card reveal"
                style={{ ["--reveal-delay" as string]: `${160 + index * 70}ms` }}
              >
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </article>
            ))}
          </div>

          <div className="quick-link-list">
            {contactLinks.map((item, index) => (
              <a
                key={item.label}
                className="quick-link reveal"
                href={item.href}
                style={{ ["--reveal-delay" as string]: `${280 + index * 80}ms` }}
              >
                <span className="quick-link-label">{item.label}</span>
                <span className="quick-link-value">{item.value}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hero-aside">
          <HeroGraphScene />

          <aside
            className="hero-panel hover-spotlight reveal"
            style={{ ["--reveal-delay" as string]: "220ms" }}
          >
            <p className="panel-label">{hero.highlightsTitle}</p>
            <ul className="hero-highlight-list">
              {hero.highlights.map((item) => (
                <li key={item.title} className="hero-highlight-item">
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
