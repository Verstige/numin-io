import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamMemberList } from "./TeamMemberAvatar";
import { type TeamMember } from "@/lib/collaboration";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  onClick: () => void;
  isActive?: boolean;
  teamMembers?: TeamMember[];
}

export default function ProjectCard({ 
  name, 
  description, 
  status, 
  priority, 
  onClick,
  isActive = false,
  teamMembers = []
}: ProjectCardProps) {
  const priorityColors = {
    low: "bg-muted text-muted-foreground border-muted",
    medium: "bg-secondary text-secondary-foreground border-border",
    high: "gradient-primary text-white border-transparent"
  };

  const statusColors = {
    "Planning": "text-blue-400",
    "Active": "text-green-400", 
    "Completed": "text-gray-400",
    "On Hold": "text-yellow-400"
  };

  return (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-glass bg-card bg-chatgpt-card hover-lift ${
        isActive 
          ? "border-primary shadow-primary/20 ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
        <Badge className={`${priorityColors[priority]} transition-colors`}>
          {priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${statusColors[status as keyof typeof statusColors] || "text-muted-foreground"}`}>
          {status}
        </span>
        <div className="flex items-center gap-2">
          {teamMembers.length > 0 ? (
            <TeamMemberList 
              members={teamMembers} 
              maxVisible={3}
              size="sm"
              onAddMember={() => {
                // Handle add member
                console.log('Add member to project:', name);
              }}
            />
          ) : (
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
