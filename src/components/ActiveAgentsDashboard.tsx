import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Target,
  FileText,
  Mail,
  Calendar,
  TrendingUp,
  Bell,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { 
  getAgent, 
  getAgentOperations, 
  getAgentWorkloadStatus,
  getPendingOperations,
  executeOperation,
  updateAgentStatus,
  type AIAgent,
  type AgentOperation
} from '@/lib/ai-agent-service';
import RealAIAgentChat from './RealAIAgentChat';

interface ActiveAgentsDashboardProps {
  onAgentSelect?: (agentId: string) => void;
}

export default function ActiveAgentsDashboard({ onAgentSelect }: ActiveAgentsDashboardProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agentOperations, setAgentOperations] = useState<AgentOperation[]>([]);
  const [workloadStatus, setWorkloadStatus] = useState<any[]>([]);
  const [pendingOperations, setPendingOperations] = useState<AgentOperation[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load agent data
  const loadAgentData = async () => {
    setIsRefreshing(true);
    try {
      // Import the AI_AGENTS array
      const { AI_AGENTS } = await import('@/lib/ai-agent-service');
      setAgents(AI_AGENTS);
      
      // Load operations and status for each agent
      const allOperations: AgentOperation[] = [];
      AI_AGENTS.forEach(agent => {
        const operations = getAgentOperations(agent.id);
        allOperations.push(...operations);
      });
      setAgentOperations(allOperations);
      
      const status = getAgentWorkloadStatus();
      setWorkloadStatus(status);
      
      const pending = getPendingOperations();
      setPendingOperations(pending);
      
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load data on mount and set up refresh interval
  useEffect(() => {
    loadAgentData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadAgentData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle agent selection
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(selectedAgent === agentId ? null : agentId);
    onAgentSelect?.(agentId);
  };

  // Handle operation execution
  const handleExecuteOperation = async (operationId: string) => {
    try {
      await executeOperation(operationId);
      loadAgentData(); // Refresh data after execution
    } catch (error) {
      console.error('Error executing operation:', error);
    }
  };

  // Get agent status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get operation icon
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create_task': return <Target className="w-4 h-4" />;
      case 'update_task': return <Target className="w-4 h-4" />;
      case 'add_note': return <FileText className="w-4 h-4" />;
      case 'read_email': return <Mail className="w-4 h-4" />;
      case 'schedule_meeting': return <Calendar className="w-4 h-4" />;
      case 'update_project': return <TrendingUp className="w-4 h-4" />;
      case 'analyze_data': return <TrendingUp className="w-4 h-4" />;
      case 'send_notification': return <Bell className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            Active AI Agents
          </h2>
          <p className="text-muted-foreground">
            Monitor and interact with your AI agents in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAgentData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const agentOps = agentOperations.filter(op => op.agentId === agent.id);
          const recentOps = agentOps.slice(-3).reverse();
          
          return (
            <Card 
              key={agent.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedAgent === agent.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleAgentSelect(agent.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Workload */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Workload</span>
                      <span className="font-medium">{agent.workload}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          agent.workload > 80 ? 'bg-red-500' :
                          agent.workload > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${agent.workload}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Task */}
                  <div>
                    <span className="text-sm text-muted-foreground">Current Task:</span>
                    <p className="text-sm font-medium truncate">
                      {agent.currentTask || 'Idle'}
                    </p>
                  </div>

                  {/* Recent Operations */}
                  {recentOps.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Recent Operations:</span>
                      <div className="space-y-1 mt-1">
                        {recentOps.map((op) => (
                          <div key={op.id} className="flex items-center gap-2 text-xs">
                            {getOperationIcon(op.type)}
                            <span className="truncate flex-1">
                              {op.type.replace('_', ' ')}
                            </span>
                            {getStatusIcon(op.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capabilities */}
                  <div>
                    <span className="text-sm text-muted-foreground">Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap.replace('_', ' ')}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.capabilities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Agent Chat */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Chat with {getAgent(selectedAgent)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealAIAgentChat 
              agentId={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Pending Operations */}
      {pendingOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Operations ({pendingOperations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {pendingOperations.map((operation) => {
                  const agent = getAgent(operation.agentId);
                  return (
                    <div
                      key={operation.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getOperationIcon(operation.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {operation.type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {agent?.name}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {operation.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleExecuteOperation(operation.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Execute
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {agents.filter(a => a.status === 'active' || a.status === 'busy').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {agentOperations.filter(op => op.status === 'running').length}
              </div>
              <div className="text-sm text-muted-foreground">Running Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingOperations.length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {agentOperations.filter(op => op.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}






