import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Analytics = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [environmentData, setEnvironmentData] = useState<any[]>([]);
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
    if (session) {
      fetchAnalyticsData();
    }
  }, [session, user]);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      // Fetch vitals data
      const { data: vitals, error: vitalsError } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);

      if (!vitalsError && vitals) {
        const formattedVitals = vitals.map((v) => ({
          date: new Date(v.created_at).toLocaleDateString(),
          heartRate: v.heart_rate,
          spo2: v.spo2,
          temperature: v.temperature,
          respirationRate: v.respiration_rate,
        }));
        setVitalsData(formattedVitals);
      }

      // Fetch environment data
      const { data: env, error: envError } = await supabase
        .from('environment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);

      if (!envError && env) {
        const formattedEnv = env.map((e) => ({
          date: new Date(e.created_at).toLocaleDateString(),
          airQuality: e.air_quality,
          temperature: e.temperature,
          humidity: e.humidity,
          pm25: e.pm25,
        }));
        setEnvironmentData(formattedEnv);
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

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
          {/* Heart Rate Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Heart Rate Trends</h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            {vitalsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </Card>

          {/* SpO2 Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">SpO2 Levels</h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            {vitalsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[90, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="spo2" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </Card>

          {/* Temperature Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Body Temperature</h3>
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            {vitalsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[96, 102]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: 'hsl(var(--warning))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </Card>

          {/* Air Quality Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Air Quality Index</h3>
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            {environmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={environmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="airQuality" stroke="hsl(var(--danger))" strokeWidth={2} dot={{ fill: 'hsl(var(--danger))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </Card>

          {/* Environmental Overview */}
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Environmental Trends</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            {environmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={environmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(var(--warning))" strokeWidth={2} name="Temperature" />
                  <Line type="monotone" dataKey="humidity" stroke="hsl(var(--primary))" strokeWidth={2} name="Humidity" />
                  <Line type="monotone" dataKey="pm25" stroke="hsl(var(--danger))" strokeWidth={2} name="PM2.5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
