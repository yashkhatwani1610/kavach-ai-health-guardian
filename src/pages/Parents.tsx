import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const parentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  relationType: z.string().trim().min(2, "Relation type required").max(50, "Relation type too long"),
  contact: z.string().trim().max(500, "Contact/notes too long"),
});

const Parents = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [relationType, setRelationType] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
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
      fetchParents();
    }
  }, [user]);

  const fetchParents = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id);

    if (error && error.code !== 'PGRST116') {
      toast.error("Failed to load family information");
    } else {
      setParents(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    setLoading(true);

    try {
      const validation = parentSchema.safeParse({ name, relationType, contact });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("parents").insert({
        user_id: user.id,
        name: validation.data.name,
        relation_type: validation.data.relationType,
        contact: validation.data.contact || null,
      });

      if (error) throw error;

      toast.success("Parent information added successfully!");
      setName("");
      setRelationType("");
      setContact("");
      fetchParents();
    } catch (error: any) {
      toast.error(error.message || "Failed to add parent information");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Family Health History</h1>
          <p className="text-muted-foreground">Add parent health information to assess hereditary risks</p>
        </div>

        {/* Add Parent Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Add Parent Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Parent's name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relation">Relation</Label>
                <Input
                  id="relation"
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  placeholder="Father/Mother"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact/Notes</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Health conditions, contact info"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Parent"}
            </Button>
          </form>
        </Card>

        {/* Parents List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Family Members</h2>
          {parents.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No family member information added yet</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {parents.map((parent) => (
                <Card key={parent.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-card-foreground">{parent.name}</h3>
                        <span className="text-sm text-muted-foreground">({parent.relation_type})</span>
                      </div>
                      {parent.contact && (
                        <p className="text-sm text-muted-foreground">{parent.contact}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Hereditary Risk Assessment */}
        {parents.length > 0 && (
          <Card className="mt-8 p-6 border-warning bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-1" />
              <div>
                <h3 className="font-semibold text-card-foreground mb-2">Hereditary Risk Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your family history, you may have elevated risk for certain conditions. 
                  Regular monitoring and preventive measures are recommended.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Parents;
