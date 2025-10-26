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
import { createProject, updateProject, deleteProject, getUserProjects } from '@/lib/projects-service';
import MobileMindmapHeader from './MobileMindmapHeader';

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
  X,
  Maximize,
  Edit,
  FolderOpen,
  Building2,
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
  ChevronUp,
  ChevronDown,
  Package
} from 'lucide-react';

// Custom Node Components
const ProjectNode = ({ data, selected }: { data: any; selected: boolean }) => {
  // Determine color based on node type from data
  const getNodeStyles = () => {
    if (data.nodeType === 'subproject') {
      return {
        borderColor: selected ? 'border-red-500' : 'border-border',
        iconColor: 'text-red-500'
      };
    }
    if (data.nodeType === 'business') {
      return {
        borderColor: selected ? 'border-blue-500' : 'border-border',
        iconColor: 'text-blue-500'
      };
    }
    if (data.nodeType === 'system') {
      return {
        borderColor: selected ? 'border-indigo-500' : 'border-border',
        iconColor: 'text-indigo-500'
      };
    }
    if (data.nodeType === 'process') {
      return {
        borderColor: selected ? 'border-pink-500' : 'border-border',
        iconColor: 'text-pink-500'
      };
    }
    return {
      borderColor: selected ? 'border-primary' : 'border-border',
      iconColor: 'text-primary'
    };
  };
  
  const styles = getNodeStyles();
  
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-background border-2 min-w-[200px] max-w-[250px] ${styles.borderColor}`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
        <Target className={`w-4 h-4 ${styles.iconColor}`} />
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
};

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
    selected ? 'border-orange-500' : 'border-border'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <Users2 className="w-4 h-4 text-orange-500" />
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

// Custom Edge Component with Delete Button and Source Node Color
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, style, markerEnd, source, target }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // We'll use a different approach - store node colors in edge data
  const getEdgeColor = () => {
    // Try to get color from edge data first
    if (style?.stroke) return style.stroke;
    
    // Default colors based on common node types
    return '#6b7280'; // Default gray
  };
  
  const edgeColor = getEdgeColor();
  
  return (
    <>
      <path
        id={id}
        style={{ ...style, stroke: edgeColor, strokeWidth: 2 }}
        className="react-flow__edge-path"
        d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
        markerEnd={markerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {isHovered && (
        <foreignObject
          width={20}
          height={20}
          x={(sourceX + targetX) / 2 - 10}
          y={(sourceY + targetY) / 2 - 10}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center justify-center">
            <button
              className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs cursor-pointer border-none"
              onClick={(event) => {
                event.stopPropagation();
                // Edge deletion is handled by ReactFlow's onEdgesChange
              }}
            >
              ×
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
};

const nodeTypes: NodeTypes = {
  project: ProjectNode,
  subproject: ProjectNode, // Use ProjectNode for subprojects
  business: ProjectNode, // Use ProjectNode for businesses
  system: ProjectNode, // Use ProjectNode for systems
  process: ProjectNode, // Use ProjectNode for processes
  task: TaskNode,
  milestone: MilestoneNode,
  resource: ResourceNode,
  team: TeamNode,
};

const edgeTypes: EdgeTypes = {
  default: CustomEdge,
};

// Helper function to get icon component from string name
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'Building2': Building2,
    'FolderOpen': FolderOpen,
    'CheckSquare': CheckSquare,
    'Flag': Flag,
    'Users': Users,
    'Users2': Users2,
    'Settings': Settings,
    'Zap': Zap,
  };
  const IconComponent = iconMap[iconName] || Building2;
  return <IconComponent className="w-4 h-4" />;
};

const getProjectNodeTemplates = () => [
  {
    type: 'business',
    label: 'Business',
    icon: 'Building2',
    color: 'blue',
    description: 'Main business entity'
  },
  {
    type: 'subproject',
    label: 'Project',
    icon: 'FolderOpen',
    color: 'red',
    description: 'Sub-project or component'
  },
  {
    type: 'task',
    label: 'Task',
    icon: 'CheckSquare',
    color: 'green',
    description: 'Actionable task or deliverable'
  },
  {
    type: 'system',
    label: 'System',
    icon: 'Settings',
    color: 'indigo',
    description: 'Technology, platform, or infrastructure'
  },
  {
    type: 'process',
    label: 'Process',
    icon: 'Zap',
    color: 'pink',
    description: 'Workflow or standard operating procedure'
  },
  {
    type: 'milestone',
    label: 'Milestone',
    icon: 'Flag',
    color: 'purple',
    description: 'Key project milestone'
  },
  {
    type: 'resource',
    label: 'Resource',
    icon: 'Users',
    color: 'orange',
    description: 'Team member or resource'
  },
  {
    type: 'team',
    label: 'Team',
    icon: 'Users2',
    color: 'orange',
    description: 'Team or department'
  }
];

// Floating Add Button Component with Expandable Element Selection
const FloatingAddButton = ({ 
  isExpanded, 
  onToggle, 
  onAddNode 
}: { 
  isExpanded: boolean; 
  onToggle: () => void; 
  onAddNode: (type: string) => void; 
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-20">
      {/* Expanded State - Show all element templates */}
      {isExpanded && (
        <div className="mb-3 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Add Elements</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {getProjectNodeTemplates().map((template) => (
              <Button
                key={template.type}
                variant="outline"
                size="sm"
                onClick={() => {
                  onAddNode(template.type);
                  onToggle();
                }}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs"
              >
                {getIconComponent(template.icon)}
                <span>{template.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Add Button */}
      <Button
        onClick={onToggle}
        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200"
        size="icon"
      >
        {isExpanded ? (
          <X className="w-5 h-5" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};

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
  onProjectCreated?: () => void;
  onMobileElementCreate?: (element: any) => void;
}

function EnhancedProjectMapContent({ 
  onProjectSelect, 
  selectedProjectId, 
  projects = [],
  onProjectCreated,
  onMobileElementCreate
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
  const [isAddButtonExpanded, setIsAddButtonExpanded] = useState(false);

  // Get user ID for localStorage keys
  const userId = 'current-user'; // You can get this from auth context if needed

  // Load saved nodes and edges from localStorage on mount
  useEffect(() => {
    const savedNodes = localStorage.getItem(`reactflow_nodes_${userId}`);
    const savedEdges = localStorage.getItem(`reactflow_edges_${userId}`);
    
    if (savedNodes) {
      try {
        const parsedNodes = JSON.parse(savedNodes);
        console.log('🔄 Loading saved nodes from localStorage:', parsedNodes.length);
        setNodes(parsedNodes);
      } catch (error) {
        console.error('❌ Error parsing saved nodes:', error);
      }
    }
    
    if (savedEdges) {
      try {
        const parsedEdges = JSON.parse(savedEdges);
        console.log('🔄 Loading saved edges from localStorage:', parsedEdges.length);
        setEdges(parsedEdges);
      } catch (error) {
        console.error('❌ Error parsing saved edges:', error);
      }
    }
  }, []); // Only run on mount

  // Save nodes to localStorage whenever they change
  useEffect(() => {
    if (nodes.length > 0) {
      console.log('💾 Saving nodes to localStorage:', nodes.length);
      localStorage.setItem(`reactflow_nodes_${userId}`, JSON.stringify(nodes));
    }
  }, [nodes]);

  // Save edges to localStorage whenever they change
  useEffect(() => {
    if (edges.length > 0) {
      console.log('💾 Saving edges to localStorage:', edges.length);
      localStorage.setItem(`reactflow_edges_${userId}`, JSON.stringify(edges));
    }
  }, [edges]);

  // Initialize with projects from props or database (only if no saved nodes exist)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Check if we already have saved nodes - if so, don't override them
        const savedNodes = localStorage.getItem(`reactflow_nodes_${userId}`);
        if (savedNodes) {
          console.log('🔄 Saved nodes exist, skipping project initialization');
          return;
        }

        // First try to use projects from props
        console.log('🔍 EnhancedProjectMap - Projects from props:', projects);
        console.log('📊 Projects length:', projects?.length || 0);
        if (projects && projects.length > 0) {
          const initialNodes: Node[] = [];
          
          // Add project nodes from props
          projects.forEach((project, index) => {
            console.log(`📝 Creating node for project: ${project.name} (${project.id})`);
            initialNodes.push({
              id: project.id,
              type: 'business', // Use 'business' type for business nodes
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
                progress: 0,
                team: [],
                tags: [],
                nodeType: 'business'
              }
            });
          });
          
          setNodes(initialNodes);
          setEdges([]);
          console.log('✅ Loaded projects from props:', projects.length, 'nodes created:', initialNodes.length);
        } else {
          // Fallback to database if no props
        const userProjects = await getUserProjects();
        
        if (userProjects && userProjects.length > 0) {
          const initialNodes: Node[] = [];
          
          // Add project nodes from database
          userProjects.forEach((project, index) => {
            initialNodes.push({
              id: project.id,
                type: 'business', // Use 'business' type for consistency
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
                progress: 0,
                team: [],
                  tags: [],
                  nodeType: 'business'
              }
            });
          });
          
          setNodes(initialNodes);
          setEdges([]);
          console.log('✅ Loaded projects from database:', userProjects.length);
        } else {
          // No projects, clear everything
          setNodes([]);
          setEdges([]);
            console.log('ℹ️ No projects found');
          }
        }
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        setNodes([]);
        setEdges([]);
      }
    };
    
    loadProjects();
  }, [projects]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Find the source node to determine its color
      const sourceNode = nodes.find(node => node.id === params.source);
      let edgeColor = '#6b7280'; // Default gray
      
      if (sourceNode) {
        // Determine color based on source node type
        if (sourceNode.data?.nodeType === 'subproject') edgeColor = '#ef4444'; // Red
        else if (sourceNode.data?.nodeType === 'business') edgeColor = '#3b82f6'; // Blue
        else if (sourceNode.data?.nodeType === 'system') edgeColor = '#6366f1'; // Indigo
        else if (sourceNode.data?.nodeType === 'process') edgeColor = '#ec4899'; // Pink
        else if (sourceNode.type === 'task') edgeColor = '#10b981'; // Green
        else if (sourceNode.type === 'milestone') edgeColor = '#8b5cf6'; // Purple
        else if (sourceNode.type === 'resource') edgeColor = '#f59e0b'; // Orange
        else if (sourceNode.type === 'team') edgeColor = '#f59e0b'; // Orange
      }
      
      setEdges((eds) => addEdge({
      ...params,
        type: 'smoothstep', // Use curved edges
      animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 }
      }, eds));
    },
    [setEdges, nodes]
  );

  // Handle mobile element creation
  const handleMobileElementCreate = useCallback((element: any) => {
    if (onMobileElementCreate) {
      onMobileElementCreate(element);
    }
    addNode(element.type, element);
  }, [onMobileElementCreate]);

  const addNode = useCallback(
    async (nodeType: string, elementData?: any) => {
      const getDefaultTitle = () => {
        if (nodeType === 'business') return 'New Business';
        if (nodeType === 'subproject') return 'New Project';
        if (nodeType === 'system') return 'New System';
        if (nodeType === 'process') return 'New Process';
        if (nodeType === 'task') return 'New Task';
        return `New ${nodeType}`;
      };

      const getDefaultStatus = () => {
        if (nodeType === 'business' || nodeType === 'subproject') return 'planning';
        if (nodeType === 'system' || nodeType === 'process') return 'active';
        if (nodeType === 'task') return 'todo';
        return 'pending';
      };

      const newNode: Node = {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          title: elementData?.title || getDefaultTitle(),
          description: elementData?.description || `Description for new ${nodeType}`,
          status: elementData?.status || getDefaultStatus(),
          priority: elementData?.priority || 'medium',
          category: 'business',
          progress: 0,
          team: [],
          tags: [],
          nodeType: nodeType
        },
      };

      // Always create the node first (like other elements)
      setNodes((nds) => [...nds, newNode]);

      // Then optionally save to database for business/project types
      if (nodeType === 'project' || nodeType === 'subproject' || nodeType === 'business') {
        try {
          const projectData = {
            name: newNode.data.title,
            description: newNode.data.description,
            status: newNode.data.status,
            priority: newNode.data.priority,
            location: '',
            website: '',
            industry: '',
            products: '',
            targetAudience: '',
            businessStage: '',
            revenue: '',
            employees: '',
            founded: '',
            contactEmail: '',
            phone: '',
            socialMedia: '',
            additionalNotes: ''
          };
          
          const savedProject = await createProject(projectData);
          
          if (savedProject) {
            // Update the node with the database ID
            setNodes((nds) => nds.map(n => 
              n.id === newNode.id ? { ...n, id: savedProject.id } : n
            ));
            console.log('✅ Project saved to database:', savedProject.id);
            
            // 🔥 Notify parent component that a new project was created
            if (onProjectCreated) {
              onProjectCreated();
            }
          }
        } catch (error) {
          console.error('❌ Error saving project to database:', error);
          // Node still exists locally even if database save fails
        }
      }
    },
    [setNodes, onProjectCreated]
  );

  // Function to clear saved nodes and edges (for debugging/reset)
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`reactflow_nodes_${userId}`);
    localStorage.removeItem(`reactflow_edges_${userId}`);
    setNodes([]);
    setEdges([]);
    console.log('🗑️ Cleared saved nodes and edges');
  }, [setNodes, setEdges]);

  // Make clear function available globally for debugging
  useEffect(() => {
    (window as any).clearReactFlowData = clearSavedData;
  }, [clearSavedData]);

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

  const updateNodeData = useCallback(async (nodeId: string, newData: any) => {
    setNodes(nds => {
      const updatedNodes = nds.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      );
      
      // Find the updated node and sync related elements
      const updatedNode = updatedNodes.find(n => n.id === nodeId);
      if (updatedNode) {
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => syncRelatedElements(updatedNode), 0);
        
        // If it's a project node, save updates to the database
        if (updatedNode.type === 'project') {
          setTimeout(async () => {
            try {
              const projectUpdates = {
                name: updatedNode.data.title,
                description: updatedNode.data.description,
                status: updatedNode.data.status,
                priority: updatedNode.data.priority
              };
              
              const result = await updateProject(nodeId, projectUpdates);
              if (result) {
                console.log('✅ Project updated in database:', nodeId);
              } else {
                console.error('❌ Failed to update project in database');
              }
            } catch (error) {
              console.error('❌ Error updating project in database:', error);
            }
          }, 100);
        }
      }
      
      return updatedNodes;
    });
  }, [setNodes, syncRelatedElements]);

  const deleteNode = useCallback(async (nodeId: string) => {
    // Find the node to check if it's a project
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    
    // If it's a project node, delete it from the database
    if (nodeToDelete && nodeToDelete.type === 'project') {
      try {
        const result = await deleteProject(nodeId);
        if (result) {
          console.log('✅ Project deleted from database:', nodeId);
        } else {
          console.error('❌ Failed to delete project from database');
        }
      } catch (error) {
        console.error('❌ Error deleting project from database:', error);
      }
    }
    
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges, nodes]);

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
    const nodeTypes = ['project', 'business', 'team', 'resource', 'milestone', 'task', 'system', 'process'];
    
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
    
    // Layout systems (below tasks, left side)
    currentX = 100;
    currentY = 100 + 5 * spacingY + 100;
    nodesByType.system.forEach((node, index) => {
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
    
    // Layout processes (below tasks, right side)
    currentX = 100 + 4 * spacingX + 100;
    currentY = 100 + 5 * spacingY + 100;
    nodesByType.process.forEach((node, index) => {
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
    <div className="space-y-4">
      {/* View Mode Toggle - Outside business map for more space */}
      <div className="flex justify-center gap-2">
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

      <div className="flex flex-col h-[700px] sm:h-[600px] lg:h-[600px] bg-chatgpt-card rounded-2xl sm:rounded-3xl shadow-glass border border-border mobile-mindmap">
      {/* Mobile Header */}
      <MobileMindmapHeader
        onSearch={() => {
          // Focus on search input
          const searchInput = document.querySelector('input[placeholder="Search elements..."]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }}
        onFilter={() => {
          // Filter button clicked - handled by MobileMindmapHeader
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />
      
      <div className="flex flex-col xl:flex-row flex-1">
      {/* Sidebar - Only show in overview mode and on desktop */}
      {viewMode === 'overview' && (
      <div className="hidden xl:flex w-80 bg-background/80 backdrop-blur-sm border-r border-border flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Business Map</h2>
          
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

        {/* Node Templates - Hide on mobile since we have mobile navigation */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Add Elements</h3>
          <div className="space-y-2 hidden xl:block">
            {getProjectNodeTemplates().map((template) => (
              <div
                key={template.type}
                className="p-3 border border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                onClick={() => {
                  console.log('🎯 Button clicked for template type:', template.type);
                  addNode(template.type).catch(error => {
                    console.error('❌ Error adding node:', error);
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary`}>
                    {getIconComponent(template.icon)}
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
      <div className="flex-1 relative min-h-[500px] sm:min-h-[400px] lg:min-h-0">
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
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          minZoom={0.1}
          maxZoom={2}
          style={{ background: 'transparent' }}
          deleteKeyCode="Delete"
          elementsSelectable={true}
          edgesUpdatable={true}
          edgesFocusable={true}
          className="mobile-mindmap"
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={12} 
            size={1} 
            color="rgba(255, 255, 255, 0.1)"
          />
          
        </ReactFlow>
        )}
        
        {/* Floating Add Button - Only show in overview mode */}
        {viewMode === 'overview' && (
          <FloatingAddButton 
            isExpanded={isAddButtonExpanded}
            onToggle={() => setIsAddButtonExpanded(!isAddButtonExpanded)}
            onAddNode={(type) => {
              addNode(type).catch(error => {
                console.error('Error adding node:', error);
              });
            }}
          />
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


        {/* Enhanced Business Ecosystem Overview - Only show in overview mode */}
        {viewMode === 'overview' && !isEcosystemClosed && (
          <div className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-auto bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border max-w-sm transition-all duration-300 z-10 ${
            isEcosystemMinimized ? 'p-2' : 'p-3 sm:p-4'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-sm font-medium text-foreground">
                  Business Ecosystem
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
                      <span className="text-foreground font-medium">{filteredNodes.filter(n => n.type === 'business' || n.type === 'subproject').length}</span>
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
    </div>
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
