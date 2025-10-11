import { Button } from "@/components/ui/button";
import { Sparkles, FolderPlus, Search, Zap, Target } from "lucide-react";

interface EmptyStateProps {
  type: "no-projects" | "no-search-results" | "no-active-project" | "loading";
  onAction?: () => void;
  actionText?: string;
}

export default function EmptyState({ type, onAction, actionText }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (type) {
      case "no-projects":
        return {
          icon: <Sparkles className="w-16 h-16 text-primary" />,
          title: "Welcome to Nexus",
          subtitle: "Your AI-powered brand workspace is ready",
          description: "Create your first brand to get started with intelligent brand management, insights, and AI assistance.",
          actionText: actionText || "Get Started",
          showAction: true
        };
      
      case "no-search-results":
        return {
          icon: <Search className="w-12 h-12 text-muted-foreground" />,
          title: "No projects found",
          subtitle: "Try adjusting your search or filters",
          description: "We couldn't find any projects matching your criteria. Try a different search term or clear your filters.",
          actionText: actionText || "Clear Filters",
          showAction: true
        };
      
      case "no-active-project":
        return {
          icon: <Target className="w-12 h-12 text-muted-foreground" />,
          title: "Select a project to begin",
          subtitle: "Choose a project to start working with Nova",
          description: "Click on any project card or use the quick switcher (⌘K) to select a project and get AI-powered insights.",
          actionText: actionText || "View All Projects",
          showAction: true
        };
      
      case "loading":
        return {
          icon: <Zap className="w-12 h-12 text-primary animate-pulse" />,
          title: "Loading...",
          subtitle: "Nova is preparing your workspace",
          description: "Just a moment while we load your projects and set up your AI assistant.",
          actionText: "",
          showAction: false
        };
      
      default:
        return {
          icon: <FolderPlus className="w-12 h-12 text-muted-foreground" />,
          title: "Nothing here yet",
          subtitle: "Get started by adding some content",
          description: "This area will show your content once you create some projects.",
          actionText: actionText || "Get Started",
          showAction: true
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-6">
        {content.icon}
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {content.title}
      </h2>
      
      <p className="text-lg text-muted-foreground mb-4">
        {content.subtitle}
      </p>
      
      <p className="text-sm text-muted-foreground/80 max-w-md mb-8 leading-relaxed">
        {content.description}
      </p>
      
      {content.showAction && onAction && (
        <Button 
          onClick={onAction}
          className="gradient-primary text-white shadow-primary hover:opacity-90 transition-smooth"
        >
          {content.actionText}
        </Button>
      )}
    </div>
  );
}


