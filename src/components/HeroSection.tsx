import type { ContactItem, HeroContent } from "../types/portfolio";
import { HeroGraphScene } from "./HeroGraphScene";
import { MagicText } from "./MagicText";
import { SmoothAnchor } from "./SmoothAnchor";

interface HeroSectionProps {
  hero: HeroContent;
  contactLinks: ContactItem[];
  isLitePerformance?: boolean;
}

export function HeroSection({
  hero,
  contactLinks,
  isLitePerformance,
}: HeroSectionProps) {
  return (
    <section className="hero section" id="top">
      <div className="container hero-grid">
        <div className="hero-copy reveal">
          <p className="eyebrow">{hero.eyebrow}</p>
          <p
            className="hero-magic-line reveal"
            style={{ ["--reveal-delay" as string]: "40ms" }}
          >
            <span className="hero-magic-label">{hero.magicLabel}</span>
            <MagicText words={hero.magicWords} />
          </p>
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
                target={cta.target}
                rel={cta.rel}
              >
                {cta.label}
              </SmoothAnchor>
            ))}
            <SmoothAnchor
              className={`button-link button-link--${hero.resumeCta.variant}`}
              href={hero.resumeCta.href}
              target={hero.resumeCta.target}
              rel={hero.resumeCta.rel}
            >
              {hero.resumeCta.label}
            </SmoothAnchor>
            <SmoothAnchor
              className="button-link button-link--secondary"
              href={hero.resumeCta.href}
              download
            >
              Download CV
            </SmoothAnchor>
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
          <HeroGraphScene isLitePerformance={isLitePerformance} />

          <aside
            className="hero-panel reveal"
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
