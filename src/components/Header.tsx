import { useEffect, useState } from "react";
import type { NavItem } from "../types/portfolio";
import { SmoothAnchor } from "./SmoothAnchor";

interface HeaderProps {
  brand: string;
  roleLabel: string;
  navigation: NavItem[];
}

export function Header({
  brand,
  roleLabel,
  navigation,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(navigation[0]?.href ?? "#about");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const sectionEntries = navigation.reduce<
      Array<{ href: NavItem["href"]; section: HTMLElement }>
    >((entries, item) => {
      const section = document.querySelector<HTMLElement>(item.href);

      if (section) {
        entries.push({
          href: item.href,
          section,
        });
      }

      return entries;
    }, []);

    const pickActiveHrefFromScrollPosition = () => {
      const scrollPosition = window.scrollY + 140;
      let nextHref = navigation[0]?.href ?? "#about";

      sectionEntries.forEach((entry) => {
        if (entry.section.offsetTop <= scrollPosition) {
          nextHref = entry.href;
        }
      });

      return nextHref;
    };

    if (sectionEntries.length === 0) {
      return;
    }

    if (typeof window.IntersectionObserver === "undefined") {
      let animationFrame = 0;

      const updateActiveItem = () => {
        const nextHref = pickActiveHrefFromScrollPosition();

        setActiveHref((currentHref) =>
          currentHref === nextHref ? currentHref : nextHref,
        );
        animationFrame = 0;
      };

      const handleScroll = () => {
        if (animationFrame !== 0) {
          return;
        }

        animationFrame = window.requestAnimationFrame(updateActiveItem);
      };

      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("lenis-scroll", handleScroll);

      return () => {
        if (animationFrame !== 0) {
          window.cancelAnimationFrame(animationFrame);
        }

        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("lenis-scroll", handleScroll);
      };
    }

    let animationFrame = 0;
    const visibleSections = new Map<
      NavItem["href"],
      {
        ratio: number;
        top: number;
      }
    >();
    const sectionByElement = new Map(
      sectionEntries.map((entry) => [entry.section, entry.href]),
    );

    const updateActiveItem = () => {
      let nextHref = pickActiveHrefFromScrollPosition();

      if (visibleSections.size > 0) {
        nextHref = [...visibleSections.entries()]
          .sort(([, left], [, right]) => {
            if (right.ratio !== left.ratio) {
              return right.ratio - left.ratio;
            }

            return Math.abs(left.top) - Math.abs(right.top);
          })[0]?.[0] ?? nextHref;
      }

      setActiveHref((currentHref) =>
        currentHref === nextHref ? currentHref : nextHref,
      );
      animationFrame = 0;
    };

    const queueUpdate = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateActiveItem);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const href = sectionByElement.get(entry.target as HTMLElement);

          if (!href) {
            return;
          }

          if (entry.isIntersecting) {
            visibleSections.set(href, {
              ratio: entry.intersectionRatio,
              top: entry.boundingClientRect.top,
            });
          } else {
            visibleSections.delete(href);
          }
        });

        queueUpdate();
      },
      {
        rootMargin: "-18% 0px -58% 0px",
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    sectionEntries.forEach((entry) => {
      observer.observe(entry.section);
    });
    queueUpdate();

    return () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      observer.disconnect();
    };
  }, [navigation]);

  useEffect(() => {
    let animationFrame = 0;

    const updateScrollState = () => {
      setIsScrolled((currentState) => {
        const nextState = window.scrollY > 10;
        return currentState === nextState ? currentState : nextState;
      });
      animationFrame = 0;
    };

    const handleScroll = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateScrollState);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("lenis-scroll", handleScroll);

    return () => {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("lenis-scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="container header-inner">
        <SmoothAnchor
          className="brand-link brand-block"
          href="#top"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="brand-name">{brand}</span>
          <span className="brand-role">{roleLabel}</span>
        </SmoothAnchor>

        <div className="header-tools">
          <nav
            id="primary-navigation"
            className={`site-nav ${isMenuOpen ? "is-open" : ""}`}
            aria-label="Primary navigation"
          >
            {navigation.map((item) => (
              <SmoothAnchor
                key={item.href}
                href={item.href}
                className={item.href === activeHref ? "is-active" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </SmoothAnchor>
            ))}
          </nav>
        </div>

        <button
          type="button"
          className={`menu-toggle ${isMenuOpen ? "is-open" : ""}`}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

      </div>

      <button
        type="button"
        className={`nav-backdrop ${isMenuOpen ? "is-open" : ""}`}
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
