import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import RenaMindmap from "@/components/RenaMindmap";
import ProjectCard from "@/components/ProjectCard";
import ChatInterface from "@/components/ChatInterface";
import ProjectContextPanel from "@/components/ProjectContextPanel";
import QuickSwitcher from "@/components/QuickSwitcher";
import EmptyState from "@/components/EmptyState";
import { ProjectCardSkeleton, MindmapSkeleton, SidebarStatsSkeleton } from "@/components/LoadingSkeleton";
import ActivityFeed from "@/components/ActivityFeed";
import WorkspaceTabs, { type WorkspaceTab } from "@/components/WorkspaceTabs";
import BuiltInNotes from "@/components/BuiltInNotes";
import ViewableTasks from "@/components/ViewableTasks";
import TeamManagement from "@/components/TeamManagement";
import { mockTeamMembers, mockActivityFeed, mockInvitations, type TeamMember, type ActivityItem, type TeamInvitation } from "@/lib/collaboration";
import { useAuth } from "@/contexts/AuthContext";
import NewUserWelcome from "@/components/NewUserWelcome";
import { getUserDisplayName, getUserFirstName } from "@/lib/user-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

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
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers] = useState<TeamMember[]>([]);
  const [activityFeed] = useState<ActivityItem[]>([]);
  const [invitations] = useState<TeamInvitation[]>([]);
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("mindmap");
  const [currentUserRole] = useState<"owner" | "admin" | "member" | "viewer">("admin"); // Mock current user role

  // Simulate loading initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // All users start with empty workspace
      setProjects([]);
      setFilteredProjects([]);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Load active project from localStorage on mount
  useEffect(() => {
    if (projects.length > 0) {
      const savedActiveProjectId = localStorage.getItem('activeProjectId');
      if (savedActiveProjectId) {
        const savedProject = projects.find(p => p.id === savedActiveProjectId);
        if (savedProject) {
          setActiveProject(savedProject);
        }
      }
    }
  }, [projects]);

  // Save active project to localStorage when it changes
  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('activeProjectId', activeProject.id);
    } else {
      localStorage.removeItem('activeProjectId');
    }
  }, [activeProject]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for quick switcher
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSwitcherOpen(true);
      }
      // Esc to close active project or modals
      if (e.key === 'Escape') {
        if (isQuickSwitcherOpen) {
          setIsQuickSwitcherOpen(false);
        } else if (isNewProjectOpen) {
          setIsNewProjectOpen(false);
        } else if (activeProject) {
          setActiveProject(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, isNewProjectOpen, isQuickSwitcherOpen]);
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

  const handleCloseProject = () => {
    setActiveProject(null);
  };

  const handleProjectInvitation = (invitation: TeamInvitation) => {
    // In a real app, this would make an API call to save the invitation
    console.log('Project invitation created:', invitation);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      project.status.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const handleFilter = (filter: { status?: string; priority?: string }) => {
    let filtered = projects;

    if (filter.status) {
      filtered = filtered.filter(project => project.status === filter.status);
    }

    if (filter.priority) {
      filtered = filtered.filter(project => project.priority === filter.priority);
    }

    setFilteredProjects(filtered);
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
    
    const newProjects = [...projects, project];
    setProjects(newProjects);
    setFilteredProjects(newProjects);
    setNewProject({ name: "", description: "", priority: "medium" });
    setIsNewProjectOpen(false);
  };

  const handleQuickSwitcherSelect = (projectId: string) => {
    handleOpenProject(projectId);
    setIsQuickSwitcherOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onNewProject={() => setIsNewProjectOpen(true)}
        projects={projects}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isLoading}
        userRole={currentUserRole}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-subtle">
        <div className="p-4 md:p-8">
          {/* Show welcome screen for new users */}
          {!isDemoUser && projects.length === 0 && !isLoading ? (
            <NewUserWelcome 
              onCreateProject={() => setIsNewProjectOpen(true)}
              onViewDemo={() => window.location.href = '/demo'}
            />
          ) : (
            <>
              {/* Header */}
          <div className="mb-6 md:mb-8 animate-fade-in text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              Welcome back, {getUserFirstName(profile)}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-4">
              Your project ecosystem at a glance
            </p>
            
            
            {/* Workspace Tabs */}
            <WorkspaceTabs
              activeTab={currentTab}
              onTabChange={setCurrentTab}
              userRole={currentUserRole}
              mindmapContent={
                isLoading ? (
                  <MindmapSkeleton />
                ) : projects.length > 0 ? (
                  <RenaMindmap
                    nodes={mindmapNodes}
                    edges={mindmapEdges}
                    onOpenProject={handleOpenProject}
                    activeProjectId={activeProject?.id}
                  />
                ) : (
                  <EmptyState 
                    type="no-projects" 
                    onAction={() => setIsNewProjectOpen(true)}
                  />
                )
              }
              notesContent={<BuiltInNotes projectId={activeProject?.id} currentUser={getUserDisplayName(profile)} />}
              tasksContent={<ViewableTasks projectId={activeProject?.id} currentUser={getUserDisplayName(profile)} />}
              teamContent={<TeamManagement />}
              taskNotifications={3}
              teamNotifications={1}
            />
          </div>

          {/* Content is now handled by WorkspaceTabs component */}

          {/* Project Grid - only show in mindmap view */}
          {currentTab === "mindmap" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} style={{ animationDelay: `${0.3 + idx * 0.1}s` }} className="animate-scale-in">
                    <ProjectCardSkeleton />
                  </div>
                ))
              ) : filteredProjects.length > 0 ? (
                // Actual projects
                filteredProjects.map((project, idx) => (
                  <div key={project.id} style={{ animationDelay: `${0.3 + idx * 0.1}s` }} className="animate-scale-in">
                    <ProjectCard
                      {...project}
                      onClick={() => handleOpenProject(project.id)}
                      isActive={activeProject?.id === project.id}
                      teamMembers={teamMembers.filter(member => member.projects.includes(project.id))}
                    />
                  </div>
                ))
              ) : projects.length > 0 ? (
                // No search results
                <div className="col-span-full">
                  <EmptyState 
                    type="no-search-results" 
                    onAction={() => {
                      // Clear search and filters
                      const searchInput = document.querySelector('input[placeholder="Search projects..."]') as HTMLInputElement;
                      if (searchInput) searchInput.value = '';
                      setFilteredProjects(projects);
                    }}
                  />
                </div>
              ) : (
                // No projects at all
                <div className="col-span-full">
                  <EmptyState 
                    type="no-projects" 
                    onAction={() => setIsNewProjectOpen(true)}
                  />
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex w-[420px] h-screen p-6 animate-slide-in gap-4">
        {/* Project Context Panel */}
        {activeProject && (
          <div className="w-[200px] overflow-y-auto">
            <ProjectContextPanel 
              project={activeProject} 
              teamMembers={teamMembers.filter(member => member.projects.includes(activeProject.id))}
              allTeamMembers={teamMembers}
              invitations={invitations}
              onInviteMember={handleProjectInvitation}
            />
          </div>
        )}
        
        {/* Right Panel Content */}
        {currentView === "shared" && !activeProject && (
          <div className="w-[200px] overflow-y-auto">
            <ActivityFeed 
              activities={activityFeed}
              teamMembers={teamMembers}
              maxHeight="calc(100vh - 200px)"
              showFilters={false}
            />
          </div>
        )}
        
        {currentView === "personal" && !activeProject && (
          <div className="w-[200px] overflow-y-auto">
            <PersonalNotes />
          </div>
        )}
        
        {/* Chat Panel */}
        <div className="flex-1">
          <ChatInterface 
            projectName={activeProject?.name} 
            onCloseProject={handleCloseProject}
            activeProject={activeProject ? {
              id: activeProject.id,
              name: activeProject.name,
              description: activeProject.description,
              status: activeProject.status,
              priority: activeProject.priority,
              tasksCompleted: 12,
              tasksTotal: 18,
              teamMembers: 3,
              daysUntilDeadline: 15,
              weeklyProgress: 75
            } : null}
            allProjects={projects.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              status: p.status,
              priority: p.priority,
              tasksCompleted: Math.floor(Math.random() * 20),
              tasksTotal: Math.floor(Math.random() * 30) + 10,
              teamMembers: Math.floor(Math.random() * 5) + 1,
              daysUntilDeadline: Math.floor(Math.random() * 30) + 5,
              weeklyProgress: Math.floor(Math.random() * 100)
            }))}
            teamMembers={teamMembers}
          />
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="bg-card border-border">
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
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief overview of your project..."
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newProject.priority}
                onValueChange={(value) => setNewProject({ ...newProject, priority: value as "low" | "medium" | "high" })}
              >
                <SelectTrigger className="bg-secondary border-border mt-1">
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

      {/* Quick Switcher */}
      <QuickSwitcher
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        projects={projects}
        onSelectProject={handleQuickSwitcherSelect}
      />
    </div>
  );
}


