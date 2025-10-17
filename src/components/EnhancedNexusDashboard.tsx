import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Workflow, 
  FileText, 
  Plug, 
  BarChart3,
  Settings,
  Play,
  Activity,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  Zap,
  Database,
  Globe,
  Shield,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Target,
  Brain,
  Rocket,
  ArrowRight,
  Crown,
  Lightbulb,
  Gauge,
  MessageSquare,
  UserCheck,
  Megaphone,
  Wrench,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import AgentManager from './AgentManager';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowExecutionConsole from './WorkflowExecutionConsole';
import IntegratedAIAgents from './IntegratedAIAgents';
import ActiveAgentsDashboard from './ActiveAgentsDashboard';
import AIAgentDemo from './AIAgentDemo';
import AgentWorkspaceTest from './AgentWorkspaceTest';
import SupportTicketsSection from './SupportTicketsSection';
import AgentReportsSection from './AgentReportsSection';
import { AIAgent, Workflow as WorkflowType, APIConnector } from '@/types/nexus';
import { agentManager } from '@/lib/agent-manager';

interface EnhancedNexusDashboardProps {
  className?: string;
}

// AI Agent Character Components
const AuroraCharacter = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500/20 via-purple-600/30 to-purple-700/20 rounded-full flex items-center justify-center shadow-xl animate-float border border-purple-500/20">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 rounded-full animate-pulse"></div>
      
      {/* Main body */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-purple-50 rounded-full flex items-center justify-center shadow-inner">
        {/* Eyes */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-800 rounded-full animate-blink"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-800 rounded-full animate-blink" style={{ animationDelay: '0.1s' }}></div>
        
        {/* Mouth */}
        <div className="absolute top-7 w-5 h-0.5 bg-purple-800 rounded-full"></div>
        
        {/* Bow tie */}
        <div className="absolute -top-2 w-8 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
          <div className="w-3 h-3 bg-purple-700 rounded-full"></div>
        </div>
        
        {/* Professional collar */}
        <div className="absolute bottom-2 w-16 h-4 bg-white border-2 border-purple-300 rounded-t-lg shadow-sm"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -left-3 top-6 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse"></div>
      <div className="absolute -right-2 top-8 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  </div>
);

const VegaCharacter = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 via-blue-600/30 to-blue-700/20 rounded-full flex items-center justify-center shadow-xl animate-float border border-blue-500/20" style={{ animationDelay: '0.5s' }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full animate-pulse"></div>
      
      {/* Main body */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center shadow-inner">
        {/* Eyes */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-800 rounded-full animate-blink"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-800 rounded-full animate-blink" style={{ animationDelay: '0.1s' }}></div>
        
        {/* Mouth */}
        <div className="absolute top-7 w-5 h-0.5 bg-blue-800 rounded-full"></div>
        
        {/* Professional shirt */}
        <div className="absolute top-2 w-14 h-8 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg shadow-sm"></div>
        
        {/* Power tie */}
        <div className="absolute top-4 w-3 h-7 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full shadow-md"></div>
        
        {/* Success indicator */}
        <div className="absolute -right-3 top-6 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      
      {/* Floating success elements */}
      <div className="absolute -left-2 top-4 w-2 h-2 bg-green-400/40 rounded-full animate-pulse"></div>
      <div className="absolute -right-1 top-10 w-1.5 h-1.5 bg-blue-300/50 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
    </div>
  </div>
);

const LumaCharacter = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500/20 via-green-600/30 to-green-700/20 rounded-full flex items-center justify-center shadow-xl animate-float border border-green-500/20" style={{ animationDelay: '1s' }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-full animate-pulse"></div>
      
      {/* Main body */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-green-50 rounded-full flex items-center justify-center shadow-inner">
        {/* Eyes */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-green-800 rounded-full animate-blink"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-green-800 rounded-full animate-blink" style={{ animationDelay: '0.1s' }}></div>
        
        {/* Mouth */}
        <div className="absolute top-7 w-5 h-0.5 bg-green-800 rounded-full"></div>
        
        {/* Professional headset */}
        <div className="absolute -top-2 w-20 h-7 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-6 h-3 bg-gray-600 rounded-full"></div>
          <div className="absolute -left-3 w-3 h-2 bg-gray-500 rounded-full"></div>
          <div className="absolute -right-3 w-3 h-2 bg-gray-500 rounded-full"></div>
        </div>
        
        {/* Support uniform */}
        <div className="absolute bottom-2 w-16 h-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg shadow-sm"></div>
        
        {/* Help indicator */}
        <div className="absolute -right-3 top-8 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
      
      {/* Floating support elements */}
      <div className="absolute -left-2 top-6 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
      <div className="absolute -right-1 top-12 w-1.5 h-1.5 bg-green-300/50 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
    </div>
  </div>
);

const OrionCharacter = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/20 via-orange-600/30 to-orange-700/20 rounded-full flex items-center justify-center shadow-xl animate-float border border-orange-500/20" style={{ animationDelay: '1.5s' }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10 rounded-full animate-pulse"></div>
      
      {/* Main body */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-orange-50 rounded-full flex items-center justify-center shadow-inner">
        {/* Eyes */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-orange-800 rounded-full animate-blink"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-orange-800 rounded-full animate-blink" style={{ animationDelay: '0.1s' }}></div>
        
        {/* Mouth */}
        <div className="absolute top-7 w-5 h-0.5 bg-orange-800 rounded-full"></div>
        
        {/* Creative hairstyle */}
        <div className="absolute -top-3 w-16 h-5 bg-gradient-to-r from-orange-300 to-orange-400 rounded-full shadow-md flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-orange-500 rounded-full transform rotate-12"></div>
            <div className="w-1 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-1 h-3 bg-orange-500 rounded-full transform -rotate-12"></div>
          </div>
        </div>
        
        {/* Marketing jacket */}
        <div className="absolute bottom-2 w-16 h-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg shadow-sm"></div>
        
        {/* Creative sparkles */}
        <div className="absolute -right-3 top-6 w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
        
        {/* Additional sparkle */}
        <div className="absolute -left-3 top-4 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
      </div>
      
      {/* Floating creative elements */}
      <div className="absolute -left-2 top-8 w-1.5 h-1.5 bg-yellow-300/50 rounded-full animate-pulse"></div>
      <div className="absolute -right-1 top-12 w-2 h-2 bg-orange-300/40 rounded-full animate-pulse" style={{ animationDelay: '1.6s' }}></div>
    </div>
  </div>
);

const TitanCharacter = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-500/20 via-slate-600/30 to-slate-700/20 rounded-full flex items-center justify-center shadow-xl animate-float border border-slate-500/20" style={{ animationDelay: '2s' }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-slate-600/10 rounded-full animate-pulse"></div>
      
      {/* Main body */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-slate-50 rounded-full flex items-center justify-center shadow-inner">
        {/* Eyes */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-slate-800 rounded-full animate-blink"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-slate-800 rounded-full animate-blink" style={{ animationDelay: '0.1s' }}></div>
        
        {/* Mouth */}
        <div className="absolute top-7 w-5 h-0.5 bg-slate-800 rounded-full"></div>
        
        {/* Professional cap */}
        <div className="absolute -top-3 w-14 h-5 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full shadow-lg flex items-center justify-center">
          <div className="w-2 h-1 bg-slate-500 rounded-full"></div>
        </div>
        
        {/* Operations uniform */}
        <div className="absolute bottom-2 w-16 h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg shadow-sm"></div>
        
        {/* Efficiency indicator */}
        <div className="absolute -right-3 top-6 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        
        {/* Gear indicator */}
        <div className="absolute -left-3 top-8 w-2 h-2 bg-slate-400/60 rounded-full animate-pulse"></div>
      </div>
      
      {/* Floating operation elements */}
      <div className="absolute -left-2 top-10 w-1.5 h-1.5 bg-emerald-300/50 rounded-full animate-pulse"></div>
      <div className="absolute -right-1 top-14 w-2 h-2 bg-slate-300/40 rounded-full animate-pulse" style={{ animationDelay: '2.2s' }}></div>
    </div>
  </div>
);

export default function EnhancedNexusDashboard({ className }: EnhancedNexusDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [connectors, setConnectors] = useState<APIConnector[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflowExecutions, setWorkflowExecutions] = useState<Map<string, any>>(new Map());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const allAgents = await agentManager.getAllAgents();
      setAgents(allAgents);
      
      // TODO: Load workflows and connectors
      // const allWorkflows = await workflowManager.getAllWorkflows();
      // const allConnectors = await connectorManager.getAllConnectors();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'agents',
      label: 'Active Agents',
      icon: <Bot className="w-5 h-5" />,
      badge: agents.filter(a => a.status === 'active').length
    },
    {
      id: 'integrated',
      label: 'Integrated AI',
      icon: <Brain className="w-5 h-5" />,
      badge: 'New'
    },
    {
      id: 'demo',
      label: 'Live Demo',
      icon: <Play className="w-5 h-5" />,
      badge: 'Demo'
    },
    {
      id: 'test',
      label: 'Workspace Test',
      icon: <Database className="w-5 h-5" />,
      badge: 'Test'
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: <Bell className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'reports',
      label: 'Agent Reports',
      icon: <FileText className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <Workflow className="w-5 h-5" />,
      badge: workflows.length
    },
    {
      id: 'console',
      label: 'Live Console',
      icon: <Activity className="w-5 h-5" />,
      badge: workflowExecutions.size,
      highlight: workflowExecutions.size > 0
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Plug className="w-5 h-5" />,
      badge: connectors.length
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      badge: null
    }
  ];

  // Workflow execution functions
  const handleSaveWorkflow = async (workflow: WorkflowType) => {
    try {
      console.log('Saving workflow:', workflow);
      const existingIndex = workflows.findIndex(w => w.id === workflow.id);
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflow;
      } else {
        workflows.push(workflow);
      }
      setWorkflows([...workflows]);
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        alert('Workflow not found');
        return;
      }

      // Create execution context
      const executionId = `exec_${Date.now()}`;
      const execution = {
        id: executionId,
        workflowId,
        workflowName: workflow.name,
        status: 'running' as const,
        startTime: new Date(),
        currentNode: null,
        results: {},
        errors: [],
        logs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            type: 'info' as const,
            message: `Starting workflow execution: ${workflow.name}`,
            details: { workflowId, nodeCount: workflow.nodes.length }
          }
        ]
      };

      // Update executions state immediately
      setWorkflowExecutions(prev => {
        const newMap = new Map(prev);
        newMap.set(executionId, execution);
        return newMap;
      });
      
      console.log('Workflow execution started:', executionId);
      
      // Start actual workflow execution after a brief delay to ensure state is updated
      setTimeout(() => {
        executeWorkflowNodes(executionId, workflow);
      }, 100);
      
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Failed to execute workflow');
    }
  };

  const executeWorkflowNodes = async (executionId: string, workflow: any) => {
    try {
      console.log('Starting workflow execution for:', executionId);
      
      // Find trigger nodes to start execution
      const triggerNodes = workflow.nodes.filter((node: any) => node.type === 'trigger');
      
      if (triggerNodes.length === 0) {
        addExecutionLog(executionId, 'error', 'No trigger nodes found in workflow');
        updateExecutionStatus(executionId, 'failed');
        return;
      }

      // Start with first trigger node
      const startNode = triggerNodes[0];
      addExecutionLog(executionId, 'info', `Starting execution from trigger: ${startNode.data.label}`, startNode.id, startNode.type);
      
      // Execute nodes in sequence
      await executeNode(executionId, workflow, startNode);
      
    } catch (error) {
      console.error('Error in workflow execution:', error);
      addExecutionLog(executionId, 'error', `Workflow execution failed: ${error}`);
      updateExecutionStatus(executionId, 'failed');
    }
  };

  const executeNode = async (executionId: string, workflow: any, node: any) => {
    try {
      updateExecutionStatus(executionId, 'running', node.id);
      
      addExecutionLog(executionId, 'info', `Executing node: ${node.data.label}`, node.id, node.type);
      
      // Simulate node execution based on type
      let result: any = {};
      
      switch (node.type) {
        case 'trigger':
          result = await executeTrigger(executionId, node);
          break;
        case 'agent-action':
          result = await executeAgentAction(executionId, node);
          break;
        case 'api-call':
          result = await executeAPICall(executionId, node);
          break;
        case 'condition':
          result = await executeCondition(executionId, node);
          break;
        case 'delay':
          result = await executeDelay(executionId, node);
          break;
        case 'function':
          result = await executeFunction(executionId, node);
          break;
        case 'merge':
          result = await executeMerge(executionId, node);
          break;
        case 'split':
          result = await executeSplit(executionId, node);
          break;
        case 'end':
          result = await executeEnd(executionId, node);
          break;
        default:
          result = { message: `Unknown node type: ${node.type}` };
      }

      // Store node result
      setWorkflowExecutions(prev => {
        const newMap = new Map(prev);
        const execution = newMap.get(executionId);
        if (execution) {
          execution.results[node.id] = result;
          newMap.set(executionId, execution);
        }
        return newMap;
      });

      addExecutionLog(executionId, 'success', `Completed node: ${node.data.label}`, node.id, node.type, result);

      // Find and execute next nodes
      const nextNodes = getNextNodes(workflow, node);
      
      if (nextNodes.length === 0) {
        // End of workflow
        addExecutionLog(executionId, 'info', 'Workflow execution completed');
        updateExecutionStatus(executionId, 'completed');
        return;
      }

      // Execute next nodes
      for (const nextNode of nextNodes) {
        await executeNode(executionId, workflow, nextNode);
      }
      
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      addExecutionLog(executionId, 'error', `Node execution failed: ${error}`, node.id, node.type);
      updateExecutionStatus(executionId, 'failed');
    }
  };

  const getNextNodes = (workflow: any, currentNode: any) => {
    const edges = workflow.edges.filter((edge: any) => edge.source === currentNode.id);
    const nextNodeIds = edges.map((edge: any) => edge.target);
    return workflow.nodes.filter((node: any) => nextNodeIds.includes(node.id));
  };

  const executeTrigger = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    addExecutionLog(executionId, 'success', 'Trigger activated', node.id, node.type, { triggered: true });
    return { triggered: true, timestamp: new Date().toISOString() };
  };

  const executeAgentAction = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const agentName = node.data.label.split(':')[0] || 'AI Agent';
    addExecutionLog(executionId, 'info', `Agent ${agentName} processing request`, node.id, node.type, { agent: agentName });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    addExecutionLog(executionId, 'success', `${agentName} completed action`, node.id, node.type, { agent: agentName, result: 'success' });
    
    return { 
      agent: agentName, 
      action: 'completed', 
      result: 'success',
      timestamp: new Date().toISOString()
    };
  };

  const executeAPICall = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    addExecutionLog(executionId, 'info', 'Making API call', node.id, node.type);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    addExecutionLog(executionId, 'success', 'API call completed', node.id, node.type, { status: 200 });
    
    return { status: 200, response: 'API call successful', timestamp: new Date().toISOString() };
  };

  const executeCondition = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const condition = node.data.label.includes('> 50');
    const result = condition ? 'true' : 'false';
    
    addExecutionLog(executionId, 'info', `Evaluating condition: ${node.data.label}`, node.id, node.type);
    addExecutionLog(executionId, 'success', `Condition result: ${result}`, node.id, node.type, { condition, result });
    
    return { condition, result, timestamp: new Date().toISOString() };
  };

  const executeDelay = async (executionId: string, node: any) => {
    const delayMs = 2000;
    addExecutionLog(executionId, 'info', `Waiting for ${delayMs}ms`, node.id, node.type);
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    addExecutionLog(executionId, 'success', 'Delay completed', node.id, node.type);
    return { delay: delayMs, completed: true, timestamp: new Date().toISOString() };
  };

  const executeFunction = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    addExecutionLog(executionId, 'info', 'Executing function', node.id, node.type);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    addExecutionLog(executionId, 'success', 'Function executed successfully', node.id, node.type);
    
    return { function: 'executed', result: 'success', timestamp: new Date().toISOString() };
  };

  const executeMerge = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    addExecutionLog(executionId, 'info', 'Merging data streams', node.id, node.type);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    addExecutionLog(executionId, 'success', 'Data streams merged', node.id, node.type);
    
    return { merged: true, timestamp: new Date().toISOString() };
  };

  const executeSplit = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    addExecutionLog(executionId, 'info', 'Splitting data stream', node.id, node.type);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    addExecutionLog(executionId, 'success', 'Data stream split', node.id, node.type);
    
    return { split: true, timestamp: new Date().toISOString() };
  };

  const executeEnd = async (executionId: string, node: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    addExecutionLog(executionId, 'success', 'Workflow completed successfully', node.id, node.type);
    
    return { completed: true, timestamp: new Date().toISOString() };
  };

  const updateExecutionStatus = (executionId: string, status: 'running' | 'completed' | 'failed' | 'paused', currentNode?: string) => {
    setWorkflowExecutions(prev => {
      const newMap = new Map(prev);
      const execution = newMap.get(executionId);
      if (execution) {
        execution.status = status;
        if (currentNode) {
          execution.currentNode = currentNode;
        }
        if (status === 'completed' || status === 'failed') {
          execution.endTime = new Date();
        }
        newMap.set(executionId, execution);
      }
      return newMap;
    });
  };

  const addExecutionLog = (executionId: string, type: 'info' | 'success' | 'error' | 'warning', message: string, nodeId?: string, nodeType?: string, details?: any) => {
    const log = {
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      type,
      message,
      nodeId,
      nodeType,
      agentName: nodeType === 'agent-action' ? details?.agent : undefined,
      details
    };
    
    setWorkflowExecutions(prev => {
      const newMap = new Map(prev);
      const execution = newMap.get(executionId);
      if (execution) {
        execution.logs.push(log);
        newMap.set(executionId, execution);
      }
      return newMap;
    });
  };

  const clearExecutions = () => {
    setWorkflowExecutions(new Map());
  };

  const clearExecutionLogs = (executionId: string) => {
    const execution = workflowExecutions.get(executionId);
    if (execution) {
      execution.logs = [];
      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));
    }
  };

  const stopExecution = (executionId: string) => {
    const execution = workflowExecutions.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push('Execution stopped by user');
      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));
    }
  };

  const getOverviewMetrics = () => {
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalInteractions = agents.reduce((sum, agent) => sum + agent.metrics.totalInteractions, 0);
    const successRate = agents.length > 0 
      ? agents.reduce((sum, agent) => sum + agent.metrics.successfulTasks, 0) / 
        agents.reduce((sum, agent) => sum + agent.metrics.totalInteractions, 0) * 100
      : 0;
    const avgResponseTime = agents.length > 0
      ? agents.reduce((sum, agent) => sum + agent.metrics.averageResponseTime, 0) / agents.length
      : 0;

    return {
      activeAgents,
      totalInteractions,
      successRate: Math.round(successRate),
      avgResponseTime: Math.round(avgResponseTime)
    };
  };

  const getRecentActivity = () => {
    // TODO: Load actual activity from database
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const metrics = getOverviewMetrics();
  const recentActivity = getRecentActivity();

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Nexus AI</h2>
                    <p className="text-xs text-muted-foreground">Business Suite</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your autonomous AI business platform
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <Crown className="w-2 h-2 mr-1" />
                    Enterprise
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    <Brain className="w-2 h-2 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-2 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 ${sidebarCollapsed ? 'px-2' : 'px-3'} ${
                item.highlight ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`${item.highlight ? 'text-blue-500' : ''}`}>
                  {item.icon}
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => window.location.href = '/workspace'}
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            {!sidebarCollapsed && 'Back to Workspace'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setActiveTab('agents')}
          >
            <Plus className="w-4 h-4 mr-2" />
            {!sidebarCollapsed && 'Create Agent'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="p-6 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {navigationItems.find(item => item.id === activeTab)?.label || 'Nexus AI'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === 'overview' && 'Manage your AI agents, workflows, and business automation'}
                {activeTab === 'agents' && 'Create and manage your AI agents'}
                {activeTab === 'integrated' && 'Integrated AI agents working together'}
                {activeTab === 'demo' && 'Watch AI agents perform real workspace operations'}
                {activeTab === 'workflows' && 'Build and execute automated workflows'}
                {activeTab === 'console' && 'Monitor workflow executions in real-time'}
                {activeTab === 'templates' && 'Browse pre-built workflow templates'}
                {activeTab === 'integrations' && 'Connect external services and APIs'}
                {activeTab === 'reports' && 'View analytics and performance reports'}
                {activeTab === 'settings' && 'Configure your Nexus AI platform'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
            <Card className="hover:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{metrics.activeAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {agents.length - metrics.activeAgents} inactive
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Interactions</CardTitle>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{metrics.totalInteractions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{metrics.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +2% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  -5% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to get started with your AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all"
                  onClick={() => setActiveTab('agents')}
                >
                  <Bot className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Create Agent</div>
                    <div className="text-sm text-muted-foreground">Set up a new AI agent</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all"
                  onClick={() => setActiveTab('workflows')}
                >
                  <Workflow className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Build Workflow</div>
                    <div className="text-sm text-muted-foreground">Create automation workflow</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all"
                  onClick={() => setActiveTab('integrations')}
                >
                  <Plug className="w-6 h-6 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Connect API</div>
                    <div className="text-sm text-muted-foreground">Link external services</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest actions across your AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-green-500" />
                  Agent Status
                </CardTitle>
                <CardDescription>
                  Current status of your AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' : 
                          agent.status === 'inactive' ? 'bg-gray-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.metrics.totalInteractions}</p>
                        <p className="text-xs text-muted-foreground">interactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <ActiveAgentsDashboard 
            onAgentSelect={(agentId) => {
              const agent = agents.find(a => a.id === agentId);
              setSelectedAgent(agent || null);
            }}
          />
        )}

        {/* Integrated AI Tab */}
        {activeTab === 'integrated' && (
          <IntegratedAIAgents />
        )}

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <AIAgentDemo />
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <AgentWorkspaceTest />
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'support' && (
          <SupportTicketsSection />
        )}

        {/* Agent Reports Tab */}
        {activeTab === 'reports' && (
          <AgentReportsSection />
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <WorkflowBuilder 
            onSave={handleSaveWorkflow}
            onExecute={handleExecuteWorkflow}
          />
        )}

        {/* Live Console Tab */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Live Workflow Console
                </h2>
                <p className="text-muted-foreground">
                  Monitor and debug workflow executions in real-time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    // Create a simple test workflow for demonstration
                    const testWorkflow = {
                      id: `test_workflow_${Date.now()}`,
                      name: 'Test Workflow',
                      description: 'A simple test workflow',
                      nodes: [
                        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Start' }, config: {} },
                        { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Vega: Process Data' }, config: { agent: 'Vega', action: 'process' } },
                        { id: 'end-1', type: 'end', position: { x: 500, y: 100 }, data: { label: 'Complete' }, config: {} }
                      ],
                      edges: [
                        { id: 'e1-2', source: 'trigger-1', target: 'agent-1', animated: true },
                        { id: 'e2-3', source: 'agent-1', target: 'end-1', animated: true }
                      ],
                      triggers: [],
                      status: 'draft',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      createdBy: 'current-user',
                      executions: []
                    };
                    setWorkflows(prev => [...prev, testWorkflow]);
                    handleExecuteWorkflow(testWorkflow.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Create & Run Test Workflow
                </Button>
                <Button
                  onClick={clearExecutions}
                  variant="outline"
                  disabled={workflowExecutions.size === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Available Workflows Section */}
            {workflows.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Workflows</CardTitle>
                  <CardDescription>
                    Select a workflow to execute and monitor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{workflow.name}</h4>
                          <Badge variant="outline">{workflow.nodes.length} nodes</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleExecuteWorkflow(workflow.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Execute
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab('workflows')}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workflow Execution Console */}
            <WorkflowExecutionConsole
              executions={workflowExecutions}
              onClearExecutions={clearExecutions}
              onClearLogs={clearExecutionLogs}
              onStopExecution={stopExecution}
            />
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Template Library</h3>
            <p className="text-muted-foreground mb-4">
              Pre-built workflow templates for common business processes
            </p>
            <Button>Browse Templates</Button>
          </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
          <div className="text-center py-12">
            <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Connect your favorite business tools and services
            </p>
            <Button>Connect Service</Button>
          </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-muted-foreground mb-4">
              Detailed insights into your AI agents' performance
            </p>
            <Button>Generate Report</Button>
          </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground mb-4">
              Configure your Nexus AI platform preferences
            </p>
            <Button>Open Settings</Button>
          </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
