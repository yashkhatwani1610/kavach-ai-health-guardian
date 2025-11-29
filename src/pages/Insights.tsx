import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Lightbulb, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const Insights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Health Insights</h1>
          <p className="text-muted-foreground">Personalized recommendations based on your health data</p>
        </div>

        {/* Today's Risk */}
        <Card className="p-6 mb-6 bg-success/5 border-success">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Today's Risk: Low</h3>
              <p className="text-muted-foreground">
                Your vitals are within normal ranges and environmental conditions are favorable. 
                Continue maintaining your current lifestyle habits.
              </p>
            </div>
          </div>
        </Card>

        {/* Why This Risk */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Why This Risk?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <span>Heart rate and SpO2 levels are stable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <span>Blood pressure is within healthy range</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <span>Air quality is good in your area</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Recommended Actions */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground">Recommended Actions</h3>
            </div>
          </div>

          <div className="grid gap-4">
            <RecommendationCard
              title="Maintain Sleep Schedule"
              description="Continue getting 7-8 hours of quality sleep each night"
              priority="low"
            />
            <RecommendationCard
              title="Stay Hydrated"
              description="Drink at least 2 liters of water throughout the day"
              priority="medium"
            />
            <RecommendationCard
              title="Regular Exercise"
              description="30 minutes of moderate activity daily helps maintain cardiovascular health"
              priority="low"
            />
            <RecommendationCard
              title="Stress Management"
              description="Practice mindfulness or meditation for 10 minutes daily"
              priority="medium"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const RecommendationCard = ({ title, description, priority }: { title: string; description: string; priority: string }) => {
  const priorityColors = {
    low: "border-success bg-success/5",
    medium: "border-warning bg-warning/5",
    high: "border-danger bg-danger/5",
  };

  return (
    <div className={`p-4 rounded-lg border ${priorityColors[priority as keyof typeof priorityColors]}`}>
      <h4 className="font-medium mb-1 text-card-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Insights;
