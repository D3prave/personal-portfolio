import type { CtaLink } from "../types/portfolio";
import { SmoothAnchor } from "./SmoothAnchor";

interface MobileStickyBarProps {
  contactHref: `#${string}`;
  resumeCta: CtaLink;
}

export function MobileStickyBar({
  contactHref,
  resumeCta,
}: MobileStickyBarProps) {
  return (
    <div className="mobile-sticky-bar" aria-label="Quick actions">
      <SmoothAnchor
        className="mobile-sticky-bar__link mobile-sticky-bar__link--primary"
        href={contactHref}
      >
        Contact
      </SmoothAnchor>
      <SmoothAnchor
        className="mobile-sticky-bar__link mobile-sticky-bar__link--secondary"
        href={resumeCta.href}
        target={resumeCta.target}
        rel={resumeCta.rel}
      >
        CV
      </SmoothAnchor>
    </div>
  );
}
