-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'rescheduled', 'cancelled');

-- Create enum for train status
CREATE TYPE public.train_status AS ENUM ('on_time', 'delayed', 'cancelled');

-- Create passengers table
CREATE TABLE public.passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trains table
CREATE TABLE public.trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number TEXT NOT NULL UNIQUE,
  train_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  scheduled_departure TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  delay_minutes INTEGER DEFAULT 0,
  status train_status DEFAULT 'on_time',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hotels table
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  rating DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table (integrates trains and hotels)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES public.passengers(id) ON DELETE CASCADE NOT NULL,
  train_id UUID REFERENCES public.trains(id) ON DELETE CASCADE NOT NULL,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  original_checkin TIMESTAMP WITH TIME ZONE NOT NULL,
  original_checkout TIMESTAMP WITH TIME ZONE NOT NULL,
  adjusted_checkin TIMESTAMP WITH TIME ZONE,
  adjusted_checkout TIMESTAMP WITH TIME ZONE,
  status booking_status DEFAULT 'confirmed',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delay notifications table
CREATE TABLE public.delay_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notification_type TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delay_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for passengers (users can see their own data)
CREATE POLICY "Users can view own passenger profile"
  ON public.passengers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passenger profile"
  ON public.passengers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passenger profile"
  ON public.passengers FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for trains (public read access)
CREATE POLICY "Anyone can view trains"
  ON public.trains FOR SELECT
  USING (true);

-- RLS Policies for hotels (public read access)
CREATE POLICY "Anyone can view hotels"
  ON public.hotels FOR SELECT
  USING (true);

-- RLS Policies for bookings (users can see their own bookings)
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.passengers
      WHERE passengers.id = bookings.passenger_id
      AND passengers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.passengers
      WHERE passengers.id = bookings.passenger_id
      AND passengers.user_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.delay_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      JOIN public.passengers ON bookings.passenger_id = passengers.id
      WHERE bookings.id = delay_notifications.booking_id
      AND passengers.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_passengers_updated_at BEFORE UPDATE ON public.passengers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trains_updated_at BEFORE UPDATE ON public.trains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO public.trains (train_number, train_name, origin, destination, scheduled_departure, scheduled_arrival, delay_minutes, status) VALUES
('T001', 'Express Mumbai-Delhi', 'Mumbai', 'Delhi', now() + interval '2 hours', now() + interval '10 hours', 0, 'on_time'),
('T002', 'Rajdhani Express', 'Delhi', 'Kolkata', now() + interval '3 hours', now() + interval '20 hours', 45, 'delayed'),
('T003', 'Shatabdi Express', 'Chennai', 'Bangalore', now() + interval '1 hour', now() + interval '6 hours', 0, 'on_time');

INSERT INTO public.hotels (hotel_name, location, contact_email, contact_phone, address, rating) VALUES
('Grand Palace Hotel', 'Delhi', 'contact@grandpalace.com', '+91-11-12345678', '123 Main Street, Delhi', 4.5),
('Royal Residency', 'Mumbai', 'info@royalresidency.com', '+91-22-87654321', '456 Beach Road, Mumbai', 4.8),
('Comfort Inn', 'Bangalore', 'hello@comfortinn.com', '+91-80-11223344', '789 Tech Park, Bangalore', 4.2);