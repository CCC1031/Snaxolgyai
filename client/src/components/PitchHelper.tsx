import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, ShieldCheck, MessageSquare, Copy, Check, Mail, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VendingLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  status: "prospect" | "contacted" | "secured" | "rejected";
  detailedScores?: Record<string, number>;
}

export default function PitchHelper() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [locations, setLocations] = useState<VendingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [emailSubject, setGeneratedSubject] = useState<string>("");
  const [isCopiedEmail, setIsCopiedEmail] = useState<boolean>(false);

  // Load locations from localStorage to populate the select dropdown
  useEffect(() => {
    const saved = localStorage.getItem("snaxology_vending_locations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as VendingLocation[];
        setLocations(parsed);
        // Default select to the first scored location if available
        const scored = parsed.find(l => l.detailedScores && Object.keys(l.detailedScores).length > 0);
        if (scored) {
          setSelectedLocationId(scored.id);
        }
      } catch (e) {
        console.error("Failed to parse locations", e);
      }
    }
  }, []);

  // Generate customized email whenever selectedLocationId changes
  useEffect(() => {
    if (!selectedLocationId) {
      setGeneratedEmail("");
      setGeneratedSubject("");
      return;
    }

    const loc = locations.find(l => l.id === selectedLocationId);
    if (!loc) return;

    // Default factors map
    const factorNames: Record<string, string> = {
      traffic: "high daily foot traffic",
      dwell: "significant dwell time (people remain on site for long periods)",
      competition: "limited nearby food and drink options",
      access: "easy ground-floor accessibility for restocking",
      visibility: "high-visibility common areas/breakrooms suitable for machines",
      power: "reliable, dedicated electrical outlets",
      decision: "receptive and collaborative management",
      commission: "affordable pricing structure with zero commission required",
      audience: "a hard-working team who would highly value premium snacks",
      expansion: "ample room for future vending expansions"
    };

    // Find top strengths (scores of 4 or 5)
    const strengths: string[] = [];
    if (loc.detailedScores) {
      Object.entries(loc.detailedScores).forEach(([key, score]) => {
        if (score >= 4 && factorNames[key]) {
          strengths.push(factorNames[key]);
        }
      });
    }

    // Fallback if no detailed scores exist or no factors scored high
    if (strengths.length === 0) {
      strengths.push("a dedicated space for convenient snacks");
      strengths.push("a hard-working team deserving of cold refreshments");
    }

    // Limit to top 3 strengths for concise copywriting
    const topStrengths = strengths.slice(0, 3);
    
    // Format strengths list
    let strengthsText = "";
    if (topStrengths.length === 1) {
      strengthsText = `specifically because of your ${topStrengths[0]}`;
    } else if (topStrengths.length === 2) {
      strengthsText = `specifically because of your ${topStrengths[0]} and ${topStrengths[1]}`;
    } else {
      strengthsText = `due to several key factors, including your ${topStrengths[0]}, ${topStrengths[1]}, and ${topStrengths[2]}`;
    }

    const subject = `Free Vending Services for ${loc.name}`;
    const emailBody = `Subject: ${subject}

Hi [Manager Name],

I hope this email finds you well.

My name is [Your Name], and I'm the founder of Snaxology Vending, a local, family-owned vending provider right here in Miami. 

I've been mapping out potential locations for our premium refreshment service, and ${loc.name} stood out to us as a perfect candidate—${strengthsText}.

We would love to place one of our modern, energy-efficient beverage and snack machines in your break room or common area completely free of charge to your company. 

Here is how our service works:
1. 100% Free Placement: Zero cost for delivery, installation, or ongoing service.
2. Premium Selection: Brand-name snacks and ice-cold drinks customized to your team's exact tastes.
3. Smart Monitoring: We monitor stock levels remotely to ensure your machine is never empty.
4. 24-Hour Support: Modern cashless payment options with a guaranteed 24-hour maintenance response.

Since there is zero financial cost or labor required on your end, we'd love to drop by for just 5 minutes this week to show you a quick photo of our equipment and confirm a suitable spot. 

Would [Day, e.g., Thursday] morning or afternoon work best for a quick chat?

Thank you for your time, and I look forward to keeping your team fully energized!

Best regards,

[Your Name]
Founder, Snaxology Vending
[Your Phone Number]
[Your Email Address]
snaxology.ai`;

    setGeneratedSubject(subject);
    setGeneratedEmail(emailBody);
  }, [selectedLocationId, locations]);

  const scripts = [
    {
      title: "The Warm Intro (In-Person)",
      scenario: "Walking into a local auto shop, warehouse, or office to find the manager.",
      text: "Hi, my name is a Snaxology representative, and I'm with Snaxology Vending. We're a local, family-owned business right here in Miami. I was driving by and noticed your team works hard here, and I wanted to see if you have any vending or refreshment services on site? We actually provide, install, and stock modern, clean snack and drink machines completely free of charge to you. Our goal is to make sure your employees and customers have cold drinks and fresh snacks without you ever having to lift a finger or pay a cent. Is that something you'd be open to?"
    },
    {
      title: "The Cold Call Script",
      scenario: "Calling local businesses to identify the decision maker and schedule a visit.",
      text: "Hi there, I was hoping to speak with the office manager or facility director? ... Hi, my name is a Snaxology representative from Snaxology Vending. We're a local Miami vending operator. We're currently expanding our route in your area and are offering to place a brand-new, energy-efficient beverage and snack machine in your break room at zero cost to your company. We handle 100% of the installation, maintenance, and stocking. I'd love to drop by for just 5 minutes this Thursday to show you a quick photo of our modern machines and see if we'd be a good fit. Would morning or afternoon work better for you?"
    }
  ];

  const objections = [
    {
      q: "How much does this cost us?",
      a: "Absolutely nothing. Snaxology provides the machine, handles the delivery, keeps it fully stocked, and takes care of all maintenance at zero cost to you. We make our money solely from the items purchased by customers, so there's never a bill or invoice sent to your business."
    },
    {
      q: "We want a percentage of the sales (Commission).",
      a: "We completely understand! Many large operations ask for that. However, as a local operator, we focus 100% of our budget on providing premium, reliable service, stocking name-brand items, and responding to repairs within 24 hours. If we pay a high commission, we have to raise the prices of the snacks for your employees. What we suggest is starting with a 90-day trial period at zero commission so we can see the actual volume. If the machine does extremely well, we are more than happy to discuss a reasonable commission structure that works for both of us!"
    },
    {
      q: "What if the machine breaks down or eats someone's money?",
      a: "That's our top priority. Every Snaxology machine has a clear sticker with our direct contact number and email. If a machine ever has an issue or refunds are needed, we respond within 24 hours, and we refund any lost money immediately, no questions asked. We also use modern guaranteed-delivery sensors—if a snack doesn't drop, the customer's card or cash is never charged."
    },
    {
      q: "We already have a vending service, but they are terrible.",
      a: "I hear that all the time! Many vendors stock machines once a month or leave broken equipment sitting for weeks. At Snaxology, we pride ourselves on being a local boutique operator. We monitor our machines remotely so we know when they are running low before we even leave our warehouse. If you're unhappy with your current provider, we can easily coordinate a smooth transition with zero downtime for your staff."
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyEmailToClipboard = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail);
    setIsCopiedEmail(true);
    toast.success("Outreach email copied to clipboard!");
    setTimeout(() => setIsCopiedEmail(false), 2000);
  };

  // Filter to get only locations that have scorecards
  const scoredLocations = locations.filter(
    l => l.detailedScores && Object.keys(l.detailedScores).length > 0
  );

  return (
    <Card className="tactile-card">
      <CardHeader className="bg-primary/5 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle className="font-serif text-xl">Interactive Pitch & Objection Helper</CardTitle>
        </div>
        <CardDescription className="text-foreground/70">
          Use Snaxology's battle-tested pitch scripts, objection-handling plays, and automated email generators to secure prime placements.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-xl mx-auto mb-6 bg-muted border-2 border-foreground/5 p-1 rounded-lg">
            <TabsTrigger value="email" className="font-serif font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all">
              Email Generator
            </TabsTrigger>
            <TabsTrigger value="scripts" className="font-serif font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all">
              Outreach Scripts
            </TabsTrigger>
            <TabsTrigger value="objections" className="font-serif font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-primary rounded-md transition-all">
              Objection Crusher
            </TabsTrigger>
          </TabsList>

          {/* Email Generator Tab */}
          <TabsContent value="email" className="space-y-6 focus-visible:outline-none">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Controls Panel */}
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                    Select Scored Location
                  </label>
                  <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger className="w-full bg-card border-2 border-foreground/10 font-sans text-sm h-10">
                      <SelectValue placeholder="Choose a scored location..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-2 border-foreground/10">
                      {scoredLocations.length > 0 ? (
                        scoredLocations.map(loc => (
                          <SelectItem key={loc.id} value={loc.id} className="font-sans text-sm hover:bg-muted">
                            {loc.name} (⭐ {loc.score}/5)
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled className="font-sans text-sm text-foreground/40">
                          No scored locations found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border-2 border-primary/10 rounded-lg bg-primary/5 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <h5 className="font-serif font-bold text-sm">How it works</h5>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed font-sans">
                    This toolkit scans your completed <strong>Location Scorecard</strong>, extracts the factors you rated 4 or 5 stars, and writes a hyper-targeted outreach email highlighting those specific strengths.
                  </p>
                </div>

                {scoredLocations.length === 0 && (
                  <div className="p-4 border-2 border-amber-200 rounded-lg bg-amber-50 text-amber-800 flex gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-sans leading-relaxed">
                      <strong>No locations scored yet!</strong> Go to the <strong>Route Map</strong> or <strong>Location Scorecard</strong> tab first to plot a prospect and fill out its scorecard.
                    </p>
                  </div>
                )}
              </div>

              {/* Email Draft Panel */}
              <div className="md:col-span-2 space-y-4">
                <div className="border-2 border-foreground/10 rounded-lg bg-card overflow-hidden shadow-sm flex flex-col h-[420px]">
                  <div className="bg-muted px-4 py-3 border-b border-foreground/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="font-serif font-bold text-sm text-foreground">
                        {emailSubject ? emailSubject : "Email Draft"}
                      </span>
                    </div>
                    {generatedEmail && (
                      <Button
                        onClick={copyEmailToClipboard}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/5 gap-1.5 h-8 font-serif font-bold text-xs"
                      >
                        {isCopiedEmail ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-secondary" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Email</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="p-4 overflow-y-auto flex-1 font-mono text-xs sm:text-sm text-foreground/80 leading-relaxed bg-stone-50 whitespace-pre-wrap">
                    {generatedEmail ? (
                      generatedEmail
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-foreground/40 space-y-2 px-6">
                        <Mail className="w-8 h-8 stroke-[1.5]" />
                        <p className="font-serif text-sm font-medium">No Email Generated Yet</p>
                        <p className="font-sans text-xs max-w-xs">
                          Please select a location with an evaluated scorecard on the left to automatically draft your customized outreach email.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scripts.map((script, idx) => (
                <div key={idx} className="border-2 border-foreground/10 rounded-lg p-5 bg-card flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-lg text-primary">{script.title}</h4>
                      <Volume2 className="w-4 h-4 text-foreground/40" />
                    </div>
                    <p className="text-xs text-foreground/50 italic font-medium">{script.scenario}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed font-sans pt-2 border-t border-dashed border-foreground/5">
                      "{script.text}"
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(script.text, idx)}
                    variant="outline"
                    className="tactile-btn-secondary w-full flex items-center justify-center gap-2 mt-4"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-4 h-4 text-secondary" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Objection Crusher Tab */}
          <TabsContent value="objections" className="space-y-4 focus-visible:outline-none">
            <div className="space-y-4 max-w-4xl mx-auto">
              {objections.map((obj, idx) => (
                <div key={idx} className="border-2 border-foreground/10 rounded-lg overflow-hidden">
                  <div className="bg-primary/5 px-4 py-3 border-b border-foreground/10 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-serif font-bold text-foreground text-sm sm:text-base">
                      Objection: "{obj.q}"
                    </span>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                      <span className="font-serif font-bold text-primary mr-1">Your Response:</span>
                      {obj.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
