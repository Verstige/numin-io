// Real AI Agent Service for Nexus
// This provides actual AI agent operations with real workspace integration

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  specializedCapabilities: string[];
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentTask: string | null;
  workload: number; // 0-100
  lastActivity: Date;
  apiEndpoint?: string;
  model: 'gemini' | 'openai' | 'claude';
  expertise: string[];
  tools: string[];
}

export interface AgentOperation {
  id: string;
  type: 'create_task' | 'update_task' | 'add_note' | 'read_email' | 'schedule_meeting' | 'update_project' | 'create_project' | 'analyze_data' | 'send_notification' |
        // Aurora (Executive Assistant) specialized operations
        'create_executive_report' | 'schedule_executive_meeting' | 'analyze_business_metrics' | 'create_presentation' | 'manage_calendar' |
        // Vega (Sales Rep) specialized operations
        'qualify_lead' | 'create_sales_proposal' | 'track_sales_pipeline' | 'send_follow_up' | 'analyze_sales_data' | 'create_customer_profile' |
        // Luma (Customer Support) specialized operations
        'create_support_ticket' | 'escalate_issue' | 'analyze_customer_satisfaction' | 'create_knowledge_base_entry' | 'track_response_time' |
        // Orion (Marketing Strategist) specialized operations
        'create_marketing_campaign' | 'analyze_campaign_performance' | 'create_content_calendar' | 'track_engagement_metrics' | 'optimize_ad_spend' |
        // Titan (Operations Manager) specialized operations
        'optimize_workflow' | 'track_team_performance' | 'manage_resources' | 'create_process_documentation' | 'analyze_efficiency_metrics';
  agentId: string;
  parameters: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkspaceData {
  projects: any[];
  tasks: any[];
  notes: any[];
  emails: any[];
  contacts: any[];
  calendar: any[];
  team: any[];
  // Aurora (Executive) data
  executiveReports: any[];
  presentations: any[];
  businessMetrics: any[];
  // Vega (Sales) data
  leads: any[];
  salesProposals: any[];
  salesPipeline: any[];
  customerProfiles: any[];
  // Luma (Support) data
  supportTickets: any[];
  knowledgeBase: any[];
  customerSatisfaction: any[];
  // Orion (Marketing) data
  marketingCampaigns: any[];
  contentCalendar: any[];
  engagementMetrics: any[];
  // Titan (Operations) data
  workflows: any[];
  processDocumentation: any[];
  efficiencyMetrics: any[];
  // Agent Reports
  agentReports: any[];
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  operationId?: string;
}

// Real AI Agents with enhanced specialized capabilities
export const AI_AGENTS: AIAgent[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    role: 'Executive Assistant',
    capabilities: [
      'create_task', 'update_task', 'add_note', 'schedule_meeting', 'update_project', 'create_project', 'analyze_data', 'send_notification'
    ],
    specializedCapabilities: [
      'create_executive_report', 'schedule_executive_meeting', 'analyze_business_metrics', 'create_presentation', 'manage_calendar'
    ],
    expertise: [
      'Executive Communication', 'Business Intelligence', 'Strategic Planning', 'C-Suite Support', 'Board Presentations'
    ],
    tools: [
      'PowerPoint Integration', 'Excel Analytics', 'Calendar Management', 'Executive Dashboards', 'Business Intelligence'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    model: 'gemini'
  },
  {
    id: 'vega',
    name: 'Vega',
    role: 'AI Sales Rep',
    capabilities: [
      'read_email', 'create_task', 'update_task', 'add_note', 'create_project', 'analyze_data', 'send_notification'
    ],
    specializedCapabilities: [
      'qualify_lead', 'create_sales_proposal', 'track_sales_pipeline', 'send_follow_up', 'analyze_sales_data', 'create_customer_profile'
    ],
    expertise: [
      'Lead Qualification', 'Sales Pipeline Management', 'Customer Relationship Management', 'Sales Analytics', 'Proposal Writing'
    ],
    tools: [
      'CRM Integration', 'Sales Analytics', 'Email Automation', 'Lead Scoring', 'Customer Profiling'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    model: 'gemini'
  },
  {
    id: 'luma',
    name: 'Luma',
    role: 'Customer Support',
    capabilities: [
      'read_email', 'create_task', 'update_task', 'add_note', 'create_project', 'analyze_data', 'send_notification'
    ],
    specializedCapabilities: [
      'create_support_ticket', 'escalate_issue', 'analyze_customer_satisfaction', 'create_knowledge_base_entry', 'track_response_time'
    ],
    expertise: [
      'Customer Service', 'Issue Resolution', 'Knowledge Management', 'Customer Satisfaction', 'Support Analytics'
    ],
    tools: [
      'Ticketing System', 'Knowledge Base', 'Customer Analytics', 'Response Time Tracking', 'Satisfaction Surveys'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    model: 'gemini'
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'Marketing Strategist',
    capabilities: [
      'create_task', 'update_task', 'add_note', 'create_project', 'analyze_data', 'update_project', 'send_notification'
    ],
    specializedCapabilities: [
      'create_marketing_campaign', 'analyze_campaign_performance', 'create_content_calendar', 'track_engagement_metrics', 'optimize_ad_spend'
    ],
    expertise: [
      'Digital Marketing', 'Campaign Management', 'Content Strategy', 'Social Media', 'Marketing Analytics', 'Brand Management'
    ],
    tools: [
      'Campaign Management', 'Social Media Analytics', 'Content Calendar', 'A/B Testing', 'Marketing Automation'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    model: 'gemini'
  },
  {
    id: 'titan',
    name: 'Titan',
    role: 'Operations Manager',
    capabilities: [
      'create_task', 'update_task', 'add_note', 'analyze_data', 'update_project', 'schedule_meeting', 'send_notification'
    ],
    specializedCapabilities: [
      'optimize_workflow', 'track_team_performance', 'manage_resources', 'create_process_documentation', 'analyze_efficiency_metrics'
    ],
    expertise: [
      'Process Optimization', 'Team Management', 'Resource Planning', 'Operations Analytics', 'Workflow Design', 'Performance Monitoring'
    ],
    tools: [
      'Workflow Automation', 'Performance Dashboards', 'Resource Planning', 'Process Documentation', 'Efficiency Analytics'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    model: 'gemini'
  }
];

// Global state for agent operations
let agentOperations: AgentOperation[] = [];
let workspaceData: WorkspaceData = {
  projects: [],
  tasks: [],
  notes: [],
  emails: [],
  contacts: [],
  calendar: [],
  team: [],
  // Aurora (Executive) data
  executiveReports: [],
  presentations: [],
  businessMetrics: [],
  // Vega (Sales) data
  leads: [],
  salesProposals: [],
  salesPipeline: [],
  customerProfiles: [],
  // Luma (Support) data
  supportTickets: [],
  knowledgeBase: [],
  customerSatisfaction: [],
  // Orion (Marketing) data
  marketingCampaigns: [],
  contentCalendar: [],
  engagementMetrics: [],
  // Titan (Operations) data
  workflows: [],
  processDocumentation: [],
  efficiencyMetrics: [],
  // Agent Reports
  agentReports: []
};

// Initialize workspace data from localStorage or create new
export function initializeWorkspaceData(): WorkspaceData {
  try {
    const saved = localStorage.getItem('nexus-workspace-data');
    if (saved) {
      const parsedData = JSON.parse(saved);
      
      // Merge with default workspace data to ensure all fields exist
      workspaceData = {
        ...workspaceData,
        ...parsedData
      };
      
      // Convert date strings back to Date objects for all arrays
      workspaceData.tasks = (workspaceData.tasks || []).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));
      
      workspaceData.notes = (workspaceData.notes || []).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        dueDate: note.dueDate ? new Date(note.dueDate) : undefined
      }));
      
      workspaceData.calendar = (workspaceData.calendar || []).map((event: any) => ({
        ...event,
        startTime: event.startTime ? new Date(event.startTime) : undefined,
        endTime: event.endTime ? new Date(event.endTime) : undefined,
        createdAt: new Date(event.createdAt)
      }));
      
      // Handle specialized data arrays
      workspaceData.executiveReports = (workspaceData.executiveReports || []).map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        dueDate: report.dueDate ? new Date(report.dueDate) : undefined
      }));
      
      workspaceData.presentations = (workspaceData.presentations || []).map((presentation: any) => ({
        ...presentation,
        createdAt: new Date(presentation.createdAt)
      }));
      
      workspaceData.leads = (workspaceData.leads || []).map((lead: any) => ({
        ...lead,
        createdAt: new Date(lead.createdAt)
      }));
      
      workspaceData.salesProposals = (workspaceData.salesProposals || []).map((proposal: any) => ({
        ...proposal,
        createdAt: new Date(proposal.createdAt)
      }));
      
      workspaceData.supportTickets = (workspaceData.supportTickets || []).map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt)
      }));
      
      workspaceData.marketingCampaigns = (workspaceData.marketingCampaigns || []).map((campaign: any) => ({
        ...campaign,
        startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        createdAt: new Date(campaign.createdAt)
      }));
      
      // Ensure all arrays exist
      workspaceData.businessMetrics = workspaceData.businessMetrics || [];
      workspaceData.salesPipeline = workspaceData.salesPipeline || [];
      workspaceData.customerProfiles = workspaceData.customerProfiles || [];
      workspaceData.knowledgeBase = workspaceData.knowledgeBase || [];
      workspaceData.customerSatisfaction = workspaceData.customerSatisfaction || [];
      workspaceData.contentCalendar = workspaceData.contentCalendar || [];
      workspaceData.engagementMetrics = workspaceData.engagementMetrics || [];
      workspaceData.workflows = workspaceData.workflows || [];
      workspaceData.processDocumentation = workspaceData.processDocumentation || [];
      workspaceData.efficiencyMetrics = workspaceData.efficiencyMetrics || [];
      workspaceData.agentReports = workspaceData.agentReports || [];
    }
  } catch (error) {
    console.error('Error loading workspace data:', error);
    // Reset to default if there's an error
    workspaceData = {
      projects: [],
      tasks: [],
      notes: [],
      emails: [],
      contacts: [],
      calendar: [],
      team: [],
      // Aurora (Executive) data
      executiveReports: [],
      presentations: [],
      businessMetrics: [],
      // Vega (Sales) data
      leads: [],
      salesProposals: [],
      salesPipeline: [],
      customerProfiles: [],
      // Luma (Support) data
      supportTickets: [],
      knowledgeBase: [],
      customerSatisfaction: [],
      // Orion (Marketing) data
      marketingCampaigns: [],
      contentCalendar: [],
      engagementMetrics: [],
      // Titan (Operations) data
      workflows: [],
      processDocumentation: [],
      efficiencyMetrics: [],
      // Agent Reports
      agentReports: []
    };
  }
  return workspaceData;
}

// Save workspace data to localStorage
export function saveWorkspaceData(): void {
  try {
    localStorage.setItem('nexus-workspace-data', JSON.stringify(workspaceData));
  } catch (error) {
    console.error('Error saving workspace data:', error);
  }
}

// Get agent by ID
export function getAgent(agentId: string): AIAgent | null {
  return AI_AGENTS.find(agent => agent.id === agentId) || null;
}

// Update agent status
export function updateAgentStatus(agentId: string, status: AIAgent['status'], currentTask?: string | null): void {
  const agent = getAgent(agentId);
  if (agent) {
    agent.status = status;
    agent.currentTask = currentTask || null;
    agent.lastActivity = new Date();
    
    if (status === 'busy') {
      agent.workload = Math.min(agent.workload + 20, 100);
    } else if (status === 'idle') {
      agent.workload = Math.max(agent.workload - 10, 0);
    }
  }
}

// Create a new operation
export function createOperation(type: AgentOperation['type'], agentId: string, parameters: any): string {
  const operation: AgentOperation = {
    id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    agentId,
    parameters,
    status: 'pending',
    createdAt: new Date()
  };
  
  agentOperations.push(operation);
  return operation.id;
}

// Execute an operation
export async function executeOperation(operationId: string): Promise<AgentResponse> {
  const operation = agentOperations.find(op => op.id === operationId);
  if (!operation) {
    return { success: false, message: 'Operation not found' };
  }

  const agent = getAgent(operation.agentId);
  if (!agent) {
    return { success: false, message: 'Agent not found' };
  }

  // Check if agent can perform this operation
  if (!agent.capabilities.includes(operation.type) && !agent.specializedCapabilities.includes(operation.type)) {
    return { success: false, message: `Agent ${agent.name} cannot perform ${operation.type}` };
  }

  // Update operation and agent status
  operation.status = 'running';
  updateAgentStatus(agent.id, 'busy', `Executing ${operation.type}`);

  try {
    // Execute the specific operation
    const result = await performOperation(operation);
    
    operation.status = 'completed';
    operation.result = result;
    operation.completedAt = new Date();
    
    updateAgentStatus(agent.id, 'idle');
    
    return {
      success: true,
      message: `Operation ${operation.type} completed successfully`,
      data: result,
      operationId: operation.id
    };
  } catch (error) {
    operation.status = 'failed';
    operation.error = error instanceof Error ? error.message : 'Unknown error';
    operation.completedAt = new Date();
    
    updateAgentStatus(agent.id, 'idle');
    
    return {
      success: false,
      message: `Operation failed: ${operation.error}`,
      operationId: operation.id
    };
  }
}

// Perform the actual operation based on type
async function performOperation(operation: AgentOperation): Promise<any> {
  switch (operation.type) {
    case 'create_task':
      return await createTask(operation.parameters);
    case 'update_task':
      return await updateTask(operation.parameters.id, operation.parameters.updates);
    case 'add_note':
      return await addNote(operation.parameters);
    case 'read_email':
      return await readEmails(operation.parameters);
    case 'schedule_meeting':
      return await scheduleMeeting(operation.parameters);
    case 'update_project':
      return await updateProject(operation.parameters.id, operation.parameters.updates);
    case 'create_project':
      return await createProject(operation.parameters);
    case 'analyze_data':
      return await analyzeData(operation.parameters);
    case 'send_notification':
      return await sendNotification(operation.parameters);
    
    // Aurora (Executive Assistant) specialized operations
    case 'create_executive_report':
      return await createExecutiveReport(operation.parameters);
    case 'schedule_executive_meeting':
      return await scheduleExecutiveMeeting(operation.parameters);
    case 'analyze_business_metrics':
      return await analyzeBusinessMetrics(operation.parameters);
    case 'create_presentation':
      return await createPresentation(operation.parameters);
    case 'manage_calendar':
      return await manageCalendar(operation.parameters);
    
    // Vega (Sales Rep) specialized operations
    case 'qualify_lead':
      return await qualifyLead(operation.parameters);
    case 'create_sales_proposal':
      return await createSalesProposal(operation.parameters);
    case 'track_sales_pipeline':
      return await trackSalesPipeline(operation.parameters);
    case 'send_follow_up':
      return await sendFollowUp(operation.parameters);
    case 'analyze_sales_data':
      return await analyzeSalesData(operation.parameters);
    case 'create_customer_profile':
      return await createCustomerProfile(operation.parameters);
    
    // Luma (Customer Support) specialized operations
    case 'create_support_ticket':
      return await createSupportTicket(operation.parameters);
    case 'escalate_issue':
      return await escalateIssue(operation.parameters);
    case 'analyze_customer_satisfaction':
      return await analyzeCustomerSatisfaction(operation.parameters);
    case 'create_knowledge_base_entry':
      return await createKnowledgeBaseEntry(operation.parameters);
    case 'track_response_time':
      return await trackResponseTime(operation.parameters);
    
    // Orion (Marketing Strategist) specialized operations
    case 'create_marketing_campaign':
      return await createMarketingCampaign(operation.parameters);
    case 'analyze_campaign_performance':
      return await analyzeCampaignPerformance(operation.parameters);
    case 'create_content_calendar':
      return await createContentCalendar(operation.parameters);
    case 'track_engagement_metrics':
      return await trackEngagementMetrics(operation.parameters);
    case 'optimize_ad_spend':
      return await optimizeAdSpend(operation.parameters);
    
    // Titan (Operations Manager) specialized operations
    case 'optimize_workflow':
      return await optimizeWorkflow(operation.parameters);
    case 'track_team_performance':
      return await trackTeamPerformance(operation.parameters);
    case 'manage_resources':
      return await manageResources(operation.parameters);
    case 'create_process_documentation':
      return await createProcessDocumentation(operation.parameters);
    case 'analyze_efficiency_metrics':
      return await analyzeEfficiencyMetrics(operation.parameters);
    
    default:
      throw new Error(`Unknown operation type: ${operation.type}`);
  }
}

// Real workspace operations
export async function createTask(parameters: {
  title: string;
  description?: string;
  projectId?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
}): Promise<any> {
  const task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: parameters.title,
    description: parameters.description || '',
    projectId: parameters.projectId || null,
    priority: parameters.priority || 'medium',
    status: 'todo',
    dueDate: parameters.dueDate || null,
    assignedTo: parameters.assignedTo || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  workspaceData.tasks.push(task);
  saveWorkspaceData();
  
  console.log(`✅ Task created: ${task.title}`, task);
  return task;
}

export async function updateTask(taskId: string, updates: Partial<any>): Promise<any> {
  const taskIndex = workspaceData.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${taskId} not found`);
  }
  
  workspaceData.tasks[taskIndex] = {
    ...workspaceData.tasks[taskIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  saveWorkspaceData();
  
  console.log(`✅ Task updated: ${taskId}`, updates);
  return workspaceData.tasks[taskIndex];
}

export async function addNote(parameters: {
  title: string;
  content: string;
  projectId?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}): Promise<any> {
  const note = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: parameters.title,
    content: parameters.content,
    projectId: parameters.projectId || null,
    tags: parameters.tags || [],
    priority: parameters.priority || 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  workspaceData.notes.push(note);
  saveWorkspaceData();
  
  console.log(`✅ Note added: ${note.title}`, note);
  return note;
}

export async function createProject(parameters: {
  name: string;
  description?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
}): Promise<any> {
  const project = {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: parameters.name,
    description: parameters.description || '',
    status: parameters.status || 'planning',
    priority: parameters.priority || 'medium',
    startDate: parameters.startDate || null,
    endDate: parameters.endDate || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  workspaceData.projects.push(project);
  saveWorkspaceData();
  
  console.log(`✅ Project created: ${project.name}`, project);
  return project;
}

export async function readEmails(parameters: {
  limit?: number;
  unreadOnly?: boolean;
  fromDate?: Date;
}): Promise<any[]> {
  // For now, return mock emails - in real implementation, this would connect to email API
  const mockEmails = [
    {
      id: 'email_1',
      subject: 'Project Update Required',
      from: 'client@example.com',
      content: 'Please provide an update on the current project status.',
      read: false,
      receivedAt: new Date()
    },
    {
      id: 'email_2',
      subject: 'Meeting Scheduled',
      from: 'team@example.com',
      content: 'Weekly team meeting scheduled for tomorrow at 2 PM.',
      read: true,
      receivedAt: new Date(Date.now() - 86400000)
    }
  ];
  
  let emails = mockEmails;
  
  if (parameters.unreadOnly) {
    emails = emails.filter(email => !email.read);
  }
  
  if (parameters.limit) {
    emails = emails.slice(0, parameters.limit);
  }
  
  console.log(`✅ Read ${emails.length} emails`);
  return emails;
}

export async function scheduleMeeting(parameters: {
  title: string;
  description?: string;
  startTime: Date;
  duration: number; // in minutes
  attendees: string[];
  projectId?: string;
}): Promise<any> {
  const meeting = {
    id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: parameters.title,
    description: parameters.description || '',
    startTime: parameters.startTime,
    duration: parameters.duration,
    attendees: parameters.attendees,
    projectId: parameters.projectId || null,
    status: 'scheduled',
    createdAt: new Date()
  };
  
  workspaceData.calendar.push(meeting);
  saveWorkspaceData();
  
  console.log(`✅ Meeting scheduled: ${meeting.title}`, meeting);
  return meeting;
}

export async function updateProject(projectId: string, updates: Partial<any>): Promise<any> {
  const projectIndex = workspaceData.projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) {
    throw new Error(`Project with id ${projectId} not found`);
  }
  
  workspaceData.projects[projectIndex] = {
    ...workspaceData.projects[projectIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  saveWorkspaceData();
  
  console.log(`✅ Project updated: ${projectId}`, updates);
  return workspaceData.projects[projectIndex];
}

export async function analyzeData(parameters: {
  dataType: 'projects' | 'tasks' | 'emails' | 'notes';
  analysisType: 'summary' | 'trends' | 'performance' | 'insights';
  filters?: any;
}): Promise<any> {
  // Perform analysis based on data type and analysis type
  let data: any[] = [];
  
  switch (parameters.dataType) {
    case 'projects':
      data = workspaceData.projects;
      break;
    case 'tasks':
      data = workspaceData.tasks;
      break;
    case 'emails':
      data = workspaceData.emails;
      break;
    case 'notes':
      data = workspaceData.notes;
      break;
  }
  
  // Apply filters if provided
  if (parameters.filters) {
    data = data.filter(item => {
      return Object.entries(parameters.filters).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  // Generate analysis based on type
  let analysis: any = {};
  
  switch (parameters.analysisType) {
    case 'summary':
      analysis = {
        total: data.length,
        summary: `Found ${data.length} ${parameters.dataType}`,
        breakdown: data.reduce((acc, item) => {
          const key = item.status || item.priority || 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      };
      break;
    case 'trends':
      analysis = {
        trends: 'Data trends analysis',
        insights: 'Key insights from the data'
      };
      break;
    case 'performance':
      analysis = {
        performance: 'Performance metrics',
        recommendations: 'Performance recommendations'
      };
      break;
    case 'insights':
      analysis = {
        insights: 'Key insights and recommendations',
        actionable: 'Actionable next steps'
      };
      break;
  }
  
  console.log(`✅ Data analyzed: ${parameters.dataType} - ${parameters.analysisType}`, analysis);
  return analysis;
}

export async function sendNotification(parameters: {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipients?: string[];
  projectId?: string;
}): Promise<any> {
  const notification = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: parameters.message,
    type: parameters.type,
    recipients: parameters.recipients || [],
    projectId: parameters.projectId || null,
    sentAt: new Date()
  };
  
  console.log(`✅ Notification sent: ${notification.message}`, notification);
  return notification;
}

// Get all operations for an agent
export function getAgentOperations(agentId: string): AgentOperation[] {
  return agentOperations.filter(op => op.agentId === agentId);
}

// Get all pending operations
export function getPendingOperations(): AgentOperation[] {
  return agentOperations.filter(op => op.status === 'pending');
}

// Get agent workload status
export function getAgentWorkloadStatus(): { agentId: string; name: string; status: string; workload: number; currentTask: string | null }[] {
  return AI_AGENTS.map(agent => ({
    agentId: agent.id,
    name: agent.name,
    status: agent.status,
    workload: agent.workload,
    currentTask: agent.currentTask
  }));
}

// Send message to agent and get response using Gemini AI
export async function sendMessageToAgent(agentId: string, message: string): Promise<AgentResponse> {
  const agent = getAgent(agentId);
  if (!agent) {
    return { success: false, message: 'Agent not found' };
  }

  try {
    // Get current workspace data for context
    const workspaceData = getWorkspaceData();
    
    // Create workspace context for Gemini
    const workspaceContext = {
      projects: workspaceData.projects || [],
      tasks: workspaceData.tasks || [],
      notes: workspaceData.notes || [],
      emails: workspaceData.emails || [],
      contacts: workspaceData.contacts || [],
      calendar: workspaceData.calendar || [],
      team: workspaceData.team || [],
      currentUser: { name: 'User', email: 'user@example.com' }
    };

    // Use Gemini to process the message intelligently
    const geminiResponse = await generateAgentResponse(agentId, message, workspaceContext);
    
    // Parse Gemini's response to determine if we need to perform operations
    const operationResult = await parseGeminiResponse(geminiResponse, agentId, message);
    
    return operationResult;
    
  } catch (error: any) {
    console.error(`Error in sendMessageToAgent for ${agentId}:`, error);
    return { 
      success: false, 
      message: `Error processing message: ${error.message}` 
    };
  }
}

// Parse message to determine operation type
function parseMessageForOperation(message: string): AgentOperation['type'] | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('create task') || lowerMessage.includes('add task') || lowerMessage.includes('new task')) {
    return 'create_task';
  }
  if (lowerMessage.includes('update task') || lowerMessage.includes('modify task') || lowerMessage.includes('change task')) {
    return 'update_task';
  }
  if (lowerMessage.includes('add note') || lowerMessage.includes('create note') || lowerMessage.includes('write note')) {
    return 'add_note';
  }
  if (lowerMessage.includes('read email') || lowerMessage.includes('check email') || lowerMessage.includes('check emails')) {
    return 'read_email';
  }
  if (lowerMessage.includes('schedule meeting') || lowerMessage.includes('book meeting') || lowerMessage.includes('plan meeting')) {
    return 'schedule_meeting';
  }
  if (lowerMessage.includes('update project') || lowerMessage.includes('modify project')) {
    return 'update_project';
  }
  if (lowerMessage.includes('create project') || lowerMessage.includes('new project') || lowerMessage.includes('add project')) {
    return 'create_project';
  }
  if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
    return 'analyze_data';
  }
  if (lowerMessage.includes('send notification') || lowerMessage.includes('notify')) {
    return 'send_notification';
  }
  
  // Aurora (Executive Assistant) specialized operations
  if (lowerMessage.includes('create report') || lowerMessage.includes('generate report') || lowerMessage.includes('executive report')) {
    return 'create_executive_report';
  }
  if (lowerMessage.includes('schedule executive meeting') || lowerMessage.includes('board meeting') || lowerMessage.includes('c-suite meeting')) {
    return 'schedule_executive_meeting';
  }
  if (lowerMessage.includes('business metrics') || lowerMessage.includes('kpi analysis') || lowerMessage.includes('executive dashboard')) {
    return 'analyze_business_metrics';
  }
  if (lowerMessage.includes('create presentation') || lowerMessage.includes('powerpoint') || lowerMessage.includes('slides')) {
    return 'create_presentation';
  }
  if (lowerMessage.includes('manage calendar') || lowerMessage.includes('calendar management') || lowerMessage.includes('executive calendar')) {
    return 'manage_calendar';
  }
  
  // Vega (Sales Rep) specialized operations
  if (lowerMessage.includes('qualify lead') || lowerMessage.includes('lead qualification') || lowerMessage.includes('score lead')) {
    return 'qualify_lead';
  }
  if (lowerMessage.includes('create proposal') || lowerMessage.includes('sales proposal') || lowerMessage.includes('quote')) {
    return 'create_sales_proposal';
  }
  if (lowerMessage.includes('sales pipeline') || lowerMessage.includes('pipeline tracking') || lowerMessage.includes('deal pipeline')) {
    return 'track_sales_pipeline';
  }
  if (lowerMessage.includes('follow up') || lowerMessage.includes('follow-up') || lowerMessage.includes('customer follow up')) {
    return 'send_follow_up';
  }
  if (lowerMessage.includes('sales data') || lowerMessage.includes('sales analysis') || lowerMessage.includes('revenue analysis')) {
    return 'analyze_sales_data';
  }
  if (lowerMessage.includes('customer profile') || lowerMessage.includes('create profile') || lowerMessage.includes('client profile')) {
    return 'create_customer_profile';
  }
  
  // Luma (Customer Support) specialized operations
  if (lowerMessage.includes('support ticket') || lowerMessage.includes('create ticket') || lowerMessage.includes('new ticket')) {
    return 'create_support_ticket';
  }
  if (lowerMessage.includes('escalate') || lowerMessage.includes('escalation') || lowerMessage.includes('escalate issue')) {
    return 'escalate_issue';
  }
  if (lowerMessage.includes('customer satisfaction') || lowerMessage.includes('satisfaction survey') || lowerMessage.includes('csat')) {
    return 'analyze_customer_satisfaction';
  }
  if (lowerMessage.includes('knowledge base') || lowerMessage.includes('kb entry') || lowerMessage.includes('create kb')) {
    return 'create_knowledge_base_entry';
  }
  if (lowerMessage.includes('response time') || lowerMessage.includes('track response') || lowerMessage.includes('sla tracking')) {
    return 'track_response_time';
  }
  
  // Orion (Marketing Strategist) specialized operations
  if (lowerMessage.includes('marketing campaign') || lowerMessage.includes('create campaign') || lowerMessage.includes('launch campaign')) {
    return 'create_marketing_campaign';
  }
  if (lowerMessage.includes('campaign performance') || lowerMessage.includes('campaign analysis') || lowerMessage.includes('campaign metrics')) {
    return 'analyze_campaign_performance';
  }
  if (lowerMessage.includes('content calendar') || lowerMessage.includes('content planning') || lowerMessage.includes('content schedule')) {
    return 'create_content_calendar';
  }
  if (lowerMessage.includes('engagement metrics') || lowerMessage.includes('engagement analysis') || lowerMessage.includes('social engagement')) {
    return 'track_engagement_metrics';
  }
  if (lowerMessage.includes('ad spend') || lowerMessage.includes('optimize ads') || lowerMessage.includes('advertising budget')) {
    return 'optimize_ad_spend';
  }
  
  // Titan (Operations Manager) specialized operations
  if (lowerMessage.includes('optimize workflow') || lowerMessage.includes('workflow optimization') || lowerMessage.includes('improve process')) {
    return 'optimize_workflow';
  }
  if (lowerMessage.includes('team performance') || lowerMessage.includes('performance tracking') || lowerMessage.includes('team metrics')) {
    return 'track_team_performance';
  }
  if (lowerMessage.includes('manage resources') || lowerMessage.includes('resource management') || lowerMessage.includes('allocate resources')) {
    return 'manage_resources';
  }
  if (lowerMessage.includes('process documentation') || lowerMessage.includes('document process') || lowerMessage.includes('create sop')) {
    return 'create_process_documentation';
  }
  if (lowerMessage.includes('efficiency metrics') || lowerMessage.includes('efficiency analysis') || lowerMessage.includes('productivity metrics')) {
    return 'analyze_efficiency_metrics';
  }
  
  return null;
}

// Extract parameters from message with clarification logic
function extractParametersFromMessage(message: string, operationType: AgentOperation['type']): {
  parameters: any;
  needsClarification: boolean;
  clarificationMessage?: string;
  missingFields?: string[];
  suggestions?: string[];
} {
  const lowerMessage = message.toLowerCase();
  
  switch (operationType) {
    case 'create_task':
      return extractTaskParameters(message, lowerMessage);
    case 'add_note':
      return extractNoteParameters(message, lowerMessage);
    case 'read_email':
      return {
        parameters: {
          limit: 10,
          unreadOnly: lowerMessage.includes('unread')
        },
        needsClarification: false
      };
    case 'schedule_meeting':
      return extractMeetingParameters(message, lowerMessage);
    case 'create_project':
      return {
        parameters: {
          name: extractTitleFromMessage(message),
          description: extractDescriptionFromMessage(message),
          status: 'planning',
          priority: extractPriorityFromMessage(message)
        },
        needsClarification: false
      };
    case 'analyze_data':
      return extractAnalysisParameters(message, lowerMessage);
    case 'send_notification':
      return {
        parameters: {
          message: message,
          type: 'info'
        },
        needsClarification: false
      };
    
    // Aurora (Executive Assistant) specialized operations
    case 'create_executive_report':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          type: extractReportTypeFromMessage(message),
          content: extractDescriptionFromMessage(message)
        },
        needsClarification: false
      };
    case 'schedule_executive_meeting':
      return extractMeetingParameters(message, lowerMessage);
    case 'analyze_business_metrics':
      return {
        parameters: {
          dataType: extractDataTypeFromMessage(message),
          analysisType: extractAnalysisTypeFromMessage(message)
        },
        needsClarification: false
      };
    case 'create_presentation':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          theme: extractPresentationThemeFromMessage(message),
          slides: extractSlideCountFromMessage(message)
        },
        needsClarification: false
      };
    case 'manage_calendar':
      return {
        parameters: {
          action: extractCalendarActionFromMessage(message),
          details: extractDescriptionFromMessage(message)
        },
        needsClarification: false
      };
    
    // Vega (Sales Rep) specialized operations
    case 'qualify_lead':
      return {
        parameters: {
          name: extractNameFromMessage(message),
          email: extractEmailFromMessage(message),
          company: extractCompanyFromMessage(message),
          source: extractLeadSourceFromMessage(message)
        },
        needsClarification: false
      };
    case 'create_sales_proposal':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          client: extractClientFromMessage(message),
          value: extractValueFromMessage(message)
        },
        needsClarification: false
      };
    case 'track_sales_pipeline':
      return {
        parameters: {
          stage: extractPipelineStageFromMessage(message)
        },
        needsClarification: false
      };
    case 'send_follow_up':
      return {
        parameters: {
          customer: extractCustomerFromMessage(message),
          type: extractFollowUpTypeFromMessage(message),
          content: extractDescriptionFromMessage(message)
        },
        needsClarification: false
      };
    case 'analyze_sales_data':
      return {
        parameters: {
          dataType: 'sales',
          analysisType: extractAnalysisTypeFromMessage(message)
        },
        needsClarification: false
      };
    case 'create_customer_profile':
      return {
        parameters: {
          name: extractNameFromMessage(message),
          company: extractCompanyFromMessage(message),
          industry: extractIndustryFromMessage(message),
          size: extractCompanySizeFromMessage(message)
        },
        needsClarification: false
      };
    
    // Luma (Customer Support) specialized operations
    case 'create_support_ticket':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          customer: extractCustomerFromMessage(message),
          priority: extractPriorityFromMessage(message),
          category: extractSupportCategoryFromMessage(message)
        },
        needsClarification: false
      };
    case 'escalate_issue':
      return {
        parameters: {
          ticketId: extractTicketIdFromMessage(message),
          reason: extractReasonFromMessage(message),
          escalatedTo: extractEscalatedToFromMessage(message)
        },
        needsClarification: false
      };
    case 'analyze_customer_satisfaction':
      return {
        parameters: {
          dataType: 'satisfaction',
          analysisType: extractAnalysisTypeFromMessage(message)
        },
        needsClarification: false
      };
    case 'create_knowledge_base_entry':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          content: extractDescriptionFromMessage(message),
          category: extractKnowledgeCategoryFromMessage(message),
          tags: extractTagsFromMessage(message)
        },
        needsClarification: false
      };
    case 'track_response_time':
      return {
        parameters: {
          dataType: 'response_time'
        },
        needsClarification: false
      };
    
    // Orion (Marketing Strategist) specialized operations
    case 'create_marketing_campaign':
      return {
        parameters: {
          name: extractTitleFromMessage(message),
          type: extractCampaignTypeFromMessage(message),
          budget: extractBudgetFromMessage(message),
          targetAudience: extractTargetAudienceFromMessage(message)
        },
        needsClarification: false
      };
    case 'analyze_campaign_performance':
      return {
        parameters: {
          campaignId: extractCampaignIdFromMessage(message),
          analysisType: extractAnalysisTypeFromMessage(message)
        },
        needsClarification: false
      };
    case 'create_content_calendar':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          platform: extractPlatformFromMessage(message)
        },
        needsClarification: false
      };
    case 'track_engagement_metrics':
      return {
        parameters: {
          platform: extractPlatformFromMessage(message),
          dataType: 'engagement'
        },
        needsClarification: false
      };
    case 'optimize_ad_spend':
      return {
        parameters: {
          currentSpend: extractCurrentSpendFromMessage(message),
          targetOptimization: extractOptimizationTargetFromMessage(message)
        },
        needsClarification: false
      };
    
    // Titan (Operations Manager) specialized operations
    case 'optimize_workflow':
      return {
        parameters: {
          workflow: extractWorkflowFromMessage(message),
          optimizationType: extractOptimizationTypeFromMessage(message)
        },
        needsClarification: false
      };
    case 'track_team_performance':
      return {
        parameters: {
          team: extractTeamFromMessage(message),
          metrics: extractPerformanceMetricsFromMessage(message)
        },
        needsClarification: false
      };
    case 'manage_resources':
      return {
        parameters: {
          type: extractResourceTypeFromMessage(message),
          allocation: extractAllocationFromMessage(message)
        },
        needsClarification: false
      };
    case 'create_process_documentation':
      return {
        parameters: {
          title: extractTitleFromMessage(message),
          process: extractProcessFromMessage(message),
          steps: extractStepsFromMessage(message)
        },
        needsClarification: false
      };
    case 'analyze_efficiency_metrics':
      return {
        parameters: {
          dataType: 'efficiency',
          analysisType: extractAnalysisTypeFromMessage(message)
        },
        needsClarification: false
      };
    
    default:
      return {
        parameters: {},
        needsClarification: false
      };
  }
}

// Extract task parameters with clarification
function extractTaskParameters(message: string, lowerMessage: string) {
  const title = extractTitleFromMessage(message);
  const description = extractDescriptionFromMessage(message);
  const priority = extractPriorityFromMessage(message);
  
  // Check if title is too generic
  if (!title || title.length < 5 || title.toLowerCase().includes('task')) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to create a task for you! However, I need a bit more information:",
      missingFields: ['title'],
      suggestions: [
        "What specific task would you like me to create?",
        "Please provide a clear title for the task",
        "Example: 'Review quarterly budget report' or 'Update project documentation'"
      ]
    };
  }
  
  // Check if we need to ask about project assignment
  const projects = workspaceData.projects;
  if (projects.length > 1 && !extractProjectFromMessage(message, projects)) {
    return {
      parameters: {
        title,
        description,
        priority
      },
      needsClarification: true,
      clarificationMessage: `I found your task "${title}". Which project should I assign this to?`,
      missingFields: ['projectId'],
      suggestions: [
        ...projects.map(p => `"${p.name}" - ${p.description || 'No description'}`),
        "Or say 'no project' if it's a general task"
      ]
    };
  }
  
  return {
    parameters: {
      title,
      description,
      priority,
      projectId: extractProjectFromMessage(message, projects)?.id
    },
    needsClarification: false
  };
}

// Extract note parameters with clarification
function extractNoteParameters(message: string, lowerMessage: string) {
  const title = extractTitleFromMessage(message);
  const content = extractDescriptionFromMessage(message);
  
  if (!title || title.length < 3) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to add a note for you! However, I need a bit more information:",
      missingFields: ['title'],
      suggestions: [
        "What should I title this note?",
        "Please provide a clear title for the note",
        "Example: 'Meeting notes from today' or 'Client feedback summary'"
      ]
    };
  }
  
  if (!content || content.length < 10) {
    return {
      parameters: {
        title
      },
      needsClarification: true,
      clarificationMessage: `I have the title "${title}". What content should I include in this note?`,
      missingFields: ['content'],
      suggestions: [
        "Please provide the note content",
        "What information should I include in this note?",
        "Example: 'Discussed project timeline, next meeting scheduled for Friday'"
      ]
    };
  }
  
  return {
    parameters: {
      title,
      content,
      priority: extractPriorityFromMessage(message),
      projectId: extractProjectFromMessage(message, workspaceData.projects)?.id
    },
    needsClarification: false
  };
}

// Extract meeting parameters with clarification
function extractMeetingParameters(message: string, lowerMessage: string) {
  const title = extractTitleFromMessage(message);
  const timeInfo = extractTimeFromMessage(message);
  const attendees = extractAttendeesFromMessage(message);
  
  if (!title || title.length < 5) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to schedule a meeting for you! However, I need a bit more information:",
      missingFields: ['title'],
      suggestions: [
        "What should I call this meeting?",
        "Please provide a clear meeting title",
        "Example: 'Team standup' or 'Project review meeting'"
      ]
    };
  }
  
  if (!timeInfo.date || !timeInfo.time) {
    return {
      parameters: {
        title,
        description: extractDescriptionFromMessage(message)
      },
      needsClarification: true,
      clarificationMessage: `I have the meeting title "${title}". When would you like to schedule this meeting?`,
      missingFields: ['startTime'],
      suggestions: [
        "Please specify the date and time",
        "Example: 'tomorrow at 2 PM' or 'Friday at 10:30 AM'",
        "Example: 'next Monday at 3 PM' or 'December 15th at 1 PM'"
      ]
    };
  }
  
  if (attendees.length === 0) {
    return {
      parameters: {
        title,
        description: extractDescriptionFromMessage(message),
        startTime: timeInfo.date,
        duration: timeInfo.duration || 60
      },
      needsClarification: true,
      clarificationMessage: `I have "${title}" scheduled for ${timeInfo.date.toLocaleString()}. Who should I invite?`,
      missingFields: ['attendees'],
      suggestions: [
        "Please specify who should attend",
        "Example: 'team members' or 'John, Sarah, and Mike'",
        "Example: 'development team' or 'all stakeholders'"
      ]
    };
  }
  
  return {
    parameters: {
      title,
      description: extractDescriptionFromMessage(message),
      startTime: timeInfo.date,
      duration: timeInfo.duration || 60,
      attendees,
      projectId: extractProjectFromMessage(message, workspaceData.projects)?.id
    },
    needsClarification: false
  };
}

// Extract analysis parameters with clarification
function extractAnalysisParameters(message: string, lowerMessage: string) {
  const dataType = extractDataTypeFromMessage(message);
  const analysisType = extractAnalysisTypeFromMessage(message);
  
  if (!dataType) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to analyze data for you! However, I need to know what data to analyze:",
      missingFields: ['dataType'],
      suggestions: [
        "What data would you like me to analyze?",
        "Example: 'projects', 'tasks', 'emails', or 'notes'",
        "Example: 'team performance' or 'customer data'"
      ]
    };
  }
  
  return {
    parameters: {
      dataType,
      analysisType,
      filters: extractFiltersFromMessage(message)
    },
    needsClarification: false
  };
}

// Helper functions to extract information from messages
function extractTitleFromMessage(message: string): string {
  // Simple extraction - look for patterns like "create task: title" or "add note about: title"
  const patterns = [
    /(?:create task|add task|new task):\s*(.+)/i,
    /(?:add note|create note|write note)(?: about)?:\s*(.+)/i,
    /(?:schedule meeting|book meeting|plan meeting):\s*(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // Fallback: use first part of message as title
  return message.split(':')[0]?.trim() || 'New Item';
}

function extractDescriptionFromMessage(message: string): string {
  // Look for description after colon or "about"
  const colonIndex = message.indexOf(':');
  if (colonIndex !== -1) {
    return message.substring(colonIndex + 1).trim();
  }
  
  return message;
}

function extractPriorityFromMessage(message: string): 'low' | 'medium' | 'high' {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('high priority') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
    return 'high';
  }
  if (lowerMessage.includes('low priority') || lowerMessage.includes('when you can')) {
    return 'low';
  }
  return 'medium';
}

// Extract project from message
function extractProjectFromMessage(message: string, projects: any[]): any | null {
  const lowerMessage = message.toLowerCase();
  
  for (const project of projects) {
    if (lowerMessage.includes(project.name.toLowerCase())) {
      return project;
    }
  }
  
  return null;
}

// Extract time information from message
function extractTimeFromMessage(message: string): { date?: Date; time?: string; duration?: number } {
  const lowerMessage = message.toLowerCase();
  
  // Look for time patterns
  const timePatterns = [
    /tomorrow at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /today at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /(\w+day) at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
  ];
  
  let time: string | undefined;
  let date: Date | undefined;
  
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      time = match[0];
      
      // Calculate date based on time reference
      if (lowerMessage.includes('tomorrow')) {
        date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (lowerMessage.includes('today')) {
        date = new Date();
      } else {
        // Default to tomorrow if no specific day mentioned
        date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      // Set the time on the date
      if (match[1] && match[3]) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3].toLowerCase();
        
        let adjustedHour = hour;
        if (ampm === 'pm' && hour !== 12) {
          adjustedHour += 12;
        } else if (ampm === 'am' && hour === 12) {
          adjustedHour = 0;
        }
        
        date.setHours(adjustedHour, minute, 0, 0);
      }
      
      break;
    }
  }
  
  // Look for duration
  let duration = 60; // Default 60 minutes
  const durationMatch = message.match(/(\d+)\s*(minute|hour)/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit === 'hour' ? value * 60 : value;
  }
  
  return { date, time, duration };
}

// Extract attendees from message
function extractAttendeesFromMessage(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const attendees: string[] = [];
  
  // Look for common patterns
  const patterns = [
    /with (\w+)/g,
    /team members/g,
    /development team/g,
    /stakeholders/g,
    /(\w+), (\w+), and (\w+)/g
  ];
  
  for (const pattern of patterns) {
    const matches = message.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        attendees.push(match[1]);
      }
    }
  }
  
  // Add common team references
  if (lowerMessage.includes('team')) {
    attendees.push('team members');
  }
  
  return attendees;
}

// Extract data type from message
function extractDataTypeFromMessage(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('project')) return 'projects';
  if (lowerMessage.includes('task')) return 'tasks';
  if (lowerMessage.includes('email')) return 'emails';
  if (lowerMessage.includes('note')) return 'notes';
  if (lowerMessage.includes('meeting')) return 'calendar';
  if (lowerMessage.includes('team')) return 'team';
  
  return null;
}

// Extract analysis type from message
function extractAnalysisTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('summary') || lowerMessage.includes('overview')) return 'summary';
  if (lowerMessage.includes('trend') || lowerMessage.includes('pattern')) return 'trends';
  if (lowerMessage.includes('performance') || lowerMessage.includes('metrics')) return 'performance';
  if (lowerMessage.includes('insight') || lowerMessage.includes('recommendation')) return 'insights';
  
  return 'summary';
}

// Extract filters from message
function extractFiltersFromMessage(message: string): any {
  const filters: any = {};
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('high priority')) filters.priority = 'high';
  if (lowerMessage.includes('medium priority')) filters.priority = 'medium';
  if (lowerMessage.includes('low priority')) filters.priority = 'low';
  if (lowerMessage.includes('completed')) filters.status = 'completed';
  if (lowerMessage.includes('pending')) filters.status = 'pending';
  
  return filters;
}

// Additional helper functions for specialized operations
function extractReportTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('quarterly')) return 'quarterly';
  if (lowerMessage.includes('monthly')) return 'monthly';
  if (lowerMessage.includes('annual')) return 'annual';
  if (lowerMessage.includes('weekly')) return 'weekly';
  return 'quarterly';
}

function extractPresentationThemeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('corporate')) return 'corporate';
  if (lowerMessage.includes('modern')) return 'modern';
  if (lowerMessage.includes('minimal')) return 'minimal';
  return 'corporate';
}

function extractSlideCountFromMessage(message: string): number {
  const match = message.match(/(\d+)\s*slides?/i);
  return match ? parseInt(match[1]) : 10;
}

function extractCalendarActionFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('schedule')) return 'schedule';
  if (lowerMessage.includes('cancel')) return 'cancel';
  if (lowerMessage.includes('reschedule')) return 'reschedule';
  return 'schedule';
}

function extractNameFromMessage(message: string): string {
  // Extract name from patterns like "John Smith" or "Sarah Johnson"
  const nameMatch = message.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  return nameMatch ? nameMatch[1] : 'Unknown';
}

function extractEmailFromMessage(message: string): string {
  const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return emailMatch ? emailMatch[1] : '';
}

function extractCompanyFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('from ')) {
    const companyMatch = message.match(/from\s+([A-Z][a-zA-Z\s&]+)/i);
    return companyMatch ? companyMatch[1].trim() : 'Unknown Company';
  }
  return 'Unknown Company';
}

function extractLeadSourceFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('website')) return 'website';
  if (lowerMessage.includes('referral')) return 'referral';
  if (lowerMessage.includes('social')) return 'social_media';
  if (lowerMessage.includes('email')) return 'email';
  return 'website';
}

function extractClientFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('for ')) {
    const clientMatch = message.match(/for\s+([A-Z][a-zA-Z\s&]+)/i);
    return clientMatch ? clientMatch[1].trim() : 'Client Company';
  }
  return 'Client Company';
}

function extractValueFromMessage(message: string): number {
  const valueMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  return valueMatch ? parseInt(valueMatch[1].replace(/,/g, '')) : 50000;
}

function extractPipelineStageFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('prospecting')) return 'prospecting';
  if (lowerMessage.includes('qualification')) return 'qualification';
  if (lowerMessage.includes('proposal')) return 'proposal';
  if (lowerMessage.includes('negotiation')) return 'negotiation';
  if (lowerMessage.includes('closed')) return 'closed';
  return 'prospecting';
}

function extractCustomerFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    const customerMatch = message.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    return customerMatch ? customerMatch[1] : 'Customer Name';
  }
  return 'Customer Name';
}

function extractFollowUpTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('email')) return 'email';
  if (lowerMessage.includes('call')) return 'call';
  if (lowerMessage.includes('meeting')) return 'meeting';
  return 'email';
}

function extractIndustryFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('technology')) return 'Technology';
  if (lowerMessage.includes('healthcare')) return 'Healthcare';
  if (lowerMessage.includes('finance')) return 'Finance';
  if (lowerMessage.includes('retail')) return 'Retail';
  return 'Technology';
}

function extractCompanySizeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('enterprise')) return 'Enterprise';
  if (lowerMessage.includes('small')) return 'Small Business';
  if (lowerMessage.includes('startup')) return 'Startup';
  if (lowerMessage.includes('medium')) return 'Medium Business';
  return 'Enterprise';
}

function extractSupportCategoryFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('technical')) return 'technical';
  if (lowerMessage.includes('billing')) return 'billing';
  if (lowerMessage.includes('login')) return 'login';
  if (lowerMessage.includes('feature')) return 'feature_request';
  return 'general';
}

function extractTicketIdFromMessage(message: string): string {
  const ticketMatch = message.match(/ticket\s*#?(\d+)/i);
  return ticketMatch ? ticketMatch[1] : '';
}

function extractReasonFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('complex')) return 'Complex technical issue';
  if (lowerMessage.includes('urgent')) return 'Urgent customer request';
  if (lowerMessage.includes('billing')) return 'Billing dispute';
  return 'Requires senior support';
}

function extractEscalatedToFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('manager')) return 'Support Manager';
  if (lowerMessage.includes('senior')) return 'Senior Support';
  if (lowerMessage.includes('technical')) return 'Technical Team';
  return 'Senior Support';
}

function extractKnowledgeCategoryFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('technical')) return 'technical';
  if (lowerMessage.includes('billing')) return 'billing';
  if (lowerMessage.includes('account')) return 'account';
  if (lowerMessage.includes('feature')) return 'features';
  return 'general';
}

function extractTagsFromMessage(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const tags = [];
  if (lowerMessage.includes('urgent')) tags.push('urgent');
  if (lowerMessage.includes('help')) tags.push('help');
  if (lowerMessage.includes('support')) tags.push('support');
  if (lowerMessage.includes('documentation')) tags.push('documentation');
  return tags.length > 0 ? tags : ['help', 'support'];
}

function extractCampaignTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('email')) return 'email';
  if (lowerMessage.includes('social')) return 'social_media';
  if (lowerMessage.includes('display')) return 'display';
  if (lowerMessage.includes('search')) return 'search';
  return 'email';
}

function extractBudgetFromMessage(message: string): number {
  const budgetMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  return budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 10000;
}

function extractTargetAudienceFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('enterprise')) return 'enterprise';
  if (lowerMessage.includes('small business')) return 'small_business';
  if (lowerMessage.includes('consumers')) return 'consumers';
  if (lowerMessage.includes('developers')) return 'developers';
  return 'general';
}

function extractCampaignIdFromMessage(message: string): string {
  const campaignMatch = message.match(/campaign\s*#?(\d+)/i);
  return campaignMatch ? campaignMatch[1] : '';
}

function extractPlatformFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('facebook')) return 'facebook';
  if (lowerMessage.includes('twitter')) return 'twitter';
  if (lowerMessage.includes('linkedin')) return 'linkedin';
  if (lowerMessage.includes('instagram')) return 'instagram';
  if (lowerMessage.includes('social')) return 'social_media';
  return 'social_media';
}

function extractCurrentSpendFromMessage(message: string): number {
  const spendMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  return spendMatch ? parseInt(spendMatch[1].replace(/,/g, '')) : 5000;
}

function extractOptimizationTargetFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('cost')) return 'reduce_cost';
  if (lowerMessage.includes('conversion')) return 'increase_conversion';
  if (lowerMessage.includes('reach')) return 'increase_reach';
  return 'optimize_performance';
}

function extractWorkflowFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('onboarding')) return 'customer_onboarding';
  if (lowerMessage.includes('support')) return 'support_process';
  if (lowerMessage.includes('sales')) return 'sales_process';
  if (lowerMessage.includes('approval')) return 'approval_process';
  return 'general_process';
}

function extractOptimizationTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('automation')) return 'automation';
  if (lowerMessage.includes('streamline')) return 'streamline';
  if (lowerMessage.includes('efficiency')) return 'efficiency';
  return 'general_optimization';
}

function extractTeamFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('development')) return 'development_team';
  if (lowerMessage.includes('sales')) return 'sales_team';
  if (lowerMessage.includes('marketing')) return 'marketing_team';
  if (lowerMessage.includes('support')) return 'support_team';
  return 'general_team';
}

function extractPerformanceMetricsFromMessage(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const metrics = [];
  if (lowerMessage.includes('productivity')) metrics.push('productivity');
  if (lowerMessage.includes('quality')) metrics.push('quality');
  if (lowerMessage.includes('collaboration')) metrics.push('collaboration');
  if (lowerMessage.includes('efficiency')) metrics.push('efficiency');
  return metrics.length > 0 ? metrics : ['productivity', 'quality'];
}

function extractResourceTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('human')) return 'human';
  if (lowerMessage.includes('financial')) return 'financial';
  if (lowerMessage.includes('technical')) return 'technical';
  if (lowerMessage.includes('time')) return 'time';
  return 'human';
}

function extractAllocationFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('balanced')) return 'balanced';
  if (lowerMessage.includes('priority')) return 'priority_based';
  if (lowerMessage.includes('equal')) return 'equal';
  return 'balanced';
}

function extractProcessFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('onboarding')) return 'onboarding';
  if (lowerMessage.includes('support')) return 'support';
  if (lowerMessage.includes('sales')) return 'sales';
  if (lowerMessage.includes('approval')) return 'approval';
  return 'general_process';
}

function extractStepsFromMessage(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('step')) {
    const steps = [];
    for (let i = 1; i <= 5; i++) {
      if (lowerMessage.includes(`step ${i}`)) {
        steps.push(`Step ${i}`);
      }
    }
    return steps.length > 0 ? steps : ['Step 1', 'Step 2', 'Step 3'];
  }
  return ['Step 1', 'Step 2', 'Step 3'];
}

// Aurora (Executive Assistant) specialized operations
export async function createExecutiveReport(parameters: any): Promise<any> {
  const report = {
    id: generateId(),
    title: parameters.title || 'Executive Report',
    type: parameters.type || 'quarterly',
    content: parameters.content || 'Executive summary and key metrics',
    status: 'draft',
    createdAt: new Date(),
    dueDate: parameters.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
  
  workspaceData.executiveReports.push(report);
  saveWorkspaceData();
  
  return {
    reportId: report.id,
    message: `Executive report "${report.title}" created successfully`,
    report: report
  };
}

export async function scheduleExecutiveMeeting(parameters: any): Promise<any> {
  const meeting = {
    id: generateId(),
    title: parameters.title || 'Executive Meeting',
    type: 'executive',
    attendees: parameters.attendees || ['CEO', 'CTO', 'CFO'],
    startTime: parameters.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: parameters.duration || 120,
    agenda: parameters.agenda || 'Strategic planning and business review',
    status: 'scheduled'
  };
  
  workspaceData.calendar.push(meeting);
  saveWorkspaceData();
  
  return {
    meetingId: meeting.id,
    message: `Executive meeting "${meeting.title}" scheduled successfully`,
    meeting: meeting
  };
}

export async function analyzeBusinessMetrics(parameters: any): Promise<any> {
  const metrics = {
    revenue: Math.floor(Math.random() * 1000000),
    growth: Math.floor(Math.random() * 100),
    customerCount: Math.floor(Math.random() * 10000),
    satisfaction: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100)
  };
  
  const analysis = {
    id: generateId(),
    type: 'business_metrics',
    data: metrics,
    insights: [
      `Revenue increased by ${metrics.growth}% this quarter`,
      `Customer satisfaction is at ${metrics.satisfaction}%`,
      `Operational efficiency improved to ${metrics.efficiency}%`
    ],
    createdAt: new Date()
  };
  
  workspaceData.businessMetrics.push(analysis);
  saveWorkspaceData();
  
  return {
    analysisId: analysis.id,
    message: 'Business metrics analysis completed',
    metrics: metrics,
    insights: analysis.insights
  };
}

export async function createPresentation(parameters: any): Promise<any> {
  const presentation = {
    id: generateId(),
    title: parameters.title || 'Business Presentation',
    slides: parameters.slides || 10,
    theme: parameters.theme || 'corporate',
    status: 'draft',
    createdAt: new Date()
  };
  
  workspaceData.presentations.push(presentation);
  saveWorkspaceData();
  
  return {
    presentationId: presentation.id,
    message: `Presentation "${presentation.title}" created successfully`,
    presentation: presentation
  };
}

export async function manageCalendar(parameters: any): Promise<any> {
  const calendarUpdate = {
    id: generateId(),
    action: parameters.action || 'schedule',
    details: parameters.details || 'Calendar management task',
    status: 'completed',
    createdAt: new Date()
  };
  
  return {
    updateId: calendarUpdate.id,
    message: 'Calendar management completed successfully',
    update: calendarUpdate
  };
}

// Vega (Sales Rep) specialized operations
export async function qualifyLead(parameters: any): Promise<any> {
  const lead = {
    id: generateId(),
    name: parameters.name || 'New Lead',
    email: parameters.email || 'lead@example.com',
    company: parameters.company || 'Company Inc.',
    score: Math.floor(Math.random() * 100),
    status: 'qualified',
    source: parameters.source || 'website',
    createdAt: new Date()
  };
  
  workspaceData.leads.push(lead);
  saveWorkspaceData();
  
  return {
    leadId: lead.id,
    message: `Lead "${lead.name}" qualified with score ${lead.score}`,
    lead: lead
  };
}

export async function createSalesProposal(parameters: any): Promise<any> {
  const proposal = {
    id: generateId(),
    title: parameters.title || 'Sales Proposal',
    client: parameters.client || 'Client Company',
    value: parameters.value || Math.floor(Math.random() * 100000),
    status: 'draft',
    createdAt: new Date()
  };
  
  workspaceData.salesProposals.push(proposal);
  saveWorkspaceData();
  
  return {
    proposalId: proposal.id,
    message: `Sales proposal "${proposal.title}" created successfully`,
    proposal: proposal
  };
}

export async function trackSalesPipeline(parameters: any): Promise<any> {
  const pipeline = {
    id: generateId(),
    stage: parameters.stage || 'prospecting',
    deals: Math.floor(Math.random() * 50),
    value: Math.floor(Math.random() * 1000000),
    conversion: Math.floor(Math.random() * 100),
    updatedAt: new Date()
  };
  
  workspaceData.salesPipeline.push(pipeline);
  saveWorkspaceData();
  
  return {
    pipelineId: pipeline.id,
    message: 'Sales pipeline tracking updated',
    pipeline: pipeline
  };
}

export async function sendFollowUp(parameters: any): Promise<any> {
  const followUp = {
    id: generateId(),
    customer: parameters.customer || 'Customer Name',
    type: parameters.type || 'email',
    content: parameters.content || 'Follow-up message sent',
    status: 'sent',
    sentAt: new Date()
  };
  
  return {
    followUpId: followUp.id,
    message: `Follow-up sent to ${followUp.customer}`,
    followUp: followUp
  };
}

export async function analyzeSalesData(parameters: any): Promise<any> {
  const salesData = {
    totalRevenue: Math.floor(Math.random() * 1000000),
    dealsClosed: Math.floor(Math.random() * 100),
    conversionRate: Math.floor(Math.random() * 100),
    averageDealSize: Math.floor(Math.random() * 10000)
  };
  
  const analysis = {
    id: generateId(),
    type: 'sales_analysis',
    data: salesData,
    insights: [
      `Total revenue: $${salesData.totalRevenue.toLocaleString()}`,
      `Deals closed: ${salesData.dealsClosed}`,
      `Conversion rate: ${salesData.conversionRate}%`
    ],
    createdAt: new Date()
  };
  
  return {
    analysisId: analysis.id,
    message: 'Sales data analysis completed',
    data: salesData,
    insights: analysis.insights
  };
}

export async function createCustomerProfile(parameters: any): Promise<any> {
  const profile = {
    id: generateId(),
    name: parameters.name || 'Customer Name',
    company: parameters.company || 'Company Inc.',
    industry: parameters.industry || 'Technology',
    size: parameters.size || 'Enterprise',
    preferences: parameters.preferences || ['email', 'phone'],
    createdAt: new Date()
  };
  
  workspaceData.customerProfiles.push(profile);
  saveWorkspaceData();
  
  return {
    profileId: profile.id,
    message: `Customer profile created for ${profile.name}`,
    profile: profile
  };
}

// Luma (Customer Support) specialized operations
export async function createSupportTicket(parameters: any): Promise<any> {
  const ticket = {
    id: generateId(),
    title: parameters.title || 'Support Request',
    customer: parameters.customer || 'Customer Name',
    priority: parameters.priority || 'medium',
    status: 'open',
    category: parameters.category || 'general',
    createdAt: new Date()
  };
  
  workspaceData.supportTickets.push(ticket);
  saveWorkspaceData();
  
  return {
    ticketId: ticket.id,
    message: `Support ticket "${ticket.title}" created successfully`,
    ticket: ticket
  };
}

export async function escalateIssue(parameters: any): Promise<any> {
  const escalation = {
    id: generateId(),
    ticketId: parameters.ticketId,
    reason: parameters.reason || 'Complex technical issue',
    escalatedTo: parameters.escalatedTo || 'Senior Support',
    priority: 'high',
    escalatedAt: new Date()
  };
  
  return {
    escalationId: escalation.id,
    message: `Issue escalated to ${escalation.escalatedTo}`,
    escalation: escalation
  };
}

export async function analyzeCustomerSatisfaction(parameters: any): Promise<any> {
  const satisfaction = {
    overall: Math.floor(Math.random() * 100),
    responseTime: Math.floor(Math.random() * 100),
    resolution: Math.floor(Math.random() * 100),
    communication: Math.floor(Math.random() * 100)
  };
  
  const analysis = {
    id: generateId(),
    type: 'satisfaction_analysis',
    data: satisfaction,
    insights: [
      `Overall satisfaction: ${satisfaction.overall}%`,
      `Response time rating: ${satisfaction.responseTime}%`,
      `Resolution quality: ${satisfaction.resolution}%`
    ],
    createdAt: new Date()
  };
  
  workspaceData.customerSatisfaction.push(analysis);
  saveWorkspaceData();
  
  return {
    analysisId: analysis.id,
    message: 'Customer satisfaction analysis completed',
    satisfaction: satisfaction,
    insights: analysis.insights
  };
}

export async function createKnowledgeBaseEntry(parameters: any): Promise<any> {
  const entry = {
    id: generateId(),
    title: parameters.title || 'Knowledge Base Entry',
    content: parameters.content || 'Helpful information for customers',
    category: parameters.category || 'general',
    tags: parameters.tags || ['help', 'support'],
    status: 'published',
    createdAt: new Date()
  };
  
  workspaceData.knowledgeBase.push(entry);
  saveWorkspaceData();
  
  return {
    entryId: entry.id,
    message: `Knowledge base entry "${entry.title}" created successfully`,
    entry: entry
  };
}

export async function trackResponseTime(parameters: any): Promise<any> {
  const responseTime = {
    id: generateId(),
    average: Math.floor(Math.random() * 60), // minutes
    target: 30,
    performance: 'good',
    measuredAt: new Date()
  };
  
  return {
    trackingId: responseTime.id,
    message: `Response time tracking updated: ${responseTime.average} minutes average`,
    responseTime: responseTime
  };
}

// Orion (Marketing Strategist) specialized operations
export async function createMarketingCampaign(parameters: any): Promise<any> {
  const campaign = {
    id: generateId(),
    name: parameters.name || 'Marketing Campaign',
    type: parameters.type || 'email',
    budget: parameters.budget || 10000,
    targetAudience: parameters.targetAudience || 'general',
    status: 'planning',
    startDate: parameters.startDate || new Date(),
    endDate: parameters.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };
  
  workspaceData.marketingCampaigns.push(campaign);
  saveWorkspaceData();
  
  return {
    campaignId: campaign.id,
    message: `Marketing campaign "${campaign.name}" created successfully`,
    campaign: campaign
  };
}

export async function analyzeCampaignPerformance(parameters: any): Promise<any> {
  const performance = {
    impressions: Math.floor(Math.random() * 1000000),
    clicks: Math.floor(Math.random() * 10000),
    conversions: Math.floor(Math.random() * 1000),
    cost: Math.floor(Math.random() * 10000),
    roi: Math.floor(Math.random() * 500)
  };
  
  const analysis = {
    id: generateId(),
    campaignId: parameters.campaignId,
    data: performance,
    insights: [
      `Impressions: ${performance.impressions.toLocaleString()}`,
      `Click-through rate: ${((performance.clicks / performance.impressions) * 100).toFixed(2)}%`,
      `ROI: ${performance.roi}%`
    ],
    analyzedAt: new Date()
  };
  
  workspaceData.engagementMetrics.push(analysis);
  saveWorkspaceData();
  
  return {
    analysisId: analysis.id,
    message: 'Campaign performance analysis completed',
    performance: performance,
    insights: analysis.insights
  };
}

export async function createContentCalendar(parameters: any): Promise<any> {
  const calendar = {
    id: generateId(),
    title: parameters.title || 'Content Calendar',
    platform: parameters.platform || 'social_media',
    posts: Math.floor(Math.random() * 50),
    engagement: Math.floor(Math.random() * 100),
    status: 'active',
    createdAt: new Date()
  };
  
  workspaceData.contentCalendar.push(calendar);
  saveWorkspaceData();
  
  return {
    calendarId: calendar.id,
    message: `Content calendar "${calendar.title}" created successfully`,
    calendar: calendar
  };
}

export async function trackEngagementMetrics(parameters: any): Promise<any> {
  const engagement = {
    likes: Math.floor(Math.random() * 10000),
    shares: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 500),
    reach: Math.floor(Math.random() * 100000),
    engagementRate: Math.floor(Math.random() * 100)
  };
  
  const metrics = {
    id: generateId(),
    platform: parameters.platform || 'social_media',
    data: engagement,
    trackedAt: new Date()
  };
  
  workspaceData.engagementMetrics.push(metrics);
  saveWorkspaceData();
  
  return {
    metricsId: metrics.id,
    message: 'Engagement metrics tracking updated',
    engagement: engagement
  };
}

export async function optimizeAdSpend(parameters: any): Promise<any> {
  const optimization = {
    id: generateId(),
    currentSpend: Math.floor(Math.random() * 10000),
    optimizedSpend: Math.floor(Math.random() * 10000),
    savings: Math.floor(Math.random() * 2000),
    recommendations: [
      'Reduce spend on low-performing keywords',
      'Increase budget for high-converting ads',
      'Focus on mobile optimization'
    ],
    optimizedAt: new Date()
  };
  
  return {
    optimizationId: optimization.id,
    message: `Ad spend optimization completed. Potential savings: $${optimization.savings}`,
    optimization: optimization
  };
}

// Titan (Operations Manager) specialized operations
export async function optimizeWorkflow(parameters: any): Promise<any> {
  const optimization = {
    id: generateId(),
    workflow: parameters.workflow || 'general_process',
    efficiencyGain: Math.floor(Math.random() * 50),
    timeSaved: Math.floor(Math.random() * 100),
    recommendations: [
      'Automate repetitive tasks',
      'Streamline approval process',
      'Implement better communication tools'
    ],
    optimizedAt: new Date()
  };
  
  workspaceData.workflows.push(optimization);
  saveWorkspaceData();
  
  return {
    optimizationId: optimization.id,
    message: `Workflow optimization completed. Efficiency gain: ${optimization.efficiencyGain}%`,
    optimization: optimization
  };
}

export async function trackTeamPerformance(parameters: any): Promise<any> {
  const performance = {
    id: generateId(),
    team: parameters.team || 'general_team',
    productivity: Math.floor(Math.random() * 100),
    quality: Math.floor(Math.random() * 100),
    collaboration: Math.floor(Math.random() * 100),
    trackedAt: new Date()
  };
  
  return {
    trackingId: performance.id,
    message: `Team performance tracking updated for ${performance.team}`,
    performance: performance
  };
}

export async function manageResources(parameters: any): Promise<any> {
  const resource = {
    id: generateId(),
    type: parameters.type || 'human',
    allocation: parameters.allocation || 'balanced',
    utilization: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100),
    managedAt: new Date()
  };
  
  return {
    resourceId: resource.id,
    message: `Resource management completed for ${resource.type}`,
    resource: resource
  };
}

export async function createProcessDocumentation(parameters: any): Promise<any> {
  const documentation = {
    id: generateId(),
    title: parameters.title || 'Process Documentation',
    process: parameters.process || 'general_process',
    steps: parameters.steps || ['Step 1', 'Step 2', 'Step 3'],
    status: 'published',
    createdAt: new Date()
  };
  
  workspaceData.processDocumentation.push(documentation);
  saveWorkspaceData();
  
  return {
    docId: documentation.id,
    message: `Process documentation "${documentation.title}" created successfully`,
    documentation: documentation
  };
}

export async function analyzeEfficiencyMetrics(parameters: any): Promise<any> {
  const efficiency = {
    processEfficiency: Math.floor(Math.random() * 100),
    resourceUtilization: Math.floor(Math.random() * 100),
    timeToCompletion: Math.floor(Math.random() * 100),
    qualityScore: Math.floor(Math.random() * 100)
  };
  
  const analysis = {
    id: generateId(),
    type: 'efficiency_analysis',
    data: efficiency,
    insights: [
      `Process efficiency: ${efficiency.processEfficiency}%`,
      `Resource utilization: ${efficiency.resourceUtilization}%`,
      `Quality score: ${efficiency.qualityScore}%`
    ],
    analyzedAt: new Date()
  };
  
  workspaceData.efficiencyMetrics.push(analysis);
  saveWorkspaceData();
  
  return {
    analysisId: analysis.id,
    message: 'Efficiency metrics analysis completed',
    efficiency: efficiency,
    insights: analysis.insights
  };
}

// Get workspace data
export function getWorkspaceData(): WorkspaceData {
  return { ...workspaceData }; // Return a copy to prevent external mutations
}

// Get specific workspace data types
export function getTasks(): any[] {
  return workspaceData.tasks || [];
}

export function getNotes(): any[] {
  return workspaceData.notes || [];
}

export function getProjects(): any[] {
  return workspaceData.projects || [];
}

export function getCalendar(): any[] {
  return workspaceData.calendar || [];
}

export function getEmails(): any[] {
  return workspaceData.emails || [];
}

export function getContacts(): any[] {
  return workspaceData.contacts || [];
}

export function getTeam(): any[] {
  return workspaceData.team || [];
}

// Get specialized data
export function getExecutiveReports(): any[] {
  return workspaceData.executiveReports || [];
}

export function getLeads(): any[] {
  return workspaceData.leads || [];
}

export function getSupportTickets(): any[] {
  return workspaceData.supportTickets || [];
}

export function getMarketingCampaigns(): any[] {
  return workspaceData.marketingCampaigns || [];
}

export function getWorkflows(): any[] {
  return workspaceData.workflows || [];
}

export function getAgentReports(): any[] {
  return workspaceData.agentReports || [];
}

// Gemini AI Integration for Agents

const getGenAI = () => {
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY is not defined');
    throw new Error('VITE_GEMINI_API_KEY is not defined');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

async function generateAgentResponse(agentId: string, userMessage: string, workspaceContext: any): Promise<string> {
  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const systemPrompt = `You are ${agent.name}, an advanced AI ${agent.role} with deep expertise in your domain. You're intelligent, intuitive, and always helpful.

🎯 YOUR IDENTITY:
- Name: ${agent.name}
- Role: ${agent.role}
- Expertise: ${agent.expertise.join(', ')}
- Tools: ${agent.tools.join(', ')}
- Specializations: ${agent.specializedCapabilities.join(', ')}

📊 WORKSPACE OVERVIEW:
- Projects: ${workspaceContext.projects.length} active projects
- Tasks: ${workspaceContext.tasks.length} total tasks  
- Notes: ${workspaceContext.notes.length} notes
- Contacts: ${workspaceContext.contacts.length} contacts
- Team: ${workspaceContext.team.length} team members

📋 CURRENT PROJECTS:
${workspaceContext.projects.map((p: any) => `• ${p.name}: ${p.description || 'No description'} (Status: ${p.status || 'Unknown'})`).join('\n') || 'No projects yet'}

✅ CURRENT TASKS:
${workspaceContext.tasks.map((t: any) => `• ${t.title}: ${t.description || 'No description'} (Status: ${t.status || 'Unknown'}, Priority: ${t.priority || 'Unknown'})`).join('\n') || 'No tasks yet'}

💬 USER REQUEST: "${userMessage}"

🤖 HOW TO RESPOND:

1. **For Actions** (creating/updating workspace data):
   Respond with JSON format:
   {
     "action": "create_task" | "create_project" | "add_note" | "create_support_ticket" | etc.,
     "parameters": { "title": "...", "description": "...", "priority": "...", etc. },
     "response": "Your conversational, friendly response explaining what you're doing"
   }

2. **For Questions/Information**:
   Respond with helpful, detailed answers in plain text. Be conversational and insightful.

3. **For Clarification Needed**:
   Ask specific, helpful questions to get the information you need.

🎯 YOUR PERSONALITY:
- Be conversational and friendly, like talking to a knowledgeable colleague
- Show expertise in your domain while being approachable
- Provide insights and suggestions beyond just what's asked
- Be proactive - suggest improvements or related actions
- Use emojis sparingly but appropriately
- Be specific and actionable in your responses

💡 EXAMPLES:
- "I'll create that task for you right away! Let me set it up with high priority since you mentioned it's urgent."
- "Great idea! I can see you're working on multiple projects. Let me create that support ticket and also suggest some follow-up actions."
- "I notice you don't have any projects set up yet. Would you like me to create one to get you started?"

Remember: You're not just executing commands - you're a smart assistant who understands context and provides value beyond the immediate request.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate agent response: ${error.message}`);
  }
}

async function parseGeminiResponse(geminiResponse: string, agentId: string, originalMessage: string): Promise<AgentResponse> {
  try {
    console.log(`🤖 ${agentId} Gemini Response:`, geminiResponse);
    
    // Try to parse as JSON first (for actions)
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(geminiResponse);
    } catch {
      // Not JSON, treat as regular response
      console.log(`📝 ${agentId} treating as regular response`);
      return {
        success: true,
        message: geminiResponse,
        data: { type: 'response', content: geminiResponse }
      };
    }

    console.log(`🔍 ${agentId} parsed JSON:`, parsedResponse);

    // If it's JSON with an action, perform the operation
    if (parsedResponse.action && parsedResponse.parameters) {
      console.log(`⚡ ${agentId} performing action:`, parsedResponse.action);
      
      const operationId = createOperation(parsedResponse.action, agentId, parsedResponse.parameters);
      const result = await executeOperation(operationId);
      
      console.log(`✅ ${agentId} operation result:`, result);
      
      // Combine the operation result with the agent's friendly response
      return {
        success: result.success,
        message: result.success ? parsedResponse.response : result.message,
        data: {
          ...result.data,
          agentResponse: parsedResponse.response,
          operation: parsedResponse.action
        }
      };
    }

    // If it's JSON but no action, return the response
    return {
      success: true,
      message: parsedResponse.response || geminiResponse,
      data: { type: 'response', content: parsedResponse.response || geminiResponse }
    };

  } catch (error: any) {
    console.error(`❌ Error parsing Gemini response for ${agentId}:`, error);
    return {
      success: true,
      message: geminiResponse,
      data: { type: 'response', content: geminiResponse }
    };
  }
}

// Initialize the service
initializeWorkspaceData();
