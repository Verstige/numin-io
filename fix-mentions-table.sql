-- Fix mentions table - add missing created_by column
-- Run this in your Supabase SQL Editor

-- Add the missing created_by column to mentions table
ALTER TABLE public.mentions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the RLS policy to use the correct column
DROP POLICY IF EXISTS "Users can insert mentions" ON public.mentions;
CREATE POLICY "Users can insert mentions" ON public.mentions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Mentions table fixed - created_by column added!';
  RAISE NOTICE '✅ RLS policy updated';
END $$;
