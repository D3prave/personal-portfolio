import { useEffect, useRef, useState } from "react";
import type { ContactSectionContent } from "../types/portfolio";
import { SectionIntro } from "./SectionIntro";

interface ContactSectionProps {
  contact: ContactSectionContent;
}

export function ContactSection({ contact }: ContactSectionProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const githubContact = contact.contacts.find((item) => item.label === "GitHub");

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
            <p>{contact.intro}</p>
            <p>
              <strong>{contact.location}</strong>
            </p>
            <p>{contact.availability}</p>
            {githubContact?.href ? (
              <div className="contact-copy-actions">
                <a
                  className="button-link button-link--secondary"
                  href={githubContact.href}
                  target={githubContact.target}
                  rel={githubContact.rel}
                >
                  Browse GitHub
                </a>
              </div>
            ) : null}
          </article>

          <article
            className="panel contact-meta reveal"
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
                  <div className="contact-value-row">
                    {item.href ? (
                      <a
                        className="contact-value"
                        href={item.href}
                        target={item.target}
                        rel={item.rel}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="contact-value">{item.value}</p>
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
