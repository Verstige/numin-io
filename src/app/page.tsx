import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import EnhancedProjectMap from "@/components/EnhancedProjectMap";
import ProjectCard from "@/components/ProjectCard";
import ChatInterface from "@/components/ChatInterface";
import ProjectContextPanel from "@/components/ProjectContextPanel";
import QuickSwitcher from "@/components/QuickSwitcher";
import EmptyState from "@/components/EmptyState";
import CRMDashboard from "@/components/CRM/CRMDashboard";
import EmailDashboard from "@/components/Email/EmailDashboard";
import SettingsDashboard from "@/components/Settings/SettingsDashboard";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ProjectCardSkeleton, MindmapSkeleton, SidebarStatsSkeleton } from "@/components/LoadingSkeleton";
import ActivityFeed from "@/components/ActivityFeed";
import WorkspaceTabs, { type WorkspaceTab } from "@/components/WorkspaceTabs";
import BuiltInNotes from "@/components/BuiltInNotes";
import ViewableTasks from "@/components/ViewableTasks";
import TeamManagement from "@/components/TeamManagement";
import { mockTeamMembers, mockActivityFeed, mockInvitations, type TeamMember, type ActivityItem, type TeamInvitation } from "@/lib/collaboration";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName, getUserFirstName } from "@/lib/user-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
}

// Mock data removed - users start with empty workspace

// Mock mindmap data removed - users start with empty mindmap

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
      
      // Add some mock projects to demonstrate the enhanced project map
      const mockProjects = [
        {
          id: '1',
          name: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          status: 'active',
          priority: 'high' as const,
          team_id: 'team-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'Mobile App Development',
          description: 'Build a new mobile application for iOS and Android',
          status: 'planning',
          priority: 'medium' as const,
          team_id: 'team-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Marketing Campaign',
          description: 'Launch a comprehensive marketing campaign for Q1',
          status: 'active',
          priority: 'high' as const,
          team_id: 'team-1',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
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

  // New handler functions for sidebar buttons
  const handleProjectMap = () => {
    setCurrentTab('mindmap');
  };

  const handleNotes = () => {
    setCurrentTab('notes');
  };

  const handleTasks = () => {
    setCurrentTab('tasks');
  };

  const handleTeam = () => {
    setCurrentTab('team');
  };

  const handleTimer = () => {
    setCurrentTab('timer');
  };

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onNewProject={() => setIsNewProjectOpen(true)}
        onDashboard={() => console.log('Navigate to Dashboard')}
        onGetStarted={() => setIsNewProjectOpen(true)}
        onConnections={() => {
          setCurrentTab('crm');
        }}
        onEmail={() => {
          setCurrentTab('email');
        }}
        onProjectMap={handleProjectMap}
        onNotes={handleNotes}
        onTasks={handleTasks}
        onTeam={handleTeam}
        onTimer={handleTimer}
        onNavigateToTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
        projects={projects}
        isLoading={isLoading}
        hasEverCreatedProject={projects.length > 0}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-subtle">
        <div className="p-4 md:p-8">
          {/* Main Workspace Content - always show */}
          <>
              {/* Header */}
              <div className="mb-6 md:mb-8 animate-fade-in text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                  Your Project Ecosystem
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mb-4">
                  Manage and scale your business projects
                </p>
            
            
            {/* Workspace Tabs */}
            <WorkspaceTabs
              activeTab={currentTab}
              onTabChange={setCurrentTab}
              userRole={currentUserRole}
              teamId={currentUser?.id} // Pass user ID as team ID for now
              mindmapContent={
                isLoading ? (
                  <MindmapSkeleton />
                ) : projects.length > 0 ? (
                  <EnhancedProjectMap
                    onProjectSelect={handleOpenProject}
                    selectedProjectId={activeProject?.id}
                    projects={projects}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Create Your First Business</h3>
                    <p className="text-muted-foreground mb-4">Start building your business ecosystem by creating your first project</p>
                    <Button onClick={() => setIsNewProjectOpen(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Business
                    </Button>
                  </div>
                )
              }
              notesContent={<BuiltInNotes projectId={activeProject?.id} currentUser={getUserDisplayName(profile)} teamId={currentUser?.id} />}
              tasksContent={<ViewableTasks projectId={activeProject?.id} currentUser={getUserDisplayName(profile)} teamId={currentUser?.id} />}
              teamContent={<TeamManagement />}
              timerContent={<div className="text-center py-8"><p className="text-muted-foreground">Timer functionality coming soon</p></div>}
              crmContent={<CRMDashboard />}
              emailContent={<EmailDashboard />}
              taskNotifications={0}
              teamNotifications={0}
              timerNotifications={0}
              crmNotifications={0}
              emailNotifications={0}
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
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Create Your First Business</h3>
                    <p className="text-muted-foreground mb-4">Start building your business ecosystem by creating your first project</p>
                    <Button onClick={() => setIsNewProjectOpen(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Business
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
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
        {!activeProject && (
          <div className="w-[200px] overflow-y-auto">
            <ActivityFeed 
              activities={activityFeed}
              teamMembers={teamMembers}
              maxHeight="calc(100vh - 200px)"
              showFilters={false}
            />
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
              tasksCompleted: 0,
              tasksTotal: 0,
              teamMembers: 0,
              daysUntilDeadline: 0,
              weeklyProgress: 0
            }))}
            teamMembers={teamMembers}
          />
        </div>
      </div>

      {/* New Brand Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Your First Business</DialogTitle>
            <DialogDescription>
              Start building your business ecosystem by creating your first business
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., My Business"
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief overview of your business..."
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
              Create Business
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


