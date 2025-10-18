import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Train, Hotel, CalendarIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  origin: string;
  destination: string;
  scheduled_arrival: string;
}

interface Hotel {
  id: string;
  hotel_name: string;
  location: string;
  rating: number;
}

const CreateBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState<Train[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [selectedTrain, setSelectedTrain] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");
  const [checkinDate, setCheckinDate] = useState<Date>();
  const [checkoutDate, setCheckoutDate] = useState<Date>();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      fetchTrainsAndHotels();
    };

    checkAuth();
  }, [navigate]);

  const fetchTrainsAndHotels = async () => {
    try {
      const [trainsData, hotelsData] = await Promise.all([
        supabase.from("trains").select("*").order("train_number"),
        supabase.from("hotels").select("*").order("hotel_name"),
      ]);

      if (trainsData.data) setTrains(trainsData.data);
      if (hotelsData.data) setHotels(hotelsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trains and hotels",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrain || !selectedHotel || !checkinDate || !checkoutDate) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (checkoutDate <= checkinDate) {
      toast({
        variant: "destructive",
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date",
      });
      return;
    }

    setLoading(true);

    try {
      // Get or create passenger profile
      const { data: passenger, error: passengerError } = await supabase
        .from("passengers")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      let passengerId = passenger?.id;

      if (!passenger) {
        // Create passenger profile if doesn't exist
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        const { data: newPassenger, error: createError } = await supabase
          .from("passengers")
          .insert({
            user_id: user?.id,
            full_name: profile?.full_name || "Guest",
            email: profile?.email || user?.email || "",
            phone: profile?.phone,
          })
          .select()
          .single();

        if (createError) throw createError;
        passengerId = newPassenger.id;
      }

      // Calculate total amount (simplified pricing)
      const nights = Math.ceil(
        (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalAmount = nights * 2500; // ₹2500 per night

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        passenger_id: passengerId,
        train_id: selectedTrain,
        hotel_id: selectedHotel,
        original_checkin: checkinDate.toISOString(),
        original_checkout: checkoutDate.toISOString(),
        total_amount: totalAmount,
        notes: notes || null,
        status: "confirmed",
      });

      if (bookingError) throw bookingError;

      toast({
        title: "Success!",
        description: "Your booking has been created successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-6">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Booking</CardTitle>
            <CardDescription>
              Book your train journey and hotel accommodation in one seamless process
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Train className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Train Details</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="train">Select Train *</Label>
                  <Select value={selectedTrain} onValueChange={setSelectedTrain}>
                    <SelectTrigger id="train">
                      <SelectValue placeholder="Choose a train" />
                    </SelectTrigger>
                    <SelectContent>
                      {trains.map((train) => (
                        <SelectItem key={train.id} value={train.id}>
                          {train.train_name} ({train.train_number}) - {train.origin} to {train.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hotel className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold">Hotel Details</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel">Select Hotel *</Label>
                  <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                    <SelectTrigger id="hotel">
                      <SelectValue placeholder="Choose a hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.hotel_name} - {hotel.location} (⭐ {hotel.rating})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkinDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkinDate ? format(checkinDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkinDate}
                          onSelect={setCheckinDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Check-out Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkoutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkoutDate ? format(checkoutDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkoutDate}
                          onSelect={setCheckoutDate}
                          disabled={(date) => 
                            date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                            (checkinDate ? date <= checkinDate : false)
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or preferences..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {checkinDate && checkoutDate && checkoutDate > checkinDate && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Estimated Total:{" "}
                    <span className="text-lg font-bold text-foreground">
                      ₹
                      {Math.ceil(
                        (checkoutDate.getTime() - checkinDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) * 2500}
                    </span>
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateBooking;
