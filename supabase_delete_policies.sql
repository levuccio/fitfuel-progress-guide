DROP POLICY IF EXISTS "Allow authenticated users to view their own templates" ON public.workout_templates;
        DROP POLICY IF EXISTS "Allow authenticated users to create their own templates" ON public.workout_templates;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own templates" ON public.workout_templates;
        DROP POLICY IF EXISTS "Allow authenticated users to delete their own templates" ON public.workout_templates;
        DROP POLICY IF EXISTS "Users can delete their own workout templates." ON public.workout_templates;
        DROP POLICY IF EXISTS "Users can insert their own workout templates." ON public.workout_templates;
        DROP POLICY IF EXISTS "Users can update their own workout templates." ON public.workout_templates;
        DROP POLICY IF EXISTS "Users can view their own workout templates." ON public.workout_templates;

        DROP POLICY IF EXISTS "Allow authenticated users to view their own exercises" ON public.exercises;
        DROP POLICY IF EXISTS "Allow authenticated users to create their own exercises" ON public.exercises;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own exercises" ON public.exercises;
        DROP POLICY IF EXISTS "Allow authenticated users to delete their own exercises" ON public.exercises;
        DROP POLICY IF EXISTS "Users can delete their own exercises." ON public.exercises;
        DROP POLICY IF EXISTS "Users can insert their own exercises." ON public.exercises;
        DROP POLICY IF EXISTS "Users can update their own exercises." ON public.exercises;
        DROP POLICY IF EXISTS "Users can view their own exercises." ON public.exercises;