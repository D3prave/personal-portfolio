import { useEffect, useRef, useState } from "react";
import type { ContactSectionContent } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";

interface ContactSectionProps {
  contact: ContactSectionContent;
}

export function ContactSection({ contact }: ContactSectionProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const isPdfContact = (href?: string) => href?.toLowerCase().includes(".pdf") ?? false;

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = async (value: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setCopiedValue(value);
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = window.setTimeout(() => {
        setCopiedValue(null);
      }, 1800);
    } catch {
      setCopiedValue(null);
    }
  };

  return (
    <section className="section section-reveal reveal" id={contact.id}>
      <div className="container">
        <SectionIntro
          eyebrow={contact.eyebrow}
          title={contact.title}
          description={contact.description}
        />

        <div className="contact-grid">
          <article
            className="panel contact-copy reveal"
            style={{ ["--reveal-delay" as string]: "20ms" }}
          >
            <div className="contact-copy-content">
              <p>{contact.intro}</p>
              <div className="contact-copy-details">
                <p>
                  <strong>{contact.location}</strong>
                </p>
                <p>{contact.availability}</p>
              </div>
            </div>
            <div className="contact-copy-visual" aria-hidden="true">
              <div className="contact-visual-rings">
                <span />
                <span />
                <span />
              </div>
              <div className="contact-visual-dot" />
            </div>
          </article>

          <article
            className="panel contact-meta reveal"
            aria-label="Contact details"
            style={{ ["--reveal-delay" as string]: "100ms" }}
          >
            <div className="contact-cards-grid">
              {contact.contacts.map((item, index) => (
                <div
                  key={item.label}
                  className={`contact-card reveal${isPdfContact(item.href) ? " contact-card--document" : ""}${item.copyValue ? " contact-card--with-copy" : ""}`}
                  style={{ ["--reveal-delay" as string]: `${140 + index * 60}ms` }}
                >
                  <p className="contact-card-label">{item.label}</p>
                  <div className="contact-card-main">
                    {item.href && isPdfContact(item.href) ? (
                      <div className="contact-card-actions">
                        <a
                          className="contact-inline-action"
                          href={item.href}
                          target={item.target}
                          rel={item.rel}
                        >
                          {item.value}
                        </a>
                        <a
                          className="contact-inline-action"
                          href={item.href}
                          download
                        >
                          Download PDF
                        </a>
                      </div>
                    ) : (
                      <div className="contact-card-value-row">
                        {item.href ? (
                          <a
                            className="contact-card-value"
                            href={item.href}
                            target={item.target}
                            rel={item.rel}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="contact-card-value">{item.value}</p>
                        )}
                        {item.copyValue ? (
                          <button
                            type="button"
                            className="contact-copy-button"
                            onClick={() => void copyToClipboard(item.copyValue!)}
                          >
                            {copiedValue === item.copyValue ? "Copied" : "Copy"}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="contact-card-note">{item.note}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
