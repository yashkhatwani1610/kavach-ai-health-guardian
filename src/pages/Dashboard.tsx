import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Droplets, Thermometer, Heart, Wind, Gauge, LogOut, FileText, Users, Brain, Settings } from "lucide-react";
import { toast } from "sonner";
import kavachLogo from "@/assets/kavach-logo.jpeg";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vitals, setVitals] = useState<any>(null);
  const [environment, setEnvironment] = useState<any>(null);
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

  useEffect(() => {
    if (user) {
      fetchVitals();
      fetchEnvironment();
    }
  }, [user]);

  const fetchVitals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("vitals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // Silently handle - no data is expected initially
    } else {
      setVitals(data);
    }
  };

  const fetchEnvironment = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("environment")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // Silently handle - no data is expected initially
    } else {
      setEnvironment(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-success";
    if (score < 70) return "text-warning";
    return "text-danger";
  };

  const mockRiskScore = 35;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={kavachLogo} alt="KAVACH AI" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="text-lg font-bold text-foreground">KAVACH AI</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.user_metadata?.name || "User"}
          </h2>
          <p className="text-muted-foreground">Here's your health status for today</p>
        </div>

        {/* Risk Score Card */}
        <Card className="mb-8 p-6 bg-gradient-card border-border shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Risk Score</p>
              <h3 className={`text-4xl font-bold ${getRiskColor(mockRiskScore)}`}>
                {mockRiskScore}%
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {mockRiskScore < 30 ? "Low Risk - Keep it up!" : mockRiskScore < 70 ? "Moderate Risk - Stay cautious" : "High Risk - Take action"}
              </p>
            </div>
            <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center">
              <Gauge className="h-12 w-12 text-success" />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <QuickActionCard
            icon={<FileText className="h-5 w-5" />}
            label="Reports"
            onClick={() => navigate("/reports")}
          />
          <QuickActionCard
            icon={<Activity className="h-5 w-5" />}
            label="Analytics"
            onClick={() => navigate("/analytics")}
          />
          <QuickActionCard
            icon={<Users className="h-5 w-5" />}
            label="Parents"
            onClick={() => navigate("/parents")}
          />
          <QuickActionCard
            icon={<Brain className="h-5 w-5" />}
            label="AI Insights"
            onClick={() => navigate("/insights")}
          />
        </div>

        {/* Vitals Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Vital Signs</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <VitalCard
              icon={<Heart className="h-5 w-5" />}
              label="Heart Rate"
              value={vitals?.heart_rate ? `${vitals.heart_rate} bpm` : "--"}
              status="normal"
            />
            <VitalCard
              icon={<Droplets className="h-5 w-5" />}
              label="SpO2"
              value={vitals?.spo2 ? `${vitals.spo2}%` : "--"}
              status="normal"
            />
            <VitalCard
              icon={<Activity className="h-5 w-5" />}
              label="Blood Pressure"
              value={vitals?.bp || "--"}
              status="normal"
            />
            <VitalCard
              icon={<Thermometer className="h-5 w-5" />}
              label="Temperature"
              value={vitals?.temperature ? `${vitals.temperature}°C` : "--"}
              status="normal"
            />
          </div>
        </div>

        {/* Environment Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Environment</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <VitalCard
              icon={<Wind className="h-5 w-5" />}
              label="Air Quality"
              value={environment?.air_quality ? `${environment.air_quality} AQI` : "--"}
              status={environment?.air_quality > 150 ? "warning" : "normal"}
            />
            <VitalCard
              icon={<Droplets className="h-5 w-5" />}
              label="Humidity"
              value={environment?.humidity ? `${environment.humidity}%` : "--"}
              status="normal"
            />
            <VitalCard
              icon={<Thermometer className="h-5 w-5" />}
              label="Temperature"
              value={environment?.temperature ? `${environment.temperature}°C` : "--"}
              status="normal"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary hover:shadow-glow transition-all duration-300"
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium text-card-foreground">{label}</span>
    </button>
  );
};

const VitalCard = ({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status: string }) => {
  const statusColor = status === "warning" ? "border-warning" : "border-success";
  
  return (
    <Card className={`p-4 border ${statusColor} shadow-card`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-card-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
