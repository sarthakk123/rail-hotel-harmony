-- Fix security definer view by enabling security invoker
ALTER VIEW public.booking_analytics SET (security_invoker = on);