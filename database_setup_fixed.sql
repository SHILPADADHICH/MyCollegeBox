-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create updated profiles table with all required fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    full_name TEXT,
    branch TEXT,
    year TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    account_type TEXT DEFAULT 'User',
    phone TEXT,
    city TEXT,
    pg_name TEXT,
    pg_location TEXT,
    pg_contact TEXT,
    room_types TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Note: We're not creating an automatic trigger to avoid conflicts
-- The signup code will handle profile creation manually 