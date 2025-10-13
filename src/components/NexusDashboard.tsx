import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Info
} from 'lucide-react';

import AgentManager from './AgentManager';
import WorkflowBuilder from './WorkflowBuilder';
import { AIAgent, Workflow as WorkflowType, APIConnector } from '@/types/nexus';
import { agentManager } from '@/lib/agent-manager';

interface NexusDashboardProps {
  className?: string;
}

export default function NexusDashboard({ className }: NexusDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [connectors, setConnectors] = useState<APIConnector[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);

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

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'agents',
      label: 'Active Agents',
      icon: <Bot className="w-4 h-4" />,
      badge: agents.filter(a => a.status === 'active').length
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <Workflow className="w-4 h-4" />,
      badge: workflows.length
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Plug className="w-4 h-4" />,
      badge: connectors.length
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <Activity className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      badge: null
    }
  ];

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
    // Mock recent activity - in real app, this would come from the database
    return [
      {
        id: '1',
        type: 'agent_created',
        message: 'Aurora agent was created',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        icon: <Bot className="w-4 h-4" />
      },
      {
        id: '2',
        type: 'workflow_executed',
        message: 'Lead qualification workflow completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        icon: <Workflow className="w-4 h-4" />
      },
      {
        id: '3',
        type: 'integration_connected',
        message: 'Slack integration connected',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: <Plug className="w-4 h-4" />
      },
      {
        id: '4',
        type: 'agent_interaction',
        message: 'Vega processed 5 new leads',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        icon: <Mail className="w-4 h-4" />
      }
    ];
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nexus AI Business Suite</h1>
          <p className="text-muted-foreground">
            Your autonomous AI business platform powered by Gemini
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Quick Search
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.badge !== null && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {agents.length - metrics.activeAgents} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalInteractions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  -5% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get started with your AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
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
                  className="h-auto p-4 flex flex-col items-start gap-2"
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
                  className="h-auto p-4 flex flex-col items-start gap-2"
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
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
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
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          <AgentManager 
            onAgentSelect={setSelectedAgent}
            selectedAgentId={selectedAgent?.id}
          />
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <WorkflowBuilder />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Template Library</h3>
            <p className="text-muted-foreground mb-4">
              Pre-built workflow templates for common business processes
            </p>
            <Button>Browse Templates</Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="text-center py-12">
            <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Connect your favorite business tools and services
            </p>
            <Button>Connect Service</Button>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-muted-foreground mb-4">
              Detailed insights into your AI agents' performance
            </p>
            <Button>Generate Report</Button>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground mb-4">
              Configure your Nexus AI platform preferences
            </p>
            <Button>Open Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
