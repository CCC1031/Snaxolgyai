import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Globe, 
  ChevronRight, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";

import stepsData from "@/data/vending_steps.json";
import VendingCalculator from "@/components/VendingCalculator";
import LocationScorecard from "@/components/LocationScorecard";
import PitchHelper from "@/components/PitchHelper";
import InspectionChecklist from "@/components/InspectionChecklist";
import LocationMap from "@/components/LocationMap";
import LeadCaptureModal from "@/components/LeadCaptureModal";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface Step {
  id: number;
  title: string;
  badge: string;
  quote?: string;
  quoteAuthor?: string;
  description: string;
  tasks: Task[];
  tips: string[];
}

export default function Home() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [expandedTips, setExpandedTips] = useState<Record<number, boolean>>({});
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Read current calculator & locations data to pass to the LeadCaptureModal
  const getFunnelData = () => {
    const savedLocations = localStorage.getItem("snaxology_vending_locations");
    const locations = savedLocations ? JSON.parse(savedLocations) : [];

    const machineCost = Number(localStorage.getItem("snaxology_calc_machine_cost") || "2000");
    const monthlyRevenue = Number(localStorage.getItem("snaxology_calc_monthly_sales") || "500");
    const cogsPercent = Number(localStorage.getItem("snaxology_calc_cogs_percent") || "45");
    const operatingExpenses = Number(localStorage.getItem("snaxology_calc_operating_expenses") || "50");

    const monthlyCOGS = (monthlyRevenue * cogsPercent) / 100;
    const grossProfit = monthlyRevenue - monthlyCOGS;
    const monthlyMargin = grossProfit - operatingExpenses;
    const annualProfit = monthlyMargin > 0 ? monthlyMargin * 12 : 0;
    const paybackMonths = monthlyMargin > 0 ? machineCost / monthlyMargin : 0;

    return {
      calculatorData: {
        monthlyRevenue,
        marginPercent: monthlyRevenue > 0 ? Math.round((monthlyMargin / monthlyRevenue) * 100) : 0,
        monthlyMargin,
        vendingPrice: 2.50, // Standard average product price
        cogs: monthlyCOGS,
        annualProfit,
        machineCost,
        paybackMonths,
      },
      locations: locations.map((l: any) => ({
        name: l.name,
        address: l.address,
        score: l.score,
        status: l.status
      }))
    };
  };

  const { calculatorData, locations } = getFunnelData();

  // Initialize steps from localStorage or JSON
  useEffect(() => {
    const saved = localStorage.getItem("snaxology_vending_roadmap_progress");
    if (saved) {
      try {
        setSteps(JSON.parse(saved));
      } catch (e) {
        setSteps(stepsData as Step[]);
      }
    } else {
      setSteps(stepsData as Step[]);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (updatedSteps: Step[]) => {
    setSteps(updatedSteps);
    localStorage.setItem("snaxology_vending_roadmap_progress", JSON.stringify(updatedSteps));
  };

  // Toggle a single checklist task
  const handleToggleTask = (stepId: number, taskId: string) => {
    const updated = steps.map((step) => {
      if (step.id === stepId) {
        const updatedTasks = step.tasks.map((t) => {
          if (t.id === taskId) {
            const newDone = !t.done;
            if (newDone) {
              toast.success("Task completed! Keep pushing forward.", {
                icon: <CheckCircle2 className="w-4 h-4 text-secondary" />
              });
            }
            return { ...t, done: newDone };
          }
          return t;
        });
        return { ...step, tasks: updatedTasks };
      }
      return step;
    });
    saveProgress(updated);
  };

  // Reset all progress
  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset all roadmap progress? This cannot be undone.")) {
      saveProgress(stepsData as Step[]);
      setActiveStepId(1);
      toast.success("Roadmap reset successfully.");
    }
  };

  // Toggle tips section accordion
  const toggleTips = (stepId: number) => {
    setExpandedTips(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  // Calculate stats
  const totalTasks = steps.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = steps.reduce((sum, s) => sum + s.tasks.filter(t => t.done).length, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active step details
  const activeStep = steps.find((s) => s.id === activeStepId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Header Banner */}
      <header className="relative border-b-4 border-primary overflow-hidden bg-primary/5">
        {/* Abstract retro shapes background */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://d2xsxph8kpxj0f.cloudfront.net/310519663676595920/NgLLzCmvo5MfbkndezyhqL/snaxology_hero_bg-EMaWtiqeHYkFnwqLHribNC.webp')] bg-cover bg-center" />
        
        <div className="container relative z-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="diner-badge">Roadmap</span>
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-primary">Powered by Snaxology AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-primary leading-tight">
              Start Your Vending Machine <br className="hidden sm:inline" />
              Business Today
            </h1>
            <p className="text-base md:text-lg max-w-2xl text-foreground/80 leading-relaxed font-sans">
              Snaxology’s complete, step-by-step roadmap designed specifically to help you build, launch, and scale a highly profitable vending route. 
              Track your progress live, calculate your profit margins, and score potential locations.
            </p>
          </div>
          
          {/* Logo / Mascot Card */}
          <div className="flex flex-col items-center justify-center bg-card border-2 border-foreground/15 p-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] w-48 shrink-0">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663676595920/NgLLzCmvo5MfbkndezyhqL/snaxology_vending_retro-ZzESUPCFN8hZmsEW4oA2QB.webp" 
              alt="Snaxology Vintage Automat" 
              className="w-24 h-24 object-contain rounded-md"
            />
            <span className="font-serif font-black text-primary tracking-widest text-lg mt-2">SNAXOLOGY</span>
            <span className="text-[10px] font-sans font-bold text-foreground/50 tracking-widest uppercase">Miami, Florida</span>
          </div>
        </div>
      </header>

      {/* Progress Dashboard Banner */}
      <section className="bg-primary border-b-2 border-foreground/15 py-4 text-primary-foreground relative z-10 shadow-md">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-3 bg-primary-foreground/10 rounded-lg border border-primary-foreground/15">
              <Sparkles className="w-6 h-6 text-background" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">Your Vending Route Progress</p>
              <h2 className="text-xl font-serif font-black">{overallProgress}% Completed</h2>
            </div>
          </div>
          
          {/* Progress Bar & Reset Button */}
          <div className="flex items-center gap-6 w-full sm:w-auto grow max-w-xl">
            <div className="grow space-y-1">
              <Progress value={overallProgress} className="h-3 bg-primary-foreground/20 border border-primary-foreground/10 [&>div]:bg-background" />
              <p className="text-[10px] text-right opacity-80 font-semibold uppercase tracking-wider">{completedTasks} of {totalTasks} milestones achieved</p>
            </div>
            
            <div className="flex gap-2.5 shrink-0">
              <Button
                onClick={() => setIsLeadModalOpen(true)}
                className="bg-background text-primary hover:bg-background/90 text-xs font-serif font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-transform active:scale-95"
              >
                📥 Download Plan
              </Button>
              <Button 
                onClick={handleResetProgress}
                variant="outline" 
                size="sm" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs font-serif font-bold"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <main className="container py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 grow items-start">
        {/* Left Column: Automat Step Select (4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="tactile-card overflow-hidden">
            <div className="bg-primary/5 px-5 py-4 border-b-2 border-foreground/10 flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-primary tracking-tight">Vending Route Steps</h3>
              <span className="text-xs font-sans font-bold text-foreground/50 uppercase tracking-widest">Select Step</span>
            </div>
            <div className="p-3 bg-card space-y-1 max-h-[500px] overflow-y-auto">
              {steps.map((step) => {
                const stepDoneCount = step.tasks.filter(t => t.done).length;
                const stepTotalCount = step.tasks.length;
                const stepPercent = stepTotalCount > 0 ? Math.round((stepDoneCount / stepTotalCount) * 100) : 0;
                const isActive = step.id === activeStepId;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    className={`w-full text-left p-3 rounded-md border-2 transition-all duration-150 flex items-center justify-between group ${
                      isActive 
                        ? "bg-primary/5 border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]" 
                        : "bg-transparent border-transparent hover:bg-foreground/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center font-serif font-black border-2 transition-colors ${
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background text-foreground/50 border-foreground/10 group-hover:border-foreground/20"
                      }`}>
                        {step.id}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                          isActive ? "text-primary" : "text-foreground/40"
                        }`}>{step.badge}</p>
                        <h4 className={`font-serif font-bold text-sm leading-tight transition-colors ${
                          isActive ? "text-foreground" : "text-foreground/80"
                        }`}>{step.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                      {stepPercent === 100 ? (
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      ) : (
                        <span className="text-[10px] font-bold font-serif text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded border border-foreground/5">
                          {stepDoneCount}/{stepTotalCount}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform duration-150 ${
                        isActive ? "text-primary translate-x-0.5" : "text-foreground/20 group-hover:text-foreground/40"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Quick Info Box */}
          <div className="border-2 border-dashed border-primary/20 rounded-lg p-5 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-5 h-5 shrink-0" />
              <h4 className="font-serif font-bold text-base">Snaxology's Golden Rule</h4>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed font-sans">
              "Vending is simple, but it is not automatic. The people who win are the people who choose better locations, 
              buy equipment wisely, restock consistently, track the numbers, and treat every property like a relationship."
            </p>
          </div>
        </div>

        {/* Right Column: Step Detail & Checklist (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {activeStep ? (
            <Card className="tactile-card overflow-hidden">
              {/* Step Header */}
              <div className="bg-primary/5 border-b border-foreground/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="diner-badge">{activeStep.badge}</span>
                  <span className="text-xs font-sans font-bold text-foreground/40 uppercase tracking-widest">Step {activeStep.id} of 10</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-foreground leading-tight">
                  {activeStep.title}
                </h2>
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
                  {activeStep.description}
                </p>
                
                {/* Quote Block if exists */}
                {activeStep.quote && (
                  <blockquote className="border-l-4 border-primary pl-4 py-1 my-2 italic text-foreground/70 font-serif text-sm">
                    "{activeStep.quote}"
                    {activeStep.quoteAuthor && (
                      <span className="block text-xs font-sans font-bold text-foreground/40 uppercase tracking-wider mt-1 not-italic">— {activeStep.quoteAuthor}</span>
                    )}
                  </blockquote>
                )}
              </div>

              {/* Checklist Tasks */}
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif font-bold text-lg text-foreground/90 border-b border-foreground/10 pb-1 flex items-center justify-between">
                    <span>Interactive Milestones</span>
                    <span className="text-xs font-sans font-normal text-foreground/50">Toggle to complete</span>
                  </h3>
                  <div className="space-y-2.5">
                    {activeStep.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => handleToggleTask(activeStep.id, task.id)}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border-2 cursor-pointer transition-all select-none ${
                          task.done 
                            ? "bg-secondary/5 border-secondary/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.02)]" 
                            : "bg-card border-foreground/10 hover:border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.04)]"
                        }`}
                      >
                        <Checkbox 
                          id={task.id}
                          checked={task.done}
                          onCheckedChange={() => {}} // handled by parent div click
                          className="mt-0.5 border-2 border-foreground/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                        <span className={`text-sm md:text-base leading-relaxed font-sans ${
                          task.done ? "text-foreground/40 line-through font-medium" : "text-foreground/80 font-medium"
                        }`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Tips Accordion */}
                <div className="border-2 border-foreground/10 rounded-lg overflow-hidden bg-background">
                  <button 
                    onClick={() => toggleTips(activeStep.id)}
                    className="w-full flex items-center justify-between p-4 font-serif font-bold text-primary text-sm sm:text-base bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Snaxology's Pro-Tips & Strategy</span>
                    </div>
                    {expandedTips[activeStep.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedTips[activeStep.id] && (
                    <div className="p-4 border-t border-foreground/10 space-y-3 bg-card">
                      {activeStep.tips.map((tip, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                            {tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-foreground/10">
                  <Button
                    onClick={() => setActiveStepId(prev => Math.max(1, prev - 1))}
                    disabled={activeStep.id === 1}
                    variant="outline"
                    className="tactile-btn-secondary"
                  >
                    Previous Step
                  </Button>
                  
                  {activeStep.id < 10 ? (
                    <Button
                      onClick={() => setActiveStepId(prev => Math.min(10, prev + 1))}
                      className="tactile-btn-primary"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-secondary font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Roadmap Completed!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-foreground/10 rounded-lg">
              <p className="text-foreground/50">Select a step on the left to begin.</p>
            </div>
          )}
        </div>
      </main>

      {/* Tools & Calculators Hub */}
      <section className="bg-primary/5 border-t-4 border-primary py-16">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <span className="diner-badge">Interactive Hub</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-foreground">
              Vending Business Toolkits
            </h2>
            <p className="text-sm md:text-base text-foreground/70 max-w-2xl mx-auto">
              Equip yourself with the tools Snaxology uses daily to inspect machines, analyze locations, and negotiate deals.
            </p>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="flex flex-wrap md:grid md:grid-cols-5 w-full max-w-4xl mx-auto gap-2 md:gap-0 mb-8 bg-muted/50 md:bg-muted border-2 border-foreground/5 p-1.5 md:p-1 rounded-lg">
              <TabsTrigger value="map" className="flex-1 min-w-[140px] md:min-w-0 font-serif font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none">
                🗺️ Route Map
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex-1 min-w-[140px] md:min-w-0 font-serif font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none">
                Profit Calculator
              </TabsTrigger>
              <TabsTrigger value="scorecard" className="flex-1 min-w-[140px] md:min-w-0 font-serif font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none">
                Location Scorecard
              </TabsTrigger>
              <TabsTrigger value="pitch" className="flex-1 min-w-[140px] md:min-w-0 font-serif font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none">
                Pitch Script Helper
              </TabsTrigger>
              <TabsTrigger value="inspection" className="flex-1 min-w-[140px] md:min-w-0 font-serif font-bold py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none">
                Inspection Checklist
              </TabsTrigger>
            </TabsList>

            <div className="focus-visible:outline-none">
              <TabsContent value="map" className="focus-visible:outline-none">
                <LocationMap />
              </TabsContent>
              <TabsContent value="calculator" className="focus-visible:outline-none">
                <VendingCalculator />
              </TabsContent>
              <TabsContent value="scorecard" className="focus-visible:outline-none">
                <LocationScorecard />
              </TabsContent>
              <TabsContent value="pitch" className="focus-visible:outline-none">
                <PitchHelper />
              </TabsContent>
              <TabsContent value="inspection" className="focus-visible:outline-none">
                <InspectionChecklist />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Lead Capture & PDF Generation Funnel Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        calculatorData={calculatorData}
        locations={locations}
      />

      {/* Footer & Snaxology Call to Action */}
      <footer className="bg-foreground text-background border-t-2 border-primary/20 py-16">
        <div className="container grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663676595920/NgLLzCmvo5MfbkndezyhqL/snaxology_vending_retro-ZzESUPCFN8hZmsEW4oA2QB.webp" 
                alt="Snaxology Logo" 
                className="w-12 h-12 object-contain bg-background rounded-md p-1 border border-primary/10"
              />
              <span className="font-serif font-black text-primary tracking-widest text-2xl">SNAXOLOGY</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed font-sans">
              Elevating everyday convenience through smart vending, premium micro-markets, and responsive local service. 
              We design and manage tailored refreshment experiences for modern property managers and busy shared spaces.
            </p>
            <p className="text-xs text-background/50 font-sans">
              &copy; {new Date().getFullYear()} Snaxology Vending LLC. All rights reserved. Built for Snaxology's Vending Community.
            </p>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-serif font-bold text-lg text-primary tracking-tight">Contact Snaxology</h4>
            <div className="space-y-3 text-sm text-background/80 font-sans">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <a href="https://www.snaxologyvending.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                  <span>www.snaxologyvending.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:ccolin@snaxologyvending.com" className="hover:text-primary hover:underline">
                  ccolin@snaxologyvending.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:3055270879" className="hover:text-primary hover:underline">
                  305-527-0879
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                <a href="https://www.instagram.com/_snaxology/" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                  <span>@_snaxology</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Miami, Florida</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif font-bold text-lg text-primary tracking-tight">Vending Resources</h4>
            <div className="space-y-3 text-sm text-background/80 font-sans">
              <p className="text-xs text-background/60 leading-relaxed">
                Applying for an Employer Identification Number (EIN) is free on the IRS portal.
              </p>
              <a 
                href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold"
              >
                <span>Apply for EIN (IRS Portal)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
