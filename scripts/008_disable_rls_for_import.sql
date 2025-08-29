-- Disable RLS temporarily for import functionality
-- This allows data import without authentication issues

-- Disable RLS on organizations table for import
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on appointments table for import
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on contracts table for import  
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;

-- Create a simple policy to allow all operations for now
-- You can customize these policies later based on your authentication needs

-- Organizations policies
DROP POLICY IF EXISTS "Allow all operations on organizations" ON public.organizations;
CREATE POLICY "Allow all operations on organizations" ON public.organizations
FOR ALL USING (true) WITH CHECK (true);

-- Appointments policies
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
CREATE POLICY "Allow all operations on appointments" ON public.appointments
FOR ALL USING (true) WITH CHECK (true);

-- Contracts policies
DROP POLICY IF EXISTS "Allow all operations on contracts" ON public.contracts;
CREATE POLICY "Allow all operations on contracts" ON public.contracts
FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS with permissive policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
