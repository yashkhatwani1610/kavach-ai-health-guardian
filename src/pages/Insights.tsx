import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Lightbulb, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Insights = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (session) {
      fetchInsights();
    }
  }, [session]);

  const fetchInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch latest vitals
      const { data: vitalsData } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch latest environment
      const { data: envData } = await supabase
        .from('environment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch parents
      const { data: parentsData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id);

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('health-insights', {
        body: {
          vitals: vitalsData,
          environment: envData,
          parents: parentsData || []
        }
      });

      if (error) {
        throw error;
      }

      if (data?.insights) {
        setInsights(data.insights);
      } else {
        throw new Error("No insights received");
      }

    } catch (error: any) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch health insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "border-danger bg-danger/5";
      case "Medium": return "border-warning bg-warning/5";
      case "Low": return "border-success bg-success/5";
      default: return "border-muted bg-muted/5";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High": return "⚠";
      case "Medium": return "!";
      case "Low": return "✓";
      default: return "?";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing your health data...</p>
        </div>
      </div>
    );
  }

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

        {insights ? (
          <>
            {/* Today's Risk */}
            <Card className={`p-6 mb-6 ${getRiskColor(insights.risk_level)}`}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  insights.risk_level === "High" ? "bg-danger/10" : 
                  insights.risk_level === "Medium" ? "bg-warning/10" : 
                  "bg-success/10"
                }`}>
                  <span className="text-2xl">{getRiskIcon(insights.risk_level)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                    Today's Risk: {insights.risk_level}
                  </h3>
                  <p className="text-muted-foreground">{insights.risk_explanation}</p>
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
                    {insights.risk_factors?.map((factor: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`mt-1 ${
                          factor.status === "positive" ? "text-success" : 
                          factor.status === "warning" ? "text-warning" : 
                          "text-danger"
                        }`}>•</span>
                        <span>{factor.factor}</span>
                      </li>
                    ))}
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
                {insights.recommendations?.map((rec: any, idx: number) => (
                  <RecommendationCard
                    key={idx}
                    title={rec.title}
                    description={rec.description}
                    priority={rec.priority}
                  />
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No health data available yet.</p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        )}
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
