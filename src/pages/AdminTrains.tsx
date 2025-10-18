import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Train } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TrainData {
  id: string;
  train_number: string;
  train_name: string;
  origin: string;
  destination: string;
  scheduled_departure: string;
  scheduled_arrival: string;
  status: string;
  delay_minutes: number;
}

const AdminTrains = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    train_number: "",
    train_name: "",
    origin: "",
    destination: "",
    scheduled_departure: "",
    scheduled_arrival: "",
    status: "on_time" as "on_time" | "delayed" | "cancelled",
    delay_minutes: 0,
  });

  useEffect(() => {
    checkAdminAndFetchTrains();
  }, []);

  const checkAdminAndFetchTrains = async () => {
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

    fetchTrains();
  };

  const fetchTrains = async () => {
    const { data, error } = await supabase
      .from("trains")
      .select("*")
      .order("train_number");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trains",
      });
    } else {
      setTrains(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("trains").insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Train added successfully",
      });

      setShowForm(false);
      setFormData({
        train_number: "",
        train_name: "",
        origin: "",
        destination: "",
        scheduled_departure: "",
        scheduled_arrival: "",
        status: "on_time",
        delay_minutes: 0,
      });
      fetchTrains();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTrainStatus = async (trainId: string, status: "on_time" | "delayed" | "cancelled", delayMinutes: number) => {
    try {
      const { error } = await supabase
        .from("trains")
        .update({ status, delay_minutes: delayMinutes })
        .eq("id", trainId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: "Train status updated successfully",
      });

      fetchTrains();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Train Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Train
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Train</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Train Number *</Label>
                    <Input
                      value={formData.train_number}
                      onChange={(e) => setFormData({ ...formData, train_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Train Name *</Label>
                    <Input
                      value={formData.train_name}
                      onChange={(e) => setFormData({ ...formData, train_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Origin *</Label>
                    <Input
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Destination *</Label>
                    <Input
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Scheduled Departure *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_departure}
                      onChange={(e) => setFormData({ ...formData, scheduled_departure: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Scheduled Arrival *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_arrival}
                      onChange={(e) => setFormData({ ...formData, scheduled_arrival: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Train"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Trains</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delay (min)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trains.map((train) => (
                  <TableRow key={train.id}>
                    <TableCell>{train.train_number}</TableCell>
                    <TableCell>{train.train_name}</TableCell>
                    <TableCell>{train.origin} → {train.destination}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        train.status === 'on_time' ? 'bg-green-100 text-green-800' :
                        train.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {train.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={train.delay_minutes || 0}
                        onChange={(e) => {
                          const newDelay = parseInt(e.target.value) || 0;
                          updateTrainStatus(train.id, newDelay > 0 ? "delayed" : "on_time", newDelay);
                        }}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={train.status}
                        onValueChange={(value) => {
                          const status = value as "on_time" | "delayed" | "cancelled";
                          const delay = status === 'on_time' ? 0 : train.delay_minutes || 0;
                          updateTrainStatus(train.id, status, delay);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_time">On Time</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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

export default AdminTrains;
