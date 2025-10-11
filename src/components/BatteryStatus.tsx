import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Battery, 
  BatteryFull, 
  BatteryLow, 
  BatteryMedium, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Shield,
  Zap,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Info,
  Star,
  Rocket,
  Brain,
  Timer,
  FileText,
  CheckSquare,
  Network,
  Layers,
  Eye,
  Edit3,
  Trash2,
  Plus
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: "excellent" | "good" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
}

interface FeatureStatus {
  name: string;
  description: string;
  status: "active" | "beta" | "development" | "planned";
  health: "excellent" | "good" | "warning" | "critical";
  usage: number;
  lastUpdated: Date;
  icon: React.ComponentType<any>;
  dependencies?: string[];
}

interface ProjectHealth {
  projectId: string;
  projectName: string;
  completion: number;
  health: "excellent" | "good" | "warning" | "critical";
  lastActivity: Date;
  teamMembers: number;
  tasks: {
    total: number;
    completed: number;
    overdue: number;
  };
  timeLogged: number;
}

interface BatteryStatusProps {
  userId: string;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    teamMembers: string[];
  }>;
  onRefresh?: () => void;
}

const BatteryStatus: React.FC<BatteryStatusProps> = ({ 
  userId, 
  projects, 
  onRefresh 
}) => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [featureStatuses, setFeatureStatuses] = useState<FeatureStatus[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealth[]>([]);
  const [overallBattery, setOverallBattery] = useState(85);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userId, projects]);

  const loadSystemData = async () => {
    setIsRefreshing(true);
    
    // Simulate loading system metrics
    const metrics: SystemMetric[] = [
      {
        name: "CPU Usage",
        value: Math.floor(Math.random() * 30) + 20,
        max: 100,
        unit: "%",
        status: "good",
        trend: "stable",
        icon: Cpu
      },
      {
        name: "Memory",
        value: Math.floor(Math.random() * 40) + 40,
        max: 100,
        unit: "%",
        status: "good",
        trend: "up",
        icon: Database
      },
      {
        name: "Storage",
        value: Math.floor(Math.random() * 20) + 15,
        max: 100,
        unit: "%",
        status: "excellent",
        trend: "stable",
        icon: HardDrive
      },
      {
        name: "Network",
        value: Math.floor(Math.random() * 10) + 85,
        max: 100,
        unit: "%",
        status: "excellent",
        trend: "up",
        icon: Wifi
      }
    ];

    // Load feature statuses
    const features: FeatureStatus[] = [
      {
        name: "Interactive Mindmap",
        description: "Visual project ecosystem with zoom and pan",
        status: "active",
        health: "excellent",
        usage: 95,
        lastUpdated: new Date(),
        icon: Network,
        dependencies: ["SVG Rendering", "React Components"]
      },
      {
        name: "Time Tracking",
        description: "Clockify-style project time management",
        status: "active",
        health: "excellent",
        usage: 88,
        lastUpdated: new Date(),
        icon: Timer,
        dependencies: ["LocalStorage", "Project Integration"]
      },
      {
        name: "Project Hierarchy",
        description: "3-level project organization system",
        status: "active",
        health: "excellent",
        usage: 92,
        lastUpdated: new Date(),
        icon: Layers,
        dependencies: ["Dynamic State", "Mindmap Integration"]
      },
      {
        name: "Team Collaboration",
        description: "Real-time team management and activity feeds",
        status: "active",
        health: "good",
        usage: 76,
        lastUpdated: new Date(),
        icon: Users,
        dependencies: ["Activity Feed", "Team Management"]
      },
      {
        name: "Task Management",
        description: "Built-in notes and viewable tasks",
        status: "active",
        health: "good",
        usage: 82,
        lastUpdated: new Date(),
        icon: CheckSquare,
        dependencies: ["Task CRUD", "Project Integration"]
      },
      {
        name: "Landing Page",
        description: "Modern marketing page with animations",
        status: "active",
        health: "excellent",
        usage: 90,
        lastUpdated: new Date(),
        icon: Rocket,
        dependencies: ["React Animations", "Responsive Design"]
      },
      {
        name: "Advanced Analytics",
        description: "Project performance and time analytics",
        status: "development",
        health: "warning",
        usage: 45,
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: BarChart3,
        dependencies: ["Chart Libraries", "Data Visualization"]
      },
      {
        name: "AI Project Assistant",
        description: "Intelligent project recommendations",
        status: "planned",
        health: "warning",
        usage: 0,
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        icon: Brain,
        dependencies: ["AI Integration", "ML Models"]
      }
    ];

    // Load project health data
    const projectHealthData: ProjectHealth[] = projects.map(project => {
      const completion = project.progress || Math.floor(Math.random() * 40) + 30;
      const health: "excellent" | "good" | "warning" | "critical" = 
        completion >= 80 ? "excellent" : 
        completion >= 60 ? "good" : 
        completion >= 40 ? "warning" : "critical";
      
      return {
        projectId: project.id,
        projectName: project.name,
        completion,
        health,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        teamMembers: project.teamMembers?.length || 1,
        tasks: {
          total: 0,
          completed: 0,
          overdue: 0
        },
        timeLogged: Math.floor(Math.random() * 200) + 50 // hours
      };
    });

    setSystemMetrics(metrics);
    setFeatureStatuses(features);
    setProjectHealth(projectHealthData);
    
    // Calculate overall battery
    const avgFeatureHealth = features.reduce((sum, feature) => {
      const healthValue = feature.health === "excellent" ? 100 : 
                         feature.health === "good" ? 75 : 
                         feature.health === "warning" ? 50 : 25;
      return sum + (healthValue * feature.usage / 100);
    }, 0) / features.length;
    
    setOverallBattery(Math.round(avgFeatureHealth));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-500";
      case "good": return "text-blue-500";
      case "warning": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return CheckCircle;
      case "good": return CheckCircle;
      case "warning": return AlertTriangle;
      case "critical": return XCircle;
      default: return Info;
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level >= 80) return BatteryFull;
    if (level >= 60) return BatteryMedium;
    if (level >= 30) return BatteryLow;
    return Battery;
  };

  const getBatteryColor = (level: number) => {
    if (level >= 80) return "text-green-500";
    if (level >= 60) return "text-yellow-500";
    if (level >= 30) return "text-orange-500";
    return "text-red-500";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const BatteryIcon = getBatteryIcon(overallBattery);
  const batteryColor = getBatteryColor(overallBattery);

  return (
    <div className="w-full space-y-6">
      {/* Overall Battery Status */}
      <Card className="border-border shadow-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BatteryIcon className={`w-6 h-6 ${batteryColor}`} />
              System Battery
            </CardTitle>
            <Button
              onClick={loadSystemData}
              size="sm"
              variant="outline"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${batteryColor}`}>
                {overallBattery}%
              </div>
              <div className="text-sm text-muted-foreground">
                Overall Health
              </div>
            </div>
            <div className="flex-1">
              <Progress value={overallBattery} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Critical</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((metric, index) => {
              const MetricIcon = metric.icon;
              const TrendIcon = metric.trend === "up" ? TrendingUp : 
                               metric.trend === "down" ? TrendingDown : Activity;
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MetricIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <TrendIcon className={`w-3 h-3 ${
                      metric.trend === "up" ? "text-green-500" : 
                      metric.trend === "down" ? "text-red-500" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {metric.value}{metric.unit}
                  </div>
                  <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                  <Badge 
                    variant="secondary" 
                    className={`mt-2 text-xs ${getStatusColor(metric.status)}`}
                  >
                    {metric.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Feature Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {featureStatuses.map((feature, index) => {
              const FeatureIcon = feature.icon;
              const StatusIcon = getStatusIcon(feature.health);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FeatureIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(feature.health)}`} />
                        <Badge 
                          variant={feature.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {feature.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {feature.usage}% usage
                      </div>
                    </div>
                    <div className="w-20">
                      <Progress value={feature.usage} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projectHealth.map((project, index) => {
              const StatusIcon = getStatusIcon(project.health);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(project.health)}`} />
                      <div>
                        <h4 className="font-medium">{project.projectName}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Last activity: {formatDate(project.lastActivity)}</div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {project.teamMembers} members
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" />
                              {project.tasks.total > 0 ? `${project.tasks.completed}/${project.tasks.total} tasks` : 'No tasks yet'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {project.timeLogged}h logged
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">{project.completion}%</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(project.health)}`}
                      >
                        {project.health}
                      </Badge>
                    </div>
                    <div className="w-20">
                      <Progress value={project.completion} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6" />
              <span>Refresh All Data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>Generate Report</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Settings className="w-6 h-6" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatteryStatus;
