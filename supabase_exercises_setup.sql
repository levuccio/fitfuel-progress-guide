-- Delete all existing RLS policies for exercises to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated users to view their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow authenticated users to create their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow authenticated users to update their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can delete their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can insert their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can update their own exercises." ON public.exercises;
DROP POLICY IF EXISTS "Users can view their own exercises." ON public.exercises;


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