import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckSquare, 
  Flag, 
  Users, 
  Users2,
  Plus,
  Minus,
  Maximize,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Settings,
  Search,
  Filter,
  Save,
  Download,
  Upload,
  MessageSquare,
  Bell,
  Share2,
  MoreHorizontal,
  Minimize2,
  X,
  ChevronUp,
  ChevronDown,
  Package
} from 'lucide-react';

// Custom Node Components
const ProjectNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-background border-2 min-w-[200px] max-w-[250px] ${
    selected ? 'border-primary' : 'border-border'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <Target className="w-4 h-4 text-primary" />
      <div className="font-bold text-sm text-foreground">{data.title}</div>
      <Badge className={`text-xs ${
        data.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
        data.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
        data.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
        'bg-muted text-muted-foreground border-border'
      }`}>
        {data.status}
      </Badge>
    </div>
    
    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
      {data.description}
    </div>
    
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Progress</span>
        <span className="text-foreground">{data.progress}%</span>
      </div>
      <Progress value={data.progress} className="h-1" />
    </div>
    
    <div className="flex items-center justify-between mt-2">
      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
        {data.category}
      </Badge>
      {data.team && data.team.length > 0 && (
        <div className="flex -space-x-1">
          {data.team.slice(0, 3).map((member: any, idx: number) => (
            <div key={idx} className="w-5 h-5 rounded-full bg-primary/20 border-2 border-background text-xs flex items-center justify-center text-primary">
              {member.name?.charAt(0) || '?'}
            </div>
          ))}
          {data.team.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-muted border-2 border-background text-xs flex items-center justify-center text-muted-foreground">
              +{data.team.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const TaskNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-background border-2 min-w-[160px] ${
    selected ? 'border-green-500' : 'border-border'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <CheckSquare className="w-4 h-4 text-green-500" />
      <div className="font-semibold text-sm text-foreground">{data.title}</div>
      <div className={`w-2 h-2 rounded-full ${
        data.priority === 'critical' ? 'bg-red-500' :
        data.priority === 'high' ? 'bg-orange-500' :
        data.priority === 'medium' ? 'bg-yellow-500' :
        'bg-muted-foreground'
      }`} />
    </div>
    
    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
      {data.description}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
        {data.status}
      </Badge>
      {data.deadline && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(data.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const MilestoneNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-background border-2 min-w-[160px] ${
    selected ? 'border-purple-500' : 'border-border'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <Flag className="w-4 h-4 text-purple-500" />
      <div className="font-semibold text-sm text-foreground">{data.title}</div>
      {data.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
    </div>
    
    <div className="text-xs text-muted-foreground mb-2">
      {data.description}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge className={`text-xs ${
        data.completed ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      }`}>
        {data.completed ? 'Completed' : 'Pending'}
      </Badge>
      {data.deadline && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(data.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const ResourceNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-background border-2 min-w-[160px] ${
    selected ? 'border-orange-500' : 'border-border'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <Users className="w-4 h-4 text-orange-500" />
      <div className="font-semibold text-sm text-foreground">{data.title}</div>
      <div className={`w-2 h-2 rounded-full ${
        data.available ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </div>
    
    <div className="text-xs text-muted-foreground mb-2">
      {data.role}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
        {data.skills?.join(', ')}
      </Badge>
      <div className="text-xs text-muted-foreground">
        {data.workload || 0}% busy
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const TeamNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-background border-2 min-w-[160px] ${
    selected ? 'border-indigo-500' : 'border-border'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <Users2 className="w-4 h-4 text-indigo-500" />
      <div className="font-semibold text-sm text-foreground">{data.title}</div>
    </div>
    
    <div className="text-xs text-muted-foreground mb-2">
      {data.department}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
        {data.members?.length || 0} members
      </Badge>
      <div className="text-xs text-muted-foreground">
        {data.projects || 0} projects
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const nodeTypes: NodeTypes = {
  project: ProjectNode,
  task: TaskNode,
  milestone: MilestoneNode,
  resource: ResourceNode,
  team: TeamNode,
};

const PROJECT_NODE_TEMPLATES = [
  {
    type: 'project',
    label: 'Main Project',
    icon: <Target className="w-4 h-4" />,
    color: 'blue',
    description: 'Primary business project'
  },
  {
    type: 'task',
    label: 'Task',
    icon: <CheckSquare className="w-4 h-4" />,
    color: 'green',
    description: 'Actionable task or deliverable'
  },
  {
    type: 'milestone',
    label: 'Milestone',
    icon: <Flag className="w-4 h-4" />,
    color: 'purple',
    description: 'Key project milestone'
  },
  {
    type: 'resource',
    label: 'Resource',
    icon: <Users className="w-4 h-4" />,
    color: 'orange',
    description: 'Team member or resource'
  },
  {
    type: 'team',
    label: 'Team',
    icon: <Users2 className="w-4 h-4" />,
    color: 'indigo',
    description: 'Team or department'
  }
];

interface EnhancedProjectMapProps {
  onProjectSelect?: (projectId: string) => void;
  selectedProjectId?: string;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
  }>;
}

function EnhancedProjectMapContent({ 
  onProjectSelect, 
  selectedProjectId, 
  projects = [] 
}: EnhancedProjectMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'timeline' | 'resources' | 'kanban'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEcosystemMinimized, setIsEcosystemMinimized] = useState(false);
  const [isEcosystemClosed, setIsEcosystemClosed] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);

  // Initialize with existing projects and enhanced sample data
  useEffect(() => {
    if (projects.length > 0) {
      const initialNodes: Node[] = [];
      
      // Add project nodes
      projects.forEach((project, index) => {
        initialNodes.push({
          id: project.id,
          type: 'project',
          position: { 
            x: 100 + (index % 3) * 300, 
            y: 100 + Math.floor(index / 3) * 200 
          },
          data: {
            title: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            category: 'business',
            progress: 0, // Start with 0% progress
            team: [],
            tags: []
          }
        });
        
        // TODO: Add tasks, milestones, and resources via API calls
      });
      
      setNodes(initialNodes);
      setEdges([]); // Start with no connections
    } else {
      // No projects, clear everything
      setNodes([]);
      setEdges([]);
    }
  }, [projects]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const addNode = useCallback(
    (nodeType: string) => {
      const newNode: Node = {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          title: `New ${nodeType}`,
          description: `Description for new ${nodeType}`,
          status: nodeType === 'project' ? 'planning' : nodeType === 'task' ? 'todo' : 'pending',
          priority: 'medium',
          category: 'business',
          progress: 0,
          team: [],
          tags: []
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsNodeConfigOpen(true);
    onProjectSelect?.(node.id);
  }, [onProjectSelect]);

  // Enhanced status synchronization between related elements
  const syncRelatedElements = useCallback((updatedNode: Node) => {
    setNodes(nds => nds.map(n => {
      // If this is a task completion, check for milestone completion
      if (updatedNode.type === 'task' && updatedNode.data.status === 'completed') {
        // Find connected milestones and update their progress
        const connectedMilestones = nds.filter(node => 
          node.type === 'milestone' && 
          edges.some(edge => 
            (edge.source === updatedNode.id && edge.target === node.id) ||
            (edge.target === updatedNode.id && edge.source === node.id)
          )
        );
        
        if (connectedMilestones.length > 0) {
          connectedMilestones.forEach(milestone => {
            // Count completed tasks connected to this milestone
            const connectedTasks = nds.filter(taskNode => 
              taskNode.type === 'task' &&
              taskNode.data.status === 'completed' &&
              edges.some(edge => 
                (edge.source === taskNode.id && edge.target === milestone.id) ||
                (edge.target === taskNode.id && edge.source === milestone.id)
              )
            );
            
            const totalConnectedTasks = nds.filter(taskNode => 
              taskNode.type === 'task' &&
              edges.some(edge => 
                (edge.source === taskNode.id && edge.target === milestone.id) ||
                (edge.target === taskNode.id && edge.source === milestone.id)
              )
            ).length;
            
            // Auto-complete milestone if all connected tasks are done
            if (totalConnectedTasks > 0 && connectedTasks.length === totalConnectedTasks) {
              return {
                ...milestone,
                data: {
                  ...milestone.data,
                  completed: true,
                  progress: 100
                }
              };
            }
          });
        }
      }
      
      // If this is a milestone completion, update connected project progress
      if (updatedNode.type === 'milestone' && updatedNode.data.completed) {
        const connectedProjects = nds.filter(node => 
          node.type === 'project' &&
          edges.some(edge => 
            (edge.source === updatedNode.id && edge.target === node.id) ||
            (edge.target === updatedNode.id && edge.source === node.id)
          )
        );
        
        connectedProjects.forEach(project => {
          const connectedMilestones = nds.filter(milestoneNode => 
            milestoneNode.type === 'milestone' &&
            edges.some(edge => 
              (edge.source === milestoneNode.id && edge.target === project.id) ||
              (edge.target === milestoneNode.id && edge.source === project.id)
            )
          );
          
          const completedMilestones = connectedMilestones.filter(m => m.data.completed);
          const progress = connectedMilestones.length > 0 ? 
            Math.round((completedMilestones.length / connectedMilestones.length) * 100) : 
            project.data.progress;
            
          return {
            ...project,
            data: {
              ...project.data,
              progress: Math.max(project.data.progress, progress)
            }
          };
        });
      }
      
      return n;
    }));
  }, [edges, setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes(nds => {
      const updatedNodes = nds.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      );
      
      // Find the updated node and sync related elements
      const updatedNode = updatedNodes.find(n => n.id === nodeId);
      if (updatedNode) {
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => syncRelatedElements(updatedNode), 0);
      }
      
      return updatedNodes;
    });
  }, [setNodes, syncRelatedElements]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const filteredNodes = useMemo(() => {
    let filtered = nodes;
    
    if (searchQuery) {
      filtered = filtered.filter(node => 
        node.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(node => node.data.status === filterStatus);
    }
    
    return filtered;
  }, [nodes, searchQuery, filterStatus]);

  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
    if (nodes.length === 0) return { nodes: [], edges };
    
    // Improved hierarchical layout algorithm
    const layoutedNodes = [...nodes];
    const nodeTypes = ['project', 'team', 'resource', 'milestone', 'task'];
    
    // Group nodes by type for better organization
    const nodesByType = nodeTypes.reduce((acc, type) => {
      acc[type] = layoutedNodes.filter(node => node.type === type);
      return acc;
    }, {} as Record<string, Node[]>);
    
    let currentX = 100;
    let currentY = 100;
    const spacingX = 300;
    const spacingY = 250;
    
    // Layout projects first (main elements)
    nodesByType.project.forEach((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      layoutedNodes[layoutedNodes.indexOf(node)] = {
      ...node,
      position: {
          x: currentX + col * spacingX,
          y: currentY + row * spacingY
        }
      };
    });
    
    // Layout teams (to the right of projects)
    currentX = 100 + 3 * spacingX + 100;
    currentY = 100;
    nodesByType.team.forEach((node, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      layoutedNodes[layoutedNodes.indexOf(node)] = {
        ...node,
        position: {
          x: currentX + col * spacingX,
          y: currentY + row * spacingY
        }
      };
    });
    
    // Layout resources (below teams)
    currentX = 100 + 3 * spacingX + 100;
    currentY = 100 + 2 * spacingY + 100;
    nodesByType.resource.forEach((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      layoutedNodes[layoutedNodes.indexOf(node)] = {
        ...node,
        position: {
          x: currentX + col * spacingX,
          y: currentY + row * spacingY
        }
      };
    });
    
    // Layout milestones (below projects)
    currentX = 100;
    currentY = 100 + 3 * spacingY + 100;
    nodesByType.milestone.forEach((node, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      layoutedNodes[layoutedNodes.indexOf(node)] = {
        ...node,
        position: {
          x: currentX + col * spacingX,
          y: currentY + row * spacingY
        }
      };
    });
    
    // Layout tasks (scattered around)
    nodesByType.task.forEach((node, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      layoutedNodes[layoutedNodes.indexOf(node)] = {
        ...node,
        position: {
          x: 100 + col * 200,
          y: 100 + 4 * spacingY + row * 150
        }
      };
    });
    
    return { nodes: layoutedNodes, edges };
  }, []);

  const onLayout = useCallback(() => {
    setIsLayouting(true);
    
    // Add a small delay to show the loading state
    setTimeout(() => {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
      
      // Fit the view to show all nodes after layout
      setTimeout(() => {
        reactFlowInstance?.fitView({ 
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1
        });
        setIsLayouting(false);
      }, 100);
    }, 200);
  }, [nodes, edges, getLayoutedElements, setNodes, reactFlowInstance]);

  // Always show the project map system, even when no projects exist

  return (
    <div className="flex flex-col lg:flex-row h-[500px] sm:h-[600px] lg:h-[600px] bg-chatgpt-card rounded-2xl sm:rounded-3xl shadow-glass border border-border">
      {/* Sidebar - Only show in overview mode */}
      {viewMode === 'overview' && (
      <div className="w-full lg:w-80 bg-background/80 backdrop-blur-sm border-r-0 lg:border-r border-b lg:border-b-0 border-border flex flex-col max-h-[200px] sm:max-h-[250px] lg:max-h-none overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Project Map</h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          {/* Filters */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Node Templates */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Add Elements</h3>
          <div className="space-y-2">
            {PROJECT_NODE_TEMPLATES.map((template) => (
              <div
                key={template.type}
                className="p-3 border border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => addNode(template.type)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary`}>
                    {template.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{template.label}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button 
            onClick={onLayout} 
            variant="outline" 
            className="w-full border-border hover:bg-background/50"
            disabled={isLayouting || nodes.length === 0}
          >
            {isLayouting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Organizing...
              </>
            ) : (
              <>
            <Zap className="w-4 h-4 mr-2" />
            Auto Layout
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 border-border hover:bg-background/50">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-border hover:bg-background/50">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 relative min-h-[300px] sm:min-h-[400px] lg:min-h-0">
        {viewMode === 'overview' && (
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          style={{ background: 'transparent' }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={12} 
            size={1} 
            color="rgba(255, 255, 255, 0.1)"
          />
        </ReactFlow>
        )}

        {viewMode === 'timeline' && (
          <div className="w-full h-full bg-background/50 rounded-lg border border-border p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Project Timeline</h3>
              <p className="text-muted-foreground">Track project milestones and deadlines</p>
            </div>
            
            <div className="space-y-4">
              {filteredNodes.filter(node => node.type === 'project').map((project, index) => (
                <Card key={project.id} className="bg-background/80 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.data.title}</CardTitle>
                      <Badge variant={project.data.status === 'active' ? 'default' : 'secondary'}>
                        {project.data.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.data.progress !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{project.data.progress}%</span>
                          </div>
                          <Progress value={project.data.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start Date:</span>
                          <p className="text-foreground font-medium">
                            {project.data.startDate || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deadline:</span>
                          <p className="text-foreground font-medium">
                            {project.data.deadline || 'Not set'}
                          </p>
                        </div>
                      </div>
                      
                      {project.data.milestones && project.data.milestones.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Milestones:</span>
                          <div className="mt-2 space-y-1">
                            {project.data.milestones.map((milestone: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-foreground">{milestone.name}</span>
                                <span className="text-muted-foreground">- {milestone.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredNodes.filter(node => node.type === 'project').length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground">Create a project to see it in the timeline view.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'resources' && (
          <div className="w-full h-full bg-background/50 rounded-lg border border-border p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Resource Management</h3>
              <p className="text-muted-foreground">Manage team members, budgets, and project resources</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Resources */}
              <Card className="bg-background/80 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredNodes.filter(node => node.type === 'team').map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">{team.data.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.data.memberCount || 0} members
                          </p>
                        </div>
                        <Badge variant="outline">{team.data.status}</Badge>
                      </div>
                    ))}
                    
                    {filteredNodes.filter(node => node.type === 'team').length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No team members assigned</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Resources */}
              <Card className="bg-background/80 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredNodes.filter(node => node.type === 'project').map((project) => (
                      <div key={project.id} className="p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground">{project.data.title}</p>
                          <Badge variant="outline">{project.data.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Budget:</span>
                            <p className="text-foreground font-medium">
                              {project.data.budget || 'Not set'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Spent:</span>
                            <p className="text-foreground font-medium">
                              {project.data.spent || '$0'}
                            </p>
                          </div>
                        </div>
                        {project.data.budget && project.data.spent && (
                          <div className="mt-2">
                            <Progress 
                              value={parseFloat(project.data.spent.replace(/[^0-9.]/g, '')) / parseFloat(project.data.budget.replace(/[^0-9.]/g, '')) * 100} 
                              className="h-2" 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {filteredNodes.filter(node => node.type === 'project').length === 0 && (
                      <div className="text-center py-8">
                        <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No budget information available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resource Types */}
              <Card className="bg-background/80 border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Resource Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredNodes.filter(node => node.type === 'resource').map((resource) => (
                      <div key={resource.id} className="p-3 bg-background/50 rounded-lg border border-border text-center">
                        <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="font-medium text-foreground text-sm">{resource.data.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.data.status}</p>
                      </div>
                    ))}
                    
                    {filteredNodes.filter(node => node.type === 'resource').length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No resources defined</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Custom Zoom Controls - Top Left - Only show in overview mode */}
        {viewMode === 'overview' && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border p-1 flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reactFlowInstance?.zoomIn()}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-background/50 touch-manipulation"
              title="Zoom In"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reactFlowInstance?.zoomOut()}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-background/50 touch-manipulation"
              title="Zoom Out"
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reactFlowInstance?.fitView()}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-background/50 touch-manipulation"
              title="Fit View"
            >
              <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
        )}

        {/* View Mode Toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            onClick={() => setViewMode('overview')}
            className="border-border hover:bg-background/50"
          >
            Overview
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
            className="border-border hover:bg-background/50"
          >
            Timeline
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'resources' ? 'default' : 'outline'}
            onClick={() => setViewMode('resources')}
            className="border-border hover:bg-background/50"
          >
            Resources
          </Button>
        </div>

        {/* Enhanced Business Ecosystem Overview - Only show in overview mode */}
        {viewMode === 'overview' && !isEcosystemClosed && (
          <div className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-auto bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border max-w-sm transition-all duration-300 z-10 ${
            isEcosystemMinimized ? 'p-2' : 'p-3 sm:p-4'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-sm font-medium text-foreground">
                  {selectedNode ? `${selectedNode.data.title} - Ecosystem` : 'Business Ecosystem'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEcosystemMinimized(!isEcosystemMinimized)}
                  className="h-6 w-6 p-0 hover:bg-background/50"
                >
                  {isEcosystemMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEcosystemClosed(true)}
                  className="h-6 w-6 p-0 hover:bg-background/50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {!isEcosystemMinimized && (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="text-foreground font-medium">{filteredNodes.filter(n => n.type === 'project').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="text-foreground font-medium">{filteredNodes.filter(n => n.type === 'task').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="text-foreground font-medium">{filteredNodes.filter(n => n.type === 'milestone').length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Resources</span>
                      <span className="text-foreground font-medium">{filteredNodes.filter(n => n.type === 'resource').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Teams</span>
                      <span className="text-foreground font-medium">{filteredNodes.filter(n => n.type === 'team').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Connections</span>
                      <span className="text-foreground font-medium">{edges.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Active Workflow</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        filteredNodes.filter(n => n.data.status === 'active').length > 0 ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-foreground font-medium">
                        {filteredNodes.filter(n => n.data.status === 'active').length} active
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {filteredNodes.filter(n => n.type === 'task' && n.data.status === 'completed').length} of {filteredNodes.filter(n => n.type === 'task').length} tasks completed
                  </div>
                  
                  {filteredNodes.filter(n => n.type === 'milestone' && n.data.completed).length > 0 && (
                    <div className="mt-1 text-xs text-green-400">
                      {filteredNodes.filter(n => n.type === 'milestone' && n.data.completed).length} milestones achieved
                    </div>
                  )}
                  
                  {selectedNode && (
                    <div className="mt-2 p-2 bg-primary/10 rounded border border-primary/20">
                      <div className="text-xs font-medium text-primary mb-1">Selected: {selectedNode.data.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Type: {selectedNode.type} | Status: {selectedNode.data.status}
                        {selectedNode.data.progress !== undefined && ` | Progress: ${selectedNode.data.progress}%`}
                      </div>
                      {selectedNode.type === 'project' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Connected: {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} elements
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground italic">
                  ✨ Enhanced drag-and-drop workflow with real-time status synchronization
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Reopen button when closed - Only show in overview mode */}
        {viewMode === 'overview' && isEcosystemClosed && (
          <div className="absolute bottom-4 left-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEcosystemClosed(false)}
              className="bg-background/90 backdrop-blur-sm border-border hover:bg-background/50"
            >
              <Target className="w-4 h-4 mr-2" />
              Show Ecosystem
            </Button>
          </div>
        )}
      </div>

      {/* Node Configuration Dialog */}
      <Dialog open={isNodeConfigOpen} onOpenChange={setIsNodeConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedNode?.type}</DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <NodeConfigForm
              node={selectedNode}
              onUpdate={(newData) => updateNodeData(selectedNode.id, newData)}
              onDelete={() => {
                deleteNode(selectedNode.id);
                setIsNodeConfigOpen(false);
              }}
              onClose={() => setIsNodeConfigOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Node Configuration Form Component
interface NodeConfigFormProps {
  node: Node;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

function NodeConfigForm({ node, onUpdate, onDelete, onClose }: NodeConfigFormProps) {
  const [formData, setFormData] = useState(node.data);

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Priority</label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Progress</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedProjectMap(props: EnhancedProjectMapProps) {
  return (
    <ReactFlowProvider>
      <EnhancedProjectMapContent {...props} />
    </ReactFlowProvider>
  );
}
