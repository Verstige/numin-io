import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
  }>;
  onSelectProject: (projectId: string) => void;
}

export default function QuickSwitcher({ isOpen, onClose, projects, onSelectProject }: QuickSwitcherProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(query.toLowerCase()) ||
    project.description.toLowerCase().includes(query.toLowerCase()) ||
    project.status.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredProjects.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredProjects[selectedIndex]) {
          onSelectProject(filteredProjects[selectedIndex].id);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredProjects, onSelectProject, onClose]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border p-0 max-w-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-secondary border-border text-secondary-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {filteredProjects.length > 0 ? (
              <div className="space-y-1">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedIndex === index
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/50"
                    )}
                    onClick={() => {
                      onSelectProject(project.id);
                      onClose();
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-card-foreground truncate">
                          {project.name}
                        </h3>
                        <Badge className={priorityColors[project.priority]}>
                          {project.priority}
                        </Badge>
                        <span className={cn("text-xs font-medium", statusColors[project.status as keyof typeof statusColors] || "text-muted-foreground")}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.description}
                      </p>
                    </div>
                    {selectedIndex === index && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowUp className="w-3 h-3" />
                        <ArrowDown className="w-3 h-3" />
                        <span>to navigate</span>
                        <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          Enter
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No projects found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-secondary rounded text-xs">↵</span>
                Select
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-secondary rounded text-xs">Esc</span>
                Close
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

