-- ============================================================
-- Arivium Community Hub — Tasks Table Migration
-- Run this in Supabase Dashboard → SQL editor
-- ============================================================

-- 1. Create tasks table linked to user profiles via user_id (foreign key to profiles.id)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow users to SELECT their own tasks
CREATE POLICY "Allow select own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Policy: Allow insert for authenticated users (set user_id automatically)
CREATE POLICY "Allow insert own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Allow update/delete only on own tasks
CREATE POLICY "Allow update own tasks"
  ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete own tasks"
  ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
