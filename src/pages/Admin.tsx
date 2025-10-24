import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Train, Hotel, Calendar, ArrowLeft, BarChart3, Users } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminRole = roles?.some(r => r.role === "admin");
    setIsAdmin(hasAdminRole || false);
    setLoading(false);

    if (!hasAdminRole) {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage trains, hotels, bookings, analytics, and users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/admin/trains")}
          >
            <CardHeader>
              <Train className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Train Management</CardTitle>
              <CardDescription>
                Manage train schedules, delays, and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and update train information
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/admin/hotels")}
          >
            <CardHeader>
              <Hotel className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Hotel Management</CardTitle>
              <CardDescription>
                Manage hotel listings and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove hotel partners
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/admin/bookings")}
          >
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                View and manage all bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor booking status and details
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/admin/analytics")}
          >
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View comprehensive booking analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Revenue, bookings, and performance metrics
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/admin/users")}
          >
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control user access and roles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
