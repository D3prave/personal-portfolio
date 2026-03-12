import type { ContactSectionContent } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";

interface ContactSectionProps {
  contact: ContactSectionContent;
}

export function ContactSection({ contact }: ContactSectionProps) {
  return (
    <section className="section" id={contact.id}>
      <div className="container">
        <SectionIntro
          eyebrow={contact.eyebrow}
          title={contact.title}
          description={contact.description}
        />

        <div className="contact-grid">
          <article
            className="panel contact-copy reveal hover-spotlight"
            style={{ ["--reveal-delay" as string]: "20ms" }}
          >
            <p>{contact.intro}</p>
            <p>
              <strong>{contact.location}</strong>
            </p>
            <p>{contact.availability}</p>
          </article>

          <article
            className="panel contact-meta reveal hover-spotlight"
            aria-label="Contact details"
            style={{ ["--reveal-delay" as string]: "100ms" }}
          >
            {contact.contacts.map((item, index) => (
              <div
                key={item.label}
                className="contact-detail reveal"
                style={{ ["--reveal-delay" as string]: `${140 + index * 60}ms` }}
              >
                <div>
                  <p className="contact-label">{item.label}</p>
                  {item.href ? (
                    <a className="contact-value" href={item.href}>
                      {item.value}
                    </a>
                  ) : (
                    <p className="contact-value">{item.value}</p>
                  )}
                </div>
                <p className="contact-note">{item.note}</p>
              </div>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
