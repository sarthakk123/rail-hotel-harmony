-- Add admin policy to view all passengers
CREATE POLICY "Admins can view all passengers"
ON public.passengers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));