import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Hotel, LogOut } from "lucide-react";

interface Booking {
  id: string;
  passenger_id: string;
  hotel_id: string;
  train_id: string;
  original_checkin: string;
  original_checkout: string;
  adjusted_checkin: string | null;
  adjusted_checkout: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  passengers: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  trains: {
    train_name: string;
    train_number: string;
    status: string;
    delay_minutes: number;
  };
}

const HotelDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkHotelAccess();
  }, []);

  const checkHotelAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has hotel role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    if (!roles?.some(r => r.role === "hotel")) {
      navigate("/dashboard");
      return;
    }

    // In a real app, you'd have a hotel_managers table linking users to hotels
    // For now, we'll fetch all bookings
    fetchBookings();
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          passengers (full_name, email, phone),
          trains (train_name, train_number, status, delay_minutes)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
    navigate("/");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Hotel className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Bookings</CardTitle>
                <CardDescription>There are no bookings to display</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Booking #{booking.id.slice(0, 8)}</span>
                    <span className={`text-sm ${
                      booking.status === 'confirmed' ? 'text-green-600' :
                      booking.status === 'modified' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Created: {new Date(booking.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Guest Information</h3>
                    <p><strong>Name:</strong> {booking.passengers.full_name}</p>
                    <p><strong>Email:</strong> {booking.passengers.email}</p>
                    {booking.passengers.phone && (
                      <p><strong>Phone:</strong> {booking.passengers.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Train Details</h3>
                    <p><strong>Train:</strong> {booking.trains.train_name} ({booking.trains.train_number})</p>
                    <p><strong>Status:</strong> {booking.trains.status}</p>
                    {booking.trains.delay_minutes > 0 && (
                      <p className="text-red-600">
                        <strong>Delay:</strong> {booking.trains.delay_minutes} minutes
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Check-in/out</h3>
                    <p><strong>Original Check-in:</strong> {new Date(booking.original_checkin).toLocaleString()}</p>
                    <p><strong>Original Check-out:</strong> {new Date(booking.original_checkout).toLocaleString()}</p>
                    {booking.adjusted_checkin && (
                      <p className="text-yellow-600">
                        <strong>Adjusted Check-in:</strong> {new Date(booking.adjusted_checkin).toLocaleString()}
                      </p>
                    )}
                    {booking.adjusted_checkout && (
                      <p className="text-yellow-600">
                        <strong>Adjusted Check-out:</strong> {new Date(booking.adjusted_checkout).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xl font-bold">Total: ${booking.total_amount}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDashboard;
