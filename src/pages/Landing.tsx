import { Button } from "@/components/ui/button";
import { Shield, Heart, Activity, Brain, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import kavachLogo from "@/assets/kavach-logo.jpeg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={kavachLogo} alt="KAVACH AI" className="h-12 w-12 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-foreground">KAVACH AI</h1>
              <p className="text-xs text-muted-foreground">Your Intelligent Shield</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Prevention</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Prevent Diseases Before
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> They Start</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            KAVACH AI is an autonomous, agentic platform that senses, analyzes, predicts, 
            and guides you toward optimal health—preventing diseases before they occur.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="shadow-glow">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          How KAVACH AI Protects You
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Activity className="h-8 w-8" />}
            title="Real-Time Monitoring"
            description="Continuous tracking of vitals, environment, and lifestyle factors with instant alerts."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="AI-Powered Insights"
            description="Advanced algorithms analyze your data to predict health risks before symptoms appear."
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8" />}
            title="Personalized Guidance"
            description="Custom recommendations tailored to your unique health profile and family history."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Health Reports"
            description="Upload and analyze medical reports with AI to track your health journey."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Family Network"
            description="Link family accounts to understand hereditary risks and shared health patterns."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Preventive Actions"
            description="Proactive recommendations to reduce risks before they become serious conditions."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-primary rounded-2xl p-12 text-center shadow-glow">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Take Control of Your Health Today
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8">
            Join thousands who are preventing diseases with intelligent health monitoring.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth?mode=signup")}>
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 KAVACH AI. Your Intelligent Shield for Preventive Health.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-glow transition-all duration-300">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default Landing;
