import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardDirectory from "@/components/DashboardDirectory";
import EnhancedProjectMap from "@/components/EnhancedProjectMap";
import ProjectCard from "@/components/ProjectCard";
import ChatInterface from "@/components/ChatInterface";
import ProjectContextPanel from "@/components/ProjectContextPanel";
import EnhancedProjectOverview from "@/components/EnhancedProjectOverview";
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
import BookingManager from "@/components/BookingManager";
import BookingDemo from "@/components/BookingDemo";
import TeamManagement from "@/components/TeamManagement";
import TimeTracker from "@/components/TimeTracker";
import NovaChatInterface from "@/components/NovaChatInterface";
import WorkspaceCalendar from "@/components/WorkspaceCalendar";
import ResourcesSection from "@/components/ResourcesSection";
import { type TeamMember, type ActivityItem } from "@/lib/collaboration";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName, getUserFirstName } from "@/lib/user-utils";
import { useAIAgentIntegration } from "@/hooks/useAIAgentIntegration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Menu, X, LogOut, Plus, Bot, Map, LayoutDashboard, Settings, Users, Calendar, CheckSquare, Mail, StickyNote, Clock, Sparkles } from "lucide-react";
import * as ProjectsService from "@/lib/projects-service";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  // Enhanced business details
  location?: string;
  website?: string;
  industry?: string;
  products?: string;
  targetAudience?: string;
  businessStage?: string;
  revenue?: string;
  employees?: string;
  founded?: string;
  contactEmail?: string;
  phone?: string;
  socialMedia?: string;
  additionalNotes?: string;
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
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProjectFromMap, setSelectedProjectFromMap] = useState<Project | null>(null);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers] = useState<TeamMember[]>([]);

  // Initialize AI Agent Integration
  const {
    notifyProjectChange,
    notifyTaskChange,
    notifyEmailChange,
    notifyCRMChange,
    getSyncStats
  } = useAIAgentIntegration({ autoSync: true });
  const [activityFeed] = useState<ActivityItem[]>([]);
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("mindmap");
  const [currentUserRole] = useState<"owner" | "admin" | "member" | "viewer">("admin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dynamicMindmapNodes, setDynamicMindmapNodes] = useState([]);
  const [hasEverCreatedProject, setHasEverCreatedProject] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

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
    
    // Save to localStorage with user-specific keys
    const userId = user?.id || 'anonymous';
    localStorage.setItem(`userProjects_${userId}`, JSON.stringify(updatedProjects));
    localStorage.setItem(`userMindmapNodes_${userId}`, JSON.stringify(updatedNodes));
    localStorage.setItem(`hasEverCreatedProject_${userId}`, 'true'); // Mark that user has created a project
    
    // Update state
    setHasEverCreatedProject(true);
    
    console.log("New project added:", newProject);
    console.log("New node created:", newNode);
    console.log("Saved for user:", userId);
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
        console.log('🔄 Loading projects from Supabase...');
        
        // Load projects from Supabase
        const supabaseProjects = await ProjectsService.getUserProjects();
        
        if (mounted) {
          // Convert Supabase projects to local format
          const localProjects = supabaseProjects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            status: p.status,
            priority: p.priority,
            location: p.location,
            website: p.website,
            industry: p.industry,
            products: p.products,
            targetAudience: p.target_audience,
            businessStage: p.business_stage,
            revenue: p.revenue,
            employees: p.employees,
            founded: p.founded,
            contactEmail: p.contact_email,
            phone: p.phone,
            socialMedia: p.social_media,
            additionalNotes: p.additional_notes,
          }));
          
          console.log(`✅ Loaded ${localProjects.length} projects from Supabase`);
          
          setProjects(localProjects);
          setFilteredProjects(localProjects);
          setHasEverCreatedProject(localProjects.length > 0);
          
          // Load mindmap nodes from localStorage (will be migrated to Supabase later)
          const userId = user?.id || 'anonymous';
          const savedMindmapNodes = localStorage.getItem(`userMindmapNodes_${userId}`);
          if (savedMindmapNodes) {
            setDynamicMindmapNodes(JSON.parse(savedMindmapNodes));
          } else {
            setDynamicMindmapNodes([]);
          }
          
          // Also save to localStorage as backup
          if (localProjects.length > 0) {
            localStorage.setItem(`userProjects_${userId}`, JSON.stringify(localProjects));
            localStorage.setItem(`hasEverCreatedProject_${userId}`, 'true');
          }
        }
      } catch (error) {
        console.error('❌ Error loading projects from Supabase:', error);
        
        // Fallback to localStorage if Supabase fails
        const userId = user?.id || 'anonymous';
        const savedProjects = localStorage.getItem(`userProjects_${userId}`);
        const savedMindmapNodes = localStorage.getItem(`userMindmapNodes_${userId}`);
        
        if (mounted) {
          if (savedProjects) {
            console.log('⚠️ Falling back to localStorage projects');
            const projects = JSON.parse(savedProjects);
            setProjects(projects);
            setFilteredProjects(projects);
            setHasEverCreatedProject(projects.length > 0);
          } else {
            setProjects([]);
            setFilteredProjects([]);
            setHasEverCreatedProject(false);
          }
          
          if (savedMindmapNodes) {
            setDynamicMindmapNodes(JSON.parse(savedMindmapNodes));
          } else {
            setDynamicMindmapNodes([]);
          }
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
    }, 5000); // 5 second timeout

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [user?.id]); // Add user.id as dependency

  // Load active project from localStorage on mount
  useEffect(() => {
    if (projects.length > 0 && user?.id) {
      const userId = user.id;
      const savedActiveProjectId = localStorage.getItem(`activeProjectId_${userId}`);
      if (savedActiveProjectId) {
        const savedProject = projects.find(p => p.id === savedActiveProjectId);
        if (savedProject) {
          setActiveProject(savedProject);
        }
      }
    }
  }, [projects, user?.id]);

  // Save active project to localStorage when it changes
  useEffect(() => {
    if (activeProject && user?.id) {
      const userId = user.id;
      localStorage.setItem(`activeProjectId_${userId}`, activeProject.id);
    } else if (!activeProject && user?.id) {
      const userId = user.id;
      localStorage.removeItem(`activeProjectId_${userId}`);
    }
  }, [activeProject, user?.id]);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('viewableTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        startDate: task.startDate ? new Date(task.startDate) : undefined
      }));
      setTasks(parsedTasks);
    }
  }, []);

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
        } else if (activeProject) {
          setActiveProject(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, isQuickSwitcherOpen]);

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleProjectMapSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProjectFromMap(project);
      setActiveProject(project); // Also set as active project
    }
  };


  const handleCloseProject = () => {
    setActiveProject(null);
  };




  const handleQuickSwitcherSelect = (projectId: string) => {
    handleOpenProject(projectId);
    setIsQuickSwitcherOpen(false);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      console.log('📝 Updating project in Supabase:', updatedProject.id);
      
      // Update project in Supabase
      const result = await ProjectsService.updateProject(updatedProject.id, {
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        priority: updatedProject.priority,
        location: updatedProject.location,
        website: updatedProject.website,
        industry: updatedProject.industry,
        products: updatedProject.products,
        target_audience: updatedProject.targetAudience,
        business_stage: updatedProject.businessStage,
        revenue: updatedProject.revenue,
        employees: updatedProject.employees,
        founded: updatedProject.founded,
        contact_email: updatedProject.contactEmail,
        phone: updatedProject.phone,
        social_media: updatedProject.socialMedia,
        additional_notes: updatedProject.additionalNotes,
      });
      
      if (!result) {
        console.error('❌ Failed to update project in Supabase');
        return;
      }
      
      console.log('✅ Project updated in Supabase');
      
      const updatedProjects = projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      );
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      setActiveProject(updatedProject);
      
      // Also save to localStorage as backup
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`userProjects_${userId}`, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('❌ Error updating project:', error);
      // TODO: Show error toast to user
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      console.log('🗑️ Deleting project from Supabase:', projectId);
      
      const projectToDelete = projects.find(p => p.id === projectId);
      
      // Delete project from Supabase
      const success = await ProjectsService.deleteProject(projectId);
      
      if (!success) {
        console.error('❌ Failed to delete project from Supabase');
        return;
      }
      
      console.log('✅ Project deleted from Supabase');
      
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      
      // Clear active project if it was deleted
      if (activeProject?.id === projectId) {
        setActiveProject(null);
        setSelectedProjectFromMap(null);
      }
      
      // Notify AI agents of deleted project
      if (projectToDelete) {
        notifyProjectChange('deleted', projectToDelete);
      }
      
      // Also save to localStorage as backup
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`userProjects_${userId}`, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      // TODO: Show error toast to user
    }
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

  // Listen for external tab navigation requests
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const tab = event.detail;
      setCurrentTab(tab as WorkspaceTab);
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  // Debug function to clear localStorage (can be called from console)
  const clearUserData = () => {
    const userId = user?.id || 'anonymous';
    localStorage.removeItem(`userProjects_${userId}`);
    localStorage.removeItem(`userMindmapNodes_${userId}`);
    localStorage.removeItem(`activeProjectId_${userId}`);
    localStorage.removeItem(`hasEverCreatedProject_${userId}`);
    setProjects([]);
    setFilteredProjects([]);
    setDynamicMindmapNodes([]);
    setActiveProject(null);
    setHasEverCreatedProject(false);
    console.log('User data cleared');
  };

  const debugLoadingState = () => {
    console.log('=== Loading State Debug ===');
    console.log('isLoading:', isLoading);
    console.log('projects.length:', projects.length);
    console.log('filteredProjects.length:', filteredProjects.length);
    console.log('dynamicMindmapNodes.length:', dynamicMindmapNodes.length);
    console.log('activeProject:', activeProject);
    const userId = user?.id || 'anonymous';
    console.log('localStorage userProjects:', localStorage.getItem(`userProjects_${userId}`) ? 'exists' : 'missing');
    console.log('localStorage userMindmapNodes:', localStorage.getItem(`userMindmapNodes_${userId}`) ? 'exists' : 'missing');
    console.log('localStorage activeProjectId:', localStorage.getItem(`activeProjectId_${userId}`));
  };


  // Make debug functions available globally for troubleshooting
  (window as any).clearUserData = clearUserData;
  (window as any).debugLoadingState = debugLoadingState;

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:block">
      <Sidebar 
        onDashboard={() => setShowDashboard(true)}
        onConnections={() => {
          setCurrentTab('crm');
        }}
        onEmail={() => {
          setCurrentTab('email');
        }}
        onProjectMap={handleProjectMap}
        onCalendar={() => {
          setCurrentTab('calendar');
        }}
        onNotes={handleNotes}
        onTasks={handleTasks}
        onTeam={handleTeam}
        onTimer={handleTimer}
        onBookings={() => {
          setCurrentTab('bookings');
        }}
        onNavigateToTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
        projects={projects}
        isLoading={isLoading}
        hasEverCreatedProject={hasEverCreatedProject}
      />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-subtle scrollbar-none">
        {/* Main Dashboard Content */}
        <>
            {/* Mobile Header */}
            <div className="lg:hidden bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground text-sm sm:text-base">Nexus</span>
            </div>
            <div className="flex items-center gap-2">
              <ProfileDropdown />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 touch-manipulation active:scale-95"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
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
                
                {/* AI Business Suite Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-foreground">AI Business Suite</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentTab("mindmap");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "mindmap" ? "bg-blue-500/10 border-blue-500/20" : ""}`}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Business Map
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate('/nexus');
                        setIsMobileMenuOpen(false);
                      }}
                      className="touch-manipulation active:scale-95 justify-start"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Nexus Agents
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onDashboard();
                        setIsMobileMenuOpen(false);
                      }}
                      className="touch-manipulation active:scale-95 justify-start"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      App Library
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate('/settings');
                        setIsMobileMenuOpen(false);
                      }}
                      className="touch-manipulation active:scale-95 justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      My Account
                    </Button>
                  </div>
                </div>

                {/* Business Tools Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-foreground">Business Tools</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onCalendar();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "calendar" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onConnections();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "crm" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onTasks();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "tasks" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Tasks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onEmail();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "email" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onNotes();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "notes" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <StickyNote className="w-4 h-4 mr-2" />
                      Notes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onTimer();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "timer" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Timer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onTeam();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`touch-manipulation active:scale-95 justify-start ${currentTab === "team" ? "bg-green-500/10 border-green-500/20" : ""}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Team
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Professional Hero Section */}
        <div className="relative bg-gradient-to-br from-background via-background/95 to-background/90 border-b border-border/50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                    Your Business
                  </span>
                  <br />
                  <span className="text-foreground">
                    Intelligence Hub
                  </span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
                  Streamline operations, manage projects, and unlock insights with our comprehensive AI-powered business suite. 
                  Everything you need to scale your business, all in one place.
                </p>
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
                  <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                      {projects.length}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Total Projects
                    </div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                      {projects.filter(p => p.status === "Active").length}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Active Projects
                    </div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">
                      {projects.filter(p => p.priority === "high").length}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      High Priority
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto border-border/50 hover:bg-background/50 px-6 sm:px-8 py-3 rounded-xl transition-all duration-300"
                    onClick={() => setCurrentTab('mindmap')}
                  >
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    View Project Map
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Main workspace content */}
          <>
          {/* Header */}
              <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    {/* Profile dropdown removed */}
                  </div>
                </div>
          </div>

          {/* Nova AI Chat Interface */}
          <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <NovaChatInterface 
              userName={getUserDisplayName(user)}
              workspaceContext={{
                projects: filteredProjects.map(p => ({
                  id: p.id,
                  name: p.name,
                  description: p.description || '',
                  status: p.status,
                  priority: p.priority,
                  // Enhanced business details for Nova AI
                  location: p.location,
                  website: p.website,
                  industry: p.industry,
                  products: p.products,
                  targetAudience: p.targetAudience,
                  businessStage: p.businessStage,
                  revenue: p.revenue,
                  employees: p.employees,
                  founded: p.founded,
                  contactEmail: p.contactEmail,
                  phone: p.phone,
                  socialMedia: p.socialMedia,
                  additionalNotes: p.additionalNotes
                })),
                tasks: [], // TODO: Add tasks from ViewableTasks component
                teamMembers: teamMembers.map(m => ({
                  id: m.id,
                  name: m.name,
                  role: m.role,
                  status: m.status
                })),
                notes: [], // TODO: Add notes from BuiltInNotes component
                currentUser: {
                  name: getUserDisplayName(user),
                  email: user?.email || ''
                },
                businessStage: 'startup', // TODO: Add business stage selection
                industry: 'technology' // TODO: Add industry selection
              }}
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
              ) : (
                <EnhancedProjectMap
                  onProjectSelect={handleProjectMapSelect}
                  selectedProjectId={selectedProjectFromMap?.id}
                  projects={projects}
                />
              )
            }
            notesContent={<BuiltInNotes projectId={activeProject?.id} currentUser={getUserDisplayName(user)} teamId={user?.id} />}
            tasksContent={<ViewableTasks projectId={activeProject?.id} currentUser={getUserDisplayName(user)} teamId={user?.id} />}
            teamContent={<TeamManagement />}
            timerContent={
              <TimeTracker 
                userId={user?.id || "current-user"} 
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
            crmContent={<CRMDashboard />}
            emailContent={<EmailDashboard />}
            calendarContent={
              <WorkspaceCalendar 
                tasks={tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  dueDate: task.dueDate,
                  status: task.status,
                  priority: task.priority
                }))}
              />
            }
            bookingsContent={<BookingManager />}
            bookingDemoContent={<BookingDemo />}
            taskNotifications={0}
            teamNotifications={0}
            timerNotifications={0}
            crmNotifications={0}
            emailNotifications={0}
            calendarNotifications={0}
            bookingsNotifications={0}
          />

          {/* Enhanced Project Overview Panel */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-glass">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-primary">Business Ecosystem Overview</h2>
                  {selectedProjectFromMap && (
                    <Badge variant="outline" className="ml-auto">
                      {selectedProjectFromMap.name}
                    </Badge>
                  )}
                </div>
                <EnhancedProjectOverview 
                  selectedProject={selectedProjectFromMap} 
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                />
              </div>
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
      </div>






      {/* Quick Switcher */}
      <QuickSwitcher
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        projects={projects}
        onSelectProject={handleQuickSwitcherSelect}
      />

            {/* Dashboard Directory */}
            {showDashboard && (
              <DashboardDirectory
                onSelectTab={(tab) => {
                  setCurrentTab(tab as WorkspaceTab);
                  setShowDashboard(false);
                }}
                onClose={() => setShowDashboard(false)}
              />
            )}
        </>
      </div>
    </div>
  );
}


