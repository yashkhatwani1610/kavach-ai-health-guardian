import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
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
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user?.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
    } else {
      setReports(data || []);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement actual file upload to storage and backend endpoint
      // For now, just simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Report uploaded successfully!");
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload report");
    } finally {
      setUploading(false);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Health Reports</h1>
          <p className="text-muted-foreground">Upload and manage your medical reports</p>
        </div>

        {/* Upload Section */}
        <Card className="p-8 mb-8 border-dashed border-2 border-border hover:border-primary transition-colors">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Upload Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your medical reports in PDF format
            </p>
            <label htmlFor="file-upload">
              <Button disabled={uploading} asChild>
                <span className="cursor-pointer">
                  {uploading ? "Uploading..." : "Choose File"}
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </Card>

        {/* Reports List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Reports</h2>
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reports uploaded yet</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="p-4 hover:shadow-glow transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{report.report_type || "Medical Report"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
