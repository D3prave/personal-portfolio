import { useEffect, useState } from "react";
import type { NavItem } from "../types/portfolio";
import { SmoothAnchor } from "./SmoothAnchor";

interface HeaderProps {
  brand: string;
  roleLabel: string;
  navigation: NavItem[];
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({
  brand,
  roleLabel,
  navigation,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(navigation[0]?.href ?? "#about");

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
    let animationFrame = 0;

    const updateActiveItem = () => {
      const scrollPosition = window.scrollY + 140;
      let nextHref = navigation[0]?.href ?? "#about";

      navigation.forEach((item) => {
        const section = document.querySelector<HTMLElement>(item.href);

        if (section && section.offsetTop <= scrollPosition) {
          nextHref = item.href;
        }
      });

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
  }, [navigation]);

  return (
    <header className="site-header">
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

          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={onToggleTheme}
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              {theme === "dark" ? "\u2600" : "\u263D"}
            </span>
            <span className="theme-toggle__label">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>
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
