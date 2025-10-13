-- Nexus AI Business Suite Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Agents table
CREATE TABLE ai_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('aurora', 'vega', 'luma', 'orion', 'titan', 'custom')),
  description TEXT,
  system_prompt TEXT NOT NULL,
  model JSONB NOT NULL DEFAULT '{"provider": "gemini", "model": "gemini-1.5-pro", "temperature": 0.7, "maxTokens": 2000}',
  memory JSONB NOT NULL DEFAULT '{"shortTerm": [], "longTerm": [], "contextWindow": 8000, "maxMemorySize": 100}',
  permissions JSONB NOT NULL DEFAULT '{"canAccessAPIs": [], "canExecuteWorkflows": true, "canAccessFiles": true, "canSendEmails": false, "canScheduleMeetings": false, "canAccessCRM": false, "canAccessAnalytics": false}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics JSONB NOT NULL DEFAULT '{"totalInteractions": 0, "successfulTasks": 0, "failedTasks": 0, "averageResponseTime": 0, "userSatisfaction": 0, "lastPerformanceReview": "2024-01-01T00:00:00Z"}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE
);

-- Workflows table
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  triggers JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE
);

-- Workflow Executions table
CREATE TABLE workflow_executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  input_data JSONB DEFAULT '{}',
  output_data JSONB,
  logs JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Connectors table
CREATE TABLE api_connectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('google-workspace', 'slack', 'discord', 'teams', 'hubspot', 'salesforce', 'notion', 'clickup', 'trello', 'gmail', 'outlook', 'facebook-ads', 'google-ads', 'tiktok-ads', 'stripe', 'quickbooks', 'shopify', 'webhook')),
  config JSONB NOT NULL DEFAULT '{"credentials": {}, "settings": {}, "endpoints": [], "rateLimits": {"requestsPerMinute": 60, "requestsPerHour": 1000}}',
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_sync TIMESTAMP WITH TIME ZONE,
  permissions JSONB NOT NULL DEFAULT '{"read": true, "write": false, "delete": false, "admin": false, "scopes": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE
);

-- RAG Documents table
CREATE TABLE rag_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'text', 'html', 'markdown', 'json')),
  embedding VECTOR(1536), -- For OpenAI embeddings, adjust size as needed
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE
);

-- Events table for Event Router
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new-lead', 'calendar-event', 'email-received', 'form-submission', 'payment-received', 'task-completed', 'meeting-scheduled', 'file-uploaded', 'user-registered', 'workflow-triggered')),
  source TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN DEFAULT FALSE,
  routing JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Business Metrics table
CREATE TABLE business_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sales', 'marketing', 'operations', 'customer', 'financial')),
  trend TEXT NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE
);

-- Business Insights table
CREATE TABLE business_insights (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('opportunity', 'risk', 'trend', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  confidence DECIMAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  actionable BOOLEAN DEFAULT FALSE,
  metrics JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE
);

-- Workflow Templates table
CREATE TABLE workflow_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('sales', 'marketing', 'support', 'operations', 'onboarding')),
  complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'intermediate', 'advanced')),
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  connectors TEXT[] DEFAULT '{}',
  estimated_time TEXT,
  tags TEXT[] DEFAULT '{}',
  preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Agent Templates table
CREATE TABLE agent_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('aurora', 'vega', 'luma', 'orion', 'titan', 'custom')),
  description TEXT,
  system_prompt TEXT NOT NULL,
  permissions JSONB NOT NULL,
  use_cases TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('business', 'technical', 'creative', 'analytical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Workspace Settings table
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  notifications JSONB DEFAULT '{"email": true, "push": true, "slack": false, "webhook": false, "frequency": "immediate"}',
  integrations JSONB DEFAULT '{"enabledConnectors": [], "customWebhooks": [], "apiLimits": {}}',
  security JSONB DEFAULT '{"twoFactorAuth": false, "sessionTimeout": 3600, "ipWhitelist": [], "auditLogs": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ai_agents_team_id ON ai_agents(team_id);
CREATE INDEX idx_ai_agents_status ON ai_agents(status);
CREATE INDEX idx_ai_agents_role ON ai_agents(role);
CREATE INDEX idx_workflows_team_id ON workflows(team_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_api_connectors_team_id ON api_connectors(team_id);
CREATE INDEX idx_api_connectors_type ON api_connectors(type);
CREATE INDEX idx_rag_documents_team_id ON rag_documents(team_id);
CREATE INDEX idx_rag_documents_type ON rag_documents(type);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_processed ON events(processed);
CREATE INDEX idx_business_metrics_team_id ON business_metrics(team_id);
CREATE INDEX idx_business_metrics_category ON business_metrics(category);
CREATE INDEX idx_business_insights_team_id ON business_insights(team_id);
CREATE INDEX idx_business_insights_type ON business_insights(type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_team_id ON audit_logs(team_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create vector index for RAG documents (if using pgvector)
-- CREATE INDEX ON rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) policies
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Agents
CREATE POLICY "Users can view agents in their teams" ON ai_agents
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agents in their teams" ON ai_agents
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update agents in their teams" ON ai_agents
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete agents in their teams" ON ai_agents
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Similar RLS policies for other tables...
-- (Implement similar policies for workflows, connectors, etc.)

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_connectors_updated_at BEFORE UPDATE ON api_connectors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_documents_updated_at BEFORE UPDATE ON rag_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_settings_updated_at BEFORE UPDATE ON workspace_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique IDs
CREATE OR REPLACE FUNCTION generate_unique_id(prefix TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN prefix || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
