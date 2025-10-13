import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckSquare, 
  Flag, 
  Users, 
  UserGroup,
  TrendingUp,
  Calendar,
  DollarSign,
  Zap,
  Eye,
  MousePointer,
  GitBranch,
  Clock,
  Activity,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'pending';
  demo?: boolean;
}

export default function ProjectMapDemo() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const features: DemoFeature[] = [
    {
      id: 'drag-drop',
      title: 'Drag & Drop Creation',
      description: 'Create projects, tasks, and milestones by dragging from the palette',
      icon: <MousePointer className="w-5 h-5" />,
      status: 'completed',
      demo: true
    },
    {
      id: 'node-types',
      title: 'Multiple Node Types',
      description: 'Projects, tasks, milestones, resources, and teams with custom styling',
      icon: <GitBranch className="w-5 h-5" />,
      status: 'completed',
      demo: true
    },
    {
      id: 'connections',
      title: 'Smart Connections',
      description: 'Link elements with dependency, collaboration, and timeline relationships',
      icon: <Zap className="w-5 h-5" />,
      status: 'completed',
      demo: true
    },
    {
      id: 'real-time',
      title: 'Real-time Updates',
      description: 'Live collaboration with team members and instant synchronization',
      icon: <Activity className="w-5 h-5" />,
      status: 'in-progress',
      demo: false
    },
    {
      id: 'analytics',
      title: 'Project Analytics',
      description: 'Visual insights into project health, resource utilization, and progress',
      icon: <TrendingUp className="w-5 h-5" />,
      status: 'pending',
      demo: false
    }
  ];

  const demoStats = {
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalTasks: 47,
    completedTasks: 23,
    teamUtilization: 78,
    avgProjectDuration: 14,
    budgetUtilization: 65
  };

  const projectExamples = [
    {
      id: '1',
      type: 'project',
      title: 'Website Redesign',
      status: 'active',
      progress: 65,
      team: ['John', 'Sarah', 'Mike'],
      deadline: '2024-02-15',
      priority: 'high'
    },
    {
      id: '2',
      type: 'task',
      title: 'Create Wireframes',
      status: 'completed',
      progress: 100,
      assignee: 'Sarah',
      deadline: '2024-01-20',
      priority: 'critical'
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Design Approval',
      status: 'pending',
      progress: 0,
      deadline: '2024-01-25',
      dependencies: ['Create Wireframes']
    },
    {
      id: '4',
      type: 'resource',
      title: 'Sarah Chen',
      role: 'UI/UX Designer',
      available: true,
      workload: 85,
      skills: ['Figma', 'Sketch', 'Prototyping']
    },
    {
      id: '5',
      type: 'team',
      title: 'Design Team',
      department: 'Creative',
      members: 4,
      projects: 3
    }
  ];

  useEffect(() => {
    if (isDemoRunning) {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            setIsDemoRunning(false);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isDemoRunning]);

  useEffect(() => {
    if (demoProgress > 0 && demoProgress % 20 === 0) {
      const featureIndex = Math.floor(demoProgress / 20);
      if (featureIndex < features.length) {
        setCurrentFeature(featureIndex);
      }
    }
  }, [demoProgress]);

  const startDemo = () => {
    setIsDemoRunning(true);
    setDemoProgress(0);
    setCurrentFeature(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Enhanced Project Map</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the next-generation project management with drag-and-drop visual workflows powered by React Flow
        </p>
        
        {!isDemoRunning && demoProgress === 0 && (
          <Button onClick={startDemo} size="lg" className="mt-6">
            <Play className="w-5 h-5 mr-2" />
            Start Interactive Demo
          </Button>
        )}
      </div>

      {/* Demo Progress */}
      {isDemoRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Exploring Enhanced Project Map Features
            </CardTitle>
            <CardDescription>
              Watch as we demonstrate the powerful drag-and-drop project management capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Demo Progress</span>
                <span>{Math.round(demoProgress)}%</span>
              </div>
              <Progress value={demoProgress} className="h-2" />
            </div>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === currentFeature
                      ? 'bg-primary/10 border border-primary/20'
                      : index < currentFeature
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentFeature
                      ? 'bg-green-500 text-white'
                      : index === currentFeature
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index < currentFeature ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      feature.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  {index === currentFeature && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                  {feature.demo && (
                    <Badge variant="outline" className="text-xs">
                      Live Demo
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Complete */}
      {!isDemoRunning && demoProgress === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                <CheckSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">Demo Complete!</h2>
                <p className="text-green-600">Your enhanced project map is ready for production use</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={startDemo} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Replay Demo
                </Button>
                <Button onClick={() => window.location.href = '/workspace'} className="bg-green-600 hover:bg-green-700">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Try It Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Stats */}
      {(isDemoRunning || demoProgress === 100) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{demoStats.totalProjects}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{demoStats.totalTasks}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Activity className="w-3 h-3 text-blue-500" />
                <span className="text-sm text-blue-600">{demoStats.completedTasks} completed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                  <p className="text-2xl font-bold">{demoStats.teamUtilization}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-sm text-green-600">Optimal range</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget Used</p>
                  <p className="text-2xl font-bold">{demoStats.budgetUtilization}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-3 h-3 text-yellow-500" />
                <span className="text-sm text-yellow-600">On track</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Examples */}
      {(isDemoRunning || demoProgress === 100) && (
        <Card>
          <CardHeader>
            <CardTitle>Live Project Examples</CardTitle>
            <CardDescription>
              Real project elements you can create and manage with the enhanced map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectExamples.map((project) => (
                <Card key={project.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          {project.type === 'project' && <Target className="w-5 h-5 text-blue-600" />}
                          {project.type === 'task' && <CheckSquare className="w-5 h-5 text-green-600" />}
                          {project.type === 'milestone' && <Flag className="w-5 h-5 text-purple-600" />}
                          {project.type === 'resource' && <Users className="w-5 h-5 text-orange-600" />}
                          {project.type === 'team' && <UserGroup className="w-5 h-5 text-indigo-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{project.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                        <Badge variant="secondary">{project.status}</Badge>
                      </div>
                    </div>
                    
                    {project.progress !== undefined && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                    )}
                    
                    {project.deadline && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-blue-500" />
              Drag & Drop Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Intuitive drag-and-drop creation of projects, tasks, and milestones with visual feedback and smooth animations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-green-500" />
              Smart Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create meaningful relationships between project elements with dependency tracking and visual connection lines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              Multiple Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Switch between overview, timeline, resource, and kanban views to see your projects from different perspectives.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              Real-time Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Work together with your team in real-time with live updates, comments, and shared project spaces.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Advanced Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get insights into project health, team performance, resource utilization, and budget tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Auto Layout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Intelligent auto-arrangement of project elements with customizable layout algorithms for optimal visualization.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Project Management?</h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience the power of visual project management with drag-and-drop simplicity and enterprise-grade functionality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/workspace'}>
              <ArrowRight className="w-5 h-5 mr-2" />
              Launch Enhanced Map
            </Button>
            <Button size="lg" variant="outline">
              <Sparkles className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
