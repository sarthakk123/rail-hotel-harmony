-- Enable realtime for trains table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trains;

-- Create analytics view for admin dashboard
CREATE OR REPLACE VIEW public.booking_analytics AS
SELECT 
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
  SUM(total_amount) as total_revenue,
  SUM(total_amount) FILTER (WHERE status = 'confirmed') as confirmed_revenue,
  COUNT(DISTINCT passenger_id) as unique_passengers,
  COUNT(DISTINCT hotel_id) as hotels_used,
  COUNT(DISTINCT train_id) as trains_used
FROM public.bookings;

-- Grant access to analytics view
GRANT SELECT ON public.booking_analytics TO authenticated;

-- Add policy for admins to manage user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));