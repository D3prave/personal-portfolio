import { useEffect, useRef } from "react";

const nodes = [
  { id: "backends", label: "Backends", x: 18, y: 24 },
  { id: "data", label: "Data", x: 48, y: 13 },
  { id: "graphs", label: "Graphs", x: 81, y: 24 },
  { id: "apis", label: "APIs", x: 20, y: 69 },
  { id: "ml", label: "ML", x: 50, y: 82 },
  { id: "products", label: "Products", x: 82, y: 66 },
] as const;

const edges = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 5],
  [1, 5],
] as const;

const packets = [
  { from: 0, to: 1, delay: 0,   duration: 2.8, tone: "accent" },
  { from: 1, to: 2, delay: 1.2, duration: 3.2, tone: "warm"   },
  { from: 1, to: 4, delay: 2.4, duration: 2.6, tone: "muted"  },
  { from: 3, to: 4, delay: 0.8, duration: 3.0, tone: "accent" },
  { from: 4, to: 5, delay: 1.8, duration: 2.4, tone: "warm"   },
  { from: 0, to: 3, delay: 3.2, duration: 2.8, tone: "muted"  },
  { from: 2, to: 4, delay: 4.0, duration: 3.4, tone: "accent" },
  { from: 1, to: 5, delay: 2.0, duration: 3.0, tone: "warm"   },
] as const;

const toneColors: Record<string, string> = {
  accent: "rgba(125,211,252,0.96)",
  warm:   "rgba(246,193,119,0.92)",
  muted:  "rgba(191,204,222,0.9)",
};

const footerTags = ["Backend systems", "Data analytics", "Applied ML"];

// Half-size of the packet dot in px — subtract from left/top to visually centre it.
const DOT_R = 4;

export function HeroGraphScene({
  isLitePerformance,
}: {
  isLitePerformance?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isLitePerformance) return;

    // HTML div dots, positioned absolute inside hero-visual-canvas.
    const dots = Array.from(
      container.querySelectorAll<HTMLElement>("[data-packet]"),
    );

    // Packets run as Web Animations (transform + opacity only), so the
    // browser's compositor plays them at full refresh rate with no per-frame
    // JS. Same code path in Chrome and Safari.
    let animations: Animation[] = [];
    let visible = true;

    const buildAnimations = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];

      const cw = container.clientWidth;
      const ch = container.clientHeight;

      dots.forEach((dot, index) => {
        const packet = packets[index];
        if (!packet) {
          return;
        }

        const from = nodes[packet.from];
        const to = nodes[packet.to];
        // left/top are set inline as calc(x% - DOT_R px); the transform moves
        // from there in CSS px, converting SVG user units via cw/100, ch/100.
        const dx = ((to.x - from.x) / 100) * cw;
        const dy = ((to.y - from.y) / 100) * ch;

        // Same timing as the old SMIL keyTimes: fade in over the first 5%,
        // travel until 90%, fade out over the last 10%.
        const animation = dot.animate(
          [
            { transform: "translate3d(0, 0, 0)", opacity: 0 },
            { transform: "translate3d(0, 0, 0)", opacity: 1, offset: 0.05 },
            { transform: `translate3d(${dx}px, ${dy}px, 0)`, opacity: 1, offset: 0.9 },
            { transform: `translate3d(${dx}px, ${dy}px, 0)`, opacity: 0 },
          ],
          {
            duration: packet.duration * 1000,
            delay: packet.delay * 1000,
            iterations: Infinity,
            easing: "linear",
            fill: "backwards",
          },
        );

        if (!visible) {
          animation.pause();
        }

        animations.push(animation);
      });
    };

    const ro = new ResizeObserver(buildAnimations);
    ro.observe(container);

    // Pause when the hero is fully scrolled off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        animations.forEach((animation) => {
          if (visible) {
            animation.play();
          } else {
            animation.pause();
          }
        });
      },
      { threshold: 0 },
    );
    io.observe(container);

    buildAnimations();

    return () => {
      animations.forEach((animation) => animation.cancel());
      ro.disconnect();
      io.disconnect();
    };
  }, [isLitePerformance]);

  return (
    <article
      className="hero-visual panel reveal"
      style={{ ["--reveal-delay" as string]: "140ms" }}
      aria-label="Animated system map"
    >
      <div className="hero-visual-header">
        <p className="hero-visual-label">System Map</p>
        <p className="hero-visual-meta">Backend, data, graph, and product workflows</p>
      </div>

      <div ref={containerRef} className="hero-visual-canvas">
        <div className="hero-rings" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {/* SVG carries the edges only — no animated circles in SVG. */}
        <svg
          className="hero-graph"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {edges.map(([fromIndex, toIndex], index) => {
            const from = nodes[fromIndex];
            const to   = nodes[toIndex];
            return (
              <line
                key={`${from.label}-${to.label}`}
                className="hero-graph-edge"
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                style={{ ["--graph-delay" as string]: `${index * 220}ms` }}
              />
            );
          })}
        </svg>

        {/* Packet dots: HTML divs, absolutely positioned, animated via CSS transform. */}
        {packets.map((packet, index) => {
          const from = nodes[packet.from];
          const fill = toneColors[packet.tone] ?? toneColors.accent;
          return (
            <div
              key={`packet-${index}`}
              data-packet
              aria-hidden="true"
              style={{
                position: "absolute",
                left: `calc(${from.x}% - ${DOT_R}px)`,
                top:  `calc(${from.y}% - ${DOT_R}px)`,
                width:  `${DOT_R * 2}px`,
                height: `${DOT_R * 2}px`,
                borderRadius: "50%",
                background: fill,
                opacity: 0,
                pointerEvents: "none",
              }}
            />
          );
        })}

        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="hero-node-chip"
            style={{
              left: `${node.x}%`,
              top:  `${node.y}%`,
              ["--float-delay" as string]: `${index * 180}ms`,
            }}
          >
            {node.label}
          </div>
        ))}

        <div className="hero-core-pill">Data / ML / Systems</div>
      </div>

      <div className="hero-visual-footer">
        {footerTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
