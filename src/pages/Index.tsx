import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import RenaMindmap from "@/components/RenaMindmap";
import ProjectCard from "@/components/ProjectCard";
import ChatInterface from "@/components/ChatInterface";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
}

const initialProjects: Project[] = [
  {
    id: "p1",
    name: "VitaTech",
    description: "Early stage wellness wearable focused on contactless biometrics. Priority: investor one-pager due Oct 20.",
    status: "Active",
    priority: "high"
  },
  {
    id: "p2",
    name: "Velocity",
    description: "SaaS platform for startup collaboration. Building MVP, seeking product-market fit.",
    status: "Planning",
    priority: "medium"
  },
  {
    id: "p3",
    name: "Verstige",
    description: "Web3 identity verification for enterprise. Pilot program with 3 companies.",
    status: "Active",
    priority: "high"
  }
];

const mindmapNodes = [
  { id: "n1", x: 300, y: 200, r: 26, title: "VitaTech", projectId: "p1" },
  { id: "n2", x: 600, y: 120, r: 22, title: "Velocity", projectId: "p2" },
  { id: "n3", x: 900, y: 300, r: 24, title: "Verstige", projectId: "p3" },
];

const mindmapEdges = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
];

export default function Index() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    
    const project: Project = {
      id: `p${projects.length + 1}`,
      name: newProject.name,
      description: newProject.description,
      status: "Planning",
      priority: newProject.priority
    };
    
    setProjects([...projects, project]);
    setNewProject({ name: "", description: "", priority: "medium" });
    setIsNewProjectOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNewProject={() => setIsNewProjectOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground">
              Your project ecosystem at a glance
            </p>
          </div>

          {/* Mindmap */}
          <div className="mb-8 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <RenaMindmap
              nodes={mindmapNodes}
              edges={mindmapEdges}
              onOpenProject={handleOpenProject}
            />
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {projects.map((project, idx) => (
              <div key={project.id} style={{ animationDelay: `${0.3 + idx * 0.1}s` }} className="animate-scale-in">
                <ProjectCard
                  {...project}
                  onClick={() => handleOpenProject(project.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-[420px] h-screen p-6 animate-slide-in">
        <ChatInterface projectName={activeProject?.name} />
      </div>

      {/* New Project Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start organizing your next big idea
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., My Startup"
                className="glass mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief overview of your project..."
                className="glass mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newProject.priority}
                onValueChange={(value) => setNewProject({ ...newProject, priority: value as "low" | "medium" | "high" })}
              >
                <SelectTrigger className="glass mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleCreateProject} 
              className="w-full gradient-primary text-white shadow-primary"
            >
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
