import { LayoutDashboard, Plus, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onNewProject: () => void;
}

export default function Sidebar({ onNewProject }: SidebarProps) {
  return (
    <div className="w-64 h-screen glass border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-primary">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Rena</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          AI workspace for entrepreneurs
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <Button 
          variant="secondary" 
          className="w-full justify-start gap-3"
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3"
          onClick={onNewProject}
        >
          <Plus className="w-5 h-5" />
          New Project
        </Button>
      </nav>

      {/* Settings */}
      <Button variant="ghost" className="w-full justify-start gap-3">
        <Settings className="w-5 h-5" />
        Settings
      </Button>
    </div>
  );
}
