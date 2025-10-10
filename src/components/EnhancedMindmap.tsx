import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  X, 
  TrendingUp, 
  Users, 
  Megaphone, 
  Share2,
  Target,
  ChevronRight,
  Sparkles,
  Zap,
  Activity
} from "lucide-react";

interface SubProject {
  id: string;
  name: string;
  category: "sales" | "marketing" | "social-media" | "growth";
  status: "planning" | "active" | "completed" | "paused";
  progress: number;
  description: string;
}

interface Node {
  id: string;
  x: number;
  y: number;
  r: number;
  title: string;
  projectId: string;
  subProjects?: SubProject[];
}

interface Edge {
  from: string;
  to: string;
}

interface EnhancedMindmapProps {
  nodes?: Node[];
  edges?: Edge[];
  onOpenProject?: (projectId: string) => void;
  activeProjectId?: string;
}

const categoryConfig = {
  sales: {
    icon: Target,
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Sales"
  },
  marketing: {
    icon: Megaphone,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Marketing"
  },
  "social-media": {
    icon: Share2,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Social Media"
  },
  growth: {
    icon: TrendingUp,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Growth"
  }
};

const statusConfig = {
  planning: { color: "bg-gray-100 text-gray-800", label: "Planning" },
  active: { color: "bg-blue-100 text-blue-800", label: "Active" },
  completed: { color: "bg-green-100 text-green-800", label: "Completed" },
  paused: { color: "bg-yellow-100 text-yellow-800", label: "Paused" }
};

export default function EnhancedMindmap({ 
  nodes = [], 
  edges = [], 
  onOpenProject = () => {},
  activeProjectId
}: EnhancedMindmapProps) {
  const [active, setActive] = useState<string | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isAddingSubProject, setIsAddingSubProject] = useState<string | null>(null);
  const [newSubProject, setNewSubProject] = useState<Partial<SubProject>>({});

  const svgRef = useRef<SVGSVGElement>(null);

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
    
    // Toggle sub-projects panel
    if (expandedNode === node.id) {
      setExpandedNode(null);
    } else {
      setExpandedNode(node.id);
    }
  };

  const handleAddSubProject = (nodeId: string) => {
    setIsAddingSubProject(nodeId);
    setNewSubProject({
      name: "",
      category: "sales",
      status: "planning",
      progress: 0,
      description: ""
    });
  };

  const handleSaveSubProject = (nodeId: string) => {
    if (!newSubProject.name) return;
    
    // In a real app, this would save to the backend
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          subProjects: [
            ...(node.subProjects || []),
            {
              id: `sub_${Date.now()}`,
              ...newSubProject
            } as SubProject
          ]
        };
      }
      return node;
    });
    
    setIsAddingSubProject(null);
    setNewSubProject({});
    // In a real app, you'd update the state here
  };

  const edgeD = (a: Node, b: Node) => 
    `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;

  const getNodeScale = (nodeId: string) => {
    if (active === nodeId) return 1.15;
    if (hoveredNode === nodeId) return 1.05;
    return 1;
  };

  const getNodeOpacity = (nodeId: string) => {
    if (active === nodeId || hoveredNode === nodeId) return 1;
    if (active && active !== nodeId) return 0.6;
    return 0.8;
  };

  const expandedNodeData = expandedNode ? nodes.find(n => n.id === expandedNode) : null;

  return (
    <div className="w-full">
      {/* Main Mindmap */}
      <div className="w-full h-[600px] bg-chatgpt-card rounded-3xl p-6 shadow-glass transition-smooth border border-border relative overflow-hidden">
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
            <linearGradient id="g3" x1="0" x2="1">
              <stop offset="0%" stopColor="hsl(280 100% 70%)" />
              <stop offset="100%" stopColor="hsl(260 100% 60%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="soft-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="pulse-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background particles for ambiance */}
          {Array.from({ length: 20 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 1200}
              cy={Math.random() * 700}
              r={1}
              fill="hsl(213 94% 68%)"
              opacity={0.1}
              style={{
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}

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
                style={{
                  transition: "all 300ms ease-in-out"
                }}
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
              transform={`translate(${n.x}, ${n.y}) scale(${getNodeScale(n.id)})`} 
              className="cursor-pointer transition-all duration-300 ease-out" 
              onClick={() => handleNodeClick(n)}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                opacity: getNodeOpacity(n.id),
                transformOrigin: `${n.x}px ${n.y}px`
              }}
            >
              {/* Node shadow */}
              <circle
                r={n.r + 2}
                fill="rgba(0,0,0,0.1)"
                transform="translate(2, 2)"
                style={{ transition: "all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              />
              
              {/* Main node circle */}
              <circle
                r={n.r}
                fill={active === n.id ? "url(#g1)" : hoveredNode === n.id ? "url(#g3)" : "url(#g2)"}
                stroke={active === n.id ? "hsl(213 94% 68%)" : hoveredNode === n.id ? "hsl(280 100% 70%)" : "hsl(218 24% 35%)"}
                strokeWidth={active === n.id ? 4 : hoveredNode === n.id ? 3 : 2}
                style={{ 
                  transition: "all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: hoveredNode === n.id ? "translateY(-2px)" : "translateY(0px)"
                }}
                filter={active === n.id ? "url(#glow)" : hoveredNode === n.id ? "url(#pulse-glow)" : "url(#soft-glow)"}
              />
              
              {/* Sub-project indicator */}
              {n.subProjects && n.subProjects.length > 0 && (
                <circle
                  r="4"
                  fill="hsl(120 60% 50%)"
                  cx={n.r - 8}
                  cy={-n.r + 8}
                  style={{
                    transition: "all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    animation: active === n.id ? "pulse 2s infinite" : "none"
                  }}
                />
              )}
              
              {/* Node text */}
              <text 
                x={n.r + 14} 
                y={6} 
                fontSize="15" 
                fontWeight={active === n.id ? "600" : hoveredNode === n.id ? "550" : "500"}
                fontFamily="Inter, sans-serif" 
                fill={active === n.id ? "hsl(213 94% 68%)" : hoveredNode === n.id ? "hsl(280 100% 70%)" : "hsl(210 20% 98%)"}
                style={{ 
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  transition: "all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                {n.title}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating action button for adding sub-projects */}
        {expandedNode && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => handleAddSubProject(expandedNode)}
              className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              style={{
                background: "linear-gradient(135deg, hsl(213 94% 68%), hsl(200 100% 50%))",
                border: "none"
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Sub-projects Panel */}
      {expandedNodeData && (
        <div className="mt-6 animate-fade-in">
          <Card className="border-border shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {expandedNodeData.title} - Sub Projects
                <Badge variant="secondary" className="ml-auto">
                  {expandedNodeData.subProjects?.length || 0} projects
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Add new sub-project form */}
                {isAddingSubProject === expandedNodeData.id && (
                  <Card className="border-primary border-2 col-span-full">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Sub-Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Project Name</label>
                          <input
                            type="text"
                            value={newSubProject.name || ""}
                            onChange={(e) => setNewSubProject(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Enter project name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Category</label>
                          <select
                            value={newSubProject.category || "sales"}
                            onChange={(e) => setNewSubProject(prev => ({ ...prev, category: e.target.value as SubProject["category"] }))}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="sales">Sales</option>
                            <option value="marketing">Marketing</option>
                            <option value="social-media">Social Media</option>
                            <option value="growth">Growth</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleSaveSubProject(expandedNodeData.id)}
                          disabled={!newSubProject.name}
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Project
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddingSubProject(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing sub-projects */}
                {expandedNodeData.subProjects?.map((subProject) => {
                  const category = categoryConfig[subProject.category];
                  const status = statusConfig[subProject.status];
                  const CategoryIcon = category.icon;
                  
                  return (
                    <Card key={subProject.id} className="hover:shadow-md transition-all duration-300 hover:scale-105">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4" />
                            <CardTitle className="text-sm">{subProject.name}</CardTitle>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex gap-2">
                          <Badge className={`text-xs ${category.color}`}>
                            {category.label}
                          </Badge>
                          <Badge className={`text-xs ${status.color}`}>
                            {status.label}
                          </Badge>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{subProject.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${subProject.progress}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {subProject.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Empty state */}
                {(!expandedNodeData.subProjects || expandedNodeData.subProjects.length === 0) && !isAddingSubProject && (
                  <div className="col-span-full text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No sub-projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Organize your project by adding sub-projects for different categories
                    </p>
                    <Button onClick={() => handleAddSubProject(expandedNodeData.id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Sub-Project
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
