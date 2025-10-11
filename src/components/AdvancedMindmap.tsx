import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Activity,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  dueDate?: Date;
}

interface Leg {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "paused";
  progress: number;
  x?: number;
  y?: number;
  tasks?: Task[];
}

interface SubProject {
  id: string;
  name: string;
  category: "sales" | "marketing" | "social-media" | "growth";
  status: "planning" | "active" | "completed" | "paused";
  progress: number;
  description: string;
  x?: number;
  y?: number;
  tasks?: Task[];
  legs?: Leg[];
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

interface AdvancedMindmapProps {
  nodes?: Node[];
  edges?: Edge[];
  onOpenProject?: (projectId: string) => void;
  activeProjectId?: string;
  onAddNewProject?: (projectData: { title: string; description: string }) => void;
  onAddNewSubProject?: (parentProjectId: string, subProjectData: Partial<SubProject>) => void;
  onAddNewLeg?: (parentSubProjectId: string, legData: Partial<Leg>) => void;
}

const categoryConfig = {
  sales: {
    icon: Target,
    color: "hsl(0 84% 60%)",
    bgColor: "hsl(0 84% 95%)",
    borderColor: "hsl(0 84% 80%)",
    label: "Sales"
  },
  marketing: {
    icon: Megaphone,
    color: "hsl(213 94% 68%)",
    bgColor: "hsl(213 94% 95%)",
    borderColor: "hsl(213 94% 80%)",
    label: "Marketing"
  },
  "social-media": {
    icon: Share2,
    color: "hsl(280 100% 70%)",
    bgColor: "hsl(280 100% 95%)",
    borderColor: "hsl(280 100% 80%)",
    label: "Social Media"
  },
  growth: {
    icon: TrendingUp,
    color: "hsl(120 60% 50%)",
    bgColor: "hsl(120 60% 95%)",
    borderColor: "hsl(120 60% 80%)",
    label: "Growth"
  }
};

const statusConfig = {
  planning: { color: "hsl(0 0% 60%)", label: "Planning" },
  active: { color: "hsl(213 94% 68%)", label: "Active" },
  completed: { color: "hsl(120 60% 50%)", label: "Completed" },
  paused: { color: "hsl(45 93% 58%)", label: "Paused" }
};

const taskStatusConfig = {
  todo: { icon: Circle, color: "hsl(0 0% 60%)", label: "To Do" },
  "in-progress": { icon: Clock, color: "hsl(213 94% 68%)", label: "In Progress" },
  review: { icon: AlertCircle, color: "hsl(45 93% 58%)", label: "Review" },
  completed: { icon: CheckCircle, color: "hsl(120 60% 50%)", label: "Completed" }
};

export default function AdvancedMindmap({ 
  nodes = [], 
  edges = [], 
  onOpenProject = () => {},
  activeProjectId,
  onAddNewProject = () => {},
  onAddNewSubProject = () => {},
  onAddNewLeg = () => {}
}: AdvancedMindmapProps) {
  const [active, setActive] = useState<string | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedSubProject, setSelectedSubProject] = useState<SubProject | null>(null);
  const [isAddingSubProject, setIsAddingSubProject] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState<SubProject | null>(null);
  const [newSubProject, setNewSubProject] = useState<Partial<SubProject>>({});
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ title: "", description: "" });
  const [selectedLeg, setSelectedLeg] = useState<Leg | null>(null);
  const [isAddingLeg, setIsAddingLeg] = useState<SubProject | null>(null);
  const [newLeg, setNewLeg] = useState<Partial<Leg>>({});
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set active node based on activeProjectId
  useEffect(() => {
    if (activeProjectId) {
      const activeNode = nodes.find(n => n.projectId === activeProjectId);
      if (activeNode) {
        setActive(activeNode.id);
        setExpandedNode(activeNode.id);
      }
    } else {
      setActive(null);
      setExpandedNode(null);
    }
  }, [activeProjectId, nodes]);

  // Calculate sub-project positions around main nodes
  const calculateSubProjectPositions = (node: Node): SubProject[] => {
    if (!node.subProjects || node.subProjects.length === 0) return [];
    
    const radius = 120;
    const angleStep = (2 * Math.PI) / node.subProjects.length;
    
    return node.subProjects.map((subProject, index) => ({
      ...subProject,
      x: node.x + Math.cos(index * angleStep) * radius,
      y: node.y + Math.sin(index * angleStep) * radius
    }));
  };

  // Calculate leg positions around sub-projects
  const calculateLegPositions = (subProject: SubProject): Leg[] => {
    if (!subProject.legs || subProject.legs.length === 0) return [];
    
    const radius = 80;
    const angleStep = (2 * Math.PI) / subProject.legs.length;
    
    return subProject.legs.map((leg, index) => ({
      ...leg,
      x: (subProject.x || 0) + Math.cos(index * angleStep) * radius,
      y: (subProject.y || 0) + Math.sin(index * angleStep) * radius
    }));
  };

  const handleNodeClick = (node: Node) => {
    setActive(node.id);
    onOpenProject(node.projectId);
    setExpandedNode(node.id);
    setSelectedSubProject(null);
    
    // Focus on the clicked project with a small delay to ensure rendering
    setTimeout(() => {
      focusOnProject(node.id);
    }, 100);
  };

  const handleSubProjectClick = (subProject: SubProject, parentNode: Node) => {
    setSelectedSubProject(subProject);
    setActive(parentNode.id);
    setExpandedNode(parentNode.id);
    setSelectedLeg(null);
  };

  const handleLegClick = (leg: Leg, parentSubProject: SubProject) => {
    setSelectedLeg(leg);
    setSelectedSubProject(parentSubProject);
  };

  const handleAddLeg = (subProject: SubProject) => {
    setIsAddingLeg(subProject);
    setNewLeg({
      name: "",
      description: "",
      status: "planning",
      progress: 0
    });
  };

  const handleSaveLeg = (subProject: SubProject) => {
    if (!newLeg.name) return;
    
    onAddNewLeg(subProject.id, newLeg);
    setIsAddingLeg(null);
    setNewLeg({});
  };

  // Zoom and pan handlers
  const handleZoom = (delta: number, centerX?: number, centerY?: number) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    
    // If a project is selected, focus zoom on that project
    if (active && centerX === undefined && centerY === undefined) {
      const activeNode = nodes.find(n => n.id === active);
      if (activeNode) {
        // Focus on the selected project
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const containerCenterX = containerRect.width / 2;
          const containerCenterY = containerRect.height / 2;
          
          const svgWidth = 1200;
          const svgHeight = 700;
          
          const nodeScreenX = (activeNode.x / svgWidth) * containerRect.width;
          const nodeScreenY = (activeNode.y / svgHeight) * containerRect.height;
          
          const targetX = containerCenterX - nodeScreenX * newZoom;
          const targetY = containerCenterY - nodeScreenY * newZoom;
          
          setZoom(newZoom);
          setPan({ x: targetX, y: targetY });
          return;
        }
      }
    }
    
    // Default zoom behavior (towards mouse or center)
    setZoom(newZoom);
    
    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards mouse position
      const zoomFactor = newZoom / zoom;
      setPan(prev => ({
        x: centerX - (centerX - prev.x) * zoomFactor,
        y: centerY - (centerY - prev.y) * zoomFactor
      }));
    }
  };

  // Focus on selected project
  const focusOnProject = (projectId: string) => {
    const node = nodes.find(n => n.id === projectId);
    if (node) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const targetZoom = 2; // Zoom level when focusing
        
        // Calculate the center of the container
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        
        // Calculate the position to center the node
        // We need to account for the SVG viewBox (0 0 1200 700)
        const svgWidth = 1200;
        const svgHeight = 700;
        
        // Convert node coordinates to screen coordinates
        const nodeScreenX = (node.x / svgWidth) * containerRect.width;
        const nodeScreenY = (node.y / svgHeight) * containerRect.height;
        
        // Calculate pan to center the node
        const targetX = containerCenterX - nodeScreenX * targetZoom;
        const targetY = containerCenterY - nodeScreenY * targetZoom;
        
        console.log('Focusing on:', node.title, 'at', node.x, node.y);
        console.log('Container:', containerRect.width, containerRect.height);
        console.log('Target pan:', targetX, targetY);
        
        setZoom(targetZoom);
        setPan({ x: targetX, y: targetY });
      }
    }
  };

  const handleMouseWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta, centerX, centerY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActive(null);
    setExpandedNode(null);
    setSelectedSubProject(null);
    setSelectedLeg(null);
  };

  // Focus on active project when it changes
  useEffect(() => {
    if (activeProjectId && active) {
      setTimeout(() => {
        focusOnProject(active);
      }, 100);
    }
  }, [activeProjectId]);

  // Debug function to test focus on all projects
  const testFocusOnAllProjects = () => {
    console.log('Testing focus on all projects:');
    nodes.forEach((node, index) => {
      setTimeout(() => {
        console.log(`Focusing on ${node.title} (${node.id}) at ${node.x}, ${node.y}`);
        focusOnProject(node.id);
      }, index * 2000); // Test each project every 2 seconds
    });
  };

  const handleAddSubProject = (nodeId?: string) => {
    // Use the currently active/expanded node if no specific node is provided
    const targetNodeId = nodeId || expandedNode;
    if (!targetNodeId) return;
    
    setIsAddingSubProject(targetNodeId);
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
    
    const parentProject = nodes.find(node => node.id === nodeId);
    if (parentProject) {
      onAddNewSubProject(parentProject.projectId, newSubProject);
    }
    
    setIsAddingSubProject(null);
    setNewSubProject({});
  };

  const handleAddNewBrand = () => {
    setIsAddingNewBrand(true);
    setNewBrand({ title: "", description: "" });
  };

  const handleSaveNewBrand = () => {
    if (!newBrand.title) return;
    
    onAddNewProject(newBrand);
    setIsAddingNewBrand(false);
    setNewBrand({ title: "", description: "" });
  };

  // Calculate position for new brand
  const getNewBrandPosition = () => {
    if (nodes.length === 0) return { x: 600, y: 350 };
    
    // Find the rightmost node and add new brand to the right
    const rightmostNode = nodes.reduce((prev, current) => 
      (prev.x > current.x) ? prev : current
    );
    
    return {
      x: Math.min(rightmostNode.x + 300, 1000),
      y: rightmostNode.y + (Math.random() - 0.5) * 200
    };
  };

  const handleAddTask = (subProject: SubProject) => {
    setIsAddingTask(subProject);
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium"
    });
  };

  const handleSaveTask = (subProject: SubProject) => {
    if (!newTask.title) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.subProjects?.some(sp => sp.id === subProject.id)) {
        return {
          ...node,
          subProjects: node.subProjects?.map(sp => 
            sp.id === subProject.id 
              ? {
                  ...sp,
                  tasks: [
                    ...(sp.tasks || []),
                    {
                      id: `task_${Date.now()}`,
                      ...newTask
                    } as Task
                  ]
                }
              : sp
          )
        };
      }
      return node;
    });
    
    setIsAddingTask(null);
    setNewTask({});
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    // In a real app, this would update the backend
    console.log(`Updating task ${taskId} to ${newStatus}`);
  };

  const edgeD = (a: Node, b: Node) => 
    `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`;

  const subProjectEdgeD = (parent: Node, sub: SubProject) => 
    `M ${parent.x} ${parent.y} L ${sub.x} ${sub.y}`;

  const getNodeScale = (nodeId: string) => {
    if (active === nodeId) return 1.15;
    if (hoveredNode === nodeId) return 1.05;
    return 1;
  };

  const getNodeOpacity = (nodeId: string) => {
    if (active === nodeId || hoveredNode === nodeId) return 1;
    if (active && active !== nodeId) return 0.4;
    return 0.8;
  };

  const expandedNodeData = expandedNode ? nodes.find(n => n.id === expandedNode) : null;
  const subProjectsWithPositions = expandedNodeData ? calculateSubProjectPositions(expandedNodeData) : [];

  return (
    <div className="w-full">
      {/* Main Mindmap */}
      <div 
        ref={containerRef}
        className="mindmap-container w-full h-[600px] bg-chatgpt-card rounded-3xl p-6 shadow-glass transition-smooth border border-border relative overflow-hidden"
        onWheel={handleMouseWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Zoom Controls */}
        <div className="mindmap-zoom-controls absolute top-4 left-4 flex flex-col gap-2 z-10 rounded-lg p-1">
          <Button
            onClick={() => handleZoom(0.2)}
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0"
            title={active ? `Zoom In on ${nodes.find(n => n.id === active)?.title}` : "Zoom In"}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleZoom(-0.2)}
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0"
            title={active ? `Zoom Out on ${nodes.find(n => n.id === active)?.title}` : "Zoom Out"}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={resetView}
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0"
            title="Reset View & Clear Selection"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          {active && (
            <Button
              onClick={() => focusOnProject(active)}
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0"
              title="Center on Selected Project"
            >
              <Target className="w-4 h-4" />
            </Button>
          )}
          {/* Debug button - remove in production */}
          <Button
            onClick={testFocusOnAllProjects}
            size="sm"
            variant="destructive"
            className="w-8 h-8 p-0 text-xs"
            title="Debug: Test focus on all projects"
          >
            D
          </Button>
        </div>

        {/* Active Project Indicator */}
        {active && (
          <div className="mindmap-info-panel absolute top-4 right-4 rounded-md px-3 py-1 text-sm font-medium z-10 text-white">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Focused: {nodes.find(n => n.id === active)?.title}</span>
            </div>
          </div>
        )}

        {/* Zoom Level Indicator */}
        <div className="mindmap-info-panel absolute bottom-4 left-4 rounded-md px-3 py-1 text-sm font-medium z-10 text-white">
          {Math.round(zoom * 100)}%
        </div>

        {/* Pan Instructions */}
        <div className="mindmap-info-panel absolute bottom-4 right-4 rounded-md px-3 py-1 text-xs text-white/80 z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Move className="w-3 h-3" />
              <span>Ctrl+Drag or Middle Mouse to pan</span>
            </div>
            {active && (
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3 h-3" />
                <span>Zoom focuses on selected project</span>
              </div>
            )}
          </div>
        </div>

        <svg 
          ref={svgRef} 
          className="w-full h-full" 
          viewBox="0 0 1200 700"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
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

          {/* Background particles */}
          {Array.from({ length: 15 }).map((_, i) => (
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

          {/* Main project edges */}
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
                style={{ transition: "all 300ms ease-in-out" }}
              />
            );
          })}

          {/* Sub-project edges (only for expanded node) */}
          {expandedNodeData && subProjectsWithPositions.map((subProject, idx) => (
            <path
              key={`sub-edge-${idx}`}
              d={subProjectEdgeD(expandedNodeData, subProject)}
              fill="none"
              stroke={categoryConfig[subProject.category].color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5,5"
              opacity="0.7"
              style={{ 
                transition: "all 300ms ease-in-out",
                animation: selectedSubProject?.id === subProject.id ? "pulse 1s infinite" : "none"
              }}
            />
          ))}

          {/* Leg edges (only for selected sub-project) */}
          {selectedSubProject && subProjectsWithPositions
            .filter(sp => sp.id === selectedSubProject.id)
            .map(subProject => {
              const legsWithPositions = calculateLegPositions(subProject);
              return legsWithPositions.map((leg, idx) => (
                <path
                  key={`leg-edge-${idx}`}
                  d={`M ${subProject.x} ${subProject.y} L ${leg.x} ${leg.y}`}
                  fill="none"
                  stroke={categoryConfig[subProject.category].color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3,3"
                  opacity="0.5"
                  style={{ 
                    transition: "all 300ms ease-in-out",
                    animation: selectedLeg?.id === leg.id ? "pulse 1s infinite" : "none"
                  }}
                />
              ));
            })}

          {/* Animated highlight path for active main project */}
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

          {/* Main project nodes */}
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
                fontSize={Math.max(12, 15 / zoom)} 
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

          {/* Sub-project nodes (only for expanded node) */}
          {expandedNodeData && subProjectsWithPositions.map((subProject) => {
            const category = categoryConfig[subProject.category];
            const CategoryIcon = category.icon;
            const isSelected = selectedSubProject?.id === subProject.id;
            
            return (
              <g 
                key={subProject.id}
                transform={`translate(${subProject.x}, ${subProject.y})`}
                className="cursor-pointer transition-all duration-300 ease-out"
                onClick={() => handleSubProjectClick(subProject, expandedNodeData)}
                style={{
                  opacity: selectedSubProject ? (selectedSubProject.id === subProject.id ? 1 : 0.5) : 1
                }}
              >
                {/* Sub-project shadow */}
                <circle
                  r="12"
                  fill="rgba(0,0,0,0.1)"
                  transform="translate(1, 1)"
                />
                
                {/* Sub-project circle */}
                <circle
                  r="12"
                  fill={category.bgColor}
                  stroke={isSelected ? category.color : category.borderColor}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ 
                    transition: "all 300ms ease-out",
                    filter: isSelected ? "url(#glow)" : "url(#soft-glow)"
                  }}
                />
                
                {/* Category icon */}
                <CategoryIcon 
                  x="-6" 
                  y="-6" 
                  width="12" 
                  height="12" 
                  fill={category.color}
                  style={{ transition: "all 300ms ease-out" }}
                />
                
                {/* Sub-project label */}
                <text 
                  x="0" 
                  y="30" 
                  fontSize={Math.max(8, 10 / zoom)} 
                  fontWeight="500"
                  fontFamily="Inter, sans-serif" 
                  fill={isSelected ? category.color : "hsl(210 20% 98%)"}
                  textAnchor="middle"
                  style={{ 
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    transition: "all 300ms ease-out"
                  }}
                >
                  {subProject.name.length > (zoom < 1 ? 8 : 12) ? subProject.name.substring(0, zoom < 1 ? 8 : 12) + "..." : subProject.name}
                </text>
                
                {/* Progress indicator */}
                <circle
                  r="3"
                  fill={category.color}
                  cx="15"
                  cy="-15"
                  opacity={subProject.progress > 0 ? 1 : 0.3}
                />
              </g>
            );
          })}

          {/* Leg nodes (only for selected sub-project) */}
          {selectedSubProject && subProjectsWithPositions
            .filter(sp => sp.id === selectedSubProject.id)
            .map(subProject => {
              const legsWithPositions = calculateLegPositions(subProject);
              return legsWithPositions.map((leg) => {
                const isSelected = selectedLeg?.id === leg.id;
                
                return (
                  <g 
                    key={leg.id}
                    transform={`translate(${leg.x}, ${leg.y})`}
                    className="cursor-pointer transition-all duration-300 ease-out"
                    onClick={() => handleLegClick(leg, subProject)}
                    style={{
                      opacity: selectedLeg ? (selectedLeg.id === leg.id ? 1 : 0.6) : 1
                    }}
                  >
                    {/* Leg shadow */}
                    <circle
                      r="8"
                      fill="rgba(0,0,0,0.1)"
                      transform="translate(1, 1)"
                    />
                    
                    {/* Leg circle */}
                    <circle
                      r="8"
                      fill={categoryConfig[subProject.category].bgColor}
                      stroke={isSelected ? categoryConfig[subProject.category].color : categoryConfig[subProject.category].borderColor}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ 
                        transition: "all 300ms ease-out",
                        filter: isSelected ? "url(#glow)" : "url(#soft-glow)"
                      }}
                    />
                    
                    {/* Leg label */}
                    <text 
                      x="0" 
                      y="20" 
                      fontSize={Math.max(6, 8 / zoom)} 
                      fontWeight="500"
                      fontFamily="Inter, sans-serif" 
                      fill={isSelected ? categoryConfig[subProject.category].color : "hsl(210 20% 98%)"}
                      textAnchor="middle"
                      style={{ 
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        transition: "all 300ms ease-out"
                      }}
                    >
                      {leg.name.length > (zoom < 1 ? 6 : 8) ? leg.name.substring(0, zoom < 1 ? 6 : 8) + "..." : leg.name}
                    </text>
                    
                    {/* Progress indicator */}
                    <circle
                      r="2"
                      fill={categoryConfig[subProject.category].color}
                      cx="12"
                      cy="-12"
                      opacity={leg.progress > 0 ? 1 : 0.3}
                    />
                  </g>
                );
              });
            })}
        </svg>

        {/* Floating action buttons */}
        <div className="absolute top-4 right-4 flex gap-3">
          {/* Add new brand button */}
          <Button
            onClick={handleAddNewBrand}
            className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            style={{
              background: "linear-gradient(135deg, hsl(120 60% 50%), hsl(100 70% 40%))",
              border: "none"
            }}
            title="Add New Business"
          >
            <Sparkles className="w-5 h-5" />
          </Button>

          {/* Add sub-project button */}
          {expandedNode && (
            <Button
              onClick={() => handleAddSubProject()}
              className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              style={{
                background: "linear-gradient(135deg, hsl(213 94% 68%), hsl(200 100% 50%))",
                border: "none"
              }}
              title="Add Sub-Project"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Add New Business Modal */}
      {isAddingNewBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Add New Business
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Business Name</label>
                <Input
                  placeholder="Enter business name..."
                  value={newBrand.title}
                  onChange={(e) => setNewBrand(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Brief description of the brand..."
                  value={newBrand.description}
                  onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveNewBrand}
                  disabled={!newBrand.title}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Business
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingNewBrand(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Sub-Project Modal */}
      {isAddingSubProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add New Sub-Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show which project this sub-project will be added to */}
              {isAddingSubProject && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Adding sub-project to: <span className="font-medium text-foreground">
                      {nodes.find(n => n.id === isAddingSubProject)?.title}
                    </span>
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sub-Project Name</label>
                <Input
                  placeholder="Enter sub-project name..."
                  value={newSubProject.name || ""}
                  onChange={(e) => setNewSubProject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Brief description of the sub-project..."
                  value={newSubProject.description || ""}
                  onChange={(e) => setNewSubProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={newSubProject.category || "sales"}
                    onChange={(e) => setNewSubProject(prev => ({ ...prev, category: e.target.value as SubProject["category"] }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="social-media">Social Media</option>
                    <option value="growth">Growth</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={newSubProject.status || "planning"}
                    onChange={(e) => setNewSubProject(prev => ({ ...prev, status: e.target.value as SubProject["status"] }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Progress (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={newSubProject.progress || 0}
                  onChange={(e) => setNewSubProject(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSaveSubProject(isAddingSubProject)}
                  disabled={!newSubProject.name}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sub-Project
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
        </div>
      )}

      {/* Add New Leg Modal */}
      {isAddingLeg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Add New Leg
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show which sub-project this leg will be added to */}
              {isAddingLeg && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Adding leg to: <span className="font-medium text-foreground">
                      {isAddingLeg.name}
                    </span>
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">Leg Name</label>
                <Input
                  placeholder="Enter leg name..."
                  value={newLeg.name || ""}
                  onChange={(e) => setNewLeg(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Brief description of the leg..."
                  value={newLeg.description || ""}
                  onChange={(e) => setNewLeg(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={newLeg.status || "planning"}
                    onChange={(e) => setNewLeg(prev => ({ ...prev, status: e.target.value as Leg["status"] }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Progress (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={newLeg.progress || 0}
                    onChange={(e) => setNewLeg(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSaveLeg(isAddingLeg)}
                  disabled={!newLeg.name}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Leg
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingLeg(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks Panel */}
      {selectedSubProject && (
        <div className="mt-6 animate-fade-in">
          <Card className="border-border shadow-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {selectedSubProject.name} - Tasks & Legs
                  <Badge className={categoryConfig[selectedSubProject.category].bgColor}>
                    {categoryConfig[selectedSubProject.category].label}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAddLeg(selectedSubProject)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Leg
                  </Button>
                  <Button 
                    onClick={() => handleAddTask(selectedSubProject)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add new task form */}
              {isAddingTask?.id === selectedSubProject.id && (
                <Card className="border-primary border-2 mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Task
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Task title..."
                      value={newTask.title || ""}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Task description..."
                      value={newTask.description || ""}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <select
                          value={newTask.status || "todo"}
                          onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value as Task["status"] }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Priority</label>
                        <select
                          value={newTask.priority || "medium"}
                          onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task["priority"] }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleSaveTask(selectedSubProject)}
                        disabled={!newTask.title}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Task
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingTask(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Legs section */}
              {selectedSubProject.legs && selectedSubProject.legs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Legs ({selectedSubProject.legs.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSubProject.legs.map((leg) => {
                      const status = statusConfig[leg.status];
                      
                      return (
                        <Card 
                          key={leg.id} 
                          className={`hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer ${
                            selectedLeg?.id === leg.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleLegClick(leg, selectedSubProject)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{leg.name}</h4>
                              <Badge className={`text-xs ${status.color}`}>
                                {status.label}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {leg.description}
                            </p>
                            
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs font-medium">{leg.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${leg.progress}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks list */}
              <div className="space-y-3">
                {selectedSubProject.tasks?.map((task) => {
                  const status = taskStatusConfig[task.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <StatusIcon 
                                className="w-4 h-4" 
                                style={{ color: status.color }}
                                onClick={() => {
                                  const newStatus = task.status === "completed" ? "todo" : 
                                                   task.status === "todo" ? "in-progress" :
                                                   task.status === "in-progress" ? "review" : "completed";
                                  handleUpdateTaskStatus(task.id, newStatus);
                                }}
                              />
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {task.priority}
                            </Badge>
                            <Badge className="text-xs" style={{ backgroundColor: status.color, color: "white" }}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Empty state */}
                {(!selectedSubProject.tasks || selectedSubProject.tasks.length === 0) && !isAddingTask && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add tasks to organize your sub-project work
                    </p>
                    <Button onClick={() => handleAddTask(selectedSubProject)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Task
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
