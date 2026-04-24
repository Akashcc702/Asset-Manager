import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { Sparkles, ArrowRight, Bot, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Locus Paygentic Hackathon #3
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight"
          >
            Turn natural-language instructions into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">agentic checkout flows.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            The AI copilot for digital sellers. Tell LocusPilot what you're selling and it handles the payment link, tracking, and delivery.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/create">
              <Button size="lg" className="rounded-full h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                Create Payment Request
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base font-semibold">
                View Dashboard
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-8"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            1-click payments • AI-powered • Locus Checkout integration
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card/50 border-y">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Three simple steps to automate your digital sales.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-border/50 shadow-sm bg-background/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot className="w-24 h-24" />
              </div>
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Prompt</h3>
              <p className="text-muted-foreground leading-relaxed">
                Type a plain-English instruction like "Collect ₹199 for Python notes and send the file after payment".
              </p>
            </Card>

            <Card className="p-8 border-border/50 shadow-sm bg-background/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24" />
              </div>
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Parse</h3>
              <p className="text-muted-foreground leading-relaxed">
                The agent understands your intent, sets up the Locus Checkout link, and readies the delivery payload.
              </p>
            </Card>

            <Card className="p-8 border-border/50 shadow-sm bg-background/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Auto-deliver</h3>
              <p className="text-muted-foreground leading-relaxed">
                Once the client pays, the agent automatically executes the next action (sending a file, marking a milestone, etc.).
              </p>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
