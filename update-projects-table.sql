-- Update projects table to include all business detail fields
-- Run this in your Supabase SQL Editor

-- Add new columns to the projects table
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

-- Update the RLS policies for projects to be more permissive during development
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
  RAISE NOTICE '✅ Projects table updated with business detail fields!';
  RAISE NOTICE '✅ RLS policies updated';
  RAISE NOTICE '';
  RAISE NOTICE '📋 New fields added:';
  RAISE NOTICE '   - location, website, industry, products';
  RAISE NOTICE '   - target_audience, business_stage, revenue';
  RAISE NOTICE '   - employees, founded, contact_email';
  RAISE NOTICE '   - phone, social_media, additional_notes';
END $$;

