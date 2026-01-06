-- Enable RLS on exercises table
        ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

        -- Policy for SELECT (view)
        CREATE POLICY "Allow authenticated users to view their own exercises"
        ON public.exercises FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

        -- Policy for INSERT (create)
        CREATE POLICY "Allow authenticated users to create their own exercises"
        ON public.exercises FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

        -- Policy for UPDATE (edit)
        CREATE POLICY "Allow authenticated users to update their own exercises"
        ON public.exercises FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

        -- Policy for DELETE (remove)
        CREATE POLICY "Allow authenticated users to delete their own exercises"
        ON public.exercises FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);