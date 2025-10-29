import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import AdvancedMindmap from "@/components/AdvancedMindmap";
import ProjectCard from "@/components/ProjectCard";
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
import { mockTeamMembers, mockActivityFeed, type TeamMember, type ActivityItem } from "@/lib/collaboration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
}

// Demo projects data
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

// Demo mindmap nodes
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
          }
        ],
        legs: []
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
    subProjects: []
  },
  { 
    id: "n3", 
    x: 900, 
    y: 300, 
    r: 24, 
    title: "Verstige", 
    projectId: "p3",
    subProjects: []
  }
];

const mindmapEdges = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
];

export default function DemoWorkspace() {
  const [projects] = useState<Project[]>(initialProjects);
  const [filteredProjects] = useState<Project[]>(initialProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [activityFeed] = useState<ActivityItem[]>(mockActivityFeed);
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("mindmap");
  const [currentUserRole] = useState<"owner" | "admin" | "member" | "viewer">("admin");
  const [dynamicMindmapNodes] = useState(mindmapNodes);

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleCloseProject = () => {
    setActiveProject(null);
  };

  const handleQuickSwitcherSelect = (projectId: string) => {
    handleOpenProject(projectId);
    setIsQuickSwitcherOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Demo Banner */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Demo Workspace - This is how Nexus looks with sample data</span>
          <Button 
            variant="outline" 
            size="sm"
            className="ml-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="pt-12">
        <Sidebar 
          onNewProject={() => {}} // Disabled in demo
          projects={projects}
          isLoading={false}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-subtle scrollbar-none pt-12">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              Demo Workspace
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Experience Nexus with sample projects and data
            </p>
          </div>

          {/* Nova AI Chat Interface */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <NovaChatInterface 
              userName="Demo User"
              workspaceContext={{
                projects: [
                  { id: '1', name: 'E-commerce Platform', description: 'Build a modern e-commerce solution', status: 'In Progress', priority: 'high' },
                  { id: '2', name: 'Mobile App', description: 'iOS and Android application development', status: 'Planning', priority: 'medium' },
                  { id: '3', name: 'Marketing Campaign', description: 'Q1 marketing strategy and execution', status: 'Completed', priority: 'high' }
                ],
                tasks: [
                  { id: '1', title: 'Design user interface', description: 'Create mockups for main pages', status: 'In Progress', assignee: 'Sarah Chen', projectId: '1' },
                  { id: '2', title: 'Set up database', description: 'Configure PostgreSQL database', status: 'Completed', assignee: 'Mike Johnson', projectId: '1' },
                  { id: '3', title: 'Write API documentation', description: 'Document all endpoints', status: 'Pending', assignee: 'Alex Rodriguez', projectId: '1' }
                ],
                teamMembers: mockTeamMembers.map(m => ({
                  id: m.id,
                  name: m.name,
                  role: m.role,
                  status: m.status
                })),
                notes: [
                  { id: '1', title: 'Project Requirements', content: 'Key features and specifications', projectId: '1' },
                  { id: '2', title: 'Meeting Notes', content: 'Weekly team sync notes', projectId: '2' }
                ],
                currentUser: {
                  name: 'Demo User',
                  email: 'demo@nexus.ai'
                },
                businessStage: 'growth',
                industry: 'technology'
              }}
              onSendMessage={(message) => console.log("Demo Nova AI Message:", message)}
            />
          </div>

          {/* Workspace Tabs */}
          <WorkspaceTabs
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            activeProject={activeProject}
            onCloseProject={handleCloseProject}
            notesContent={<BuiltInNotes projectId={activeProject?.id} />}
            tasksContent={<ViewableTasks projectId={activeProject?.id} currentUser="Demo User" />}
            teamContent={<TeamManagement />}
            taskNotifications={0}
            teamNotifications={0}
          />

          {/* Content based on current tab */}
          {currentTab === "mindmap" && (
            <div className="space-y-8">
              {/* Project Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {filteredProjects.map((project, idx) => (
                  <div key={project.id} style={{ animationDelay: `${0.3 + idx * 0.1}s` }} className="animate-scale-in">
                    <ProjectCard
                      {...project}
                      onClick={() => handleOpenProject(project.id)}
                      isActive={activeProject?.id === project.id}
                      teamMembers={teamMembers.filter(member => member.projects.includes(project.id))}
                    />
                  </div>
                ))}
              </div>

              {/* Advanced Mindmap */}
              <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <AdvancedMindmap
                  nodes={dynamicMindmapNodes}
                  edges={mindmapEdges}
                  onNodeClick={(nodeId) => {
                    const node = dynamicMindmapNodes.find(n => n.id === nodeId);
                    if (node?.projectId) {
                      handleOpenProject(node.projectId);
                    }
                  }}
                  onAddSubProject={() => {}} // Disabled in demo
                  onAddLeg={() => {}} // Disabled in demo
                  onAddTask={() => {}} // Disabled in demo
                />
              </div>
            </div>
          )}

          {currentTab === "resources" && (
            <div className="animate-fade-in">
              <ResourcesSection />
            </div>
          )}

          {currentTab === "timer" && (
            <div className="animate-fade-in">
              <TimeTracker 
                userId="demo-user" 
                teamId="default-team"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden xl:flex w-[420px] h-screen p-6 animate-slide-in gap-4 pt-12">
        {/* Project Context Panel */}
        {activeProject && (
          <div className="w-[200px] overflow-y-auto">
            <ProjectContextPanel 
              project={activeProject} 
              teamMembers={teamMembers.filter(member => member.projects.includes(activeProject.id))}
              allTeamMembers={teamMembers}
              invitations={[]}
              onInviteMember={() => {}} // Disabled in demo
            />
          </div>
        )}
        
        {/* Activity Feed */}
        <div className="flex-1">
          <ActivityFeed 
            activities={activityFeed}
            teamMembers={teamMembers}
            maxHeight="calc(100vh - 200px)"
            showFilters={true}
          />
        </div>
      </div>

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
