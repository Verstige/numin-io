// AI Intelligence Engine for Nexus
// This simulates a more sophisticated AI system with project context awareness

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  tasksCompleted?: number;
  tasksTotal?: number;
  teamMembers?: number;
  daysUntilDeadline?: number;
  weeklyProgress?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  suggestions?: ActionSuggestion[];
}

export interface ActionSuggestion {
  id: string;
  type: "create_task" | "update_status" | "schedule_meeting" | "add_member" | "set_reminder";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  action?: () => void;
}

// Enhanced AI responses with project context
export function generateSmartResponse(
  userMessage: string,
  activeProject: ProjectContext | null,
  allProjects: ProjectContext[]
): { response: string; suggestions: ActionSuggestion[] } {
  const message = userMessage.toLowerCase();
  
  // Multi-project insights
  if (message.includes("compare") || message.includes("across") || message.includes("all projects")) {
    return generateMultiProjectInsights(allProjects);
  }
  
  // Project-specific responses
  if (activeProject) {
    return generateProjectSpecificResponse(message, activeProject, allProjects);
  }
  
  // General responses
  return generateGeneralResponse(message, allProjects);
}

function generateMultiProjectInsights(projects: ProjectContext[]): { response: string; suggestions: ActionSuggestion[] } {
  const activeProjects = projects.filter(p => p.status === "Active").length;
  const highPriorityProjects = projects.filter(p => p.priority === "high").length;
  const totalTasks = projects.reduce((sum, p) => sum + (p.tasksTotal || 0), 0);
  const completedTasks = projects.reduce((sum, p) => sum + (p.tasksCompleted || 0), 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const response = `## Portfolio Overview

**Active Projects:** ${activeProjects} of ${projects.length}
**High Priority:** ${highPriorityProjects} projects need urgent attention
**Overall Progress:** ${overallProgress}% completion rate

### Key Insights:
${projects.map(p => {
  const progress = p.tasksTotal ? Math.round((p.tasksCompleted || 0) / p.tasksTotal * 100) : 0;
  const status = p.status === "Active" ? "🟢" : p.status === "Planning" ? "🔵" : "⚪";
  return `${status} **${p.name}** - ${progress}% complete, ${p.priority} priority`;
}).join('\n')}

### Recommendations:
${highPriorityProjects > 2 ? "⚠️ You have multiple high-priority projects. Consider delegating or reprioritizing." : "✅ Your priority distribution looks balanced."}
${overallProgress < 50 ? "📈 Focus on completing existing tasks before starting new projects." : "🎯 Great momentum! Keep up the excellent progress."}`;

  const suggestions: ActionSuggestion[] = [
    {
      id: "review-priorities",
      type: "update_status",
      title: "Review Project Priorities",
      description: "Schedule a priority review session",
      priority: "medium"
    },
    {
      id: "progress-report",
      type: "create_task",
      title: "Generate Progress Report",
      description: "Create detailed progress report for stakeholders",
      priority: "low"
    }
  ];

  return { response, suggestions };
}

function generateProjectSpecificResponse(
  message: string,
  activeProject: ProjectContext,
  allProjects: ProjectContext[]
): { response: string; suggestions: ActionSuggestion[] } {
  const suggestions: ActionSuggestion[] = [];
  
  if (message.includes("progress") || message.includes("status")) {
    const progress = activeProject.tasksTotal ? 
      Math.round((activeProject.tasksCompleted || 0) / activeProject.tasksTotal * 100) : 0;
    
    const response = `## ${activeProject.name} Progress Report

**Current Status:** ${activeProject.status}
**Priority Level:** ${activeProject.priority}
**Completion Rate:** ${progress}%
**Team Size:** ${activeProject.teamMembers || 0} members

### Recent Activity:
• Last updated: 2 hours ago
• Tasks completed this week: ${Math.floor((activeProject.tasksCompleted || 0) * 0.3)}
• Current focus: ${activeProject.status === "Planning" ? "Project setup and planning" : "Active development"}

### Next Steps:
${activeProject.status === "Planning" ? 
  "🎯 Focus on finalizing project requirements and setting up the development timeline." :
  "🚀 Continue with current sprint and prepare for next milestone."}`;

    suggestions.push({
      id: "update-status",
      type: "update_status",
      title: "Update Project Status",
      description: "Mark next milestone as complete",
      priority: "medium"
    });

    return { response, suggestions };
  }
  
  if (message.includes("task") || message.includes("todo")) {
    const response = `## Task Management for ${activeProject.name}

**Current Tasks:** ${activeProject.tasksCompleted || 0} of ${activeProject.tasksTotal || 0} completed
**Upcoming Deadlines:** ${activeProject.daysUntilDeadline || 0} days remaining

### Suggested Tasks:
• Review and update project documentation
• Schedule team check-in meeting
• Prepare demo for stakeholders
• Update project timeline based on current progress

### Priority Actions:
${activeProject.priority === "high" ? "🔥 This is a high-priority project. Focus on critical path items first." : "📋 Work through tasks systematically."}`;

    suggestions.push(
      {
        id: "create-task",
        type: "create_task",
        title: "Add New Task",
        description: "Create a specific task for this project",
        priority: "medium"
      },
      {
        id: "schedule-meeting",
        type: "schedule_meeting",
        title: "Schedule Team Meeting",
        description: "Plan team check-in for project updates",
        priority: "low"
      }
    );

    return { response, suggestions };
  }
  
  if (message.includes("blocker") || message.includes("issue") || message.includes("problem")) {
    const response = `## Issue Analysis for ${activeProject.name}

I've detected potential blockers in your project. Here's my analysis:

### Potential Issues:
• **Resource Constraints:** Team capacity may be limiting progress
• **Timeline Pressure:** ${activeProject.daysUntilDeadline || 0} days remaining may require focus
• **Priority Conflicts:** ${activeProject.priority} priority needs attention

### Recommended Actions:
🎯 **Immediate:** Focus on critical path items
👥 **Team:** Schedule alignment meeting
📊 **Process:** Review and optimize workflow

### Quick Wins:
• Break down large tasks into smaller chunks
• Delegate non-critical items
• Set up daily standups for better communication`;

    suggestions.push(
      {
        id: "resolve-blocker",
        type: "create_task",
        title: "Address Project Blocker",
        description: "Create action plan for identified issues",
        priority: "high"
      },
      {
        id: "team-meeting",
        type: "schedule_meeting",
        title: "Team Blocker Discussion",
        description: "Schedule meeting to discuss and resolve issues",
        priority: "high"
      }
    );

    return { response, suggestions };
  }
  
  // Default project-specific response
  const response = `## ${activeProject.name} Overview

I'm here to help you with **${activeProject.name}**! This ${activeProject.priority} priority project is currently in the **${activeProject.status}** phase.

### Quick Insights:
• **Progress:** ${activeProject.tasksTotal ? Math.round((activeProject.tasksCompleted || 0) / activeProject.tasksTotal * 100) : 0}% complete
• **Team:** ${activeProject.teamMembers || 0} members working on this
• **Timeline:** ${activeProject.daysUntilDeadline || 0} days until deadline

### How I can help:
• 📊 **Progress tracking** - Get detailed status updates
• 🎯 **Task management** - Create and organize tasks
• 🚧 **Issue resolution** - Identify and solve blockers
• 📈 **Performance insights** - Analyze project metrics
• 🤝 **Team coordination** - Schedule meetings and check-ins

What would you like to focus on today?`;

  return { response, suggestions };
}

function generateGeneralResponse(
  message: string,
  allProjects: ProjectContext[]
): { response: string; suggestions: ActionSuggestion[] } {
  const suggestions: ActionSuggestion[] = [];
  
  if (message.includes("help") || message.includes("what can you do")) {
    const response = `## Welcome to Nexus! 🤖

I'm your AI-powered project management assistant. Here's what I can help you with:

### 📊 **Project Management**
• Track progress across all your projects
• Identify bottlenecks and blockers
• Suggest priority adjustments
• Generate performance reports

### 🎯 **Task Management**
• Create and organize tasks
• Set reminders and deadlines
• Track completion rates
• Suggest task prioritization

### 🤝 **Team Coordination**
• Schedule meetings and check-ins
• Identify resource conflicts
• Suggest team assignments
• Track team performance

### 📈 **Insights & Analytics**
• Compare projects across your portfolio
• Identify trends and patterns
• Predict project outcomes
• Suggest process improvements

### 🚀 **Getting Started**
You have ${allProjects.length} project${allProjects.length !== 1 ? 's' : ''} in your workspace. Select a project to get specific insights, or ask me about your overall portfolio!`;

    suggestions.push({
      id: "create-project",
      type: "create_task",
      title: "Create New Brand",
      description: "Start a new brand in your workspace",
      priority: "medium"
    });

    return { response, suggestions };
  }
  
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    const response = `Hello! 👋 I'm Nova, your AI project management assistant.

I'm here to help you manage your ${allProjects.length} project${allProjects.length !== 1 ? 's' : ''} more effectively. 

**Quick Actions:**
• Select a project to get specific insights
• Ask about progress, tasks, or blockers
• Request portfolio-wide comparisons
• Get recommendations for improvements

What would you like to work on today?`;

    return { response, suggestions };
  }
  
  // Default response
  const response = `I'm here to help you manage your projects more effectively! 

You currently have ${allProjects.length} project${allProjects.length !== 1 ? 's' : ''} in your workspace. 

**Try asking me:**
• "Show me progress for [project name]"
• "What are my current blockers?"
• "Compare all my projects"
• "Help me prioritize my tasks"
• "Create a task for [project]"

Select a specific project or ask me about your overall portfolio - I'm ready to assist!`;

  return { response, suggestions };
}

// Proactive suggestions based on project data
export function generateProactiveSuggestions(projects: ProjectContext[]): ActionSuggestion[] {
  const suggestions: ActionSuggestion[] = [];
  
  // Check for projects with approaching deadlines
  const urgentProjects = projects.filter(p => p.daysUntilDeadline && p.daysUntilDeadline <= 7);
  if (urgentProjects.length > 0) {
    suggestions.push({
      id: "urgent-deadline",
      type: "set_reminder",
      title: "Urgent Deadlines Approaching",
      description: `${urgentProjects.length} project${urgentProjects.length !== 1 ? 's' : ''} due within 7 days`,
      priority: "high"
    });
  }
  
  // Check for high-priority projects with low progress
  const stuckProjects = projects.filter(p => 
    p.priority === "high" && 
    p.tasksTotal && 
    p.tasksCompleted && 
    (p.tasksCompleted / p.tasksTotal) < 0.3
  );
  
  if (stuckProjects.length > 0) {
    suggestions.push({
      id: "stuck-projects",
      type: "create_task",
      title: "High-Priority Projects Need Attention",
      description: `${stuckProjects.length} high-priority project${stuckProjects.length !== 1 ? 's' : ''} below 30% completion`,
      priority: "high"
    });
  }
  
  // Check for projects without team members
  const unassignedProjects = projects.filter(p => !p.teamMembers || p.teamMembers === 0);
  if (unassignedProjects.length > 0) {
    suggestions.push({
      id: "unassigned-projects",
      type: "add_member",
      title: "Projects Need Team Members",
      description: `${unassignedProjects.length} project${unassignedProjects.length !== 1 ? 's' : ''} without assigned team members`,
      priority: "medium"
    });
  }
  
  return suggestions;
}


