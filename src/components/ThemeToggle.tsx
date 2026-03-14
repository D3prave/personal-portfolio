import { useCallback, useRef } from "react";
import { flushSync } from "react-dom";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggleTheme: (theme: "dark" | "light") => void;
  duration?: number;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: Document["startViewTransition"];
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 1.8v3.1M12 19.1v3.1M4.78 4.78l2.2 2.2M17.02 17.02l2.2 2.2M1.8 12h3.1M19.1 12h3.1M4.78 19.22l2.2-2.2M17.02 6.98l2.2-2.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.5 14.2A8.7 8.7 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ThemeToggle({
  theme,
  onToggleTheme,
  duration = 520,
}: ThemeToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    const nextTheme = theme === "dark" ? "light" : "dark";

    if (!button) {
      onToggleTheme(nextTheme);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const applyTheme = () => {
      onToggleTheme(nextTheme);
    };

    const documentWithTransition = document as ViewTransitionDocument;
    const root = document.documentElement;
    const applyThemeWithLock = () => {
      root.classList.add("theme-transition-lock");
      flushSync(applyTheme);
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          root.classList.remove("theme-transition-lock");
        }, 24);
      });
    };

    if (
      prefersReducedMotion ||
      typeof documentWithTransition.startViewTransition !== "function"
    ) {
      applyThemeWithLock();
      return;
    }

    const clearTransitionState = () => {
      root.classList.remove("theme-transitioning", "theme-transition-lock");
      root.style.removeProperty("--theme-wave-x");
      root.style.removeProperty("--theme-wave-y");
      root.style.removeProperty("--theme-wave-radius");
      root.style.removeProperty("--theme-wave-duration");
    };

    root.style.setProperty("--theme-wave-x", `${x}px`);
    root.style.setProperty("--theme-wave-y", `${y}px`);
    root.style.setProperty("--theme-wave-radius", `${maxRadius}px`);
    root.style.setProperty("--theme-wave-duration", `${duration}ms`);
    root.classList.add("theme-transitioning", "theme-transition-lock");

    const transition = documentWithTransition.startViewTransition(() => {
      flushSync(applyTheme);
    });

    window.setTimeout(clearTransitionState, duration + 80);
    void transition.finished.finally(() => {
      window.requestAnimationFrame(() => {
        clearTransitionState();
      });
    });
  }, [duration, onToggleTheme, theme]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        <span className="theme-toggle__icon-layer theme-toggle__icon-layer--sun">
          <SunIcon />
        </span>
        <span className="theme-toggle__icon-layer theme-toggle__icon-layer--moon">
          <MoonIcon />
        </span>
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
