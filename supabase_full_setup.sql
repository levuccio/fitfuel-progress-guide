-- =================================================================================================
-- Cleanup: Delete all existing RLS policies for workout_templates and exercises tables
-- This ensures a clean slate before applying new policies.
-- =================================================================================================

DROP POLICY IF EXISTS "Allow authenticated users to view their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to create their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to update their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Users can delete their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Users can insert their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Users can update their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Users can view their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to create their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to delete their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to update their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to view their own templates" ON public.workout_templates;

DROP POLICY IF EXISTS "Allow authenticated users to view their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow authenticated users to create their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow authenticated users to update their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can delete their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can insert their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can update their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can view their own exercises." ON public.exercises;


-- =================================================================================================
-- Table Setup: Ensure 'user_id' column exists in both tables
-- This is crucial for Row Level Security to function correctly.
-- =================================================================================================

-- Add user_id column to workout_templates if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.workout_templates ADD COLUMN IF NOT EXISTS user_id uuid;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column user_id already exists in public.workout_templates, skipping';
END $$;

-- Add user_id column to exercises if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS user_id uuid;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column user_id already exists in public.exercises, skipping';
END $$;

-- Optional: If you want to set existing rows to the current user's ID (run this only if you are logged in as the user who owns the data)
-- UPDATE public.workout_templates SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE public.exercises SET user_id = auth.uid() WHERE user_id IS NULL;

-- Optional: Make user_id NOT NULL after all existing rows have been assigned a user_id
-- ALTER TABLE public.workout_templates ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.exercises ALTER COLUMN user_id SET NOT NULL;


-- =================================================================================================
-- RLS Setup for workout_templates table
-- =================================================================================================

-- Enable Row Level Security on the workout_templates table
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (view): Allow authenticated users to view only their own templates
CREATE POLICY "Allow authenticated users to view their own templates"
ON public.workout_templates FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for INSERT (create): Allow authenticated users to create templates for themselves
CREATE POLICY "Allow authenticated users to create their own templates"
ON public.workout_templates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (edit): Allow authenticated users to update only their own templates
CREATE POLICY "Allow authenticated users to update their own templates"
ON public.workout_templates FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE (remove): Allow authenticated users to delete only their own templates
CREATE POLICY "Allow authenticated users to delete their own templates"
ON public.workout_templates FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =================================================================================================
-- RLS Setup for exercises table
-- =================================================================================================

-- Enable Row Level Security on the exercises table
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (view): Allow authenticated users to view only their own exercises
CREATE POLICY "Allow authenticated users to view their own exercises"
ON public.exercises FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for INSERT (create): Allow authenticated users to create exercises for themselves
CREATE POLICY "Allow authenticated users to create their own exercises"
ON public.exercises FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (edit): Allow authenticated users to update only their own exercises
CREATE POLICY "Allow authenticated users to update their own exercises"
ON public.exercises FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE (remove): Allow authenticated users to delete only their own exercises
CREATE POLICY "Allow authenticated users to delete their own exercises"
ON public.exercises FOR DELETE
TO authenticated
USING (auth.uid() = user_id);