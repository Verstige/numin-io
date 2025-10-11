import { LayoutDashboard, Plus, Settings, Sparkles, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "./ThemeToggle";
import { SidebarStatsSkeleton } from "./LoadingSkeleton";
import { useState } from "react";

interface SidebarProps {
  onNewProject: () => void;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
  }>;
  onSearch?: (query: string) => void;
  onFilter?: (filter: { status?: string; priority?: string }) => void;
  isLoading?: boolean;
}

export default function Sidebar({ onNewProject, projects = [], onSearch, onFilter, isLoading = false }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    onFilter?.({ status: status === "all" ? undefined : status, priority: priorityFilter === "all" ? undefined : priorityFilter });
  };

  const handlePriorityFilter = (priority: string) => {
    setPriorityFilter(priority);
    onFilter?.({ status: statusFilter === "all" ? undefined : statusFilter, priority: priority === "all" ? undefined : priority });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    onSearch?.("");
    onFilter?.({});
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all";
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-sidebar-foreground">Nexus</h1>
        </div>
        <p className="text-sm text-sidebar-foreground/70 mt-2">
          AI workspace for entrepreneurs
        </p>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-secondary-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-sidebar-foreground">Filters</span>
            {hasActiveFilters && (
              <Badge 
                variant="secondary" 
                className="ml-auto cursor-pointer hover:bg-secondary/80"
                onClick={clearFilters}
              >
                Clear
              </Badge>
            )}
          </div>
          
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={handlePriorityFilter}>
            <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      {isLoading ? (
        <SidebarStatsSkeleton />
      ) : projects.length > 0 ? (
        <div className="mb-6 p-3 bg-sidebar-accent rounded-lg">
          <div className="text-sm font-medium text-sidebar-accent-foreground mb-2">Quick Stats</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-sidebar-accent-foreground/80">
            <div>Total: {projects.length}</div>
            <div>Active: {projects.filter(p => p.status === "Active").length}</div>
            <div>High Priority: {projects.filter(p => p.priority === "high").length}</div>
            <div>Planning: {projects.filter(p => p.status === "Planning").length}</div>
          </div>
        </div>
      ) : null}

      {/* Keyboard Shortcuts */}
      <div className="mb-6 p-3 bg-sidebar-accent rounded-lg">
        <div className="text-sm font-medium text-sidebar-accent-foreground mb-2">Shortcuts</div>
        <div className="space-y-1 text-xs text-sidebar-accent-foreground/80">
          <div className="flex items-center justify-between">
            <span>Quick Switcher</span>
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">⌘K</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Close Project</span>
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Esc</kbd>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <Button 
          variant="secondary" 
          className="w-full justify-start gap-3 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border-sidebar-border"
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={onNewProject}
        >
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </nav>

      {/* Settings */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="flex-1 justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Settings className="w-5 h-5" />
          Settings
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
