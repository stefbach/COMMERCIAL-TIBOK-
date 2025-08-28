-- Insert demo data for testing (only if user is authenticated)
-- This will be populated after user signs up and confirms email

-- Demo organizations
INSERT INTO public.organizations (name, industry, size, website, phone, email, address, city, country, status, notes, created_by)
SELECT 
  'Acme Corporation',
  'Technology',
  'Large',
  'https://acme.com',
  '+1-555-0123',
  'contact@acme.com',
  '123 Tech Street',
  'San Francisco',
  'USA',
  'active',
  'Leading technology company',
  auth.uid()
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (name, industry, size, website, phone, email, address, city, country, status, notes, created_by)
SELECT 
  'Global Solutions Ltd',
  'Consulting',
  'Medium',
  'https://globalsolutions.com',
  '+44-20-7123-4567',
  'info@globalsolutions.com',
  '456 Business Ave',
  'London',
  'UK',
  'active',
  'International consulting firm',
  auth.uid()
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (name, industry, size, website, phone, email, address, city, country, status, notes, created_by)
SELECT 
  'StartupXYZ',
  'Software',
  'Small',
  'https://startupxyz.io',
  '+33-1-23-45-67-89',
  'hello@startupxyz.io',
  '789 Innovation Blvd',
  'Paris',
  'France',
  'prospect',
  'Promising startup in AI space',
  auth.uid()
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
