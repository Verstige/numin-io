-- URGENT FIX: Run this in Supabase SQL Editor NOW
-- This will fix the "Loading tasks..." and "Loading notes..." issues

-- Step 1: Create workspace_notes table
CREATE TABLE IF NOT EXISTS public.workspace_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  author TEXT NOT NULL,
  project_id UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create workspace_tasks table
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
  project_id UUID,
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  subtasks JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple RLS policies
CREATE POLICY "Users can manage their own notes" ON public.workspace_notes
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own tasks" ON public.workspace_tasks
  FOR ALL USING (auth.uid() = created_by);

-- Step 5: Add missing columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS products TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS business_stage TEXT,
ADD COLUMN IF NOT EXISTS revenue TEXT,
ADD COLUMN IF NOT EXISTS employees TEXT,
ADD COLUMN IF NOT EXISTS founded TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS social_media TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Step 6: Update projects RLS policies
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = created_by);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '🚀 URGENT FIX COMPLETE!';
  RAISE NOTICE '✅ workspace_notes table created';
  RAISE NOTICE '✅ workspace_tasks table created';
  RAISE NOTICE '✅ projects table updated with business fields';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your app should work now!';
  RAISE NOTICE '   - Notes tab will stop showing "Loading..."';
  RAISE NOTICE '   - Tasks tab will stop showing "Loading..."';
  RAISE NOTICE '   - Create Business button will work';
END $$;
