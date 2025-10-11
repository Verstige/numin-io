import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  FileText, 
  CheckSquare, 
  Users,
  Activity,
  Bell,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "mindmap" | "notes" | "tasks" | "team" | "timer";

interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  userRole?: "owner" | "admin" | "member" | "viewer";
  className?: string;
  // Props for different tab contents
  mindmapContent: React.ReactNode;
  notesContent: React.ReactNode;
  tasksContent: React.ReactNode;
  teamContent: React.ReactNode;
  timerContent: React.ReactNode;
  // Notification counts
  taskNotifications?: number;
  teamNotifications?: number;
  timerNotifications?: number;
}

const tabConfig = [
  {
    id: "mindmap" as WorkspaceTab,
    label: "ProjectMap",
    icon: Network,
    description: "Project ecosystem overview"
  },
  {
    id: "notes" as WorkspaceTab,
    label: "Notes",
    icon: FileText,
    description: "Project notes"
  },
  {
    id: "tasks" as WorkspaceTab,
    label: "Tasks",
    icon: CheckSquare,
    description: "Viewable tasks"
  },
  {
    id: "team" as WorkspaceTab,
    label: "Team",
    icon: Users,
    description: "Team management",
    requiresRole: ["owner", "admin"] as const
  },
  {
    id: "timer" as WorkspaceTab,
    label: "Timer",
    icon: Timer,
    description: "Time tracking"
  }
];

export default function WorkspaceTabs({
  activeTab,
  onTabChange,
  userRole = "member",
  className,
  mindmapContent,
  notesContent,
  tasksContent,
  teamContent,
  timerContent,
  taskNotifications = 0,
  teamNotifications = 0,
  timerNotifications = 0
}: WorkspaceTabsProps) {
  const canAccessTab = (tab: typeof tabConfig[0]) => {
    if (tab.requiresRole) {
      return tab.requiresRole.includes(userRole as "owner" | "admin");
    }
    return true;
  };

  const availableTabs = tabConfig.filter(tab => canAccessTab(tab));

  const handleTabClick = (tabId: WorkspaceTab) => {
    onTabChange(tabId);
  };

  const getNotificationCount = (tabId: WorkspaceTab) => {
    switch (tabId) {
      case "tasks": return taskNotifications;
      case "team": return teamNotifications;
      case "timer": return timerNotifications;
      default: return 0;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Custom Horizontal Tab Navigation */}
      <div className="w-full mb-6 sm:mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 bg-muted/30 p-1 sm:p-1.5 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm overflow-x-auto scrollbar-hide">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const notificationCount = getNotificationCount(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300",
                    "hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "min-w-[100px] sm:min-w-[120px] justify-center group flex-shrink-0",
                    isActive 
                      ? "bg-background shadow-md border border-border text-foreground scale-105" 
                      : "text-muted-foreground hover:text-foreground hover:scale-102"
                  )}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Icon className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 transition-colors", 
                      isActive ? "text-primary" : "group-hover:text-primary"
                    )} />
                    <span className="font-medium text-xs sm:text-sm">{tab.label}</span>
                    {tab.badge && (
                      <Badge 
                        variant={isActive ? "default" : "secondary"} 
                        className="text-xs px-1 sm:px-1.5 py-0.5"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                    {notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="text-xs px-1 sm:px-1.5 py-0.5 animate-pulse"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Tab Description */}
        <div className="text-center mt-3 sm:mt-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-xs sm:text-sm font-medium text-primary">
              {availableTabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Content with Smooth Transitions */}
      <div className="w-full min-h-[400px] sm:min-h-[600px]">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          "opacity-100 transform translate-y-0"
        )}>
          {activeTab === "mindmap" && (
            <div className="animate-fade-in">
              {mindmapContent}
            </div>
          )}
          
          {activeTab === "notes" && (
            <div className="animate-fade-in">
              {notesContent}
            </div>
          )}
          
          {activeTab === "tasks" && (
            <div className="animate-fade-in">
              {tasksContent}
            </div>
          )}
          
          {activeTab === "team" && (
            <div className="animate-fade-in">
              {teamContent}
            </div>
          )}
          
          {activeTab === "timer" && (
            <div className="animate-fade-in">
              {timerContent}
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex items-center justify-center mt-6">
        <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-full">
          <span className="text-xs text-muted-foreground px-2">Quick Jump:</span>
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={`quick-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  "hover:bg-background/50 focus:outline-none",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}