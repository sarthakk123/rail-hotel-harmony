import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Hotel, Train, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Analytics {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  confirmed_revenue: number;
  unique_passengers: number;
  hotels_used: number;
  trains_used: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchAnalytics();
  }, []);

  const checkAdminAndFetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || roleData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      await fetchAnalytics();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_analytics")
        .select("*")
        .single();

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of your booking system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_bookings}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.confirmed_bookings} confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics.total_revenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                ₹{analytics.confirmed_revenue?.toLocaleString() || 0} confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Passengers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.unique_passengers}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((analytics.cancelled_bookings / analytics.total_bookings) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.cancelled_bookings} cancelled
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotels Utilized</CardTitle>
              <CardDescription>Number of partner hotels with bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Hotel className="h-12 w-12 text-primary" />
                <div>
                  <div className="text-3xl font-bold">{analytics.hotels_used}</div>
                  <p className="text-sm text-muted-foreground">Active hotel partnerships</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trains Utilized</CardTitle>
              <CardDescription>Number of train routes with bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Train className="h-12 w-12 text-primary" />
                <div>
                  <div className="text-3xl font-bold">{analytics.trains_used}</div>
                  <p className="text-sm text-muted-foreground">Active train routes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;