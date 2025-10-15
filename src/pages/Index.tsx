import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Train, Hotel, Bell, Shield, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-6">
            <Badge className="mx-auto" variant="outline">
              <Train className="h-3 w-3 mr-2" />
              Smart Travel Integration
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Never Worry About Train Delays Again
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Automatic hotel check-in rescheduling when trains are delayed. Seamless coordination
              between railways and hotels for stress-free travel.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/dashboard")} className="shadow-lg">
                View Dashboard
                <Train className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <Train className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Integrated Bookings</CardTitle>
              <CardDescription>
                Unified system connecting train and hotel reservations in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <Clock className="h-10 w-10 text-warning mb-4" />
              <CardTitle>Auto-Rescheduling</CardTitle>
              <CardDescription>
                Hotel check-ins automatically adjust when trains are delayed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <Bell className="h-10 w-10 text-accent mb-4" />
              <CardTitle>Real-Time Alerts</CardTitle>
              <CardDescription>
                Instant notifications about delays and booking updates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <Shield className="h-10 w-10 text-success mb-4" />
              <CardTitle>Smart Billing</CardTitle>
              <CardDescription>
                No extra charges for delays - fair pricing guaranteed
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <Hotel className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Hotel Coordination</CardTitle>
              <CardDescription>
                Better room management and reduced no-shows for hotels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-accent mb-4" />
              <CardTitle>Stress-Free Travel</CardTitle>
              <CardDescription>
                Peace of mind knowing your accommodations are secure
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Book Your Trip</h3>
              <p className="text-muted-foreground">
                Reserve your train journey and hotel accommodation through our integrated platform
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-warning">2</span>
              </div>
              <h3 className="text-xl font-semibold">Real-Time Monitoring</h3>
              <p className="text-muted-foreground">
                System tracks train status and detects delays automatically
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold">Auto-Adjustment</h3>
              <p className="text-muted-foreground">
                Hotel check-in times update automatically with instant notifications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary mb-2">98%</p>
            <p className="text-muted-foreground">Customer Satisfaction</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-accent mb-2">50K+</p>
            <p className="text-muted-foreground">Bookings Managed</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-warning mb-2">500+</p>
            <p className="text-muted-foreground">Partner Hotels</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-success mb-2">24/7</p>
            <p className="text-muted-foreground">Support Available</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary-glow py-16 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Experience Stress-Free Travel?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of travelers who never worry about train delays affecting their hotel bookings
          </p>
          <Button size="lg" variant="secondary" className="shadow-lg">
            Get Started Now
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
