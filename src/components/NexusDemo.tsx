import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Workflow, 
  Database, 
  Zap, 
  Brain, 
  Shield,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  BarChart3,
  Play,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Activity
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface DemoMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export default function NexusDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps: DemoStep[] = [
    {
      id: 'agents',
      title: 'AI Agents Created',
      description: 'Aurora, Vega, Luma, Orion, and Titan are now active',
      icon: <Bot className="w-5 h-5" />,
      completed: false,
      active: true
    },
    {
      id: 'workflows',
      title: 'Workflows Built',
      description: 'Lead qualification and customer onboarding automations',
      icon: <Workflow className="w-5 h-5" />,
      completed: false,
      active: false
    },
    {
      id: 'integrations',
      title: 'Integrations Connected',
      description: 'Slack, HubSpot, Gmail, and Calendar APIs linked',
      icon: <Zap className="w-5 h-5" />,
      completed: false,
      active: false
    },
    {
      id: 'memory',
      title: 'Knowledge Base Populated',
      description: 'RAG system trained on business documents and processes',
      icon: <Database className="w-5 h-5" />,
      completed: false,
      active: false
    },
    {
      id: 'analytics',
      title: 'Analytics Active',
      description: 'Real-time performance monitoring and insights',
      icon: <BarChart3 className="w-5 h-5" />,
      completed: false,
      active: false
    }
  ];

  const metrics: DemoMetric[] = [
    {
      label: 'Agents Active',
      value: '5',
      change: '+100%',
      trend: 'up',
      icon: <Bot className="w-4 h-4" />
    },
    {
      label: 'Workflows Running',
      value: '12',
      change: '+300%',
      trend: 'up',
      icon: <Workflow className="w-4 h-4" />
    },
    {
      label: 'API Calls/Hour',
      value: '2.4K',
      change: '+150%',
      trend: 'up',
      icon: <Zap className="w-4 h-4" />
    },
    {
      label: 'Success Rate',
      value: '94.2%',
      change: '+8.1%',
      trend: 'up',
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  const agentExamples = [
    {
      name: 'Aurora',
      role: 'Executive Assistant',
      status: 'Active',
      activity: 'Scheduled 3 meetings, sent 12 emails',
      icon: <Calendar className="w-4 h-4" />,
      color: 'blue'
    },
    {
      name: 'Vega',
      role: 'Sales Representative',
      status: 'Active',
      activity: 'Qualified 8 leads, updated CRM',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'green'
    },
    {
      name: 'Luma',
      role: 'Customer Support',
      status: 'Active',
      activity: 'Resolved 15 tickets, 98% satisfaction',
      icon: <Users className="w-4 h-4" />,
      color: 'purple'
    },
    {
      name: 'Orion',
      role: 'Marketing Strategist',
      status: 'Active',
      activity: 'Launched 2 campaigns, 45% engagement',
      icon: <Target className="w-4 h-4" />,
      color: 'orange'
    },
    {
      name: 'Titan',
      role: 'Operations Manager',
      status: 'Active',
      activity: 'Generated 5 reports, identified 3 optimizations',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'indigo'
    }
  ];

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsRunning(false);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    if (progress > 0 && progress % 20 === 0) {
      const stepIndex = Math.floor(progress / 20);
      if (stepIndex < demoSteps.length) {
        setCurrentStep(stepIndex);
      }
    }
  }, [progress]);

  const startDemo = () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentStep(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Processing': return 'bg-yellow-500';
      case 'Idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Nexus AI Business Suite</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the power of autonomous AI agents working together to transform your business operations
        </p>
        
        {!isRunning && progress === 0 && (
          <Button onClick={startDemo} size="lg" className="mt-6">
            <Play className="w-5 h-5 mr-2" />
            Start Live Demo
          </Button>
        )}
      </div>

      {/* Demo Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Setting Up Your AI Business Suite
            </CardTitle>
            <CardDescription>
              Watch as we configure your autonomous AI agents and business automations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="space-y-3">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === currentStep
                      ? 'bg-primary/10 border border-primary/20'
                      : index < currentStep
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index === currentStep && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Complete */}
      {!isRunning && progress === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">Demo Complete!</h2>
                <p className="text-green-600">Your AI business suite is now fully operational</p>
              </div>
              <Button onClick={() => window.location.href = '/nexus'} size="lg">
                Access Your Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Metrics */}
      {(isRunning || progress === 100) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {metric.icon}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm text-green-600">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Agent Status */}
      {(isRunning || progress === 100) && (
        <Card>
          <CardHeader>
            <CardTitle>AI Agents Status</CardTitle>
            <CardDescription>
              Real-time status of your autonomous business agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentExamples.map((agent, index) => (
                <Card key={agent.name} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${agent.color}-100 flex items-center justify-center`}>
                          {agent.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                        <Badge variant="secondary">{agent.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{agent.activity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              Autonomous Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Five specialized AI agents working 24/7 to handle your business operations with minimal supervision.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-green-500" />
              Visual Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Drag-and-drop workflow builder for creating complex business automations without coding.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              RAG Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced knowledge retrieval system that learns from your business data and documents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              API Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Connect with 50+ business tools including CRM, email, calendar, and marketing platforms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Persistent Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Agents remember conversations, learn from interactions, and maintain context across sessions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Enterprise Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Multi-tenant architecture with role-based access control and comprehensive audit logging.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of businesses already using Nexus AI to automate their operations and scale their growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/nexus'}>
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
