import React, { useState, useRef, useEffect } from "react";

/**
 * RenaMindmap
 * Props:
 *  - nodes: [{ id, x, y, r, title, projectId }]
 *  - edges: [{ from, to }]
 *  - onOpenProject(projectId)
 */

interface Node {
  id: string;
  x: number;
  y: number;
  r: number;
  title: string;
  projectId: string;
}

interface Edge {
  from: string;
  to: string;
}

interface RenaMindmapProps {
  nodes?: Node[];
  edges?: Edge[];
  onOpenProject?: (projectId: string) => void;
}

export default function RenaMindmap({ 
  nodes = [], 
  edges = [], 
  onOpenProject = () => {} 
}: RenaMindmapProps) {
  const [active, setActive] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!active) return;
    const path = document.getElementById(`path-${active}`);
    if (!path) return;
    path.style.transition = "stroke-dashoffset 600ms cubic-bezier(.2,.9,.2,1), stroke-width 400ms";
    path.style.strokeWidth = "6";
    path.style.strokeDashoffset = "0";
  }, [active]);

  const handleNodeClick = (node: Node) => {
    setActive(node.id);
    onOpenProject(node.projectId);
  };

  const edgeD = (a: Node, b: Node) => 
    `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;

  return (
    <div className="w-full h-[600px] glass rounded-3xl p-6 shadow-glass transition-smooth">
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 1200 700">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(217 91% 60%)" />
            <stop offset="100%" stopColor="hsl(189 94% 43%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* edges */}
        {edges.map((e, idx) => {
          const a = nodes.find((n) => n.id === e.from);
          const b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const d = edgeD(a, b);
          return (
            <path
              key={idx}
              id={`path-${a.id}-${b.id}`}
              d={d}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* animated highlight path for active */}
        {active &&
          edges
            .filter((e) => e.from === active || e.to === active)
            .map((e, idx) => {
              const a = nodes.find((n) => n.id === e.from);
              const b = nodes.find((n) => n.id === e.to);
              if (!a || !b) return null;
              const d = edgeD(a, b);
              return (
                <path
                  key={`hi-${idx}`}
                  id={`path-${active}`}
                  d={d}
                  fill="none"
                  stroke="url(#g1)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  style={{
                    strokeDasharray: 1000,
                    strokeDashoffset: 1000,
                    transition: "stroke-dashoffset 700ms cubic-bezier(.2,.9,.2,1)",
                  }}
                />
              );
            })}

        {/* nodes */}
        {nodes.map((n) => (
          <g 
            key={n.id} 
            transform={`translate(${n.x}, ${n.y})`} 
            className="cursor-pointer transition-smooth hover:opacity-80" 
            onClick={() => handleNodeClick(n)}
          >
            <circle
              r={n.r}
              fill={active === n.id ? "url(#g1)" : "hsl(var(--card))"}
              stroke={active === n.id ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={active === n.id ? 3 : 2}
              style={{ transition: "all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              filter={active === n.id ? "url(#glow)" : "none"}
            />
            <text 
              x={n.r + 14} 
              y={6} 
              fontSize="15" 
              fontWeight="500"
              fontFamily="Inter, sans-serif" 
              fill={active === n.id ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
            >
              {n.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
