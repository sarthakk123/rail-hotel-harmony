import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
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

      await fetchUsers();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/auth");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const rolesMap = new Map<string, string>();
      roles?.forEach((role: UserRole) => {
        rolesMap.set(role.user_id, role.role);
      });

      setUsers(profiles || []);
      setUserRoles(rolesMap);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "customer" | "hotel" | "user") => {
    try {
      const currentRole = userRoles.get(userId);

      if (currentRole) {
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });

      await fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "hotel":
        return "secondary";
      case "customer":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading users...</p>
      </div>
    );
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
          <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userRoles.get(user.id))}>
                        {userRoles.get(user.id) || "No Role"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userRoles.get(user.id) || ""}
                        onValueChange={(value: "admin" | "customer" | "hotel" | "user") => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;