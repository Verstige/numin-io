import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  completedProjects: number;
  storageUsed: number;
  storageLimit: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "pending";
  lastActive: Date;
  projects: number;
}

interface SystemLog {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error";
  message: string;
  user?: string;
  action?: string;
}

const mockStats: AdminStats = {
  totalUsers: 24,
  activeUsers: 18,
  totalProjects: 12,
  completedProjects: 8,
  storageUsed: 2.3,
  storageLimit: 10
};

const mockUsers: User[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    role: "owner",
    status: "active",
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    projects: 5
  },
  {
    id: "u2",
    name: "Mike Rodriguez",
    email: "mike@company.com",
    role: "admin",
    status: "active",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    projects: 3
  },
  {
    id: "u3",
    name: "Emily Johnson",
    email: "emily@company.com",
    role: "member",
    status: "active",
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    projects: 2
  },
  {
    id: "u4",
    name: "David Park",
    email: "david@company.com",
    role: "member",
    status: "pending",
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    projects: 0
  }
];

const mockLogs: SystemLog[] = [
  {
    id: "l1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    level: "info",
    message: "User Sarah Chen created new project 'VitaTech'",
    user: "Sarah Chen",
    action: "project_created"
  },
  {
    id: "l2",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    level: "warning",
    message: "High storage usage detected for project 'Velocity'",
    action: "storage_warning"
  },
  {
    id: "l3",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    level: "info",
    message: "User Mike Rodriguez updated project settings",
    user: "Mike Rodriguez",
    action: "settings_updated"
  },
  {
    id: "l4",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    level: "error",
    message: "Failed to backup project data",
    action: "backup_failed"
  }
];

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats>(mockStats);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [logs, setLogs] = useState<SystemLog[]>(mockLogs);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExportData = () => {
    const data = { stats, users, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "inactive": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-red-500";
      case "warning": return "text-yellow-500";
      case "info": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">Manage your workspace settings and monitor system activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this month
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% this week
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3 this month
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedProjects}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {Math.round((stats.completedProjects / stats.totalProjects) * 100)}% completion
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Used Storage</span>
              <span className="text-sm font-medium">{stats.storageUsed}GB / {stats.storageLimit}GB</span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(storagePercentage)}% used</span>
              <span>{stats.storageLimit - stats.storageUsed}GB remaining</span>
            </div>
            {storagePercentage > 80 && (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Storage usage is high. Consider upgrading your plan.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(user.status))} />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{user.role}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {user.projects} projects
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Last active: {formatDate(user.lastActive)}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={cn("w-2 h-2 rounded-full mt-2", {
                      "bg-red-500": log.level === "error",
                      "bg-yellow-500": log.level === "warning",
                      "bg-blue-500": log.level === "info"
                    })} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-sm font-medium", getLevelColor(log.level))}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </span>
                        {log.user && (
                          <Badge variant="outline" className="text-xs">
                            {log.user}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.action && (
                        <span className="text-xs text-muted-foreground">Action: {log.action}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Workspace Name</label>
                  <Input defaultValue="Rena Workspace" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Default User Role</label>
                  <Input defaultValue="member" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Storage Limit (GB)</label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-backup" defaultChecked />
                  <label htmlFor="auto-backup" className="text-sm">Enable automatic backups</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="email-notifications" defaultChecked />
                  <label htmlFor="email-notifications" className="text-sm">Send email notifications</label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
