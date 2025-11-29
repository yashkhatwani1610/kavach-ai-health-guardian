-- Phase 1: Clean up duplicate tables
DROP TABLE IF EXISTS public."Reports";
DROP TABLE IF EXISTS public."Vitals";

-- Phase 2: Clear existing mock data to allow type conversion
TRUNCATE public.vitals CASCADE;
TRUNCATE public.environment CASCADE;
TRUNCATE public.reports CASCADE;
TRUNCATE public.sensor_logs CASCADE;

-- Phase 3: Standardize user_id columns
-- Rename "user id" to "user_id" in parents table
ALTER TABLE public.parents RENAME COLUMN "user id" TO user_id;

-- Change user_id from text to uuid in all tables
ALTER TABLE public.vitals ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.environment ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.reports ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE public.sensor_logs ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Phase 4: Add proper RLS policies for all tables

-- vitals table policies
CREATE POLICY "Users can view own vitals" ON public.vitals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals" ON public.vitals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals" ON public.vitals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals" ON public.vitals
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- environment table policies
CREATE POLICY "Users can view own environment" ON public.environment
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own environment" ON public.environment
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own environment" ON public.environment
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own environment" ON public.environment
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- reports table policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- parents table policies
CREATE POLICY "Users can view own parents" ON public.parents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parents" ON public.parents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parents" ON public.parents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own parents" ON public.parents
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- sensor_logs table policies
CREATE POLICY "Users can view own sensor_logs" ON public.sensor_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sensor_logs" ON public.sensor_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sensor_logs" ON public.sensor_logs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sensor_logs" ON public.sensor_logs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Phase 5: Create storage bucket for reports with proper RLS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reports bucket
CREATE POLICY "Users can view own report files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own report files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own report files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own report files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);