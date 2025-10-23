-- Allow users to update their own bookings (for cancellation)
CREATE POLICY "Users can update own bookings"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM passengers
    WHERE passengers.id = bookings.passenger_id
      AND passengers.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM passengers
    WHERE passengers.id = bookings.passenger_id
      AND passengers.user_id = auth.uid()
  )
);