-- Delete all existing RLS policies for workout_templates to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated users to view their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to create their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to update their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Users can delete their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Users can insert their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Users can update their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Users can view their own workout templates." ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to create their own templates" ON public.workout_templates; -- Corrected from previous response
DROP POLICY IF EXISTS "Allow users to delete their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to update their own templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Allow users to view their own templates" ON public.workout_templates;


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