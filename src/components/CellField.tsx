import type { CSSProperties } from "react";

const cells = [
  { left: "8%", top: "16%", size: "4.2rem", delay: "0s", tone: "accent", depth: "strong" },
  { left: "18%", top: "34%", size: "3.1rem", delay: "1.4s", tone: "muted", depth: "soft" },
  { left: "30%", top: "12%", size: "5rem", delay: "2.1s", tone: "warm", depth: "strong" },
  { left: "42%", top: "28%", size: "3.6rem", delay: "0.9s", tone: "accent", depth: "medium" },
  { left: "56%", top: "14%", size: "4.6rem", delay: "2.8s", tone: "muted", depth: "medium" },
  { left: "70%", top: "36%", size: "3.2rem", delay: "1.1s", tone: "warm", depth: "soft" },
  { left: "84%", top: "20%", size: "4.8rem", delay: "3.3s", tone: "accent", depth: "strong" },
  { left: "12%", top: "58%", size: "3.4rem", delay: "2.6s", tone: "muted", depth: "medium" },
  { left: "26%", top: "72%", size: "4.4rem", delay: "0.7s", tone: "warm", depth: "strong" },
  { left: "44%", top: "64%", size: "3rem", delay: "1.9s", tone: "accent", depth: "soft" },
  { left: "58%", top: "78%", size: "5.2rem", delay: "2.4s", tone: "muted", depth: "medium" },
  { left: "78%", top: "66%", size: "3.8rem", delay: "0.4s", tone: "warm", depth: "strong" },
] as const;

export function CellField() {
  return (
    <div className="cell-field" aria-hidden="true">
      {cells.map((cell, index) => (
        <span
          key={`${cell.left}-${cell.top}-${index}`}
          className={`cell-node-shell cell-node-shell--${cell.depth}`}
          style={
            {
              left: cell.left,
              top: cell.top,
              width: cell.size,
              height: cell.size,
              "--cell-delay": cell.delay,
              "--cell-order": index,
            } as CSSProperties
          }
        >
          <span className={`cell-node cell-node--${cell.tone}`} />
        </span>
      ))}
    </div>
  );
}
