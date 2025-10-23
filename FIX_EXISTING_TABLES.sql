-- FIX EXISTING TABLES: Run this in Supabase SQL Editor
-- This handles the case where tables already exist

-- Step 1: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.workspace_notes;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.workspace_tasks;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Step 2: Create the policies again
CREATE POLICY "Users can manage their own notes" ON public.workspace_notes
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own tasks" ON public.workspace_tasks
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = created_by);

-- Step 3: Make sure all required columns exist in projects table
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

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '🎉 FIX COMPLETE!';
  RAISE NOTICE '✅ Policies updated';
  RAISE NOTICE '✅ Projects table has all business fields';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your app should work now!';
  RAISE NOTICE '   - Notes tab should work';
  RAISE NOTICE '   - Tasks tab should work';
  RAISE NOTICE '   - Create Business button should work';
END $$;
