import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  FileText, 
  CheckSquare, 
  Users,
  Activity,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "mindmap" | "notes" | "tasks" | "team";

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
  // Notification counts
  taskNotifications?: number;
  teamNotifications?: number;
}

const tabConfig = [
  {
    id: "mindmap" as WorkspaceTab,
    label: "Mindmap",
    icon: Network,
    description: "Project overview"
  },
  {
    id: "notes" as WorkspaceTab,
    label: "Notes",
    icon: FileText,
    description: "Project notes",
    badge: "Built-in"
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
  taskNotifications = 0,
  teamNotifications = 0
}: WorkspaceTabsProps) {
  const canAccessTab = (tab: typeof tabConfig[0]) => {
    if (tab.requiresRole) {
      return tab.requiresRole.includes(userRole as "owner" | "admin");
    }
    return true;
  };

  const availableTabs = tabConfig.filter(tab => canAccessTab(tab));

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as WorkspaceTab)} className="w-full">
        <TabsList className={cn(
          "grid w-full mb-6",
          availableTabs.length === 2 && "grid-cols-2",
          availableTabs.length === 3 && "grid-cols-3", 
          availableTabs.length === 4 && "grid-cols-4"
        )}>
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-3 px-4 relative",
                  "hover:bg-secondary/50 transition-colors",
                  isActive && "bg-primary text-primary-foreground shadow-md"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {tab.badge}
                    </Badge>
                  )}
                  {tab.id === "tasks" && taskNotifications > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      {taskNotifications}
                    </Badge>
                  )}
                  {tab.id === "team" && teamNotifications > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      {teamNotifications}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{tab.description}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="mindmap" className="mt-0">
          {mindmapContent}
        </TabsContent>

        <TabsContent value="notes" className="mt-0">
          {notesContent}
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          {tasksContent}
        </TabsContent>

        <TabsContent value="team" className="mt-0">
          {teamContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}
