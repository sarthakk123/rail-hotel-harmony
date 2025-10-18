import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Train, Hotel, Clock, CheckCircle, AlertTriangle, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { AdminButton } from "@/components/AdminButton";

interface Booking {
  id: string;
  status: string;
  original_checkin: string;
  adjusted_checkin: string | null;
  total_amount: number;
  train: {
    train_number: string;
    train_name: string;
    origin: string;
    destination: string;
    scheduled_arrival: string;
    delay_minutes: number;
    status: string;
  };
  hotel: {
    hotel_name: string;
    location: string;
    rating: number;
  };
}

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else {
          fetchBookings();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        fetchBookings();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: passenger } = await supabase
        .from("passengers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!passenger) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          train:trains(*),
          hotel:hotels(*)
        `)
        .eq("passenger_id", passenger.id);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmed: "default",
      rescheduled: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTrainStatusIcon = (status: string) => {
    if (status === "delayed") return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (status === "on_time") return <CheckCircle className="h-4 w-4 text-success" />;
    return <Clock className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Travel Dashboard</h1>
            <p className="text-muted-foreground">Track your integrated train and hotel bookings</p>
          </div>
          <div className="flex gap-3">
            <AdminButton userId={user?.id} />
            <Button onClick={() => navigate("/create-booking")}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No bookings found. Start planning your trip!</p>
              <Button onClick={() => navigate("/create-booking")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Booking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {booking.train.origin} → {booking.train.destination}
                    </CardTitle>
                    {getStatusBadge(booking.status)}
                  </div>
                  <CardDescription>Booking ID: {booking.id.slice(0, 8)}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Train className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="font-semibold">{booking.train.train_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Train #{booking.train.train_number}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {getTrainStatusIcon(booking.train.status)}
                            <span className="text-sm">
                              {booking.train.status === "delayed"
                                ? `Delayed by ${booking.train.delay_minutes} minutes`
                                : "On time"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Hotel className="h-5 w-5 text-accent mt-1" />
                        <div>
                          <p className="font-semibold">{booking.hotel.hotel_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.hotel.location}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ⭐ {booking.hotel.rating}/5.0
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium">
                              Check-in:{" "}
                              {new Date(
                                booking.adjusted_checkin || booking.original_checkin
                              ).toLocaleDateString()}
                            </p>
                            {booking.adjusted_checkin && (
                              <p className="text-xs text-warning">
                                ⚠️ Auto-rescheduled due to train delay
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Total Amount: <span className="font-bold text-foreground">₹{booking.total_amount}</span>
                    </p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
