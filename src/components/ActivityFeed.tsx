import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TeamMemberAvatar from "./TeamMemberAvatar";
import { 
  CheckCircle, 
  Play, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Trophy,
  Plus,
  MoreHorizontal,
  Filter,
  Clock
} from "lucide-react";
import { type ActivityItem, type TeamMember } from "@/lib/collaboration";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: ActivityItem[];
  teamMembers: TeamMember[];
  projectId?: string;
  maxHeight?: string;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

export default function ActivityFeed({ 
  activities, 
  teamMembers,
  projectId,
  maxHeight = "400px",
  showFilters = false,
  onActivityClick 
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "status_changed":
        return <Play className="w-4 h-4 text-blue-500" />;
      case "member_added":
        return <Users className="w-4 h-4 text-purple-500" />;
      case "comment_added":
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      case "deadline_approaching":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "milestone_reached":
        return <Trophy className="w-4 h-4 text-orange-500" />;
      case "project_created":
        return <Plus className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return "border-l-green-500";
      case "status_changed":
        return "border-l-blue-500";
      case "member_added":
        return "border-l-purple-500";
      case "comment_added":
        return "border-l-yellow-500";
      case "deadline_approaching":
        return "border-l-red-500";
      case "milestone_reached":
        return "border-l-orange-500";
      case "project_created":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const activityTypes = [
    { value: "all", label: "All Activity", count: activities.length },
    { value: "task_completed", label: "Tasks", count: activities.filter(a => a.type === "task_completed").length },
    { value: "status_changed", label: "Status", count: activities.filter(a => a.type === "status_changed").length },
    { value: "member_added", label: "Team", count: activities.filter(a => a.type === "member_added").length },
    { value: "comment_added", label: "Comments", count: activities.filter(a => a.type === "comment_added").length },
    { value: "deadline_approaching", label: "Deadlines", count: activities.filter(a => a.type === "deadline_approaching").length },
    { value: "milestone_reached", label: "Milestones", count: activities.filter(a => a.type === "milestone_reached").length }
  ];

  const getMember = (userId: string) => {
    return teamMembers.find(member => member.id === userId);
  };

  return (
    <Card className="bg-chatgpt-card border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Activity Feed</h3>
          {projectId && (
            <Badge variant="secondary" className="text-xs">
              Project View
            </Badge>
          )}
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {activityTypes.map((type) => (
              <Button
                key={type.value}
                variant={filter === type.value ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "text-xs whitespace-nowrap",
                  filter === type.value 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setFilter(type.value)}
              >
                {type.label}
                {type.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 text-xs bg-muted text-muted-foreground"
                  >
                    {type.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <ScrollArea style={{ maxHeight }} className="flex-1 scrollbar-none">
        <div className="p-4 space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activity will appear here as team members work on projects
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const member = getMember(activity.userId);
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors hover:bg-secondary/50 cursor-pointer",
                    getActivityColor(activity.type)
                  )}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {member ? (
                      <TeamMemberAvatar member={member} size="sm" showStatus={false} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs text-white font-medium">R</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">
                            {member?.name || "Nexus"}
                          </span>
                          {" "}
                          <span className="text-muted-foreground">
                            {activity.description}
                          </span>
                        </p>
                        
                        {activity.projectName && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {activity.projectName}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getActivityIcon(activity.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

// Compact activity item for use in other components
interface ActivityItemProps {
  activity: ActivityItem;
  teamMember?: TeamMember;
  showProject?: boolean;
  onClick?: () => void;
}

export function ActivityItem({ activity, teamMember, showProject = true, onClick }: ActivityItemProps) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "status_changed":
        return <Play className="w-3 h-3 text-blue-500" />;
      case "member_added":
        return <Users className="w-3 h-3 text-purple-500" />;
      case "comment_added":
        return <MessageSquare className="w-3 h-3 text-yellow-500" />;
      case "deadline_approaching":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case "milestone_reached":
        return <Trophy className="w-3 h-3 text-orange-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div 
      className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {teamMember ? (
          <TeamMemberAvatar member={teamMember} size="sm" showStatus={false} />
        ) : (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs text-white font-medium">R</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-medium text-foreground">
            {teamMember?.name || "Nexus"}
          </span>
          {" "}{activity.description}
        </p>
        {showProject && activity.projectName && (
          <p className="text-xs text-muted-foreground/70">
            in {activity.projectName}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        {getActivityIcon(activity.type)}
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(activity.timestamp)}
        </span>
      </div>
    </div>
  );
}

