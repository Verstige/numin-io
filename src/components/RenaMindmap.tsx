import React, { useState, useRef, useEffect } from "react";

/**
 * RenaMindmap (Project Mindmap Component)
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
  activeProjectId?: string;
}

export default function RenaMindmap({ 
  nodes = [], 
  edges = [], 
  onOpenProject = () => {},
  activeProjectId
}: RenaMindmapProps) {
  const [active, setActive] = useState<string | null>(null);

  // Set active node based on activeProjectId
  useEffect(() => {
    if (activeProjectId) {
      const activeNode = nodes.find(n => n.projectId === activeProjectId);
      if (activeNode) {
        setActive(activeNode.id);
      }
    } else {
      setActive(null);
    }
  }, [activeProjectId, nodes]);
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
    <div className="w-full h-[600px] bg-chatgpt-card rounded-3xl p-6 shadow-glass transition-smooth border border-border">
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 1200 700">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(213 94% 68%)" />
            <stop offset="100%" stopColor="hsl(200 100% 50%)" />
          </linearGradient>
          <linearGradient id="g2" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(218 24% 18%)" />
            <stop offset="100%" stopColor="hsl(218 24% 25%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
              stroke="hsl(218 24% 30%)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
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
            className="cursor-pointer transition-smooth hover:opacity-90" 
            onClick={() => handleNodeClick(n)}
          >
            <circle
              r={n.r}
              fill={active === n.id ? "url(#g1)" : "url(#g2)"}
              stroke={active === n.id ? "hsl(213 94% 68%)" : "hsl(218 24% 35%)"}
              strokeWidth={active === n.id ? 4 : 2}
              style={{ transition: "all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              filter={active === n.id ? "url(#glow)" : "url(#soft-glow)"}
            />
            <text 
              x={n.r + 14} 
              y={6} 
              fontSize="15" 
              fontWeight={active === n.id ? "600" : "500"}
              fontFamily="Inter, sans-serif" 
              fill={active === n.id ? "hsl(213 94% 68%)" : "hsl(210 20% 98%)"}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
            >
              {n.title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
