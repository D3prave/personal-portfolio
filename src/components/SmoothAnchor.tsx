import { useLenis } from "lenis/react";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

interface SmoothAnchorProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

export function SmoothAnchor({
  href,
  onClick,
  target,
  children,
  ...props
}: SmoothAnchorProps) {
  const lenis = useLenis();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !href.startsWith("#") ||
      target === "_blank" ||
      isModifiedEvent(event)
    ) {
      return;
    }

    const targetNode =
      href === "#top"
        ? document.documentElement
        : document.querySelector<HTMLElement>(href);

    if (!targetNode) {
      return;
    }

    event.preventDefault();

    if (lenis) {
      lenis.scrollTo(targetNode, {
        offset: href === "#top" ? 0 : -88,
        duration: 1.2,
        lerp: 0.12,
      });
    } else {
      const targetTop =
        href === "#top"
          ? 0
          : targetNode.getBoundingClientRect().top + window.scrollY - 88;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }

    window.history.replaceState(null, "", href);
  };

  return (
    <a href={href} onClick={handleClick} target={target} {...props}>
      {children}
    </a>
  );
}
