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
  const [parents, setParents] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState<{ level: string; score: number; color: string }>({ level: "Low", score: 0, color: "text-success" });
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
      fetchParents();
    }
  }, [user]);

  useEffect(() => {
    if (vitals || environment || parents.length > 0) {
      calculateRiskScore();
    }
  }, [vitals, environment, parents]);

  const fetchVitals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setVitals(data);
      }
    } catch (err) {
      console.error('Error fetching vitals:', err);
    }
  };

  const fetchParents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setParents(data);
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
    }
  };

  const calculateRiskScore = () => {
    let score = 0;
    let factors = [];

    // Vital signs risk factors
    if (vitals) {
      if (vitals.heart_rate > 100 || vitals.heart_rate < 60) {
        score += 2;
        factors.push("Abnormal heart rate");
      }
      if (vitals.spo2 < 95) {
        score += 3;
        factors.push("Low oxygen saturation");
      }
      if (vitals.temperature > 99.5) {
        score += 2;
        factors.push("Elevated temperature");
      }
    }

    // Environmental risk factors
    if (environment) {
      if (environment.air_quality > 150) {
        score += 2;
        factors.push("Poor air quality");
      }
      if (environment.pm25 > 35) {
        score += 1;
        factors.push("High PM2.5 levels");
      }
    }

    // Hereditary risk factors
    if (parents && parents.length > 0) {
      const hasDiabetes = parents.some(p => p.name?.toLowerCase().includes('diabetes'));
      const hasCardiac = parents.some(p => p.name?.toLowerCase().includes('cardiac') || p.name?.toLowerCase().includes('heart'));
      
      if (hasDiabetes) {
        score += 2;
        factors.push("Family history of diabetes");
      }
      if (hasCardiac) {
        score += 2;
        factors.push("Family history of cardiac issues");
      }
    }

    // Determine risk level
    let level = "Low";
    let color = "text-success";
    
    if (score >= 6) {
      level = "High";
      color = "text-danger";
    } else if (score >= 3) {
      level = "Medium";
      color = "text-warning";
    }

    setRiskScore({ level, score, color });
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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Risk Score Card */}
          <Card className={`p-6 ${
            riskScore.level === "High" ? "bg-danger/5 border-danger" : 
            riskScore.level === "Medium" ? "bg-warning/5 border-warning" : 
            "bg-success/5 border-success"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                <h2 className={`text-3xl font-bold ${riskScore.color}`}>{riskScore.level}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {riskScore.level === "Low" && "Your health metrics are stable"}
                  {riskScore.level === "Medium" && "Some metrics need attention"}
                  {riskScore.level === "High" && "Please consult a healthcare professional"}
                </p>
              </div>
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                riskScore.level === "High" ? "bg-danger/10" : 
                riskScore.level === "Medium" ? "bg-warning/10" : 
                "bg-success/10"
              }`}>
                <span className="text-2xl">
                  {riskScore.level === "High" && "⚠"}
                  {riskScore.level === "Medium" && "!"}
                  {riskScore.level === "Low" && "✓"}
                </span>
              </div>
            </div>
          </Card>

          {/* Hereditary Risk Card */}
          {parents.length > 0 ? (
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">🧬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Hereditary Risk</h3>
                  <p className="text-sm text-muted-foreground">Based on family health history</p>
                </div>
              </div>
              <div className="space-y-2">
                {parents.map((parent, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-card-foreground">{parent.relation_type}: {parent.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">🧬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Hereditary Risk</h3>
                  <p className="text-sm text-muted-foreground">Add family health history</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/parents")} className="w-full mt-2">
                Add Parents Info
              </Button>
            </Card>
          )}
        </div>

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
