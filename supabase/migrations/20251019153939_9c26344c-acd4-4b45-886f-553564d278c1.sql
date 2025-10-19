-- Add hotel and customer roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hotel';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';