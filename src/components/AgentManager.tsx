import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  MessageSquare,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  BarChart3,
  Zap,
  Activity
} from 'lucide-react';
import { agentManager } from '@/lib/agent-manager';
import { AIAgent, AgentRole, AIModel } from '@/types/nexus';
import { toast } from '@/hooks/use-toast';

interface AgentManagerProps {
  onAgentSelect?: (agent: AIAgent) => void;
  selectedAgentId?: string;
}

const AGENT_ROLES: { value: AgentRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'aurora',
    label: 'Aurora',
    description: 'Executive Assistant',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    value: 'vega',
    label: 'Vega',
    description: 'Sales Representative',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    value: 'luma',
    label: 'Luma',
    description: 'Customer Support',
    icon: <Users className="w-4 h-4" />
  },
  {
    value: 'orion',
    label: 'Orion',
    description: 'Marketing Strategist',
    icon: <Zap className="w-4 h-4" />
  },
  {
    value: 'titan',
    label: 'Titan',
    description: 'Operations Manager',
    icon: <BarChart3 className="w-4 h-4" />
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Custom Agent',
    icon: <Bot className="w-4 h-4" />
  }
];

const MODEL_OPTIONS: { value: string; label: string; provider: string }[] = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'gemini' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'gemini' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'claude' },
  { value: 'gpt-4o', label: 'GPT-4o', provider: 'gpt4' },
  { value: 'mistral-large', label: 'Mistral Large', provider: 'mistral' }
];

export default function AgentManager({ onAgentSelect, selectedAgentId }: AgentManagerProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Form state for creating/editing agents
  const [formData, setFormData] = useState({
    name: '',
    role: 'custom' as AgentRole,
    description: '',
    systemPrompt: '',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 2000
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const allAgents = await agentManager.getAllAgents();
      setAgents(allAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    try {
      const model: AIModel = {
        provider: MODEL_OPTIONS.find(m => m.value === formData.model)?.provider as any || 'gemini',
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens
      };

      const newAgent = await agentManager.createAgent({
        name: formData.name,
        role: formData.role,
        description: formData.description,
        systemPrompt: formData.systemPrompt,
        model
      });

      setAgents(prev => [newAgent, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: `Agent "${newAgent.name}" created successfully`
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

    try {
      const model: AIModel = {
        provider: MODEL_OPTIONS.find(m => m.value === formData.model)?.provider as any || 'gemini',
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens
      };

      const updatedAgent = await agentManager.updateAgent(editingAgent.id, {
        name: formData.name,
        role: formData.role,
        description: formData.description,
        systemPrompt: formData.systemPrompt,
        model
      });

      if (updatedAgent) {
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
        setIsEditDialogOpen(false);
        setEditingAgent(null);
        resetForm();
        
        toast({
          title: "Success",
          description: `Agent "${updatedAgent.name}" updated successfully`
        });
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error",
        description: "Failed to update agent",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const success = await agentManager.deleteAgent(agentId);
      if (success) {
        setAgents(prev => prev.filter(a => a.id !== agentId));
        toast({
          title: "Success",
          description: "Agent deleted successfully"
        });
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive"
      });
    }
  };

  const handleToggleAgentStatus = async (agent: AIAgent) => {
    try {
      const newStatus = agent.status === 'active' ? 'inactive' : 'active';
      const updatedAgent = await agentManager.updateAgent(agent.id, { status: newStatus });
      
      if (updatedAgent) {
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
        toast({
          title: "Success",
          description: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`
        });
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive"
      });
    }
  };

  const handleEditAgent = (agent: AIAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      role: agent.role,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      model: agent.model.model,
      temperature: agent.model.temperature,
      maxTokens: agent.model.maxTokens
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'custom',
      description: '',
      systemPrompt: '',
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 2000
    });
  };

  const createCoreAgents = async () => {
    try {
      setLoading(true);
      const coreAgents = await agentManager.createCoreAgents();
      setAgents(prev => [...coreAgents, ...prev]);
      
      toast({
        title: "Success",
        description: "Core business agents created successfully"
      });
    } catch (error) {
      console.error('Error creating core agents:', error);
      toast({
        title: "Error",
        description: "Failed to create core agents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'training': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleInfo = (role: AgentRole) => {
    return AGENT_ROLES.find(r => r.value === role) || AGENT_ROLES[5]; // Default to custom
  };

  const filteredAgents = agents.filter(agent => {
    if (activeTab === 'active') return agent.status === 'active';
    if (activeTab === 'inactive') return agent.status === 'inactive';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Agents</h2>
          <p className="text-muted-foreground">Manage your AI business agents</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createCoreAgents} variant="outline">
            <Bot className="w-4 h-4 mr-2" />
            Create Core Agents
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
              </DialogHeader>
              <AgentForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateAgent}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({agents.filter(a => a.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({agents.filter(a => a.status === 'inactive').length})</TabsTrigger>
          <TabsTrigger value="all">All ({agents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === 'active' 
                    ? "You don't have any active agents yet. Create your first agent to get started."
                    : "No agents match the current filter."}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => {
                const roleInfo = getRoleInfo(agent.role);
                return (
                  <Card 
                    key={agent.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedAgentId === agent.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onAgentSelect?.(agent)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {roleInfo.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <CardDescription>{roleInfo.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                          <Badge variant="secondary">{agent.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{agent.metrics.totalInteractions}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>{agent.metrics.successfulTasks}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {agent.model.provider}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAgentStatus(agent);
                          }}
                        >
                          {agent.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAgent(agent);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <AgentForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateAgent}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Agent Form Component
interface AgentFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function AgentForm({ formData, setFormData, onSubmit, onCancel }: AgentFormProps) {
  const roleInfo = AGENT_ROLES.find(r => r.value === formData.role);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Agent name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENT_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex items-center gap-2">
                    {role.icon}
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this agent does"
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium">System Prompt</label>
        <Textarea
          value={formData.systemPrompt}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          placeholder={roleInfo?.description ? `Default prompt for ${roleInfo.label}: ${roleInfo.description}` : "Define the agent's behavior and personality"}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Model</label>
          <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Temperature</label>
          <Input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Tokens</label>
          <Input
            type="number"
            min="100"
            max="4000"
            step="100"
            value={formData.maxTokens}
            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {formData.name ? 'Update Agent' : 'Create Agent'}
        </Button>
      </div>
    </div>
  );
}
