-- Enable RLS on workout_templates table
        ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

        -- Policy for SELECT (view)
        CREATE POLICY "Allow authenticated users to view their own templates"
        ON public.workout_templates FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

        -- Policy for INSERT (create)
        CREATE POLICY "Allow authenticated users to create their own templates"
        ON public.workout_templates FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

        -- Policy for UPDATE (edit)
        CREATE POLICY "Allow authenticated users to update their own templates"
        ON public.workout_templates FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

        -- Policy for DELETE (remove)
        CREATE POLICY "Allow authenticated users to delete their own templates"
        ON public.workout_templates FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);