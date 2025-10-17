import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Bot, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Target,
  FileText,
  Mail,
  Calendar,
  TrendingUp,
  Bell,
  Activity,
  Sparkles
} from 'lucide-react';
import { 
  sendMessageToAgent, 
  getAgent, 
  getAgentOperations,
  getAgentWorkloadStatus,
  type AgentResponse
} from '@/lib/ai-agent-service';

export default function AIAgentDemo() {
  const [demoResults, setDemoResults] = useState<Array<{
    id: string;
    agent: string;
    operation: string;
    status: 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
    timestamp: Date;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [agentOperations, setAgentOperations] = useState<any[]>([]);
  const [workloadStatus, setWorkloadStatus] = useState<any[]>([]);

  // Load agent data
  useEffect(() => {
    const loadData = () => {
      const operations = getAgentOperations('aurora');
      setAgentOperations(operations);
      
      const status = getAgentWorkloadStatus();
      setWorkloadStatus(status);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Run demo operations
  const runDemo = async () => {
    setIsRunning(true);
    setDemoResults([]);

    const demoOperations = [
      {
        agent: 'aurora',
        message: 'Create executive report: Q4 Performance Analysis',
        description: 'Aurora creates an executive business report'
      },
      {
        agent: 'aurora',
        message: 'Create task',
        description: 'Aurora asks for clarification on task details'
      },
      {
        agent: 'vega',
        message: 'Qualify lead: John Smith from TechCorp',
        description: 'Vega qualifies a new sales lead'
      },
      {
        agent: 'luma',
        message: 'Create support ticket: Login issue for customer',
        description: 'Luma creates a customer support ticket'
      },
      {
        agent: 'titan',
        message: 'Optimize workflow: Customer onboarding process',
        description: 'Titan optimizes business workflow'
      },
      {
        agent: 'orion',
        message: 'Create marketing campaign: Holiday Sale 2024',
        description: 'Orion creates a marketing campaign'
      }
    ];

    for (let i = 0; i < demoOperations.length; i++) {
      const op = demoOperations[i];
      
      // Add running status
      const resultId = `demo_${Date.now()}_${i}`;
      const runningResult = {
        id: resultId,
        agent: op.agent,
        operation: op.description,
        status: 'running' as const,
        timestamp: new Date()
      };
      
      setDemoResults(prev => [...prev, runningResult]);

      try {
        // Send message to agent
        const response = await sendMessageToAgent(op.agent, op.message);
        
        // Update with result
        setDemoResults(prev => prev.map(r => 
          r.id === resultId 
            ? {
                ...r,
                status: response.success ? 'completed' : 'failed',
                result: response.data,
                error: response.success ? undefined : response.message
              }
            : r
        ));

        // Wait a bit between operations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        setDemoResults(prev => prev.map(r => 
          r.id === resultId 
            ? {
                ...r,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : r
        ));
      }
    }

    setIsRunning(false);
  };

  // Send custom message
  const sendCustomMessage = async () => {
    if (!customMessage.trim()) return;

    const agent = 'aurora'; // Default to Aurora for custom messages
    
    const resultId = `custom_${Date.now()}`;
    const runningResult = {
      id: resultId,
      agent,
      operation: `Custom: ${customMessage}`,
      status: 'running' as const,
      timestamp: new Date()
    };
    
    setDemoResults(prev => [...prev, runningResult]);

    try {
      const response = await sendMessageToAgent(agent, customMessage);
      
      setDemoResults(prev => prev.map(r => 
        r.id === resultId 
          ? {
              ...r,
              status: response.success ? 'completed' : 'failed',
              result: response.data,
              error: response.success ? undefined : response.message
            }
          : r
      ));
      
    } catch (error) {
      setDemoResults(prev => prev.map(r => 
        r.id === resultId 
          ? {
              ...r,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : r
      ));
    }

    setCustomMessage('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOperationIcon = (agent: string) => {
    switch (agent) {
      case 'aurora': return <Target className="w-4 h-4" />;
      case 'vega': return <Mail className="w-4 h-4" />;
      case 'luma': return <FileText className="w-4 h-4" />;
      case 'orion': return <TrendingUp className="w-4 h-4" />;
      case 'titan': return <Calendar className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          Real AI Agent Operations Demo
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Watch the AI agents perform real operations in your workspace. 
          They can create tasks, read emails, add notes, schedule meetings, and analyze data.
        </p>
      </div>

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agent Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {workloadStatus.map((agent) => (
              <div key={agent.agentId} className="text-center p-3 border rounded-lg">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-medium">{agent.name}</h4>
                <Badge 
                  variant={agent.status === 'active' ? 'default' : 
                          agent.status === 'busy' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {agent.status}
                </Badge>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${agent.workload}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{agent.workload}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={runDemo}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Demo...' : 'Run Full Demo'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Try: 'Create task: Review project proposal' or 'Add note: Meeting notes'"
              className="flex-1"
            />
            <Button
              onClick={sendCustomMessage}
              disabled={!customMessage.trim()}
              variant="outline"
            >
              Send to Aurora
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Operation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {demoResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No operations yet. Run the demo to see AI agents in action!
                </div>
              ) : (
                demoResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getOperationIcon(result.agent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">
                          {result.agent}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Agent
                        </Badge>
                        {getStatusIcon(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.operation}
                      </p>
                      {result.result && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        </div>
                      )}
                      {result.error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          Error: {result.error}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      {agentOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Recent Aurora Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {agentOperations.slice(-5).reverse().map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center gap-3 p-2 border rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {getOperationIcon('aurora')}
                      <span className="font-medium">
                        {op.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-muted-foreground">
                        {op.createdAt.toLocaleTimeString()}
                      </span>
                    </div>
                    {getStatusIcon(op.status)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Real AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">Available Agents:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Aurora</strong> - Executive Assistant: Task management, scheduling, analysis</li>
                <li><strong>Vega</strong> - Sales Rep: Email analysis, customer outreach, sales tasks</li>
                <li><strong>Luma</strong> - Customer Support: Support tickets, customer communication</li>
                <li><strong>Orion</strong> - Marketing Strategist: Campaign analysis, marketing tasks</li>
                <li><strong>Titan</strong> - Operations Manager: Project management, team coordination</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Specialized Commands:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>"Aurora, create executive report: Q4 performance"</li>
                <li>"Vega, qualify lead: John Smith from TechCorp"</li>
                <li>"Luma, create support ticket: Login issue"</li>
                <li>"Orion, create marketing campaign: Holiday Sale"</li>
                <li>"Titan, optimize workflow: Customer onboarding"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Agent Specializations:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Aurora:</strong> Executive reports, business metrics, presentations</li>
                <li><strong>Vega:</strong> Lead qualification, sales proposals, pipeline tracking</li>
                <li><strong>Luma:</strong> Support tickets, customer satisfaction, knowledge base</li>
                <li><strong>Orion:</strong> Marketing campaigns, content calendar, ad optimization</li>
                <li><strong>Titan:</strong> Workflow optimization, team performance, process docs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Clarification Examples:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>"Create task" → Agent asks for task title and project</li>
                <li>"Schedule meeting" → Agent asks for time and attendees</li>
                <li>"Add note" → Agent asks for note title and content</li>
                <li>"Analyze data" → Agent asks what data to analyze</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
