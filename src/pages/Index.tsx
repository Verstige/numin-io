import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AdvancedMindmap from "@/components/AdvancedMindmap";
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
import { mockTeamMembers, mockActivityFeed, type TeamMember, type ActivityItem } from "@/lib/collaboration";
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
  { 
    id: "n1", 
    x: 300, 
    y: 200, 
    r: 26, 
    title: "VitaTech", 
    projectId: "p1",
    subProjects: [
      {
        id: "sub1",
        name: "Customer Acquisition",
        category: "sales" as const,
        status: "active" as const,
        progress: 75,
        description: "Focus on B2B sales pipeline and lead generation",
        tasks: [
          {
            id: "task1",
            title: "Create sales presentation deck",
            description: "Develop compelling pitch for enterprise clients",
            status: "completed" as const,
            priority: "high" as const
          },
          {
            id: "task2",
            title: "Setup CRM system",
            description: "Implement Salesforce for lead tracking",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task3",
            title: "Identify target prospects",
            description: "Research and compile list of potential clients",
            status: "todo" as const,
            priority: "medium" as const
          }
        ],
        legs: [
          {
            id: "leg1",
            name: "Lead Generation",
            description: "Automated lead generation systems",
            status: "active" as const,
            progress: 60,
            tasks: []
          },
          {
            id: "leg2",
            name: "Sales Pipeline",
            description: "Sales process optimization",
            status: "planning" as const,
            progress: 25,
            tasks: []
          },
          {
            id: "leg3",
            name: "Client Relations",
            description: "Customer relationship management",
            status: "active" as const,
            progress: 80,
            tasks: []
          }
        ]
      },
      {
        id: "sub2",
        name: "Brand Awareness",
        category: "marketing" as const,
        status: "planning" as const,
        progress: 30,
        description: "Multi-channel marketing campaign for product launch",
        tasks: [
          {
            id: "task4",
            title: "Design brand guidelines",
            description: "Create comprehensive brand identity document",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task5",
            title: "Plan launch campaign",
            description: "Strategy for product announcement",
            status: "todo" as const,
            priority: "medium" as const
          }
        ],
        legs: [
          {
            id: "leg4",
            name: "Brand Identity",
            description: "Visual identity and messaging",
            status: "active" as const,
            progress: 70,
            tasks: []
          },
          {
            id: "leg5",
            name: "Campaign Strategy",
            description: "Multi-channel campaign planning",
            status: "planning" as const,
            progress: 30,
            tasks: []
          },
          {
            id: "leg6",
            name: "Content Creation",
            description: "Marketing content development",
            status: "active" as const,
            progress: 45,
            tasks: []
          }
        ]
      },
      {
        id: "sub3",
        name: "Social Media",
        category: "social-media" as const,
        status: "active" as const,
        progress: 60,
        description: "LinkedIn and Twitter engagement strategy",
        tasks: [
          {
            id: "task6",
            title: "Create content calendar",
            description: "Plan weekly social media posts",
            status: "completed" as const,
            priority: "medium" as const
          },
          {
            id: "task7",
            title: "Engage with industry influencers",
            description: "Build relationships with key thought leaders",
            status: "in-progress" as const,
            priority: "high" as const
          }
        ],
        legs: [
          {
            id: "leg7",
            name: "Content Strategy",
            description: "Social media content planning",
            status: "completed" as const,
            progress: 100,
            tasks: []
          },
          {
            id: "leg8",
            name: "Influencer Network",
            description: "Building industry relationships",
            status: "active" as const,
            progress: 65,
            tasks: []
          },
          {
            id: "leg9",
            name: "Engagement Analytics",
            description: "Social media performance tracking",
            status: "planning" as const,
            progress: 20,
            tasks: []
          }
        ]
      }
    ]
  },
  { 
    id: "n2", 
    x: 600, 
    y: 120, 
    r: 22, 
    title: "Velocity", 
    projectId: "p2",
    subProjects: [
      {
        id: "sub4",
        name: "Growth Hacking",
        category: "growth" as const,
        status: "active" as const,
        progress: 45,
        description: "Implement viral growth loops and referral system",
        tasks: [
          {
            id: "task8",
            title: "Implement referral system",
            description: "Build user referral program with rewards",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task9",
            title: "A/B test onboarding flow",
            description: "Optimize user activation process",
            status: "todo" as const,
            priority: "medium" as const
          }
        ]
      },
      {
        id: "sub5",
        name: "Content Marketing",
        category: "marketing" as const,
        status: "completed" as const,
        progress: 100,
        description: "Blog and educational content creation",
        tasks: [
          {
            id: "task10",
            title: "Write technical blog posts",
            description: "Create educational content about SaaS best practices",
            status: "completed" as const,
            priority: "medium" as const
          }
        ]
      }
    ]
  },
  { 
    id: "n3", 
    x: 900, 
    y: 300, 
    r: 24, 
    title: "Verstige", 
    projectId: "p3",
    subProjects: [
      {
        id: "sub6",
        name: "Enterprise Sales",
        category: "sales" as const,
        status: "active" as const,
        progress: 85,
        description: "Target enterprise clients for pilot program",
        tasks: [
          {
            id: "task11",
            title: "Pilot program proposal",
            description: "Create detailed proposal for enterprise clients",
            status: "completed" as const,
            priority: "urgent" as const
          },
          {
            id: "task12",
            title: "Schedule client meetings",
            description: "Book demos with potential enterprise customers",
            status: "in-progress" as const,
            priority: "high" as const
          }
        ]
      },
      {
        id: "sub7",
        name: "Community Building",
        category: "social-media" as const,
        status: "planning" as const,
        progress: 20,
        description: "Build developer community around Web3 identity",
        tasks: [
          {
            id: "task13",
            title: "Setup Discord server",
            description: "Create community platform for developers",
            status: "todo" as const,
            priority: "medium" as const
          }
        ]
      },
      {
        id: "sub8",
        name: "Product-Market Fit",
        category: "growth" as const,
        status: "active" as const,
        progress: 70,
        description: "Validate product-market fit with pilot customers",
        tasks: [
          {
            id: "task14",
            title: "User feedback analysis",
            description: "Analyze feedback from pilot customers",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task15",
            title: "Product iteration plan",
            description: "Plan improvements based on user feedback",
            status: "todo" as const,
            priority: "medium" as const
          }
        ]
      }
    ]
  },
];

const mindmapEdges = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
];

export default function Index() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [activityFeed] = useState<ActivityItem[]>(mockActivityFeed);
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("mindmap");
  const [currentUserRole] = useState<"owner" | "admin" | "member" | "viewer">("admin");
  const [dynamicMindmapNodes, setDynamicMindmapNodes] = useState(mindmapNodes);

  // Handle new project creation
  const handleAddNewProject = (projectData: { title: string; description: string }) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: projectData.title,
      description: projectData.description,
      status: "Active",
      priority: "medium",
      teamSize: 1,
      budget: 50000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      progress: 0,
      tags: ["New"],
      teamMembers: ["Current User"]
    };

    const newNodes = [...mindmapNodes];
    const rightmostNode = newNodes.reduce((prev, current) => 
      (prev.x > current.x) ? prev : current
    );
    
    const newNode = {
      id: `n${Date.now()}`,
      x: Math.min(rightmostNode.x + 300, 1000),
      y: rightmostNode.y + (Math.random() - 0.5) * 200,
      r: 24,
      title: projectData.title,
      projectId: newProject.id,
      subProjects: []
    };

    setProjects(prev => [...prev, newProject]);
    
    // Add the new node to the mindmap
    setDynamicMindmapNodes(prevNodes => [...prevNodes, newNode]);
    
    console.log("New project added:", newProject);
    console.log("New node created:", newNode);
  };

  // Handle new sub-project creation
  const handleAddNewSubProject = (parentProjectId: string, subProjectData: any) => {
    const newSubProject = {
      id: `sub_${Date.now()}`,
      name: subProjectData.name,
      category: subProjectData.category,
      status: subProjectData.status,
      progress: subProjectData.progress || 0,
      description: subProjectData.description,
      tasks: []
    };

    // Update the mindmap nodes to include the new sub-project
    setDynamicMindmapNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.projectId === parentProjectId) {
          return {
            ...node,
            subProjects: [...(node.subProjects || []), newSubProject]
          };
        }
        return node;
      })
    );

    console.log("New sub-project added to", parentProjectId, ":", newSubProject);
  };

  // Handle new leg creation
  const handleAddNewLeg = (parentSubProjectId: string, legData: any) => {
    const newLeg = {
      id: `leg_${Date.now()}`,
      name: legData.name,
      description: legData.description,
      status: legData.status,
      progress: legData.progress || 0,
      tasks: []
    };

    // Update the mindmap nodes to include the new leg
    setDynamicMindmapNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        subProjects: node.subProjects?.map(subProject => 
          subProject.id === parentSubProjectId 
            ? {
                ...subProject,
                legs: [...(subProject.legs || []), newLeg]
              }
            : subProject
        )
      }))
    );

    console.log("New leg added to", parentSubProjectId, ":", newLeg);
  };

  // Simulate loading initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProjects(initialProjects);
      setFilteredProjects(initialProjects);
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
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-subtle">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              Welcome back
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Your project ecosystem at a glance
            </p>
          </div>

          {/* Workspace Tabs */}
          <WorkspaceTabs
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            userRole={currentUserRole}
            mindmapContent={
              isLoading ? (
              <MindmapSkeleton />
            ) : projects.length > 0 ? (
                <AdvancedMindmap
                  nodes={dynamicMindmapNodes}
                  edges={mindmapEdges}
                  onOpenProject={handleOpenProject}
                  activeProjectId={activeProject?.id}
                  onAddNewProject={handleAddNewProject}
                  onAddNewSubProject={handleAddNewSubProject}
                  onAddNewLeg={handleAddNewLeg}
                />
            ) : (
              <EmptyState 
                type="no-projects" 
                onAction={() => setIsNewProjectOpen(true)}
              />
              )
            }
            notesContent={<BuiltInNotes projectId={activeProject?.id} currentUser="Current User" />}
            tasksContent={<ViewableTasks projectId={activeProject?.id} currentUser="Current User" />}
            teamContent={<TeamManagement />}
            taskNotifications={3}
            teamNotifications={1}
          />

          {/* Activity Feed - below the tabs */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="max-w-4xl mx-auto">
              <ActivityFeed 
                activities={activityFeed}
                teamMembers={teamMembers}
                maxHeight="400px"
                showFilters={true}
                />
              </div>
          </div>

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


