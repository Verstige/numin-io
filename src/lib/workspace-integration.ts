// Workspace Integration for Real AI Agent Operations
// This connects the AI agents to actual workspace data and operations

import { 
  getAgent, 
  sendMessageToAgent, 
  createOperation, 
  executeOperation,
  initializeWorkspaceData,
  saveWorkspaceData,
  type WorkspaceData,
  type AgentOperation
} from './ai-agent-service';

// Initialize workspace data
let workspaceData = initializeWorkspaceData();

// Real workspace operations that agents can perform
export interface WorkspaceOperation {
  id: string;
  type: 'create_project' | 'update_project' | 'delete_project' | 'create_task' | 'update_task' | 'delete_task' | 'add_note' | 'update_note' | 'delete_note' | 'schedule_meeting' | 'update_meeting' | 'delete_meeting';
  agentId: string;
  data: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Global array to track workspace operations
let workspaceOperations: WorkspaceOperation[] = [];

// Get workspace data
export function getWorkspaceData(): WorkspaceData {
  return workspaceData;
}

// Update workspace data
export function updateWorkspaceData(updates: Partial<WorkspaceData>): void {
  workspaceData = { ...workspaceData, ...updates };
  saveWorkspaceData();
}

// Create a workspace operation
export function createWorkspaceOperation(
  type: WorkspaceOperation['type'],
  agentId: string,
  data: any
): string {
  const operation: WorkspaceOperation = {
    id: `ws_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    agentId,
    data,
    status: 'pending',
    createdAt: new Date()
  };
  
  workspaceOperations.push(operation);
  return operation.id;
}

// Execute a workspace operation
export async function executeWorkspaceOperation(operationId: string): Promise<any> {
  const operation = workspaceOperations.find(op => op.id === operationId);
  if (!operation) {
    throw new Error('Operation not found');
  }

  operation.status = 'running';
  
  try {
    let result: any;
    
    switch (operation.type) {
      case 'create_project':
        result = await createProject(operation.data);
        break;
      case 'update_project':
        result = await updateProject(operation.data.id, operation.data.updates);
        break;
      case 'delete_project':
        result = await deleteProject(operation.data.id);
        break;
      case 'create_task':
        result = await createTask(operation.data);
        break;
      case 'update_task':
        result = await updateTask(operation.data.id, operation.data.updates);
        break;
      case 'delete_task':
        result = await deleteTask(operation.data.id);
        break;
      case 'add_note':
        result = await addNote(operation.data);
        break;
      case 'update_note':
        result = await updateNote(operation.data.id, operation.data.updates);
        break;
      case 'delete_note':
        result = await deleteNote(operation.data.id);
        break;
      case 'schedule_meeting':
        result = await scheduleMeeting(operation.data);
        break;
      case 'update_meeting':
        result = await updateMeeting(operation.data.id, operation.data.updates);
        break;
      case 'delete_meeting':
        result = await deleteMeeting(operation.data.id);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
    
    operation.status = 'completed';
    operation.result = result;
    operation.completedAt = new Date();
    
    return result;
  } catch (error) {
    operation.status = 'failed';
    operation.error = error instanceof Error ? error.message : 'Unknown error';
    operation.completedAt = new Date();
    throw error;
  }
}

// Project operations
export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  teamId?: string;
}): Promise<any> {
  const project = {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    description: data.description || '',
    status: data.status || 'active',
    priority: data.priority || 'medium',
    teamId: data.teamId || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  workspaceData.projects.push(project);
  saveWorkspaceData();
  
  console.log(`✅ Project created: ${project.name}`, project);
  return project;
}

export async function updateProject(projectId: string, updates: any): Promise<any> {
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

export async function deleteProject(projectId: string): Promise<void> {
  const projectIndex = workspaceData.projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) {
    throw new Error(`Project with id ${projectId} not found`);
  }
  
  const deletedProject = workspaceData.projects[projectIndex];
  workspaceData.projects.splice(projectIndex, 1);
  
  // Also delete related tasks and notes
  workspaceData.tasks = workspaceData.tasks.filter(t => t.projectId !== projectId);
  workspaceData.notes = workspaceData.notes.filter(n => n.projectId !== projectId);
  workspaceData.calendar = workspaceData.calendar.filter(m => m.projectId !== projectId);
  
  saveWorkspaceData();
  
  console.log(`✅ Project deleted: ${deletedProject.name}`);
}

// Task operations
export async function createTask(data: {
  title: string;
  description?: string;
  projectId?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'completed';
  dueDate?: Date;
  assignedTo?: string;
}): Promise<any> {
  const task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description || '',
    projectId: data.projectId || null,
    priority: data.priority || 'medium',
    status: data.status || 'todo',
    dueDate: data.dueDate || null,
    assignedTo: data.assignedTo || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  workspaceData.tasks.push(task);
  saveWorkspaceData();
  
  console.log(`✅ Task created: ${task.title}`, task);
  return task;
}

export async function updateTask(taskId: string, updates: any): Promise<any> {
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

export async function deleteTask(taskId: string): Promise<void> {
  const taskIndex = workspaceData.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${taskId} not found`);
  }
  
  const deletedTask = workspaceData.tasks[taskIndex];
  workspaceData.tasks.splice(taskIndex, 1);
  
  saveWorkspaceData();
  
  console.log(`✅ Task deleted: ${deletedTask.title}`);
}

// Note operations
export async function addNote(data: {
  title: string;
  content: string;
  projectId?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}): Promise<any> {
  const note = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    content: data.content,
    projectId: data.projectId || null,
    tags: data.tags || [],
    priority: data.priority || 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  workspaceData.notes.push(note);
  saveWorkspaceData();
  
  console.log(`✅ Note added: ${note.title}`, note);
  return note;
}

export async function updateNote(noteId: string, updates: any): Promise<any> {
  const noteIndex = workspaceData.notes.findIndex(n => n.id === noteId);
  if (noteIndex === -1) {
    throw new Error(`Note with id ${noteId} not found`);
  }
  
  workspaceData.notes[noteIndex] = {
    ...workspaceData.notes[noteIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  saveWorkspaceData();
  
  console.log(`✅ Note updated: ${noteId}`, updates);
  return workspaceData.notes[noteIndex];
}

export async function deleteNote(noteId: string): Promise<void> {
  const noteIndex = workspaceData.notes.findIndex(n => n.id === noteId);
  if (noteIndex === -1) {
    throw new Error(`Note with id ${noteId} not found`);
  }
  
  const deletedNote = workspaceData.notes[noteIndex];
  workspaceData.notes.splice(noteIndex, 1);
  
  saveWorkspaceData();
  
  console.log(`✅ Note deleted: ${deletedNote.title}`);
}

// Meeting operations
export async function scheduleMeeting(data: {
  title: string;
  description?: string;
  startTime: Date;
  duration: number;
  attendees: string[];
  projectId?: string;
}): Promise<any> {
  const meeting = {
    id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description || '',
    startTime: data.startTime,
    duration: data.duration,
    attendees: data.attendees,
    projectId: data.projectId || null,
    status: 'scheduled',
    createdAt: new Date()
  };
  
  workspaceData.calendar.push(meeting);
  saveWorkspaceData();
  
  console.log(`✅ Meeting scheduled: ${meeting.title}`, meeting);
  return meeting;
}

export async function updateMeeting(meetingId: string, updates: any): Promise<any> {
  const meetingIndex = workspaceData.calendar.findIndex(m => m.id === meetingId);
  if (meetingIndex === -1) {
    throw new Error(`Meeting with id ${meetingId} not found`);
  }
  
  workspaceData.calendar[meetingIndex] = {
    ...workspaceData.calendar[meetingIndex],
    ...updates
  };
  
  saveWorkspaceData();
  
  console.log(`✅ Meeting updated: ${meetingId}`, updates);
  return workspaceData.calendar[meetingIndex];
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  const meetingIndex = workspaceData.calendar.findIndex(m => m.id === meetingId);
  if (meetingIndex === -1) {
    throw new Error(`Meeting with id ${meetingId} not found`);
  }
  
  const deletedMeeting = workspaceData.calendar[meetingIndex];
  workspaceData.calendar.splice(meetingIndex, 1);
  
  saveWorkspaceData();
  
  console.log(`✅ Meeting deleted: ${deletedMeeting.title}`);
}

// Get all workspace operations
export function getWorkspaceOperations(): WorkspaceOperation[] {
  return workspaceOperations;
}

// Get operations by agent
export function getAgentWorkspaceOperations(agentId: string): WorkspaceOperation[] {
  return workspaceOperations.filter(op => op.agentId === agentId);
}

// Get pending operations
export function getPendingWorkspaceOperations(): WorkspaceOperation[] {
  return workspaceOperations.filter(op => op.status === 'pending');
}

// Agent workspace integration functions
export async function agentCreateProject(agentId: string, projectData: any): Promise<any> {
  const operationId = createWorkspaceOperation('create_project', agentId, projectData);
  return await executeWorkspaceOperation(operationId);
}

export async function agentCreateTask(agentId: string, taskData: any): Promise<any> {
  const operationId = createWorkspaceOperation('create_task', agentId, taskData);
  return await executeWorkspaceOperation(operationId);
}

export async function agentAddNote(agentId: string, noteData: any): Promise<any> {
  const operationId = createWorkspaceOperation('add_note', agentId, noteData);
  return await executeWorkspaceOperation(operationId);
}

export async function agentScheduleMeeting(agentId: string, meetingData: any): Promise<any> {
  const operationId = createWorkspaceOperation('schedule_meeting', agentId, meetingData);
  return await executeWorkspaceOperation(operationId);
}

// Initialize workspace integration
console.log('🚀 Workspace Integration initialized with AI Agent support');
console.log('📊 Available operations:', [
  'create_project', 'update_project', 'delete_project',
  'create_task', 'update_task', 'delete_task',
  'add_note', 'update_note', 'delete_note',
  'schedule_meeting', 'update_meeting', 'delete_meeting'
]);






