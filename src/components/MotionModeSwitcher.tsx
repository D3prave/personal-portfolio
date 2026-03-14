import { useEffect, useId, useRef, useState } from "react";
import type { CtaLink } from "../types/portfolio";
import type { MotionMode, PerformanceMode } from "../types/ui";
import { SmoothAnchor } from "./SmoothAnchor";
import { ThemeToggle } from "./ThemeToggle";

interface MotionModeSwitcherProps {
  mode: MotionMode;
  onChange: (mode: MotionMode) => void;
  performanceMode: PerformanceMode;
  onChangePerformanceMode: (mode: PerformanceMode) => void;
  theme: "dark" | "light";
  onToggleTheme: (theme: "dark" | "light") => void;
  contactHref: `#${string}`;
  resumeCta: CtaLink;
}

const performanceModes: Array<{
  id: PerformanceMode;
  label: string;
  note: string;
}> = [
  {
    id: "lite",
    label: "Lite",
    note: "Safer mobile path",
  },
  {
    id: "full",
    label: "Full",
    note: "Richer visuals",
  },
];

const modes: Array<{
  id: MotionMode;
  label: string;
  note: string;
}> = [
  {
    id: "core",
    label: "Core",
    note: "Clean grid",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    note: "Warm drift",
  },
  {
    id: "experimental",
    label: "Experimental",
    note: "Sharp neon",
  },
];

function ControlIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <circle cx="9" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="11" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}

export function MotionModeSwitcher({
  mode,
  onChange,
  performanceMode,
  onChangePerformanceMode,
  theme,
  onToggleTheme,
  contactHref,
  resumeCta,
}: MotionModeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        rootRef.current.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closePanel = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`motion-mode-switcher ${isOpen ? "is-open" : ""}`}
      aria-label="Quick controls"
    >
      <button
        type="button"
        className="motion-mode-switcher__backdrop"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closePanel}
      />

      <aside
        className="motion-mode-switcher__panel hover-spotlight"
        id={panelId}
        aria-hidden={!isOpen}
      >
        <div className="motion-mode-switcher__header">
          <div>
            <p className="motion-mode-switcher__eyebrow">Quick controls</p>
            <p className="motion-mode-switcher__title">Appearance, motion, and shortcuts</p>
          </div>
        </div>

        <div className="motion-mode-switcher__section">
          <p className="motion-mode-switcher__label">Quick actions</p>
          <div className="motion-mode-switcher__quick-actions">
            <SmoothAnchor
              className="motion-mode-switcher__action motion-mode-switcher__action--primary"
              href={contactHref}
              onClick={closePanel}
            >
              Contact
            </SmoothAnchor>
            <SmoothAnchor
              className="motion-mode-switcher__action motion-mode-switcher__action--secondary"
              href={resumeCta.href}
              target={resumeCta.target}
              rel={resumeCta.rel}
              onClick={closePanel}
            >
              Resume
            </SmoothAnchor>
          </div>
        </div>

        <div className="motion-mode-switcher__section motion-mode-switcher__section--appearance">
          <div className="motion-mode-switcher__appearance-copy">
            <p className="motion-mode-switcher__label">Appearance</p>
            <p className="motion-mode-switcher__current">
              {theme === "dark" ? "Dark mode enabled" : "Light mode enabled"}
            </p>
          </div>
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </div>

        <div className="motion-mode-switcher__section">
          <p className="motion-mode-switcher__label">Performance</p>
          <div
            className="motion-mode-switcher__options motion-mode-switcher__options--performance"
            role="group"
            aria-label="Performance mode"
          >
            {performanceModes.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`motion-mode-switcher__option ${
                  performanceMode === option.id ? "is-active" : ""
                }`}
                aria-pressed={performanceMode === option.id}
                onClick={() => onChangePerformanceMode(option.id)}
              >
                <span>{option.label}</span>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="motion-mode-switcher__section">
          <p className="motion-mode-switcher__label">Motion presets</p>
          <div className="motion-mode-switcher__options" role="group" aria-label="Motion mode">
            {modes.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`motion-mode-switcher__option ${
                  mode === option.id ? "is-active" : ""
                }`}
                aria-pressed={mode === option.id}
                onClick={() => onChange(option.id)}
              >
                <span>{option.label}</span>
                <small>{option.note}</small>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <button
        type="button"
        className="motion-mode-switcher__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Close quick controls" : "Open quick controls"}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="motion-mode-switcher__trigger-icon">
          <ControlIcon />
        </span>
      </button>
    </div>
  );
}
