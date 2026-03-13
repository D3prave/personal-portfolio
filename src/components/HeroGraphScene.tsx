const nodes = [
  {
    id: "backends",
    label: "Backends",
    x: 18,
    y: 24,
    tone: "accent",
    markerOffsetX: "1.3rem",
    markerOffsetY: "1.15rem",
  },
  {
    id: "data",
    label: "Data",
    x: 48,
    y: 13,
    tone: "muted",
    markerOffsetX: "1.7rem",
    markerOffsetY: "0.8rem",
  },
  {
    id: "graphs",
    label: "Graphs",
    x: 81,
    y: 24,
    tone: "warm",
    markerOffsetX: "1.7rem",
    markerOffsetY: "1.2rem",
  },
  {
    id: "apis",
    label: "APIs",
    x: 20,
    y: 69,
    tone: "accent",
    markerOffsetX: "1.1rem",
    markerOffsetY: "1.7rem",
  },
  {
    id: "ml",
    label: "ML",
    x: 50,
    y: 82,
    tone: "warm",
    markerOffsetX: "0rem",
    markerOffsetY: "1.7rem",
  },
  {
    id: "products",
    label: "Products",
    x: 82,
    y: 66,
    tone: "muted",
    markerOffsetX: "1.75rem",
    markerOffsetY: "0.9rem",
  },
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

const footerTags = ["Backend systems", "Data analytics", "Applied ML"];

export function HeroGraphScene() {
  return (
    <article
      className="hero-visual panel hover-spotlight reveal"
      style={{ ["--reveal-delay" as string]: "140ms" }}
      aria-label="Animated system map"
    >
      <div className="hero-visual-header">
        <p className="hero-visual-label">System Map</p>
        <p className="hero-visual-meta">Backend, data, graph, and product workflows</p>
      </div>

      <div className="hero-visual-canvas">
        <div className="hero-rings" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <svg
          className="hero-graph"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {edges.map(([fromIndex, toIndex], index) => {
            const from = nodes[fromIndex];
            const to = nodes[toIndex];

            return (
              <line
                key={`${from.label}-${to.label}`}
                className="hero-graph-edge"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                style={{ ["--graph-delay" as string]: `${index * 220}ms` }}
              />
            );
          })}

        </svg>

        {nodes.map((node, index) => (
          <div key={node.id}>
            <div
              className={`hero-node-marker hero-node-marker--${node.tone} hero-node-marker--${node.id}`}
              style={{
                left: `calc(${node.x}% + ${node.markerOffsetX})`,
                top: `calc(${node.y}% + ${node.markerOffsetY})`,
                ["--marker-delay" as string]: `${index * 180}ms`,
              }}
              aria-hidden="true"
            />

            <div
              className={`hero-node-chip hero-node-chip--${node.tone} hero-node-chip--${node.id}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                ["--float-delay" as string]: `${index * 180}ms`,
              }}
            >
              {node.label}
            </div>
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
