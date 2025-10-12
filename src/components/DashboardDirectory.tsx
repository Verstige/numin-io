import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  Target, 
  Users, 
  Clock, 
  FileText, 
  BarChart3, 
  Zap,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface DashboardDirectoryProps {
  onSelectTab: (tab: string) => void;
  onClose: () => void;
}

const DashboardDirectory: React.FC<DashboardDirectoryProps> = ({ onSelectTab, onClose }) => {
  const quickActions = [
    {
      id: "mindmap",
      title: "Brand Map",
      description: "Visualize your brand ecosystem",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      id: "nova",
      title: "Nova AI",
      description: "Your intelligent business assistant",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      id: "tasks",
      title: "Tasks",
      description: "Manage your project tasks",
      icon: FileText,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      id: "team",
      title: "Team",
      description: "Collaborate with your team",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      id: "timer",
      title: "Time Tracker",
      description: "Track your productivity",
      icon: Clock,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View performance insights",
      icon: BarChart3,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Dashboard Directory</CardTitle>
                <CardDescription>Choose your workspace destination</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="ghost"
                  className={`h-auto p-4 ${action.bgColor} ${action.borderColor} border-2 hover:scale-105 transition-all duration-200 animate-in slide-in-from-bottom-4 fade-in-0`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => onSelectTab(action.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-3 w-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Pro Tip</h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Use the Brand Map to visualize your business ecosystem, then leverage Nova AI for strategic insights and task management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardDirectory;
