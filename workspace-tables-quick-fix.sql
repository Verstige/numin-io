-- Quick Fix: Create Workspace Tables
-- Run this in Supabase SQL Editor to fix Notes & Tasks loading issues

-- Create workspace_notes table
CREATE TABLE IF NOT EXISTS public.workspace_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  author TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_tasks table
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT NOT NULL,
  assignee_avatar TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  subtasks JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can manage their own notes" ON public.workspace_notes
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own tasks" ON public.workspace_tasks
  FOR ALL USING (auth.uid() = created_by);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Workspace tables created successfully!';
  RAISE NOTICE '✅ Notes and Tasks should now work';
END $$;
