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
  MiniMap,
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
  UserGroup,
  Plus,
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
  Eye,
  EyeOff,
  MessageSquare,
  Bell,
  Share2,
  MoreHorizontal
} from 'lucide-react';

// Custom Node Components
const ProjectNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[200px] max-w-[250px] ${
    selected ? 'border-blue-500' : 'border-gray-300'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-2">
      <Target className="w-4 h-4 text-blue-500" />
      <div className="font-bold text-sm text-gray-800">{data.title}</div>
      <Badge className={`text-xs ${
        data.status === 'active' ? 'bg-green-100 text-green-800' :
        data.status === 'completed' ? 'bg-blue-100 text-blue-800' :
        data.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {data.status}
      </Badge>
    </div>
    
    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
      {data.description}
    </div>
    
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>Progress</span>
        <span>{data.progress}%</span>
      </div>
      <Progress value={data.progress} className="h-1" />
    </div>
    
    <div className="flex items-center justify-between mt-2">
      <Badge variant="outline" className="text-xs">
        {data.category}
      </Badge>
      {data.team && data.team.length > 0 && (
        <div className="flex -space-x-1">
          {data.team.slice(0, 3).map((member: any, idx: number) => (
            <div key={idx} className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white text-xs flex items-center justify-center">
              {member.name?.charAt(0) || '?'}
            </div>
          ))}
          {data.team.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-gray-400 border-2 border-white text-xs flex items-center justify-center text-white">
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
  <div className={`px-3 py-2 shadow-md rounded-lg bg-white border-2 min-w-[160px] ${
    selected ? 'border-green-500' : 'border-gray-300'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <CheckSquare className="w-4 h-4 text-green-500" />
      <div className="font-semibold text-sm text-gray-800">{data.title}</div>
      <div className={`w-2 h-2 rounded-full ${
        data.priority === 'critical' ? 'bg-red-500' :
        data.priority === 'high' ? 'bg-orange-500' :
        data.priority === 'medium' ? 'bg-yellow-500' :
        'bg-gray-400'
      }`} />
    </div>
    
    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
      {data.description}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs">
        {data.status}
      </Badge>
      {data.deadline && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(data.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const MilestoneNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-white border-2 min-w-[160px] ${
    selected ? 'border-purple-500' : 'border-gray-300'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <Flag className="w-4 h-4 text-purple-500" />
      <div className="font-semibold text-sm text-gray-800">{data.title}</div>
      {data.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
    </div>
    
    <div className="text-xs text-gray-600 mb-2">
      {data.description}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge className={`text-xs ${
        data.completed ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {data.completed ? 'Completed' : 'Pending'}
      </Badge>
      {data.deadline && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(data.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const ResourceNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-white border-2 min-w-[160px] ${
    selected ? 'border-orange-500' : 'border-gray-300'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <Users className="w-4 h-4 text-orange-500" />
      <div className="font-semibold text-sm text-gray-800">{data.title}</div>
      <div className={`w-2 h-2 rounded-full ${
        data.available ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </div>
    
    <div className="text-xs text-gray-600 mb-2">
      {data.role}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs">
        {data.skills?.join(', ')}
      </Badge>
      <div className="text-xs text-gray-500">
        {data.workload || 0}% busy
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

const TeamNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-3 py-2 shadow-md rounded-lg bg-white border-2 min-w-[160px] ${
    selected ? 'border-indigo-500' : 'border-gray-300'
  }`}>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="flex items-center gap-2 mb-1">
      <UserGroup className="w-4 h-4 text-indigo-500" />
      <div className="font-semibold text-sm text-gray-800">{data.title}</div>
    </div>
    
    <div className="text-xs text-gray-600 mb-2">
      {data.department}
    </div>
    
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-xs">
        {data.members?.length || 0} members
      </Badge>
      <div className="text-xs text-gray-500">
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
    icon: <UserGroup className="w-4 h-4" />,
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
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Initialize with existing projects
  useEffect(() => {
    if (projects.length > 0) {
      const initialNodes: Node[] = projects.map((project, index) => ({
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
          progress: Math.floor(Math.random() * 100),
          team: [],
          tags: []
        }
      }));
      
      setNodes(initialNodes);
    }
  }, [projects]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
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

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes(nds => nds.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
    ));
  }, [setNodes]);

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
    // Simple grid layout for now - can be enhanced with D3 or other layout algorithms
    const layoutedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: 100 + (index % 4) * 250,
        y: 100 + Math.floor(index / 4) * 200
      }
    }));
    
    return { nodes: layoutedNodes, edges };
  }, []);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
  }, [nodes, edges, getLayoutedElements, setNodes]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Project Map</h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-9"
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
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h3>
          <div className="space-y-2">
            {PROJECT_NODE_TEMPLATES.map((template) => (
              <div
                key={template.type}
                className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => addNode(template.type)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${template.color}-100 flex items-center justify-center`}>
                    {template.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{template.label}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button onClick={onLayout} variant="outline" className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            Auto Layout
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
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
          attributionPosition="bottom-left"
        >
          <Controls />
          {showMiniMap && <MiniMap />}
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {/* View Mode Toggle */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            onClick={() => setViewMode('overview')}
          >
            Overview
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'resources' ? 'default' : 'outline'}
            onClick={() => setViewMode('resources')}
          >
            Resources
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMiniMap(!showMiniMap)}
          >
            {showMiniMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">Project Overview</div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span>{filteredNodes.length} projects</span>
            <span>{edges.length} connections</span>
            <span>{filteredNodes.filter(n => n.data.status === 'active').length} active</span>
          </div>
        </div>
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
