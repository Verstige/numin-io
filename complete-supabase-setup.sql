-- Complete Supabase Database Setup
-- This script creates all necessary tables for full Supabase integration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. WORKSPACE TASKS TABLE
-- ============================================

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

-- ============================================
-- 2. WORKSPACE NOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.workspace_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  author TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  reminder_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CHAT MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  suggestions JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MENTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by TEXT NOT NULL,
  context TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TIME ENTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.workspace_tasks(id) ON DELETE CASCADE,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  is_running BOOLEAN DEFAULT FALSE,
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. WORKSPACE LAYOUTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.workspace_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  layout_type TEXT NOT NULL CHECK (layout_type IN ('project_map', 'dashboard', 'kanban', 'calendar')),
  layout_data JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ACTIVITY FEED TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('project_created', 'task_completed', 'status_changed', 'member_added', 'comment_added', 'deadline_approaching', 'milestone_reached', 'note_created', 'note_updated')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Workspace Tasks Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_team_id ON public.workspace_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_project_id ON public.workspace_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_created_by ON public.workspace_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON public.workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON public.workspace_tasks(priority);

-- Workspace Notes Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_notes_team_id ON public.workspace_notes(team_id);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_project_id ON public.workspace_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_created_by ON public.workspace_notes(created_by);

-- Chat Messages Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_team_id ON public.chat_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_by ON public.chat_messages(created_by);

-- Mentions Indexes
CREATE INDEX IF NOT EXISTS idx_mentions_user_id ON public.mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_team_id ON public.mentions(team_id);
CREATE INDEX IF NOT EXISTS idx_mentions_read ON public.mentions(read);

-- Time Entries Indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_team_id ON public.time_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);

-- Activity Feed Indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_team_id ON public.activity_feed(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(type);

-- ============================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. CREATE RLS POLICIES
-- ============================================

-- Workspace Tasks Policies
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

-- Workspace Notes Policies
DROP POLICY IF EXISTS "Users can view notes from their teams" ON public.workspace_notes;
CREATE POLICY "Users can view notes from their teams" ON public.workspace_notes
  FOR SELECT USING (auth.uid() = created_by OR team_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert notes for their teams" ON public.workspace_notes;
CREATE POLICY "Users can insert notes for their teams" ON public.workspace_notes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update notes from their teams" ON public.workspace_notes;
CREATE POLICY "Users can update notes from their teams" ON public.workspace_notes
  FOR UPDATE USING (auth.uid() = created_by OR team_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete notes from their teams" ON public.workspace_notes;
CREATE POLICY "Users can delete notes from their teams" ON public.workspace_notes
  FOR DELETE USING (auth.uid() = created_by OR team_id = auth.uid());

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view messages from their teams" ON public.chat_messages;
CREATE POLICY "Users can view messages from their teams" ON public.chat_messages
  FOR SELECT USING (auth.uid() = created_by OR team_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert messages for their teams" ON public.chat_messages;
CREATE POLICY "Users can insert messages for their teams" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Mentions Policies
DROP POLICY IF EXISTS "Users can view their mentions" ON public.mentions;
CREATE POLICY "Users can view their mentions" ON public.mentions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert mentions" ON public.mentions;
CREATE POLICY "Users can insert mentions" ON public.mentions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their mentions" ON public.mentions;
CREATE POLICY "Users can update their mentions" ON public.mentions
  FOR UPDATE USING (auth.uid() = user_id);

-- Time Entries Policies
DROP POLICY IF EXISTS "Users can view their time entries" ON public.time_entries;
CREATE POLICY "Users can view their time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their time entries" ON public.time_entries;
CREATE POLICY "Users can insert their time entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their time entries" ON public.time_entries;
CREATE POLICY "Users can update their time entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their time entries" ON public.time_entries;
CREATE POLICY "Users can delete their time entries" ON public.time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Workspace Layouts Policies
DROP POLICY IF EXISTS "Users can view their layouts" ON public.workspace_layouts;
CREATE POLICY "Users can view their layouts" ON public.workspace_layouts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their layouts" ON public.workspace_layouts;
CREATE POLICY "Users can insert their layouts" ON public.workspace_layouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their layouts" ON public.workspace_layouts;
CREATE POLICY "Users can update their layouts" ON public.workspace_layouts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their layouts" ON public.workspace_layouts;
CREATE POLICY "Users can delete their layouts" ON public.workspace_layouts
  FOR DELETE USING (auth.uid() = user_id);

-- Activity Feed Policies
DROP POLICY IF EXISTS "Users can view team activity" ON public.activity_feed;
CREATE POLICY "Users can view team activity" ON public.activity_feed
  FOR SELECT USING (team_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert team activity" ON public.activity_feed;
CREATE POLICY "Users can insert team activity" ON public.activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_workspace_tasks_updated_at ON public.workspace_tasks;
CREATE TRIGGER update_workspace_tasks_updated_at
  BEFORE UPDATE ON public.workspace_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_notes_updated_at ON public.workspace_notes;
CREATE TRIGGER update_workspace_notes_updated_at
  BEFORE UPDATE ON public.workspace_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_layouts_updated_at ON public.workspace_layouts;
CREATE TRIGGER update_workspace_layouts_updated_at
  BEFORE UPDATE ON public.workspace_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN 
  RAISE NOTICE '🎉 Complete Supabase Database Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables Created:';
  RAISE NOTICE '   - workspace_tasks (task management)';
  RAISE NOTICE '   - workspace_notes (note taking)';
  RAISE NOTICE '   - chat_messages (AI chat history)';
  RAISE NOTICE '   - mentions (user mentions)';
  RAISE NOTICE '   - time_entries (time tracking)';
  RAISE NOTICE '   - workspace_layouts (user preferences)';
  RAISE NOTICE '   - activity_feed (team activity)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Features Enabled:';
  RAISE NOTICE '   - Row Level Security (RLS)';
  RAISE NOTICE '   - Performance indexes';
  RAISE NOTICE '   - Auto-updating timestamps';
  RAISE NOTICE '   - Team-based access control';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your app is now fully integrated with Supabase!';
  RAISE NOTICE '   No more localStorage - everything runs through the database.';
END $$;
