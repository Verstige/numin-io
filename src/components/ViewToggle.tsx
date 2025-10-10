import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  User, 
  Settings, 
  Eye,
  Lock,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "shared" | "personal" | "admin";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  userRole?: "owner" | "admin" | "member" | "viewer";
  showAdminView?: boolean;
  className?: string;
}

const viewOptions = [
  {
    id: "shared" as ViewMode,
    label: "Shared",
    description: "Team workspace view",
    icon: Users,
    color: "bg-blue-500",
    badge: "Team"
  },
  {
    id: "personal" as ViewMode,
    label: "Personal",
    description: "Your private notes",
    icon: User,
    color: "bg-green-500",
    badge: "Private"
  },
  {
    id: "admin" as ViewMode,
    label: "Admin",
    description: "Management tools",
    icon: Settings,
    color: "bg-purple-500",
    badge: "Admin",
    requiresRole: ["owner", "admin"] as const
  }
];

export default function ViewToggle({ 
  currentView, 
  onViewChange, 
  userRole = "member",
  showAdminView = false,
  className 
}: ViewToggleProps) {
  const [hoveredView, setHoveredView] = useState<ViewMode | null>(null);

  const canAccessView = (view: typeof viewOptions[0]) => {
    if (view.requiresRole) {
      return view.requiresRole.includes(userRole as "owner" | "admin");
    }
    return true;
  };

  const availableViews = viewOptions.filter(view => 
    canAccessView(view) && (view.id !== "admin" || showAdminView)
  );

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardContent className="p-4">
        <div className="flex gap-2 justify-center">
          {availableViews.map((view) => {
            const Icon = view.icon;
            const isActive = currentView === view.id;
            const isHovered = hoveredView === view.id;
            
            return (
              <Button
                key={view.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-1 h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  isActive && "shadow-lg scale-105",
                  !isActive && "hover:bg-secondary/50"
                )}
                onClick={() => onViewChange(view.id)}
                onMouseEnter={() => setHoveredView(view.id)}
                onMouseLeave={() => setHoveredView(null)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? view.color : "bg-muted",
                    isActive && "text-white"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{view.label}</span>
                      <Badge 
                        variant={isActive ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {view.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {view.description}
                    </p>
                  </div>
                </div>
                
                {/* Access indicator */}
                {view.id === "admin" && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {userRole === "owner" ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Full Access</span>
                      </>
                    ) : userRole === "admin" ? (
                      <>
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span>Admin Access</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-red-500" />
                        <span>Restricted</span>
                      </>
                    )}
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
