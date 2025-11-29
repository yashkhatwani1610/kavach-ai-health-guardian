import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";

const Analytics = () => {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Health Analytics</h1>
          <p className="text-muted-foreground">Track your health metrics over time</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Heart Rate Trends</h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">SpO2 Levels</h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Blood Pressure</h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Air Quality Index</h3>
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
