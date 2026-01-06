-- =================================================================================================
-- Comprehensive Supabase RLS Setup Script for FitTrack Application
-- This script ensures 'user_id' columns are correctly configured with RLS policies.
-- =================================================================================================

-- Step 1: Cleanup - Delete all existing RLS policies for workout_templates and exercises tables.
-- This ensures a clean slate before applying new policies, preventing conflicts.
---------------------------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow authenticated users to view their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to create their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to update their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own templates" ON public.workout_templates;
-- Drop any other policies that might have been created with different names
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
-- Drop any other policies that might have been created with different names
DROP POLICY IF EXISTS "Users can delete their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can insert their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can update their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can view their own exercises." ON public.exercises;


-- Step 2: Table Schema Setup - Ensure 'user_id' column exists and is correctly configured.
-- This is critical for Row Level Security to function correctly and automatically assign user IDs.
---------------------------------------------------------------------------------------------------

-- Add user_id column to workout_templates if it doesn't exist, and set default/not null
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workout_templates' AND column_name = 'user_id') THEN
        ALTER TABLE public.workout_templates ADD COLUMN user_id uuid DEFAULT auth.uid() NOT NULL;
        RAISE NOTICE 'Added user_id column to public.workout_templates with DEFAULT auth.uid() NOT NULL.';
    ELSE
        -- If column exists, ensure it has the correct default and not null constraint
        ALTER TABLE public.workout_templates ALTER COLUMN user_id SET DEFAULT auth.uid();
        ALTER TABLE public.workout_templates ALTER COLUMN user_id SET NOT NULL;
        RAISE NOTICE 'Ensured user_id column in public.workout_templates has DEFAULT auth.uid() NOT NULL.';
    END IF;
    -- Add foreign key constraint to auth.users.id
    EXECUTE 'ALTER TABLE public.workout_templates ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Foreign key constraint fk_user_id already exists on public.workout_templates, skipping.';
    WHEN others THEN RAISE EXCEPTION 'Error setting up user_id for workout_templates: %', SQLERRM;
END $$;

-- Add user_id column to exercises if it doesn't exist, and set default/not null
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'user_id') THEN
        ALTER TABLE public.exercises ADD COLUMN user_id uuid DEFAULT auth.uid() NOT NULL;
        RAISE NOTICE 'Added user_id column to public.exercises with DEFAULT auth.uid() NOT NULL.';
    ELSE
        -- If column exists, ensure it has the correct default and not null constraint
        ALTER TABLE public.exercises ALTER COLUMN user_id SET DEFAULT auth.uid();
        ALTER TABLE public.exercises ALTER COLUMN user_id SET NOT NULL;
        RAISE NOTICE 'Ensured user_id column in public.exercises has DEFAULT auth.uid() NOT NULL.';
    END IF;
    -- Add foreign key constraint to auth.users.id
    EXECUTE 'ALTER TABLE public.exercises ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;';
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Foreign key constraint fk_user_id already exists on public.exercises, skipping.';
    WHEN others THEN RAISE EXCEPTION 'Error setting up user_id for exercises: %', SQLERRM;
END $$;

-- Step 3: Enable Row Level Security (RLS) for both tables.
---------------------------------------------------------------------------------------------------

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;


-- Step 4: Create RLS Policies for workout_templates table.
-- These policies ensure authenticated users can only perform actions on their own templates.
---------------------------------------------------------------------------------------------------

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


-- Step 5: Create RLS Policies for exercises table.
-- These policies ensure authenticated users can only perform actions on their own exercises.
---------------------------------------------------------------------------------------------------

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

-- Optional: If you have existing data without a user_id, you can assign it to the current user.
-- Run these lines separately AFTER the main script, and only if you are logged in as the user
-- who should own the existing data.
-- UPDATE public.workout_templates SET user_id = auth.uid() WHERE user_id IS NULL;
-- UPDATE public.exercises SET user_id = auth.uid() WHERE user_id IS NULL;