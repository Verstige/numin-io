import React, { useState, useCallback, useMemo } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Settings,
  Bot,
  Zap,
  GitBranch,
  Code,
  MousePointer,
  Clock,
  Merge,
  Split,
  Webhook,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowNodeType,
  WorkflowExecution 
} from '@/types/nexus';

// Custom Node Components
const AgentActionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-blue-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4 text-blue-500" />
      <div className="font-bold text-sm">Agent Action</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const APICallNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-green-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-green-500" />
      <div className="font-bold text-sm">API Call</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-yellow-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <GitBranch className="w-4 h-4 text-yellow-500" />
      <div className="font-bold text-sm">Condition</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const FunctionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-purple-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Code className="w-4 h-4 text-purple-500" />
      <div className="font-bold text-sm">Function</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-orange-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Webhook className="w-4 h-4 text-orange-500" />
      <div className="font-bold text-sm">Trigger</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const EndNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-red-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-red-500" />
      <div className="font-bold text-sm">End</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const DelayNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-indigo-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-indigo-500" />
      <div className="font-bold text-sm">Delay</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const MergeNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-teal-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Merge className="w-4 h-4 text-teal-500" />
      <div className="font-bold text-sm">Merge</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const SplitNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
    selected ? 'border-pink-500' : 'border-gray-300'
  }`}>
    <div className="flex items-center gap-2">
      <Split className="w-4 h-4 text-pink-500" />
      <div className="font-bold text-sm">Split</div>
    </div>
    <div className="text-xs text-gray-500 mt-1">{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  'agent-action': AgentActionNode,
  'api-call': APICallNode,
  'condition': ConditionNode,
  'function': FunctionNode,
  'trigger': TriggerNode,
  'end': EndNode,
  'delay': DelayNode,
  'merge': MergeNode,
  'split': SplitNode,
};

const NODE_TEMPLATES = [
  {
    type: 'trigger' as WorkflowNodeType,
    label: 'Webhook Trigger',
    description: 'Starts workflow on webhook call',
    icon: <Webhook className="w-4 h-4" />,
    color: 'orange'
  },
  {
    type: 'agent-action' as WorkflowNodeType,
    label: 'Agent Action',
    description: 'Execute agent task',
    icon: <Bot className="w-4 h-4" />,
    color: 'blue'
  },
  {
    type: 'api-call' as WorkflowNodeType,
    label: 'API Call',
    description: 'Call external API',
    icon: <Zap className="w-4 h-4" />,
    color: 'green'
  },
  {
    type: 'condition' as WorkflowNodeType,
    label: 'Condition',
    description: 'If/else logic',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'yellow'
  },
  {
    type: 'function' as WorkflowNodeType,
    label: 'Function',
    description: 'Custom JavaScript code',
    icon: <Code className="w-4 h-4" />,
    color: 'purple'
  },
  {
    type: 'delay' as WorkflowNodeType,
    label: 'Delay',
    description: 'Wait for specified time',
    icon: <Clock className="w-4 h-4" />,
    color: 'indigo'
  },
  {
    type: 'merge' as WorkflowNodeType,
    label: 'Merge',
    description: 'Combine multiple inputs',
    icon: <Merge className="w-4 h-4" />,
    color: 'teal'
  },
  {
    type: 'split' as WorkflowNodeType,
    label: 'Split',
    description: 'Split into multiple paths',
    icon: <Split className="w-4 h-4" />,
    color: 'pink'
  },
  {
    type: 'end' as WorkflowNodeType,
    label: 'End',
    description: 'End workflow',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'red'
  }
];

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onExecute?: (workflowId: string) => void;
}

function WorkflowBuilderContent({ workflow, onSave, onExecute }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.nodes?.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.edges?.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default',
    })) || []
  );
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState(workflow?.name || 'Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || '');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(
    (nodeType: WorkflowNodeType) => {
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: nodeType,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label: NODE_TEMPLATES.find(t => t.type === nodeType)?.label || 'Node',
          ...NODE_TEMPLATES.find(t => t.type === nodeType)
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsNodeConfigOpen(true);
  }, []);

  const saveWorkflow = useCallback(() => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    const newWorkflow: Workflow = {
      id: workflow?.id || `workflow_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as WorkflowNodeType,
        position: node.position,
        data: node.data,
        config: node.data.config || {}
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type as any,
      })),
      triggers: [],
      status: 'draft',
      createdAt: workflow?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // TODO: Get from auth context
      executions: []
    };

    onSave?.(newWorkflow);
  }, [workflowName, workflowDescription, nodes, edges, workflow, onSave]);

  const executeWorkflow = useCallback(() => {
    if (workflow?.id) {
      onExecute?.(workflow.id);
    }
  }, [workflow?.id, onExecute]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Workflow Builder</h2>
          <div className="mt-2 space-y-2">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name"
            />
            <Textarea
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Description"
              rows={2}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={saveWorkflow} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={executeWorkflow} size="sm" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>

        {/* Node Templates */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Nodes</h3>
          <div className="space-y-2">
            {NODE_TEMPLATES.map((template) => (
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

        {/* Node Configuration */}
        {selectedNode && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Configure Node</h3>
            <div className="space-y-2">
              <Input
                value={selectedNode.data.label}
                onChange={(e) => {
                  setSelectedNode({
                    ...selectedNode,
                    data: { ...selectedNode.data, label: e.target.value }
                  });
                  setNodes(nds => nds.map(n => 
                    n.id === selectedNode.id 
                      ? { ...n, data: { ...n.data, label: e.target.value } }
                      : n
                  ));
                }}
                placeholder="Node label"
              />
              <Textarea
                value={selectedNode.data.description || ''}
                onChange={(e) => {
                  setSelectedNode({
                    ...selectedNode,
                    data: { ...selectedNode.data, description: e.target.value }
                  });
                  setNodes(nds => nds.map(n => 
                    n.id === selectedNode.id 
                      ? { ...n, data: { ...n.data, description: e.target.value } }
                      : n
                  ));
                }}
                placeholder="Node description"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
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
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
}
