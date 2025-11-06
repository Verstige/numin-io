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
  Timer,
  UserPlus,
  Mail,
  Calendar,
  CalendarDays,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "mindmap" | "notes" | "tasks" | "team" | "timer" | "crm" | "email" | "calendar" | "bookings" | "projects";

interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  userRole?: "owner" | "admin" | "member" | "viewer";
  teamId?: string;
  className?: string;
  // Props for different tab contents
  mindmapContent: React.ReactNode;
  notesContent: React.ReactNode;
  tasksContent: React.ReactNode;
  teamContent: React.ReactNode;
  timerContent: React.ReactNode;
  crmContent: React.ReactNode;
  emailContent: React.ReactNode;
  calendarContent: React.ReactNode;
  bookingsContent: React.ReactNode;
  projectsContent?: React.ReactNode;
  // Notification counts
  taskNotifications?: number;
  teamNotifications?: number;
  timerNotifications?: number;
  crmNotifications?: number;
  emailNotifications?: number;
  calendarNotifications?: number;
  bookingsNotifications?: number;
  // Email composition trigger
  onComposeEmail?: (to: string, subject?: string, content?: string) => void;
}

const tabConfig = [
  {
    id: "projects" as WorkspaceTab,
    label: "Projects",
    icon: LayoutGrid,
    description: "Project management with Kanban & Table views"
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
    id: "crm" as WorkspaceTab,
    label: "Connect",
    icon: UserPlus,
    description: "Customer relationship management"
  },
  {
    id: "email" as WorkspaceTab,
    label: "Email",
    icon: Mail,
    description: "Email management & Gmail integration"
  },
  {
    id: "calendar" as WorkspaceTab,
    label: "Calendar",
    icon: Calendar,
    description: "Workspace calendar & scheduling"
  },
  {
    id: "bookings" as WorkspaceTab,
    label: "Bookings",
    icon: CalendarDays,
    description: "Appointment booking management"
  },
  {
    id: "timer" as WorkspaceTab,
    label: "Timer",
    icon: Timer,
    description: "Time tracking"
  },
  {
    id: "team" as WorkspaceTab,
    label: "Team",
    icon: Users,
    description: "Team management",
    requiresRole: ["owner", "admin"] as const
  }
];

export default function WorkspaceTabs({
  activeTab,
  onTabChange,
  userRole = "member",
  teamId,
  className,
  mindmapContent,
  notesContent,
  tasksContent,
  teamContent,
  timerContent,
  crmContent,
  emailContent,
  calendarContent,
  bookingsContent,
  projectsContent,
  taskNotifications = 0,
  teamNotifications = 0,
  timerNotifications = 0,
  crmNotifications = 0,
  emailNotifications = 0,
  calendarNotifications = 0,
  bookingsNotifications = 0
}: WorkspaceTabsProps) {
  const canAccessTab = (tab: typeof tabConfig[0]) => {
    if (tab.requiresRole) {
      return tab.requiresRole.includes(userRole as "owner" | "admin");
    }
    return true;
  };

  const availableTabs = tabConfig.filter(tab => canAccessTab(tab) && tab.id !== "mindmap");

  const handleTabClick = (tabId: WorkspaceTab) => {
    onTabChange(tabId);
  };

  const getNotificationCount = (tabId: WorkspaceTab) => {
    switch (tabId) {
      case "tasks": return taskNotifications;
      case "team": return teamNotifications;
      case "timer": return timerNotifications;
      case "crm": return crmNotifications;
      case "email": return emailNotifications;
      case "calendar": return calendarNotifications;
      case "bookings": return bookingsNotifications;
      default: return 0;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Centered ProjectMap Button */}
      <div className="w-full mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center justify-center px-2 sm:px-0">
          <button
            onClick={() => handleTabClick("mindmap")}
            className={cn(
              "relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300",
              "hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
              "min-w-[140px] sm:min-w-[180px] justify-center group touch-manipulation",
              "active:scale-95",
              activeTab === "mindmap"
                ? "bg-background shadow-lg border border-border text-foreground scale-105" 
                : "text-muted-foreground hover:text-foreground hover:scale-102 bg-muted/20 border border-border/50"
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Network className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 transition-colors", 
                activeTab === "mindmap" ? "text-primary" : "group-hover:text-primary"
              )} />
              <span className="font-semibold text-sm sm:text-base">Business Map</span>
            </div>
            {activeTab === "mindmap" && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-1.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Custom Horizontal Tab Navigation */}
      <div className="w-full mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center justify-center px-2 sm:px-4 lg:px-0">
          <div className="flex items-center gap-1 bg-muted/30 p-1 sm:p-1.5 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm overflow-x-auto scrollbar-hide w-fit min-w-0">
            {availableTabs.length > 0 ? availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const notificationCount = getNotificationCount(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "relative flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-300",
                    "hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "min-w-[90px] sm:min-w-[110px] justify-center group flex-shrink-0 touch-manipulation",
                    "active:scale-95",
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
            }) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <span className="text-sm">No tabs available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tab Description */}
        <div className="text-center mt-3 sm:mt-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-xs sm:text-sm font-medium text-primary">
              {activeTab === "mindmap" 
                ? "Business ecosystem overview" 
                : availableTabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Content with Smooth Transitions */}
      <div className="w-full min-h-[700px] sm:min-h-[400px] lg:min-h-[600px] mb-6">
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
          
          {activeTab === "crm" && (
            <div className="animate-fade-in">
              {crmContent}
            </div>
          )}
          
          {activeTab === "email" && (
            <div className="animate-fade-in">
              {emailContent}
            </div>
          )}
          
          {activeTab === "calendar" && (
            <div className="animate-fade-in">
              {calendarContent}
            </div>
          )}
          
          {activeTab === "bookings" && (
            <div className="animate-fade-in">
              {bookingsContent}
            </div>
          )}
          
          {activeTab === "projects" && (
            <div className="animate-fade-in h-full">
              {projectsContent}
            </div>
          )}
          
        </div>
      </div>

    </div>
  );
}