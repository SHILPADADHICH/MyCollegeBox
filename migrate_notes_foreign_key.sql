-- Migration script to update notes table foreign key relationship
-- This script changes the user_id column in notes table to reference profiles.id instead of auth.users.id

-- Step 1: Drop the existing foreign key constraint (if it exists)
-- Note: PostgreSQL doesn't have a direct way to drop foreign key constraints by name
-- We need to drop and recreate the column

-- Step 2: Add a temporary column with the new foreign key constraint
ALTER TABLE public.notes ADD COLUMN user_id_new UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 3: Copy data from the old column to the new column
-- This assumes that profiles.id matches auth.users.id (which it should)
UPDATE public.notes SET user_id_new = user_id;

-- Step 4: Drop the old column
ALTER TABLE public.notes DROP COLUMN user_id;

-- Step 5: Rename the new column to user_id
ALTER TABLE public.notes RENAME COLUMN user_id_new TO user_id;

-- Step 6: Make the column NOT NULL
ALTER TABLE public.notes ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Recreate the index (it was dropped with the old column)
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- Step 8: Update the column comment
COMMENT ON COLUMN public.notes.user_id IS 'ID of the user who uploaded the note (references profiles.id)';

-- Verification query to ensure the relationship works
-- SELECT n.*, p.name, p.full_name 
-- FROM public.notes n 
-- JOIN public.profiles p ON n.user_id = p.id 
-- LIMIT 5; 