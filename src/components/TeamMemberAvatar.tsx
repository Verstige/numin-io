import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAvatarInitials, getAvatarColor, type TeamMember } from "@/lib/collaboration";
import { cn } from "@/lib/utils";

interface TeamMemberAvatarProps {
  member: TeamMember;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  showRole?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function TeamMemberAvatar({ 
  member, 
  size = "md", 
  showStatus = true, 
  showRole = false,
  onClick,
  className 
}: TeamMemberAvatarProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6 text-xs";
      case "lg":
        return "w-12 h-12 text-base";
      default:
        return "w-8 h-8 text-sm";
    }
  };

  const getStatusColor = () => {
    switch (member.status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getRoleColor = () => {
    switch (member.role) {
      case "owner":
        return "bg-purple-500 text-white";
      case "admin":
        return "bg-blue-500 text-white";
      case "member":
        return "bg-green-500 text-white";
      case "viewer":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatLastActive = () => {
    if (!member.lastActive) return "Never";
    
    const now = new Date();
    const diff = now.getTime() - member.lastActive.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const avatarContent = (
    <div 
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-medium text-white cursor-pointer transition-all duration-200 hover:scale-105",
        getSizeClasses(),
        getAvatarColor(member.name),
        onClick && "hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      {member.avatar ? (
        <img 
          src={member.avatar} 
          alt={member.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{getAvatarInitials(member.name)}</span>
      )}
      
      {/* Status indicator */}
      {showStatus && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
          getStatusColor()
        )} />
      )}
    </div>
  );

  if (!onClick) {
    return avatarContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {avatarContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-border">
          <div className="space-y-1">
            <div className="font-medium text-foreground">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.email}</div>
            {showRole && (
              <Badge className={cn("text-xs", getRoleColor())}>
                {member.role}
              </Badge>
            )}
            <div className="text-xs text-muted-foreground">
              {member.status === "online" ? "Online" : 
               member.status === "away" ? `Away (${formatLastActive()})` :
               `Offline (${formatLastActive()})`}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Team member list component
interface TeamMemberListProps {
  members: TeamMember[];
  projectId?: string;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  showAddButton?: boolean;
  onAddMember?: () => void;
  onMemberClick?: (member: TeamMember) => void;
}

export function TeamMemberList({ 
  members, 
  projectId,
  maxVisible = 4, 
  size = "md",
  showAddButton = false,
  onAddMember,
  onMemberClick 
}: TeamMemberListProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <div className="flex items-center gap-1">
      {visibleMembers.map((member) => (
        <TeamMemberAvatar
          key={member.id}
          member={member}
          size={size}
          onClick={onMemberClick ? () => onMemberClick(member) : undefined}
        />
      ))}
      
      {remainingCount > 0 && (
        <div className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
          size === "sm" ? "w-6 h-6 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-sm"
        )}>
          +{remainingCount}
        </div>
      )}
      
      {showAddButton && (
        <button
          onClick={onAddMember}
          className={cn(
            "flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer",
            size === "sm" ? "w-6 h-6" : size === "lg" ? "w-12 h-12" : "w-8 h-8"
          )}
        >
          <span className={cn(
            "font-medium",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}>
            +
          </span>
        </button>
      )}
    </div>
  );
}









