import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  };
  hotels: {
    hotel_name: string;
    location: string;
  };
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchBookings();
  }, []);

  const checkAdminAndFetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some(r => r.role === "admin")) {
      navigate("/dashboard");
      return;
    }

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
          trains (train_name, train_number, status),
          hotels (hotel_name, location)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-600">Confirmed</Badge>;
      case "modified":
        return <Badge variant="secondary">Modified</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Panel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>
              View and manage all customer bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Train</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs">
                          {booking.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.passengers?.full_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {booking.passengers?.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.trains?.train_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {booking.trains?.train_number || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.hotels?.hotel_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {booking.hotels?.location || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(booking.adjusted_checkin || booking.original_checkin).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(booking.adjusted_checkin || booking.original_checkin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(booking.adjusted_checkout || booking.original_checkout).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(booking.adjusted_checkout || booking.original_checkout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${booking.total_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBookings;
