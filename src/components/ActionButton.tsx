import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  Users, 
  Bell, 
  CheckSquare, 
  ArrowRight 
} from "lucide-react";

export interface ActionSuggestion {
  id: string;
  type: "create_task" | "update_status" | "schedule_meeting" | "add_member" | "set_reminder";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  action?: () => void;
}

interface ActionButtonProps {
  suggestion: ActionSuggestion;
  onAction: (suggestion: ActionSuggestion) => void;
  size?: "sm" | "md" | "lg";
}

export default function ActionButton({ suggestion, onAction, size = "md" }: ActionButtonProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case "create_task":
        return <CheckSquare className="w-4 h-4" />;
      case "schedule_meeting":
        return <Calendar className="w-4 h-4" />;
      case "add_member":
        return <Users className="w-4 h-4" />;
      case "set_reminder":
        return <Bell className="w-4 h-4" />;
      case "update_status":
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <Plus className="w-4 h-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (suggestion.priority) {
      case "high":
        return "border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400";
      case "medium":
        return "border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400";
      case "low":
        return "border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400";
      default:
        return "border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-xs";
      case "lg":
        return "px-4 py-3 text-sm";
      default:
        return "px-3 py-2 text-sm";
    }
  };

  return (
    <Button
      variant="outline"
      className={`${getPriorityColor()} ${getSizeClasses()} border transition-all duration-200 hover:scale-105 active:scale-95`}
      onClick={() => onAction(suggestion)}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="font-medium">{suggestion.title}</span>
        <Badge 
          variant="secondary" 
          className={`text-xs ${
            suggestion.priority === "high" ? "bg-red-500/20 text-red-400" :
            suggestion.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
            "bg-blue-500/20 text-blue-400"
          }`}
        >
          {suggestion.priority}
        </Badge>
      </div>
    </Button>
  );
}

// Compact action button for inline use
export function CompactActionButton({ suggestion, onAction }: ActionButtonProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case "create_task":
        return <CheckSquare className="w-3 h-3" />;
      case "schedule_meeting":
        return <Calendar className="w-3 h-3" />;
      case "add_member":
        return <Users className="w-3 h-3" />;
      case "set_reminder":
        return <Bell className="w-3 h-3" />;
      case "update_status":
        return <ArrowRight className="w-3 h-3" />;
      default:
        return <Plus className="w-3 h-3" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
      onClick={() => onAction(suggestion)}
    >
      <div className="flex items-center gap-1">
        {getIcon()}
        <span>{suggestion.title}</span>
      </div>
    </Button>
  );
}

// Action suggestion list component
interface ActionSuggestionsProps {
  suggestions: ActionSuggestion[];
  onAction: (suggestion: ActionSuggestion) => void;
  title?: string;
  compact?: boolean;
}

export function ActionSuggestions({ 
  suggestions, 
  onAction, 
  title = "Suggested Actions",
  compact = false 
}: ActionSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border">
      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-primary" />
        {title}
      </h4>
      <div className={`flex ${compact ? 'gap-2' : 'gap-3'} ${compact ? 'flex-wrap' : 'flex-col'}`}>
        {suggestions.map((suggestion) => (
          compact ? (
            <CompactActionButton
              key={suggestion.id}
              suggestion={suggestion}
              onAction={onAction}
            />
          ) : (
            <ActionButton
              key={suggestion.id}
              suggestion={suggestion}
              onAction={onAction}
              size="sm"
            />
          )
        ))}
      </div>
    </div>
  );
}

