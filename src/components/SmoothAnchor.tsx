import { useLenis } from "lenis/react";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { getAnchorOffset } from "../utils/scroll";

interface SmoothAnchorProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

let currentAnchorNavigationToken = 0;

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

function getLiveTargetNode(href: string) {
  return href === "#top"
    ? document.documentElement
    : document.querySelector<HTMLElement>(href);
}

function getAnchorLandingNode(href: string) {
  const targetNode = getLiveTargetNode(href);

  if (!targetNode || href === "#top") {
    return targetNode;
  }

  return targetNode.querySelector<HTMLElement>(".section-intro") ?? targetNode;
}

function getDocumentTop(node: HTMLElement) {
  let current: HTMLElement | null = node;
  let top = 0;

  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return top;
}

function getTargetScrollTop(href: string, anchorOffset: number) {
  const targetNode = getAnchorLandingNode(href);

  if (!targetNode) {
    return null;
  }

  if (href === "#top") {
    return 0;
  }

  return getDocumentTop(targetNode) - anchorOffset;
}

function scrollToAnchorTarget(
  href: string,
  anchorOffset: number,
  lenis: ReturnType<typeof useLenis>,
  immediate: boolean,
) {
  const targetTop = getTargetScrollTop(href, anchorOffset);

  if (targetTop === null) {
    return false;
  }

  if (lenis) {
    lenis.scrollTo(targetTop, {
      immediate,
      duration: immediate ? 0 : 1.2,
      lerp: immediate ? 1 : 0.12,
      force: true,
    });
  } else {
    window.scrollTo({
      top: targetTop,
      behavior: immediate ? "auto" : "smooth",
    });
  }

  return true;
}

function hasBlockingDeferredSections(href: string) {
  if (href === "#top") {
    return false;
  }

  const targetNode = getLiveTargetNode(href);

  if (!targetNode) {
    return false;
  }

  return Array.from(
    document.querySelectorAll<HTMLElement>("main .deferred-section"),
  ).some((placeholder) => {
    if (placeholder.id === targetNode.id) {
      return true;
    }

    return Boolean(
      placeholder.compareDocumentPosition(targetNode) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
}

function waitForDeferredSectionsToSettle(href: string) {
  if (
    href === "#top" ||
    typeof window === "undefined" ||
    !hasBlockingDeferredSections(href)
  ) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const observerTarget = document.querySelector("main") ?? document.body;
    let observer: MutationObserver | null = null;
    let timeoutId = 0;
    let settleFrameOne = 0;
    let settleFrameTwo = 0;

    const finish = () => {
      observer?.disconnect();
      window.clearTimeout(timeoutId);

      if (settleFrameOne !== 0) {
        window.cancelAnimationFrame(settleFrameOne);
      }
      if (settleFrameTwo !== 0) {
        window.cancelAnimationFrame(settleFrameTwo);
      }

      resolve();
    };

    const settle = () => {
      if (settleFrameOne !== 0 || settleFrameTwo !== 0) {
        return;
      }

      settleFrameOne = window.requestAnimationFrame(() => {
        settleFrameTwo = window.requestAnimationFrame(finish);
      });
    };

    const check = () => {
      if (!hasBlockingDeferredSections(href)) {
        settle();
      }
    };

    if (typeof MutationObserver === "function") {
      observer = new MutationObserver(check);
      observer.observe(observerTarget, {
        childList: true,
        subtree: true,
      });
    }

    timeoutId = window.setTimeout(settle, 720);
    check();
  });
}

export function SmoothAnchor({
  href,
  onClick,
  target,
  children,
  ...props
}: SmoothAnchorProps) {
  const lenis = useLenis();

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
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

    const navigationToken = ++currentAnchorNavigationToken;

    if (href !== "#top") {
      window.dispatchEvent(
        new CustomEvent("portfolio:anchor-navigation", {
          detail: { href },
        }),
      );
    }

    await waitForDeferredSectionsToSettle(href);

    if (navigationToken !== currentAnchorNavigationToken) {
      return;
    }

    const anchorOffset = getAnchorOffset();

    window.requestAnimationFrame(() => {
      scrollToAnchorTarget(href, anchorOffset, lenis, false);
    });

    window.history.replaceState(null, "", href);
  };

  return (
    <a href={href} onClick={handleClick} target={target} {...props}>
      {children}
    </a>
  );
}
