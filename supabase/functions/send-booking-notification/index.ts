import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  bookingId: string;
  type: "confirmation" | "cancellation";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bookingId, type }: BookingNotificationRequest = await req.json();

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        passengers(full_name, email, phone),
        trains(train_name, train_number, origin, destination, scheduled_departure, scheduled_arrival),
        hotels(hotel_name, location, contact_phone)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    console.log("Booking notification:", {
      type,
      booking: {
        id: booking.id,
        passenger: booking.passengers.full_name,
        train: booking.trains.train_name,
        hotel: booking.hotels.hotel_name,
        status: booking.status
      }
    });

    // Here you would integrate with an email service like Resend
    // For now, we'll just log the notification
    const message = type === "confirmation" 
      ? `Booking confirmed for ${booking.passengers.full_name} on ${booking.trains.train_name}`
      : `Booking cancelled for ${booking.passengers.full_name}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        bookingDetails: {
          passenger: booking.passengers.full_name,
          train: `${booking.trains.train_name} (${booking.trains.train_number})`,
          hotel: booking.hotels.hotel_name,
          checkIn: booking.adjusted_checkin || booking.original_checkin,
          checkOut: booking.adjusted_checkout || booking.original_checkout
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);