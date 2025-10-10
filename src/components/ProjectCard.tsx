import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  onClick: () => void;
}

export default function ProjectCard({ 
  name, 
  description, 
  status, 
  priority, 
  onClick 
}: ProjectCardProps) {
  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-accent text-accent-foreground",
    high: "gradient-primary text-white"
  };

  return (
    <Card 
      className="p-6 cursor-pointer transition-spring hover:scale-[1.02] hover:shadow-primary glass"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{name}</h3>
        <Badge className={priorityColors[priority]}>
          {priority}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{status}</span>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
        </div>
      </div>
    </Card>
  );
}
