-- Create workspace_tasks table for task management
-- Run this in your Supabase SQL Editor

-- Create the workspace_tasks table
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT NOT NULL,
  assignee_avatar TEXT,
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  subtasks JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_team_id ON public.workspace_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_project_id ON public.workspace_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_created_by ON public.workspace_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON public.workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON public.workspace_tasks(priority);

-- Enable RLS
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view tasks from their teams" ON public.workspace_tasks;
CREATE POLICY "Users can view tasks from their teams" ON public.workspace_tasks
  FOR SELECT USING (auth.uid() = created_by OR team_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert tasks for their teams" ON public.workspace_tasks;
CREATE POLICY "Users can insert tasks for their teams" ON public.workspace_tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update tasks from their teams" ON public.workspace_tasks;
CREATE POLICY "Users can update tasks from their teams" ON public.workspace_tasks
  FOR UPDATE USING (auth.uid() = created_by OR team_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete tasks from their teams" ON public.workspace_tasks;
CREATE POLICY "Users can delete tasks from their teams" ON public.workspace_tasks
  FOR DELETE USING (auth.uid() = created_by OR team_id = auth.uid());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_workspace_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workspace_tasks_updated_at ON public.workspace_tasks;
CREATE TRIGGER update_workspace_tasks_updated_at
  BEFORE UPDATE ON public.workspace_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_tasks_updated_at();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Workspace tasks table created successfully!';
  RAISE NOTICE '✅ RLS policies created';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ Updated_at trigger created';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Table features:';
  RAISE NOTICE '   - Full task management (title, description, status, priority)';
  RAISE NOTICE '   - Assignee tracking with avatar support';
  RAISE NOTICE '   - Due dates and start dates';
  RAISE NOTICE '   - Tags and subtasks support';
  RAISE NOTICE '   - Project association';
  RAISE NOTICE '   - Team-based access control';
END $$;
