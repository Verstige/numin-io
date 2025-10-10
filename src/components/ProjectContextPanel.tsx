import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Target, Clock, TrendingUp } from "lucide-react";
import { TeamMemberList } from "./TeamMemberAvatar";
import { type TeamMember } from "@/lib/collaboration";

interface ProjectContextPanelProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
  };
  teamMembers?: TeamMember[];
}

export default function ProjectContextPanel({ project, teamMembers = [] }: ProjectContextPanelProps) {
  // Mock data - in real app this would come from props or API
  const mockStats = {
    tasksCompleted: 12,
    tasksTotal: 18,
    teamMembers: 3,
    daysUntilDeadline: 15,
    weeklyProgress: 75
  };

  const progressPercentage = (mockStats.tasksCompleted / mockStats.tasksTotal) * 100;

  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-secondary text-secondary-foreground", 
    high: "gradient-primary text-white"
  };

  const statusColors = {
    "Planning": "text-blue-400",
    "Active": "text-green-400",
    "Completed": "text-gray-400",
    "On Hold": "text-yellow-400"
  };

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <Card className="p-4 bg-chatgpt-card border-border">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-card-foreground">{project.name}</h3>
          <div className="flex gap-2">
            <Badge className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
            <Badge variant="outline" className={`border-current ${statusColors[project.status as keyof typeof statusColors] || "text-muted-foreground"}`}>
              {project.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
          </div>
          <div className="space-y-1">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm font-semibold text-card-foreground">
              {mockStats.tasksCompleted}/{mockStats.tasksTotal} tasks
            </p>
          </div>
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Team</span>
          </div>
          {teamMembers && teamMembers.length > 0 ? (
            <TeamMemberList 
              members={teamMembers} 
              maxVisible={3}
              size="sm"
              onAddMember={() => {
                console.log('Add member to project:', project.name);
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+</span>
              </div>
              <span className="text-xs text-muted-foreground">No members</span>
            </div>
          )}
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Deadline</span>
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {mockStats.daysUntilDeadline} days
          </p>
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Velocity</span>
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {mockStats.weeklyProgress}%
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 bg-chatgpt-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-card-foreground">Recent Activity</span>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            • Task "Design mockups" completed 2 hours ago
          </div>
          <div className="text-xs text-muted-foreground">
            • New team member joined yesterday
          </div>
          <div className="text-xs text-muted-foreground">
            • Project status updated to Active
          </div>
        </div>
      </Card>
    </div>
  );
}
