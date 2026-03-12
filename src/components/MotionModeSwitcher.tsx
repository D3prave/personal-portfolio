export type MotionMode = "core" | "cinematic" | "experimental";

interface MotionModeSwitcherProps {
  mode: MotionMode;
  onChange: (mode: MotionMode) => void;
}

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

export function MotionModeSwitcher({ mode, onChange }: MotionModeSwitcherProps) {
  return (
    <aside className="motion-mode-switcher hover-spotlight" aria-label="Motion presets">
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
    </aside>
  );
}
