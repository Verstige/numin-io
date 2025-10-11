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
import TimeTracker from "@/components/TimeTracker";
import NovaChatInterface from "@/components/NovaChatInterface";
import ResourcesSection from "@/components/ResourcesSection";
import { type TeamMember, type ActivityItem } from "@/lib/collaboration";
import { useAuth } from "@/contexts/AuthContext";
import NewUserWelcome from "@/components/NewUserWelcome";
import { getUserDisplayName, getUserFirstName } from "@/lib/user-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Menu, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
}

// Mock data removed - users start with empty workspace

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
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers] = useState<TeamMember[]>([]);
  const [activityFeed] = useState<ActivityItem[]>([]);
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("mindmap");
  const [currentUserRole] = useState<"owner" | "admin" | "member" | "viewer">("admin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dynamicMindmapNodes, setDynamicMindmapNodes] = useState([]);

  // Handle new project creation
  const handleAddNewProject = (projectData: { title: string; description: string }) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: projectData.title,
      description: projectData.description,
      status: "Active",
      priority: "medium"
    };

    // Get the rightmost node from current dynamic nodes
    const currentNodes = dynamicMindmapNodes.length > 0 ? dynamicMindmapNodes : [];
    const rightmostNode = currentNodes.length > 0 ? currentNodes.reduce((prev, current) => 
      (prev.x > current.x) ? prev : current
    ) : { x: 100, y: 100 }; // Default position for first node
    
    const newNode = {
      id: `n${Date.now()}`,
      x: Math.min(rightmostNode.x + 300, 1000),
      y: rightmostNode.y + (Math.random() - 0.5) * 200,
      r: 24,
      title: projectData.title,
      projectId: newProject.id,
      subProjects: []
    };

    // Update both projects and mindmap nodes
    const updatedProjects = [...projects, newProject];
    const updatedNodes = [...dynamicMindmapNodes, newNode];
    
    setProjects(updatedProjects);
    setDynamicMindmapNodes(updatedNodes);
    
    // Save to localStorage
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    localStorage.setItem('userMindmapNodes', JSON.stringify(updatedNodes));
    
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
    const updatedNodes = dynamicMindmapNodes.map(node => {
      if (node.projectId === parentProjectId) {
        return {
          ...node,
          subProjects: [...(node.subProjects || []), newSubProject]
        };
      }
      return node;
    });
    
    setDynamicMindmapNodes(updatedNodes);
    
    // Save to localStorage
    localStorage.setItem('userMindmapNodes', JSON.stringify(updatedNodes));

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
    const updatedNodes = dynamicMindmapNodes.map(node => ({
      ...node,
      subProjects: node.subProjects?.map(subProject => 
        subProject.id === parentSubProjectId 
          ? {
              ...subProject,
              legs: [...(subProject.legs || []), newLeg]
            }
          : subProject
      )
    }));
    
    setDynamicMindmapNodes(updatedNodes);
    
    // Save to localStorage
    localStorage.setItem('userMindmapNodes', JSON.stringify(updatedNodes));

    console.log("New leg added to", parentSubProjectId, ":", newLeg);
  };

  // Load initial data
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Load saved projects from localStorage first (no artificial delay)
        const savedProjects = localStorage.getItem('userProjects');
        const savedMindmapNodes = localStorage.getItem('userMindmapNodes');
        
        if (savedProjects && savedMindmapNodes) {
          // Load user's saved projects
          const parsedProjects = JSON.parse(savedProjects);
          const parsedNodes = JSON.parse(savedMindmapNodes);
          if (mounted) {
            setProjects(parsedProjects);
            setFilteredProjects(parsedProjects);
            setDynamicMindmapNodes(parsedNodes);
          }
        } else {
          // All users start with empty workspace (no mock data)
          if (mounted) {
            setProjects([]);
            setFilteredProjects([]);
            setDynamicMindmapNodes([]);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to empty state
        if (mounted) {
          setProjects([]);
          setFilteredProjects([]);
          setDynamicMindmapNodes([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('Index loading timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
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

  // Debug function to clear localStorage (can be called from console)
  const clearUserData = () => {
    localStorage.removeItem('userProjects');
    localStorage.removeItem('userMindmapNodes');
    localStorage.removeItem('activeProjectId');
    setProjects([]);
    setFilteredProjects([]);
    setDynamicMindmapNodes([]);
    setActiveProject(null);
    console.log('User data cleared');
  };

  const debugLoadingState = () => {
    console.log('=== Loading State Debug ===');
    console.log('isLoading:', isLoading);
    console.log('projects.length:', projects.length);
    console.log('filteredProjects.length:', filteredProjects.length);
    console.log('dynamicMindmapNodes.length:', dynamicMindmapNodes.length);
    console.log('activeProject:', activeProject);
    console.log('localStorage userProjects:', localStorage.getItem('userProjects') ? 'exists' : 'missing');
    console.log('localStorage userMindmapNodes:', localStorage.getItem('userMindmapNodes') ? 'exists' : 'missing');
    console.log('localStorage activeProjectId:', localStorage.getItem('activeProjectId'));
  };

  // Make debug functions available globally for troubleshooting
  (window as any).clearUserData = clearUserData;
  (window as any).debugLoadingState = debugLoadingState;

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          onNewProject={() => setIsNewProjectOpen(true)}
          projects={projects}
          onSearch={handleSearch}
          onFilter={handleFilter}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-subtle scrollbar-none">
        {/* Mobile Header */}
        <div className="lg:hidden bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Nexus</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="flex-1"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentTab("mindmap");
                      setIsMobileMenuOpen(false);
                    }}
                    className={currentTab === "mindmap" ? "bg-blue-500/10 border-blue-500/20" : ""}
                  >
                    Mindmap
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentTab("notes");
                      setIsMobileMenuOpen(false);
                    }}
                    className={currentTab === "notes" ? "bg-blue-500/10 border-blue-500/20" : ""}
                  >
                    Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentTab("tasks");
                      setIsMobileMenuOpen(false);
                    }}
                    className={currentTab === "tasks" ? "bg-blue-500/10 border-blue-500/20" : ""}
                  >
                    Tasks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentTab("team");
                      setIsMobileMenuOpen(false);
                    }}
                    className={currentTab === "team" ? "bg-blue-500/10 border-blue-500/20" : ""}
                  >
                    Team
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setIsNewProjectOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  New Brand
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Show welcome screen for new users */}
          {projects.length === 0 && !isLoading ? (
            <NewUserWelcome 
              onCreateProject={() => setIsNewProjectOpen(true)}
              onViewDemo={() => window.location.href = '/demo'}
            />
          ) : (
            <>
              {/* Header */}
              <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
                  Welcome back, {getUserFirstName(profile)}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Your project ecosystem at a glance
                </p>
              </div>

          {/* Nova AI Chat Interface */}
          <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <NovaChatInterface 
              userName={getUserDisplayName(profile)}
              onSendMessage={(message) => console.log("Nova AI Message:", message)}
            />
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
            notesContent={<BuiltInNotes projectId={activeProject?.id} currentUser={getUserDisplayName(profile)} />}
            tasksContent={<ViewableTasks projectId={activeProject?.id} currentUser={getUserDisplayName(profile)} />}
            teamContent={<TeamManagement />}
            timerContent={
              <TimeTracker 
                userId={profile?.id || "current-user"} 
                projects={projects.map(p => ({
                  id: p.id,
                  name: p.name,
                  subProjects: dynamicMindmapNodes
                    .find(node => node.projectId === p.id)
                    ?.subProjects?.map(sp => ({
                      id: sp.id,
                      name: sp.name,
                      legs: sp.legs?.map(leg => ({
                        id: leg.id,
                        name: leg.name
                      }))
                    }))
                }))}
              />
            }
            taskNotifications={0}
            teamNotifications={0}
            timerNotifications={0}
          />

          {/* Project Overview Panel - above activity feed */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="max-w-4xl mx-auto">
              {activeProject ? (
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-glass">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    <h2 className="text-xl font-bold text-primary">Business Ecosystem Overview</h2>
                    <Badge variant="outline" className="ml-auto">
                      {activeProject.name}
                    </Badge>
                </div>
                  <ProjectContextPanel 
                    project={activeProject} 
                    teamMembers={teamMembers.filter(member => member.projects.includes(activeProject.id))}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-2xl p-8 border border-border/50 shadow-glass text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-muted-foreground">No Project Selected</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Click on a project in the mindmap to view its details and overview
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span>Select a project to see its progress, team members, and key metrics</span>
              </div>
              </div>
            )}
          </div>
        </div>

          {/* Resources Section - below the project overview */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <div className="max-w-4xl mx-auto">
              <ResourcesSection 
                projectId={activeProject?.id} 
                projectName={activeProject?.name}
              />
            </div>
          </div>

          {/* Activity Feed - below the resources */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="max-w-4xl mx-auto">
            <ActivityFeed 
              activities={activityFeed}
              teamMembers={teamMembers}
                maxHeight="400px"
                showFilters={true}
            />
              </div>
          </div>

            </>
          )}
        </div>
      </div>


      {/* New Brand Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Your First Brand</DialogTitle>
            <DialogDescription>
              Start building your next big brand
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., My Brand"
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief overview of your brand..."
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
              Create Brand
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


