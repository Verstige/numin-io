import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Activity,
  Zap,
  FileText,
  Calendar,
  Mail,
  Target,
  TrendingUp,
  Bell
} from 'lucide-react';
import { 
  sendMessageToAgent, 
  getAgent, 
  getAgentOperations, 
  getAgentWorkloadStatus,
  type AIAgent,
  type AgentOperation,
  type AgentResponse
} from '@/lib/ai-agent-service';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  operation?: AgentOperation;
  response?: AgentResponse;
}

interface RealAIAgentChatProps {
  agentId: string;
  agentName?: string;
  onClose?: () => void;
}

export default function RealAIAgentChat({ agentId, agentName, onClose }: RealAIAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [agentOperations, setAgentOperations] = useState<AgentOperation[]>([]);
  const [workloadStatus, setWorkloadStatus] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize agent and load data
  useEffect(() => {
    const agentData = getAgent(agentId);
    setAgent(agentData);
    
    if (agentData) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        role: 'agent',
        content: `Hello! I'm ${agentData.name}, your ${agentData.role}. I can help you with: ${agentData.capabilities.join(', ')}. What would you like me to do?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
    
    loadAgentData();
  }, [agentId]);

  // Load agent operations and status
  const loadAgentData = () => {
    const operations = getAgentOperations(agentId);
    const status = getAgentWorkloadStatus();
    setAgentOperations(operations);
    setWorkloadStatus(status);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message to agent
  const handleSend = async () => {
    if (!input.trim() || isLoading || !agent) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to agent and get response
      const response = await sendMessageToAgent(agentId, input);
      
      let responseContent = '';
      
      if (response.success) {
        if (response.data?.type === 'clarification_needed') {
          responseContent = `🤔 **${agent?.name}** needs clarification:\n\n${response.message}\n\n**Suggestions:**\n${response.data.suggestions?.map((s: string) => `• ${s}`).join('\n')}`;
        } else {
          responseContent = `✅ **${agent?.name}** completed: ${response.message}`;
        }
      } else {
        responseContent = `❌ **${agent?.name}** error: ${response.message}`;
      }

      const agentMessage: Message = {
        id: `agent_${Date.now()}`,
        role: 'agent',
        content: responseContent,
        timestamp: new Date(),
        response: response
      };

      setMessages(prev => [...prev, agentMessage]);
      
      // Reload agent data to show updated status
      loadAgentData();
      
    } catch (error) {
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'agent',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  if (!agent) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Agent Not Found</h3>
            <p className="text-muted-foreground">The requested agent could not be found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Agent Header */}
      <Card>
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
            <div className="flex items-center gap-2">
              <Badge 
                variant={agent.status === 'active' ? 'default' : 
                        agent.status === 'busy' ? 'secondary' : 'outline'}
              >
                {agent.status}
              </Badge>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ✕
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Workload:</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${agent.workload}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{agent.workload}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Current Task:</span>
              <p className="font-medium">{agent.currentTask || 'Idle'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat with {agent.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-64 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.response?.data && (
                      <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(message.response.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Operations */}
      {agentOperations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Recent Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {agentOperations.slice(-5).reverse().map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center gap-3 p-2 rounded-lg border"
                  >
                    {getOperationIcon(operation.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {operation.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {operation.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    {getStatusIcon(operation.status)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${agent.name} to perform an action...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Try: "Create task: Review project proposal" or "Add note: Meeting notes from today"
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Import MessageSquare icon
import { MessageSquare } from 'lucide-react';
