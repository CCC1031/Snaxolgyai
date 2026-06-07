import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Package,
  ArrowRight,
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
  description: string;
  image?: string;
  tasks: Task[];
  tips: string[];
}

export default function Home() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [expandedTips, setExpandedTips] = useState<Record<number, boolean>>({});
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

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
        vendingPrice: 2.5,
        cogs: monthlyCOGS,
        annualProfit,
        machineCost,
        paybackMonths,
      },
      locations: locations.map((l: any) => ({
        name: l.name,
        address: l.address,
        score: l.score,
        status: l.status,
      })),
    };
  };

  const { calculatorData, locations } = getFunnelData();

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

  const saveProgress = (updatedSteps: Step[]) => {
    setSteps(updatedSteps);
    localStorage.setItem("snaxology_vending_roadmap_progress", JSON.stringify(updatedSteps));
  };

  const handleToggleTask = (stepId: number, taskId: string) => {
    const updated = steps.map((step) => {
      if (step.id === stepId) {
        const updatedTasks = step.tasks.map((t) => {
          if (t.id === taskId) {
            const newDone = !t.done;
            if (newDone) {
              toast.success("Task completed! Keep pushing forward.", {
                icon: <CheckCircle2 className="w-4 h-4 text-secondary" />,
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

  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset all roadmap progress? This cannot be undone.")) {
      saveProgress(stepsData as Step[]);
      setActiveStepId(1);
      toast.success("Roadmap reset successfully.");
    }
  };

  const toggleTips = (stepId: number) => {
    setExpandedTips((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const totalTasks = steps.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = steps.reduce((sum, s) => sum + s.tasks.filter((t) => t.done).length, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeStep = steps.find((s) => s.id === activeStepId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">

      {/* ── HERO / COVER SECTION ── */}
      <header className="relative overflow-hidden bg-[#FFF5F0] border-b-4 border-primary">
        <div
          className="absolute inset-0 z-0 opacity-[0.04] bg-cover bg-center"
          style={{ backgroundImage: "url('/vending-images/machine-hero.png')" }}
        />
        <div className="container relative z-10 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">SNAXOLOGY</p>
            <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tight leading-[1.05]">
              THE{" "}
              <span className="text-primary">45-DAY</span>
              <br />
              VENDING LAUNCH
              <br />
              BLUEPRINT
            </h1>
            <p className="text-base text-foreground/70 font-sans leading-relaxed max-w-md">
              A Beginner-Friendly Plan to Start and Secure Your First Vending Location
            </p>
            <div className="space-y-2 max-w-sm">
              {[
                "AI-Powered Smart Markets",
                "Zero Cost to Location",
                "Luxury Meets Convenience",
                "Fully Managed Service",
                "Timely Restocking Guaranteed",
              ].map((feat) => (
                <div
                  key={feat}
                  className="border border-foreground/15 bg-white/70 rounded px-4 py-2 text-sm font-sans font-medium text-foreground/80"
                >
                  {feat}
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-serif font-black text-base px-8 py-3 rounded-md shadow-md"
            >
              Download Your Blueprint
            </Button>
          </div>

          {/* Right: Actual vending machine photo from PDF */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full rounded-2xl overflow-hidden bg-[#f5ede8] shadow-2xl" style={{ minHeight: '340px' }}>
              <img
                src="/vending-images/machine-phase1.png"
                alt="Snaxology 24H Smart Vending Machine"
                className="w-full h-full object-cover object-center"
                style={{ minHeight: '340px', maxHeight: '420px' }}
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                24H Smart Vending
              </div>
            </div>
            <div className="flex flex-col items-center bg-white border-2 border-foreground/10 rounded-lg px-6 py-4 shadow-sm">
              <span className="font-serif font-black text-primary tracking-widest text-xl">SNAXOLOGY</span>
              <span className="text-[10px] font-sans font-bold text-foreground/40 tracking-widest uppercase mt-0.5">Miami, Florida</span>
            </div>
          </div>
        </div>
        <div className="bg-primary/90 text-primary-foreground text-center py-2 text-xs font-bold uppercase tracking-widest">
          45 days to your first vending location &nbsp;→
        </div>
      </header>

      {/* ── PROGRESS DASHBOARD ── */}
      <section className="bg-primary border-b-2 border-foreground/15 py-4 text-primary-foreground relative z-10 shadow-md">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-3 bg-primary-foreground/10 rounded-lg border border-primary-foreground/15">
              <Sparkles className="w-6 h-6 text-background" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">Your Blueprint Progress</p>
              <h2 className="text-xl font-serif font-black">{overallProgress}% Completed</h2>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full sm:w-auto grow max-w-xl">
            <div className="grow space-y-1">
              <Progress
                value={overallProgress}
                className="h-3 bg-primary-foreground/20 border border-primary-foreground/10 [&>div]:bg-background"
              />
              <p className="text-[10px] text-right opacity-80 font-semibold uppercase tracking-wider">
                {completedTasks} of {totalTasks} milestones achieved
              </p>
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

      {/* ── MAIN INTERACTIVE ROADMAP ── */}
      <main className="container py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 grow items-start">
        {/* Left: Step Selector */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="tactile-card overflow-hidden">
            <div className="bg-primary/5 px-5 py-4 border-b-2 border-foreground/10 flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-primary tracking-tight">Blueprint Phases</h3>
              <span className="text-xs font-sans font-bold text-foreground/50 uppercase tracking-widest">Select Phase</span>
            </div>
            <div className="p-3 bg-card space-y-1 max-h-[500px] overflow-y-auto">
              {steps.map((step) => {
                const stepDoneCount = step.tasks.filter((t) => t.done).length;
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
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center font-serif font-black border-2 transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground/50 border-foreground/10 group-hover:border-foreground/20"
                        }`}
                      >
                        {step.id}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? "text-primary" : "text-foreground/40"}`}>
                          {step.badge}
                        </p>
                        <h4 className={`font-serif font-bold text-sm leading-tight transition-colors ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                          {step.title}
                        </h4>
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
                      <ChevronRight className={`w-4 h-4 transition-transform duration-150 ${isActive ? "text-primary translate-x-0.5" : "text-foreground/20 group-hover:text-foreground/40"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snaxology Golden Rule */}
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

        {/* Right: Step Detail */}
        <div className="lg:col-span-8 space-y-8">
          {activeStep ? (
            <Card className="tactile-card overflow-hidden">
              {/* Phase header */}
              <div className="bg-primary/5 border-b border-foreground/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {activeStep.badge}
                  </span>
                  <span className="text-xs font-sans font-bold text-foreground/40 uppercase tracking-widest">
                    Phase {activeStep.id} of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-foreground">
                  {activeStep.title}
                </h2>

                <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
                  {activeStep.description}
                </p>
                {activeStep.quote && (
                  <blockquote className="border-l-4 border-primary pl-4 py-1 my-2 italic text-foreground/70 font-serif text-sm">
                    "{activeStep.quote}"
                  </blockquote>
                )}
              </div>

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
                          onCheckedChange={() => {}}
                          className="mt-0.5 border-2 border-foreground/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                        <span className={`text-sm md:text-base leading-relaxed font-sans ${task.done ? "text-foreground/40 line-through font-medium" : "text-foreground/80 font-medium"}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips Accordion */}
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
                          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">{tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-foreground/10">
                  <Button
                    onClick={() => setActiveStepId((prev) => Math.max(1, prev - 1))}
                    disabled={activeStep.id === 1}
                    variant="outline"
                    className="border-foreground/20 text-foreground/70 hover:bg-foreground/5 font-serif font-bold"
                  >
                    Previous Phase
                  </Button>
                  {activeStep.id < steps.length ? (
                    <Button
                      onClick={() => setActiveStepId((prev) => Math.min(steps.length, prev + 1))}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-serif font-black"
                    >
                      Next Phase
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-secondary font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Blueprint Completed!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-foreground/10 rounded-lg">
              <p className="text-foreground/50">Select a phase on the left to begin.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── VENDING MACHINE PHOTO GALLERY ── */}
      <section className="bg-foreground py-14">
        <div className="container space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">SNAXOLOGY EQUIPMENT</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-background">
              AI-Powered Smart Vending
            </h2>
            <p className="text-sm text-background/60 font-sans max-w-xl mx-auto">
              Our 24H Smart Vending machines use grab-and-go technology with auto checkout in 60 seconds. Zero cost to
              the location. Fully managed. Always stocked.
            </p>
          </div>
          {/* Real-world placement photos — wide banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { src: "/vending-images/machine-lounge.png", label: "Luxury Lounge Placement" },
              { src: "/vending-images/machine-lobby.png", label: "Hotel Lobby Placement" },
            ].map((item) => (
              <div key={item.label} className="relative group overflow-hidden rounded-xl border-2 border-background/10 bg-background/5">
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-56 md:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3">
                  <p className="text-background text-xs font-bold uppercase tracking-wider">{item.label}</p>
                </div>
              </div>
            ))}
          </div>


          <div className="text-center">
            <Button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-serif font-black text-sm px-8 py-3"
            >
              Partner with Snaxology
            </Button>
          </div>
        </div>
      </section>

      {/* ── WHY PRESENTATION DETERMINES YOUR YES-RATE ── */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60">SNAXOLOGY</p>
            <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight">
              WHY PRESENTATION{" "}
              <span className="text-[#C8A000]">DETERMINES</span>{" "}
              YOUR{" "}
              <span className="text-[#C8A000]">YES-RATE</span>
            </h2>
            <div className="border border-primary-foreground/20 rounded-lg p-5 space-y-3 bg-primary-foreground/5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">WHAT LOCATIONS WANT TO SEE:</p>
              {[
                "Professional vendors who look and act the part",
                "Clean, well-structured service proposals",
                "Clear information about service terms and expectations",
                "Structured agreements that protect both parties",
                "Evidence of reliability and long-term commitment",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#C8A000] font-bold mt-0.5">▶</span>
                  <p className="text-sm font-sans text-primary-foreground/90">{item}</p>
                </div>
              ))}
            </div>
            <blockquote className="border-l-4 border-[#C8A000] pl-4 py-2 italic text-primary-foreground/80 font-serif text-sm leading-relaxed">
              How you present yourself is the single biggest factor in whether a location says yes. Access ready-to-use
              templates to increase your approval rate and close locations faster — without starting from scratch.
            </blockquote>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">WHAT THIS MEANS FOR YOU:</p>
              {[
                "Walk into every meeting with a complete, professional packet",
                "Never scramble to explain your service — your materials do it for you",
                "Location owners see a serious operator, not someone figuring it out",
                "Faster decisions; fewer follow-ups; more signed agreements",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#C8A000] font-bold mt-0.5">▶</span>
                  <p className="text-sm font-sans text-primary-foreground/90">{item}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">THE BOTTOM LINE:</p>
              {[
                "First impressions happen before you say a word",
                "A professional packet signals you are serious",
                "Templates let you focus on the conversation, not the paperwork",
                "Consistency across all touchpoints builds trust fast",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[#C8A000] font-bold mt-0.5">▶</span>
                  <p className="text-sm font-sans text-primary-foreground/90">{item}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-[#C8A000] text-[#1a0a00] hover:bg-[#b89000] font-serif font-black text-sm px-6 py-2.5 rounded"
            >
              Contact Snaxology Today
            </Button>
          </div>

          <div className="space-y-6">
            <div className="border border-[#C8A000]/40 rounded-lg p-5 bg-primary-foreground/5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C8A000]">TEMPLATES GIVE YOU:</p>
              {[
                "Eliminate guesswork",
                "Save your time",
                "Increase credibility instantly",
                "Build long-term trust",
                "Close locations faster",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A000] shrink-0" />
                  <p className="text-sm font-sans text-primary-foreground/90 font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="border border-primary-foreground/15 rounded-lg p-5 bg-primary-foreground/5 space-y-3 text-sm font-sans text-primary-foreground/80 leading-relaxed">
              <p>
                Snaxology provides{" "}
                <span className="font-bold text-[#C8A000]">premium micro markets</span> and{" "}
                <span className="font-bold text-[#C8A000]">AI-powered smart coolers</span> — zero cost to the location,
                zero hassle, and fully managed from installation to restocking.
              </p>
              <p>
                Every Snaxology partner gets a{" "}
                <span className="font-bold text-[#C8A000]">done-for-you service package</span> that includes machine
                placement, stocking, maintenance, and customer support — so you can focus on growth.
              </p>
              <p className="text-primary-foreground/50 text-xs">305-527-0879 · snaxologyvending.com</p>
              <Button
                onClick={() => window.open("https://www.snaxologyvending.com", "_blank")}
                className="bg-[#C8A000] text-[#1a0a00] hover:bg-[#b89000] font-serif font-bold text-sm px-5 py-2 rounded mt-2"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── OPERATE LIKE A REAL BUSINESS ── */}
      <section className="bg-[#FFF5F0] border-t-4 border-primary py-16">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Phase 4 — Days 31–42
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-foreground">
              OPERATE LIKE A{" "}
              <span className="text-primary">REAL BUSINESS</span>
            </h2>
            <p className="text-sm md:text-base text-foreground/70 max-w-2xl mx-auto font-sans">
              Once you secure a location, the real business begins. Systems are what separate operators who scale from
              those who stay stuck at one machine.
            </p>
          </div>

          {/* Machine photo */}
          <div className="flex justify-center">
            <img
src="/vending-images/machine-lounge.png"
                  alt="Snaxology vending machine in luxury lounge"
              className="w-full max-w-3xl h-56 md:h-72 object-cover object-center drop-shadow-xl rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-foreground/10 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/20">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-black text-lg text-foreground uppercase tracking-wide">Profit Tracking</h3>
              </div>
              {[
                { label: "REVENUE", body: "How much the machine actually generates per service period. Track this weekly to spot trends early and identify your highest-performing locations." },
                { label: "COST OF GOODS", body: "What you paid for the inventory restocked in the machine. Your margin lives here — buy smarter to earn more on every restock." },
                { label: "COMMISSION", body: "What you owe the location, if a revenue-share agreement applies. Always document this clearly in your location contract from day one." },
                { label: "NET PROFIT", body: "What you actually keep after all costs, commissions, and operating expenses. This is your real number — know it for every machine, every month." },
                { label: "GROWTH REINVESTMENT", body: "Once you hit consistent profit, reinvest into your second machine. The fastest-growing operators treat every dollar of net profit as fuel for expansion." },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.label}</p>
                  <p className="text-sm font-sans text-foreground/75 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border-2 border-foreground/10 rounded-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/20">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-black text-lg text-foreground uppercase tracking-wide">Inventory Management</h3>
              </div>
              {[
                { label: "BEST SELLERS", body: "What actually moves? Double down on those products. Never let your top sellers run out — an empty slot is lost revenue every hour it sits empty." },
                { label: "SLOW MOVERS", body: "Remove them. Replace them. Dead stock is wasted shelf space and lost profit. Rotate aggressively and test new products in slow-mover slots." },
                { label: "RESTOCK SCHEDULE", body: "Are you going weekly? Biweekly? Build a consistent cadence your location can rely on. Reliability is your biggest competitive advantage." },
                { label: "WASTE REDUCTION", body: "Expired products equal lost profit. Track expiry dates on every visit, rotate stock front-to-back, and never leave near-expiry items in the machine." },
                { label: "PRODUCT TESTING", body: "Use slow-mover slots as a testing ground for new products. Run a new item for 2–3 restocks before making a final call on whether it stays or goes." },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.label}</p>
                  <p className="text-sm font-sans text-foreground/75 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-primary/20 rounded-xl p-6 bg-white space-y-3 max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">SNAXOLOGY ADVANTAGE</p>
            <p className="text-sm font-sans text-foreground/75 leading-relaxed">
              Snaxology operators benefit from{" "}
              <span className="font-bold text-primary">AI-powered inventory tracking</span> built into every smart cooler
              — real-time sales data, automatic low-stock alerts, and zero manual counting. Your business runs smarter
              from day one.
            </p>
          </div>

          <div className="text-center space-y-2 py-4">
            <p className="text-2xl md:text-3xl font-serif font-black text-foreground">
              "What gets measured gets managed."
            </p>
            <p className="text-sm text-foreground/50 font-sans italic">
              Build your systems now. Scale your business later.
            </p>
          </div>
        </div>
      </section>

      {/* ── TOOLS & CALCULATORS HUB ── */}
      <section className="bg-primary/5 border-t-4 border-primary py-16">
        <div className="container space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Interactive Hub
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-foreground">
              Vending Business Toolkits
            </h2>
            <p className="text-sm md:text-base text-foreground/70 max-w-2xl mx-auto">
              Equip yourself with the tools Snaxology uses daily to inspect machines, analyze locations, and negotiate deals.
            </p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full overflow-x-auto scrollbar-none mb-8 -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="flex md:grid md:grid-cols-5 w-max md:w-full max-w-4xl mx-auto gap-1 md:gap-0 bg-muted/50 md:bg-muted border-2 border-foreground/5 p-1 rounded-lg">
                <TabsTrigger value="map" className="px-4 py-2.5 font-serif font-bold data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none shrink-0 md:shrink">
                  🗺️ Route Map
                </TabsTrigger>
                <TabsTrigger value="calculator" className="px-4 py-2.5 font-serif font-bold data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none shrink-0 md:shrink">
                  Profit Calculator
                </TabsTrigger>
                <TabsTrigger value="scorecard" className="px-4 py-2.5 font-serif font-bold data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none shrink-0 md:shrink">
                  Location Scorecard
                </TabsTrigger>
                <TabsTrigger value="pitch" className="px-4 py-2.5 font-serif font-bold data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none shrink-0 md:shrink">
                  Pitch Script Helper
                </TabsTrigger>
                <TabsTrigger value="inspection" className="px-4 py-2.5 font-serif font-bold data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all text-xs sm:text-sm shadow-sm md:shadow-none shrink-0 md:shrink">
                  Inspection Checklist
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="focus-visible:outline-none">
              <TabsContent value="map" className="focus-visible:outline-none">
                <LocationMap onScoreLocation={(id) => { setSelectedLocationId(id); setActiveTab("scorecard"); }} />
              </TabsContent>
              <TabsContent value="calculator" className="focus-visible:outline-none">
                <VendingCalculator />
              </TabsContent>
              <TabsContent value="scorecard" className="focus-visible:outline-none">
                <LocationScorecard selectedLocationId={selectedLocationId} onLocationChange={setSelectedLocationId} onBackToMap={() => setActiveTab("map")} />
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

      {/* ── THIS IS WHERE IT BECOMES REAL ── */}
      <section className="bg-primary py-16">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/50">SNAXOLOGY</p>
            <h2 className="text-5xl md:text-6xl font-serif font-black text-primary-foreground leading-tight">
              THIS IS
              <br />
              WHERE IT
              <br />
              <span className="text-[#C8A000]">BECOMES</span>
              <br />
              <span className="text-[#C8A000]">REAL</span>
            </h2>
            <div>
              <p className="font-serif font-black text-primary-foreground text-lg">Ready to Move Forward?</p>
              <p className="text-sm text-primary-foreground/60 font-sans italic mt-1">
                If you're serious about building your vending operation, here are your next steps:
              </p>
            </div>
            {/* Machine photo in CTA */}
            <img
src="/vending-images/machine-phase3.png"
                  alt="Snaxology vending machine"
              className="h-48 object-contain drop-shadow-xl rounded-xl"
            />
          </div>
          <div className="space-y-4">
            {[
              { label: "Access professional vending marketing templates", detail: "to increase your approval rate with location managers" },
              { label: "Book a 1-on-1 strategy call", detail: "for personalized guidance tailored to your local market and budget" },
              { label: "Get help with outreach", detail: "to secure decision-maker meetings faster and more consistently than going it alone" },
              { label: "Explore vending-specific website setup services", detail: "to attract inbound location leads on autopilot" },
              { label: "Partner with Snaxology", detail: "for a fully managed, AI-powered smart vending solution at zero cost to your locations" },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 border border-primary-foreground/15 rounded-lg p-4 bg-primary-foreground/5">
                <ArrowRight className="w-4 h-4 text-[#C8A000] shrink-0 mt-0.5" />
                <p className="text-sm font-sans text-primary-foreground/90 leading-relaxed">
                  <span className="font-bold text-[#C8A000]">{step.label}</span>{" "}{step.detail}
                </p>
              </div>
            ))}
            <Button
              onClick={() => setIsLeadModalOpen(true)}
              className="w-full bg-[#C8A000] text-[#1a0a00] hover:bg-[#b89000] font-serif font-black text-base py-3 rounded-lg mt-2"
            >
              Download Your 45-Day Blueprint Now
            </Button>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        calculatorData={calculatorData}
        locations={locations}
      />

      {/* ── FOOTER ── */}
      <footer className="bg-foreground text-background border-t-2 border-primary/20 py-16">
        <div className="container grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/vending-images/machine-hero.png"
                alt="Snaxology Vending Machine"
                className="w-12 h-12 object-cover object-top bg-background rounded-md p-0.5 border border-primary/10"
              />
              <span className="font-serif font-black text-primary tracking-widest text-2xl">SNAXOLOGY</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed font-sans">
              Elevating everyday convenience through smart vending, premium micro-markets, and responsive local service.
              We design and manage tailored refreshment experiences for modern property managers and busy shared spaces.
            </p>
            <p className="text-xs text-background/50 font-sans">
              &copy; {new Date().getFullYear()} Snaxology Vending LLC. All rights reserved.
            </p>
          </div>
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-serif font-bold text-lg text-primary tracking-tight">Contact Snaxology</h4>
            <div className="space-y-3 text-sm text-background/80 font-sans">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <a href="https://snaxology.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                  <span>snaxology.ai</span><ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <a href="https://www.snaxologyvending.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                  <span>www.snaxologyvending.com</span><ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:ccolin@snaxologyvending.com" className="hover:text-primary hover:underline">ccolin@snaxologyvending.com</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:3055270879" className="hover:text-primary hover:underline">305-527-0879</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                <a href="https://www.instagram.com/_snaxology/" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1">
                  <span>@_snaxology</span><ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Miami, Florida</span>
              </div>
            </div>
          </div>
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
                <span>Apply for EIN (IRS Portal)</span><ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
