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
import { 
  BusinessMapNodesService,
  BusinessMapEdgesService,
  BusinessMapLayoutService,
  BusinessMapNode,
  BusinessMapEdge 
} from '@/lib/firebase-business-map';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Package,
  ExternalLink,
  Globe,
  Link,
  Bookmark,
  Star,
  Heart,
  Shield,
  Hammer,
  Wrench,
  Cog,
  Database,
  Server,
  Cloud,
  Monitor,
  Smartphone,
  Tablet,
  Laptop
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

const ResourceNode = ({ data, selected }: { data: any; selected: boolean }) => {
  // Icon mapping for resources
  const getResourceIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Package': Package,
      'Globe': Globe,
      'Link': Link,
      'ExternalLink': ExternalLink,
      'Bookmark': Bookmark,
      'Star': Star,
      'Heart': Heart,
      'Zap': Zap,
      'Shield': Shield,
      'Settings': Settings,
      'Tool': Hammer,
      'Wrench': Wrench,
      'Cog': Cog,
      'Database': Database,
      'Server': Server,
      'Cloud': Cloud,
      'Monitor': Monitor,
      'Smartphone': Smartphone,
      'Tablet': Tablet,
      'Laptop': Laptop,
    };
    return iconMap[iconName] || Package;
  };

  const IconComponent = getResourceIcon(data.icon || 'Package');

  return (
    <div className={`px-3 py-2 shadow-md rounded-lg bg-background border-2 min-w-[160px] ${
      selected ? 'border-orange-500' : 'border-border'
    }`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2 mb-1">
        <IconComponent className="w-4 h-4 text-orange-500" />
        <div className="font-semibold text-sm text-foreground">{data.title}</div>
        <div className={`w-2 h-2 rounded-full ${
          data.available ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        {data.role || data.description}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
          {data.skills?.join(', ') || data.status}
        </Badge>
        <div className="text-xs text-muted-foreground">
          {data.workload || 0}% busy
        </div>
      </div>

      {/* Link button for resources with URLs */}
      {data.url && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              window.open(data.url, '_blank');
            }}
            className="h-6 text-xs px-2"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open Link
          </Button>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

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
    <div className="absolute top-4 right-4 z-20 flex flex-col-reverse">
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
  
  // Helper function to get edge color based on source node
  const getEdgeColorFromSourceNode = (sourceNode: Node | undefined) => {
    if (!sourceNode) return '#6b7280'; // Default gray
    
    // Get the node type from either node.type or node.data.nodeType
    const nodeType = sourceNode.type || sourceNode.data?.nodeType;
    
    // Determine color based on source node type
    switch (nodeType) {
      case 'business':
        return '#3b82f6'; // Blue
      case 'project':
      case 'subproject':
        return '#ef4444'; // Red
      case 'task':
        return '#10b981'; // Green
      case 'milestone':
        return '#8b5cf6'; // Purple
      case 'resource':
      case 'team':
        return '#f59e0b'; // Orange
      case 'system':
        return '#6366f1'; // Indigo
      case 'process':
        return '#ec4899'; // Pink
      default:
        return '#6b7280'; // Default gray
    }
  };
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'timeline' | 'resources' | 'kanban' | 'ecosystem'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEcosystemMinimized, setIsEcosystemMinimized] = useState(false);
  const [isEcosystemClosed, setIsEcosystemClosed] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
  const [isAddButtonExpanded, setIsAddButtonExpanded] = useState(false);
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [isEditResourceDialogOpen, setIsEditResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceError, setNewResourceError] = useState<string | null>(null);
  const [editResourceName, setEditResourceName] = useState('');
  const [editResourceUrl, setEditResourceUrl] = useState('');
  const [editResourceIcon, setEditResourceIcon] = useState('');
  const [editResourceError, setEditResourceError] = useState<string | null>(null);

  // Get Firebase auth context
  const { user } = useFirebaseAuth();
  const userId = user?.uid || 'anonymous';
  const teamId = 'default-team'; // You can make this dynamic based on user's team

  // Persist node position to Firebase
  const handleNodeDragStop = useCallback(async (_: any, node: Node) => {
    try {
      if (!user) return;
      // Find the Firebase document by nodeId
      const firebaseNodes = await BusinessMapNodesService.getNodes(userId, teamId);
      const firebaseNode = firebaseNodes.find((n) => n.nodeId === node.id);
      if (!firebaseNode) return;

      await BusinessMapNodesService.updateNode(userId, teamId, firebaseNode.id, {
        position: { x: node.position.x, y: node.position.y },
      } as Partial<BusinessMapNode>);
      // Optimistically update local state
      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n)));
    } catch (err) {
      console.error('Error persisting node position:', err);
    }
  }, [user, userId, teamId, setNodes]);


  // Load saved nodes and edges from Firebase on mount
  useEffect(() => {
    if (!user) return;

    const loadFirebaseData = async () => {
      try {
        // Load nodes from Firebase
        const firebaseNodes = await BusinessMapNodesService.getNodes(userId, teamId);
        const reactFlowNodes = firebaseNodes.map(node => ({
          id: node.nodeId,
          type: node.nodeType,
          position: node.position,
          data: {
            title: node.data.title,
            label: node.data.title, // Keep both for compatibility
            description: node.data.description,
            status: node.data.status,
            priority: node.data.priority,
            progress: node.data.progress || 0,
            color: node.data.color,
            icon: node.data.icon,
            url: node.data.url || null,
            isCustom: node.data.isCustom || false,
            ...node.data.metadata
          }
        }));
        
        console.log('🔄 Loading nodes from Firebase:', reactFlowNodes.length);
        setNodes(reactFlowNodes);

        // Load edges from Firebase
        const firebaseEdges = await BusinessMapEdgesService.getEdges(userId, teamId);
        const reactFlowEdges = firebaseEdges.map(edge => {
          // Find the source node to get its color
          const sourceNode = reactFlowNodes.find(node => node.id === edge.sourceNodeId);
          const edgeColor = getEdgeColorFromSourceNode(sourceNode);
          
          return {
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: edgeColor, strokeWidth: 2 }
          };
        });
        
        console.log('🔄 Loading edges from Firebase:', reactFlowEdges.length);
        setEdges(reactFlowEdges);
      } catch (error) {
        console.error('❌ Error loading Firebase data:', error);
      }
    };

    loadFirebaseData();
  }, [user]);

  // Subscribe to real-time updates for nodes
  useEffect(() => {
    if (!user) return;

    const unsubscribeNodes = BusinessMapNodesService.subscribeToNodes(
      userId, 
      teamId, 
      (firebaseNodes) => {
        const reactFlowNodes = firebaseNodes.map(node => ({
          id: node.nodeId,
          type: node.nodeType,
          position: node.position,
          data: {
            title: node.data.title,
            label: node.data.title, // Keep both for compatibility
            description: node.data.description,
            status: node.data.status,
            priority: node.data.priority,
            progress: node.data.progress || 0,
            color: node.data.color,
            icon: node.data.icon,
            url: node.data.url || null,
            isCustom: node.data.isCustom || false,
            ...node.data.metadata
          }
        }));
        setNodes(reactFlowNodes);
      }
    );

    const unsubscribeEdges = BusinessMapEdgesService.subscribeToEdges(
      userId, 
      teamId, 
      (firebaseEdges) => {
        const reactFlowEdges = firebaseEdges.map(edge => {
          // Find the source node to get its color
          const sourceNode = nodes.find(node => node.id === edge.sourceNodeId);
          const edgeColor = getEdgeColorFromSourceNode(sourceNode);
          
          return {
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: edgeColor, strokeWidth: 2 }
          };
        });
        setEdges(reactFlowEdges);
      }
    );

    return () => {
      unsubscribeNodes();
      unsubscribeEdges();
    };
  }, [user]);


  // Initialize with projects from props or database (only if no saved nodes exist)
  // DISABLED: This useEffect was causing conflicts with Firebase loading
  // All node loading is now handled by Firebase in the first useEffect
  /*
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
  */

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!user) {
        console.error('❌ User not authenticated');
        return;
      }

      // Find the source node to determine its color
      const sourceNode = nodes.find(node => node.id === params.source);
      const edgeColor = getEdgeColorFromSourceNode(sourceNode);
      
      const newEdge = {
      ...params,
        type: 'smoothstep', // Use curved edges
      animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 }
      };

      try {
        // Save edge to Firebase
        await BusinessMapEdgesService.createEdge(userId, teamId, {
          userId,
          teamId,
          sourceNodeId: params.source!,
          targetNodeId: params.target!
        });
        
        // Add to local state (will be updated by real-time subscription)
        setEdges((eds) => addEdge(newEdge, eds));
        
        console.log('✅ Edge saved to Firebase:', params.source, '->', params.target);
      } catch (error) {
        console.error('❌ Error saving edge to Firebase:', error);
        // Still add to local state for immediate feedback
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [setEdges, nodes, user, userId, teamId]
  );

  // Handle mobile element creation
  const handleMobileElementCreate = useCallback((element: any) => {
    if (onMobileElementCreate) {
      onMobileElementCreate(element);
    }
    addNode(element.type, element);
  }, [onMobileElementCreate]);

  // Helper functions for node styling
  const getNodeColor = (nodeType: string): string => {
    switch (nodeType) {
      case 'business': return '#3b82f6'; // Blue
      case 'project': return '#ef4444'; // Red
      case 'task': return '#10b981'; // Green
      case 'milestone': return '#8b5cf6'; // Purple
      case 'resource': return '#f59e0b'; // Orange
      case 'team': return '#f59e0b'; // Orange
      default: return '#6b7280'; // Gray
    }
  };

  const getNodeIcon = (nodeType: string): string => {
    switch (nodeType) {
      case 'business': return 'Building2';
      case 'project': return 'FolderOpen';
      case 'task': return 'CheckSquare';
      case 'milestone': return 'Flag';
      case 'resource': return 'Users';
      case 'team': return 'Users2';
      default: return 'Circle';
    }
  };

  const addNode = useCallback(
    async (nodeType: string, elementData?: any) => {
      console.log('🔄 addNode called with:', { nodeType, elementData, user: user?.email, userId });
      
      if (!user) {
        console.error('❌ No user authenticated - cannot save node');
        return;
      }

      const getDefaultTitle = () => {
        if (nodeType === 'business') return 'New Business';
        if (nodeType === 'project') return 'New Project';
        if (nodeType === 'task') return 'New Task';
        if (nodeType === 'milestone') return 'New Milestone';
        if (nodeType === 'resource') return 'New Resource';
        if (nodeType === 'team') return 'New Team';
        return `New ${nodeType}`;
      };

      const getDefaultStatus = () => {
        if (nodeType === 'business' || nodeType === 'project') return 'planning';
        if (nodeType === 'task') return 'todo';
        if (nodeType === 'milestone') return 'pending';
        if (nodeType === 'resource') return 'available';
        if (nodeType === 'team') return 'active';
        return 'pending';
      };

      const nodeId = `${nodeType}_${Date.now()}`;
      const newNode: Node = {
        id: nodeId,
        type: nodeType,
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          label: elementData?.title || getDefaultTitle(),
          title: elementData?.title || getDefaultTitle(),
          description: elementData?.description || `Description for new ${nodeType}`,
          status: elementData?.status || getDefaultStatus(),
          priority: elementData?.priority || 'medium',
          category: 'business',
          progress: 0,
          team: [],
          tags: [],
          nodeType: nodeType,
          // Set isCustom based on whether it was explicitly provided or default to false for system resources
          isCustom: elementData?.isCustom !== undefined ? elementData.isCustom : false,
          // Include URL if provided
          url: elementData?.url || null
        },
      };

      try {
        // Save to Firebase using bridge
        const firebaseNodeData = {
          userId,
          teamId,
          nodeId,
          nodeType: nodeType as any,
          position: newNode.position,
          data: {
            title: newNode.data.title,
            description: newNode.data.description,
            status: newNode.data.status,
            priority: newNode.data.priority,
            color: getNodeColor(nodeType),
            icon: getNodeIcon(nodeType),
            url: newNode.data.url,
            isCustom: newNode.data.isCustom,
            metadata: {
              category: newNode.data.category,
              progress: newNode.data.progress,
              team: newNode.data.team,
              tags: newNode.data.tags,
              nodeType: newNode.data.nodeType
            }
          }
        };

        console.log('🔄 Attempting to save node to Firebase:', firebaseNodeData);
        await BusinessMapNodesService.createNode(userId, teamId, firebaseNodeData);
        console.log('✅ Node successfully saved to Firebase');
        // Do not optimistically add to local state to avoid duplicate keys; rely on subscription
        console.log('✅ Node saved to Firebase:', nodeId);
        
        // Notify parent component if needed
        if (onProjectCreated) {
          onProjectCreated();
          }
        } catch (error) {
        console.error('❌ Error saving node to Firebase:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          userId,
          teamId,
          nodeType,
          nodeId
        });
        
        // Check if it's a permission error
        if (error.code === 'permission-denied') {
          console.error('🚨 PERMISSION DENIED: Check Firestore security rules!');
          console.error('💡 Make sure authenticated users can write to businessMapNodes collection');
        }
        
        // Check if it's a network error
        if (error.code === 'unavailable') {
          console.error('🚨 FIREBASE UNAVAILABLE: Check your internet connection and Firebase status');
        }
        
        // Skip local optimistic add on error to avoid duplicate keys; surface error in console
      }
    },
    [setNodes, onProjectCreated, user, userId, teamId]
  );

  // Create some default system resources with URLs for demonstration
  const createDefaultSystemResources = useCallback(async () => {
    if (!user) return;
    
    const defaultResources = [
      {
        title: 'GitHub',
        description: 'Code repository and version control',
        url: 'https://github.com',
        status: 'available',
        priority: 'high',
        isCustom: false
      },
      {
        title: 'Firebase Console',
        description: 'Database and authentication management',
        url: 'https://console.firebase.google.com',
        status: 'available',
        priority: 'high',
        isCustom: false
      },
      {
        title: 'Vercel Dashboard',
        description: 'Deployment and hosting platform',
        url: 'https://vercel.com/dashboard',
        status: 'available',
        priority: 'medium',
        isCustom: false
      },
      {
        title: 'Figma',
        description: 'Design and prototyping tool',
        url: 'https://figma.com',
        status: 'available',
        priority: 'medium',
        isCustom: false
      }
    ];

    try {
      // Check if we already have system resources
      const existingNodes = await BusinessMapNodesService.getNodes(userId, teamId);
      const hasSystemResources = existingNodes.some(node => 
        node.nodeType === 'resource' && node.data.isCustom === false
      );
      
      if (!hasSystemResources) {
        console.log('🔄 Creating default system resources...');
        for (const resource of defaultResources) {
          await addNode('resource', resource);
        }
        console.log('✅ Default system resources created');
      }
    } catch (error) {
      console.error('❌ Error creating default system resources:', error);
    }
  }, [user, userId, teamId, addNode]);

  // Handle opening edit resource dialog
  const handleEditResource = useCallback((resource: any) => {
    setEditingResource(resource);
    setEditResourceName(resource.data.title || '');
    setEditResourceUrl(resource.data.url || '');
    setEditResourceIcon(resource.data.icon || 'Package');
    setEditResourceError(null);
    setIsEditResourceDialogOpen(true);
  }, []);


  // Create default system resources after nodes are loaded
  useEffect(() => {
    if (!user || nodes.length === 0) return;
    
    const createDefaults = async () => {
      await createDefaultSystemResources();
    };
    
    createDefaults();
  }, [user, nodes.length, createDefaultSystemResources]);

  // Function to clear saved nodes and edges (for debugging/reset)
  const clearSavedData = useCallback(async () => {
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }

    try {
      // Clear all nodes from Firebase
      const firebaseNodes = await BusinessMapNodesService.getNodes(userId, teamId);
      for (const node of firebaseNodes) {
        await BusinessMapNodesService.deleteNode(userId, teamId, node.id);
      }

      // Clear all edges from Firebase
      const firebaseEdges = await BusinessMapEdgesService.getEdges(userId, teamId);
      for (const edge of firebaseEdges) {
        await BusinessMapEdgesService.deleteEdge(userId, teamId, edge.id);
      }

      // Clear local state
      setNodes([]);
      setEdges([]);
      console.log('🗑️ Cleared all saved nodes and edges from Firebase');
    } catch (error) {
      console.error('❌ Error clearing Firebase data:', error);
    }
  }, [user, setNodes, setEdges]);

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
    if (!user) {
      console.error('❌ No user authenticated - cannot update node');
      return;
    }

    setNodes(nds => {
      const updatedNodes = nds.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      );
      
      // Find the updated node and sync related elements
      const updatedNode = updatedNodes.find(n => n.id === nodeId);
      if (updatedNode) {
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => syncRelatedElements(updatedNode), 0);
        
        // Save updates to Firebase for all node types
          setTimeout(async () => {
            try {
            console.log('🔄 Updating node in Firebase:', nodeId, newData);
            
            // Find the Firebase node document ID
            const firebaseNodes = await BusinessMapNodesService.getNodes(userId, teamId);
            const firebaseNode = firebaseNodes.find(n => n.nodeId === nodeId);
            
            if (firebaseNode) {
              // Update the Firebase document
              const updatedFirebaseData = {
                ...firebaseNode,
                data: {
                  ...firebaseNode.data,
                  title: updatedNode.data.title,
                  description: updatedNode.data.description,
                  status: updatedNode.data.status,
                  priority: updatedNode.data.priority,
                  progress: updatedNode.data.progress,
                  url: updatedNode.data.url,
                  isCustom: updatedNode.data.isCustom,
                  icon: updatedNode.data.icon,
                  metadata: {
                    ...firebaseNode.data.metadata,
                    ...updatedNode.data.metadata
                  }
                }
              };
              
              await BusinessMapNodesService.updateNode(userId, teamId, firebaseNode.id, updatedFirebaseData);
              console.log('✅ Node updated in Firebase:', nodeId);
              } else {
              console.warn('⚠️ Firebase node not found for update:', nodeId);
              }
            } catch (error) {
            console.error('❌ Error updating node in Firebase:', error);
            }
          }, 100);
      }
      
      return updatedNodes;
    });
  }, [setNodes, syncRelatedElements, user, userId, teamId]);

  // Handle saving edited resource
  const handleSaveEditedResource = useCallback(async () => {
    if (!editingResource) return;
    
    setEditResourceError(null);
    
    if (!editResourceName.trim()) {
      setEditResourceError('Please enter a name');
      return;
    }
    
    if (!editResourceUrl.trim()) {
      setEditResourceError('Please enter a URL');
      return;
    }
    
    try {
      const validated = new URL(editResourceUrl);
      const urlStr = validated.toString();
      
      await updateNodeData(editingResource.id, {
        title: editResourceName.trim(),
        url: urlStr,
        description: `Custom resource: ${urlStr}`,
        icon: editResourceIcon
      });
      
      setIsEditResourceDialogOpen(false);
      setEditingResource(null);
      setEditResourceName('');
      setEditResourceUrl('');
      setEditResourceIcon('');
    } catch (e) {
      setEditResourceError('Invalid URL. Example: https://example.com');
    }
  }, [editingResource, editResourceName, editResourceUrl, editResourceIcon, updateNodeData]);

  const deleteNode = useCallback(async (nodeId: string) => {
    if (!user) {
      console.error('❌ No user authenticated - cannot delete node');
      return;
    }

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

    // Delete from Firebase for all node types
    try {
      const firebaseNodes = await BusinessMapNodesService.getNodes(userId, teamId);
      const firebaseNode = firebaseNodes.find(n => n.nodeId === nodeId);
      
      if (firebaseNode) {
        await BusinessMapNodesService.deleteNode(userId, teamId, firebaseNode.id);
        console.log('✅ Node deleted from Firebase:', nodeId);
      }
    } catch (error) {
      console.error('❌ Error deleting node from Firebase:', error);
    }
    
    // Remove from local state
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges, nodes, user, userId, teamId]);

  const filteredNodes = useMemo(() => {
    // Deduplicate nodes by id to avoid React key collisions (subscription + local state races)
    const uniqueNodes = Array.from(new Map(nodes.map((n) => [n.id, n])).values());
    let filtered = uniqueNodes;
    
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
        <Button
          size="sm"
          variant={viewMode === 'ecosystem' ? 'default' : 'outline'}
          onClick={() => setViewMode('ecosystem')}
          className="border-border hover:bg-background/50"
        >
          Ecosystem
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
          onNodeDragStop={handleNodeDragStop}
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
          <div className="w-full h-full bg-background/50 rounded-lg border border-border p-4 sm:p-6 overflow-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Project Timeline</h3>
              <p className="text-muted-foreground">Visual timeline of all projects and milestones</p>
            </div>
            
            {/* Timeline Container */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
              
              {/* Timeline Items */}
              <div className="space-y-8">
                {filteredNodes
                  .filter(node => node.type === 'business' || node.type === 'subproject' || node.type === 'project')
                  .sort((a, b) => {
                    // Sort by status: active first, then planning, then completed
                    const statusOrder = { 'active': 0, 'planning': 1, 'completed': 2, 'paused': 3 };
                    return (statusOrder[a.data.status] || 4) - (statusOrder[b.data.status] || 4);
                  })
                  .map((project, index) => {
                    const connectedTasks = filteredNodes.filter(node => 
                      node.type === 'task' && 
                      edges.some(edge => 
                        (edge.source === project.id && edge.target === node.id) ||
                        (edge.target === project.id && edge.source === node.id)
                      )
                    );
                    
                    const connectedMilestones = filteredNodes.filter(node => 
                      node.type === 'milestone' && 
                      edges.some(edge => 
                        (edge.source === project.id && edge.target === node.id) ||
                        (edge.target === project.id && edge.source === node.id)
                      )
                    );

                    return (
                      <div key={project.id} className="relative flex items-start gap-6">
                        {/* Timeline Dot */}
                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                          project.data.status === 'active' ? 'bg-green-500 border-green-500' :
                          project.data.status === 'completed' ? 'bg-blue-500 border-blue-500' :
                          project.data.status === 'paused' ? 'bg-yellow-500 border-yellow-500' :
                          'bg-gray-500 border-gray-500'
                        }`}>
                          <div className={`absolute inset-0 rounded-full ${
                            project.data.status === 'active' ? 'bg-green-500 animate-pulse' : ''
                          }`}></div>
                        </div>
                        
                        {/* Project Card */}
                        <Card className={`flex-1 bg-background/80 border-border hover:shadow-md transition-shadow ${
                          project.data.status === 'active' ? 'ring-2 ring-green-500/20' : ''
                        }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  project.data.status === 'active' ? 'bg-green-500' :
                                  project.data.status === 'completed' ? 'bg-blue-500' :
                                  project.data.status === 'paused' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}></div>
                      <CardTitle className="text-lg">{project.data.title}</CardTitle>
                                <Badge variant={
                                  project.data.status === 'active' ? 'default' :
                                  project.data.status === 'completed' ? 'secondary' :
                                  project.data.status === 'paused' ? 'destructive' :
                                  'outline'
                                }>
                        {project.data.status}
                      </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {project.data.priority && (
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    project.data.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    project.data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {project.data.priority}
                                  </span>
                                )}
                              </div>
                    </div>
                  </CardHeader>
                          
                  <CardContent>
                            <div className="space-y-4">
                              {/* Progress Bar */}
                      {project.data.progress !== undefined && (
                        <div>
                                  <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{project.data.progress}%</span>
                          </div>
                          <Progress value={project.data.progress} className="h-2" />
                        </div>
                      )}
                      
                              {/* Description */}
                              {project.data.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {project.data.description}
                                </p>
                              )}
                              
                              {/* Connected Elements */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckSquare className="w-4 h-4 text-green-500" />
                                    <span className="text-muted-foreground">Tasks</span>
                                    <span className="text-foreground font-medium">
                                      {connectedTasks.length}
                                    </span>
                        </div>
                                  {connectedTasks.length > 0 && (
                                    <div className="space-y-1">
                                      {connectedTasks.slice(0, 3).map((task, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                          <div className={`w-2 h-2 rounded-full ${
                                            task.data.status === 'completed' ? 'bg-green-500' :
                                            task.data.status === 'active' ? 'bg-blue-500' :
                                            'bg-gray-400'
                                          }`}></div>
                                          <span className="text-foreground truncate">{task.data.title}</span>
                                        </div>
                                      ))}
                                      {connectedTasks.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{connectedTasks.length - 3} more tasks
                                        </div>
                                      )}
                                    </div>
                                  )}
                      </div>
                      
                        <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Flag className="w-4 h-4 text-purple-500" />
                                    <span className="text-muted-foreground">Milestones</span>
                                    <span className="text-foreground font-medium">
                                      {connectedMilestones.length}
                                    </span>
                                  </div>
                                  {connectedMilestones.length > 0 && (
                                    <div className="space-y-1">
                                      {connectedMilestones.slice(0, 3).map((milestone, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                          <div className={`w-2 h-2 rounded-full ${
                                            milestone.data.completed ? 'bg-green-500' :
                                            'bg-purple-400'
                                          }`}></div>
                                          <span className="text-foreground truncate">{milestone.data.title}</span>
                              </div>
                            ))}
                                      {connectedMilestones.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{connectedMilestones.length - 3} more milestones
                          </div>
                                      )}
                        </div>
                      )}
                                </div>
                              </div>
                              
                              {/* Project Stats */}
                              <div className="flex items-center justify-between pt-3 border-t border-border">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>Created: {new Date().toLocaleDateString()}</span>
                                  <span>Type: {project.type}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {edges.filter(e => e.source === project.id || e.target === project.id).length} connections
                                </div>
                              </div>
                    </div>
                  </CardContent>
                </Card>
                      </div>
                    );
                  })}
              
                {filteredNodes.filter(node => node.type === 'business' || node.type === 'subproject' || node.type === 'project').length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground">Create a project to see it in the timeline view.</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'resources' && (
          <div className="w-full h-full bg-background/50 rounded-lg border border-border p-4 sm:p-6 overflow-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Resource Management</h3>
              <p className="text-muted-foreground">Manage your custom bookmarks, team members, and project resources</p>
            </div>
            
            <div className="space-y-6">
              {/* Top Row - Custom Resources and Team Members */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Custom Bookmarks/Resources */}
              <Card className="bg-background/80 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Custom Resources
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewResourceName('');
                        setNewResourceUrl('');
                        setNewResourceError(null);
                        setIsAddResourceDialogOpen(true);
                      }}
                      className="h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Resource
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredNodes.filter(node => node.type === 'resource' && node.data.isCustom).map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border hover:bg-background/70 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Favicon or default icon */}
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            {resource.data.url ? (
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${new URL(resource.data.url).hostname}&sz=32`}
                                alt=""
                                className="w-6 h-6 rounded"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) nextElement.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <Package className={`w-4 h-4 text-primary ${resource.data.url ? 'hidden' : ''}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{resource.data.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{resource.data.url}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (resource.data.url) {
                                window.open(resource.data.url, '_blank');
                              }
                            }}
                            className="h-8 w-8 p-0"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditResource(resource)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this resource?')) {
                                  await deleteNode(resource.id);
                                }
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                      </div>
                    ))}
                    
                    {filteredNodes.filter(node => node.type === 'resource' && node.data.isCustom).length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">No custom resources yet</p>
                        <p className="text-xs text-muted-foreground">Click "Add Resource" to create your first bookmark</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Add Resource Dialog */}
              <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Custom Resource</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={newResourceName}
                        onChange={(e) => setNewResourceName(e.target.value)}
                        placeholder="e.g., GitHub"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL</label>
                      <Input
                        value={newResourceUrl}
                        onChange={(e) => setNewResourceUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                      {newResourceError && (
                        <div className="text-xs text-red-500 mt-1">{newResourceError}</div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsAddResourceDialogOpen(false)}>Cancel</Button>
                      <Button
                        onClick={async () => {
                          setNewResourceError(null);
                          if (!newResourceName.trim()) {
                            setNewResourceError('Please enter a name');
                            return;
                          }
                          if (!newResourceUrl.trim()) {
                            setNewResourceError('Please enter a URL');
                            return;
                          }
                          try {
                            const validated = new URL(newResourceUrl);
                            const urlStr = validated.toString();
                            await addNode('resource', {
                              title: newResourceName.trim(),
                              description: `Custom resource: ${urlStr}`,
                              url: urlStr,
                              status: 'available',
                              priority: 'medium',
                              isCustom: true
                            });
                            setIsAddResourceDialogOpen(false);
                            setNewResourceName('');
                            setNewResourceUrl('');
                          } catch (e) {
                            setNewResourceError('Invalid URL. Example: https://example.com');
                          }
                        }}
                      >
                        Save Resource
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Resource Dialog */}
              <Dialog open={isEditResourceDialogOpen} onOpenChange={setIsEditResourceDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Custom Resource</DialogTitle>
                    <DialogDescription>
                      Update the name, URL, and icon for this custom resource.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={editResourceName}
                        onChange={(e) => setEditResourceName(e.target.value)}
                        placeholder="e.g., My Website"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL</label>
                      <Input
                        value={editResourceUrl}
                        onChange={(e) => setEditResourceUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Icon</label>
                      <Select value={editResourceIcon} onValueChange={setEditResourceIcon}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Package">Package</SelectItem>
                          <SelectItem value="Globe">Globe</SelectItem>
                          <SelectItem value="Link">Link</SelectItem>
                          <SelectItem value="ExternalLink">External Link</SelectItem>
                          <SelectItem value="Bookmark">Bookmark</SelectItem>
                          <SelectItem value="Star">Star</SelectItem>
                          <SelectItem value="Heart">Heart</SelectItem>
                          <SelectItem value="Zap">Zap</SelectItem>
                          <SelectItem value="Shield">Shield</SelectItem>
                          <SelectItem value="Settings">Settings</SelectItem>
                          <SelectItem value="Tool">Tool</SelectItem>
                          <SelectItem value="Wrench">Wrench</SelectItem>
                          <SelectItem value="Cog">Cog</SelectItem>
                          <SelectItem value="Database">Database</SelectItem>
                          <SelectItem value="Server">Server</SelectItem>
                          <SelectItem value="Cloud">Cloud</SelectItem>
                          <SelectItem value="Monitor">Monitor</SelectItem>
                          <SelectItem value="Smartphone">Smartphone</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                          <SelectItem value="Laptop">Laptop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editResourceError && (
                      <div className="text-xs text-red-500 mt-1">{editResourceError}</div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setIsEditResourceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEditedResource}>
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* System Resources */}
              <Card className="bg-background/80 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredNodes.filter(node => node.type === 'resource' && !node.data.isCustom).map((resource) => (
                      <div key={resource.id} className="p-3 bg-background/50 rounded-lg border border-border text-center hover:bg-background/70 transition-colors group relative">
                        {/* Favicon or default icon */}
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
                          {resource.data.url ? (
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${new URL(resource.data.url).hostname}&sz=32`}
                              alt=""
                              className="w-6 h-6 rounded"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) nextElement.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <Package className={`w-4 h-4 text-primary ${resource.data.url ? 'hidden' : ''}`} />
                        </div>
                        <p className="font-medium text-foreground text-sm truncate">{resource.data.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.data.status}</p>
                        
                        {/* Hover actions */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            {resource.data.url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (resource.data.url) {
                                    window.open(resource.data.url, '_blank');
                                  }
                                }}
                                className="h-6 w-6 p-0"
                                title="Open Link"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this resource?')) {
                                  await deleteNode(resource.id);
                                }
                              }}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredNodes.filter(node => node.type === 'resource' && !node.data.isCustom).length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <Settings className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No system resources defined</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
              </div>

              {/* Second Row - Budget & Resources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              </div>
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


        {/* Business Ecosystem moved into its own tab */}
        {viewMode === 'ecosystem' && (
          <div className="w-full h-full bg-background/50 rounded-lg border border-border p-4 sm:p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-base sm:text-lg font-semibold text-foreground">Business Ecosystem</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="space-y-1 p-3 rounded-lg bg-background/60 border border-border">
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
                  
              <div className="space-y-1 p-3 rounded-lg bg-background/60 border border-border">
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
                
              <div className="p-3 rounded-lg bg-background/60 border border-border">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active Workflow</span>
                    <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${filteredNodes.filter(n => n.data.status === 'active').length > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-foreground font-medium">{filteredNodes.filter(n => n.data.status === 'active').length} active</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {filteredNodes.filter(n => n.type === 'task' && n.data.status === 'completed').length} of {filteredNodes.filter(n => n.type === 'task').length} tasks completed
                  </div>
                    </div>
            </div>
                  
                  {selectedNode && (
              <div className="mt-4 p-3 sm:p-4 bg-primary/10 rounded border border-primary/20">
                <div className="text-xs sm:text-sm font-medium text-primary mb-1">Selected: {selectedNode.data.title}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                        Type: {selectedNode.type} | Status: {selectedNode.data.status}
                        {selectedNode.data.progress !== undefined && ` | Progress: ${selectedNode.data.progress}%`}
                      </div>
                      {selectedNode.type === 'project' && (
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Connected: {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} elements
                        </div>
                      )}
                    </div>
                  )}
                
            <div className="mt-4 text-xs sm:text-sm text-muted-foreground italic">
                  ✨ Enhanced drag-and-drop workflow with real-time status synchronization
                </div>
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
