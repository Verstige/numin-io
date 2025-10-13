-- Enhanced Project Management Schema
-- Add these tables to your existing Supabase database

-- Project Tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY DEFAULT generate_unique_id('task'),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL,
  actual_hours DECIMAL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id TEXT PRIMARY KEY DEFAULT generate_unique_id('milestone'),
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  dependencies TEXT[] DEFAULT '{}',
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Resources table
CREATE TABLE IF NOT EXISTS project_resources (
  id TEXT PRIMARY KEY DEFAULT generate_unique_id('resource'),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT TRUE,
  workload DECIMAL DEFAULT 0 CHECK (workload >= 0 AND workload <= 100),
  hourly_rate DECIMAL,
  department TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Teams table
CREATE TABLE IF NOT EXISTS project_teams (
  id TEXT PRIMARY KEY DEFAULT generate_unique_id('team'),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  members TEXT[] DEFAULT '{}',
  project_count INTEGER DEFAULT 0,
  budget DECIMAL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Connections table
CREATE TABLE IF NOT EXISTS project_connections (
  id TEXT PRIMARY KEY DEFAULT generate_unique_id('connection'),
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('dependency', 'collaboration', 'timeline', 'resource')),
  label TEXT,
  weight DECIMAL DEFAULT 1,
  deadline TIMESTAMP WITH TIME ZONE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Map Layouts table
CREATE TABLE IF NOT EXISTS project_map_layouts (
  id TEXT PRIMARY KEY DEFAULT generate_unique_id('layout'),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Add enhanced_data column to existing projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'enhanced_data') THEN
        ALTER TABLE projects ADD COLUMN enhanced_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee_id ON project_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_deadline ON project_tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_deadline ON project_milestones(deadline);
CREATE INDEX IF NOT EXISTS idx_project_milestones_completed ON project_milestones(completed);

CREATE INDEX IF NOT EXISTS idx_project_resources_available ON project_resources(available);
CREATE INDEX IF NOT EXISTS idx_project_resources_department ON project_resources(department);
CREATE INDEX IF NOT EXISTS idx_project_resources_skills ON project_resources USING GIN(skills);

CREATE INDEX IF NOT EXISTS idx_project_teams_department ON project_teams(department);

CREATE INDEX IF NOT EXISTS idx_project_connections_source ON project_connections(source_id);
CREATE INDEX IF NOT EXISTS idx_project_connections_target ON project_connections(target_id);
CREATE INDEX IF NOT EXISTS idx_project_connections_type ON project_connections(connection_type);

-- Row Level Security (RLS) policies
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_map_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_tasks
CREATE POLICY "Users can view tasks in their teams" ON project_tasks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their teams" ON project_tasks
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update tasks in their teams" ON project_tasks
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete tasks in their teams" ON project_tasks
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Team access for project_milestones" ON project_milestones
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team access for project_resources" ON project_resources
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team access for project_teams" ON project_teams
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team access for project_connections" ON project_connections
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team access for project_map_layouts" ON project_map_layouts
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Functions for updating timestamps
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_resources_updated_at BEFORE UPDATE ON project_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_teams_updated_at BEFORE UPDATE ON project_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_connections_updated_at BEFORE UPDATE ON project_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_map_layouts_updated_at BEFORE UPDATE ON project_map_layouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats(team_uuid UUID, user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_projects', COUNT(*),
        'active_projects', COUNT(*) FILTER (WHERE status = 'active'),
        'completed_projects', COUNT(*) FILTER (WHERE status = 'completed'),
        'total_tasks', (
            SELECT COUNT(*) FROM project_tasks pt 
            WHERE pt.team_id = team_uuid
        ),
        'completed_tasks', (
            SELECT COUNT(*) FROM project_tasks pt 
            WHERE pt.team_id = team_uuid AND pt.status = 'completed'
        )
    ) INTO result
    FROM projects p
    WHERE p.team_id = team_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project timeline
CREATE OR REPLACE FUNCTION get_project_timeline(team_uuid UUID)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    progress INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name as title,
        p.created_at as start_date,
        p.updated_at as end_date,
        p.status,
        COALESCE((p.enhanced_data->>'progress')::INTEGER, 0) as progress
    FROM projects p
    WHERE p.team_id = team_uuid
    ORDER BY p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
