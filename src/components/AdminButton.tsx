import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AdminButtonProps {
  userId?: string;
}

export const AdminButton = ({ userId }: AdminButtonProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, [userId]);

  const checkAdminStatus = async () => {
    if (!userId) return;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    setIsAdmin(roles?.some(r => r.role === "admin") || false);
  };

  if (!isAdmin) return null;

  return (
    <Button variant="secondary" onClick={() => navigate("/admin")}>
      <Shield className="mr-2 h-4 w-4" />
      Admin Panel
    </Button>
  );
};
