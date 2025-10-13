// Core Nexus AI Business Suite Types

export interface AIAgent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  model: AIModel;
  memory: AgentMemory;
  permissions: AgentPermissions;
  status: 'active' | 'inactive' | 'training' | 'error';
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  metrics: AgentMetrics;
}

export type AgentRole = 'aurora' | 'vega' | 'luma' | 'orion' | 'titan' | 'custom';

export interface AIModel {
  provider: 'gemini' | 'claude' | 'gpt4' | 'mistral';
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AgentMemory {
  shortTerm: ConversationMemory[];
  longTerm: VectorMemory[];
  contextWindow: number;
  maxMemorySize: number;
}

export interface ConversationMemory {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
  tags: string[];
  metadata?: Record<string, any>;
}

export interface VectorMemory {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    timestamp: Date;
    importance: number;
    tags: string[];
  };
}

export interface AgentPermissions {
  canAccessAPIs: string[];
  canExecuteWorkflows: boolean;
  canAccessFiles: boolean;
  canSendEmails: boolean;
  canScheduleMeetings: boolean;
  canAccessCRM: boolean;
  canAccessAnalytics: boolean;
}

export interface AgentMetrics {
  totalInteractions: number;
  successfulTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  userSatisfaction: number;
  lastPerformanceReview: Date;
}

// Workflow Engine Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: WorkflowTrigger[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executions: WorkflowExecution[];
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  config: Record<string, any>;
}

export type WorkflowNodeType = 
  | 'agent-action'
  | 'api-call'
  | 'condition'
  | 'function'
  | 'trigger'
  | 'end'
  | 'delay'
  | 'loop'
  | 'merge'
  | 'split';

export interface WorkflowNodeData {
  label: string;
  description?: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  config: Record<string, any>;
}

export interface NodeInput {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'success' | 'error';
  condition?: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  config: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  input: Record<string, any>;
  output?: Record<string, any>;
  logs: ExecutionLog[];
  error?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  data?: Record<string, any>;
}

// API Connector Types
export interface APIConnector {
  id: string;
  name: string;
  type: ConnectorType;
  config: ConnectorConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  permissions: ConnectorPermissions;
}

export type ConnectorType = 
  | 'google-workspace'
  | 'slack'
  | 'discord'
  | 'teams'
  | 'hubspot'
  | 'salesforce'
  | 'notion'
  | 'clickup'
  | 'trello'
  | 'gmail'
  | 'outlook'
  | 'facebook-ads'
  | 'google-ads'
  | 'tiktok-ads'
  | 'stripe'
  | 'quickbooks'
  | 'shopify'
  | 'webhook';

export interface ConnectorConfig {
  credentials: Record<string, any>;
  settings: Record<string, any>;
  endpoints: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface ConnectorPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
  scopes: string[];
}

// RAG Engine Types
export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  type: 'pdf' | 'text' | 'html' | 'markdown' | 'json';
  embedding: number[];
  metadata: {
    size: number;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    importance: number;
  };
}

export interface RAGQuery {
  query: string;
  filters?: {
    sources?: string[];
    types?: string[];
    tags?: string[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  limit?: number;
  threshold?: number;
}

export interface RAGResult {
  document: RAGDocument;
  similarity: number;
  relevanceScore: number;
  context: string;
}

// Event Router Types
export interface Event {
  id: string;
  type: EventType;
  source: string;
  data: Record<string, any>;
  timestamp: Date;
  processed: boolean;
  routing: EventRouting[];
}

export type EventType = 
  | 'new-lead'
  | 'calendar-event'
  | 'email-received'
  | 'form-submission'
  | 'payment-received'
  | 'task-completed'
  | 'meeting-scheduled'
  | 'file-uploaded'
  | 'user-registered'
  | 'workflow-triggered';

export interface EventRouting {
  agentId?: string;
  workflowId?: string;
  action: 'notify' | 'execute' | 'route';
  config: Record<string, any>;
}

// Business Intelligence Types
export interface BusinessMetrics {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: 'sales' | 'marketing' | 'operations' | 'customer' | 'financial';
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  timestamp: Date;
}

export interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionable: boolean;
  metrics: BusinessMetrics[];
  recommendations: string[];
  createdAt: Date;
}

// User Dashboard Types
export interface DashboardTab {
  id: string;
  name: string;
  icon: string;
  component: string;
  badge?: number;
}

export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'chart' | 'list' | 'calendar' | 'agent-status';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

// Template Library Types
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'support' | 'operations' | 'onboarding';
  complexity: 'simple' | 'intermediate' | 'advanced';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  connectors: string[];
  estimatedTime: string;
  tags: string[];
  preview: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  permissions: AgentPermissions;
  useCases: string[];
  category: 'business' | 'technical' | 'creative' | 'analytical';
}

// Multi-tenant Types
export interface Workspace {
  id: string;
  name: string;
  domain?: string;
  settings: WorkspaceSettings;
  members: WorkspaceMember[];
  billing: BillingInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  language: string;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: Date;
}

export interface BillingInfo {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  nextBilling?: Date;
  usage: {
    agents: number;
    workflows: number;
    apiCalls: number;
    storage: number;
  };
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  slack: boolean;
  webhook: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface IntegrationSettings {
  enabledConnectors: string[];
  customWebhooks: string[];
  apiLimits: Record<string, number>;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  auditLogs: boolean;
}
